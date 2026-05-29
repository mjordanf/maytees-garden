/**
 * Exports all data from the local SQLite DB as PostgreSQL INSERT statements.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/export-seed-sql.ts
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

// Point at local SQLite
process.env.DATABASE_URL = 'file:./prisma/dev.db'
const prisma = new PrismaClient()

function esc(v: any): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (v instanceof Date) return `'${v.toISOString()}'`
  return `'${String(v).replace(/'/g, "''")}'`
}

function rows(table: string, cols: string[], data: any[]): string {
  if (!data.length) return ''
  const header = `-- ${table} (${data.length} rows)\n`
  const inserts = data.map(row => {
    const vals = cols.map(c => esc(row[c])).join(', ')
    return `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals});`
  })
  return header + inserts.join('\n') + '\n\n'
}

async function main() {
  const lines: string[] = ['-- Maytee\'s Garden — seed data\n-- Paste this into Supabase SQL Editor after running the schema SQL\n\n']

  // Users
  const users = await prisma.user.findMany()
  lines.push(rows('User', ['id','name','email','emailVerified','passwordHash','image','role','languagePreference','phone','zipCode','newsletterOptIn','promotionsOptIn','createdAt','updatedAt'], users))

  // Services
  const services = await prisma.service.findMany()
  lines.push(rows('Service', ['id','nameEn','nameEs','descriptionEn','descriptionEs','price','priceNote','imageUrl','duration','active','createdAt'], services))

  // Plants
  const plants = await prisma.plant.findMany()
  lines.push(rows('Plant', ['id','nameEn','nameEs','descriptionEn','descriptionEs','price','imageUrl','category','inStock','stockQty','featured','tags','careLevel','sunlight','water','createdAt','updatedAt'], plants))

  // Gallery
  const gallery = await prisma.galleryItem.findMany()
  lines.push(rows('GalleryItem', ['id','imageUrl','captionEn','captionEs','category','featured','sortOrder','createdAt'], gallery))

  // Testimonials
  const testimonials = await prisma.testimonial.findMany()
  lines.push(rows('Testimonial', ['id','name','location','rating','textEn','textEs','imageUrl','featured','createdAt'], testimonials))

  // Newsletter subscribers
  const subs = await prisma.newsletterSubscriber.findMany()
  lines.push(rows('NewsletterSubscriber', ['id','email','name','active','createdAt'], subs))

  const sql = lines.join('')
  writeFileSync('prisma/seed-data.sql', sql)
  console.log(`✅ Written to prisma/seed-data.sql (${sql.length.toLocaleString()} chars, ${plants.length} plants, ${services.length} services)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
