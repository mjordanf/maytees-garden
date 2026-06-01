export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['admin', 'staff', 'superadmin']

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !ADMIN_ROLES.includes(role)) return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const overrides = await prisma.availabilityOverride.findMany({ orderBy: { date: 'asc' } })
  return NextResponse.json({ overrides })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, isBlocked, startTime, endTime, reason } = await req.json()
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 })

  const override = await prisma.availabilityOverride.create({
    data: {
      date:      new Date(date),
      isBlocked: isBlocked ?? true,
      startTime: startTime ?? null,
      endTime:   endTime   ?? null,
      reason:    reason    ?? null,
    },
  })

  return NextResponse.json({ override })
}
