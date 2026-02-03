// In-memory rate limiter for development
// For production, use Upstash Redis or Vercel WAF

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const ANONYMOUS_LIMIT = 5 // 5 requests per day
const PAID_LIMIT = 20 // 20 requests per day
const DAY_MS = 24 * 60 * 60 * 1000

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(ip: string, isPaid: boolean = false): RateLimitResult {
  const limit = isPaid ? PAID_LIMIT : ANONYMOUS_LIMIT
  const now = Date.now()
  const key = `rate:${ip}`
  
  let entry = rateLimitStore.get(key)
  
  // Reset if expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + DAY_MS,
    }
  }
  
  // Check limit
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  
  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean up every hour
