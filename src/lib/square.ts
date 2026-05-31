import { SquareClient, SquareEnvironment } from 'square'

// Use NEXT_PUBLIC_SQUARE_ENVIRONMENT if set, otherwise fall back to NODE_ENV
const squareEnv = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')
const isProd = squareEnv === 'production'

const accessToken = isProd
  ? process.env.SQUARE_ACCESS_TOKEN
  : process.env.SQUARE_SANDBOX_ACCESS_TOKEN   // do NOT fall back to production token

export const locationId = isProd
  ? (process.env.SQUARE_LOCATION_ID ?? '')
  : (process.env.SQUARE_SANDBOX_LOCATION_ID ?? '')  // do NOT fall back to production location

if (!accessToken) {
  console.warn(
    isProd
      ? '[square] SQUARE_ACCESS_TOKEN not set'
      : '[square] SQUARE_SANDBOX_ACCESS_TOKEN not set — add it to .env to process sandbox payments'
  )
}

if (!locationId) {
  console.warn(
    isProd
      ? '[square] SQUARE_LOCATION_ID not set'
      : '[square] SQUARE_SANDBOX_LOCATION_ID not set — get it from developer.squareup.com → Sandbox → Locations'
  )
}

export const squareClient = new SquareClient({
  token: accessToken ?? '',
  environment: isProd ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})

export async function createSquarePayment(opts: {
  amountCents: number
  sourceId: string
  orderId: string
  customerEmail: string
}) {
  const response = await squareClient.payments.create({
    sourceId:       opts.sourceId,
    idempotencyKey: `${opts.orderId}-${Date.now()}`,
    amountMoney:    { amount: BigInt(opts.amountCents), currency: 'USD' },
    locationId,
    note:           `Maytee's Garden order ${opts.orderId}`,
    buyerEmailAddress: opts.customerEmail,
  })
  return response.payment
}

export async function refundSquarePayment(paymentId: string, amountCents: number) {
  const response = await squareClient.refunds.refundPayment({
    idempotencyKey: `refund-${paymentId}-${Date.now()}`,
    paymentId,
    amountMoney:    { amount: BigInt(amountCents), currency: 'USD' },
  })
  return response.refund
}
