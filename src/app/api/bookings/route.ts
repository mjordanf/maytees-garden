import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendBookingConfirmation, sendBookingAlert,
  sendBookingConfirmedInPerson, sendBookingConfirmedVideo, sendBookingUpdated,
  sendBookingCancelledNotice,
} from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const body    = await req.json()

  const { serviceId, appointmentDate, clientName, clientEmail, clientPhone, zipCode, notes, meetingPreference } = body

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
    }
    // Already confirmed, details changed
    else if (prev.status === 'confirmed' && status === undefined && (consultationType !== undefined || videoCallLink !== undefined)) {
      sendBookingUpdated({ ...opts, consultationType: type, videoCallLink: booking.videoCallLink }).catch(() => {})
    }
    // Customer cancelled
    else if (status === 'cancelled' && prev.status !== 'cancelled') {
      sendBookingCancelledNotice({
        clientName:      booking.clientName,
        clientEmail:     booking.clientEmail,
        serviceName:     booking.service?.nameEn ?? 'Garden Consultation',
        appointmentDate: booking.appointmentDate,
      }).catch(() => {})
    }
  }

  return NextResponse.json({ booking })
}
