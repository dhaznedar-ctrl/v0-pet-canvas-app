import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestIP } from '@/lib/api-auth'
import { supportTicketSchema, validateWithHoneypot } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { verifyTurnstile } from '@/lib/turnstile'
import { sendSupportTicketConfirmation } from '@/lib/email'

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PC-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rateLimit = await checkRateLimit(ip, '/api/support/ticket')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    const validation = validateWithHoneypot(supportTicketSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/support/ticket' })
      return NextResponse.json({ ticketNumber: 'PC-000000-0000' })
    }

    const { email, subject, message, turnstileToken } = validation.data

    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/support/ticket' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    const ticketNumber = generateTicketNumber()

    await sql`
      INSERT INTO support_tickets (ticket_number, user_email, subject, message)
      VALUES (${ticketNumber}, ${email}, ${subject}, ${message})
    `

    // Send auto-reply email (fire-and-forget)
    sendSupportTicketConfirmation(email, ticketNumber, subject).catch(console.error)

    return NextResponse.json({ ticketNumber })
  } catch (error) {
    console.error('Support ticket error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
