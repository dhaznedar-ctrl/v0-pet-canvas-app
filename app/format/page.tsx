'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Package, Check, Gift, Clock, Truck, PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

const SMALL_SIZES = [
  { value: '8x10', label: '8" x 10"' },
  { value: '11x14', label: '11" x 14"' },
  { value: '12x16', label: '12" x 16"' },
]

const LARGE_SIZES = [
  { value: '18x24', label: '18" x 24"' },
  { value: '24x30', label: '24" x 30"' },
  { value: '24x36', label: '24" x 36"' },
]

export default function FormatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [countdown, setCountdown] = useState(19 * 60 + 46) // 19:46
  const [smallSize, setSmallSize] = useState('8x10')
  const [largeSize, setLargeSize] = useState('18x24')
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    // Get preview image from session or result
    const stored = sessionStorage.getItem('fable_result')
    if (stored) {
      setPreviewImage(stored)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCheckout = async (productType: 'instant' | 'small-print' | 'large-print') => {
    const sizeOption = productType === 'small-print' ? smallSize : productType === 'large-print' ? largeSize : undefined
    
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productType === 'instant' ? 'instant-masterpiece' : productType === 'small-print' ? 'small-art-print' : 'large-art-print',
          jobId,
          sizeOption,
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-2">
              Choose Your Format
            </h1>
            <p className="text-muted-foreground">Select how you want to receive your masterpiece</p>
          </div>

          {/* Preview Image (if available) */}
          {previewImage && (
            <div className="flex justify-center mb-10">
              <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-xl shadow-black/30 ring-2 ring-border">
                <Image src={previewImage || "/placeholder.svg"} alt="Your portrait preview" fill className="object-cover" />
              </div>
            </div>
          )}

          {/* Format Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Instant Masterpiece */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'instant' ? 'border-primary bg-card/80' : 'border-border bg-card/50 hover:border-primary/50'
              )}
              onClick={() => setSelectedFormat('instant')}
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>

              <div className="flex justify-center mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Download className="h-5 w-5 text-foreground" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Instant Masterpiece</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-2">$19</p>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-accent mb-4">
                <Clock className="h-3.5 w-3.5" />
                <span>Expires in {formatTime(countdown)}</span>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  No Watermark
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Instant Download
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  High-Resolution Portrait
                </li>
              </ul>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCheckout('instant')
                }}
              >
                Download Now
              </Button>
            </div>

            {/* Small Art Print */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'small' ? 'border-primary bg-card/80' : 'border-border bg-card/50 hover:border-primary/50'
              )}
              onClick={() => setSelectedFormat('small')}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Package className="h-5 w-5 text-foreground" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Small Art Print</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-4">$89</p>

              <Select value={smallSize} onValueChange={setSmallSize}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SMALL_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Museum-Quality Print
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Ready to Frame
                </li>
              </ul>

              <div className="flex items-center gap-2 text-sm text-primary mb-4">
                <Truck className="h-4 w-4" />
                <span>Free Shipping ($20 value) • 7-9 days</span>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCheckout('small-print')
                }}
              >
                Order Print
              </Button>
            </div>

            {/* Large Art Print */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'large' ? 'border-accent bg-card/80' : 'border-accent/50 bg-card/50 hover:border-accent'
              )}
              onClick={() => setSelectedFormat('large')}
            >
              {/* Perfect Gift Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                <Gift className="h-3 w-3" />
                The Perfect Gift
              </div>

              <div className="flex justify-center mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Large Art Print</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-4">$199</p>

              <Select value={largeSize} onValueChange={setLargeSize}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {LARGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  Statement Piece
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  Premium Canvas
                </li>
              </ul>

              <div className="flex items-center gap-2 text-sm text-accent mb-4">
                <Truck className="h-4 w-4" />
                <span>Free Shipping ($40 value) • 7-9 days</span>
              </div>

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCheckout('large-print')
                }}
              >
                Order Print
              </Button>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Or go back and try a different style
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
