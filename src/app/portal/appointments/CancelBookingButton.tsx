'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function CancelBookingButton({ bookingId, status }: { bookingId: string; status: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!['pending', 'confirmed'].includes(status)) return null

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'cancelled' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to cancel booking')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-500 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors font-medium"
      >
        <X className="w-3 h-3" />
        Cancel Appointment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null) }}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-60"
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
