import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { deleteMultipleFromR2, extractKeyFromUrl } from '@/lib/r2'
import { cleanupRateLimits } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cleanupSecret = process.env.CLEANUP_SECRET || process.env.ADMIN_PASSWORD

    if (!cleanupSecret || authHeader !== `Bearer ${cleanupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get expired uploads with their R2 keys
    const expiredUploads = await sql`
      SELECT id, file_key FROM uploads WHERE expires_at < NOW()
    `

    // Delete files from R2
    const uploadKeys = expiredUploads
      .map((u) => u.file_key as string)
      .filter((key) => !key.startsWith('data:')) // Skip legacy base64 entries

    if (uploadKeys.length > 0) {
      await deleteMultipleFromR2(uploadKeys)
    }

    // Delete expired upload records from DB
    const deletedUploads = await sql`
      DELETE FROM uploads WHERE expires_at < NOW() RETURNING id
    `

    // Get failed jobs older than 7 days with their output keys
    const oldFailedJobs = await sql`
      SELECT id, output_key FROM jobs
      WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days'
    `

    // Delete output files from R2 if they exist
    const outputKeys = oldFailedJobs
      .map((j) => j.output_key as string | null)
      .filter((key): key is string => key !== null)
      .map((url) => extractKeyFromUrl(url))
      .filter((key): key is string => key !== null)

    if (outputKeys.length > 0) {
      await deleteMultipleFromR2(outputKeys)
    }

    const deletedJobs = await sql`
      DELETE FROM jobs
      WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days'
      RETURNING id
    `

    // ── Clean up old completed jobs (30+ days) — free R2 storage ──
    const oldCompletedJobs = await sql`
      SELECT id, output_key FROM jobs
      WHERE status = 'completed' AND created_at < NOW() - INTERVAL '30 days'
    `

    const completedOutputKeys = oldCompletedJobs
      .flatMap((j) => {
        const keys: string[] = []
        if (j.output_key) {
          const k = extractKeyFromUrl(j.output_key as string)
          if (k) keys.push(k)
          // Also try to delete the HD version
          const hdKey = k?.replace('outputs/preview-', 'outputs/hd-')
          if (hdKey && hdKey !== k) keys.push(hdKey)
        }
        return keys
      })

    if (completedOutputKeys.length > 0) {
      await deleteMultipleFromR2(completedOutputKeys)
    }

    const deletedCompletedJobs = await sql`
      DELETE FROM jobs
      WHERE status = 'completed' AND created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `

    // ── Security table cleanup ──

    // Clean old rate limit entries (2+ hours)
    const cleanedRateLimits = await cleanupRateLimits()

    // Clean expired blocked IPs
    const cleanedBlockedIps = await sql`
      DELETE FROM blocked_ips
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
      RETURNING id
    `

    // Clean old security logs (30+ days)
    const cleanedSecurityLogs = await sql`
      DELETE FROM security_logs
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      deletedUploads: deletedUploads.length,
      deletedR2Files: uploadKeys.length + outputKeys.length + completedOutputKeys.length,
      deletedFailedJobs: deletedJobs.length,
      deletedCompletedJobs: deletedCompletedJobs.length,
      cleanedRateLimits,
      cleanedBlockedIps: cleanedBlockedIps.length,
      cleanedSecurityLogs: cleanedSecurityLogs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}

// GET intentionally not exported — cleanup must use POST to prevent CSRF via image tags or links
