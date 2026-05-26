<!--
  AppCard — editorial content card (11th atom)
  ─────────────────
  Purpose: Editorial content card pattern. Used in P-03 three-card
  grid. Reusable in P-06 and P-07 contexts via props/slots.

  Architecture: LEAF atom — no internal atom composition. Styles
  content directly with canonical --omn-* tokens, following the
  same pattern as AppButton and AppHeadline. All variants are
  implemented via CSS classes on the root <article>.

  §8 compliance: zero shadows, border-radius: 0, hover via
  background + border-color + translateY (compositor-safe) only.

  Props:
    numeral?    string — bronze mono-cap numeral at top of card
                (e.g., "01"). Also drives watermark ::before.
    label?      string — mono uppercase tertiary label row
                (e.g., "Western · Tropical")
    heading?    string — card title (h3 by default)
    body?       string — card paragraph body text. Overridden
                if #default slot is provided.
    foot?       string — mono uppercase tertiary footer left text
                (e.g., "5 pages · 1,600 words")
    tag?        string — sage-colored inline tag in footer right
                (e.g., "Computed"). Renders with live-indicator dot.
    watermark?  string — large faded numeral ::before decoration.
                Typically mirrors numeral. Omit to suppress.
    sample?     string — hover-reveal inline CTA link text.
                Renders as <a> with href from sampleHref.
    sampleHref? string — href for the sample link (default "#").
    hoverable?  boolean — applies hover lift/border transition.
                Default true. Set false for static display contexts.
    variant?    'default' | 'elevated' — default for standard card;
                'elevated' reserved for future testimonial variant
                (exposed in type union, no additional styles yet).

  Slots:
    #default    — overrides body string with rich content
                  (allows nested markup, inline links, etc.)
    #actions    — row below foot for CTA buttons or extra links

  Usage:
    <AppCard
      numeral="01"
      label="Western · Tropical"
      heading="Natal Chart"
      body="Your planets, signs, and houses…"
      foot="5 pages · 1,600 words"
      tag="Computed"
      watermark="01"
      sample="Read a sample excerpt →"
      sample-href="#paywall"
    />

    With rich body:
    <AppCard numeral="02" heading="The Method">
      <p>Custom <strong>rich</strong> content here.</p>
    </AppCard>

  Token map (sandbox CSS → --omn-* tokens):
    Background (default)          → --omn-bg-elevated
    Background (hover)            → --omn-bg-interactive
    Border (default)              → 1px solid --omn-border-primary
    Border (hover)                → --omn-border-emphasis
    Border (foot)                 → 1px solid --omn-border-subtle
    Transition duration + ease    → --omn-duration-card, --omn-ease
    Numeral color                 → --omn-accent
    Numeral font                  → --omn-font-mono
    Label font + color            → --omn-font-mono, --omn-text-tertiary
    Heading font                  → --omn-font-display
    Heading color                 → --omn-text-primary
    Body color                    → --omn-text-secondary
    Foot font + color             → --omn-font-mono, --omn-text-tertiary
    Tag color + dot               → --omn-success
    Sample color                  → --omn-accent
    Sample border                 → --omn-accent-quiet
    Sample hover color            → --omn-cta-hover
    Watermark color               → --omn-accent
    Watermark font                → --omn-font-display

  Hardcoded values justified:
    padding: 40px 32px 32px     — card-specific chrome; no token (structural)
    gap: 12px                   — flex gap between content rows; structural
    1px borders                 — structural hairlines
    translateY(-2px / -4px)     — hover lift; structural animation offset
    6px dot                     — tag live indicator; structural (SD5)
    font-weight: 200            — watermark ultralight; bespoke optical (SD3)
    font-size: 200px            — watermark decoration; structural (SD3)
    font-size: 24px             — card title; sandbox single-use value (SD7)
    font-size: 15px             — card body; sandbox single-use value
    font-size: 13px             — sample link; sandbox single-use value
    font-size: 11px             — numeral / label / foot; matches --text-2xs
    top: -32px / right: -8px   — watermark position offsets; structural (SD3)
    margin-top: 12px            — heading top margin; structural
    padding-top: 16px           — foot separator; structural
    gap: 8px                    — tag dot-to-text gap; structural
    padding-bottom: 2px         — sample underline gap; structural
    margin-top: 8px             — sample top margin; structural
    opacity: 0.07 / 0.12        — watermark visibility; structural (SD3)
    translateY(-4px / 6px)      — watermark and sample hover offsets; structural
    140px font-size (mobile)    — watermark mobile shrink; structural
    top: -16px / right: -6px    — watermark mobile offsets; structural
