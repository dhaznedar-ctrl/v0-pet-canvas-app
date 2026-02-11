'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', color: '#fafafa' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#fafafa',
                color: '#0a0a0a',
                border: 'none',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
