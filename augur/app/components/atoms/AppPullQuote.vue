<!--
  AppPullQuote
  ─────────────────
  Purpose: Inline editorial pull-quote — a single-element callout
  in the testimonial register. Typography derived from the sandbox's
  .quote__body--hero (the largest, most editorial quote variant).

  Testimonial card structure (.quote + .quote__glyph + .quote__rule
  + .quote__cite) is a MOLECULE concern (future SectionTestimonial).
  AppPullQuote is the stripped-down inline-use version: no card
  chrome, no attribution row — just the quoted text with optional
  <cite> for attribution.

  Props:
    variant  'default' | 'accent'            default: 'default'
             default → --omn-text-primary (warm cream; editorial)
             accent  → --omn-accent (bronze; featured callout)
    as       string — rendered element       default: 'blockquote'
    balance  boolean — text-wrap: balance    default: true

  Slots:
    default  — the quoted text
    cite     — optional attribution line (renders as <cite>)

  Usage:
    <AppPullQuote>One of these is yours.</AppPullQuote>
    <AppPullQuote variant="accent">A reading unlike any other.</AppPullQuote>
    <AppPullQuote>
      The stars don't lie.
      <template #cite>Maya A. · Oracle member</template>
    </AppPullQuote>

  Typography source: .quote__body--hero
    font-family: --omn-font-display (Onest)
    font-weight: 300 (--weight-light)
    font-size:   --text-2xl (30px; hero body max is clamp→30px)
    line-height: --leading-2xl (1.25)
    letter-spacing: -0.018em (inline; unique value, below 3+ threshold)

  Left accent rule via ::before pseudo-element, --omn-accent color.

  Out of scope:
    – .quote card container (molecule: background, border, padding)
    – .quote__glyph decorative " mark (molecule)
    – .quote__rule hairline (molecule → uses AppDivider)
    – .quote__name / .quote__ctx attribution row (molecule)
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'accent'
  as?: string
  balance?: boolean
}>(), {
  variant: 'default',
  as: 'blockquote',
  balance: true,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-pull-quote',
      `app-pull-quote--${variant}`,
      { 'app-pull-quote--balance': balance },
    ]"
  >
    <slot />
    <cite v-if="$slots.cite" class="app-pull-quote__cite"><slot name="cite" /></cite>
  </component>
</template>

<style scoped>
/* ── Base ── */
/* Typography matches .quote__body--hero: display font, light weight, italic */
.app-pull-quote {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: var(--text-2xl);
  line-height: var(--leading-2xl);
  /* -0.018em: sandbox .quote__body--hero letter-spacing; unique value, inline per
     3+ threshold. Tighter than --tracking-normal (-0.012em) for large editorial. */
  letter-spacing: -0.018em;
  margin: 0;
  padding-left: var(--space-4);
  position: relative;
}

/* ── Left accent rule ──
   Bronze hairline to the left of the quote — editorial pull-quote convention.
   width: var(--space-1) = 4px; height: 100% of the element. */
.app-pull-quote::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--space-1);
  background: var(--omn-accent);
  opacity: 0.7;
}

/* ── Color variants ── */
.app-pull-quote--default { color: var(--omn-text-primary); }
.app-pull-quote--accent  { color: var(--omn-accent); }

/* ── text-wrap balance — progressive enhancement ── */
.app-pull-quote--balance { text-wrap: balance; }

/* ── Attribution cite ──
   Mirrors .quote__ctx: mono, small, uppercase, --tracking-mid (0.12em),
   --omn-text-tertiary. Non-italic to contrast with the quoted text. */
.app-pull-quote__cite {
  display: block;
  margin-top: var(--space-3);
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  font-style: normal;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}
</style>
