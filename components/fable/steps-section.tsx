'use client'

import { Upload, Sparkles, Download } from 'lucide-react'

export function StepsSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      <p className="text-[10px] sm:text-xs text-primary font-semibold uppercase tracking-widest text-center mb-2">
        Simple Process
      </p>
      <h3 className="font-serif text-lg sm:text-2xl italic text-foreground text-center mb-1">
        Create Your Portrait in 3 Easy Steps
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mb-5 sm:mb-8 max-w-md mx-auto">
        No artistic skills required. Sit back and watch the magic happen.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h4 className="font-serif text-sm sm:text-base italic text-foreground mb-1.5">01 — Upload Your Photo</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            Choose a clear, well-lit photo. Works best with faces that are clearly visible.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </div>
          <h4 className="font-serif text-sm sm:text-base italic text-foreground mb-1.5">02 — The Magic Happens</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            Our special technology transforms your photo into a stunning renaissance masterpiece in just 2 minutes.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
          </div>
          <h4 className="font-serif text-sm sm:text-base italic text-foreground mb-1.5">03 — Download & Enjoy</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            Get instant access to your high-resolution portrait. Print it, share it, or frame it as a gift.
          </p>
        </div>
      </div>

      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 sm:mt-4">
        Average creation time: <span className="text-primary font-medium">2 minutes</span> · No account required
      </p>
    </section>
  )
}
