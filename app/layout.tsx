import React from "react"
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CurrencyProvider } from '@/components/fable/currency-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Pet Canvas - AI Pet Portrait Generator',
  description: 'Transform your pet photos into stunning artistic portraits with AI. Choose from watercolor, oil painting, or pop art styles.',
  keywords: ['pet portrait', 'AI art', 'pet painting', 'dog portrait', 'cat portrait'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
        <Toaster />
      </body>
    </html>
  )
}
