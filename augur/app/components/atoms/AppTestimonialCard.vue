<!--
  AppTestimonialCard
  ──────────────────
  Purpose: 12th atom. Multi-element testimonial card pattern.
  Renders a figure containing a decorative glyph, blockquote body,
  hairline rule, and figcaption attribution (name + context).

  Two variants from sandbox §06 "Social Proof" (proof-grid, P-07):
    hero      — large display-font body, bronze radial glow top-left,
                bigger glyph (88px), larger fluid padding
    secondary — body-font body, tighter base padding, smaller glyph

  Sandbox source: figure.quote.quote--hero and
  figure.quote.quote--secondary in redesign-home.vue (lines 337–361).
  CSS: lines 1858–1903.

  Props:
    body           string — required. The quote text.
    name           string — required. Attribution name.
    context?       string | undefined — attribution subtitle.
                   Mono uppercase tertiary. e.g. "Engineer · Brooklyn"
    glyph?         string — decorative quote mark.
                   Default: '\u201C' (LEFT DOUBLE QUOTATION MARK).
    variant?       'hero' | 'secondary' — default: 'secondary'
    revealDelay?   number — ms delay for entrance reveal (default 0).
                   Sets --reveal-delay CSS var for parent-driven stagger.

  Slots:
    #body — overrides body prop with rich markup (for emphasis, etc.)
    #cite — overrides default name+context layout

  Reveal behavior:
    No useReveal on the card itself — reveal is driven by the PARENT
    container (SectionSocialProof will use v-reveal or useReveal on its
    root, which gates .is-revealed). Each card responds to its
    parent's .is-revealed via opacity+translateY, gated on
    .is-revealed (cascaded from parent reveal class) using
    --reveal-delay for stagger. This matches the sandbox v-reveal
    directive placed on each figure individually.
    Note: if this atom is used outside a reveal container, pass
    revealDelay=0 and no reveal will happen until the parent
    explicitly adds .is-revealed.

  Token map:
    Card background      → --omn-bg-elevated
    Card border          → --omn-border-primary
    Hero glow            → --omn-accent-a08 (rgba(168,125,78,0.08))
                           Token confirmed in editorial.css line 189
    Glyph color          → --omn-accent
    Glyph font           → --omn-font-display
    Body color           → --omn-text-primary
    Hero body font       → --omn-font-display
    Rule color           → --omn-border-subtle
    Name color           → --omn-text-primary
    Context color        → --omn-text-tertiary
    Context font         → --omn-font-mono
    Context tracking     → --tracking-mid (0.12em) — token match ✅

  §8 compliance: no box-shadow, no text-shadow, no filter:drop-shadow.
  Radial gradient is background-image — not a shadow, allowed.
  border-radius: 0 (implicit — no border-radius declared).

  Hardcoded values justified:
    position: relative        — required for ::before if added later;
                                sandbox .quote sets it
    padding: 36px 32px        — sandbox .quote base exact; no token match
    padding hero: clamp(…)    — sandbox .quote--hero exact fluid value
    padding secondary: 28px   — sandbox .quote--secondary exact; no token
    gap: 20px                 — sandbox .quote exact; between --space-4
                                (16px) and --space-5 (20px); structural
    glyph 56px / 88px         — sandbox exact display sizes; no token
    glyph line-height: 0.6    — sandbox exact; structural (prevents glyph
                                from adding extra line height above body)
    body 18px                 — sandbox exact; == --text-lg token ✅
    body tracking: -0.01em    — sandbox exact; no token at this value
    hero body clamp(22-30px)  — sandbox exact fluid range; structural
    hero body line-height 1.3 — sandbox exact; no token
    hero body tracking -0.018 — sandbox exact; no token
    secondary body 15px       — sandbox exact; between --text-sm (14px)
                                and --text-md (16px); structural
    rule height: 1px          — structural hairline; no token
    cite gap: 4px             — sandbox exact; below --space-1 (4px)
                                actually = --space-1 ✅
    name font-size: 14px      — sandbox exact; == --text-sm token ✅
    ctx font-size: 11px       — sandbox exact; == --text-xs token ✅
    radial-gradient: 900px    — sandbox exact glow radius; structural
    radial-gradient: 360px    — sandbox exact glow height; structural
    translateY offsets        — animation enter; structural
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import { useReveal } from '~/composables/useReveal'

