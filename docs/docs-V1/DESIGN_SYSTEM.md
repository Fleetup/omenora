# OMENORA — Design System

> Catalog of the visual operating system: atoms, sections, composables, tokens, and utilities.
> Single source of truth for what is built, what is canonical, what is deprecated.
> When this document and code conflict, code must be brought into alignment with this document.
> Strategic decisions trace back to STRATEGY.md. Product decisions trace back to PRODUCT_MAP.md. This document is the visual instantiation of both.

---

## Status legend

- **CANONICAL** — Built and in use. The correct primitive for new work.
- **LEGACY** — Built and in use, but pending migration to the canonical equivalent.
- **DEPRECATED** — Exists in codebase but should not be used in new work. Candidate for removal in DEPRECATED.md.

---

## 1. Atoms

Location: `app/components/atoms/`

12 atoms. All consume `--omn-*` canonical tokens. All are CANONICAL.

| Atom | Lines | Purpose | Status |
|---|---|---|---|
| `AppBody` | 137 | Standard body paragraph. Variants: default / lede / italic. Optional drop-cap, balance, color override. | CANONICAL |
| `AppButton` | 344 | Universal interactive element. Variants: primary / secondary / ghost. Sizes: sm / md / lg. Renders as `<button>`, `<NuxtLink>`, or `<a>` based on `to`/`href`. Replaces legacy `CTAButton`. | CANONICAL |
| `AppCaption` | 103 | Small metadata/annotation text. Variants: default / fine / mono. Used for section markers, trust strip labels, card footnotes. | CANONICAL |
| `AppCard` | 433 | Editorial content card with numeral watermark, tag, hoverable state, multiple content zones. Used inside `SectionThreeCardGrid`. | CANONICAL |
| `AppDivider` | 136 | Horizontal visual separator. Variants: rule / labeled. Spacing: sm / md / lg. | CANONICAL |
| `AppEyebrow` | 117 | Small mono-uppercase section label. Used at top of sections to orient the reader. Variants: default / quiet. Optional bracketed style. | CANONICAL |
| `AppHeadline` | 137 | Display headlines at section/page level. Sizes: xl / lg / md / sm / italic. | CANONICAL |
| `AppImage` | 152 | Wrapper around `<NuxtImg>` with editorial defaults: ratio enforcement, rounded corners, caption support. | CANONICAL |
| `AppPullQuote` | 128 | Inline editorial pull-quote. Italic display type, optional cite attribution. Variants: default / large. | CANONICAL |
| `AppStat` | 153 | Single stat unit. Large numeric display with label and optional unit suffix. Used by `SectionSocialProof` counters. | CANONICAL |
| `AppSubhead` | 100 | Bridge text between `AppHeadline` and `AppBody`. Variants: default / italic. | CANONICAL |
| `AppTestimonialCard` | 306 | Multi-element testimonial card. Variants: hero / secondary. Wired to `useReveal` for staggered entrance. | CANONICAL |

### How to use atoms

Atoms are the smallest design system primitive. Reach for an atom when no existing section molecule fits your use case. Most page-level work composes sections (Part 2), not atoms directly. The homepage uses only one atom directly (`AppButton`); everything else is mediated through section molecules.

For full prop signatures, slots, and emits, see component source. All atom props are explicitly typed.

---

## 2. Sections (Molecules)

Location: `app/components/sections/`

10 section molecules, labeled P-01 through P-10. All consume `--omn-*` canonical tokens. All are CANONICAL.

