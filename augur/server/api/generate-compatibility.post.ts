import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { CompatibilitySchema, type CompatibilityType, type CompatibilityReceiptType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'
import { getSunSign, getLifePathNumber } from '~~/server/utils/quick-signs'
import { getPlanetaryTransits } from '~~/server/utils/planetaryTransits'
import { calculateNatalChart, assignArchetypeFromChart } from '~~/app/utils/natalChart'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)

  // ── Raw field extraction ─────────────────────────────────────────────────

  const firstName      = sanitizeString(body.firstName, 50)
  const partnerName    = sanitizeString(body.partnerName, 50)
  const partnerDob     = sanitizeString(body.partnerDob, 10)
  const partnerCity    = sanitizeString(body.partnerCity, 100)
  const language       = sanitizeString(body.language || 'en', 5)
  const previewMode    = body.previewMode === true

  // Optional archetype-reading fields (CASE 1) vs. standalone fields (CASE 2)
  const rawArchetype      = body.archetype  != null ? sanitizeString(body.archetype, 30)  : null
  const rawElement        = body.element    != null ? sanitizeString(body.element, 20)    : null
  const rawLifePathNumber = body.lifePathNumber != null ? Number(body.lifePathNumber)      : null
  const rawPowerTraits    = Array.isArray(body.powerTraits)
    ? (body.powerTraits as unknown[]).slice(0, 5).map((t) => sanitizeString(String(t ?? ''), 80))
    : null
  const rawDateOfBirth    = body.dateOfBirth != null ? sanitizeString(body.dateOfBirth, 10) : null

  // ── Input validation ─────────────────────────────────────────────────────

  if (!previewMode) {
    assertInput(!!firstName,  'firstName is required')
    assertInput(!!partnerName, 'partnerName is required')
  }
  assertInput(isValidDateOfBirth(partnerDob), 'Invalid partner date of birth')

  // CASE 1: archetype-reading data present — validate it
  // CASE 2: standalone mode — dateOfBirth (User A) is required instead
  const standaloneMode = rawArchetype === null || rawArchetype === ''
  if (!standaloneMode) {
    assertInput(isValidArchetype(rawArchetype!), 'Invalid archetype')
  } else {
    assertInput(
      rawDateOfBirth !== null && isValidDateOfBirth(rawDateOfBirth),
      'dateOfBirth is required when archetype is not provided',
    )
  }

  // ── Resolve Person 1 fields ──────────────────────────────────────────────

  let archetype:      string
  let element:        string
  let lifePathNumber: number
  let powerTraits:    string[]
  let person1Dob:     string

  if (!standaloneMode) {
    // CASE 1: use caller-supplied values verbatim
    archetype      = rawArchetype!
    element        = rawElement ?? ''
    lifePathNumber = rawLifePathNumber ?? 0
    powerTraits    = rawPowerTraits ?? []
    person1Dob     = rawDateOfBirth ?? ''
  } else {
    // CASE 2: derive everything from dateOfBirth using deterministic calculations
    person1Dob = rawDateOfBirth!

    const person1LifePathResult = getLifePathNumber(person1Dob)
    lifePathNumber = person1LifePathResult.number

    const person1SunSign = getSunSign(person1Dob)
    // Element from quick-signs is Title Case (Fire/Earth/Air/Water) — matches prompt expectations
    element = person1SunSign.element

    // Derive archetype via Swiss Ephemeris natal chart (same pipeline as calculate-chart.post.ts).
    // With lat=0/lon=0 and no time, ascendant is null — archetype resolves from Sun+Moon elements only.
    const chart  = calculateNatalChart({ dateOfBirth: person1Dob, timeOfBirth: null, utcOffsetMinutes: 0, city: '', lat: 0, lon: 0 })
    archetype    = assignArchetypeFromChart(chart)

    powerTraits = rawPowerTraits ?? []
  }

  // ── Partner calculations ─────────────────────────────────────────────────

  const partnerLifePath = getLifePathNumber(partnerDob).number
  const partnerSunSign  = getSunSign(partnerDob)
  const partnerElement  = partnerSunSign.element

  const partnerSeason = (() => {
    const month = new Date(partnerDob).getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  })()

  // ── Current planetary transits (7-day forecast window) ────────────────

  const todayDate  = new Date().toISOString().split('T')[0]!
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const forecastEndDate = sevenDaysFromNow.toISOString().split('T')[0]!

  const currentTransits = getPlanetaryTransits(todayDate)
  const forecastTransits = getPlanetaryTransits(forecastEndDate)

  // ── Synastry element notes (deterministic, server-side) ──────────────
  //
  // Derives meaningful elemental synastry notes from both people's elements.
  // These are factual, rule-based statements — not AI invention.

  const ELEMENT_PAIRS: Record<string, Record<string, string>> = {
    Fire: {
      Fire:  'Fire + Fire: high passion, risk of burnout without space',
      Earth: 'Fire + Earth: drive meets stability — grounding tension',
      Air:   'Fire + Air: Air fans the flame — mentally stimulating match',
      Water: 'Fire + Water: intense chemistry, steam when pressure builds',
    },
    Earth: {
      Fire:  'Earth + Fire: stability challenged by spontaneity',
      Earth: 'Earth + Earth: reliable foundation, slow to change',
      Air:   'Earth + Air: practicality vs. ideas — communication gap risk',
      Water: 'Earth + Water: Water nourishes Earth — naturally complementary',
    },
    Air: {
      Fire:  'Air + Fire: ideas ignite action — fast-moving connection',
      Earth: 'Air + Earth: vision vs. structure — needs shared goals',
      Air:   'Air + Air: strong mental bond, may lack emotional grounding',
      Water: 'Air + Water: logical meets intuitive — requires translation',
    },
    Water: {
      Fire:  'Water + Fire: deep feeling meets boldness — intense polarity',
      Earth: 'Water + Earth: Water finds its container — stabilising bond',
      Air:   'Water + Air: emotion vs. logic — empathy bridges the gap',
      Water: 'Water + Water: profound emotional depth, boundary blurring risk',
    },
  }

  const p1Element = element || 'Unknown'
  const p2Element = partnerElement
  const elementNote = ELEMENT_PAIRS[p1Element]?.[p2Element]
    ?? `${p1Element} + ${p2Element}: elemental interplay shapes the dynamic`

  const lifePathNote = (() => {
    const diff = Math.abs(lifePathNumber - partnerLifePath)
    if (diff === 0)  return `Life Path ${lifePathNumber} + ${partnerLifePath}: shared number — mirrored life mission, risk of echo chamber`
    if (diff <= 2)   return `Life Path ${lifePathNumber} + ${partnerLifePath}: compatible rhythm — goals align with natural variance`
    if (diff <= 5)   return `Life Path ${lifePathNumber} + ${partnerLifePath}: moderate contrast — complementary if communication is strong`
    return           `Life Path ${lifePathNumber} + ${partnerLifePath}: significant contrast — different life missions require intentional bridging`
  })()

  // ── Language instruction ──────────────────────────────────────────────────

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
    ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
    zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
  }
  const langInstruction = languageInstructions[language] ?? languageInstructions['en'] ?? ''

  // ── Anthropic client ──────────────────────────────────────────────────────

  const client = new Anthropic({
    apiKey: config.anthropicApiKey as string,
  })

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny analysis system. Generate a 7-section compatibility report between two people.
Be specific, poetic, and personal. Reference their actual names, archetypes, life paths, and elements throughout.
Never be generic. Write in second person to ${firstName || 'the user'}.

