import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { LayoutDashboard, Heart, Calendar, ShoppingBag, Settings, Leaf, MessageSquare } from 'lucide-react'
import { FLAGS } from '@/lib/phase-flags'

const navItems = [
  { href: '/portal',              icon: LayoutDashboard, label: 'Dashboard'         },
  { href: '/portal/favorites',    icon: Heart,           label: 'Saved Plants'      },
  { href: '/portal/appointments', icon: Calendar,        label: 'My Appointments'   },
  { href: '/portal/orders',       icon: ShoppingBag,     label: 'Order History'     },
  { href: '/portal/messages',     icon: MessageSquare,   label: 'Message Maytee'    },
  { href: '/portal/settings',     icon: Settings,        label: 'Account Settings'  },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.SHOW_PORTAL) redirect('/')

  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/portal')

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{session.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[140px]">{session.user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
