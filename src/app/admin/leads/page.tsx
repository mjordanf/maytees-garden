export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import AdminLeadsClient from './AdminLeadsClient'

export default async function AdminLeadsPage() {
  const [submissions, subscribers, confirmedCount] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.newsletterSubscriber.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } }),
    prisma.newsletterSubscriber.count({ where: { active: true, confirmed: true } }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-gray-800">Leads & Marketing</h1>
      <AdminLeadsClient submissions={submissions} subscribers={subscribers} confirmedCount={confirmedCount} />
    </div>
  )
}