Person 1 (the user):
- Name: ${firstName || '(not provided — address as "you")'}
- Archetype: ${archetype}
- Element: ${element}
- Life Path: ${lifePathNumber}
- Traits: ${powerTraits?.join(', ') || 'not provided'}

Person 2 (their person):
- Name: ${partnerName || '(not provided — refer to as "your partner")'}
- Born: ${partnerSeason} season
- Element: ${partnerElement}
- Life Path: ${partnerLifePath}
- Sun sign: ${partnerSunSign.name}
- City: ${partnerCity}

ELEMENTAL SYNASTRY:
${elementNote}

NUMEROLOGY:
${lifePathNote}

CURRENT PLANETARY WINDOW (${todayDate} – ${forecastEndDate}):
- Sun: ${currentTransits.sun.sign} ${currentTransits.sun.degree}° → ${forecastTransits.sun.sign} ${forecastTransits.sun.degree}°
- Moon: ${currentTransits.moon.sign} ${currentTransits.moon.degree}° → ${forecastTransits.moon.sign} ${forecastTransits.moon.degree}° (${currentTransits.moonPhaseName})
- Mercury: ${currentTransits.mercury.sign} ${currentTransits.mercury.degree}° → ${forecastTransits.mercury.sign} ${forecastTransits.mercury.degree}°
- Venus: ${currentTransits.venus.sign} ${currentTransits.venus.degree}° → ${forecastTransits.venus.sign} ${forecastTransits.venus.degree}°
- Mars: ${currentTransits.mars.sign} ${currentTransits.mars.degree}° → ${forecastTransits.mars.sign} ${forecastTransits.mars.degree}°

Generate exactly 7 sections. Each section MUST be specific to this exact pairing — never a generic template.

