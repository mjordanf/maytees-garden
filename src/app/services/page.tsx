export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getContent } from '@/lib/content'
import ServicesClient from './ServicesClient'

export const metadata: Metadata = {
  title: 'Garden Services',
  description: "Landscape design, plant installation, plant rescue, and ongoing maintenance by Maytee's Garden Center — serving Miami, Coral Gables, Pinecrest, and all of South Florida.",
}

export default async function ServicesPage() {
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  const [services, content] = await Promise.all([
    prisma.service.findMany({ where: { active: true } }),
    getContent('services'),
  ])

  return <ServicesClient services={services} content={content} isEditorMode={isEditorMode} />
}
