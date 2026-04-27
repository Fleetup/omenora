import Stripe from 'stripe'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { cancelEmailJobs } from '~~/server/utils/email-jobs'
import { sendReportEmail } from '~~/server/utils/report-email-builder'
import { buildTestimonialRequestEmail } from '~~/server/utils/email-templates'
import { ReportSchema, CalendarSchema, type ReportType, type CalendarType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

/**
 * POST /api/stripe/webhook
 *
 * Server-side fulfillment for all Stripe payments. Handles:
 *   checkout.session.completed      → save report + send email
 *   invoice.payment_failed          → deactivate subscriber on renewal failure
 *   customer.subscription.deleted   → revoke access on cancellation / churn
 *   charge.dispute.created          → B-4 chargeback structured logging
 *   charge.refunded                 → B-4 refund structured logging
 *
 * This is the production-critical safety net: if the customer's browser
 * crashes, closes, or loses network after payment, this webhook guarantees
 * their report is saved and emailed regardless of what the client does.
 *
 * Setup in Stripe Dashboard → Webhooks:
 *   Endpoint URL:  https://omenora.com/api/stripe/webhook
 *   Events to send: checkout.session.completed, invoice.payment_failed,
 *                   customer.subscription.deleted, charge.dispute.created,
 *                   charge.refunded
 *   Signing secret: copy to NUXT_STRIPE_WEBHOOK_SECRET
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const webhookSecret = config.stripeWebhookSecret as string | undefined
  if (!webhookSecret) {
    console.error('[stripe-webhook] NUXT_STRIPE_WEBHOOK_SECRET is not set')
    throw createError({ statusCode: 500, message: 'Webhook secret not configured' })
  }

  // ── Read raw body for Stripe signature verification ────────────────────────
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Empty body' })
  }

  const sig = getHeader(event, 'stripe-signature') ?? ''

  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2026-03-25.dahlia' as any,
  })

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('[stripe-webhook] Signature verification failed:', err.message)
    throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
  }

  // ── Route by event type ───────────────────────────────────────────────────
  if (stripeEvent.type === 'invoice.payment_failed') {
    const invoice = stripeEvent.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    if (customerId) {
      const supabaseInv = createSupabaseAdmin()
      const { error: invErr } = await supabaseInv
        .from('subscribers')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId)
      if (invErr) {
        console.error('[stripe-webhook] invoice.payment_failed — failed to deactivate subscriber:', invErr.code, 'customer:', customerId)
      } else {
        console.info('[stripe-webhook] Subscriber deactivated on payment failure:', customerId)
      }
    }
    return { received: true }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const subscription = stripeEvent.data.object as Stripe.Subscription
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
    if (customerId) {
      const supabaseSub = createSupabaseAdmin()
      const { error: subErr } = await supabaseSub
        .from('subscribers')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId)
      if (subErr) {
        console.error('[stripe-webhook] customer.subscription.deleted — failed to deactivate subscriber:', subErr.code, 'customer:', customerId)
      } else {
        console.info('[stripe-webhook] Subscriber deactivated on subscription deletion:', customerId)
      }
    }
    return { received: true }
  }

  // ── B-4: Chargeback logging ────────────────────────────────────────────────
  if (stripeEvent.type === 'charge.dispute.created') {
    try {
      const dispute = stripeEvent.data.object as Stripe.Dispute
      const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id

      // Look up the original charge to get payment_intent, then find our report metadata
      let reportMeta: Record<string, string> = {}
      if (chargeId) {
        try {
          const charge = await stripe.charges.retrieve(chargeId, { expand: ['payment_intent'] })
          const pi = charge.payment_intent as Stripe.PaymentIntent | null
          const checkoutSessions = pi?.id
            ? await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 })
            : null
          reportMeta = checkoutSessions?.data?.[0]?.metadata ?? {}
        } catch { /* best effort — log what we have */ }
      }

      // Fetch archetype / region / prompt_version from our DB for cohort analysis
      let dbRow: { archetype?: string; region?: string; prompt_version?: string } | null = null
      if (reportMeta.sessionId || reportMeta.tempId) {
        const supabaseDisp = createSupabaseAdmin()
        const { data } = await supabaseDisp
          .from('reports')
          .select('archetype, region, prompt_version')
          .eq('session_id', reportMeta.sessionId || reportMeta.tempId)
          .maybeSingle()
        dbRow = data
      }

      console.warn('[B-4] chargeback', {
        event: 'charge.dispute.created',
        dispute_id: dispute.id,
        charge_id: chargeId,
        amount_cents: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        archetype: dbRow?.archetype ?? reportMeta.archetype ?? 'unknown',
        region: dbRow?.region ?? reportMeta.region ?? 'unknown',
        language: reportMeta.language ?? 'unknown',
        prompt_version: dbRow?.prompt_version ?? 'unknown',
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error('[B-4] chargeback logging failed (non-blocking):', err?.message)
    }
    return { received: true }
  }

  // ── B-4: Refund logging ──────────────────────────────────────────────────────
  if (stripeEvent.type === 'charge.refunded') {
    try {
      const charge = stripeEvent.data.object as Stripe.Charge
      const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

      let reportMeta: Record<string, string> = {}
      if (pi) {
        try {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 })
          reportMeta = sessions.data?.[0]?.metadata ?? {}
        } catch { /* best effort */ }
      }

      let dbRow: { archetype?: string; region?: string; prompt_version?: string } | null = null
      if (reportMeta.sessionId || reportMeta.tempId) {
        const supabaseRef = createSupabaseAdmin()
        const { data } = await supabaseRef
          .from('reports')
          .select('archetype, region, prompt_version')
          .eq('session_id', reportMeta.sessionId || reportMeta.tempId)
          .maybeSingle()
        dbRow = data
      }

      const refundAmountCents = charge.amount_refunded
      console.warn('[B-4] refund', {
        event: 'charge.refunded',
        charge_id: charge.id,
        payment_intent: pi,
        refund_amount_cents: refundAmountCents,
        currency: charge.currency,
        archetype: dbRow?.archetype ?? reportMeta.archetype ?? 'unknown',
        region: dbRow?.region ?? reportMeta.region ?? 'unknown',
        language: reportMeta.language ?? 'unknown',
        prompt_version: dbRow?.prompt_version ?? 'unknown',
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error('[B-4] refund logging failed (non-blocking):', err?.message)
    }
    return { received: true }
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { received: true }
  }

  const session = stripeEvent.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return { received: true }
  }

  const meta = session.metadata ?? {}
  const sessionId = session.id

  // ── Suppress abandonment sequence immediately ──────────────────────────────
  const customerEmail = session.customer_email || meta.email || ''
  if (isValidEmail(customerEmail)) {
    cancelEmailJobs(customerEmail).catch(() => {})

    void createSupabaseAdmin()
      .from('email_captures')
      .update({ purchased: true, sequence_completed: true, updated_at: new Date().toISOString() })
      .eq('email', customerEmail.toLowerCase().trim())
  }

  // ── Handle subscription checkout — save subscriber + send welcome insight ──
  // Covers both the archetype subscription flow (meta.type === 'subscription')
  // and the compatibility subscription flow (meta.type === 'compatibility' && meta.tier === 'subscription').
  if (meta.type === 'subscription' || (meta.type === 'compatibility' && meta.tier === 'subscription')) {
    const subEmail     = session.customer_details?.email || meta.email || ''
    const subFirstName = sanitizeString(meta.firstName || '', 50)
    const subArchetype = sanitizeString(meta.archetype || '', 30)
    const subLPN       = Number.parseInt(meta.lifePathNumber || '0', 10) || 0
    const subCustomer  = session.customer as string
    const subId        = session.subscription as string

    const planType = (meta.type === 'compatibility' && meta.tier === 'subscription')
      ? 'compatibility_plus'
      : 'daily_horoscope'

    // ── Upgrade path: cancel existing daily_horoscope when buying compatibility_plus ──
    if (planType === 'compatibility_plus' && isValidEmail(subEmail)) {
      try {
        const supabaseUpgrade = createSupabaseAdmin()
        const { data: existingDaily } = await supabaseUpgrade
          .from('subscribers')
          .select('stripe_subscription_id')
          .eq('email', subEmail)
          .eq('plan_type', 'daily_horoscope')
          .eq('active', true)
          .maybeSingle()

        const existingSubId = existingDaily?.stripe_subscription_id as string | undefined
        if (existingSubId && existingSubId.startsWith('sub_')) {
          await stripe.subscriptions.cancel(existingSubId)
          await createSupabaseAdmin()
            .from('subscribers')
            .update({ active: false, updated_at: new Date().toISOString() })
            .eq('email', subEmail)
            .eq('plan_type', 'daily_horoscope')
          console.info('[stripe-webhook] Canceled daily_horoscope sub for upgrade:', existingSubId)
        }
      } catch (upgradeErr: any) {
        console.error('[stripe-webhook] Failed to cancel daily_horoscope on upgrade (non-blocking):', upgradeErr?.message)
      }
    }

    // ── Downgrade guard: block daily_horoscope save if compatibility_plus already active ──
    if (planType === 'daily_horoscope' && isValidEmail(subEmail)) {
      try {
        const supabaseGuard = createSupabaseAdmin()
        const { data: existingPlus } = await supabaseGuard
          .from('subscribers')
          .select('stripe_subscription_id')
          .eq('email', subEmail)
          .eq('plan_type', 'compatibility_plus')
          .eq('active', true)
          .maybeSingle()

        const existingPlusId = existingPlus?.stripe_subscription_id as string | undefined
        if (existingPlusId) {
          if (subId && subId.startsWith('sub_')) {
            await stripe.subscriptions.cancel(subId)
          }
          console.info('[stripe-webhook] Blocked daily_horoscope save — compatibility_plus already active for this email:', subEmail)
          return { received: true }
        }
      } catch (guardErr: any) {
        console.error('[stripe-webhook] Downgrade guard check failed (non-blocking):', guardErr?.message)
      }
    }

    try {
      await $fetch('/api/save-subscriber', {
        method: 'POST',
        body: {
          email:                subEmail,
          firstName:            subFirstName,
          archetype:            subArchetype,
          lifePathNumber:       subLPN,
          stripeCustomerId:     subCustomer,
          stripeSubscriptionId: subId,
          element:              meta.element || 'Earth',
          region:               isValidRegion(meta.region) ? meta.region : 'western',
          active:               true,
          planType,
        },
      })
      console.info('[stripe-webhook] Subscriber saved:', { subId, subCustomer })
    } catch (err: any) {
      console.error('[stripe-webhook] save-subscriber failed (non-blocking):', err?.message)
    }

    const jobSecret = (config.emailJobSecret as string | undefined) ?? ''
    if (jobSecret && isValidEmail(subEmail) && subFirstName && isValidArchetype(subArchetype)) {
      try {
        const todayDate = new Date().toISOString().split('T')[0]
        const insightResult = await $fetch<{ success: boolean; insight: any }>('/api/generate-daily-insight', {
          method: 'POST',
          headers: { 'x-job-secret': jobSecret },
          body: {
            email:          subEmail,
            firstName:      subFirstName,
            archetype:      subArchetype,
            lifePathNumber: subLPN,
            element:        meta.element || 'Earth',
            region:         isValidRegion(meta.region) ? meta.region : 'western',
            targetDate:     todayDate,
            language:       'en',
          },
        })

        if (insightResult?.insight) {
          try {
            await $fetch('/api/send-daily-insight', {
              method: 'POST',
              headers: { 'x-job-secret': jobSecret },
              body: {
                email:     subEmail,
                firstName: subFirstName,
                archetype: subArchetype,
                insight:   insightResult.insight,
              },
            })
            console.info('[stripe-webhook] Welcome daily insight sent:', subEmail)
          } catch (sendErr: any) {
            console.error('[stripe-webhook] send-daily-insight failed (non-blocking):', sendErr?.message)
          }
        }
      } catch (genErr: any) {
        console.error('[stripe-webhook] generate-daily-insight failed (non-blocking):', genErr?.message)
      }
    } else if (!jobSecret) {
      console.warn('[stripe-webhook] NUXT_EMAIL_JOB_SECRET not set — skipping welcome insight for:', subEmail)
    }

    return { received: true }
  }

  // ── Check idempotency: skip if report already saved & email sent ───────────
  const supabase = createSupabaseAdmin()
  const { data: existing } = await supabase
    .from('reports')
    .select('id, email_sent')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing?.email_sent) {
    return { received: true, skipped: 'already_processed' }
  }

  // ── Extract metadata ───────────────────────────────────────────────────────
  const firstName      = sanitizeString(meta.firstName || '', 50)
  const archetype      = sanitizeString(meta.archetype || '', 30)
  const email          = customerEmail ? sanitizeString(customerEmail, 254) : ''
  const tempId         = sanitizeString(meta.tempId || '', 100)
  const region         = isValidRegion(meta.region) ? meta.region : 'western'
  const dateOfBirth    = sanitizeString(meta.dateOfBirth || '', 10)
  const lifePathNumber = meta.lifePathNumber ? Number.parseInt(meta.lifePathNumber, 10) : 0
  const timeOfBirth    = sanitizeString(meta.timeOfBirth || '', 10)
  const language       = sanitizeString(meta.language || 'en', 5)
  const isBundlePurchase  = meta.bundle === 'true'
  const isOraclePurchase  = meta.oracle === 'true'

  // ── Handle promo discount code post-payment logging ───────────────────────
  const promoCode   = sanitizeString(meta.promo_code || '', 50)
  const promoCodeId = sanitizeString(meta.code_id || '', 100)

  if (promoCode && promoCodeId && isValidEmail(email)) {
    const normalizedPromoEmail = email.toLowerCase().trim()
    try {
      // 3A: Atomically claim usage via RPC (replaces non-atomic read-check-write)
      const { data: claimResult, error: claimError } = await supabase
        .rpc('claim_promo_use', { p_code_id: promoCodeId })

      if (claimError || !claimResult?.[0]?.success) {
        console.warn('[stripe-webhook] promo claim failed — code at limit or inactive', {
          codeId: promoCodeId,
          sessionId: session.id,
        })
        // Do not throw — webhook must return 200 to Stripe regardless
      } else {
        // 3B: Per-email duplicate guard before inserting into promo_code_uses
        const { data: existingUse } = await supabase
          .from('promo_code_uses')
          .select('id')
          .eq('code_id', promoCodeId)
          .eq('email', normalizedPromoEmail)
          .maybeSingle()

        if (existingUse) {
          console.warn('[stripe-webhook] duplicate promo use detected — skipping', {
            codeId: promoCodeId,
            email:  normalizedPromoEmail,
          })
        } else {
          // Lock personal code to email if not yet locked
          const { data: codeRecord } = await supabase
            .from('promo_codes')
            .select('code_subtype, locked_to_email')
            .eq('id', promoCodeId)
            .maybeSingle()

          if (codeRecord?.code_subtype === 'personal' && !codeRecord.locked_to_email) {
            await supabase
              .from('promo_codes')
              .update({ locked_to_email: normalizedPromoEmail })
              .eq('id', promoCodeId)
          }

          await supabase
            .from('promo_code_uses')
            .insert({
              code_id:   promoCodeId,
              email:     normalizedPromoEmail,
              used_at:   new Date().toISOString(),
              report_id: null,
            })
        }
      }
    } catch (err: any) {
      console.error('[stripe-webhook] Promo logging failed (non-blocking):', err?.message)
    }
  }

  // ── If report already in DB (saved by client), just send email if not sent ─
  if (existing && !existing.email_sent) {
    if (isValidEmail(email)) {
      await sendReportEmailViaWebhook({
        config,
        email,
        firstName,
        archetype,
        lifePathNumber,
        region,
        language,
        sessionId,
        isBundlePurchase,
        isOraclePurchase,
        reportData: null, // will load from tempId below
        supabase,
        dateOfBirth,
        timeOfBirth,
        city: sanitizeString(meta.city || '', 100),
        answers: {},
      })
    }
    return { received: true }
  }

  // ── Report not in DB — this is the fallback path (browser never loaded) ────
  if (!firstName || !dateOfBirth || !archetype) {
    console.warn('[stripe-webhook] Missing metadata for session:', sessionId)
    return { received: true, warning: 'incomplete_metadata' }
  }

  // Try to load the pre-payment report from the temp record
  let reportData: any = null
  if (tempId) {
    const { data: tempRecord } = await supabase
      .from('reports')
      .select('report_data')
      .eq('session_id', tempId)
      .maybeSingle()
    if (tempRecord?.report_data) {
      reportData = tempRecord.report_data
    }
  }

  // If no cached report exists, generate it now
  if (!reportData) {
    try {
      reportData = await generateReport({
        config,
        firstName,
        dateOfBirth,
        archetype,
        lifePathNumber,
        region,
        language,
        city: sanitizeString(meta.city || '', 100),
      })
    } catch (err: any) {
      console.error('[stripe-webhook] Report generation failed for', sessionId, err?.message)
      return { received: true, warning: 'report_generation_failed' }
    }
  }

  // Save report to DB
  const { error: saveErr } = await supabase.from('reports').upsert(
    {
      session_id:       sessionId,
      type:             'archetype',
      first_name:       firstName,
      archetype,
      life_path_number: lifePathNumber,
      report_data:      reportData,
      answers:          {},
      city:             sanitizeString(meta.city || '', 100),
      date_of_birth:    dateOfBirth,
      email:            isValidEmail(email) ? email : '',
      region,
      email_sent:       false,
      oracle_purchased: isOraclePurchase,
      created_at:       new Date().toISOString(),
    },
    { onConflict: 'session_id' },
  )

  if (saveErr && saveErr.code !== 'PGRST204') {
    console.error('[stripe-webhook] Failed to save report:', saveErr.code)
  }

  // Send email if we have a valid address
  if (isValidEmail(email)) {
    await sendReportEmailViaWebhook({
      config,
      email,
      firstName,
      archetype,
      lifePathNumber,
      region,
      language,
      sessionId,
      isBundlePurchase,
      isOraclePurchase,
      reportData,
      supabase,
      dateOfBirth,
      timeOfBirth,
      city: sanitizeString(meta.city || '', 100),
      answers: {},
    })
  }

  // ── TC-1: Schedule day-2 testimonial request email ────────────────────────
  // Only fires on a confirmed paid checkout. Disputes/refunds happen after this
  // point in the Stripe lifecycle and are handled by the charge.dispute.created /
  // charge.refunded handlers — not suppressible at purchase time.
  // Wrapped in try/catch — never blocks report delivery.
  if (isValidEmail(email) && firstName && archetype) {
    try {
      const testimonial = buildTestimonialRequestEmail({
        firstName,
        archetypeName: archetype,
        language,
      })
      const resendKey = config.resendApiKey as string | undefined
      if (resendKey) {
        const resendClient = new Resend(resendKey)
        await resendClient.emails.send({
          from: 'OMENORA <reading@omenora.com>',
          replyTo: 'support@omenora.com',
          to: email,
          subject: testimonial.subject,
          html: testimonial.html,
          scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          headers: {
            'Idempotency-Key': `testimonial-${sessionId}`,
          },
        })
        console.info('[TC-1] testimonial email scheduled: true', { sessionId, language })
      }
    } catch (err: any) {
      console.error('[TC-1] testimonial schedule failed — non-blocking:', err?.message)
    }
  }

  return { received: true }
})

