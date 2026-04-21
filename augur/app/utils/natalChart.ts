import { julday, calc_ut, houses_ex2, constants } from 'sweph'

const {
  SE_GREG_CAL,
  SEFLG_SPEED,
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  ERR,
} = constants

// ── Types ──────────────────────────────────────────────────────────────────

export type ArchetypeId =
  | 'phoenix' | 'architect' | 'storm' | 'lighthouse' | 'wanderer'
  | 'alchemist' | 'guardian' | 'visionary' | 'mirror' | 'catalyst'
  | 'sage' | 'wildfire'

export type PlanetPosition = {
  sign: string
  degree: number
  signIndex: number
}

export type NatalChart = {
  sun: PlanetPosition
  moon: PlanetPosition
  mercury: PlanetPosition
  venus: PlanetPosition
  mars: PlanetPosition
  jupiter: PlanetPosition
  saturn: PlanetPosition
  uranus: PlanetPosition
  neptune: PlanetPosition
  pluto: PlanetPosition
  ascendant: PlanetPosition | null
  lifePathNumber: null
}

// ── Constants ──────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

// signIndex groupings by element
const FIRE_SIGNS  = new Set([0, 4, 8])   // Aries, Leo, Sagittarius
const EARTH_SIGNS = new Set([1, 5, 9])   // Taurus, Virgo, Capricorn
const AIR_SIGNS   = new Set([2, 6, 10])  // Gemini, Libra, Aquarius
const WATER_SIGNS = new Set([3, 7, 11])  // Cancer, Scorpio, Pisces

type Element = 'fire' | 'earth' | 'air' | 'water'

function getElement(signIndex: number): Element {
  if (FIRE_SIGNS.has(signIndex))  return 'fire'
  if (EARTH_SIGNS.has(signIndex)) return 'earth'
  if (AIR_SIGNS.has(signIndex))   return 'air'
  return 'water'
}

// Sun+Moon element combination → archetype
const SUN_MOON_MAP: Record<string, ArchetypeId> = {
  'fire+fire':   'phoenix',
  'fire+earth':  'wildfire',
  'fire+air':    'storm',
  'fire+water':  'catalyst',
  'earth+fire':  'guardian',
  'earth+earth': 'architect',
  'earth+air':   'sage',
  'earth+water': 'lighthouse',
  'air+fire':    'visionary',
  'air+earth':   'wanderer',
  'air+air':     'mirror',
  'air+water':   'alchemist',
  'water+fire':  'catalyst',
  'water+earth': 'lighthouse',
  'water+air':   'mirror',
  'water+water': 'sage',
}

// Ascendant element → ordered candidate archetypes for secondary tiebreaker
const ASCENDANT_CANDIDATES: Record<Element, ArchetypeId[]> = {
  fire:  ['phoenix', 'storm', 'wildfire'],
  earth: ['architect', 'guardian', 'sage'],
  air:   ['visionary', 'mirror', 'wanderer'],
  water: ['lighthouse', 'alchemist', 'catalyst'],
}

// ── Helpers ────────────────────────────────────────────────────────────────

function longitudeToPosition(longitude: number): PlanetPosition {
  const normalized = ((longitude % 360) + 360) % 360
  const signIndex  = Math.floor(normalized / 30)
  const degree     = Math.floor(normalized % 30)
  const sign       = ZODIAC_SIGNS[signIndex] ?? 'Aries'
  return { sign, degree, signIndex }
}

function fallbackPosition(): PlanetPosition {
  return { sign: 'Aries', degree: 0, signIndex: 0 }
}

function fallbackChart(): NatalChart {
  return {
    sun:        fallbackPosition(),
    moon:       fallbackPosition(),
    mercury:    fallbackPosition(),
    venus:      fallbackPosition(),
    mars:       fallbackPosition(),
    jupiter:    fallbackPosition(),
    saturn:     fallbackPosition(),
    uranus:     fallbackPosition(),
    neptune:    fallbackPosition(),
    pluto:      fallbackPosition(),
    ascendant:  null,
    lifePathNumber: null,
  }
}

/**
 * Parse 'HH:MM AM/PM' → { hour24, minute }
 * Falls back to noon on any parse failure.
 */
function parseTime(timeOfBirth: string | null): { hour24: number; minute: number } {
  if (!timeOfBirth) return { hour24: 12, minute: 0 }

  const match = timeOfBirth.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return { hour24: 12, minute: 0 }

  let hour   = parseInt(match[1]!, 10)
  const min  = parseInt(match[2]!, 10)
  const ampm = match[3]!.toUpperCase()

  if (ampm === 'AM') {
    if (hour === 12) hour = 0
  } else {
    if (hour !== 12) hour += 12
  }

  if (hour < 0 || hour > 23 || min < 0 || min > 59) return { hour24: 12, minute: 0 }
  return { hour24: hour, minute: min }
}

