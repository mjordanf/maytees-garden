import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterConfirmation } from '@/lib/email'
import { randomBytes } from 'crypto'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const normalised = email.toLowerCase().trim()

  const { success } = rateLimit(`newsletter:${normalised}`, 3, 60 * 60 * 1000)
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalised } })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mayteesgardencenter.com'

  if (existing) {
    if (existing.confirmed && existing.active) {
      return NextResponse.json({ alreadySubscribed: true })
    }

    const confirmToken = randomBytes(32).toString('hex')
    const unsubToken = existing.unsubscribeToken ?? randomBytes(16).toString('hex')

    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data:  { confirmToken, unsubscribeToken: unsubToken, active: true },
    })

    const confirmUrl     = `${baseUrl}/newsletter/confirm?token=${confirmToken}`
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubToken}`

    sendNewsletterConfirmation({
      email: normalised,
      name:  existing.name,
      confirmUrl,
      unsubscribeUrl,
    }).catch(() => {})

    return NextResponse.json({ pending: true })
  }

  const confirmToken    = randomBytes(32).toString('hex')
  const unsubscribeToken = randomBytes(16).toString('hex')

  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email:     normalised,
      name:      name ?? null,
      confirmed: false,
      confirmToken,
      unsubscribeToken,
      active:    true,
    },
  })

  const confirmUrl     = `${baseUrl}/newsletter/confirm?token=${confirmToken}`
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`

  sendNewsletterConfirmation({
    email: normalised,
    name:  subscriber.name,
    confirmUrl,
    unsubscribeUrl,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
