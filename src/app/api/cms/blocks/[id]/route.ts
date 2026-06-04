export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sanitizeText, sanitizeRichText } from '@/lib/sanitize'

const PAGE_PATHS: Record<string, string> = {
  home: '/', about: '/about', contact: '/contact', footer: '/',
  services: '/services', gallery: '/gallery',
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body     = await req.json()
  const existing = await prisma.contentBlock.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sanitize = existing.type === 'richtext' ? sanitizeRichText : sanitizeText
  const valueEn  = body.valueEn !== undefined ? sanitize(body.valueEn) : existing.valueEn
  const valueEs  = body.valueEs !== undefined ? sanitize(body.valueEs) : existing.valueEs

  const userId = (session.user as any)?.id as string | undefined

  // Snapshot current value
  await prisma.contentVersion.create({
    data: {
      contentBlockId: params.id,
      valueEn: existing.valueEn,
      valueEs: existing.valueEs,
      savedBy: userId,
      note: 'Auto-snapshot before edit',
    },
  })

  const updated = await prisma.contentBlock.update({
    where: { id: params.id },
    data: { valueEn, valueEs, updatedBy: userId },
  })

  // Revalidate the relevant page
  const path = PAGE_PATHS[existing.page] ?? '/'
  revalidatePath(path)
  revalidatePath('/') // always revalidate home for footer blocks

  return NextResponse.json({ block: updated })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const block = await prisma.contentBlock.findUnique({ where: { id: params.id } })
  return NextResponse.json({ block })
}
