import { NextRequest, NextResponse } from 'next/server'
import { hashIP } from '@/lib/db'
import { checkAdminRateLimit, recordAdminAttempt, getRequestIP } from '@/lib/api-auth'
import { adminAuthSchema } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Rate limit check
    const rateCheck = checkAdminRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Zod validation
    const validation = adminAuthSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { password } = validation.data
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
    }

    // Timing-safe comparison to prevent timing attacks
    const inputBuf = Buffer.from(password || '')
    const expectedBuf = Buffer.from(adminPassword)

    const match =
      inputBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(inputBuf, expectedBuf)

    if (!match) {
      recordAdminAttempt(ip, false)
      await logSecurityEvent('admin_auth_fail', ipHash, null, { ip_masked: ip.slice(0, 8) })
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    recordAdminAttempt(ip, true)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
