'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import AIChatWidget from '@/components/chat/AIChatWidget'

export default function MainLayout({ children, editorMode = false }: { children: React.ReactNode; editorMode?: boolean }) {
  const pathname = usePathname()
  const isSuperAdmin = pathname.startsWith('/superadmin')

  return (
    <>
      {!isSuperAdmin && <Navbar editorOffset={editorMode} />}
      <main className="min-h-screen">{children}</main>
      {!isSuperAdmin && <Footer />}
      {!isSuperAdmin && <AIChatWidget />}
    </>
  )
}
