'use client'

import { useState } from 'react'
import { TopBar, type TabType } from '@/components/fable/top-bar'

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-8 text-center">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Pet Canvas, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
              <p>Pet Canvas provides AI-powered portrait generation services. We transform uploaded photos into artistic portraits using artificial intelligence technology.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
              <p>You are responsible for ensuring that you have the right to upload and use any photos submitted to our service. You must not upload content that infringes on third-party rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
              <p>Pet Canvas retains the right to use generated artworks for promotional purposes. You retain the right to use your generated portraits for personal purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
              <p>Pet Canvas is provided as is without any warranties. We are not liable for any damages arising from the use of our service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact</h2>
              <p>For any questions regarding these terms, please contact us at info@petcanvas.art</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
