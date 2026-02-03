'use client'

import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'

export interface StyleOption {
  id: string
  name: string
  description: string
  thumbnail: string
  colors: string[]
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'intelligent',
    name: 'Intelligent',
    description: 'Let AI choose the perfect style based on your photos',
    thumbnail: '',
    colors: [],
  },
  {
    id: 'baroque-red',
    name: 'Baroque Red',
    description: 'Classic royal portrait with rich velvet drapes and golden baroque frames',
    thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-valentine.BzyjY4Xf-iTGpdXOL7xdqD3HTU7r8uMjycuHyVB.png',
    colors: ['#DC143C', '#DAA520', '#808080', '#2F2F2F', '#C9B896'],
  },
  {
    id: 'florentine',
    name: 'Florentine Renaissance',
    description: 'Timeless elegance with refined brushwork and classical composition',
    thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-1.DelWVwG0-AUB10YyXFOF3rctTFwuylhsNWk69t9.jpg',
    colors: ['#8B4513', '#DAA520', '#2F2F2F', '#C9B896', '#87CEEB'],
  },
  {
    id: 'casati',
    name: 'Casati',
    description: 'Theatrical art-deco flair with exotic companions and bold accents',
    thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-2.nTPZjp-m-p8Esfgn9bSRvE3CxDsSBNWjSPSmV0n.jpg',
    colors: ['#87CEEB', '#2F2F2F', '#DC143C', '#DAA520', '#228B22'],
  },
  {
    id: 'tweed',
    name: 'Tweed',
    description: 'Baroque aristocratic style with velvet and ermine, romantic lighting',
    thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fable-kids-1.jpg-DWGbglBjg4pL8Xip7Ajk3C1PsUuOps.png',
    colors: ['#87CEEB', '#DAA520', '#DC143C', '#4169E1', '#C9B896'],
  },
  {
    id: 'storm',
    name: 'Storm',
    description: 'Dramatic serpentine motifs with mythological elegance',
    thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fable-kids-2.jpg-M86Vd8b3qEY6FuARIq0UzS3ZyXfhq9.png',
    colors: ['#8B4513', '#228B22', '#808080', '#2F2F2F', '#DAA520'],
  },
]

interface StylePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStyle: string | null
  onSelectStyle: (styleId: string) => void
  activeTab?: 'pets' | 'family' | 'kids'
}

export function StylePicker({ open, onOpenChange, selectedStyle, onSelectStyle, activeTab = 'pets' }: StylePickerProps) {
  const tabLabel = activeTab === 'pets' ? 'pet' : activeTab === 'family' ? 'family' : 'kids'
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] bg-[#0d0c0a] border-[#2a2520] p-0">
        <SheetHeader className="px-6 py-4 border-b border-[#2a2520]">
          <SheetTitle className="text-left text-white font-semibold">Choose Your Style</SheetTitle>
          <SheetDescription className="text-left text-[#a09080]">
            Select an artistic style for your {tabLabel} portrait
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 px-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onSelectStyle(style.id)
                onOpenChange(false)
              }}
              className={cn(
                'w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left',
                'hover:bg-[#1a1815]',
                selectedStyle === style.id && 'bg-[#1a1815] ring-2 ring-[#2dd4bf]',
                style.id === 'intelligent' && 'border border-[#2dd4bf]/50 bg-[#1a1815]'
              )}
            >
              {/* Thumbnail or AI Icon */}
              {style.id === 'intelligent' ? (
                <div className="w-16 h-16 rounded-lg bg-[#2dd4bf]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-[#2dd4bf]" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={style.thumbnail || "/placeholder.svg"}
                    alt={style.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{style.name}</h3>
                  {selectedStyle === style.id && (
                    <Check className="h-4 w-4 text-[#2dd4bf]" />
                  )}
                </div>
                <p className="text-sm text-[#a09080] mb-2 line-clamp-2">{style.description}</p>
                {style.colors.length > 0 && (
                  <div className="flex gap-1.5">
                    {style.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-[#3a3530]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
