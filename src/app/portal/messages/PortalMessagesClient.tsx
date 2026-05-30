'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, Loader2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

type Message = {
  id: string
  subject: string
  body: string
  createdAt: Date | string
}

export default function PortalMessagesClient({ messages: initial }: { messages: Message[] }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initial)
  const [subject, setSubject]   = useState('')
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true); setError('')

    const res = await fetch('/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: subject.trim() || 'Message to Maytee',
        body: body.trim(),
      }),
    })

    setSending(false)
    if (res.ok) {
      const { message } = await res.json()
      setMessages(prev => [message, ...prev])
      setSubject('')
      setBody('')
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-green-800">Message Maytee</h1>
        <p className="text-gray-500 text-sm mt-1">
          Send a message directly to Maytee. She'll reply to your email within 24 hours.
        </p>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-serif text-lg font-bold text-green-800 mb-5 flex items-center gap-2">
          <Send className="w-4 h-4" /> New Message
        </h2>

        {sent && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Message sent! Maytee will reply to your email within 24 hours.
          </div>
        )}

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject <span className="text-xs font-normal text-gray-400">(optional)</span></label>
            <input
              className="input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Question about my consultation"
            />
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea
              className="input resize-none h-36"
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message to Maytee here…"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div>
          <h2 className="font-serif text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Previous Messages
          </h2>
          <div className="space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(prev => prev === msg.id ? null : msg.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{msg.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(msg.createdAt)} at {formatTime(msg.createdAt)}
                    </p>
                  </div>
                  {expandedId === msg.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                </button>
                {expandedId === msg.id && (
                  <div className="px-5 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-3">{msg.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length === 0 && !sent && (
        <div className="text-center text-gray-400 text-sm py-4">
          No messages yet. Use the form above to reach out to Maytee.
        </div>
      )}
    </div>
  )
}
