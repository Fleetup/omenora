import { scheduleEmailJob, SEQUENCE_DELAYS_MS } from '~~/server/utils/email-jobs'

/**
 * POST /api/email-sequence/trigger
 *
 * Schedules a single abandonment email job into the Supabase `email_jobs`
 * table and returns immediately. The actual send happens in the worker
 * endpoint /api/email-sequence/process-jobs, which is called on a schedule
 * (Railway cron: every 2 minutes).
 *
 * This replaces the previous setTimeout approach that was silently killed
 * by HTTP timeouts on every cloud platform.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only internal callers may enqueue jobs ───────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body  = await readBody(event)
  const email = sanitizeString(body.email, 254)
  const step  = Number(body.step)

  if (!isValidEmail(email) || ![1, 2, 3, 4].includes(step)) {
    return { success: false }
  }

  const delay = SEQUENCE_DELAYS_MS[step]
  if (!delay) return { success: false }

  await scheduleEmailJob(email, step, delay)

  return { success: true }
})
