/**
 * POST /api/cron/send-weekly-transits
 *
 * Called by Railway Cron every Monday at 8:00 AM UTC.
 * Fetches all active Compatibility Plus subscribers and sends each one
 * a personalised weekly relationship weather email.
 *
 * Processes subscribers sequentially with a 2-second delay between each
 * to avoid Anthropic / Resend rate limits.
 *
 * Railway cron config (set via Railway dashboard — not supported in railway.json):
 *   schedule:  0 8 * * 1   (every Monday at 08:00 UTC)
 *   method:    POST
 *   URL:       https://omenora.com/api/cron/send-weekly-transits
 *   headers:   x-job-secret: <NUXT_EMAIL_JOB_SECRET value>
 *
 * Returns: { processed: number, failed: number, skipped: number }
 *   processed — transit generated and email sent successfully
 *   failed    — unhandled error (generate or send threw)
 *   skipped   — subscriber has no compatibility reading yet
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only Railway cron may call this ────────────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // ── Fetch all active Compatibility Plus subscribers ─────────────────────────
  const supabase = createSupabaseAdmin()

  const { data: subscribers, error: subErr } = await supabase
    .from('subscribers')
    .select('email, first_name, archetype, life_path_number, element, region')
    .eq('active', true)
    .eq('plan_type', 'compatibility_plus')
    .order('email', { ascending: true })

  if (subErr) {
    console.error('[send-weekly-transits] Failed to fetch subscribers:', subErr.code, subErr.message)
    throw createError({ statusCode: 500, message: 'Failed to fetch subscribers' })
  }

  if (!subscribers || subscribers.length === 0) {
    console.info('[send-weekly-transits] No Compatibility Plus subscribers found')
    return { processed: 0, failed: 0, skipped: 0 }
  }

  console.info(`[send-weekly-transits] Processing ${subscribers.length} subscriber(s)`)

  let processed = 0
  let failed    = 0
  let skipped   = 0

  for (const subscriber of subscribers) {
    const email          = (subscriber.email as string | null) ?? ''
    const firstName      = (subscriber.first_name as string | null) || 'Friend'
    const archetype      = (subscriber.archetype as string | null) ?? ''
    const lifePathNumber = (subscriber.life_path_number as number | null) ?? 0
    const element        = (subscriber.element as string | null) ?? ''
    const region         = (subscriber.region as string | null) ?? 'western'

    // ── 2-second delay between subscribers (rate limit guard) ────────────────
    if (processed + failed + skipped > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    try {
      const result = await $fetch<{ success: boolean; reason?: string }>(
        '/api/generate-weekly-transit',
        {
          method:  'POST',
          headers: { 'x-job-secret': expectedSecret },
          body: {
            email,
            firstName,
            archetype,
            lifePathNumber,
            element,
            region,
          },
        },
      )

      if (result.success === false && result.reason === 'no_compatibility_reading') {
        console.info(`[send-weekly-transits] Skipped (no reading): ${email}`)
        skipped++
      } else {
        console.info(`[send-weekly-transits] Processed: ${email}`)
        processed++
      }
    } catch (err: any) {
      console.error(
        `[send-weekly-transits] Failed for ${email}:`,
        err?.message ?? err,
      )
      failed++
    }
  }

  console.info(
    `[send-weekly-transits] Done — processed: ${processed}, failed: ${failed}, skipped: ${skipped}`,
  )

  return { processed, failed, skipped }
})
