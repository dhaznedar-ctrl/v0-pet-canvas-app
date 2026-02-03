'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, PawPrint, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/fable/top-bar'

const CREDIT_PACKS = [
  {
    id: 'digital',
    name: 'Digital Pack',
    price: 29,
    images: 5,
    badge: 'POPULAR',
    badgeColor: 'bg-primary text-primary-foreground',
    borderColor: 'border-primary',
    features: [
      '5 Masterpieces to perfect your masterpiece',
      'Download 2 High-Resolution Portraits',
      'Fable masterpiece style',
      'Retry Tools: Masculine, Feminine, Describe Edit (3 = 1 credit)',
      'Lifetime access to your project',
      'Commercial use rights',
      'Instant access',
    ],
    buttonText: 'Get Digital Pack',
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 49,
    images: 10,
    badge: null,
    badgeColor: '',
    borderColor: 'border-border',
    features: [
      '10 Masterpieces to explore styles',
      'Download 10 High-Resolution Portraits',
      '6 curated art styles',
      'Retry Tools: Masculine, Feminine, Describe Edit (3 = 1 credit)',
      'Precision Editor – Simple Mode (3 edits = 1 credit)',
      'Lifetime access',
      'Commercial use rights',
      'Instant download',
    ],
    buttonText: 'Get Starter Pack',
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    price: 199,
    images: 60,
    badge: 'BEST VALUE',
    badgeColor: 'bg-foreground text-background',
    borderColor: 'border-primary',
    features: [
      '60 Masterpieces for unlimited creativity',
      'Download All 60 High-Resolution Masterpieces',
      'All 19 art styles',
      'Unlimited Retries',
      'Advanced Precision Editor (unlimited)',
      'Best value at $3.32 per masterpiece',
      'Commercial use rights',
    ],
    buttonText: 'Get Studio Pack',
  },
]

const PRINT_SIZES = [
  { size: '8×10"', price: 89 },
  { size: '12×16"', price: 119 },
  { size: '18×24"', price: 199 },
  { size: '24×36"', price: 299 },
]

const COMPARE_FEATURES = [
  { name: 'Credits', digital: '5', starter: '10', studio: '60' },
  { name: 'Downloads', digital: '2', starter: '10', studio: 'Unlimited' },
  { name: 'Art Styles', digital: '1 style', starter: '6 styles', studio: 'All 19 styles' },
  { name: 'Watermark', digital: 'Yes', starter: 'No', studio: 'No', starterHighlight: true, studioHighlight: true },
  { name: 'Retry Tools', digital: true, starter: true, studio: true },
  { name: 'Precision Editor - Simple', digital: false, starter: true, studio: true },
  { name: 'Advanced Precision Editor', digital: false, starter: false, studio: true },
  { name: 'Price per credit', digital: '$5.80', starter: '$4.90', studio: '$3.32', studioHighlight: true },
  { name: 'Commercial use', digital: true, starter: true, studio: true },
]

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'pets' | 'family' | 'kids'>('pets')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance italic">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Unlock premium styles and create unlimited masterpieces
          </p>
        </div>

        {/* Pay-Per-Portrait Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Pay-Per-Portrait</h2>
          <p className="text-muted-foreground text-center mb-8">
            Don't need a pack? Purchase individual portraits at these prices.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Pet Portrait */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PawPrint className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Pet Portrait</span>
              </div>
              <p className="text-muted-foreground text-sm mb-3">Single image upload</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground line-through text-lg">$29</span>
                <span className="text-3xl font-bold text-primary">$19</span>
              </div>
            </div>

            {/* Family Portrait */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center relative">
              <div className="absolute -top-3 right-6">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  NEW
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Family Portrait</span>
              </div>
              <p className="text-muted-foreground text-sm mb-3">Humans & multi-image uploads</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground line-through text-lg">$39</span>
                <span className="text-3xl font-bold text-primary">$29</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm text-center mt-6">
            High-resolution download • No watermark • Commercial use rights
          </p>
        </section>

        {/* Art Print Pricing Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Art Print Pricing</h2>
          <p className="text-muted-foreground text-center mb-2 max-w-2xl mx-auto">
            Museum-quality archival prints on premium matte art paper using fade-resistant inks.
          </p>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Not photo prints — these are fine art reproductions built to last generations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {PRINT_SIZES.map((item) => (
              <div key={item.size} className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-foreground font-medium mb-2">{item.size}</p>
                <p className="text-2xl font-bold text-primary">${item.price}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm text-center mt-6">
            Free worldwide shipping • Printed in the EU
          </p>
        </section>

        {/* Credit Packs Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">Credit Packs</h2>
          <p className="text-muted-foreground text-center mb-10">
            Buy in bulk for the best value per portrait
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative rounded-2xl border-2 ${pack.borderColor} bg-card p-6 flex flex-col`}
              >
                {/* Badge */}
                {pack.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className={`${pack.badgeColor} text-xs font-semibold px-3 py-1 rounded-full`}>
                      {pack.badge}
                    </span>
                  </div>
                )}

                {/* Pack Name */}
                <h3 className="font-serif text-xl text-center text-foreground mb-2 mt-2">{pack.name}</h3>

                {/* Includes Downloads Badge */}
                <div className="flex justify-center mb-3">
                  <span className="bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    Includes Downloads
                  </span>
                </div>

                {/* Price */}
                <p className="text-5xl font-bold text-center text-foreground mb-1">${pack.price}</p>
                <p className="text-muted-foreground text-center text-sm mb-6">{pack.images} images</p>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-6">
                  {pack.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  variant="outline"
                  className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
                >
                  {pack.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Compare Plans Section */}
        <section className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-10">Compare Plans</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-muted-foreground font-normal">Features</th>
                  <th className="text-center py-4 px-4 text-foreground font-medium">Digital</th>
                  <th className="text-center py-4 px-4 text-foreground font-medium">Starter</th>
                  <th className="text-center py-4 px-4 text-foreground font-medium">Studio</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map((feature, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-4 px-4 text-foreground font-medium">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.digital === 'boolean' ? (
                        feature.digital ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-foreground">{feature.digital}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : feature.starterHighlight ? (
                        <span className="text-foreground font-medium">{feature.starter}</span>
                      ) : (
                        <span className="text-foreground">{feature.starter}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof feature.studio === 'boolean' ? (
                        feature.studio ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : feature.studioHighlight ? (
                        <span className="text-primary font-medium">{feature.studio}</span>
                      ) : (
                        <span className="text-foreground">{feature.studio}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Trust Badge */}
        <section className="text-center mb-12">
          <p className="text-muted-foreground">Trusted by 10,000+ Pet Owners</p>
        </section>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Create
          </Link>
        </div>
      </main>
    </div>
  )
}
