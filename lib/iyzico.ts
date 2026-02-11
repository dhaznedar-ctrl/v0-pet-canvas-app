import 'server-only'
import crypto from 'crypto'

const API_KEY = process.env.IYZICO_API_KEY!
const SECRET_KEY = process.env.IYZICO_SECRET_KEY!
const BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'

function generateAuthorizationHeader(uri: string, body: string): string {
  const randomString = crypto.randomBytes(8).toString('hex')
  const hashStr = API_KEY + randomString + SECRET_KEY + body
  const hash = crypto.createHash('sha1').update(hashStr).digest('base64')
  const authorizationParams = `apiKey:${API_KEY}&randomKey:${randomString}&signature:${hash}`
  return `IYZWS ${Buffer.from(authorizationParams).toString('base64')}`
}

async function iyzicoFetch(endpoint: string, body: Record<string, unknown>) {
  const uri = endpoint
  const bodyStr = JSON.stringify(body)
  const authorization = generateAuthorizationHeader(uri, bodyStr)

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
      'x-iyzi-rnd': crypto.randomBytes(8).toString('hex'),
    },
    body: bodyStr,
  })

  return res.json()
}

export interface CreatePaymentParams {
  price: string
  paidPrice: string
  currency: 'USD' | 'TRY' | 'EUR'
  basketId: string
  conversationId: string
  callbackUrl: string
  buyer: {
    id: string
    name: string
    surname: string
    email: string
    ip: string
    city: string
    country: string
    address: string
  }
  basketItems: Array<{
    id: string
    name: string
    category: string
    price: string
    itemType: string
  }>
}

export async function createCheckoutForm(params: CreatePaymentParams): Promise<{
  status: string
  token?: string
  checkoutFormContent?: string
  paymentPageUrl?: string
  errorMessage?: string
}> {
  const body = {
    locale: 'en',
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: params.currency,
    basketId: params.basketId,
    paymentGroup: 'PRODUCT',
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: params.buyer.id,
      name: params.buyer.name,
      surname: params.buyer.surname,
      gsmNumber: '+10000000000',
      email: params.buyer.email,
      identityNumber: '00000000000',
      registrationAddress: params.buyer.address,
      ip: params.buyer.ip,
      city: params.buyer.city,
      country: params.buyer.country,
    },
    shippingAddress: {
      contactName: `${params.buyer.name} ${params.buyer.surname}`,
      city: params.buyer.city,
      country: params.buyer.country,
      address: params.buyer.address,
    },
    billingAddress: {
      contactName: `${params.buyer.name} ${params.buyer.surname}`,
      city: params.buyer.city,
      country: params.buyer.country,
      address: params.buyer.address,
    },
    basketItems: params.basketItems.map((item) => ({
      id: item.id,
      name: item.name,
      category1: item.category,
      itemType: 'VIRTUAL',
      price: item.price,
    })),
  }

  return iyzicoFetch('/payment/iyzi-pos/checkoutform/initialize/auth/ecom', body)
}

export async function retrieveCheckoutForm(token: string): Promise<{
  status: string
  paymentStatus?: string
  paymentId?: string
  price?: number
  errorMessage?: string
}> {
  return iyzicoFetch('/payment/iyzi-pos/checkoutform/auth/ecom/detail', {
    locale: 'en',
    token,
  })
}
