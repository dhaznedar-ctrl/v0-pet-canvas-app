import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS } from '@/lib/products'
import { sql, hashIP } from '@/lib/db'
import { createCheckoutForm } from '@/lib/iyzico'
import { getAuthUser, isValidEmail, getRequestIP } from '@/lib/api-auth'
import { checkoutCreateSchema, validateWithHoneypot } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Rate limit
    const rateLimit = await checkRateLimit(ip, '/api/checkout/create')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Zod validation + honeypot
    const validation = validateWithHoneypot(checkoutCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/checkout/create' })
      return NextResponse.json({ orderId: 0, checkoutFormContent: '', token: '' })
    }

    const { email, style, productId, jobId, name, surname, turnstileToken } = validation.data

    // Turnstile verification
    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/checkout/create' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    if (!isValidEmail(email) && !email.startsWith('guest-')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
    const price = (product.priceInCents / 100).toFixed(2)

    // Prefer auth token, fall back to email lookup
    const authUser = getAuthUser(request)
    let userId: number

    if (authUser) {
      userId = authUser.userId
    } else {
      // Email fallback only for guest users — real emails require auth token
      if (!email.startsWith('guest-')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      const users = await sql`SELECT id FROM users WHERE email = ${email}`
      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found. Please complete consent step first.' },
          { status: 400 }
        )
      }
      userId = users[0].id
    }

    // Idempotency: check if this job already has a paid order
    if (jobId) {
      const existingPaid = await sql`
        SELECT o.id FROM orders o
        JOIN jobs j ON j.order_id = o.id
        WHERE j.id = ${jobId} AND o.user_id = ${userId} AND o.paid = true
        LIMIT 1
      `
      if (existingPaid.length > 0) {
        return NextResponse.json(
          { error: 'Already purchased', orderId: existingPaid[0].id },
          { status: 409 }
        )
      }
    }

    const conversationId = `order-${userId}-${Date.now()}`
    const basketId = `basket-${userId}-${Date.now()}`
    const isDev = process.env.NODE_ENV === 'development'
    const callbackUrl = isDev
      ? `http://localhost:3000/api/iyzico/callback`
      : `${process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'}/api/iyzico/callback`

    // iyzico requires valid IPv4 — ::1 (IPv6 localhost) causes error
    const buyerIp = (ip === '::1' || ip === '::ffff:127.0.0.1') ? '127.0.0.1' : ip

    const result = await createCheckoutForm({
      price,
      paidPrice: price,
      currency: 'USD',
      basketId,
      conversationId,
      callbackUrl,
      buyer: {
        id: userId.toString(),
        name: name || 'Guest',
        surname: surname || 'User',
        email,
        ip: buyerIp,
        city: 'New York',
        country: 'United States',
        address: 'N/A',
      },
      basketItems: [
        {
          id: product.id,
          name: product.name,
          category: 'Digital Art',
          price,
          itemType: 'VIRTUAL',
        },
      ],
    })

    if (result.status !== 'success') {
      console.error('[Checkout] iyzico error:', JSON.stringify(result, null, 2))
      return NextResponse.json(
        { error: result.errorMessage || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    const orderResult = await sql`
      INSERT INTO orders (user_id, iyzico_token, paid, amount, currency, product_id)
      VALUES (${userId}, ${result.token || null}, false, ${product.priceInCents}, 'usd', ${product.id})
      RETURNING id
    `

    const orderId = orderResult[0].id

    // Link job to this order (so we can find the HD image after payment)
    if (jobId) {
      await sql`UPDATE jobs SET order_id = ${orderId} WHERE id = ${jobId} AND user_id = ${userId}`
    }

    return NextResponse.json({
      orderId,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      token: result.token,
    })
  } catch (error) {
    console.error('Checkout create error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
