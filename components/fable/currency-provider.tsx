'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { detectCurrency, formatPrice, formatUSD, convertUSD, type CurrencyCode } from '@/lib/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  /** Format price from USD cents → display string */
  format: (usdCents: number) => string
  /** Format price from USD dollars → display string */
  formatDollars: (usdAmount: number) => string
  /** Convert USD dollars → target currency number */
  convert: (usdAmount: number) => number
  /** Currency symbol ($, ₺) */
  symbol: string
  /** Is Turkish Lira? */
  isTRY: boolean
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  format: (c) => `$${(c / 100).toFixed(0)}`,
  formatDollars: (a) => `$${a}`,
  convert: (a) => a,
  symbol: '$',
  isTRY: false,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('USD')

  useEffect(() => {
    setCurrency(detectCurrency())
  }, [])

  const value: CurrencyContextValue = {
    currency,
    format: (usdCents) => formatPrice(usdCents, currency),
    formatDollars: (usdAmount) => formatUSD(usdAmount, currency),
    convert: (usdAmount) => convertUSD(usdAmount, currency),
    symbol: currency === 'TRY' ? '₺' : '$',
    isTRY: currency === 'TRY',
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
