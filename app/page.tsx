'use client'

import { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import { TopBar, type TabType } from '@/components/fable/top-bar'
import { UploadCard } from '@/components/fable/upload-card'
import { TrustpilotRow } from '@/components/fable/trustpilot-row'
import { ExampleGallery } from '@/components/fable/example-gallery'
import { StylePicker } from '@/components/fable/style-picker'
import { resolveStyle, STYLE_PROMPTS } from '@/lib/style-prompts'
import { PricingCards, type PrintOrderDetails } from '@/components/fable/pricing-cards'
import { ResultSection } from '@/components/fable/result-section'
import { ErrorState } from '@/components/fable/error-state'
import { CheckoutFlow } from '@/components/fable/checkout-flow'
import { ChevronRight } from 'lucide-react'
import { FaqSection } from '@/components/fable/faq-section'
import { StepsSection } from '@/components/fable/steps-section'
import { TurnstileWidget } from '@/components/fable/turnstile-widget'

// App state types for state machine
type AppState =
  | 'upload'           // Initial upload state
  | 'generating'       // AI is generating
  | 'preview'          // Preview ready (watermarked)
  | 'checkout'         // Checkout in progress
  | 'payment_success'  // Payment completed
  | 'upload_failed'    // Upload error
  | 'generate_failed'  // Generation error
  | 'payment_failed'   // Payment error
  | 'rate_limited'     // Rate limit reached

// Uploaded image info
interface UploadedPhoto {
  preview: string    // data URL for thumbnail
  file: File
  uploadId?: number  // set after server upload
  fileUrl?: string   // R2 public URL
}

// Order details interface
interface OrderDetails {
  type: 'download' | 'poster_print' | 'canvas_print'
  size?: string
  frame?: string
  price: number
  email?: string
  productId?: string
}

interface HeroContent {
  staticLine: string        // The non-rotating line
  rotatingLine: 1 | 2       // Which line the rotating text appears on
  rotatingPrefix: string    // Static text before rotating (default color, same line)
  rotating: string[]        // Rotating text options (gold color)
  rotatingSuffix: string    // Static text after rotating (default color, same line)
  pricing: string
  subtitle: string
}

const HERO_CONTENT: Record<TabType, HeroContent> = {
  pets: {
    staticLine: 'Immortalize Your Pet',
    rotatingLine: 2,
    rotatingPrefix: 'in ',
    rotating: [
      'a Timeless Masterpiece',
      'a Renaissance Painting',
      'a Royal Portrait',
      'a Baroque Masterwork',
      'Noble Royalty',
      'a Classical Oil Painting',
    ],
    rotatingSuffix: '',
    pricing: 'From $29 · Ready in 2 minutes',
    subtitle: 'Preview for free. Only pay if you love it.',
  },
  family: {
    staticLine: 'The Whole Family.',
    rotatingLine: 2,
    rotatingPrefix: '',
    rotating: [
      'One Masterpiece.',
      'One Royal Legacy.',
      'One Grand Canvas.',
      'One Timeless Portrait.',
      'One Noble Painting.',
      'One Renaissance Moment.',
    ],
    rotatingSuffix: '',
    pricing: 'From $29 · Ready in 2 minutes',
    subtitle: 'Preview for free. Only pay if you love it.',
  },
  kids: {
    staticLine: 'of Your Child',
    rotatingLine: 1,
    rotatingPrefix: 'Create ',
    rotating: [
      'an Enchanting Portrait',
      'a Royal Legacy',
      'a Timeless Treasure',
      'a Magical Masterpiece',
      'a Noble Painting',
      'a Fairy-tale Portrait',
    ],
    rotatingSuffix: '',
    pricing: 'From $29 · Ready in 2 minutes',
    subtitle: 'Preview for free. Only pay if you love it.',
  },
  couples: {
    staticLine: 'Your Love Story.',
    rotatingLine: 2,
    rotatingPrefix: '',
    rotating: [
      'One Masterpiece.',
      'One Royal Canvas.',
      'One Timeless Portrait.',
      'One Grand Legacy.',
      'One Noble Painting.',
      'One Renaissance Moment.',
    ],
    rotatingSuffix: '',
    pricing: 'From $29 · Ready in 2 minutes',
    subtitle: 'Preview for free. Only pay if you love it.',
  },
  self: {
    staticLine: 'You Deserve.',
    rotatingLine: 1,
    rotatingPrefix: 'The ',
    rotating: [
      'Masterpiece Portrait',
      'Renaissance Portrait',
      'Royal Portrait',
      'Timeless Portrait',
      'Noble Portrait',
      'Classical Portrait',
    ],
    rotatingSuffix: '',
    pricing: 'From $29 · Ready in 2 minutes',
    subtitle: 'Preview for free. Only pay if you love it.',
  },
}

const MAX_PHOTOS = 5

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}

