'use client'
import { useState, useEffect, useMemo } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { X, Search } from 'lucide-react'

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

  // Search / filter / sort / pagination state
  const [search, setSearch]                   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter]           = useState<string>('all')
  const [fromDate, setFromDate]               = useState('')
  const [toDate, setToDate]                   = useState('')
  const [sortField, setSortField]             = useState<'appointmentDate'|'clientName'>('appointmentDate')
  const [sortDir, setSortDir]                 = useState<'asc'|'desc'>('desc')
  const [page, setPage]                       = useState(1)
  const [pageSize, setPageSize]               = useState(25)

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Filtered + sorted + paginated bookings
  const filteredBookings = useMemo(() => {
    let list = [...bookings]
    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((b: Booking) =>
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q) ||
        (b.clientPhone ?? '').toLowerCase().includes(q) ||
        (b.service?.nameEn ?? '').toLowerCase().includes(q)
      )
    }
    // Status filter (existing)
    if (filter !== 'all') list = list.filter((b: Booking) => b.status === filter)
    // Consultation type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'not-set') list = list.filter((b: Booking) => !b.consultationType)
      else list = list.filter((b: Booking) => b.consultationType === typeFilter || b.customerPreference === typeFilter)
    }
    // Date range
    if (fromDate) list = list.filter((b: Booking) => new Date(b.appointmentDate) >= new Date(fromDate))
    if (toDate)   list = list.filter((b: Booking) => new Date(b.appointmentDate) <= new Date(toDate + 'T23:59:59'))
    // Sort
    list.sort((a: Booking, b: Booking) => {
      if (sortField === 'appointmentDate') {
        const diff = new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        return sortDir === 'asc' ? diff : -diff
      }
      const av = a.clientName.toLowerCase(), bv = b.clientName.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return list
    // NOTE: if booking count exceeds 500, consider server-side pagination
  }, [bookings, debouncedSearch, filter, typeFilter, fromDate, toDate, sortField, sortDir])

  const totalBookings = filteredBookings.length
  const totalPages    = Math.max(1, Math.ceil(totalBookings / pageSize))
  const paginatedBookings = filteredBookings.slice((page-1)*pageSize, page*pageSize)

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setBookings((prev: Booking[]) => prev.map((b: Booking) => b.id === id ? { ...b, status } : b))
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
      setBookings((prev: Booking[]) => prev.map((b: Booking) => b.id === confirmingId ? {
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
      {/* Search bar + controls row */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10 pr-8" placeholder="Search by client name, email, or phone..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          {search && <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>}
        </div>
        <select className="input w-28" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Quick stats bar */}
      <div className="flex gap-3 flex-wrap mb-4">
        {[
          { status: 'pending',   color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
          { status: 'confirmed', color: 'bg-green-100 text-green-700',   icon: '🟢' },
          { status: 'completed', color: 'bg-blue-100 text-blue-700',     icon: '✓' },
          { status: 'cancelled', color: 'bg-red-100 text-red-500',       icon: '✕' },
        ].map(({ status, color, icon }) => (
          <button key={status} onClick={() => { setFilter(status); setPage(1) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${color}`}>
            {icon} {status.charAt(0).toUpperCase() + status.slice(1)}: {bookings.filter((b: Booking) => b.status === status).length}
          </button>
        ))}
      </div>

      {/* Status filter pills (existing) */}
      <div className="flex gap-2 flex-wrap mb-3">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Additional filter row */}
      <div className="flex flex-wrap gap-3 mb-3">
        {/* Consultation type */}
        <select className="input h-8 text-xs w-44 text-gray-800" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="all">All Types</option>
          <option value="in-person">In-Person</option>
          <option value="facetime">FaceTime</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="google-meet">Google Meet</option>
          <option value="not-set">Not Set</option>
        </select>
        {/* Date range */}
        <input type="date" className="input h-8 text-xs w-36 text-gray-800" value={fromDate}
          onChange={e => { setFromDate(e.target.value); setPage(1) }} />
        <input type="date" className="input h-8 text-xs w-36 text-gray-800" value={toDate}
          onChange={e => { setToDate(e.target.value); setPage(1) }} />
        {/* Sort buttons */}
        <button onClick={() => {
          if (sortField === 'appointmentDate') setSortDir(d => d === 'asc' ? 'desc' : 'asc')
          else { setSortField('appointmentDate'); setSortDir('desc') }
          setPage(1)
        }} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${sortField === 'appointmentDate' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600'}`}>
          Date {sortField === 'appointmentDate' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
        </button>
        <button onClick={() => {
          if (sortField === 'clientName') setSortDir(d => d === 'asc' ? 'desc' : 'asc')
          else { setSortField('clientName'); setSortDir('asc') }
          setPage(1)
        }} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${sortField === 'clientName' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-600'}`}>
          Name {sortField === 'clientName' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </button>
        {/* Clear filters */}
        {(debouncedSearch || filter !== 'all' || typeFilter !== 'all' || fromDate || toDate) && (
          <button onClick={() => { setSearch(''); setDebouncedSearch(''); setFilter('all'); setTypeFilter('all'); setFromDate(''); setToDate(''); setPage(1) }}
            className="px-3 py-1 text-xs text-red-500 hover:text-red-700">Clear all</button>
        )}
      </div>

      {/* Results summary */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {Math.min((page-1)*pageSize+1, totalBookings)}–{Math.min(page*pageSize, totalBookings)} of {totalBookings} bookings
        {totalBookings !== bookings.length && ` (filtered from ${bookings.length})`}
      </p>

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
              {paginatedBookings.map((b: Booking) => (
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
          {paginatedBookings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No bookings found{filter !== 'all' ? ` with status "${filter}"` : ''}</p>
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i+1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc: (number|'...')[], n, i, arr) => {
                  if (i > 0 && n - (arr[i-1] as number) > 1) acc.push('...')
                  acc.push(n); return acc
                }, [])
                .map((n, i) => n === '...' ? <span key={`e${i}`} className="px-2 py-1 text-gray-400">…</span> :
                  <button key={n} onClick={() => setPage(n as number)}
                    className={`px-3 py-1 text-sm rounded-lg ${page === n ? 'bg-green-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                    {n}
                  </button>
                )}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        )}
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
