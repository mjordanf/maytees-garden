import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const data = await req.json()

  // Check for duplicate nameEn (excluding this plant's own record)
  if (data.nameEn) {
    const conflict = await prisma.plant.findFirst({
      where: { nameEn: data.nameEn, NOT: { id: params.id } },
    })
    if (conflict) {
      return NextResponse.json({ error: 'A plant with this name already exists' }, { status: 409 })
    }
  }

  const { stockQty, ...rest } = data
  const plant = await prisma.plant.update({
    where: { id: params.id },
    data: stockQty !== undefined ? { ...rest, stockQty } : rest,
  })

  await prisma.auditLog.create({
    data: { userId: (session.user as any).id, action: 'plant.update', entity: 'Plant', entityId: plant.id },
  })

  return NextResponse.json({ plant })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.plant.delete({ where: { id: params.id } })

  await prisma.auditLog.create({
    data: { userId: (session.user as any).id, action: 'plant.delete', entity: 'Plant', entityId: params.id },
  })

  return NextResponse.json({ success: true })
}
