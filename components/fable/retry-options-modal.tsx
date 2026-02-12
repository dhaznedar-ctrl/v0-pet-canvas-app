'use client'

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Upload, Sparkles, Palette, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useEmblaCarousel from 'embla-carousel-react'
import { STYLE_PROMPTS, type TabCategory } from '@/lib/style-prompts'
import { StyleThumbnail } from './style-picker'

interface RetryOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
  onUploadNew: () => void
  onCustomEdit: (description: string) => void
  remainingActions?: number
  activeTab?: TabCategory
  selectedStyle?: string | null
  onStyleChange?: (styleId: string) => void
}

const QUICK_SUGGESTIONS = [
  'More royal',
  'Add crown',
  'Change bg',
  'Dramatic light',
  'Gold accents',
]

export function RetryOptionsModal({
  open,
  onOpenChange,
  onRetry,
  onUploadNew,
  onCustomEdit,
  remainingActions = 2,
  activeTab = 'pets',
  selectedStyle,
  onStyleChange,
}: RetryOptionsModalProps) {
  const [customDescription, setCustomDescription] = useState('')
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 3, containScroll: 'trimSnaps' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedSnap, setSelectedSnap] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedSnap(emblaApi.selectedScrollSnap())
    setSnapCount(emblaApi.scrollSnapList().length)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

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

  // Get themes for the current tab
  const themes = Object.entries(STYLE_PROMPTS)
    .filter(([, config]) => config.tabs.includes(activeTab))
    .map(([id, config]) => ({ id, ...config }))
    .sort((a, b) => {
      if (a.id === 'intelligent') return -1
      if (b.id === 'intelligent') return 1
      return 0
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[88vw] max-w-[400px] sm:max-w-[420px] bg-card border-border p-3 sm:p-4 gap-0 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Style Picker — paginated carousel */}
        {onStyleChange && themes.length > 0 && (
          <div className="mb-2 min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Palette className="h-2.5 w-2.5" />
              Pick a Style
            </p>
            <div className="relative">
              {/* Left arrow */}
              {canScrollPrev && (
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center bg-gradient-to-r from-card via-card/80 to-transparent"
                >
                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              {/* Right arrow */}
              {canScrollNext && (
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center bg-gradient-to-l from-card via-card/80 to-transparent"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              )}

              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {themes.map((theme) => {
                    const isIntelligent = theme.id === 'intelligent'
                    const isSelected = selectedStyle === theme.id || (!selectedStyle && isIntelligent)
                    return (
                      <div key={theme.id} className="flex-[0_0_33.333%] min-w-0 px-1">
                        <button
                          onClick={() => onStyleChange(theme.id)}
                          className="w-full flex flex-col items-center gap-px"
                        >
                          <div className={`relative w-full aspect-square rounded-md overflow-hidden flex items-center justify-center transition-all ${
                            isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-border opacity-50 hover:opacity-100'
                          } ${isIntelligent ? 'bg-emerald-500/10' : 'bg-secondary'}`}>
                            {isIntelligent ? (
                              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <StyleThumbnail
                                id={theme.id}
                                name={theme.name}
                                thumbnail={theme.thumbnail}
                                colors={theme.colors}
                                size={52}
                              />
                            )}
                            {isSelected && (
                              <div className="absolute top-px right-px bg-primary rounded-full p-px">
                                <Check className="h-1.5 w-1.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <span className={`text-[8px] leading-tight text-center w-full truncate ${
                            isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {theme.name}
                          </span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Dot indicators */}
              {snapCount > 1 && (
                <div className="flex justify-center gap-1 mt-1.5">
                  {Array.from({ length: snapCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => emblaApi?.scrollTo(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === selectedSnap ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Retry + Upload New */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 min-w-0">
          <Button
            size="sm"
            onClick={() => {
              onRetry()
              onOpenChange(false)
            }}
            disabled={remainingActions <= 0}
            className="flex items-center gap-1 h-7 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Retry ({remainingActions} left)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onUploadNew()
              onOpenChange(false)
            }}
            className="flex items-center gap-1 h-7 text-xs"
          >
            <Upload className="h-3 w-3" />
            Upload New
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-1 min-w-0">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-[9px] text-muted-foreground">or make edits</span>
          </div>
        </div>

        {/* Edit Section */}
        <div className="pt-0.5 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <DialogHeader className="text-left space-y-0 p-0">
              <DialogTitle className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Edit Your Masterpiece
              </DialogTitle>
            </DialogHeader>
            <span className="text-[9px] sm:text-[10px] text-primary font-medium whitespace-nowrap">
              {remainingActions} {remainingActions === 1 ? 'edit' : 'edits'} left
            </span>
          </div>

          <Textarea
            placeholder="E.g., Make the background darker..."
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            className="min-h-12 sm:min-h-14 bg-background border-primary/30 focus:border-primary text-xs resize-none mb-1.5"
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1 mb-2 w-full overflow-hidden">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-0.5 rounded-full border border-border bg-background text-[9px] text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-border text-[11px] h-7 px-2.5"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCustomSubmit}
              disabled={!customDescription.trim() || remainingActions <= 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] h-7 px-2.5"
            >
              Regenerate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
