/*
 * ARCHETYPE DISTRIBUTION TEST — 2026-04-18
 * Each archetype verified reachable via scoring matrix simulation:
 * phoenix ✓ | architect ✓ | storm ✓
 * lighthouse ✓ | wanderer ✓ | alchemist ✓
 * guardian ✓ | visionary ✓ | mirror ✓
 * catalyst ✓ | sage ✓ | wildfire ✓
 *
 * Winning answer sets (see debugArchetypeScores for live verification):
 *   phoenix    : q1=trust,  q2=softer,    q3=giving,  q4=capable, q5=intense,     q6=next,    q7=feelsnothing
 *   architect  : q1=wait,   q2=ambitious, q3=unseen,  q4=capable, q5=reliable,    q6=next,    q7=feelsnothing
 *   storm      : q1=push,   q2=sharper,   q3=burden,  q4=toomuch, q5=intense,     q6=next,    q7=pushesaway
 *   lighthouse : q1=trust,  q2=softer,    q3=giving,  q4=alone,   q5=reliable,    q6=share,   q7=givesup
 *   wanderer   : q1=wait,   q2=lost,      q3=leaving, q4=matters, q5=independent, q6=wonder,  q7=pushesaway
 *   alchemist  : q1=push,   q2=ambitious, q3=burden,  q4=capable, q5=intense,     q6=next,    q7=feelsnothing
 *   guardian   : q1=trust,  q2=softer,    q3=giving,  q4=alone,   q5=strong,      q6=share,   q7=givesup
 *   visionary  : q1=trust,  q2=ambitious, q3=leaving, q4=matters, q5=independent, q6=next,    q7=feelsnothing
 *   mirror     : q1=talk,   q2=softer,    q3=unseen,  q4=alone,   q5=reliable,    q6=share,   q7=needstoo
 *   catalyst   : q1=talk,   q2=sharper,   q3=burden,  q4=toomuch, q5=intense,     q6=enjoy,   q7=pushesaway
 *   sage       : q1=wait,   q2=sharper,   q3=unseen,  q4=capable, q5=reliable,    q6=wonder,  q7=givesup
 *   wildfire   : q1=push,   q2=lost,      q3=leaving, q4=toomuch, q5=independent, q6=enjoy,   q7=pushesaway
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ArchetypeId =
  | 'phoenix' | 'architect' | 'storm' | 'lighthouse' | 'wanderer'
  | 'alchemist' | 'guardian' | 'visionary' | 'mirror' | 'catalyst'
  | 'sage' | 'wildfire'

type AnswerScores = Partial<Record<ArchetypeId, number>>
type QuestionMatrix = Record<string, AnswerScores>
type ScoringMatrix = Record<string, QuestionMatrix>

// ── Archetype metadata ─────────────────────────────────────────────────────

export const ARCHETYPES: Array<{
  id: ArchetypeId
  name: string
  symbol: string
  element: string
}> = [
  { id: 'phoenix',   name: 'The Phoenix',          symbol: '●', element: 'Fire'  },
  { id: 'architect', name: 'The Silent Architect',  symbol: '◆', element: 'Earth' },
  { id: 'storm',     name: 'The Storm Caller',      symbol: '▲', element: 'Air'   },
  { id: 'lighthouse',name: 'The Lighthouse',        symbol: '◇', element: 'Water' },
  { id: 'wanderer',  name: 'The Wanderer',          symbol: '○', element: 'Air'   },
  { id: 'alchemist', name: 'The Alchemist',         symbol: '⬡', element: 'Fire'  },
  { id: 'guardian',  name: 'The Guardian',          symbol: '□', element: 'Earth' },
  { id: 'visionary', name: 'The Visionary',         symbol: '⬟', element: 'Fire'  },
  { id: 'mirror',    name: 'The Mirror',            symbol: '◉', element: 'Water' },
  { id: 'catalyst',  name: 'The Catalyst',          symbol: '✦', element: 'Air'   },
  { id: 'sage',      name: 'The Sage',              symbol: '▽', element: 'Earth' },
  { id: 'wildfire',  name: 'The Wildfire',          symbol: '★', element: 'Fire'  },
]

const ALL_ARCHETYPE_IDS = ARCHETYPES.map((a) => a.id) as ArchetypeId[]

// ── Scoring matrix ─────────────────────────────────────────────────────────
//
// Structure: MATRIX[questionId][answerValue] = { archetypeId: points, ... }
//
// Weight convention:
//   3 = primary match  — this answer is a strong signal for this archetype
//   2 = secondary match — meaningful signal, not definitive
//   1 = tertiary match — mild correlation
//   0 = absent (omit key entirely)
//
// Design principles:
//   • Each answer scores 2–4 archetypes, never all 12
//   • Every archetype must be reachable; no archetype dominates by default
//   • Psychological meaning of the answer drives the weight, not arbitrary values
//   • q6 and q7 carry equal weight to q1–q5
//
// ── Question semantics ────────────────────────────────────────────────────
//   q1: response to unexplained wrongness (gut vs logic vs social vs suppression)
//       trust=intuitive actor | wait=evidence-gatherer | talk=relational processor | push=force-through
//   q2: hidden self (what people don't see)
//       softer=masked sensitivity | sharper=masked acuity | ambitious=masked drive | lost=masked confusion
//   q3: deepest relationship wound
//       leaving=abandonment | unseen=invisibility | giving=depletion | burden=shame
//   q4: shadow/following thought
//       capable=impostor | alone=isolation terror | matters=existential void | toomuch=intensity shame
//   q5: complicated label others apply
//       strong=forced strength | reliable=over-responsible | intense=overwhelming depth | independent=emotional unavailability
//   q6: response to good things
//       enjoy=healthy presence | wonder=waiting for it to end | share=relational joy | next=compulsive forward motion
//   q7: most feared version of self
//       givesup=collapse | feelsnothing=hollow success | needstoo=dependency | pushesaway=self-sabotage

const MATRIX: ScoringMatrix = {
  q1: {
    trust: {
      phoenix:    3,
      visionary:  2,
      lighthouse: 2,
      guardian:   1,
    },
    wait: {
      architect:  3,
      sage:       3,
      wanderer:   2,
    },
    talk: {
      mirror:    3,
      catalyst:  3,
      lighthouse: 1,
    },
    push: {
      alchemist:  3,
      storm:      3,
      wildfire:   2,
    },
  },

  q2: {
    softer: {
      mirror:     3,
      lighthouse: 2,
      guardian:   2,
      phoenix:    1,
    },
    sharper: {
      sage:       3,
      catalyst:   3,
      architect:  2,
      storm:      1,
    },
    ambitious: {
      visionary:  3,
      architect:  3,
      alchemist:  2,
    },
    lost: {
      wanderer:   3,
      wildfire:   3,
      mirror:     1,
    },
  },

  q3: {
    leaving: {
      wanderer:   3,
      phoenix:    2,
      visionary:  2,
      wildfire:   1,
    },
    unseen: {
      sage:       3,
      mirror:     3,
      architect:  1,
    },
    giving: {
      lighthouse: 3,
      guardian:   3,
      phoenix:    2,
      alchemist:  1,
    },
    burden: {
      storm:      3,
      alchemist:  3,
      catalyst:   2,
      wildfire:   1,
    },
  },

  q4: {
    capable: {
      phoenix:    3,
      architect:  2,
      alchemist:  2,
      sage:       1,
    },
    alone: {
      mirror:     3,
      lighthouse: 3,
      guardian:   3,
      wanderer:   1,
    },
    matters: {
      wanderer:   3,
      visionary:  3,
      storm:      2,
    },
    toomuch: {
      storm:      3,
      catalyst:   3,
      wildfire:   2,
    },
  },

  q5: {
    strong: {
      guardian:   3,
      phoenix:    3,
      storm:      2,
    },
    reliable: {
      lighthouse: 3,
      guardian:   2,
      architect:  2,
      mirror:     2,
      sage:       1,
    },
    intense: {
      phoenix:    3,
      catalyst:   3,
      storm:      2,
      alchemist:  1,
    },
    independent: {
      wanderer:   3,
      visionary:  3,
      wildfire:   2,
    },
  },

  q6: {
    enjoy: {
      wildfire:   3,
      catalyst:   2,
      phoenix:    1,
    },
    wonder: {
      wanderer:   3,
      sage:       2,
      mirror:     2,
      architect:  1,
    },
    share: {
      mirror:     3,
      lighthouse: 3,
      guardian:   2,
    },
    next: {
      visionary:  3,
      architect:  3,
      alchemist:  2,
      phoenix:    2,
      storm:      1,
    },
  },

  q7: {
    givesup: {
      guardian:   3,
      lighthouse: 2,
      sage:       2,
      phoenix:    1,
    },
    feelsnothing: {
      architect:  3,
      visionary:  3,
      alchemist:  2,
      phoenix:    2,
    },
    needstoo: {
      mirror:     3,
      wanderer:   2,
      catalyst:   1,
    },
    pushesaway: {
      storm:      3,
      wildfire:   3,
      wanderer:   2,
      catalyst:   2,
    },
  },
}

// ── Tiebreaker ─────────────────────────────────────────────────────────────
//
// Used only when two archetypes share the exact same top score.
// q5 (the "complicated label") is the strongest single-question identity
// signal — it maps one-to-one onto four clear archetype clusters.

const TIEBREAKER: Record<string, ArchetypeId> = {
  strong:      'guardian',
  reliable:    'lighthouse',
  intense:     'phoenix',
  independent: 'visionary',
}

const DEFAULT_ARCHETYPE: ArchetypeId = 'wildfire'

// ── Scoring engine ─────────────────────────────────────────────────────────

export function assignArchetype(answers: Record<string, string>): ArchetypeId {
  const scores: Record<ArchetypeId, number> = Object.fromEntries(
    ALL_ARCHETYPE_IDS.map((id) => [id, 0]),
  ) as Record<ArchetypeId, number>

  for (const [questionId, answerValue] of Object.entries(answers)) {
    if (!answerValue) continue
    const questionWeights = MATRIX[questionId]
    if (!questionWeights) continue
    const answerWeights = questionWeights[answerValue]
    if (!answerWeights) continue

    for (const [archetypeId, points] of Object.entries(answerWeights)) {
      if (archetypeId in scores) {
        scores[archetypeId as ArchetypeId] += points as number
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores))

  if (maxScore === 0) return DEFAULT_ARCHETYPE

  const topTied = ALL_ARCHETYPE_IDS.filter((id) => scores[id] === maxScore)

  if (topTied.length === 1) return topTied[0]!

  const q5Answer = answers['q5']
  if (q5Answer) {
    const tiebreakerWinner = TIEBREAKER[q5Answer]
    if (tiebreakerWinner && topTied.includes(tiebreakerWinner)) {
      return tiebreakerWinner
    }
  }

  return topTied[0] ?? DEFAULT_ARCHETYPE
}

// ── Dev-only debug utility ─────────────────────────────────────────────────
//
// Call debugArchetypeScores(store.answers) in browser console to see
// the full score breakdown for a given answer set.
// Strips automatically in production builds (process.env.NODE_ENV check).

export function debugArchetypeScores(answers: Record<string, string>): void {
  if (process.env.NODE_ENV === 'production') return

  const scores: Record<ArchetypeId, number> = Object.fromEntries(
    ALL_ARCHETYPE_IDS.map((id) => [id, 0]),
  ) as Record<ArchetypeId, number>

  const breakdown: Record<string, Record<string, number>> = {}

  for (const [questionId, answerValue] of Object.entries(answers)) {
    if (!answerValue) continue
    const questionWeights = MATRIX[questionId]
    if (!questionWeights) continue
    const answerWeights = questionWeights[answerValue]
    if (!answerWeights) continue

    breakdown[`${questionId}=${answerValue}`] = {}

    for (const [archetypeId, points] of Object.entries(answerWeights)) {
      if (archetypeId in scores) {
        scores[archetypeId as ArchetypeId] += points as number
        breakdown[`${questionId}=${answerValue}`]![archetypeId] = points as number
      }
    }
  }

  const winner = assignArchetype(answers)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])

  console.group(`%c[Omenora] Archetype scoring — winner: ${winner}`, 'color: #c9a84c; font-weight: bold')
  console.table(Object.fromEntries(sorted))
  console.group('Per-answer contributions')
  console.table(breakdown)
  console.groupEnd()
  console.groupEnd()
}
