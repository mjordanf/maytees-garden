'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestEmailPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const send = async () => {
    setStatus('sending')
    setResult(null)
    const res = await fetch('/api/admin/test-email', { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">Email Pipeline Test</h1>
          <p className="text-gray-500 text-sm">Sends a real test email via Resend to verify the full delivery pipeline.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="text-sm text-gray-600 space-y-2">
          <p>Clicking the button below will:</p>
          <ol className="list-decimal ml-4 space-y-1 text-gray-500">
            <li>Connect to Resend using <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code></li>
            <li>Send from <code className="bg-gray-100 px-1 rounded">RESEND_FROM_EMAIL</code></li>
            <li>Deliver to <code className="bg-gray-100 px-1 rounded">ADMIN_EMAIL</code></li>
          </ol>
        </div>

        <button
          onClick={send}
          disabled={status === 'sending'}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
        >
          {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'sending' ? 'Sending…' : 'Send Test Email'}
        </button>

        {status === 'success' && result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Email delivered successfully</span>
            </div>
            <dl className="text-sm space-y-1.5">
              {[
                ['Resend ID', result.id],
                ['Sent to',   result.to],
                ['Sent from', result.from],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="text-green-600 font-medium w-24 shrink-0">{k}</dt>
                  <dd className="text-green-900 break-all">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {status === 'error' && result && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-red-700">Delivery failed</span>
            </div>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
