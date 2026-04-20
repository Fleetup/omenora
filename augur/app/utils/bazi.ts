export const HEAVENLY_STEMS = [
  { name: 'Jia', element: 'Yang Wood', quality: 'Growth, ambition, upward movement' },
  { name: 'Yi', element: 'Yin Wood', quality: 'Flexibility, creativity, gentle persistence' },
  { name: 'Bing', element: 'Yang Fire', quality: 'Brilliance, leadership, radiant energy' },
  { name: 'Ding', element: 'Yin Fire', quality: 'Wisdom, refinement, inner light' },
  { name: 'Wu', element: 'Yang Earth', quality: 'Stability, reliability, mountain strength' },
  { name: 'Ji', element: 'Yin Earth', quality: 'Nurturing, receptivity, fertile ground' },
  { name: 'Geng', element: 'Yang Metal', quality: 'Justice, precision, the sword of clarity' },
  { name: 'Xin', element: 'Yin Metal', quality: 'Refinement, jewelry, hidden beauty' },
  { name: 'Ren', element: 'Yang Water', quality: 'Intelligence, flow, the ocean of potential' },
  { name: 'Gui', element: 'Yin Water', quality: 'Intuition, mystery, the quiet stream' },
]

export const EARTHLY_BRANCHES = [
  { name: 'Zi', animal: 'Rat', element: 'Water',
    quality: 'Intelligence, resourcefulness, new beginnings' },
  { name: 'Chou', animal: 'Ox', element: 'Earth',
    quality: 'Diligence, persistence, methodical strength' },
  { name: 'Yin', animal: 'Tiger', element: 'Wood',
    quality: 'Courage, power, unpredictable brilliance' },
  { name: 'Mao', animal: 'Rabbit', element: 'Wood',
    quality: 'Grace, diplomacy, artistic sensitivity' },
  { name: 'Chen', animal: 'Dragon', element: 'Earth',
    quality: 'Charisma, luck, the most powerful sign' },
  { name: 'Si', animal: 'Snake', element: 'Fire',
    quality: 'Wisdom, intuition, quiet transformation' },
  { name: 'Wu', animal: 'Horse', element: 'Fire',
    quality: 'Freedom, passion, unstoppable momentum' },
  { name: 'Wei', animal: 'Goat', element: 'Earth',
    quality: 'Creativity, gentleness, artistic nature' },
  { name: 'Shen', animal: 'Monkey', element: 'Metal',
    quality: 'Cleverness, adaptability, quick mind' },
  { name: 'You', animal: 'Rooster', element: 'Metal',
    quality: 'Precision, confidence, analytical power' },
  { name: 'Xu', animal: 'Dog', element: 'Earth',
    quality: 'Loyalty, justice, protective instinct' },
  { name: 'Hai', animal: 'Pig', element: 'Water',
    quality: 'Generosity, sincerity, pure heart' },
]

/**
 * ACCURACY SCOPE — BaZi pillar calculation (accepted approximation, April 2026)
 *
 * Year Stem / Year Branch: Standard BaZi arithmetic. Formula `(year - 4) mod 10`
 * is anchored to year 4 CE (the 甲子 Jiǎzǐ cycle start) and is widely accepted
 * as correct for the solar-year Heavenly Stem.
 *
 * Day Stem / Day Branch: Standard BaZi arithmetic. Julian Day Number offset
 * `(JDN - 11) mod 10` is the conventional formula and is correct.
 *
 * Month Stem / Month Branch: Linear approximation — NOT traditional.
 * The formula `(year * 12 + month) % 10` is a mathematical convenience.
 * Traditional BaZi Month Stems depend on the Year Stem and the solar term
 * (节气 jiéqì) of the birth month, requiring a lookup table keyed on
 * (yearStem % 5, solarMonth). This implementation will produce incorrect
 * Month Stems for a significant portion of birth dates when compared against
 * a traditional BaZi calculator.
 *
 * This approximation is intentional and accepted for the current product scope.
 * BaZi tradition is restricted from paid ad creative until Phase 2.
 * See TRADITION_CALC_AUDIT.md for the full decision record.
 */
export function getBaziPillars(dateOfBirth: string) {
  const date = new Date(dateOfBirth)
  const year = date.getFullYear()
  const month = date.getMonth()

  const yearStemIndex = ((((year - 4) % 10) + 10) % 10)
  const yearBranchIndex = ((((year - 4) % 12) + 12) % 12)
  const yearStem = HEAVENLY_STEMS[yearStemIndex] ?? HEAVENLY_STEMS[0]!
  const yearBranch = EARTHLY_BRANCHES[yearBranchIndex] ?? EARTHLY_BRANCHES[0]!

  const monthStemIndex = (((year * 12 + month) % 10) + 10) % 10
  const monthBranchIndex = (((month + 2) % 12) + 12) % 12
  const monthStem = HEAVENLY_STEMS[monthStemIndex] ?? HEAVENLY_STEMS[0]!
  const monthBranch = EARTHLY_BRANCHES[monthBranchIndex] ?? EARTHLY_BRANCHES[0]!

  const jdn = Math.floor((date.getTime() / 86400000) + 2440587.5)
  const dayStemIndex = (((jdn - 11) % 10) + 10) % 10
  const dayBranchIndex = (((jdn - 11) % 12) + 12) % 12
  const dayStem = HEAVENLY_STEMS[dayStemIndex] ?? HEAVENLY_STEMS[0]!
  const dayBranch = EARTHLY_BRANCHES[dayBranchIndex] ?? EARTHLY_BRANCHES[0]!

  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
  }
}

export function getDominantElement(pillars: ReturnType<typeof getBaziPillars>) {
  const elements: Record<string, number> = {}

  const allElements = [
    pillars.year.stem.element.split(' ')[1],
    pillars.year.branch.element,
    pillars.month.stem.element.split(' ')[1],
    pillars.month.branch.element,
    pillars.day.stem.element.split(' ')[1],
    pillars.day.branch.element,
  ]

  allElements.forEach((el) => {
    if (el) elements[el] = (elements[el] ?? 0) + 1
  })

  const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? 'Wood'
}
