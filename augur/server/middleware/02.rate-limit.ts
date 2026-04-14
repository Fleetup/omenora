/**
 * In-memory sliding-window rate limiter.
 * Runs after 01.security.ts, before every API handler.
 *
 * Buckets are keyed by [sanitized-IP + endpoint-category] so a single IP
 * cannot abuse expensive AI or payment endpoints regardless of concurrency.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

// Global store — persists for the lifetime of the server process
const store = new Map<string, RateLimitRecord>()

// Purge expired entries every 5 minutes to prevent unbounded memory growth
setInterval(
  () => {
    const now = Date.now()
    for (const [key, rec] of store) {
      if (now > rec.resetAt) store.delete(key)
    }
  },
  5 * 60 * 1000,
).unref?.() // Don't keep process alive just for cleanup

interface Rule {
  pattern: RegExp
  /** Max requests allowed per window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

const RULES: Rule[] = [
  // AI generation — most expensive (Anthropic API billed per call)
  { pattern: /^\/api\/generate-/, maxRequests: 5, windowMs: 10 * 60_000 },
  // Email sending — prevent outbound spam
  { pattern: /^\/api\/send-/, maxRequests: 5, windowMs: 10 * 60_000 },
  // Stripe payment creation — prevent checkout session flooding
  { pattern: /^\/api\/create-/, maxRequests: 10, windowMs: 15 * 60_000 },
  // DB reads/writes — moderate limit
  { pattern: /^\/api\/(?:save|get|check|mark|verify)-/, maxRequests: 30, windowMs: 60_000 },
  // Catch-all for any other API route
  { pattern: /^\/api\//, maxRequests: 60, windowMs: 60_000 },
]

function matchRule(path: string): Rule {
  return RULES.find((r) => r.pattern.test(path)) ?? RULES[RULES.length - 1]!
}

/**
 * Extract and lightly sanitize caller IP.
 * Accepts only IPv4/IPv6 characters; falls back to 'unknown'.
 */
function extractIp(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => any ? E : never): string {
  const fwd = getHeader(event, 'x-forwarded-for') ?? ''
  const real = getHeader(event, 'x-real-ip') ?? ''
  const raw = fwd ? (fwd.split(',')[0] ?? '').trim() : real
  return /^[\da-f.:]{7,45}$/i.test(raw) ? raw : 'unknown'
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const ip = extractIp(event)
  const rule = matchRule(path)

  // Group key = IP + first two path segments (e.g. /api/generate-)
  const category = path.split('/').slice(0, 3).join('/')
  const key = `${ip}::${category}`
  const now = Date.now()

  const rec = store.get(key)
  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + rule.windowMs })
    setRateLimitHeaders(event, rule.maxRequests, rule.maxRequests - 1, now + rule.windowMs)
    return
  }

  if (rec.count >= rule.maxRequests) {
    const retryAfter = Math.ceil((rec.resetAt - now) / 1000)
    setResponseHeaders(event, {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(rule.maxRequests),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(rec.resetAt / 1000)),
    })
    throw createError({
      statusCode: 429,
      message: 'Too many requests — please try again later.',
    })
  }

  rec.count++
  setRateLimitHeaders(event, rule.maxRequests, rule.maxRequests - rec.count, rec.resetAt)
})

function setRateLimitHeaders(event: any, limit: number, remaining: number, resetAt: number) {
  setResponseHeaders(event, {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
  })
}
