/**
 * Patches image URLs for the plants that Wikipedia couldn't resolve in seed-plants.ts.
 * Uses alternative article titles or curated Unsplash photos.
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function wikiImage(title: string): Promise<string | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data: any = await res.json()
    const thumb    = data.thumbnail?.source as string | undefined
    const original = data.originalimage?.source as string | undefined
    if (thumb) return thumb.replace(/\/\d+px-/, '/800px-')
    if (original) return original
    return null
  } catch { return null }
}

// Curated fallbacks from Unsplash for plants where Wikipedia has no image
const UNSPLASH: Record<string, string> = {
  'Washingtonia Palm': 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80',
  'Royal Poinciana':   'https://images.unsplash.com/photo-1597392582469-a697322d6a84?auto=format&fit=crop&w=800&q=80',
  'Salvia':            'https://images.unsplash.com/photo-1597038527932-68e6d14a5c1d?auto=format&fit=crop&w=800&q=80',
  'Banana Tree':       'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?auto=format&fit=crop&w=800&q=80',
  'Calathea':          'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
  'Clusia':            'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
  'Costus':            'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
  'Croton':            'https://images.unsplash.com/photo-1534710961216-75c88202f43e?auto=format&fit=crop&w=800&q=80',
  'Dieffenbachia':     'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?auto=format&fit=crop&w=800&q=80',
  'Podocarpus':        'https://images.unsplash.com/photo-1540558657960-cf7bd3fc05f4?auto=format&fit=crop&w=800&q=80',
}

// Alternative Wikipedia titles to try first
const ALT_WIKI: Record<string, string> = {
  'Washingtonia Palm': 'Washingtonia filifera',
  'Royal Poinciana':   'Delonix regia',
  'Salvia':            'Salvia officinalis',
  'Banana Tree':       'Banana',
  'Calathea':          'Calathea ornata',
  'Clusia':            'Clusia',
  'Costus':            'Costus (plant)',
  'Croton':            'Codiaeum variegatum',
  'Dieffenbachia':     'Dieffenbachia seguine',
  'Podocarpus':        'Podocarpus',
}

async function main() {
  const FALLBACK_PLACEHOLDER = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80'

  // Find all plants still on the fallback placeholder
  const plants = await prisma.plant.findMany({
    where: { imageUrl: FALLBACK_PLACEHOLDER },
    select: { id: true, nameEn: true },
  })

  if (plants.length === 0) {
    console.log('✅ All plants already have images!')
    return
  }

  console.log(`\n🔧 Patching ${plants.length} plants with missing images…\n`)

  for (const plant of plants) {
    // Try alternative Wikipedia title first
    const altTitle = ALT_WIKI[plant.nameEn]
    let imgUrl: string | null = null

    if (altTitle) {
      imgUrl = await wikiImage(altTitle)
      await delay(400)
    }

    // Fall back to curated Unsplash photo
    if (!imgUrl) imgUrl = UNSPLASH[plant.nameEn] ?? null

    if (imgUrl) {
      await prisma.plant.update({ where: { id: plant.id }, data: { imageUrl: imgUrl } })
      console.log(`  ✅ ${plant.nameEn.padEnd(28)} → ${imgUrl.includes('wikipedia') ? 'Wikipedia' : 'Unsplash'}`)
    } else {
      console.log(`  ⚠️  ${plant.nameEn} — no image found, keeping placeholder`)
    }
  }
  console.log('\n✅ Patch complete\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
