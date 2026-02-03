export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'pet-portrait-standard',
    name: 'Pet Portrait Generation',
    description: 'AI-generated artistic portrait of your pet',
    priceInCents: 999, // $9.99
  },
]

export const STYLES = [
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, dreamy watercolor painting style',
    prompt: 'Transform this pet photo into a beautiful watercolor painting with soft edges, flowing colors, and artistic brush strokes. Keep the pet recognizable but give it an artistic, painterly quality.',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classic, rich oil painting aesthetic',
    prompt: 'Transform this pet photo into a classical oil painting style portrait. Use rich, vibrant colors, visible brush strokes, and dramatic lighting reminiscent of Renaissance pet portraits.',
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    description: 'Bold, vibrant pop art style',
    prompt: 'Transform this pet photo into a bold pop art style image inspired by Andy Warhol. Use bright, contrasting colors, bold outlines, and a graphic, poster-like aesthetic.',
  },
]
