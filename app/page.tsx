'use client'

import { useState, useCallback } from 'react'

import { TopBar, type TabType } from '@/components/fable/top-bar'
import { UploadCard } from '@/components/fable/upload-card'
import { TrustpilotRow } from '@/components/fable/trustpilot-row'
import { ExampleGallery } from '@/components/fable/example-gallery'
import { StylePicker, STYLE_OPTIONS } from '@/components/fable/style-picker'
import { PricingCards } from '@/components/fable/pricing-cards'
import { ResultSection } from '@/components/fable/result-section'
import { ErrorState } from '@/components/fable/error-state'
import { CheckoutFlow } from '@/components/fable/checkout-flow'
import { ChevronRight } from 'lucide-react'

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

// Order details interface
interface OrderDetails {
  type: 'download' | 'small_print' | 'large_print'
  size?: string
  price: number
  email?: string
}

const HERO_CONTENT = {
  pets: {
    lines: ['Immortalize', 'Your Pet in a Timeless', 'Masterpiece'],
    pricing: 'Free preview • From $19 to purchase',
  },
  family: {
    lines: ['Your Love Story.', 'One Masterpiece.', ''],
    pricing: 'Free preview • From $29 to purchase',
  },
  kids: {
    lines: ['Create a Beautiful', 'Portrait of', 'Your Child'],
    pricing: 'Free preview • From $19 to purchase',
  },
}

export default function HomePage() {
  // Core state
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [appState, setAppState] = useState<AppState>('upload')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Image state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  
  // Style state
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [stylePickerOpen, setStylePickerOpen] = useState(false)
  
  // Order state
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null)
  
  // Rate limiting (mock: 5 free generations per day)
  const [remainingGenerations, setRemainingGenerations] = useState(5)

  const heroContent = HERO_CONTENT[activeTab]
  const selectedStyleData = selectedStyle ? STYLE_OPTIONS.find((s) => s.id === selectedStyle) : null

  // Get current step for indicator
  const getCurrentStep = (): 'upload' | 'preview' | 'download' => {
    if (appState === 'upload' || appState === 'upload_failed') return 'upload'
    if (appState === 'generating' || appState === 'preview' || appState === 'generate_failed') return 'preview'
    return 'download'
  }

  const currentStep = getCurrentStep()

  // Handle image upload
  const handleImageUpload = useCallback((image: string, file: File) => {
    // Check rate limit
    if (remainingGenerations <= 0) {
      setAppState('rate_limited')
      return
    }

    setUploadedImage(image)
    setUploadedFile(file)
    setAppState('generating')
    setRemainingGenerations((prev) => Math.max(0, prev - 1))
    
    // TODO: Call Gemini API here for actual generation
  }, [remainingGenerations])

  // Handle clear image
  const handleClearImage = () => {
    setUploadedImage(null)
    setUploadedFile(null)
    setGeneratedImage(null)
    setAppState('upload')
    setErrorMessage(null)
  }

  // Handle generation complete
  const handleGenerationComplete = useCallback((generatedImg: string) => {
    // TODO: Replace with actual Gemini API response
    // Mock: 95% success rate
    const isSuccess = Math.random() > 0.05
    
    if (isSuccess) {
      setGeneratedImage(generatedImg)
      setAppState('preview')
    } else {
      setAppState('generate_failed')
      setErrorMessage('The AI encountered an issue while creating your masterpiece. This can happen with complex images.')
    }
  }, [])

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
      // Show pricing
      setAppState('preview')
    } else {
      // Generic retry - go back to upload
      setGeneratedImage(null)
      setAppState('upload')
    }
  }

  // Handle go back
  const handleGoBack = () => {
    setAppState('upload')
    setErrorMessage(null)
    setGeneratedImage(null)
    setUploadedImage(null)
    setUploadedFile(null)
  }

  // Handle contact support
  const handleContactSupport = () => {
    // TODO: Open support modal or redirect to support page
    window.open('mailto:support@petcanvas.com?subject=Payment Issue', '_blank')
  }

  // Handle download purchase
  const handleDownload = () => {
    setCurrentOrder({
      type: 'download',
      price: 19,
    })
    setAppState('checkout')
  }

  // Handle print order
  const handleOrderPrint = (size: string, type: 'small' | 'large') => {
    const prices: Record<string, number> = {
      '8" x 10"': 89,
      '12" x 16"': 119,
      '18" x 24"': 199,
      '24" x 36"': 250,
    }
    setCurrentOrder({
      type: type === 'small' ? 'small_print' : 'large_print',
      size,
      price: prices[size] || 89,
    })
    setAppState('checkout')
  }

  // Handle payment success
  const handlePaymentSuccess = () => {
    setAppState('payment_success')
    // TODO: Trigger actual download or show print order confirmation
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

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

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
                heroContent.lines.map((line, i) =>
                  line ? (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ) : null
                )
              )}
            </h1>
            {!generatedImage && appState === 'upload' && (
              <p className="text-muted-foreground text-xs sm:text-sm tracking-wide">{heroContent.pricing}</p>
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
                uploadedImage={uploadedImage}
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
                onOpenStylePicker={() => setStylePickerOpen(true)}
                selectedStyleName={selectedStyleData?.name || null}
                isGenerating={appState === 'generating'}
                generatedImage={generatedImage}
                onRetry={handleRetry}
                onGenerationComplete={handleGenerationComplete}
              />
            </div>
          )}

          {/* Pricing Cards - show after generation in preview state */}
          {generatedImage && appState === 'preview' && (
            <PricingCards onDownload={handleDownload} onOrderPrint={handleOrderPrint} />
          )}

          {/* Result Section with FAQ - show after generation */}
          {generatedImage && appState === 'preview' && (
            <ResultSection generatedImage={generatedImage} onRetry={handleRetry} />
          )}

          {/* Trustpilot Row - show only in upload state */}
          {appState === 'upload' && !generatedImage && <TrustpilotRow activeTab={activeTab} />}

          {/* Example Gallery - show only in upload state */}
          {appState === 'upload' && !generatedImage && (
            <div className="mt-4 sm:mt-8">
              <ExampleGallery activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* Large Pet Canvas Text at Bottom */}
      <div className="relative z-10 py-6 sm:py-16 overflow-hidden">
        <div className="flex items-center justify-center gap-2 sm:gap-4 whitespace-nowrap">
          <span className="font-serif text-[2.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-foreground/5 leading-none tracking-tight select-none">
            Pet Canvas
          </span>
          <span className="font-serif text-[2.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-foreground/5 leading-none tracking-tight select-none hidden sm:block">
            Pet Canvas
          </span>
          <span className="font-serif text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-foreground/5 leading-none tracking-tight select-none hidden md:block">
            Pet Canvas
          </span>
        </div>
      </div>

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
