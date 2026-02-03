'use client'

import { AlertCircle, RefreshCw, ArrowLeft, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Error types matching the app state machine
type ErrorType = 'upload_failed' | 'generate_failed' | 'payment_failed' | 'rate_limited'

interface ErrorStateProps {
  errorType: ErrorType
  errorMessage?: string
  onRetry?: () => void
  onGoBack?: () => void
  onContactSupport?: () => void
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
    description: 'Daily limit reached. Please try again tomorrow or continue by purchasing.',
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
}: ErrorStateProps) {
  const content = ERROR_CONTENT[errorType]
  const Icon = content.icon

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
          {errorType !== 'rate_limited' && onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {content.primaryAction}
            </Button>
          )}

          {errorType === 'rate_limited' && (
            <Button
              onClick={onRetry}
              className="w-full bg-primary hover:bg-primary/90"
            >
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

          {errorType !== 'payment_failed' && onGoBack && (
            <Button
              variant="outline"
              onClick={onGoBack}
              className="w-full bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {content.secondaryAction}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
