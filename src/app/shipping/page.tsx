import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: "Maytee's Garden Center shipping policy — processing times, carriers, delivery estimates, and plant packaging.",
}

export default function ShippingPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-green-800 mb-3">Shipping Policy</h1>
          <p className="text-sm text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="prose-legal">

          <section>
            <h2>Processing Time</h2>
            <p>Orders are typically processed within <strong>2–3 business days</strong> after payment is confirmed. You will receive a shipping confirmation email with your tracking number once your order ships. Processing may take longer during peak seasons or holidays — we will notify you if there is a significant delay.</p>
          </section>

          <section>
            <h2>Carriers</h2>
            <p>We ship via <strong>USPS, UPS, and FedEx</strong> through Shippo, our shipping platform. The carrier is selected at checkout based on your location, package weight, and available services. All carriers used are licensed and insured for package delivery.</p>
          </section>

          <section>
            <h2>Estimated Delivery</h2>
            <ul>
              <li><strong>Domestic (US)</strong> — 3 to 7 business days after shipment, depending on carrier and destination</li>
              <li>Florida addresses typically receive orders on the faster end of this window</li>
              <li>Delivery estimates are provided by the carrier and are not guaranteed — weather, holidays, and carrier delays can affect transit times</li>
            </ul>
          </section>

          <section>
            <h2>Shipping Costs</h2>
            <p>Shipping costs are calculated at checkout based on the total package weight and your delivery address. The exact cost will be shown before you complete your purchase. We do not mark up shipping — you pay what the carrier charges us.</p>
          </section>

          <section>
            <h2>Plant Shipping Note</h2>
            <p>Live plants require special care during shipping. Here is what to expect:</p>
            <ul>
              <li>We carefully pack all plants to minimize movement and stress during transit</li>
              <li>Plants may experience minor stress (slight wilting or leaf curl) during shipping — this is <strong>normal and temporary</strong></li>
              <li>Upon arrival, unbox your plant promptly, place it in appropriate light, and water as needed — most plants recover fully within a few days</li>
              <li>We ship on Mondays through Wednesdays (when possible) to avoid plants sitting in carrier facilities over the weekend</li>
            </ul>
          </section>

          <section>
            <h2>Tracking</h2>
            <p>A tracking number will be emailed to you when your order ships. Use it to track your package directly on the carrier&apos;s website (USPS.com, UPS.com, or FedEx.com). You can also view your order status in your account under <strong>My Orders</strong>.</p>
          </section>

          <section>
            <h2>Undeliverable Packages</h2>
            <p>If a package is returned to us because it was undeliverable (incorrect address, no one to receive it, etc.), we will contact you. Re-shipping costs are the responsibility of the customer. If a plant does not survive the return transit, we cannot offer a replacement, so please double-check your shipping address at checkout.</p>
          </section>

          <section>
            <h2>International Shipping</h2>
            <p>We currently ship to <strong>US domestic addresses only</strong>. International shipping is not available at this time, including to US territories. We hope to expand in the future.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Questions about your shipment? Email us at <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a> and include your order number. We typically respond within one business day.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
