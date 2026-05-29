import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LayoutDashboard, Users, Leaf, Calendar, MessageSquare, FileText, Shield, Inbox } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role    = (session?.user as any)?.role

  if (!session || (role !== 'admin' && role !== 'staff' && role !== 'superadmin')) {
    redirect('/')
  }

  const unreadCount = await prisma.inboxMessage.count({ where: { read: false } })

  const navItems = [
    { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard',    badge: null },
    { href: '/admin/inbox',    icon: Inbox,           label: 'Inbox',        badge: unreadCount > 0 ? unreadCount : null },
    { href: '/admin/bookings', icon: Calendar,        label: 'Bookings',     badge: null },
    { href: '/admin/plants',   icon: Leaf,            label: 'Plant Catalog',badge: null },
    { href: '/admin/users',    icon: Users,           label: 'Customers',    badge: null },
    { href: '/admin/leads',    icon: MessageSquare,   label: 'Leads',        badge: null },
    { href: '/admin/logs',     icon: FileText,        label: 'Audit Logs',   badge: null },
  ]

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-green-800 rounded-2xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-5 border-b border-green-700">
                <Shield className="w-5 h-5 text-green-300" />
                <div>
                  <p className="text-white font-semibold text-sm">Admin Panel</p>
                  <p className="text-green-300 text-xs capitalize">{role}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map(({ href, icon: Icon, label, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-green-200 hover:bg-green-700 hover:text-white transition-colors font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{label}</span>
                    {badge !== null && (
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-green-700">
                <Link href="/" className="flex items-center gap-2 text-green-400 text-xs hover:text-green-200 transition-colors">
                  ← Back to Website
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
