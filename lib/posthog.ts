// ── PostHog server-side helpers ──
// Uses the PostHog REST API for server-side event capture and feature flags.

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  if (!POSTHOG_KEY) return

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: 'petcanvas-server' },
      }),
    })
  } catch (err) {
    console.error('PostHog capture error:', err)
  }
}

export async function getFeatureFlag(
  distinctId: string,
  flagKey: string
): Promise<string | boolean | undefined> {
  if (!POSTHOG_KEY) return undefined

  try {
    const res = await fetch(`${POSTHOG_HOST}/decide/?v=3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        distinct_id: distinctId,
      }),
    })
    const data = await res.json()
    return data.featureFlags?.[flagKey]
  } catch (err) {
    console.error('PostHog feature flag error:', err)
    return undefined
  }
}
