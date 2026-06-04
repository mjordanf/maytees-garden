import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const body     = await req.json()
  const email    = sanitizeText(body.email ?? '')

  const { success } = rateLimit(`register:${email}`, 3, 60 * 60 * 1000)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const name     = sanitizeText(body.name  ?? '')
  const phone    = sanitizeText(body.phone ?? '')
  const zip      = sanitizeText(body.zip   ?? '')
  const password = body.password ?? ''
  const newsletter = body.newsletter

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

  sendWelcomeEmail({ name: name ?? email, email }).catch(() => {})

  return NextResponse.json({ success: true })
}
