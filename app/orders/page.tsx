'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { TurnstileWidget } from '@/components/fable/turnstile-widget'
import {
  Mail, KeyRound, Download, Package, Truck, CheckCircle,
  ExternalLink, Clock, ArrowLeft, Loader2,
} from 'lucide-react'

interface PrintInfo {
  size: string
  status: string
  trackingNumber: string | null
  trackingUrl: string | null
  shippedAt: string | null
  deliveredAt: string | null
}

interface OrderItem {
  id: number
  amount: number
  currency: string
  productId: string
  createdAt: string
  jobStatus: string
  style: string
  previewUrl: string | null
  downloadUrl: string
  print: PrintInfo | null
}

type PageState = 'email' | 'otp' | 'orders'

export default function OrdersPage() {
  const [pageState, setPageState] = useState<PageState>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/orders/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send code')
        return
      }

      setPageState('otp')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
        return
      }

      setOrders(data.orders)
      setPageState('orders')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

  const getStatusIcon = (order: OrderItem) => {
    if (order.print?.deliveredAt) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (order.print?.shippedAt) return <Truck className="h-4 w-4 text-blue-500" />
    if (order.print) return <Package className="h-4 w-4 text-amber-500" />
    return <Download className="h-4 w-4 text-primary" />
  }

  const getStatusLabel = (order: OrderItem) => {
    if (order.print?.deliveredAt) return 'Delivered'
    if (order.print?.shippedAt) return 'Shipped'
    if (order.print) return order.print.status === 'pending' ? 'Processing' : order.print.status
    return 'Digital Download'
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-2">
              My Orders
            </h1>
            <p className="text-muted-foreground text-sm">
              View your order history and download your portraits.
            </p>
          </div>

          {/* Back link */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Step 1: Email */}
          {pageState === 'email' && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground text-center mb-2">
                  Enter Your Email
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  We&apos;ll send a verification code to access your orders.
                </p>

                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                    required
                  />

                  <TurnstileWidget
                    onToken={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={!email.includes('@') || loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Verification Code
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: OTP */}
          {pageState === 'otp' && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground text-center mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-background border-border text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    required
                  />

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={otpCode.length !== 6 || loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify & View Orders
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setPageState('email'); setOtpCode(''); setError(null) }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use a different email
                  </button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Orders List */}
          {pageState === 'orders' && (
            <>
              {orders.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No orders found for {email}.</p>
                    <Button asChild variant="outline" className="bg-transparent">
                      <Link href="/">Create Your First Portrait</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>

                  {orders.map((order) => (
                    <Card key={order.id} className="bg-card border-border">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatPrice(order.amount, order.currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(order)}
                          <span className="text-sm text-foreground">{getStatusLabel(order)}</span>
                          {order.style && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground ml-auto">
                              {order.style}
                            </span>
                          )}
                        </div>

                        {/* Print tracking */}
                        {order.print?.trackingUrl && (
                          <a
                            href={order.print.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Track Shipment
                            {order.print.trackingNumber && (
                              <span className="text-muted-foreground">({order.print.trackingNumber})</span>
                            )}
                          </a>
                        )}

                        {/* Download button */}
                        <Button asChild variant="outline" size="sm" className="bg-transparent w-full">
                          <a href={order.downloadUrl}>
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Download HD Portrait
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
