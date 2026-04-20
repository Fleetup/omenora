import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { CalendarSchema, type CalendarType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const element        = sanitizeString(body.element, 20)
  const lifePathNumber = Number(body.lifePathNumber)
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const language       = sanitizeString(body.language || 'en', 5)
  const answers        = body.answers && typeof body.answers === 'object' ? body.answers : {}

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')
  assertInput(isValidDateOfBirth(dateOfBirth), 'Invalid dateOfBirth')

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें।',
    ko: '전체적으로 한국어로 답변해 주세요.',
    zh: '完全用简体中文回答。',
  }
  const langInstruction = languageInstructions[language as string] ?? languageInstructions['en'] ?? ''

  const client = new Anthropic({
    apiKey: config.anthropicApiKey as string,
  })

  const birthMonth = new Date(dateOfBirth).toLocaleString('default', { month: 'long' })
  const birthSeason = (() => {
    const month = new Date(dateOfBirth).getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  })()

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny system.
Generate a highly specific month-by-month lucky timing calendar for 2026 for ${firstName}.

Their profile:
- Archetype: ${archetype}
- Element: ${element}
- Life Path: ${lifePathNumber}
- Born in: ${birthSeason} (${birthMonth})
- Decision style: ${answers?.q1 === 'gut' ? 'intuition' : 'logic'}
- Core fear: ${answers?.q4}
- Energy pattern: ${answers?.q2}

Rules:
- Be SPECIFIC to this person — reference their archetype, element, and life path in predictions
- Each month must feel genuinely different and personal
- Use real 2026 astrological events as anchors (Mercury retrograde Jan 25-Feb 14, Eclipse Apr 8, Jupiter enters Cancer Jun 9, Saturn retrograde Jul 12, Eclipse Oct 14, Mercury retrograde Oct 23-Nov 12)
- Vary the energy levels — not every month is great, some are warning months, some are neutral
- Write directly to ${firstName} in second person

Return ONLY valid JSON, no markdown:
{
  "overallTheme": "One sentence about ${firstName}'s 2026 overall energy",
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

  const message = await withAiRetry('generate-calendar', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(calendarJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstContent = message.content[0]
    const rawText = firstContent?.type === 'text' ? firstContent.text : ''
    console.error('[generate-calendar] Structured output returned null parsed_output', {
      endpoint: 'generate-calendar',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse calendar' })
  }

  const zodResult = CalendarSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-calendar] Schema validation failed after structured output', {
      endpoint: 'generate-calendar',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse calendar' })
  }

  const calendarData: CalendarType = zodResult.data

  return { success: true, calendar: calendarData }
})
