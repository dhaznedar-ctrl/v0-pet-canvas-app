'use client'

import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Plus, Palette, X, RefreshCw, PawPrint, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { TabType } from './top-bar'
import { RetryOptionsModal } from './retry-options-modal'
import { ConsentCheckbox, CONSENT_CONTENT } from './consent-checkbox'

interface UploadCardProps {
  activeTab: TabType
  uploadedImage: string | null
  onImageUpload: (image: string, file: File) => void
  onClearImage: () => void
  onOpenStylePicker: () => void
  selectedStyleName: string | null
  isGenerating?: boolean
  generatedImage?: string | null
  onRetry?: () => void
  onGenerationComplete?: (generatedImage: string) => void
}

// Consent state interface
interface ConsentState {
  photoRights: boolean
  usageRights: boolean
  guardianship: boolean
}

const TAB_CONTENT = {
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
}

// Rotating photo tips that fade in/out
const PHOTO_TIPS = [
  'Full faces, no cropping',
  'Each face clearly visible',
  'Good lighting for everyone',
]

const GENERATION_MESSAGES = [
  'Analyzing your photo...',
  'Applying the Pet Canvas Art style...',
  'Painting initial layers...',
  'Building depth and texture...',
  'Refining brushwork...',
  'Adding fine details...',
  'Perfecting the masterpiece...',
  'Final touches...',
]

