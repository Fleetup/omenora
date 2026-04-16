import { Resend } from 'resend'
import { getEmailTemplate } from '~~/server/utils/email-templates'
import { scheduleEmailJob, SEQUENCE_DELAYS_MS } from '~~/server/utils/email-jobs'

/**
 * POST /api/email-sequence/process-jobs
 *
 * Worker endpoint called by Railway's cron service every 2 minutes.
 * Processes all email jobs whose `run_at` is in the past and status is
 * 'pending'. Sends the email, marks the job 'done', and schedules the next
 * step if applicable.
 *
 * Protected by a shared secret (NUXT_EMAIL_JOB_SECRET) so only Railway
 * cron can trigger it — not arbitrary internet callers.
 *
 * Railway cron config (railway.json / Railway dashboard):
 *   schedule: "* /2 * * * *"   (every 2 minutes)
 *   command:  POST https://omenora.com/api/email-sequence/process-jobs
 *   headers:  { "x-job-secret": "$EMAIL_JOB_SECRET" }
 */

const MAX_ATTEMPTS = 3
const BATCH_SIZE   = 20 // max jobs per run — keeps each cron invocation fast

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only Railway cron (or internal server) may call this ──────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()
  const resend   = new Resend(config.resendApiKey as string)
  const now      = new Date().toISOString()

  // ── Fetch due jobs ──────────────────────────────────────────────────────────
  const { data: jobs, error: fetchErr } = await supabase
    .from('email_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('run_at', now)
    .order('run_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchErr) {
    console.error('[process-jobs] Failed to fetch jobs:', fetchErr.code)
    throw createError({ statusCode: 500, message: 'Failed to fetch jobs' })
  }

  if (!jobs || jobs.length === 0) {
    return { processed: 0 }
  }

  let processed = 0
  let failed    = 0

  for (const job of jobs) {
    // Optimistic lock: mark as 'processing' before doing work to prevent
    // duplicate sends if two cron invocations overlap.
    const { error: lockErr } = await supabase
      .from('email_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', job.id)
      .eq('status', 'pending') // only succeed if still pending

    if (lockErr) continue // another worker already grabbed it

    // ── Check if send is still needed ────────────────────────────────────────
    const { data: capture } = await supabase
      .from('email_captures')
      .select('*')
      .eq('email', job.email)
      .single()

    if (!capture || capture.purchased || capture.sequence_completed) {
      // Suppressed — mark done and skip
      await supabase
        .from('email_jobs')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', job.id)
      continue
    }

    // ── Build and send the email ──────────────────────────────────────────────
    const step     = job.step as 1 | 2 | 3 | 4
    const template = getEmailTemplate(step, {
      email:            capture.email,
      firstName:        capture.first_name       || 'there',
      archetypeName:    capture.archetype_name    || 'your archetype',
      archetypeEmoji:   capture.archetype_emoji   || '✨',
      archetypeElement: capture.archetype_element || '',
      lifePath:         capture.life_path          || '',
      birthCity:        capture.birth_city         || '',
      readingTradition: capture.reading_tradition  || 'Western',
      language:         capture.language           || 'EN',
    })

    let sendOk = false
    try {
      await resend.emails.send({
        from: 'OMENORA <reading@omenora.com>',
        to: capture.email,
        subject: template.subject,
        html: template.html,
        headers: {
          'X-Entity-Ref-ID': `omenora-abandon-${step}-${capture.id}`,
        },
        tags: [
          { name: 'sequence_step', value: String(step) },
          { name: 'archetype',     value: capture.archetype_name || 'unknown' },
          { name: 'language',      value: capture.language       || 'EN' },
        ],
      })
      sendOk = true
    } catch (err: any) {
      console.error(`[process-jobs] Send failed for step ${step} / ${job.email}:`, err?.message)
    }

    if (sendOk) {
      // Mark job done
      await supabase
        .from('email_jobs')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', job.id)

      // Update capture sequence progress
      await supabase
        .from('email_captures')
        .update({
          sequence_step:      step,
          sequence_completed: step === 4,
          updated_at:         new Date().toISOString(),
        })
        .eq('email', job.email)

      // Schedule next step if applicable
      if (step < 4) {
        const nextStep  = (step + 1) as 2 | 3 | 4
        const nextDelay = SEQUENCE_DELAYS_MS[nextStep]
        if (nextDelay) {
          await scheduleEmailJob(job.email, nextStep, nextDelay)
        }
      }

      processed++
    } else {
      const newAttempts = (job.attempts ?? 0) + 1
      const finalStatus = newAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending'

      await supabase
        .from('email_jobs')
        .update({
          status:     finalStatus,
          attempts:   newAttempts,
          last_error: `Send failed at ${new Date().toISOString()}`,
          // Back off: retry in 5 minutes on transient failure
          run_at:     finalStatus === 'pending'
            ? new Date(Date.now() + 5 * 60_000).toISOString()
            : job.run_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      failed++
    }
  }

  return { processed, failed, total: jobs.length }
})
