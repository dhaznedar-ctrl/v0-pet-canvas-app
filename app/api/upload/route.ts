import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const EXPIRY_HOURS = 24

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimit.resetAt 
        },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null

    if (!file || !email) {
      return NextResponse.json(
        { error: 'Missing file or email' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG and PNG are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Get user
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    const userId = users[0].id

    // Generate unique file key
    const fileKey = `uploads/${userId}/${Date.now()}-${file.name}`
    
    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000)

    // Convert file to base64 for storage
    // In production, upload to S3/R2 instead
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Store upload record in database
    const result = await sql`
      INSERT INTO uploads (user_id, file_key, mime, size, expires_at)
      VALUES (${userId}, ${dataUrl}, ${file.type}, ${file.size}, ${expiresAt.toISOString()})
      RETURNING id
    `

    return NextResponse.json({
      uploadId: result[0].id,
      fileKey,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
