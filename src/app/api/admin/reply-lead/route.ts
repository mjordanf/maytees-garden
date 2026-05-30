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

  const { submissionId, replyBody, subject } = await req.json()

  if (!submissionId || !replyBody || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const submission = await prisma.contactSubmission.findUnique({ where: { id: submissionId } })
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  await sendLeadReply({
    leadName:  submission.name,
    leadEmail: submission.email,
    subject,
    replyBody,
  })

  await prisma.contactSubmission.update({
    where: { id: submissionId },
    data:  { status: 'replied' },
  })

  return NextResponse.json({ success: true })
}
