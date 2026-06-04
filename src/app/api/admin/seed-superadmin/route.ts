import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const SECRET = 'maytee-seed-2026-x9k'

export async function POST(req: Request) {
  const { secret } = await req.json()
  if (secret !== SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { prisma } = await import('@/lib/prisma')
  const hash = await bcrypt.hash('Maytee@Admin2026', 12)

  const user = await prisma.user.upsert({
    where: { email: 'maytee@mayteesgardencenter.com' },
    update: { passwordHash: hash, role: 'superadmin', name: 'Maytee' },
    create: {
      email: 'maytee@mayteesgardencenter.com',
      name: 'Maytee',
      passwordHash: hash,
      role: 'superadmin',
      emailVerified: new Date(),
    },
  })

  return NextResponse.json({ ok: true, id: user.id, role: user.role })
}
