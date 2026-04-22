import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { BirthChartSchema, validateBirthChartTitle, type BirthChartType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const timeOfBirth    = sanitizeString(body.timeOfBirth || '', 10)
  const city           = sanitizeString(body.city, 100)
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = Number(body.lifePathNumber)
  const language       = sanitizeString(body.language || 'en', 5)

  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')
  assertInput(isValidDateOfBirth(dateOfBirth), 'Invalid dateOfBirth')
  assertInput(!!city, 'city is required')

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

  const dob = new Date(dateOfBirth)
  const birthYear  = dob.getFullYear()
  const birthMonth = dob.toLocaleString('en-US', { month: 'long' })
  const birthDay   = dob.getDate()

  const systemPrompt = `You are OMENORA — a precision natal chart analyst. Your voice is direct, poetic, and unflinching. You do not hedge. You do not list generic traits. You synthesize planetary placements into a portrait of a specific human being's central tension and greatest leverage point. Every reading you write feels like it was written for one person and could not describe anyone else. You are not a fortune teller — you are a mirror.`

  const userPrompt = `${langInstruction}

Generate a full natal chart reading for ${firstName}.

Birth data:
- Date: ${birthMonth} ${birthDay}, ${birthYear}
- Time of birth: ${timeOfBirth}
- Place of birth: ${city}
- Life Path Number: ${lifePathNumber}
- Archetype: ${archetype}

---

STEP 1 — CALCULATE PLACEMENTS

Rising Sign (Ascendant): Estimate from time of birth using this 2-hour table.
Adjust by birth location latitude if ${city} is far from the equator (±1 sign for extreme latitudes).

00:00–01:59 → Virgo
02:00–03:59 → Libra
04:00–05:59 → Scorpio
06:00–07:59 → Sagittarius
08:00–09:59 → Capricorn
10:00–11:59 → Aquarius
12:00–13:59 → Pisces
14:00–15:59 → Aries
16:00–17:59 → Taurus
18:00–19:59 → Gemini
20:00–21:59 → Cancer
22:00–23:59 → Leo

Sun Sign: Derive from birth month and day using standard zodiac cusp dates.

Moon Sign: Estimate from birth date and time. The Moon moves ~1 sign every 2.5 days — use birth date position in the lunar cycle and adjust by time of birth.

Dominant Planet: Choose the planet that most powerfully resonates with both their archetype (${archetype}) and the combination of their Sun/Moon/Rising. This should feel inevitable, not arbitrary.

Power House: Identify the most activated house based on their archetype and dominant planet. Name it as "Nth House" with a 5–8 word descriptor of what it rules for them personally.

Chart Title: 4–6 word poetic title that names their essential nature as revealed by their planetary placements. CRITICAL: Do NOT use any archetype name (Phoenix, Alchemist, Catalyst, Storm, Sage, Visionary, Guardian, Mirror, Wildfire, Wanderer, Lighthouse, Architect) in this title. Use poetic planetary/elemental language instead.

---

STEP 2 — WRITE THE READING
Write a full natal chart reading of 220–260 words directed at ${firstName} using "you".
Write at B2 English level. Short sentences. No astrology jargon without explanation. Every placement must be translated into plain human behaviour — not star sign stereotypes.
Structure in this exact sequence — no headers, continuous prose:
1. RISING MASK (2–3 sentences): Open with their Rising Sign. Describe how ${firstName} comes across to people who first meet them — and why that first impression is both real and incomplete.
2. CORE TENSION (4–5 sentences): Name how Sun and Moon interact. What is the daily inner conflict — what ${firstName} wants versus what ${firstName} needs. Make this feel like something they already know but have never heard named.
3. DOMINANT PLANET & POWER HOUSE (3–4 sentences): Name the dominant planet in plain terms — what it makes ${firstName} drawn to, good at, and sometimes obsessed by. Then name the Power House as the life area where ${firstName} pours everything.
4. LIFE PATH INTEGRATION (2–3 sentences): Weave in Life Path ${lifePathNumber} in plain terms — what pattern it creates in ${firstName}'s life choices.
5. THE CRUCIBLE (2–3 sentences): Name the central challenge this chart is built around. End with one direct sentence telling ${firstName} exactly what they are here to do.

---

STEP 3 — WRITE THE 2026 FORECAST

Write 3 sentences tied to actual 2026 planetary transits relevant to this chart:
- Saturn's house transit for this Rising Sign
- Neptune's position and how it affects this chart
- Uranus ingress or major transit and its impact

Make the forecast specific to the placements above — not generic 2026 predictions.

---

Return ONLY valid JSON with no markdown fences:
{
  "risingSign": "Sign name only",
  "sunSign": "Sign name only",
  "moonSign": "Sign name only",
  "dominantPlanet": "Planet name only",
  "powerHouse": "Nth House — 5–8 word descriptor",
  "chartTitle": "4–6 word poetic title",
  "reading": "Full natal chart reading, 220–260 words",
  "forecast2026": "3-sentence 2026 planetary forecast"
}`

  const birthChartJsonSchema = {
    type: 'object',
    properties: {
      risingSign:     { type: 'string' },
      sunSign:        { type: 'string' },
      moonSign:       { type: 'string' },
      dominantPlanet: { type: 'string' },
      powerHouse:     { type: 'string' },
      chartTitle:     { type: 'string' },
      reading:        { type: 'string' },
      forecast2026:   { type: 'string' },
    },
    required: ['risingSign', 'sunSign', 'moonSign', 'dominantPlanet', 'powerHouse', 'chartTitle', 'reading', 'forecast2026'],
  } as const

  const message = await withAiRetry('generate-birth-chart', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      output_config: { format: jsonSchemaOutputFormat(birthChartJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstBlock = message.content[0]
    const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''
    console.error('[generate-birth-chart] Structured output returned null parsed_output', {
      endpoint: 'generate-birth-chart',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse birth chart JSON' })
  }

  const zodResult = BirthChartSchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-birth-chart] Schema validation failed after structured output', {
      endpoint: 'generate-birth-chart',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse birth chart JSON' })
  }

  const birthChart: BirthChartType = validateBirthChartTitle(zodResult.data, archetype)

  return { success: true, birthChart }
})
