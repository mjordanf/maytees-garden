'use client'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Mail, MessageSquare, Download } from 'lucide-react'

const STATUS_COLORS: Record<string,string> = {
  new:      'bg-green-100 text-green-700',
  read:     'bg-blue-100 text-blue-700',
  replied:  'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default function AdminLeadsClient({ submissions, subscribers }: { submissions: any[]; subscribers: any[] }) {
  const [tab, setTab] = useState<'submissions'|'subscribers'>('submissions')

  const exportCSV = (data: any[], filename: string, headers: string[], row: (d: any) => string[]) => {
    const csv = [headers.join(','), ...data.map(d => row(d).join(','))].join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = filename
    link.click()
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'submissions', icon: MessageSquare, label: `Contact Forms (${submissions.length})` },
          { key: 'subscribers',  icon: Mail,          label: `Newsletter (${subscribers.length})`     },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'submissions' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => exportCSV(submissions, 'contact-leads.csv', ['Name','Email','Phone','Zip','Service','Message','Status','Date'], d => [d.name,d.email,d.phone??'',d.zipCode??'',d.service??'',`"${d.message}"`,d.status,formatDate(d.createdAt)])}
              className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="space-y-4">
            {submissions.map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{s.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{s.email}</span>
                      {s.phone && <span>{s.phone}</span>}
                      {s.zipCode && <span>ZIP: {s.zipCode}</span>}
                      {s.service && <span className="text-green-600 font-medium">{s.service}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge text-xs ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{s.message}</p>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-center text-gray-400 py-8">No contact submissions yet</p>}
          </div>
        </div>
      )}

      {tab === 'subscribers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{subscribers.length} active subscriber{subscribers.length !== 1 ? 's' : ''}</p>
            <button onClick={() => exportCSV(subscribers, 'newsletter-subscribers.csv', ['Name','Email','Subscribed'], d => [d.name??'',d.email,formatDate(d.createdAt)])}
              className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Subscribed'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{s.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscribers.length === 0 && <p className="text-center text-gray-400 py-8">No subscribers yet</p>}
          </div>
        </div>
      )}
    </>
  )
}
