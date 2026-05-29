import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  const isStaff = ['staff', 'admin', 'superadmin'].includes(role)
  if (!session || !isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const message = await prisma.inboxMessage.update({
    where: { id: params.id },
    data: { read: true },
  })

  return NextResponse.json({ message })
}
