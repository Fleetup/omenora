import Anthropic from '@anthropic-ai/sdk'
import { randomBytes } from 'node:crypto'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { sendReportEmail } from '~~/server/utils/report-email-builder'
import { ReportSchema, type ReportType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const codeId        = sanitizeString(body.codeId, 100)
  const rawCode       = sanitizeString(body.code, 50).toUpperCase()
  const email         = sanitizeString(body.email, 254)
  const firstName     = sanitizeString(body.firstName, 50)
  const dateOfBirth   = sanitizeString(body.dateOfBirth, 10)
  const city          = sanitizeString(body.city, 100)
  const archetype     = sanitizeString(body.archetype, 30)
  const lifePathNumber = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : 0
  const region        = isValidRegion(body.region) ? body.region : 'western'
  const language      = sanitizeString(body.language || 'en', 5)
  const answers       = body.answers && typeof body.answers === 'object' ? body.answers : {}

  assertInput(codeId.length > 0, 'codeId is required')
  assertInput(rawCode.length > 0, 'code is required')
  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidDateOfBirth(dateOfBirth), 'Valid dateOfBirth is required')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')

  const normalizedEmail = email.toLowerCase().trim()
  const supabase = createSupabaseAdmin()

  // ── Step 1: Re-validate code from scratch ──────────────────────────────────
  let codeRecord: any
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', codeId)
      .eq('code', rawCode)
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    codeRecord = data
  } catch (err: any) {
    console.error('[apply-promo-access] Code lookup error:', err?.message)
    throw createError({ statusCode: 500, message: 'Unable to validate code. Please try again.' })
  }

  if (!codeRecord) throw createError({ statusCode: 400, message: 'This code is not valid' })
  if (!codeRecord.active) throw createError({ statusCode: 400, message: 'This code is no longer active' })
  if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
    throw createError({ statusCode: 400, message: 'This code has expired' })
  }
  if (codeRecord.current_uses >= codeRecord.max_uses) {
    throw createError({ statusCode: 400, message: 'This code has reached its usage limit' })
  }
  if (codeRecord.code_type !== 'full_access') {
    throw createError({ statusCode: 400, message: 'This code does not grant free access' })
  }
  if (
    codeRecord.code_subtype === 'personal' &&
    codeRecord.locked_to_email !== null &&
    codeRecord.locked_to_email !== undefined &&
    codeRecord.locked_to_email.toLowerCase() !== normalizedEmail
  ) {
    throw createError({ statusCode: 400, message: 'This code is already linked to another account' })
  }

  // ── Step 2: Check email hasn't already used this code ─────────────────────
  try {
    const { data: existingUse } = await supabase
      .from('promo_code_uses')
      .select('id')
      .eq('code_id', codeId)
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (existingUse) {
      throw createError({ statusCode: 400, message: 'This code has already been used with this email address' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    // DB error on duplicate check must block — never fail open
    console.error('[apply-promo-access] promo_code_uses check failed — blocking request', { codeId, error: err?.message })
    throw createError({ statusCode: 500, message: 'Unable to verify code status. Please try again.' })
  }

  // ── Step 3: Generate report via Anthropic directly ──────────────────────
  let reportData: any
  try {
    reportData = await generateReport({
      config,
      firstName,
      dateOfBirth,
      city,
      archetype,
      lifePathNumber,
      region,
      language,
    })
  } catch (err: any) {
    console.error('[apply-promo-access] Report generation failed:', err?.message)
    throw createError({ statusCode: 500, message: 'Failed to generate your reading. Please try again.' })
  }

  // ── Step 4: Save report to Supabase ───────────────────────────────────────
  const promoSessionId = `promo_${randomBytes(16).toString('hex')}`
  let savedReportId: string | null = null

  try {
    const { data: savedReport, error: saveErr } = await supabase
      .from('reports')
      .insert({
        session_id:      promoSessionId,
        first_name:      firstName,
        archetype,
        life_path_number: lifePathNumber,
        report_data:     reportData,
        answers,
        city,
        date_of_birth:   dateOfBirth,
        email:           normalizedEmail,
        region,
        email_sent:      false,
        created_at:      new Date().toISOString(),
      })
      .select('id')
      .single()

    if (saveErr) {
      console.error('[apply-promo-access] Failed to save report:', saveErr.code)
    } else {
      savedReportId = savedReport?.id ?? null
    }
  } catch (err: any) {
    console.error('[apply-promo-access] Save error:', err?.message)
  }

  // ── Step 5: Send report email ─────────────────────────────────────────────
  const resendKey = config.resendApiKey as string | undefined
  let emailSent = false

  if (resendKey && isValidEmail(email)) {
    try {
      await sendReportEmail(resendKey, {
        email,
        firstName,
        report: reportData,
        archetype,
        lifePathNumber,
        element: reportData.element,
        region,
        vedicData: null,
        baziData: null,
        tarotData: null,
        calendarData: null,
        birthChartData: null,
        language,
      })
      emailSent = true
    } catch (err: any) {
      console.error('[apply-promo-access] Email failed (non-blocking):', err?.message)
    }
  }

  // ── Step 6: Mark email sent in reports table ──────────────────────────────
  if (emailSent && savedReportId) {
    const { error: markErr } = await supabase
      .from('reports')
      .update({ email_sent: true })
      .eq('id', savedReportId)
    if (markErr) console.error('[apply-promo-access] Failed to mark email sent:', markErr.code)
  }

  // ── Step 7: Lock personal code to email ──────────────────────────────────
  if (codeRecord.code_subtype === 'personal' && !codeRecord.locked_to_email) {
    const { error: lockErr } = await supabase
      .from('promo_codes')
      .update({ locked_to_email: normalizedEmail })
      .eq('id', codeId)
    if (lockErr) console.error('[apply-promo-access] Lock email failed:', lockErr.code)
  }

  // ── Step 8: Atomically claim usage (replaces non-atomic read-check-write) ─
  const { data: claimResult, error: claimError } = await supabase
    .rpc('claim_promo_use', { p_code_id: codeId })
  if (claimError || !claimResult?.[0]?.success) {
    throw createError({
      statusCode: 400,
      message: 'This code has reached its usage limit or is no longer active.',
    })
  }

  // ── Step 9: Log usage in promo_code_uses ─────────────────────────────────
  const { error: useErr } = await supabase
    .from('promo_code_uses')
    .insert({
      code_id:   codeId,
      email:     normalizedEmail,
      used_at:   new Date().toISOString(),
      report_id: savedReportId,
    })
  if (useErr) console.error('[apply-promo-access] Usage log failed:', useErr.code)

  // ── Step 10: Return ───────────────────────────────────────────────────────
  const resolvedTier = codeRecord.access_tier || 'oracle'
  return {
    success: true,
    reportId: savedReportId,
    report: reportData,
    sessionId: promoSessionId,
    accessTier: resolvedTier,
    bundlePurchased: resolvedTier === 'bundle' || resolvedTier === 'oracle',
    oraclePurchased: resolvedTier === 'oracle',
    message: 'Your complete reading has been sent to your email',
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  city: string
  archetype: string
  lifePathNumber: number
  region: string
  language: string
}): Promise<any> {
  const client = new Anthropic({ apiKey: opts.config.anthropicApiKey as string })

  const archetypeDescriptions: Record<string, string> = {
    phoenix:    'The Phoenix — a soul who rises from destruction stronger than before',
    architect:  'The Silent Architect — a mind that builds systems others never see',
    storm:      'The Storm Caller — a force that disrupts, electrifies, and moves things',
    lighthouse: 'The Lighthouse — a steady guide who illuminates paths for others',
    wanderer:   'The Wanderer — a seeker who finds meaning in movement and change',
    alchemist:  'The Alchemist — a transformer who turns pressure into gold',
    guardian:   'The Guardian — a protector whose strength is rooted in deep loyalty',
    visionary:  'The Visionary — a dreamer who sees futures others cannot imagine',
    mirror:     'The Mirror — an empath who reflects and amplifies what surrounds them',
    catalyst:   'The Catalyst — an activator who makes things happen simply by arriving',
    sage:       'The Sage — a keeper of pattern and wisdom earned through observation',
    wildfire:   'The Wildfire — an untameable energy that spreads and transforms everything',
  }

  const birthMonth  = new Date(opts.dateOfBirth).toLocaleString('default', { month: 'long' })
  const birthYear   = new Date(opts.dateOfBirth).getFullYear()
  const month       = new Date(opts.dateOfBirth).getMonth()
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

  const message = await withAiRetry('apply-promo-access:generateReport', () =>
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
    console.error('[apply-promo-access:generateReport] Structured output returned null parsed_output', {
      endpoint: 'apply-promo-access:generateReport',
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
    console.error('[apply-promo-access:generateReport] Schema validation failed after structured output', {
      endpoint: 'apply-promo-access:generateReport',
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
