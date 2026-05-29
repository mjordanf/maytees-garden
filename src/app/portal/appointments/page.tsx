import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Video } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import MessageMayteeButton from './MessageMayteeButton'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

const PREF_LABELS: Record<string, string> = {
  'in-person':   '🏡 In-Person Visit',
  'facetime':    '📱 FaceTime',
  'whatsapp':    '💬 WhatsApp Video',
  'google-meet': '🎥 Google Meet',
}

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { service: true },
    orderBy: { appointmentDate: 'desc' },
  })

  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.appointmentDate) >= now)
  const past      = bookings.filter(b => new Date(b.appointmentDate) < now)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-green-800">My Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">{bookings.length} total appointment{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm text-center">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-gray-400 mb-2">No appointments yet</h2>
          <p className="text-gray-400 text-sm mb-6">Ready to transform your garden? Book your first consultation with Maytee.</p>
          <Link href="/booking" className="btn-primary">Book a Consultation</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-bold text-green-800 mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm flex gap-5 items-start">
                    <div className="w-14 h-14 bg-green-600 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-xs">{new Date(b.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="font-bold text-xl leading-none">{new Date(b.appointmentDate).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-green-800">{b.service?.nameEn ?? 'Garden Consultation'}</h3>
                        <span className={`badge text-xs shrink-0 ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(b.appointmentDate)}</span>
                        {(!b.consultationType || b.consultationType === 'in-person') && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />15196 SW 184th St, Miami</span>
                        )}
                      </div>

                      {/* Preference / confirmed type */}
                      {b.customerPreference && !b.consultationType && (
                        <p className="text-xs text-gray-500 mt-2">
                          Your preference: {PREF_LABELS[b.customerPreference] ?? b.customerPreference}
                        </p>
                      )}
                      {b.consultationType && (
                        <p className="text-xs text-green-700 font-medium mt-2">
                          Confirmed: {PREF_LABELS[b.consultationType] ?? b.consultationType}
                        </p>
                      )}

                      {/* Join link */}
                      {b.videoCallLink && (
                        <a
                          href={b.videoCallLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Video className="w-3 h-3" />
                          Join Meeting
                        </a>
                      )}

                      {b.notes && <p className="text-xs text-gray-400 italic mt-2 truncate">"{b.notes}"</p>}

                      <div className="mt-3">
                        <MessageMayteeButton bookingId={b.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-400 mb-4">Past Appointments</h2>
              <div className="space-y-3">
                {past.map(b => (
                  <div key={b.id} className="bg-white/60 rounded-xl p-4 flex gap-4 items-center border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-gray-400">{new Date(b.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="font-bold text-gray-600 text-sm leading-none">{new Date(b.appointmentDate).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600">{b.service?.nameEn ?? 'Consultation'}</p>
                      <p className="text-xs text-gray-400">{formatDate(b.appointmentDate)}</p>
                    </div>
                    <span className={`badge text-xs ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <Link href="/booking" className="text-sm text-green-700 hover:underline">
              Book another consultation →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
