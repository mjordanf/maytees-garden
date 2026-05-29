'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function PortalSettingsClient({ user }: { user: any }) {
  const [name, setName]           = useState(user.name ?? '')
  const [phone, setPhone]         = useState(user.phone ?? '')
  const [zip, setZip]             = useState(user.zipCode ?? '')
  const [lang, setLang]           = useState(user.languagePreference ?? 'en')
  const [newsletter, setNewsletter] = useState(user.newsletterOptIn)
  const [promotions, setPromotions] = useState(user.promotionsOptIn)
  const [saved, setSaved]         = useState(false)

  const save = () => {
    // In a full implementation, this would call a PATCH /api/user endpoint
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-green-800 mb-5">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input" value={user.email} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0000" />
          </div>
          <div>
            <label className="label">Zip Code</label>
            <input className="input" value={zip} onChange={e => setZip(e.target.value)} placeholder="33187" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-green-800 mb-5">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Preferred Language</label>
            <select className="input w-auto" value={lang} onChange={e => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* Marketing */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-green-800 mb-5">Marketing & Communications</h2>
        <div className="space-y-4">
          {[
            { label: 'Plant Tips Newsletter', sub: 'Monthly seasonal tips and plant care guides for South Florida', value: newsletter, set: setNewsletter },
            { label: 'Promotions & Specials',  sub: 'Exclusive offers, new plant arrivals, and seasonal sales',    value: promotions, set: setPromotions },
          ].map(({ label, sub, value, set }) => (
            <label key={label} className="flex items-start gap-4 cursor-pointer group">
              <div className={`mt-0.5 w-11 h-6 rounded-full transition-colors shrink-0 relative ${value ? 'bg-green-600' : 'bg-gray-200'}`} onClick={() => set(!value)}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'right-1' : 'left-1'}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} className="btn-primary">Save Changes</button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Saved!
          </div>
        )}
      </div>
    </div>
  )
}
