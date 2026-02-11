import { NextRequest, NextResponse } from 'next/server'
import { PRODUCTS } from '@/lib/products'
import { sql, hashIP } from '@/lib/db'
import { createCheckoutForm } from '@/lib/iyzico'
import { getAuthUser, isValidEmail, getRequestIP } from '@/lib/api-auth'
import { creditsPurchaseSchema, validateWithHoneypot } from '@/lib/validation'
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
    const rateLimit = await checkRateLimit(ip, '/api/credits/purchase')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Zod validation + honeypot
    const validation = validateWithHoneypot(creditsPurchaseSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/credits/purchase' })
      return NextResponse.json({ orderId: 0, checkoutFormContent: '', token: '' })
    }

    const { email, turnstileToken } = validation.data

    // Turnstile verification
    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/credits/purchase' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    if (!isValidEmail(email) && !email.startsWith('guest-')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const product = PRODUCTS.find((p) => p.id === 'credit-pack-10')
    if (!product) {
      return NextResponse.json({ error: 'Credit pack not found' }, { status: 500 })
    }

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
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      userId = users[0].id
    }

    const conversationId = `credits-${userId}-${Date.now()}`
    const basketId = `credits-basket-${userId}-${Date.now()}`
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'}/api/iyzico/callback`

    const result = await createCheckoutForm({
      price,
      paidPrice: price,
      currency: 'USD',
      basketId,
      conversationId,
      callbackUrl,
      buyer: {
        id: userId.toString(),
        name: 'Guest',
        surname: 'User',
        email,
        ip,
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

    return NextResponse.json({
      orderId: orderResult[0].id,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      token: result.token,
    })
  } catch (error) {
    console.error('Credits purchase error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
