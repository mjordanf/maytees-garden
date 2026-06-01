export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import AdminAvailabilityClient from './AdminAvailabilityClient'

export default async function AdminAvailabilityPage() {
  const [templates, overrides] = await Promise.all([
    prisma.availabilityTemplate.findMany({ orderBy: { dayOfWeek: 'asc' } }),
    prisma.availabilityOverride.findMany({ orderBy: { date: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-green-800">Availability Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage weekly schedule and blocked dates</p>
      </div>
      <AdminAvailabilityClient
        initialTemplates={templates}
        initialOverrides={overrides}
      />
    </div>
  )
}
