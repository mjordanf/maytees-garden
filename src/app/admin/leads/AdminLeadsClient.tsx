'use client'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Mail, MessageSquare, Download, Send, X } from 'lucide-react'

const STATUS_COLORS: Record<string,string> = {
  new:      'bg-green-100 text-green-700',
  read:     'bg-blue-100 text-blue-700',
  replied:  'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-500',
}

type Submission = {
  id: string
  name: string
  email: string
  phone?: string | null
  zipCode?: string | null
  service?: string | null
  message: string
  status: string
  createdAt: string | Date
}

type Subscriber = {
  id: string
  name?: string | null
  email: string
  confirmed: boolean
  createdAt: string | Date
}

function ReplyForm({ submission, onClose, onReplied }: {
  submission: Submission
  onClose: () => void
  onReplied: (id: string) => void
}) {
  const defaultSubject = `Re: ${submission.service ? submission.service + ' inquiry' : 'Your inquiry'} — Maytee's Garden`
  const [subject, setSubject] = useState(defaultSubject)
  const [replyBody, setReplyBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!replyBody.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/reply-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id, replyBody, subject }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to send reply')
        return
      }
      setSent(true)
      onReplied(submission.id)
      setTimeout(onClose, 1500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium">
        Reply sent to {submission.email} ✓
      </div>
    )
  }

  return (
    <div className="mt-3 border border-purple-100 bg-purple-50/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Reply to {submission.name}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-purple-400"
        placeholder="Subject"
      />
      <textarea
        value={replyBody}
        onChange={e => setReplyBody(e.target.value)}
        rows={4}
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-purple-400 resize-none"
        placeholder={`Write your reply to ${submission.name}...`}
      />
      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={loading || !replyBody.trim()}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-60"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  )
}

export default function AdminLeadsClient({
  submissions: initialSubmissions,
  subscribers,
  confirmedCount,
}: {
  submissions: Submission[]
  subscribers: Subscriber[]
  confirmedCount: number
}) {
  const [tab, setTab] = useState<'submissions'|'subscribers'>('submissions')
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterBody, setNewsletterBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent?: number; error?: string } | null>(null)

  const exportCSV = (data: any[], filename: string, headers: string[], row: (d: any) => string[]) => {
    const csv = [headers.join(','), ...data.map(d => row(d).join(','))].join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = filename
    link.click()
  }

  const handleReplied = (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'replied' } : s))
  }

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterBody.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newsletterSubject, bodyHtml: newsletterBody }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSendResult({ error: data.error ?? 'Failed to send newsletter' })
      } else {
        setSendResult({ sent: data.sent })
        setNewsletterSubject('')
        setNewsletterBody('')
      }
    } catch {
      setSendResult({ error: 'Something went wrong. Please try again.' })
    } finally {
      setSending(false)
    }
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
                    <span className={`badge text-xs ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                    <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                    <button
                      onClick={() => setReplyOpenId(replyOpenId === s.id ? null : s.id)}
                      className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 hover:bg-purple-50 rounded-lg px-2.5 py-1 transition-colors font-medium"
                    >
                      <Send className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{s.message}</p>
                {replyOpenId === s.id && (
                  <ReplyForm
                    submission={s}
                    onClose={() => setReplyOpenId(null)}
                    onReplied={handleReplied}
                  />
                )}
              </div>
            ))}
            {submissions.length === 0 && <p className="text-center text-gray-400 py-8">No contact submissions yet</p>}
          </div>
        </div>
      )}

      {tab === 'subscribers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-green-700">{confirmedCount}</span> confirmed subscriber{confirmedCount !== 1 ? 's' : ''},&nbsp;
              <span className="text-gray-400">{subscribers.length - confirmedCount} pending confirmation</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNewsletter(true); setSendResult(null) }}
                className="flex items-center gap-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg px-3 py-1.5 font-medium transition-colors"
              >
                <Send className="w-4 h-4" /> Send Newsletter
              </button>
              <button onClick={() => exportCSV(subscribers, 'newsletter-subscribers.csv', ['Name','Email','Confirmed','Subscribed'], d => [d.name??'',d.email,d.confirmed?'yes':'no',formatDate(d.createdAt)])}
                className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Send Newsletter Modal */}
          {showNewsletter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-gray-800">Send Newsletter</h3>
                  <button onClick={() => { setShowNewsletter(false); setSendResult(null) }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newsletterSubject}
                  onChange={e => setNewsletterSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400"
                />
                <div>
                  <textarea
                    value={newsletterBody}
                    onChange={e => setNewsletterBody(e.target.value)}
                    rows={8}
                    placeholder="Body (you can use basic HTML like <b>bold</b>, <a href='...'>link</a>, <p>paragraph</p>)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-400 resize-none font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">You can use basic HTML like <code>&lt;b&gt;bold&lt;/b&gt;</code>, <code>&lt;a href=&apos;...&apos;&gt;link&lt;/a&gt;</code>, <code>&lt;p&gt;paragraph&lt;/p&gt;</code></p>
                </div>
                {sendResult?.error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sendResult.error}</p>
                )}
                {sendResult?.sent !== undefined && (
                  <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 font-medium">
                    Newsletter sent to {sendResult.sent} subscriber{sendResult.sent !== 1 ? 's' : ''} ✓
                  </p>
                )}
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowNewsletter(false); setSendResult(null) }} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSendNewsletter}
                    disabled={sending || !newsletterSubject.trim() || !newsletterBody.trim()}
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? 'Sending...' : `Send to ${confirmedCount} Subscriber${confirmedCount !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Email','Status','Subscribed'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{s.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.confirmed
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">confirmed</span>
                        : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">pending</span>
                      }
                    </td>
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
