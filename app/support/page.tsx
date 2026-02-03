'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageSquare, Clock, ChevronRight } from 'lucide-react'

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pets')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-4">
              Get Support
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We are here to help. Reach out with any questions or concerns.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">
                  Send us an email and we will get back to you within 24 hours.
                </p>
                <a href="mailto:support@petcanvas.art" className="text-primary hover:underline font-medium">
                  support@petcanvas.art
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Response Time</h3>
                <p className="text-muted-foreground mb-4">
                  We aim to respond to all inquiries within 24 hours during business days.
                </p>
                <span className="text-foreground font-medium">Mon-Fri, 9AM-6PM EST</span>
              </CardContent>
            </Card>
          </div>

          {/* Common Issues */}
          <Card className="bg-card/50 backdrop-blur-sm border-border mb-12">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle className="text-foreground">Common Issues</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">My generation is stuck</h3>
                <p className="text-muted-foreground">
                  If your generation has been processing for more than 5 minutes, please refresh the page and check
                  your email for updates. If the issue persists, contact support with your order details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">I did not receive my portrait</h3>
                <p className="text-muted-foreground">
                  Please check your spam/junk folder first. If you still cannot find your portrait email, contact
                  support with your email address and approximate order time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Payment failed</h3>
                <p className="text-muted-foreground">
                  If your payment failed, please try again with a different payment method. If you continue to
                  experience issues, contact your bank or try a different card.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Quality concerns</h3>
                <p className="text-muted-foreground">
                  For best results, use a clear, well-lit photo where your pet is the main subject. Blurry or dark
                  photos may result in lower quality outputs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Links */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Legal Policies</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/policies/terms"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-foreground">Terms of Service</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/policies/privacy"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-foreground">Privacy Policy</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/policies/refund"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-foreground">Refund Policy</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/policies/license"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-foreground">Commercial License</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
