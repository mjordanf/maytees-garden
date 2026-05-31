import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { refundSquarePayment } from '@/lib/square'

export const dynamic = 'force-dynamic'

function isAdmin(role: string) {
  return role === 'admin' || role === 'staff' || role === 'superadmin'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !isAdmin(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const order = await prisma.storeOrder.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!order.squarePaymentId) return NextResponse.json({ error: 'No Square payment ID' }, { status: 400 })

  const amountCents = Math.round(order.total * 100)
  const refund = await refundSquarePayment(order.squarePaymentId, amountCents)

  const updated = await prisma.storeOrder.update({
    where: { id: params.id },
    data: { status: 'refunded' },
  })

  // Serialize BigInt values before returning
  const refundId = refund?.id ? String(refund.id) : null

  return NextResponse.json({ refundId, order: updated })
}
