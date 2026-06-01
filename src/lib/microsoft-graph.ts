// MICROSOFT GRAPH CALENDAR SYNC SETUP:
// 1. Go to portal.azure.com → Azure Active Directory → App registrations → New registration
// 2. Name: "Maytees Garden Calendar", Supported account types: "Single tenant"
// 3. After creation: API permissions → Add → Microsoft Graph → Application permissions
//    Add: Calendars.ReadWrite  then "Grant admin consent"
// 4. Certificates & secrets → New client secret → copy the VALUE (not ID)
// 5. Copy: Tenant ID (from Overview), Client ID (Application ID), Client Secret value
// 6. Add to Vercel: MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
// 7. MICROSOFT_CALENDAR_USER = info@mayteesgardencenter.com

const TENANT_ID     = process.env.MICROSOFT_TENANT_ID
const CLIENT_ID     = process.env.MICROSOFT_CLIENT_ID
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET
const CALENDAR_USER = process.env.MICROSOFT_CALENDAR_USER ?? 'info@mayteesgardencenter.com'

function isConfigured() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.warn('[graph] Microsoft Graph not configured — calendar sync disabled')
    return false
  }
  return true
}

async function getAccessToken(): Promise<string | null> {
  if (!isConfigured()) return null
  try {
    const res = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        scope:         'https://graph.microsoft.com/.default',
      }),
    })
    const data = await res.json()
    return data.access_token ?? null
  } catch (err) {
    console.error('[graph] getAccessToken failed:', err)
    return null
  }
}

async function graphRequest(method: string, path: string, body?: object): Promise<any> {
  const token = await getAccessToken()
  if (!token) return null
  try {
    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 204) return { success: true }
    return res.json()
  } catch (err) {
    console.error('[graph] request failed:', method, path, err)
    return null
  }
}

type BookingData = {
  clientName: string; clientEmail: string; clientPhone?: string | null
  serviceName: string; consultationType?: string | null; videoCallLink?: string | null
  appointmentDate: Date; slotEnd?: string | null
  notes?: string | null; consultationNotes?: string | null
  zipCode?: string | null
}

function buildEvent(booking: BookingData) {
  const isVideo = booking.consultationType && booking.consultationType !== 'in-person'
  const start   = booking.appointmentDate.toISOString()
  // End time: +60min
  const endDate = new Date(booking.appointmentDate)
  endDate.setMinutes(endDate.getMinutes() + 60)
  const end = endDate.toISOString()

  const PREF_LABELS: Record<string, string> = {
    'facetime':    'FaceTime', 'whatsapp': 'WhatsApp Video',
    'google-meet': 'Google Meet', 'in-person': 'In-Person Visit',
  }
  const typeLabel = booking.consultationType ? (PREF_LABELS[booking.consultationType] ?? booking.consultationType) : 'In-Person Visit'

  return {
    subject:  `Garden Consultation — ${booking.clientName}`,
    body: {
      contentType: 'HTML',
      content: `
        <b>Customer:</b> ${booking.clientName}<br>
        <b>Email:</b> ${booking.clientEmail}<br>
        ${booking.clientPhone ? `<b>Phone:</b> ${booking.clientPhone}<br>` : ''}
        ${booking.zipCode    ? `<b>ZIP:</b> ${booking.zipCode}<br>`       : ''}
        <b>Service:</b> ${booking.serviceName}<br>
        <b>Type:</b> ${typeLabel}<br>
        ${booking.videoCallLink ? `<b>Video Link:</b> <a href="${booking.videoCallLink}">${booking.videoCallLink}</a><br>` : ''}
        ${booking.notes            ? `<br><b>Customer Notes:</b> ${booking.notes}<br>`      : ''}
        ${booking.consultationNotes? `<b>Internal Notes:</b> ${booking.consultationNotes}<br>` : ''}
      `,
    },
    start:    { dateTime: start, timeZone: 'America/New_York' },
    end:      { dateTime: end,   timeZone: 'America/New_York' },
    location: { displayName: isVideo ? (booking.videoCallLink ?? typeLabel) : '15196 SW 184th St, Miami, FL 33187' },
    reminderMinutesBeforeStart: 60,
    isReminderOn: true,
    attendees: [{
      emailAddress: { address: booking.clientEmail, name: booking.clientName },
      type: 'required',
    }],
  }
}

export async function createCalendarEvent(booking: BookingData): Promise<string | null> {
  if (!isConfigured()) return null
  const result = await graphRequest('POST', `/users/${CALENDAR_USER}/events`, buildEvent(booking))
  return result?.id ?? null
}

export async function updateCalendarEvent(eventId: string, booking: BookingData): Promise<boolean> {
  if (!isConfigured() || !eventId) return false
  const result = await graphRequest('PATCH', `/users/${CALENDAR_USER}/events/${eventId}`, buildEvent(booking))
  return !!result
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  if (!isConfigured() || !eventId) return false
  const result = await graphRequest('DELETE', `/users/${CALENDAR_USER}/events/${eventId}`)
  return !!result
}

export async function getCalendarEvents(startDate: Date, endDate: Date) {
  if (!isConfigured()) return []
  const start = startDate.toISOString()
  const end   = endDate.toISOString()
  const result = await graphRequest('GET', `/users/${CALENDAR_USER}/calendarView?startDateTime=${start}&endDateTime=${end}&$select=id,subject,start,end`)
  return result?.value ?? []
}
