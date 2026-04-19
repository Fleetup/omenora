import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { TarotSectionSchema, type TarotSectionType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    archetype,
    lifePathNumber,
    element,
    dateOfBirth,
    answers,
    language,
  } = body

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
    ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
    zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
  }
  const langInstruction = languageInstructions[language as string] ?? languageInstructions['en'] ?? ''

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
  })

  const birthMonth = new Date(dateOfBirth)
    .toLocaleString('default', { month: 'long' })
  const birthSeason = (() => {
    const month = new Date(dateOfBirth).getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  })()

  const archetypeCards: Record<string, string> = {
    phoenix: 'Judgement — The card of rebirth and rising',
    architect: 'The Emperor — The card of structure and mastery',
    storm: 'The Tower — The card of transformation through chaos',
    lighthouse: 'The Star — The card of hope and guidance',
    wanderer: 'The Fool — The card of infinite potential',
    alchemist: 'The Magician — The card of transformation',
    guardian: 'The Hierophant — The card of protection',
    visionary: 'The High Priestess — The card of hidden knowledge',
    mirror: 'The Moon — The card of reflection and depth',
    catalyst: 'The Chariot — The card of unstoppable force',
    sage: 'The Hermit — The card of ancient wisdom',
    wildfire: 'Strength — The card of primal power',
  }

  const tarotCard = archetypeCards[archetype] || 'The World — The card of completion'

  const prompt = `${langInstruction}

You are OMENORA with deep knowledge of Latin American spiritual traditions, tarot, and mystical wisdom. Generate a warm, passionate, deeply personal spiritual reading for ${firstName}.

Their profile:
- Archetype: ${archetype}
- Their soul card: ${tarotCard}
- Life Path: ${lifePathNumber}
- Element: ${element}
- Born in: ${birthSeason} (${birthMonth})
- In relationships they are: ${answers?.q3 || 'a giver'}
- Their deepest fear: ${answers?.q4 || 'failure'}

Write a reading that:
1. Reveals their soul card and what it means for them
2. Speaks to their love and relationship destiny
3. Gives a spiritual message from the universe
4. Names a specific period in 2026 that will be transformative for their heart
5. Ends with a protective blessing

Tone: warm, intimate, passionate, spiritual but grounded. Like a beloved abuela who sees your soul.
Reference "el universo" occasionally in English mix.
Focus heavily on love, connection, and emotional truth.
Write directly to ${firstName} in second person.
Length: 220-250 words.

Return ONLY valid JSON:
{
  "soulCard": "Card name only",
  "soulCardMeaning": "One sentence what this card means for them",
  "reading": "Full spiritual reading 220-250 words",
  "loveMessage": "One powerful sentence about their love destiny",
  "transformativePeriod": "Specific month or season in 2026",
  "blessing": "Short protective blessing 1-2 sentences",
  "spiritColors": ["color1", "color2"],
  "luckyCharm": "One specific object or symbol for protection"
}`

  const tarotJsonSchema = {
    type: 'object',
    properties: {
      soulCard:             { type: 'string' },
      soulCardMeaning:      { type: 'string' },
      reading:              { type: 'string' },
      loveMessage:          { type: 'string' },
      transformativePeriod: { type: 'string' },
      blessing:             { type: 'string' },
      spiritColors:         { type: 'array', items: { type: 'string' } },
      luckyCharm:           { type: 'string' },
    },
    required: ['soulCard', 'soulCardMeaning', 'reading', 'loveMessage', 'transformativePeriod', 'blessing', 'spiritColors', 'luckyCharm'],
  } as const

  const message = await withAiRetry('generate-tarot-section', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(tarotJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstContent = message.content[0]
    const rawText = firstContent?.type === 'text' ? firstContent.text : ''
    console.error('[generate-tarot-section] Structured output returned null parsed_output', {
      endpoint: 'generate-tarot-section',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse tarot section' })
  }

  const zodResult = TarotSectionSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-tarot-section] Schema validation failed after structured output', {
      endpoint: 'generate-tarot-section',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse tarot section' })
  }

  const tarotData: TarotSectionType = zodResult.data

  return { success: true, tarot: tarotData }
})
