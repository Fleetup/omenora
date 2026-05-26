<!--
  SectionPaywallCard
  ──────────────────
  Purpose: P-06 paywall conversion card. Renders the bordered card
  containing labeled item rows, emphasized price, trust strip, and
  primary CTA. Conversion-critical — fully data-driven via props.

  Sandbox source: div.paywall inside §06 "Begin" band in
  redesign-home.vue (lines 421–455). The card is a sibling of the
  .centered block inside container--narrow, not nested inside it.

  Structure (sandbox order preserved):
    1. .section-paywall__rows   — labeled detail rows (key/value)
    2. .section-paywall__price  — price label + large display value
    3. AppButton                — full-width primary CTA
    4. .section-paywall__trust  — sage dot trust strip
    5. .section-paywall__terms  — optional fine print (slot)

  Props:
    items         PaywallItem[] — labeled rows (key + value)
    priceLabel    string — label above the big price (e.g., "One-time")
    priceValue    string — the big price (e.g., "$24.99")
    priceUnit?    string | undefined — small mono suffix after price
                  (e.g., "/ year"); optional
    trustItems?   string[] — trust strip labels rendered as a flex row
                  with sage dots and · separators. Each element becomes
                  one trust badge. Sandbox uses 3: "Secure checkout",
                  "7-day refund", "Stripe protected".
    ctaLabel      string — primary CTA button text
    ctaHref?      string — CTA destination (default "#")
    revealDelay?  number — ms delay for card entrance reveal (default 0)

  PaywallItem interface:
    key:   string — mono uppercase tertiary (tracking-label, 0.14em)
    value: string — mono body, primary color

  Slots:
    #cta    — overrides default AppButton with custom CTA markup
    #terms  — optional fine print below trust strip

  Reveal behavior:
    Card root gets useReveal (threshold 0.15). Entrance stagger:
      – Rows block: opacity+translateY, 0ms (base)
      – Price block: opacity+translateY, --omn-stagger-2 (80ms)
      – CTA block: opacity+translateY, --omn-stagger-3 (120ms)
      – Trust strip: opacity+translateY, --omn-stagger-4 (160ms)
      – Terms slot: opacity+translateY, --omn-stagger-5 (240ms)
    revealDelay prop adds additional parent-context delay offset.
    Reduced-motion: useReveal returns isRevealed=true immediately.

  Token map:
    Card background       → --omn-bg-elevated
    Card border           → --omn-border-primary
    Card padding          → clamp(28px, 4vw, 48px) — sandbox exact
    Row border            → --omn-border-subtle
    Price border-top      → --omn-border-emphasis
    Row font family       → --omn-font-mono
    Key color             → --omn-text-tertiary
    Key tracking          → --tracking-label (0.14em) — token match
    Row tracking          → 0.04em — sandbox exact; no token
    Value color           → --omn-text-primary
    Price label font      → --omn-font-mono
    Price label tracking  → --tracking-caps (0.18em)
    Price value font      → --omn-font-display
    Price value color     → --omn-text-primary
    Trust color           → --omn-text-tertiary
    Trust dot             → --omn-success (sage green)
    Trust sep opacity     → 0.4 (sandbox exact)
    Reveal stagger        → --omn-stagger-2 / -3 / -4 / -5

  Hardcoded values justified:
    1px borders              — structural hairlines; no token
    6px trust dot            — sandbox exact structural circle
    12px font-size (rows)    — sandbox exact; between --text-xs (11px)
                               and --text-sm (14px); structural
    12px font-size (trust)   — sandbox exact; same justification
    44px price value         — sandbox exact display size; between
                               --text-4xl (36px) and --text-5xl (48px);
                               no token match; structural
    18px (row padding)       — sandbox exact .paywall__row padding;
                               no single token at 18px; structural
    24px (row gap)           — sandbox exact; matches --space-6 token
    32px/28px (price margin) — sandbox .paywall__price margin exact
    24px (price padding-top) — sandbox exact; matches --space-6 token
    24px (trust margin-top)  — sandbox exact; matches --space-6 token
    10px (trust gap)         — sandbox exact; between --space-2 (8px)
                               and --space-3 (12px); structural
    2px (sep padding)        — sandbox exact .trust__sep; structural
    mobile: 28px/24px        — sandbox .paywall mobile overrides exact
    border-radius: 0         — SD3 explicit no-radius requirement
    margin-top: 0            — card is self-contained, parent controls spacing
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppButton from '~/components/atoms/AppButton.vue'
import { useReveal } from '~/composables/useReveal'

