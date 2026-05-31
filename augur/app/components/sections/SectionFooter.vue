<!--
  SectionFooter
  ─────────────
  Purpose: P-10 marketing-page footer. Brand area + multi-column
  link grid + bottom bar with copyright and meta text.
  Final molecule in the marketing-side suite (P-01 → P-10).

  Sandbox source: §10 footer block in redesign-home.vue
  (lines 542–576). Element: <footer class="footer">.

  Structure:
    <footer> root
      div.footer__inner (brand + cols, grid 1col→1.2fr 2fr @900px)
        div.footer__brand — wordmark + tagline + meta
          slot #brand (override entire brand area) OR
          default brand (brandName + tagline + brandMeta props)
        div.footer__cols — 3-col link grid (always repeat(3,1fr))
          FooterColumn × N via columns prop
            p.footer__h — column heading (mono caps, AppCaption)
            a × M — column links
      div.footer__bottom — copyright left, meta right
        slot #bottom-extra — replaces default bottom content
        OR: copyright + meta props rendered as default

  No trust strip in footer (confirmed — sandbox lines 542–576 have
  none). Trust strip count stays at 3 instances; AppTrustStrip
  extraction deferred past P-10.

  No useReveal — sandbox footer has no v-reveal; footer is a
  persistent landmark, not an entrance-animated section.

  Props:
    columns        FooterColumn[] — link columns (heading + links)
    brandName?     string — wordmark text; default 'OMENORA'
    tagline?       string — brand tagline below wordmark
    brandMeta?     string — brand meta line (e.g. "Est. 2026 · Vol. 001")
    copyright?     string — bottom bar left text (© line)
    meta?          string — bottom bar right text (e.g. "Built on Swiss Ephemeris")
    bandTone?      'page' | 'primary' — default 'page'

  FooterColumn type:
    interface FooterColumn {
      heading: string;
      links: { label: string; href: string }[];
    }

  Slots:
    #brand        — overrides entire brand area (wordmark + tag + meta)
    #newsletter   — optional newsletter form, inserted after brand
    #social       — optional social icons row, inside brand area
    #bottom-extra — overrides default bottom bar content entirely

  Semantic markup:
    <footer> root — HTML landmark.
    <nav> wrapper per column — aria-label equals column heading.
    <small> for copyright — semantic small text.

  Token map:
    Footer bg          → --omn-bg-page / --omn-bg-primary
    Border-top         → --omn-border-subtle
    Footer padding-top → clamp(80px, 10vw, 120px) — sandbox exact
    Inner padding-bot  → 56px — sandbox .footer__inner exact
    Inner border-bot   → --omn-border-subtle
    Inner gap mobile   → 56px — sandbox exact
    Inner gap desktop  → 96px — sandbox @900px exact
    Brand gap          → 16px — sandbox .footer__brand exact
    Tagline font-size  → 14px — sandbox .footer__tag exact
    Tagline color      → --omn-text-secondary
    Tagline max-width  → 32ch — sandbox exact
    brandMeta font     → --omn-font-mono, 11px, 0.18em, uppercase
    brandMeta color    → --omn-text-tertiary
    brandMeta margin-top → 8px — sandbox exact
    Cols grid          → repeat(3, 1fr), gap 32px — sandbox exact
    Col gap            → 12px — sandbox .footer__col exact
    Col heading        → --omn-font-mono, 11px, 0.18em, uppercase
                         --omn-text-tertiary, margin 0 0 4px
    Col link size      → 14px, --omn-text-secondary
    Col link hover     → --omn-accent, 200ms --omn-ease
    Bottom bar         → flex, justify-space-between, gap 24px,
                         wrap, padding 32px 20px
    Bottom font        → --omn-font-mono, 11px, 0.12em, uppercase
                         --omn-text-tertiary
    Bottom padding 768px → 32px sides — sandbox exact
    Bottom padding 1280px → 64px sides — sandbox exact
    Wordmark font      → --omn-font-display, weight 500, 0.34em
                         tracking, 12px — sandbox .wordmark--sm exact

  Hardcoded values justified:
    padding-top clamp(80px,10vw,120px) — sandbox .footer exact;
                structural large band padding; no --space-section
                equivalent at this scale
    padding-bottom 56px inner — sandbox .footer__inner exact;
                between --space-12 (48px) and --space-16 (64px);
                structural
    gap 56px mobile / 96px desktop — sandbox exact; structural
    gap 32px cols — sandbox .footer__cols exact; = --space-8 ✅
    gap 12px col items — sandbox .footer__col exact; = --space-3 ✅
    margin-bottom 4px col heading — sandbox exact; = --space-1 ✅
    tagline 14px — sandbox exact; between --text-xs (11px) and
                --text-md (16px); structural footnote size
    brandMeta/col-h 11px — sandbox exact; structural mono label
    tracking 0.18em (brand/col-h) — sandbox exact; no token
    tracking 0.12em (bottom) — sandbox exact; no token
    bottom padding 32px 20px — sandbox exact; structural
    wordmark 12px — sandbox .wordmark--sm exact; structural
    wordmark tracking 0.34em — sandbox .wordmark exact; no token
    brandMeta margin-top 8px — sandbox exact; = --space-2 ✅
    max-width 32ch tagline — sandbox exact; structural prose limit
    bottom padding-bottom calc(96px + env(safe-area-inset-bottom))
                — sandbox mobile footer padding for sticky CTA rail
    link transition 200ms — sandbox .footer__col a exact
