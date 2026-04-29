/**
 * POST /api/cron/trigger
 *
 * Manually triggers daily cache generation without touching Railway dashboard.
 * Protected by CRON_SECRET env var (separate from EMAIL_JOB_SECRET).
 *
 * Body:
 *   target {string}  'archetypes' | 'zodiac' | 'both'  (default: 'both')
 *
 * Usage:
 *   curl -X POST https://omenora.com/api/cron/trigger \
 *     -H "x-cron-secret: <CRON_SECRET>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"target":"both"}'
 *
 * Generate CRON_SECRET:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const incomingSecret = getHeader(event, 'x-cron-secret') ?? ''
  const expectedSecret = (config.cronSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body   = await readBody(event)
  const target = (body?.target as string | undefined) ?? 'both'

  if (!['archetypes', 'zodiac', 'both'].includes(target)) {
    throw createError({ statusCode: 400, message: "target must be 'archetypes', 'zodiac', or 'both'" })
  }

  const jobSecret = (config.emailJobSecret as string | undefined) ?? ''
  const results: Record<string, unknown> = {}

  try {
    if (target === 'archetypes' || target === 'both') {
      const archResult = await $fetch('/api/generate-daily-cache', {
        method:  'POST',
        headers: { 'x-job-secret': jobSecret },
        body:    {},
      })
      results.archetypes = archResult
    }

    if (target === 'zodiac' || target === 'both') {
      const zodResult = await $fetch('/api/generate-daily-horoscope', {
        method:  'POST',
        headers: { 'x-job-secret': jobSecret },
        body:    {},
      })
      results.zodiac = zodResult
    }

    return {
      success:   true,
      triggered: target,
      results,
      timestamp: new Date().toISOString(),
    }
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      message:    `Trigger failed: ${e?.message ?? String(e)}`,
    })
  }
})
