const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const blocks = [
  // HOME
  { key: 'home.hero.tagline',             page: 'home',    label: 'Hero Tagline',         type: 'text',     valueEn: "Miami's Most Beloved Nursery & Garden Designer",                                                           valueEs: 'La Guardería y Diseñadora Más Querida de Miami' },
  { key: 'home.hero.headline',            page: 'home',    label: 'Hero Headline',         type: 'text',     valueEn: 'Transform Your Garden Into a Tropical Paradise',                                                            valueEs: 'Transforma Tu Jardín en un Paraíso Tropical' },
  { key: 'home.hero.subheadline',         page: 'home',    label: 'Hero Subheadline',      type: 'richtext', valueEn: "Maytee rescues, designs, and installs stunning South Florida gardens — tailored to your home, your climate, and your life.", valueEs: 'Maytee rescata, diseña e instala impresionantes jardines en el sur de Florida.' },
  { key: 'home.hero.cta_primary',         page: 'home',    label: 'Primary Button',        type: 'text',     valueEn: 'Book a Free Consultation',                                                                                  valueEs: 'Reservar una Consulta Gratis' },
  { key: 'home.hero.cta_secondary',       page: 'home',    label: 'Secondary Button',      type: 'text',     valueEn: 'Explore Plants',                                                                                            valueEs: 'Explorar Plantas' },
  { key: 'home.features.title',           page: 'home',    label: 'Features Title',        type: 'text',     valueEn: 'Why South Florida Chooses Maytee',                                                                          valueEs: 'Por Qué el Sur de Florida Elige a Maytee' },
  { key: 'home.features.rescue_title',    page: 'home',    label: 'Feature 1 Title',       type: 'text',     valueEn: 'Plant Rescue First',                                                                                        valueEs: 'Primero el Rescate de Plantas' },
  { key: 'home.features.rescue_desc',     page: 'home',    label: 'Feature 1 Description', type: 'richtext', valueEn: "We evaluate before we remove. Maytee's signature approach saves your existing plants and your budget.",    valueEs: 'Evaluamos antes de remover. El enfoque especial de Maytee salva sus plantas existentes.' },
  { key: 'home.features.local_title',     page: 'home',    label: 'Feature 2 Title',       type: 'text',     valueEn: 'Miami Climate Expert',                                                                                      valueEs: 'Experta en el Clima de Miami' },
  { key: 'home.features.local_desc',      page: 'home',    label: 'Feature 2 Description', type: 'richtext', valueEn: "Every plant recommendation is tailored to South Florida's unique heat, humidity, and tropical growing season.", valueEs: 'Cada recomendación está adaptada al calor y humedad únicos del sur de Florida.' },
  { key: 'home.features.personal_title',  page: 'home',    label: 'Feature 3 Title',       type: 'text',     valueEn: 'Deeply Personal Design',                                                                                    valueEs: 'Diseño Profundamente Personal' },
  { key: 'home.features.personal_desc',   page: 'home',    label: 'Feature 3 Description', type: 'richtext', valueEn: "No cookie-cutter gardens. Every design reflects your taste, lifestyle, and the soul of your home.",        valueEs: 'Sin jardines genéricos. Cada diseño refleja su gusto y estilo de vida.' },
  { key: 'home.features.tv_title',        page: 'home',    label: 'Feature 4 Title',       type: 'text',     valueEn: 'As Seen on TV',                                                                                             valueEs: 'Como se Ve en la TV' },
  { key: 'home.features.tv_desc',         page: 'home',    label: 'Feature 4 Description', type: 'richtext', valueEn: "Featured in South Florida media — bringing professional-grade expertise and passion to every client.",     valueEs: 'Destacada en los medios del sur de Florida.' },
  { key: 'home.cta.headline',             page: 'home',    label: 'CTA Headline',          type: 'text',     valueEn: 'Ready for Your Transformation?',                                                                            valueEs: '¿Listo para su Transformación?' },
  { key: 'home.cta.subtext',              page: 'home',    label: 'CTA Subtext',           type: 'richtext', valueEn: "Let Maytee design the garden you've always imagined. Book a consultation and get a personalized design proposal.", valueEs: 'Deje que Maytee diseñe el jardín que siempre ha imaginado.' },
  // ABOUT
  { key: 'about.hero.headline',           page: 'about',   label: 'About Headline',        type: 'text',     valueEn: 'Meet Maytee — The Lawyer of the Plants',                                                                    valueEs: 'Conoce a Maytee — La Abogada de las Plantas' },
  { key: 'about.hero.tagline',            page: 'about',   label: 'About Tagline',         type: 'text',     valueEn: 'Every garden deserves an advocate before a bulldozer.',                                                      valueEs: 'Todo jardín merece un defensor antes de una excavadora.' },
  { key: 'about.bio.paragraph1',          page: 'about',   label: 'Bio Paragraph 1',       type: 'richtext', valueEn: "Maytee founded Maytee's Garden Center with a mission that sets her apart from every other landscaper in South Florida: she evaluates before she removes. While most contractors arrive with shovels, Maytee arrives with a clipboard — cataloging what's already growing, what can be saved, and what truly needs to go.", valueEs: 'Maytee fundó Maytee\'s Garden Center con una misión que la distingue de todos los demás paisajistas del sur de Florida.' },
  { key: 'about.bio.paragraph2',          page: 'about',   label: 'Bio Paragraph 2',       type: 'richtext', valueEn: 'This philosophy earned her the nickname "the lawyer of the plants" among her growing community of clients across Coral Gables, Pinecrest, Kendall, Doral, and greater Miami. Her approach consistently saves clients money, preserves mature specimens that take years to grow, and results in gardens that feel deeply rooted in their environment — because they are.', valueEs: 'Esta filosofía le valió el apodo de "la abogada de las plantas" entre su creciente comunidad de clientes.' },
  { key: 'about.bio.quote',               page: 'about',   label: "Maytee's Quote",        type: 'text',     valueEn: "Every plant has a story. My job is to make sure it gets a chance to finish telling it.",                    valueEs: 'Cada planta tiene una historia. Mi trabajo es asegurarme de que tenga la oportunidad de terminar de contarla.' },
  { key: 'about.stats.gardens',           page: 'about',   label: 'Stat: Gardens',         type: 'text',     valueEn: '500+',                                                                                                      valueEs: '500+' },
  { key: 'about.stats.years',             page: 'about',   label: 'Stat: Years',           type: 'text',     valueEn: '15+',                                                                                                       valueEs: '15+' },
  { key: 'about.stats.reviews',           page: 'about',   label: 'Stat: Reviews',         type: 'text',     valueEn: '200+',                                                                                                      valueEs: '200+' },
  { key: 'about.stats.rating',            page: 'about',   label: 'Stat: Rating',          type: 'text',     valueEn: '4.9★',                                                                                                      valueEs: '4.9★' },
  { key: 'about.visit.hours',             page: 'about',   label: 'Business Hours',        type: 'text',     valueEn: 'Mon–Sun 9 AM – 5:30 PM (Fri–Sat until 6 PM)',                                                              valueEs: 'Lun–Dom 9 AM – 5:30 PM (Vie–Sáb hasta las 6 PM)' },
  { key: 'about.visit.address',           page: 'about',   label: 'Address',               type: 'text',     valueEn: '15196 SW 184th St, Miami, FL 33187',                                                                        valueEs: '15196 SW 184th St, Miami, FL 33187' },
  // CONTACT
  { key: 'contact.title',                 page: 'contact', label: 'Contact Title',         type: 'text',     valueEn: 'Get in Touch',                                                                                              valueEs: 'Contáctanos' },
  { key: 'contact.subtitle',              page: 'contact', label: 'Contact Subtitle',      type: 'text',     valueEn: "Ready to transform your garden? Tell us about your space.",                                                 valueEs: '¿Listo para transformar tu jardín? Cuéntanos sobre tu espacio.' },
  // FOOTER
  { key: 'footer.tagline',               page: 'footer',  label: 'Footer Tagline',        type: 'text',     valueEn: "Miami's most beloved boutique nursery & landscape design studio.",                                           valueEs: 'El vivero boutique y estudio de paisajismo más querido de Miami.' },
  { key: 'footer.hours',                 page: 'footer',  label: 'Footer Hours',          type: 'text',     valueEn: 'Hours: Mon–Sun 9AM–5:30PM (Fri–Sat until 6PM)',                                                             valueEs: 'Horario: Lun–Dom 9AM–5:30PM (Vie–Sáb hasta 6PM)' },
]

async function main() {
  let created = 0, skipped = 0
  for (const b of blocks) {
    const ex = await p.contentBlock.findUnique({ where: { key: b.key } })
    if (ex) { skipped++; continue }
    await p.contentBlock.create({ data: b })
    created++
  }
  console.log(`✅ ${created} created, ${skipped} skipped`)
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
