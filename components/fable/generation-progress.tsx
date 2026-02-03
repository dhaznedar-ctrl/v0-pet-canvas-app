'use client'

import { useEffect, useState } from 'react'

const GENERATION_MESSAGES = [
  'Analyzing your photo...',
  'Preparing the canvas...',
  'Applying artistic style...',
  'Building depth and texture...',
  'Adding fine details...',
  'Perfecting the masterpiece...',
  'Final touches...',
]

interface GenerationProgressProps {
  isGenerating: boolean
  onComplete: () => void
}

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(60)

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setMessageIndex(0)
      setRemainingSeconds(60)
      return
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 1
      })
    }, 60) // ~6 seconds total

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % GENERATION_MESSAGES.length)
    }, 1500)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearInterval(countdownInterval)
    }
  }, [isGenerating, onComplete])

  if (!isGenerating) return null

  return (
    <div className="absolute inset-0 bg-[#0d0c0a] flex flex-col items-center justify-center z-20 rounded-xl">
      <p className="text-foreground text-lg mb-6">{GENERATION_MESSAGES[messageIndex]}</p>
      
      {/* Progress Bar */}
      <div className="w-64 h-1 bg-border/30 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-foreground/80 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-muted-foreground text-sm mb-1">{progress}%</p>
      <p className="text-muted-foreground/70 text-sm">~{remainingSeconds} seconds remaining</p>
    </div>
  )
}
