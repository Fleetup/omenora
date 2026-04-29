/**
 * AI response schemas for all Anthropic generation endpoints.
 *
 * This is the single source of truth for every JSON structure
 * that Claude is expected to return. Each schema will be used
 * in Phases 4–5 to migrate endpoints to structured outputs.
 *
 * Zod v3.23.0 is already installed — no new dependency required.
 *
 * Schema index:
 *   ReportSchema           — generate-report.post.ts
 *                            apply-promo-access.post.ts (inline)
 *                            stripe/webhook.post.ts (inline)
 *   CalendarSchema         — generate-calendar.post.ts
 *                            stripe/webhook.post.ts (inline)
 *   CompatibilitySchema    — generate-compatibility.post.ts
 *   BirthChartSchema       — generate-birth-chart.post.ts
 *   VedicSectionSchema     — generate-vedic-section.post.ts
 *   BaziSectionSchema      — generate-bazi-section.post.ts
 *   TarotSectionSchema     — generate-tarot-section.post.ts
 *   DailyInsightSchema     — generate-daily-insight.post.ts
 */

import { z } from 'zod'

// ── Shared constants ────────────────────────────────────────────────────────

/**
 * The 12 valid archetype IDs (lowercase, used as input to all endpoints).
 * Source of truth: app/utils/archetypes.ts ARCHETYPES array.
 */
export const VALID_ARCHETYPE_IDS = [
  'phoenix', 'architect', 'storm', 'lighthouse', 'wanderer',
  'alchemist', 'guardian', 'visionary', 'mirror', 'catalyst',
  'sage', 'wildfire',
] as const

/**
 * The 12 valid full archetype names (Title Case, as Claude returns them).
 * Matches the archetypeName field values instructed in every prompt.
 */
export const VALID_ARCHETYPE_NAMES = [
  'The Phoenix',
  'The Silent Architect',
  'The Storm Caller',
  'The Lighthouse',
  'The Wanderer',
  'The Alchemist',
  'The Guardian',
  'The Visionary',
  'The Mirror',
  'The Catalyst',
  'The Sage',
  'The Wildfire',
] as const

// ── ReportSchema ────────────────────────────────────────────────────────────
// Used by: generate-report.post.ts
//          apply-promo-access.post.ts (inline generateReport)
//          stripe/webhook.post.ts (inline generateReport)
//
// Expected Claude output shape (from generate-report prompt lines 677–691):
// {
//   archetypeName: "The [Name]",
//   archetypeSymbol: "[single character]",
//   element: "[Fire/Earth/Air/Water]",
//   powerTraits: ["trait1", "trait2", "trait3"],
//   sections: {
//     identity:    { title, content },
//     science:     { title, content },
//     forecast:    { title, content },
//     love:        { title, content },
//     purpose:     { title, content },
//     gift:        { title, content },
//     affirmation: { title, content },
//   }
// }

const ReportSectionSchema = z.object({
  title:   z.string().min(1),
  content: z.string().min(1),
})

export const ReportSchema = z.object({
  archetypeName:   z.enum(VALID_ARCHETYPE_NAMES),
  archetypeSymbol: z.string().min(1).max(4),
  element:         z.enum(['Fire', 'Earth', 'Air', 'Water']),
  powerTraits:     z.array(z.string().min(1)).length(3),
  sections: z.object({
    identity:    ReportSectionSchema,
    science:     ReportSectionSchema,
    forecast:    ReportSectionSchema,
    love:        ReportSectionSchema,
    purpose:     ReportSectionSchema,
    gift:        ReportSectionSchema,
    affirmation: ReportSectionSchema,
  }),
})

export type ReportType = z.infer<typeof ReportSchema>