-->

<script setup lang="ts">
withDefaults(defineProps<{
  numeral?: string
  label?: string
  heading?: string
  body?: string
  foot?: string
  tag?: string
  watermark?: string
  sample?: string
  sampleHref?: string
  hoverable?: boolean
  variant?: 'default' | 'elevated'
}>(), {
  numeral: undefined,
  label: undefined,
  heading: undefined,
  body: undefined,
  foot: undefined,
  tag: undefined,
  watermark: undefined,
  sample: undefined,
  sampleHref: '#',
  hoverable: true,
  variant: 'default',
})
</script>

<template>
  <article
    class="app-card"
    :class="[
      `app-card--${variant}`,
      { 'app-card--hoverable': hoverable },
    ]"
  >
    <!-- Watermark numeral: massive faded decoration behind content -->
    <span
      v-if="watermark"
      class="app-card__watermark"
      aria-hidden="true"
    >{{ watermark }}</span>

    <!-- Numeral row: bronze mono numeral (e.g., "01") -->
    <p v-if="numeral" class="app-card__num">{{ numeral }}</p>

    <!-- Label row: mono uppercase tertiary (e.g., "Western · Tropical") -->
    <p v-if="label" class="app-card__label">{{ label }}</p>

    <!-- Heading -->
    <h3 v-if="heading" class="app-card__title">{{ heading }}</h3>

    <!-- Body: slot overrides prop -->
    <div v-if="$slots.default" class="app-card__body">
      <slot />
    </div>
    <p v-else-if="body" class="app-card__body">{{ body }}</p>

    <!-- Sample hover-reveal link -->
    <a
      v-if="sample"
      :href="sampleHref"
      class="app-card__sample"
    >{{ sample }}</a>

    <!-- Footer: meta text + optional sage tag -->
    <div v-if="foot || tag" class="app-card__foot">
      <span v-if="foot" class="app-card__meta">{{ foot }}</span>
      <span v-if="tag" class="app-card__tag">
        <span class="app-card__tag-dot" aria-hidden="true" />{{ tag }}
      </span>
    </div>

    <!-- Actions slot: CTA row below foot -->
    <div v-if="$slots.actions" class="app-card__actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<style scoped>
/* ── Card root ──
   Base surface: --omn-bg-elevated, 1px solid border, flex column.
   Overflow hidden contains the watermark pseudo that extends outside.
   gap: 12px — structural inter-row spacing inside the card.
   padding: 40px 32px 32px — sandbox exact value, structural chrome. */
.app-card {
  position: relative;
  padding: 40px 32px 32px;
  background: var(--omn-bg-elevated);
  border: 1px solid var(--omn-border-primary);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  transition:
    transform var(--omn-duration-card) var(--omn-ease),
    border-color var(--omn-duration-card) var(--omn-ease),
    background var(--omn-duration-card) var(--omn-ease);
}

/* ── Hover lift ──
   translateY(-2px): compositor-safe lift; structural animation offset.
   background + border-color both transition (no shadow). */
.app-card--hoverable:hover {
  transform: translateY(-2px);
  border-color: var(--omn-border-emphasis);
  background: var(--omn-bg-interactive);
}

/* ── Watermark numeral ──
   Absolutely positioned behind content. 200px font — massive decoration.
   font-weight: 200 — bespoke ultralight optical value (SD3).
   opacity: 0.07 default; 0.12 on hover. Both structural transparency values.
   top: -32px, right: -8px — structural overflow offsets.
   letter-spacing: -0.06em — sandbox exact optical value for large numeral. */
.app-card__watermark {
  position: absolute;
  top: -32px;
  right: -8px;
  font-family: var(--omn-font-display);
  font-weight: 200;
  font-size: 200px;
  line-height: 1;
  letter-spacing: -0.06em;
  color: var(--omn-accent);
  opacity: 0.07;
  pointer-events: none;
  user-select: none;
  transition:
    opacity 350ms var(--omn-ease),
    transform 350ms var(--omn-ease);
  will-change: opacity, transform;
  z-index: 0;
}
.app-card--hoverable:hover .app-card__watermark {
  opacity: 0.12;
  transform: translateY(-4px);
}

/* ── Sample hover-reveal link ──
   Appears on hover (or always on touch). accent color, thin underline.
   opacity: 0 → 1 + translateY(6px → 0) on hover.
   font-size: 13px, font-weight: 500 — sandbox values, structural.
   padding-bottom: 2px, margin-top: 8px — structural spacing. */
