'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PawPrint, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" 
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold">Pet Canvas</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#styles" className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
            Styles
          </Link>
          <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
            Pricing
          </Link>
          <Link href="/support" className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
            Support
          </Link>
          <Link href="/our-story" className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium">
            Our Story
          </Link>
          <Button asChild className="rounded-full px-6">
            <Link href="/create">Create Portrait</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/#styles"
              className="text-foreground/80 hover:text-foreground transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Styles
            </Link>
            <Link
              href="/pricing"
              className="text-foreground/80 hover:text-foreground transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/support"
              className="text-foreground/80 hover:text-foreground transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <Link
              href="/our-story"
              className="text-foreground/80 hover:text-foreground transition-colors py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Story
            </Link>
            <Button asChild className="w-full rounded-full">
              <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                Create Portrait
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
