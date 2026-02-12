import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Users, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Family Portraits - AI Renaissance Art',
  description: 'Celebrate your family bond with a Renaissance-style portrait. Transform family photos into museum-quality oil paintings with AI.',
  openGraph: {
    title: 'Family Portraits | Pet Canvas',
    description: 'Celebrate your family bond with AI-powered Renaissance portraits.',
    url: 'https://create.petcanvas.art/family',
  },
}

const GALLERY_IMAGES = [
  { src: '/images/family/1748022841610.jpg', alt: 'Family portrait in Renaissance style' },
  { src: '/images/family/1748022856547.jpg', alt: 'Family portrait in oil painting style' },
  { src: '/images/family/1748022869605.jpg', alt: 'Family portrait in classical style' },
]

export default function FamilyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 to-background dark:from-rose-950/20 dark:to-background py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Celebrate Your Family Bond with a <span className="text-primary">Portrait</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Transform your family photo into a breathtaking Renaissance-style oil painting.
              Every face, every smile, every detail — preserved and elevated into timeless art.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=family">
                Create Family Portrait
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Ready in 2 Minutes</h3>
                <p className="text-sm text-muted-foreground">Upload your family photo and watch it transform before your eyes.</p>
              </div>
              <div className="text-center p-6">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Multiple Styles</h3>
                <p className="text-sm text-muted-foreground">From Grand Baroque to Golden Age — choose your family&apos;s era.</p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Recognizable Faces</h3>
                <p className="text-sm text-muted-foreground">Our AI preserves every family member&apos;s likeness with precision.</p>
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {GALLERY_IMAGES.map((img, i) => (
                <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border shadow-lg">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Make Your Family Timeless
            </h2>
            <p className="text-muted-foreground mb-8">
              The perfect gift for anniversaries, holidays, or just because — your family
              deserves museum walls.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=family">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://create.petcanvas.art' },
                  { '@type': 'ListItem', position: 2, name: 'Family Portraits', item: 'https://create.petcanvas.art/family' },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: 'AI Family Portrait',
                description: 'Museum-quality AI-generated family portrait in Renaissance oil painting style.',
                brand: { '@type': 'Brand', name: 'Pet Canvas' },
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'USD',
                  price: '9.99',
                  availability: 'https://schema.org/InStock',
                },
              },
            ]),
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
