import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: "Maytee's Garden Center return and refund policy — eligible returns, the return process, and refund timelines.",
}

export default function ReturnsPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-green-800 mb-3">Return &amp; Refund Policy</h1>
          <p className="text-sm text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="prose-legal">

          <section>
            <h2>Return Window</h2>
            <p>We accept returns within <strong>14 days of delivery</strong>. After 14 days, we are unable to accept returns or issue refunds, except in cases where a plant arrived dead or severely damaged (see Live Plant Policy below).</p>
          </section>

          <section>
            <h2>Eligible Items</h2>
            <ul>
              <li>Live plants in their original condition — healthy, unaltered, and in original packaging</li>
              <li>Unused soil, fertilizers, and accessories in original, unopened packaging</li>
            </ul>
          </section>

          <section>
            <h2>Non-Returnable Items</h2>
            <ul>
              <li>Live plants that show signs of neglect, improper care, sunburn, overwatering, or other damage after delivery</li>
              <li>Plants that have been repotted or treated with chemicals after delivery</li>
              <li>Custom or made-to-order arrangements</li>
              <li>Final sale and clearance items (marked at time of purchase)</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section>
            <h2>Live Plant Policy — Arrived Damaged or Dead</h2>
            <p>We stand behind the health of every plant we ship. If your plant arrives <strong>dead or severely damaged due to shipping</strong>:</p>
            <ul>
              <li>Contact us within <strong>48 hours of delivery</strong> at <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a></li>
              <li>Include your order number and <strong>clear photos</strong> of the plant and packaging</li>
              <li>We will review and, at our discretion, offer a <strong>replacement plant or full refund</strong></li>
            </ul>
            <p>Claims submitted after 48 hours of delivery cannot be honored, as we are unable to determine whether damage occurred during transit or afterward.</p>
          </section>

          <section>
            <h2>How to Return</h2>
            <ol>
              <li>Log in to your account and go to <strong>My Orders → Request Return</strong></li>
              <li>Select the item(s) you wish to return and provide a reason</li>
              <li>We will review your request and respond within 1–2 business days</li>
              <li>If approved, you will receive instructions for packaging and shipping the return</li>
            </ol>
            <p>Alternatively, email <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a> with your order number and reason for return.</p>
          </section>

          <section>
            <h2>Refund Timeline</h2>
            <ul>
              <li>Once we receive and inspect your return, we will notify you by email</li>
              <li>Approved refunds are processed within <strong>5–10 business days</strong></li>
              <li>Refunds are issued to your original payment method (credit/debit card via Square)</li>
              <li>Your bank may take additional time to post the refund to your account</li>
            </ul>
          </section>

          <section>
            <h2>Return Shipping</h2>
            <ul>
              <li><strong>Damaged or incorrect items</strong> — we provide a prepaid return shipping label at no cost to you</li>
              <li><strong>Change-of-mind returns</strong> — the customer is responsible for return shipping costs</li>
              <li>We recommend using a trackable shipping method for all returns, as we cannot be responsible for items lost in return transit</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Questions about a return or refund? We&apos;re here to help:</p>
            <address>
              Maytee&apos;s Garden Center<br />
              15196 SW 184th St, Miami, FL 33187<br />
              <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a>
            </address>
          </section>

        </div>
      </div>
    </div>
  )
}
