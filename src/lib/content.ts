import { prisma } from '@/lib/prisma'

export type ContentMap = Record<string, { en: string; es: string; id: string; label: string; type: string }>

export async function getContent(page: string): Promise<ContentMap> {
  try {
    const blocks = await prisma.contentBlock.findMany({
      where: { page },
      select: { id: true, key: true, valueEn: true, valueEs: true, label: true, type: true },
    })
    return Object.fromEntries(blocks.map(b => [b.key, { en: b.valueEn, es: b.valueEs, id: b.id, label: b.label, type: b.type }]))
  } catch {
    console.warn(`[cms] getContent failed for page=${page}`)
    return {}
  }
}

// Helper to get EN value with fallback
export function c(content: ContentMap, key: string, fallback = ''): string {
  return content[key]?.en || fallback
}
