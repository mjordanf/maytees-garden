import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'

export async function checkAndSendReminders(): Promise<number> {
  const now   = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const bookings = await prisma.booking.findMany({
    where: {
      status:          'confirmed',
      reminderSent:    false,
      appointmentDate: { gte: in24h, lte: in25h },
    },
    include: { service: true },
  })

  for (const b of bookings) {
    try {
      await sendReminderEmail({
        clientName:       b.clientName,
        clientEmail:      b.clientEmail,
        serviceName:      b.service?.nameEn ?? 'Garden Consultation',
        appointmentDate:  b.appointmentDate,
        consultationType: b.consultationType,
        videoCallLink:    b.videoCallLink,
      })
      await prisma.booking.update({ where: { id: b.id }, data: { reminderSent: true } })
    } catch (err) {
      console.error('[reminders] failed for booking', b.id, err)
    }
  }

  return bookings.length
}
