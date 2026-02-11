import 'server-only'
import sharp from 'sharp'
import { buildGenerationRequest, STYLE_PROMPTS } from '@/lib/style-prompts'
import { uploadToR2 } from '@/lib/r2'
import { addWatermark } from '@/lib/watermark'

const MAX_FILE_BYTES = 2 * 1024 * 1024 // 2 MB target

const FAL_KEY = process.env.FAL_KEY!
const FAL_API = 'https://queue.fal.run'

export interface GenerateOptions {
  fileUrls: string[]
  style: string
  jobId: number
  editPrompt?: string
}


export interface GenerateResult {
  success: boolean
  previewUrl?: string   // Watermarked preview (shown to user)
  hdUrl?: string        // Original HD (only after payment)
  error?: string
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 3000

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function falSubmit(modelPath: string, body: Record<string, unknown>) {
  const res = await fetch(`${FAL_API}/${modelPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fal.ai ${res.status}: ${errText}`)
  }

  return res.json()
}

async function falFetchUrl(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { Authorization: `Key ${FAL_KEY}` },
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fal.ai ${res.status}: ${errText}`)
  }

  return res.json()
}

export async function generateImage(options: GenerateOptions): Promise<GenerateResult> {
  const { fileUrls, style, jobId, editPrompt } = options

  // DEV mode: skip fal.ai entirely, return uploaded image as result
  if (process.env.DEV_SKIP_AI === 'true') {
    console.log(`[Job ${jobId}] DEV_SKIP_AI: skipping fal.ai, returning input image`)
    return { success: true, previewUrl: fileUrls[0], hdUrl: fileUrls[0] }
  }

  const styleConfig = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS]
  if (!styleConfig) {
    return { success: false, error: `Unknown style: ${style}` }
  }

  // Use first image for buildGenerationRequest, then override image_urls with all
  const genRequest = buildGenerationRequest(style, fileUrls[0])
  const modelPath = genRequest.model

  // Append user's edit instructions to the prompt if provided
  if (editPrompt) {
    genRequest.input.prompt = `${genRequest.input.prompt}\n\nAdditional edit instructions: ${editPrompt}`
  }
  let lastError = ''

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Job ${jobId}] Retry attempt ${attempt}`)
        await delay(RETRY_DELAY_MS * attempt)
      }

      // Submit to Fal.ai queue
      console.log(`[Job ${jobId}] Submitting to ${modelPath}...`)
      const params: Record<string, unknown> = {
        ...genRequest.input,
        image_urls: fileUrls,
        safety_tolerance: '6',
      }

      const submitResult = await falSubmit(modelPath, params)

      console.log(`[Job ${jobId}] Response keys: ${Object.keys(submitResult).join(', ')}`)

      // Check for sync response (images returned directly)
      const syncImages = submitResult.images as { url: string }[] | undefined
      if (syncImages && syncImages.length > 0) {
        console.log(`[Job ${jobId}] Sync response — got image directly`)
        return await downloadAndStore(syncImages[0].url, jobId, style)
      }

      // Queue response — use the URLs Fal.ai gives us (they strip sub-paths!)
      const requestId = submitResult.request_id as string
      const statusUrl = submitResult.status_url as string
      const responseUrl = submitResult.response_url as string

      if (!requestId || !statusUrl) {
        lastError = 'No request_id or status_url in queue response'
        console.error(`[Job ${jobId}] Unexpected response:`, JSON.stringify(submitResult).slice(0, 500))
        continue
      }

      console.log(`[Job ${jobId}] Queued: ${requestId}`)
      console.log(`[Job ${jobId}] Status URL: ${statusUrl}`)
      console.log(`[Job ${jobId}] Response URL: ${responseUrl}`)

      // Poll for completion using the exact URLs from Fal.ai
      let pollAttempts = 0
      const maxPollAttempts = 120

      while (pollAttempts < maxPollAttempts) {
        await delay(2000)
        pollAttempts++

        try {
          const status = await falFetchUrl(statusUrl) as { status: string }

          if (status.status === 'COMPLETED') {
            console.log(`[Job ${jobId}] Completed! Fetching result...`)
            try {
              const result = await falFetchUrl(responseUrl)
              const images = result.images as { url: string }[] | undefined

              if (images && images.length > 0) {
                console.log(`[Job ${jobId}] Got image URL, downloading...`)
                return await downloadAndStore(images[0].url, jobId, style)
              }
              lastError = 'No images in completed result'
              console.error(`[Job ${jobId}] Result keys: ${Object.keys(result).join(', ')}`)
            } catch (resultErr) {
              lastError = resultErr instanceof Error ? resultErr.message : 'Failed to fetch result'
              console.error(`[Job ${jobId}] Result fetch error:`, lastError)
            }
            break // Don't retry COMPLETED — result won't change
          } else if (status.status === 'FAILED') {
            lastError = 'Fal.ai generation failed'
            console.error(`[Job ${jobId}] Fal.ai FAILED`)
            break
          }

          if (pollAttempts % 10 === 0) {
            console.log(`[Job ${jobId}] Still ${status.status} (poll #${pollAttempts})`)
          }
        } catch (pollErr) {
          console.error(`[Job ${jobId}] Poll error:`, pollErr instanceof Error ? pollErr.message : pollErr)
        }
      }

      if (pollAttempts >= maxPollAttempts) {
        lastError = 'Generation timed out'
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown Fal.ai error'
      console.error(`[Job ${jobId}] Attempt ${attempt} failed:`, lastError)
    }
  }

  console.error(`[Job ${jobId}] Failed permanently after ${MAX_RETRIES + 1} attempts: ${lastError}`)
  return { success: false, error: 'We could not generate your portrait right now. Please try again in a few minutes.' }
}