.app-card__sample {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-medium);
  font-size: 13px;
  color: var(--omn-accent);
  letter-spacing: var(--tracking-normal);
  border-bottom: 1px solid var(--omn-accent-quiet);
  padding-bottom: 2px;
  align-self: flex-start;
  margin-top: 8px;
  text-decoration: none;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 300ms var(--omn-ease),
    transform 300ms var(--omn-ease),
    color 200ms var(--omn-ease),
    border-color 200ms var(--omn-ease);
  position: relative;
  z-index: 2;
}
.app-card--hoverable:hover .app-card__sample,
.app-card:focus-within .app-card__sample {
  opacity: 1;
  transform: translateY(0);
}
.app-card__sample:hover {
  color: var(--omn-cta-hover);
  border-color: var(--omn-cta-hover);
}

/* Always visible on touch devices (no hover surface) */
@media (hover: none) {
  .app-card__sample {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Numeral ──
   Bronze mono at --text-2xs (11px) with wide tracking.
   z-index: 2 ensures it sits above watermark layer. */
.app-card__num {
  font-family: var(--omn-font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.18em;
  color: var(--omn-accent);
  margin: 0;
  position: relative;
  z-index: 2;
}

/* ── Label ──
   Mono uppercase tertiary. 11px = --text-2xs; 0.18em tracking
   matches sandbox exact value. */
.app-card__label {
  font-family: var(--omn-font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  margin: 0;
  position: relative;
  z-index: 2;
}

/* ── Heading (title) ──
   Display font, weight 400 (not light — card title is regular weight).
   font-size: 24px — sandbox value, no fluid clamp for card title
   (structural content card size, not a section headline).
   margin-top: 12px — structural separation from label/numeral rows. */
.app-card__title {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-regular);
  font-size: 24px;
  line-height: var(--leading-lg);
  letter-spacing: -0.02em;
  color: var(--omn-text-primary);
  margin: 12px 0 0;
  position: relative;
  z-index: 2;
}

/* ── Body ──
   15px — sandbox single-use value for card body (between --text-sm 14px
   and --text-md 16px; intentionally between tokens, inline justified).
   flex: 1 allows body to expand and push foot to bottom of card. */
.app-card__body {
  font-size: 15px;
  line-height: var(--leading-relaxed);
  color: var(--omn-text-secondary);
  margin: 0;
  flex: 1;
  position: relative;
  z-index: 2;
}

/* Rich body via slot — strip top margin from first child paragraph */
.app-card__body > :first-child { margin-top: 0; }
.app-card__body > :last-child  { margin-bottom: 0; }

/* ── Foot ──
   Flex row: left meta text + right tag. Separated by 1px border.
   font-size: 11px = --text-2xs; 0.14em tracking (sandbox exact —
   slightly tighter than label's 0.18em).
   padding-top: 16px — structural separator spacing. */
.app-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--omn-border-subtle);
  font-family: var(--omn-font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.14em;
  color: var(--omn-text-tertiary);
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

/* ── Tag ──
   Sage green inline-flex label with live-indicator dot.
   gap: 8px — structural dot-to-text gap.
   Dot: 6px circle (structural, matches .trust__dot pattern from sandbox). */
.app-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--omn-success);
  text-transform: none;
  letter-spacing: var(--tracking-normal);
}
.app-card__tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--omn-success);
  display: inline-block;
  flex-shrink: 0;
}

/* ── Actions slot ──
   CTA row below foot. Consumer provides AppButton instances. */
.app-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  position: relative;
  z-index: 2;
}

/* ── Mobile ──
   Watermark shrinks to avoid overflow on narrow card columns.
   140px / -16px / -6px — sandbox exact mobile override values. */
@media (max-width: 767px) {
  .app-card__watermark {
    font-size: 140px;
    top: -16px;
    right: -6px;
  }
}

/* ── Reduced motion ──
   Disable all transitions. Render final state immediately. */
@media (prefers-reduced-motion: reduce) {
  .app-card,
  .app-card__watermark,
  .app-card__sample {
    transition: none;
  }
  .app-card--hoverable:hover .app-card__watermark {
    opacity: 0.12;
    transform: none;
  }
  .app-card--hoverable:hover .app-card__sample,
  .app-card:focus-within .app-card__sample {
    opacity: 1;
    transform: none;
  }
}
</style>
