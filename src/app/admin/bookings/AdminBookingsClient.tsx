'use client'
import { useState } from 'react'
import { formatDate, formatTime } from '@/lib/utils'

type Booking = any

const STATUSES = ['pending','confirmed','completed','cancelled']
const STATUS_COLORS: Record<string,string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-500',
}

export default function AdminBookingsClient({ bookings: initial }: { bookings: Booking[] }) {
  const [bookings, setBookings] = useState(initial)
  const [filter, setFilter]     = useState('all')

  const filtered = filter === 'all' ? bookings : bookings.filter((b: Booking) => b.status === filter)

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setBookings((prev: Booking[]) => prev.map(b => b.id === id ? { ...b, status } : b))
  }

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
                {['Client','Service','Date & Time','Contact','Status','Actions'].map(h => (
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
                    <p className="text-gray-700">{b.clientEmail}</p>
                    {b.clientPhone && <p className="text-gray-400 text-xs">{b.clientPhone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 bg-white"
                    >
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
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
    </>
  )
}
