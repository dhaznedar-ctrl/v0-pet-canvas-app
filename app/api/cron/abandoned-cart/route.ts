import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendAbandonedCartEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find completed jobs from 24h ago that have NO paid order linked
    // and where we haven't already sent an abandoned cart email
    const abandonedJobs = await sql`
      SELECT
        j.id AS job_id,
        j.output_key,
        u.email,
        u.id AS user_id
      FROM jobs j
      JOIN users u ON u.id = j.user_id
      WHERE j.status = 'completed'
        AND j.output_key IS NOT NULL
        AND j.created_at < NOW() - INTERVAL '24 hours'
        AND j.created_at > NOW() - INTERVAL '48 hours'
        AND u.email IS NOT NULL
        AND u.email NOT LIKE 'guest-%'
        AND NOT EXISTS (
          SELECT 1 FROM orders o
          WHERE o.user_id = j.user_id
            AND o.paid = true
            AND o.created_at > j.created_at - INTERVAL '1 hour'
        )
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el
          WHERE el.user_id = u.id
            AND el.email_type = 'abandoned_cart'
            AND el.sent_at > j.created_at
        )
      ORDER BY j.created_at ASC
      LIMIT 50
    `

    let sent = 0
    for (const job of abandonedJobs) {
      try {
        await sendAbandonedCartEmail(
          job.email,
          job.job_id,
          job.output_key,
        )

        // Log the email to prevent duplicates
        await sql`
          INSERT INTO email_logs (user_id, email_type, to_email)
          VALUES (${job.user_id}, 'abandoned_cart', ${job.email})
        `

        sent++
      } catch (err) {
        console.error(`Failed to send abandoned cart email to ${job.email}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      found: abandonedJobs.length,
      sent,
    })
  } catch (error) {
    console.error('Abandoned cart cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
