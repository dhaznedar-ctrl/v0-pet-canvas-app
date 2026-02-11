import 'server-only'
import { sql, hashIP } from '@/lib/db'

const PERMANENT_BLOCK_THRESHOLD = 5

/**
 * Check if an IP is currently blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  // Skip in development
  if (process.env.NODE_ENV === 'development') return false

  const ipHash = hashIP(ip)
  try {
    const rows = await sql`
      SELECT id FROM blocked_ips
      WHERE ip_hash = ${ipHash}
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `
    return rows.length > 0
  } catch (error) {
    console.error('IP block check error:', error)
    // Fail closed — treat as blocked when DB is unavailable
    return true
  }
}

/**
 * Block an IP address
 * @param durationMinutes - 0 or undefined = permanent
 */
export async function blockIP(
  ip: string,
  reason: string,
  durationMinutes?: number
): Promise<void> {
  const ipHash = hashIP(ip)
  try {
    // Check existing block to increment violation count
    const existing = await sql`
      SELECT id, violation_count FROM blocked_ips
      WHERE ip_hash = ${ipHash}
      LIMIT 1
    `

    if (existing.length > 0) {
      const newCount = (existing[0].violation_count || 0) + 1
      const isPermanent = newCount >= PERMANENT_BLOCK_THRESHOLD

      await sql`
        UPDATE blocked_ips
        SET violation_count = ${newCount},
            reason = ${reason},
            expires_at = ${isPermanent ? null : durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() : null}
        WHERE id = ${existing[0].id}
      `
    } else {
      const expiresAt = durationMinutes
        ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
        : null

      await sql`
        INSERT INTO blocked_ips (ip_hash, reason, expires_at, violation_count)
        VALUES (${ipHash}, ${reason}, ${expiresAt}, 1)
      `
    }
  } catch (error) {
    console.error('IP block error:', error)
  }
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: string,
  ipHash: string | null,
  fingerprint: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await sql`
      INSERT INTO security_logs (event_type, ip_hash, fingerprint, details)
      VALUES (${eventType}, ${ipHash}, ${fingerprint}, ${JSON.stringify(details || {})})
    `
  } catch (error) {
    console.error('Security log error:', error)
  }
}
