import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const item = await prisma.galleryItem.update({
    where: { id: params.id },
    data: {
      ...(body.captionEn !== undefined && { captionEn: body.captionEn }),
      ...(body.captionEs !== undefined && { captionEs: body.captionEs }),
      ...(body.category  !== undefined && { category:  body.category  }),
      ...(body.featured  !== undefined && { featured:  body.featured  }),
    },
  })

  revalidatePath('/gallery')
  return NextResponse.json({ item })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.galleryItem.delete({ where: { id: params.id } })
  revalidatePath('/gallery')
  return NextResponse.json({ success: true })
}
