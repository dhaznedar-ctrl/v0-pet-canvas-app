'use client'

import { useState } from 'react'
import { RefreshCw, Upload, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface RetryOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
  onUploadNew: () => void
  onCustomEdit: (description: string) => void
  remainingActions?: number
}

const QUICK_SUGGESTIONS = [
  'Make it more royal',
  'Add a crown',
  'Change the background',
  'More dramatic lighting',
  'Add gold accents',
]

export function RetryOptionsModal({
  open,
  onOpenChange,
  onRetry,
  onUploadNew,
  onCustomEdit,
  remainingActions = 2,
}: RetryOptionsModalProps) {
  const [customDescription, setCustomDescription] = useState('')

  const handleCustomSubmit = () => {
    if (customDescription.trim()) {
      onCustomEdit(customDescription)
      setCustomDescription('')
      onOpenChange(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCustomDescription((prev) => {
      if (prev.trim()) return `${prev}, ${suggestion.toLowerCase()}`
      return suggestion
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[420px] sm:max-w-lg bg-card border-border p-4 sm:p-6 overflow-hidden">
        {/* Top actions: Retry + Upload New */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            onClick={() => {
              onRetry()
              onOpenChange(false)
            }}
            className="flex items-center gap-1.5 h-auto py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Retry</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onUploadNew()
              onOpenChange(false)
            }}
            className="flex items-center gap-1.5 h-auto py-2.5 bg-secondary hover:bg-secondary/80 text-xs sm:text-sm"
          >
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Upload New</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-[10px] sm:text-sm text-muted-foreground">or make edits</span>
          </div>
        </div>

        {/* Edit Your Masterpiece Section */}
        <div className="pt-1">
          <DialogHeader className="text-left mb-3">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Edit Your Masterpiece
            </DialogTitle>
            <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
              Describe what changes you&apos;d like to make to your portrait. Our AI will regenerate it with your instructions.
            </p>
            <p className="text-[11px] sm:text-sm text-primary font-medium mt-1">
              {remainingActions} {remainingActions === 1 ? 'edit' : 'edits'} remaining
            </p>
          </DialogHeader>

          {/* Instructions textarea */}
          <div className="mb-3">
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1.5">Your Instructions</p>
            <Textarea
              placeholder="E.g., Make the background darker, add more gold details, change the pose..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="min-h-20 sm:min-h-28 bg-background border-primary/30 focus:border-primary text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Quick suggestions */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Quick suggestions</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border bg-background text-[10px] sm:text-xs text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-border text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomSubmit}
              disabled={!customDescription.trim() || remainingActions <= 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
            >
              Regenerate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
