'use client'
import { useState } from 'react'
import { RETURN_REASONS, DAMAGE_CLAIM_REASONS } from '@/lib/returns'
import { AlertTriangle, CheckCircle, Loader2, Upload, X } from 'lucide-react'

const STATUS_STEPS = ['requested', 'under_review', 'approved', 'label_sent', 'received', 'refunded']
const STATUS_LABELS: Record<string, string> = {
  requested:    'Submitted',
  under_review: 'Under Review',
  approved:     'Approved',
  label_sent:   'Label Sent',
  received:     'Received',
  refunded:     'Refunded',
  rejected:     'Rejected',
}

type ReturnReq = {
  id: string; returnNumber: string; status: string
  returnTracking: string | null; refundAmount: number | null
  rejectionReason: string | null; createdAt: string
}

function ReturnStatusTracker({ ret }: { ret: ReturnReq }) {
  if (ret.status === 'rejected') {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm font-semibold text-red-700 mb-1">Return Rejected</p>
        {ret.rejectionReason && <p className="text-sm text-red-600">{ret.rejectionReason}</p>}
        <p className="text-xs text-gray-400 mt-1">{ret.returnNumber}</p>
      </div>
    )
  }
  const currentIdx = STATUS_STEPS.indexOf(ret.status)
  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-green-800">Return {ret.returnNumber}</p>
        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
          {STATUS_LABELS[ret.status] ?? ret.status}
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? 'bg-green-600' : 'bg-gray-300'}`} />
            <span className={`text-xs ${i <= currentIdx ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
              {STATUS_LABELS[step]}
            </span>
            {i < STATUS_STEPS.length - 1 && <div className={`w-4 h-px ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      {ret.returnTracking && (
        <p className="mt-2 text-xs text-gray-500">Return tracking: <span className="font-mono font-semibold text-gray-700">{ret.returnTracking}</span></p>
      )}
      {ret.refundAmount && (
        <p className="mt-1 text-xs text-gray-500">Refund: <span className="font-semibold text-green-700">${ret.refundAmount.toFixed(2)}</span></p>
      )}
    </div>
  )
}

export default function ReturnRequestForm({
  orderId,
  orderNumber,
  orderTotal,
  onClose,
}: {
  orderId: string
  orderNumber: string
  orderTotal: number
  onClose: () => void
}) {
  const [step, setStep]           = useState(1)
  const [reason, setReason]       = useState('')
  const [detail, setDetail]       = useState('')
  const [photos, setPhotos]       = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]       = useState<ReturnReq | null>(null)
  const [error, setError]         = useState('')

  const isDamageClaim = DAMAGE_CLAIM_REASONS.has(reason)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const uploaded: string[] = []
    for (const file of files.slice(0, 5 - photos.length)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json()
          uploaded.push(url)
        }
      } catch {}
    }
    setPhotos(prev => [...prev, ...uploaded])
    setUploading(false)
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (isDamageClaim && photos.length === 0) {
      setError('Please upload at least one photo for damage claims.')
      return
    }
    if (reason === 'other' && !detail.trim()) {
      setError('Please provide details when selecting "Other".')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeOrderId: orderId, reason, reasonDetail: detail, isDamageClaim, photoUrls: photos }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Submission failed'); setSubmitting(false); return }
      setResult(data.returnRequest)
    } catch { setError('Network error. Please try again.') }
    setSubmitting(false)
  }

  if (result) return <ReturnStatusTracker ret={{ ...result, createdAt: new Date().toISOString() }} />

  return (
    <div className="mt-4 border-2 border-green-200 rounded-xl p-5 bg-green-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-green-800 text-lg">Request Return — {orderNumber}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-5">
        {['Select Reason', 'Details', 'Confirm'].map((label, i) => (
          <div key={i} className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg ${step === i+1 ? 'bg-green-700 text-white' : step > i+1 ? 'bg-green-200 text-green-800' : 'bg-white text-gray-400 border border-gray-200'}`}>
            {i+1}. {label}
          </div>
        ))}
      </div>

      {/* Step 1 — Reason */}
      {step === 1 && (
        <div className="space-y-2">
          {Object.entries(RETURN_REASONS).map(([key, label]) => (
            <label key={key} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${reason === key ? 'border-green-600 bg-white' : 'border-transparent bg-white/60 hover:bg-white'}`}>
              <input type="radio" name="reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="accent-green-700" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
          {isDamageClaim && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Damage claims must be submitted within <strong>48 hours of delivery</strong>. Please include clear photos in the next step.</p>
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!reason}
            className="w-full mt-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 — Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Additional details {reason === 'other' ? '(required)' : '(optional)'}
            </label>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              rows={3}
              placeholder="Describe the issue..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Photos {isDamageClaim ? <span className="text-red-600">(required for damage claims)</span> : '(optional — max 5)'}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 text-gray-400 hover:text-green-600 transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-xs mt-0.5">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => { setStep(1); setError('') }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">← Back</button>
            <button onClick={() => { setError(''); setStep(3) }} className="flex-1 btn-primary">Next →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order</span><span className="font-medium">{orderNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Order Total</span><span className="font-medium">${orderTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-medium">{RETURN_REASONS[reason]}</span></div>
            {detail && <div className="pt-1 border-t border-gray-100"><p className="text-gray-500 text-xs">Details: {detail}</p></div>}
            {photos.length > 0 && <div className="flex items-center gap-1 text-gray-500 text-xs pt-1 border-t border-gray-100"><span>{photos.length} photo{photos.length > 1 ? 's' : ''} attached</span></div>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            <strong>Return Policy Reminder:</strong> Items must be in original condition. Live plants returned due to neglect or improper care after delivery are not eligible for refunds.
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => { setStep(2); setError('') }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 btn-primary disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Submitting…</> : 'Submit Return Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ReturnStatusTracker }
