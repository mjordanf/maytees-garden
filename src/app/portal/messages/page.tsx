export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PortalMessagesClient from './PortalMessagesClient'

export default async function PortalMessagesPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id

  const messages = await prisma.inboxMessage.findMany({
    where:   { fromUserId: userId, type: 'customer-message' },
    orderBy: { createdAt: 'desc' },
  })

  return <PortalMessagesClient messages={messages} />
}
