import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestIP } from '@/lib/api-auth'
import { orderLookupSchema } from '@/lib/validation'
import { isIPBlocked } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)

    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const rateLimit = await checkRateLimit(ip, '/api/orders/lookup')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = orderLookupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { email, code } = parsed.data

    // Verify OTP
    const otps = await sql`
      SELECT id FROM email_otps
      WHERE email = ${email}
        AND code = ${code}
        AND used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (otps.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Please request a new one.' },
        { status: 401 }
      )
    }

    // Mark OTP as used
    await sql`UPDATE email_otps SET used = true WHERE id = ${otps[0].id}`

    // Fetch user orders
    const users = await sql`SELECT id FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return NextResponse.json({ orders: [] })
    }

    const userId = users[0].id
    const SITE_URL = process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'

    const orders = await sql`
      SELECT
        o.id,
        o.paid,
        o.amount,
        o.currency,
        o.product_id,
        o.created_at,
        j.id as job_id,
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
      WHERE o.user_id = ${userId} AND o.paid = true
      ORDER BY o.created_at DESC
      LIMIT 50
    `

    const formattedOrders = orders.map((o: Record<string, unknown>) => ({
      id: o.id,
      amount: o.amount,
      currency: o.currency,
      productId: o.product_id,
      createdAt: o.created_at,
      jobStatus: o.job_status,
      style: o.style,
      previewUrl: o.output_key,
      downloadUrl: `${SITE_URL}/api/download/${o.id}`,
      print: o.print_size ? {
        size: o.print_size,
        status: o.print_status,
        trackingNumber: o.tracking_number,
        trackingUrl: o.tracking_url,
        shippedAt: o.shipped_at,
        deliveredAt: o.delivered_at,
      } : null,
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