export interface PaywallItem {
  key: string
  value: string
}

const props = withDefaults(defineProps<{
  items: PaywallItem[]
  priceLabel: string
  priceValue: string
  priceUnit?: string
  trustItems?: string[]
  ctaLabel: string
  ctaHref?: string
  revealDelay?: number
}>(), {
  priceUnit: undefined,
  trustItems: undefined,
  ctaHref: '#',
  revealDelay: 0,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.15 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const cardClass = computed(() => [
  'section-paywall',
  { 'is-revealed': isRevealed.value },
])

const cardStyle = computed(() => ({
  '--card-reveal-delay': `${props.revealDelay}ms`,
}))
</script>

<template>
  <article
    :ref="setRevealEl"
    :class="cardClass"
    :style="cardStyle"
  >
    <!-- ── Item rows ── -->
    <div class="section-paywall__rows">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="section-paywall__row"
      >
        <span class="section-paywall__key">{{ item.key }}</span>
        <span class="section-paywall__val">{{ item.value }}</span>
      </div>
    </div>

    <!-- ── Price row ── -->
    <div class="section-paywall__price">
      <span class="section-paywall__price-label">{{ priceLabel }}</span>
      <span class="section-paywall__price-value">
        {{ priceValue }}<span
          v-if="priceUnit"
          class="section-paywall__price-unit"
        >{{ priceUnit }}</span>
      </span>
    </div>

    <!-- ── CTA ── -->
    <div class="section-paywall__cta">
      <slot name="cta">
        <AppButton
          variant="primary"
          :href="ctaHref"
          :full="true"
        >{{ ctaLabel }}</AppButton>
      </slot>
    </div>

    <!-- ── Trust strip ── -->
    <p
      v-if="trustItems?.length"
      class="section-paywall__trust"
      aria-label="Trust indicators"
    >
      <template v-for="(label, i) in trustItems" :key="i">
        <span class="section-paywall__trust-dot" aria-hidden="true" />{{ label }}<span
          v-if="i < trustItems.length - 1"
          class="section-paywall__trust-sep"
          aria-hidden="true"
        >·</span>
      </template>
    </p>

    <!-- ── Terms (optional slot) ── -->
    <p v-if="$slots.terms" class="section-paywall__terms">
      <slot name="terms" />
    </p>
  </article>
</template>

<style scoped>
/* ── Card root ──
   Bordered elevated card — conversion-critical surface.
   background: --omn-bg-elevated (darkest elevated surface).
   border: 1px solid --omn-border-primary.
   padding: clamp(28px, 4vw, 48px) — sandbox exact fluid value.
   border-radius: 0 — SD3 explicit; editorial cards are square.
   margin-top: 0 — parent controls positioning (e.g., margin-top
   is set by the parent container, not the card itself).
   Reveal: opacity+translateY gate on is-revealed class. */
.section-paywall {
  background: var(--omn-bg-elevated);
  border: 1px solid var(--omn-border-primary);
  padding: clamp(28px, 4vw, 48px);
  border-radius: 0;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 600ms var(--omn-ease) var(--card-reveal-delay, 0ms),
    transform 600ms var(--omn-ease) var(--card-reveal-delay, 0ms);
}
.section-paywall.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── Rows block ──
   flex column of grid rows. First row gets border-top hairline.
   Each row: display grid 1fr auto, font-family mono, 12px.
   row tracking: 0.04em — sandbox exact; no token.
   row padding: 18px 0 — sandbox exact; between --space-4 (16px)
   and --space-5 (20px); structural. */
.section-paywall__rows {
  display: flex;
  flex-direction: column;
}
.section-paywall__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-6);
  align-items: baseline;
  padding: 18px 0;
  border-bottom: 1px solid var(--omn-border-subtle);
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.section-paywall__row:first-child {
  border-top: 1px solid var(--omn-border-subtle);
}

/* Key span: mono uppercase tertiary.
   --tracking-label (0.14em) — token exists and matches sandbox. */
.section-paywall__key {
  color: var(--omn-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
}

/* Value span: primary color, right-aligned. */
.section-paywall__val {
  color: var(--omn-text-primary);
  text-align: right;
}

/* ── Price block ──
   flex row: label left, big value right. Separated from rows by
   --omn-border-emphasis hairline.
   margin: 32px 0 28px — sandbox exact structural spacing.
   padding-top: 24px — sandbox exact. No tokens at these values;
   structural conversion-unit spacing. */
.section-paywall__price {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 32px 0 28px;
  padding-top: var(--space-6);
  border-top: 1px solid var(--omn-border-emphasis);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-2)),
    transform 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-2));
}
.is-revealed .section-paywall__price {
  opacity: 1;
  transform: translateY(0);
}