// ── CalendarSchema ──────────────────────────────────────────────────────────
// Used by: generate-calendar.post.ts
//          stripe/webhook.post.ts (inline generateCalendar)
//
// Expected Claude output shape (from generate-calendar prompt lines 63–81):
// {
//   overallTheme: "...",
//   peakMonths:    ["April", "September"],
//   cautionMonths: ["January", "October"],
//   months: [{ month, number, energyLevel, theme, love, money, career,
//              warning, luckyDays, color }] (12 entries)
// }

const CalendarMonthSchema = z.object({
  month:       z.string().min(1),
  number:      z.number().int().min(1).max(12),
  energyLevel: z.number().int().min(0).max(100),
  theme:       z.string().min(1),
  love:        z.string().min(1),
  money:       z.string().min(1),
  career:      z.string().min(1),
  warning:     z.string().nullable(),
  luckyDays:   z.array(z.number().int().min(1).max(31)).min(1),
  color:       z.string().min(1),
})

export const CalendarSchema = z.object({
  overallTheme:  z.string().min(1),
  peakMonths:    z.array(z.string().min(1)).min(1),
  cautionMonths: z.array(z.string().min(1)).min(1),
  months:        z.array(CalendarMonthSchema).length(12),
})

export type CalendarType = z.infer<typeof CalendarSchema>

// ── CompatibilitySchema ─────────────────────────────────────────────────────
// Used by: generate-compatibility.post.ts
//
// Expected Claude output shape (7 sections):
// {
//   compatibilityScore: 85,
//   compatibilityTitle: "...",
//   sections: {
//     bond:          { title, content },  — The Bond That Holds You Together
//     strength:      { title, content },  — Your Greatest Strength Together
//     challenge:     { title, content },  — The Tension You Must Navigate (free preview)
//     communication: { title, content },  — The Communication Pattern
//     powerDynamic:  { title, content },  — The Power Dynamic
//     forecast:      { title, content },  — The Timing Forecast (7-day transit window)
//     advice:        { title, content },  — The Advice
//   }
// }
//
// API response also includes (assembled server-side, not from Claude):
//   previewMode:        boolean (optional, true when sections are partially locked)
//   calculationReceipt: object  (transparent math receipt shown on the report)

const CompatibilitySectionSchema = z.object({
  title:   z.string().min(1),
  content: z.string().min(1),
})

export const CompatibilitySchema = z.object({
  compatibilityScore: z.number().int().min(0).max(100),
  compatibilityTitle: z.string().min(1),
  sections: z.object({
    bond:          CompatibilitySectionSchema,
    strength:      CompatibilitySectionSchema,
    challenge:     CompatibilitySectionSchema,
    communication: CompatibilitySectionSchema,
    powerDynamic:  CompatibilitySectionSchema,
    forecast:      CompatibilitySectionSchema,
    advice:        CompatibilitySectionSchema,
  }),
})

export type CompatibilityType = z.infer<typeof CompatibilitySchema>

// ── CompatibilityReceipt ────────────────────────────────────────────────────
// Transparent calculation receipt appended to every compatibility response.
// Not validated by Claude — assembled server-side from deterministic inputs.

export const CompatibilityReceiptPersonSchema = z.object({
  name:           z.string(),
  dateOfBirth:    z.string(),
  sunSign:        z.string(),
  element:        z.string(),
  lifePathNumber: z.number().int(),
  archetype:      z.string().optional(),
})

export const CompatibilityReceiptSchema = z.object({
  person1:           CompatibilityReceiptPersonSchema,
  person2:           CompatibilityReceiptPersonSchema.omit({ archetype: true }),
  synastryNotes:     z.array(z.string()).min(1),
  tradition:         z.literal('Western (Tropical)'),
  calculationSource: z.literal('Swiss Ephemeris'),
  generatedAt:       z.string(),
})

export type CompatibilityReceiptType = z.infer<typeof CompatibilityReceiptSchema>

