import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// ── 30-theme rotation ─────────────────────────────────────────────────────
const INSIGHT_THEMES = [
  'self-trust and inner knowing',
  'relationships and connection',
  'career clarity and purpose',
  'emotional processing and release',
  'hidden strengths surfacing',
  'timing and patience',
  'communication and expression',
  'fear vs intuition',
  'energy and boundaries',
  'creativity and play',
  'vulnerability and courage',
  'decision making from values',
  'patterns from the past',
  'identity and authenticity',
  'rest and integration',
  'receiving and openness',
  'leadership and responsibility',
  'joy and lightness',
  'protection and discernment',
  'transformation and change',
  'giving and generosity',
  'healing and self-compassion',
  'connection to body and grounding',
  'spiritual alignment',
  'legacy and meaning',
  'abundance and worthiness',
  'solitude and reflection',
  'trust in the process',
  'courage and forward movement',
  'gratitude and presence',
]

// ── Subject line rotation ─────────────────────────────────────────────────
function buildSubjectLines(firstName: string, archetype: string, dateLabel: string): string[] {
  return [
    `Your insight for today, ${firstName}`,
    `${firstName} — something to sit with today`,
    `Today's reflection for the ${archetype}`,
    `${firstName}, this is for you today`,
    `A thought for ${dateLabel.split(',')[0]}`,
    `Your ${archetype} energy today`,
    `${firstName} — today's lens`,
    `What today holds for the ${archetype}`,
    `For you today, ${firstName}`,
    `${firstName} — worth reading this morning`,
    `Today's ${archetype} insight`,
    `A moment of reflection, ${firstName}`,
    `${firstName} — your daily reading`,
    `What the ${archetype} notices today`,
    `Today's thought for ${firstName}`,
  ]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const {
    firstName,
    archetype,
    lifePathNumber,
    element,
    region,
    targetDate,
    language,
    email,
  } = body

  // ── Date context ──────────────────────────────────────────────────────
  const today = targetDate ? new Date(targetDate) : new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 0)
  const dayOfYear = Math.floor(
    (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
  )

  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── Moon phase (kept from original) ───────────────────────────────────
  const moonPhase = (() => {
    const cycle = 29.53
    const known = new Date('2000-01-06')
    const diff = (today.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
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

  // ── Today's theme ─────────────────────────────────────────────────────
  const todayTheme = INSIGHT_THEMES[dayOfYear % INSIGHT_THEMES.length]!

  // ── Today's subject line ──────────────────────────────────────────────
  const subjectLines = buildSubjectLines(firstName, archetype, dateString)
  const todaySubject = subjectLines[dayOfYear % subjectLines.length]!

  // ── Language instruction (kept from original) ─────────────────────────
  const languageInstructions: Record<string, string> = {
    en: 'Respond entirely in English.',
    es: 'Responde completamente en español. Usa un tono cálido, poético y personal.',
    pt: 'Responda completamente em português brasileiro. Use tom caloroso e pessoal.',
    hi: 'पूरी तरह से हिंदी में जवाब दें। गर्म, काव्यात्मक और व्यक्तिगत स्वर का उपयोग करें।',
    ko: '전체적으로 한국어로 답변해 주세요. 따뜻하고 시적이며 개인적인 어조를 사용하세요.',
    zh: '完全用简体中文回答。使用温暖、诗意和个人化的语气。',
  }
  const langInstruction = languageInstructions[language as string] ?? languageInstructions['en'] ?? ''

  // ── Regional style (kept from original) ──────────────────────────────
  const regionalStyle = region === 'india'
    ? 'Weave in a Vedic concept naturally.'
    : region === 'china'
      ? 'Reference Chinese five element wisdom.'
      : region === 'latam'
        ? 'Use warm, spiritual language.'
        : 'Use behavioral science framing.'

  // ── Fetch last 7 themes for this subscriber (dedup guard) ─────────────
  let recentThemes = 'none yet'
  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  if (email) {
    const { data: recentLogs } = await supabase
      .from('daily_insight_logs')
      .select('theme_used, sent_date')
      .eq('subscriber_email', email)
      .order('sent_date', { ascending: false })
      .limit(7)

    if (recentLogs && recentLogs.length > 0) {
      recentThemes = recentLogs.map((r: { theme_used: string }) => r.theme_used).join(', ')
    }
  }

  // ── Claude prompt ─────────────────────────────────────────────────────
  const insightPrompt = `${langInstruction}

You are generating a daily destiny insight for ${firstName}, whose archetype is ${archetype} and life path number is ${lifePathNumber}.

TODAY: ${dateString} (day ${dayOfYear} of the year)
TODAY'S THEME: ${todayTheme}
Moon Phase: ${moonPhase}
Regional style: ${regionalStyle}

RECENT THEMES SENT TO THIS USER — DO NOT REPEAT:
${recentThemes}

---

CONTENT REQUIREMENTS:

1. This insight must feel written specifically for today, ${dateString}. Reference the specific energy of this point in the year — the season, where we are in 2026, what this time of year tends to bring for the ${archetype} archetype. Do not generate generic evergreen content that could apply to any day.

2. Address today's theme (${todayTheme}) through the specific lens of the ${archetype} archetype. How does THIS archetype experience this theme differently from others?

3. Length: 3-4 sentences for the insight. One precise, inward-facing reflection question.

---

ABSOLUTE SAFETY REQUIREMENTS — NON-NEGOTIABLE:

LANGUAGE RULES:
- NEVER use directive language: "you should", "avoid", "don't", "you must", "be careful", "stay away from", "you need to"
- ALWAYS use reflective language: "you might notice", "consider whether", "some ${archetype}s find", "this could be a moment to", "a question worth sitting with"
- Write as a wise, warm friend who reflects — not as an authority, advisor, or psychic

FORBIDDEN CONTENT DOMAINS:
- Never reference or imply guidance on physical or mental health, medical decisions, symptoms
- Never reference financial decisions, money moves, investments, debt, purchases
- Never reference legal situations of any kind
- Never tell the user whether to stay in or leave any relationship
- Never reference specific career decisions with real stakes ("take the job", "quit now")
- If today's theme touches these areas, address ONLY the internal emotional layer, never the external decision

TONE AND EMOTIONAL SAFETY:
- Never imply something bad will happen today
- Never create anxiety or dread about the day ahead
- Never use: crisis, warning, danger, blocked, cursed, difficult energy ahead, dark period
- Shadow or difficult themes MUST end with an empowering reframe — never leave the user in darkness
- Every insight must leave the user feeling more capable and more themselves, not worried

DEPENDENCY PREVENTION:
- Never position OMENORA or astrology as the final authority on their life
- Never say "the stars command" or "destiny requires" as directives
- Position the insight as one lens among many, an invitation to reflect — not a verdict

REFLECTION QUESTION RULES:
- Must turn inward toward self-knowledge
- Must NEVER point toward a specific external decision
- GOOD: "What would it feel like to trust yourself more in this area today?"
- GOOD: "Where are you giving more than you are receiving right now?"
- GOOD: "What does your wisest self already know about this?"
- BAD: "Should you leave this relationship?"
- BAD: "Is this job worth staying in?"
- BAD: "Are you making a mistake?"

---

RESPOND WITH VALID JSON ONLY.
No preamble. No markdown. No explanation.
Exactly this structure:

{
  "insight": "3-4 sentences of the daily insight",
  "reflection_question": "one inward-facing question",
  "theme": "${todayTheme}"
}`

  // ── Call Claude ───────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 700,
    messages: [{ role: 'user', content: insightPrompt }],
  })

  const firstBlock = message.content[0]
  const rawText = firstBlock?.type === 'text' ? firstBlock.text : ''

  let generatedInsight: { insight: string; reflection_question: string; theme: string }
  try {
    generatedInsight = JSON.parse(rawText)
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      generatedInsight = JSON.parse(match[0])
    } else {
      throw createError({ statusCode: 500, message: 'Failed to parse insight' })
    }
  }

  // ── Log insight after generation (used post-send by caller) ───────────
  if (email) {
    const insightPreview = generatedInsight.insight.substring(0, 100)
    await supabase
      .from('daily_insight_logs')
      .upsert(
        {
          subscriber_email: email,
          sent_date: today.toISOString().split('T')[0],
          theme_used: todayTheme,
          insight_preview: insightPreview,
        },
        { onConflict: 'subscriber_email,sent_date', ignoreDuplicates: true },
      )
  }

  return {
    success: true,
    insight: {
      ...generatedInsight,
      moonPhase,
      dayTheme: todayTheme,
      greeting: `Good morning, ${firstName}.`,
      subject: todaySubject,
    },
  }
})
