import { Shippo } from 'shippo'

const shippoClient = process.env.SHIPPO_API_KEY
  ? new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY })
  : null

if (!process.env.SHIPPO_API_KEY) console.warn('[shippo] SHIPPO_API_KEY not set — shipping rates will not work')

export const FROM_ADDRESS = {
  name:    "Maytee's Garden Center",
  street1: '15196 SW 184th St',
  city:    'Miami',
  state:   'FL',
  zip:     '33187',
  country: 'US',
  phone:   process.env.BUSINESS_PHONE ?? '7862276616',
  email:   process.env.ADMIN_EMAIL ?? 'info@mayteesgardencenter.com',
}

export type ShippoAddress = {
  name: string; street1: string; city: string
  state: string; zip: string; country: string; phone?: string; email?: string
}
export type ShippoParcel = { weight: number; length: number; width: number; height: number }

export async function getRates(toAddress: ShippoAddress, parcel: ShippoParcel): Promise<{
  objectId: string; carrier: string; service: string; price: number; days: number | null; currency: string
}[]> {
  if (!shippoClient) return []
  try {
    const shipment = await shippoClient.shipments.create({
      addressFrom: FROM_ADDRESS as any,
      addressTo:   toAddress as any,
      parcels:     [{ weight: String(parcel.weight), massUnit: 'oz' as any, length: String(parcel.length), width: String(parcel.width), height: String(parcel.height), distanceUnit: 'in' as any }],
      async:       false,
    })
    const rates = (shipment as any).rates ?? []
    return rates.map((r: any) => ({
      objectId: r.objectId ?? r.object_id ?? '',
      carrier:  r.provider ?? '',
      service:  r.servicelevel?.name ?? r.serviceLevel?.name ?? '',
      price:    parseFloat(r.amount ?? '0'),
      days:     r.estimatedDays ?? r.estimated_days ?? null,
      currency: r.currency ?? 'USD',
    }))
  } catch (err) {
    console.error('[shippo] getRates error:', err)
    return []
  }
}

export async function purchaseLabel(rateId: string): Promise<{ labelUrl: string; trackingNumber: string }> {
  if (!shippoClient) throw new Error('Shippo not configured')
  const txn = await shippoClient.transactions.create({ rate: rateId, async: false } as any)
  const status = (txn as any).status
  if (status !== 'SUCCESS') {
    const messages = (txn as any).messages ?? []
    throw new Error(messages.map((m: any) => m.text).join(', ') || 'Label creation failed')
  }
  return {
    labelUrl:       (txn as any).labelUrl ?? (txn as any).label_url ?? '',
    trackingNumber: (txn as any).trackingNumber ?? (txn as any).tracking_number ?? '',
  }
}
