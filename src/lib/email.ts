import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM    = `Maytee's Garden <${process.env.RESEND_FROM_EMAIL ?? 'noreply@mayteesgardencenter.com'}>`
const SUPPORT = process.env.ADMIN_EMAIL ?? process.env.BUSINESS_EMAIL ?? 'info@mayteesgardencenter.com'

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr><td style="background:#2d6a4f;padding:28px 36px">
          <p style="margin:0;color:#fff;font-size:22px;font-weight:bold;letter-spacing:.5px">🌿 Maytee's Garden</p>
          <p style="margin:4px 0 0;color:#b7e4c7;font-size:13px">15196 SW 184th St · Miami, FL 33187</p>
        </td></tr>
        <!-- Title -->
        <tr><td style="padding:32px 36px 0">
          <h1 style="margin:0;color:#1b3a2d;font-size:22px;line-height:1.3">${title}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:20px 36px 32px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f0fdf4;padding:20px 36px;border-top:1px solid #d1fae5">
          <p style="margin:0;color:#6b7280;font-size:12px">
            Questions? Reply to this email or call <strong>(786) 227-6616</strong><br>
            Mon–Sun 9 AM–5:30 PM · <a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}" style="color:#2d6a4f">mayteesgardencenter.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — would send to ${to}: ${subject}`)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] send failed:', err)
  }
}

// ── Booking confirmation → client ──────────────────────────────────────────

const PREF_LABELS: Record<string, string> = {
  'in-person':   'In-Person Visit',
  'facetime':    'FaceTime',
  'whatsapp':    'WhatsApp Video',
  'google-meet': 'Google Meet',
}

export async function sendBookingConfirmation(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
  notes?: string | null
  customerPreference?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const prefLabel = opts.customerPreference ? (PREF_LABELS[opts.customerPreference] ?? opts.customerPreference) : null

  const body = `
    <p>Hi <strong>${opts.clientName}</strong>,</p>
    <p>Your consultation request has been received! Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0fdf4;border-radius:8px 8px 0 0;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Service</td>
          <td style="padding:8px 12px;background:#f0fdf4;border-radius:0 8px 0 0">${opts.serviceName}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Date</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Time</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none">${time}</td></tr>
      ${prefLabel ? `<tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 0 8px;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Your Preference</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 0">${prefLabel}</td></tr>` : ''}
    </table>
    ${opts.notes ? `<p style="background:#fffbeb;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 8px 8px 0;font-size:14px"><strong>Your notes:</strong> ${opts.notes}</p>` : ''}
    <p>We'll confirm your appointment details within 24 hours. If you need to make changes, please reply to this email or call us at <strong>(786) 227-6616</strong>.</p>
    <p>We can't wait to see your garden! 🌺</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(
    opts.clientEmail,
    `Your consultation request is received — Maytee's Garden Center`,
    layout('Your Consultation Request is Received!', body),
  )
}

// ── New booking alert → business ───────────────────────────────────────────

export async function sendBookingAlert(opts: {
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  serviceName: string
  appointmentDate: Date
  zipCode?: string | null
  notes?: string | null
  customerPreference?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const prefLabel = opts.customerPreference ? (PREF_LABELS[opts.customerPreference] ?? opts.customerPreference) : '—'

  const body = `
    <p>A new booking was just submitted through the website.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Client',      opts.clientName],
        ['Email',       opts.clientEmail],
        ['Phone',       opts.clientPhone ?? '—'],
        ['Service',     opts.serviceName],
        ['Date',        `${date} at ${time}`],
        ['Preference',  prefLabel],
        ['Zip Code',    opts.zipCode ?? '—'],
        ['Notes',       opts.notes ?? '—'],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <p><a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/admin/bookings" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">View in Admin Panel</a></p>
  `

  await sendEmail(SUPPORT, `New Booking — ${opts.clientName} · ${opts.serviceName}`, layout('New Booking Request', body))
}

// ── Contact form alert → business ──────────────────────────────────────────

export async function sendContactAlert(opts: {
  name: string
  email: string
  phone?: string | null
  service?: string | null
  message: string
}) {
  const body = `
    <p>A new contact form submission was received.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Name',    opts.name],
        ['Email',   opts.email],
        ['Phone',   opts.phone ?? '—'],
        ['Service', opts.service ?? '—'],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 8px;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.6">${opts.message}</p>
    </div>
    <p><a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/admin/leads" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">View in Admin Panel</a></p>
  `

  await sendEmail(SUPPORT, `New Message from ${opts.name}`, layout('New Contact Form Submission', body))
}

// ── Booking confirmed — in-person → client ─────────────────────────────────

export async function sendBookingConfirmedInPerson(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
  notes?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  const body = `
    <p>Hi <strong>${opts.clientName}</strong>,</p>
    <p>Great news — your appointment is confirmed! Here are your details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0fdf4;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px;width:30%">Service</td>
          <td style="padding:8px 12px;background:#f0fdf4">${opts.serviceName}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Date</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Time</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none">${time}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Location</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">15196 SW 184th St, Miami, FL 33187</td></tr>
    </table>
    ${opts.notes ? `<p style="background:#fffbeb;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 8px 8px 0;font-size:14px"><strong>Notes:</strong> ${opts.notes}</p>` : ''}
    <p>If you need to reschedule or have questions, reply to this email or call <strong>(786) 227-6616</strong>.</p>
    <p>See you soon! 🌺</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(
    opts.clientEmail,
    `Your appointment is confirmed — Maytee's Garden Center`,
    layout('Your Appointment is Confirmed!', body),
  )
}

