'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Info } from 'lucide-react'

interface ConsentCheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  learnMoreTitle: string
  learnMoreContent: string
}

export function ConsentCheckbox({
  id,
  label,
  checked,
  onChange,
  learnMoreTitle,
  learnMoreContent,
}: ConsentCheckboxProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-start gap-2 sm:gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onChange(value === true)}
          className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={id}
            className="text-xs sm:text-sm text-foreground cursor-pointer leading-tight block"
          >
            {label}
          </label>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-[10px] sm:text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            <Info className="h-3 w-3" />
            Learn more
          </button>
        </div>
      </div>

      {/* Learn More Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg text-foreground">{learnMoreTitle}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
            {learnMoreContent}
          </DialogDescription>
          <div className="pt-4">
            <Button
              onClick={() => setModalOpen(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Consent content definitions
export const CONSENT_CONTENT = {
  photoRights: {
    label: 'I confirm that I own or have the rights to use the uploaded photo.',
    title: 'Photo Rights',
    content: `By checking this box, you confirm that:

• You are the original photographer or owner of the photo
• You have obtained permission from all individuals pictured
• The photo does not infringe on any third-party copyrights
• You have the legal right to use this photo for artistic transformation

This confirmation is required to ensure we respect intellectual property rights and privacy of all individuals.`,
  },
  usageRights: {
    label: 'I understand and accept that the generated artwork usage rights belong to Pet Canvas.',
    title: 'Artwork Usage Rights',
    content: `By checking this box, you understand and agree that:

• Pet Canvas retains certain usage rights to the generated artwork
• We may use the generated artwork for promotional purposes
• You receive a personal license to use the artwork for personal, non-commercial purposes
• Commercial use of the artwork requires additional licensing

For more details, please review our full Terms of Service.`,
  },
  guardianship: {
    label: 'I confirm that I am the legal guardian of the child in the uploaded photo.',
    title: 'Guardian Confirmation',
    content: `By checking this box, you confirm that:

• You are the legal parent or guardian of the child/children in the photo
• You have the legal authority to consent on behalf of the child
• You understand that children's photos will be processed to create artwork
• You agree to our privacy policy regarding the handling of children's images

This confirmation is required to comply with child protection regulations and ensure the safety of minors.`,
  },
}
