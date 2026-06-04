import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Maytee's Garden Center privacy policy — how we collect, use, and protect your information.",
}

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-green-800 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: June 2026</p>
        </div>

        <div className="prose-legal">

          <section>
            <h2>Information We Collect</h2>
            <p>When you use our website, create an account, place an order, or book a consultation, we may collect the following information:</p>
            <ul>
              <li><strong>Contact information</strong> — name, email address, phone number, and ZIP code</li>
              <li><strong>Account credentials</strong> — hashed password (we never store plaintext passwords)</li>
              <li><strong>Purchase history</strong> — items ordered, quantities, prices, and shipping addresses</li>
              <li><strong>Booking history</strong> — consultation dates, service types, and appointment notes</li>
              <li><strong>Browsing behavior</strong> — pages visited, plants saved, and session activity on our site</li>
            </ul>
            <p>We do not collect payment card details directly. All payment processing is handled securely by Square (see Third-Party Services below).</p>
          </section>

          <section>
            <h2>How We Use Your Information</h2>
            <ul>
              <li><strong>Order fulfillment</strong> — processing and shipping your plant orders</li>
              <li><strong>Appointment scheduling</strong> — confirming and managing garden consultations</li>
              <li><strong>Email communications</strong> — order confirmations, shipping updates, appointment reminders, and newsletters (with your consent)</li>
              <li><strong>Improving our services</strong> — understanding which plants and services are most popular so we can better serve Miami gardeners</li>
              <li><strong>Legal compliance</strong> — maintaining records required by tax and business law</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>We use trusted third-party services to operate our website. Each receives only the data necessary for its function:</p>
            <ul>
              <li><strong>Square</strong> — processes all payment transactions; receives your order total, billing information, and payment card details directly</li>
              <li><strong>Shippo</strong> — generates shipping labels and tracking; receives your shipping name and address</li>
              <li><strong>Resend</strong> — delivers transactional emails; receives your name and email address for sending order confirmations, booking alerts, and newsletters</li>
              <li><strong>Anthropic</strong> — powers the AI chat assistant on our site; chat messages may be processed through Anthropic's API</li>
              <li><strong>Microsoft</strong> — used for calendar management and appointment scheduling via Microsoft Graph API</li>
              <li><strong>Neon</strong> — our cloud database provider; stores all account, order, and booking data in an encrypted PostgreSQL database</li>
              <li><strong>Vercel</strong> — hosts and serves our website; receives standard web request data including IP addresses and request logs</li>
            </ul>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>We use a minimal set of cookies necessary to operate the site:</p>
            <ul>
              <li><strong>Session cookie</strong> — keeps you logged in during your visit (httpOnly, secure)</li>
              <li><strong>Language preference</strong> — remembers whether you prefer English or Spanish</li>
              <li><strong>Cart state</strong> — preserves your shopping cart between pages</li>
            </ul>
            <p>We do not use advertising cookies, tracking pixels, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Correction</strong> — ask us to update inaccurate or incomplete information</li>
              <li><strong>Deletion</strong> — request that we delete your account and associated personal data (subject to legal retention requirements)</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a> with the subject line "Privacy Request."</p>
          </section>

          <section>
            <h2>Data Retention</h2>
            <ul>
              <li><strong>Order records</strong> are retained for 7 years in compliance with federal and Florida tax law</li>
              <li><strong>Account data</strong> is retained as long as your account is active and deleted upon verified request</li>
              <li><strong>Contact form submissions</strong> are retained for 2 years and then purged</li>
              <li><strong>Newsletter subscriptions</strong> are maintained until you unsubscribe</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Questions about this policy? Reach us at:</p>
            <address>
              Maytee&apos;s Garden Center<br />
              15196 SW 184th St, Miami, FL 33187<br />
              <a href="mailto:info@mayteesgardencenter.com">info@mayteesgardencenter.com</a>
            </address>
          </section>

          <section>
            <h2>Governing Law</h2>
            <p>This Privacy Policy is governed by the laws of the State of Florida, United States. Any disputes shall be resolved in the courts of Miami-Dade County, Florida.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