| Section | P-# | Lines | Purpose | Status |
|---|---|---|---|---|
| `SectionHero` | P-01 | 493 | Full-bleed hero band. Diagonal background image, animated multi-line headline, CTA row, trust strip. | CANONICAL |
| `SectionLede` | P-02 | 347 | Introduce a section: eyebrow + headline + lede paragraph. Optional drop cap and section marker. | CANONICAL |
| `SectionThreeCardGrid` | P-03 | 421 | Section header + 3-column card grid. Card content via `cards` prop array. | CANONICAL |
| `SectionCenteredStatement` | P-04 | 365 | Centered editorial moment. Eyebrow + headline + optional body + optional actions, center-aligned. | CANONICAL |
| `SectionSideBySide` | P-05 | 494 | Text-paired columns. Two parallel content columns with asymmetric desktop grid. | CANONICAL |
| `SectionPaywallCard` | P-06 | 426 | Paywall conversion card. Labeled item rows, price display, primary CTA, trust strip, fine print. | CANONICAL |
| `SectionSocialProof` | P-07 | 489 | Section header + asymmetric testimonial grid (hero + secondary) + animated counter stats. | CANONICAL |
| `SectionFAQ` | P-08 | 451 | Section header + native `<details>/<summary>` accordion. Zero JS — browser handles state. | CANONICAL |
| `SectionFinalCTA` | P-09 | 553 | Closing conversion section. Centered layout, diagonal background, bracketed eyebrow, large headline, CTA, trust strip. | CANONICAL |
| `SectionFooter` | P-10 | 382 | Marketing-page footer. Brand area + 3-column link grid + bottom copyright bar. | CANONICAL |

### How to use sections

Sections are the unit of page composition. A page is a sequence of sections. To compose a new page:

1. Identify the rhetorical role of each block on the page (introduce / declare / list / sell / prove / answer / close).
2. Map each block to the corresponding section molecule (lede / centered / three-card / paywall / social-proof / faq / final-cta).
3. Pass content via props. Do not modify section internals.

### Section design rules

These rules apply to all sections uniformly. They are part of the design system, not per-section quirks.

- **Section markers.** All content sections accept a `marker` prop (e.g. `"§ 02"`). When set, the `.is-marked` utility class renders a bronze hairline `::before` that animates `scaleX(0→1)` on reveal.
- **Background images via diagonal band.** Sections that accept imagery use the `diag-band` utility (see Part 5). Image position is controlled via `bgImage`, `bgImagePos`, and `bgImagePosMobile` props that inject CSS custom properties (`--section-img`, `--section-img-pos`, `--section-img-pos-mobile`).
- **Exception — `SectionFinalCTA` uses its own background layer**, not the shared `diag-band` utility, because the parallax scale (1.06→1) and overlay treatment differ from the standard band.
- **Reveal animation.** All sections use `useReveal` for IntersectionObserver-triggered stagger entrance. Threshold defaults to `0.05`; `SectionSocialProof` uses `0.1`; `SectionPaywallCard` uses `0.15`.
- **Band tone.** All sections accept `bandTone: 'page' | 'primary'`. Default is `'page'`. `'primary'` shifts the background to `--omn-bg-primary` for elevated-tone bands.

---

## 3. Composables

Location: `app/composables/`

6 composables. All but `useScrollSequence` are tracked.

| Composable | Lines | Purpose | Status |
|---|---|---|---|
| `useReveal` | 91 | Shared IntersectionObserver reveal. Returns `{ el, isRevealed }`. SSR-safe. Reduced-motion bypasses observer (immediate reveal). | CANONICAL |
| `useCounterAnimation` | 172 | rAF-driven counter rollup (0 → target) with easeOutCubic. Trigger-driven (pairs with `useReveal.isRevealed`). Reduced-motion: skips animation. | CANONICAL |
| `useAuth` | 184 | Supabase Auth wrapper. Post-payment user provisioning, magic-link OTP, session restore, protected API calls, sign-out. | CANONICAL |
| `useLanguage` | 16 | UI string translation. Reads from `useAnalysisStore.language`, looks up `UI_STRINGS[lang][key]` with `'en'` fallback. | CANONICAL |
| `useClarity` | 37 | Microsoft Clarity analytics wrapper. Guards behind `'clarity' in window`. | CANONICAL |
| `useScrollSequence` | 209 | Scroll-linked canvas frame sequence player. Preloads JPEG frames with priority queue, draws nearest-loaded on scroll. Reduced-motion: static first frame. **Currently untracked** — pending commit. | CANONICAL (untracked) |

### How to use composables

