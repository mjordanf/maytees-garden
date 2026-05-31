import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendShippingConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

function isAdmin(role: string) {
  return role === 'admin' || role === 'staff' || role === 'superadmin'
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !isAdmin(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const data = await req.json()
  const prevOrder = await prisma.storeOrder.findUnique({ where: { id: params.id } })
  if (!prevOrder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.storeOrder.update({
    where: { id: params.id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
      ...(data.shippoLabelUrl !== undefined && { shippoLabelUrl: data.shippoLabelUrl }),
      ...(data.shippedAt !== undefined && { shippedAt: data.shippedAt ? new Date(data.shippedAt) : null }),
    },
    include: { items: true },
  })

  // Send shipping email when status → "shipped"
  if (data.status === 'shipped' && prevOrder.status !== 'shipped' && updated.trackingNumber) {
    sendShippingConfirmation({
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      orderNumber: updated.orderNumber,
      carrier: updated.shippingCarrier ?? 'Carrier',
      trackingNumber: updated.trackingNumber,
    }).catch(console.error)
  }

  return NextResponse.json({ order: updated })
}
