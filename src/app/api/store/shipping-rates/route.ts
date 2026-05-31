import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRates, type ShippoAddress } from '@/lib/shippo'

const FLAT_RATE_FALLBACK = [{
  objectId:  'flat-rate',
  carrier:   'Standard',
  service:   'Shipping',
  price:     12.99,
  days:      null,
  currency:  'USD',
}]

export async function POST(req: NextRequest) {
  try {
    const { toAddress, items } = await req.json() as {
      toAddress: ShippoAddress
      items: { plantId: string; qty: number }[]
    }

    // Fetch plants to get weight
    const plantIds = items.map((i) => i.plantId)
    const plants = await prisma.plant.findMany({
      where: { id: { in: plantIds } },
      select: { id: true, weight: true },
    })

    // Calculate total weight — default 16 oz (1 lb) per plant if weight not set
    const totalWeight = items.reduce((sum, item) => {
      const plant = plants.find((p) => p.id === item.plantId)
      const weightPerUnit = plant?.weight ?? 16
      return sum + weightPerUnit * item.qty
    }, 0)

    const parcel = { weight: totalWeight, length: 12, width: 12, height: 12 }

    let rates = await getRates(toAddress, parcel)

    // Fall back to flat rate if Shippo returns nothing or isn't configured
    if (!rates || rates.length === 0) {
      console.warn('[shipping-rates] No rates from Shippo — using flat rate fallback')
      rates = FLAT_RATE_FALLBACK
    }

    // Sort cheapest first
    rates.sort((a, b) => a.price - b.price)

    return NextResponse.json({ rates })
  } catch (err) {
    console.error('[shipping-rates]', err)
    return NextResponse.json({ rates: FLAT_RATE_FALLBACK })
  }
}
