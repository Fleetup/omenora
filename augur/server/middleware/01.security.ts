/**
 * Security middleware — runs first on every request.
 * Sets HTTP security headers and enforces request body size limits.
 */

const MAX_BODY_BYTES = 512_000 // 512 KB

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com https://analytics.tiktok.com https://connect.facebook.net",
  "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com https://analytics.tiktok.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://cloudflareinsights.com https://analytics.tiktok.com https://analytics-ipv6.tiktokw.us https://connect.facebook.net https://www.facebook.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join('; ')

export default defineEventHandler((event) => {
  // ── Body size guard ──────────────────────────────────────────────────────
  const contentLength = Number.parseInt(getHeader(event, 'content-length') ?? '0', 10)
  if (!Number.isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, message: 'Request entity too large' })
  }

  // ── Skip header injection for SEO/static routes ──────────────────────────
  const reqPath = getRequestURL(event).pathname
  if (reqPath === '/sitemap.xml' || reqPath === '/robots.txt') return

  // ── HTTP security headers ────────────────────────────────────────────────
  setResponseHeaders(event, {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': CSP,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  })

  // ── CORS: reject cross-origin requests to API routes ────────────────────
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/')) {
    const origin = getHeader(event, 'origin')
    if (origin) {
      if (!isValidRedirectOrigin(origin)) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
      }
      setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
      setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')
      setResponseHeader(event, 'Vary', 'Origin')
    }

    // Handle CORS preflight
    if (event.method === 'OPTIONS') {
      event.node.res.statusCode = 204
      event.node.res.end()
    }
  }
})
