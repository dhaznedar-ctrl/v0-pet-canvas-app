'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Layers, Frame, Check, Gift, Clock, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FaqSection } from '@/components/fable/faq-section'
import { useCurrency } from '@/components/fable/currency-provider'

const POSTER_SIZES = [
  { value: '8x10', label: '8" x 10"', price: 29 },
  { value: '10x12', label: '10" x 12"', price: 35 },
  { value: '12x18', label: '12" x 18"', price: 45 },
  { value: '18x24', label: '18" x 24"', price: 95 },
  { value: '24x36', label: '24" x 36"', price: 145 },
]

const POSTER_FRAMES = [
  { id: 'none', label: 'No Frame' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'walnut', label: 'Walnut' },
]

const CANVAS_SIZES = [
  { value: '10x12', label: '10" x 12"', price: 78 },
  { value: '12x18', label: '12" x 18"', price: 102 },
  { value: '18x24', label: '18" x 24"', price: 162 },
  { value: '24x36', label: '24" x 36"', price: 222 },
]

const CANVAS_FRAMES = [
  { id: 'stretched', label: 'Stretched (No Frame)' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'walnut', label: 'Walnut' },
]

const POSTER_FRAME_MULTIPLIER = 1.35
const CANVAS_FRAME_MULTIPLIER = 1.40
const FREE_SHIPPING_THRESHOLD = 150

function calculatePrice(basePrice: number, frameId: string, multiplier: number): number {
  const noFrameIds = ['none', 'stretched']
  if (noFrameIds.includes(frameId)) return basePrice
  return Math.round(basePrice * multiplier)
}

export default function FormatPage() {
  const { formatDollars } = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [countdown, setCountdown] = useState(19 * 60 + 46)
  const [posterSize, setPosterSize] = useState('12x18')
  const [posterFrame, setPosterFrame] = useState('none')
  const [canvasSize, setCanvasSize] = useState('12x18')
  const [canvasFrame, setCanvasFrame] = useState('stretched')
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('fable_result')
    if (stored) setPreviewImage(stored)
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

  const selectedPoster = POSTER_SIZES.find(s => s.value === posterSize) || POSTER_SIZES[0]
  const selectedCanvas = CANVAS_SIZES.find(s => s.value === canvasSize) || CANVAS_SIZES[0]

  const posterPrice = calculatePrice(selectedPoster.price, posterFrame, POSTER_FRAME_MULTIPLIER)
  const canvasPrice = calculatePrice(selectedCanvas.price, canvasFrame, CANVAS_FRAME_MULTIPLIER)

  const posterFreeShipping = posterPrice >= FREE_SHIPPING_THRESHOLD
  const canvasFreeShipping = canvasPrice >= FREE_SHIPPING_THRESHOLD

  const handleCheckout = async (productType: 'instant' | 'poster' | 'canvas') => {
    const sizeOption = productType === 'poster' ? posterSize : productType === 'canvas' ? canvasSize : undefined
    const frameOption = productType === 'poster' ? posterFrame : productType === 'canvas' ? canvasFrame : undefined
    const price = productType === 'poster' ? posterPrice : productType === 'canvas' ? canvasPrice : 19

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productType === 'instant' ? 'instant-masterpiece' : productType === 'poster' ? 'poster-print' : 'canvas-print',
          jobId,
          sizeOption,
          frameOption,
          price,
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-2">
              Choose Your Format
            </h1>
            <p className="text-muted-foreground">Select how you want to receive your masterpiece</p>
          </div>

          {previewImage && (
            <div className="flex justify-center mb-10">
              <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-xl shadow-black/30 ring-2 ring-border">
                <Image src={previewImage || "/placeholder.svg"} alt="Your portrait preview" fill className="object-cover" />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Instant Masterpiece */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'instant' ? 'border-primary bg-card/80' : 'border-border bg-card/50 hover:border-primary/50'
              )}
              onClick={() => setSelectedFormat('instant')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>

              <div className="flex justify-center mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Download className="h-5 w-5 text-foreground" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Instant Masterpiece</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-2">{formatDollars(19)}</p>

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
                onClick={(e) => { e.stopPropagation(); handleCheckout('instant') }}
              >
                Download Now
              </Button>
            </div>

            {/* Poster Print */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'poster' ? 'border-primary bg-card/80' : 'border-border bg-card/50 hover:border-primary/50'
              )}
              onClick={() => setSelectedFormat('poster')}
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Layers className="h-5 w-5 text-foreground" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Poster Print</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-4">${posterPrice}</p>

              <div className="space-y-3 mb-4">
                <Select value={posterSize} onValueChange={setPosterSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSTER_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label} — ${size.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={posterFrame} onValueChange={setPosterFrame}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frame" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSTER_FRAMES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}{f.id !== 'none' ? ` (+${Math.round((POSTER_FRAME_MULTIPLIER - 1) * 100)}%)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Museum-quality archival paper
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Fade-resistant inks
                </li>
              </ul>

              <div className="flex items-center gap-2 text-sm text-primary mb-4">
                <Truck className="h-4 w-4" />
                <span>
                  {posterFreeShipping
                    ? <>Free Shipping ({formatDollars(20)} value)</>
                    : `Free shipping over $${FREE_SHIPPING_THRESHOLD}`
                  } — 7-9 days
                </span>
              </div>

              <p className="text-primary text-sm mb-4">+ Includes digital download</p>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={(e) => { e.stopPropagation(); handleCheckout('poster') }}
              >
                Order Poster Print
              </Button>
            </div>

            {/* Stretched Canvas */}
            <div
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-all cursor-pointer',
                selectedFormat === 'canvas' ? 'border-accent bg-card/80' : 'border-accent/50 bg-card/50 hover:border-accent'
              )}
              onClick={() => setSelectedFormat('canvas')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                <Gift className="h-3 w-3" />
                The Perfect Gift
              </div>

              <div className="flex justify-center mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Frame className="h-5 w-5 text-accent" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-center text-foreground mb-1">Stretched Canvas</h3>
              <p className="text-3xl font-bold text-center text-foreground mb-4">${canvasPrice}</p>

              <div className="space-y-3 mb-4">
                <Select value={canvasSize} onValueChange={setCanvasSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANVAS_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label} — ${size.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={canvasFrame} onValueChange={setCanvasFrame}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frame" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANVAS_FRAMES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}{f.id !== 'stretched' ? ` (+${Math.round((CANVAS_FRAME_MULTIPLIER - 1) * 100)}%)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  Gallery-wrapped canvas
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-accent" />
                  Ready to hang
                </li>
              </ul>

              <div className="flex items-center gap-2 text-sm text-accent mb-4">
                <Truck className="h-4 w-4" />
                <span>
                  {canvasFreeShipping
                    ? <>Free Shipping ({formatDollars(20)} value)</>
                    : `Free shipping over $${FREE_SHIPPING_THRESHOLD}`
                  } — 7-9 days
                </span>
              </div>

              <p className="text-primary text-sm mb-4">+ Includes digital download</p>

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={(e) => { e.stopPropagation(); handleCheckout('canvas') }}
              >
                Order Canvas Print
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Or go back and try a different style
            </Link>
          </div>

          {/* FAQ Section */}
          <FaqSection />
        </div>
      </main>
    </div>
  )
}
