import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSignedDownloadUrl } from '@/lib/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId: orderIdStr } = await params
    const orderId = parseInt(orderIdStr, 10)

    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    // Verify order is paid
    const orders = await sql`
      SELECT o.id, o.paid, o.user_id
      FROM orders o
      WHERE o.id = ${orderId}
    `

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!orders[0].paid) {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    // Find the job linked to this order
    const jobs = await sql`
      SELECT j.hd_output_key, j.output_key
      FROM jobs j
      WHERE j.order_id = ${orderId}
        AND j.status = 'completed'
      ORDER BY j.created_at DESC
      LIMIT 1
    `

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'No completed portrait found for this order' }, { status: 404 })
    }

    const hdKey = jobs[0].hd_output_key
    if (!hdKey) {
      return NextResponse.json({ error: 'HD image not available' }, { status: 404 })
    }

    // Generate a presigned URL valid for 24 hours
    const signedUrl = await getSignedDownloadUrl(hdKey, 86400)

    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
