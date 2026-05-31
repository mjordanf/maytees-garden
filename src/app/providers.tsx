'use client'
import { SessionProvider } from 'next-auth/react'
import { I18nProvider } from '@/lib/i18n'
import { CartProvider } from '@/lib/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <CartProvider>{children}</CartProvider>
      </I18nProvider>
    </SessionProvider>
  )
}
