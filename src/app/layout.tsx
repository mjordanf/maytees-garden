import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { Providers } from './providers'
import MainLayout from '@/components/layout/MainLayout'
import EditorToolbar from '@/components/cms/EditorToolbar'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: "Maytee's Garden Center | Miami's Boutique Nursery & Landscape Design", template: "%s | Maytee's Garden Center" },
  description: "South Florida's most beloved boutique nursery and landscape design studio. Specializing in tropical, ornamental, and native plants for Miami's unique climate. Located in Miami, FL.",
  keywords: ['Miami nursery', 'South Florida landscaping', 'tropical plants Miami', 'landscape design Miami', 'boutique nursery Miami', 'Coral Gables gardening', 'Pinecrest landscape', 'Miami garden design'],
  authors: [{ name: "Maytee's Garden Center" }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mayteesgarden.com',
    siteName: "Maytee's Garden Center",
    title: "Maytee's Garden Center | Miami's Boutique Nursery",
    description: "Transform your outdoor space with South Florida's most trusted garden designer.",
    images: [{ url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&h=630&q=80', width: 1200, height: 630, alt: "Maytee's Garden Center" }],
  },
  other: {
    'schema:LocalBusiness': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: "Maytee's Garden Center",
      description: 'Boutique nursery and landscape design company in Miami, FL',
      address: { '@type': 'PostalAddress', streetAddress: '15196 SW 184th St', addressLocality: 'Miami', addressRegion: 'FL', postalCode: '33187', addressCountry: 'US' },
      telephone: '+1-305-555-0100',
      openingHours: 'Mo-Su 09:00-17:30',
      url: 'https://mayteesgarden.com',
      sameAs: ['https://www.instagram.com/maytees_garden_center/', 'https://www.facebook.com/mayteesgardencenter/'],
    }),
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-cream font-sans antialiased" style={isEditorMode ? { paddingTop: '48px' } : undefined}>
        {isEditorMode && <EditorToolbar pageName="Page" />}
        <Providers>
          <MainLayout editorMode={isEditorMode}>{children}</MainLayout>
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
