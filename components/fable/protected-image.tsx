'use client'

import { useRef, useEffect } from 'react'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
}

/**
 * Renders an image using a <canvas> element to prevent right-click "Save Image As".
 * Falls back to CSS background-image if canvas fails.
 */
export function ProtectedImage({ src, alt, className = '', aspectRatio = '4/5' }: ProtectedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !src) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio || 1)
      canvas.height = rect.height * (window.devicePixelRatio || 1)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

      // Cover fit
      const containerAspect = rect.width / rect.height
      const imageAspect = img.width / img.height

      let drawWidth: number, drawHeight: number, drawX: number, drawY: number

      if (imageAspect > containerAspect) {
        drawHeight = rect.height
        drawWidth = rect.height * imageAspect
        drawX = (rect.width - drawWidth) / 2
        drawY = 0
      } else {
        drawWidth = rect.width
        drawHeight = rect.width / imageAspect
        drawX = 0
        drawY = (rect.height - drawHeight) / 2
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    }

    img.onerror = () => {
      // Fall back to background-image
      if (container) {
        container.style.backgroundImage = `url(${src})`
        container.style.backgroundSize = 'cover'
        container.style.backgroundPosition = 'center'
      }
    }

    img.src = src
  }, [src])

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ aspectRatio }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      role="img"
      aria-label={alt}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
