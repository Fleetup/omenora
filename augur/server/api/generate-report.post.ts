import Anthropic from '@anthropic-ai/sdk'

const ARCHETYPE_SYMBOLS: Record<string, string> = {
  phoenix:   '●',
  architect: '◆',
  storm:     '▲',
  lighthouse:'◇',
  wanderer:  '○',
  alchemist: '⬡',
  guardian:  '□',
  visionary: '⬟',
  mirror:    '◉',
  catalyst:  '✦',
  sage:      '▽',
  wildfire:  '★',
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const city           = sanitizeString(body.city, 100)
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = body.lifePathNumber
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const language       = sanitizeString(body.language || 'en', 5)
  const answers        = body.answers

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!dateOfBirth, 'dateOfBirth is required')
  assertInput(isValidDateOfBirth(dateOfBirth), 'Invalid dateOfBirth')
  assertInput(!!city, 'city is required')
  assertInput(isValidArchetype(body.archetype), 'Invalid archetype')
  assertInput(answers !== null && typeof answers === 'object', 'Invalid answers')

  const anthropicApiKey = config.anthropicApiKey as string | undefined
  if (!anthropicApiKey) {
    throw createError({
      statusCode: 503,
      message: 'Report generation service is not configured. Please try again later.',
    })
  }

  const client = new Anthropic({
    apiKey: anthropicApiKey,
  })

  const archetypeDescriptions: Record<string, string> = {
    phoenix: 'The Phoenix — a soul who rises from destruction stronger than before',
    architect: 'The Silent Architect — a mind that builds systems others never see',
    storm: 'The Storm Caller — a force that disrupts, electrifies, and moves things',
    lighthouse: 'The Lighthouse — a steady guide who illuminates paths for others',
    wanderer: 'The Wanderer — a seeker who finds meaning in movement and change',
    alchemist: 'The Alchemist — a transformer who turns pressure into gold',
    guardian: 'The Guardian — a protector whose strength is rooted in deep loyalty',
    visionary: 'The Visionary — a dreamer who sees futures others cannot imagine',
    mirror: 'The Mirror — an empath who reflects and amplifies what surrounds them',
    catalyst: 'The Catalyst — an activator who makes things happen simply by arriving',
    sage: 'The Sage — a keeper of pattern and wisdom earned through observation',
    wildfire: 'The Wildfire — an untameable energy that spreads and transforms everything',
  }

  const regionalContext: Record<string, string> = {
    western: 'Use Western astrology archetypes, Jungian psychology references, and behavioral science framing. Mention "behavioral patterns" and "chronobiological research".',
    india: 'Blend Western archetypes with Vedic concepts. Reference their Nakshatra energy (lunar mansion). Mention karma, dharma, and life cycles naturally. Use terms like "cosmic blueprint" and "karmic patterns". Feel authentically Vedic without being a full Jyotish reading.',
    china: 'Blend Western archetypes with Chinese metaphysical concepts. Reference five elements (Wu Xing) naturally. Mention annual fortune cycles and lucky directions. Use terms like "heaven luck" and "timing windows".',
    latam: 'Use passionate, emotionally resonant language. Reference cosmic energy and universal signs. Weave in themes of love, family destiny, and spiritual protection. Feel warm and personal. Mention "the universe" as an active force.',
    korea: 'Use precise personality-focused language. Reference behavioral patterns and relationship dynamics heavily. Mention how their type interacts with others. Feel analytical but warm. Compatibility and social dynamics are important.',
    middleeast: 'Use dignified, destiny-focused language. Reference fate, what is written, and life purpose. Focus on character, destiny, and life mission. Use terms like "your path" and "what is meant".',
  }

  const regionPrompt = regionalContext[region as string] || regionalContext.western

  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal. Habla directamente a la persona.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso, poético e pessoal. Fale diretamente com a pessoa.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
    ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
    zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
  }
  const langInstruction = languageInstructions[language] ?? languageInstructions['en'] ?? ''

  const archetypeDesc = archetypeDescriptions[archetype] || archetype

  const decisionPattern =
    answers.q1 === 'trust' ? 'acts on gut instinct' :
    answers.q1 === 'wait'  ? 'waits for evidence' :
    answers.q1 === 'talk'  ? 'processes through others' :
                             'suppresses instinct and pushes through'

  const hiddenSelf =
    answers.q2 === 'softer'    ? 'softer than perceived' :
    answers.q2 === 'sharper'   ? 'sharper and more perceptive' :
    answers.q2 === 'ambitious' ? 'more driven than shown' :
                                 'carrying more uncertainty than visible'

  const relationshipWound =
    answers.q3 === 'leaving' ? 'people leaving without explanation' :
    answers.q3 === 'unseen'  ? 'being needed but not truly seen' :
    answers.q3 === 'giving'  ? 'giving more than received' :
                               'feeling like a burden to others'

  const coreThought =
    answers.q4 === 'capable' ? 'fear of being exposed as less capable' :
    answers.q4 === 'alone'   ? 'fear of ending up alone' :
    answers.q4 === 'matters' ? 'fear that nothing truly matters' :
                               'fear of being too much for others'

  const successResponse =
    answers.q6 === 'enjoy'  ? 'fully present with wins' :
    answers.q6 === 'wonder' ? 'waits for good things to be taken away' :
    answers.q6 === 'share'  ? 'joy through others' :
                              'always looking toward the next horizon'

  const shadowFear =
    answers.q7 === 'givesup'      ? 'surrendering to inertia' :
    answers.q7 === 'feelsnothing' ? 'achieving everything and feeling nothing' :
    answers.q7 === 'needstoo'     ? 'becoming dependent on someone' :
                                    'isolation as self-protection'

  const birthYear = new Date(dateOfBirth).getFullYear()
  const birthMonth = new Date(dateOfBirth).toLocaleString('default', { month: 'long' })
  const birthSeason = (() => {
    const month = new Date(dateOfBirth).getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  })()

  const prompt = `${langInstruction}

You are OMENORA, an AI destiny analysis system combining behavioral science, chronobiology, and pattern recognition. You speak with quiet authority — like a brilliant friend who has studied ${firstName} for years and finally gets to share what they've observed.

CRITICAL PSYCHOLOGICAL TECHNIQUES TO USE:
All 8 must appear naturally throughout the report.

1. RAINBOW RUSE — pair each trait with its tension:
   "You can be the most giving person in the room, and the most withholding — sometimes in the same conversation."

2. AT-TIMES PHRASING — makes universal truths feel personal:
   "At times you surprise even yourself with how certain you become."

3. PAST STRUGGLE VALIDATION — acknowledge unspoken history:
   "Something has shifted in you in the past few years — a version of you that was more trusting no longer fully exists."

4. HIDDEN GIFT REVEAL — the thing they know but haven't been told:
   "Most people around you will never fully understand what is happening inside you when you go quiet."

5. SPECIFIC FAKE SPECIFICITY — sounds precise, applies broadly:
   "There is a particular period — likely late spring — where something that has felt stuck will finally move."

6. AUTHORITY ANCHORING — ground in science:
   "Chronobiological research on winter-born individuals shows..."
   "Behavioral pattern analysis reveals..."

7. DIRECT NAME USE — use ${firstName} 3-4 times within section content, not just openings.

8. POSITIVE FRAMING OF WEAKNESS — reframe every challenge as evidence of depth:
   Instead of "you overthink" → "Your mind refuses to accept incomplete answers — this is not a flaw, it is the engine of every significant thing you will ever build."

User profile:
- Name: ${firstName}
- Born: ${birthMonth} ${birthYear} in ${city}
- Birth season: ${birthSeason}
- Life Path Number: ${lifePathNumber}
- Destiny Archetype: ${archetypeDesc}
- Decision pattern: ${decisionPattern}
- Hidden self: ${hiddenSelf}
- Relationship wound: ${relationshipWound}
- Core thought: ${coreThought}
- How others label them: ${answers.q5}
- Success pattern: ${successResponse}
- Shadow fear: ${shadowFear}

Regional style: ${regionPrompt}

Generate exactly 7 sections. Apply all 8 techniques naturally — they should not feel like techniques, they should feel like truth.

Return ONLY valid JSON with this structure:
{
  "archetypeName": "The [Name]",
  "archetypeSymbol": "[single character]",
  "element": "[Fire/Earth/Air/Water]",
  "powerTraits": ["trait1", "trait2", "trait3"],
  "sections": {
    "identity": {
      "title": "Who You Are",
      "content": "4-5 sentences. Open with their birth season creating something specific in them. Use rainbow ruse. Use their name once. End with hidden gift reveal."
    },
    "science": {
      "title": "The Science Behind You",
      "content": "3 sentences. Reference real chronobiology for their birth season. Use authority anchoring. Reference their life path number as a behavioral pattern."
    },
    "forecast": {
      "title": "Your 2026 Destiny",
      "content": "5 sentences. Use specific fake specificity with real month names. Name one turning point period precisely. Use at-times phrasing. Their success pattern is '${successResponse}' — reflect this in how they will receive upcoming wins. End with urgency."
    },
    "love": {
      "title": "Love & Connection",
      "content": "4 sentences. Their deepest relationship wound is '${relationshipWound}' — acknowledge this without naming it directly. Use rainbow ruse on their love pattern. Validate past struggle. Use their name once."
    },
    "purpose": {
      "title": "Career & Purpose",
      "content": "3-4 sentences. Reframe their core thought ('${coreThought}') as their greatest career fuel using positive framing of weakness. Reference archetype."
    },
    "gift": {
      "title": "Your Hidden Gift",
      "content": "3 sentences. Their hidden self is '${hiddenSelf}' — reveal this as the secret others never see. Make it feel like a truth being spoken for the first time. Use hidden gift reveal technique. End with: this is rare."
    },
    "affirmation": {
      "title": "Your Power Statement",
      "content": "ONE sentence maximum. Must include their name ${firstName}. Their shadow fear is '${shadowFear}' — the affirmation must speak directly to it without naming it explicitly. Must feel like something they would screenshot and save. Format: [Name], [poetic truth about their specific archetype journey]."
    }
  }
}`

  let message
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? 0
    if (status === 401 || status === 403) {
      throw createError({
        statusCode: 503,
        message: 'Report generation service authentication failed. Please contact support.',
      })
    }
    if (status === 429) {
      throw createError({
        statusCode: 429,
        message: 'Report generation is temporarily unavailable due to high demand. Please try again in a moment.',
      })
    }
    if (status === 404) {
      throw createError({
        statusCode: 500,
        message: 'Report generation model is unavailable. Please try again later.',
      })
    }
    if (status >= 500 || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
      throw createError({
        statusCode: 504,
        message: 'Report generation timed out. Please try again.',
      })
    }
    console.error('[generate-report] Anthropic API error:', {
      status,
      message: err?.message,
      code: err?.code,
    })
    throw createError({
      statusCode: 500,
      message: 'Report generation failed. Please try again.',
    })
  }

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let reportData
  try {
    reportData = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        reportData = JSON.parse(match[0])
      } catch {
        throw createError({
          statusCode: 500,
          message: 'Failed to parse report response. Please try again.',
        })
      }
    } else {
      console.error('[generate-report] Failed to parse AI response:', rawText?.slice(0, 200))
      throw createError({
        statusCode: 500,
        message: 'Failed to parse report response. Please try again.',
      })
    }
  }

  // Always override the AI-generated symbol with the canonical one for this
  // archetype so the canvas card renderer (which uses Inter font and cannot
  // display emoji or multi-codepoint sequences) gets a known-good character.
  const canonicalSymbol = ARCHETYPE_SYMBOLS[archetype]
  if (canonicalSymbol) {
    reportData.archetypeSymbol = canonicalSymbol
  }

  return { success: true, report: reportData }
})
