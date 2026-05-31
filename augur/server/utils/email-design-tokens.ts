/**
 * Email Design Tokens
 *
 * Single source of truth for all inline-style values used across
 * every server-rendered email HTML template (Resend / Nitro).
 *
 * WHY THIS FILE EXISTS:
 *   CSS custom properties (--omn-*) are not supported in email clients.
 *   All email HTML must use hardcoded inline styles. This file mirrors
 *   the canonical values from app/assets/css/editorial.css so that:
 *     1. Colors/fonts/spacing are consistent with the live site.
 *     2. Changes to the design system only need updating in one place.
 *     3. No scattered magic strings across email builder files.
 *
 * FONT NOTE:
 *   Brand font `Onest` is not web-safe and unavailable in email clients.
 *   Email uses Georgia (display/body) + system-ui (UI labels/caps).
 *   This is the closest web-safe approximation of the brand typography.
 *
 * SYMBOL NOTE:
 *   Archetype symbols are served as hosted PNGs at:
 *   https://omenora.com/symbols/{id}@2x.png
 *   Use `emailSymbolImg()` to render them safely in all email clients.
 */

// ── Surfaces (mirrors --omn-bg-page / --omn-bg-primary / --omn-bg-elevated) ──
export const E_BG_PAGE      = '#121214'  // --omn-bg-page
export const E_BG_PRIMARY   = '#252528'  // --omn-bg-primary
export const E_BG_ELEVATED  = '#2F2F33'  // --omn-bg-elevated
export const E_BG_SECTION   = 'rgba(37, 37, 40, 0.60)'  // card/block bg on dark

// ── Borders (mirrors --omn-border-subtle / --omn-border-primary) ─────────────
export const E_BORDER_SUBTLE   = '#2F2F33'                    // --omn-border-subtle
export const E_BORDER_PRIMARY  = '#3A3A3F'                    // --omn-border-primary
export const E_BORDER_FAINT    = 'rgba(255, 255, 255, 0.06)'  // --border-faint
export const E_BORDER_DEFAULT  = 'rgba(255, 255, 255, 0.10)'  // --border-subtle

// ── Text (mirrors --omn-text-primary / secondary / tertiary) ─────────────────
export const E_TEXT_PRIMARY   = '#F2EDE5'  // --omn-text-primary
export const E_TEXT_SECONDARY = '#A8A19A'  // --omn-text-secondary
export const E_TEXT_TERTIARY  = '#6B655E'  // --omn-text-tertiary
export const E_TEXT_MUTED     = 'rgba(242, 237, 229, 0.45)'  // tertiary alpha

// ── Accent — bronze (mirrors --omn-accent #A87D4E) ───────────────────────────
export const E_ACCENT         = '#A87D4E'                    // --omn-accent
export const E_ACCENT_QUIET   = '#6E5536'                    // --omn-accent-quiet
export const E_ACCENT_A08     = 'rgba(168, 125, 78, 0.08)'  // --omn-accent-a08
export const E_ACCENT_A18     = 'rgba(168, 125, 78, 0.18)'  // --omn-accent-a18

// ── CTA — orange (mirrors --omn-cta #E8763A) ─────────────────────────────────
export const E_CTA            = '#E8763A'   // --omn-cta
export const E_CTA_URGENT     = '#8B0000'   // urgent variant (expiry emails)
export const E_CTA_TEXT       = '#121214'   // --omn-cta-text (dark on CTA bg)

// ── Functional ───────────────────────────────────────────────────────────────
export const E_ERROR          = '#D14B3D'   // --omn-error
export const E_WARNING        = 'rgba(255, 120, 80, 0.70)'

// ── Score colours (mirrors compatibility.vue + compat-card-renderer.ts) ──────
export const E_SCORE_HIGH   = 'rgba(107, 72, 224, 0.9)'   // >= 80
export const E_SCORE_MID    = 'rgba(201, 168, 76, 0.9)'   // >= 60
export const E_SCORE_LOW    = 'rgba(180, 80, 80, 0.9)'    // < 60

export function emailScoreColor(score: number): string {
  if (score >= 80) return E_SCORE_HIGH
  if (score >= 60) return E_SCORE_MID
  return E_SCORE_LOW
}

// ── Typography — font stacks ─────────────────────────────────────────────────
export const E_FONT_DISPLAY = 'Georgia, "Times New Roman", serif'  // headlines / italic
export const E_FONT_BODY    = 'Georgia, "Times New Roman", serif'  // body text
export const E_FONT_UI      = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'  // caps labels

// ── Type sizes (mirrors --text-* scale from editorial.css) ───────────────────
export const E_TEXT_XS   = '11px'   // --text-xs
export const E_TEXT_SM   = '13px'   // --text-sm
export const E_TEXT_BASE = '15px'   // --text-base
export const E_TEXT_MD   = '17px'   // --text-md
export const E_TEXT_LG   = '19px'   // --text-lg
export const E_TEXT_XL   = '24px'   // --text-xl
export const E_TEXT_2XL  = '30px'   // --text-2xl
export const E_TEXT_3XL  = '38px'   // --text-3xl