// ── BirthChartSchema ────────────────────────────────────────────────────────
// Used by: generate-birth-chart.post.ts
//
// Expected Claude output shape (from generate-birth-chart prompt):
// {
//   risingSign:     "...",
//   sunSign:        "...",
//   moonSign:       "...",
//   dominantPlanet: "...",
//   powerHouse:     "...",
//   chartTitle:     "4-6 word poetic title (must NOT contain archetype names)",
//   reading:        "full planetary reading",
//   forecast2026:   "2-3 sentence forecast",
// }

export const BirthChartSchema = z.object({
  risingSign:     z.string().min(1),
  sunSign:        z.string().min(1),
  moonSign:       z.string().min(1),
  dominantPlanet: z.string().min(1),
  powerHouse:     z.string().min(1),
  chartTitle:     z.string().min(1),
  reading:        z.string().min(1),
  forecast2026:   z.string().min(1),
})

export type BirthChartType = z.infer<typeof BirthChartSchema>

/**
 * Applies a runtime semantic refinement to a parsed BirthChartType object.
 *
 * The chartTitle must not contain any archetype name string other than
 * the one that matches the expected archetype for this user. This catches
 * the class of bug where Claude hallucinates a different archetype label
 * in the chart title (e.g. "Alchemist" for a Catalyst user).
 *
 * Called in generate-birth-chart.post.ts after structured output parsing.
 * If a violation is found, the title is silently corrected and the
 * violation is logged — no error is thrown.
 *
 * @param birthChart    The parsed and schema-validated birth chart object
 * @param expectedArchetype  The archetype ID (e.g. 'catalyst') for this user
 * @returns The birth chart object with chartTitle guaranteed clean
 */
export function validateBirthChartTitle(
  birthChart: BirthChartType,
  expectedArchetype: string,
): BirthChartType {
  // Map archetype ID -> the full name string Claude would use in a title
  const archetypeNameMap: Record<string, string> = {
    phoenix:    'Phoenix',
    architect:  'Architect',
    storm:      'Storm',
    lighthouse: 'Lighthouse',
    wanderer:   'Wanderer',
    alchemist:  'Alchemist',
    guardian:   'Guardian',
    visionary:  'Visionary',
    mirror:     'Mirror',
    catalyst:   'Catalyst',
    sage:       'Sage',
    wildfire:   'Wildfire',
  }

  const expectedName = archetypeNameMap[expectedArchetype]
  const titleLower   = birthChart.chartTitle.toLowerCase()

  // Check each archetype name against the title
  for (const [archetypeId, archetypeName] of Object.entries(archetypeNameMap)) {
    if (archetypeId === expectedArchetype) continue
    if (titleLower.includes(archetypeName.toLowerCase())) {
      console.error('[generate-birth-chart] chartTitle contains wrong archetype name — correcting', {
        endpoint:           'generate-birth-chart',
        timestamp:          new Date().toISOString(),
        originalTitle:      birthChart.chartTitle,
        wrongArchetype:     archetypeName,
        expectedArchetype:  expectedName ?? expectedArchetype,
      })
      // Replace the wrong archetype name with the correct one
      const correctedTitle = birthChart.chartTitle.replace(
        new RegExp(archetypeName, 'gi'),
        expectedName ?? expectedArchetype,
      )
      return { ...birthChart, chartTitle: correctedTitle }
    }
  }

  return birthChart
}

// ── VedicSectionSchema ──────────────────────────────────────────────────────
// Used by: generate-vedic-section.post.ts
//
// Expected Claude output shape (from generate-vedic-section prompt lines 57–67):
// {
//   nakshatraName:    "...",
//   rulingPlanet:     "...",
//   vedicTitle:       "...",
//   reading:          "...",
//   karmicMission:    "...",
//   remedy:           "...",
//   auspiciousColors: ["color1", "color2"],
//   auspiciousDays:   ["Monday", "Thursday"],
// }

export const VedicSectionSchema = z.object({
  nakshatraName:    z.string().min(1),
  rulingPlanet:     z.string().min(1),
  vedicTitle:       z.string().min(1),
  reading:          z.string().min(1),
  karmicMission:    z.string().min(1),
  remedy:           z.string().min(1),
  auspiciousColors: z.array(z.string().min(1)).min(1),
  auspiciousDays:   z.array(z.string().min(1)).min(1),
})

