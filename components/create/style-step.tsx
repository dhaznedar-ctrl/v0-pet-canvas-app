'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STYLES } from '@/lib/products'
import type { CreateFormData } from '@/app/create/page'
import { cn } from '@/lib/utils'
import { Palette } from 'lucide-react'

const STYLE_IMAGES: Record<string, string> = {
  watercolor: '/samples/watercolor.jpg',
  'oil-painting': '/samples/oil-painting.jpg',
  'pop-art': '/samples/pop-art.jpg',
}

interface StyleStepProps {
  formData: CreateFormData
  updateFormData: (updates: Partial<CreateFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StyleStep({ formData, updateFormData, onNext, onBack }: StyleStepProps) {
  const handleStyleSelect = (styleId: string) => {
    updateFormData({ style: styleId })
  }

  const handleContinue = () => {
    if (!formData.style) {
      toast({ title: 'Please select a style', variant: 'destructive' })
      return
    }
    onNext()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Choose Your Art Style
        </h2>
        <p className="text-muted-foreground mb-6">
          Select the artistic style for your pet portrait
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleStyleSelect(style.id)}
              className={cn(
                'relative p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50',
                formData.style === style.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-secondary'
              )}
            >
              {formData.style === style.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className="w-full aspect-square relative mb-4 rounded-lg overflow-hidden">
                <Image
                  src={STYLE_IMAGES[style.id] || "/placeholder.svg"}
                  alt={`${style.name} style example`}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{style.name}</h3>
              <p className="text-muted-foreground text-sm">{style.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!formData.style}
            size="lg"
          >
            Continue to Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
