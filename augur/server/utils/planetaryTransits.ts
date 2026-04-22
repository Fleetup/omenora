import { julday, calc_ut, close, constants } from 'sweph'

const {
  SE_GREG_CAL,
  SEFLG_SWIEPH,
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  ERR,
} = constants

// ── Types ──────────────────────────────────────────────────────────────────

export interface PlanetaryPosition {
  sign: string
  degree: number
  longitude: number
}

export interface PlanetaryTransits {
  date: string
  sun: PlanetaryPosition
  moon: PlanetaryPosition
  mercury: PlanetaryPosition
  venus: PlanetaryPosition
  mars: PlanetaryPosition
  jupiter: PlanetaryPosition
  saturn: PlanetaryPosition
  moonPhase: number
  moonPhaseName: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

// ── Helpers ────────────────────────────────────────────────────────────────

function longitudeToPosition(longitude: number): PlanetaryPosition {
  const normalized = ((longitude % 360) + 360) % 360
  const signIndex  = Math.floor(normalized / 30)
  const degree     = Math.floor(normalized % 30)
  const sign       = ZODIAC_SIGNS[signIndex] ?? 'Aries'
  return { sign, degree, longitude: normalized }
}

function calcMoonPhase(date: Date): { moonPhase: number; moonPhaseName: string } {
  const cycle = 29.53
  const known = new Date('2000-01-06')
  const diff  = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const phase = ((diff % cycle) + cycle) % cycle

  let moonPhaseName: string
  if (phase < 3.7)       moonPhaseName = 'New Moon'
  else if (phase < 7.4)  moonPhaseName = 'Waxing Crescent'
  else if (phase < 11.1) moonPhaseName = 'First Quarter'
  else if (phase < 14.8) moonPhaseName = 'Waxing Gibbous'
  else if (phase < 18.5) moonPhaseName = 'Full Moon'
  else if (phase < 22.2) moonPhaseName = 'Waning Gibbous'
  else if (phase < 25.9) moonPhaseName = 'Last Quarter'
  else                   moonPhaseName = 'Waning Crescent'

  return { moonPhase: phase, moonPhaseName }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function getPlanetaryTransits(dateStr: string): PlanetaryTransits {
  // ── 1. Parse date ──────────────────────────────────────────────────────
  const dateParts = dateStr.split('-')
  if (dateParts.length !== 3) throw new Error(`[planetaryTransits] Invalid dateStr: ${dateStr}`)

  const year  = parseInt(dateParts[0]!, 10)
  const month = parseInt(dateParts[1]!, 10)
  const day   = parseInt(dateParts[2]!, 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`[planetaryTransits] Non-numeric date components in: ${dateStr}`)
  }

  // ── 2. Julian Day at noon UTC ──────────────────────────────────────────
  const jd = julday(year, month, day, 12.0, SE_GREG_CAL)

  // ── 3. Planetary positions ─────────────────────────────────────────────
  const flag = SEFLG_SWIEPH

  const planets: Array<{ key: keyof Omit<PlanetaryTransits, 'date' | 'moonPhase' | 'moonPhaseName'>; body: number }> = [
    { key: 'sun',     body: SE_SUN     },
    { key: 'moon',    body: SE_MOON    },
    { key: 'mercury', body: SE_MERCURY },
    { key: 'venus',   body: SE_VENUS   },
    { key: 'mars',    body: SE_MARS    },
    { key: 'jupiter', body: SE_JUPITER },
    { key: 'saturn',  body: SE_SATURN  },
  ]

  const positions: Partial<Record<keyof Omit<PlanetaryTransits, 'date' | 'moonPhase' | 'moonPhaseName'>, PlanetaryPosition>> = {}

  try {
    for (const { key, body } of planets) {
      const result = calc_ut(jd, body, flag)
      if (result.flag === ERR) {
        throw new Error(`[planetaryTransits] calc_ut failed for ${key}: ${result.error}`)
      }
      positions[key] = longitudeToPosition(result.data[0])
    }

    // ── 4. Moon phase ────────────────────────────────────────────────────
    const today = new Date(`${dateStr}T12:00:00Z`)
    const { moonPhase, moonPhaseName } = calcMoonPhase(today)

    // ── 5. Release sweph resources ───────────────────────────────────────
    close()

    return {
      date: dateStr,
      sun:     positions.sun     ?? { sign: 'Aries', degree: 0, longitude: 0 },
      moon:    positions.moon    ?? { sign: 'Aries', degree: 0, longitude: 0 },
      mercury: positions.mercury ?? { sign: 'Aries', degree: 0, longitude: 0 },
      venus:   positions.venus   ?? { sign: 'Aries', degree: 0, longitude: 0 },
      mars:    positions.mars    ?? { sign: 'Aries', degree: 0, longitude: 0 },
      jupiter: positions.jupiter ?? { sign: 'Aries', degree: 0, longitude: 0 },
      saturn:  positions.saturn  ?? { sign: 'Aries', degree: 0, longitude: 0 },
      moonPhase,
      moonPhaseName,
    }
  } catch (err) {
    close()
    throw err
  }
}
