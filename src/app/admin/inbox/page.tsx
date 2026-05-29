export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import AdminInboxClient from './AdminInboxClient'

export default async function AdminInboxPage() {
  const messages = await prisma.inboxMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      fromUser: { select: { name: true, email: true } },
      booking:  { select: { id: true, clientName: true } },
    },
  })

  return <AdminInboxClient messages={messages} />
}
