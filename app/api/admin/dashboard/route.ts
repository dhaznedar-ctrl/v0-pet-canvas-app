import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get revenue stats for 7d, 30d, all time
  const [revenue7d] = await sql`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM orders WHERE paid = true AND created_at >= NOW() - INTERVAL '7 days'`
  const [revenue30d] = await sql`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM orders WHERE paid = true AND created_at >= NOW() - INTERVAL '30 days'`
  const [revenueAll] = await sql`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM orders WHERE paid = true`

  // Order counts
  const [orders7d] = await sql`SELECT COUNT(*)::int AS count FROM orders WHERE paid = true AND created_at >= NOW() - INTERVAL '7 days'`
  const [orders30d] = await sql`SELECT COUNT(*)::int AS count FROM orders WHERE paid = true AND created_at >= NOW() - INTERVAL '30 days'`
  const [ordersAll] = await sql`SELECT COUNT(*)::int AS count FROM orders WHERE paid = true`

  // User count
  const [userCount] = await sql`SELECT COUNT(*)::int AS count FROM users`

  // Generation count
  const [genCount] = await sql`SELECT COUNT(*)::int AS count FROM jobs`
  const [genCompleted] = await sql`SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'completed'`

  // Daily revenue for chart (last 30 days)
  const dailyRevenue = await sql`
    SELECT DATE(created_at) AS date, COALESCE(SUM(amount), 0)::numeric AS total, COUNT(*)::int AS orders
    FROM orders WHERE paid = true AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at) ORDER BY date
  `

  return NextResponse.json({
    revenue: { last7d: Number(revenue7d.total), last30d: Number(revenue30d.total), allTime: Number(revenueAll.total) },
    orders: { last7d: orders7d.count, last30d: orders30d.count, allTime: ordersAll.count },
    users: userCount.count,
    generations: { total: genCount.count, completed: genCompleted.count },
    dailyRevenue,
  })
}
