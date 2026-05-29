import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  const orders  = await prisma.order.findMany({ where: { userId }, include: { items: { include: { plant: true } } }, orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-green-800">Order History</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm text-center">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-gray-400 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-6">Visit our plant catalog to browse and purchase plants.</p>
          <Link href="/plants" className="btn-primary">Browse Plants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-800">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-terra-500 text-lg">{formatCurrency(order.total)}</p>
                  <span className={`badge text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.plant.nameEn} × {item.qty}</span>
                    <span className="text-gray-500">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
