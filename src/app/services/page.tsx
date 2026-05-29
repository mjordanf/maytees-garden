import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Garden Services',
  description: "Landscape design, plant installation, plant rescue, and ongoing maintenance by Maytee's Garden Center — serving Miami, Coral Gables, Pinecrest, and all of South Florida.",
}

const process = [
  { step: '01', title: 'Initial Consultation', desc: 'Maytee visits your property, evaluates existing plants, discusses your vision, and takes detailed notes and photos.' },
  { step: '02', title: 'Design Proposal',      desc: 'You receive a written design plan with a recommended plant list, layout sketch, and itemized quote within 48 hours.' },
  { step: '03', title: 'Installation Day',     desc: 'Maytee and her team arrive with everything sourced and ready. Most residential installs are completed in a single day.' },
  { step: '04', title: 'Aftercare Support',    desc: 'You receive a seasonal care calendar tailored to your new garden, plus a follow-up call at 30 days to make sure everything is thriving.' },
]

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { active: true } })

  return (
    <div className="pt-20 bg-cream">

      {/* Hero */}
      <section className="bg-green-800 py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="font-serif text-5xl font-bold text-white mb-4">Garden Services</h1>
          <p className="text-green-200 text-xl leading-relaxed">
            From first consultation to long-term care — everything your South Florida garden deserves.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {services.map((service, i) => (
              <div key={service.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-lg ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                <div className={`relative h-72 lg:h-auto ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <Image src={service.imageUrl} alt={service.nameEn} fill className="object-cover" />
                </div>
                <div className={`bg-white p-8 lg:p-12 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <h2 className="font-serif text-3xl font-bold text-green-800 mb-1">{service.nameEn}</h2>
                  <p className="text-gray-400 italic text-sm mb-4">{service.nameEs}</p>
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
                    Book This Service <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From your first call to a thriving garden — a simple, four-step process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {process.map(p => (
              <div key={p.step} className="flex gap-5 p-6 bg-cream rounded-2xl border border-gray-100">
                <div className="font-serif text-4xl font-bold text-green-200 shrink-0 leading-none mt-1">{p.step}</div>
                <div>
                  <h3 className="font-serif font-bold text-green-800 text-lg mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Service Area</h2>
          <p className="text-green-200 mb-8">We serve residential and commercial clients across all of Miami-Dade County and parts of Broward County.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Miami','Coral Gables','Pinecrest','Kendall','Doral','Hialeah','Westchester','Miami Beach','South Miami','Cutler Bay','Homestead','Miami Lakes'].map(city => (
              <span key={city} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm">
                {city}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/booking" className="btn-terra">Schedule a Consultation</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
