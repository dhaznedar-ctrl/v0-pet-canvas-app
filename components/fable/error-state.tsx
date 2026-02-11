'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft, Mail, Clock, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/components/fable/currency-provider'

// Error types matching the app state machine
type ErrorType = 'upload_failed' | 'generate_failed' | 'payment_failed' | 'rate_limited'

interface ErrorStateProps {
  errorType: ErrorType
  errorMessage?: string
  onRetry?: () => void
  onGoBack?: () => void
  onContactSupport?: () => void
  onBuyCredits?: () => void
  onBuySinglePortrait?: () => void
  resetTime?: number
}

const ERROR_CONTENT = {
  upload_failed: {
    icon: AlertCircle,
    title: 'Upload Failed',
    description: 'We couldn\'t upload your photo. Please check your file and try again.',
    primaryAction: 'Try Again',
    secondaryAction: 'Go Back',
  },
  generate_failed: {
    icon: AlertCircle,
    title: 'Generation Failed',
    description: 'Something went wrong while creating your masterpiece. Please try again.',
    primaryAction: 'Retry Generation',
    secondaryAction: 'Upload New Photo',
  },
  payment_failed: {
    icon: AlertCircle,
    title: 'Payment Failed',
    description: 'We couldn\'t process your payment. Please check your payment details and try again.',
    primaryAction: 'Try Again',
    secondaryAction: 'Contact Support',
  },
  rate_limited: {
    icon: Clock,
    title: 'Daily Limit Reached',
    description: 'You\'ve used all your free generations for today.',
    primaryAction: 'View Pricing',
    secondaryAction: 'Try Again Tomorrow',
  },
}

export function ErrorState({
  errorType,
  errorMessage,
  onRetry,
  onGoBack,
  onContactSupport,
  onBuyCredits,
  onBuySinglePortrait,
  resetTime,
}: ErrorStateProps) {
  const { formatDollars } = useCurrency()
  const content = ERROR_CONTENT[errorType]
  const Icon = content.icon

  // Countdown state for rate limit reset
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (errorType !== 'rate_limited' || !resetTime) return

    function updateCountdown() {
      const diff = Math.max(0, resetTime! - Date.now())
      if (diff <= 0) {
        setCountdown('now')
        return
      }
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.ceil((diff % 3600000) / 60000)
      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`)
      } else {
        setCountdown(`${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [errorType, resetTime])

  // Special rate_limited UI with credit purchase option
  if (errorType === 'rate_limited') {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="rounded-xl border border-primary/30 bg-card p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Want More Creations?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            You&apos;ve used your 5 free daily previews. Keep creating with a credit pack.
          </p>

          {/* Credit Pack Card */}
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 mb-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground">10 Credits Pack</h4>
                <p className="text-xs text-muted-foreground">{formatDollars(3.9)} per generation</p>
              </div>
              <span className="text-2xl font-bold text-primary">{formatDollars(39)}</span>
            </div>

            <div className="space-y-1.5 mb-4">
              {[
                '10 AI portrait generations',
                'No daily limit — use anytime',
                'Credits never expire',
                'All styles & retry tools included',
                'Watermarked previews (purchase to download)',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={onBuyCredits}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Buy 10 Credits — {formatDollars(39)}
            </Button>
          </div>

          {/* Single portrait purchase option */}
          {onBuySinglePortrait && (
            <div className="rounded-xl border border-border bg-card p-4 mb-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Love your last preview?</h4>
                  <p className="text-xs text-muted-foreground">Purchase the full-resolution version</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBuySinglePortrait}
                  className="bg-transparent text-xs"
                >
                  Buy for {formatDollars(29)}
                </Button>
              </div>
            </div>
          )}

          {/* Come back later with countdown */}
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {countdown && countdown !== 'now'
                  ? `Free previews reset in ${countdown}`
                  : 'Free previews available now!'}
              </span>
            </div>
            <button
              onClick={onGoBack}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {countdown === 'now' ? 'Go back and try again' : 'Come back later for 5 more free previews'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default error UI for other error types
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          {content.title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          {content.description}
        </p>

        {errorMessage && (
          <p className="text-xs sm:text-sm text-destructive mb-4 bg-destructive/10 rounded-lg p-2">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-6">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {content.primaryAction}
            </Button>
          )}

          {errorType === 'payment_failed' && onContactSupport && (
            <Button
              variant="outline"
              onClick={onContactSupport}
              className="w-full bg-transparent"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          )}

          {onGoBack && (
            <Button
              variant="outline"
              onClick={onGoBack}
              className="w-full bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {errorType === 'payment_failed' ? 'Back to Preview' : content.secondaryAction}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
