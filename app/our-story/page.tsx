import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PawPrint, Heart, Sparkles, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Learn about Pet Canvas — how a love for pets and art inspired us to create AI-powered portrait experiences for families worldwide.',
  openGraph: {
    title: 'Our Story | Pet Canvas',
    description: 'How a love for pets and art inspired Pet Canvas.',
    url: 'https://create.petcanvas.art/our-story',
  },
}

export default function OurStoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Story
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every great portrait begins with a story. Ours started with a simple belief:
              that the bond between people and their pets deserves to be celebrated as art.
            </p>
          </div>
        </section>

        {/* Story Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl space-y-12">

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <PawPrint className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Where It All Began</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Pet Canvas was born from a personal experience. When our founder tried to commission
                a hand-painted portrait of their beloved golden retriever, the process took weeks,
                cost hundreds of dollars, and the result — while beautiful — didn&apos;t quite capture
                that spark in their dog&apos;s eyes. We thought: what if AI could bridge the gap between
                accessibility and artistry?
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="font-serif text-2xl font-bold text-foreground">The Art of AI</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We spent months training and fine-tuning our AI models on thousands of museum-quality
                Old Master paintings — Rembrandt, Vermeer, Caravaggio, Velázquez. The result is a system
                that doesn&apos;t just apply a filter; it reimagines your photos as genuine oil paintings
                with authentic brushwork, period-accurate compositions, and that unmistakable warmth
                of a canvas masterpiece.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="font-serif text-2xl font-bold text-foreground">More Than Pets</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                While we started with pets, we quickly realized that families wanted the same
                magic for their own portraits. Parents transforming their children into storybook
                characters. Couples celebrating their bond with a Renaissance-style masterpiece.
                Families preserving their togetherness in timeless art. Today, Pet Canvas serves
                pet lovers, families, and anyone who believes their favorite moments deserve
                to be immortalized.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary flex-shrink-0" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Our Promise</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Every portrait we create is a labor of love — powered by AI, guided by artistry.
                We promise museum-quality results in minutes, not weeks. Affordable prices that
                don&apos;t compromise on quality. And a satisfaction guarantee, because your memories
                are too precious for anything less than perfect.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Ready to Create Your Masterpiece?
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload a photo and watch the magic happen — your portrait will be ready in under 2 minutes.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/create">Start Creating</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
