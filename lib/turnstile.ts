import 'server-only'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileResult {
  success: boolean
  error?: string
}

/**
 * Verify a Turnstile token server-side.
 * Gracefully skips if TURNSTILE_SECRET_KEY is not configured or DEV_SKIP_AI is true.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string
): Promise<TurnstileResult> {
  // Skip in development mode (localhost)
  if (process.env.NODE_ENV === 'development') {
    return { success: true }
  }

  // Graceful skip if not configured
  if (!TURNSTILE_SECRET) {
    return { success: true }
  }

  // If token is missing and Turnstile is configured, fail
  if (!token) {
    return { success: false, error: 'Missing verification token' }
  }

  try {
    const body: Record<string, string> = {
      secret: TURNSTILE_SECRET,
      response: token,
    }
    if (ip) body.remoteip = ip

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('Turnstile API error:', res.status)
      return { success: false, error: 'Verification service unavailable. Please try again.' }
    }

    const data = await res.json()

    if (data.success) {
      return { success: true }
    }

    return {
      success: false,
      error: 'Verification failed. Please try again.',
    }
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return { success: false, error: 'Verification service unavailable. Please try again.' }
  }
}
