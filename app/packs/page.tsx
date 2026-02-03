'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/fable/top-bar'

const EXAMPLE_IMAGES = [
  '/images/1761061991787-fable-by-surrealium-example-1.jpg',
  '/images/1761061998281-fable-by-surrealium-example-2.jpg',
  '/images/1761061991787-fable-by-surrealium-example-1-20-281-29.jpg',
]

const PACKS = [
  {
    id: 'digital',
    name: 'Digital Pack',
    badge: 'POPULAR',
    badgeColor: 'bg-primary',
    price: 29,
    pricePerMasterpiece: '5.80',
    savings: null,
    features: [
      '5 masterpieces to perfect your art',
      '2 print-ready downloads',
      'Watermarked previews',
      'Retry tools included',
      '1 signature style (Fable)',
      'Commercial use rights',
    ],
    buttonText: 'Most Popular - $29',
    buttonVariant: 'primary' as const,
    borderColor: 'border-primary',
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    badge: null,
    badgeColor: '',
    price: 49,
    pricePerMasterpiece: '4.90',
    savings: 'Save 16%',
    features: [
      '10 masterpieces to explore',
      'All 10 downloads included',
      'No watermarks ever',
      '6 curated art styles',
      'Precision Editor access',
      'Commercial use rights',
    ],
    buttonText: 'Get Started - $49',
    buttonVariant: 'outline' as const,
    borderColor: 'border-border',
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    badge: 'BEST VALUE',
    badgeColor: 'bg-primary',
    price: 199,
    pricePerMasterpiece: '3.32',
    savings: 'Save 43%',
    features: [
      '60 masterpieces for total freedom',
      'Unlimited downloads',
      'No watermarks ever',
      'All 19 art styles unlocked',
      'Advanced Precision Editor',
      'Priority support',
    ],
    buttonText: 'Go Pro - $199',
    buttonVariant: 'primary' as const,
    borderColor: 'border-primary',
  },
]

export default function PacksPage() {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />

      <main className="pt-8 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to create</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              {"You're out of free credits!"}
            </h1>
            <p className="text-muted-foreground">
              Purchase your masterpiece or a pack to continue.
            </p>
          </div>

          {/* Purchase Masterpiece Section */}
          <div className="text-center mb-10">
            <h2 className="text-lg text-muted-foreground mb-2">Purchase your masterpiece</h2>
            <p className="text-4xl font-bold mb-2">
              From <span className="text-primary">$19</span>
            </p>
            <p className="text-muted-foreground text-sm mb-6">Select and continue on next page</p>

            {/* Example Images */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {EXAMPLE_IMAGES.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index ? 'ring-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img || "/placeholder.svg"} alt={`Example ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <Link href="/create" className="text-muted-foreground text-sm hover:text-foreground">
              or continue creating
            </Link>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative rounded-2xl border ${pack.borderColor} bg-card p-6 flex flex-col`}
              >
                {/* Badge */}
                {pack.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className={`${pack.badgeColor} text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full`}>
                      {pack.badge}
                    </span>
                  </div>
                )}

                <h3 className="font-serif text-xl text-center text-foreground mb-2 mt-2">{pack.name}</h3>

                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-primary">${pack.price}</span>
                </div>

                <div className="text-center mb-4">
                  <span className="text-muted-foreground text-sm">${pack.pricePerMasterpiece}/masterpiece</span>
                  {pack.savings && (
                    <span className="text-primary text-sm ml-2">{pack.savings}</span>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 flex-grow">
                  {pack.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={pack.buttonVariant === 'primary' ? 'default' : 'outline'}
                  className={
                    pack.buttonVariant === 'primary'
                      ? 'w-full bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent'
                  }
                >
                  {pack.buttonText}
                </Button>
              </div>
            ))}
          </div>

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