async function compressToTarget(buffer: Buffer, targetBytes: number): Promise<Buffer> {
  // If already under target, return as-is
  if (buffer.length <= targetBytes) return buffer

  // Try JPEG at decreasing quality until under target
  for (const quality of [92, 85, 78, 70, 60]) {
    const compressed = await sharp(buffer)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
    if (compressed.length <= targetBytes) return compressed
  }

  // Last resort: resize down + low quality
  const meta = await sharp(buffer).metadata()
  const scale = 0.75
  const compressed = await sharp(buffer)
    .resize(Math.round((meta.width || 1024) * scale), Math.round((meta.height || 1024) * scale))
    .jpeg({ quality: 60, mozjpeg: true })
    .toBuffer()
  return compressed
}

// SSRF protection: whitelist of allowed image hosts from fal.ai
const ALLOWED_IMAGE_HOSTS = [
  'fal.media',
  'v3.fal.media',
  'fal.run',
  'storage.googleapis.com',
]

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_IMAGE_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  } catch {
    return false
  }
}

const PREVIEW_MAX_PX = 1024

async function downloadAndStore(imageUrl: string, jobId: number, style?: string): Promise<GenerateResult> {
  // SSRF check: only allow whitelisted image hosts
  if (!isAllowedImageUrl(imageUrl)) {
    console.error(`[Job ${jobId}] SSRF blocked: ${imageUrl}`)
    return { success: false, error: 'Invalid image source' }
  }

  console.log(`[Job ${jobId}] Downloading generated image...`)
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    return { success: false, error: `Failed to download generated image: ${imageResponse.status}` }
  }

  const rawBuffer = Buffer.from(await imageResponse.arrayBuffer())
  console.log(`[Job ${jobId}] Downloaded ${(rawBuffer.length / 1024 / 1024).toFixed(1)} MB`)

  // Compress to ~2 MB for storage
  const imageBuffer = await compressToTarget(rawBuffer, MAX_FILE_BYTES)
  const isJpeg = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8
  const ext = isJpeg ? 'jpg' : 'png'
  const mime = isJpeg ? 'image/jpeg' : 'image/png'
  console.log(`[Job ${jobId}] Compressed to ${(imageBuffer.length / 1024 / 1024).toFixed(1)} MB (${ext})`)

  // Store original HD version (never exposed until payment)
  const hdKey = `outputs/hd-${jobId}.${ext}`
  const hdUrl = await uploadToR2(hdKey, imageBuffer, mime)
  console.log(`[Job ${jobId}] HD stored in R2`)

  // Create watermarked preview — non-fatal if it fails
  // Resize preview to max 1024px before watermarking
  let previewUrl: string
  try {
    const previewMeta = await sharp(imageBuffer).metadata()
    const previewWidth = previewMeta.width || 1024
    const previewHeight = previewMeta.height || 1024
    let resizedBuffer = imageBuffer
    if (previewWidth > PREVIEW_MAX_PX || previewHeight > PREVIEW_MAX_PX) {
      resizedBuffer = await sharp(imageBuffer)
        .resize(PREVIEW_MAX_PX, PREVIEW_MAX_PX, { fit: 'inside', withoutEnlargement: true })
        .toBuffer()
      console.log(`[Job ${jobId}] Preview resized to max ${PREVIEW_MAX_PX}px`)
    }
    const watermarkedBuffer = await addWatermark(resizedBuffer)
    // Compress preview too
    const previewCompressed = await compressToTarget(watermarkedBuffer, MAX_FILE_BYTES)
    const prevIsJpeg = previewCompressed[0] === 0xFF && previewCompressed[1] === 0xD8
    const prevExt = prevIsJpeg ? 'jpg' : 'png'
    const prevMime = prevIsJpeg ? 'image/jpeg' : 'image/png'
    const previewKey = `outputs/preview-${jobId}.${prevExt}`
    previewUrl = await uploadToR2(previewKey, previewCompressed, prevMime)
    console.log(`[Job ${jobId}] Watermarked preview stored (${(previewCompressed.length / 1024 / 1024).toFixed(1)} MB)`)
  } catch (wmError) {
    console.error(`[Job ${jobId}] Watermark failed, using resized version as preview:`, wmError)
    // Even if watermark fails, store the resized version (not the HD version)
    const fallbackKey = `outputs/preview-${jobId}.jpg`
    const resizedFallback = await sharp(imageBuffer)
      .resize(PREVIEW_MAX_PX, PREVIEW_MAX_PX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    previewUrl = await uploadToR2(fallbackKey, resizedFallback, 'image/jpeg')
  }

  // Auto-save style thumbnail if one doesn't exist yet (fire-and-forget)
  if (style) {
    autoSaveStyleThumbnail(style, imageBuffer, jobId).catch(() => {})
  }

  console.log(`[Job ${jobId}] Done!`)
  return { success: true, previewUrl, hdUrl }
}

