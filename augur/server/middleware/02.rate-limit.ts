/**
 * Redis-backed sliding-window rate limiter.
 * Runs after 01.security.ts, before every API handler.
 *
 * Uses Redis (via ioredis) when NUXT_REDIS_URL is set so rate limit state
 * survives restarts and rolling deploys. Falls back to in-memory when Redis
 * is unavailable (local dev / cold start) — logged as a warning.
 *
 * Buckets are keyed by [sanitized-IP + endpoint-category] so a single IP
 * cannot abuse expensive AI or payment endpoints regardless of concurrency.
 */
import Redis from 'ioredis'

interface Rule {
  pattern: RegExp
  maxRequests: number
  windowMs: number
}

const RULES: Rule[] = [
  { pattern: /^\/api\/generate-/,                           maxRequests: 5,  windowMs: 10 * 60_000 },
  { pattern: /^\/api\/send-/,                               maxRequests: 5,  windowMs: 10 * 60_000 },
  { pattern: /^\/api\/create-/,                             maxRequests: 10, windowMs: 15 * 60_000 },
  { pattern: /^\/api\/(?:save|get|check|mark|verify)-/,     maxRequests: 30, windowMs: 60_000 },
  { pattern: /^\/api\/stripe\/webhook/,                     maxRequests: 200, windowMs: 60_000 },
  { pattern: /^\/api\//,                                    maxRequests: 60, windowMs: 60_000 },
]

function matchRule(path: string): Rule {
  return RULES.find((r) => r.pattern.test(path)) ?? RULES[RULES.length - 1]!
}

function extractIp(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => any ? E : never): string {
  const fwd  = getHeader(event, 'x-forwarded-for') ?? ''
  const real = getHeader(event, 'x-real-ip') ?? ''
  const raw  = fwd ? (fwd.split(',')[0] ?? '').trim() : real
  return /^[\da-f.:]{7,45}$/i.test(raw) ? raw : 'unknown'
}

// ── Redis singleton ──────────────────────────────────────────────────────────

let redisClient: Redis | null = null
let redisReady   = false
let redisChecked = false

function getRedis(): Redis | null {
  if (redisChecked) return redisReady ? redisClient : null

  redisChecked = true
  const url = process.env.NUXT_REDIS_URL || ''

  if (!url) {
    console.warn('[rate-limit] NUXT_REDIS_URL not set — using in-memory fallback (not suitable for multi-instance)')
    return null
  }

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: false,
      enableOfflineQueue: false,
    })

    redisClient.on('ready', () => { redisReady = true })
    redisClient.on('error', (err) => {
      if (redisReady) {
        console.error('[rate-limit] Redis error:', err.message)
      }
      redisReady = false
    })
    redisClient.on('reconnecting', () => { redisReady = false })

    return redisClient
  } catch (err: any) {
    console.error('[rate-limit] Failed to initialise Redis:', err.message)
    return null
  }
}

// ── In-memory fallback store ─────────────────────────────────────────────────

interface MemRecord { count: number; resetAt: number }
const memStore = new Map<string, MemRecord>()

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of memStore) if (now > v.resetAt) memStore.delete(k)
}, 5 * 60_000).unref?.()

// ── Lua script for atomic Redis sliding window (INCR + EXPIRE) ──────────────
// Returns [count, ttlMs]
const RATE_LIMIT_SCRIPT = `
local key   = KEYS[1]
local limit = tonumber(ARGV[1])
local winMs = tonumber(ARGV[2])
local count = redis.call('INCR', key)
if count == 1 then
  redis.call('PEXPIRE', key, winMs)
end
local ttl = redis.call('PTTL', key)
return { count, ttl }
`

async function checkRedisLimit(
  redis: Redis,
  key: string,
  rule: Rule,
): Promise<{ count: number; resetAt: number } | null> {
  try {
    const result = await redis.eval(
      RATE_LIMIT_SCRIPT,
      1,
      `rl:${key}`,
      String(rule.maxRequests),
      String(rule.windowMs),
    ) as [number, number]

    const count   = result[0]
    const ttlMs   = result[1] > 0 ? result[1] : rule.windowMs
    const resetAt = Date.now() + ttlMs
    return { count, resetAt }
  } catch {
    return null // Redis unavailable — fall through to in-memory
  }
}

// ── Middleware ───────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  // Never rate-limit the Stripe webhook (Stripe retries have their own logic)
  if (path === '/api/stripe/webhook') return

  const ip       = extractIp(event)
  const rule     = matchRule(path)
  const category = path.split('/').slice(0, 3).join('/')
  const key      = `${ip}::${category}`
  const now      = Date.now()

  let count: number
  let resetAt: number

  const redis = getRedis()

  if (redis && redisReady) {
    const result = await checkRedisLimit(redis, key, rule)

    if (result) {
      count   = result.count
      resetAt = result.resetAt
    } else {
      // Redis eval failed — degrade gracefully to in-memory
      const rec = memStore.get(key)
      if (!rec || now > rec.resetAt) {
        memStore.set(key, { count: 1, resetAt: now + rule.windowMs })
        setRateLimitHeaders(event, rule.maxRequests, rule.maxRequests - 1, now + rule.windowMs)
        return
      }
      rec.count++
      count   = rec.count
      resetAt = rec.resetAt
    }
  } else {
    // In-memory path
    const rec = memStore.get(key)
    if (!rec || now > rec.resetAt) {
      memStore.set(key, { count: 1, resetAt: now + rule.windowMs })
      setRateLimitHeaders(event, rule.maxRequests, rule.maxRequests - 1, now + rule.windowMs)
      return
    }
    rec.count++
    count   = rec.count
    resetAt = rec.resetAt
  }

  if (count > rule.maxRequests) {
    const retryAfter = Math.ceil((resetAt - now) / 1000)
    setResponseHeaders(event, {
      'Retry-After':        String(retryAfter),
      'X-RateLimit-Limit':  String(rule.maxRequests),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset':  String(Math.ceil(resetAt / 1000)),
    })
    throw createError({ statusCode: 429, message: 'Too many requests — please try again later.' })
  }

  setRateLimitHeaders(event, rule.maxRequests, Math.max(0, rule.maxRequests - count), resetAt)
})

function setRateLimitHeaders(event: any, limit: number, remaining: number, resetAt: number) {
  setResponseHeaders(event, {
    'X-RateLimit-Limit':     String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset':     String(Math.ceil(resetAt / 1000)),
  })
}