// Accepted file types
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function UploadCard({
  activeTab,
  uploadedImage,
  onImageUpload,
  onClearImage,
  onOpenStylePicker,
  selectedStyleName,
  isGenerating = false,
  generatedImage = null,
  onRetry,
  onGenerationComplete,
}: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
  })
  
  const content = TAB_CONTENT[activeTab]

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
    })
  }, [activeTab])

  // Rotating tips animation - change every second with fade
  useEffect(() => {
    if (uploadedImage || isGenerating || generatedImage) return
    
    const tipInterval = setInterval(() => {
      setTipFading(true)
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % PHOTO_TIPS.length)
        setTipFading(false)
      }, 300)
    }, 2000)

    return () => clearInterval(tipInterval)
  }, [uploadedImage, isGenerating, generatedImage])

  // Generation progress animation - 60 seconds total
  useEffect(() => {
    if (!isGenerating || !uploadedImage) {
      setProgress(0)
      setMessageIndex(0)
      setRemainingSeconds(60)
      return
    }

    const startTime = Date.now()
    const totalDuration = 60000 // 60 seconds

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)
      
      const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000))
      setRemainingSeconds(remaining)
      
      if (elapsed >= totalDuration) {
        clearInterval(progressInterval)
        if (onGenerationComplete && uploadedImage) {
          onGenerationComplete(uploadedImage)
        }
      }
    }, 100)

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % GENERATION_MESSAGES.length)
    }, 7000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [isGenerating, uploadedImage, onGenerationComplete])

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      return 'Invalid file type. Please upload a JPG or PNG image.'
    }
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }
    return null
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: Array<{ file: File; errors: Array<{ code: string; message: string }> }>) => {
      setUploadError(null)

      // Handle rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        const errorCode = rejection.errors[0]?.code
        let errorMsg = 'Failed to upload file.'
        
        if (errorCode === 'file-too-large') {
          errorMsg = 'File too large. Maximum size is 10MB.'
        } else if (errorCode === 'file-invalid-type') {
          errorMsg = 'Invalid file type. Please upload a JPG or PNG image.'
        }
        
        setUploadError(errorMsg)
        toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' })
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      // Additional validation
      const validationError = validateFile(file)
      if (validationError) {
        setUploadError(validationError)
        toast({ title: 'Upload Error', description: validationError, variant: 'destructive' })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const reader = new FileReader()
      reader.onload = (e) => {
        clearInterval(progressInterval)
        setUploadProgress(100)
        const result = e.target?.result as string
        
        setTimeout(() => {
          onImageUpload(result, file)
          setIsUploading(false)
          setUploadProgress(0)
        }, 200)
      }
      reader.onerror = () => {
        clearInterval(progressInterval)
        setIsUploading(false)
        setUploadProgress(0)
        const errorMsg = 'Error reading file. Please try again.'
        setUploadError(errorMsg)
        toast({ title: 'Upload Error', description: errorMsg, variant: 'destructive' })
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload]
  )

  const isUploadDisabled = !areConsentsValid() || isUploading || isGenerating || !!generatedImage

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploadDisabled,
  })

  // Show generated image with watermark
  if (generatedImage) {
    return (
      <>
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Free Preview Badge */}
          <div className="absolute -top-3 left-4 z-20">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Free Preview
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-card border border-border">
            {/* Retry or Edit Button */}
            <button
              onClick={() => setRetryModalOpen(true)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-secondary/80 backdrop-blur-sm rounded-md text-xs sm:text-sm text-foreground hover:bg-secondary transition-all"
            >
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Retry or Edit</span>
            </button>

            {/* Generated Image - NOT clickable, NOT downloadable */}
            <div 
              className="relative aspect-[3/4] select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Image
                src={generatedImage || "/placeholder.svg"}
                alt="Generated masterpiece preview"
                fill
                className="object-cover pointer-events-none"
                draggable={false}
              />
              {/* Single Watermark Overlay - diagonal repeating pattern */}
              <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 80px,
                    rgba(255,255,255,0.08) 80px,
                    rgba(255,255,255,0.08) 82px
                  )`,
                }}
              >
                <div 
                  className="absolute inset-0 flex flex-wrap items-center justify-center content-center gap-x-16 gap-y-12 p-4"
                  style={{ transform: 'rotate(-25deg) scale(1.5)' }}
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span 
                      key={i} 
                      className="text-white/20 text-[10px] sm:text-xs font-bold tracking-widest whitespace-nowrap uppercase"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      PET CANVAS PREVIEW
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Watermark notice */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3">
            This is a watermarked preview. Purchase to download the full-resolution version.
          </p>
        </div>

        {/* Retry Options Modal */}
        <RetryOptionsModal
          open={retryModalOpen}
          onOpenChange={setRetryModalOpen}
          onRetry={() => {
            if (onRetry) onRetry()
          }}
          onUploadNew={() => {
            if (onRetry) onRetry()
          }}
          onEditMasculine={() => {
            // TODO: Gemini API integration for masculine edit
            console.log('Edit: Masculine')
          }}
          onEditFeminine={() => {
            // TODO: Gemini API integration for feminine edit
            console.log('Edit: Feminine')
          }}
          onCustomEdit={(description) => {
            // TODO: Gemini API integration for custom edit
            console.log('Custom edit:', description)
          }}
        />
      </>
    )
  }

  // Show generation progress when generating
  if (isGenerating) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-8">
            <p className="text-foreground text-base sm:text-lg font-medium mb-6 sm:mb-8 text-center">
              {GENERATION_MESSAGES[messageIndex]}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-foreground transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-muted-foreground text-sm mb-1">{Math.round(progress)}%</p>
            <p className="text-muted-foreground/70 text-sm">~{remainingSeconds} seconds remaining</p>
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

      {/* Upload Card */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-xl border transition-all bg-secondary
          ${isUploadDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary/50'}
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
          ${uploadError ? 'border-destructive/50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Locked overlay when consents not accepted - positioned inside the upload box only */}
        {!areConsentsValid() && !uploadedImage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground px-4">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              <p className="text-[10px] sm:text-xs text-center font-medium">Accept the terms above to upload</p>
            </div>
          </div>
        )}

        {/* Pick Style Button - inside card, top right */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenStylePicker()
          }}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          disabled={isUploadDisabled}
        >
          <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{selectedStyleName || 'Pick Style'}</span>
        </button>

        {uploadedImage ? (
          <div className="relative aspect-[21/9]">
            <Image src={uploadedImage || "/placeholder.svg"} alt="Uploaded preview" fill className="object-cover" />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-14 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation()
                onClearImage()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            {/* Replace photo label */}
            <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-xs text-foreground">Click to replace photo</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted border border-border flex items-center justify-center mb-3 sm:mb-4 relative">
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                    <Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary-foreground" />
                  </div>
                </>
              )}
            </div>
            
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 text-center">{content.title}</h3>
            
            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="w-full max-w-xs mb-2">
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* Error message */}
            {uploadError && !isUploading && (
              <div className="flex items-center gap-1.5 text-destructive mb-2">
                <AlertCircle className="h-3 w-3" />
                <p className="text-xs">{uploadError}</p>
              </div>
            )}

            {/* Rotating tips with fade animation - hide when locked */}
            {!isUploading && !uploadError && areConsentsValid() && (
              <p 
                className={`text-xs sm:text-sm text-primary text-center transition-opacity duration-300 ${
                  tipFading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {PHOTO_TIPS[tipIndex]}
              </p>
            )}

            {/* File type hint - hide when locked */}
            {areConsentsValid() && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                JPG/PNG only, max 10MB
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
