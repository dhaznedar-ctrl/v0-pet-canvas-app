'use client'

import { useState } from 'react'
import { Mail, Share2, ChevronDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ResultSectionProps {
  generatedImage: string
  onRetry: () => void
}

export function ResultSection({ generatedImage, onRetry }: ResultSectionProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const faqs = [
    {
      id: 'customers',
      title: 'What Customers Say',
      subtitle: 'Rated Excellent on Trustpilot',
      content: 'Our customers love their pet portraits! With over 10,000 happy pet owners, we pride ourselves on creating stunning, personalized artwork that captures the unique personality of every pet.',
    },
    {
      id: 'support',
      title: 'Need Support?',
      subtitle: "We're happy to help!",
      content: 'Our support team is available 24/7 to assist you with any questions about your order, delivery, or the creation process. Contact us at support@petcanvas.com',
    },
    {
      id: 'artists',
      title: 'Supporting Real Artists',
      subtitle: 'Pet Canvas, created by the Surrealium atelier.',
      content: 'Every portrait is crafted using our proprietary AI trained on classical art techniques. We collaborate with real artists to ensure the highest quality and most authentic artistic styles.',
    },
  ]

  return (
    <div className="py-4 sm:py-8">
      {/* Chosen by 10,000+ Pet Owners */}
      <div className="text-center py-4 sm:py-8">
        <h3 className="font-serif text-lg sm:text-2xl italic text-foreground mb-2 sm:mb-4">
          Chosen by 10,000+ Pet Owners
        </h3>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-base text-foreground font-semibold underline">Excellent</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 sm:w-6 sm:h-6 bg-[#00b67a] flex items-center justify-center">
                <Star className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-white fill-white" />
              </div>
            ))}
          </div>
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#00b67a] fill-[#00b67a]" />
          <span className="text-xs sm:text-base text-muted-foreground">Trustpilot</span>
        </div>
      </div>

      {/* Send to Friends & Family */}
      <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-0">
        <h3 className="font-serif text-lg sm:text-2xl italic text-center text-foreground mb-3 sm:mb-6">
          Send to Friends & Family
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Button variant="outline" className="py-3 sm:py-6 text-xs sm:text-base border-border hover:bg-secondary bg-transparent">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            Save for Later
          </Button>
          <Button className="py-3 sm:py-6 text-xs sm:text-base bg-primary hover:bg-primary/90">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* FAQ Accordions */}
      <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-2 sm:space-y-4 px-2 sm:px-0">
        {faqs.map((faq) => (
          <Collapsible key={faq.id} open={openFaq === faq.id} onOpenChange={(open) => setOpenFaq(open ? faq.id : null)}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 sm:p-4 border-t border-border hover:bg-secondary/50 transition-colors">
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-semibold text-foreground">{faq.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {faq.id === 'customers' ? (
                    <>
                      Rated <span className="italic text-primary">Excellent</span> on{' '}
                      <span className="font-semibold">Trustpilot</span>{' '}
                      <span className="text-[#00b67a]">★★★★★</span>
                    </>
                  ) : (
                    faq.subtitle
                  )}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform flex-shrink-0 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 sm:px-4 pb-2 sm:pb-4 text-xs sm:text-base text-muted-foreground">
              {faq.content}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
