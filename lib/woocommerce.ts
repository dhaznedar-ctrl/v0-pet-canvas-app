import 'server-only'

const WC_URL = process.env.WOOCOMMERCE_URL
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET

async function wcFetch(endpoint: string, options: RequestInit = {}) {
  if (!WC_URL || !WC_KEY || !WC_SECRET) {
    throw new Error('WooCommerce not configured')
  }

  const url = new URL(`/wp-json/wc/v3${endpoint}`, WC_URL)
  url.searchParams.set('consumer_key', WC_KEY)
  url.searchParams.set('consumer_secret', WC_SECRET)

  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`WooCommerce API error ${res.status}: ${error}`)
  }

  return res.json()
}

export interface WCProduct {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: string
  regular_price: string
  sale_price: string
  images: Array<{ src: string; alt: string }>
  categories: Array<{ id: number; name: string }>
  status: string
}

/**
 * Fetch all published products from WooCommerce
 */
export async function getProducts(): Promise<WCProduct[]> {
  return wcFetch('/products?status=publish&per_page=50')
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const products = await wcFetch(`/products?slug=${slug}`)
  return products.length > 0 ? products[0] : null
}

/**
 * Create an order in WooCommerce for record keeping
 */
export async function createWCOrder(params: {
  email: string
  productId: number
  price: string
  paymentMethod: string
  paymentId: string
}): Promise<{ id: number; order_key: string }> {
  return wcFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({
      payment_method: params.paymentMethod,
      payment_method_title: params.paymentMethod === 'iyzico' ? 'iyzico' : 'Other',
      set_paid: true,
      billing: { email: params.email },
      line_items: [
        {
          product_id: params.productId,
          quantity: 1,
          total: params.price,
        },
      ],
      meta_data: [
        { key: '_payment_id', value: params.paymentId },
      ],
    }),
  })
}

/**
 * Update order status in WooCommerce
 */
export async function updateWCOrderStatus(
  orderId: number,
  status: 'processing' | 'completed' | 'cancelled' | 'refunded'
): Promise<void> {
  await wcFetch(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * Sync local product prices from WooCommerce
 * Call this periodically or on demand to keep prices in sync
 */
export async function syncProductPrices(): Promise<
  Array<{ slug: string; price: string; name: string }>
> {
  const products = await getProducts()
  return products.map((p) => ({
    slug: p.slug,
    price: p.price,
    name: p.name,
  }))
}
