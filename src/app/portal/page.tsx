import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Heart, ShoppingBag, ArrowRight, Star } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function PortalPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const [bookings, favorites, orders] = await Promise.all([
    prisma.booking.findMany({ where: { userId }, orderBy: { appointmentDate: 'desc' }, take: 3, include: { service: true } }),
    prisma.favorite.findMany({ where: { userId }, include: { plant: true }, take: 4 }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ])

  const upcoming = bookings.filter(b => new Date(b.appointmentDate) > new Date())

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
        <h1 className="font-serif text-2xl font-bold mb-1">Welcome back, {session?.user?.name?.split(' ')[0]}! 🌿</h1>
        <p className="text-green-200 text-sm">Your garden journey continues here.</p>
        <div className="mt-4 flex gap-3 flex-wrap">
          <Link href="/booking" className="bg-white text-green-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-green-50 transition-colors">
            Book a Consultation
          </Link>
          <Link href="/plants" className="border border-white/40 text-white text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
            Browse Plants
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: 'Upcoming',    value: upcoming.length,   href: '/portal/appointments' },
          { icon: Heart,    label: 'Saved Plants', value: favorites.length,  href: '/portal/favorites'    },
          { icon: ShoppingBag, label: 'Orders',   value: orders.length,     href: '/portal/orders'       },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-center group">
            <Icon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-serif text-2xl font-bold text-green-800">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </Link>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-bold text-green-800">Upcoming Appointments</h2>
          <Link href="/portal/appointments" className="text-sm text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming appointments</p>
            <Link href="/booking" className="text-green-600 text-sm hover:underline mt-1 block">Book a consultation →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => (
              <div key={b.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                  <span className="text-xs">{new Date(b.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                  <span className="font-bold text-lg leading-none">{new Date(b.appointmentDate).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-800 text-sm truncate">{b.service?.nameEn ?? 'Consultation'}</p>
                  <p className="text-gray-400 text-xs">{formatDate(b.appointmentDate)}</p>
                </div>
                <span className={`badge text-xs ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Plants */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-green-800">Saved Plants</h2>
            <Link href="/portal/favorites" className="text-sm text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {favorites.map(f => (
              <div key={f.id} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-semibold text-green-800 text-xs leading-tight">{f.plant.nameEn}</p>
                <p className="text-terra-500 font-bold text-sm mt-1">{formatCurrency(f.plant.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-terra-50 to-orange-50 border border-terra-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-terra-500" />
          <h2 className="font-serif text-lg font-bold text-terra-600">Maytee Recommends</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Based on Miami's current season, now is the perfect time to plant <strong>Bougainvillea</strong> and <strong>Ixora</strong> — they'll establish roots before the summer heat and reward you with blooms all year long.
        </p>
        <Link href="/plants" className="inline-flex items-center gap-1 text-terra-500 font-semibold text-sm mt-3 hover:underline">
          Browse this month's picks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
