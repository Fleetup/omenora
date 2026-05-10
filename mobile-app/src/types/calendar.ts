/**
 * CalendarData — mirrors backend CalendarType (augur/server/utils/ai-schemas.ts).
 * Lossless against the /api/generate-calendar response shape.
 * energyLevel is 0-100 integer (not a string enum).
 */

export interface CalendarMonth {
  month:       string
  number:      number         // 1-12
  energyLevel: number         // 0-100 integer
  theme:       string
  love:        string
  money:       string
  career:      string
  warning:     string | null  // null when no caution for this month
  luckyDays:   number[]       // day-of-month values 1-31
  color:       string         // hex color representing month energy
}

export interface CalendarData {
  overallTheme:  string
  peakMonths:    string[]       // month names e.g. ['April', 'September']
  cautionMonths: string[]       // month names e.g. ['January', 'October']
  months:        CalendarMonth[] // always length 12
}
