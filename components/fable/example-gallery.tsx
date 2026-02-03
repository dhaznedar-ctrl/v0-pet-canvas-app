'use client'

import Image from 'next/image'
import type { TabType } from './top-bar'

interface ExampleGalleryProps {
  activeTab: TabType
}

// Customer example images
const FAMILY_IMG_1 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-valentine.BzyjY4Xf-iTGpdXOL7xdqD3HTU7r8uMjycuHyVB.png'
const FAMILY_IMG_2 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-1.DelWVwG0-AUB10YyXFOF3rctTFwuylhsNWk69t9.jpg'
const FAMILY_IMG_3 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-fable-2.nTPZjp-m-p8Esfgn9bSRvE3CxDsSBNWjSPSmV0n.jpg'
const KIDS_IMG_1 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fable-kids-1.jpg-DWGbglBjg4pL8Xip7Ajk3C1PsUuOps.png'
const KIDS_IMG_2 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fable-kids-2.jpg-M86Vd8b3qEY6FuARIq0UzS3ZyXfhq9.png'
const KIDS_IMG_3 = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fable-kids-3.jpg-QIHlhDt4nOaoGMvitJ1SNzf5im3JKl.png'

const GALLERY_IMAGES = {
  pets: [
    '/images/1761061991787-fable-by-surrealium-example-1.jpg',
    '/images/1761061998281-fable-by-surrealium-example-2.jpg',
    '/images/1761061991787-fable-by-surrealium-example-1-20-281-29.jpg',
  ],
  family: [FAMILY_IMG_1, FAMILY_IMG_2, FAMILY_IMG_3],
  kids: [KIDS_IMG_1, KIDS_IMG_2, KIDS_IMG_3],
}

export function ExampleGallery({ activeTab }: ExampleGalleryProps) {
  const images = GALLERY_IMAGES[activeTab]
  // Show only 2 images on mobile
  const displayImages = images.slice(0, 2)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Show 2 images on mobile, 3 on larger screens */}
      {displayImages.map((src, index) => (
        <div
          key={`${activeTab}-${index}`}
          className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden shadow-lg shadow-black/20"
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={`Example portrait ${index + 1}`}
            fill
            className="object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      ))}
      {/* Third image only on larger screens */}
      <div
        className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg shadow-black/20 hidden sm:block"
      >
        <Image
          src={images[2] || "/placeholder.svg"}
          alt="Example portrait 3"
          fill
          className="object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
    </div>
  )
}
