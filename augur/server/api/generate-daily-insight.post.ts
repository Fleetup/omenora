import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { firstName, archetype, lifePathNumber, element, region, targetDate, language } = body

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

  const date = new Date(targetDate || new Date())
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = date.toLocaleDateString('en-US', { month: 'long' })
  const dayNum = date.getDate()

  const moonPhase = (() => {
    const cycle = 29.53
    const known = new Date('2000-01-06')
    const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
    const phase = ((diff % cycle) + cycle) % cycle
    if (phase < 3.7) return 'New Moon'
    if (phase < 7.4) return 'Waxing Crescent'
    if (phase < 11.1) return 'First Quarter'
    if (phase < 14.8) return 'Waxing Gibbous'
    if (phase < 18.5) return 'Full Moon'
    if (phase < 22.2) return 'Waning Gibbous'
    if (phase < 25.9) return 'Last Quarter'
    return 'Waning Crescent'
  })()

  const regionalStyle = region === 'india'
    ? 'Weave in a Vedic concept naturally.'
    : region === 'china'
      ? 'Reference Chinese five element wisdom.'
      : region === 'latam'
        ? 'Use warm, spiritual language.'
        : 'Use behavioral science framing.'

  const prompt = `${langInstruction}

You are OMENORA. Generate a daily destiny insight for ${firstName}.

Their profile:
- Archetype: ${archetype}
- Element: ${element || 'Earth'}
- Life Path: ${lifePathNumber}

Today: ${dayName}, ${monthName} ${dayNum}
Moon Phase: ${moonPhase}
Regional style: ${regionalStyle}

Write a deeply personal daily insight that:
1. Opens with something specific about today's energy
2. Connects it to their archetype and life path
3. Gives ONE specific action or awareness for today
4. Ends with a short power phrase they can carry

Rules:
- Write directly to ${firstName}
- Reference the moon phase and day of week naturally
- Be specific — not generic horoscope language
- Length: exactly 120-150 words
- End with a one-line "Today's Frequency:" statement

Return ONLY valid JSON:
{
  "greeting": "Good morning, ${firstName}.",
  "insight": "Full insight text 120-150 words",
  "action": "One specific action for today in one sentence",
  "frequency": "Today's power phrase — short, memorable",
  "moonPhase": "${moonPhase}",
  "dayTheme": "3-5 word theme for today"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let insightData
  try {
    insightData = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      insightData = JSON.parse(match[0])
    } else {
      throw createError({ statusCode: 500, message: 'Failed to parse insight' })
    }
  }

  return { success: true, insight: insightData }
})
