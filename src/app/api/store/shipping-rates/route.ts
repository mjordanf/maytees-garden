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

    // Fetch plants to get weight and box dimensions
    const plantIds = items.map((i) => i.plantId)
    const plants = await prisma.plant.findMany({
      where: { id: { in: plantIds } },
      select: { id: true, weight: true, boxLength: true, boxWidth: true, boxHeight: true },
    })

    // Find max box dimensions across all cart items
    let maxLength = 12, maxWidth = 10, maxHeight = 8, totalWeight = 0

    for (const item of items) {
      const plant = plants.find(p => p.id === item.plantId)
      const weightPerUnit = plant?.weight ?? 32  // default 2 lbs = 32 oz
      totalWeight += weightPerUnit * item.qty

      if (plant?.boxLength && plant?.boxWidth && plant?.boxHeight) {
        maxLength = Math.max(maxLength, plant.boxLength)
        maxWidth  = Math.max(maxWidth,  plant.boxWidth)
        maxHeight = Math.max(maxHeight, plant.boxHeight)
      }
    }

    const parcel = {
      length: String(maxLength),
      width:  String(maxWidth),
      height: String(maxHeight),
      weight: String(totalWeight / 16), // convert oz to lbs for Shippo
    }

    let rates = await getRates(toAddress, parcel)

    // Fall back to flat rate if Shippo returns nothing or isn't configured
    if (!rates || rates.length === 0) {
      console.warn('[shipping-rates] No rates from Shippo — using flat rate fallback')
      rates = FLAT_RATE_FALLBACK
    }

    // Sort cheapest first
    rates.sort((a, b) => a.price - b.price)

    return NextResponse.json({ rates, parcel: { length: maxLength, width: maxWidth, height: maxHeight, weightOz: totalWeight } })
  } catch (err) {
    console.error('[shipping-rates]', err)
    return NextResponse.json({ rates: FLAT_RATE_FALLBACK })
  }
}
