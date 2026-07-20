'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ArrowRight, Tv, Leaf, Users, Award, MapPin } from 'lucide-react'
import { CARE_LEVELS, SUNLIGHT, formatCurrency } from '@/lib/utils'
import { c, type ContentMap } from '@/lib/content'
import { useI18n } from '@/lib/i18n'
import EditorOverlay from '@/components/cms/EditorOverlay'

type Plant = {
  id: string; nameEn: string; nameEs: string; descriptionEn: string; price: number
  imageUrl: string; category: string; inStock: boolean
  careLevel: keyof typeof CARE_LEVELS; sunlight: keyof typeof SUNLIGHT
  potSize: string | null; plantHeight: string | null
}
type Testimonial = { id: string; rating: number; textEn: string; name: string; location: string | null }
type Service = { id: string; imageUrl: string; nameEn: string; nameEs: string; descriptionEn: string; priceNote: string | null; price: number | null }
type GalleryItem = { id: string; imageUrl: string; captionEn: string | null }

interface Props {
  featuredPlants: Plant[]
  testimonials: Testimonial[]
  services: Service[]
  gallery: GalleryItem[]
  content: ContentMap
  isEditorMode: boolean
}

export default function HomeClient({ featuredPlants, testimonials, services, gallery, content, isEditorMode }: Props) {
  const { t, lang } = useI18n()

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80"
            alt="Beautiful Miami tropical garden"
            fill className="object-cover object-center"
            priority quality={90}
          />
          <div className="absolute inset-0 bg-hero-pattern" />
        </div>

        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6 animate-fade-in">
            <Tv className="w-3 h-3" />
            {t('hero.badge')}
          </div>

          <h1 data-cms-key="home.hero.headline" className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            {c(content, 'home.hero.headline', t('hero.headline'), lang)}
          </h1>

          <p data-cms-key="home.hero.subheadline" className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            {c(content, 'home.hero.subheadline', t('hero.subheadline'), lang)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link href="/booking" className="btn-terra text-base px-8 py-4 shadow-2xl">
              {t('hero.cta_primary')}
            </Link>
            <Link href="/plants" className="btn-secondary border-white text-white hover:bg-white hover:text-green-800 text-base px-8 py-4">
              {t('hero.cta_secondary')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/75 text-sm">
            {[
              { icon: <Users className="w-4 h-4" />, label: '500+ Gardens Transformed' },
              { icon: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />, label: '200+ Five-Star Reviews' },
              { icon: <MapPin className="w-4 h-4" />, label: 'Miami, FL · Open Daily' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {s.icon}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Why Maytee ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 data-cms-key="home.features.title" className="section-title">{c(content, 'home.features.title', t('features.title'), lang)}</h2>
            <p className="section-subtitle">The "lawyer of the plants" — advocating for your garden before ever picking up a shovel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🌱', titleKey: 'home.features.rescue_title', descKey: 'home.features.rescue_desc', titleFb: t('features.rescue.title'), descFb: t('features.rescue.desc') },
              { icon: '☀️', titleKey: 'home.features.local_title', descKey: 'home.features.local_desc', titleFb: t('features.local.title'), descFb: t('features.local.desc') },
              { icon: '🎨', titleKey: 'home.features.personal_title', descKey: 'home.features.personal_desc', titleFb: t('features.personal.title'), descFb: t('features.personal.desc') },
              { icon: '📺', titleKey: 'home.features.tv_title', descKey: 'home.features.tv_desc', titleFb: t('features.tv.title'), descFb: t('features.tv.desc') },
            ].map((f, i) => (
              <div key={i} className="text-center p-6 rounded-2xl hover:bg-green-50 transition-colors group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 data-cms-key={f.titleKey} className="font-serif text-lg font-bold text-green-800 mb-2">{c(content, f.titleKey, f.titleFb, lang)}</h3>
                <p data-cms-key={f.descKey} className="text-gray-500 text-sm leading-relaxed">{c(content, f.descKey, f.descFb, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Plants ── */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('plants.title')}</h2>
            <p className="section-subtitle">{t('plants.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlants.map(plant => (
              <Link key={plant.id} href={`/plants#${plant.id}`} className="card plant-card-hover group">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={plant.imageUrl}
                    alt={plant.nameEn}
                    unoptimized
                    fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge-green">{plant.category}</span>
                    {plant.inStock
                      ? <span className="badge bg-white/90 text-green-700">{t('plants.in_stock')}</span>
                      : <span className="badge bg-white/90 text-red-500">{t('plants.out_of_stock')}</span>}
                  </div>
                  <div className="absolute top-3 right-3 text-2xl">{SUNLIGHT[plant.sunlight]?.split(' ')[0]}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif font-bold text-green-800 text-lg leading-tight">{lang === 'es' ? plant.nameEs || plant.nameEn : plant.nameEn}</h3>
                    <span className="font-bold text-terra-500 text-lg shrink-0 ml-2">{formatCurrency(plant.price)}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic mb-3">{lang === 'es' ? plant.nameEn : plant.nameEs}</p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{plant.descriptionEn}</p>
                  {(plant.potSize || plant.plantHeight) && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {plant.potSize && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          🪴 {plant.potSize}
                        </span>
                      )}
                      {plant.plantHeight && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          📏 {plant.plantHeight}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                    <span>{CARE_LEVELS[plant.careLevel]}</span>
                    <span>{SUNLIGHT[plant.sunlight]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/plants" className="btn-primary">
              {t('plants.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-20 bg-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">{t('services.title')}</h2>
            <p className="text-green-200 text-lg max-w-2xl mx-auto">{t('services.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden group hover:bg-white/20 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image src={service.imageUrl} alt={service.nameEn} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-white text-xl mb-2">{lang === 'es' ? service.nameEs || service.nameEn : service.nameEn}</h3>
                  <p className="text-green-200 text-xs mb-3 italic">{lang === 'es' ? service.nameEn : service.nameEs}</p>
                  <p className="text-green-100 text-sm leading-relaxed line-clamp-2 mb-4">{service.descriptionEn}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 font-semibold text-sm">{service.priceNote ?? `Starting at $${service.price}`}</span>
                    <Link href="/booking" className="btn-terra text-sm py-2 px-4">
                      {t('services.book_service')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('gallery.title')}</h2>
            <p className="section-subtitle">{t('gallery.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((item, i) => (
              <div key={item.id} className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'col-span-2 row-span-2 h-96' : 'h-44'}`}>
                <Image src={item.imageUrl} alt={item.captionEn ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {item.captionEn && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-serif text-sm font-bold">{item.captionEn}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/gallery" className="btn-secondary">
              {t('gallery.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About Maytee ── */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden h-96 lg:h-[520px] shadow-2xl">
                <Image
                  src="/images/maytee-about.jpg"
                  alt="Maytee at her garden center"
                  unoptimized
                  fill className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-terra-500 text-white rounded-2xl p-5 shadow-xl max-w-[200px]">
                <div className="flex text-yellow-300 mb-1">{'★★★★★'}</div>
                <p className="font-serif font-bold text-lg">200+ Reviews</p>
                <p className="text-xs opacity-80">across Google & Yelp</p>
              </div>
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <Tv className="w-5 h-5 text-green-600 mb-1" />
                <p className="text-xs font-bold text-green-800">As Seen on TV</p>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-terra-500 text-sm font-semibold mb-4">
                <Leaf className="w-4 h-4" /> The Story Behind the Garden
              </div>
              <h2 className="font-serif text-4xl font-bold text-green-800 mb-6 leading-tight">
                {t('about.title')} — <br />
                <span className="text-terra-500">{t('about.subtitle')}</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Maytee founded Maytee's Garden Center with a mission that sets her apart: <strong>rescue first, plant second.</strong> Her philosophy — that every garden deserves an advocate before a bulldozer — earned her the nickname "the lawyer of the plants."
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Her expertise in South Florida's unique climate, her passion for rescuing overlooked specimens, and her eye for lush, personalized design have made her a fixture in Miami's gardening community — and a familiar face on South Florida television.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { n: '500+', l: 'Gardens Transformed' },
                  { n: '15+', l: 'Years of Experience'  },
                  { n: '200+', l: 'Five-Star Reviews'   },
                  { n: '4.9★', l: 'Average Rating'      },
                ].map(s => (
                  <div key={s.n} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="font-serif text-2xl font-bold text-green-700">{s.n}</div>
                    <div className="text-sm text-gray-500">{s.l}</div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="btn-primary">
                {t('about.read_more')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('testimonials.title')}</h2>
            <p className="section-subtitle">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(item => (
              <div key={item.id} className="bg-cream rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex text-yellow-400 mb-3">
                  {Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{item.textEn}"</p>
                <div>
                  <p className="font-semibold text-green-800 text-sm">{item.name}</p>
                  {item.location && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{item.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-br from-green-800 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="https://images.unsplash.com/photo-1534710961216-75c88202f43e?auto=format&fit=crop&w=1920&q=80" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 data-cms-key="home.cta.headline" className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            {c(content, 'home.cta.headline', 'Ready for Your Transformation?', lang)}
          </h2>
          <p data-cms-key="home.cta.subtext" className="text-green-200 text-lg mb-10 leading-relaxed">
            {c(content, 'home.cta.subtext', "Let Maytee design the garden you've always imagined. Book a consultation and get a personalized design proposal.", lang)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking" className="btn-terra text-base px-10 py-4 shadow-2xl">
              {t('booking.title')}
            </Link>
            <Link href="/contact" className="text-white border border-white/40 rounded-full px-8 py-4 text-base font-semibold hover:bg-white/10 transition-colors">
              {t('contact.submit')}
            </Link>
          </div>
        </div>
      </section>

      {isEditorMode && <EditorOverlay page="home" />}
    </div>
  )
}
