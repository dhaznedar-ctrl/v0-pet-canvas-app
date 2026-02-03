'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Info, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { CreateFormData } from '@/app/create/page'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ConsentStepProps {
  formData: CreateFormData
  updateFormData: (updates: Partial<CreateFormData>) => void
  onNext: () => void
  onBack: () => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ConsentStep({ formData, updateFormData, onNext, onBack }: ConsentStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ email: e.target.value })
  }

  const handleTermsAChange = (checked: boolean) => {
    updateFormData({ acceptedTermsA: checked })
  }

  const handleTermsBChange = (checked: boolean) => {
    updateFormData({ acceptedTermsB: checked })
  }

  const validateForm = () => {
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' })
      return false
    }
    if (!formData.acceptedTermsA) {
      toast({ title: 'Please confirm photo ownership', description: 'You must confirm that you own or have rights to use the uploaded photo.', variant: 'destructive' })
      return false
    }
    if (!formData.acceptedTermsB) {
      toast({ title: 'Please accept the usage rights terms', variant: 'destructive' })
      return false
    }
    return true
  }

  const handleContinue = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Save consent and user data to the server
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          acceptedTermsA: formData.acceptedTermsA,
          acceptedTermsB: formData.acceptedTermsB,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save consent')
      }

      onNext()
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Your Details & Consent
        </h2>
        <p className="text-muted-foreground mb-6">
          Please provide your email and accept the terms to proceed
        </p>

        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleEmailChange}
              className="mt-2 bg-secondary border-border"
            />
            <p className="text-muted-foreground text-sm mt-1">
              We will send your portrait to this email
            </p>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium text-foreground">Required Agreements</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="termsA"
                checked={formData.acceptedTermsA}
                onCheckedChange={handleTermsAChange}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="termsA" className="text-foreground cursor-pointer">
                    Photo Ownership
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>By checking this box, you confirm that you either own the uploaded photo or have obtained permission from the owner to use it for AI portrait generation.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  I confirm that I own or have the right to use the uploaded photo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="termsB"
                checked={formData.acceptedTermsB}
                onCheckedChange={handleTermsBChange}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="termsB" className="text-foreground cursor-pointer">
                    Usage Rights
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Pet Canvas retains the right to use generated images for promotional purposes, portfolio display, and service improvement. You receive full personal use rights to your generated portrait.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  I understand that Pet Canvas retains usage rights to the generated artwork.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="bg-transparent"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!formData.email || !formData.acceptedTermsA || !formData.acceptedTermsB || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
