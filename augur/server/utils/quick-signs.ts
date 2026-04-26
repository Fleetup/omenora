/**
 * Instant astrological sign and numerology calculations.
 *
 * Pure, synchronous, zero-dependency utilities. No AI calls, no Swiss
 * Ephemeris, no network requests. Safe for server and edge runtimes.
 *
 * Intended for mid-quiz instant-reveal UX only. For the paid report use
 * the Swiss Ephemeris + Claude pipeline (generate-report.post.ts).
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type ZodiacElement = 'Fire' | 'Earth' | 'Air' | 'Water'

export interface SunSign {
  /** Display name, e.g. "Capricorn" */
  name: string
  /** Unicode symbol, e.g. "♑" */
  symbol: string
  /** Classical element */
  element: ZodiacElement
  /** Human-readable date range, e.g. "Dec 22 – Jan 19" */
  dateRange: string
}

export interface LifePathResult {
  /**
   * Reduced life path number: 1–9, or master numbers 11, 22, 33.
   * Master numbers are never reduced further.
   */
  number: number
}

// ── Sun sign data ───────────────────────────────────────────────────────────

interface SignBoundary {
  /** Month the sign starts in (1-indexed) */
  startMonth: number
  /** Day of month the sign starts on */
  startDay: number
  sign: SunSign
}

/**
 * Ordered list of sign boundaries, from Capricorn (Jan portion) through
 * Sagittarius. Each entry marks the first calendar day that sign is active.
 * We defer to the LATER sign on cusp days (industry standard): the boundary
 * day itself belongs to the incoming sign.
 */
const SIGN_BOUNDARIES: SignBoundary[] = [
  { startMonth: 1,  startDay: 1,  sign: { name: 'Capricorn',   symbol: '♑', element: 'Earth', dateRange: 'Dec 22 – Jan 19' } },
  { startMonth: 1,  startDay: 20, sign: { name: 'Aquarius',    symbol: '♒', element: 'Air',   dateRange: 'Jan 20 – Feb 18' } },
  { startMonth: 2,  startDay: 19, sign: { name: 'Pisces',      symbol: '♓', element: 'Water', dateRange: 'Feb 19 – Mar 20' } },
  { startMonth: 3,  startDay: 21, sign: { name: 'Aries',       symbol: '♈', element: 'Fire',  dateRange: 'Mar 21 – Apr 19' } },
  { startMonth: 4,  startDay: 20, sign: { name: 'Taurus',      symbol: '♉', element: 'Earth', dateRange: 'Apr 20 – May 20' } },
  { startMonth: 5,  startDay: 21, sign: { name: 'Gemini',      symbol: '♊', element: 'Air',   dateRange: 'May 21 – Jun 20' } },
  { startMonth: 6,  startDay: 21, sign: { name: 'Cancer',      symbol: '♋', element: 'Water', dateRange: 'Jun 21 – Jul 22' } },
  { startMonth: 7,  startDay: 23, sign: { name: 'Leo',         symbol: '♌', element: 'Fire',  dateRange: 'Jul 23 – Aug 22' } },
  { startMonth: 8,  startDay: 23, sign: { name: 'Virgo',       symbol: '♍', element: 'Earth', dateRange: 'Aug 23 – Sep 22' } },
  { startMonth: 9,  startDay: 23, sign: { name: 'Libra',       symbol: '♎', element: 'Air',   dateRange: 'Sep 23 – Oct 22' } },
  { startMonth: 10, startDay: 23, sign: { name: 'Scorpio',     symbol: '♏', element: 'Water', dateRange: 'Oct 23 – Nov 21' } },
  { startMonth: 11, startDay: 22, sign: { name: 'Sagittarius', symbol: '♐', element: 'Fire',  dateRange: 'Nov 22 – Dec 21' } },
  { startMonth: 12, startDay: 22, sign: { name: 'Capricorn',   symbol: '♑', element: 'Earth', dateRange: 'Dec 22 – Jan 19' } },
]

// ── Exported functions ──────────────────────────────────────────────────────

/**
 * Return the tropical zodiac sun sign for a birth date.
 *
 * @param dateOfBirth ISO 8601 date string, e.g. "1985-01-19"
 * @throws 400 Bad Request if the date is not a valid date of birth
 */
export function getSunSign(dateOfBirth: string): SunSign {
  if (!isValidDateOfBirth(dateOfBirth)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid dateOfBirth — expected YYYY-MM-DD' })
  }

  const [, mm, dd] = dateOfBirth.split('-').map(Number) as [number, number, number]

  // Walk boundaries in reverse: last boundary whose (startMonth, startDay)
  // is <= (mm, dd) wins. Capricorn at index 12 catches Dec 22–31.
  for (let i = SIGN_BOUNDARIES.length - 1; i >= 0; i--) {
    const b = SIGN_BOUNDARIES[i]!
    if (mm > b.startMonth || (mm === b.startMonth && dd >= b.startDay)) {
      return b.sign
    }
  }

  // Unreachable for any valid date, but TypeScript requires a return path.
  return SIGN_BOUNDARIES[0]!.sign
}

/**
 * Calculate the Pythagorean life path number from a birth date.
 *
 * Sums all digits in the date string (dashes removed), then reduces
 * iteratively. Stops at master numbers 11, 22, or 33 without further
 * reduction. Algorithm matches the inline implementation in
 * server/api/generate-compatibility.post.ts lines 42–51.
 *
 * @param dateOfBirth ISO 8601 date string, e.g. "1985-01-19"
 * @throws 400 Bad Request if the date is not a valid date of birth
 */
export function getLifePathNumber(dateOfBirth: string): LifePathResult {
  if (!isValidDateOfBirth(dateOfBirth)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid dateOfBirth — expected YYYY-MM-DD' })
  }

  const digits = dateOfBirth.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0)
  }

  return { number: sum }
}
