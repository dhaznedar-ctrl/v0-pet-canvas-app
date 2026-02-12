import React from "react"
import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CurrencyProvider } from '@/components/fable/currency-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://create.petcanvas.art'),
  title: {
    default: 'Pet Canvas - AI Pet Portrait Generator',
    template: '%s | Pet Canvas',
  },
  description: 'Transform your pet photos into stunning artistic portraits with AI. Choose from watercolor, oil painting, or pop art styles.',
  keywords: ['pet portrait', 'AI art', 'pet painting', 'dog portrait', 'cat portrait', 'family portrait', 'custom portrait'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://create.petcanvas.art',
    siteName: 'Pet Canvas',
    title: 'Pet Canvas - AI Pet Portrait Generator',
    description: 'Transform your pet photos into stunning artistic portraits with AI.',
    images: [{ url: '/images/og-cover.jpg', width: 1200, height: 630, alt: 'Pet Canvas - AI Pet Portraits' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pet Canvas - AI Pet Portrait Generator',
    description: 'Transform your pet photos into stunning artistic portraits with AI.',
    images: ['/images/og-cover.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const pinterestTagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Pet Canvas',
              url: 'https://create.petcanvas.art',
              logo: 'https://create.petcanvas.art/icon.svg',
              description: 'AI-powered pet portrait generator that transforms your photos into museum-quality art.',
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <PostHogProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </PostHogProvider>
        <Toaster />

        {/* Meta Pixel */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
        )}

        {/* Google Analytics 4 */}
        {gaMeasurementId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaMeasurementId}');`}
            </Script>
          </>
        )}

        {/* TikTok Pixel */}
        {tiktokPixelId && (
          <Script id="tiktok-pixel" strategy="afterInteractive">
            {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e+"-"+o]=+new Date;(function(o,n){o=d.createElement("script"),n=d.getElementsByTagName("script")[0],o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t,n.parentNode.insertBefore(o,n)}())};ttq.load('${tiktokPixelId}');ttq.page()}(window,document,'ttq');`}
          </Script>
        )}

        {/* Pinterest Tag */}
        {pinterestTagId && (
          <Script id="pinterest-tag" strategy="afterInteractive">
            {`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${pinterestTagId}');pintrk('page');`}
          </Script>
        )}
      </body>
    </html>
  )
}
