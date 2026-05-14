export const duration = {
  micro:      150,
  fast:       200,
  default:    250,
  transition: 300,
  hero:       500,
} as const

// Cubic-bezier control points: [x1, y1, x2, y2]
// enter         — Apple signature out; default for entrances
// exit          — accelerated out; for exits and dismissals
// transition    — bidirectional standard
// heroEntrance  — expo out; prestige reveal moments only (use sparingly)
// softSettle    — soft overshoot; for emotional moments without bounciness
export const easing = {
  enter:        [0.32, 0.72, 0, 1] as const,
  exit:         [0.4, 0, 1, 1] as const,
  transition:   [0.4, 0, 0.2, 1] as const,
  heroEntrance: [0.16, 1, 0.3, 1] as const,
  softSettle:   [0.34, 1.56, 0.64, 1] as const,
} as const

// Legacy string aliases — deprecated, do not use in new code
// Kept temporarily for any third-party library expecting string easings
export const easingLegacy = {
  enter:      'easeOut',
  exit:       'easeIn',
  transition: 'easeInOut',
} as const

export const stagger = {
  child:      60,
  maxVisible: 4,
} as const
