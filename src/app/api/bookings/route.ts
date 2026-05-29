import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const body    = await req.json()

  const { serviceId, appointmentDate, clientName, clientEmail, clientPhone, zipCode, notes } = body

  if (!clientName || !clientEmail || !appointmentDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const booking = await prisma.booking.create({
    data: {
      userId: (session?.user as any)?.id ?? null,
      serviceId: serviceId || null,
      appointmentDate: new Date(appointmentDate),
      clientName, clientEmail, clientPhone, zipCode, notes,
      status: 'pending',
    },
  })

  return NextResponse.json({ booking })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const role   = (session.user as any).role

  const bookings = role === 'admin' || role === 'staff'
    ? await prisma.booking.findMany({ include: { service: true, user: true }, orderBy: { appointmentDate: 'desc' } })
    : await prisma.booking.findMany({ where: { userId }, include: { service: true }, orderBy: { appointmentDate: 'desc' } })

  return NextResponse.json({ bookings })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role
  if (!session || (role !== 'admin' && role !== 'staff')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id, status } = await req.json()
  const booking = await prisma.booking.update({ where: { id }, data: { status } })
  return NextResponse.json({ booking })
}
