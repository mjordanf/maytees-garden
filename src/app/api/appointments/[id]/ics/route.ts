export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toIcsDate(date: Date): string {
  const y  = date.getUTCFullYear()
  const mo = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const d  = date.getUTCDate().toString().padStart(2, '0')
  const h  = date.getUTCHours().toString().padStart(2, '0')
  const mi = date.getUTCMinutes().toString().padStart(2, '0')
  const s  = date.getUTCSeconds().toString().padStart(2, '0')
  return `${y}${mo}${d}T${h}${mi}${s}Z`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId  = (session.user as any)?.id
  const { id }  = params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true },
  })

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only the booking owner (or staff) can download
  const role = (session.user as any)?.role
  const isStaff = ['staff', 'admin', 'superadmin'].includes(role)
  if (!isStaff && booking.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const startDate = new Date(booking.appointmentDate)
  const endDate   = new Date(startDate.getTime() + 60 * 60 * 1000) // +60 min

  const now = new Date()
  const dtstamp = toIcsDate(now)
  const dtstart = toIcsDate(startDate)
  const dtend   = toIcsDate(endDate)

  const serviceName = booking.service?.nameEn ?? 'Garden Consultation'
  const isVideo = booking.consultationType && booking.consultationType !== 'in-person'
  const location = isVideo
    ? (booking.videoCallLink ?? booking.consultationType ?? 'Video Call')
    : '15196 SW 184th St, Miami, FL 33187'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//Maytees Garden//EN",
    'BEGIN:VEVENT',
    `UID:${booking.id}@mayteesgardencenter.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "SUMMARY:Garden Consultation — Maytee's Garden Center",
    `DESCRIPTION:Your consultation with Maytee. ${serviceName}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="consultation.ics"',
    },
  })
}
