import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    dateOfBirth,
    lifePathNumber,
    archetype,
    nakshatra,
    vedicPlanet,
    vedicElement,
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let vedicData
  try {
    vedicData = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      vedicData = JSON.parse(match[0])
    } else {
      throw createError({ statusCode: 500, message: 'Failed to parse Vedic section' })
    }
  }

  return { success: true, vedic: vedicData }
})
