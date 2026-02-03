'use client'

import { useState } from 'react'
import { TopBar, type TabType } from '@/components/fable/top-bar'

export default function RefundPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-8 text-center">Refund Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Digital Downloads</h2>
              <p>Due to the digital nature of our product, we generally do not offer refunds for instant digital downloads once the portrait has been generated and delivered.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Print Orders</h2>
              <p>For physical print orders, we offer a full refund if you contact us within 14 days of delivery and the product arrived damaged or significantly different from what was shown.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Regeneration Policy</h2>
              <p>If you are not satisfied with your generated portrait, we offer one free regeneration with the same or different style settings. Contact support to request a regeneration.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How to Request a Refund</h2>
              <p>To request a refund, please contact our support team at support@petcanvas.art with your order number and reason for the refund request.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
