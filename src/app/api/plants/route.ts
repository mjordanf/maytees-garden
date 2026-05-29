import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plants = await prisma.plant.findMany({ orderBy: { featured: 'desc' } })
  return NextResponse.json({ plants })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'admin' && role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const data = await req.json()

  // Check for duplicate nameEn
  const existing = await prisma.plant.findFirst({ where: { nameEn: data.nameEn } })
  if (existing) {
    return NextResponse.json({ error: 'A plant with this name already exists' }, { status: 409 })
  }

  const { stockQty, ...rest } = data
  const plant = await prisma.plant.create({
    data: { ...rest, stockQty: stockQty ?? 10 },
  })

  await prisma.auditLog.create({
    data: { userId: (session.user as any).id, action: 'plant.create', entity: 'Plant', entityId: plant.id },
  })

  return NextResponse.json({ plant })
}
