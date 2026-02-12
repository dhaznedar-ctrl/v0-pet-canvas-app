import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await sql`
    SELECT u.id, u.email, u.credits, u.created_at,
           (SELECT COUNT(*)::int FROM orders WHERE user_id = u.id AND paid = true) AS order_count,
           (SELECT COUNT(*)::int FROM jobs WHERE user_id = u.id) AS generation_count
    FROM users u
    ORDER BY u.created_at DESC
    LIMIT 500
  `

  return NextResponse.json({ users })
}
