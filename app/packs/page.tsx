'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/components/fable/currency-provider'
import { TopBar } from '@/components/fable/top-bar'
import { FaqSection } from '@/components/fable/faq-section'

export default function PacksPage() {
  const { formatDollars } = useCurrency()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar activeTab="pets" onTabChange={() => {}} />

      <main className="pt-8 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to create</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Need More Creations?
            </h1>
            <p className="text-muted-foreground">
              Get 10 generation credits and keep creating without daily limits.
            </p>
          </div>

          {/* Credit Pack Card */}
          <div className="rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 relative mb-6">
            <div className="absolute -top-3 left-6">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6 mt-2">
              <h2 className="font-serif text-2xl text-foreground mb-1">10 Credits Pack</h2>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-primary">{formatDollars(39)}</span>
                <span className="text-muted-foreground text-sm">{formatDollars(3.9)}/generation</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                '10 AI portrait generations',
                'No daily limit — use anytime',
                'Credits never expire',
                'All art styles included',
                'Retry & Describe Edit tools',
                'Watermarked previews included',
                `Purchase portraits individually (${formatDollars(29)} each)`,
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
              <Sparkles className="h-5 w-5 mr-2" />
              Buy 10 Credits — {formatDollars(39)}
            </Button>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <h3 className="font-semibold text-foreground text-center mb-4">How Credits Work</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <p className="text-sm text-muted-foreground">Each credit = 1 AI portrait generation (any style, any subject)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <p className="text-sm text-muted-foreground">Preview results with a watermark. Love it? Purchase the HD version for {formatDollars(29)}.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <p className="text-sm text-muted-foreground">Credits never expire and work across all portrait types.</p>
              </div>
            </div>
          </div>

          {/* Free tier info */}
          <p className="text-center text-xs text-muted-foreground">
            Everyone gets 5 free generations per day.{' '}
            <Link href="/" className="text-primary hover:underline">
              Start creating for free
            </Link>
          </p>

          {/* FAQ Section */}
          <FaqSection />

          {/* Close Button */}
          <div className="fixed top-24 right-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
