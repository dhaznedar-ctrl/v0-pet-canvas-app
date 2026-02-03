'use client'

import { useCallback, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { CreateFormData } from '@/app/create/page'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

interface CheckoutStepProps {
  formData: CreateFormData
  updateFormData: (updates: Partial<CreateFormData>) => void
  onNext: () => void
  onBack: () => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutStep({ formData, updateFormData, onNext, onBack }: CheckoutStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Create checkout session when component mounts
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            style: formData.style,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create checkout session')
        }

        const data = await response.json()
        setSessionId(data.sessionId)
        updateFormData({ orderId: data.orderId })
      } catch (error) {
        toast({ title: 'Payment Error', description: error instanceof Error ? error.message : 'Failed to initialize payment', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }

    createSession()
  }, [formData.email, formData.style, updateFormData])

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        style: formData.style,
      }),
    })
    const data = await response.json()
    return data.clientSecret
  }, [formData.email, formData.style])

  const onComplete = useCallback(() => {
    updateFormData({ paid: true })
    onNext()
  }, [updateFormData, onNext])

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Preparing checkout...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Complete Your Payment
            </h2>
            <p className="text-muted-foreground text-sm">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-foreground">Pet Portrait Generation</span>
            <span className="text-foreground font-semibold">$9.99</span>
          </div>
        </div>

        <div id="checkout" className="min-h-[400px]">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ 
              clientSecret: fetchClientSecret,
              onComplete: onComplete,
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-transparent"
          >
            Back to Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
