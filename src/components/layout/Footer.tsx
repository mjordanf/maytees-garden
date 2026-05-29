'use client'
import Link from 'next/link'
import { Leaf, Instagram, Facebook, MapPin, Clock, Phone } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl leading-none block">Maytee's</span>
                <span className="text-xs text-green-300 leading-none tracking-wide">Garden Center</span>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed mb-5">
              Miami's most beloved boutique nursery & landscape design studio — rescuing plants, transforming spaces, one garden at a time.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/maytees_garden_center/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-green-700 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/mayteesgardencenter/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-green-700 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.etsy.com/shop/MayteesGarden" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-green-700 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors text-xs font-bold">
                E
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Explore</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/plants',   label: 'Plant Catalog'    },
                { href: '/services', label: 'Garden Services'  },
                { href: '/gallery',  label: 'Project Gallery'  },
                { href: '/about',    label: 'About Maytee'     },
                { href: '/booking',  label: 'Book a Consultation' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-green-200 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Account</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/auth/login',           label: 'Log In'            },
                { href: '/auth/register',         label: 'Create Account'    },
                { href: '/portal',               label: 'My Dashboard'      },
                { href: '/portal/favorites',     label: 'Saved Plants'      },
                { href: '/portal/appointments',  label: 'My Appointments'   },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-green-200 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm tracking-wider uppercase">Find Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-green-200">
                <MapPin className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                15196 SW 184th St<br />Miami, FL 33187
              </li>
              <li className="flex items-center gap-2.5 text-sm text-green-200">
                <Clock className="w-4 h-4 text-green-400 shrink-0" />
                Mon–Sun: 9 AM – 5:30 PM<br />(Fri–Sat until 6 PM)
              </li>
              <li className="flex items-center gap-2.5 text-sm text-green-200">
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                (305) 555-GARDEN
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs text-green-300 mb-2 font-semibold uppercase tracking-wider">Plant Tips Newsletter</p>
              <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-lg text-sm bg-green-700 border border-green-600 text-white placeholder-green-400 focus:outline-none focus:border-green-400" />
                <button type="submit" className="px-3 py-2 bg-terra-500 hover:bg-terra-600 rounded-lg text-sm font-medium transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-green-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-green-400">
          <p>© {year} Maytee's Garden Center. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
