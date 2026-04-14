import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    archetype,
    element,
    lifePathNumber,
    answers,
    dateOfBirth,
    city: _city,
    language,
  } = body

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstContent = message.content[0]
  const rawText = firstContent && firstContent.type === 'text' ? firstContent.text : ''

  let calendarData
  try {
    calendarData = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      calendarData = JSON.parse(match[0])
    } else {
      throw createError({ statusCode: 500, message: 'Failed to parse calendar' })
    }
  }

  return { success: true, calendar: calendarData }
})
