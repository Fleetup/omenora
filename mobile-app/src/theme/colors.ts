/**
 * OMENORA Mobile Design System — Color Tokens
 *
 * Token names mirror the web app's editorial.css / tailwind.config.ts exactly.
 * Values are dark-theme equivalents — same visual roles, inverted palette.
 *
 * Web (light) → Mobile (dark):
 *   --color-bone  #F2EBDD (page bg)   →  bone  #050410 (page bg)
 *   --color-ink   #1A1612 (text)      →  ink   rgba(255,255,255,0.93) (text)
 *   --color-gold  #C9A961 (accent)    →  gold  #C9A961 — IDENTICAL
 *
 * Rule: Never use inline color literals in components or screens.
 *       Always reference a token from this file.
 */

export const colors = {
  // ── Background ────────────────────────────────────────────────────────────
  bone: '#050410',                        // web: --color-bone (#F2EBDD)

  // ── Ink scale — text and UI hierarchy ────────────────────────────────────
  ink:       'rgba(255, 255, 255, 0.93)', // web: --color-ink (#1A1612)              primary text, CTA fill
  inkHigh:   'rgba(255, 255, 255, 0.88)', // mobile-only                             display headings, section titles
  inkMid:    'rgba(255, 255, 255, 0.72)', // web: --color-ink-mid (#3D3530)          secondary text, active states
  inkFaint:  'rgba(255, 255, 255, 0.45)', // web: --color-ink-faint rgba(26,22,18,0.45)  labels, captions
  inkDim:    'rgba(255, 255, 255, 0.28)', // mobile-only                             hints, placeholders, sub-labels
  inkGhost:  'rgba(255, 255, 255, 0.08)', // web: --color-ink-ghost rgba(26,22,18,0.18)  rules, tracks, borders
  inkTrace:  'rgba(255, 255, 255, 0.04)', // mobile-only                             very faint dividers, tinted surfaces

  // ── Gold accent ───────────────────────────────────────────────────────────
  gold:       '#C9A961',                   // web: --color-gold (#C9A961) — IDENTICAL
  goldDim:    'rgba(201, 169, 97, 0.45)', // web: --color-gold-dim rgba(201,169,97,0.55)  muted gold text and icons
  goldSubtle: 'rgba(201, 169, 97, 0.07)', // mobile-only                             selection tint backgrounds

  // ── Elevated surfaces ─────────────────────────────────────────────────────
  surface: 'rgba(255, 255, 255, 0.03)',   // card background above bone

  // ── Semantic ──────────────────────────────────────────────────────────────
  error: '#FF5252',

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradients: {
    cosmic:     ['#050410', '#050410'] as const,
    primary:    ['rgba(140, 110, 255, 0.88)', 'rgba(140, 110, 255, 1)'] as const,    // legacy — slated for removal in Phase 0 Step 0.8
    goldPurple: ['rgba(140, 110, 255, 0.55)', 'rgba(201, 168, 76, 0.55)'] as const, // legacy — remove on screen redesign
  },
} as const;

export type Colors = typeof colors;
