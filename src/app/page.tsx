export const dynamic = 'force-dynamic'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getContent } from '@/lib/content'
import HomeClient from './HomeClient'

async function getData() {
  const [featuredPlants, testimonials, services, gallery] = await Promise.all([
    prisma.plant.findMany({ where: { featured: true }, take: 6 }),
    prisma.testimonial.findMany({ where: { featured: true }, take: 5 }),
    prisma.service.findMany({ where: { active: true }, take: 4 }),
    prisma.galleryItem.findMany({ where: { featured: true }, take: 6, orderBy: { sortOrder: 'asc' } }),
  ])
  return { featuredPlants, testimonials, services, gallery }
}

export default async function HomePage() {
  const { featuredPlants, testimonials, services, gallery } = await getData()
  const content = await getContent('home')
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  return (
    <HomeClient
      featuredPlants={featuredPlants}
      testimonials={testimonials}
      services={services}
      gallery={gallery}
      content={content}
      isEditorMode={isEditorMode}
    />
  )
}
