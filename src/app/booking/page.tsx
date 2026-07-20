'use client'
import { useState, useEffect, useCallback } from 'react'
import { redirect } from 'next/navigation'
import { Calendar, Clock, User, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { FLAGS } from '@/lib/phase-flags'

type Service = { id: string; label: string }
type Slot    = { start: string; end: string; type: string }

function padTo2(n: number) { return n.toString().padStart(2, '0') }

function formatSlot12(time: string) {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${padTo2(m)} ${period}`
}

function toMonthKey(year: number, month: number) {
  return `${year}-${padTo2(month + 1)}`
}

export default function BookingPage() {
  if (!FLAGS.SHOW_BOOKING) redirect('/contact')

  const { data: session } = useSession()
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [availableDates, setAvailableDates] = useState<Record<string, Slot[]>>({})
  const [loadingSlots, setLoadingSlots]     = useState(false)
  const [selectedSlot, setSelectedSlot]     = useState<{ date: string; start: string; end: string; type: string } | null>(null)

  const [serviceId, setServiceId] = useState('')
  const [services, setServices]   = useState<Service[]>([])
  const [name, setName]   = useState(session?.user?.name ?? '')
  const [email, setEmail] = useState(session?.user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [zip, setZip]     = useState('')
  const [notes, setNotes] = useState('')
  const [meetingPreference, setMeetingPreference] = useState('in-person')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(({ services: raw }) => {
        setServices(raw.map((s: { id: string; nameEn: string; priceNote: string | null; price: number | null }) => ({
          id: s.id,
          label: `${s.nameEn}${s.priceNote ? ` — ${s.priceNote}` : s.price ? ` — $${s.price}` : ''}`,
        })))
      })
  }, [])

  const fetchSlots = useCallback((y: number, m: number) => {
    setLoadingSlots(true)
    setSelectedSlot(null)
    fetch(`/api/availability/slots?month=${toMonthKey(y, m)}`)
      .then(r => r.json())
      .then(({ dates }) => setAvailableDates(dates ?? {}))
      .catch(() => setAvailableDates({}))
      .finally(() => setLoadingSlots(false))
  }, [])

  useEffect(() => {
    fetchSlots(year, month)
  }, [year, month, fetchSlots])

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  const getDateKey = (d: number) => `${year}-${padTo2(month + 1)}-${padTo2(d)}`
  const isAvailable = (d: number) => !!availableDates[getDateKey(d)]
  const isSelected  = (d: number) => selectedSlot?.date === getDateKey(d)

  const selectDate = (d: number) => {
    const key = getDateKey(d)
    if (availableDates[key]) {
      setSelectedSlot(prev => (prev?.date === key && !prev.start) ? null : { date: key, start: '', end: '', type: 'both' })
    }
  }

  const selectSlot = (slot: Slot) => {
    const dateKey = selectedSlot?.date ?? ''
    setSelectedSlot({ date: dateKey, start: slot.start, end: slot.end, type: slot.type })
    // Auto-set default meeting preference based on slot type
    if (slot.type === 'in-person') setMeetingPreference('in-person')
    else if (slot.type === 'video') setMeetingPreference('facetime')
    // 'both' keeps current preference
  }

  const selectedDateSlots = selectedSlot?.date ? (availableDates[selectedSlot.date] ?? []) : []
  const canContinue = !!(selectedSlot?.date && selectedSlot?.start)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canContinue || !serviceId) { setError('Please select a service, date, and time.'); return }
    setLoading(true); setError('')

    const [y, mo, d] = selectedSlot!.date.split('-').map(Number)
    const [h, min]   = selectedSlot!.start.split(':').map(Number)
    const appointmentDate = new Date(y, mo - 1, d, h, min)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId, appointmentDate, clientName: name, clientEmail: email,
        clientPhone: phone, zipCode: zip, notes, meetingPreference,
        slotDate:  selectedSlot!.date,
        slotStart: selectedSlot!.start,
        slotEnd:   selectedSlot!.end,
      }),
    })

    setLoading(false)
    if (res.ok) setSuccess(true)
    else setError('Something went wrong. Please try again or call us directly.')
  }

  if (success) {
    return (
      <div className="pt-20 min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-green-800 mb-3">You're Booked!</h1>
          <p className="text-gray-600 mb-2">Your consultation is confirmed. Check your email for details.</p>
          <p className="text-sm text-gray-400">We'll send a reminder 24 hours before your appointment.</p>
          <a href="/" className="btn-primary mt-8 inline-flex">Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center py-12">
          <h1 className="section-title text-4xl">Book a Consultation</h1>
          <p className="section-subtitle">Schedule your personalized session with Maytee</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left column */}
          <div className="space-y-6">

            {/* Step 1: Service Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Select Service
              </h2>
              <div className="space-y-2">
                {services.map(s => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      serviceId === s.id ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'
                    }`}
                  >
                    <input type="radio" name="service" value={s.id} checked={serviceId === s.id} onChange={() => setServiceId(s.id)} className="text-green-600" />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Choose a Date
              </h2>

              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">‹</button>
                <span className="font-semibold text-gray-800">{monthNames[month]} {year}</span>
                <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-xs text-gray-400 font-semibold py-1">{d}</div>
                ))}
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-gray-400 text-sm">Loading availability...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d        = i + 1
                    const avail    = isAvailable(d)
                    const selected = isSelected(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={!avail}
                        onClick={() => selectDate(d)}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          !avail    ? 'text-gray-200 cursor-not-allowed' :
                          selected  ? 'bg-green-600 text-white' :
                                      'hover:bg-green-50 text-gray-700 ring-1 ring-green-200'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              )}

              {Object.keys(availableDates).length === 0 && !loadingSlots && (
                <p className="text-center text-sm text-gray-400 mt-3">No available dates this month.</p>
              )}
              {selectedSlot?.date && (
                <p className="text-center text-sm text-green-700 font-medium mt-3">
                  Selected: {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Step 2b: Time Slots */}
            {selectedSlot?.date && selectedDateSlots.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Choose a Time
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDateSlots.map(slot => (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => selectSlot(slot)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                        selectedSlot.start === slot.start
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-200 text-gray-600 hover:border-green-400'
                      }`}
                    >
                      {formatSlot12(slot.start)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Meeting Preference */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4">How would you prefer to meet?</h2>
              <div className="space-y-2">
                {[
                  { value: 'in-person',   label: '🏡 In-Person Visit',  showFor: ['in-person', 'both'] },
                  { value: 'facetime',    label: '📱 FaceTime',          showFor: ['video', 'both'] },
                  { value: 'whatsapp',    label: '💬 WhatsApp Video',    showFor: ['video', 'both'] },
                  { value: 'google-meet', label: '🎥 Google Meet',       showFor: ['video', 'both'] },
                ].filter(opt => {
                  const slotType = selectedSlot?.type ?? 'both'
                  return opt.showFor.includes(slotType)
                }).map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      meetingPreference === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meetingPreference"
                      value={opt.value}
                      checked={meetingPreference === opt.value}
                      onChange={() => setMeetingPreference(opt.value)}
                      className="text-green-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
                {(selectedSlot?.type ?? 'both') !== 'in-person' && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 opacity-50 cursor-not-allowed">
                    <input type="radio" disabled className="text-gray-300" />
                    <span className="text-sm text-gray-400">Microsoft Teams — coming soon</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Contact Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="font-serif text-xl font-bold text-green-800 mb-6">Your Information</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Maria Santos" />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="maria@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0000" />
                </div>
                <div>
                  <label className="label">Zip Code</label>
                  <input className="input" value={zip} onChange={e => setZip(e.target.value)} placeholder="33187" />
                </div>
              </div>
              <div>
                <label className="label">Notes or Special Requests</label>
                <textarea className="input resize-none h-28" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tell us about your garden, your goals, any specific plants you love..." />
              </div>

              {!canContinue && (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3">
                  Please select a date and time above before submitting.
                </p>
              )}

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</p>}

              <button
                type="submit"
                disabled={loading || !canContinue}
                className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : '✦ Confirm Booking'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By booking, you agree to our cancellation policy. We'll confirm within 24 hours.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