// ── Booking confirmed — video → client ─────────────────────────────────────

export async function sendBookingConfirmedVideo(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
  videoType: string
  videoCallLink?: string | null
  notes?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const platformLabel = PREF_LABELS[opts.videoType] ?? opts.videoType

  const body = `
    <p>Hi <strong>${opts.clientName}</strong>,</p>
    <p>Your video consultation is confirmed! Here are your details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0fdf4;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px;width:30%">Service</td>
          <td style="padding:8px 12px;background:#f0fdf4">${opts.serviceName}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Date</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Time</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none">${time}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Platform</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${platformLabel}</td></tr>
    </table>
    ${opts.videoCallLink ? `
    <p style="text-align:center;margin:24px 0">
      <a href="${opts.videoCallLink}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Join Meeting</a>
    </p>
    <p style="font-size:13px;color:#6b7280;text-align:center">Or copy this link: <a href="${opts.videoCallLink}" style="color:#2d6a4f">${opts.videoCallLink}</a></p>
    ` : `<p>Maytee will send you the join link before your session.</p>`}
    ${opts.notes ? `<p style="background:#fffbeb;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 8px 8px 0;font-size:14px"><strong>Notes:</strong> ${opts.notes}</p>` : ''}
    <p>If you need to reschedule or have questions, reply to this email or call <strong>(786) 227-6616</strong>.</p>
    <p>Looking forward to our session! 🌺</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(
    opts.clientEmail,
    `Your video consultation is confirmed — Maytee's Garden Center`,
    layout('Your Video Consultation is Confirmed!', body),
  )
}

// ── Booking updated → client ───────────────────────────────────────────────

export async function sendBookingUpdated(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
  consultationType?: string | null
  videoCallLink?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const typeLabel = opts.consultationType ? (PREF_LABELS[opts.consultationType] ?? opts.consultationType) : null

  const body = `
    <p>Hi <strong>${opts.clientName}</strong>,</p>
    <p>Your consultation details have been updated. Here is what's changed:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0fdf4;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px;width:30%">Service</td>
          <td style="padding:8px 12px;background:#f0fdf4">${opts.serviceName}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Date</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Time</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none">${time}</td></tr>
      ${typeLabel ? `<tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Meeting Type</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${typeLabel}</td></tr>` : ''}
    </table>
    ${opts.videoCallLink ? `
    <p style="text-align:center;margin:24px 0">
      <a href="${opts.videoCallLink}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Join Meeting</a>
    </p>` : ''}
    <p>If you have any questions, reply to this email or call <strong>(786) 227-6616</strong>.</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(
    opts.clientEmail,
    `Your appointment has been updated — Maytee's Garden Center`,
    layout('Your Appointment Has Been Updated', body),
  )
}

// ── Booking cancelled by customer → admin ─────────────────────────────────

export async function sendBookingCancelledNotice(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  const body = `
    <p>A customer has cancelled their upcoming appointment through the customer portal.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Client',  opts.clientName],
        ['Email',   opts.clientEmail],
        ['Service', opts.serviceName],
        ['Date',    `${date} at ${time}`],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <p><a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/admin/bookings" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">View in Admin Panel</a></p>
  `

  await sendEmail(SUPPORT, `Appointment Cancelled — ${opts.clientName} · ${opts.serviceName}`, layout('Appointment Cancelled by Customer', body))
}

