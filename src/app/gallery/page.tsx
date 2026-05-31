export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Project Gallery',
  description: 'View Maytee\'s completed garden transformations across Coral Gables, Pinecrest, Kendall, and greater Miami.',
}

export default async function GalleryPage() {
  const gallery = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })

  const realPhotos = [
    { id: 'r1',  imageUrl: '/gallery/project-nighttime-tropical-garden-1.jpg',       captionEn: 'Evening Garden Installation — Miami',               captionEs: 'Instalación de Jardín Nocturno — Miami',              category: 'residential' },
    { id: 'r2',  imageUrl: '/gallery/project-white-mansion-bougainvillea-1.jpg',      captionEn: 'Coral Gables Estate — Bougainvillea Entrance',       captionEs: 'Finca en Coral Gables — Entrada de Buganvilla',       category: 'residential' },
    { id: 'r3',  imageUrl: '/gallery/project-curved-brick-path-1.jpg',               captionEn: 'Curved Brick Pathway with Tropical Border',          captionEs: 'Camino de Ladrillo con Borde Tropical',               category: 'residential' },
    { id: 'r4',  imageUrl: '/gallery/project-red-bromeliads-path-1.jpg',             captionEn: 'Red Bromeliads Along Garden Path',                   captionEs: 'Bromelias Rojas a lo Largo del Sendero',              category: 'residential' },
    { id: 'r5',  imageUrl: '/gallery/project-mediterranean-house-awnings-1.jpg',     captionEn: 'Mediterranean-Style Residence — Pinecrest',          captionEs: 'Residencia de Estilo Mediterráneo — Pinecrest',       category: 'residential' },
    { id: 'r6',  imageUrl: '/gallery/project-bromeliad-succulent-garden-1.jpg',      captionEn: 'Bromeliad & Succulent Garden Bed',                   captionEs: 'Jardín de Bromelias y Suculentas',                    category: 'residential' },
    { id: 'r7',  imageUrl: '/gallery/nursery-orchids-driftwood-display-1.jpg',       captionEn: 'Orchid Driftwood Display — Maytee\'s Garden Center', captionEs: 'Exhibición de Orquídeas en Madera — Vivero',          category: 'nursery' },
    { id: 'r8',  imageUrl: '/gallery/project-tree-base-bromeliads-black-rocks-1.jpg',captionEn: 'Tree Base Planting with River Rocks',                captionEs: 'Plantación en Base de Árbol con Rocas de Río',        category: 'residential' },
    { id: 'r9',  imageUrl: '/gallery/project-lakeside-garden-black-swans-1.jpg',     captionEn: 'Lakeside Garden — Bromeliads & Black Swans',         captionEs: 'Jardín Lacustre — Bromelias y Cisnes Negros',         category: 'residential' },
    { id: 'r10', imageUrl: '/gallery/project-tropical-waterfall-patio-1.jpg',        captionEn: 'Tropical Waterfall & Stone Patio',                   captionEs: 'Cascada Tropical y Patio de Piedra',                  category: 'residential' },
    { id: 'r11', imageUrl: '/gallery/project-jasmine-pathway-lush-1.jpg',            captionEn: 'Jasmine-Lined Garden Pathway',                       captionEs: 'Sendero de Jardín con Jazmín',                        category: 'residential' },
    { id: 'r12', imageUrl: '/gallery/project-purple-vine-arbor-path-1.jpg',          captionEn: 'Purple Vine Arbor — Coral Gables',                   captionEs: 'Pérgola con Enredadera Morada — Coral Gables',        category: 'residential' },
    { id: 'r13', imageUrl: '/gallery/project-spanish-house-fountain-formal-1.jpg',   captionEn: 'Spanish Colonial — Formal Fountain Garden',          captionEs: 'Colonial Español — Jardín Formal con Fuente',         category: 'residential' },
    { id: 'r14', imageUrl: '/gallery/project-tiki-hut-tropical-pond-1.jpg',          captionEn: 'Tiki Hut Overlooking Tropical Pond',                 captionEs: 'Cabaña con Vista al Estanque Tropical',               category: 'residential' },
    { id: 'r15', imageUrl: '/gallery/project-garden-swing-pergola-flowers-1.jpg',    captionEn: 'Garden Swing Pergola with Flowering Vines',          captionEs: 'Pérgola con Columpio y Enredaderas Floridas',         category: 'residential' },
    { id: 'r16', imageUrl: '/gallery/project-gray-house-tropical-makeover-1.jpg',    captionEn: 'Front Yard Transformation — Kendall',                captionEs: 'Transformación de Jardín Delantero — Kendall',        category: 'residential' },
    { id: 'r17', imageUrl: '/gallery/project-gray-house-sea-grape-tree-1.jpg',       captionEn: 'Sea Grape Tree Landscape — Kendall',                 captionEs: 'Paisajismo con Uva de Mar — Kendall',                 category: 'residential' },
    { id: 'r18', imageUrl: '/gallery/project-waterfall-pond-garden-1.jpg',           captionEn: 'Waterfall & Koi Pond Installation',                  captionEs: 'Instalación de Cascada y Estanque Koi',               category: 'residential' },
    { id: 'r19', imageUrl: '/gallery/project-poolside-tropical-garden-1.jpg',        captionEn: 'Poolside Tropical Garden — Doral',                   captionEs: 'Jardín Tropical junto a la Piscina — Doral',          category: 'residential' },
    { id: 'r20', imageUrl: '/gallery/project-front-yard-palms-formal-1.jpg',         captionEn: 'Formal Front Yard with Royal Palms',                 captionEs: 'Jardín Delantero Formal con Palmas Reales',           category: 'residential' },
    { id: 'r21', imageUrl: '/gallery/nursery-bromeliads-sago-palm-1.jpg',            captionEn: 'Maytee\'s Garden Center — Plant Selection',          captionEs: 'Centro de Jardín de Maytee — Selección de Plantas',   category: 'nursery' },
    { id: 'r22', imageUrl: '/gallery/media-tv-appearance-1.jpg',                     captionEn: 'Maytee on Local Television — Garden Expert',         captionEs: 'Maytee en Televisión Local — Experta en Jardines',    category: 'media' },
    { id: 'r23', imageUrl: '/gallery/maytee-nursery-overalls-full-body-1.jpg',       captionEn: 'Maytee at the Nursery',                              captionEs: 'Maytee en el Vivero',                                 category: 'nursery' },
  ]

  const allItems = [...gallery, ...realPhotos.filter(r => !gallery.find(g => g.imageUrl === r.imageUrl))]

  return (
    <div className="pt-20 bg-cream">

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="section-title text-4xl md:text-5xl">Project Gallery</h1>
            <p className="section-subtitle">Real transformations across greater Miami — before-and-after moments captured in every garden we touch.</p>
          </div>

          {/* Masonry-style grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {allItems.map((item, i) => (
              <div key={item.id} className={`break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer relative ${i % 5 === 0 ? 'aspect-video' : 'aspect-square'}`}>
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
