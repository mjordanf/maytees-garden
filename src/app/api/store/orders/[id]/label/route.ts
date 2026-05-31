import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { purchaseLabel } from '@/lib/shippo'
import { sendShippingConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

function isAdmin(role: string) {
  return role === 'admin' || role === 'staff' || role === 'superadmin'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !isAdmin(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { rateId } = await req.json()
  if (!rateId) return NextResponse.json({ error: 'rateId required' }, { status: 400 })

  const order = await prisma.storeOrder.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { labelUrl, trackingNumber } = await purchaseLabel(rateId)

  const updated = await prisma.storeOrder.update({
    where: { id: params.id },
    data: {
      shippoLabelUrl: labelUrl,
      trackingNumber,
      status: 'shipped',
      shippedAt: new Date(),
    },
  })

  sendShippingConfirmation({
    customerName: updated.customerName,
    customerEmail: updated.customerEmail,
    orderNumber: updated.orderNumber,
    carrier: updated.shippingCarrier ?? 'Carrier',
    trackingNumber,
  }).catch(console.error)

  return NextResponse.json({ labelUrl, trackingNumber, order: updated })
}
