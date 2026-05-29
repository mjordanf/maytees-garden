import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId  = (session.user as any).id
  const favorites = await prisma.favorite.findMany({ where: { userId }, include: { plant: true } })
  return NextResponse.json({ favorites })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId  = (session.user as any).id
  const { plantId } = await req.json()
  const fav = await prisma.favorite.upsert({
    where: { userId_plantId: { userId, plantId } },
    update: {},
    create: { userId, plantId },
  })
  return NextResponse.json({ favorite: fav })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId  = (session.user as any).id
  const { plantId } = await req.json()
  await prisma.favorite.delete({ where: { userId_plantId: { userId, plantId } } }).catch(() => {})
  return NextResponse.json({ success: true })
}
