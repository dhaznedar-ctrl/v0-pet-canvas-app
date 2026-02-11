'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ArrowLeft, Download, Package, Truck, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

interface TrackResult {
  orderId: number
  status: string
  productId: string
  createdAt: string
  downloadUrl: string
  print?: {
    size: string
    status: string
    trackingNumber: string | null
    trackingUrl: string | null
    shippedAt: string | null
  }
}

export default function TrackPage() {
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')
  const [result, setResult] = useState<TrackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || !orderId) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSearched(true)

    try {
      const res = await fetch(`/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderId: parseInt(orderId, 10) }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Order not found')
        return
      }

      const match = data.order
      if (!match) {
        setError('No order found with this ID and email combination.')
        return
      }

      setResult({
        orderId: match.id,
        status: match.print ? match.print.status : 'completed',
        productId: match.productId,
        createdAt: match.createdAt,
        downloadUrl: match.downloadUrl,
        print: match.print,
      })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!result) return null
    if (result.print?.shippedAt) {
      return (
        <div className="flex items-center gap-2 text-blue-500">
          <Truck className="h-5 w-5" />
          <span className="font-medium">Shipped</span>
        </div>
      )
    }
    if (result.print) {
      return (
        <div className="flex items-center gap-2 text-amber-500">
          <Package className="h-5 w-5" />
          <span className="font-medium">Processing</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Completed</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and order number to check status.
            </p>
          </div>

          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label htmlFor="track-email" className="text-sm font-medium text-foreground mb-1 block">
                    Email
                  </label>
                  <Input
                    id="track-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="track-order" className="text-sm font-medium text-foreground mb-1 block">
                    Order ID
                  </label>
                  <Input
                    id="track-order"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g., 12345"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.replace(/\D/g, ''))}
                    className="bg-background border-border"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={!email.includes('@') || !orderId || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-semibold text-foreground">Order #{result.orderId}</p>
                  {getStatusBadge()}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Placed on {new Date(result.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>

                {result.print?.trackingUrl && (
                  <a
                    href={result.print.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4 block"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Track Shipment
                    {result.print.trackingNumber && ` (${result.print.trackingNumber})`}
                  </a>
                )}

                <Button asChild className="w-full">
                  <a href={result.downloadUrl}>
                    <Download className="h-4 w-4 mr-2" />
                    Download HD Portrait
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {searched && !result && !loading && !error && (
            <p className="text-center text-muted-foreground text-sm">No matching order found.</p>
          )}

          {/* Link to full order history */}
          <div className="text-center mt-8">
            <Link href="/orders" className="text-sm text-primary hover:underline">
              View all orders with email verification
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
