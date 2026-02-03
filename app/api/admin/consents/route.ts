import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    return NextResponse.json(
      { error: 'Failed to fetch consents' },
      { status: 500 }
    )
  }
}
