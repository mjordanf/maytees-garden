export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import SuperAdminUsersClient from './SuperAdminUsersClient'

export default async function SuperAdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  })
  return <SuperAdminUsersClient users={users} />
}
