import Stripe from 'stripe'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { cancelEmailJobs } from '~~/server/utils/email-jobs'

/**
 * POST /api/stripe/webhook
 *
 * Server-side fulfillment for all Stripe payments. Handles:
 *   checkout.session.completed → save report + send email
 *
 * This is the production-critical safety net: if the customer's browser
 * crashes, closes, or loses network after payment, this webhook guarantees
 * their report is saved and emailed regardless of what the client does.
 *
 * Setup in Stripe Dashboard → Webhooks:
 *   Endpoint URL:  https://omenora.com/api/stripe/webhook
 *   Events to send: checkout.session.completed
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

  // ── Only process checkout.session.completed ────────────────────────────────
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
      session_id:      sessionId,
      first_name:      firstName,
      archetype,
      life_path_number: lifePathNumber,
      report_data:     reportData,
      answers:         {},
      city:            sanitizeString(meta.city || '', 100),
      date_of_birth:   dateOfBirth,
      email:           isValidEmail(email) ? email : '',
      region,
      email_sent:      false,
      created_at:      new Date().toISOString(),
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstBlock = message.content[0]
  const rawText    = firstBlock?.type === 'text' ? firstBlock.text : ''

  let reportData: any
  try {
    reportData = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) reportData = JSON.parse(match[0])
    else throw new Error('Failed to parse AI response')
  }

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

  try {
    await $fetch('/api/send-report-email', {
      method: 'POST',
      body: {
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
        calendarData: null,
        birthChartData: null,
        bundlePurchased: opts.isBundlePurchase || opts.isOraclePurchase,
        language: opts.language,
      },
    })

    await supabase
      .from('reports')
      .update({ email_sent: true })
      .eq('session_id', sessionId)
  } catch (err: any) {
    console.error('[stripe-webhook] Email send failed for', sessionId, err?.message)
  }
}
