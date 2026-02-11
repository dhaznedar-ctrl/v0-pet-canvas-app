import 'server-only'

const PRINTFUL_API = 'https://api.printful.com'

async function printfulFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PRINTFUL_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Printful API error ${res.status}: ${error}`)
  }

  return res.json()
}

// Printful product variants
export const PRINT_PRODUCTS = {
  // Poster prints (archival paper)
  'poster-8x10': { printfulVariantId: 17, size: '8×10"', name: 'Poster 8×10' },
  'poster-10x12': { printfulVariantId: 18, size: '10×12"', name: 'Poster 10×12' },
  'poster-12x18': { printfulVariantId: 10, size: '12×18"', name: 'Poster 12×18' },
  'poster-18x24': { printfulVariantId: 11, size: '18×24"', name: 'Poster 18×24' },
  'poster-24x36': { printfulVariantId: 12, size: '24×36"', name: 'Poster 24×36' },
  // Canvas prints (gallery-wrapped)
  'canvas-10x12': { printfulVariantId: 16, size: '10×12"', name: 'Canvas 10×12' },
  'canvas-12x18': { printfulVariantId: 13, size: '12×18"', name: 'Canvas 12×18' },
  'canvas-18x24': { printfulVariantId: 14, size: '18×24"', name: 'Canvas 18×24' },
  'canvas-24x36': { printfulVariantId: 15, size: '24×36"', name: 'Canvas 24×36' },
} as const

export type PrintSize = keyof typeof PRINT_PRODUCTS

// Map user-facing size strings to PrintSize keys
export function resolvePrintSize(size: string, type: 'poster' | 'canvas'): PrintSize | null {
  const sizeMap: Record<string, string> = {
    '8" x 10"': '8x10',
    '10" x 12"': '10x12',
    '12" x 18"': '12x18',
    '18" x 24"': '18x24',
    '24" x 36"': '24x36',
  }
  const normalized = sizeMap[size]
  if (!normalized) return null
  const key = `${type}-${normalized}` as PrintSize
  return key in PRINT_PRODUCTS ? key : null
}

export interface PrintfulOrderResult {
  id: number
  status: string
  shipping: string
  estimatedDelivery: string
}

/**
 * Create a print order on Printful
 */
export async function createPrintOrder(params: {
  imageUrl: string
  size: PrintSize
  recipient: {
    name: string
    address1: string
    city: string
    stateCode: string
    countryCode: string
    zip: string
    email: string
  }
  externalId: string
}): Promise<PrintfulOrderResult> {
  const variant = PRINT_PRODUCTS[params.size]

  const orderData = {
    external_id: params.externalId,
    recipient: {
      name: params.recipient.name,
      address1: params.recipient.address1,
      city: params.recipient.city,
      state_code: params.recipient.stateCode,
      country_code: params.recipient.countryCode,
      zip: params.recipient.zip,
      email: params.recipient.email,
    },
    items: [
      {
        variant_id: variant.printfulVariantId,
        quantity: 1,
        files: [
          {
            type: 'default',
            url: params.imageUrl,
          },
        ],
      },
    ],
  }

  const result = await printfulFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })

  return {
    id: result.result.id,
    status: result.result.status,
    shipping: result.result.shipping_service_name || 'Standard',
    estimatedDelivery: result.result.estimated_fulfillment || '5-7 business days',
  }
}

/**
 * Get order status from Printful
 */
export async function getOrderStatus(orderId: number): Promise<{
  status: string
  trackingNumber?: string
  trackingUrl?: string
}> {
  const result = await printfulFetch(`/orders/${orderId}`)

  const shipments = result.result.shipments || []
  const latestShipment = shipments[shipments.length - 1]

  return {
    status: result.result.status,
    trackingNumber: latestShipment?.tracking_number,
    trackingUrl: latestShipment?.tracking_url,
  }
}

/**
 * Estimate shipping cost
 */
export async function estimateShipping(params: {
  variantId: number
  countryCode: string
  stateCode?: string
  zip?: string
}): Promise<{ standard: number; express?: number }> {
  const result = await printfulFetch('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify({
      recipient: {
        country_code: params.countryCode,
        state_code: params.stateCode,
        zip: params.zip,
      },
      items: [
        {
          variant_id: params.variantId,
          quantity: 1,
        },
      ],
    }),
  })

  const rates = result.result || []
  const standard = rates.find((r: { id: string }) => r.id === 'STANDARD')
  const express = rates.find((r: { id: string }) => r.id === 'EXPRESS')

  return {
    standard: standard ? parseFloat(standard.rate) : 0,
    express: express ? parseFloat(express.rate) : undefined,
  }
}