// ── Letter spacing (mirrors --tracking-* from editorial.css) ─────────────────
export const E_TRACKING_CAPS  = '0.18em'   // --tracking-caps  (all-caps labels)
export const E_TRACKING_WIDE  = '0.15em'   // --tracking-wordmark (OMENORA wordmark)
export const E_TRACKING_LABEL = '0.12em'   // --tracking-mid   (section labels)
export const E_TRACKING_BODY  = '-0.005em' // --tracking-body  (body text)

// ── Spacing (mirrors --space-* from editorial.css) ───────────────────────────
export const E_SPACE_1  = '4px'
export const E_SPACE_2  = '8px'
export const E_SPACE_3  = '12px'
export const E_SPACE_4  = '16px'
export const E_SPACE_5  = '20px'
export const E_SPACE_6  = '24px'
export const E_SPACE_8  = '32px'
export const E_SPACE_10 = '40px'  // --space-10
export const E_SPACE_12 = '48px'

// ── Border radius (mirrors --radius-* from editorial.css) ────────────────────
export const E_RADIUS_SM  = '4px'   // --radius-sm  (brand default: subtle rounding)
export const E_RADIUS_MD  = '8px'   // --radius-md
export const E_RADIUS_LG  = '12px'  // --radius-lg  (section blocks)

// ── Email layout constants ────────────────────────────────────────────────────
export const E_MAX_WIDTH  = '600px'  // standard email column width
export const E_GUTTER     = '24px'   // outer padding L/R

// ── Archetype symbol map (symbol char → archetype ID) ────────────────────────
const SYMBOL_TO_ID: Record<string, string> = {
  '●': 'phoenix',
  '◆': 'architect',
  '▲': 'storm',
  '◇': 'lighthouse',
  '○': 'wanderer',
  '⬡': 'alchemist',
  '□': 'guardian',
  '⬟': 'visionary',
  '◉': 'mirror',
  '✦': 'catalyst',
  '▽': 'sage',
  '★': 'wildfire',
}

/**
 * Returns a hosted <img> tag for the archetype symbol PNG.
 * Works in all email clients including Outlook desktop.
 * `symbol` may be either the Unicode character (e.g. '◆') or the ID (e.g. 'architect').
 */
export function emailSymbolImg(symbol: string, size = 56): string {
  const id = SYMBOL_TO_ID[symbol] ?? symbol ?? 'phoenix'
  const url = `https://omenora.com/symbols/${id}@2x.png`
  return `<img src="${url}" width="${size}" height="${size}" alt="${id}" style="display:block;border:0;" />`
}

/**
 * Returns a hosted <img> tag for a named section symbol PNG.
 * Used for non-archetype symbols (Love & Relationship Patterns, Destiny Forecast, etc.)
 */
export function emailSectionSymbolImg(filename: string, size = 40): string {
  const encoded = encodeURIComponent(filename)
  const url = `https://omenora.com/symbols/${encoded}`
  return `<img src="${url}" width="${size}" height="${size}" alt="" role="presentation" style="display:block;border:0;" />`
}

/**
 * Section eyebrow label — uppercase caps, accent color, no emoji.
 * Used in place of emoji-prefixed section headers across all email templates.
 */
export function emailEyebrow(label: string): string {
  return `<p style="font-size:${E_TEXT_XS};font-weight:500;font-family:${E_FONT_UI};color:${E_ACCENT};text-transform:uppercase;letter-spacing:${E_TRACKING_CAPS};margin:0 0 ${E_SPACE_3};">${label}</p>`
}

/**
 * Section block wrapper — consistent card/block styling across all report emails.
 * Replaces the ad-hoc rgba background + border combinations scattered across builders.
 */
export function emailSectionBlock(content: string, opts?: {
  accentColor?: string
  borderLeft?: boolean
  textAlign?: string
  marginBottom?: string
}): string {
  const accent = opts?.accentColor ?? E_ACCENT
  const mb     = opts?.marginBottom ?? E_SPACE_8
  const align  = opts?.textAlign ?? 'left'
  const border = opts?.borderLeft
    ? `border-left:3px solid ${accent};border-top:none;border-right:none;border-bottom:none;`
    : `border:1px solid ${E_BORDER_SUBTLE};`
  return `<div style="margin-bottom:${mb};padding:${E_SPACE_6};background:${E_BG_PRIMARY};${border}border-radius:${E_RADIUS_LG};text-align:${align};">${content}</div>`
}

/**
 * CTA button — brand-consistent, table-based for Outlook compatibility.
 * Uses --omn-cta orange by default, or E_CTA_URGENT for expiry emails.
 */
export function emailCtaButton(label: string, url: string, urgent = false): string {
  const bg = urgent ? E_CTA_URGENT : E_CTA
  const fg = urgent ? E_TEXT_PRIMARY : E_CTA_TEXT
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td style="background-color:${bg};border-radius:${E_RADIUS_SM};padding:${E_SPACE_4} ${E_SPACE_8};">
      <a href="${url}" style="display:inline-block;font-family:${E_FONT_UI};font-size:${E_TEXT_BASE};font-weight:500;color:${fg};text-decoration:none;letter-spacing:0.03em;white-space:nowrap;">${label}</a>
    </td>
  </tr>
</table>`
}

/**
 * Thin horizontal rule — matches the section divider pattern in editorial.css.
 */
export function emailRule(marginY = E_SPACE_8): string {
  return `<div style="height:1px;background:${E_BORDER_FAINT};margin:${marginY} 0;"></div>`
}
