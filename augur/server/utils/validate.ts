/**
 * Server-side input validation and sanitization utilities.
 * Auto-imported by Nitro in all server/api and server/middleware files.
 */

// ── Allowed value sets ─────────────────────────────────────────────────────

export const ALLOWED_ARCHETYPES = new Set([
  'phoenix', 'architect', 'storm', 'lighthouse', 'wanderer',
  'alchemist', 'guardian', 'visionary', 'mirror', 'catalyst', 'sage', 'wildfire',
])

export const ALLOWED_REGIONS = new Set([
  'western', 'india', 'china', 'latam', 'korea', 'middleeast',
])

/**
 * Allowed redirect hosts for Stripe success/cancel URLs.
 * Derived from NUXT_PUBLIC_SITE_URL at startup; localhost always allowed for dev.
 */
export const ALLOWED_REDIRECT_HOSTS: string[] = (() => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://omenora.com'
  const hosts: string[] = ['localhost', '127.0.0.1']
  try {
    hosts.push(new URL(siteUrl).hostname)
  } catch {
    hosts.push('omenora.com')
  }
  return hosts
})()

// ── Sanitizers ─────────────────────────────────────────────────────────────

/**
 * Strip control characters, trim, and cap length.
 * Returns empty string for non-string inputs.
 */
export function sanitizeString(val: unknown, maxLen = 200): string {
  if (typeof val !== 'string') return ''
  return val.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen)
}

// ── Validators ─────────────────────────────────────────────────────────────

/** RFC-5321 email format + length cap. */
export function isValidEmail(val: unknown): val is string {
  if (typeof val !== 'string') return false
  return val.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)
}

/**
 * Validate Stripe checkout session ID.
 * Format: cs_live_… or cs_test_… followed by alphanumerics/underscores.
 */
export function isValidSessionId(val: unknown): val is string {
  if (typeof val !== 'string') return false
  return /^cs_(live|test)_[A-Za-z0-9_]{10,200}$/.test(val)
}

/**
 * Validate a report save/lookup ID.
 * Accepts Stripe checkout session IDs (cs_live_…, cs_test_…)
 * and temporary pre-payment IDs (temp_{timestamp}_{name}).
 */
export function isValidReportId(val: unknown): val is string {
  if (typeof val !== 'string') return false
  return /^cs_(live|test)_[A-Za-z0-9_]{10,200}$/.test(val) ||
         /^temp_\d{10,15}_[A-Za-z0-9_\-]{1,60}$/.test(val)
}

/** YYYY-MM-DD date, within valid birth year range. */
export function isValidDateOfBirth(val: unknown): val is string {
  if (typeof val !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
  const d = new Date(val)
  if (isNaN(d.getTime())) return false
  const year = d.getFullYear()
  return year >= 1900 && year <= new Date().getFullYear()
}

/** Archetype must be in the allowed set. */
export function isValidArchetype(val: unknown): val is string {
  return typeof val === 'string' && ALLOWED_ARCHETYPES.has(val)
}

/** Region must be in the allowed set. */
export function isValidRegion(val: unknown): val is string {
  return typeof val === 'string' && ALLOWED_REGIONS.has(val)
}

/**
 * Validate redirect origin against the allow-list.
 * Prevents open-redirect attacks through Stripe success/cancel URLs.
 */
export function isValidRedirectOrigin(val: unknown): val is string {
  if (typeof val !== 'string') return false
  try {
    const url = new URL(val)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    return ALLOWED_REDIRECT_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith('.' + host),
    )
  } catch {
    return false
  }
}

/**
 * Derive a safe base URL from a user-supplied origin string.
 * Only returns origin (scheme + host + port), never path/query.
 */
export function safeOrigin(val: string): string {
  const url = new URL(val)
  return url.origin
}

// ── Assertion helper ───────────────────────────────────────────────────────

/**
 * Throw HTTP 400 with `message` if `condition` is falsy.
 * Use at the top of every API handler for required fields.
 */
export function assertInput(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message })
  }
}
