import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PortalSettingsClient from './PortalSettingsClient'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  const user    = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-green-800">Account Settings</h1>
      <PortalSettingsClient user={user} />
    </div>
  )
}
