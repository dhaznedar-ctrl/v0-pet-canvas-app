import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestIP } from '@/lib/api-auth'
import { orderOtpRequestSchema, validateWithHoneypot } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { verifyTurnstile } from '@/lib/turnstile'
import { sendOTPEmail } from '@/lib/email'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rateLimit = await checkRateLimit(ip, '/api/orders/request-otp')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    const validation = validateWithHoneypot(orderOtpRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/orders/request-otp' })
      return NextResponse.json({ sent: true })
    }

    const { email, turnstileToken } = validation.data

    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    // Check if user with this email exists and has orders
    const users = await sql`SELECT id FROM users WHERE email = ${email}`
    if (users.length === 0) {
      // Don't reveal if email exists — always return success
      return NextResponse.json({ sent: true })
    }

    // Invalidate old OTPs
    await sql`
      UPDATE email_otps SET used = true
      WHERE email = ${email} AND used = false
    `

    // Generate and store OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    await sql`
      INSERT INTO email_otps (email, code, expires_at)
      VALUES (${email}, ${code}, ${expiresAt})
    `

    // Send OTP email
    sendOTPEmail(email, code).catch(console.error)

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('OTP request error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
