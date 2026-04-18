import Anthropic from '@anthropic-ai/sdk'

// ── Inline Vedic utilities (mirrored from app/utils/vedic.ts) ──────────────

const NAKSHATRAS_DATA = [
  { id: 1,  name: 'Ashwini',           symbol: 'Horse Head',       deity: 'Ashwini Kumaras', quality: 'Swift beginnings, healing energy, pioneering spirit' },
  { id: 2,  name: 'Bharani',           symbol: 'Yoni',             deity: 'Yama',             quality: 'Transformation, responsibility, carrying burdens with grace' },
  { id: 3,  name: 'Krittika',          symbol: 'Razor',            deity: 'Agni',             quality: 'Sharp clarity, purification, the power to cut through illusion' },
  { id: 4,  name: 'Rohini',            symbol: 'Chariot',          deity: 'Brahma',           quality: 'Growth, beauty, fertile creativity, magnetic attraction' },
  { id: 5,  name: 'Mrigashira',        symbol: 'Deer Head',        deity: 'Soma',             quality: 'Gentle seeking, wandering curiosity, the eternal search' },
  { id: 6,  name: 'Ardra',             symbol: 'Teardrop',         deity: 'Rudra',            quality: 'Storms of transformation, destruction that renews' },
  { id: 7,  name: 'Punarvasu',         symbol: 'Quiver of Arrows', deity: 'Aditi',            quality: 'Return to light, renewal, boundless possibility' },
  { id: 8,  name: 'Pushya',            symbol: 'Flower',           deity: 'Brihaspati',       quality: 'Nourishment, wisdom, the most auspicious energy' },
  { id: 9,  name: 'Ashlesha',          symbol: 'Coiled Serpent',   deity: 'Nagas',            quality: 'Kundalini power, sharp insight, mystical wisdom' },
  { id: 10, name: 'Magha',             symbol: 'Royal Throne',     deity: 'Pitris',           quality: 'Royal authority, ancestral power, noble purpose' },
  { id: 11, name: 'Purva Phalguni',    symbol: 'Hammock',          deity: 'Bhaga',            quality: 'Pleasure, creativity, the joy of being alive' },
  { id: 12, name: 'Uttara Phalguni',   symbol: 'Bed',              deity: 'Aryaman',          quality: 'Patronage, contracts, loyal partnerships' },
  { id: 13, name: 'Hasta',             symbol: 'Hand',             deity: 'Savitar',          quality: 'Skilled hands, craftsmanship, healing touch' },
  { id: 14, name: 'Chitra',            symbol: 'Bright Jewel',     deity: 'Vishwakarma',      quality: 'Brilliant creativity, beauty, the architect of worlds' },
  { id: 15, name: 'Swati',             symbol: 'Sword',            deity: 'Vayu',             quality: 'Independence, flexibility, the wind that bends but never breaks' },
  { id: 16, name: 'Vishakha',          symbol: 'Triumphal Arch',   deity: 'Indra-Agni',       quality: 'Purposeful ambition, achieving goals through persistence' },
  { id: 17, name: 'Anuradha',          symbol: 'Lotus',            deity: 'Mitra',            quality: 'Devotion, friendship, the lotus that rises through mud' },
  { id: 18, name: 'Jyeshtha',          symbol: 'Circular Amulet', deity: 'Indra',            quality: 'Seniority, protection, the eldest who carries responsibility' },
  { id: 19, name: 'Mula',              symbol: 'Tied Roots',       deity: 'Nirriti',          quality: 'Getting to the root, dissolution, the power of endings' },
  { id: 20, name: 'Purva Ashadha',     symbol: 'Elephant Tusk',    deity: 'Apas',             quality: 'Invincibility, purification, the power of water' },
  { id: 21, name: 'Uttara Ashadha',    symbol: 'Elephant Tusk',    deity: 'Vishvadevas',      quality: 'Universal victory, final achievement, lasting success' },
  { id: 22, name: 'Shravana',          symbol: 'Ear',              deity: 'Vishnu',           quality: 'Listening, learning, connecting all of existence' },
  { id: 23, name: 'Dhanishta',         symbol: 'Drum',             deity: 'Eight Vasus',      quality: 'Abundance, rhythm, the beat that moves the world' },
  { id: 24, name: 'Shatabhisha',       symbol: 'Empty Circle',     deity: 'Varuna',           quality: 'Healing, mystery, the thousand physicians of the sky' },
  { id: 25, name: 'Purva Bhadrapada',  symbol: 'Sword',            deity: 'Aja Ekapada',      quality: 'Fierce transformation, the fire that purifies the soul' },
  { id: 26, name: 'Uttara Bhadrapada', symbol: 'Twins',            deity: 'Ahir Budhnya',     quality: 'Depth, wisdom, the serpent of the deep' },
  { id: 27, name: 'Revati',            symbol: 'Fish',             deity: 'Pushan',           quality: 'Completion, nourishment, safe passage to new cycles' },
]

const VEDIC_PLANETS: Record<number, string> = {
  1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu',
  5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn',
  9: 'Mars', 11: 'Moon', 22: 'Saturn', 33: 'Jupiter',
}

