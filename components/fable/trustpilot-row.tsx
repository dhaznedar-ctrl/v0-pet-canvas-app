'use client'

import { Star } from 'lucide-react'
import type { TabType } from './top-bar'

interface TrustpilotRowProps {
  activeTab: TabType
}

const TAB_STATS: Record<TabType, string> = {
  pets: 'Trusted by 10,000+ Pet Owners',
  family: 'Trusted by 5,000+ Families',
  kids: 'Trusted by 3,000+ Parents',
  couples: 'Trusted by 5,000+ Couples',
  self: 'Trusted by 8,000+ Customers',
}

export function TrustpilotRow({ activeTab }: TrustpilotRowProps) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm font-medium text-foreground">Excellent</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-[#00b67a] flex items-center justify-center">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white fill-white" />
            </div>
          ))}
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">Trustpilot</span>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">{TAB_STATS[activeTab]}</p>
    </div>
  )
}
