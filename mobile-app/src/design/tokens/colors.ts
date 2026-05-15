export const surface = {
  deep:    '#0A0604',
  base:    '#15110D',  // Cluster 15a-fix: warmer near-black per reference palette (was #120D08)
  raised:  '#1A130C',
  overlay: '#221A12',
  floating:'#2A2218',
  inverse: '#F5F0E8',
  // New primitives — Cluster 15a
  brown450: '#312818',  // reserved for 15b hero variant — not consumed as card token in 15a
  brown400: '#3A2F1C',  // reserved for 15b hero variant — not consumed as card token in 15a
  purple700:'#3A2A5A',  // deep mystical purple — consumed by surface.card.premium (surface.ts)
} as const

export const text = {
  primary:   'rgba(255,255,255,0.93)',
  secondary: 'rgba(255,255,255,0.68)',
  tertiary:  'rgba(255,255,255,0.45)',
  disabled:  'rgba(255,255,255,0.30)',
  inverse:   '#15110D',  // matches surface.base
  accent:    '#C9A961',
} as const

export const accent = {
  primary:  '#C9A961',
  emphasis: '#E0C078',
  subtle:   'rgba(201,169,97,0.10)',
  muted:    'rgba(201,169,97,0.04)',
} as const

export const border = {
  subtle:  'rgba(255,255,255,0.06)',
  default: 'rgba(255,255,255,0.10)',
  strong:  'rgba(255,255,255,0.18)',
  accent:  'rgba(201,169,97,0.40)',
  hairline:'rgba(255,255,255,0.04)',
  gold:    'rgba(201,169,97,0.22)',
} as const

export const state = {
  success: '#5EBE8A',
  warning: '#D9A24A',
  danger:  '#E07D7D',
  info:    '#7AA0E0',
} as const

export const specialty = {
  lockScrim:      'rgba(5,4,16,0.65)',
  /** @deprecated Cluster 15a — LockedCard no longer uses absoluteFill scrim. Remove in 15b. */
  lockScrimLight: 'rgba(8,10,22,0.50)',
  /** @deprecated Cluster 15a — lockBlur unused after BlurView removal. Remove in 15b. */
  lockBlur:       40,
  chatUser:     '#13122A',
  chatCounsel:  'rgba(201,169,97,0.10)',
  glassTint:    'rgba(255,255,255,0.10)',
  glassTintBlue:'rgba(160,180,255,0.12)',  // kept for other uses
  premiumBtnGradient: ['#1E2A4A', '#131A32'] as const,
  premiumBtnOverlay:  'rgba(80,110,180,0.15)',
  white:        '#FFFFFF',
  overlayScrim: 'rgba(0,0,0,0.60)',
  // Cluster 16b: semantic surface tint for stale forecast content
  forecastStaleSurface: 'rgba(194, 136, 64, 0.12)',
  // Card frosted-glass tokens — DEPRECATED Cluster 15a. Replaced by surface.ts cardTokens. Remove in 15b.
  /** @deprecated Use cardTokens.background.default from surface.ts. Remove in 15b. */
  cardBlurIntensity:   22,
  /** @deprecated Use cardTokens.background.default from surface.ts. Remove in 15b. */
  cardTintDefault:     'rgba(30,40,80,0.28)',
  /** @deprecated Use cardTokens.background.elevated from surface.ts. Remove in 15b. */
  cardTintRaised:      'rgba(30,40,80,0.38)',
  /** @deprecated Use cardTokens.background.premium from surface.ts. Remove in 15b. */
  cardTintPremium:     'rgba(28,36,72,0.42)',
  /** @deprecated Use cardTokens.background.locked from surface.ts. Remove in 15b. */
  cardTintGlass:       'rgba(20,30,70,0.18)',
  // Cluster 17c: hero image overlay gradient — warm-black scrim (opaque and transparent ends)
  heroScrim:            'rgba(21, 17, 13, 1.0)',
  heroScrimTransparent: 'rgba(10, 6, 4, 0)',
} as const

export const gradient = {
  cardGlass: ['#201710', '#16100A'] as const,
} as const

export const tokens = { surface, text, accent, border, state, specialty, gradient } as const
export type DesignTokens = typeof tokens
