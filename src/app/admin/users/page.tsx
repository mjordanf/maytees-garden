export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  const sessionRole = (session?.user as any)?.role ?? 'admin'

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    ['Name', 'Email', 'Phone', 'Role', 'Newsletter', 'Created'].join(',') + '\n' +
    users.map(u => [u.name ?? '', u.email, u.phone ?? '', u.role, u.newsletterOptIn, formatDate(u.createdAt)].join(',')).join('\n')
  )}`

  return <AdminUsersClient users={users} sessionRole={sessionRole} csvHref={csvHref} />
}
