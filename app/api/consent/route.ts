import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { createApiToken, isValidEmail, getRequestIP } from '@/lib/api-auth'
import { consentSchema, validateWithHoneypot } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

const CONSENT_VERSION = 'v1.0'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Rate limit
    const rateLimit = await checkRateLimit(ip, '/api/consent')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Zod validation + honeypot
    const validation = validateWithHoneypot(consentSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/consent' })
      return NextResponse.json({ success: true, userId: 0, authToken: '' })
    }

    const { email, turnstileToken } = validation.data

    // Turnstile verification
    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/consent' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    // Validate email format (allow guest-* auto-generated emails)
    if (!email.startsWith('guest-') && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create or get user
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    let userId: number
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
    } else {
      const newUser = await sql`
        INSERT INTO users (email) VALUES (${email}) RETURNING id
      `
      userId = newUser[0].id
    }

    // Record consent
    await sql`
      INSERT INTO consents (
        user_id, ip_hash, user_agent, consent_version,
        accepted_terms_a, accepted_terms_b
      ) VALUES (
        ${userId}, ${ipHash}, ${userAgent}, ${CONSENT_VERSION},
        ${true}, ${true}
      )
    `

    // Generate signed API token for subsequent requests
    const authToken = createApiToken(userId, email)

    return NextResponse.json({ success: true, userId, authToken })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
