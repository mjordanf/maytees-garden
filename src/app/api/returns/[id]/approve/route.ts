import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { refundSquarePayment } from '@/lib/square'
import { createReturnLabel } from '@/lib/shippo'
import { sendReturnApproved } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { refundType, refundAmount, adminNotes } = await req.json()
  if (!refundType) return NextResponse.json({ error: 'refundType required' }, { status: 400 })

  const ret = await prisma.returnRequest.findUnique({
    where: { id: params.id },
    include: { storeOrder: { include: { items: true } }, user: true },
  })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (ret.status !== 'requested' && ret.status !== 'under_review') {
    return NextResponse.json({ error: 'Return is not in a reviewable state' }, { status: 422 })
  }

  await prisma.returnRequest.update({ where: { id: params.id }, data: { status: 'under_review' } })

  // Step 1: Issue Square refund
  const amountToRefund = refundType === 'full' ? ret.storeOrder.total : (refundAmount ?? 0)
  const amountCents    = Math.round(amountToRefund * 100)
  let squareRefundId: string | undefined

  if (ret.storeOrder.squarePaymentId) {
    try {
      const refund = await refundSquarePayment(ret.storeOrder.squarePaymentId, amountCents)
      squareRefundId = (refund as any)?.id
    } catch (err: any) {
      await prisma.returnRequest.update({ where: { id: params.id }, data: { status: 'requested' } })
      return NextResponse.json({ error: `Square refund failed: ${err.message}` }, { status: 422 })
    }
  }

  // Step 2: Generate Shippo return label
  let labelUrl: string | null = null
  let returnTracking: string | null = null

  try {
    const label = await createReturnLabel({
      customerName: ret.storeOrder.customerName,
      customerAddress: {
        street1: ret.storeOrder.shipAddress1,
        city:    ret.storeOrder.shipCity,
        state:   ret.storeOrder.shipState,
        zip:     ret.storeOrder.shipZip,
      },
    })
    labelUrl       = label.labelUrl
    returnTracking = label.trackingNumber
  } catch (err) {
    console.error('[returns] Shippo label failed:', err)
    // Non-fatal — continue without label
  }

  const now = new Date()
  await prisma.returnRequest.update({
    where: { id: params.id },
    data: {
      status:        'label_sent',
      refundType,
      refundAmount:  amountToRefund,
      adminNotes:    adminNotes ?? null,
      squareRefundId: squareRefundId ?? null,
      refundedAt:    now,
      shippoLabelUrl: labelUrl,
      returnTracking,
      labelSentAt:   labelUrl ? now : null,
    },
  })

  await prisma.storeOrder.update({
    where: { id: ret.storeOrderId },
    data:  { status: 'return_in_progress' },
  })

  await prisma.auditLog.create({
    data: {
      userId:   (session.user as any)?.id,
      action:   'return.approved',
      entity:   'ReturnRequest',
      entityId: params.id,
      details:  `Refund $${amountToRefund.toFixed(2)} via Square. Label: ${labelUrl ? 'generated' : 'failed'}`,
    },
  })

  sendReturnApproved(ret.storeOrder.customerEmail, {
    customerName:  ret.storeOrder.customerName,
    returnNumber:  ret.returnNumber,
    refundAmount:  amountToRefund,
    labelUrl,
    trackingNumber: returnTracking,
    isDamageClaim: ret.isDamageClaim,
  }).catch(() => {})

  return NextResponse.json({ success: true, labelUrl, returnTracking, refundAmount: amountToRefund })
}
