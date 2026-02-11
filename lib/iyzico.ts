import 'server-only'

// Use the official iyzipay SDK for correct auth signature generation
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require('iyzipay')

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com',
})

// ── Types ──

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

// ── Checkout Form Initialize ──

export function createCheckoutForm(params: CreatePaymentParams): Promise<{
  status: string
  token?: string
  checkoutFormContent?: string
  paymentPageUrl?: string
  errorMessage?: string
}> {
  const request = {
    locale: 'en',
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: params.currency,
    basketId: params.basketId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
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
      itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
      price: item.price,
    })),
  }

  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: Error | null, result: Record<string, unknown>) => {
      if (err) {
        console.error('[iyzico] SDK error:', err)
        reject(err)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[iyzico] Response:', (result as { status: string }).status)
        }
        resolve(result as { status: string; token?: string; checkoutFormContent?: string; paymentPageUrl?: string; errorMessage?: string })
      }
    })
  })
}

// ── Retrieve Checkout Form Result ──

export function retrieveCheckoutForm(token: string): Promise<{
  status: string
  paymentStatus?: string
  paymentId?: string
  price?: number
  errorMessage?: string
}> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve({ locale: 'en', token }, (err: Error | null, result: Record<string, unknown>) => {
      if (err) {
        console.error('[iyzico] Retrieve error:', err)
        reject(err)
      } else {
        resolve(result as { status: string; paymentStatus?: string; paymentId?: string; price?: number; errorMessage?: string })
      }
    })
  })
}
