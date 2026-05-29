import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Maytee\'s Garden database...')

  // ── Users ─────────────────────────────────────────────
  const adminPass  = await bcrypt.hash('Admin2024!', 12)
  const staffPass  = await bcrypt.hash('Staff2024!', 12)
  const customerPass = await bcrypt.hash('Customer2024!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'maytee@mayteesgarden.com' },
    update: {},
    create: {
      email: 'maytee@mayteesgarden.com',
      name: 'Maytee',
      passwordHash: adminPass,
      role: 'admin',
      phone: '(305) 555-0100',
      languagePreference: 'en',
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@mayteesgarden.com' },
    update: {},
    create: {
      email: 'staff@mayteesgarden.com',
      name: 'Carlos Rivera',
      passwordHash: staffPass,
      role: 'staff',
      phone: '(305) 555-0101',
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'test@customer.com' },
    update: {},
    create: {
      email: 'test@customer.com',
      name: 'Maria Santos',
      passwordHash: customerPass,
      role: 'customer',
      phone: '(305) 555-0200',
      zipCode: '33187',
      newsletterOptIn: true,
      languagePreference: 'es',
    },
  })

  console.log('✅ Users seeded:', admin.email, staff.email, customer.email)

  // ── Services ──────────────────────────────────────────
  const services = [
    {
      nameEn: 'Landscape Design Consultation',
      nameEs: 'Consulta de Diseño Paisajístico',
      descriptionEn: 'Personalized 1-hour consultation with Maytee to design your dream garden. Includes a written plan and plant list tailored to your space and Miami\'s climate.',
      descriptionEs: 'Consulta personalizada de 1 hora con Maytee para diseñar el jardín de sus sueños. Incluye un plan escrito y lista de plantas adaptada a su espacio y el clima de Miami.',
      price: 150,
      priceNote: 'Starting at $150/hr',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
      duration: 60,
    },
    {
      nameEn: 'Garden Installation',
      nameEs: 'Instalación de Jardín',
      descriptionEn: 'Full installation of your new garden design. We source, deliver, and plant everything — from tropical specimens to flowering borders. Pricing based on project scope.',
      descriptionEs: 'Instalación completa de su nuevo diseño de jardín. Conseguimos, entregamos y plantamos todo — desde especímenes tropicales hasta bordes florales.',
      price: null,
      priceNote: 'Custom quote — contact us',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      duration: 240,
    },
    {
      nameEn: 'Plant Rescue & Restoration',
      nameEs: 'Rescate y Restauración de Plantas',
      descriptionEn: 'Maytee\'s signature service: we evaluate your existing plants before removing anything. Save what can be saved, transform what needs a boost.',
      descriptionEs: 'El servicio estrella de Maytee: evaluamos sus plantas existentes antes de remover nada. Salvamos lo que se puede salvar, transformamos lo que necesita un impulso.',
      price: 200,
      priceNote: 'Starting at $200 per visit',
      imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
      duration: 120,
    },
    {
      nameEn: 'Ongoing Garden Maintenance',
      nameEs: 'Mantenimiento de Jardín',
      descriptionEn: 'Monthly maintenance visits to keep your garden thriving in South Florida\'s unique climate. Includes pruning, fertilizing, pest management, and seasonal adjustments.',
      descriptionEs: 'Visitas mensuales de mantenimiento para mantener su jardín floreciente en el clima único del sur de Florida.',
      price: 180,
      priceNote: '$180–$350/month depending on size',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&w=800&q=80',
      duration: 90,
    },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.nameEn.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: { id: s.nameEn.replace(/\s+/g, '-').toLowerCase(), ...s },
    })
  }
  console.log('✅ Services seeded')

  // ── Plants ────────────────────────────────────────────
  const plants = [
    {
      nameEn: 'Bougainvillea',
      nameEs: 'Buganvilla',
      descriptionEn: 'Miami\'s most iconic climber. Vivid magenta, coral, or purple bracts cascade over fences and pergolas. Drought-tolerant once established and loves Miami\'s full sun.',
      descriptionEs: 'La trepadora más icónica de Miami. Flores de magenta, coral o púrpura que decoran cercas y pérgolas. Tolerante a la sequía y amante del sol pleno.',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
      category: 'flowering',
      featured: true,
      tags: 'climber,fence,colorful,drought-tolerant',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'low',
    },
    {
      nameEn: 'Bird of Paradise',
      nameEs: 'Ave del Paraíso',
      descriptionEn: 'A bold, architectural statement plant. Large paddle-shaped leaves and dramatic orange and blue blooms make it an instant focal point in any South Florida landscape.',
      descriptionEs: 'Una planta arquitectónica audaz. Grandes hojas en forma de remo y llamativas flores naranjas y azules la convierten en el centro de atención.',
      price: 65,
      imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      category: 'tropical',
      featured: true,
      tags: 'architectural,focal-point,tropical',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'moderate',
    },
    {
      nameEn: 'Areca Palm',
      nameEs: 'Palma Areca',
      descriptionEn: 'The quintessential South Florida palm. Feathery fronds create a tropical canopy perfect for privacy screens or poolside planting. Fast-growing in Miami\'s climate.',
      descriptionEs: 'La palma quintaesencial del sur de Florida. Perfecta para pantallas de privacidad o plantación junto a piscinas. Crece rápido en el clima de Miami.',
      price: 89,
      imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
      category: 'palms',
      featured: true,
      tags: 'privacy,pool,tropical,fast-growing',
      careLevel: 'easy',
      sunlight: 'partial',
      water: 'moderate',
    },
    {
      nameEn: 'Ixora',
      nameEs: 'Ixora',
      descriptionEn: 'A South Florida classic with clusters of fiery red, orange, or pink blooms all year round. Perfect for hedges, borders, and attracting butterflies and hummingbirds.',
      descriptionEs: 'Un clásico del sur de Florida con racimos de flores rojas, naranjas o rosas durante todo el año. Perfecto para setos y atraer mariposas y colibríes.',
      price: 22,
      imageUrl: 'https://images.unsplash.com/photo-1508022713622-df2d8fb7b4cd?auto=format&fit=crop&w=800&q=80',
      category: 'flowering',
      featured: false,
      tags: 'hedge,colorful,butterfly,year-round',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'moderate',
    },
    {
      nameEn: 'Dwarf Olive Tree',
      nameEs: 'Olivo Enano',
      descriptionEn: 'Little Ollie stays compact and thrives in containers. The silvery-green foliage brings Mediterranean elegance to patios, poolsides, and deck corners across South Florida.',
      descriptionEs: 'Little Ollie permanece compacto y prospera en macetas. El follaje verde plateado trae elegancia mediterránea a patios y terrazas del sur de Florida.',
      price: 95,
      imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=800&q=80',
      category: 'tropical',
      featured: false,
      tags: 'container,mediterranean,patio,elegant',
      careLevel: 'moderate',
      sunlight: 'full',
      water: 'low',
    },
    {
      nameEn: 'Firebush',
      nameEs: 'Arbusto de Fuego',
      descriptionEn: 'A native Florida superstar with tubular orange-red flowers and brilliant fall foliage. Magnets for butterflies and hummingbirds. Low maintenance and drought-tolerant.',
      descriptionEs: 'Una superestrella nativa de Florida con flores tubulares rojo-naranja. Imanes para mariposas y colibríes. Bajo mantenimiento y tolerante a la sequía.',
      price: 18,
      imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=800&q=80',
      category: 'native',
      featured: false,
      tags: 'native,butterfly,hummingbird,drought-tolerant',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'low',
    },
    {
      nameEn: 'Croton',
      nameEs: 'Croton',
      descriptionEn: 'A riot of color in a single plant. Croton leaves come in yellow, orange, red, and green — sometimes all on the same branch. Perfect for Miami gardens seeking vibrant tropical color.',
      descriptionEs: 'Un festival de colores en una sola planta. Las hojas de Croton vienen en amarillo, naranja, rojo y verde. Perfecto para jardines de Miami que buscan color tropical.',
      price: 28,
      imageUrl: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?auto=format&fit=crop&w=800&q=80',
      category: 'tropical',
      featured: true,
      tags: 'colorful,tropical,bold,container',
      careLevel: 'easy',
      sunlight: 'partial',
      water: 'moderate',
    },
    {
      nameEn: 'Plumbago',
      nameEs: 'Plumbago',
      descriptionEn: 'Clouds of powder-blue flowers float above soft green foliage all year in Miami. An exceptional hedge plant and one of the most effective butterfly-attracting plants in South Florida.',
      descriptionEs: 'Nubes de flores azul pálido flotan sobre el follaje verde todo el año en Miami. Una planta de seto excepcional que atrae mariposas.',
      price: 20,
      imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=800&q=80',
      category: 'flowering',
      featured: false,
      tags: 'hedge,blue,butterfly,year-round',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'moderate',
    },
    {
      nameEn: 'Lemon Tree (Eureka)',
      nameEs: 'Limonero (Eureka)',
      descriptionEn: 'Grow your own lemons in Miami\'s perfect climate. Fragrant white blossoms, glossy foliage, and a year-round harvest make this container lemon tree a deck and patio must-have.',
      descriptionEs: 'Cultive sus propios limones en el clima perfecto de Miami. Flores blancas fragantes y una cosecha durante todo el año hacen de este limonero un imprescindible.',
      price: 75,
      imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
      category: 'edible',
      featured: false,
      tags: 'edible,container,fragrant,fruit',
      careLevel: 'moderate',
      sunlight: 'full',
      water: 'moderate',
    },
    {
      nameEn: 'Lantana',
      nameEs: 'Lantana',
      descriptionEn: 'A South Florida workhorse that blooms in golden yellow, burnt orange, and coral — a perfect harvest palette. Attracts butterflies, tolerates full sun, and fills in quickly.',
      descriptionEs: 'Un caballito de batalla del sur de Florida que florece en amarillo dorado, naranja quemado y coral. Atrae mariposas y tolera el sol pleno.',
      price: 16,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
      category: 'native',
      featured: false,
      tags: 'butterfly,border,colorful,fast-growing',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'low',
    },
    {
      nameEn: 'Star Jasmine',
      nameEs: 'Jazmín de Estrella',
      descriptionEn: 'Fragrant white star-shaped flowers fill the evening air with a sweet perfume. Train it along fence panels or up pergola posts for a wall of scent on warm Miami nights.',
      descriptionEs: 'Flores blancas estrelladas fragantes llenan el aire nocturno con un dulce perfume. Entrénala a lo largo de cercas o pérgolas para una pared de aroma.',
      price: 32,
      imageUrl: 'https://images.unsplash.com/photo-1490750967868-88df5691d37b?auto=format&fit=crop&w=800&q=80',
      category: 'flowering',
      featured: false,
      tags: 'fragrant,climber,fence,pergola',
      careLevel: 'easy',
      sunlight: 'partial',
      water: 'moderate',
    },
    {
      nameEn: 'Traveler\'s Palm',
      nameEs: 'Palma del Viajero',
      descriptionEn: 'One of the most dramatic plants in Miami landscaping. The giant fan of paddle-shaped leaves creates an instantly recognizable silhouette — pure tropical grandeur.',
      descriptionEs: 'Una de las plantas más dramáticas del paisajismo de Miami. El gigantesco abanico de hojas crea una silueta inconfundible — pura grandiosidad tropical.',
      price: 145,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      category: 'palms',
      featured: true,
      tags: 'statement,tropical,architectural,large',
      careLevel: 'easy',
      sunlight: 'full',
      water: 'moderate',
    },
  ]

  for (const p of plants) {
    await prisma.plant.create({ data: p }).catch(() => {})
  }
  console.log('✅ Plants seeded:', plants.length, 'plants')

  // ── Gallery ───────────────────────────────────────────
  const galleryItems = [
    { imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80', captionEn: 'Coral Gables Backyard Transformation', captionEs: 'Transformación de Patio en Coral Gables', category: 'residential', featured: true, sortOrder: 1 },
    { imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', captionEn: 'Tropical Pool Garden — Pinecrest', captionEs: 'Jardín Tropical con Piscina — Pinecrest', category: 'residential', featured: true, sortOrder: 2 },
    { imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&w=1200&q=80', captionEn: 'Commercial Entrance Planting — Brickell', captionEs: 'Plantación de Entrada Comercial — Brickell', category: 'commercial', featured: true, sortOrder: 3 },
    { imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80', captionEn: 'Kendall Residential Garden', captionEs: 'Jardín Residencial en Kendall', category: 'residential', featured: false, sortOrder: 4 },
    { imageUrl: 'https://images.unsplash.com/photo-1508022713622-df2d8fb7b4cd?auto=format&fit=crop&w=1200&q=80', captionEn: 'Italian Courtyard — Miami Beach', captionEs: 'Patio Italiano — Miami Beach', category: 'residential', featured: true, sortOrder: 5 },
    { imageUrl: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?auto=format&fit=crop&w=1200&q=80', captionEn: 'Native Florida Butterfly Garden', captionEs: 'Jardín de Mariposas Nativo de Florida', category: 'residential', featured: false, sortOrder: 6 },
  ]

  for (const g of galleryItems) {
    await prisma.galleryItem.create({ data: g })
  }
  console.log('✅ Gallery seeded')

  // ── Testimonials ──────────────────────────────────────
  const testimonials = [
    { name: 'Jennifer M.', location: 'Pinecrest, FL', rating: 5, textEn: 'Maytee completely transformed our backyard into a tropical paradise. She saved plants we thought were dead and created something magical. She\'s the plant whisperer!', textEs: 'Maytee transformó completamente nuestro patio trasero en un paraíso tropical. ¡Salvó plantas que creíamos muertas y creó algo mágico!', featured: true },
    { name: 'Roberto & Ana G.', location: 'Coral Gables, FL', rating: 5, textEn: 'We\'ve used Maytee for three different properties now. Her eye for design, knowledge of Miami\'s climate, and passion for plants is unmatched in South Florida.', textEs: 'Hemos usado a Maytee para tres propiedades diferentes. Su ojo para el diseño y conocimiento del clima de Miami no tiene igual en el sur de Florida.', featured: true },
    { name: 'Linda T.', location: 'Kendall, FL', rating: 5, textEn: 'I called Maytee thinking my garden was beyond saving. Two visits later, it looks better than when we first planted it. She\'s a miracle worker with plants.', textEs: 'Llamé a Maytee pensando que mi jardín no tenía solución. Después de dos visitas, luce mejor que cuando lo plantamos por primera vez.', featured: true },
    { name: 'Carlos & Sofia R.', location: 'Doral, FL', rating: 5, textEn: 'Our HOA actually gave us a compliment for once because of Maytee\'s work! The front yard design she created is beautiful and incredibly low-maintenance.', textEs: '¡Nuestra HOA nos dio un cumplido por primera vez gracias al trabajo de Maytee! El diseño del patio delantero es hermoso e increíblemente fácil de mantener.', featured: false },
    { name: 'Patricia W.', location: 'Miami Lakes, FL', rating: 5, textEn: 'Maytee is featured on TV for a reason — her knowledge is encyclopedic and her designs are stunning. Our pool area is now the envy of the neighborhood.', textEs: 'Maytee aparece en televisión por una razón: su conocimiento es enciclopédico y sus diseños son impresionantes.', featured: true },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }
  console.log('✅ Testimonials seeded')

  // ── Sample Bookings ───────────────────────────────────
  const consultService = await prisma.service.findFirst({ where: { nameEn: { contains: 'Consultation' } } })

  if (consultService) {
    await prisma.booking.createMany({
      data: [
        {
          userId: customer.id,
          serviceId: consultService.id,
          appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'confirmed',
          clientName: 'Maria Santos',
          clientEmail: 'test@customer.com',
          clientPhone: '(305) 555-0200',
          zipCode: '33187',
          notes: 'Looking to redesign backyard with tropical theme',
        },
        {
          appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'pending',
          clientName: 'John Doe',
          clientEmail: 'john.doe@example.com',
          clientPhone: '(786) 555-0300',
          zipCode: '33155',
          notes: 'New construction — need full landscape design',
        },
      ],
    })
  }
  console.log('✅ Bookings seeded')

  // ── Sample Contact Submissions ─────────────────────────
  await prisma.contactSubmission.createMany({
    data: [
      { name: 'Alex R.', email: 'alex@example.com', phone: '(305) 555-0400', zipCode: '33143', service: 'installation', message: 'Looking for a full backyard installation quote. Have about 2,000 sq ft to work with.' },
      { name: 'Diana L.', email: 'diana@example.com', zipCode: '33186', service: 'maintenance', message: 'Need monthly maintenance for my garden. It\'s gotten out of control since summer!', status: 'read' },
    ],
  })

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'test@customer.com', name: 'Maria Santos', active: true },
      { email: 'newsletter@example.com', name: 'Demo Subscriber', active: true },
    ],
  }).catch(() => {})

  console.log('✅ Contact submissions & newsletter seeded')
  console.log('')
  console.log('─────────────────────────────────────────')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Test Credentials:')
  console.log('  👑 Admin:    maytee@mayteesgarden.com  / Admin2024!')
  console.log('  🧑‍💼 Staff:   staff@mayteesgarden.com   / Staff2024!')
  console.log('  👤 Customer: test@customer.com         / Customer2024!')
  console.log('─────────────────────────────────────────')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
