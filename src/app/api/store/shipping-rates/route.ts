import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRates, type ShippoAddress } from '@/lib/shippo'

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

    // Calculate total weight (default 16oz per plant if null)
    const totalWeight = items.reduce((sum, item) => {
      const plant = plants.find((p) => p.id === item.plantId)
      const weightPerUnit = plant?.weight ?? 16
      return sum + weightPerUnit * item.qty
    }, 0)

    const parcel = { weight: totalWeight, length: 12, width: 12, height: 12 }
    const rates = await getRates(toAddress, parcel)

    return NextResponse.json({ rates })
  } catch (err) {
    console.error('[shipping-rates]', err)
    return NextResponse.json({ rates: [] })
  }
}