function HomePageContent() {
  const searchParams = useSearchParams()

  // Core state
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [visitorFingerprint, setVisitorFingerprint] = useState<string | null>(null)

  // Initialize FingerprintJS on mount
  useEffect(() => {
    async function initFingerprint() {
      try {
        const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        setVisitorFingerprint(result.visitorId)
      } catch (err) {
        console.warn('FingerprintJS init failed:', err)
      }
    }
    initFingerprint()
  }, [])

  // Read tab from URL query param on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null
    if (tabParam && ['pets', 'family', 'kids', 'couples', 'self'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])
  const [appState, setAppState] = useState<AppState>('upload')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Image state — now supports multiple photos
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  // Style state
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [stylePickerOpen, setStylePickerOpen] = useState(false)

  // Order state
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null)

  // Rate limiting: 5 free generations per day
  const [remainingGenerations, setRemainingGenerations] = useState(5)

  // Pet name
  const [petName, setPetName] = useState('')

  // Email, auth & job tracking
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [currentJobId, setCurrentJobId] = useState<number | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Turnstile token
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const heroContent = HERO_CONTENT[activeTab]
  const selectedStyleName = selectedStyle && selectedStyle !== 'intelligent'
    ? (STYLE_PROMPTS[selectedStyle]?.name || null)
    : null

  // Rotating hero text animation
  const [rotatingIndex, setRotatingIndex] = useState(0)
  const [rotatingFading, setRotatingFading] = useState(false)

  useEffect(() => {
    setRotatingIndex(0)
    setRotatingFading(false)
  }, [activeTab])

  useEffect(() => {
    if (appState !== 'upload' || generatedImage) return

    const interval = setInterval(() => {
      setRotatingFading(true)
      setTimeout(() => {
        setRotatingIndex((prev) => (prev + 1) % heroContent.rotating.length)
        setRotatingFading(false)
      }, 400)
    }, 3000)

    return () => clearInterval(interval)
  }, [appState, generatedImage, heroContent.rotating.length])

  // Get current step for indicator
  const getCurrentStep = (): 'upload' | 'preview' | 'download' => {
    if (appState === 'upload' || appState === 'upload_failed') return 'upload'
    if (appState === 'generating' || appState === 'preview' || appState === 'generate_failed') return 'preview'
    return 'download'
  }

  const currentStep = getCurrentStep()

  // Handle adding photos (just local preview, no server upload yet)
  const handleAddPhotos = useCallback((newPhotos: { preview: string; file: File }[]) => {
    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length
      return [...prev, ...newPhotos.slice(0, remaining)]
    })
  }, [])

  // Handle removing a photo
  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Handle generate — uploads all photos to server, then starts generation
  const handleGenerate = useCallback(async () => {
    if (photos.length === 0) return
    if (remainingGenerations <= 0) {
      setAppState('rate_limited')
      return
    }

    setAppState('generating')
    setRemainingGenerations((prev) => Math.max(0, prev - 1))

    try {
      // Step 1: Ensure user exists and get auth token
      let email = userEmail
      let token = authToken
      if (!email) {
        email = `guest-${Date.now()}@petcanvas.art`
        setUserEmail(email)
        const consentRes = await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, acceptedTermsA: true, acceptedTermsB: true, turnstileToken }),
        })
        const consentData = await consentRes.json()
        if (consentData.authToken) {
          token = consentData.authToken
          setAuthToken(token)
        }
      }

      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      // Step 2: Upload all photos to R2
      const uploadIds: number[] = []
      for (const photo of photos) {
        if (photo.uploadId) {
          uploadIds.push(photo.uploadId)
          continue
        }
        const formData = new FormData()
        formData.append('file', photo.file)
        formData.append('email', email)
        if (turnstileToken) formData.append('turnstileToken', turnstileToken)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        })
        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Upload failed')
        }
        uploadIds.push(uploadData.uploadId)
      }

      // Step 3: Start generation with all upload IDs
      // Auto-select style based on tab
      const style = resolveStyle(selectedStyle || 'intelligent', activeTab)
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ email, style, uploadIds, tab: activeTab, fingerprint: visitorFingerprint, turnstileToken }),
      })
      const genData = await genRes.json()

      if (!genRes.ok) {
        if (genRes.status === 429 && genData.canPurchaseCredits) {
          setAppState('rate_limited')
          setRemainingGenerations(0)
          return
        }
        if (genRes.status === 429 && genData.retryAfter) {
          // Concurrent generation limit — restore the decremented generation count
          setRemainingGenerations((prev) => prev + 1)
        }
        throw new Error(genData.error || 'Generation failed')
      }

      setCurrentJobId(genData.jobId)

      // Step 4: Poll job status (max 150 attempts = 5 minutes)
      let pollAttempts = 0
      const maxPollAttempts = 150
      let consecutiveErrors = 0

      pollIntervalRef.current = setInterval(async () => {
        pollAttempts++

        if (pollAttempts >= maxPollAttempts) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          setAppState('generate_failed')
          setErrorMessage('Generation timed out. Please try again.')
          return
        }

        try {
          const jobRes = await fetch(`/api/jobs/${genData.jobId}`, {
            headers: authHeaders,
          })

          if (!jobRes.ok) {
            consecutiveErrors++
            if (consecutiveErrors >= 5) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
              setAppState('generate_failed')
              setErrorMessage('Unable to check generation status. Please try again.')
            }
            return
          }

          consecutiveErrors = 0
          const jobData = await jobRes.json()

          if (jobData.status === 'completed' && jobData.outputUrl) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setGeneratedImage(jobData.outputUrl)
            setAppState('preview')
          } else if (jobData.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setAppState('generate_failed')
            setErrorMessage(jobData.error || 'Generation failed. Please try again.')
          }
        } catch {
          consecutiveErrors++
          if (consecutiveErrors >= 5) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setAppState('generate_failed')
            setErrorMessage('Connection lost. Please check your network and try again.')
          }
        }
      }, 2000)
    } catch (error) {
      setAppState('generate_failed')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }, [photos, remainingGenerations, userEmail, authToken, selectedStyle, activeTab, visitorFingerprint, turnstileToken])

  // Handle custom edit — re-generate with additional edit instructions
  const handleCustomEdit = useCallback(async (editDescription: string) => {
    if (photos.length === 0) return
    if (remainingGenerations <= 0) {
      setAppState('rate_limited')
      return
    }

    setAppState('generating')
    setGeneratedImage(null)
    setRemainingGenerations((prev) => Math.max(0, prev - 1))

    try {
      let email = userEmail || `guest-${Date.now()}@petcanvas.art`
      let token = authToken
      if (!userEmail) {
        setUserEmail(email)
        const consentRes = await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, acceptedTermsA: true, acceptedTermsB: true, turnstileToken }),
        })
        const consentData = await consentRes.json()
        if (consentData.authToken) {
          token = consentData.authToken
          setAuthToken(token)
        }
      }

      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      // Re-use existing upload IDs
      const uploadIds: number[] = []
      for (const photo of photos) {
        if (photo.uploadId) {
          uploadIds.push(photo.uploadId)
          continue
        }
        const formData = new FormData()
        formData.append('file', photo.file)
        formData.append('email', email)
        if (turnstileToken) formData.append('turnstileToken', turnstileToken)
        const uploadRes = await fetch('/api/upload', { method: 'POST', headers: authHeaders, body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')
        uploadIds.push(uploadData.uploadId)
      }

      const defaultStyle = activeTab === 'pets' ? 'royal-portrait' : activeTab === 'kids' ? 'kids-portrait' : 'family-portrait'
      const style = selectedStyle || defaultStyle

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ email, style, uploadIds, editPrompt: editDescription, tab: activeTab, fingerprint: visitorFingerprint, turnstileToken }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) {
        if (genRes.status === 429 && genData.canPurchaseCredits) {
          setAppState('rate_limited')
          setRemainingGenerations(0)
          return
        }
        if (genRes.status === 429 && genData.retryAfter) {
          setRemainingGenerations((prev) => prev + 1)
        }
        throw new Error(genData.error || 'Generation failed')
      }

      setCurrentJobId(genData.jobId)

      let editPollAttempts = 0
      const maxEditPollAttempts = 150
      let editConsecutiveErrors = 0

      pollIntervalRef.current = setInterval(async () => {
        editPollAttempts++

        if (editPollAttempts >= maxEditPollAttempts) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          setAppState('generate_failed')
          setErrorMessage('Generation timed out. Please try again.')
          return
        }

        try {
          const jobRes = await fetch(`/api/jobs/${genData.jobId}`, { headers: authHeaders })

          if (!jobRes.ok) {
            editConsecutiveErrors++
            if (editConsecutiveErrors >= 5) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
              setAppState('generate_failed')
              setErrorMessage('Unable to check generation status. Please try again.')
            }
            return
          }

          editConsecutiveErrors = 0
          const jobData = await jobRes.json()

          if (jobData.status === 'completed' && jobData.outputUrl) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setGeneratedImage(jobData.outputUrl)
            setAppState('preview')
          } else if (jobData.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setAppState('generate_failed')
            setErrorMessage(jobData.error || 'Generation failed. Please try again.')
          }
        } catch {
          editConsecutiveErrors++
          if (editConsecutiveErrors >= 5) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setAppState('generate_failed')
            setErrorMessage('Connection lost. Please check your network and try again.')
          }
        }
      }, 2000)
    } catch (error) {
      setAppState('generate_failed')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    }
  }, [photos, remainingGenerations, userEmail, authToken, selectedStyle, activeTab, visitorFingerprint, turnstileToken])

  // Handle clear all
  const handleClearAll = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    setPhotos([])
    setGeneratedImage(null)
    setCurrentJobId(null)
    setAppState('upload')
    setErrorMessage(null)
  }

  // Handle generation complete — now a no-op since polling handles it
  const handleGenerationComplete = useCallback(() => {
    // Generation completion is handled by job polling in handleGenerate
  }, [])

  // Handle buying credits from rate_limited state
  const handleBuyCredits = () => {
    setCurrentOrder({
      type: 'download',
      price: 39,
      productId: 'credit-pack-10',
    })
    setAppState('checkout')
  }

  // Handle buying a single portrait from rate_limited state
  const handleBuySinglePortrait = () => {
    handleDownload()
  }

  // Handle retry from any error state
  const handleRetry = () => {
    if (appState === 'upload_failed') {
      setAppState('upload')
      setErrorMessage(null)
    } else if (appState === 'generate_failed') {
      setGeneratedImage(null)
      setAppState('upload')
      setErrorMessage(null)
    } else if (appState === 'payment_failed') {
      if (currentOrder) {
        setAppState('checkout')
      }
    } else if (appState === 'rate_limited') {
      setAppState('preview')
    } else {
      setGeneratedImage(null)
      setPhotos([])
      setAppState('upload')
    }
  }

  // Handle go back
  const handleGoBack = () => {
    setAppState('upload')
    setErrorMessage(null)
    setGeneratedImage(null)
    setPhotos([])
  }

  // Handle contact support
  const handleContactSupport = () => {
    window.open('mailto:info@petcanvas.art?subject=Payment Issue', '_blank')
  }

  // Handle download purchase
  const handleDownload = () => {
    const productMap: Record<TabType, string> = {
      pets: 'pet-portrait-digital',
      family: 'family-portrait-digital',
      kids: 'kids-portrait-digital',
      couples: 'couples-portrait-digital',
      self: 'self-portrait-digital',
    }
    setCurrentOrder({
      type: 'download',
      price: 29,
      productId: productMap[activeTab],
    })
    setAppState('checkout')
  }

  // Handle print order
  const handleOrderPrint = (details: PrintOrderDetails) => {
    setCurrentOrder({
      type: details.type === 'poster' ? 'poster_print' : 'canvas_print',
      size: details.size,
      frame: details.frame,
      price: details.price,
      productId: details.type === 'poster' ? 'poster-print' : 'canvas-print',
    })
    setAppState('checkout')
  }

  // Handle payment success
  const handlePaymentSuccess = () => {
    // If credits were purchased, reset generation counter and go back to upload
    if (currentOrder?.productId === 'credit-pack-10') {
      setRemainingGenerations(10) // Credits purchased, allow more generations
      setCurrentOrder(null)
      setAppState('upload')
      return
    }
    setAppState('payment_success')
  }

  // Handle payment failed
  const handlePaymentFailed = (error: string) => {
    setAppState('payment_failed')
    setErrorMessage(error)
  }

  // Render error states
  const renderErrorState = () => {
    if (appState === 'upload_failed' || appState === 'generate_failed' || appState === 'payment_failed' || appState === 'rate_limited') {
      return (
        <div className="mb-6">
          <ErrorState
            errorType={appState}
            errorMessage={errorMessage || undefined}
            onRetry={handleRetry}
            onGoBack={handleGoBack}
            onContactSupport={handleContactSupport}
            onBuyCredits={handleBuyCredits}
            onBuySinglePortrait={generatedImage ? handleBuySinglePortrait : undefined}
          />
        </div>
      )
    }
    return null
  }

  // Render checkout flow
  const renderCheckoutFlow = () => {
    if (appState === 'checkout' && currentOrder) {
      return (
        <div className="mb-6">
          <CheckoutFlow
            order={currentOrder}
            authToken={authToken}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onBack={() => setAppState('preview')}
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle gradient background for light theme */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} hideNav={appState === 'preview' || appState === 'checkout' || appState === 'payment_success'} />

      <main className="relative z-10 pt-2 sm:pt-4 pb-8 sm:pb-20 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-4 mb-3 sm:mb-6">
            <span className={`text-[10px] sm:text-sm whitespace-nowrap ${currentStep === 'upload' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Upload
            </span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className={`text-[10px] sm:text-sm whitespace-nowrap ${currentStep === 'preview' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Preview
            </span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className={`text-[10px] sm:text-sm whitespace-nowrap ${currentStep === 'download' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Download or Order Print
            </span>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-3 sm:mb-8">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl italic text-foreground leading-[1.1] sm:leading-[1.15] mb-2 sm:mb-4 tracking-tight">
              {generatedImage && appState === 'preview' ? (
                <span className="block">Your Masterpiece is Ready!</span>
              ) : appState === 'checkout' || appState === 'payment_success' ? (
                <span className="block">Complete Your Order</span>
              ) : appState === 'rate_limited' ? (
                <span className="block">Daily Limit Reached</span>
              ) : (
                <>
                  {heroContent.rotatingLine === 2 ? (
                    <>
                      <span className="block">{heroContent.staticLine}</span>
                      <span className="block">
                        {heroContent.rotatingPrefix}
                        <span
                          className={`inline-block transition-all duration-400 ${
                            rotatingFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                          }`}
                          style={{ color: '#c8a24e' }}
                        >
                          {heroContent.rotating[rotatingIndex]}
                        </span>
                        {heroContent.rotatingSuffix}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block">
                        {heroContent.rotatingPrefix}
                        <span
                          className={`inline-block transition-all duration-400 ${
                            rotatingFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                          }`}
                          style={{ color: '#c8a24e' }}
                        >
                          {heroContent.rotating[rotatingIndex]}
                        </span>
                        {heroContent.rotatingSuffix}
                      </span>
                      <span className="block">{heroContent.staticLine}</span>
                    </>
                  )}
                </>
              )}
            </h1>
            {!generatedImage && appState === 'upload' && (
              <>
                <p className="text-muted-foreground text-xs sm:text-sm tracking-wide">{heroContent.pricing}</p>
                <p className="text-emerald-600 font-semibold text-xs sm:text-sm mt-1">{heroContent.subtitle}</p>
              </>
            )}
          </div>

          {/* Error States */}
          {renderErrorState()}

          {/* Checkout Flow */}
          {renderCheckoutFlow()}

          {/* Upload Card / Generated Result - hide during checkout/error */}
          {appState !== 'checkout' && appState !== 'payment_success' && !['upload_failed', 'generate_failed', 'payment_failed', 'rate_limited'].includes(appState) && (
            <div className="mb-3 sm:mb-6">
              <UploadCard
                activeTab={activeTab}
                photos={photos}
                maxPhotos={MAX_PHOTOS}
                onAddPhotos={handleAddPhotos}
                onRemovePhoto={handleRemovePhoto}
                onGenerate={handleGenerate}
                onClearAll={handleClearAll}
                onOpenStylePicker={() => setStylePickerOpen(true)}
                selectedStyleName={selectedStyleName}
                isGenerating={appState === 'generating'}
                generatedImage={generatedImage}
                onRetry={handleRetry}
                onCustomEdit={handleCustomEdit}
                onGenerationComplete={handleGenerationComplete}
                remainingCredits={remainingGenerations}
                userEmail={userEmail || ''}
                onUserEmailChange={(email) => setUserEmail(email)}
                petName={petName}
                onPetNameChange={setPetName}
              />
              {/* Turnstile — renders below upload card, invisible in managed mode unless challenge needed */}
              {appState === 'upload' && !generatedImage && (
                <TurnstileWidget
                  onToken={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              )}
            </div>
          )}

          {/* Pricing Cards - show after generation in preview state */}
          {generatedImage && appState === 'preview' && (
            <div id="pricing-section">
              <PricingCards onDownload={handleDownload} onOrderPrint={handleOrderPrint} />
            </div>
          )}

          {/* Result Section with FAQ - show after generation */}
          {generatedImage && appState === 'preview' && (
            <ResultSection generatedImage={generatedImage} onRetry={handleRetry} jobId={currentJobId} />
          )}

          {/* Example Gallery - show only in upload state, right below upload */}
          {appState === 'upload' && !generatedImage && (
            <div className="mt-4 sm:mt-8">
              <ExampleGallery activeTab={activeTab} />
            </div>
          )}

          {/* Trustpilot Row - show only in upload state */}
          {appState === 'upload' && !generatedImage && <TrustpilotRow activeTab={activeTab} />}

          {/* 3 Easy Steps - show only in upload state */}
          {appState === 'upload' && !generatedImage && (
            <StepsSection />
          )}

          {/* FAQ Section - show only in upload state */}
          {appState === 'upload' && !generatedImage && (
            <FaqSection />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base italic text-foreground">Pet Canvas</span>
              <span className="text-muted-foreground text-xs">Create</span>
            </div>
            <nav className="flex items-center gap-4 sm:gap-6">
              <a href="/policies/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="/policies/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/support" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </nav>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left mt-4">
            &copy; 2026 Timeless Masterpiece. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Style Picker Sheet */}
      <StylePicker
        open={stylePickerOpen}
        onOpenChange={setStylePickerOpen}
        selectedStyle={selectedStyle}
        onSelectStyle={setSelectedStyle}
        activeTab={activeTab}
      />
    </div>
  )
}
