'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { CreateFormData } from '@/app/create/page'
import Image from 'next/image'
import Link from 'next/link'

interface GenerateStepProps {
  formData: CreateFormData
  updateFormData: (updates: Partial<CreateFormData>) => void
}

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

interface JobData {
  status: JobStatus
  outputUrl?: string
  error?: string
}

export function GenerateStep({ formData, updateFormData }: GenerateStepProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus>('queued')
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  // Start generation job
  const startGeneration = async () => {
    if (!formData.paid) {
      toast({ title: 'Payment required before generating', variant: 'destructive' })
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      // Upload the file first
      const uploadFormData = new FormData()
      if (formData.file) {
        uploadFormData.append('file', formData.file)
      }
      uploadFormData.append('email', formData.email)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || 'Failed to upload file')
      }

      const uploadData = await uploadResponse.json()

      // Start the generation job
      const jobResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          style: formData.style,
          uploadId: uploadData.uploadId,
          orderId: formData.orderId,
        }),
      })

      if (!jobResponse.ok) {
        const data = await jobResponse.json()
        throw new Error(data.error || 'Failed to start generation')
      }

      const jobData = await jobResponse.json()
      updateFormData({ jobId: jobData.jobId })
      setJobStatus('processing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      toast({ title: 'Failed to start generation', variant: 'destructive' })
    } finally {
      setIsStarting(false)
    }
  }

  // Poll for job status
  useEffect(() => {
    if (!formData.jobId || jobStatus === 'completed' || jobStatus === 'failed') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${formData.jobId}`)
        if (!response.ok) return

        const data: JobData = await response.json()
        setJobStatus(data.status)

        if (data.status === 'completed' && data.outputUrl) {
          setOutputUrl(data.outputUrl)
          clearInterval(pollInterval)
        } else if (data.status === 'failed') {
          setError(data.error || 'Generation failed')
          clearInterval(pollInterval)
        }
      } catch {
        // Silently handle polling errors
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [formData.jobId, jobStatus])

  // Auto-start generation when component mounts with paid status
  useEffect(() => {
    if (formData.paid && !formData.jobId && !isStarting) {
      startGeneration()
    }
  }, [formData.paid])

  const handleDownload = () => {
    if (!outputUrl) return
    
    const link = document.createElement('a')
    link.href = outputUrl
    link.download = 'pet-portrait.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRetry = () => {
    setError(null)
    setJobStatus('queued')
    updateFormData({ jobId: null })
    startGeneration()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 md:p-8">
        {/* Processing State */}
        {(jobStatus === 'queued' || jobStatus === 'processing') && !error && (
          <div className="text-center py-12">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Creating Your Portrait
            </h2>
            <p className="text-muted-foreground mb-4">
              Our AI is transforming your pet into a work of art...
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {jobStatus === 'queued' ? 'Queued' : 'Processing'}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Generation Failed
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Success State */}
        {jobStatus === 'completed' && outputUrl && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Your Portrait is Ready!
              </h2>
              <p className="text-muted-foreground">
                Download your AI-generated pet portrait below
              </p>
            </div>

            <div className="relative aspect-square max-w-lg mx-auto rounded-lg overflow-hidden bg-secondary mb-6">
              <Image
                src={outputUrl || "/placeholder.svg"}
                alt="Generated pet portrait"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={handleDownload} size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download Portrait
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent">
                <Link href="/create">Create Another</Link>
              </Button>
            </div>

            <p className="text-center text-muted-foreground text-sm mt-6">
              A copy has also been sent to {formData.email}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
