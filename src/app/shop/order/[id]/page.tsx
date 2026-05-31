export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const order = await prisma.storeOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  })

  if (!order) notFound()

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-lg">
            Your order is confirmed! You'll receive a shipping notification by email.
          </p>
          <p className="mt-3 text-2xl font-bold text-green-700">{order.orderNumber}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Items */}
          <div>
            <h2 className="font-serif text-lg font-bold text-green-800 mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.plantName} <span className="text-gray-400">× {item.qty}</span></span>
                  <span className="font-semibold text-gray-800">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-gray-100 pt-4">
            <h2 className="font-serif text-lg font-bold text-green-800 mb-2">Shipping To</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-800">{order.customerName}</p>
              <p>{order.shipAddress1}{order.shipAddress2 ? `, ${order.shipAddress2}` : ''}</p>
              <p>{order.shipCity}, {order.shipState} {order.shipZip}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping ({order.shippingCarrier}{order.shippingService ? ` — ${order.shippingService}` : ''})</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span><span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {session && (
            <Link href="/portal/orders" className="btn-secondary text-center">
              View all your orders →
            </Link>
          )}
          <Link href="/plants" className="btn-primary text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
