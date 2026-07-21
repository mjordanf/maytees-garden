'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { isWithinReturnWindow } from '@/lib/returns'
import ReturnRequestForm, { ReturnStatusTracker } from './ReturnRequestForm'

const STATUS_BADGE: Record<string, string> = {
  pending:              'bg-gray-100 text-gray-600',
  payment_confirmed:    'bg-blue-100 text-blue-700',
  processing:           'bg-yellow-100 text-yellow-700',
  shipped:              'bg-green-100 text-green-700',
  delivered:            'bg-green-200 text-green-800',
  return_in_progress:   'bg-orange-100 text-orange-700',
  cancelled:            'bg-red-100 text-red-500',
  refunded:             'bg-purple-100 text-purple-700',
}

type Order = {
  id: string; orderNumber: string; status: string; total: number
  createdAt: string; updatedAt: string; shippedAt: string | null
  shippingCarrier: string | null; trackingNumber: string | null
  items: { id: string; plantName: string; qty: number; total: number }[]
  returnRequest: {
    id: string; returnNumber: string; status: string
    returnTracking: string | null; refundAmount: number | null
    rejectionReason: string | null; createdAt: string; updatedAt: string
    refundedAt: string | null; labelSentAt: string | null
  } | null
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [openReturnId, setOpenReturnId] = useState<string | null>(null)

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
          {orders.map(order => {
            const deliveredAt = order.shippedAt ? new Date(order.shippedAt) : null
            const windowCheck = isWithinReturnWindow(deliveredAt, false)
            const isDelivered = order.status === 'delivered'
            const hasReturn   = !!order.returnRequest

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div>
                    <p className="font-bold text-green-800 text-lg">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-terra-500 text-lg">{formatCurrency(order.total)}</p>
                    <span className={`badge text-xs ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.plantName} <span className="text-gray-400">× {item.qty}</span></span>
                      <span className="text-gray-500">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center gap-3 mt-3">
                    <Package className="w-4 h-4 text-green-700 shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-green-800">{order.shippingCarrier ?? 'Carrier'}</span>
                      <span className="text-gray-500 mx-2">·</span>
                      <span className="text-gray-600">Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span></span>
                    </div>
                  </div>
                )}

                {/* Return section */}
                {isDelivered && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {hasReturn ? (
                      <ReturnStatusTracker ret={order.returnRequest!} />
                    ) : windowCheck.eligible ? (
                      openReturnId === order.id ? (
                        <ReturnRequestForm
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          orderTotal={order.total}
                          onClose={() => setOpenReturnId(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setOpenReturnId(order.id)}
                          className="text-sm text-green-700 border border-green-300 hover:bg-green-50 rounded-lg px-3 py-1.5 font-medium transition-colors"
                        >
                          ↩ Request Return
                        </button>
                      )
                    ) : (
                      <p className="text-xs text-gray-400 italic">{windowCheck.reason}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