- `useReveal` is the entrance animation primitive. Every section uses it. If you build a new section, wire `useReveal` for consistent staggered reveal behavior.
- `useCounterAnimation` is paired with `useReveal.isRevealed` as the trigger. Use only when displaying numeric stats that animate from 0.
- `useAuth` is the only authorized client-side auth interface. Do not call Supabase Auth directly elsewhere.
- `useLanguage` is the only authorized translation interface. Do not import `UI_STRINGS` directly.

---

## 4. Design Tokens

Location: `app/assets/css/editorial.css`

Single CSS source of truth. 629 lines. Token namespace is split into canonical `--omn-*` and a legacy alias layer pending removal.

### 4.1 Canonical tokens (`--omn-*`)

All new work consumes these tokens exclusively. All atoms and sections consume these.

**Surfaces:**

| Token | Value |
|---|---|
| `--omn-bg-page` | `#121214` |
| `--omn-bg-primary` | `#252528` |
| `--omn-bg-elevated` | `#2F2F33` |
| `--omn-bg-interactive` | `#3A3A3F` |

**Borders:**

| Token | Value |
|---|---|
| `--omn-border-subtle` | `#2F2F33` |
| `--omn-border-primary` | `#3A3A3F` |
| `--omn-border-emphasis` | `#4A4A50` |

**Text:**

| Token | Value |
|---|---|
| `--omn-text-primary` | `#F2EDE5` |
| `--omn-text-secondary` | `#A8A19A` |
| `--omn-text-tertiary` | `#6B655E` |

**Accent (Bronze):**

| Token | Value |
|---|---|
| `--omn-accent` | `#A87D4E` |
| `--omn-accent-quiet` | `#6E5536` |
| `--omn-accent-a05` | `rgba(168,125,78,0.05)` |
| `--omn-accent-a06` | `rgba(168,125,78,0.06)` |
| `--omn-accent-a08` | `rgba(168,125,78,0.08)` |
| `--omn-accent-a10` | `rgba(168,125,78,0.10)` |
| `--omn-accent-a18` | `rgba(168,125,78,0.18)` |

**CTA (Orange):**

| Token | Value |
|---|---|
| `--omn-cta` | `#E8763A` |
| `--omn-cta-hover` | `#FF8856` |
| `--omn-cta-text` | `#121214` |

**Functional:**

| Token | Value |
|---|---|
| `--omn-success` | `#7B9472` (sage green) |
| `--omn-error` | `#D14B3D` |

**Fonts:**

| Token | Value |
|---|---|
| `--omn-font-display` | `'Onest', system-ui, …, sans-serif` |
| `--omn-font-body` | `'Onest', system-ui, …, sans-serif` |
| `--omn-font-mono` | `'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace` |

**Motion:**

