'use client'
import { useState } from 'react'
import { RotateCcw, ChevronDown, ChevronUp, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'
import { RETURN_REASONS } from '@/lib/returns'
import { formatCurrency } from '@/lib/utils'

const STATUS_BADGE: Record<string, string> = {
  requested:    'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-700',
  approved:     'bg-green-100 text-green-700',
  label_sent:   'bg-teal-100 text-teal-700',
  received:     'bg-purple-100 text-purple-700',
  refunded:     'bg-gray-100 text-gray-600',
  rejected:     'bg-red-100 text-red-600',
}

const REJECTION_REASONS = [
  'Outside return window',
  'Item shows signs of neglect',
  'Non-returnable item (live plant policy)',
  'Insufficient photo evidence for damage claim',
  'Duplicate request',
  'Other',
]

const TABS = ['all', 'requested', 'under_review', 'approved', 'label_sent', 'received', 'refunded', 'rejected']

type ReturnItem = {
  id: string; returnNumber: string; status: string; reason: string; reasonDetail: string | null
  isDamageClaim: boolean; photoUrls: string; adminNotes: string | null
  rejectionReason: string | null; refundType: string | null; refundAmount: number | null
  squareRefundId: string | null; shippoLabelUrl: string | null; returnTracking: string | null
  createdAt: string; updatedAt: string; refundedAt: string | null; labelSentAt: string | null
  storeOrder: {
    id: string; orderNumber: string; total: number; subtotal: number
    customerName: string; customerEmail: string; customerPhone: string | null
    shipAddress1: string; shipCity: string; shipState: string; shipZip: string
    squarePaymentId: string | null; createdAt: string; shippedAt: string | null
    items: { id: string; plantName: string; qty: number; unitPrice: number; total: number }[]
  }
  user: { name: string | null; email: string } | null
}

export default function AdminReturnsClient({ initialReturns }: { initialReturns: ReturnItem[] }) {
  const [returns, setReturns]     = useState(initialReturns)
  const [tab, setTab]             = useState('all')
  const [search, setSearch]       = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionId, setActionId]   = useState<string | null>(null) // 'approve' | 'reject' | null per item
  const [actionType, setActionType] = useState<Record<string, 'approve' | 'reject' | null>>({})
  const [working, setWorking]     = useState(false)

  // Approve form state
  const [refundType, setRefundType]     = useState<Record<string, 'full' | 'partial'>>({})
  const [refundAmount, setRefundAmount] = useState<Record<string, string>>({})
  const [adminNotes, setAdminNotes]     = useState<Record<string, string>>({})

  // Reject form state
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})
  const [rejectionNotes, setRejectionNotes]   = useState<Record<string, string>>({})

  const pendingCount  = returns.filter(r => r.status === 'requested').length
  const approvedCount = returns.filter(r => ['approved', 'label_sent'].includes(r.status)).length
  const inTransit     = returns.filter(r => r.status === 'label_sent').length
  const refundedTotal = returns.filter(r => r.status === 'refunded').reduce((s, r) => s + (r.refundAmount ?? 0), 0)

  const filtered = returns.filter(r => {
    const matchTab = tab === 'all' || r.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q || r.returnNumber.toLowerCase().includes(q) ||
      r.storeOrder.orderNumber.toLowerCase().includes(q) ||
      r.storeOrder.customerName.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  async function doApprove(ret: ReturnItem) {
    setWorking(true)
    const type   = refundType[ret.id] ?? 'full'
    const amount = type === 'partial' ? parseFloat(refundAmount[ret.id] ?? '0') : undefined
    const res = await fetch(`/api/returns/${ret.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refundType: type, refundAmount: amount, adminNotes: adminNotes[ret.id] }),
    })
    const data = await res.json()
    if (res.ok) {
      setReturns(prev => prev.map(r => r.id === ret.id ? {
        ...r, status: 'label_sent',
        refundAmount: data.refundAmount ?? r.refundAmount,
        shippoLabelUrl: data.labelUrl ?? r.shippoLabelUrl,
        returnTracking: data.returnTracking ?? r.returnTracking,
      } : r))
      setActionType(prev => ({ ...prev, [ret.id]: null }))
    } else {
      alert(`Error: ${data.error}`)
    }
    setWorking(false)
  }

  async function doReject(ret: ReturnItem) {
    const reason = rejectionReason[ret.id]
    if (!reason) { alert('Select a rejection reason'); return }
    setWorking(true)
    const res = await fetch(`/api/returns/${ret.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionReason: reason, adminNotes: rejectionNotes[ret.id] }),
    })
    if (res.ok) {
      setReturns(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'rejected', rejectionReason: reason } : r))
      setActionType(prev => ({ ...prev, [ret.id]: null }))
    }
    setWorking(false)
  }

  async function doMarkReceived(id: string) {
    setWorking(true)
    const res = await fetch(`/api/returns/${id}/mark-received`, { method: 'POST' })
    if (res.ok) setReturns(prev => prev.map(r => r.id === id ? { ...r, status: 'received' } : r))
    setWorking(false)
  }

  async function doRegenerateLabel(id: string) {
    setWorking(true)
    const res = await fetch(`/api/returns/${id}/regenerate-label`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setReturns(prev => prev.map(r => r.id === id ? { ...r, shippoLabelUrl: data.labelUrl, returnTracking: data.trackingNumber, status: 'label_sent' } : r))
    } else {
      alert(`Error: ${data.error}`)
    }
    setWorking(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-green-800">Returns</h1>
          <p className="text-gray-500 text-sm mt-1">{returns.length} total return request{returns.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending Review', value: pendingCount,  color: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
          { label: 'Approved',       value: approvedCount, color: 'bg-green-50 text-green-800 border-green-200',   dot: 'bg-green-500' },
          { label: 'In Transit',     value: inTransit,     color: 'bg-teal-50 text-teal-800 border-teal-200',     dot: 'bg-teal-500' },
          { label: `Refunded`,       value: `$${refundedTotal.toFixed(2)}`, color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 flex items-center gap-2 ${s.color}`}>
            <div className={`w-2 h-2 rounded-full ${s.dot}`} />
            <div><p className="text-xs font-medium">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${tab === t ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t === 'all' ? 'All' : t.replace('_', ' ')}
              {t === 'requested' && pendingCount > 0 && <span className="ml-1 bg-amber-400 text-amber-900 text-xs px-1 rounded-full">{pendingCount}</span>}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search returns..." className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {/* Table */}
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400 bg-white rounded-2xl"><RotateCcw className="w-10 h-10 mx-auto mb-3 text-gray-200" /><p>No returns found</p></div>}
        {filtered.map(ret => {
          const isOpen   = expandedId === ret.id
          const aType    = actionType[ret.id]
          const photos   = ret.photoUrls ? ret.photoUrls.split(',').filter(Boolean) : []

          return (
            <div key={ret.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isOpen ? null : ret.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-green-800">{ret.returnNumber}</span>
                    {ret.isDamageClaim && <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Damage</span>}
                    <span className={`badge text-xs ${STATUS_BADGE[ret.status] ?? 'bg-gray-100 text-gray-600'}`}>{ret.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ret.storeOrder.customerName} · {ret.storeOrder.orderNumber} · {RETURN_REASONS[ret.reason] ?? ret.reason}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(ret.storeOrder.total)}</p>
                  <p className="text-xs text-gray-400">{new Date(ret.createdAt).toLocaleDateString()}</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Detail */}
              {isOpen && (
                <div className="border-t border-gray-100 p-5 space-y-5">
                  {/* Customer + Order info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</p>
                      <p className="font-semibold text-gray-800">{ret.storeOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{ret.storeOrder.customerEmail}</p>
                      {ret.storeOrder.customerPhone && <p className="text-sm text-gray-600">{ret.storeOrder.customerPhone}</p>}
                      <p className="text-sm text-gray-500 mt-2">{ret.storeOrder.shipAddress1}, {ret.storeOrder.shipCity}, {ret.storeOrder.shipState} {ret.storeOrder.shipZip}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</p>
                      {ret.storeOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.plantName} × {item.qty}</span>
                          <span className="text-gray-500">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-semibold">
                        <span>Total</span><span>{formatCurrency(ret.storeOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Return reason */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Return Reason</p>
                    <p className="text-sm font-medium text-gray-800">{RETURN_REASONS[ret.reason] ?? ret.reason}</p>
                    {ret.reasonDetail && <p className="text-sm text-gray-600 mt-1">{ret.reasonDetail}</p>}
                    {ret.isDamageClaim && (
                      <div className="mt-2 flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Damage / dead plant claim</span>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {photos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Photos</p>
                      <div className="flex gap-2 flex-wrap">
                        {photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refund / label info for approved+ */}
                  {['approved', 'label_sent', 'received', 'refunded'].includes(ret.status) && (
                    <div className="bg-green-50 rounded-xl p-4 space-y-1.5 text-sm">
                      {ret.squareRefundId && <p className="text-gray-600">Square Refund ID: <span className="font-mono text-xs">{ret.squareRefundId}</span></p>}
                      {ret.refundAmount   && <p className="text-gray-600">Refund Amount: <strong>{formatCurrency(ret.refundAmount)}</strong></p>}
                      {ret.returnTracking && <p className="text-gray-600">Return Tracking: <span className="font-mono font-semibold">{ret.returnTracking}</span></p>}
                      {ret.shippoLabelUrl && (
                        <a href={ret.shippoLabelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 font-medium hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" /> Download Label
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action panel */}
                  {ret.status === 'requested' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button onClick={() => setActionType(prev => ({ ...prev, [ret.id]: aType === 'approve' ? null : 'approve' }))}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
                          ✓ Approve Return
                        </button>
                        <button onClick={() => setActionType(prev => ({ ...prev, [ret.id]: aType === 'reject' ? null : 'reject' }))}
                          className="flex-1 py-2.5 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors">
                          ✗ Reject Return
                        </button>
                      </div>

                      {aType === 'approve' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-green-800">Approve & Issue Refund</p>
                          <div className="flex gap-2">
                            <button onClick={() => setRefundType(prev => ({ ...prev, [ret.id]: 'full' }))}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${(refundType[ret.id] ?? 'full') === 'full' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                              Full Refund ({formatCurrency(ret.storeOrder.total)})
                            </button>
                            <button onClick={() => setRefundType(prev => ({ ...prev, [ret.id]: 'partial' }))}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${refundType[ret.id] === 'partial' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                              Partial Refund
                            </button>
                          </div>
                          {refundType[ret.id] === 'partial' && (
                            <input
                              type="number" step="0.01" placeholder="Amount to refund"
                              value={refundAmount[ret.id] ?? ''}
                              onChange={e => setRefundAmount(prev => ({ ...prev, [ret.id]: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          )}
                          <textarea
                            placeholder="Admin notes (optional, internal only)"
                            value={adminNotes[ret.id] ?? ''}
                            onChange={e => setAdminNotes(prev => ({ ...prev, [ret.id]: e.target.value }))}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          />
                          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            This will immediately charge a refund to the customer's Square payment. This cannot be undone.
                          </p>
                          <button onClick={() => doApprove(ret)} disabled={working} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Confirm Approval — Issue Refund & Generate Label
                          </button>
                        </div>
                      )}

                      {aType === 'reject' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-semibold text-red-800">Reject Return</p>
                          <select
                            value={rejectionReason[ret.id] ?? ''}
                            onChange={e => setRejectionReason(prev => ({ ...prev, [ret.id]: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <option value="">Select reason…</option>
                            {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <textarea
                            placeholder="Additional notes for customer (optional)"
                            value={rejectionNotes[ret.id] ?? ''}
                            onChange={e => setRejectionNotes(prev => ({ ...prev, [ret.id]: e.target.value }))}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                          />
                          <button onClick={() => doReject(ret)} disabled={working} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm Rejection
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {['approved', 'label_sent'].includes(ret.status) && (
                    <div className="flex gap-2 flex-wrap">
                      {!ret.shippoLabelUrl && (
                        <button onClick={() => doRegenerateLabel(ret.id)} disabled={working}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                          {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Regenerate Label
                        </button>
                      )}
                      <button onClick={() => doMarkReceived(ret.id)} disabled={working}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                        {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Mark as Received
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
