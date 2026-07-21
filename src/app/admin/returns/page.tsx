export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminReturnsClient from './AdminReturnsClient'

export default async function AdminReturnsPage() {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) redirect('/')

  const returns = await prisma.returnRequest.findMany({
    include: {
      storeOrder: { include: { items: true } },
      user:       { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialised = returns.map(r => ({
    ...r,
    createdAt:   r.createdAt.toISOString(),
    updatedAt:   r.updatedAt.toISOString(),
    refundedAt:  r.refundedAt?.toISOString()  ?? null,
    labelSentAt: r.labelSentAt?.toISOString() ?? null,
    storeOrder: {
      ...r.storeOrder,
      createdAt: r.storeOrder.createdAt.toISOString(),
      updatedAt: r.storeOrder.updatedAt.toISOString(),
      shippedAt: r.storeOrder.shippedAt?.toISOString() ?? null,
    },
  }))

  return <AdminReturnsClient initialReturns={serialised} />
}
