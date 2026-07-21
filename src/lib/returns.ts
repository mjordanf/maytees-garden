import { prisma } from '@/lib/prisma'

export const RETURN_REASONS: Record<string, string> = {
  change_of_mind:     'Changed my mind',
  wrong_item:         'Received wrong item',
  damaged_shipping:   'Damaged during shipping',
  plant_arrived_dead: 'Plant arrived dead or dying',
  not_as_described:   'Not as described',
  duplicate_order:    'Accidentally ordered twice',
  other:              'Other',
}

export const DAMAGE_CLAIM_REASONS = new Set(['plant_arrived_dead', 'damaged_shipping'])

export async function generateReturnNumber(): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await prisma.returnRequest.count()
  const seq   = String(count + 1).padStart(4, '0')
  return `RET-${year}-${seq}`
}

export function isWithinReturnWindow(
  deliveredAt: Date | null,
  isDamageClaim: boolean,
): { eligible: boolean; reason?: string } {
  if (!deliveredAt) {
    return { eligible: false, reason: 'Order has not been delivered yet' }
  }
  const windowMs  = isDamageClaim ? 48 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000
  const deadlineMs = deliveredAt.getTime() + windowMs
  if (Date.now() > deadlineMs) {
    return { eligible: false, reason: 'Return window has expired' }
  }
  return { eligible: true }
}
