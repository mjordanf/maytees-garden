'use client'
import { useState } from 'react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Template = {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotMinutes: number
  isActive: boolean
  type: string
}

type Override = {
  id: string
  date: string | Date
  isBlocked: boolean
  startTime: string | null
  endTime: string | null
  reason: string | null
}

const DEFAULT_TEMPLATE = (dow: number): Template => ({
  dayOfWeek:   dow,
  startTime:   '09:00',
  endTime:     '17:00',
  slotMinutes: 60,
  isActive:    false,
  type:        'both',
})

export default function AdminAvailabilityClient({
  initialTemplates,
  initialOverrides,
}: {
  initialTemplates: Template[]
  initialOverrides: Override[]
}) {
  const [tab, setTab] = useState<'schedule' | 'blocked'>('schedule')

  // Build rows for all 7 days
  const buildRows = (): Template[] =>
    Array.from({ length: 7 }, (_, i) => {
      const found = initialTemplates.find(t => t.dayOfWeek === i)
      return found ?? DEFAULT_TEMPLATE(i)
    })

  const [rows, setRows]         = useState<Template[]>(buildRows)
  const [overrides, setOverrides] = useState<Override[]>(initialOverrides)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [blockDate, setBlockDate]   = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)

  const updateRow = (idx: number, key: keyof Template, value: string | number | boolean) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r))
  }

  const applyMonFri = () => {
    const monRow = rows[1] // Monday
    setRows(prev => prev.map((r, i) => {
      if (i >= 1 && i <= 5) {
        return { ...r, startTime: monRow.startTime, endTime: monRow.endTime, slotMinutes: monRow.slotMinutes, type: monRow.type, isActive: monRow.isActive }
      }
      return r
    }))
  }

  const saveSchedule = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/availability/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates: rows }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const blockDateFn = async () => {
    if (!blockDate) return
    setBlocking(true)
    const res = await fetch('/api/availability/overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: blockDate, isBlocked: true, reason: blockReason || null }),
    })
    if (res.ok) {
      const { override } = await res.json()
      setOverrides(prev => [...prev, override])
      setBlockDate('')
      setBlockReason('')
    }
    setBlocking(false)
  }

  const deleteOverride = async (id: string) => {
    await fetch(`/api/availability/overrides/${id}`, { method: 'DELETE' })
    setOverrides(prev => prev.filter(o => o.id !== id))
  }

  const formatOverrideDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['schedule', 'blocked'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'text-green-800 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'schedule' ? 'Weekly Schedule' : 'Blocked Dates'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Weekly Schedule */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Configure available hours for each day of the week.</p>
              <button
                type="button"
                onClick={applyMonFri}
                className="btn-secondary text-xs"
              >
                Apply Mon–Fri from Monday
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="text-left py-2 pr-4 w-28">Day</th>
                    <th className="text-left py-2 pr-4 w-20">Active</th>
                    <th className="text-left py-2 pr-4">Start</th>
                    <th className="text-left py-2 pr-4">End</th>
                    <th className="text-left py-2 pr-4">Slot</th>
                    <th className="text-left py-2">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row, idx) => (
                    <tr key={idx} className={row.isActive ? '' : 'opacity-50'}>
                      <td className="py-3 pr-4 font-medium text-gray-700">{DAY_NAMES[idx]}</td>
                      <td className="py-3 pr-4">
                        <input
                          type="checkbox"
                          checked={row.isActive}
                          onChange={e => updateRow(idx, 'isActive', e.target.checked)}
                          className="w-4 h-4 accent-green-600"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={e => updateRow(idx, 'startTime', e.target.value)}
                          disabled={!row.isActive}
                          className="input py-1.5 px-2 text-sm w-28"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={e => updateRow(idx, 'endTime', e.target.value)}
                          disabled={!row.isActive}
                          className="input py-1.5 px-2 text-sm w-28"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={row.slotMinutes}
                          onChange={e => updateRow(idx, 'slotMinutes', parseInt(e.target.value))}
                          disabled={!row.isActive}
                          className="input py-1.5 px-2 text-sm w-24"
                        >
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          value={row.type}
                          onChange={e => updateRow(idx, 'type', e.target.value)}
                          disabled={!row.isActive}
                          className="input py-1.5 px-2 text-sm w-32"
                        >
                          <option value="in-person">In-Person</option>
                          <option value="video">Video</option>
                          <option value="both">Both</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={saveSchedule}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Schedule'}
              </button>
              {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
            </div>
          </div>
        )}

        {/* Blocked Dates */}
        {tab === 'blocked' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm">Block a Date</h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="label text-xs">Date</label>
                  <input
                    type="date"
                    value={blockDate}
                    onChange={e => setBlockDate(e.target.value)}
                    className="input py-2 text-sm"
                  />
                </div>
                <div className="flex-1 min-w-48">
                  <label className="label text-xs">Reason (optional)</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="e.g. vacation, holiday"
                    className="input py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={blockDateFn}
                  disabled={!blockDate || blocking}
                  className="btn-primary text-sm py-2"
                >
                  {blocking ? 'Blocking...' : 'Block this date'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Blocked Dates</h3>
              {overrides.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No blocked dates yet.</p>
              ) : (
                <div className="space-y-2">
                  {overrides.map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{formatOverrideDate(o.date)}</span>
                        {o.reason && <span className="text-gray-400 text-sm ml-2">— {o.reason}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteOverride(o.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
