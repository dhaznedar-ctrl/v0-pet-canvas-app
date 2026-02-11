'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { StylePicker } from '@/components/fable/style-picker'
import { STYLE_PROMPTS } from '@/lib/style-prompts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { ArrowRight, ArrowLeft, Palette, Loader2, Info } from 'lucide-react'

export interface CreateFormData {
  file: File | null
  filePreview: string | null
  style: string
  email: string
  acceptedTermsA: boolean
  acceptedTermsB: boolean
  paid: boolean
  orderId: string | null
  jobId: string | null
}

type Step = 'preview' | 'consent' | 'generating'

export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [step, setStep] = useState<Step>('preview')
  const [stylePickerOpen, setStylePickerOpen] = useState(false)

  // Form state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [ownershipConsent, setOwnershipConsent] = useState(false)
  const [usageConsent, setUsageConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const selectedStyleData = selectedStyle ? { id: selectedStyle, name: STYLE_PROMPTS[selectedStyle]?.name || selectedStyle } : null

  useEffect(() => {
    // Load from sessionStorage
    const storedImage = sessionStorage.getItem('fable_upload')
    const storedStyle = sessionStorage.getItem('fable_style')
    const storedTab = sessionStorage.getItem('fable_tab') as TabType | null

    if (storedImage) setUploadedImage(storedImage)
    if (storedStyle) setSelectedStyle(storedStyle)
    if (storedTab) setActiveTab(storedTab)
  }, [])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleContinueToConsent = () => {
    if (!uploadedImage || !selectedStyle) {
      toast({ title: 'Please upload an image and select a style', variant: 'destructive' })
      return
    }
    setStep('consent')
  }

  const handleSubmitConsent = async () => {
    if (!validateEmail(email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' })
      return
    }
    if (!ownershipConsent) {
      toast({ title: 'Please confirm photo ownership', variant: 'destructive' })
      return
    }
    if (!usageConsent) {
      toast({ title: 'Please accept the usage rights terms', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit consent and get auth token
      const consentResponse = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          acceptedTermsA: ownershipConsent,
          acceptedTermsB: usageConsent,
        }),
      })

      if (!consentResponse.ok) {
        throw new Error('Failed to submit consent')
      }

      const consentData = await consentResponse.json()
      const token = consentData.authToken || null
      setAuthToken(token)

      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      // Upload image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          image: uploadedImage,
          consentId: consentData.userId,
        }),
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { uploadId } = await uploadResponse.json()

      // Start generation
      setStep('generating')
      setGenerationProgress(10)

      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          email,
          uploadId,
          style: selectedStyle,
          tab: activeTab,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error('Failed to start generation')
      }

      const { jobId } = await generateResponse.json()

      // Poll for job completion
      let completed = false
      while (!completed) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const statusResponse = await fetch(`/api/jobs/${jobId}`, { headers: authHeaders })
        const jobData = await statusResponse.json()

        if (jobData.status === 'completed') {
          completed = true
          sessionStorage.setItem('fable_result', jobData.outputUrl || '')
          router.push(`/result/${jobId}`)
        } else if (jobData.status === 'failed') {
          throw new Error(jobData.error || 'Generation failed')
        } else {
          setGenerationProgress((prev) => Math.min(prev + 10, 90))
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
      setStep('consent')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {step === 'preview' && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-2">Preview Your Portrait</h1>
                <p className="text-muted-foreground">Review your selection before continuing</p>
              </div>

              {/* Image Preview */}
              {uploadedImage && (
                <div className="relative mb-6">
                  <div className="relative aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-border">
                    <Image src={uploadedImage || "/placeholder.svg"} alt="Your uploaded photo" fill className="object-cover" />
                  </div>

                  {/* Style Badge */}
                  <button
                    onClick={() => setStylePickerOpen(true)}
                    className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-secondary/90 backdrop-blur-sm rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Palette className="h-4 w-4" />
                    {selectedStyleData?.name || 'Pick Style'}
                  </button>
                </div>
              )}

              {/* Continue Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleContinueToConsent}
                  disabled={!uploadedImage || !selectedStyle}
                  className="px-8 py-6 text-base font-semibold rounded-full bg-primary hover:bg-primary/90"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {step === 'consent' && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-2">Almost There!</h1>
                <p className="text-muted-foreground">Just a few more details before we create your masterpiece</p>
              </div>

              {/* Consent Form */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6 space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">{"We'll send your portrait to this email"}</p>
                </div>

                {/* Ownership Consent */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ownership"
                    checked={ownershipConsent}
                    onCheckedChange={(checked) => setOwnershipConsent(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="ownership" className="text-foreground text-sm cursor-pointer">
                      I confirm that I own or have the rights to use this photo
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          <Info className="h-3 w-3" />
                          Learn more
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Photo Ownership</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground text-sm">
                          By checking this box, you confirm that you are the owner of the uploaded photo or have
                          obtained the necessary permissions to use it. This includes photos of your own pets, family
                          members, or photos you have explicit permission to use.
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Usage Rights Consent */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="usage"
                    checked={usageConsent}
                    onCheckedChange={(checked) => setUsageConsent(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="usage" className="text-foreground text-sm cursor-pointer">
                      I understand that Pet Canvas retains usage rights to the generated artwork
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                          <Info className="h-3 w-3" />
                          Learn more
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Usage Rights</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground text-sm">
                          Pet Canvas retains the right to use generated artworks for promotional purposes, including
                          but not limited to website galleries, social media, and marketing materials. Your personal
                          information will never be shared. You retain full rights to use your portrait for personal
                          purposes.
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep('preview')} className="text-muted-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmitConsent}
                  disabled={isSubmitting}
                  className="px-8 py-6 text-base font-semibold rounded-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Generate My Portrait
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'generating' && (
            <div className="text-center py-12">
              <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground mb-4">
                Creating Your Masterpiece...
              </h1>
              <p className="text-muted-foreground mb-8">This usually takes 30-60 seconds</p>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-8">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{generationProgress}% complete</p>
              </div>

              {/* Animated Preview */}
              {uploadedImage && (
                <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden">
                  <Image src={uploadedImage || "/placeholder.svg"} alt="Processing" fill className="object-cover animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Style Picker Sheet */}
      <StylePicker
        open={stylePickerOpen}
        onOpenChange={setStylePickerOpen}
        selectedStyle={selectedStyle}
        onSelectStyle={setSelectedStyle}
      />
    </div>
  )
}
