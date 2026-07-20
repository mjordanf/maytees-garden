import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getContent } from '@/lib/content'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Maytee',
  description: "Meet Maytee — South Florida's plant advocate, landscape designer, and the founder of Maytee's Garden Center in Miami, FL.",
}

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

  return <AboutClient content={content} isEditorMode={isEditorMode} imgBlockIds={imgBlockIds} />
}
