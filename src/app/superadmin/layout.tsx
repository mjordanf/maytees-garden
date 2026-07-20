export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Settings, LayoutDashboard, ArrowLeft, Shield, FileText } from 'lucide-react'
import { FLAGS } from '@/lib/phase-flags'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.SHOW_ADMIN) redirect('/')

  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (!session || role !== 'superadmin') redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Super Admin</span>
          </div>
          <p className="text-xs text-gray-500">mayteesgardencenter.com</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/superadmin',          icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/superadmin/users',    icon: Users,           label: 'User Management' },
            { href: '/superadmin/settings', icon: Settings,        label: 'Website Settings' },
            { href: '/superadmin/content',  icon: FileText,        label: 'Content' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Business Admin
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-950">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
