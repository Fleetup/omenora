import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { VedicSectionSchema, type VedicSectionType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // ── Auth guard — only internal server callers may invoke AI generation ────
  const incomingSecret = getHeader(event, 'x-job-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const vedicPlanet    = sanitizeString(body.vedicPlanet, 20)
  const vedicElement   = sanitizeString(body.vedicElement, 20)
  const lifePathNumber = Number(body.lifePathNumber)
  const language       = sanitizeString(body.language || 'en', 5)
  const nakshatra      = body.nakshatra && typeof body.nakshatra === 'object' ? body.nakshatra : null

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')
  assertInput(nakshatra !== null, 'nakshatra is required')

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
    ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
    zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
  }
  const langInstruction = languageInstructions[language as string] ?? languageInstructions['en'] ?? ''

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const prompt = `${langInstruction}

You are OMENORA with Vedic astrology knowledge.
Generate a Vedic destiny section for ${firstName}.

Their Vedic profile:
- Nakshatra (Lunar Mansion): ${nakshatra.name}
  Symbol: ${nakshatra.symbol}
  Deity: ${nakshatra.deity}
  Quality: ${nakshatra.quality}
- Ruling Planet: ${vedicPlanet}
- Vedic Element: ${vedicElement}
- Life Path: ${lifePathNumber}
- Western Archetype: ${archetype}

Write a deeply personal Vedic reading that:
1. Explains their Nakshatra's meaning in their life
2. How their ruling planet ${vedicPlanet} shapes their destiny
3. Their karmic mission in this lifetime
4. What the Vedic tradition says about their 2026 period
5. One specific Vedic remedy or practice for them

Write directly to ${firstName} in second person.
Be specific to their Nakshatra — not generic.
Blend Vedic wisdom with modern, accessible language.
Length: 200-250 words total.

Return ONLY valid JSON:
{
  "nakshatraName": "${nakshatra.name}",
  "rulingPlanet": "${vedicPlanet}",
  "vedicTitle": "Short poetic title for their Vedic nature",
  "reading": "Full Vedic reading paragraph",
  "karmicMission": "One sentence about their soul's mission",
  "remedy": "One specific Vedic practice for 2026",
  "auspiciousColors": ["color1", "color2"],
  "auspiciousDays": ["Monday", "Thursday"]
}`

  const vedicJsonSchema = {
    type: 'object',
    properties: {
      nakshatraName:    { type: 'string' },
      rulingPlanet:     { type: 'string' },
      vedicTitle:       { type: 'string' },
      reading:          { type: 'string' },
      karmicMission:    { type: 'string' },
      remedy:           { type: 'string' },
      auspiciousColors: { type: 'array', items: { type: 'string' } },
      auspiciousDays:   { type: 'array', items: { type: 'string' } },
    },
    required: ['nakshatraName', 'rulingPlanet', 'vedicTitle', 'reading', 'karmicMission', 'remedy', 'auspiciousColors', 'auspiciousDays'],
  } as const

  const message = await withAiRetry('generate-vedic-section', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(vedicJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstBlock = message.content[0]
    const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
    console.error('[generate-vedic-section] Structured output returned null parsed_output', {
      endpoint: 'generate-vedic-section',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse Vedic section' })
  }

  const zodResult = VedicSectionSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-vedic-section] Schema validation failed after structured output', {
      endpoint: 'generate-vedic-section',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse Vedic section' })
  }

  const vedicData: VedicSectionType = zodResult.data

  return { success: true, vedic: vedicData }
})
