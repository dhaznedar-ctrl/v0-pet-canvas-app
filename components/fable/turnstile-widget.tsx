'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onExpire?: () => void
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const onExpireRef = useRef(onExpire)
  const [shouldRender, setShouldRender] = useState(false)

  onTokenRef.current = onToken
  onExpireRef.current = onExpire

  // Determine if we should render (client-side only to avoid hydration mismatch)
  useEffect(() => {
    if (SITE_KEY && window.location.hostname !== 'localhost') {
      setShouldRender(true)
    }
  }, [])

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !SITE_KEY) return
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => onTokenRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
      theme: 'dark',
      size: 'compact',
    })
  }, [])

  useEffect(() => {
    if (!shouldRender) return

    if (window.turnstile) {
      renderWidget()
      return
    }

    const existingScript = document.querySelector('script[src*="turnstile"]')
    if (!existingScript) {
      window.onTurnstileLoad = renderWidget
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      document.head.appendChild(script)
    } else {
      const poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll)
          renderWidget()
        }
      }, 100)
      return () => clearInterval(poll)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [shouldRender, renderWidget])

  if (!shouldRender) return null

  return <div ref={containerRef} className="flex justify-center my-2" />
}

export function resetTurnstile(widgetContainerRef: React.RefObject<HTMLDivElement | null>) {
  // Not needed with the component approach — component handles its own state
}