const VIMSHOTTARI_SEQUENCE = [
  { planet: 'Ketu',    years: 7  },
  { planet: 'Venus',   years: 20 },
  { planet: 'Sun',     years: 6  },
  { planet: 'Moon',    years: 10 },
  { planet: 'Mars',    years: 7  },
  { planet: 'Rahu',    years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn',  years: 19 },
  { planet: 'Mercury', years: 17 },
]

const NAKSHATRA_DASHA_LORD: Record<number, number> = {
  1: 0, 2: 1, 3: 6, 4: 8, 5: 5, 6: 4, 7: 3, 8: 2, 9: 7,
  10: 0, 11: 1, 12: 6, 13: 8, 14: 5, 15: 4, 16: 3, 17: 2, 18: 7,
  19: 0, 20: 1, 21: 6, 22: 8, 23: 5, 24: 4, 25: 3, 26: 2, 27: 7,
}

function getNakshatraData(dateOfBirth: string) {
  const date  = new Date(dateOfBirth)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff  = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const index = ((Math.floor(dayOfYear / 13.5) % 27) + 27) % 27
  return NAKSHATRAS_DATA[index] ?? NAKSHATRAS_DATA[0]!
}

function getCurrentDasha(dateOfBirth: string): string {
  try {
    const nakshatra   = getNakshatraData(dateOfBirth)
    const startLordIdx = NAKSHATRA_DASHA_LORD[nakshatra.id] ?? 0
    const totalCycle  = 120
    const birthDate   = new Date(dateOfBirth)
    const now         = new Date()
    const yearsSinceBirth = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    let elapsed = yearsSinceBirth % totalCycle
    let idx = startLordIdx
    while (elapsed > 0) {
      const period = VIMSHOTTARI_SEQUENCE[idx % 9]!
      if (elapsed < period.years) break
      elapsed -= period.years
      idx = (idx + 1) % 9
    }
    const currentPeriod = VIMSHOTTARI_SEQUENCE[idx % 9]!
    const remaining = Math.round((VIMSHOTTARI_SEQUENCE[idx % 9]!.years - elapsed) * 10) / 10
    return `${currentPeriod.planet} Dasha (approximately ${remaining} years remaining)`
  } catch {
    return 'not calculated'
  }
}

function getRahuKetu(lifePathNumber: number): { rahu: string; ketu: string } {
  const rahuAxis: Record<number, { rahu: string; ketu: string }> = {
    1: { rahu: 'Leadership and independent creation',          ketu: 'Mastery in collective service' },
    2: { rahu: 'Deep partnership and emotional attunement',    ketu: 'Mastery in solitary discipline' },
    3: { rahu: 'Creative expression and joyful communication', ketu: 'Mastery in structured achievement' },
    4: { rahu: 'Building stable foundations and systems',      ketu: 'Mastery in metaphysical exploration' },
    5: { rahu: 'Freedom, adventure, and sensory experience',   ketu: 'Mastery in steadfast commitment' },
    6: { rahu: 'Healing, nurturing, and responsible love',     ketu: 'Mastery in analytical detachment' },
    7: { rahu: 'Spiritual wisdom and inner knowing',           ketu: 'Mastery in worldly achievement' },
    8: { rahu: 'Worldly power, authority, and abundance',      ketu: 'Mastery in spiritual surrender' },
    9: { rahu: 'Universal service and humanitarian vision',    ketu: 'Mastery in personal ambition' },
    11: { rahu: 'Inspired vision and spiritual illumination',  ketu: 'Mastery in practical detail' },
    22: { rahu: 'Master building on the world stage',          ketu: 'Mastery in personal mastery alone' },
    33: { rahu: 'Teaching unconditional love at scale',        ketu: 'Mastery in personal creative joy' },
  }
  return rahuAxis[lifePathNumber] ?? { rahu: 'Soul evolution and karmic growth', ketu: 'Innate mastery from past lifetimes' }
}

// ── Inline BaZi utilities (mirrored from app/utils/bazi.ts) ───────────────

const HEAVENLY_STEMS_DATA = [
  { name: 'Jia',  element: 'Yang Wood',  quality: 'Growth, ambition, upward movement' },
  { name: 'Yi',   element: 'Yin Wood',   quality: 'Flexibility, creativity, gentle persistence' },
  { name: 'Bing', element: 'Yang Fire',  quality: 'Brilliance, leadership, radiant energy' },
  { name: 'Ding', element: 'Yin Fire',   quality: 'Wisdom, refinement, inner light' },
  { name: 'Wu',   element: 'Yang Earth', quality: 'Stability, reliability, mountain strength' },
  { name: 'Ji',   element: 'Yin Earth',  quality: 'Nurturing, receptivity, fertile ground' },
  { name: 'Geng', element: 'Yang Metal', quality: 'Justice, precision, the sword of clarity' },
  { name: 'Xin',  element: 'Yin Metal',  quality: 'Refinement, jewelry, hidden beauty' },
  { name: 'Ren',  element: 'Yang Water', quality: 'Intelligence, flow, the ocean of potential' },
  { name: 'Gui',  element: 'Yin Water',  quality: 'Intuition, mystery, the quiet stream' },
]

const EARTHLY_BRANCHES_DATA = [
  { name: 'Zi',   animal: 'Rat',     element: 'Water', quality: 'Intelligence, resourcefulness, new beginnings' },
  { name: 'Chou', animal: 'Ox',      element: 'Earth', quality: 'Diligence, persistence, methodical strength' },
  { name: 'Yin',  animal: 'Tiger',   element: 'Wood',  quality: 'Courage, power, unpredictable brilliance' },
  { name: 'Mao',  animal: 'Rabbit',  element: 'Wood',  quality: 'Grace, diplomacy, artistic sensitivity' },
  { name: 'Chen', animal: 'Dragon',  element: 'Earth', quality: 'Charisma, luck, the most powerful sign' },
  { name: 'Si',   animal: 'Snake',   element: 'Fire',  quality: 'Wisdom, intuition, quiet transformation' },
  { name: 'Wu',   animal: 'Horse',   element: 'Fire',  quality: 'Freedom, passion, unstoppable momentum' },
  { name: 'Wei',  animal: 'Goat',    element: 'Earth', quality: 'Creativity, gentleness, artistic nature' },
  { name: 'Shen', animal: 'Monkey',  element: 'Metal', quality: 'Cleverness, adaptability, quick mind' },
  { name: 'You',  animal: 'Rooster', element: 'Metal', quality: 'Precision, confidence, analytical power' },
  { name: 'Xu',   animal: 'Dog',     element: 'Earth', quality: 'Loyalty, justice, protective instinct' },
  { name: 'Hai',  animal: 'Pig',     element: 'Water', quality: 'Generosity, sincerity, pure heart' },
]

function getBaziPillarsServer(dateOfBirth: string) {
  const date  = new Date(dateOfBirth)
  const year  = date.getFullYear()
  const month = date.getMonth()

  const yearStemIdx   = ((((year - 4) % 10) + 10) % 10)
  const yearBranchIdx = ((((year - 4) % 12) + 12) % 12)
  const yearStem      = HEAVENLY_STEMS_DATA[yearStemIdx]   ?? HEAVENLY_STEMS_DATA[0]!
  const yearBranch    = EARTHLY_BRANCHES_DATA[yearBranchIdx] ?? EARTHLY_BRANCHES_DATA[0]!

  const monthStemIdx   = (((year * 12 + month) % 10) + 10) % 10
  const monthBranchIdx = (((month + 2) % 12) + 12) % 12
  const monthStem      = HEAVENLY_STEMS_DATA[monthStemIdx]   ?? HEAVENLY_STEMS_DATA[0]!
  const monthBranch    = EARTHLY_BRANCHES_DATA[monthBranchIdx] ?? EARTHLY_BRANCHES_DATA[0]!

  const jdn         = Math.floor((date.getTime() / 86400000) + 2440587.5)
  const dayStemIdx  = (((jdn - 11) % 10) + 10) % 10
  const dayBranchIdx = (((jdn - 11) % 12) + 12) % 12
  const dayStem   = HEAVENLY_STEMS_DATA[dayStemIdx]    ?? HEAVENLY_STEMS_DATA[0]!
  const dayBranch = EARTHLY_BRANCHES_DATA[dayBranchIdx] ?? EARTHLY_BRANCHES_DATA[0]!

  return {
    year:  { stem: yearStem,  branch: yearBranch  },
    month: { stem: monthStem, branch: monthBranch },
    day:   { stem: dayStem,   branch: dayBranch   },
  }
}

function getDominantElementServer(pillars: ReturnType<typeof getBaziPillarsServer>): string {
  const counts: Record<string, number> = {}
  const allElements = [
    pillars.year.stem.element.split(' ')[1],
    pillars.year.branch.element,
    pillars.month.stem.element.split(' ')[1],
    pillars.month.branch.element,
    pillars.day.stem.element.split(' ')[1],
    pillars.day.branch.element,
  ]
  allElements.forEach((el) => { if (el) counts[el] = (counts[el] ?? 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? 'Wood'
}

// ── Tarot soul card mapping ────────────────────────────────────────────────

const ARCHETYPE_TAROT_CARDS: Record<string, string> = {
  phoenix:    'Judgement — The card of rebirth and rising',
  architect:  'The Emperor — The card of structure and mastery',
  storm:      'The Tower — The card of transformation through chaos',
  lighthouse: 'The Star — The card of hope and guidance',
  wanderer:   'The Fool — The card of infinite potential',
  alchemist:  'The Magician — The card of transformation',
  guardian:   'The Hierophant — The card of protection',
  visionary:  'The High Priestess — The card of hidden knowledge',
  mirror:     'The Moon — The card of reflection and depth',
  catalyst:   'The Chariot — The card of unstoppable force',
  sage:       'The Hermit — The card of ancient wisdom',
  wildfire:   'Strength — The card of primal power',
}

// ── Archetype symbols ──────────────────────────────────────────────────────

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

  // ── Build tradition-specific framework inputs ────────────────────────────

  let traditionFallback = false
  let traditionFramework = ''

  if (region === 'india') {
    try {
      const nakshatra   = getNakshatraData(dateOfBirth)
      const rulingPlanet = VEDIC_PLANETS[lifePathNumber] ?? 'Mercury'
      const currentDasha = getCurrentDasha(dateOfBirth)
      const rahuKetu     = getRahuKetu(lifePathNumber)

      traditionFramework = `
VEDIC FRAMEWORK INPUTS FOR ${firstName}:
- Nakshatra (Lunar Mansion): ${nakshatra.name}
  Symbol: ${nakshatra.symbol} | Deity: ${nakshatra.deity}
  Core quality: ${nakshatra.quality}
- Ruling Planet: ${rulingPlanet}
- Current Dasha (life period): ${currentDasha}
- Karmic North Node — Rahu direction (what soul is growing toward): ${rahuKetu.rahu}
- Karmic South Node — Ketu gift (what soul mastered in past lives): ${rahuKetu.ketu}

CRITICAL INSTRUCTION: Generate all 7 sections using VEDIC framework as the PRIMARY system.

- Identity section: Lead with ${firstName}'s Nakshatra (${nakshatra.name}) as their cosmic identity. Describe the Nakshatra's symbol (${nakshatra.symbol}), deity (${nakshatra.deity}), and core quality (${nakshatra.quality}) as their fundamental nature. Reference the archetype as a secondary Western confirmation only.

- Science section: Frame their psychology through the lens of their Ruling Planet (${rulingPlanet}) and how this planetary energy shapes their mind, decisions, and perception of the world.

- Forecast section: Use the current Dasha period (${currentDasha}) as the primary timing framework for 2026. What does this Dasha bring — its themes, its energy, what opens and what closes? Do NOT use generic Western timing.

- Love section: Frame romantic destiny through Vedic relationship principles — the Nakshatra's relational archetype, karmic contracts, and the Rahu/Ketu axis influence on who ${firstName} attracts and why.

- Purpose section: Use the Rahu direction (${rahuKetu.rahu}) as ${firstName}'s karmic mission — what the soul is evolving toward in this lifetime, and why conventional paths may feel insufficient.

- Gift section: Use the Ketu gift (${rahuKetu.ketu}) as the innate talent brought from past-life mastery — the thing ${firstName} does naturally and almost without effort.

- Affirmation: Write in Sanskrit-influenced spiritual language. Ground the affirmation in ${firstName}'s Nakshatra archetype and karmic direction.

Write with spiritual depth and warmth. Use karma, dharma, cosmic blueprint language authentically throughout. This is a genuine Vedic reading, not a Western reading with Indian vocabulary.`
    } catch (err) {
      console.warn('[generate-report] Vedic calculation failed, falling back to western:', err)
      traditionFramework = 'Use Western astrology archetypes, Jungian psychology references, and behavioral science framing.'
      traditionFallback = true
    }
  } else if (region === 'china') {
    try {
      const pillars         = getBaziPillarsServer(dateOfBirth)
      const dominantElement = getDominantElementServer(pillars)

      const elementCounts: Record<string, number> = {}
      const allEls = [
        pillars.year.stem.element.split(' ')[1],
        pillars.year.branch.element,
        pillars.month.stem.element.split(' ')[1],
        pillars.month.branch.element,
        pillars.day.stem.element.split(' ')[1],
        pillars.day.branch.element,
      ]
      allEls.forEach((el) => { if (el) elementCounts[el] = (elementCounts[el] ?? 0) + 1 })
      const elementSummary = Object.entries(elementCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([el, count]) => `${el} (${count})`)
        .join(', ')

      traditionFramework = `
BAZI FRAMEWORK INPUTS FOR ${firstName}:
- Day Master: ${pillars.day.stem.name} — ${pillars.day.stem.element} (${pillars.day.stem.quality})
  The Day Master is the core identity element — the lens through which ${firstName} experiences life.
- Year Pillar: ${pillars.year.stem.name} (${pillars.year.stem.element}) / ${pillars.year.branch.name} (${pillars.year.branch.animal})
  Year energy: ${pillars.year.stem.quality}
- Month Pillar: ${pillars.month.stem.name} (${pillars.month.stem.element}) / ${pillars.month.branch.name} (${pillars.month.branch.animal})
  Month energy: ${pillars.month.stem.quality}
- Day Branch: ${pillars.day.branch.name} (${pillars.day.branch.animal}) — ${pillars.day.branch.quality}
- Dominant Element in chart: ${dominantElement}
- Element balance: ${elementSummary}

CRITICAL INSTRUCTION: Generate all 7 sections using BAZI / FOUR PILLARS as the PRIMARY system.

- Identity section: Lead with ${firstName}'s Day Master (${pillars.day.stem.name} — ${pillars.day.stem.element}) as their core nature. Describe exactly what this Day Master element means — how it makes them think, feel, and move through the world. Reference the Western archetype as secondary confirmation only.

- Science section: Explain how the Five Element interactions in ${firstName}'s chart (${elementSummary}) create their psychological patterns. Where is there excess energy? Where is there lack? How does this elemental imbalance express as personality?

- Forecast section: Frame 2026 through the Five Element cycle and the energy of ${firstName}'s current Luck Pillar phase (derived from their birth year ${new Date(dateOfBirth).getFullYear()} and month pillar ${pillars.month.stem.element}). What element dominates their current 10-year cycle and what does it bring?

- Love section: Frame through Five Element compatibility — which Day Master elements naturally harmonize with ${pillars.day.stem.element}, which create friction, and what this means for the patterns ${firstName} experiences in love.

- Purpose section: Frame through the chart's elemental balance — what element is missing or weak, and how that gap becomes ${firstName}'s life mission to develop and integrate.

- Gift section: What does ${firstName}'s strongest element (${dominantElement}) give as a natural ability? What is the elemental superpower of a ${pillars.day.stem.name} Day Master?

- Affirmation: Use balanced, philosophical language. Yin/yang balance. Ground in the Day Master's essential nature.

Write with precision and philosophical depth. Ground everything in the actual Four Pillars data above. Avoid generic "Eastern wisdom" phrasing.`
    } catch (err) {
      console.warn('[generate-report] BaZi calculation failed, falling back to western:', err)
      traditionFramework = 'Use Western astrology archetypes, Jungian psychology references, and behavioral science framing.'
      traditionFallback = true
    }
  } else if (region === 'latam' || region === 'tarot') {
    try {
      const soulCard = ARCHETYPE_TAROT_CARDS[archetype] ?? 'The World — The card of completion'
      const birthDate = new Date(dateOfBirth)
      const birthDay = birthDate.getDate()
      const birthMonth = birthDate.getMonth() + 1
      const yearCardRaw = birthDay + birthMonth + 2 + 0 + 2 + 6
      let yearCardNum = yearCardRaw
      while (yearCardNum > 21) {
        yearCardNum = String(yearCardNum).split('').reduce((a, d) => a + Number(d), 0)
      }
      const MAJOR_ARCANA: Record<number, string> = {
        0: 'The Fool', 1: 'The Magician', 2: 'The High Priestess', 3: 'The Empress',
        4: 'The Emperor', 5: 'The Hierophant', 6: 'The Lovers', 7: 'The Chariot',
        8: 'Strength', 9: 'The Hermit', 10: 'Wheel of Fortune', 11: 'Justice',
        12: 'The Hanged Man', 13: 'Death', 14: 'Temperance', 15: 'The Devil',
        16: 'The Tower', 17: 'The Star', 18: 'The Moon', 19: 'The Sun',
        20: 'Judgement', 21: 'The World',
      }
      const yearCard2026 = MAJOR_ARCANA[yearCardNum] ?? 'The World'

      traditionFramework = `
TAROT FRAMEWORK INPUTS FOR ${firstName}:
- Soul Card (core life archetype): ${soulCard}
- 2026 Personal Year Card: ${yearCard2026} (calculated from birth date + 2026)
- Life Path Number: ${lifePathNumber}
- Tarot Major Arcana is the primary spiritual framework for all 7 sections.

CRITICAL INSTRUCTION: Generate all 7 sections using TAROT as the PRIMARY spiritual framework.

- Identity section: Lead with ${firstName}'s Soul Card (${soulCard}) as their spiritual identity. Describe the Major Arcana archetype they embody — its journey, its gifts, its shadow. Reference the Western archetype as psychological confirmation only.

- Science section: Frame ${firstName}'s psychology through the symbolic wisdom of their Soul Card — what this card reveals about how they process the world, their inner gifts and recurring challenges, and the archetypal pattern they live out.

- Forecast section: Use the 2026 Personal Year Card (${yearCard2026}) as the primary lens. What does this Major Arcana card mean for ${firstName}'s year ahead? What theme, lesson, or energy does it herald? Name specific seasons of the year where this card's energy peaks.

- Love section: Frame through the emotional symbolism of the Soul Card and the Suit of Cups. What does ${firstName}'s Soul Card say about how they love, what they give, and what they need? What karmic love pattern does this card carry?

- Purpose section: What is the spiritual mission of ${firstName}'s Soul Card archetype? What are they here to embody and teach? What does the universe need from someone carrying this card?

- Gift section: What divine gift does the Soul Card carry for ${firstName}? Frame as spiritual power — the thing they have access to that others simply do not.

- Affirmation: Poetic, passionate, spiritually alive. Must feel like a declaration written by the universe itself. Invoke the Soul Card's energy directly.

Write with passion, warmth, and spiritual fire. Connect to the heart first, mind second.`
    } catch (err) {
      console.warn('[generate-report] Tarot calculation failed, falling back to western:', err)
      traditionFramework = 'Use Western astrology archetypes, Jungian psychology references, and behavioral science framing.'
      traditionFallback = true
    }
  } else if (region === 'korea') {
    traditionFramework = `Use personality-focused psychological language throughout all 7 sections. Frame identity, science, forecast, love, purpose, gift, and affirmation through the lens of self-understanding, interpersonal dynamics, and personal growth. The archetype (${archetype}) is the user's core personality type. Korean readers have a strong appetite for precise personality analysis (similar to MBTI depth). Reference how the archetype interacts with others, how it shows up in relationships, and what its blind spots are. Keep language clean, insightful, and practical. Avoid heavy mystical language — frame as behavioral science and destiny insight.`
  } else if (region === 'middleeast') {
    traditionFramework = `Use dignified, destiny-focused language throughout all 7 sections. Reference fate, what is written, and life purpose in every section. Frame identity as God-given character, science as divine design, forecast as what is unfolding on the path, love as soul-level union, purpose as sacred duty, gift as God-given talent, and affirmation as a declaration of faith in one's path. Use terms like "your path", "what is written", "your covenant with destiny". Write with gravitas, depth, and reverence.`
  } else {
    traditionFramework = `Use Western astrology archetypes as the primary identity framework. Reference Jungian psychology, behavioral science, and chronobiology throughout all 7 sections. The archetype (${archetype}) is the user's core identity label. Ground every section in this framework: identity in Jungian archetype theory, science in chronobiology and behavioral research, forecast in Western astrological cycles, love in attachment theory and archetypal relationship patterns, purpose in the archetype's natural vocation, gift in shadow integration and hidden strength, affirmation in core psychological truth.`
  }

  const regionPrompt = traditionFramework

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

You are writing a personal destiny report for ${firstName}. Your voice is precise, not warm. Direct, not harsh. You do not comfort — you illuminate. You are not a psychic. You are not a horoscope. You say the thing that makes ${firstName} go quiet because it is true, not because it is flattering. You write as if you have nothing to prove and nothing to sell. The goal is never to make ${firstName} feel good. The goal is to make ${firstName} feel seen. Those are different things.

---

PROFILE — everything you know about ${firstName}:
- Born: ${birthMonth} ${birthYear} in ${city} (${birthSeason} birth)
- Life Path Number: ${lifePathNumber}
- Destiny Archetype: ${archetypeDesc}
- Decision pattern: ${decisionPattern}
- Hidden self: ${hiddenSelf}
- Deepest relationship wound: ${relationshipWound}
- The thought that follows them: ${coreThought}
- How others label them (which they find complicated): ${answers.q5}
- How they receive good things: ${successResponse}
- Their deepest fear about themselves: ${shadowFear}

Tradition framework (primary lens for all 7 sections):
${regionPrompt}

---

WRITING RULES — follow every one without exception:

LANGUAGE LEVEL — MOST IMPORTANT RULE:

Write at B2 English level (upper intermediate).
This means:
- HARD LIMIT: Every single sentence must be 20 words or fewer. Count the words before writing each sentence. If it reaches 21 words, stop and split it into two sentences. No exceptions.
  WRONG (22 words): 'You have spent years being the person everyone leans on, and somewhere in that you stopped asking who holds you.'
  RIGHT (split into 2): 'You have spent years being the person everyone leans on. At some point, you stopped asking who holds you.'
  WRONG (21 words): 'The Phoenix does not rise because it wants to — it rises because staying down was never an option it was given.'
  RIGHT (split): 'The Phoenix does not rise because it wants to. It rises because staying down was never an option.'
- No more than 1 em-dash (—) per section
- No idioms that only work in English
  (examples to avoid: 'learned to disappear',
  'built one collapse at a time',
  'staying in the ash')
- No metaphors that depend on English
  cultural context to understand
- Use concrete images over abstract poetry
  WRONG: 'somewhere in that usefulness
         you learned to disappear'
  RIGHT: 'You have spent your life being
         useful to people — so much so that
         you forgot to save something for yourself'
- Every sentence must be clear on first reading
  to someone who learned English as a second language
- Short sentences are stronger than long ones
- Direct statements are stronger than
  poetic circumlocutions
- The goal is feeling SEEN, not feeling impressed

1. OPEN EVERY SECTION by naming something ${firstName} already knows about themselves but has never heard said out loud. The first sentence of each section must feel like recognition, not revelation. Example: "There is a version of you that very few people ever meet." Not: "You are a powerful person."

2. PAIR EVERY STRENGTH WITH ITS SHADOW COST. Never describe a positive trait without naming the tension it creates. Example: "The same quality that makes you irreplaceable to people you love is the one that has cost you the most." This is not negativity — it is accuracy. People only trust descriptions that include their complexity.

3. USE CONTRAST SENTENCES. Short declarative sentence. Then its opposite or complication. Example: "You read rooms instantly. You also misread yourself." The rhythm creates a felt sense of truth.

4. WRITE IN ACTIVE, DIRECT SECOND PERSON. "You do this" not "people like you tend to". "You carry this" not "this archetype often carries". Directness signals the reading is specifically for ${firstName}.

5. USE ${firstName}'s NAME 2-3 TIMES inside section content — not just at the opening. Place the name at a moment of emotional weight, not as filler.

Name placement rules:
- NEVER place ${firstName} mid-sentence after a comma:
  WRONG: 'They call you independent, ${firstName}, but...'
  RIGHT: '${firstName}, they call you independent — but what they mean is...'
  RIGHT: 'The truth is, ${firstName}, [new idea starts here].'
- Always place the name at the START of a sentence or immediately after a period. Never in the middle of a flowing clause.
- The name should feel like emphasis, not like an insertion.

HARD BLOCK on name as connector:
Never use this pattern:
'[verb phrase], ${firstName}, which means...'
'[statement], ${firstName}, but...'
'[observation], ${firstName}, so...'

These patterns insert the name as a mid-clause aside. They always create sentences over 20 words.

When you want to use the name, STOP the current sentence first.
Start a new sentence with the name.

WRONG:
'You act on instinct, ${firstName}, which means you have made choices faster than most.'

RIGHT:
'You act on instinct. ${firstName}, this has meant making choices faster than you could explain them to people around you.'

Two sentences. Name opens the second. Both under 20 words.

6. NAME THE UNSPOKEN. Reference things ${firstName} has experienced but never discussed — the private version of a feeling. Example: "There is something you have never quite been able to explain to the people who love you — the way you can be completely present and completely elsewhere at the same time."

7. REFRAME EVERY WOUND OR FEAR AS STRUCTURAL INTELLIGENCE. Never present a difficulty as a flaw. Present it as the logical output of a specific kind of depth. Example: Instead of 'fear of being too much' → 'The same intensity that makes ${firstName} unforgettable is the thing they have spent years learning to calibrate.'

8. GROUND EACH SECTION IN THE TRADITION FRAMEWORK above. Use the actual calculated inputs (Nakshatra, Day Master, Soul Card, etc.) as real, named specifics — not decoration.

9. NAME SPECIFIC TIME WINDOWS in the forecast. Not 'soon' or 'this year'. Name months or seasons. Specificity creates believability.

10. END EACH SECTION (except affirmation) with a sentence that lands with weight — something ${firstName} would re-read. Not a summary. A truth.

Em-dash rule:
Use a maximum of ONE em-dash (—) per section.
Em-dashes create rhythm breaks. Too many in one paragraph makes reading choppy, especially for non-native English readers.
If you find yourself writing two em-dashes in the same section, rewrite one sentence to remove the need for it.
Prefer short sentences over em-dash clauses.

---

ABSOLUTE FORBIDDEN PHRASES — never use any of these, they instantly break immersion:
- "innate gifts" / "your gifts"
- "the universe has a plan"
- "you are a force of nature"
- "this is your time"
- "you were born for this"
- "embrace your" / "lean into your"
- "on this journey"
- "your true self"
- "deeply empathetic"
- "highly sensitive"
- "old soul"
- "you shine"
- "limitless potential"
- Any sentence that starts with "As a [archetype]..."
- Any sentence that could apply equally to every person reading it
- Any metaphor using 'ash', 'fire', 'flame', 'burn' (except for fire element archetypes where it is factually relevant)
- 'learned to disappear' or any variant of disappearing as metaphor for self-erasure
- 'built one [noun] at a time' (English idiom structure)
- 'in ways they can recognize' or similar subordinate clause after a negative
- Any sentence longer than 20 words
- Semicolons — they add complexity without adding clarity
- 'somewhere in [noun] you [verb]' construction (abstract and poetic)
- 'the part of you that' construction used more than once per report

---

SECTION INSTRUCTIONS:

IDENTITY (4-5 sentences minimum):
THE VERY FIRST SENTENCE of this entire report — the opening line of the Identity section — is the most important sentence you will write. It must be the single most personally accurate observation in the report. It must make ${firstName} stop reading and re-read it. It must not be about their archetype in general. It must be about THEM specifically — derived from the most emotionally charged input in their profile.

To write this sentence: look at their relationship wound (${relationshipWound}), their core thought (${coreThought}), and their hidden self (${hiddenSelf}). Pick the one that feels most privately true. Write the first sentence from THAT place. Do not open with the archetype name. Do not open with a compliment. Open with the thing they have never heard said out loud about themselves.

Example of WRONG opening:
'You are The Alchemist — a soul who transforms everything they touch.' (This is a description, not a recognition.)

Example of RIGHT opening:
'There is a version of you that has rebuilt itself so many times in private that the people closest to you have no idea how much has already been burned down and remade.' (This lands because it is specific to their wound profile.)

After the opening sentence: Follow the tradition framework's identity instructions as PRIMARY. Pair the core identity with its tension. End with the one thing about ${firstName} that most people in their life have never understood.

When introducing the archetype name, make it DO something — not define something. The archetype name must appear in a sentence that is active and alive, not explanatory.
WRONG: 'The Wildfire archetype is not about warmth or comfort — it is about transformation through intensity.' (This is a product description.)
RIGHT: 'The Wildfire does not spread by being contained — it moves by consuming whatever cannot survive its heat, and that includes every version of yourself that no longer fits.' (This makes the archetype name a living force, not a label.)

SCIENCE (4 sentences minimum):
Follow the tradition framework's science instructions as PRIMARY. Use the actual tradition's analytical system — not chronobiology if this is a Vedic or BaZi reading. Ground in specific calculated data from the profile. Reference life path ${lifePathNumber} only if it fits the tradition naturally; skip it for Vedic and BaZi.

FORECAST (5 sentences minimum):
Follow the tradition framework's forecast instructions as PRIMARY timing guide. Do NOT name specific calendar months as if they are guaranteed windows — this creates false predictions that damage trust when they do not materialize. Instead, name EXPERIENTIAL triggers: describe what ${firstName} will notice happening around them or within them that signals the window has arrived. Example of WRONG: 'April through June brings a major opening.' Example of RIGHT: 'When you notice the resistance you have been carrying suddenly feels lighter — and you will notice this, probably when you least expect it — that is your window. Do not wait for external confirmation before you move.' For Vedic and BaZi traditions where real timing data exists (Dasha period, Luck Pillar), you MAY reference the actual calculated period from the tradition framework inputs above. For Western and Tarot traditions, use experiential framing only. Reflect the success pattern '${successResponse}' — describe how ${firstName} will receive the wins coming their way. End with a single sentence that creates forward momentum without being generic.

LOVE (4 sentences minimum):
Follow the tradition framework's love instructions as PRIMARY. Open by naming the relationship wound '${relationshipWound}' without using those exact words — describe the experience, not the label. Use contrast sentence structure. End with what ${firstName} is actually capable of when they feel safe.

PURPOSE (4 sentences minimum):
Follow the tradition framework's purpose instructions as PRIMARY. Take the core thought '${coreThought}' and reframe it as the structural source of ${firstName}'s drive — the fear that became the fuel. End with the specific kind of work or contribution only this archetype can produce.

GIFT (3 sentences minimum):
Follow the tradition framework's gift instructions as PRIMARY. Open with naming the hidden self '${hiddenSelf}' — say what it actually is, what it looks like from the outside, and why almost no one ever names it correctly. Close with a single sentence that makes ${firstName} feel rare — not in a flattering way, but in an accurate way.

AFFIRMATION (1 sentence only):
Follow the tradition framework's affirmation instructions as PRIMARY.

The affirmation must be written in the voice of ${firstName} speaking TO THEMSELVES — not a narrator speaking about them. It must feel like their own internal voice made visible, not a blessing given from the outside.

Must include ${firstName}'s name — placed mid-sentence or at the opening, never at the end. Must address the shadow fear '${shadowFear}' without ever naming it explicitly — speak to the fear's opposite truth. Must feel like a sentence ${firstName} would write on paper and keep somewhere private. No exclamation marks. No 'you are' openings. No 'you have always been' openings. Do not begin with 'I' — this is not a first-person affirmation. Begin with the person's name or an action verb directed at them.

WRONG: 'You are stronger than you know, ${firstName}.' (narrator voice, generic, flattering not true)
WRONG: 'I am enough and I trust myself.' (first person, sounds like a wellness poster)
RIGHT: '${firstName} — what you built in silence while everyone else was celebrating is already the answer.' (specific to their shadow, their voice, their truth)

---

powerTraits: Generate exactly 3 traits for the JSON output. Each trait MUST be a verb phrase describing a specific behavior, not an adjective describing a quality.
WRONG: 'intuitive', 'determined', 'creative'
RIGHT: 'reads the room before anyone has spoken', 'rebuilds after losses most people do not survive', 'finds the third option when everyone else sees only two'
Each verb phrase must be instantly recognizable to ${firstName} as something specific to them — not a compliment that could apply to anyone.

FINAL CLARITY CHECK:
Before finalizing each section, read it as if you are a person who learned English as a second language at intermediate level.
Ask: would every sentence be clear on first reading without needing to re-read it?
If any sentence requires re-reading to understand, rewrite it as two shorter sentences.
Clarity and emotional truth are not opposites.
The most powerful sentences in any language are short, direct, and specific.

Return ONLY valid JSON. No preamble, no explanation, no markdown.

{
  "archetypeName": "The [Name]",
  "archetypeSymbol": "[single character]",
  "element": "[Fire/Earth/Air/Water]",
  "powerTraits": ["trait1", "trait2", "trait3"],
  "sections": {
    "identity": { "title": "Who You Are", "content": "[write section here per instructions above]" },
    "science": { "title": "The Science Behind You", "content": "[write section here per instructions above]" },
    "forecast": { "title": "Your 2026 Destiny", "content": "[write section here per instructions above]" },
    "love": { "title": "Love & Connection", "content": "[write section here per instructions above]" },
    "purpose": { "title": "Career & Purpose", "content": "[write section here per instructions above]" },
    "gift": { "title": "Your Hidden Gift", "content": "[write section here per instructions above]" },
    "affirmation": { "title": "Your Power Statement", "content": "[write section here per instructions above]" }
  }
}`

  let message
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
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

  return {
    success: true,
    report: reportData,
    traditionFallback,
    originalTradition: region,
  }
})
