import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Handle shipment events
    if (type === 'package_shipped' && data.shipment) {
      const printfulOrderId = data.order?.id
      const trackingNumber = data.shipment.tracking_number
      const trackingUrl = data.shipment.tracking_url
      const carrier = data.shipment.carrier

      if (printfulOrderId) {
        await sql`
          UPDATE print_orders
          SET status = 'shipped',
              tracking_number = ${trackingNumber || null},
              tracking_url = ${trackingUrl || null},
              shipped_at = NOW(),
              updated_at = NOW()
          WHERE printful_order_id = ${printfulOrderId}
        `
      }
    }

    if (type === 'package_returned') {
      const printfulOrderId = data.order?.id
      if (printfulOrderId) {
        await sql`
          UPDATE print_orders
          SET status = 'returned', updated_at = NOW()
          WHERE printful_order_id = ${printfulOrderId}
        `
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Printful webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