// ── Helpers ─────────────────────────────────────────────────────────────────

const ARCHETYPE_SYMBOLS: Record<string, string> = {
  phoenix:    '●',
  architect:  '◆',
  storm:      '▲',
  lighthouse: '◇',
  wanderer:   '○',
  alchemist:  '⬡',
  guardian:   '□',
  visionary:  '⬟',
  mirror:     '◉',
  catalyst:   '✦',
  sage:       '▽',
  wildfire:   '★',
}

async function generateReport(opts: {
  config: any
  firstName: string
  dateOfBirth: string
  archetype: string
  lifePathNumber: number
  region: string
  language: string
  city: string
}): Promise<any> {
  const client = new Anthropic({ apiKey: opts.config.anthropicApiKey as string })

  const archetypeDescriptions: Record<string, string> = {
    phoenix: 'The Phoenix — a soul who rises from destruction stronger than before',
    architect: 'The Silent Architect — a mind that builds systems others never see',
    storm: 'The Storm Caller — a force that disrupts, electrifies, and moves things',
    lighthouse: 'The Lighthouse — a steady guide who illuminates paths for others',
    wanderer: 'The Wanderer — a seeker who finds meaning in movement and change',
    alchemist: 'The Alchemist — a transformer who turns pressure into gold',
    guardian: 'The Guardian — a protector whose strength is rooted in deep loyalty',
    visionary: 'The Visionary — a dreamer who sees futures others cannot imagine',
    mirror: 'The Mirror — an empath who reflects and amplifies what surrounds them',
    catalyst: 'The Catalyst — an activator who makes things happen simply by arriving',
    sage: 'The Sage — a keeper of pattern and wisdom earned through observation',
    wildfire: 'The Wildfire — an untameable energy that spreads and transforms everything',
  }

  const birthMonth = new Date(opts.dateOfBirth).toLocaleString('default', { month: 'long' })
  const birthYear  = new Date(opts.dateOfBirth).getFullYear()
  const month      = new Date(opts.dateOfBirth).getMonth()
  const birthSeason = month >= 2 && month <= 4 ? 'spring'
    : month >= 5 && month <= 7 ? 'summer'
    : month >= 8 && month <= 10 ? 'autumn'
    : 'winter'

  const archetypeDesc = archetypeDescriptions[opts.archetype] || opts.archetype

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro.',
    hi: 'पूरी तरह से हिंदी में जवाब दें।',
    ko: '전체적으로 한국어로 답변해 주세요.',
    zh: '完全用简体中文回答。',
  }
  const langInstruction = languageInstructions[opts.language] ?? languageInstructions['en'] ?? ''

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny analysis system combining behavioral science, chronobiology, and pattern recognition.