const THUMBNAIL_MAX_PX = 384
const THUMBNAIL_TARGET_BYTES = 100 * 1024 // 100 KB max

/**
 * Auto-generate a style thumbnail from every completed generation.
 * Always overwrites the previous thumbnail so the gallery stays fresh.
 * Compresses to ~70-100 KB target size.
 * Non-fatal: errors are logged but never propagated.
 */
export async function autoSaveStyleThumbnail(
  style: string,
  imageBuffer: Buffer,
  jobId: number
): Promise<void> {
  try {
    const thumbKey = `thumbnails/${style}.jpg`

    // Resize to 384px square cover crop, then compress to target
    let thumbBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_MAX_PX, THUMBNAIL_MAX_PX, { fit: 'cover' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()

    // If still over target, reduce quality progressively
    if (thumbBuffer.length > THUMBNAIL_TARGET_BYTES) {
      for (const quality of [75, 65, 55]) {
        thumbBuffer = await sharp(imageBuffer)
          .resize(THUMBNAIL_MAX_PX, THUMBNAIL_MAX_PX, { fit: 'cover' })
          .jpeg({ quality, mozjpeg: true })
          .toBuffer()
        if (thumbBuffer.length <= THUMBNAIL_TARGET_BYTES) break
      }
    }

    await uploadToR2(thumbKey, thumbBuffer, 'image/jpeg')
    console.log(`[Job ${jobId}] Auto-saved style thumbnail for "${style}" (${(thumbBuffer.length / 1024).toFixed(0)} KB)`)
  } catch (err) {
    console.warn(`[Job ${jobId}] Failed to auto-save thumbnail:`, err)
  }
}
