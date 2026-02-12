import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const banners = await sql`
      SELECT id, message, type
      FROM notification_banners
      WHERE active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (banners.length === 0) {
      return NextResponse.json({ banner: null })
    }

    return NextResponse.json({ banner: banners[0] })
  } catch {
    return NextResponse.json({ banner: null })
  }
}
