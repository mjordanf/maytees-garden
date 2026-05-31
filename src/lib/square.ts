import { SquareClient, SquareEnvironment } from 'square'

// Resolve which Square environment to use — evaluated fresh on every call
// so env var changes take effect without a rebuild.
function getSquareEnv() {
  return (
    process.env.SQUARE_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ??
    (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')
  )
}

function getIsProd() { return getSquareEnv() === 'production' }

function getClient() {
  const isProd = getIsProd()
  const token  = isProd
    ? process.env.SQUARE_ACCESS_TOKEN
    : process.env.SQUARE_SANDBOX_ACCESS_TOKEN
  if (!token) console.warn(`[square] ${isProd ? 'SQUARE_ACCESS_TOKEN' : 'SQUARE_SANDBOX_ACCESS_TOKEN'} not set`)
  return new SquareClient({
    token:       token ?? '',
    environment: isProd ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  })
}

function getLocationId() {
  const isProd = getIsProd()
  const locId  = isProd
    ? process.env.SQUARE_LOCATION_ID
    : process.env.SQUARE_SANDBOX_LOCATION_ID
  if (!locId) console.warn(`[square] ${isProd ? 'SQUARE_LOCATION_ID' : 'SQUARE_SANDBOX_LOCATION_ID'} not set (env=${getSquareEnv()})`)
  return locId ?? ''
}

export async function createSquarePayment(opts: {
  amountCents:   number
  sourceId:      string
  orderId:       string
  customerEmail: string
}) {
  const client     = getClient()
  const locationId = getLocationId()
  console.log(`[square] createPayment env=${getSquareEnv()} locationId=${locationId}`)
  const response = await client.payments.create({
    sourceId:          opts.sourceId,
    idempotencyKey:    `${opts.orderId}-${Date.now()}`,
    amountMoney:       { amount: BigInt(opts.amountCents), currency: 'USD' },
    locationId,
    note:              `Maytee's Garden order ${opts.orderId}`,
    buyerEmailAddress: opts.customerEmail,
  })
  return response.payment
}

export async function refundSquarePayment(paymentId: string, amountCents: number) {
  const client = getClient()
  const response = await client.refunds.refundPayment({
    idempotencyKey: `refund-${paymentId}-${Date.now()}`,
    paymentId,
    amountMoney:    { amount: BigInt(amountCents), currency: 'USD' },
  })
  return response.refund
}