-->

<script setup lang="ts">
import AppCaption from '~/components/atoms/AppCaption.vue'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

withDefaults(defineProps<{
  columns: FooterColumn[]
  brandName?: string
  tagline?: string
  brandMeta?: string
  copyright?: string
  meta?: string
  bandTone?: 'page' | 'primary'
}>(), {
  brandName: 'OMENORA',
  tagline: undefined,
  brandMeta: undefined,
  copyright: undefined,
  meta: undefined,
  bandTone: 'page',
})
</script>

<template>
  <footer :class="['section-footer', `section-footer--${bandTone}`]">

    <!-- ── Inner: brand + columns ── -->
    <div class="section-footer__inner">

      <!-- Brand area -->
      <div class="section-footer__brand">
        <slot name="brand">
          <!-- Default brand: logo mark + wordmark + optional tagline + optional meta -->
          <img
            src="/android-chrome-192x192.png"
            alt=""
            aria-hidden="true"
            class="section-footer__logo"
            width="32"
            height="32"
          />
          <p class="section-footer__wordmark">{{ brandName }}</p>
          <p v-if="tagline" class="section-footer__tag">{{ tagline }}</p>
          <p v-if="brandMeta" class="section-footer__brand-meta">{{ brandMeta }}</p>
        </slot>
        <!-- Optional newsletter / social after brand text -->
        <slot name="newsletter" />
        <slot name="social" />
      </div>

      <!-- Link columns -->
      <div class="section-footer__cols">
        <nav
          v-for="col in columns"
          :key="col.heading"
          class="section-footer__col"
          :aria-label="col.heading"
        >
          <AppCaption
            as="p"
            variant="mono"
            class="section-footer__col-h"
          >{{ col.heading }}</AppCaption>
          <a
            v-for="link in col.links"
            :key="link.label"
            :href="link.href"
            class="section-footer__link"
          >{{ link.label }}</a>
        </nav>
      </div>

    </div>

    <!-- ── Bottom bar ── -->
    <div class="section-footer__bottom">
      <slot name="bottom-extra">
        <small v-if="copyright" class="section-footer__copyright">
          {{ copyright }}
        </small>
        <p v-if="meta" class="section-footer__meta">{{ meta }}</p>
      </slot>
    </div>

  </footer>
</template>

<style scoped>
/* ── Footer root ──
   background: --omn-bg-page — sandbox .footer exact.
   border-top: 1px --omn-border-subtle — separates from page above.
   padding-top: clamp(80px, 10vw, 120px) — sandbox exact; large band
   padding; structural (no --space-section equivalent at this scale).
   padding-bottom: 0 — inner handles its own padding-bottom;
   bottom bar handles its own padding. */
.section-footer {
  border-top: 1px solid var(--omn-border-subtle);
  padding: clamp(80px, 10vw, 120px) 0 0;
  --omn-text-tertiary: #908A82;
}
.section-footer--page    { background: var(--omn-bg-page); }
.section-footer--primary { background: var(--omn-bg-primary); }


