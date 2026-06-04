import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: "Maytee's Garden Center terms and conditions for using our website, purchasing plants, and booking services.",
}

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-green-800 mb-3">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="prose-legal">

          <section>
            <h2>Acceptance of Terms</h2>
            <p>By accessing or using the Maytee&apos;s Garden Center website (<em>mayteesgardencenter.com</em>), creating an account, placing an order, or booking a consultation, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our website.</p>
          </section>

          <section>
            <h2>Products &amp; Pricing</h2>
            <ul>
              <li>All prices are listed in US Dollars (USD) and are subject to change without notice</li>
              <li>Product images are representative — actual plants may vary slightly in color, size, and appearance, as they are living organisms</li>
              <li>We reserve the right to limit quantities or discontinue any product at any time</li>
              <li>Sales tax is applied where required by Florida law</li>
            </ul>
          </section>

          <section>
            <h2>Plant Disclaimer</h2>
            <p>All plants sold by Maytee&apos;s Garden Center are living organisms. We ship healthy, well-rooted plants and package them carefully for transit. However:</p>
            <ul>
              <li>Color, size, shape, and exact appearance of live plants may vary from photos</li>
              <li>Minor transit stress (slight wilting, leaf curl) is normal and plants typically recover within a few days with proper care</li>
              <li>We cannot guarantee plant survival after delivery, as outcomes depend on the buyer&apos;s care, environment, climate, and conditions outside our control</li>
              <li>If a plant arrives dead or severely damaged, see our <a href="/returns">Return &amp; Refund Policy</a></li>
            </ul>
          </section>

          <section>
            <h2>Orders &amp; Payment</h2>
            <ul>
              <li>All orders are processed through Square, a PCI-compliant payment processor</li>
              <li>Payment is charged at the time of order placement</li>
              <li>You will receive an email confirmation after successful payment</li>
              <li>We reserve the right to cancel any order due to pricing errors, inventory issues, or suspected fraud, with a full refund issued</li>
            </ul>
          </section>

          <section>
            <h2>Shipping</h2>
            <p>Please see our <a href="/shipping">Shipping Policy</a> for full details on processing times, carriers, estimated delivery, and tracking.</p>
          </section>

          <section>
            <h2>Returns</h2>
            <p>Please see our <a href="/returns">Return &amp; Refund Policy</a> for full details on eligible returns, the return process, and refund timelines.</p>
          </section>

          <section>
            <h2>Consultations &amp; Services</h2>
            <ul>
              <li>Booking a consultation through our website is a request, not a confirmed appointment, until you receive a confirmation email from us</li>
              <li>We require at least <strong>24 hours notice</strong> for cancellations or rescheduling</li>
              <li>No-shows or cancellations with less than 24 hours notice may be charged a cancellation fee at our discretion</li>
              <li>Consultation fees (where applicable) are non-refundable once the appointment has taken place</li>
              <li>Service outcomes depend on site conditions, plant availability, and factors outside our control</li>
            </ul>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>All content on this website — including text, photographs, logos, graphics, and design — is the property of Maytee&apos;s Garden Center and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, or use our content without prior written permission.</p>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Maytee&apos;s Garden Center shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our maximum liability for any claim shall not exceed the value of the specific order or transaction giving rise to the claim.</p>
          </section>

          <section>
            <h2>Dispute Resolution</h2>
            <p>These Terms are governed by the laws of the State of Florida, United States. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Miami-Dade County, Florida, and you consent to personal jurisdiction in those courts.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Questions about these Terms? Contact us at:</p>
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
