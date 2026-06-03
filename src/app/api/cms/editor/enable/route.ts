import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const res = NextResponse.json({ success: true })
  res.cookies.set('cms_editor_mode', '1', { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}
