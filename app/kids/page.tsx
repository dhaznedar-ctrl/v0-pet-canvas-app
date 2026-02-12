import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Baby, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Kids Portraits - AI Storybook Art',
  description: 'Transform moments into storybook portraits. Turn your children\'s photos into magical Old Master oil paintings with AI.',
  openGraph: {
    title: 'Kids Portraits | Pet Canvas',
    description: 'Transform your children\'s moments into magical storybook portraits.',
    url: 'https://create.petcanvas.art/kids',
  },
}

const GALLERY_IMAGES = [
  { src: '/images/kids/1748022925449.jpg', alt: 'Kids portrait in storybook style' },
  { src: '/images/kids/1748022940866.jpg', alt: 'Kids portrait in classical style' },
  { src: '/images/kids/1748022954977.jpg', alt: 'Kids portrait in fairytale style' },
]

export default function KidsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Baby className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transform Moments into <span className="text-primary">Storybook Portraits</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Capture the magic of childhood in timeless art. Our AI transforms your children&apos;s
              photos into enchanting portraits that look straight out of an Old Master gallery.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=kids">
                Create Kids Portrait
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
                <p className="text-sm text-muted-foreground">Upload a photo and your child&apos;s portrait is ready almost instantly.</p>
              </div>
              <div className="text-center p-6">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Magical Styles</h3>
                <p className="text-sm text-muted-foreground">Every child becomes a little prince or princess in Renaissance art.</p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Safe & Private</h3>
                <p className="text-sm text-muted-foreground">Photos are encrypted and auto-deleted. Your family&apos;s privacy is our priority.</p>
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
              Every Child is a Work of Art
            </h2>
            <p className="text-muted-foreground mb-8">
              The perfect gift for grandparents, birthdays, or nursery walls — capture their
              precious moments in a masterpiece.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link href="/?tab=kids">
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
                  { '@type': 'ListItem', position: 2, name: 'Kids Portraits', item: 'https://create.petcanvas.art/kids' },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: 'AI Kids Portrait',
                description: 'Magical AI-generated kids portrait in storybook oil painting style.',
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
