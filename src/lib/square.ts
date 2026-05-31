import { SquareClient, SquareEnvironment } from 'square'

const isProd = process.env.NODE_ENV === 'production'
const accessToken = isProd
  ? process.env.SQUARE_ACCESS_TOKEN
  : (process.env.SQUARE_SANDBOX_ACCESS_TOKEN ?? process.env.SQUARE_ACCESS_TOKEN)

export const locationId = isProd
  ? (process.env.SQUARE_LOCATION_ID ?? '')
  : (process.env.SQUARE_SANDBOX_LOCATION_ID ?? process.env.SQUARE_LOCATION_ID ?? '')

if (!accessToken) console.warn('[square] No access token set — payments will fail')

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