/* ── Inner: brand + cols grid ──
   grid-template-columns: 1fr mobile → 1.2fr 2fr @900px.
   gap 56px mobile / 96px desktop — sandbox .footer__inner exact.
   padding-bottom: 56px — sandbox exact; clears to border-bottom.
   border-bottom: separates inner from bottom bar. */
.section-footer__inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  padding: 0 clamp(20px, 5vw, 64px) 56px;
  border-bottom: 1px solid var(--omn-border-subtle);
  max-width: var(--width-section);
  margin: 0 auto;
}
@media (min-width: 900px) {
  .section-footer__inner {
    grid-template-columns: 1.2fr 2fr;
    gap: 96px;
  }
}


/* ── Brand area ──
   flex column, gap 16px — sandbox .footer__brand exact. */
.section-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Logo mark: 32×32 icon above the wordmark. object-fit: contain preserves
   aspect ratio. opacity 0.72 sits within the tertiary register — present
   without competing with the wordmark text below it. */
.section-footer__logo {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
  opacity: 0.72;
}

/* Wordmark: display font, weight 500, 0.34em tracking, 12px.
   sandbox .wordmark--sm exact. tracking 0.34em — no token. */
.section-footer__wordmark {
  font-family: var(--omn-font-display);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.34em;
  color: var(--omn-text-primary);
  text-transform: uppercase;
  margin: 0;
}

/* Tagline: 14px --omn-text-secondary, max-width 32ch — sandbox exact.
   14px is between --text-xs (11px) and --text-md (16px); structural. */
.section-footer__tag {
  font-size: 14px;
  color: var(--omn-text-secondary);
  max-width: 32ch;
  line-height: 1.5;
  margin: 0;
}

/* Brand meta: mono 11px 0.18em uppercase tertiary — sandbox .footer__meta exact.
   margin-top: 8px = --space-2 ✅ (adds extra separation from tagline). */
.section-footer__brand-meta {
  font-family: var(--omn-font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  margin: 8px 0 0;
}


/* ── Columns grid ──
   repeat(3, 1fr) — sandbox .footer__cols exact (always 3 cols).
   gap: 32px = --space-8 ✅. */
.section-footer__cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}


/* ── Individual column ──
   flex column, gap 12px = --space-3 ✅ — sandbox .footer__col exact. */
.section-footer__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Column heading: AppCaption mono variant provides font/tracking/case.
   Additional layout: margin-bottom 4px = --space-1 ✅ bottom gap boost.
   color override not needed — AppCaption mono defaults to --omn-text-tertiary. */
.section-footer__col-h {
  margin: 0 0 4px !important;
}

/* Column links: 14px --omn-text-secondary; hover → --omn-accent 200ms.
   14px structural footer link size — same justification as tagline. */
.section-footer__link {
  font-size: 14px;
  color: var(--omn-text-secondary);
  text-decoration: none;
  transition: color 200ms var(--omn-ease);
  line-height: 1.4;
}
.section-footer__link:hover {
  color: var(--omn-accent);
}


/* ── Bottom bar ──
   flex justify-space-between, gap 24px, wrap — sandbox exact.
   padding: 32px 20px — sandbox .footer__bottom exact; structural.
   font: mono 11px 0.12em uppercase tertiary — sandbox exact.
   0.12em tracking — sandbox exact; no token. */
.section-footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: 32px 20px;
  font-family: var(--omn-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  max-width: var(--width-section);
  margin: 0 auto;
}
.section-footer__copyright,
.section-footer__meta {
  margin: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
}

/* Bottom bar padding per breakpoint — sandbox exact.
   32px @768px and 64px @1280px — structural gutter alignment. */
@media (min-width: 768px) {
  .section-footer__bottom {
    padding-left: 32px;
    padding-right: 32px;
  }
}
@media (min-width: 1280px) {
  .section-footer__bottom {
    padding-left: 64px;
    padding-right: 64px;
  }
}


/* ── Mobile ──
   padding-bottom: calc(96px + safe-area-inset-bottom) — sandbox
   mobile footer override; makes room for the sticky mobile CTA
   rail so it doesn't cover footer content. Structural. */
@media (max-width: 767px) {
  .section-footer {
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }
}


/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-footer__link {
    transition: none;
  }
}
</style>