Return ONLY valid JSON, no markdown:
{
  "compatibilityScore": 85,
  "compatibilityTitle": "The Alchemist meets The Storm — transformation through tension",
  "sections": {
    "bond": {
      "title": "The Bond That Holds You Together",
      "content": "[3-4 sentences: why these two connect at a fundamental level — specific to their archetypes and elements]"
    },
    "strength": {
      "title": "Your Greatest Strength Together",
      "content": "[2-3 sentences: the specific advantage this pairing creates that neither person has alone]"
    },
    "challenge": {
      "title": "The Tension You Must Navigate",
      "content": "[2-3 sentences: the core friction between their elemental and archetypal energies — honest, not softened]"
    },
    "communication": {
      "title": "The Communication Pattern",
      "content": "[3 sentences: how these two people talk, process conflict, and repair — what works, what breaks down, what heals it. Ground in Mercury position and their elements.]"
    },
    "powerDynamic": {
      "title": "The Power Dynamic",
      "content": "[3 sentences: who leads, who follows, where the balance tips and why — be precise, name the archetype that tends to dominate and in which situations]"
    },
    "forecast": {
      "title": "The Next 7 Days",
      "content": "[3 sentences: use the actual planetary window above to describe what this specific couple will feel in the coming week. Name the planets and signs explicitly. Be a real forecast, not generic.]"
    },
    "advice": {
      "title": "The One Move That Changes Everything",
      "content": "[1-2 sentences: one concrete, specific action rooted in both charts that shifts the dynamic more than any other single thing]"
    }
  }
}`

  const compatibilityJsonSchema = {
    type: 'object',
    properties: {
      compatibilityScore: { type: 'number' },
      compatibilityTitle: { type: 'string' },
      sections: {
        type: 'object',
        properties: {
          bond:          { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          strength:      { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          challenge:     { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          communication: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          powerDynamic:  { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          forecast:      { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
          advice:        { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] },
        },
        required: ['bond', 'strength', 'challenge', 'communication', 'powerDynamic', 'forecast', 'advice'],
      },
    },
    required: ['compatibilityScore', 'compatibilityTitle', 'sections'],
  } as const

  const message = await withAiRetry('generate-compatibility', () =>
    client.messages.parse({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are writing a personal relationship compatibility reading between two specific people. Your analysis is grounded, honest, and precise. You name real dynamics — not flattering generalities. Every sentence must be specific to these two people's actual combination. Write at B2 English level. Short sentences. No cultural idioms. Make the reader feel their relationship has just been seen clearly for the first time.`,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: jsonSchemaOutputFormat(compatibilityJsonSchema) },
    })
  )

  const rawParsed = message.parsed_output

  if (!rawParsed) {
    const firstContent = message.content[0]
    const rawText = firstContent?.type === 'text' ? firstContent.text : ''
    console.error('[generate-compatibility] Structured output returned null parsed_output', {
      endpoint: 'generate-compatibility',
      timestamp: new Date().toISOString(),
      rawResponsePreview: (rawText || '').slice(0, 500),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse compatibility report' })
  }

  const zodResult = CompatibilitySchema.safeParse(rawParsed)
  if (!zodResult.success) {
    console.error('[generate-compatibility] Schema validation failed after structured output', {
      endpoint: 'generate-compatibility',
      timestamp: new Date().toISOString(),
      zodErrors: zodResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      archetype,
      firstName,
      language,
    })
    throw createError({ statusCode: 500, message: 'Failed to parse compatibility report' })
  }

  const compatibilityData: CompatibilityType = zodResult.data

  // ── Change 3: Preview mode transform ─────────────────────────────────────
  // When previewMode is true: keep score, title, and challenge section fully.
  // Replace the other 4 sections' content with "[locked]" but keep their titles.

  const sections = previewMode
    ? {
        bond:          { title: compatibilityData.sections.bond.title,          content: '[locked]' },
        strength:      { title: compatibilityData.sections.strength.title,      content: '[locked]' },
        challenge:     compatibilityData.sections.challenge,
        communication: { title: compatibilityData.sections.communication.title, content: '[locked]' },
        powerDynamic:  { title: compatibilityData.sections.powerDynamic.title,  content: '[locked]' },
        forecast:      { title: compatibilityData.sections.forecast.title,      content: '[locked]' },
        advice:        { title: compatibilityData.sections.advice.title,        content: '[locked]' },
      }
    : compatibilityData.sections

  // ── Change 4: Calculation receipt ─────────────────────────────────────────

  const person1SunSign = person1Dob && isValidDateOfBirth(person1Dob)
    ? getSunSign(person1Dob)
    : null

  const calculationReceipt: CompatibilityReceiptType = {
    person1: {
      name:           firstName,
      dateOfBirth:    person1Dob,
      sunSign:        person1SunSign?.name ?? '',
      element:        element || person1SunSign?.element || '',
      lifePathNumber: lifePathNumber,
      archetype:      archetype,
    },
    person2: {
      name:           partnerName,
      dateOfBirth:    partnerDob,
      sunSign:        partnerSunSign.name,
      element:        partnerElement,
      lifePathNumber: partnerLifePath,
    },
    synastryNotes: [
      elementNote,
      lifePathNote,
    ],
    tradition:         'Western (Tropical)',
    calculationSource: 'Swiss Ephemeris',
    generatedAt:       new Date().toISOString(),
  }

  return {
    success: true,
    compatibility: {
      compatibilityScore: compatibilityData.compatibilityScore,
      compatibilityTitle: compatibilityData.compatibilityTitle,
      sections,
      ...(previewMode ? { previewMode: true } : {}),
      calculationReceipt,
    },
  }
})
