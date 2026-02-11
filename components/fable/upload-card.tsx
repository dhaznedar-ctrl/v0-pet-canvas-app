'use client'

import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { Plus, Palette, X, Pencil, PawPrint, AlertCircle, Lock, Sparkles, ImagePlus, Mail, Check, Star, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import type { TabType } from './top-bar'
import { RetryOptionsModal } from './retry-options-modal'
import { ConsentCheckbox, CONSENT_CONTENT } from './consent-checkbox'
import { ProtectedImage } from './protected-image'
import { useCurrency } from '@/components/fable/currency-provider'

// Photo type from parent
interface UploadedPhoto {
  preview: string
  file: File
  uploadId?: number
  fileUrl?: string
}

export interface Variation {
  jobId: number
  outputUrl: string
  style: string
  createdAt: string
}

interface UploadCardProps {
  activeTab: TabType
  photos: UploadedPhoto[]
  maxPhotos: number
  onAddPhotos: (photos: { preview: string; file: File }[]) => void
  onRemovePhoto: (index: number) => void
  onGenerate: () => void
  onClearAll: () => void
  onOpenStylePicker: () => void
  selectedStyleName: string | null
  isGenerating?: boolean
  generatedImage?: string | null
  onRetry?: () => void
  onUploadNew?: () => void
  onCustomEdit?: (description: string) => void
  onGenerationComplete?: (generatedImage: string) => void
  remainingCredits?: number
  userEmail?: string
  onUserEmailChange?: (email: string) => void
  petName?: string
  onPetNameChange?: (name: string) => void
  variations?: Variation[]
  onSelectVariation?: (variation: Variation) => void
  selectedStyle?: string | null
  onStyleChange?: (styleId: string) => void
}

// Consent state interface
interface ConsentState {
  photoRights: boolean
  usageRights: boolean
  guardianship: boolean
  kvkk: boolean
}

const TAB_CONTENT: Record<TabType, { title: string; subtitle: string }> = {
  pets: {
    title: 'Upload Photo',
    subtitle: 'Use a well-lit photo',
  },
  family: {
    title: 'Upload one or more photos – siblings and pets welcome.',
    subtitle: 'Each face clearly visible',
  },
  kids: {
    title: 'Upload Photo',
    subtitle: 'Full faces, no cropping',
  },
  couples: {
    title: 'Upload your couple photo',
    subtitle: 'Both faces clearly visible',
  },
  self: {
    title: 'Upload your portrait photo',
    subtitle: 'Clear face, good lighting',
  },
}

const DETAIL_SECTION: Record<TabType, { heading: string; namePlaceholder: string; nameLabel: string }> = {
  pets: {
    heading: 'Tell us more about your pet',
    nameLabel: 'Pet Name',
    namePlaceholder: 'e.g., Max, Luna, Charlie...',
  },
  family: {
    heading: 'Tell us more about your family',
    nameLabel: 'Family Name',
    namePlaceholder: 'e.g., The Johnsons...',
  },
  kids: {
    heading: "Tell us more about your child",
    nameLabel: "Child's Name",
    namePlaceholder: 'e.g., Emma, Liam...',
  },
  couples: {
    heading: 'Tell us more about you two',
    nameLabel: 'Your Names',
    namePlaceholder: 'e.g., Sarah & John...',
  },
  self: {
    heading: 'Tell us more about yourself',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g., Alex, Jordan...',
  },
}

const PORTRAIT_TITLE: Record<TabType, string> = {
  pets: 'Royal Portrait',
  family: 'Family Masterpiece',
  kids: 'Enchanting Portrait',
  couples: 'Timeless Portrait',
  self: 'Renaissance Portrait',
}

// Rotating photo tips that fade in/out
const PHOTO_TIPS = [
  'Full faces, no cropping',
  'Each face clearly visible',
  'Good lighting for everyone',
]

const GENERATION_MESSAGES = [
  'Analyzing your photo...',
  'Understanding composition and features...',
  'Selecting artistic palette...',
  'Painting initial layers...',
  'Building depth and texture...',
  'Blending colors and tones...',
  'Refining brushwork details...',
  'Adding fine highlights...',
  'Perfecting light and shadow...',
  'Applying finishing touches...',
  'Reviewing final quality...',
  'Almost done — polishing your masterpiece...',
]

const OVERTIME_MESSAGES = [
  'Taking a little extra care with the details...',
  'Great art takes time — almost there...',
  'Adding the final brushstrokes...',
  'Your masterpiece is worth the wait...',
]

// Accepted file types
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function UploadCard({
  activeTab,
  photos,
  maxPhotos,
  onAddPhotos,
  onRemovePhoto,
  onGenerate,
  onClearAll,
  onOpenStylePicker,
  selectedStyleName,
  isGenerating = false,
  generatedImage = null,
  onRetry,
  onUploadNew,
  onCustomEdit,
  onGenerationComplete,
  remainingCredits = 5,
  userEmail = '',
  onUserEmailChange,
  petName = '',
  onPetNameChange,
  variations = [],
  onSelectVariation,
  selectedStyle,
  onStyleChange,
}: UploadCardProps) {
  const { formatDollars } = useCurrency()
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(60)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipFading, setTipFading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Consent state
  const [consents, setConsents] = useState<ConsentState>({
    photoRights: false,
    usageRights: false,
    guardianship: false,
    kvkk: false,
  })

  const content = TAB_CONTENT[activeTab]
  const detailContent = DETAIL_SECTION[activeTab]

  // Check if consents are valid based on active tab
  const areConsentsValid = useCallback(() => {
    const baseConsents = consents.photoRights && consents.usageRights
    if (activeTab === 'kids') {
      return baseConsents && consents.guardianship
    }
    return baseConsents
  }, [consents, activeTab])

  // Reset consents when tab changes
  useEffect(() => {
    setConsents({
      photoRights: false,
      usageRights: false,
      guardianship: false,
      kvkk: false,
    })
  }, [activeTab])

  // Rotating tips animation
  useEffect(() => {
    if (photos.length > 0 || isGenerating || generatedImage) return

    const tipInterval = setInterval(() => {
      setTipFading(true)
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % PHOTO_TIPS.length)
        setTipFading(false)
      }, 300)
    }, 2000)

    return () => clearInterval(tipInterval)
  }, [photos.length, isGenerating, generatedImage])

  // Generation progress animation - asymptotic curve, never reaches 100% until done
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setMessageIndex(0)
      setRemainingSeconds(60)
      return
    }

    const startTime = Date.now()
    const baseDuration = 60000 // 60s expected duration

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const t = elapsed / baseDuration

      // Asymptotic ease-out: fast start, slow approach to 95%
      // Never exceeds 95% — final jump to 100% happens on completion
      let newProgress: number
      if (t <= 1) {
        // 0-60s: smooth ease-out curve reaching ~92%
        newProgress = (1 - Math.pow(1 - t, 2.5)) * 92
      } else {
        // >60s: slowly crawl from 92% toward 95%, never exceed
        const overtime = t - 1
        newProgress = 92 + Math.min(3, overtime * 2)
      }
      setProgress(newProgress)

      // Show time estimate only in first 50s, then switch to encouraging text
      const remaining = Math.max(0, Math.ceil((baseDuration - elapsed) / 1000))
      setRemainingSeconds(remaining)
    }, 100)

    // Message progression: advance through messages based on time, don't cycle
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const elapsed = Date.now() - startTime
        if (elapsed > baseDuration) {
          // After 60s, cycle through overtime messages
          const overtimeIdx = Math.floor((elapsed - baseDuration) / 5000) % OVERTIME_MESSAGES.length
          return GENERATION_MESSAGES.length + overtimeIdx
        }
        // During normal time, advance linearly (don't cycle back)
        return Math.min(prev + 1, GENERATION_MESSAGES.length - 1)
      })
    }, 4500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [isGenerating])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setUploadError(null)

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        const errorCode = rejection.errors[0]?.code
        let errorMsg = 'Failed to upload file.'

        if (errorCode === 'file-too-large') {
          errorMsg = 'File too large. Maximum size is 10MB.'
        } else if (errorCode === 'file-invalid-type') {
          errorMsg = 'Invalid file type. Please upload a JPG or PNG image.'
        } else if (errorCode === 'too-many-files') {
          errorMsg = `You can upload up to ${maxPhotos} photos.`
        }

        setUploadError(errorMsg)
        toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' })
        return
      }

      if (acceptedFiles.length === 0) return

      // Read files and create previews
      const newPhotos: { preview: string; file: File }[] = []
      let loaded = 0

      acceptedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newPhotos.push({
            preview: e.target?.result as string,
            file,
          })
          loaded++
          if (loaded === acceptedFiles.length) {
            onAddPhotos(newPhotos)
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [onAddPhotos, maxPhotos]
  )

  const canAddMore = photos.length < maxPhotos
  const isUploadDisabled = !areConsentsValid() || isGenerating || !!generatedImage

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: maxPhotos - photos.length,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploadDisabled,
    noClick: photos.length > 0, // disable click on root when photos exist
    noKeyboard: photos.length > 0,
  })

  // Show generated image with watermark — split-screen layout
  if (generatedImage) {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    const portraitTitle = petName
      ? `${capitalize(petName.trim())}'s ${PORTRAIT_TITLE[activeTab]}`
      : `Your ${PORTRAIT_TITLE[activeTab]}`

    return (
      <>
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
          {/* Left — Preview Image */}
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden bg-card border border-border">
              {/* Edit Button — hidden during regeneration */}
              {!isGenerating && (
                <button
                  onClick={() => setRetryModalOpen(true)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-foreground/80 backdrop-blur-sm rounded-full text-xs sm:text-sm text-background hover:bg-foreground transition-all"
                >
                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Edit ({remainingCredits} left)</span>
                </button>
              )}

              {/* Generated Image — canvas-based to prevent right-click save */}
              <div className="relative aspect-[4/5] select-none">
                <ProtectedImage
                  src={generatedImage}
                  alt="Generated masterpiece preview"
                  className="absolute inset-0"
                  aspectRatio="4/5"
                />
                <div className="absolute inset-0 z-10" />
                {/* Dense watermark overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div
                    className="absolute flex flex-wrap content-start gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3"
                    style={{
                      transform: 'rotate(-30deg) scale(2.2)',
                      transformOrigin: 'center center',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                    }}
                  >
                    {Array.from({ length: 150 }).map((_, i) => (
                      <span
                        key={i}
                        className="text-white/[0.12] text-[10px] sm:text-sm font-bold tracking-[0.15em] whitespace-nowrap uppercase"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
                      >
                        petcanvas create
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regeneration Overlay — shows on top of existing image */}
                {isGenerating && (() => {
                  const regenMsg = messageIndex >= GENERATION_MESSAGES.length
                    ? OVERTIME_MESSAGES[messageIndex - GENERATION_MESSAGES.length] || OVERTIME_MESSAGES[0]
                    : GENERATION_MESSAGES[messageIndex]
                  return (
                    <div className="absolute inset-0 z-30 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="relative w-14 h-14 mb-3">
                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="relative w-full h-full rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <p className="font-serif text-base sm:text-lg italic text-foreground mb-1">Regenerating...</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 text-center px-4">{regenMsg}</p>
                      <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(progress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{Math.round(progress)}%</p>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Variation Thumbnail Strip */}
            {variations.length > 1 && (
              <div className="mt-3">
                <div className="flex justify-center">
                  <div className="flex gap-2 sm:gap-2.5 overflow-x-auto max-w-full pb-1 px-1">
                    {variations.map((variation, idx) => {
                      const isActive = variation.outputUrl === generatedImage
                      return (
                        <button
                          key={variation.jobId}
                          onClick={() => onSelectVariation?.(variation)}
                          className={`relative flex-shrink-0 w-12 h-[60px] sm:w-14 sm:h-[70px] rounded-lg overflow-hidden transition-all duration-200 ${
                            isActive
                              ? 'ring-2 ring-primary scale-105'
                              : 'ring-1 ring-border opacity-60 hover:opacity-100'
                          }`}
                        >
                          <ProtectedImage
                            src={variation.outputUrl}
                            alt={`Variation ${idx + 1}`}
                            className="w-full h-full object-cover"
                            aspectRatio="4/5"
                          />
                          {isActive && (
                            <div className="absolute top-0.5 right-0.5 bg-primary rounded-full p-0.5">
                              <Check className="h-2 w-2 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1.5">
                  {variations.findIndex(v => v.outputUrl === generatedImage) + 1} of {variations.length} variations
                </p>
              </div>
            )}
          </div>

          {/* Right — Info Panel */}
          <div className="flex flex-col justify-center py-2 sm:py-4">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic text-foreground leading-tight mb-6">
              {portraitTitle}
            </h2>

            <div className="space-y-3 mb-6">
              {[
                'High-Resolution, Print-Ready Quality',
                'Instant Digital Download',
                'Museum-Quality Artwork',
                'Perfect for Printing or Framing',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="border-t border-border pt-4 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trusted by 10,000+ customers</p>
              <div className="flex items-center gap-1.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">4.9/5 average rating</p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base sm:text-lg transition-colors mb-3"
            >
              Get Your Portrait Now
            </button>

            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Starting from <span className="font-semibold text-foreground">{formatDollars(29)}</span>
            </p>
          </div>
        </div>

        <RetryOptionsModal
          open={retryModalOpen}
          onOpenChange={setRetryModalOpen}
          onRetry={() => {
            if (onRetry) onRetry()
          }}
          onUploadNew={() => {
            if (onUploadNew) onUploadNew()
          }}
          onCustomEdit={(description) => {
            if (onCustomEdit) onCustomEdit(description)
          }}
          remainingActions={remainingCredits}
          activeTab={activeTab}
          selectedStyle={selectedStyle}
          onStyleChange={onStyleChange}
        />
      </>
    )
  }

  // Show generation progress
  if (isGenerating) {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    const displayName = petName?.trim() ? capitalize(petName.trim()) : null
    const PORTRAIT_LABEL: Record<string, string> = {
      pets: 'Masterpiece',
      family: 'Family Portrait',
      kids: 'Enchanting Portrait',
      couples: 'Timeless Portrait',
      self: 'Renaissance Portrait',
    }
    const label = PORTRAIT_LABEL[activeTab] || 'Masterpiece'
    const personalMessage = displayName
      ? `We are creating ${displayName}'s ${label}...`
      : `We are creating your ${label}...`

    const currentMessage = messageIndex >= GENERATION_MESSAGES.length
      ? OVERTIME_MESSAGES[messageIndex - GENERATION_MESSAGES.length] || OVERTIME_MESSAGES[0]
      : GENERATION_MESSAGES[messageIndex]

    const isOvertime = remainingSeconds <= 0

    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
            {/* Pulsing painting icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-full h-full rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-primary animate-pulse" />
              </div>
            </div>

            <p className="font-serif text-xl sm:text-2xl italic text-foreground mb-2 text-center">
              {personalMessage}
            </p>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 text-center min-h-[24px] transition-opacity duration-500">
              {currentMessage}
            </p>

            {/* Progress bar with glow effect */}
            <div className="w-full max-w-xs mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.round(progress)}%` }}
                />
                {/* Shimmer effect on the bar */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer"
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
                />
              </div>
            </div>

            <p className="text-foreground font-medium text-sm mb-1">{Math.round(progress)}%</p>

            {isOvertime ? (
              <p className="text-primary/80 text-sm animate-pulse">Just a moment longer...</p>
            ) : (
              <p className="text-muted-foreground/70 text-sm">Usually takes about a minute</p>
            )}

            {/* Stay on page notice */}
            <div className="mt-6 flex items-center gap-1.5 text-muted-foreground/50">
              <Lock className="h-3 w-3" />
              <p className="text-[10px] sm:text-xs">Please keep this page open</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Consent Checkboxes */}
      <div className="mb-4 p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="space-y-3">
          <ConsentCheckbox
            id="consent-photo-rights"
            label={CONSENT_CONTENT.photoRights.label}
            checked={consents.photoRights}
            onChange={(checked) => setConsents((prev) => ({ ...prev, photoRights: checked }))}
            learnMoreTitle={CONSENT_CONTENT.photoRights.title}
            learnMoreContent={CONSENT_CONTENT.photoRights.content}
          />
          <ConsentCheckbox
            id="consent-usage-rights"
            label={CONSENT_CONTENT.usageRights.label}
            checked={consents.usageRights}
            onChange={(checked) => setConsents((prev) => ({ ...prev, usageRights: checked }))}
            learnMoreTitle={CONSENT_CONTENT.usageRights.title}
            learnMoreContent={CONSENT_CONTENT.usageRights.content}
          />
          {activeTab === 'kids' && (
            <ConsentCheckbox
              id="consent-guardianship"
              label={CONSENT_CONTENT.guardianship.label}
              checked={consents.guardianship}
              onChange={(checked) => setConsents((prev) => ({ ...prev, guardianship: checked }))}
              learnMoreTitle={CONSENT_CONTENT.guardianship.title}
              learnMoreContent={CONSENT_CONTENT.guardianship.content}
            />
          )}
        </div>
      </div>

      {/* Pet Name & Email Section — shown after consents are accepted */}
      {areConsentsValid() && (
        <div className="mb-4 p-3 sm:p-4 rounded-xl border border-border bg-card">
          <h3 className="font-serif text-sm sm:text-lg italic text-foreground mb-3">
            {detailContent.heading}
          </h3>

          <div className="space-y-3">
            <div>
              <label htmlFor="detail-name" className="text-xs sm:text-sm font-medium text-foreground mb-1 block">
                {detailContent.nameLabel} <span className="text-destructive">*</span>
              </label>
              <Input
                id="detail-name"
                type="text"
                placeholder={detailContent.namePlaceholder}
                value={petName}
                onChange={(e) => onPetNameChange?.(e.target.value)}
                className="bg-background border-border text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <div>
              <label htmlFor="detail-email" className="text-xs sm:text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="detail-email"
                type="email"
                placeholder="your@email.com"
                value={userEmail}
                onChange={(e) => onUserEmailChange?.(e.target.value)}
                className="bg-background border-border text-xs sm:text-sm h-9 sm:h-10"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                We&apos;ll send your masterpiece here. No spam, ever.
              </p>
            </div>

            {/* Honeypot field — hidden from real users, bots fill it */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
              <label htmlFor="hp-name-field">Name</label>
              <input
                id="hp-name-field"
                type="text"
                name="_hp_name"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* KVKK / Privacy consent */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="kvkk-consent"
                checked={consents.kvkk}
                onChange={(e) => setConsents((prev) => ({ ...prev, kvkk: e.target.checked }))}
                className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-border accent-primary"
              />
              <label htmlFor="kvkk-consent" className="text-[10px] sm:text-xs text-muted-foreground leading-tight cursor-pointer">
                I agree to the processing of my personal data in accordance with the{' '}
                <a href="/policies/privacy" className="text-primary underline hover:no-underline">Privacy Policy</a>{' '}
                and <a href="/policies/terms" className="text-primary underline hover:no-underline">Terms of Service</a>.
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border transition-all bg-card
          ${isUploadDisabled ? 'cursor-not-allowed opacity-60' : photos.length === 0 ? 'cursor-pointer hover:border-primary/50' : ''}
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${uploadError ? 'border-destructive/50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Locked overlay when consents not accepted */}
        {!areConsentsValid() && photos.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground px-4">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-[10px] sm:text-xs text-center font-medium">Accept the terms above to upload</p>
            </div>
          </div>
        )}

        {photos.length > 0 ? (
          /* Photo thumbnails + add more + create button */
          <div className="p-4 sm:p-6">
            {/* Header row: "1/5 photos  Clear all" on left, "Pick Style" on right */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {photos.length}/{maxPhotos} photos
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClearAll()
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenStylePicker()
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span>{selectedStyleName || 'Pick Style'}</span>
              </button>
            </div>

            {/* Thumbnails row */}
            <div className="flex gap-3 sm:gap-4 flex-wrap mb-6">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative w-[88px] h-[100px] sm:w-[100px] sm:h-[114px] rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0 group"
                >
                  <Image
                    src={photo.preview}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Remove button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemovePhoto(index)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  {/* Number badge — bottom left */}
                  <div className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold leading-none px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}

              {/* Add more — same size as thumbnails, dashed border */}
              {canAddMore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    open()
                  }}
                  className="w-[88px] h-[100px] sm:w-[100px] sm:h-[114px] rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center transition-colors"
                >
                  <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Create Masterpiece button — green/teal */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onGenerate()
              }}
              className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              size="lg"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Create My Masterpiece
            </Button>
          </div>
        ) : (
          /* Empty state — dropzone */
          <div className="relative flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-8">
            {/* Pick Style — top right */}
            <button
              id="pick-style-btn"
              onClick={(e) => {
                e.stopPropagation()
                onOpenStylePicker()
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isUploadDisabled}
            >
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{selectedStyleName || 'Pick Style'}</span>
            </button>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted border border-border flex items-center justify-center mb-3 sm:mb-4 relative">
              <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                <Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary-foreground" />
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 text-center">{content.title}</h3>

            {/* Error message */}
            {uploadError && (
              <div className="flex items-center gap-1.5 text-destructive mb-2">
                <AlertCircle className="h-3 w-3" />
                <p className="text-xs">{uploadError}</p>
              </div>
            )}

            {/* Rotating tips */}
            {!uploadError && areConsentsValid() && (
              <p
                className={`text-xs sm:text-sm text-primary text-center transition-opacity duration-300 ${
                  tipFading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {PHOTO_TIPS[tipIndex]}
              </p>
            )}

            {/* File info + photo count hint */}
            {areConsentsValid() && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                JPG/PNG only, max 10MB — up to {maxPhotos} photos
              </p>
            )}
          </div>
        )}
      </div>

      {/* Auto-delete notice */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2">
        Uploaded photos are automatically deleted after 24 hours.
      </p>

    </div>
  )
}
