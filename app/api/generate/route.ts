import { NextRequest, NextResponse } from 'next/server'
import { sql, hashIP } from '@/lib/db'
import { STYLE_PROMPTS, resolveStyle, type TabCategory } from '@/lib/style-prompts'
import { generateImage, autoSaveStyleThumbnail } from '@/lib/ai-provider'
import { sendGenerationComplete } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthUser, getRequestIP } from '@/lib/api-auth'
import { generateSchema, validateWithHoneypot } from '@/lib/validation'
import { isIPBlocked, logSecurityEvent } from '@/lib/security'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIP(request)
    const ipHash = hashIP(ip)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()

    // Zod validation + honeypot
    const validation = validateWithHoneypot(generateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (validation.isBot) {
      await logSecurityEvent('honeypot_triggered', ipHash, null, { endpoint: '/api/generate' })
      return NextResponse.json({ jobId: 0, status: 'queued' })
    }

    const { email, style: rawStyle, uploadIds, uploadId, orderId, editPrompt, tab, turnstileToken, fingerprint } = validation.data

    // Turnstile verification
    const turnstileResult = await verifyTurnstile(turnstileToken, ip)
    if (!turnstileResult.success) {
      await logSecurityEvent('turnstile_fail', ipHash, null, { endpoint: '/api/generate' })
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    // Support both single uploadId and array uploadIds
    const ids: number[] = uploadIds || (uploadId ? [uploadId] : [])

    // Resolve "intelligent" to the tab's default style
    const style = resolveStyle(rawStyle || 'intelligent', tab as TabCategory)

    if (!email || !style || ids.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prefer auth token for user identification, fall back to email
    const authUser = getAuthUser(request)
    let userId: number
    let userCredits: number

    if (authUser) {
      userId = authUser.userId
      const creditCheck = await sql`SELECT credits FROM users WHERE id = ${userId}`
      userCredits = creditCheck.length > 0 ? (creditCheck[0].credits || 0) : 0
    } else {
      // Email fallback only for guest users — real emails require auth token
      if (!email.startsWith('guest-')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      const users = await sql`SELECT id, credits FROM users WHERE email = ${email}`
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      userId = users[0].id
      userCredits = users[0].credits || 0
    }

    // Concurrent generation limit (skipped in development)
    if (process.env.NODE_ENV !== 'development') {
      // Auto-fail stale jobs older than 10 minutes
      await sql`
        UPDATE jobs
        SET status = 'failed', error = 'Timed out', updated_at = NOW()
        WHERE status IN ('queued', 'processing')
          AND created_at < NOW() - INTERVAL '10 minutes'
      `

      // Global concurrent job limit — prevents distributed bot attacks from unlimited Fal.ai spend
      const MAX_GLOBAL_ACTIVE_JOBS = 10
      const globalActiveJobs = await sql`
        SELECT COUNT(*)::int AS count FROM jobs
        WHERE status IN ('queued', 'processing')
          AND created_at >= NOW() - INTERVAL '10 minutes'
      `
      if (globalActiveJobs[0].count >= MAX_GLOBAL_ACTIVE_JOBS) {
        return NextResponse.json(
          { error: 'Our servers are busy. Please try again in a few minutes.', retryAfter: 60 },
          { status: 429 }
        )
      }

      // Per-user concurrent limit
      const activeJobs = await sql`
        SELECT id FROM jobs
        WHERE user_id = ${userId}
          AND status IN ('queued', 'processing')
          AND created_at >= NOW() - INTERVAL '10 minutes'
        LIMIT 1
      `
      if (activeJobs.length > 0) {
        return NextResponse.json(
          { error: 'You already have a generation in progress. Please wait for it to complete.', retryAfter: 120 },
          { status: 429 }
        )
      }
    }

    let isPaid = false
    if (orderId) {
      const orders = await sql`SELECT paid FROM orders WHERE id = ${orderId}`
      isPaid = orders.length > 0 && orders[0].paid
    }

    // Rate limit with fingerprint as additional key
    const rateLimitKey = fingerprint ? `fp:${fingerprint}` : undefined
    const rateLimit = await checkRateLimit(ip, '/api/generate', isPaid)
    if (!rateLimit.success) {
      if (userCredits > 0) {
        await sql`UPDATE users SET credits = credits - 1 WHERE id = ${userId} AND credits > 0`
        await sql`
          INSERT INTO credits (user_id, amount, reason)
          VALUES (${userId}, -1, 'generation')
        `
      } else {
        return NextResponse.json(
          {
            error: 'Daily limit reached. Purchase credits to continue creating.',
            resetAt: rateLimit.resetAt,
            canPurchaseCredits: true,
          },
          { status: 429 }
        )
      }
    }

    // Verify order is paid (if orderId provided)
    if (orderId) {
      const orders = await sql`
        SELECT paid FROM orders WHERE id = ${orderId} AND user_id = ${userId}
      `
      if (orders.length === 0 || !orders[0].paid) {
        return NextResponse.json(
          { error: 'Payment required before generating' },
          { status: 402 }
        )
      }
    }

    // Validate style
    const styleConfig = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS]
    if (!styleConfig) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
    }

    // Fetch each upload individually (max 5) and build URLs in order
    const fileUrls: string[] = []
    for (const id of ids) {
      const uploads = await sql`
        SELECT file_key FROM uploads WHERE id = ${id} AND user_id = ${userId}
      `
      if (uploads.length === 0) {
        return NextResponse.json({ error: `Upload ${id} not found` }, { status: 404 })
      }
      fileUrls.push(`${process.env.R2_PUBLIC_URL}/${uploads[0].file_key}`)
    }

    // Create job in database
    const modelName = styleConfig.model.replace(/\//g, '-')
    const jobResult = await sql`
      INSERT INTO jobs (user_id, upload_id, order_id, style, model, status)
      VALUES (${userId}, ${ids[0]}, ${orderId || null}, ${style}, ${modelName}, 'queued')
      RETURNING id
    `

    const jobId = jobResult[0].id

    // Process job asynchronously (fire-and-forget)
    processJob(jobId, fileUrls, style, editPrompt).catch(console.error)

    return NextResponse.json({ jobId, status: 'queued' })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

async function processJob(jobId: number, fileUrls: string[], style: string, editPrompt?: string) {
  try {
    await sql`
      UPDATE jobs SET status = 'processing', updated_at = NOW() WHERE id = ${jobId}
    `

    const result = await generateImage({ fileUrls, style, jobId, editPrompt })

    if (result.success && result.previewUrl) {
      try {
        await sql`
          UPDATE jobs
          SET status = 'completed',
              output_key = ${result.previewUrl},
              hd_output_key = ${result.hdUrl || null},
              updated_at = NOW()
          WHERE id = ${jobId}
        `
      } catch {
        console.warn(`Job ${jobId}: hd_output_key column missing, storing preview only`)
        await sql`
          UPDATE jobs
          SET status = 'completed',
              output_key = ${result.previewUrl},
              updated_at = NOW()
          WHERE id = ${jobId}
        `
      }

      // Send generation complete email to user (if they have a real email)
      try {
        const jobUser = await sql`
          SELECT u.email FROM users u
          JOIN jobs j ON j.user_id = u.id
          WHERE j.id = ${jobId}
        `
        if (jobUser.length > 0 && jobUser[0].email && !jobUser[0].email.startsWith('guest-')) {
          const siteUrl = process.env.NEXTAUTH_URL || 'https://create.petcanvas.art'
          const downloadUrl = `${siteUrl}/?jobId=${jobId}`
          sendGenerationComplete(jobUser[0].email, jobId, downloadUrl).catch(console.error)
        }
      } catch (emailErr) {
        console.error('Failed to send generation complete email:', emailErr)
      }
    } else {
      await sql`
        UPDATE jobs
        SET status = 'failed', error = ${result.error || 'Unknown error'}, updated_at = NOW()
        WHERE id = ${jobId}
      `
    }
  } catch (error) {
    console.error('Job processing error:', error)
    await sql`
      UPDATE jobs
      SET status = 'failed', error = ${error instanceof Error ? error.message : 'Unknown error'}, updated_at = NOW()
      WHERE id = ${jobId}
    `
  }
}
