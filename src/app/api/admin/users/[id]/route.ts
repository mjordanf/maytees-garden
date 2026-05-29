import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function isSuperAdmin(role: string) { return role === 'superadmin' }

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !isSuperAdmin(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json()
  const updateData: Record<string, unknown> = {}

  if (body.role !== undefined) {
    const allowed = ['customer', 'staff', 'admin', 'superadmin']
    if (!allowed.includes(body.role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    updateData.role = body.role
  }
  if (body.name  !== undefined) updateData.name  = body.name
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.password) {
    if (body.password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    updateData.passwordHash = await bcrypt.hash(body.password, 12)
  }

  const user = await prisma.user.update({ where: { id: params.id }, data: updateData,
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true } })
  return NextResponse.json({ user })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !isSuperAdmin(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Prevent deleting yourself
  const sessionUserId = (session?.user as any)?.id
  if (params.id === sessionUserId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
