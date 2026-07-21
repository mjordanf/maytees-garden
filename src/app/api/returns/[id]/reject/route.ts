import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendReturnRejected } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { rejectionReason, adminNotes } = await req.json()
  if (!rejectionReason) return NextResponse.json({ error: 'rejectionReason required' }, { status: 400 })

  const ret = await prisma.returnRequest.findUnique({
    where: { id: params.id },
    include: { storeOrder: true },
  })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.returnRequest.update({
    where: { id: params.id },
    data:  { status: 'rejected', rejectionReason, adminNotes: adminNotes ?? null },
  })

  await prisma.auditLog.create({
    data: {
      userId:   (session.user as any)?.id,
      action:   'return.rejected',
      entity:   'ReturnRequest',
      entityId: params.id,
      details:  rejectionReason,
    },
  })

  sendReturnRejected(ret.storeOrder.customerEmail, {
    customerName:    ret.storeOrder.customerName,
    returnNumber:    ret.returnNumber,
    rejectionReason,
    adminNotes,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
