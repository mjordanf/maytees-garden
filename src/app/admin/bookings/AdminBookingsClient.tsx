'use client'
import { useState } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { X } from 'lucide-react'

type Booking = any

const STATUSES = ['pending','confirmed','completed','cancelled']
const STATUS_COLORS: Record<string,string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-500',
}

const PREF_LABELS: Record<string, string> = {
  'in-person':   '🏡 In-Person',
  'facetime':    '📱 FaceTime',
  'whatsapp':    '💬 WhatsApp',
  'google-meet': '🎥 Google Meet',
}

const VIDEO_TYPES = ['facetime', 'whatsapp', 'google-meet']

type ConfirmForm = {
  consultationType: string
  videoCallLink: string
  consultationNotes: string
}

export default function AdminBookingsClient({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial)
  const [filter, setFilter]     = useState('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [form, setForm] = useState<ConfirmForm>({
    consultationType: 'in-person',
    videoCallLink: '',
    consultationNotes: '',
  })
  const [saving, setSaving] = useState(false)

  const filtered = filter === 'all' ? bookings : bookings.filter((b: Booking) => b.status === filter)

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setBookings((prev: Booking[]) => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const openConfirm = (booking: Booking) => {
    setForm({
      consultationType: booking.consultationType ?? booking.customerPreference ?? 'in-person',
      videoCallLink: booking.videoCallLink ?? '',
      consultationNotes: booking.consultationNotes ?? '',
    })
    setConfirmingId(booking.id)
  }

  const saveConfirmation = async () => {
    if (!confirmingId) return
    setSaving(true)
    const res = await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: confirmingId,
        status: 'confirmed',
        consultationType: form.consultationType,
        videoCallLink: form.videoCallLink || null,
        consultationNotes: form.consultationNotes || null,
      }),
    })
    if (res.ok) {
      setBookings((prev: Booking[]) => prev.map(b => b.id === confirmingId ? {
        ...b,
        status: 'confirmed',
        consultationType: form.consultationType,
        videoCallLink: form.videoCallLink || null,
        consultationNotes: form.consultationNotes || null,
      } : b))
      setConfirmingId(null)
    }
    setSaving(false)
  }

  const confirmingBooking = bookings.find((b: Booking) => b.id === confirmingId)
  const isVideo = VIDEO_TYPES.includes(form.consultationType)

  return (
    <>
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Client','Service','Date & Time','Preference','Contact','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b: Booking) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{b.clientName}</p>
                    {b.user && <p className="text-xs text-gray-400">Registered user</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.service?.nameEn ?? 'General Consultation'}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{formatDate(b.appointmentDate)}</p>
                    <p className="text-gray-400 text-xs">{formatTime(b.appointmentDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {b.customerPreference && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {PREF_LABELS[b.customerPreference] ?? b.customerPreference}
                      </span>
                    )}
                    {b.consultationType && (
                      <p className="text-xs text-green-700 font-medium mt-1">
                        Confirmed: {PREF_LABELS[b.consultationType] ?? b.consultationType}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{b.clientEmail}</p>
                    {b.clientPhone && <p className="text-gray-400 text-xs">{b.clientPhone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 bg-white"
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                      <button
                        onClick={() => openConfirm(b)}
                        className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition-colors font-medium"
                      >
                        {b.consultationType ? 'Edit Confirmation' : 'Confirm'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No bookings with status "{filter}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmingId && confirmingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-bold text-green-800">Confirm Consultation</h3>
                <p className="text-sm text-gray-500">{confirmingBooking.clientName} — {formatDate(confirmingBooking.appointmentDate)}</p>
              </div>
              <button onClick={() => setConfirmingId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Consultation Type</label>
                <select
                  value={form.consultationType}
                  onChange={e => setForm(f => ({ ...f, consultationType: e.target.value }))}
                  className="input"
                >
                  <option value="in-person">🏡 In-Person Visit</option>
                  <option value="facetime">📱 FaceTime</option>
                  <option value="whatsapp">💬 WhatsApp Video</option>
                  <option value="google-meet">🎥 Google Meet</option>
                </select>
              </div>

              {isVideo && (
                <div>
                  <label className="label">Video Call Link</label>
                  <input
                    className="input"
                    type="url"
                    value={form.videoCallLink}
                    onChange={e => setForm(f => ({ ...f, videoCallLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div>
                <label className="label">Internal Notes (admin only)</label>
                <textarea
                  className="input resize-none h-24"
                  value={form.consultationNotes}
                  onChange={e => setForm(f => ({ ...f, consultationNotes: e.target.value }))}
                  placeholder="Notes visible only to staff..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveConfirmation}
                disabled={saving}
                className="btn-primary text-sm"
              >
                {saving ? 'Saving...' : 'Save & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
