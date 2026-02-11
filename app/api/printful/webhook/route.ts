import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import crypto from 'crypto'

async function parseAndVerifyBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  const webhookSecret = process.env.PRINTFUL_WEBHOOK_SECRET

  if (webhookSecret) {
    const signature = request.headers.get('x-printful-signature')
    if (!signature) return null

    const rawBody = await request.text()
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSig) return null

    return JSON.parse(rawBody)
  }

  // No secret configured — reject in production
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return request.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseAndVerifyBody(request)
    if (!body) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data } = body as { type?: string; data?: Record<string, unknown> }

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Handle shipment events
    if (type === 'package_shipped') {
      const shipment = data.shipment as Record<string, unknown> | undefined
      const order = data.order as Record<string, unknown> | undefined
      const printfulOrderId = order?.id
      const trackingNumber = shipment?.tracking_number
      const trackingUrl = shipment?.tracking_url

      if (printfulOrderId && shipment) {
        await sql`
          UPDATE print_orders
          SET status = 'shipped',
              tracking_number = ${(trackingNumber as string) || null},
              tracking_url = ${(trackingUrl as string) || null},
              shipped_at = NOW(),
              updated_at = NOW()
          WHERE printful_order_id = ${printfulOrderId as string}
        `
      }
    }

    if (type === 'package_returned') {
      const order = data.order as Record<string, unknown> | undefined
      const printfulOrderId = order?.id
      if (printfulOrderId) {
        await sql`
          UPDATE print_orders
          SET status = 'returned', updated_at = NOW()
          WHERE printful_order_id = ${printfulOrderId as string}
        `
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Printful webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
