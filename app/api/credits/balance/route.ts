import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthUser, getRequestIP } from '@/lib/api-auth'
import { isIPBlocked } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const ip = getRequestIP(request)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // General rate limit
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Require auth token — no unauthenticated balance queries
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const users = await sql`SELECT credits FROM users WHERE id = ${authUser.userId}`
    return NextResponse.json({ credits: users.length > 0 ? (users[0].credits || 0) : 0 })
  } catch (error) {
    console.error('Credits balance error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
