import 'server-only'
import { sql, hashIP } from '@/lib/db'
import { blockIP, logSecurityEvent } from '@/lib/security'

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

// Endpoint-specific rate limit configs
interface RateLimitConfig {
  maxRequests: number
  windowMinutes: number
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/upload': { maxRequests: 5, windowMinutes: 10 },
  '/api/generate': { maxRequests: 3, windowMinutes: 15 },
  '/api/consent': { maxRequests: 10, windowMinutes: 60 },
  '/api/checkout/create': { maxRequests: 5, windowMinutes: 60 },
  '/api/credits/purchase': { maxRequests: 5, windowMinutes: 60 },
  '/api/print/order': { maxRequests: 5, windowMinutes: 60 },
  '/api/support/ticket': { maxRequests: 3, windowMinutes: 60 },
  '/api/orders/request-otp': { maxRequests: 5, windowMinutes: 60 },
  '/api/orders/lookup': { maxRequests: 10, windowMinutes: 60 },
  '/api/orders/track': { maxRequests: 10, windowMinutes: 60 },
}

const GENERAL_LIMIT: RateLimitConfig = { maxRequests: 100, windowMinutes: 1 }
const PAID_MULTIPLIER = 10

/**
 * Check rate limit using PostgreSQL sliding window
 */
export async function checkRateLimit(
  ip: string,
  endpoint?: string,
  isPaid: boolean = false
): Promise<RateLimitResult> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { success: true, remaining: 9999, resetAt: Date.now() + 86400000 }
  }

  const ipHash = hashIP(ip)
  const config = (endpoint && ENDPOINT_LIMITS[endpoint]) || GENERAL_LIMIT
  const maxRequests = isPaid ? config.maxRequests * PAID_MULTIPLIER : config.maxRequests
  const windowMs = config.windowMinutes * 60 * 1000
  const windowStart = new Date(Date.now() - windowMs).toISOString()
  const rateLimitKey = `${endpoint || 'general'}:${ipHash}`

  try {
    // Count requests in current window
    const countResult = await sql`
      SELECT COALESCE(SUM(request_count), 0) as total
      FROM rate_limits
      WHERE key = ${rateLimitKey}
        AND window_start >= ${windowStart}
    `

    const currentCount = Number(countResult[0]?.total || 0)

    if (currentCount >= maxRequests) {
      // Log rate limit hit and potentially block IP
      const fpNull = null
      await logSecurityEvent('rate_limit_hit', ipHash, fpNull, {
        endpoint,
        count: currentCount,
        limit: maxRequests,
      })

      // Block IP for 1 hour if exceeded by 2x
      if (currentCount >= maxRequests * 2) {
        await blockIP(ip, `Rate limit exceeded: ${endpoint || 'general'}`, 60)
        await logSecurityEvent('ip_blocked', ipHash, fpNull, {
          reason: 'rate_limit_exceeded_2x',
          endpoint,
        })
      }

      return {
        success: false,
        remaining: 0,
        resetAt: Date.now() + windowMs,
      }
    }

    // Increment counter - upsert for current minute bucket
    const bucketStart = new Date(
      Math.floor(Date.now() / 60000) * 60000
    ).toISOString()

    await sql`
      INSERT INTO rate_limits (key, window_start, request_count)
      VALUES (${rateLimitKey}, ${bucketStart}, 1)
      ON CONFLICT (key, window_start) DO UPDATE
        SET request_count = rate_limits.request_count + 1
    `

    return {
      success: true,
      remaining: maxRequests - currentCount - 1,
      resetAt: Date.now() + windowMs,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Fail closed — block requests when DB is unavailable to prevent abuse
    return { success: false, remaining: 0, resetAt: Date.now() + 60000 }
  }
}

/**
 * Clean up old rate limit entries (called by cleanup cron)
 */
export async function cleanupRateLimits(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM rate_limits
      WHERE window_start < NOW() - INTERVAL '2 hours'
      RETURNING id
    `
    return result.length
  } catch (error) {
    console.error('Rate limit cleanup error:', error)
    return 0
  }
}
