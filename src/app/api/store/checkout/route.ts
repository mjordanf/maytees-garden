import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSquarePayment } from '@/lib/square'
import { sendOrderConfirmation, sendOrderAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id ?? null

    const {
      items, shippingInfo, selectedRate, sourceId,
      subtotal, tax, total,
    } = await req.json() as {
      items: { plantId: string; qty: number; unitPrice: number; plantName: string }[]
      shippingInfo: {
        fullName: string; email: string; phone?: string
        address1: string; address2?: string; city: string
        state: string; zip: string; country: string
      }
      selectedRate: { carrier: string; service: string; price: number; objectId: string } | null
      sourceId: string
      subtotal: number
      tax: number
      total: number
    }

    // 1. Atomic stock check
    const plantIds = items.map(i => i.plantId)
    const plants = await prisma.plant.findMany({
      where: { id: { in: plantIds } },
      select: { id: true, onlineStock: true, nameEn: true },
    })

    for (const item of items) {
      const plant = plants.find(p => p.id === item.plantId)
      if (!plant) return NextResponse.json({ error: `Plant not found: ${item.plantId}` }, { status: 400 })
      if (plant.onlineStock < item.qty) {
        return NextResponse.json({ error: `Insufficient stock for ${plant.nameEn}` }, { status: 409 })
      }
    }

    // 2. Generate order number
    const orderCount = await prisma.storeOrder.count()
    const year = new Date().getFullYear()
    const orderNumber = `MG-${year}-${String(orderCount + 1).padStart(4, '0')}`

    // 3. Create order as pending
    const order = await prisma.storeOrder.create({
      data: {
        orderNumber,
        userId,
        status: 'pending',
        customerName: shippingInfo.fullName,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone ?? null,
        shipAddress1: shippingInfo.address1,
        shipAddress2: shippingInfo.address2 ?? null,
        shipCity: shippingInfo.city,
        shipState: shippingInfo.state,
        shipZip: shippingInfo.zip,
        shipCountry: shippingInfo.country ?? 'US',
        shippingCarrier: selectedRate?.carrier ?? null,
        shippingService: selectedRate?.service ?? null,
        shippingCost: selectedRate?.price ?? 0,
        subtotal,
        tax,
        total,
        items: {
          create: items.map(i => ({
            plantId: i.plantId,
            plantName: i.plantName,
            qty: i.qty,
            unitPrice: i.unitPrice,
            total: i.unitPrice * i.qty,
          })),
        },
      },
    })

    // 4. Process Square payment
    const amountCents = Math.round(total * 100)
    const payment = await createSquarePayment({
      amountCents,
      sourceId,
      orderId: order.id,
      customerEmail: shippingInfo.email,
    })

    const squarePaymentId = payment?.id ? String(payment.id) : null

    // 5. On success: update order, decrement stock, create inbox message
    await prisma.$transaction([
      prisma.storeOrder.update({
        where: { id: order.id },
        data: {
          status: 'payment_confirmed',
          squarePaymentId,
        },
      }),
      ...items.map(item =>
        prisma.plant.update({
          where: { id: item.plantId },
          data: { onlineStock: { decrement: item.qty } },
        })
      ),
      prisma.inboxMessage.create({
        data: {
          subject: `New Order — ${orderNumber}`,
          body: `New store order ${orderNumber} from ${shippingInfo.fullName} (${shippingInfo.email}). Total: $${total.toFixed(2)}`,
          type: 'order-alert',
        },
      }),
    ])

    // 6. Send emails (non-blocking)
    const emailItems = items.map(i => ({ name: i.plantName, qty: i.qty, price: i.unitPrice }))
    const shipAddress = `${shippingInfo.address1}${shippingInfo.address2 ? ', ' + shippingInfo.address2 : ''}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`

    sendOrderConfirmation({
      customerName: shippingInfo.fullName,
      customerEmail: shippingInfo.email,
      orderNumber,
      items: emailItems,
      subtotal,
      shippingCost: selectedRate?.price ?? 0,
      tax,
      total,
      shipAddress,
    }).catch(console.error)

    sendOrderAlert({
      orderNumber,
      customerName: shippingInfo.fullName,
      customerEmail: shippingInfo.email,
      items: emailItems,
      total,
      channel: 'website',
    }).catch(console.error)

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch (err: any) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: err.message ?? 'Checkout failed' }, { status: 500 })
  }
}
