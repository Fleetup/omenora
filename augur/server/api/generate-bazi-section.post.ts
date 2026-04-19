import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    pillars,
    dominantElement,
    archetype,
    lifePathNumber,
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

You are OMENORA with Chinese BaZi (Four Pillars) astrology knowledge.
Generate a BaZi destiny section for ${firstName}.

Their Four Pillars:
- Year Pillar: ${pillars.year.stem.name} (${pillars.year.stem.element}) + ${pillars.year.branch.name} (${pillars.year.branch.animal})
  Year energy: ${pillars.year.stem.quality}

- Month Pillar: ${pillars.month.stem.name} (${pillars.month.stem.element}) + ${pillars.month.branch.name} (${pillars.month.branch.animal})
  Month energy: ${pillars.month.stem.quality}

- Day Pillar: ${pillars.day.stem.name} (${pillars.day.stem.element}) + ${pillars.day.branch.name} (${pillars.day.branch.animal})
  Day energy: ${pillars.day.stem.quality}

- Dominant Element: ${dominantElement}
- Western Archetype: ${archetype}
- Life Path: ${lifePathNumber}

Write a BaZi reading that:
1. Explains their dominant element and what it means
2. How their Day Master (${pillars.day.stem.name}) shapes their personality
3. Their wealth luck patterns for 2026
4. Career and relationship energies
5. Lucky directions and colors

Write directly to ${firstName} in second person.
Use Chinese metaphysical terms naturally but explain them briefly.
Length: 200-250 words.

Return ONLY valid JSON:
{
  "dayMaster": "${pillars.day.stem.name} ${pillars.day.stem.element}",
  "dominantElement": "${dominantElement}",
  "baziTitle": "Poetic title for their BaZi nature",
  "reading": "Full BaZi reading paragraph",
  "wealthLuck2026": "One sentence about 2026 wealth luck",
  "luckyDirections": ["North", "Southeast"],
  "luckyColors": ["color1", "color2"],
  "luckyNumbers": [1, 6, 8]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let baziData
  try {
    baziData = JSON.parse(rawText)
  } catch (err: any) {
    console.error('[generate-bazi-section] JSON.parse failed, attempting regex fallback', {
      endpoint: 'generate-bazi-section',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      parseError: err instanceof Error ? err.message : String(err),
      archetype,
      firstName,
      language,
    })
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      baziData = JSON.parse(match[0])
    } else {
      console.error('[generate-bazi-section] No JSON object found in AI response', {
        endpoint: 'generate-bazi-section',
        timestamp: new Date().toISOString(),
        rawResponsePreview: (rawText || '').slice(0, 500),
        parseError: 'No JSON object matched in response body',
        archetype,
        firstName,
        language,
      })
      throw createError({ statusCode: 500, message: 'Failed to parse BaZi section' })
    }
  }

  return { success: true, bazi: baziData }
})
