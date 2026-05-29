export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Users, Calendar, MessageSquare, Leaf, TrendingUp, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const [totalUsers, totalBookings, pendingBookings, totalPlants, leads, recentBookings] = await Promise.all([
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.plant.count(),
    prisma.contactSubmission.count({ where: { status: 'new' } }),
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { service: true } }),
  ])

  const stats = [
    { icon: Users,         label: 'Total Customers', value: totalUsers,      color: 'text-blue-600',  bg: 'bg-blue-50'   },
    { icon: Calendar,      label: 'Total Bookings',  value: totalBookings,   color: 'text-green-600', bg: 'bg-green-50'  },
    { icon: Clock,         label: 'Pending',         value: pendingBookings, color: 'text-yellow-600',bg: 'bg-yellow-50' },
    { icon: MessageSquare, label: 'New Leads',       value: leads,           color: 'text-terra-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Maytee's Garden Center — Admin Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-serif text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-serif text-xl font-bold text-gray-800">Recent Bookings</h2>
            <a href="/admin/bookings" className="text-sm text-green-600 hover:underline">View all</a>
          </div>

          <div className="space-y-3">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.clientName}</p>
                  <p className="text-gray-400 text-xs">{b.service?.nameEn ?? 'Consultation'} · {formatDate(b.appointmentDate)}</p>
                </div>
                <span className={`badge text-xs shrink-0 ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                  b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-600'}`}>
                  {b.status}
                </span>
              </div>
            ))}
            {recentBookings.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-xl font-bold text-gray-800 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/bookings', icon: Calendar,      label: 'Manage Bookings',  color: 'bg-green-50 text-green-700 border-green-200'   },
              { href: '/admin/plants',   icon: Leaf,          label: 'Edit Plant Catalog',color: 'bg-teal-50 text-teal-700 border-teal-200'     },
              { href: '/admin/users',    icon: Users,         label: 'View Customers',   color: 'bg-blue-50 text-blue-700 border-blue-200'      },
              { href: '/admin/leads',    icon: MessageSquare, label: 'View Leads',       color: 'bg-orange-50 text-orange-700 border-orange-200'},
            ].map(({ href, icon: Icon, label, color }) => (
              <a key={href} href={href} className={`border rounded-xl p-4 text-center hover:shadow-md transition-shadow ${color}`}>
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-semibold">{label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
