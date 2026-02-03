import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// This endpoint should be called by a cron job to clean up expired uploads
// For Vercel, you can use Vercel Cron Jobs
// For VPS, you can use a systemd timer or standard cron

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (use a secret key)
    const authHeader = request.headers.get('authorization')
    const cleanupSecret = process.env.CLEANUP_SECRET || process.env.ADMIN_PASSWORD

    if (!cleanupSecret || authHeader !== `Bearer ${cleanupSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete expired uploads
    const deletedUploads = await sql`
      DELETE FROM uploads
      WHERE expires_at < NOW()
      RETURNING id
    `

    // Clean up failed jobs older than 7 days
    const deletedJobs = await sql`
      DELETE FROM jobs
      WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days'
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      deletedUploads: deletedUploads.length,
      deletedJobs: deletedJobs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing/manual triggering
export async function GET(request: NextRequest) {
  return POST(request)
}