// ── Public API ─────────────────────────────────────────────────────────────

export type NatalChartParams = {
  dateOfBirth: string        // 'YYYY-MM-DD'
  timeOfBirth: string | null // 'HH:MM AM/PM' or null
  city: string               // label only
  lat: number
  lon: number
}

export function calculateNatalChart(params: NatalChartParams): NatalChart {
  try {
    const { dateOfBirth, timeOfBirth, lat, lon } = params

    // ── 1. Parse date ───────────────────────────────────────────────────
    const dateParts = dateOfBirth.split('-')
    if (dateParts.length !== 3) throw new Error(`Invalid dateOfBirth: ${dateOfBirth}`)

    const year  = parseInt(dateParts[0]!, 10)
    const month = parseInt(dateParts[1]!, 10)
    const day   = parseInt(dateParts[2]!, 10)

    const { hour24, minute } = parseTime(timeOfBirth)
    const hourDecimal = hour24 + minute / 60

    // ── 2. Julian Day Number ────────────────────────────────────────────
    const jd = julday(year, month, day, hourDecimal, SE_GREG_CAL)

    // ── 3. Planetary positions ──────────────────────────────────────────
    const flag = SEFLG_SPEED

    const planets: Array<{ key: keyof Omit<NatalChart, 'ascendant' | 'lifePathNumber'>; body: number }> = [
      { key: 'sun',     body: SE_SUN     },
      { key: 'moon',    body: SE_MOON    },
      { key: 'mercury', body: SE_MERCURY },
      { key: 'venus',   body: SE_VENUS   },
      { key: 'mars',    body: SE_MARS    },
      { key: 'jupiter', body: SE_JUPITER },
      { key: 'saturn',  body: SE_SATURN  },
      { key: 'uranus',  body: SE_URANUS  },
      { key: 'neptune', body: SE_NEPTUNE },
      { key: 'pluto',   body: SE_PLUTO   },
    ]

    const positions: Partial<Record<keyof Omit<NatalChart, 'ascendant' | 'lifePathNumber'>, PlanetPosition>> = {}

    for (const { key, body } of planets) {
      const result = calc_ut(jd, body, flag)
      if (result.flag === ERR) throw new Error(`calc_ut failed for ${key}: ${result.error}`)
      positions[key] = longitudeToPosition(result.data[0])
    }

    // ── 4. Ascendant via houses ─────────────────────────────────────────
    let ascendant: PlanetPosition | null = null

    if (lat !== 0 || lon !== 0) {
      const housesResult = houses_ex2(jd, 0, lat, lon, 'P')
      if (housesResult.flag !== ERR) {
        ascendant = longitudeToPosition(housesResult.data.points[0])
      }
    }

    return {
      sun:        positions.sun        ?? fallbackPosition(),
      moon:       positions.moon       ?? fallbackPosition(),
      mercury:    positions.mercury    ?? fallbackPosition(),
      venus:      positions.venus      ?? fallbackPosition(),
      mars:       positions.mars       ?? fallbackPosition(),
      jupiter:    positions.jupiter    ?? fallbackPosition(),
      saturn:     positions.saturn     ?? fallbackPosition(),
      uranus:     positions.uranus     ?? fallbackPosition(),
      neptune:    positions.neptune    ?? fallbackPosition(),
      pluto:      positions.pluto      ?? fallbackPosition(),
      ascendant,
      lifePathNumber: null,
    }
  } catch (err) {
    console.error('[natal-chart] calculateNatalChart error:', err)
    return fallbackChart()
  }
}

// ── Archetype assignment from natal chart ──────────────────────────────────

export function assignArchetypeFromChart(chart: NatalChart): ArchetypeId {
  try {
    const sunEl  = getElement(chart.sun.signIndex)
    const moonEl = getElement(chart.moon.signIndex)

    const key = `${sunEl}+${moonEl}`
    const base: ArchetypeId = SUN_MOON_MAP[key] ?? 'wildfire'

    if (chart.ascendant === null) return base

    const ascEl        = getElement(chart.ascendant.signIndex)
    const baseEl       = getElement(SUN_MOON_MAP[`${sunEl}+${sunEl}`] !== undefined ? chart.sun.signIndex : chart.sun.signIndex)
    const candidates   = ASCENDANT_CANDIDATES[ascEl]

    // If ascendant element matches the Sun element, keep base result
    if (ascEl === sunEl) return base

    // Find candidate archetype closest by index to the base archetype
    const baseIdx = candidates.indexOf(base)
    if (baseIdx !== -1) return base  // base is already in the candidate list

    // Pick the first candidate as the closest proxy
    return candidates[0] ?? base
  } catch (err) {
    console.error('[natal-chart] assignArchetypeFromChart error:', err)
    return 'wildfire'
  }
}
