/**
 * Client-side mirror of server/utils/quick-signs.ts.
 *
 * Pure, synchronous, zero-dependency. No server globals (no createError, no
 * h3). Throws plain Error instead so it is safe in browser/Vue contexts.
 *
 * Keep in sync with the server version manually — the logic is intentionally
 * duplicated to avoid pulling Nitro/h3 imports into the client bundle.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ZodiacElement = 'Fire' | 'Earth' | 'Air' | 'Water'

export interface SunSign {
  name: string
  symbol: string
  element: ZodiacElement
  dateRange: string
}

export interface LifePathResult {
  number: number
}

// ── Sun sign data ─────────────────────────────────────────────────────────────

interface SignBoundary {
  startMonth: number
  startDay: number
  sign: SunSign
}

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

// ── Validation helper (no Nitro dependency) ───────────────────────────────────

function isValidDob(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return false
  const year = d.getFullYear()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return year >= 1924 && d < now
}

// ── Exported functions ────────────────────────────────────────────────────────

export function getSunSign(dateOfBirth: string): SunSign {
  if (!isValidDob(dateOfBirth)) {
    throw new Error('Invalid dateOfBirth — expected YYYY-MM-DD')
  }

  const [, mm, dd] = dateOfBirth.split('-').map(Number) as [number, number, number]

  for (let i = SIGN_BOUNDARIES.length - 1; i >= 0; i--) {
    const b = SIGN_BOUNDARIES[i]!
    if (mm > b.startMonth || (mm === b.startMonth && dd >= b.startDay)) {
      return b.sign
    }
  }

  return SIGN_BOUNDARIES[0]!.sign
}

export function getLifePathNumber(dateOfBirth: string): LifePathResult {
  if (!isValidDob(dateOfBirth)) {
    throw new Error('Invalid dateOfBirth — expected YYYY-MM-DD')
  }

  const digits = dateOfBirth.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0)
  }

  return { number: sum }
}