// ── Customer message alert → business ─────────────────────────────────────

export async function sendCustomerMessageAlert(opts: {
  customerName: string
  customerEmail: string
  message: string
  bookingId?: string | null
}) {
  const body = `
    <p>A customer has sent a message through their portal.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['From',    opts.customerName],
        ['Email',   opts.customerEmail],
        ['Booking', opts.bookingId ?? '—'],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:0 0 8px;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.6">${opts.message}</p>
    </div>
    <p><a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/admin/inbox" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">View in Admin Inbox</a></p>
  `

  await sendEmail(
    SUPPORT,
    `Message from ${opts.customerName} re: their appointment`,
    layout('New Customer Message', body),
  )
}

// ── Lead reply → contact form submitter ───────────────────────────────────

export async function sendLeadReply(opts: {
  leadName: string
  leadEmail: string
  subject: string
  replyBody: string
}) {
  const body = `
    <p>Hi <strong>${opts.leadName}</strong>,</p>
    <div style="margin:16px 0;line-height:1.7;font-size:15px">${opts.replyBody.replace(/\n/g, '<br>')}</div>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `
  await sendEmail(opts.leadEmail, opts.subject, layout(opts.subject, body))
}

// ── Newsletter confirmation → subscriber ───────────────────────────────────

export async function sendNewsletterConfirmation(opts: {
  email: string
  name?: string | null
  confirmUrl: string
  unsubscribeUrl: string
}) {
  const greeting = opts.name ? `Hi <strong>${opts.name}</strong>,` : 'Hi there,'
  const body = `
    <p>${greeting}</p>
    <p>Thank you for joining the Maytee's Garden newsletter! We'll send you seasonal plant tips, garden inspiration, and exclusive updates.</p>
    <p>Please confirm your subscription by clicking the button below:</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${opts.confirmUrl}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">Confirm My Subscription</a>
    </p>
    <p style="color:#6b7280;font-size:13px">If you didn't sign up for this newsletter, you can safely ignore this email.</p>
    <p style="color:#9ca3af;font-size:12px;margin-top:16px">
      <a href="${opts.unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  `
  await sendEmail(opts.email, "Confirm your subscription — Maytee's Garden", layout("Welcome to Maytee's Garden Newsletter!", body))
}

// ── Send newsletter → subscriber ────────────────────────────────────────────

export async function sendNewsletter(opts: {
  email: string
  name?: string | null
  subject: string
  bodyHtml: string
  unsubscribeUrl: string
}) {
  const greeting = opts.name ? `<p>Hi <strong>${opts.name}</strong>,</p>` : ''
  const wrappedBody = `
    ${greeting}
    ${opts.bodyHtml}
    <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;text-align:center">
      You're receiving this because you subscribed to the Maytee's Garden newsletter.<br>
      <a href="${opts.unsubscribeUrl}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  `
  await sendEmail(opts.email, opts.subject, layout(opts.subject, wrappedBody))
}

// ── Welcome email → new user ───────────────────────────────────────────────

