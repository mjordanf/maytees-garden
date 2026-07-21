import { Shippo } from 'shippo'

const isProd = process.env.NODE_ENV === 'production'
const apiKey = isProd
  ? process.env.SHIPPO_API_KEY
  : (process.env.SHIPPO_TEST_API_KEY ?? process.env.SHIPPO_API_KEY)

if (!apiKey) {
  console.warn('[shippo] No API key set — shipping rates will use flat-rate fallback')
}

const shippoClient = apiKey ? new Shippo({ apiKeyHeader: apiKey }) : null

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
export type ShippoParcel = {
  length: string; width: string; height: string
  weight: string  // in lbs as string
}

export async function getRates(toAddress: ShippoAddress, parcel: ShippoParcel): Promise<{
  objectId: string; carrier: string; service: string; price: number; days: number | null; currency: string
}[]> {
  if (!shippoClient) return []
  try {
    const shipment = await shippoClient.shipments.create({
      addressFrom: FROM_ADDRESS as any,
      addressTo:   toAddress as any,
      parcels:     [{
        length: parcel.length,
        width:  parcel.width,
        height: parcel.height,
        distanceUnit: 'in' as any,
        weight: parcel.weight,
        massUnit: 'lb' as any,
      }],
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

// Generate a prepaid return label (customer ships back to Maytee's)
export async function createReturnLabel(opts: {
  customerName: string
  customerAddress: { street1: string; city: string; state: string; zip: string }
  parcel?: { length: string; width: string; height: string; weight: string }
}): Promise<{ labelUrl: string; trackingNumber: string }> {
  if (!shippoClient) throw new Error('Shippo not configured')

  const parcel = opts.parcel ?? { length: '12', width: '10', height: '8', weight: '5' }

  const shipment = await shippoClient.shipments.create({
    addressFrom: {
      name:    opts.customerName,
      street1: opts.customerAddress.street1,
      city:    opts.customerAddress.city,
      state:   opts.customerAddress.state,
      zip:     opts.customerAddress.zip,
      country: 'US',
    } as any,
    addressTo: FROM_ADDRESS as any,
    parcels: [{
      length:       parcel.length,
      width:        parcel.width,
      height:       parcel.height,
      distanceUnit: 'in' as any,
      weight:       parcel.weight,
      massUnit:     'lb' as any,
    }],
    async: false,
  })

  const rates: any[] = (shipment as any).rates ?? []
  if (!rates.length) throw new Error('No return shipping rates available')

  // Pick cheapest available rate
  const cheapest = rates
    .filter((r: any) => r.objectId || r.object_id)
    .sort((a: any, b: any) => parseFloat(a.amount ?? '999') - parseFloat(b.amount ?? '999'))[0]

  const rateId = cheapest?.objectId ?? cheapest?.object_id
  if (!rateId) throw new Error('No valid rate found for return label')

  const txn = await shippoClient.transactions.create({ rate: rateId, async: false } as any)
  const status = (txn as any).status
  if (status !== 'SUCCESS') {
    const messages = (txn as any).messages ?? []
    throw new Error(messages.map((m: any) => m.text).join(', ') || 'Return label creation failed')
  }

  return {
    labelUrl:       (txn as any).labelUrl ?? (txn as any).label_url ?? '',
    trackingNumber: (txn as any).trackingNumber ?? (txn as any).tracking_number ?? '',
  }
}
