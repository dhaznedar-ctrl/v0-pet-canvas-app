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

    const jobs = await sql`
      SELECT
        j.id,
        u.email,
        j.style,
        j.status,
        j.error,
        j.created_at,
        j.updated_at
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      ORDER BY j.created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Admin jobs error:', error)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
