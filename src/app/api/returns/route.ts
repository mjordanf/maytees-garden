import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReturnNumber, isWithinReturnWindow, RETURN_REASONS } from '@/lib/returns'
import { sendReturnRequestReceived, sendReturnAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const body   = await req.json()
  const { storeOrderId, reason, reasonDetail, isDamageClaim, photoUrls } = body

  if (!storeOrderId || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const order = await prisma.storeOrder.findUnique({
    where: { id: storeOrderId },
    include: { returnRequest: true },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== userId && order.customerEmail !== session.user?.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'Order must be delivered before requesting a return' }, { status: 422 })
  }
  if (order.returnRequest) {
    return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 })
  }

  // Check window using createdAt as proxy (no deliveredAt field on StoreOrder)
  const deliveredAt = order.shippedAt ?? order.updatedAt
  const window = isWithinReturnWindow(deliveredAt, !!isDamageClaim)
  if (!window.eligible) {
    return NextResponse.json({ error: window.reason }, { status: 422 })
  }

  const returnNumber = await generateReturnNumber()
  const returnReq = await prisma.returnRequest.create({
    data: {
      returnNumber,
      storeOrderId,
      userId,
      reason,
      reasonDetail: reasonDetail ?? null,
      isDamageClaim: !!isDamageClaim,
      photoUrls: Array.isArray(photoUrls) ? photoUrls.join(',') : '',
      status: 'requested',
    },
  })

  await prisma.inboxMessage.create({
    data: {
      subject: `Return request — ${order.customerName} · ${returnNumber}`,
      body: `Order: ${order.orderNumber}\nReason: ${RETURN_REASONS[reason] ?? reason}${isDamageClaim ? '\n⚠️ DAMAGE CLAIM' : ''}`,
      type: 'return-request',
    },
  })

  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@mayteesgardencenter.com'
  sendReturnRequestReceived(order.customerEmail, {
    customerName: order.customerName,
    returnNumber,
    orderNumber: order.orderNumber,
    reason: RETURN_REASONS[reason] ?? reason,
    isDamageClaim: !!isDamageClaim,
  }).catch(() => {})

  sendReturnAlert(adminEmail, {
    returnNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    reason: RETURN_REASONS[reason] ?? reason,
    isDamageClaim: !!isDamageClaim,
    orderNumber: order.orderNumber,
    orderTotal: order.total,
  }).catch(() => {})

  return NextResponse.json({ returnRequest: returnReq }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role   = (session.user as any)?.role
  const userId = (session.user as any)?.id as string

  if (role === 'admin' || role === 'staff' || role === 'superadmin') {
    const returns = await prisma.returnRequest.findMany({
      include: {
        storeOrder: { include: { items: true } },
        user:       { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ returns })
  }

  const returns = await prisma.returnRequest.findMany({
    where: { userId },
    include: { storeOrder: { select: { orderNumber: true, total: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ returns })
}