export type VedicSectionType = z.infer<typeof VedicSectionSchema>

// ── BaziSectionSchema ───────────────────────────────────────────────────────
// Used by: generate-bazi-section.post.ts
//
// Expected Claude output shape (from generate-bazi-section prompt lines 58–68):
// {
//   dayMaster:       "...",
//   dominantElement: "...",
//   baziTitle:       "...",
//   reading:         "...",
//   wealthLuck2026:  "...",
//   luckyDirections: ["North", "Southeast"],
//   luckyColors:     ["color1", "color2"],
//   luckyNumbers:    [1, 6, 8],
// }

export const BaziSectionSchema = z.object({
  dayMaster:       z.string().min(1),
  dominantElement: z.string().min(1),
  baziTitle:       z.string().min(1),
  reading:         z.string().min(1),
  wealthLuck2026:  z.string().min(1),
  luckyDirections: z.array(z.string().min(1)).min(1),
  luckyColors:     z.array(z.string().min(1)).min(1),
  luckyNumbers:    z.array(z.number().int()).min(1),
})

export type BaziSectionType = z.infer<typeof BaziSectionSchema>

// ── TarotSectionSchema ──────────────────────────────────────────────────────
// Used by: generate-tarot-section.post.ts
//
// Expected Claude output shape (from generate-tarot-section prompt lines 84–94):
// {
//   soulCard:             "Card name only",
//   soulCardMeaning:      "...",
//   reading:              "...",
//   loveMessage:          "...",
//   transformativePeriod: "Specific month or season in 2026",
//   blessing:             "...",
//   spiritColors:         ["color1", "color2"],
//   luckyCharm:           "...",
// }

export const TarotSectionSchema = z.object({
  soulCard:             z.string().min(1),
  soulCardMeaning:      z.string().min(1),
  reading:              z.string().min(1),
  loveMessage:          z.string().min(1),
  transformativePeriod: z.string().min(1),
  blessing:             z.string().min(1),
  spiritColors:         z.array(z.string().min(1)).min(1),
  luckyCharm:           z.string().min(1),
})

export type TarotSectionType = z.infer<typeof TarotSectionSchema>

// ── DailyInsightSchema ──────────────────────────────────────────────────────
// Used by: generate-daily-insight.post.ts
//
// Expected Claude output shape:
// {
//   love:                "2-3 sentences — love/relationships insight",
//   work:                "2-3 sentences — work/focus/energy insight",
//   health:              "2-3 sentences — physical/mental wellbeing insight",
//   reflection_question: "one inward-facing question",
//   theme:               "<todayTheme>",
// }

export const DailyInsightSchema = z.object({
  love:                z.string().min(1),
  work:                z.string().min(1),
  health:              z.string().min(1),
  reflection_question: z.string().min(1),
  theme:               z.string().min(1),
})

export type DailyInsightType = z.infer<typeof DailyInsightSchema>

// ── WeeklyTransitSchema ──────────────────────────────────────────────────────
// Used by: generate-weekly-transit.post.ts
//
// Expected Claude output shape:
// {
//   connection:    "2-3 sentences — overall connection energy this week",
//   communication: "2-3 sentences — Mercury-influenced communication patterns",
//   tension:       "2-3 sentences — honest friction points to be aware of",
//   advice:        "1-2 sentences — specific actionable suggestion",
//   weekTheme:     "short planetary theme label, max 50 chars",
// }

export const WeeklyTransitSchema = z.object({
  connection:    z.string().min(1),
  communication: z.string().min(1),
  tension:       z.string().min(1),
  advice:        z.string().min(1),
  weekTheme:     z.string().min(1),
})

export type WeeklyTransitType = z.infer<typeof WeeklyTransitSchema>