export async function sendWelcomeEmail(opts: { name: string; email: string }) {
  const body = `
    <p>Hi <strong>${opts.name}</strong>,</p>
    <p>Welcome to Maytee's Garden! Your account has been created and your garden journey starts right here.</p>
    <p>Here's what you can do with your account:</p>
    <ul style="padding-left:20px;line-height:2">
      <li>📅 Book consultations and track your appointments</li>
      <li>🌿 Save your favorite plants from our catalog</li>
      <li>📦 View your order history</li>
    </ul>
    <p style="margin:24px 0">
      <a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/portal" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Go to My Account</a>
    </p>
    <p>Ready to transform your garden? 🌺</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(opts.email, 'Welcome to Maytee\'s Garden! 🌿', layout('Welcome to Maytee\'s Garden!', body))
}

// ── Order confirmation → customer ──────────────────────────────────────────

export async function sendOrderConfirmation(opts: {
  customerName: string; customerEmail: string
  orderNumber: string; items: { name: string; qty: number; price: number }[]
  subtotal: number; shippingCost: number; tax: number; total: number
  shipAddress: string
}) {
  const itemRows = opts.items.map((item, i) => `
    <tr>
      <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${item.name}</td>
      <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;text-align:center">${item.qty}</td>
      <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;text-align:right">$${(item.price * item.qty).toFixed(2)}</td>
    </tr>`).join('')

  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>Thank you for your order! We're getting it ready. Here's your order summary:</p>
    <p><strong>Order Number:</strong> ${opts.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <thead>
        <tr>
          <th style="padding:8px 12px;background:#f0fdf4;border:1px solid #e5e7eb;text-align:left;color:#2d6a4f">Item</th>
          <th style="padding:8px 12px;background:#f0fdf4;border:1px solid #e5e7eb;text-align:center;color:#2d6a4f">Qty</th>
          <th style="padding:8px 12px;background:#f0fdf4;border:1px solid #e5e7eb;text-align:right;color:#2d6a4f">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:14px;max-width:300px;margin-left:auto">
      ${[
        ['Subtotal', `$${opts.subtotal.toFixed(2)}`],
        ['Shipping', `$${opts.shippingCost.toFixed(2)}`],
        ['Tax', `$${opts.tax.toFixed(2)}`],
        ['<strong>Total</strong>', `<strong>$${opts.total.toFixed(2)}</strong>`],
      ].map(([k, v]) => `<tr><td style="padding:4px 8px;text-align:right;color:#6b7280">${k}</td><td style="padding:4px 8px;text-align:right">${v}</td></tr>`).join('')}
    </table>
    <p style="margin-top:16px"><strong>Shipping to:</strong> ${opts.shipAddress}</p>
    <p>We'll send you a tracking number as soon as your order ships. 🌿</p>
    <p style="margin-top:24px">Thank you,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `
  await sendEmail(opts.customerEmail, `Your order is confirmed — ${opts.orderNumber}`, layout('Your Order is Confirmed!', body))
}

// ── New order alert → admin ────────────────────────────────────────────────

export async function sendOrderAlert(opts: {
  orderNumber: string; customerName: string; customerEmail: string
  items: { name: string; qty: number; price: number }[]
  total: number; channel: string
}) {
  const itemList = opts.items.map(i => `${i.name} × ${i.qty}`).join(', ')
  const body = `
    <p>A new store order was just placed.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Order #', opts.orderNumber],
        ['Customer', opts.customerName],
        ['Email', opts.customerEmail],
        ['Items', itemList],
        ['Total', `$${opts.total.toFixed(2)}`],
        ['Channel', opts.channel],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i % 2 === 0 ? '#f9fafb' : '#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <p><a href="${process.env.NEXTAUTH_URL ?? 'https://maytees-garden.vercel.app'}/admin/orders" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">View in Admin Panel</a></p>
  `
  await sendEmail(SUPPORT, `New Order — ${opts.orderNumber} — ${opts.customerName}`, layout('New Store Order', body))
}

// ── Shipping confirmation → customer ───────────────────────────────────────

export async function sendShippingConfirmation(opts: {
  customerName: string; customerEmail: string
  orderNumber: string; carrier: string; trackingNumber: string
  trackingUrl?: string
}) {
  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>Great news — your order <strong>${opts.orderNumber}</strong> has been shipped!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;width:30%;color:#2d6a4f;font-weight:bold">Carrier</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb">${opts.carrier}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;color:#2d6a4f;font-weight:bold">Tracking #</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb"><strong>${opts.trackingNumber}</strong></td></tr>
    </table>
    ${opts.trackingUrl ? `<p><a href="${opts.trackingUrl}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Track Your Package</a></p>` : ''}
    <p>If you have any questions about your shipment, reply to this email or call <strong>(786) 227-6616</strong>.</p>
    <p>Enjoy your new plants! 🌿</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `
  await sendEmail(opts.customerEmail, `Your order ${opts.orderNumber} has shipped!`, layout('Your Order Has Shipped!', body))
}

// ── Appointment reminder → client ─────────────────────────────────────────

export async function sendReminderEmail(opts: {
  clientName: string
  clientEmail: string
  serviceName: string
  appointmentDate: Date
  consultationType?: string | null
  videoCallLink?: string | null
}) {
  const date = opts.appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const time = opts.appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const isVideo = opts.consultationType && opts.consultationType !== 'in-person'
  const typeLabel = opts.consultationType ? (PREF_LABELS[opts.consultationType] ?? opts.consultationType) : 'In-Person Visit'
  const location = isVideo
    ? (opts.videoCallLink ?? typeLabel)
    : '15196 SW 184th St, Miami, FL 33187'

  const body = `
    <p>Hi <strong>${opts.clientName}</strong>,</p>
    <p>This is a friendly reminder that your garden consultation is <strong>tomorrow</strong>!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 12px;background:#f0fdf4;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px;width:30%">Service</td>
          <td style="padding:8px 12px;background:#f0fdf4">${opts.serviceName}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Date</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${date}</td></tr>
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Time</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none">${time}</td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none;color:#2d6a4f;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:.5px">${isVideo ? 'Meeting Link' : 'Location'}</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;border-top:none">${isVideo && opts.videoCallLink ? `<a href="${opts.videoCallLink}" style="color:#2d6a4f">${opts.videoCallLink}</a>` : location}</td></tr>
    </table>
    ${isVideo && opts.videoCallLink ? `
    <p style="text-align:center;margin:24px 0">
      <a href="${opts.videoCallLink}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Join Meeting</a>
    </p>` : ''}
    <p>If you need to reschedule or have questions, reply to this email or call <strong>(786) 227-6616</strong>.</p>
    <p>See you tomorrow! 🌺</p>
    <p style="margin-top:24px">Warmly,<br><strong>Maytee</strong><br><em>Maytee's Garden Center</em></p>
  `

  await sendEmail(
    opts.clientEmail,
    `Reminder: Your consultation tomorrow — Maytee's Garden Center`,
    layout("Reminder: Your Consultation is Tomorrow!", body),
  )
}

