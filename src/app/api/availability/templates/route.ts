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

  const templates = await prisma.availabilityTemplate.findMany({ orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { templates } = await req.json()

  await prisma.availabilityTemplate.deleteMany()
  if (templates && templates.length > 0) {
    await prisma.availabilityTemplate.createMany({
      data: templates.map((t: {
        dayOfWeek: number; startTime: string; endTime: string;
        slotMinutes: number; isActive: boolean; type: string
      }) => ({
        dayOfWeek:   t.dayOfWeek,
        startTime:   t.startTime,
        endTime:     t.endTime,
        slotMinutes: t.slotMinutes,
        isActive:    t.isActive,
        type:        t.type,
      })),
    })
  }

  const saved = await prisma.availabilityTemplate.findMany({ orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json({ templates: saved })
}
