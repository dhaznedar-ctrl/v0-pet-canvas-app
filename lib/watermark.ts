import 'server-only'
import sharp from 'sharp'

/**
 * Adds a tiled "PETCANVAS" watermark across the entire image.
 * Even grid with no overlaps — each text sits in its own cell.
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  const w = metadata.width || 1024
  const h = metadata.height || 1024

  // Font size: ~1/12 of shorter dimension (smaller than before to avoid crowding)
  const fontSize = Math.round(Math.min(w, h) / 12)
  // "PETCANVAS" is roughly 9 chars wide — estimate text width
  const textWidth = Math.round(fontSize * 5.5)
  // Grid spacing: enough room so texts never overlap
  const colGap = textWidth + Math.round(fontSize * 2)
  const rowGap = Math.round(fontSize * 3)

  // Cover the full rotated bounding box
  const diagonal = Math.ceil(Math.sqrt(w * w + h * h))
  const cols = Math.ceil(diagonal / colGap) + 2
  const rows = Math.ceil(diagonal / rowGap) + 2
  const startX = -Math.round(diagonal * 0.25)
  const startY = -Math.round(diagonal * 0.25)

  let textElements = ''

  for (let row = 0; row < rows; row++) {
    // Stagger every other row by half a column for a brick pattern
    const stagger = row % 2 === 0 ? 0 : Math.round(colGap / 2)
    for (let col = 0; col < cols; col++) {
      const x = col * colGap + stagger + startX
      const y = row * rowGap + startY

      // Single combined layer: white text with slight opacity
      textElements += `<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="800" fill="rgba(255,255,255,0.22)" letter-spacing="${Math.round(fontSize * 0.1)}">PETCANVAS</text>\n`
    }
  }

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-30, ${Math.round(w / 2)}, ${Math.round(h / 2)})">
      ${textElements}
    </g>
  </svg>`

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer()
}
