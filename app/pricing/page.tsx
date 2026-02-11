'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PawPrint, Users, Baby, Heart, User } from 'lucide-react'
import { useCurrency } from '@/components/fable/currency-provider'
import { Button } from '@/components/ui/button'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { FaqSection } from '@/components/fable/faq-section'

const PRINT_SIZES = [
  { size: '8×10"', price: 89 },
  { size: '12×16"', price: 119 },
  { size: '18×24"', price: 199 },
  { size: '24×36"', price: 299 },
]

const CANVAS_SIZES = [
  { size: '12×16"', price: 149 },
  { size: '18×24"', price: 249 },
  { size: '24×36"', price: 349 },
  { size: '30×40"', price: 449 },
]

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const { formatDollars } = useCurrency()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance italic">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg">
            Free preview. Only pay when you love the result.
          </p>
        </div>

        {/* Digital Portraits */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Digital Portraits</h2>
          <p className="text-muted-foreground text-center mb-8">
            Upload your photo, preview for free, purchase to download.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {/* Pet Portrait */}
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <PawPrint className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Pet Portrait</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">Single or multiple pets (all kinds)</p>
              <p className="text-3xl font-bold text-primary mb-3">{formatDollars(29)}</p>
              <Link href="/?tab=pets">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                  Create Now
                </Button>
              </Link>
            </div>

            {/* Family Portrait */}
            <div className="rounded-2xl border-2 border-primary bg-card p-5 text-center relative">
              <div className="absolute -top-2.5 right-4">
                <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Family</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">Multiple people & pets</p>
              <p className="text-3xl font-bold text-primary mb-3">{formatDollars(29)}</p>
              <Link href="/?tab=family">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                  Create Now
                </Button>
              </Link>
            </div>

            {/* Kids Portrait */}
            <div className="rounded-2xl border border-border bg-card p-5 text-center relative">
              <div className="absolute -top-2.5 right-4">
                <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  NEW
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Baby className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Kids</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">Children & siblings</p>
              <p className="text-3xl font-bold text-primary mb-3">{formatDollars(29)}</p>
              <Link href="/?tab=kids">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                  Create Now
                </Button>
              </Link>
            </div>

            {/* Couple Portrait */}
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Couples</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">Romantic portraits</p>
              <p className="text-3xl font-bold text-primary mb-3">{formatDollars(29)}</p>
              <Link href="/?tab=couples">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                  Create Now
                </Button>
              </Link>
            </div>

            {/* Self Portrait */}
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Self-Portrait</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">Your own masterpiece</p>
              <p className="text-3xl font-bold text-primary mb-3">{formatDollars(29)}</p>
              <Link href="/?tab=self">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                  Create Now
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-muted-foreground text-sm">
              High-resolution download · No watermark · Commercial use rights
            </p>
            <p className="text-muted-foreground text-sm">
              Free preview with every upload · 5 free generations per day
            </p>
          </div>
        </section>

        {/* Art Print Pricing Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Art Prints</h2>
          <p className="text-muted-foreground text-center mb-2 max-w-2xl mx-auto">
            Museum-quality archival prints on premium matte art paper using fade-resistant inks.
          </p>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto text-sm">
            Not photo prints — these are fine art reproductions built to last generations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {PRINT_SIZES.map((item) => (
              <div key={item.size} className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-foreground font-medium mb-2">{item.size}</p>
                <p className="text-2xl font-bold text-primary">{formatDollars(item.price)}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm text-center mt-6">
            Includes digital download · Premium archival paper
          </p>
        </section>

        {/* Canvas Print Pricing Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Canvas Prints</h2>
          <p className="text-muted-foreground text-center mb-2 max-w-2xl mx-auto">
            Gallery-wrapped canvas prints stretched over solid wood frames.
          </p>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto text-sm">
            Ready to hang — no framing needed. Premium archival canvas with vibrant, long-lasting colors.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {CANVAS_SIZES.map((item) => (
              <div key={item.size} className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-foreground font-medium mb-2">{item.size}</p>
                <p className="text-2xl font-bold text-primary">{formatDollars(item.price)}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm text-center mt-6">
            Gallery-wrapped · Ready to hang · Premium archival canvas
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Upload</h3>
              <p className="text-sm text-muted-foreground">Upload a clear photo of your pet, family, or yourself</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Preview</h3>
              <p className="text-sm text-muted-foreground">See a free watermarked preview. Retry up to 3 times</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Purchase</h3>
              <p className="text-sm text-muted-foreground">Love it? Buy the full-resolution version or order a print</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FaqSection />

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Start Creating
          </Link>
        </div>
      </main>
    </div>
  )
}
