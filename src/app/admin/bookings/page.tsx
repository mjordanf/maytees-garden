export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/utils'
import AdminBookingsClient from './AdminBookingsClient'

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { service: true, user: true },
    orderBy: { appointmentDate: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">{bookings.length} total appointments</p>
      </div>
      <AdminBookingsClient bookings={bookings} />
    </div>
  )
}
