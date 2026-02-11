import crypto from 'crypto'
import { NextRequest } from 'next/server'

const SECRET = process.env.NEXTAUTH_SECRET
if (!SECRET && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXTAUTH_SECRET environment variable is required in production')
}
const SIGNING_KEY = SECRET || 'dev-only-secret'

// ── Signed API Token ──

export function createApiToken(userId: number, email: string): string {
  const payload = JSON.stringify({
    uid: userId,
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  })
  const encoded = Buffer.from(payload).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SIGNING_KEY)
    .update(encoded)
    .digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyApiToken(token: string): { userId: number; email: string } | null {
  try {
    const dotIdx = token.indexOf('.')
    if (dotIdx === -1) return null

    const encoded = token.slice(0, dotIdx)
    const signature = token.slice(dotIdx + 1)

    const expectedSig = crypto
      .createHmac('sha256', SIGNING_KEY)
      .update(encoded)
      .digest('base64url')

    // Timing-safe comparison
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    if (payload.exp < Date.now()) return null

    return { userId: payload.uid, email: payload.email }
  } catch {
    return null
  }
}

export function getAuthUser(request: NextRequest): { userId: number; email: string } | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return verifyApiToken(auth.slice(7))
}

// ── Email Validation ──

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── Admin Rate Limiting ──

const adminAttempts = new Map<string, { count: number; blockedUntil: number }>()
const ADMIN_MAX_ATTEMPTS = 5
const ADMIN_BLOCK_MS = 15 * 60 * 1000 // 15 minutes

export function checkAdminRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = adminAttempts.get(ip)

  if (entry && entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  // Reset if block expired
  if (entry && entry.blockedUntil <= now && entry.count >= ADMIN_MAX_ATTEMPTS) {
    adminAttempts.delete(ip)
  }

  return { allowed: true }
}

export function recordAdminAttempt(ip: string, success: boolean): void {
  if (success) {
    adminAttempts.delete(ip)
    return
  }

  const entry = adminAttempts.get(ip) || { count: 0, blockedUntil: 0 }
  entry.count++

  if (entry.count >= ADMIN_MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + ADMIN_BLOCK_MS
  }

  adminAttempts.set(ip, entry)
}

// Cleanup stale entries hourly
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of adminAttempts.entries()) {
    if (entry.blockedUntil > 0 && entry.blockedUntil < now) {
      adminAttempts.delete(key)
    }
  }
}, 60 * 60 * 1000)

// ── Helper: extract IP from request ──

export function getRequestIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
