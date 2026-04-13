/**
 * OMENORA Design System — exact token mirror of the web app.
 *
 * All values are sourced directly from the web app CSS so every screen
 * renders identically to its web counterpart.
 */

export const colors = {
  // ── Background ────────────────────────────────────────────────────────────
  background: {
    main:       '#050410',
    card:       'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    primary:   'rgba(255, 255, 255, 0.93)',
    secondary: 'rgba(255, 255, 255, 0.72)',
    tertiary:  'rgba(255, 255, 255, 0.48)',
    muted:     'rgba(255, 255, 255, 0.25)',
    dim:       'rgba(255, 255, 255, 0.18)',
  },

  // ── Gold accent (rgba(201, 168, 76, x)) ───────────────────────────────────
  gold: {
    full:    'rgba(201, 168, 76, 1)',
    high:    'rgba(201, 168, 76, 0.92)',
    medium:  'rgba(201, 168, 76, 0.62)',
    low:     'rgba(201, 168, 76, 0.38)',
    subtle:  'rgba(201, 168, 76, 0.22)',
    ghost:   'rgba(201, 168, 76, 0.07)',
  },

  // ── Purple accent (rgba(140, 110, 255, x)) ────────────────────────────────
  purple: {
    full:   'rgba(140, 110, 255, 0.88)',
    high:   'rgba(140, 110, 255, 0.55)',
    medium: 'rgba(140, 110, 255, 0.22)',
    low:    'rgba(140, 110, 255, 0.08)',
  },

  // ── Purple light (rgba(200, 180, 255, x)) ─────────────────────────────────
  purpleLight: {
    high:   'rgba(200, 180, 255, 0.95)',
    medium: 'rgba(200, 180, 255, 0.60)',
    low:    'rgba(200, 180, 255, 0.42)',
  },

  // ── Semantic ──────────────────────────────────────────────────────────────
  semantic: {
    error: '#FF5252',
  },

  // ── Gradient presets (LinearGradient colors arrays) ───────────────────────
  gradients: {
    // Dark background — used for SafeAreaView fill behind ScrollView
    cosmic: ['#050410', '#050410'] as const,
    // Primary action button (purple)
    primary: ['rgba(140, 110, 255, 0.88)', 'rgba(140, 110, 255, 1)'] as const,
    // Gold progress fill
    goldPurple: ['rgba(140, 110, 255, 0.55)', 'rgba(201, 168, 76, 0.55)'] as const,
  },
} as const;

export type Colors = typeof colors;
