// ── Tier 2: Semantic surface tokens ──────────────────────────────────────────
// Maps raw primitive color values to semantic roles.
// Cluster 15a-fix-2: card surfaces replaced with cosmic deep blue-violet palette.
// Canvas stays warm-charcoal (#15110D) — cool cards on warm canvas = premium contrast.

export const surfaceCanvas = '#15110D'         // screen background — matches surface.base

// ── Card semantic surfaces — all rgba 0.20, warm umber family ──────────────────
// Hierarchy is controlled by RGB brightness, not opacity.
// canvas (#15110D warm charcoal) bleeds through all cards uniformly.
export const surfaceCardContent      = 'rgba(42,31,24,0.20)'    // warm umber base
export const surfaceCardElevated     = 'rgba(58,42,31,0.20)'    // warm tan — one luminance step above
export const surfaceCardLocked       = 'rgba(42,31,24,0.20)'    // mirrors content

// ── Card semantic surfaces — gradient (two stops, top→bottom) ────────────────
// Premium: very subtle gradient — top barely brighter than content, base matches content
export const surfaceCardPremiumGlowTop = 'rgba(68,50,38,0.20)'   // slightly above content
export const surfaceCardPremiumBase    = 'rgba(42,31,24,0.20)'   // matches content exactly

// Accent: navy and rust stat/conversion cards (preserved)
export const surfaceCardAccentNavyTop    = '#2A2F5A'
export const surfaceCardAccentNavyBottom = '#1E2245'
export const surfaceCardAccentRustTop    = '#C25A2E'
export const surfaceCardAccentRustBottom = '#9A4520'

// Featured: warm copper — ad-hoc featured moments only (e.g. "Annual Forecast")
export const surfaceCardFeaturedTop    = '#A87850'
export const surfaceCardFeaturedBottom = '#5A3A22'

// ── Tier 3: Component tokens ──────────────────────────────────────────────────
// Consumed directly by Card.tsx variantConfig.
// Solid variants: backgroundColor string.
// Gradient variants: colors tuple [top, bottom] for LinearGradient.

export const cardTokens = {
  background: {
    content:          surfaceCardContent,
    elevated:         surfaceCardElevated,
    locked:           surfaceCardLocked,
    // Premium: cosmic deep blue-violet with top-spotlight gradient
    premiumGradient:      [surfaceCardPremiumGlowTop,   surfaceCardPremiumBase]        as [string, string],
    // Accent stat/conversion cards
    accentNavyGradient:   [surfaceCardAccentNavyTop,    surfaceCardAccentNavyBottom]   as [string, string],
    accentRustGradient:   [surfaceCardAccentRustTop,    surfaceCardAccentRustBottom]   as [string, string],
    // Featured: warm copper — for ad-hoc featured moments only
    featuredGradient:     [surfaceCardFeaturedTop,      surfaceCardFeaturedBottom]     as [string, string],
  },
  border: {
    content:     'rgba(255,255,255,0.06)',  // hairline on solid content cards
    elevated:    'rgba(255,255,255,0.06)',  // hairline on elevated cards
    locked:      'transparent',
    premium:     'transparent',
    accentNavy:  'transparent',
    accentRust:  'transparent',
    featured:    'transparent',
  },
  text: {
    onDark:          '#FFFFFF',              // primary text on all gradient cards
    onDarkSecondary: 'rgba(255,255,255,0.78)',
  },
} as const

export type CardTokens = typeof cardTokens
