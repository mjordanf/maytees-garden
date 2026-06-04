import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendBookingConfirmation, sendBookingAlert,
  sendBookingConfirmedInPerson, sendBookingConfirmedVideo, sendBookingUpdated,
  sendBookingCancelledNotice,
} from '@/lib/email'
import {
  createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
} from '@/lib/microsoft-graph'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const body    = await req.json()

  const clientEmail = sanitizeText(body.clientEmail ?? '')
  const { success } = rateLimit(`bookings:${clientEmail}`, 10, 60 * 60 * 1000)
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const serviceId        = body.serviceId
  const appointmentDate  = body.appointmentDate
  const clientName       = sanitizeText(body.clientName  ?? '')
  const clientPhone      = sanitizeText(body.clientPhone ?? '')
  const zipCode          = sanitizeText(body.zipCode     ?? '')
  const notes            = sanitizeText(body.notes       ?? '')
  const meetingPreference = body.meetingPreference
  const slotDate         = body.slotDate
  const slotStart        = body.slotStart
  const slotEnd          = body.slotEnd

  if (!clientName || !clientEmail || !appointmentDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = serviceId
    ? await prisma.service.findUnique({ where: { id: serviceId }, select: { nameEn: true } })
    : null

  const booking = await prisma.booking.create({
    data: {
      userId: (session?.user as any)?.id ?? null,
      serviceId: serviceId || null,
      appointmentDate: new Date(appointmentDate),
      clientName, clientEmail, clientPhone, zipCode, notes,
      customerPreference: meetingPreference || 'in-person',
      status: 'pending',
      slotDate:  slotDate  ? new Date(slotDate) : null,
      slotStart: slotStart ?? null,
      slotEnd:   slotEnd   ?? null,
    },
  })

  const date = new Date(appointmentDate)
  const serviceName = service?.nameEn ?? 'Garden Consultation'

  const customerPreference = meetingPreference || 'in-person'

  // Create InboxMessage so new bookings appear in /admin/inbox
  await prisma.inboxMessage.create({
    data: {
      subject:   `New booking: ${serviceName} — ${clientName}`,
      body:      [
        `Client: ${clientName}`,
        `Email: ${clientEmail}`,
        clientPhone ? `Phone: ${clientPhone}` : null,
        `Date: ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`,
        `Preference: ${customerPreference}`,
        zipCode ? `ZIP: ${zipCode}` : null,
        notes ? `\nNotes: ${notes}` : null,
      ].filter(Boolean).join('\n'),
      type:      'booking-alert',
      bookingId: booking.id,
    },
  })

  // Fire-and-forget — don't block the response on email
  sendBookingConfirmation({ clientName, clientEmail, serviceName, appointmentDate: date, notes, customerPreference }).catch(() => {})
  sendBookingAlert({ clientName, clientEmail, clientPhone, serviceName, appointmentDate: date, zipCode, notes, customerPreference }).catch(() => {})

  return NextResponse.json({ booking })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const role   = (session.user as any).role

  const isStaff = ['staff', 'admin', 'superadmin'].includes(role)
  const bookings = isStaff
    ? await prisma.booking.findMany({ include: { service: true, user: true }, orderBy: { appointmentDate: 'desc' } })
    : await prisma.booking.findMany({ where: { userId }, include: { service: true }, orderBy: { appointmentDate: 'desc' } })

  return NextResponse.json({ bookings })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any)?.id
  const role   = (session.user as any)?.role
  const isStaffOrAbove = ['staff', 'admin', 'superadmin'].includes(role)

  const { id, status, consultationType, videoCallLink, consultationNotes } = await req.json()

  const prev = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, user: true },
  })

  if (!prev) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Customers can only cancel their own bookings; staff can do anything
  const isOwner = prev.userId === userId
  const isCustomerCancelling = isOwner && status === 'cancelled' && !isStaffOrAbove

  if (!isStaffOrAbove && !isCustomerCancelling) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Customers can only cancel if booking is pending or confirmed
  if (isCustomerCancelling && !['pending', 'confirmed'].includes(prev.status)) {
    return NextResponse.json({ error: 'Cannot cancel a booking with status: ' + prev.status }, { status: 400 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(!isCustomerCancelling && consultationType !== undefined && { consultationType }),
      ...(!isCustomerCancelling && videoCallLink !== undefined && { videoCallLink }),
      ...(!isCustomerCancelling && consultationNotes !== undefined && { consultationNotes }),
    },
    include: { service: true, user: true },
  })

  // Fire emails based on status changes
  if (prev && booking.clientEmail) {
    const opts = {
      clientName:      booking.clientName,
      clientEmail:     booking.clientEmail,
      serviceName:     booking.service?.nameEn ?? 'Garden Consultation',
      appointmentDate: booking.appointmentDate,
      notes:           booking.consultationNotes,
    }
    const VIDEO_TYPES = ['facetime', 'whatsapp', 'google-meet']
    const type = booking.consultationType ?? 'in-person'
    const isVideo = VIDEO_TYPES.includes(type)

    // Just confirmed
    if (status === 'confirmed' && prev.status !== 'confirmed') {
      if (isVideo) {
        sendBookingConfirmedVideo({ ...opts, videoType: type, videoCallLink: booking.videoCallLink }).catch(() => {})
      } else {
        sendBookingConfirmedInPerson(opts).catch(() => {})
      }
      // Calendar sync — create event
      try {
        const calBookingData = {
          clientName:      booking.clientName,
          clientEmail:     booking.clientEmail,
          clientPhone:     booking.clientPhone,
          serviceName:     booking.service?.nameEn ?? 'Garden Consultation',
          consultationType: booking.consultationType,
          videoCallLink:   booking.videoCallLink,
          appointmentDate: booking.appointmentDate,
          slotEnd:         booking.slotEnd,
          notes:           booking.notes,
          consultationNotes: booking.consultationNotes,
          zipCode:         booking.zipCode,
        }
        const eventId = await createCalendarEvent(calBookingData)
        if (eventId) {
          await prisma.booking.update({ where: { id }, data: { calendarEventId: eventId, calendarSynced: true } })
        }
      } catch (calErr) {
        console.error('[bookings] calendar sync failed on confirm:', calErr)
      }
    }
    // Already confirmed, details changed
    else if (prev.status === 'confirmed' && status === undefined && (consultationType !== undefined || videoCallLink !== undefined)) {
      sendBookingUpdated({ ...opts, consultationType: type, videoCallLink: booking.videoCallLink }).catch(() => {})
      // Calendar sync — update event
      if (prev.calendarEventId) {
        try {
          const calBookingData = {
            clientName:      booking.clientName,
            clientEmail:     booking.clientEmail,
            clientPhone:     booking.clientPhone,
            serviceName:     booking.service?.nameEn ?? 'Garden Consultation',
            consultationType: booking.consultationType,
            videoCallLink:   booking.videoCallLink,
            appointmentDate: booking.appointmentDate,
            slotEnd:         booking.slotEnd,
            notes:           booking.notes,
            consultationNotes: booking.consultationNotes,
            zipCode:         booking.zipCode,
          }
          await updateCalendarEvent(prev.calendarEventId, calBookingData)
        } catch (calErr) {
          console.error('[bookings] calendar sync failed on update:', calErr)
        }
      }
    }
    // Customer cancelled
    else if (status === 'cancelled' && prev.status !== 'cancelled') {
      sendBookingCancelledNotice({
        clientName:      booking.clientName,
        clientEmail:     booking.clientEmail,
        serviceName:     booking.service?.nameEn ?? 'Garden Consultation',
        appointmentDate: booking.appointmentDate,
      }).catch(() => {})
      // Calendar sync — delete event
      if (prev.calendarEventId) {
        try {
          await deleteCalendarEvent(prev.calendarEventId)
        } catch (calErr) {
          console.error('[bookings] calendar sync failed on cancel:', calErr)
        }
      }
    }
  }

  return NextResponse.json({ booking })
}
