'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import AIChatWidget from '@/components/chat/AIChatWidget'
import { FLAGS } from '@/lib/phase-flags'
import type { ContentMap } from '@/lib/content'

export default function MainLayout({ children, editorMode = false, footerContent }: { children: React.ReactNode; editorMode?: boolean; footerContent?: ContentMap }) {
  const pathname = usePathname()
  const isSuperAdmin = pathname.startsWith('/superadmin')

  return (
    <>
      {!isSuperAdmin && <Navbar editorOffset={editorMode} />}
      <main className="min-h-screen">{children}</main>
      {!isSuperAdmin && <Footer content={footerContent} />}
      {!isSuperAdmin && FLAGS.SHOW_AI_CHAT && <AIChatWidget />}
    </>
  )
}
