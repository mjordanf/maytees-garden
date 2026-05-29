'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, User, LayoutDashboard, LogOut, Shield } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const { t, lang, setLang } = useI18n()
  const pathname = usePathname()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const role = (session?.user as any)?.role

  const navLinks = [
    { href: '/plants',   label: t('nav.plants')   },
    { href: '/services', label: t('nav.services')  },
    { href: '/gallery',  label: t('nav.gallery')   },
    { href: '/about',    label: t('nav.about')     },
    { href: '/contact',  label: t('nav.contact')   },
  ]

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled || open
        ? 'bg-white/95 backdrop-blur-md shadow-md'
        : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Image src="/logo.jpg" alt="Maytee's Garden" width={52} height={52} className="rounded-full" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'nav-link',
                  pathname === link.href && 'text-green-700 font-semibold',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="text-xs font-bold text-gray-500 hover:text-green-700 transition-colors border border-gray-200 rounded-full px-3 py-1 hover:border-green-500"
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>

            <Link href="/booking" className="btn-primary text-sm py-2">
              {t('nav.booking')}
            </Link>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 font-medium"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-700" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <Link href="/portal" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700" onClick={() => setUserMenu(false)}>
                      <LayoutDashboard className="w-4 h-4" /> {t('nav.portal')}
                    </Link>
                    {(role === 'admin' || role === 'staff') && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700" onClick={() => setUserMenu(false)}>
                        <Shield className="w-4 h-4" /> {t('nav.admin')}
                      </Link>
                    )}
                    {role === 'superadmin' && (
                      <Link href="/superadmin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-amber-600 font-medium" onClick={() => setUserMenu(false)}>
                        <Shield className="w-4 h-4" /> Super Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setUserMenu(false) }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-red-500 w-full"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-green-700">
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-green-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Link href="/booking" className="btn-primary w-full text-center text-sm" onClick={() => setOpen(false)}>
              {t('nav.booking')}
            </Link>
            {session ? (
              <>
                <Link href="/portal" className="block text-center py-2 text-sm text-green-700 font-medium" onClick={() => setOpen(false)}>{t('nav.portal')}</Link>
                {(role === 'admin' || role === 'staff') && (
                  <Link href="/admin" className="block text-center py-2 text-sm text-green-700 font-medium" onClick={() => setOpen(false)}>{t('nav.admin')}</Link>
                )}
                {role === 'superadmin' && (
                  <Link href="/superadmin" className="block text-center py-2 text-sm text-amber-600 font-semibold" onClick={() => setOpen(false)}>Super Admin</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-center py-2 text-sm text-red-500 font-medium">{t('nav.logout')}</button>
              </>
            ) : (
              <Link href="/auth/login" className="block text-center py-2 text-sm text-green-700 font-medium" onClick={() => setOpen(false)}>{t('nav.login')}</Link>
            )}
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="w-full text-center py-2 text-xs font-bold text-gray-400 border border-gray-200 rounded-lg"
            >
              Switch to {lang === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
