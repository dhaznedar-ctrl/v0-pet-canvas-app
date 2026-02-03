'use client'

import React from "react"

import { useState } from 'react'
import { X, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (email: string) => void
  productName?: string
  price?: number
}

export function EmailCheckoutModal({
  open,
  onOpenChange,
  onContinue,
  productName = 'Instant Masterpiece',
  price = 19,
}: EmailCheckoutModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    // TODO: Backend integration points:
    // 1. Save email to database for order tracking
    // 2. Create Stripe checkout session
    // 3. Initialize IyziCo payment if in Turkey
    // 4. Initialize PayPal checkout if selected
    // 5. Initialize PayTR payment if selected
    
    // Mock: Simulate API call
    setTimeout(() => {
      onContinue(email)
      setIsLoading(false)
      setEmail('')
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Enter your email
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {"We'll send your order confirmation here"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
              autoComplete="email"
              required
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Checkout'}
          </Button>

          {productName && price && (
            <p className="text-center text-xs text-muted-foreground">
              {productName} - ${price}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
