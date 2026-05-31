'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/utils'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const TAX_RATE = 0.085

type ShippingInfo = {
  fullName: string; email: string; phone: string
  address1: string; address2: string; city: string
  state: string; zip: string; country: string
}

type Rate = {
  objectId: string; carrier: string; service: string
  price: number; days: number | null; currency: string
}

// Use NEXT_PUBLIC_SQUARE_ENVIRONMENT to pick the right SDK script.
// NODE_ENV is always 'production' on Vercel, so we can't use it here.
const SQUARE_SCRIPT_URL = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, subtotal, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '', email: '', phone: '',
    address1: '', address2: '', city: '',
    state: 'FL', zip: '', country: 'US',
  })
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [rateError, setRateError] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [cardInitialized, setCardInitialized] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [payError, setPayError] = useState('')
  const cardRef = useRef<any>(null)
  const paymentsRef = useRef<any>(null)

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: prev.fullName || (session.user?.name ?? ''),
        email: prev.email || (session.user?.email ?? ''),
      }))
    }
  }, [session])

  // Initialize Square card when script is loaded and we're on step 3.
  // Poll for window.Square — the onLoad callback fires when the script
  // tag executes but window.Square may not be set for a tick or two.
  useEffect(() => {
    if (!scriptLoaded || step !== 3 || cardInitialized) return

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
    const locId  = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ''

    if (!appId || !locId) {
      console.error('[square] Missing NEXT_PUBLIC_SQUARE_APPLICATION_ID or NEXT_PUBLIC_SQUARE_LOCATION_ID')
      setPayError('Payment configuration error — please contact support.')
      return
    }

    let attempts = 0
    const MAX = 100 // 100 × 100ms = 10s timeout

    const poll = setInterval(async () => {
      attempts++

      if (typeof window === 'undefined' || !(window as any).Square) {
        if (attempts >= MAX) {
          clearInterval(poll)
          setPayError('Payment form failed to load. Please refresh the page and try again.')
        }
        return
      }

      clearInterval(poll)

      try {
        const payments = (window as any).Square.payments(appId, locId)
        paymentsRef.current = payments
        const card = await payments.card()
        await card.attach('#card-container')
        cardRef.current = card
        setCardInitialized(true)
      } catch (err: any) {
        console.error('[square] card init error:', err)
        setPayError(err?.message ?? 'Could not load payment form. Please refresh.')
      }
    }, 100)

    return () => clearInterval(poll)
  }, [scriptLoaded, step, cardInitialized])

  const setField = (k: keyof ShippingInfo, v: string) =>
    setShippingInfo(prev => ({ ...prev, [k]: v }))

  const handleContinueToShipping = async () => {
    setLoadingRates(true)
    setRateError('')
    try {
      const res = await fetch('/api/store/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: {
            name: shippingInfo.fullName,
            street1: shippingInfo.address1,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip: shippingInfo.zip,
            country: shippingInfo.country,
          },
          items: items.map(i => ({ plantId: i.plantId, qty: i.qty })),
        }),
      })
      const data = await res.json()
      setRates(data.rates ?? [])
      setStep(2)
    } catch {
      setRateError('Could not load shipping rates. Please check your address.')
    } finally {
      setLoadingRates(false)
    }
  }

  const shippingCost = selectedRate?.price ?? 0
  const tax = (subtotal + shippingCost) * TAX_RATE
  const total = subtotal + shippingCost + tax

  const handlePlaceOrder = async () => {
    if (!cardRef.current) { setPayError('Payment form not ready'); return }
    setPlacing(true)
    setPayError('')
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK') {
        setPayError(result.errors?.[0]?.message ?? 'Card tokenization failed')
        return
      }
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ plantId: i.plantId, qty: i.qty, unitPrice: i.onlinePrice ?? i.price, plantName: i.plantName })),
          shippingInfo,
          selectedRate,
          sourceId: result.token,
          subtotal,
          tax,
          total,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setPayError(data.error ?? 'Payment failed'); return }
      clearCart()
      router.push(`/shop/order/${data.orderId}`)
    } catch (err: any) {
      setPayError(err.message ?? 'Payment failed')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="max-w-lg mx-auto px-4 text-center py-20">
          <h1 className="font-serif text-2xl font-bold text-green-800 mb-4">Your cart is empty</h1>
          <a href="/plants" className="btn-primary">Browse Plants</a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src={SQUARE_SCRIPT_URL} onLoad={() => setScriptLoaded(true)} />
      <div className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-green-800 mb-8">Checkout</h1>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-green-600 text-white' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
                <span className={`text-sm font-medium hidden sm:block ${step === s ? 'text-green-700' : 'text-gray-400'}`}>
                  {s === 1 ? 'Contact & Shipping' : s === 2 ? 'Shipping Method' : 'Payment'}
                </span>
                {s < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1">

              {/* Step 1 */}
              {step === 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-bold text-green-800">Contact & Shipping</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input className="input" value={shippingInfo.fullName} onChange={e => setField('fullName', e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input className="input" type="email" value={shippingInfo.email} onChange={e => setField('email', e.target.value)} placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input className="input" value={shippingInfo.phone} onChange={e => setField('phone', e.target.value)} placeholder="(786) 555-0123" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Address Line 1 *</label>
                    <input className="input" value={shippingInfo.address1} onChange={e => setField('address1', e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className="label">Address Line 2</label>
                    <input className="input" value={shippingInfo.address2} onChange={e => setField('address2', e.target.value)} placeholder="Apt, Suite, Unit (optional)" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label">City *</label>
                      <input className="input" value={shippingInfo.city} onChange={e => setField('city', e.target.value)} placeholder="Miami" />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <select className="input" value={shippingInfo.state} onChange={e => setField('state', e.target.value)}>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">ZIP *</label>
                      <input className="input" value={shippingInfo.zip} onChange={e => setField('zip', e.target.value)} placeholder="33101" />
                    </div>
                  </div>
                  {rateError && <p className="text-sm text-red-500">{rateError}</p>}
                  <button
                    onClick={handleContinueToShipping}
                    disabled={loadingRates || !shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address1 || !shippingInfo.city || !shippingInfo.zip}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                  >
                    {loadingRates ? 'Loading rates…' : 'Continue to Shipping'}
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-bold text-green-800">Shipping Method</h2>
                  {rates.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                      <p>No shipping rates available. Please check your address or contact us.</p>
                      <button onClick={() => setStep(1)} className="mt-4 text-sm text-green-700 font-medium">← Back to Address</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rates.map(rate => (
                        <label key={rate.objectId} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedRate?.objectId === rate.objectId ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'
                        }`}>
                          <input
                            type="radio"
                            name="rate"
                            value={rate.objectId}
                            checked={selectedRate?.objectId === rate.objectId}
                            onChange={() => setSelectedRate(rate)}
                            className="accent-green-600"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{rate.carrier} — {rate.service}</p>
                            {rate.days && <p className="text-xs text-gray-400">Estimated {rate.days} business day{rate.days !== 1 ? 's' : ''}</p>}
                          </div>
                          <span className="font-bold text-green-700">{formatCurrency(rate.price)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!selectedRate}
                      className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-bold text-green-800">Payment</h2>
                  {(!scriptLoaded || (!cardInitialized && !payError)) && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {!scriptLoaded ? 'Loading payment form…' : 'Initializing secure card form…'}
                    </div>
                  )}
                  <div id="card-container" className={cardInitialized ? 'min-h-[100px]' : 'hidden'} />
                  {payError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {payError}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                      ← Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing || !cardInitialized}
                      className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                      {placing ? 'Processing…' : `Place Order — ${formatCurrency(total)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="font-serif text-lg font-bold text-green-800 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.plantId} className="flex justify-between text-sm text-gray-600">
                      <span>{item.plantName} × {item.qty}</span>
                      <span>{formatCurrency((item.onlinePrice ?? item.price) * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{selectedRate ? formatCurrency(shippingCost) : 'TBD'}</span>
                  </div>
                  {selectedRate && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8.5%)</span><span>{formatCurrency(tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatCurrency(selectedRate ? total : subtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
