export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const versions = await prisma.contentVersion.findMany({
    where: { contentBlockId: params.id },
    orderBy: { savedAt: 'desc' },
    take: 10,
  })
  return NextResponse.json({ versions })
}
