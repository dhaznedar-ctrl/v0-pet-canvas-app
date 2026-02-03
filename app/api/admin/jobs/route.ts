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
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
