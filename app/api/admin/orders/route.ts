import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await sql`
    SELECT o.id, o.paid, o.amount, o.currency, o.product_id, o.created_at,
           u.email,
           po.id AS print_order_id, po.size AS print_size, po.status AS print_status,
           po.tracking_number, po.tracking_url,
           po.recipient_name, po.recipient_address1, po.recipient_city,
           po.recipient_state_code, po.recipient_country_code, po.recipient_zip, po.recipient_phone
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN print_orders po ON po.order_id = o.id
    ORDER BY o.created_at DESC
    LIMIT 500
  `

  return NextResponse.json({ orders })
}
