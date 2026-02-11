'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TopBar, type TabType } from '@/components/fable/top-bar'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { ProtectedImage } from '@/components/fable/protected-image'

interface JobResult {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  error?: string
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [activeTab, setActiveTab] = useState<TabType>('pets')
  const [job, setJob] = useState<JobResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()
        setJob(data)

        if (data.status === 'queued' || data.status === 'processing') {
          // Poll again after delay
          setTimeout(fetchJob, 2000)
        } else {
          setIsLoading(false)
          if (data.status === 'completed' && data.outputUrl) {
            sessionStorage.setItem('fable_result', data.outputUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleRetry = () => {
    router.push('/create')
  }

  const handleContinueToFormat = () => {
    router.push(`/format?jobId=${jobId}`)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-foreground mb-2">
              {isLoading ? 'Creating Your Masterpiece...' : job?.status === 'completed' ? 'Your Masterpiece is Ready!' : 'Something went wrong'}
            </h1>
            {isLoading && (
              <p className="text-muted-foreground">This usually takes 30-60 seconds</p>
            )}
          </div>

          {/* Result Image or Loading State */}
          <div className="flex justify-center mb-8">
            {isLoading ? (
              <div className="w-full max-w-2xl aspect-[3/4] rounded-2xl bg-card/50 border border-border flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {job?.status === 'queued' ? 'Waiting in queue...' : 'Generating your portrait...'}
                </p>
              </div>
            ) : job?.status === 'completed' && job.outputUrl ? (
              <div className="relative w-full max-w-2xl select-none">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                  {/* Canvas-based image rendering to prevent right-click save */}
                  <ProtectedImage
                    src={job.outputUrl}
                    alt="Your masterpiece"
                    className="w-full"
                    aspectRatio="3/4"
                  />
                  {/* CSS watermark overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    <div
                      className="absolute inset-0 flex flex-wrap content-start gap-x-6 gap-y-4 sm:gap-x-10 sm:gap-y-6 p-2"
                      style={{ transform: 'rotate(-35deg) scale(1.8)', transformOrigin: 'center center' }}
                    >
                      {Array.from({ length: 60 }).map((_, i) => (
                        <span
                          key={i}
                          className="text-white/15 text-base sm:text-xl md:text-2xl font-black tracking-[0.2em] whitespace-nowrap uppercase"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        >
                          PETCANVAS
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Free Preview Badge */}
                <div className="absolute -top-3 left-4 z-30">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Free Preview
                  </span>
                </div>

                {/* Retry/Edit Button */}
                <button
                  onClick={handleRetry}
                  className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-full text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry or Edit
                </button>

                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3">
                  This is a watermarked preview. Purchase to download the full-resolution version.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-2xl aspect-[3/4] rounded-2xl bg-card/50 border border-border flex flex-col items-center justify-center p-8">
                <p className="text-destructive mb-4">{job?.error || 'Failed to generate portrait'}</p>
                <Button onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Continue Button */}
          {!isLoading && job?.status === 'completed' && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleContinueToFormat}
                className="px-8 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90"
              >
                Continue to Download Options
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
