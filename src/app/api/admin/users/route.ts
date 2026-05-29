import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { name, email, password, role: newRole, phone } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email and password (min 8 chars) are required' }, { status: 400 })
  }
  const allowed = ['customer', 'staff', 'admin', 'superadmin']
  if (!allowed.includes(newRole)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: newRole, phone },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  })

  return NextResponse.json({ user })
}
