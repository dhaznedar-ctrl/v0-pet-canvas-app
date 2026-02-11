import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { uploadToR2, generateUploadKey } from '@/lib/r2'
import { getAuthUser, getRequestIP } from '@/lib/api-auth'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { verifyTurnstile } from '@/lib/turnstile'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']
const EXPIRY_HOURS = 24

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Rate limit
    const rateLimit = await checkRateLimit(ip, '/api/upload')
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', resetAt: rateLimit.resetAt },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null
    const honeypot = formData.get('_hp_name') as string | null
    const turnstileToken = formData.get('turnstileToken') as string | null

    // Honeypot check
    if (honeypot && honeypot.length > 0) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/upload' })
      return NextResponse.json({ uploadId: 0, fileUrl: '', fileKey: '', expiresAt: '' })
    }

    // Turnstile verification
    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/upload' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    if (!file || !email) {
      return NextResponse.json({ error: 'Missing file or email' }, { status: 400 })
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG and PNG are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Prefer auth token, fall back to email lookup
    const authUser = getAuthUser(request)
    let userId: number

    if (authUser) {
      userId = authUser.userId
    } else {
      // Email fallback only for guest users — real emails require auth token
      if (!email.startsWith('guest-')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      const users = await sql`SELECT id FROM users WHERE email = ${email}`
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      userId = users[0].id
    }

    // Upload to R2
    const fileKey = generateUploadKey(userId, file.name)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileUrl = await uploadToR2(fileKey, buffer, file.type)

    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000)

    const result = await sql`
      INSERT INTO uploads (user_id, file_key, mime, size, expires_at)
      VALUES (${userId}, ${fileKey}, ${file.type}, ${file.size}, ${expiresAt.toISOString()})
      RETURNING id
    `

    return NextResponse.json({
      uploadId: result[0].id,
      fileUrl,
      fileKey,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
