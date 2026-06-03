import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const contentType = req.headers.get('content-type') ?? ''

  let updateData: Record<string, unknown> = {}

  if (contentType.includes('multipart/form-data')) {
    // Image upload + optional field updates
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (file && file.size > 0) {
      const buffer   = Buffer.from(await file.arrayBuffer())
      const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filename = `service-${params.id}-${Date.now()}.${ext}`
      const dir      = path.join(process.cwd(), 'public', 'uploads', 'services')
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, filename), buffer)
      updateData.imageUrl = `/uploads/services/${filename}`
    }

    const fields = ['nameEn', 'nameEs', 'descriptionEn', 'descriptionEs', 'priceNote', 'price', 'duration']
    for (const f of fields) {
      const val = formData.get(f)
      if (val !== null && val !== '') {
        updateData[f] = f === 'price' || f === 'duration' ? Number(val) : val
      }
    }
  } else {
    // JSON body — field updates only
    const body = await req.json()
    const allowed = ['nameEn', 'nameEs', 'descriptionEn', 'descriptionEs', 'priceNote', 'price', 'duration']
    for (const k of allowed) {
      if (body[k] !== undefined) updateData[k] = body[k]
    }
  }

  const service = await prisma.service.update({ where: { id: params.id }, data: updateData })
  revalidatePath('/services')
  return NextResponse.json({ service })
}
