export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ArrowRight } from 'lucide-react'
import GalleryEditor from '@/components/cms/GalleryEditor'

export const metadata: Metadata = {
  title: 'Project Gallery',
  description: 'View Maytee\'s completed garden transformations across Coral Gables, Pinecrest, Kendall, and greater Miami.',
}

export default async function GalleryPage() {
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  const gallery = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="pt-20 bg-cream">

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="section-title text-4xl md:text-5xl">Project Gallery</h1>
            <p className="section-subtitle">Real transformations across greater Miami — before-and-after moments captured in every garden we touch.</p>
          </div>

          {isEditorMode ? (
            /* Editor mode: interactive gallery manager */
            <GalleryEditor initialItems={gallery} />
          ) : (
            /* Normal mode: static read-only grid */
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {gallery.map((item, i) => (
                <div key={item.id}
                  className={`break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer relative ${i % 5 === 0 ? 'aspect-video' : 'aspect-square'}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.captionEn ?? 'Garden project'}
                    unoptimized
                    fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-serif font-bold text-sm">{item.captionEn}</p>
                    <span className="text-white/70 text-xs capitalize">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Note about Instagram */}
      <section className="py-12 bg-green-50 border-t border-green-100">
        <div className="max-w-2xl mx-auto text-center px-4">
          <p className="text-green-700 font-semibold mb-2">📸 More on Instagram</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Follow <strong>@maytees_garden_center</strong> on Instagram for daily plant inspiration, project reveals, and behind-the-scenes garden transformations across South Florida.
          </p>
          <a href="https://www.instagram.com/maytees_garden_center/" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
            Follow on Instagram <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-800 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready for Your Transformation?</h2>
          <p className="text-green-200 mb-8">Let Maytee design the garden you've always imagined. Book a consultation and get a personalized design proposal.</p>
          <Link href="/booking" className="btn-terra">Book a Consultation</Link>
        </div>
      </section>

    </div>
  )
}
