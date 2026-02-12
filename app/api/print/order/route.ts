import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createPrintOrder, type PrintSize } from '@/lib/printful'
import { sendPrintOrderConfirmation } from '@/lib/email'
import { getAuthUser, getRequestIP } from '@/lib/api-auth'
import { printOrderSchema } from '@/lib/validation'
import { isIPBlocked } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import { tagSubscriber } from '@/lib/mailchimp'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Rate limit
    const rateLimit = await checkRateLimit(ip, '/api/print/order')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Zod validation
    const validation = printOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { jobId, size, orderId, recipient } = validation.data

    // Verify ownership via auth token or order lookup
    const authUser = getAuthUser(request)

    // Verify order is paid and get user info
    let orders
    if (authUser) {
      orders = await sql`
        SELECT o.id, o.paid, u.email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ${orderId} AND o.paid = true AND o.user_id = ${authUser.userId}
      `
    } else {
      orders = await sql`
        SELECT o.id, o.paid, u.email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ${orderId} AND o.paid = true
      `
    }

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found or not paid' }, { status: 400 })
    }

    // Check for duplicate print order
    const existingPrint = await sql`
      SELECT id FROM print_orders WHERE order_id = ${orderId} AND job_id = ${jobId}
    `
    if (existingPrint.length > 0) {
      return NextResponse.json({ error: 'A print order already exists for this order' }, { status: 409 })
    }

    const jobs = await sql`
      SELECT output_key FROM jobs WHERE id = ${jobId} AND status = 'completed'
    `

    if (jobs.length === 0 || !jobs[0].output_key) {
      return NextResponse.json({ error: 'Generated image not found' }, { status: 404 })
    }

    const imageUrl = jobs[0].output_key
    const email = orders[0].email

    const printOrder = await createPrintOrder({
      imageUrl,
      size: size as PrintSize,
      recipient,
      externalId: `petcanvas-${orderId}-${jobId}`,
    })

    await sql`
      INSERT INTO print_orders (
        order_id, job_id, printful_order_id, size, status,
        recipient_name, recipient_address1, recipient_city,
        recipient_state_code, recipient_country_code, recipient_zip, recipient_phone
      ) VALUES (
        ${orderId}, ${jobId}, ${printOrder.id}, ${size}, ${printOrder.status},
        ${recipient?.name || null}, ${recipient?.address1 || null}, ${recipient?.city || null},
        ${recipient?.stateCode || null}, ${recipient?.countryCode || null},
        ${recipient?.zip || null}, ${recipient?.phone || null}
      )
    `

    // Mailchimp: tag as print customer (fire-and-forget)
    tagSubscriber(email, ['print_customer']).catch(console.error)

    await sendPrintOrderConfirmation(email, orderId, 'Canvas Print', size)

    return NextResponse.json({
      success: true,
      printfulOrderId: printOrder.id,
      estimatedDelivery: printOrder.estimatedDelivery,
    })
  } catch (error) {
    console.error('Print order error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