// ── Password reset ─────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: { name: string; email: string; resetUrl: string }) {
  const body = `
    <p>Hi <strong>${opts.name}</strong>,</p>
    <p>We received a request to reset the password for your Maytee's Garden account.</p>
    <p style="margin:24px 0">
      <a href="${opts.resetUrl}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">Reset My Password</a>
    </p>
    <p style="color:#6b7280;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p style="color:#6b7280;font-size:12px;margin-top:16px">Or copy this link into your browser:<br><span style="color:#2d6a4f">${opts.resetUrl}</span></p>
  `
  await sendEmail(opts.email, 'Reset your password — Maytee\'s Garden Center', layout('Password Reset Request', body))
}

// ── Returns ────────────────────────────────────────────────────────────────

export async function sendReturnRequestReceived(to: string, opts: {
  customerName: string
  returnNumber: string
  orderNumber: string
  reason: string
  isDamageClaim: boolean
}) {
  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>We've received your return request. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Return #',    opts.returnNumber],
        ['Order #',     opts.orderNumber],
        ['Reason',      opts.reason],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i%2===0?'#f9fafb':'#fff'};border:1px solid #e5e7eb;width:35%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i%2===0?'#f9fafb':'#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    ${opts.isDamageClaim ? `
    <p style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;font-size:14px">
      <strong>Damage claim received.</strong> Please ensure your photos clearly show the damage. We aim to resolve damage claims within <strong>24 hours</strong>.
    </p>` : ''}
    <p><strong>What happens next:</strong> Our team will review your request within <strong>1–2 business days</strong>. You'll receive an email once a decision has been made.</p>
    <p>Questions? Email <a href="mailto:info@mayteesgardencenter.com" style="color:#2d6a4f">info@mayteesgardencenter.com</a> and reference your return number <strong>${opts.returnNumber}</strong>.</p>
    <p style="margin-top:24px">Thank you,<br><strong>Maytee's Garden Center</strong></p>
  `
  await sendEmail(to, `Return request received — ${opts.returnNumber}`, layout('Return Request Received', body))
}

