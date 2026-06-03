import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const captionEn = (formData.get('captionEn') as string) || ''
  const captionEs = (formData.get('captionEs') as string) || ''
  const category  = (formData.get('category')  as string) || 'residential'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 15 MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `gallery-${Date.now()}.${ext}`
  const dir      = path.join(process.cwd(), 'public', 'gallery')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  // Get highest sortOrder and put new item at end
  const last = await prisma.galleryItem.findFirst({ orderBy: { sortOrder: 'desc' } })
  const sortOrder = (last?.sortOrder ?? 0) + 1

  const item = await prisma.galleryItem.create({
    data: {
      imageUrl:  `/gallery/${filename}`,
      captionEn,
      captionEs,
      category,
      featured:  false,
      sortOrder,
    },
  })

  revalidatePath('/gallery')
  return NextResponse.json({ item })
}
