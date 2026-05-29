import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const plants = await prisma.plant.findMany({
    where: { imageUrl: { contains: '/thumb/' } },
  })

  console.log(`Found ${plants.length} plants with /thumb/ URLs`)

  let updated = 0
  for (const plant of plants) {
    const fixed = plant.imageUrl
      .replace('/thumb/', '/')
      .replace(/\/\d+px-[^/]+$/, '')

    await prisma.plant.update({
      where: { id: plant.id },
      data: { imageUrl: fixed },
    })

    console.log(`  ${plant.nameEn}`)
    console.log(`    Before: ${plant.imageUrl}`)
    console.log(`    After:  ${fixed}`)
    updated++
  }

  console.log(`\nDone. Updated ${updated} plants.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
