import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?error=missing', req.url))
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } })

  if (!subscriber) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed?error=invalid', req.url))
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data:  { active: false },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mayteesgardencenter.com'
  return NextResponse.redirect(new URL('/newsletter/unsubscribed', baseUrl))
}
