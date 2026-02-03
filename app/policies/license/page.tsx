'use client'

import { useState } from 'react'
import { TopBar, type TabType } from '@/components/fable/top-bar'

export default function LicensePage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-8 text-center">Commercial License</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Personal Use</h2>
              <p>All generated portraits may be used for personal, non-commercial purposes including printing, framing, and sharing on personal social media accounts.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Commercial Use</h2>
              <p>For commercial use of generated portraits (including merchandise, advertising, or resale), please contact us for a commercial license at business@petcanvas.art</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Pet Canvas Rights</h2>
              <p>Pet Canvas retains the right to use generated portraits for promotional and marketing purposes, including but not limited to website galleries, social media, and advertising materials.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Attribution</h2>
              <p>While not required, we appreciate attribution when sharing portraits publicly. A simple mention or link to Pet Canvas helps support our service.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
