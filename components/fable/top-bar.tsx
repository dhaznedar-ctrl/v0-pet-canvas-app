'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, PawPrint, Gift, Truck, Star, Users, Baby, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NavigationDrawer } from './navigation-drawer'

export type TabType = 'pets' | 'family' | 'kids'

interface TopBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Valentine's Special Banner */}
      <div className="bg-gradient-to-r from-[#8b5a7c] via-[#a0607a] to-[#8b5a7c] text-white py-1.5 px-2 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Gift className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span>{"Valentine's Special (Pets + Humans)"}</span>
          <Link href="/create" className="font-bold underline hover:no-underline">
            Try Now
          </Link>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-card text-foreground py-1 px-2 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-sm whitespace-nowrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-foreground flex-shrink-0" />
            <span>Free Shipping on Prints</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Rated 4.8</span>
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-foreground text-foreground" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-2 sm:px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex flex-col flex-shrink-0">
            <span className="text-lg sm:text-xl font-serif italic text-foreground leading-none">Fable</span>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground tracking-widest uppercase">by Pet Canvas</span>
          </Link>

          {/* Pill Tab Bar - Centered */}
          <div className="flex items-center bg-muted rounded-full p-0.5 sm:p-1">
            <button
              onClick={() => onTabChange('pets')}
              className={cn(
                'flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-sm font-medium rounded-full transition-all',
                activeTab === 'pets'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PawPrint className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Pets</span>
            </button>
            <button
              onClick={() => onTabChange('family')}
              className={cn(
                'flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-sm font-medium rounded-full transition-all',
                activeTab === 'family'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 hidden xs:block" />
              <span>Family</span>
            </button>
            <button
              onClick={() => onTabChange('kids')}
              className={cn(
                'flex items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-sm font-medium rounded-full transition-all',
                activeTab === 'kids'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Baby className="h-3 w-3 sm:h-4 sm:w-4 hidden xs:block" />
              <span>Kids</span>
              <span className="px-0.5 sm:px-1 py-0.5 text-[7px] sm:text-[10px] font-bold bg-amber-500 text-white rounded">
                New
              </span>
            </button>
          </div>

          {/* Mobile/Menu Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-secondary h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            onClick={() => setDrawerOpen(true)}
          >
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </header>

      <NavigationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
