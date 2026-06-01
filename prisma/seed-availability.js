const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Clear existing templates
  await p.availabilityTemplate.deleteMany()

  // Mon–Fri: 9 AM – 5 PM, 60 min slots, both in-person & video
  for (let dow = 1; dow <= 5; dow++) {
    await p.availabilityTemplate.create({
      data: { dayOfWeek: dow, startTime: '09:00', endTime: '17:00', slotMinutes: 60, isActive: true, type: 'both' }
    })
  }

  // Saturday: 9 AM – 2 PM, 60 min slots
  await p.availabilityTemplate.create({
    data: { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotMinutes: 60, isActive: true, type: 'both' }
  })

  // Sunday: inactive (no template created)
  const count = await p.availabilityTemplate.count()
  console.log(`✅ ${count} availability templates seeded (Mon–Fri 9–5, Sat 9–2, Sun closed)`)
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
