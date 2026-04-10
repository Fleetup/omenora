import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { firstName, dateOfBirth, timeOfBirth, city, archetype, lifePathNumber, language } = body

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

  const birthYear = new Date(dateOfBirth).getFullYear()
  const birthMonth = new Date(dateOfBirth).toLocaleString('default', { month: 'long' })

  const prompt = `${langInstruction}

You are OMENORA, an AI birth chart analyst. Speak with quiet precision.

Generate a full natal chart reading for ${firstName}.

Birth data:
- Date: ${birthMonth} ${birthYear}
- Time of birth: ${timeOfBirth}
- Place: ${city}
- Life Path Number: ${lifePathNumber}
- Archetype: ${archetype}

Estimate Rising Sign from time of birth using this table:
00:00–01:59 → Virgo · 02:00–03:59 → Libra · 04:00–05:59 → Scorpio
06:00–07:59 → Sagittarius · 08:00–09:59 → Capricorn · 10:00–11:59 → Aquarius
12:00–13:59 → Pisces · 14:00–15:59 → Aries · 16:00–17:59 → Taurus
18:00–19:59 → Gemini · 20:00–21:59 → Cancer · 22:00–23:59 → Leo

Calculate Sun sign from birth month and day.
Estimate Moon sign from birth date and time patterns.
Select a dominant planet that resonates with their archetype.

Write a 180–220 word personal reading that:
1. Opens with their Rising Sign and the mask it shows the world
2. Explains how Sun and Moon create internal tension or harmony in ${firstName}
3. Names their most activated house based on their archetype
4. Gives a specific 2026 planetary forecast

Speak directly to ${firstName}. Be specific — not generic.

Return ONLY valid JSON:
{
  "risingSign": "Sign name",
  "sunSign": "Sign name",
  "moonSign": "Sign name",
  "dominantPlanet": "Planet name",
  "powerHouse": "Nth House — short description",
  "chartTitle": "Short poetic chart title, 4–6 words",
  "reading": "Full natal chart reading, 180–220 words",
  "forecast2026": "2026 planetary forecast tied to this chart, 2–3 sentences"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 900,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let birthChart
  try {
    birthChart = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      birthChart = JSON.parse(match[0])
    } else {
      throw createError({ statusCode: 500, message: 'Failed to parse birth chart' })
    }
  }

  return { success: true, birthChart }
})
