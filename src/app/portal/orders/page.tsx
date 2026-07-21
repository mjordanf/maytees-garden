export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  const email   = session?.user?.email ?? ''

  const storeOrders = await prisma.storeOrder.findMany({
    where: { OR: [{ userId }, { customerEmail: email }] },
    include: { items: true, returnRequest: true },
    orderBy: { createdAt: 'desc' },
  })

  const serialised = storeOrders.map(o => ({
    ...o,
    createdAt:  o.createdAt.toISOString(),
    updatedAt:  o.updatedAt.toISOString(),
    shippedAt:  o.shippedAt?.toISOString()  ?? null,
    returnRequest: o.returnRequest ? {
      ...o.returnRequest,
      createdAt:   o.returnRequest.createdAt.toISOString(),
      updatedAt:   o.returnRequest.updatedAt.toISOString(),
      refundedAt:  o.returnRequest.refundedAt?.toISOString()  ?? null,
      labelSentAt: o.returnRequest.labelSentAt?.toISOString() ?? null,
    } : null,
  }))

  return <OrdersClient orders={serialised} />
}
