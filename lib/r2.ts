import 'server-only'
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

/**
 * Upload a file buffer to R2 and return the public URL
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return `${PUBLIC_URL}/${key}`
}

/**
 * Delete a single object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

/**
 * Delete multiple objects from R2
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  // S3 DeleteObjects supports max 1000 keys per request
  const batches: string[][] = []
  for (let i = 0; i < keys.length; i += 1000) {
    batches.push(keys.slice(i, i + 1000))
  }

  for (const batch of batches) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
        },
      })
    )
  }
}

/**
 * Generate a unique key for uploaded files
 */
export function generateUploadKey(userId: number, filename: string): string {
  const ext = filename.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `uploads/${userId}/${timestamp}-${random}.${ext}`
}

/**
 * Generate a unique key for generated output images
 */
export function generateOutputKey(jobId: number): string {
  const timestamp = Date.now()
  return `outputs/${jobId}/${timestamp}.png`
}

/**
 * Extract the R2 key from a full public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL)) return null
  return url.replace(`${PUBLIC_URL}/`, '')
}

/**
 * Check if an object exists in R2
 */
export async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

/**
 * Generate a presigned download URL for HD images (expires in 15 minutes by default)
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}
