import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CheckCircle, Home, Sparkles } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 px-4 flex items-center">
        <div className="container mx-auto max-w-xl">
          <Card className="bg-card border-border">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
                Payment Successful!
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. Your pet portrait is being generated and will be sent to your email shortly.
              </p>

              <div className="bg-secondary rounded-lg p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Generation in progress</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  This usually takes 1-2 minutes
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/create">Create Another</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
