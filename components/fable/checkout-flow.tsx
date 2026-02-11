'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, CreditCard, CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderDetails {
  type: 'download' | 'small_print' | 'large_print'
  size?: string
  price: number
  email?: string
  productId?: string
  style?: string
}

interface CheckoutFlowProps {
  order: OrderDetails
  authToken?: string | null
  onPaymentSuccess: () => void
  onPaymentFailed: (error: string) => void
  onBack: () => void
}

type CheckoutState = 'initializing' | 'form_ready' | 'processing' | 'success' | 'print_processing'

export function CheckoutFlow({
  order,
  authToken,
  onPaymentSuccess,
  onPaymentFailed,
  onBack,
}: CheckoutFlowProps) {
  const [state, setState] = useState<CheckoutState>('initializing')
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)

  // Initialize iyzico checkout
  useEffect(() => {
    if (state !== 'initializing') return

    async function initCheckout() {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`

        const res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: order.email,
            style: order.style || 'renaissance',
            productId: order.productId || 'pet-portrait-digital',
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          onPaymentFailed(data.error || 'Failed to initialize payment')
          return
        }

        if (data.checkoutFormContent) {
          setCheckoutHtml(data.checkoutFormContent)
          setState('form_ready')
        } else if (data.paymentPageUrl) {
          window.location.href = data.paymentPageUrl
        } else {
          onPaymentFailed('No checkout form returned')
        }
      } catch (error) {
        onPaymentFailed('Failed to connect to payment service')
      }
    }

    initCheckout()
  }, [state, order, onPaymentFailed])

  // Inject iyzico form HTML
  useEffect(() => {
    if (state !== 'form_ready' || !checkoutHtml || !formContainerRef.current) return

    formContainerRef.current.innerHTML = checkoutHtml

    // Execute any scripts in the injected HTML
    const scripts = formContainerRef.current.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      if (oldScript.src) {
        newScript.src = oldScript.src
      } else {
        newScript.textContent = oldScript.textContent
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [state, checkoutHtml])

  // Initializing State
  if (state === 'initializing') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Preparing secure checkout...
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Setting up your payment form.
          </p>
          <p className="text-xs text-muted-foreground">
            {order.type === 'download' ? 'Digital download' : `${order.size} print`} — ${order.price}
          </p>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CreditCard className="h-3 w-3" />
              Secure payment powered by iyzico
            </p>
          </div>
        </div>
      </div>
    )
  }

  // iyzico Form Ready
  if (state === 'form_ready') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Complete Your Payment
          </h3>
          <div ref={formContainerRef} className="min-h-[300px]" />
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <Button variant="ghost" onClick={onBack} className="text-sm">
              Back
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Secure payment via iyzico
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success State (Download)
  if (state === 'success') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Payment Successful!
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your high-resolution masterpiece is ready to download.
          </p>
          <Button className="w-full bg-primary hover:bg-primary/90 mb-3" onClick={onPaymentSuccess}>
            Download Your Masterpiece
          </Button>
          <p className="text-xs text-muted-foreground">
            A download link has also been sent to {order.email || 'your email'}.
          </p>
        </div>
      </div>
    )
  }

  // Print Processing State
  if (state === 'print_processing') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Your print order is being processed
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Production and shipping are handled by our print partner Printful.
          </p>
          <div className="bg-card rounded-lg p-4 mb-4 text-left border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm font-medium text-foreground">{order.size}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-medium text-foreground">${order.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Delivery</span>
              <span className="text-sm font-medium text-foreground">5-7 business days</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs font-medium text-muted-foreground">Track Shipment</p>
                <p className="text-[10px] text-muted-foreground">You&apos;ll receive a tracking email once shipped</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Order confirmation sent to {order.email || 'your email'}
          </p>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-primary mb-2">Your order includes a digital download:</p>
            <Button variant="outline" className="w-full bg-transparent text-sm" onClick={onPaymentSuccess}>
              Download Digital Version
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
