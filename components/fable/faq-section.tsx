'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    question: 'How long does it take to generate a portrait?',
    answer:
      'Our AI crafts your portrait in roughly 2 minutes. You\'ll see a free preview first — if you love the result, you can purchase and instantly download the high-resolution version.',
  },
  {
    question: 'What kind of photos work best?',
    answer:
      'Clear, well-lit photos where the subject\'s face is easy to see produce the best results. Avoid blurry shots, heavy filters, or images where the face is partially hidden. The sharper the original, the more stunning the final portrait.',
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer:
      'Because every portrait is uniquely generated for you — and physical prints are produced as one-of-a-kind items — we don\'t offer refunds after purchase. However, you can preview the result for free before buying. If you\'re not happy at the preview stage, you\'re never obligated to pay. You can also use the edit option to fine-tune details until it\'s exactly what you want.',
  },
  {
    question: 'What resolution is the final portrait?',
    answer:
      'Your digital download is delivered in high resolution (up to 4K) as a watermark-free PNG — perfect for printing at any size, from a desk frame to a large wall canvas.',
  },
  {
    question: 'Can I print the portrait myself?',
    answer:
      'Absolutely. The digital file is print-ready, so you can print it at home or at any local print shop. We also offer museum-quality prints on archival paper and stretched canvas if you\'d prefer a professionally finished piece.',
  },
  {
    question: 'Is my photo safe and private?',
    answer:
      'Your privacy matters to us. All uploads are encrypted in transit, we never share your images with third parties, and every photo is automatically deleted from our servers within 48 hours.',
  },
  {
    question: 'Do you offer physical prints?',
    answer:
      'Yes! We offer museum-quality prints on archival paper with fade-resistant inks, as well as stretched canvas with a variety of frame options — all ready to hang.',
  },
  {
    question: 'Can I generate multiple portraits from the same photo?',
    answer:
      'Each upload produces one unique portrait. Want a different style or variation? Simply upload the same photo again — every generation creates a distinctly crafted masterpiece.',
  },
  {
    question: 'Can I upload multiple photos for a group composition?',
    answer:
      'Of course! Whether it\'s Pets, Family, Kids, Couples, or Self — you can upload up to 5 photos at once. Our Pet Canvas automatically blends them into a single, beautifully composed portrait in the style you choose.',
  },
]

export function FaqSection() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl italic text-foreground mb-2">
          Got Questions?
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Everything you need to know about Pet Canvas
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border-border/60">
            <AccordionTrigger className="text-sm sm:text-base text-foreground hover:no-underline hover:text-foreground/80 py-4 sm:py-5">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