/* Price label: mono uppercase tertiary.
   --tracking-caps (0.18em) — sandbox .paywall__price-k exact. */
.section-paywall__price-label {
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}

/* Price value: display font, weight 400, 44px.
   44px — sandbox exact; between --text-4xl (36px) and
   --text-5xl (48px); no token match; structural.
   letter-spacing: -0.025em — sandbox exact tight display value. */
.section-paywall__price-value {
  font-family: var(--omn-font-display);
  font-weight: 400;
  font-size: 44px;
  letter-spacing: -0.025em;
  color: var(--omn-text-primary);
}

/* Price unit suffix: mono small, same tertiary as label. */
.section-paywall__price-unit {
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: var(--tracking-label);
  color: var(--omn-text-tertiary);
  margin-left: var(--space-2);
}

/* ── CTA block stagger (--omn-stagger-3 = 120ms) ── */
.section-paywall__cta {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-3)),
    transform 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-3));
}
.is-revealed .section-paywall__cta {
  opacity: 1;
  transform: translateY(0);
}

/* ── Trust strip (--omn-stagger-4 = 160ms) ──
   Flex row centered. Sage dots with · separators.
   margin-top: 24px — sandbox exact.
   gap: 10px — sandbox exact; between --space-2 (8px) and
   --space-3 (12px); structural.
   font-size: 12px — sandbox exact; structural. */
.section-paywall__trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: var(--space-6) 0 0;
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--omn-text-tertiary);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-4)),
    transform 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-4));
}
.is-revealed .section-paywall__trust {
  opacity: 1;
  transform: translateY(0);
}

/* Trust dot: 6px sage circle.
   6px — sandbox exact structural size. --omn-success (sage green). */
.section-paywall__trust-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--omn-success);
  flex-shrink: 0;
}

/* Trust separator: · between trust items. 0.4 opacity + 2px padding
   sandbox exact. 2px — structural micro-padding; no token. */
.section-paywall__trust-sep {
  opacity: 0.4;
  padding: 0 2px;
}

/* ── Terms (--omn-stagger-5 = 240ms) ──
   Fine print below trust. Tertiary mono, center-aligned. */
.section-paywall__terms {
  margin: var(--space-4) 0 0;
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--omn-text-tertiary);
  text-align: center;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-5)),
    transform 600ms var(--omn-ease) calc(var(--card-reveal-delay, 0ms) + var(--omn-stagger-5));
}
.is-revealed .section-paywall__terms {
  opacity: 1;
  transform: translateY(0);
}

/* ── Mobile ──
   Sandbox .paywall mobile override: margin-top 32px + padding 28px 24px.
   Card self-contained, parent handles margin-top; override padding only.
   28px/24px — sandbox exact mobile padding; structural. */
@media (max-width: 767px) {
  .section-paywall {
    padding: 28px 24px;
  }
  .section-paywall__price-value {
    font-size: 36px;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-paywall,
  .section-paywall__price,
  .section-paywall__cta,
  .section-paywall__trust,
  .section-paywall__terms {
    transition: none;
  }
  .section-paywall { opacity: 1; transform: none; }
  .section-paywall__price,
  .section-paywall__cta,
  .section-paywall__trust,
  .section-paywall__terms { opacity: 1; transform: none; }
}
</style>
