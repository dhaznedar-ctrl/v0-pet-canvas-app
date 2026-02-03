import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'

const CONSENT_VERSION = 'v1.0'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, acceptedTermsA, acceptedTermsB } = body

    if (!email || !acceptedTermsA || !acceptedTermsB) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get IP and user agent for GDPR-compliant tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const ipHash = hashIP(ip)
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
        ${acceptedTermsA}, ${acceptedTermsB}
      )
    `

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json(
      { error: 'Failed to save consent' },
      { status: 500 }
    )
  }
}
