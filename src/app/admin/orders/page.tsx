export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminOrdersClient from './AdminOrdersClient'

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'admin' && role !== 'staff' && role !== 'superadmin')) {
    redirect('/')
  }

  const orders = await prisma.storeOrder.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminOrdersClient initialOrders={orders} />
}
