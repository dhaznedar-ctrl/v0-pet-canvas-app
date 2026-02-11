'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Download, Layers, Frame, Check, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface PrintOrderDetails {
  size: string
  frame: string
  price: number
  type: 'poster' | 'canvas'
}

interface PricingCardsProps {
  onDownload: () => void
  onOrderPrint: (details: PrintOrderDetails) => void
}

const POSTER_SIZES = [
  { size: '8" x 10"', price: 89 },
  { size: '12" x 16"', price: 119 },
  { size: '18" x 24"', price: 199 },
  { size: '24" x 32"', price: 299 },
]

const POSTER_FRAMES = [
  { id: 'none', label: 'No Frame' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'walnut', label: 'Walnut' },
]

// Canvas base prices before +30%
const CANVAS_SIZES_BASE = [
  { size: '10" x 12"', base: 89 },
  { size: '12" x 16"', base: 118 },
  { size: '16" x 20"', base: 152 },
  { size: '24" x 32"', base: 193 },
]

// Apply +30% markup
const CANVAS_SIZES = CANVAS_SIZES_BASE.map((s) => ({
  size: s.size,
  price: Math.round(s.base * 1.3),
}))

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

export function PricingCards({ onDownload, onOrderPrint }: PricingCardsProps) {
  const [posterSize, setPosterSize] = useState(POSTER_SIZES[0].size)
  const [posterFrame, setPosterFrame] = useState('none')
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0].size)
  const [canvasFrame, setCanvasFrame] = useState('stretched')
  const [countdown, setCountdown] = useState(20 * 60) // 20 minutes in seconds

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `0:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const selectedPoster = POSTER_SIZES.find(s => s.size === posterSize) || POSTER_SIZES[0]
  const selectedCanvas = CANVAS_SIZES.find(s => s.size === canvasSize) || CANVAS_SIZES[0]

  const posterPrice = calculatePrice(selectedPoster.price, posterFrame, POSTER_FRAME_MULTIPLIER)
  const canvasPrice = calculatePrice(selectedCanvas.price, canvasFrame, CANVAS_FRAME_MULTIPLIER)

  const posterOldPrice = Math.round(posterPrice * 1.31)
  const canvasOldPrice = Math.round(canvasPrice * 1.31)

  const posterFreeShipping = posterPrice >= FREE_SHIPPING_THRESHOLD
  const canvasFreeShipping = canvasPrice >= FREE_SHIPPING_THRESHOLD

  // Direct actions — no email modal needed (email already collected)
  const handleDownloadClick = () => {
    onDownload()
  }

  const handlePosterClick = () => {
    onOrderPrint({
      size: posterSize,
      frame: posterFrame,
      price: posterPrice,
      type: 'poster',
    })
  }

  const handleCanvasClick = () => {
    onOrderPrint({
      size: canvasSize,
      frame: canvasFrame,
      price: canvasPrice,
      type: 'canvas',
    })
  }

  return (
    <div className="py-12">
      <h2 className="font-serif text-2xl md:text-3xl italic text-center text-foreground mb-10">
        Choose Your Format
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Digital Portrait Card */}
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

          <h3 className="font-serif text-xl text-center text-foreground mb-2">Digital Portrait</h3>

          <div className="text-center mb-1">
            <span className="text-muted-foreground line-through text-sm">$39</span>
            <span className="text-3xl font-bold text-foreground ml-2">$29</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-4">
            Expires in <span className="text-foreground font-medium">{formatCountdown(countdown)}</span>
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
            Get My Portrait
          </Button>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-muted-foreground text-sm mb-1">Want more styles & masterpieces?</p>
            <Link href="/packs" className="text-foreground text-sm font-semibold hover:underline">
              View Packs & Pricing →
            </Link>
          </div>
        </div>

        {/* Fine Art Print Card */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <div className="flex justify-center mb-4">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-serif text-xl text-center text-foreground mb-4">Fine Art Print</h3>

          <div className="text-center mb-4">
            <span className="text-muted-foreground line-through text-sm">${posterOldPrice}</span>
            <span className="text-3xl font-bold text-foreground ml-2">${posterPrice}</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Printed on museum-quality archival paper with fade-resistant inks.
          </p>

          {/* Size selector */}
          <div className="mb-3">
            <p className="text-sm text-muted-foreground mb-2">Choose Size</p>
            <Select value={posterSize} onValueChange={setPosterSize}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSTER_SIZES.map((s) => (
                  <SelectItem key={s.size} value={s.size}>
                    {s.size} — ${s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frame selector */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Frame</p>
            <Select value={posterFrame} onValueChange={setPosterFrame}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
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
                  {posterFreeShipping ? (
                    <>
                      <span className="font-semibold text-foreground">Free Shipping</span>
                      <span className="text-muted-foreground"> ($20 value)</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Free shipping over ${FREE_SHIPPING_THRESHOLD}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Delivery: 7-9 days</p>
              </div>
            </div>
          </div>

          <p className="text-primary text-sm mb-4">+ Includes digital download</p>

          <Button
            variant="outline"
            onClick={handlePosterClick}
            className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Order Fine Art Print
          </Button>
        </div>

        {/* Stretched Canvas Card */}
        <div className="relative rounded-2xl border-2 border-accent bg-card p-6 flex flex-col">
          {/* The Perfect Gift Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
              The Perfect Gift
            </span>
          </div>

          <div className="flex justify-center mb-4 mt-2">
            <Frame className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="font-serif text-xl text-center text-foreground mb-4">Stretched Canvas</h3>

          <div className="text-center mb-4">
            <span className="text-muted-foreground line-through text-sm">${canvasOldPrice}</span>
            <span className="text-3xl font-bold text-accent ml-2">${canvasPrice}</span>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Gallery-wrapped canvas with professional quality — ready to hang.
          </p>

          {/* Size selector */}
          <div className="mb-3">
            <p className="text-sm text-muted-foreground mb-2">Choose Size</p>
            <Select value={canvasSize} onValueChange={setCanvasSize}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANVAS_SIZES.map((s) => (
                  <SelectItem key={s.size} value={s.size}>
                    {s.size} — ${s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frame selector */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Frame</p>
            <Select value={canvasFrame} onValueChange={setCanvasFrame}>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
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

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Gallery-wrapped canvas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Ready to hang</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Fade-resistant inks</span>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-foreground" />
              <div>
                <p className="text-sm">
                  {canvasFreeShipping ? (
                    <>
                      <span className="font-semibold text-foreground">Free Shipping</span>
                      <span className="text-muted-foreground"> ($20 value)</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Free shipping over ${FREE_SHIPPING_THRESHOLD}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Delivery: 7-9 days</p>
              </div>
            </div>
          </div>

          <p className="text-primary text-sm mb-4">+ Includes digital download</p>

          <Button
            variant="outline"
            onClick={handleCanvasClick}
            className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Order Canvas Print
          </Button>
        </div>
      </div>
    </div>
  )
}
