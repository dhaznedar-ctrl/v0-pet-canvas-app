import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PawPrint, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Pet Portraits - AI Royal Pet Art',
  description: 'Give your furry friend the royal treatment. Transform pet photos into museum-quality oil paintings with AI in under 2 minutes.',
  openGraph: {
    title: 'Pet Portraits | Pet Canvas',
    description: 'Give your furry friend the royal treatment with AI-powered pet portraits.',
    url: 'https://create.petcanvas.art/pets',
  },
}

const GALLERY_IMAGES = [
  { src: '/images/self-portrait/1748022730461.jpg', alt: 'Royal pet portrait example' },
  { src: '/images/self-portrait/1748022767556.jpg', alt: 'Regal pet portrait example' },
]

export default function PetsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20 dark:to-background py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Give Your Furry Friend the <span className="text-primary">Royal Treatment</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Transform your pet&apos;s photo into a stunning Old Master oil painting.
              Our AI preserves every whisker, every sparkle in their eyes — reimagined
              as a museum-worthy masterpiece.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=pets">
                Create Pet Portrait
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
                <p className="text-sm text-muted-foreground">Upload a photo and your portrait is generated in under 2 minutes.</p>
              </div>
              <div className="text-center p-6">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">5 Unique Styles</h3>
                <p className="text-sm text-muted-foreground">From Royal Velvet to Caravaggio Twilight — find the perfect look.</p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Satisfaction Guarantee</h3>
                <p className="text-sm text-muted-foreground">Not happy? We&apos;ll regenerate your portrait or refund you.</p>
              </div>
            </div>

            {/* Gallery */}
            {GALLERY_IMAGES.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {GALLERY_IMAGES.map((img, i) => (
                  <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border shadow-lg">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Your Pet Deserves a Portrait
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of pet parents who&apos;ve turned their favorite photos into timeless art.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=pets">
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
                  { '@type': 'ListItem', position: 2, name: 'Pet Portraits', item: 'https://create.petcanvas.art/pets' },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: 'AI Pet Portrait',
                description: 'Museum-quality AI-generated pet portrait in Old Master oil painting style.',
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
