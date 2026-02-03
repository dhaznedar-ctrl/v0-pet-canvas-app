'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Order details interface
interface OrderDetails {
  type: 'download' | 'small_print' | 'large_print'
  size?: string
  price: number
  email?: string
}

interface CheckoutFlowProps {
  order: OrderDetails
  onPaymentSuccess: () => void
  onPaymentFailed: (error: string) => void
  onBack: () => void
}

type CheckoutState = 'processing' | 'success' | 'print_processing'

export function CheckoutFlow({
  order,
  onPaymentSuccess,
  onPaymentFailed,
  onBack,
}: CheckoutFlowProps) {
  const [state, setState] = useState<CheckoutState>('processing')
  const [progress, setProgress] = useState(0)

  // Mock payment processing
  useEffect(() => {
    if (state !== 'processing') return

    const timer = setTimeout(() => {
      // TODO: Stripe / IyziCo / PayPal / PayTR integration
      // Mock: 90% success rate
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        if (order.type === 'download') {
          setState('success')
          onPaymentSuccess()
        } else {
          setState('print_processing')
        }
      } else {
        onPaymentFailed('Payment was declined. Please try a different payment method.')
      }
    }, 3000)

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 300)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [state, order.type, onPaymentSuccess, onPaymentFailed])

  // Processing State
  if (state === 'processing') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin" />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Redirecting to secure checkout...
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Please wait while we process your order.
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Processing {order.type === 'download' ? 'digital download' : `${order.size} print`} - ${order.price}
          </p>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CreditCard className="h-3 w-3" />
              Secure payment powered by Stripe
            </p>
            {/* TODO: Add payment provider logos here */}
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

          <Button className="w-full bg-primary hover:bg-primary/90 mb-3">
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
            Production and shipping are handled by our print partner.
          </p>

          {/* Order details */}
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
              <span className="text-sm font-medium text-foreground">7-9 business days</span>
            </div>
          </div>

          {/* Shipping tracking (disabled/coming soon) */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 opacity-50">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs font-medium text-muted-foreground">Track Shipment</p>
                <p className="text-[10px] text-muted-foreground">Coming soon - Check email for updates</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Order confirmation sent to {order.email || 'your email'}
          </p>

          {/* Digital download included */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-primary mb-2">Your order includes a digital download:</p>
            <Button variant="outline" className="w-full bg-transparent text-sm">
              Download Digital Version
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
