'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Home, Palette, DollarSign, HelpCircle, FileText, ChevronRight } from 'lucide-react'

interface NavigationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NavigationDrawer({ open, onOpenChange }: NavigationDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 bg-card border-border p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-left text-foreground">Navigation</SheetTitle>
        </SheetHeader>

        <div className="py-4">
          {/* Main Navigation */}
          <nav className="space-y-1 px-3">
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="create" className="border-none">
                <AccordionTrigger className="px-3 py-2 hover:bg-secondary rounded-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4" />
                    <span>Create</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-10 space-y-1">
                  <Link
                    href="/?tab=pets"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Pet Portraits
                  </Link>
                  <Link
                    href="/?tab=family"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Family Portraits
                  </Link>
                  <Link
                    href="/?tab=kids"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {"Children's Portraits"}
                  </Link>
                  <Link
                    href="/?tab=couples"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Couple Portraits
                  </Link>
                  <Link
                    href="/?tab=self"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Self-Portraits
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Link
              href="/pricing"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              <span>Pricing</span>
            </Link>
          </nav>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Legal & Support */}
          <div className="px-6 mb-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Legal & Support
            </span>
          </div>

          <nav className="space-y-1 px-3">
            <Link
              href="/about"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>About Pet Canvas</span>
            </Link>

            <Link
              href="/support"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Get Support</span>
            </Link>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="policies" className="border-none">
                <AccordionTrigger className="px-3 py-2 hover:bg-secondary rounded-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span>Policies</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-10 space-y-1">
                  <Link
                    href="/policies/terms"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Terms of Service
                  </Link>
                  <Link
                    href="/policies/privacy"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/policies/refund"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Refund Policy
                  </Link>
                  <Link
                    href="/policies/license"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    Commercial License
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
