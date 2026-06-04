import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const MAX_BYTES = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['admin', 'staff', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `uploads/plants/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const blob = await put(filename, file, { access: 'public' })

  return NextResponse.json({ url: blob.url })
}
