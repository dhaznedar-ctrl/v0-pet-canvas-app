import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { STYLES } from '@/lib/products'
import { generateImage } from '@/lib/ai-provider'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, style, uploadId, orderId } = body

    if (!email || !style || !uploadId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check if paid (paid users get higher rate limit)
    let isPaid = false
    if (orderId) {
      const orders = await sql`
        SELECT paid FROM orders WHERE id = ${orderId}
      `
      isPaid = orders.length > 0 && orders[0].paid
    }

    const rateLimit = checkRateLimit(ip, isPaid)
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimit.resetAt 
        },
        { status: 429 }
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

    // Get upload data
    const uploads = await sql`
      SELECT file_key, mime FROM uploads WHERE id = ${uploadId} AND user_id = ${userId}
    `

    if (uploads.length === 0) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    const upload = uploads[0]

    // Get style config
    const styleConfig = STYLES.find(s => s.id === style)
    if (!styleConfig) {
      return NextResponse.json(
        { error: 'Invalid style' },
        { status: 400 }
      )
    }

    // Create job in database
    const jobResult = await sql`
      INSERT INTO jobs (user_id, upload_id, order_id, style, model, status)
      VALUES (${userId}, ${uploadId}, ${orderId || null}, ${style}, 'gemini-2.0-flash-exp', 'queued')
      RETURNING id
    `

    const jobId = jobResult[0].id

    // Start generation asynchronously
    // In production, this would be handled by a separate worker
    processJob(jobId, upload.file_key, styleConfig).catch(console.error)

    return NextResponse.json({
      jobId,
      status: 'queued',
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    )
  }
}

async function processJob(
  jobId: number, 
  fileUrl: string, 
  styleConfig: { id: string; name: string; prompt: string }
) {
  try {
    // Update status to processing
    await sql`
      UPDATE jobs SET status = 'processing', updated_at = NOW() WHERE id = ${jobId}
    `

    // Generate image using AI provider
    const result = await generateImage({
      fileUrl,
      style: styleConfig.id,
      systemPrompt: `You are an expert artist specializing in ${styleConfig.name} style pet portraits. Create beautiful, high-quality artwork.`,
      userPrompt: styleConfig.prompt,
    })

    if (result.success && result.outputUrl) {
      // Update job as completed
      await sql`
        UPDATE jobs 
        SET status = 'completed', output_key = ${result.outputUrl}, updated_at = NOW() 
        WHERE id = ${jobId}
      `
    } else {
      // Update job as failed
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
