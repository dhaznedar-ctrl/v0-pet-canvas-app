'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'
import { STYLE_PROMPTS, type TabCategory } from '@/lib/style-prompts'

interface StylePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStyle: string | null
  onSelectStyle: (styleId: string) => void
  activeTab?: TabCategory
}

const TAB_LABELS: Record<TabCategory, string> = {
  pets: 'pet',
  family: 'family',
  kids: 'kids',
  couples: 'couple',
  self: 'self',
}

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

/** Tries R2 auto-generated thumbnail → static thumbnail → color palette fallback */
export function StyleThumbnail({ id, name, thumbnail, colors, size = 64 }: { id: string; name: string; thumbnail?: string; colors: string[]; size?: number }) {
  const [r2Failed, setR2Failed] = useState(false)
  const [staticFailed, setStaticFailed] = useState(false)

  // 1. Try R2 auto-generated thumbnail first
  const r2Src = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/thumbnails/${id}.jpg` : ''
  if (r2Src && !r2Failed) {
    return (
      <img
        src={r2Src}
        alt={name}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setR2Failed(true)}
      />
    )
  }

  // 2. Fallback to static thumbnail from config
  if (thumbnail && !staticFailed) {
    return (
      <Image
        src={thumbnail}
        alt={name}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setStaticFailed(true)}
      />
    )
  }

  // 3. Fallback: color palette
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-0.5 p-2">
        {colors.slice(0, 6).map((color, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}

export function StylePicker({ open, onOpenChange, selectedStyle, onSelectStyle, activeTab = 'pets' }: StylePickerProps) {
  const tabLabel = TAB_LABELS[activeTab] || 'pet'

  // Get themes for the current tab: "intelligent" first, then tab-specific themes
  const themes = Object.entries(STYLE_PROMPTS)
    .filter(([, config]) => config.tabs.includes(activeTab))
    .map(([id, config]) => ({ id, ...config }))

  // Sort: intelligent first
  themes.sort((a, b) => {
    if (a.id === 'intelligent') return -1
    if (b.id === 'intelligent') return 1
    return 0
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl p-0 max-h-[85vh]">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-left text-foreground font-semibold">Choose Your Style</SheetTitle>
          <SheetDescription className="text-left text-muted-foreground">
            Select an artistic style for your {tabLabel} portrait
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 px-4 space-y-2 overflow-y-auto max-h-[calc(85vh-120px)]">
          {themes.map((theme) => {
            const isIntelligent = theme.id === 'intelligent'
            const isSelected = selectedStyle === theme.id || (!selectedStyle && isIntelligent)

            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectStyle(theme.id)
                  onOpenChange(false)
                }}
                className={cn(
                  'w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left',
                  'hover:bg-secondary/60',
                  isSelected && 'bg-secondary ring-2 ring-emerald-500'
                )}
              >
                {/* Thumbnail or Intelligent icon */}
                <div className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center',
                  isIntelligent ? 'bg-emerald-500/10' : 'bg-secondary'
                )}>
                  {isIntelligent ? (
                    <Sparkles className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <StyleThumbnail
                      id={theme.id}
                      name={theme.name}
                      thumbnail={theme.thumbnail}
                      colors={theme.colors}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{theme.name}</h3>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{theme.description}</p>
                  {!isIntelligent && theme.colors.length > 0 && (
                    <div className="flex gap-1.5">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
