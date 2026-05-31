'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Truck, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type OrderItem = {
  id: string; plantName: string; qty: number; unitPrice: number; total: number
}
type StoreOrder = {
  id: string; orderNumber: string; customerName: string; customerEmail: string
  createdAt: string | Date; status: string; channel: string; total: number
  subtotal: number; tax: number; shippingCost: number
  shippingCarrier: string | null; shippingService: string | null
  trackingNumber: string | null; shippoLabelUrl: string | null
  squarePaymentId: string | null
  shipAddress1: string; shipAddress2: string | null
  shipCity: string; shipState: string; shipZip: string
  items: OrderItem[]
}

const STATUS_BADGE: Record<string, string> = {
  pending:           'bg-gray-100 text-gray-600',
  payment_confirmed: 'bg-blue-100 text-blue-700',
  processing:        'bg-yellow-100 text-yellow-700',
  shipped:           'bg-green-100 text-green-700',
  delivered:         'bg-green-200 text-green-900',
  cancelled:         'bg-red-100 text-red-500',
  refunded:          'bg-purple-100 text-purple-700',
}

const CHANNEL_BADGE: Record<string, string> = {
  website: 'bg-blue-50 text-blue-700',
  etsy:    'bg-orange-50 text-orange-700',
}

const ALL_STATUSES = ['all','pending','payment_confirmed','processing','shipped','delivered','cancelled']

type Rate = { objectId: string; carrier: string; service: string; price: number; days: number | null }

export default function AdminOrdersClient({ initialOrders }: { initialOrders: StoreOrder[] }) {
  const [orders, setOrders] = useState<StoreOrder[]>(initialOrders)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Shippo rate selector state
  const [ratesForOrder, setRatesForOrder] = useState<Record<string, Rate[]>>({})
  const [selectedRates, setSelectedRates] = useState<Record<string, string>>({})
  const [loadingRates, setLoadingRates] = useState<string | null>(null)
  const [purchasingLabel, setPurchasingLabel] = useState<string | null>(null)

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const updateOrderStatus = async (orderId: string, status: string, extra?: Record<string, unknown>) => {
    setActionLoading(orderId + status)
    const res = await fetch(`/api/store/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    })
    if (res.ok) {
      const { order } = await res.json()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...order } : o))
    }
    setActionLoading(null)
  }

  const loadRates = async (order: StoreOrder) => {
    setLoadingRates(order.id)
    try {
      const res = await fetch('/api/store/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: {
            name: order.customerName,
            street1: order.shipAddress1,
            city: order.shipCity,
            state: order.shipState,
            zip: order.shipZip,
            country: 'US',
          },
          items: order.items.map(i => ({ plantId: i.id, qty: i.qty })),
        }),
      })
      const data = await res.json()
      setRatesForOrder(prev => ({ ...prev, [order.id]: data.rates ?? [] }))
    } catch {
      setRatesForOrder(prev => ({ ...prev, [order.id]: [] }))
    } finally {
      setLoadingRates(null)
    }
  }

  const purchaseLabel = async (orderId: string) => {
    const rateId = selectedRates[orderId]
    if (!rateId) return
    setPurchasingLabel(orderId)
    const res = await fetch(`/api/store/orders/${orderId}/label`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rateId }),
    })
    if (res.ok) {
      const { order } = await res.json()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...order } : o))
    }
    setPurchasingLabel(null)
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return
    await updateOrderStatus(orderId, 'cancelled')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Store Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} orders total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filterStatus === s
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-400'
            }`}
          >
            {s.replace('_', ' ')} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #','Customer','Date','Channel','Status','Total','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <>
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3 font-bold text-green-800">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${CHANNEL_BADGE[order.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      {expandedId === order.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={7} className="px-4 pb-6 pt-2 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div>
                            <h3 className="font-semibold text-gray-700 mb-2 text-xs uppercase tracking-wide">Items</h3>
                            <div className="space-y-1">
                              {order.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                                  <span>{item.plantName} × {item.qty}</span>
                                  <span>{formatCurrency(item.total)}</span>
                                </div>
                              ))}
                              <div className="border-t border-gray-200 pt-1 space-y-0.5 text-xs text-gray-400">
                                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.shippingCost)}</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
                                <div className="flex justify-between font-semibold text-gray-700"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                              </div>
                            </div>
                          </div>

                          {/* Shipping + Actions */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wide">Shipping Address</h3>
                              <p className="text-sm text-gray-600">{order.shipAddress1}{order.shipAddress2 ? `, ${order.shipAddress2}` : ''}</p>
                              <p className="text-sm text-gray-600">{order.shipCity}, {order.shipState} {order.shipZip}</p>
                            </div>

                            {order.squarePaymentId && (
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wide">Payment</h3>
                                <p className="text-xs font-mono text-gray-500">{order.squarePaymentId}</p>
                              </div>
                            )}

                            {order.trackingNumber && (
                              <div>
                                <h3 className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wide">Tracking</h3>
                                <p className="text-sm text-gray-700 font-mono">{order.trackingNumber}</p>
                                {order.shippoLabelUrl && (
                                  <a href={order.shippoLabelUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline">Download Label</a>
                                )}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                              {order.status === 'payment_confirmed' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                  disabled={actionLoading === order.id + 'processing'}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600 disabled:opacity-50"
                                >
                                  <RefreshCw className="w-3 h-3" /> Mark as Processing
                                </button>
                              )}

                              {order.status === 'processing' && (
                                <div className="space-y-2 w-full">
                                  <button
                                    onClick={() => loadRates(order)}
                                    disabled={loadingRates === order.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                                  >
                                    <Truck className="w-3 h-3" />
                                    {loadingRates === order.id ? 'Loading rates…' : 'Get Shipping Rates'}
                                  </button>
                                  {ratesForOrder[order.id] && (
                                    <div className="space-y-1">
                                      {ratesForOrder[order.id].length === 0
                                        ? <p className="text-xs text-red-500">No rates available</p>
                                        : ratesForOrder[order.id].map(rate => (
                                          <label key={rate.objectId} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`rate-${order.id}`}
                                              value={rate.objectId}
                                              onChange={() => setSelectedRates(prev => ({ ...prev, [order.id]: rate.objectId }))}
                                              className="accent-green-600"
                                            />
                                            <span>{rate.carrier} — {rate.service} — {formatCurrency(rate.price)}</span>
                                            {rate.days && <span className="text-gray-400">({rate.days}d)</span>}
                                          </label>
                                        ))
                                      }
                                      {selectedRates[order.id] && (
                                        <button
                                          onClick={() => purchaseLabel(order.id)}
                                          disabled={purchasingLabel === order.id}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 mt-1"
                                        >
                                          {purchasingLabel === order.id ? 'Purchasing…' : 'Purchase Label'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                  disabled={actionLoading === order.id + 'delivered'}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" /> Mark as Delivered
                                </button>
                              )}

                              {!['cancelled','refunded','delivered'].includes(order.status) && (
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={actionLoading === order.id + 'cancelled'}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3" /> Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No orders found</div>
          )}
        </div>
      </div>
    </div>
  )
}
