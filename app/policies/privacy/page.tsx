'use client'

import { useState } from 'react'
import { TopBar, type TabType } from '@/components/fable/top-bar'

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>We collect email addresses for order fulfillment and communication. We also collect uploaded images temporarily for portrait generation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>Your email is used to deliver your portrait and send order updates. Uploaded images are processed by our AI system and deleted after 24 hours.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Retention</h2>
              <p>Uploaded photos are automatically deleted within 24 hours. Generated portraits are retained for download purposes and may be used for promotional materials as per our terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data. All data transfers are encrypted using SSL/TLS protocols.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
              <p>We use Stripe for payment processing and cloud storage providers for file management. These services have their own privacy policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact</h2>
              <p>For privacy concerns, contact us at privacy@petcanvas.art</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
