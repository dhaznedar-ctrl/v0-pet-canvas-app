'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Layers, Check, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmailCheckoutModal } from './email-checkout-modal'

interface PricingCardsProps {
  onDownload: () => void
  onOrderPrint: (size: string, type: 'small' | 'large') => void
}

const SMALL_SIZES = [
  { size: '8" x 10"', price: 89 },
  { size: '12" x 16"', price: 119 },
]
const LARGE_SIZES = [
  { size: '18" x 24"', price: 199 },
  { size: '24" x 36"', price: 250 },
]

export function PricingCards({ onDownload, onOrderPrint }: PricingCardsProps) {
  const [smallSize, setSmallSize] = useState(SMALL_SIZES[0].size)
  const [largeSize, setLargeSize] = useState(LARGE_SIZES[0].size)
  const [countdown, setCountdown] = useState('0:19:03')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<{
    name: string
    price: number
    size?: string
    type?: 'download' | 'small' | 'large'
  } | null>(null)

  const selectedSmall = SMALL_SIZES.find(s => s.size === smallSize) || SMALL_SIZES[0]
  const selectedLarge = LARGE_SIZES.find(s => s.size === largeSize) || LARGE_SIZES[0]

  const handleDownloadClick = () => {
    setCurrentProduct({ name: 'Instant Masterpiece', price: 19, type: 'download' })
    setEmailModalOpen(true)
  }

  const handleSmallPrintClick = () => {
    setCurrentProduct({ name: `Small Art Print (${smallSize})`, price: selectedSmall.price, size: smallSize, type: 'small' })
    setEmailModalOpen(true)
  }

  const handleLargePrintClick = () => {
    setCurrentProduct({ name: `Large Art Print (${largeSize})`, price: selectedLarge.price, size: largeSize, type: 'large' })
    setEmailModalOpen(true)
  }

  const handleEmailSubmit = (email: string) => {
    setEmailModalOpen(false)
    
    // TODO: Backend integration - pass email to checkout flow
    // 1. Create order in database with email
    // 2. Initialize payment provider checkout (Stripe/IyziCo/PayPal/PayTR)
    // 3. Redirect to secure checkout
    
    if (currentProduct?.type === 'download') {
      onDownload()
    } else if (currentProduct?.type === 'small' && currentProduct.size) {
      onOrderPrint(currentProduct.size, 'small')
    } else if (currentProduct?.type === 'large' && currentProduct.size) {
      onOrderPrint(currentProduct.size, 'large')
    }
  }

  return (
    <div className="py-12">
      <h2 className="font-serif text-2xl md:text-3xl italic text-center text-foreground mb-10">
        Choose Your Format
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Instant Masterpiece Card */}
        <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col">
          {/* Most Popular Badge */}
          <div className="absolute -top-3 left-6">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>

          <div className="flex justify-center mb-4 mt-2">
            <Download className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-serif text-xl text-center text-foreground mb-2">Instant Masterpiece</h3>
          
          <div className="flex justify-center mb-1">
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded">Pets</span>
          </div>

          <div className="text-center mb-1">
            <span className="text-muted-foreground line-through text-sm">$29</span>
            <span className="text-3xl font-bold text-foreground ml-2">$19</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-4">
            Expires in <span className="text-foreground font-medium">{countdown}</span>
          </p>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Instant high-resolution download — perfect for sharing or saving.
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">No Watermark</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Instant Download</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">High-Resolution Portrait</span>
            </div>
          </div>

          <Button onClick={handleDownloadClick} className="w-full bg-foreground text-background hover:bg-foreground/90">
            Download Now
          </Button>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-muted-foreground text-sm mb-1">Want more styles & masterpieces?</p>
            <Link href="/packs" className="text-foreground text-sm font-semibold hover:underline">
              View Packs & Pricing →
            </Link>
          </div>
        </div>

        {/* Small Art Print Card */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <div className="flex justify-center mb-4">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-serif text-xl text-center text-foreground mb-4">Small Art Print</h3>

          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-foreground">${selectedSmall.price}</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Printed on museum-quality archival paper with fade-resistant inks.
          </p>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Choose Size</p>
            <Select value={smallSize} onValueChange={setSmallSize}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SMALL_SIZES.map((size) => (
                  <SelectItem key={size.size} value={size.size}>{size.size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Museum-quality archival paper</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Fade-resistant inks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Made to last decades</span>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-foreground" />
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-foreground">Free Shipping</span>
                  <span className="text-muted-foreground"> ($20 value)</span>
                </p>
                <p className="text-xs text-muted-foreground">Delivery: 7-9 days</p>
              </div>
            </div>
          </div>

          <p className="text-primary text-sm mb-4">+ Includes digital download</p>

          <Button 
            variant="outline" 
            onClick={handleSmallPrintClick}
            className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Order Print
          </Button>
        </div>

        {/* Large Art Print Card */}
        <div className="relative rounded-2xl border-2 border-accent bg-card p-6 flex flex-col">
          {/* The Perfect Gift Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
              The Perfect Gift
            </span>
          </div>

          <div className="flex justify-center mb-4 mt-2">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-serif text-xl text-center text-foreground mb-4">Large Art Print</h3>

          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-accent">${selectedLarge.price}</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Printed on museum-quality archival paper with fade-resistant inks.
          </p>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Choose Size</p>
            <Select value={largeSize} onValueChange={setLargeSize}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LARGE_SIZES.map((size) => (
                  <SelectItem key={size.size} value={size.size}>{size.size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Museum-quality archival paper</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Fade-resistant inks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Made to last decades</span>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-foreground" />
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-foreground">Free Shipping</span>
                  <span className="text-muted-foreground"> ($20 value)</span>
                </p>
                <p className="text-xs text-muted-foreground">Delivery: 7-9 days</p>
              </div>
            </div>
          </div>

          <p className="text-primary text-sm mb-4">+ Includes digital download</p>

          <Button 
            variant="outline" 
            onClick={handleLargePrintClick}
            className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Order Print
          </Button>
        </div>
      </div>

      {/* Email Checkout Modal */}
      <EmailCheckoutModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        onContinue={handleEmailSubmit}
        productName={currentProduct?.name}
        price={currentProduct?.price}
      />
    </div>
  )
}
