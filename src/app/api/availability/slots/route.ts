export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const month = searchParams.get('month') // "2026-06"
  if (!month) return NextResponse.json({ dates: {} })

  const [year, mon] = month.split('-').map(Number)
  const firstDay = new Date(year, mon - 1, 1)
  const lastDay  = new Date(year, mon, 0)
  const now      = new Date()

  const [templates, overrides, bookings] = await Promise.all([
    prisma.availabilityTemplate.findMany({ where: { isActive: true } }),
    prisma.availabilityOverride.findMany({
      where: { date: { gte: firstDay, lte: new Date(lastDay.getTime() + 86400000) } },
    }),
    prisma.booking.findMany({
      where: {
        status:   { not: 'cancelled' },
        slotDate: { gte: firstDay, lte: new Date(lastDay.getTime() + 86400000) },
      },
      select: { slotDate: true, slotStart: true, slotEnd: true },
    }),
  ])

  const dates: Record<string, { start: string; end: string; type: string }[]> = {}

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().slice(0, 10) // "YYYY-MM-DD"
    const dow     = d.getDay()
    const tmpl    = templates.find(t => t.dayOfWeek === dow)
    if (!tmpl) continue

    // Check full-day override
    const override = overrides.find(o => o.date.toISOString().slice(0, 10) === dateKey)
    if (override?.isBlocked) continue

    const startMins = timeToMinutes(override?.startTime ?? tmpl.startTime)
    const endMins   = timeToMinutes(override?.endTime   ?? tmpl.endTime)

    // Booked slots for this date
    const dayBookings = bookings.filter(b => b.slotDate?.toISOString().slice(0, 10) === dateKey)

    const slots: { start: string; end: string; type: string }[] = []
    for (let t = startMins; t + tmpl.slotMinutes <= endMins; t += tmpl.slotMinutes) {
      const slotStart = minutesToTime(t)
      const slotEnd   = minutesToTime(t + tmpl.slotMinutes)

      // Skip past slots
      const slotDateTime = new Date(`${dateKey}T${slotStart}:00`)
      if (slotDateTime <= now) continue

      // Skip already booked
      const booked = dayBookings.some(b => b.slotStart === slotStart)
      if (booked) continue

      slots.push({ start: slotStart, end: slotEnd, type: tmpl.type })
    }

    if (slots.length > 0) dates[dateKey] = slots
  }

  return NextResponse.json({ dates })
}
