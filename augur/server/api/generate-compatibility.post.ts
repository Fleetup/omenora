import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    archetype,
    element,
    lifePathNumber,
    powerTraits,
    partnerName,
    partnerDob,
    partnerCity,
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
    apiKey: config.anthropicApiKey as string,
  })

  const partnerLifePath = (() => {
    const digits = partnerDob.replace(/-/g, '')
      .split('').map(Number)
    let sum = digits.reduce((a: number, b: number) => a + b, 0)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('')
        .map(Number).reduce((a: number, b: number) => a + b, 0)
    }
    return sum
  })()

  const partnerSeason = (() => {
    const month = new Date(partnerDob).getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  })()

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny analysis system. Generate a compatibility report between two people.
Be specific, poetic, and personal. Reference their actual names, archetypes, life paths, and seasons throughout.
Never be generic. Write in second person to ${firstName}.

Person 1 (the user):
- Name: ${firstName}
- Archetype: ${archetype}
- Element: ${element}
- Life Path: ${lifePathNumber}
- Traits: ${powerTraits?.join(', ')}

Person 2 (their person):
- Name: ${partnerName}
- Born: ${partnerSeason} season
- Life Path: ${partnerLifePath}
- City: ${partnerCity}

Return ONLY valid JSON, no markdown:
{
  "compatibilityScore": 85,
  "compatibilityTitle": "The Alchemist meets The Storm — transformation through tension",
  "sections": {
    "bond": {
      "title": "The Bond Between You",
      "content": "[3-4 sentences about the core dynamic between these two specific people and their archetypes]"
    },
    "strength": {
      "title": "Your Greatest Strength Together",
      "content": "[2-3 sentences about what makes this pairing powerful]"
    },
    "challenge": {
      "title": "The Tension You Must Navigate",
      "content": "[2-3 sentences honest about the friction point between their energies]"
    },
    "forecast": {
      "title": "What 2026 Holds For You Both",
      "content": "[3 sentences about the year ahead for this relationship]"
    },
    "advice": {
      "title": "The One Thing That Changes Everything",
      "content": "[1-2 sentences of the single most important insight for this pairing]"
    }
  }
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstContent = message.content[0]
  const rawText = firstContent && firstContent.type === 'text' ? firstContent.text : ''

  let compatibilityData
  try {
    compatibilityData = JSON.parse(rawText)
  } catch (err: any) {
    console.error('[generate-compatibility] JSON.parse failed, attempting regex fallback', {
      endpoint: 'generate-compatibility',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      parseError: err instanceof Error ? err.message : String(err),
      archetype,
      firstName,
      language,
    })
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      compatibilityData = JSON.parse(match[0])
    } else {
      console.error('[generate-compatibility] No JSON object found in AI response', {
        endpoint: 'generate-compatibility',
        timestamp: new Date().toISOString(),
        rawResponsePreview: (rawText || '').slice(0, 500),
        parseError: 'No JSON object matched in response body',
        archetype,
        firstName,
        language,
      })
      throw createError({
        statusCode: 500,
        message: 'Failed to parse compatibility report'
      })
    }
  }

  return { success: true, compatibility: compatibilityData }
})
