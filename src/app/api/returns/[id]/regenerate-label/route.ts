import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReturnLabel } from '@/lib/shippo'

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
  if (!['approved', 'label_sent'].includes(ret.status)) {
    return NextResponse.json({ error: 'Return must be approved before generating a label' }, { status: 422 })
  }

  const label = await createReturnLabel({
    customerName: ret.storeOrder.customerName,
    customerAddress: {
      street1: ret.storeOrder.shipAddress1,
      city:    ret.storeOrder.shipCity,
      state:   ret.storeOrder.shipState,
      zip:     ret.storeOrder.shipZip,
    },
  })

  await prisma.returnRequest.update({
    where: { id: params.id },
    data:  {
      shippoLabelUrl: label.labelUrl,
      returnTracking: label.trackingNumber,
      labelSentAt:    new Date(),
      status:         'label_sent',
    },
  })

  return NextResponse.json({ labelUrl: label.labelUrl, trackingNumber: label.trackingNumber })
}