const props = withDefaults(defineProps<{
  body: string
  name: string
  context?: string
  glyph?: string
  variant?: 'hero' | 'secondary'
  revealDelay?: number
}>(), {
  context: undefined,
  glyph: '\u201C',
  variant: 'secondary',
  revealDelay: 0,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.1 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const cardClass = computed(() => [
  'app-testimonial-card',
  `app-testimonial-card--${props.variant}`,
  { 'is-revealed': isRevealed.value },
])

const cardStyle = computed(() => ({
  '--reveal-delay': `${props.revealDelay}ms`,
}))
</script>

<template>
  <figure
    :ref="setRevealEl"
    :class="cardClass"
    :style="cardStyle"
  >
    <!-- Decorative opening quotation mark — aria-hidden, presentational -->
    <p class="app-testimonial-card__glyph" aria-hidden="true">{{ glyph }}</p>

    <!-- Quote body — slot or string prop -->
    <blockquote class="app-testimonial-card__body">
      <slot name="body">{{ body }}</slot>
    </blockquote>

    <!-- Hairline rule — presentational separator -->
    <div class="app-testimonial-card__rule" aria-hidden="true" />

    <!-- Attribution -->
    <figcaption class="app-testimonial-card__cite">
      <slot name="cite">
        <span class="app-testimonial-card__name">{{ name }}</span>
        <span
          v-if="context"
          class="app-testimonial-card__ctx"
        >{{ context }}</span>
      </slot>
    </figcaption>
  </figure>
</template>

<style scoped>
/* ── Card base ──
   Elevated surface with primary border. flex column, gap 20px.
   position: relative — for potential future ::before decoration
   and consistent with sandbox .quote pattern.
   padding: 36px 32px — sandbox .quote base exact. No token match.
   gap: 20px — sandbox exact; between --space-4 (16px) and
   --space-5 (20px). Structural. */
.app-testimonial-card {
  position: relative;
  padding: 36px 32px;
  background: var(--omn-bg-elevated);
  border: 1px solid var(--omn-border-primary);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 600ms var(--omn-ease) var(--reveal-delay, 0ms),
    transform 600ms var(--omn-ease) var(--reveal-delay, 0ms);
}

/* ── Hero variant ──
   padding: clamp(36px, 4vw, 56px) — sandbox exact fluid override.
   background: radial-gradient top-left bronze glow + --omn-bg-elevated.
   900px × 360px at 0% 0% — sandbox exact glow dimensions; structural.
   --omn-accent-a08 (rgba(168,125,78,0.08)) — token confirmed. */
.app-testimonial-card--hero {
  padding: clamp(36px, 4vw, 56px);
  background:
    radial-gradient(900px 360px at 0% 0%, var(--omn-accent-a08), transparent 60%),
    var(--omn-bg-elevated);
}

/* ── Secondary variant ──
   padding: 28px — sandbox .quote--secondary exact; no token. */
.app-testimonial-card--secondary {
  padding: 28px;
}

/* ── Reveal: own useReveal per card ──
   Matches sandbox pattern exactly: each figure had its own
   v-reveal directive. useReveal adds is-revealed to the card
   root on intersection. Stagger driven by --reveal-delay prop. */
.app-testimonial-card.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── Decorative glyph ──
   Display font, weight 300, accent color.
   font-size 56px base — sandbox exact; no token at this size.
   line-height: 0.6 — sandbox exact; prevents glyph from
   adding extra vertical space above the body. Structural. */
.app-testimonial-card__glyph {
  font-family: var(--omn-font-display);
  font-weight: 300;
  font-size: 56px;
  line-height: 0.6;
  color: var(--omn-accent);
  margin: 0;
}

/* Hero glyph: 88px — sandbox .quote--hero .quote__glyph exact. */
.app-testimonial-card--hero .app-testimonial-card__glyph {
  font-size: 88px;
}

/* ── Quote body (secondary) ──
   font-size: 18px = --text-lg ✅ token.
   letter-spacing: -0.01em — sandbox exact; no token at this value.
   flex: 1 — body grows to fill available space above the rule,
   keeping cite at the bottom regardless of body length. */
.app-testimonial-card__body {
  font-size: var(--text-lg);
  line-height: 1.5;
  color: var(--omn-text-primary);
  letter-spacing: -0.01em;
  flex: 1;
  margin: 0;
  padding: 0;
  quotes: none;
}

/* Hero body: display font, weight 300, fluid size, tighter tracking.
   clamp(22px, 2.4vw, 30px) — sandbox exact fluid range; structural.
   line-height: 1.3 — sandbox exact; no token.
   letter-spacing: -0.018em — sandbox exact; no token.
   text-wrap: balance — even line breaks in large hero quote. */
.app-testimonial-card--hero .app-testimonial-card__body {
  font-family: var(--omn-font-display);
  font-weight: 300;
  font-size: clamp(22px, 2.4vw, 30px);
  line-height: 1.3;
  letter-spacing: -0.018em;
  text-wrap: balance;
}

/* Secondary body: 15px — sandbox exact; between --text-sm (14px)
   and --text-md (16px); structural. */
.app-testimonial-card--secondary .app-testimonial-card__body {
  font-size: 15px;
  line-height: 1.5;
}

/* ── Hairline rule ──
   height: 1px — structural; no token.
   background: --omn-border-subtle (lightest available border). */
.app-testimonial-card__rule {
  height: 1px;
  background: var(--omn-border-subtle);
}

/* ── Attribution cite ──
   flex column, gap: --space-1 (4px) — token match. */
.app-testimonial-card__cite {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* Attribution name: weight 500, 14px = --text-sm ✅ token. */
.app-testimonial-card__name {
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--omn-text-primary);
}

/* Attribution context: mono uppercase tertiary.
   font-size: 11px = --text-xs ✅ token.
   letter-spacing: --tracking-mid (0.12em) — token match ✅ */
.app-testimonial-card__ctx {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .app-testimonial-card {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
