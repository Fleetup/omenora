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

Chart Title: 4–6 word poetic title that names their essential nature — not their archetype label, but the specific flavor of it revealed by the placements.

---

STEP 2 — WRITE THE READING

Write a full natal chart reading of 220–260 words directed at ${firstName} using "you".

Structure it in this exact sequence — no headers, continuous prose:

1. RISING MASK (2–3 sentences): Open with their Rising Sign. Describe the specific mask it shows the world and why it's both genuine and misleading.

2. CORE TENSION (4–5 sentences): Name how Sun and Moon interact. Are they in friction or flow? What inner argument does ${firstName} carry every day? Be specific to these three signs together — not generic.

3. DOMINANT PLANET & POWER HOUSE (3–4 sentences): Name the dominant planet and what it amplifies in this specific chart. Then activate the Power House — describe what blazes there, what ${firstName} pours everything into.

4. LIFE PATH INTEGRATION (2–3 sentences): Weave in Life Path ${lifePathNumber}. Where does it align with the chart's momentum? Where does it create paradox?

5. THE CRUCIBLE (2–3 sentences): Close with the central challenge this chart is designed to forge. Name what ${firstName} is learning. End with one direct imperative sentence.

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text.trim() : ''

  let birthChart
  try {
    birthChart = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        birthChart = JSON.parse(match[0])
      } catch {
        throw createError({ statusCode: 500, message: 'Failed to parse birth chart JSON' })
      }
    } else {
      throw createError({ statusCode: 500, message: 'No JSON found in birth chart response' })
    }
  }

  return { success: true, birthChart }
})
