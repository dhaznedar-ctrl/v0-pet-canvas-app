'use client'

import { useState } from 'react'
import { X, RefreshCw, Upload, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface RetryOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
  onUploadNew: () => void
  onEditMasculine: () => void
  onEditFeminine: () => void
  onCustomEdit: (description: string) => void
  remainingActions?: number
}

export function RetryOptionsModal({
  open,
  onOpenChange,
  onRetry,
  onUploadNew,
  onEditMasculine,
  onEditFeminine,
  onCustomEdit,
  remainingActions = 5,
}: RetryOptionsModalProps) {
  const [customDescription, setCustomDescription] = useState('')
  const [showCustomEdit, setShowCustomEdit] = useState(false)

  const handleCustomSubmit = () => {
    if (customDescription.trim()) {
      onCustomEdit(customDescription)
      setCustomDescription('')
      setShowCustomEdit(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[340px] sm:max-w-md bg-card border-border p-3 sm:p-6 overflow-hidden">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-xl font-semibold text-foreground">Retry Options</DialogTitle>
          <p className="text-[11px] sm:text-sm text-muted-foreground">
            {remainingActions} remaining · Each action uses 1
          </p>
        </DialogHeader>

        <div className="space-y-2.5 sm:space-y-4 pt-2 sm:pt-4">
          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                onRetry()
                onOpenChange(false)
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-2.5 sm:py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-xs sm:text-base">Retry</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onUploadNew()
                onOpenChange(false)
              }}
              className="flex flex-col items-center gap-0.5 sm:gap-2 h-auto py-2.5 sm:py-4 bg-secondary hover:bg-secondary/80"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-center">
                <span className="font-medium text-xs sm:text-base block">Upload New</span>
                <span className="text-[9px] sm:text-xs text-muted-foreground">Best for likeness</span>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative py-1 sm:py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-[10px] sm:text-sm text-muted-foreground">or make edits</span>
            </div>
          </div>

          {/* Edit Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onEditMasculine()
                onOpenChange(false)
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-2.5 sm:py-4 border-border bg-transparent"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10.5" cy="10.5" r="7.5" />
                <path d="M21 3l-5.5 5.5M21 3h-5M21 3v5" />
              </svg>
              <span className="font-medium text-xs sm:text-base">Masculine</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onEditFeminine()
                onOpenChange(false)
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-2.5 sm:py-4 border-border bg-transparent"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6" />
                <path d="M12 14v7M9 18h6" />
              </svg>
              <span className="font-medium text-xs sm:text-base">Feminine</span>
            </Button>
          </div>

          {/* Custom Edit */}
          {!showCustomEdit ? (
            <Button
              variant="outline"
              onClick={() => setShowCustomEdit(true)}
              className="w-full flex items-center gap-2 h-auto py-2.5 sm:py-4 border-border justify-start bg-transparent overflow-hidden"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="font-medium text-xs sm:text-base block truncate">Describe your own edit</span>
                <span className="text-[10px] sm:text-sm text-muted-foreground block truncate">Change colors, remove items, etc.</span>
              </div>
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Describe the changes you want..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="min-h-16 sm:min-h-24 bg-secondary border-border text-xs sm:text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomEdit(false)}
                  className="flex-1 bg-transparent text-xs sm:text-sm py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customDescription.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-xs sm:text-sm py-2"
                >
                  Apply Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
