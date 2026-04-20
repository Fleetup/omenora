import Stripe from 'stripe'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { cancelEmailJobs } from '~~/server/utils/email-jobs'
import { sendReportEmail } from '~~/server/utils/report-email-builder'
import { ReportSchema, CalendarSchema, type ReportType, type CalendarType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

/**
 * POST /api/stripe/webhook
 *
 * Server-side fulfillment for all Stripe payments. Handles:
 *   checkout.session.completed      → save report + send email
 *   invoice.payment_failed          → deactivate subscriber on renewal failure
 *   customer.subscription.deleted   → revoke access on cancellation / churn
 *
 * This is the production-critical safety net: if the customer's browser
 * crashes, closes, or loses network after payment, this webhook guarantees
 * their report is saved and emailed regardless of what the client does.
 *
 * Setup in Stripe Dashboard → Webhooks:
 *   Endpoint URL:  https://omenora.com/api/stripe/webhook
 *   Events to send: checkout.session.completed, invoice.payment_failed,
 *                   customer.subscription.deleted
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

  if (saveErr) {
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
      answers: {},
    })
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
      model: 'claude-sonnet-4-5',
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
  answers?: Record<string, string>
}): Promise<void> {
  const { email, firstName, sessionId, supabase } = opts

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
          await supabase.from('calendars').upsert({
            session_id: sessionId,
            first_name: opts.firstName,
            calendar_data: calendarData,
            created_at: new Date().toISOString(),
          }, { onConflict: 'session_id' })
        }
      }
    } catch (calErr: any) {
      console.error('[stripe-webhook] Calendar generation failed (non-blocking):', calErr?.message)
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
      vedicData: null,
      baziData: null,
      tarotData: null,
      calendarData,
      birthChartData: null,
      language: opts.language,
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
- Decision style: ${opts.answers?.q1 === 'gut' ? 'intuition' : 'logic'}
- Core fear: ${opts.answers?.q4 || 'unknown'}
- Energy pattern: ${opts.answers?.q2 || 'unknown'}

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
      model: 'claude-sonnet-4-5',
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
