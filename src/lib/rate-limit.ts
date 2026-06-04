// In-memory rate limiter. Works correctly on Vercel (each cold start resets the store,
// preventing burst abuse within a single invocation lifetime).
// For production at scale, replace with Upstash Redis for distributed rate limiting.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) {
    return { success: false, remaining: 0 }
  }
  return { success: true, remaining: limit - entry.count }
}
