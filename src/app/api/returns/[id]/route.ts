import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role   = (session.user as any)?.role
  const userId = (session.user as any)?.id as string
  const isAdmin = role === 'admin' || role === 'staff' || role === 'superadmin'

  const ret = await prisma.returnRequest.findUnique({
    where: { id: params.id },
    include: {
      storeOrder: { include: { items: true } },
      user:       { select: { name: true, email: true } },
    },
  })

  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin && ret.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ returnRequest: ret })
}
