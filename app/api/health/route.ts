import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const checks: Record<string, string> = {}
  let healthy = true

  // Database check
  try {
    await sql`SELECT 1`
    checks.database = 'connected'
  } catch {
    checks.database = 'disconnected'
    healthy = false
  }

  // Required environment variables — check presence without revealing names
  const requiredEnvVars = [
    'DATABASE_URL',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
    'FAL_KEY',
    'NEXTAUTH_SECRET',
  ]

  const missingCount = requiredEnvVars.filter((key) => !process.env[key]).length
  checks.env = missingCount === 0 ? 'ok' : 'incomplete'
  if (missingCount > 0) healthy = false

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks,
    },
    { status: healthy ? 200 : 503 }
  )
}
