import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://petcanvas.art',
  'https://www.petcanvas.art',
  'https://create.petcanvas.art',
]

// In dev, allow localhost
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000')
  ALLOWED_ORIGINS.push('http://localhost:3001')
}

// Paths exempt from CSRF origin check (iyzico callback POSTs to us)
const CSRF_EXEMPT_PATHS = [
  '/api/iyzico/callback',
  '/api/cleanup',
  '/api/printful/webhook',
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // ── Security Headers ──
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // CSP: only in production (dev mode needs flexible loading for HMR/Turbopack)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.iyzico.com https://challenges.cloudflare.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.fal.media https://fal.media https://v3.fal.media https://fal.run https://storage.googleapis.com https://*.r2.cloudflarestorage.com https://*.r2.dev",
        "connect-src 'self' https://api.iyzipay.com https://challenges.cloudflare.com https://fpjs.io https://*.fal.media https://fal.run",
        "frame-src 'self' https://www.iyzico.com https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
    )
  }

  // Remove X-Powered-By (also set in next.config.mjs)
  response.headers.delete('X-Powered-By')

  // ── CORS for API routes ──
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Fingerprint, X-Admin-Password')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      })
    }

    // ── CSRF: check origin for state-changing methods (production only) ──
    if (process.env.NODE_ENV === 'production') {
      const isStateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)
      const isExempt = CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p))

      if (isStateChanging && !isExempt) {
        const requestOrigin = request.headers.get('origin')
        // Allow same-origin requests (no origin header = same site)
        if (requestOrigin && !ALLOWED_ORIGINS.includes(requestOrigin)) {
          return NextResponse.json(
            { error: 'Forbidden: invalid origin' },
            { status: 403, headers: response.headers }
          )
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