| Token | Value |
|---|---|
| `--omn-ease` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--omn-duration-fast` | `150ms` |
| `--omn-duration-base` | `300ms` |
| `--omn-duration-slow` | `600ms` |
| `--omn-duration-micro` | `200ms` |
| `--omn-duration-card` | `250ms` |
| `--omn-duration-reveal` | `400ms` |
| `--omn-duration-draw` | `700ms` |

**Stagger ladder:**

| Token | Value |
|---|---|
| `--omn-stagger-1` | `40ms` |
| `--omn-stagger-2` | `80ms` |
| `--omn-stagger-3` | `120ms` |
| `--omn-stagger-4` | `160ms` |
| `--omn-stagger-5` | `240ms` |

### 4.2 Type scale

Fixed scale: `--text-xs` (11px) → `--text-7xl` (96px). Twelve steps total (xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl).

Per-step line heights: `--leading-xs` (1.4) → `--leading-7xl` (0.96).

### 4.3 Letter spacing

| Token | Value | Usage |
|---|---|---|
| `--tracking-tight` | `-0.035em` | Display headlines |
| `--tracking-snug` | `-0.025em` | Large headings |
| `--tracking-normal` | `-0.012em` | Mid-size headings |
| `--tracking-body` | `-0.005em` | Body text |
| `--tracking-wide` | `0.02em` | Wide-spaced text |
| `--tracking-mono` | `0.02em` | Mono body text |
| `--tracking-caps` | `0.18em` | Uppercase mono labels |
| `--tracking-wordmark` | `0.34em` | Wordmark / brand name |
| `--tracking-prose` | `0.04em` | Subhead, KV labels, wide-mono eyebrows |
| `--tracking-label` | `0.14em` | Paywall keys, counter labels, section labels |
| `--tracking-mid` | `0.12em` | Quote ctx, KV list spans, FAQ eyebrows |

### 4.4 Font weights

| Token | Value |
|---|---|
| `--weight-light` | 300 |
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |

### 4.5 Spacing

**Fixed scale** (4px base unit): `--space-0` (0) → `--space-40` (160px). Fourteen steps.

**Fluid scale:**

| Token | Value | Usage |
|---|---|---|
| `--space-section` | `clamp(96px, 12vw, 192px)` | Between major bands |
| `--space-block` | `clamp(56px, 7vw, 96px)` | Between content blocks within a section |
| `--space-content` | `clamp(32px, 4vw, 56px)` | Between paragraphs / atoms |
| `--space-gap` | `clamp(20px, 2.4vw, 32px)` | Grid gutters / card gaps |
| `--space-edge` | `clamp(20px, 5vw, 64px)` | Container outer padding |

### 4.6 Container widths

| Token | Value | Usage |
|---|---|---|
| `--width-prose` | `640px` | Long-form reading |
| `--width-content` | `880px` | Headlines, hero copy, paywall |
| `--width-section` | `1192px` | Standard 12-col sections |
| `--width-bleed` | `1320px` | Hero, full-width imagery |
| `--width-edge` | `100vw` | Page-bleed sections |

---

## 5. Utility Classes

Location: `app/assets/css/editorial.css` (lines 246–629)

### Canonical utilities

| Class | Purpose |
|---|---|
| `.font-display` | Display typography utility — 5xl, light, tight tracking, primary color |
| `.font-display-italic` | Italic display typography |
| `.font-sans` | Sans body typography |
| `.label-caps` | Mono uppercase caps label. Used extensively in `AppHeader`. |
| `.pull-quote` | Pull-quote typography |
| `.annotation` | Small annotation/footnote typography. Used in `AppShell`. |
| `.editorial-rule` | Full-width 1px horizontal rule. Used in `AppHeader` (running rule). |
| `.symbol-editorial` | Opacity 0.85 modifier for SVG symbols |
| `.symbol-editorial-gold` | Full-opacity gold symbol modifier |
| `.page-wrapper` | Wide-screen centering wrapper — max 1400px, fluid horizontal padding |
| `.page-col` | Wide editorial content column — max 860px |
| `.section-inner` | Section max-width + centering — max 1400px |
| `.is-marked` | Bronze hairline `::before` for section markers. Animates `scaleX(0→1)` on `.is-revealed`. Applied to section roots when `marker` prop is set. |
| `.diag-band` | Diagonal-background band system (see Part 5.1) |
| `.diag-band--primary` | Modifier: swaps overlay gradients to `--omn-bg-primary` stops |
| `.diag-band__image` | Required child of `.diag-band`. Holds the background image, scales 1.02→1 on reveal. |
| `.diag-band__overlay` | Required child of `.diag-band`. Gradient vignette + bronze seam. |
| `.diag-band__content` | Marks the content container. Positions above z-index 2 (bronze seam layer). |

### 5.1 The diagonal band system

The `diag-band` utility is the canonical way to render section backgrounds with imagery. Used by every section that accepts a `bgImage` prop except `SectionFinalCTA` (which has its own background layer).

**How it works:**

1. Section root gets class `.diag-band` (and `.diag-band--primary` for elevated tone).
2. Two child divs are required: `.diag-band__image` (the photo) and `.diag-band__overlay` (the gradient mask + bronze seam glow).
3. Inline style sets three custom properties: `--section-img`, `--section-img-pos`, `--section-img-pos-mobile`.
4. The content container gets class `.diag-band__content` to position it above the seam layer.

**Mobile behavior:** Softer diagonal mask, heavier overlay. Separate position custom property prevents mobile imagery from cropping incorrectly.

**Bronze seam:** A `::after` element renders a diagonal bronze glow with `mix-blend-mode: screen`.

---

## 6. Layouts and Global Shell

There is no `app/layouts/` directory. Nuxt 3 auto-wraps pages with no default layout. The de facto layout wrapper is `AppShell`, which composes `AppHeader` + `<main>` + inline footer.

| Component | File | Lines | Purpose | Status |
|---|---|---|---|---|
| `AppHeader` | `app/components/AppHeader.vue` | ~530 | Sticky site header — sandbox §01 visual pattern. Translucent dark bg + backdrop blur, 3-column grid (wordmark / primary nav / CTA + burger). Right drawer (teleported to `body` to escape the sticky+backdrop-filter stacking context) for full nav, language switcher, account link. | CANONICAL |
| `AppShell` | `app/components/AppShell.vue` | 104 | Page-level layout shell: `AppHeader` + `<main>` slot + inline footer with copyright/nav links. Used by inner (non-marketing) pages. | **LEGACY tokens** — pending migration |

### Token migration status

`AppHeader` was migrated to canonical `--omn-*` tokens in the sandbox-alignment pass. It now matches the redesigned visual pattern (translucent dark band, 0.34em wordmark, editorial typography, bronze focus indicators) and is the canonical site header.

`AppShell` still consumes legacy tokens (`--surface-base`, `--text-primary`, `--border-subtle`, `--font-sans`, etc.). It works today via the SD6 alias layer (Part 7.2) but must be migrated to `--omn-*` tokens before the alias layer can be removed.

The homepage (`app/pages/index.vue`) does not use `AppShell` but mounts `<AppHeader />` directly. It composes its own footer from `SectionFooter`. The compatibility quiz page (`app/pages/compatibility-quiz.vue`) follows the same pattern: `<AppHeader />` mounted directly, no `AppShell` wrapper.

---

## 7. Deprecated and Legacy

Items in this section should not be used in new work. They are tracked here as the authoritative deprecation list.

### 7.1 Deprecated components

| Component | Path | Reason | Replacement |
|---|---|---|---|
| `CTAButton.vue` | `app/components/` | Three legacy variants (solid / outline / cta) using legacy tokens. Superseded by `AppButton` which covers all use cases with canonical tokens. | `AppButton` |
| `EditorialRule.vue` | `app/components/` | Horizontal rule with optional center ornament. Single-purpose component. | `AppDivider` (`variant="labeled"` for ornamented variant) |

### 7.2 Legacy token namespace (alias layer)

Located at `editorial.css` lines 168–210. These tokens are aliases mapping legacy names to canonical `--omn-*` equivalents. They exist solely to keep pre-redesign components rendering correctly until they migrate.

**Pending removal in cleanup pass.** Tracked in DEPRECATED.md.

| Legacy alias | Maps to canonical |
|---|---|
| `--surface-base` | `--omn-bg-page` |
| `--surface-raised` | `--omn-bg-primary` |
| `--surface-elevated` | `--omn-bg-elevated` |
| `--text-primary` | `--omn-text-primary` |
| `--text-secondary` | `--omn-text-secondary` |
| `--text-tertiary` | `--omn-text-tertiary` |
| `--accent-gold` | `--omn-accent` |
| `--font-sans` | `--omn-font-body` |
| `--text-display` | `--text-7xl` |
| `--color-ink` | `--omn-text-primary` |
| `--color-ink-mid` | `--omn-text-secondary` |
| `--color-ink-faint` | `--omn-text-tertiary` |
| `--color-ink-ghost` | `--omn-border-subtle` |
| `--color-gold` | `--omn-accent` |
| `--color-gold-dim` | `--omn-accent-quiet` |
| `--color-gold-glow` | `--omn-accent-a18` |
| `--accent-dim` | `--omn-accent-quiet` |
| `--cta-primary` | `--omn-cta` |
| `--cta-hover` | `--omn-cta-hover` |
| `--border-faint` | `rgba(250,250,250,0.06)` |
| `--border-subtle` | `rgba(250,250,250,0.10)` |
| `--border-default` | `rgba(250,250,250,0.15)` |
| `--border-strong` | `rgba(250,250,250,0.25)` |
| `--duration-fast` | `150ms` |
| `--duration-base` | `300ms` |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` |
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-full` | `9999px` |
| `--radius-circle` | `50%` |

### 7.3 Vestigial tokens

Located at `editorial.css` lines 239–242. These are not aliases — they are unused token definitions left over from prior design exploration. Do not add new references.

| Token | Value | Disposition |
|---|---|---|
| `--text-hero-headline` | `clamp(34px, 9vw, 52px)` | Remove |
| `--text-subhead` | `clamp(19px, 4.5vw, 24px)` | Remove |
| `--text-pricing-meta` | `12px` | Remove |
| `--ease-out-expo` | alias of `--omn-ease` | Remove |

### 7.4 Components consuming legacy tokens

The following components consume the SD6 alias layer and must be migrated to canonical `--omn-*` tokens before the alias layer can be removed:

- `AppShell.vue`
- `CTAButton.vue` (deprecated entirely — to be removed, not migrated)
- `BackButton.vue`
- `EditorialRule.vue` (deprecated entirely — to be removed, not migrated)
- `PlacesAutocomplete.vue`

**Migrated to canonical** (no longer consume legacy tokens):
- `AppHeader.vue` — migrated in sandbox-alignment pass
- Quiz components in `app/components/quiz/` (all 7: QuizProgressBar, QuizSingleSelect, QuizTextInput, QuizDateInput, QuizTimeInput, QuizCityInput, QuizRewardScreen)
- `compatibility-quiz.vue` page shell

---

## 8. Composition Rules

### 8.1 Page composition

A marketing page is a sequence of section molecules. The homepage composes 10 sections in this order: Hero → SideBySide → Lede → ThreeCardGrid → CenteredStatement → PaywallCard → SocialProof → FAQ → FinalCTA → Footer.

### 8.2 Section rules

- Every section accepts content via props. Do not modify section internals to fit content.
- Every section that accepts imagery does so via `bgImage`, `bgImagePos`, `bgImagePosMobile` props.
- Every section that accepts a section marker does so via the `marker` prop, which wires the `.is-marked` utility.
- Every section uses `useReveal` for entrance animation.

### 8.3 Atom rules

- Atoms are the smallest design system primitive. Most page-level work composes sections, not atoms directly.
- `AppButton` is the universal interactive element. Do not introduce new button components.
- Custom typography compositions should reach for `AppHeadline`, `AppSubhead`, `AppBody`, `AppCaption`, `AppEyebrow`, or `AppPullQuote` rather than direct CSS.

### 8.4 Token rules

- New work consumes `--omn-*` tokens exclusively.
- Legacy aliases (SD6) are not for new consumption. They exist solely to support pre-redesign components during migration.
- The fluid spacing scale (`--space-section`, `--space-block`, `--space-content`, `--space-gap`, `--space-edge`) is the canonical way to handle responsive spacing. Do not introduce new `clamp()` patterns.
- The fixed type scale (`--text-xs` through `--text-7xl`) is the canonical type scale. Do not introduce new font sizes.

---

## 9. Open items

These are tracked here as the open work needed to complete the design system:

- **AppShell token migration.** Component still consumes the legacy alias layer. Required before SD6 aliases can be removed. (AppHeader migration: ✅ complete.)
- **Legacy token alias removal.** Pending migration of remaining components in section 7.4 (AppShell, BackButton, PlacesAutocomplete).
- **`compatibility.vue` migration.** 1890-line results page still consumes legacy tokens and has custom typography that should compose `AppHeadline`/`AppSubhead`/`AppBody`. Separate effort.
- **Vestigial token cleanup.** Tokens in section 7.3 to be removed from `editorial.css`.
- **`CTAButton.vue` removal.** All call sites to be migrated to `AppButton`, then file deleted.
- **`EditorialRule.vue` removal.** All call sites to be migrated to `AppDivider variant="labeled"`, then file deleted.
- **`useScrollSequence.ts` commit.** Composable is untracked. Decide whether to commit or remove.
- **Hero image library curation.** Multiple untracked candidate images in `public/images/hero/`. Decision needed on which images ship as part of the design system.

---

*This document is the master design system reference. It does not change without an explicit design decision.*