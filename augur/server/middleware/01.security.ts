/**
 * Security middleware — runs first on every request.
 * Sets HTTP security headers and enforces request body size limits.
 */

const MAX_BODY_BYTES = 512_000 // 512 KB — default for all endpoints
const MAX_BODY_BYTES_EMAIL = 2_000_000 // 2 MB — for report email (carries full report + calendar + regional data)

// NOTE on 'unsafe-inline' in script-src:
// Nuxt SSR injects inline <script> tags for hydration payloads and useHead
// JSON-LD blocks, which requires 'unsafe-inline' until per-request nonces are
// wired through the Nuxt app (useHead nonce propagation + Nitro nonce header).
// Eliminating this requires a dedicated nonce implementation pass:
//   1. Generate a cryptographic nonce per request in this middleware.
//   2. Set it as event.context.nonce and in the CSP header.
//   3. Configure Nuxt to forward the nonce to useHead via app.vue.
//   4. Replace 'unsafe-inline' with 'nonce-{nonce}' + 'strict-dynamic'.
// Until that work is done, 'unsafe-inline' is an accepted risk documented here.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com https://analytics.tiktok.com https://connect.facebook.net https://us-assets.i.posthog.com https://maps.googleapis.com https://maps.gstatic.com",
  "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com https://analytics.tiktok.com https://connect.facebook.net https://us-assets.i.posthog.com https://maps.googleapis.com https://maps.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://cloudflareinsights.com https://analytics.tiktok.com https://analytics-ipv6.tiktokw.us https://connect.facebook.net https://www.facebook.com https://scvjjbgejmkomyciabex.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://maps.googleapis.com https://maps.gstatic.com https://places.googleapis.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join('; ')

export default defineEventHandler((event) => {
  // ── Body size guard ──────────────────────────────────────────────────────
  const contentLength = Number.parseInt(getHeader(event, 'content-length') ?? '0', 10)
  const bodyPath = getRequestURL(event).pathname
  const bodyLimit = bodyPath === '/api/send-report-email' ? MAX_BODY_BYTES_EMAIL : MAX_BODY_BYTES
  if (!Number.isNaN(contentLength) && contentLength > bodyLimit) {
    throw createError({ statusCode: 413, message: 'Request entity too large' })
  }

  // ── Skip header injection for SEO/static routes ──────────────────────────
  if (bodyPath === '/sitemap.xml' || bodyPath === '/robots.txt') return

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
  if (bodyPath.startsWith('/api/')) {
    const origin = getHeader(event, 'origin')
    if (origin) {
      if (!isValidRedirectOrigin(origin)) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
      }
      setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
      setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, x-job-secret')
      setResponseHeader(event, 'Vary', 'Origin')
    }

    // Handle CORS preflight
    if (event.method === 'OPTIONS') {
      event.node.res.statusCode = 204
      event.node.res.end()
    }
  }
})
