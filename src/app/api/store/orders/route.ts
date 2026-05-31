import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  const userId = (session.user as any)?.id
  const email = session.user?.email

  const isAdmin = role === 'admin' || role === 'staff' || role === 'superadmin'

  const orders = await prisma.storeOrder.findMany({
    where: isAdmin ? undefined : {
      OR: [
        { userId },
        { customerEmail: email ?? '' },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}
