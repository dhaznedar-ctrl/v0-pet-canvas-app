import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const banners = await sql`SELECT * FROM notification_banners ORDER BY created_at DESC`
  return NextResponse.json({ banners })
}

export async function POST(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, type, active, starts_at, ends_at } = await request.json()
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const result = await sql`
    INSERT INTO notification_banners (message, type, active, starts_at, ends_at)
    VALUES (${message}, ${type || 'info'}, ${active || false}, ${starts_at || null}, ${ends_at || null})
    RETURNING *
  `

  return NextResponse.json({ banner: result[0] }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, message, type, active, starts_at, ends_at } = await request.json()
  if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })

  await sql`
    UPDATE notification_banners
    SET message = COALESCE(${message || null}, message),
        type = COALESCE(${type || null}, type),
        active = COALESCE(${active !== undefined ? active : null}, active),
        starts_at = ${starts_at !== undefined ? starts_at : null},
        ends_at = ${ends_at !== undefined ? ends_at : null},
        updated_at = NOW()
    WHERE id = ${id}
  `

  return NextResponse.json({ success: true })
}
