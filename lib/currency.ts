// Multi-currency support — detect Turkish visitors and show TL prices
// Fixed rate: 1 USD = 40 TL

export type CurrencyCode = 'USD' | 'TRY'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  rate: number // multiplier from USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  TRY: { code: 'TRY', symbol: '₺', rate: 40 },
}

/**
 * Detect if user is likely from Turkey based on timezone or language
 */
export function detectCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD'

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Europe/Istanbul') return 'TRY'
  } catch {}

  try {
    const lang = navigator.language || ''
    if (lang.startsWith('tr')) return 'TRY'
  } catch {}

  return 'USD'
}

/**
 * Format a USD cent amount in the given currency
 */
export function formatPrice(usdCents: number, currency: CurrencyCode): string {
  const config = CURRENCIES[currency]
  const usdAmount = usdCents / 100
  const converted = Math.round(usdAmount * config.rate)

  if (currency === 'TRY') {
    return `${converted} ${config.symbol}`
  }
  return `${config.symbol}${usdAmount}`
}

/**
 * Convert a USD dollar amount to target currency (whole number)
 */
export function convertUSD(usdAmount: number, currency: CurrencyCode): number {
  return Math.round(usdAmount * CURRENCIES[currency].rate)
}

/**
 * Format a raw USD dollar amount (not cents) in the given currency
 */
export function formatUSD(usdAmount: number, currency: CurrencyCode): string {
  const config = CURRENCIES[currency]
  const converted = Math.round(usdAmount * config.rate)

  if (currency === 'TRY') {
    return `${converted} ${config.symbol}`
  }
  return `${config.symbol}${usdAmount}`
}
