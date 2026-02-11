'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

const ONBOARDING_KEY = 'petcanvas_onboarding_done'

interface TooltipStep {
  targetId: string
  text: string
}

const STEPS: TooltipStep[] = [
  {
    targetId: 'consent-photo-rights',
    text: 'Start by accepting the terms, then upload a clear photo',
  },
  {
    targetId: 'pick-style-btn',
    text: 'Choose a style or let AI decide the best one',
  },
]

interface OnboardingTooltipsProps {
  enabled: boolean
}

export function OnboardingTooltips({ enabled }: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = not started
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const [visible, setVisible] = useState(false)

  const dismiss = useCallback(() => {
    setCurrentStep(-1)
    setVisible(false)
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {}
  }, [])

  const advance = useCallback(() => {
    const next = currentStep + 1
    if (next >= STEPS.length) {
      dismiss()
    } else {
      setCurrentStep(next)
    }
  }, [currentStep, dismiss])

  // Start onboarding after 1.5s delay
  useEffect(() => {
    if (!enabled) return
    try {
      if (localStorage.getItem(ONBOARDING_KEY)) return
    } catch {
      return
    }

    const timer = setTimeout(() => {
      setCurrentStep(0)
    }, 1500)

    return () => clearTimeout(timer)
  }, [enabled])

  // Position tooltip on target element
  useEffect(() => {
    if (currentStep < 0 || currentStep >= STEPS.length) {
      setVisible(false)
      return
    }

    const step = STEPS[currentStep]
    const el = document.getElementById(step.targetId)
    if (!el) {
      // Target not found, advance
      advance()
      return
    }

    const rect = el.getBoundingClientRect()
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 240),
    })
    setVisible(true)

    // Auto-advance after 5s
    const timer = setTimeout(advance, 5000)
    return () => clearTimeout(timer)
  }, [currentStep, advance])

  if (!visible || !position || currentStep < 0) return null

  return (
    <div
      className="fixed z-50 animate-in fade-in slide-in-from-top-2 duration-300"
      style={{
        top: position.top,
        left: position.left,
        maxWidth: position.width,
      }}
    >
      <div className="relative bg-foreground text-background rounded-lg px-3 py-2 shadow-lg">
        {/* Arrow */}
        <div
          className="absolute -top-1.5 left-4 w-3 h-3 bg-foreground rotate-45"
        />
        <div className="flex items-start gap-2">
          <p className="text-xs leading-relaxed flex-1">{STEPS[currentStep].text}</p>
          <button
            onClick={dismiss}
            className="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] opacity-60">
            {currentStep + 1}/{STEPS.length}
          </span>
          <button
            onClick={dismiss}
            className="text-[10px] opacity-60 hover:opacity-100 transition-opacity"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
