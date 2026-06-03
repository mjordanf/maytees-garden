export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const page = req.nextUrl.searchParams.get('page')
  const blocks = await prisma.contentBlock.findMany({
    where: page ? { page } : {},
    orderBy: { key: 'asc' },
  })
  return NextResponse.json({ blocks })
}
