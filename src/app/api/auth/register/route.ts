import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { name, email, password, phone, zip, newsletter } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, zipCode: zip, newsletterOptIn: newsletter ?? false },
  })

  if (newsletter && email) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email, name },
    }).catch(() => {})
  }

  await prisma.auditLog.create({ data: { action: 'user.register', entity: 'User', entityId: user.id } })
  return NextResponse.json({ success: true })
}
