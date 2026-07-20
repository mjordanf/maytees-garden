export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = {
  title: 'Project Gallery',
  description: 'View Maytee\'s completed garden transformations across Coral Gables, Pinecrest, Kendall, and greater Miami.',
}

export default async function GalleryPage() {
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  const gallery = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })

  return <GalleryClient gallery={gallery} isEditorMode={isEditorMode} />
}
