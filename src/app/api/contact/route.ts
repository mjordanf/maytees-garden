import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, zipCode, service, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const submission = await prisma.contactSubmission.create({
    data: { name, email, phone, zipCode, service, message },
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
