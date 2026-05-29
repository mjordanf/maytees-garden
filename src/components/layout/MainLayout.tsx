'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import AIChatWidget from '@/components/chat/AIChatWidget'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSuperAdmin = pathname.startsWith('/superadmin')

  return (
    <>
      {!isSuperAdmin && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!isSuperAdmin && <Footer />}
      {!isSuperAdmin && <AIChatWidget />}
    </>
  )
}
