export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const PAGE_PATHS: Record<string, string> = {
  home: '/', about: '/about', contact: '/contact', footer: '/',
  services: '/services', gallery: '/gallery',
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { versionId } = await req.json()
  const version = await prisma.contentVersion.findUnique({ where: { id: versionId } })
  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

  const block = await prisma.contentBlock.findUnique({ where: { id: params.id } })
  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  const userId = (session.user as any)?.id as string | undefined

  // Snapshot current before rollback
  await prisma.contentVersion.create({
    data: {
      contentBlockId: params.id,
      valueEn: block.valueEn,
      valueEs: block.valueEs,
      savedBy: userId,
      note: `Rollback to version from ${version.savedAt.toLocaleDateString()}`,
    },
  })

  const updated = await prisma.contentBlock.update({
    where: { id: params.id },
    data: { valueEn: version.valueEn, valueEs: version.valueEs, updatedBy: userId },
  })

  revalidatePath(PAGE_PATHS[block.page] ?? '/')
  return NextResponse.json({ block: updated })
}
