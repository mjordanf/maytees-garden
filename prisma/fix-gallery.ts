import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  await p.service.update({
    where: { nameEn: 'Ongoing Garden Maintenance' },
    data: { imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80' }
  })
  console.log('✅ Service image fixed')

  await p.galleryItem.deleteMany()
  await p.galleryItem.createMany({ data: [
    { id:'g1',  imageUrl:'/gallery/project-nighttime-tropical-garden-1.jpg',        captionEn:'Evening Garden Installation — Miami',               captionEs:'Instalación de Jardín Nocturno — Miami',            category:'residential', featured:true,  sortOrder:1  },
    { id:'g2',  imageUrl:'/gallery/project-white-mansion-bougainvillea-1.jpg',      captionEn:'Coral Gables Estate — Bougainvillea Entrance',      captionEs:'Finca en Coral Gables — Entrada de Buganvilla',     category:'residential', featured:true,  sortOrder:2  },
    { id:'g3',  imageUrl:'/gallery/project-lakeside-garden-black-swans-1.jpg',      captionEn:'Lakeside Garden — Bromeliads & Black Swans',        captionEs:'Jardín Lacustre — Bromelias y Cisnes Negros',        category:'residential', featured:true,  sortOrder:3  },
    { id:'g4',  imageUrl:'/gallery/project-tropical-waterfall-patio-1.jpg',         captionEn:'Tropical Waterfall & Stone Patio',                  captionEs:'Cascada Tropical y Patio de Piedra',                category:'residential', featured:true,  sortOrder:4  },
    { id:'g5',  imageUrl:'/gallery/project-tiki-hut-tropical-pond-1.jpg',           captionEn:'Tiki Hut Overlooking Tropical Pond',                captionEs:'Cabaña con Vista al Estanque Tropical',             category:'residential', featured:true,  sortOrder:5  },
    { id:'g6',  imageUrl:'/gallery/project-gray-house-tropical-makeover-1.jpg',     captionEn:'Front Yard Transformation — Kendall',               captionEs:'Transformación de Jardín Delantero — Kendall',      category:'residential', featured:true,  sortOrder:6  },
    { id:'g7',  imageUrl:'/gallery/project-curved-brick-path-1.jpg',                captionEn:'Curved Brick Pathway with Tropical Border',         captionEs:'Camino de Ladrillo con Borde Tropical',             category:'residential', featured:false, sortOrder:7  },
    { id:'g8',  imageUrl:'/gallery/project-red-bromeliads-path-1.jpg',              captionEn:'Red Bromeliads Along Garden Path',                  captionEs:'Bromelias Rojas a lo Largo del Sendero',            category:'residential', featured:false, sortOrder:8  },
    { id:'g9',  imageUrl:'/gallery/project-mediterranean-house-awnings-1.jpg',      captionEn:'Mediterranean Residence — Pinecrest',              captionEs:'Residencia Mediterránea — Pinecrest',               category:'residential', featured:false, sortOrder:9  },
    { id:'g10', imageUrl:'/gallery/project-bromeliad-succulent-garden-1.jpg',       captionEn:'Bromeliad & Succulent Garden Bed',                  captionEs:'Jardín de Bromelias y Suculentas',                  category:'residential', featured:false, sortOrder:10 },
    { id:'g11', imageUrl:'/gallery/nursery-orchids-driftwood-display-1.jpg',        captionEn:"Orchid Driftwood Display — Maytee's Garden Center", captionEs:'Exhibición de Orquídeas en Madera — Vivero',        category:'commercial',  featured:false, sortOrder:11 },
    { id:'g12', imageUrl:'/gallery/project-tree-base-bromeliads-black-rocks-1.jpg', captionEn:'Tree Base Planting with River Rocks',               captionEs:'Plantación en Base de Árbol con Rocas de Río',      category:'residential', featured:false, sortOrder:12 },
    { id:'g13', imageUrl:'/gallery/project-jasmine-pathway-lush-1.jpg',             captionEn:'Jasmine-Lined Garden Pathway',                      captionEs:'Sendero de Jardín con Jazmín',                      category:'residential', featured:false, sortOrder:13 },
    { id:'g14', imageUrl:'/gallery/project-purple-vine-arbor-path-1.jpg',           captionEn:'Purple Vine Arbor — Coral Gables',                  captionEs:'Pérgola con Enredadera Morada — Coral Gables',      category:'residential', featured:false, sortOrder:14 },
    { id:'g15', imageUrl:'/gallery/project-spanish-house-fountain-formal-1.jpg',    captionEn:'Spanish Colonial — Formal Fountain Garden',         captionEs:'Colonial Español — Jardín Formal con Fuente',       category:'residential', featured:false, sortOrder:15 },
    { id:'g16', imageUrl:'/gallery/project-garden-swing-pergola-flowers-1.jpg',     captionEn:'Garden Swing Pergola with Flowering Vines',         captionEs:'Pérgola con Columpio y Enredaderas Floridas',       category:'residential', featured:false, sortOrder:16 },
    { id:'g17', imageUrl:'/gallery/project-gray-house-sea-grape-tree-1.jpg',        captionEn:'Sea Grape Tree Landscape — Kendall',                captionEs:'Paisajismo con Uva de Mar — Kendall',               category:'residential', featured:false, sortOrder:17 },
    { id:'g18', imageUrl:'/gallery/project-waterfall-pond-garden-1.jpg',            captionEn:'Waterfall & Koi Pond Installation',                 captionEs:'Instalación de Cascada y Estanque Koi',             category:'residential', featured:false, sortOrder:18 },
    { id:'g19', imageUrl:'/gallery/project-poolside-tropical-garden-1.jpg',         captionEn:'Poolside Tropical Garden — Doral',                  captionEs:'Jardín Tropical junto a la Piscina — Doral',        category:'residential', featured:false, sortOrder:19 },
    { id:'g20', imageUrl:'/gallery/project-front-yard-palms-formal-1.jpg',          captionEn:'Formal Front Yard with Royal Palms',                captionEs:'Jardín Delantero Formal con Palmas Reales',         category:'residential', featured:false, sortOrder:20 },
    { id:'g21', imageUrl:'/gallery/nursery-bromeliads-sago-palm-1.jpg',             captionEn:"Maytee's Garden Center — Plant Selection",          captionEs:'Centro de Jardín de Maytee — Selección de Plantas', category:'commercial',  featured:false, sortOrder:21 },
    { id:'g22', imageUrl:'/gallery/media-tv-appearance-1.jpg',                      captionEn:'Maytee on Local Television — Garden Expert',        captionEs:'Maytee en Televisión Local — Experta en Jardines',  category:'commercial',  featured:false, sortOrder:22 },
    { id:'g23', imageUrl:'/gallery/maytee-nursery-overalls-full-body-1.jpg',        captionEn:'Maytee at the Nursery',                             captionEs:'Maytee en el Vivero',                               category:'commercial',  featured:false, sortOrder:23 },
  ]})
  console.log('✅ 23 real gallery photos written to PostgreSQL')
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
