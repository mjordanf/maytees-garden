'use client'
import { useState } from 'react'
import { MapPin, Clock, Phone, Mail, CheckCircle, Instagram, Facebook } from 'lucide-react'

const SERVICE_OPTIONS = [
  'Landscape Design Consultation',
  'Garden Installation',
  'Plant Rescue & Restoration',
  'Ongoing Maintenance',
  'Plant Purchase',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', zip: '', service: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) setSent(true)
    else setError('Something went wrong. Please try again or call us directly.')
  }

  return (
    <div className="pt-20 bg-cream min-h-screen">

      {/* Header */}
      <section className="bg-green-800 py-16 text-center">
        <h1 className="font-serif text-5xl font-bold text-white mb-3">Get in Touch</h1>
        <p className="text-green-200 text-lg max-w-lg mx-auto">Ready to transform your garden? Tell us about your space and we'll be in touch within 24 hours.</p>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-green-800 mb-2">Message Sent!</h2>
                  <p className="text-gray-500">Thank you! We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-2xl font-bold text-green-800 mb-6">Send a Message</h2>
                  {error && <p className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</p>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Maria Santos" />
                      </div>
                      <div>
                        <label className="label">Zip Code</label>
                        <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="33187" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="maria@email.com" />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(305) 555-0000" />
                    </div>
                    <div>
                      <label className="label">Service Interested In</label>
                      <select className="input" value={form.service} onChange={e => set('service', e.target.value)}>
                        <option value="">Select a service...</option>
                        {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Your Message *</label>
                      <textarea className="input resize-none h-32" required value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us about your space, your goals, and any questions you have..." />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-green-800 mb-5">Find Us</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, title: 'Address', text: '15196 SW 184th St\nMiami, FL 33187' },
                    { icon: Clock,  title: 'Hours',   text: 'Monday–Sunday: 9 AM – 5:30 PM\nFriday–Saturday: until 6 PM' },
                    { icon: Phone,  title: 'Phone',   text: '(786) 227-6616' },
                    { icon: Mail,   title: 'Email',   text: 'info@mayteesgardencenter.com' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-0.5">{title}</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-green-800 mb-4">Follow Along</h3>
                <p className="text-gray-500 text-sm mb-4">Stay inspired with daily plant tips, garden reveals, and seasonal specials.</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/maytees_garden_center/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                    <Instagram className="w-4 h-4" /> @maytees_garden_center
                  </a>
                  <a href="https://www.facebook.com/mayteesgardencenter/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                    <Facebook className="w-4 h-4" /> Facebook
                  </a>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-green-100 rounded-2xl h-56 flex items-center justify-center border-2 border-dashed border-green-300">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium text-sm">15196 SW 184th St, Miami FL 33187</p>
                  <a href="https://maps.google.com/?q=15196+SW+184th+St+Miami+FL+33187" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-green-600 underline mt-1 block">Open in Google Maps</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
