'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AIChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Maytee's garden assistant 🌿 Ask me about plants, care tips, design ideas, or anything about South Florida gardening!" }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Sorry, I had trouble with that. Please try again!' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Feel free to call us at (786) 227-6616!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          open ? 'bg-gray-700 rotate-90' : 'bg-green-600 hover:bg-green-700 animate-float',
        )}
        aria-label="Open garden chat"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up">

          {/* Header */}
          <div className="bg-green-600 px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Maytee's Garden Assistant</p>
              <p className="text-green-200 text-xs">Ask me anything about plants 🌿</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 text-green-700" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-green-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-700 shadow-sm rounded-tl-sm',
                )}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <Leaf className="w-3.5 h-3.5 text-green-700" />
                </div>
                <div className="bg-white shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto">
              {['Best plants for shade?', 'Dog-friendly plants?', 'Book a consultation'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="shrink-0 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Ask about plants, care tips..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
