import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendReturnReceived } from '@/lib/email'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const ret = await prisma.returnRequest.findUnique({
    where: { id: params.id },
    include: { storeOrder: true },
  })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.returnRequest.update({
    where: { id: params.id },
    data:  { status: 'received' },
  })

  sendReturnReceived(ret.storeOrder.customerEmail, {
    customerName:  ret.storeOrder.customerName,
    returnNumber:  ret.returnNumber,
    refundAmount:  ret.refundAmount ?? ret.storeOrder.total,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
