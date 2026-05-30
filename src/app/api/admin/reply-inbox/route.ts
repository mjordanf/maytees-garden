import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLeadReply } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['staff', 'admin', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { messageId, subject, replyBody } = await req.json()
  if (!messageId || !replyBody?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const message = await prisma.inboxMessage.findUnique({
    where: { id: messageId },
    include: { fromUser: { select: { name: true, email: true } } },
  })

  if (!message || !message.fromUser?.email) {
    return NextResponse.json({ error: 'Message not found or has no sender email' }, { status: 404 })
  }

  await sendLeadReply({
    leadName:  message.fromUser.name ?? message.fromUser.email,
    leadEmail: message.fromUser.email,
    subject:   subject || `Re: ${message.subject}`,
    replyBody,
  })

  // Mark as read if not already
  await prisma.inboxMessage.update({ where: { id: messageId }, data: { read: true } })

  return NextResponse.json({ success: true })
}
