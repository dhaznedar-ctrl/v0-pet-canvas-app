'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, MessageSquare, Clock, ChevronRight, CheckCircle, Send, ExternalLink, Globe } from 'lucide-react'
import { TurnstileWidget } from '@/components/fable/turnstile-widget'

type TicketSubject = 'Payment' | 'Quality' | 'Order Tracking' | 'Other'

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  // Form state
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<TicketSubject>('Payment')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = email.includes('@') && message.length >= 10 && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, turnstileToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit ticket')
        return
      }

      setTicketNumber(data.ticketNumber)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Soft warm gradient — light, airy, minimal */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-3">
              How Can We Help?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Submit a ticket below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {/* Back to main site */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Back to Create
            </Link>
            <span className="text-border">|</span>
            <a
              href="https://petcanvas.art"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <Globe className="h-3.5 w-3.5" />
              petcanvas.art
            </a>
          </div>

          {/* Support Form */}
          <Card className="bg-card border-border shadow-sm mb-10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-foreground text-lg">Submit a Support Ticket</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {ticketNumber ? (
                // Success state
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ticket Submitted!</h3>
                  <div className="bg-secondary/50 rounded-xl p-4 mb-4 inline-block">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Your ticket number</p>
                    <p className="text-lg font-mono font-bold text-primary">{ticketNumber}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    We&apos;ll get back to you within 24 hours. A confirmation email has been sent to <strong className="text-foreground">{email}</strong>.
                  </p>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => {
                      setTicketNumber(null)
                      setMessage('')
                    }}
                  >
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="support-email" className="text-sm font-medium text-foreground mb-1.5 block">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="support-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="support-subject" className="text-sm font-medium text-foreground mb-1.5 block">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="support-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as TicketSubject)}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm"
                    >
                      <option value="Payment">Payment Issue</option>
                      <option value="Quality">Quality Concern</option>
                      <option value="Order Tracking">Order Tracking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="support-message" className="text-sm font-medium text-foreground mb-1.5 block">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="support-message"
                      placeholder="Describe your issue in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-y"
                      required
                      minLength={10}
                      maxLength={2000}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{message.length}/2000</p>
                  </div>

                  {/* Honeypot */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
                    <input type="text" name="_hp_name" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Turnstile */}
                  <TurnstileWidget
                    onToken={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Prefer email? Write to us directly.
                </p>
                <a href="mailto:info@petcanvas.art" className="text-primary hover:underline font-medium text-sm block mb-1">
                  info@petcanvas.art
                </a>
                <a
                  href="https://petcanvas.art"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  petcanvas.art
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We reply within 24 hours on business days.
                </p>
                <span className="text-foreground font-medium text-sm">Mon-Fri, 9AM-6PM EST</span>
              </CardContent>
            </Card>
          </div>

          {/* Common Issues — collapsible style */}
          <Card className="bg-card border-border shadow-sm mb-10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-foreground text-lg">Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  q: 'My generation is stuck',
                  a: 'If your generation has been processing for more than 5 minutes, please refresh the page and check your email for updates. If the issue persists, submit a ticket above.'
                },
                {
                  q: 'I didn\'t receive my portrait',
                  a: 'Please check your spam/junk folder first. If you still can\'t find your portrait email, submit a ticket with your email address and approximate order time.'
                },
                {
                  q: 'Payment failed',
                  a: 'Try again with a different payment method or card. If you continue to experience issues, contact your bank or submit a ticket above.'
                },
                {
                  q: 'Quality concerns',
                  a: 'For best results, use a clear, well-lit photo where the subject is prominent. Blurry or dark photos may result in lower quality. You can retry with a better photo for free.'
                },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30">
                  <h3 className="font-medium text-foreground text-sm mb-1">{item.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Policy Links */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-foreground text-sm mb-3">Legal Policies</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { href: '/policies/terms', label: 'Terms of Service' },
                { href: '/policies/privacy', label: 'Privacy Policy' },
                { href: '/policies/refund', label: 'Refund Policy' },
                { href: '/policies/license', label: 'Commercial License' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <span className="text-foreground text-sm">{link.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
