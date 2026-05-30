export const dynamic = 'force-dynamic'
import { Settings, Mail, MapPin, Clock, Phone } from 'lucide-react'

export default function SuperAdminSettings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Website Settings</h1>
        <p className="text-gray-400 mt-1 text-sm">General configuration for mayteesgardencenter.com</p>
      </div>

      {/* Current settings — read only for now */}
      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-500" /> Business Info</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Business Name', "Maytee's Garden Center"],
              ['Address', '15196 SW 184th St, Miami, FL 33187'],
              ['Phone', '(786) 227-6616'],
              ['Business Email', 'info@mayteesgardencenter.com'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-36 text-gray-500 shrink-0">{k}</dt>
                <dd className="text-gray-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Store Hours</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Mon – Thu', '9:00 AM – 5:30 PM'],
              ['Fri – Sat', '9:00 AM – 6:00 PM'],
              ['Sunday',   '9:00 AM – 5:30 PM'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-24 text-gray-500 shrink-0">{k}</dt>
                <dd className="text-gray-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium text-sm">Editable settings coming soon</p>
              <p className="text-amber-500/70 text-xs mt-1">Business hours, contact details, feature flags, homepage content, and email templates will be configurable here without a code deploy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
