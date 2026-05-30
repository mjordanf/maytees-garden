'use client'
import { useState } from 'react'
import { formatDate, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

type InboxMessage = {
  id: string
  createdAt: Date | string
  subject: string
  body: string
  read: boolean
  type: string
  bookingId: string | null
  fromUser: { name: string | null; email: string } | null
}

const TABS = [
  { key: 'all',              label: 'All' },
  { key: 'unread',           label: 'Unread' },
  { key: 'customer-message', label: 'Messages' },
  { key: 'booking-alert',    label: 'Booking Alerts' },
  { key: 'contact-form',     label: 'Contact Forms' },
]

export default function AdminInboxClient({ messages: initial }: { messages: InboxMessage[] }) {
  const [messages, setMessages] = useState(initial)
  const [tab, setTab] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [repliedIds, setRepliedIds] = useState<Set<string>>(new Set())

  const unreadCount = messages.filter(m => !m.read).length

  const filtered = messages.filter(m => {
    if (tab === 'unread') return !m.read
    if (tab === 'all') return true
    return m.type === tab
  })

  const markRead = async (id: string) => {
    await fetch(`/api/admin/inbox/${id}/read`, { method: 'PATCH' })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  const toggle = async (id: string, isRead: boolean) => {
    const closing = expandedId === id
    setExpandedId(closing ? null : id)
    if (closing) { setReplyingId(null); setReplyBody(''); setReplySubject('') }
    if (!isRead && !closing) await markRead(id)
  }

  const openReply = (msg: InboxMessage) => {
    setReplyingId(msg.id)
    setReplySubject(`Re: ${msg.subject}`)
    setReplyBody('')
  }

  const sendReply = async (messageId: string) => {
    if (!replyBody.trim()) return
    setReplySending(true)
    const res = await fetch('/api/admin/reply-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, subject: replySubject, replyBody }),
    })
    setReplySending(false)
    if (res.ok) {
      setRepliedIds(prev => new Set([...prev, messageId]))
      setReplyingId(null)
      setReplyBody('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Inbox</h1>
        <p className="text-gray-500 text-sm mt-1">
          {messages.length} messages{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const count = t.key === 'unread' ? unreadCount
            : t.key === 'all' ? messages.length
            : t.key === 'unread' ? unreadCount
            : messages.filter(m => m.type === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                tab === t.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
              )}
            >
              {t.label}
              {count > 0 && (
                <span className={cn(
                  'text-xs rounded-full px-1.5 py-0.5 font-bold',
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-400">
            <p>No messages in this category.</p>
          </div>
        )}
        {filtered.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all',
              msg.read ? 'border-transparent' : 'border-green-500'
            )}
          >
            <button
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              onClick={() => toggle(msg.id, msg.read)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', msg.read ? 'text-gray-700' : 'text-gray-900 font-semibold')}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {msg.fromUser ? `${msg.fromUser.name ?? msg.fromUser.email} · ` : ''}
                    {formatDate(msg.createdAt)} at {formatTime(msg.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                  <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {msg.type.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </button>

            {expandedId === msg.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-3">{msg.body}</p>

                {/* Action buttons */}
                <div className="flex gap-3 mt-4 flex-wrap">
                  {msg.bookingId && (
                    <Link
                      href="/admin/bookings"
                      className="text-xs text-green-700 border border-green-200 hover:bg-green-50 rounded-lg px-3 py-1.5 transition-colors font-medium"
                    >
                      View Booking
                    </Link>
                  )}
                  {msg.fromUser && !replyingId && !repliedIds.has(msg.id) && (
                    <button
                      onClick={() => openReply(msg)}
                      className="text-xs text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors font-medium"
                    >
                      Reply
                    </button>
                  )}
                  {repliedIds.has(msg.id) && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Reply sent
                    </span>
                  )}
                </div>

                {/* Inline reply form */}
                {replyingId === msg.id && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Reply to {msg.fromUser?.name ?? msg.fromUser?.email}
                    </p>
                    <input
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={replySubject}
                      onChange={e => setReplySubject(e.target.value)}
                      placeholder="Subject"
                    />
                    <textarea
                      className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-28"
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      placeholder="Write your reply…"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setReplyingId(null); setReplyBody('') }}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => sendReply(msg.id)}
                        disabled={replySending || !replyBody.trim()}
                        className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 font-medium"
                      >
                        {replySending && <Loader2 className="w-3 h-3 animate-spin" />}
                        {replySending ? 'Sending…' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
