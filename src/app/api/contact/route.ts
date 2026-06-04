import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactAlert } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success } = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many messages. Try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const body    = await req.json()
  const name    = sanitizeText(body.name    ?? '')
  const email   = sanitizeText(body.email   ?? '')
  const phone   = sanitizeText(body.phone   ?? '')
  const zipCode = sanitizeText(body.zipCode ?? '')
  const service = sanitizeText(body.service ?? '')
  const message = sanitizeText(body.message ?? '')

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const submission = await prisma.contactSubmission.create({
    data: { name, email, phone, zipCode, service, message },
  })

  await prisma.inboxMessage.create({
    data: {
      subject: `New inquiry${service ? `: ${service}` : ''} — ${name}`,
      body: [
        `From: ${name} (${email})`,
        phone ? `Phone: ${phone}` : null,
        zipCode ? `ZIP: ${zipCode}` : null,
        ``,
        message,
      ].filter(l => l !== null).join('\n'),
      type: 'contact-form',
    },
  })

  sendContactAlert({ name, email, phone, service, message }).catch(() => {})

  return NextResponse.json({ success: true, id: submission.id })
}

export async function GET() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ submissions })
}
