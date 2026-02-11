'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Download, Home, Sparkles, Mail, ClipboardList } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const credits = searchParams.get('credits')

  // Clear saved state on mount
  useEffect(() => {
    try {
      localStorage.removeItem('petcanvas_saved_state')
      sessionStorage.clear()
    } catch {}
  }, [])

  // Credits purchase success
  if (credits) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Credits Added!
          </h1>

          <p className="text-muted-foreground mb-8">
            {credits} credits have been added to your account. You can now generate more portraits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/create">Start Creating</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Digital download success
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>

        {orderId && (
          <p className="text-lg font-semibold text-primary mb-4">
            Order #{orderId}
          </p>
        )}

        <p className="text-muted-foreground mb-6">
          Your high-resolution, watermark-free portrait is ready.
        </p>

        {orderId && (
          <Button asChild size="lg" className="mb-4 w-full sm:w-auto">
            <a href={`/api/download/${orderId}`}>
              <Download className="mr-2 h-5 w-5" />
              Download HD Portrait
            </a>
          </Button>
        )}

        <div className="bg-secondary rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <span className="font-medium">Download link sent to your email</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            You can also download from your email anytime within 7 days.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" variant="outline" className="bg-transparent">
            <Link href="/orders">
              <ClipboardList className="mr-2 h-4 w-4" />
              My Orders
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent">
            <Link href="/create">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Another
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-32 pb-20 px-4 flex items-center">
        <div className="container mx-auto max-w-xl">
          <Suspense fallback={null}>
            <SuccessContent />
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Timeless Masterpiece. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