export async function sendReturnApproved(to: string, opts: {
  customerName: string
  returnNumber: string
  refundAmount: number
  labelUrl: string | null
  trackingNumber: string | null
  isDamageClaim: boolean
}) {
  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>Great news — your return request <strong>${opts.returnNumber}</strong> has been <strong style="color:#2d6a4f">approved</strong>!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;width:35%;color:#2d6a4f;font-weight:bold">Refund Amount</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb"><strong>$${opts.refundAmount.toFixed(2)}</strong></td></tr>
      <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;color:#2d6a4f;font-weight:bold">Refund Timeline</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">5–10 business days to your original payment method</td></tr>
      ${opts.trackingNumber ? `<tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;color:#2d6a4f;font-weight:bold">Return Tracking</td>
          <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-family:monospace"><strong>${opts.trackingNumber}</strong></td></tr>` : ''}
    </table>
    ${opts.labelUrl ? `
    <p style="text-align:center;margin:28px 0">
      <a href="${opts.labelUrl}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">⬇ Download Return Label</a>
    </p>
    <p><strong>Return instructions:</strong></p>
    <ol style="padding-left:20px;line-height:1.8;font-size:14px">
      <li>Print the return label above</li>
      <li>Pack your item securely in the original packaging if possible</li>
      <li>Attach the label to the outside of the package</li>
      <li>Drop off at any USPS, UPS, or FedEx location</li>
    </ol>` : '<p>Our team will contact you separately with return shipping instructions.</p>'}
    <p>Questions? Reply to this email or contact <a href="mailto:info@mayteesgardencenter.com" style="color:#2d6a4f">info@mayteesgardencenter.com</a>.</p>
    <p style="margin-top:24px">Thank you,<br><strong>Maytee's Garden Center</strong></p>
  `
  await sendEmail(to, `Your return is approved — refund & label inside | ${opts.returnNumber}`, layout('Return Approved ✓', body))
}

export async function sendReturnRejected(to: string, opts: {
  customerName: string
  returnNumber: string
  rejectionReason: string
  adminNotes?: string | null
}) {
  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>We've reviewed your return request <strong>${opts.returnNumber}</strong> and unfortunately we're unable to process this return at this time.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      <tr><td style="padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;width:35%;color:#991b1b;font-weight:bold">Reason</td>
          <td style="padding:8px 12px;background:#fef2f2;border:1px solid #fecaca">${opts.rejectionReason}</td></tr>
      ${opts.adminNotes ? `<tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;color:#2d6a4f;font-weight:bold">Additional Notes</td>
          <td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${opts.adminNotes}</td></tr>` : ''}
    </table>
    <p>If you believe this decision was made in error or have additional information to share, please reply to this email — we're happy to take another look.</p>
    <p style="margin-top:24px">Thank you for your understanding,<br><strong>Maytee's Garden Center</strong></p>
  `
  await sendEmail(to, `Update on your return request — ${opts.returnNumber}`, layout('Return Request Update', body))
}

export async function sendReturnReceived(to: string, opts: {
  customerName: string
  returnNumber: string
  refundAmount: number
}) {
  const body = `
    <p>Hi <strong>${opts.customerName}</strong>,</p>
    <p>We've received your return for request <strong>${opts.returnNumber}</strong>. Thank you for sending it back!</p>
    <p>Your refund of <strong>$${opts.refundAmount.toFixed(2)}</strong> will be processed within <strong>3–5 business days</strong> and credited to your original payment method.</p>
    <p>You'll see the credit appear on your statement within 5–10 business days of processing, depending on your bank.</p>
    <p>Questions? Contact us at <a href="mailto:info@mayteesgardencenter.com" style="color:#2d6a4f">info@mayteesgardencenter.com</a>.</p>
    <p style="margin-top:24px">Thank you,<br><strong>Maytee's Garden Center</strong></p>
  `
  await sendEmail(to, `We received your return — ${opts.returnNumber}`, layout('Return Received 📦', body))
}

export async function sendReturnAlert(to: string, opts: {
  returnNumber: string
  customerName: string
  customerEmail: string
  reason: string
  isDamageClaim: boolean
  orderNumber: string
  orderTotal: number
}) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://mayteesgardencenter.com'
  const body = `
    <p>A new return request has been submitted and requires your review.</p>
    ${opts.isDamageClaim ? '<p style="background:#fef3c7;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:0 8px 8px 0;font-weight:bold">⚠️ DAMAGE CLAIM — requires prompt review</p>' : ''}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
      ${[
        ['Return #',     opts.returnNumber],
        ['Order #',      opts.orderNumber],
        ['Customer',     opts.customerName],
        ['Email',        opts.customerEmail],
        ['Reason',       opts.reason],
        ['Order Total',  `$${opts.orderTotal.toFixed(2)}`],
        ['Type',         opts.isDamageClaim ? '🚨 Damage Claim' : 'Standard Return'],
      ].map(([k, v], i) => `
        <tr>
          <td style="padding:8px 12px;background:${i%2===0?'#f9fafb':'#fff'};border:1px solid #e5e7eb;width:35%;color:#2d6a4f;font-weight:bold">${k}</td>
          <td style="padding:8px 12px;background:${i%2===0?'#f9fafb':'#fff'};border:1px solid #e5e7eb">${v}</td>
        </tr>`).join('')}
    </table>
    <p><a href="${baseUrl}/admin/returns" style="display:inline-block;background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">Review in Admin Panel</a></p>
  `
  await sendEmail(to, `New return request — ${opts.customerName} · ${opts.returnNumber}`, layout('New Return Request', body))
}
