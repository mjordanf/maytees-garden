'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { c, type ContentMap } from '@/lib/content'
import { useI18n } from '@/lib/i18n'
import EditorOverlay from '@/components/cms/EditorOverlay'
import ServicesEditor from '@/components/cms/ServicesEditor'
import type { Service } from '@prisma/client'

interface Props {
  services: Service[]
  content: ContentMap
  isEditorMode: boolean
}

export default function ServicesClient({ services, content, isEditorMode }: Props) {
  const { t, lang } = useI18n()

  const process = [
    { step: '01', titleKey: 'services.process.step1_title', descKey: 'services.process.step1_desc', titleFallback: 'Initial Consultation',  descFallback: 'Maytee visits your property, evaluates existing plants, discusses your vision, and takes detailed notes and photos.' },
    { step: '02', titleKey: 'services.process.step2_title', descKey: 'services.process.step2_desc', titleFallback: 'Design Proposal',       descFallback: 'You receive a written design plan with a recommended plant list, layout sketch, and itemized quote within 48 hours.' },
    { step: '03', titleKey: 'services.process.step3_title', descKey: 'services.process.step3_desc', titleFallback: 'Installation Day',      descFallback: "Maytee and her team arrive with everything sourced and ready. Most residential installs are completed in a single day." },
    { step: '04', titleKey: 'services.process.step4_title', descKey: 'services.process.step4_desc', titleFallback: 'Aftercare Support',     descFallback: 'You receive a seasonal care calendar tailored to your new garden, plus a follow-up call at 30 days.' },
  ]

  return (
    <div className="pt-20 bg-cream">

      {/* Hero */}
      <section className="bg-green-800 py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 data-cms-key="services.hero.headline"
            className="font-serif text-5xl font-bold text-white mb-4">
            {c(content, 'services.hero.headline', t('services.title'), lang)}
          </h1>
          <p data-cms-key="services.hero.subtitle"
            className="text-green-200 text-xl leading-relaxed">
            {c(content, 'services.hero.subtitle', t('services.subtitle'), lang)}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isEditorMode ? (
            <ServicesEditor initialServices={services} />
          ) : (
            <div className="space-y-8">
              {services.map((service, i) => (
                <div key={service.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-lg ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                  <div className={`relative h-72 lg:h-auto ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <Image src={service.imageUrl} alt={service.nameEn} fill className="object-cover" />
                  </div>
                  <div className={`bg-white p-8 lg:p-12 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                    <h2 className="font-serif text-3xl font-bold text-green-800 mb-1">{lang === 'es' ? service.nameEs || service.nameEn : service.nameEn}</h2>
                    <p className="text-gray-400 italic text-sm mb-4">{lang === 'es' ? service.nameEn : service.nameEs}</p>
                    <p className="text-gray-600 leading-relaxed mb-6">{service.descriptionEn}</p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-gray-400">Investment</p>
                        <p className="font-semibold text-green-700 text-sm">{service.priceNote ?? (service.price ? formatCurrency(service.price) : 'Custom quote')}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="font-semibold text-green-700 text-sm flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration} min</p>
                      </div>
                    </div>
                    <Link href="/booking" className="btn-primary w-fit">
                      {t('services.book_service')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 data-cms-key="services.process.title" className="section-title">
              {c(content, 'services.process.title', 'How It Works', lang)}
            </h2>
            <p data-cms-key="services.process.subtitle" className="section-subtitle">
              {c(content, 'services.process.subtitle', 'From your first call to a thriving garden — a simple, four-step process.', lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {process.map(p => (
              <div key={p.step} className="flex gap-5 p-6 bg-cream rounded-2xl border border-gray-100">
                <div className="font-serif text-4xl font-bold text-green-200 shrink-0 leading-none mt-1">{p.step}</div>
                <div>
                  <h3 data-cms-key={p.titleKey} className="font-serif font-bold text-green-800 text-lg mb-2">
                    {c(content, p.titleKey, p.titleFallback, lang)}
                  </h3>
                  <p data-cms-key={p.descKey} className="text-gray-600 text-sm leading-relaxed">
                    {c(content, p.descKey, p.descFallback, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 data-cms-key="services.area.headline" className="font-serif text-3xl font-bold mb-4">
            {c(content, 'services.area.headline', 'Service Area', lang)}
          </h2>
          <p data-cms-key="services.area.subtitle" className="text-green-200 mb-8">
            {c(content, 'services.area.subtitle', 'We serve residential and commercial clients across all of Miami-Dade County and parts of Broward County.', lang)}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Miami','Coral Gables','Pinecrest','Kendall','Doral','Hialeah','Westchester','Miami Beach','South Miami','Cutler Bay','Homestead','Miami Lakes'].map(city => (
              <span key={city} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm">{city}</span>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/booking" className="btn-terra">{t('booking.title')}</Link>
          </div>
        </div>
      </section>

      {/* Editor overlay for text content (non-service-card text) */}
      {isEditorMode && <EditorOverlay page="services" />}

    </div>
  )
}
