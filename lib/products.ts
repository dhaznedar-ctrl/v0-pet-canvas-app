export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  currency: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'pet-portrait-digital',
    name: 'Digital Pet Portrait',
    description: 'HD AI-generated artistic portrait of your pet — instant download',
    priceInCents: 2900, // $29
    currency: 'usd',
  },
  {
    id: 'family-portrait-digital',
    name: 'Digital Family Portrait',
    description: 'HD AI-generated family portrait — instant download',
    priceInCents: 2900, // $29
    currency: 'usd',
  },
  {
    id: 'kids-portrait-digital',
    name: 'Digital Kids Portrait',
    description: 'HD AI-generated kids portrait — instant download',
    priceInCents: 2900, // $29
    currency: 'usd',
  },
  {
    id: 'couples-portrait-digital',
    name: 'Digital Couple Portrait',
    description: 'HD AI-generated couple portrait — instant download',
    priceInCents: 2900, // $29
    currency: 'usd',
  },
  {
    id: 'self-portrait-digital',
    name: 'Digital Self-Portrait',
    description: 'HD AI-generated self-portrait — instant download',
    priceInCents: 2900, // $29
    currency: 'usd',
  },
  {
    id: 'credit-pack-10',
    name: '10 Generation Credits',
    description: '10 AI portrait generations — no daily limit, never expires',
    priceInCents: 3900, // $39
    currency: 'usd',
  },
  {
    id: 'poster-print',
    name: 'Poster Print',
    description: 'Museum-quality archival paper print with optional frame (12×18" to 24×36")',
    priceInCents: 4500, // base $45 — actual price depends on size + frame
    currency: 'usd',
  },
  {
    id: 'canvas-print',
    name: 'Stretched Canvas',
    description: 'Gallery-wrapped canvas with professional quality — ready to hang (12×18" to 24×36")',
    priceInCents: 8500, // base $85 — actual price depends on size + frame
    currency: 'usd',
  },
]

// Re-export styles as array for components that iterate
import { STYLE_PROMPTS } from '@/lib/style-prompts'
export const STYLES = Object.entries(STYLE_PROMPTS).map(([id, config]) => ({
  id,
  ...config,
}))
