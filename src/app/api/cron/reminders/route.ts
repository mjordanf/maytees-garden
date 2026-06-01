export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { checkAndSendReminders } from '@/lib/reminders'

export async function GET(req: NextRequest) {
  // Vercel cron jobs send Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  const expected   = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null

  if (expected && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sent = await checkAndSendReminders()
    return NextResponse.json({ sent })
  } catch (err) {
    console.error('[cron/reminders] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
