import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { sendDigitalDownloadEmail } from '@/lib/email'
import { tagSubscriber } from '@/lib/mailchimp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string

    if (!token) {
      return NextResponse.redirect(new URL('/create?payment=failed', request.url))
    }

    const result = await retrieveCheckoutForm(token)

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // Idempotent update: only mark as paid if not already paid (replay guard)
      const updated = await sql`
        UPDATE orders
        SET paid = true, payment_id = ${result.paymentId || null}
        WHERE iyzico_token = ${token} AND paid = false
        RETURNING id, user_id, product_id
      `

      // If no rows updated, this callback was already processed — redirect to success
      if (updated.length === 0) {
        const existingOrder = await sql`
          SELECT id FROM orders WHERE iyzico_token = ${token} AND paid = true LIMIT 1
        `
        if (existingOrder.length > 0) {
          return NextResponse.redirect(
            new URL(`/success?orderId=${existingOrder[0].id}`, request.url)
          )
        }
        return NextResponse.redirect(new URL('/create?payment=failed', request.url))
      }

      const order = updated[0]

      // Get user email for notifications
      const userRows = await sql`SELECT email FROM users WHERE id = ${order.user_id}`
      const orderEmail = userRows.length > 0 ? userRows[0].email : null

      // Mailchimp: tag as purchaser (fire-and-forget)
      if (orderEmail) {
        tagSubscriber(orderEmail, ['purchaser']).catch(console.error)
      }

      // Fulfill credit pack purchases
      if (order.product_id === 'credit-pack-10') {
        await sql`UPDATE users SET credits = credits + 10 WHERE id = ${order.user_id}`
        await sql`
          INSERT INTO credits (user_id, amount, reason, order_id)
          VALUES (${order.user_id}, 10, 'purchase_pack_10', ${order.id})
        `
        return NextResponse.redirect(
          new URL(`/success?orderId=${order.id}&credits=10`, request.url)
        )
      }

      // For digital downloads — send the HD download email
      if (orderEmail && !orderEmail.startsWith('guest-')) {
        const jobs = await sql`
          SELECT j.id, j.output_key
          FROM jobs j
          WHERE j.order_id = ${order.id}
            AND j.status = 'completed'
          ORDER BY j.created_at DESC
          LIMIT 1
        `

        if (jobs.length > 0 && jobs[0].output_key) {
          sendDigitalDownloadEmail(
            orderEmail,
            order.id,
            jobs[0].output_key,
          ).catch(console.error)
        }
      }

      return NextResponse.redirect(
        new URL(`/success?orderId=${order.id}`, request.url)
      )
    }

    return NextResponse.redirect(new URL('/create?payment=failed', request.url))
  } catch (error) {
    console.error('iyzico callback error:', error)
    return NextResponse.redirect(new URL('/create?payment=failed', request.url))
  }
}
