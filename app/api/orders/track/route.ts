import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestIP } from '@/lib/api-auth'
import { orderTrackSchema } from '@/lib/validation'
import { isIPBlocked } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)

    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rateLimit = await checkRateLimit(ip, '/api/orders/track')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = orderTrackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { email, orderId } = parsed.data

    // Find user by email
    const users = await sql`SELECT id FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return NextResponse.json({ error: 'No order found with this email and order ID.' }, { status: 404 })
    }

    const userId = users[0].id
    const SITE_URL = process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'

    // Look up specific order by ID + user
    const orders = await sql`
      SELECT
        o.id,
        o.amount,
        o.currency,
        o.product_id,
        o.created_at,
        j.status as job_status,
        j.style,
        j.output_key,
        po.size as print_size,
        po.status as print_status,
        po.tracking_number,
        po.tracking_url,
        po.shipped_at,
        po.delivered_at
      FROM orders o
      LEFT JOIN jobs j ON j.order_id = o.id
      LEFT JOIN print_orders po ON po.order_id = o.id
      WHERE o.id = ${orderId} AND o.user_id = ${userId} AND o.paid = true
      LIMIT 1
    `

    if (orders.length === 0) {
      return NextResponse.json({ error: 'No order found with this email and order ID.' }, { status: 404 })
    }

    const o = orders[0]
    const order = {
      id: o.id,
      amount: o.amount,
      currency: o.currency,
      productId: o.product_id,
      createdAt: o.created_at,
      jobStatus: o.job_status,
      style: o.style,
      downloadUrl: `${SITE_URL}/api/download/${o.id}`,
      print: o.print_size ? {
        size: o.print_size,
        status: o.print_status,
        trackingNumber: o.tracking_number,
        trackingUrl: o.tracking_url,
        shippedAt: o.shipped_at,
        deliveredAt: o.delivered_at,
      } : null,
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order track error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
