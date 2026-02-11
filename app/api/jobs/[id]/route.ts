import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthUser, getRequestIP } from '@/lib/api-auth'
import { isIPBlocked } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'
import { jobPatchSchema } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getRequestIP(request)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // General rate limit
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { id } = await params
    const jobId = parseInt(id, 10)

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    // Require auth token — enforce ownership (skip in dev)
    const authUser = getAuthUser(request)
    let jobs
    if (process.env.NODE_ENV === 'development') {
      jobs = await sql`
        SELECT status, error, output_key, created_at, updated_at
        FROM jobs WHERE id = ${jobId}
      `
    } else {
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      jobs = await sql`
        SELECT status, error, output_key, created_at, updated_at
        FROM jobs WHERE id = ${jobId} AND user_id = ${authUser.userId}
      `
    }

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const job = jobs[0]

    // Fetch sibling variations (same upload_id) only when this job is completed
    let variations: { jobId: number; outputUrl: string; style: string; createdAt: string }[] | undefined
    if (job.status === 'completed' && authUser) {
      const siblings = await sql`
        SELECT id, output_key, style, created_at
        FROM jobs
        WHERE upload_id = (SELECT upload_id FROM jobs WHERE id = ${jobId})
          AND user_id = ${authUser.userId}
          AND status = 'completed'
        ORDER BY created_at ASC
      `
      if (siblings.length > 1) {
        variations = siblings.map((s: Record<string, unknown>) => ({
          jobId: s.id as number,
          outputUrl: s.output_key as string,
          style: s.style as string,
          createdAt: s.created_at as string,
        }))
      }
    }

    return NextResponse.json({
      status: job.status,
      error: job.error,
      outputUrl: job.output_key,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      ...(variations ? { variations } : {}),
    })
  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getRequestIP(request)

    // IP block check
    if (await isIPBlocked(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params
    const jobId = parseInt(id, 10)
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const body = await request.json()

    // Zod validation
    const validation = jobPatchSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { email, action } = validation.data

    if (action === 'save_for_later') {
      // Require auth token and enforce ownership
      const authUser = getAuthUser(request)
      if (!authUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const owned = await sql`SELECT id FROM jobs WHERE id = ${jobId} AND user_id = ${authUser.userId}`
      if (owned.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      // Extend retention — do NOT transfer ownership
      await sql`UPDATE jobs SET updated_at = NOW() WHERE id = ${jobId}`
      await sql`
        UPDATE uploads
        SET expires_at = NOW() + INTERVAL '2 days'
        WHERE id = (SELECT upload_id FROM jobs WHERE id = ${jobId})
      `

      return NextResponse.json({ success: true, expiresIn: '2 days' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Job patch error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
