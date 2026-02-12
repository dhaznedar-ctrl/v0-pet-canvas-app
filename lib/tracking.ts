// ── Tracking Pixel Utilities ──
// Sends events to Meta (fbq), GA4 (gtag), TikTok (ttq), Pinterest (pintrk)
// Each function fires to all available pixels — gracefully skips missing ones.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    ttq?: { track: (...args: unknown[]) => void }
    pintrk?: (...args: unknown[]) => void
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq(...args)
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) window.gtag(...args)
}

function ttq(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ttq) window.ttq.track(event, params)
}

function pintrk(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.pintrk) window.pintrk(event, event, params)
}

export function trackPageView() {
  fbq('track', 'PageView')
  gtag('event', 'page_view')
  ttq('ViewContent')
  pintrk('pagevisit')
}

export function trackUpload() {
  fbq('trackCustom', 'PhotoUpload')
  gtag('event', 'photo_upload', { event_category: 'engagement' })
  ttq('SubmitForm')
  pintrk('custom', { event_name: 'photo_upload' })
}

export function trackGenerateStart() {
  fbq('trackCustom', 'GenerateStart')
  gtag('event', 'generate_start', { event_category: 'engagement' })
  ttq('ClickButton', { content_name: 'generate_start' })
  pintrk('custom', { event_name: 'generate_start' })
}

export function trackGenerateComplete() {
  fbq('trackCustom', 'GenerateComplete')
  gtag('event', 'generate_complete', { event_category: 'engagement' })
  ttq('CompleteRegistration')
  pintrk('custom', { event_name: 'generate_complete' })
}

export function trackAddToCart(value?: number, currency?: string) {
  fbq('track', 'AddToCart', { value, currency })
  gtag('event', 'add_to_cart', { value, currency })
  ttq('AddToCart', { value, currency })
  pintrk('addtocart', { value, currency })
}

export function trackPurchase(value: number, currency: string, orderId?: string | number) {
  fbq('track', 'Purchase', { value, currency, content_ids: [orderId] })
  gtag('event', 'purchase', { value, currency, transaction_id: orderId })
  ttq('PlaceAnOrder', { value, currency })
  pintrk('checkout', { value, currency, order_id: orderId })
}
