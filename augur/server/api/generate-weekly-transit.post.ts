import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { createClient } from '@supabase/supabase-js'
import { WeeklyTransitSchema, type WeeklyTransitType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'
import { getPlanetaryTransits } from '~~/server/utils/planetaryTransits'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only internal worker may call this ───────────────────────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const email          = sanitizeString(body.email ?? '', 254)
  const firstName      = sanitizeString(body.firstName ?? '', 50)
  const archetype      = sanitizeString(body.archetype ?? '', 30)
  const lifePathNumber = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : 0
  const element        = sanitizeString(body.element ?? '', 20)
  const region         = isValidRegion(body.region) ? (body.region as string) : 'western'

  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(!!firstName, 'firstName is required')

  // ── STEP 1: Compute Monday–Sunday of current week ─────────────────────────
  const now       = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon … 6=Sat
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const weekStartDate = new Date(now)
  weekStartDate.setDate(now.getDate() + diffToMon)
  weekStartDate.setHours(0, 0, 0, 0)

  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekStartDate.getDate() + 6)

  const toIsoDate = (d: Date): string => d.toISOString().split('T')[0]!
  const weekStart = toIsoDate(weekStartDate)
  const weekEnd   = toIsoDate(weekEndDate)

  // ── STEP 2: Planetary transits for start and end of week ──────────────────
  const weekStartTransits = getPlanetaryTransits(weekStart)
  const weekEndTransits   = getPlanetaryTransits(weekEnd)

  // ── STEP 3: Fetch subscriber's most recent compatibility reading ──────────
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { data: reportRows, error: reportError } = await supabase
    .from('reports')
    .select('compatibility_data')
    .eq('email', email)
    .eq('type', 'compatibility')
    .order('created_at', { ascending: false })
    .limit(1)

  if (reportError) {
    console.error('[generate-weekly-transit] Supabase error:', reportError.code, reportError.message)
  }

  if (!reportRows || reportRows.length === 0) {
    return { success: false, reason: 'no_compatibility_reading' }
  }

  // ── STEP 4: Safely extract pairing data from compatibility_data ───────────
  const cd = reportRows[0]!.compatibility_data as Record<string, any> | null

  const receipt         = cd && typeof cd.calculationReceipt === 'object' ? cd.calculationReceipt : null
  const p1              = receipt && typeof receipt.person1 === 'object' ? receipt.person1 : null
  const p2              = receipt && typeof receipt.person2 === 'object' ? receipt.person2 : null
  const sectionsChallenge = cd?.sections?.challenge?.content

  const person1SunSign     = (p1?.sunSign   as string | undefined) ?? ''
  const person1LifePath    = (p1?.lifePathNumber as number | undefined) ?? lifePathNumber
  const person1Archetype   = (p1?.archetype as string | undefined) ?? archetype
  const person2SunSign     = (p2?.sunSign   as string | undefined) ?? ''
  const person2LifePath    = (p2?.lifePathNumber as number | undefined) ?? 0
  const compatibilityTitle = typeof cd?.compatibilityTitle === 'string' ? cd.compatibilityTitle : ''
  const challengeContent   = typeof sectionsChallenge === 'string' ? sectionsChallenge : ''

  // ── STEP 5: Claude — generate weekly relationship weather ─────────────────
  const weeklyPrompt = `Generate a weekly relationship weather forecast for the week of ${weekStart} to ${weekEnd}.

PERSON 1: ${firstName} — ${person1Archetype} archetype, ${person1SunSign || 'unknown'} sun, Life Path ${person1LifePath}, ${element} element
PERSON 2: ${person2SunSign || 'unknown'} sun, Life Path ${person2LifePath}
THEIR KNOWN DYNAMIC: ${challengeContent || 'not available'}
THEIR COMPATIBILITY TITLE: ${compatibilityTitle || 'not available'}

THIS WEEK'S PLANETARY WEATHER:
Week start — Sun in ${weekStartTransits.sun.sign}, Moon in ${weekStartTransits.moon.sign}, Mercury in ${weekStartTransits.mercury.sign}, Venus in ${weekStartTransits.venus.sign}, Mars in ${weekStartTransits.mars.sign}
Week end — Moon moves to ${weekEndTransits.moon.sign}

Generate a forecast with these sections:
1. CONNECTION: How this week's energy affects the overall connection between these two people
2. COMMUNICATION: What to expect in how they talk to each other this week (Mercury influence)
3. TENSION: Any friction points to be aware of (honest — don't sugarcoat)
4. ADVICE: One specific, actionable thing they can do this week to strengthen the connection

RESPOND WITH VALID JSON ONLY:
{
  "connection": "2-3 sentences",
  "communication": "2-3 sentences",
  "tension": "2-3 sentences",
  "advice": "1-2 sentences — specific and actionable",
  "weekTheme": "short label summarizing the week energy, max 50 chars"
}`

  const weeklyTransitJsonSchema = {
    type: 'object',
    properties: {
      connection:    { type: 'string' },
      communication: { type: 'string' },
      tension:       { type: 'string' },
      advice:        { type: 'string' },
      weekTheme:     { type: 'string' },
    },
    required: ['connection', 'communication', 'tension', 'advice', 'weekTheme'],
  } as const

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const message = await withAiRetry('generate-weekly-transit', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: `You are writing a weekly relationship weather forecast for a specific couple. You know their chart data and their compatibility challenge. Ground everything in this week's actual planetary movements. Be specific to this pairing — never generic. Write in second person ('your connection', 'between you two'). 2-3 sentences per section. Warm but honest.`,
      messages: [{ role: 'user', content: weeklyPrompt }],
      output_config: { format: jsonSchemaOutputFormat(weeklyTransitJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstBlock = message.content[0]
    const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
    console.error('[generate-weekly-transit] Structured output returned null parsed_output', {
      endpoint: 'generate-weekly-transit',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      email,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse weekly transit' })
  }

  const zodResult = WeeklyTransitSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-weekly-transit] Schema validation failed', {
      endpoint: 'generate-weekly-transit',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      email,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse weekly transit' })
  }

  const generated: WeeklyTransitType = zodResult.data

  // ── STEP 6: Send the weekly transit email ─────────────────────────────────
  await $fetch('/api/send-weekly-transit', {
    method: 'POST',
    headers: { 'x-job-secret': expectedSecret },
    body: {
      email,
      firstName,
      weekStart,
      weekEnd,
      weekTheme:        generated.weekTheme,
      connection:       generated.connection,
      communication:    generated.communication,
      tension:          generated.tension,
      advice:           generated.advice,
      person2SunSign,
      compatibilityTitle,
    },
  })

  return { success: true }
})