User profile:
- Name: ${opts.firstName}
- Born: ${birthMonth} ${birthYear} in ${opts.city || 'unknown city'}
- Birth season: ${birthSeason}
- Life Path Number: ${opts.lifePathNumber}
- Destiny Archetype: ${archetypeDesc}

Generate exactly 7 sections. Return ONLY valid JSON with this structure:
{
  "archetypeName": "The [Name]",
  "archetypeSymbol": "[single character]",
  "element": "[Fire/Earth/Air/Water]",
  "powerTraits": ["trait1", "trait2", "trait3"],
  "sections": {
    "identity": { "title": "Who You Are", "content": "4-5 sentences." },
    "science": { "title": "The Science Behind You", "content": "3 sentences." },
    "forecast": { "title": "Your 2026 Destiny", "content": "5 sentences." },
    "love": { "title": "Love & Connection", "content": "4 sentences." },
    "purpose": { "title": "Career & Purpose", "content": "3-4 sentences." },
    "gift": { "title": "Your Hidden Gift", "content": "3 sentences." },
    "affirmation": { "title": "Your Power Statement", "content": "ONE sentence maximum. Must include ${opts.firstName}." }
  }
}`

  const reportJsonSchema = {
    type: 'object',
    properties: {
      archetypeName:   { type: 'string' },
      archetypeSymbol: { type: 'string' },
      element:         { type: 'string', enum: ['Fire', 'Earth', 'Air', 'Water'] },
      powerTraits:     { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
      sections: {
        type: 'object',
        properties: {
          identity:    { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          science:     { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          forecast:    { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          love:        { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          purpose:     { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          gift:        { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          affirmation: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
        },
        required: ['identity', 'science', 'forecast', 'love', 'purpose', 'gift', 'affirmation'],
      },
    },
    required: ['archetypeName', 'archetypeSymbol', 'element', 'powerTraits', 'sections'],
  } as const

  const message = await withAiRetry('stripe-webhook:generateReport', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(reportJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstBlock = message.content[0]
    const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
    console.error('[stripe-webhook:generateReport] Structured output returned null parsed_output', {
      endpoint: 'stripe-webhook:generateReport',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype: opts.archetype,
      firstName: opts.firstName,
      region: opts.region,
      language: opts.language,
    })
    throw new Error('Failed to parse AI response')
  }

  const zodResult = ReportSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[stripe-webhook:generateReport] Schema validation failed after structured output', {
      endpoint: 'stripe-webhook:generateReport',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype: opts.archetype,
      firstName: opts.firstName,
      region: opts.region,
      language: opts.language,
    })
    throw new Error('Failed to parse AI response')
  }

  const reportData: ReportType = zodResult.data

  const canonicalSymbol = ARCHETYPE_SYMBOLS[opts.archetype]
  if (canonicalSymbol) reportData.archetypeSymbol = canonicalSymbol

  return reportData
}

async function sendReportEmailViaWebhook(opts: {
  config: any
  email: string
  firstName: string
  archetype: string
  lifePathNumber: number
  region: string
  language: string
  sessionId: string
  isBundlePurchase: boolean
  isOraclePurchase: boolean
  reportData: any
  supabase: any
  dateOfBirth?: string
  timeOfBirth?: string
  city?: string
  answers?: Record<string, string>
}): Promise<void> {
  const { email, firstName, sessionId, supabase, timeOfBirth, city } = opts

  // Double-check email_sent flag to guard against duplicate sends
  const { data: check } = await supabase
    .from('reports')
    .select('email_sent, report_data')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (check?.email_sent) return

  const reportToSend = opts.reportData || check?.report_data
  if (!reportToSend) return

  const resendKey = opts.config.resendApiKey as string | undefined
  if (!resendKey) {
    console.error('[stripe-webhook] NUXT_RESEND_API_KEY not set — cannot send email for', sessionId)
    return
  }

  // ── Generate calendar for bundle/oracle purchases ────────────────────────
  let calendarData: any = null
  if ((opts.isBundlePurchase || opts.isOraclePurchase) && opts.dateOfBirth && opts.firstName) {
    try {
      // Check if already saved to calendars table first
      const { data: existingCal } = await supabase
        .from('calendars')
        .select('calendar_data')
        .eq('session_id', sessionId)
        .maybeSingle()

      if (existingCal?.calendar_data) {
        calendarData = existingCal.calendar_data
      } else {
        calendarData = await generateCalendar({
          config: opts.config,
          firstName: opts.firstName,
          archetype: opts.archetype,
          element: reportToSend.element,
          lifePathNumber: opts.lifePathNumber,
          answers: opts.answers || {},
          dateOfBirth: opts.dateOfBirth,
          language: opts.language,
        })
        if (calendarData) {
          const { error: calSaveErr } = await supabase.from('calendars').upsert({
            session_id: sessionId,
            first_name: opts.firstName,
            calendar_data: calendarData,
            created_at: new Date().toISOString(),
          }, { onConflict: 'session_id' })
          if (calSaveErr && calSaveErr.code !== '23505' && calSaveErr.code !== 'PGRST204') {
            console.error('[stripe-webhook] Calendar save error:', calSaveErr.code)
          }
        }
      }
    } catch (calErr: any) {
      console.error('[stripe-webhook] Calendar generation failed (non-blocking):', calErr?.message)
    }
  }

  let birthChartData: any = null
  if (opts.isOraclePurchase && opts.firstName && opts.dateOfBirth) {
    try {
      const { data: existingReport } = await supabase
        .from('reports')
        .select('report_data')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (existingReport?.report_data?.birthChart) {
        birthChartData = existingReport.report_data.birthChart
      } else {
        const birthChartResponse = await $fetch('/api/generate-birth-chart', {
          method: 'POST',
          body: {
            firstName: opts.firstName,
            dateOfBirth: opts.dateOfBirth,
            timeOfBirth: timeOfBirth || '',
            city: opts.city || '',
            archetype: opts.archetype,
            lifePathNumber: opts.lifePathNumber,
            language: opts.language,
            region: opts.region,
          },
        })
        if ((birthChartResponse as any)?.birthChart) {
          birthChartData = (birthChartResponse as any).birthChart
        }
      }
    } catch (bcErr: any) {
      console.error('[stripe-webhook] Birth chart generation failed (non-blocking):', bcErr?.message)
    }
  }

  let vedicData: any = null
  let baziData: any = null
  let tarotData: any = null
  if (opts.isOraclePurchase && opts.firstName && opts.dateOfBirth) {
    try {
      const { data: existingReport } = await supabase
        .from('reports')
        .select('report_data_vedic, report_data_bazi, report_data_latam')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (existingReport?.report_data_vedic) vedicData = existingReport.report_data_vedic
      if (existingReport?.report_data_bazi) baziData = existingReport.report_data_bazi
      if (existingReport?.report_data_latam) tarotData = existingReport.report_data_latam
    } catch (tradErr: any) {
      console.error('[stripe-webhook] Tradition data fetch failed (non-blocking):', tradErr?.message)
    }
  }

  try {
    await sendReportEmail(resendKey, {
      email,
      firstName,
      report: reportToSend,
      archetype: opts.archetype,
      lifePathNumber: opts.lifePathNumber,
      element: reportToSend.element,
      region: opts.region,
      vedicData,
      baziData,
      tarotData,
      calendarData,
      birthChartData,
      language: opts.language,
      unsubscribeSecret: opts.config.emailJobSecret as string | undefined,
    })

    await supabase
      .from('reports')
      .update({ email_sent: true })
      .eq('session_id', sessionId)
  } catch (err: any) {
    console.error('[stripe-webhook] Email send failed for', sessionId, err?.message)
  }
}

async function generateCalendar(opts: {
  config: any
  firstName: string
  archetype: string
  element: string
  lifePathNumber: number
  answers: Record<string, string>
  dateOfBirth: string
  language: string
}): Promise<any> {
  const client = new Anthropic({ apiKey: opts.config.anthropicApiKey as string })

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें।',
    ko: '전체적으로 한국어로 답변해 주세요.',
    zh: '完全用简体中文回答。',
  }
  const langInstruction = languageInstructions[opts.language] ?? languageInstructions['en'] ?? ''

  const birthMonth = new Date(opts.dateOfBirth).toLocaleString('default', { month: 'long' })
  const birthMonthNum = new Date(opts.dateOfBirth).getMonth()
  const birthSeason = birthMonthNum >= 2 && birthMonthNum <= 4 ? 'spring'
    : birthMonthNum >= 5 && birthMonthNum <= 7 ? 'summer'
    : birthMonthNum >= 8 && birthMonthNum <= 10 ? 'autumn'
    : 'winter'

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny system.
Generate a highly specific month-by-month lucky timing calendar for 2026 for ${opts.firstName}.

Their profile:
- Archetype: ${opts.archetype}
- Element: ${opts.element}
- Life Path: ${opts.lifePathNumber}
- Born in: ${birthSeason} (${birthMonth})
- Primary focus for 2026: ${opts.answers?.p1 || 'growth'}
- Insight style: ${opts.answers?.p2 || 'direct'}
- Reason for seeking this reading: ${opts.answers?.p3 || 'self'}

Personalization instructions:
- Focus area '${opts.answers?.p1 || 'growth'}': The 2-3 months that most directly touch this area (connection=spring/summer romantic windows, purpose=career-peak months, growth=introspective/turning-point months, creativity=generative/high-energy months) must be written with 2x the depth and specificity of other months.
- Insight style '${opts.answers?.p2 || 'direct'}': direct=short declarative sentences, no hedging. gentle=softer language, acknowledge difficulty gently. detailed=explain the mechanism behind each forecast. intuitive=open sensory language, leave space for discovery.
- Reading reason '${opts.answers?.p3 || 'self'}': situation → make every month entry feel actionable, what to do not just what will happen. self → emphasize internal shifts over external events. curiosity → exploratory tone, possibility-focused. recommended → earn trust with specificity, no generic statements.

Rules:
- Be SPECIFIC to this person — reference their archetype, element, and life path in predictions
- Each month must feel genuinely different and personal
- Use real 2026 astrological events as anchors (Mercury retrograde Jan 25-Feb 14, Eclipse Apr 8, Jupiter enters Cancer Jun 9, Saturn retrograde Jul 12, Eclipse Oct 14, Mercury retrograde Oct 23-Nov 12)
- Vary the energy levels — not every month is great, some are warning months, some are neutral
- Write directly to ${opts.firstName} in second person

Return ONLY valid JSON, no markdown:
{
  "overallTheme": "One sentence about ${opts.firstName}'s 2026 overall energy",
  "peakMonths": ["April", "September"],
  "cautionMonths": ["January", "October"],
  "months": [
    {
      "month": "January",
      "number": 1,
      "energyLevel": 65,
      "theme": "Short theme title (3-5 words)",
      "love": "One specific sentence about love/relationships",
      "money": "One specific sentence about money/finances",
      "career": "One specific sentence about career/purpose",
      "warning": "One specific caution or null if none",
      "luckyDays": [7, 14, 22],
      "color": "one hex color that represents this month energy"
    }
  ]
}

Generate all 12 months. Energy levels 0-100.
Peak months should be 75-95. Caution months 30-55.
Normal months 55-75. Make it feel like a real forecast.`

  const calendarJsonSchema = {
    type: 'object',
    properties: {
      overallTheme:  { type: 'string' },
      peakMonths:    { type: 'array', items: { type: 'string' } },
      cautionMonths: { type: 'array', items: { type: 'string' } },
      months: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            month:       { type: 'string' },
            number:      { type: 'number' },
            energyLevel: { type: 'number' },
            theme:       { type: 'string' },
            love:        { type: 'string' },
            money:       { type: 'string' },
            career:      { type: 'string' },
            warning:     { type: ['string', 'null'] },
            luckyDays:   { type: 'array', items: { type: 'number' } },
            color:       { type: 'string' },
          },
          required: ['month', 'number', 'energyLevel', 'theme', 'love', 'money', 'career', 'warning', 'luckyDays', 'color'],
        },
        minItems: 12,
        maxItems: 12,
      },
    },
    required: ['overallTheme', 'peakMonths', 'cautionMonths', 'months'],
  } as const

  const message = await withAiRetry('stripe-webhook:generateCalendar', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(calendarJsonSchema) },
    })
  )

  const rawCalParsed = message.parsed_output

  if (!rawCalParsed) {
    const firstContent = message.content[0]
    const rawText = firstContent?.type === 'text' ? firstContent.text : ''
    console.error('[stripe-webhook:generateCalendar] Structured output returned null parsed_output', {
      endpoint: 'stripe-webhook:generateCalendar',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype: opts.archetype,
      firstName: opts.firstName,
      language: opts.language,
    })
    throw new Error('Failed to parse calendar response')
  }

  const calZodResult = CalendarSchema.safeParse(rawCalParsed)
  if (!calZodResult.success) {
    console.error('[stripe-webhook:generateCalendar] Schema validation failed after structured output', {
      endpoint: 'stripe-webhook:generateCalendar',
      timestamp: new Date().toISOString(),
      zodErrors: calZodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype: opts.archetype,
      firstName: opts.firstName,
      language: opts.language,
    })
    throw new Error('Failed to parse calendar response')
  }

  const calendarData: CalendarType = calZodResult.data

  return calendarData
}
