import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminRateLimit, getRequestIP } from '@/lib/api-auth'
import { isIPBlocked } from '@/lib/security'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rateCheck = checkAdminRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const password = body?.password
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || !password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Timing-safe comparison
    const inputBuf = Buffer.from(password)
    const expectedBuf = Buffer.from(adminPassword)
    if (inputBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(inputBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consents = await sql`
      SELECT
        c.id,
        u.email,
        c.ip_hash,
        c.consent_version,
        c.accepted_terms_a,
        c.accepted_terms_b,
        c.created_at
      FROM consents c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ consents })
  } catch (error) {
    console.error('Admin consents error:', error)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
