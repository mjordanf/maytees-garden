import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewsletter } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['staff', 'admin', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { subject, bodyHtml } = await req.json()

  if (!subject || !bodyHtml) {
    return NextResponse.json({ error: 'Missing subject or body' }, { status: 400 })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { confirmed: true, active: true },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mayteesgardencenter.com'

  for (const sub of subscribers) {
    const unsubToken = sub.unsubscribeToken ?? sub.id
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubToken}`
    sendNewsletter({
      email:        sub.email,
      name:         sub.name,
      subject,
      bodyHtml,
      unsubscribeUrl,
    }).catch(() => {})
  }

  return NextResponse.json({ sent: subscribers.length })
}
