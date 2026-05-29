'use client'
import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

export default function MessageMayteeButton({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          subject: 'Message re: appointment',
          body: body.trim(),
        }),
      })
      if (res.ok) {
        setSent(true)
        setBody('')
        setTimeout(() => { setOpen(false); setSent(false) }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-green-700 border border-green-200 hover:bg-green-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors font-medium"
      >
        <MessageSquare className="w-3 h-3" />
        Message Maytee
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-green-800">Message Maytee</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sent ? (
              <p className="text-green-700 font-medium text-center py-4">Your message was sent to Maytee ✓</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  className="input resize-none h-32 w-full"
                  placeholder="Write your message to Maytee..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  required
                />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || !body.trim()} className="btn-primary text-sm">
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
