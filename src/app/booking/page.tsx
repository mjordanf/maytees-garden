'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM']

type Service = { id: string; label: string }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function BookingPage() {
  const { data: session } = useSession()
  const today = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [day, setDay]       = useState<number | null>(null)
  const [time, setTime]     = useState('')
  const [serviceId, setServiceId] = useState('')
  const [services, setServices]   = useState<Service[]>([])
  const [name, setName]     = useState(session?.user?.name ?? '')
  const [email, setEmail]   = useState(session?.user?.email ?? '')
  const [phone, setPhone]   = useState('')
  const [zip, setZip]       = useState('')
  const [notes, setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

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

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDayOfMonth(year, month)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1); setDay(null) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1); setDay(null) }

  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isSunday = (d: number) => new Date(year, month, d).getDay() === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!day || !time || !serviceId) { setError('Please select a service, date, and time.'); return }
    setLoading(true); setError('')

    const appointmentDate = new Date(year, month, day)
    const [h, period] = time.split(' ')
    const [hr, min]   = h.split(':').map(Number)
    appointmentDate.setHours(period === 'PM' && hr !== 12 ? hr+12 : hr === 12 && period === 'AM' ? 0 : hr, min)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, appointmentDate, clientName: name, clientEmail: email, clientPhone: phone, zipCode: zip, notes }),
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

          {/* Left — Calendar */}
          <div className="space-y-6">
            {/* Service Select */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Select Service</h2>
              <div className="space-y-2">
                {services.map(s => (
                  <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${serviceId === s.id ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                    <input type="radio" name="service" value={s.id} checked={serviceId === s.id} onChange={() => setServiceId(s.id)} className="text-green-600" />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Choose a Date</h2>

              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">‹</button>
                <span className="font-semibold text-gray-800">{monthNames[month]} {year}</span>
                <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-xs text-gray-400 font-semibold py-1">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1
                  const disabled = isPast(d) || isSunday(d)
                  const selected = day === d
                  return (
                    <button
                      key={d} type="button"
                      disabled={disabled}
                      onClick={() => setDay(d)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all
                        ${disabled ? 'text-gray-200 cursor-not-allowed' : selected ? 'bg-green-600 text-white' : 'hover:bg-green-50 text-gray-700'}`}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
              {day && <p className="text-center text-sm text-green-700 font-medium mt-3">Selected: {monthNames[month]} {day}, {year}</p>}
            </div>

            {/* Time Slots */}
            {day && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Choose a Time</h2>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot} type="button"
                      onClick={() => setTime(slot)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${time === slot ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-400'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
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
