import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendCustomerMessageAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  const userName = session.user?.name ?? 'Customer'
  const userEmail = session.user?.email ?? ''

  const { bookingId, subject, body } = await req.json()

  if (!subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const message = await prisma.inboxMessage.create({
    data: {
      fromUserId: userId ?? null,
      bookingId: bookingId ?? null,
      subject,
      body,
      type: 'customer-message',
    },
  })

  // Alert business
  sendCustomerMessageAlert({
    customerName: userName,
    customerEmail: userEmail,
    message: body,
    bookingId: bookingId ?? null,
  }).catch(() => {})

  return NextResponse.json({ message })
}
