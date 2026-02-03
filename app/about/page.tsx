'use client'

import { useState } from 'react'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { PawPrint, Sparkles, Heart, Shield } from 'lucide-react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PawPrint className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-4">About Pet Canvas</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transforming your beloved pets into timeless works of art using the power of artificial intelligence.
            </p>
          </div>

          <div className="space-y-12">
            {/* Mission */}
            <section className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8">
              <h2 className="font-serif text-2xl italic text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Pet Canvas, we believe every pet deserves to be immortalized in art. Our AI-powered platform
                combines cutting-edge technology with classic artistic styles to create stunning portraits that
                capture the unique personality and spirit of your furry family members.
              </p>
            </section>

            {/* Values */}
            <section>
              <h2 className="font-serif text-2xl italic text-foreground mb-6 text-center">What We Stand For</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Every portrait is crafted with care using advanced AI models trained on masterpiece artworks.
                  </p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Love</h3>
                  <p className="text-sm text-muted-foreground">
                    We are pet lovers ourselves and understand the special bond between you and your companions.
                  </p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    Your photos are handled securely and deleted within 24 hours of processing.
                  </p>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8">
              <h2 className="font-serif text-2xl italic text-foreground mb-4">Our Technology</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pet Canvas uses state-of-the-art generative AI models to transform your photos into artistic
                masterpieces. Our system has been trained on thousands of classical paintings to understand and
                replicate various artistic styles including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Baroque - Rich, dramatic lighting with deep colors</li>
                <li>Florentine Renaissance - Warm golden tones inspired by Italian masters</li>
                <li>Renaissance Sky - Ethereal blues with celestial atmosphere</li>
                <li>Rococo - Soft pastels with ornate elegance</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="text-center">
              <h2 className="font-serif text-2xl italic text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-4">
                Have questions or feedback? We would love to hear from you.
              </p>
              <a href="mailto:hello@petcanvas.art" className="text-primary hover:underline font-medium">
                hello@petcanvas.art
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
