import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to avoid user enumeration
  if (!user) return NextResponse.json({ success: true })

  // Invalidate any existing unused tokens for this email
  await prisma.passwordResetToken.updateMany({
    where: { email, used: false },
    data: { used: true },
  })

  const token     = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await prisma.passwordResetToken.create({ data: { token, email, expiresAt } })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  await sendPasswordResetEmail({ name: user.name ?? email, email, resetUrl })

  return NextResponse.json({ success: true })
}
