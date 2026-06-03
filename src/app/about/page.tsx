import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Tv, Leaf, Award, MapPin, Clock, ArrowRight, Quote } from 'lucide-react'
import { getContent, c } from '@/lib/content'
import EditorOverlay from '@/components/cms/EditorOverlay'
import { ImageReplaceButton } from '@/components/cms/AboutImageEditor'

export const metadata: Metadata = {
  title: 'About Maytee',
  description: "Meet Maytee — South Florida's plant advocate, landscape designer, and the founder of Maytee's Garden Center in Miami, FL.",
}

const milestones = [
  { year: '2008', event: 'Maytee\'s Garden Center opens at 15196 SW 184th St, Miami' },
  { year: '2012', event: 'First TV appearance on South Florida gardening segment' },
  { year: '2015', event: 'Expands to offer full landscape design consultations' },
  { year: '2018', event: '200th garden transformation completed across South Florida' },
  { year: '2021', event: 'Featured in regional gardening media as Miami\'s top boutique nursery' },
  { year: '2024', event: 'Launches customer portal and online plant catalog' },
]

export default async function AboutPage() {
  const content = await getContent('about')
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  // Fetch image block IDs for editor replace buttons
  const imgBlockIds = isEditorMode
    ? await (async () => {
        const { prisma } = await import('@/lib/prisma')
        const blocks = await prisma.contentBlock.findMany({
          where: { key: { in: ['about.photo.main','about.photo.thumb1','about.photo.thumb2','about.photo.thumb3'] } },
          select: { id: true, key: true },
        })
        return Object.fromEntries(blocks.map(b => [b.key, b.id]))
      })()
    : {} as Record<string, string>

  return (
    <div className="pt-20 bg-cream">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-green-800">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&w=1920&q=80"
            alt="Maytee's Garden Center"
            fill className="object-cover opacity-25"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 tracking-widest uppercase mb-6">
            <Tv className="w-3 h-3" /> As Seen on South Florida TV
          </div>
          <h1 data-cms-key="about.hero.headline" className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
            {c(content, 'about.hero.headline', 'Meet Maytee — The Lawyer of the Plants')}
          </h1>
          <p data-cms-key="about.hero.tagline" className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {c(content, 'about.hero.tagline', 'Every garden deserves an advocate before a bulldozer.')}
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="relative rounded-3xl overflow-hidden h-[560px] shadow-2xl">
                <Image
                  src={c(content, 'about.photo.main', '/images/maytee-about.jpg')}
                  alt="Maytee examining a plant at her nursery"
                  data-cms-img="about.photo.main"
                  unoptimized fill className="object-cover object-top"
                />
                {isEditorMode && imgBlockIds['about.photo.main'] && (
                  <ImageReplaceButton blockKey="about.photo.main" blockId={imgBlockIds['about.photo.main']} label="Main Portrait" />
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {([
                  { key: 'about.photo.thumb1', fallback: '/gallery/project-nighttime-tropical-garden-1.jpg' },
                  { key: 'about.photo.thumb2', fallback: '/gallery/project-lakeside-garden-black-swans-1.jpg' },
                  { key: 'about.photo.thumb3', fallback: '/gallery/project-gray-house-tropical-makeover-1.jpg' },
                ] as const).map(({ key, fallback }) => (
                  <div key={key} className="relative h-24 rounded-xl overflow-hidden">
                    <Image src={c(content, key, fallback)} alt="" data-cms-img={key} unoptimized fill className="object-cover" />
                    {isEditorMode && imgBlockIds[key] && (
                      <ImageReplaceButton blockKey={key} blockId={imgBlockIds[key]} label="Thumbnail" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-terra-500 font-semibold text-sm mb-4">
                <Leaf className="w-4 h-4" /> The Story
              </div>
              <h2 data-cms-key="about.story.title" className="font-serif text-4xl font-bold text-green-800 mb-6 leading-tight">
                {c(content, 'about.story.title', 'Rescue First. Plant Second.')}
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p data-cms-key="about.bio.paragraph1">
                  {c(content, 'about.bio.paragraph1', "Maytee founded Maytee's Garden Center with a mission that sets her apart from every other landscaper in South Florida: she evaluates before she removes. While most contractors arrive with shovels, Maytee arrives with a clipboard — cataloging what's already growing, what can be saved, and what truly needs to go.")}
                </p>
                <p data-cms-key="about.bio.paragraph2">
                  {c(content, 'about.bio.paragraph2', 'This philosophy earned her the nickname "the lawyer of the plants" among her growing community of clients across Coral Gables, Pinecrest, Kendall, Doral, and greater Miami. Her approach consistently saves clients money, preserves mature specimens that take years to grow, and results in gardens that feel deeply rooted in their environment — because they are.')}
                </p>
                <p>
                  Over 15+ years, Maytee has built one of Miami&apos;s most trusted boutique nurseries at 15196 SW 184th St — a destination for rare tropicals, native Florida species, and her trademark curated collections of plants that actually thrive in our unique climate. Her expertise has drawn the attention of South Florida media, earning her spots on local television as the go-to expert for Miami gardening.
                </p>
              </div>

              <blockquote className="mt-8 border-l-4 border-terra-500 pl-5 py-2">
                <div className="flex items-start gap-2">
                  <Quote className="w-5 h-5 text-terra-400 shrink-0 mt-0.5" />
                  <p data-cms-key="about.bio.quote" className="font-serif text-xl text-green-800 italic leading-relaxed">
                    &ldquo;{c(content, 'about.bio.quote', 'Every plant has a story. My job is to make sure it gets a chance to finish telling it.')}&rdquo;
                  </p>
                </div>
                <p className="text-gray-400 text-sm mt-2 ml-7">— Maytee</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-green-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div>
              <div data-cms-key="about.stats.gardens" className="font-serif text-4xl font-bold text-green-300">{c(content, 'about.stats.gardens', '500+')}</div>
              <div className="text-green-200 text-sm mt-1">Gardens Transformed</div>
            </div>
            <div>
              <div data-cms-key="about.stats.years" className="font-serif text-4xl font-bold text-green-300">{c(content, 'about.stats.years', '15+')}</div>
              <div className="text-green-200 text-sm mt-1">Years of Expertise</div>
            </div>
            <div>
              <div data-cms-key="about.stats.reviews" className="font-serif text-4xl font-bold text-green-300">{c(content, 'about.stats.reviews', '200+')}</div>
              <div className="text-green-200 text-sm mt-1">5-Star Reviews</div>
            </div>
            <div>
              <div data-cms-key="about.stats.rating" className="font-serif text-4xl font-bold text-green-300">{c(content, 'about.stats.rating', '4.9★')}</div>
              <div className="text-green-200 text-sm mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Media/TV */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Tv className="w-4 h-4" /> As Featured In
            </div>
            <h2 className="section-title">South Florida's Trusted Garden Voice</h2>
            <p className="section-subtitle">Maytee's expertise has been recognized by local media across the region</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { channel: 'Local TV Segment', title: 'Best Tropical Plants for Miami Backyards', desc: 'Maytee shares her top 5 plant picks for South Florida homeowners looking to add color and shade without the maintenance headache.' },
              { channel: 'Morning News Feature', title: 'Plant Rescue: Saving Miami\'s Gardens', desc: 'A special segment on Maytee\'s unique philosophy of evaluating and rescuing existing plants before any landscape renovation begins.' },
              { channel: 'Home & Garden Show', title: 'Miami-Style Garden Design Masterclass', desc: 'Maytee demonstrates how to create a lush, tropical, low-maintenance garden that thrives in Miami\'s intense summer heat and humidity.' },
            ].map((f, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-terra-500" />
                  <span className="text-xs font-semibold text-terra-500 uppercase tracking-wider">{f.channel}</span>
                </div>
                <h3 className="font-serif font-bold text-green-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">The Maytee's Garden Story</h2>
          </div>
          <div className="relative">
            <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-green-200" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="w-16 shrink-0 text-right">
                    <span className="font-serif font-bold text-green-600 text-sm">{m.year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow" />
                    <p className="text-gray-700 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 data-cms-key="about.visit.headline" className="section-title">
            {c(content, 'about.visit.headline', 'Come Visit Us')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-600 rounded-full text-white flex items-center justify-center mx-auto mb-3"><MapPin className="w-5 h-5" /></div>
              <h3 className="font-serif font-bold text-green-800 mb-2">Address</h3>
              <p data-cms-key="about.visit.address" className="text-gray-600 text-sm whitespace-pre-line">{c(content, 'about.visit.address', '15196 SW 184th St\nMiami, FL 33187')}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-600 rounded-full text-white flex items-center justify-center mx-auto mb-3"><Clock className="w-5 h-5" /></div>
              <h3 className="font-serif font-bold text-green-800 mb-2">Hours</h3>
              <p data-cms-key="about.visit.hours" className="text-gray-600 text-sm whitespace-pre-line">{c(content, 'about.visit.hours', 'Mon–Sun 9 AM – 5:30 PM (Fri–Sat until 6 PM)')}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-600 rounded-full text-white flex items-center justify-center mx-auto mb-3"><Award className="w-5 h-5" /></div>
              <h3 className="font-serif font-bold text-green-800 mb-2">Contact</h3>
              <p data-cms-key="about.visit.contact" className="text-gray-600 text-sm whitespace-pre-line">
                {c(content, 'about.visit.contact', '(786) 227-6616\ninfo@mayteesgardencenter.com')}
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary">Book a Consultation <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/contact" className="btn-secondary">Send a Message</Link>
          </div>
        </div>
      </section>

      {isEditorMode && <EditorOverlay page="about" />}
    </div>
  )
}
