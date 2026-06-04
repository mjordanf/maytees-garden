'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show in editor mode
    const cookies = document.cookie.split(';').some(c => c.trim().startsWith('cms_editor_mode=1'))
    if (cookies) return

    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const respond = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('cookie_consent', choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9998] bg-green-800 text-white px-4 py-3 md:py-4"
      role="banner"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-green-100 leading-relaxed">
          🍪 We use cookies for authentication, language preferences, and cart state. No tracking or advertising cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => respond('accepted')}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => respond('declined')}
            className="px-4 py-2 border border-white/60 hover:border-white text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
