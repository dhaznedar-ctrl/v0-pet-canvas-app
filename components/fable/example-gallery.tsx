'use client'

import Image from 'next/image'
import type { TabType } from './top-bar'

interface ExampleGalleryProps {
  activeTab: TabType
}

const GALLERY_IMAGES: Record<TabType, string[]> = {
  pets: [
    '/images/1761061991787-fable-by-surrealium-example-1.jpg',
    '/images/1761061998281-fable-by-surrealium-example-2.jpg',
    '/samples/horse-masterpiece.jpg',
  ],
  family: [
    '/images/family/family-1.png',
    '/images/family/family-2.jpg',
    '/images/family/family-3.jpg',
  ],
  kids: [
    '/images/kids/kids-1.png',
    '/images/kids/kids-2.png',
    '/images/kids/kids-3.png',
  ],
  couples: [
    '/images/couples/couple-1.jpg',
    '/images/couples/couple-2.jpg',
    '/images/couples/couple-1.jpg',
  ],
  self: [
    '/images/self-portrait/self-1.jpg',
    '/images/self-portrait/self-2.jpg',
    '/samples/self-portrait.jpg',
  ],
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
