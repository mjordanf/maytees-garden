import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'

export async function POST() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || !['admin', 'superadmin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 })
  }

  const to   = process.env.ADMIN_EMAIL ?? process.env.BUSINESS_EMAIL ?? 'info@mayteesgardencenter.com'
  const from = `Maytee's Garden <${process.env.RESEND_FROM_EMAIL ?? 'noreply@mayteesgardencenter.com'}>`

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: '✅ Email Test — Maytee\'s Garden Center',
      html: `
        <!DOCTYPE html><html><body style="margin:0;padding:32px;background:#faf7f2;font-family:Arial,sans-serif">
          <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08)">
            <div style="background:#2d6a4f;color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:24px">
              <p style="margin:0;font-size:20px;font-weight:bold">🌿 Maytee's Garden</p>
            </div>
            <h2 style="color:#1b3a2d;margin:0 0 16px">Email pipeline is working!</h2>
            <p style="color:#374151;line-height:1.6">This test email was sent from the admin panel. If you're reading this, Resend is fully connected and emails will be delivered to customers and staff.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
            <table style="width:100%;font-size:13px;color:#6b7280">
              <tr><td style="padding:4px 0;width:40%">Sent from</td><td style="color:#374151">${from}</td></tr>
              <tr><td style="padding:4px 0">Sent to</td><td style="color:#374151">${to}</td></tr>
              <tr><td style="padding:4px 0">Timestamp</td><td style="color:#374151">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
            </table>
          </div>
        </body></html>
      `,
    })
    return NextResponse.json({ success: true, id: result.data?.id, to, from })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Send failed' }, { status: 500 })
  }
}
