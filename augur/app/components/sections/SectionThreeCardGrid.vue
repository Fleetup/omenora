<!--
  SectionThreeCardGrid
  ─────────────────
  Purpose: P-03 "three-document / three-card" pattern. Section header
  (optional marker + eyebrow + heading + optional intro body) followed
  by a 3-column grid of AppCard atoms. Used to present the three
  deliverables of a natal reading; reusable for any 3-item card set.

  Sandbox source: §04 "What you receive" band in redesign-home.vue
  (data-section-no="03"). The outer band (background, diagonal mask,
  overlay) is owned by the consumer page — SectionThreeCardGrid is a
  self-contained content molecule that slots into any band tone.

  Props:
    eyebrow          string — section eyebrow label
    heading          string — section h2 headline (text before any em slot)
    headingVariant?  'xl' | 'lg' | 'md'   default: 'lg'
    cards            CardItem[] — ordered array of card data (max 3
                     recommended; CSS grid always renders 3 columns on
                     desktop regardless of count)
    bandTone?        'page' | 'primary'   default: 'page'
                     Sets section background:
                       page    → --omn-bg-page    (darkest)
                       primary → --omn-bg-primary (elevated)
    marker?          string | undefined — optional section marker shown
                     top-left of section (e.g., "§ 03"). Triggers bronze
                     hairline draw on reveal.
    introBody?       string | undefined — optional paragraph between
                     heading and grid (below heading, above cards).

  CardItem interface:
    numeral?    string — bronze mono numeral (e.g., "01")
    label?      string — mono uppercase tertiary label (e.g., "Identity")
    heading?    string — card title
    body?       string — card paragraph body text
    foot?       string — mono uppercase footer left (e.g., "1,200 words")
    tag?        string — sage inline tag in footer right (e.g., "Computed")
    watermark?  string — large faded decoration numeral. Mirrors numeral
                if omitted but numeral is set.
    sample?     string — hover-reveal CTA link text
    sampleHref? string — href for sample link (default "#")

  Slots:
    #heading-em   — emphasized word inside heading (rendered as <em>
                    inside AppHeadline per SectionLede pattern)
    #heading-tail — text after #heading-em
    #outro        — optional content after the grid (CTAs, follow-up)

  Reveal behavior:
    Section root gets useReveal (threshold 0.05). isRevealed gates:
      – Bronze hairline ::before draws scaleX(0→1), 1100ms + 100ms delay
      – Marker fades up: opacity 0→1, 700ms + 200ms delay
      – Eyebrow: opacity+translateY, --omn-stagger-2 (80ms)
      – Heading: opacity+translateY, --omn-stagger-3 (120ms)
      – Intro body: opacity+translateY, --omn-stagger-4 (160ms)
      – Cards: --reveal-delay computed per card index (80ms + i*80ms)
        AppCard's own reveal CSS handles the per-card transition.
    Reduced motion: useReveal returns isRevealed=true immediately;
    CSS @media (prefers-reduced-motion) disables all transitions.

  Grid layout:
    1 column  < 768px  (mobile)
    2 columns ≥ 768px  (tablet — matches sandbox .grid--3 breakpoints)
    3 columns ≥ 1024px (desktop)
    gap: --space-gap (clamp(20px, 2.4vw, 32px) — sandbox exact token)
    container max-width: --width-section (1192px — sandbox .container)

  Token map:
    Section background    → --omn-bg-page / --omn-bg-primary
    Bronze hairline       → --omn-accent, --omn-accent-quiet
    Section border        → --omn-border-subtle
    Section padding       → --space-section
    Container padding     → --space-edge
    Grid gap              → --space-gap
    Heading margin        → --space-5
    Intro body margin     → --space-6
    Stagger tokens        → --omn-stagger-2 / -3 / -4
    Marker position       → clamp(24px, 4vw, 56px) / clamp(20px, 5vw, 64px)
    Marker gap            → --space-1
    Outro margin-top      → --space-block

  Hardcoded values justified:
    1px borders           — structural hairlines; no token
    height: 1px           — bronze hairline; structural
    top/left clamp()      — marker position; structural (mirrors SectionLede)
    translateY(-6px)      — marker enter offset; structural (SectionLede exact)
    translateY(10px/12px) — eyebrow/heading enter offset; structural
    700ms / 1100ms        — marker/hairline durations; structural (SectionLede)
    600ms                 — eyebrow/heading/body reveal; structural
    z-index: 3            — marker + hairline above band bg; structural
    z-index: 2            — container above overlay; structural
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import AppBody from '~/components/atoms/AppBody.vue'
import AppCaption from '~/components/atoms/AppCaption.vue'
import AppCard from '~/components/atoms/AppCard.vue'
import { useReveal } from '~/composables/useReveal'

export interface CardItem {
  numeral?: string
  label?: string
  heading?: string
  body?: string
  foot?: string
  tag?: string
  watermark?: string
  sample?: string
  sampleHref?: string
}

const props = withDefaults(defineProps<{
  eyebrow: string
  heading: string
  headingVariant?: 'xl' | 'lg' | 'md'
  cards: CardItem[]
  bandTone?: 'page' | 'primary'
  marker?: string
  introBody?: string
}>(), {
  headingVariant: 'lg',
  bandTone: 'page',
  marker: undefined,
  introBody: undefined,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-tcg',
  `section-tcg--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'is-revealed': isRevealed.value },
])
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
  >
    <!-- Bronze hairline ::before is CSS-only, gated on .is-revealed via --marked -->

    <!-- Section marker — § NN + section name, top-left -->
    <p v-if="marker" class="section-tcg__marker" aria-hidden="true">
      <AppCaption variant="mono" as="span" class="section-tcg__marker-no">
        {{ marker }}
      </AppCaption>
      <AppCaption variant="mono" as="span" class="section-tcg__marker-name">
        {{ eyebrow }}
      </AppCaption>
    </p>

    <div class="section-tcg__container">

      <!-- Section header block -->
      <div class="section-tcg__header">

        <AppEyebrow :rule="true" class="section-tcg__eyebrow">
          {{ eyebrow }}
        </AppEyebrow>

        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-tcg__heading"
        >{{ heading }}<template v-if="$slots['heading-em']"
          > <em><slot name="heading-em" /></em></template><template
          v-if="$slots['heading-tail']"
          > <slot name="heading-tail" /></template></AppHeadline>

        <AppBody
          v-if="introBody"
          variant="lede"
          class="section-tcg__intro"
        >{{ introBody }}</AppBody>

      </div>

      <!-- Three-card grid -->
      <div class="section-tcg__grid">
        <AppCard
          v-for="(card, i) in cards"
          :key="card.label ?? card.heading ?? i"
          :numeral="card.numeral"
          :label="card.label"
          :heading="card.heading"
          :body="card.body"
          :foot="card.foot"
          :tag="card.tag"
          :watermark="card.watermark ?? card.numeral"
          :sample="card.sample"
          :sample-href="card.sampleHref"
          class="section-tcg__card"
          :style="{ '--reveal-delay': `${80 + i * 80}ms` }"
        />
      </div>

      <!-- Outro slot (CTAs, follow-up copy, etc.) -->
      <div v-if="$slots.outro" class="section-tcg__outro">
        <slot name="outro" />
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   Band background via tone modifier. Border-top hairline separates bands.
   padding: --space-section (clamp 96px→192px) — major band rhythm. */
.section-tcg {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-tcg--page    { background: var(--omn-bg-page); }
.section-tcg--primary { background: var(--omn-bg-primary); }


/* ── Section marker (§ NN + name) ──
   Absolutely positioned top-left. Two AppCaption mono spans stacked.
   Fades up on reveal with 200ms delay. Mirrors SectionLede exactly.
   top/left: clamp structural position values (no token equivalent). */
.section-tcg__marker {
  position: absolute;
  top: clamp(24px, 4vw, 56px);
  left: clamp(20px, 5vw, 64px);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 700ms var(--omn-ease) 200ms,
    transform 700ms var(--omn-ease) 200ms;
}
.is-revealed .section-tcg__marker {
  opacity: 1;
  transform: translateY(0);
}

/* First span (§ NN) gets accent color */
.section-tcg__marker-no {
  color: var(--omn-accent) !important;
}

/* ── Container ──
   Centers content. max-width: --width-section (1192px) — sandbox
   .container exact value for this section. z-index: 2 sits above
   diagonal band overlay layers. */
.section-tcg__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--width-section);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* ── Section header block ──
   Lede chrome: eyebrow → heading → optional intro body.
   max-width: 720px — sandbox .lede exact editorial measure.
   margin-bottom: --space-block separates header from grid. */
.section-tcg__header {
  max-width: 720px;
  margin-bottom: var(--space-block);
}

/* ── Eyebrow stagger (--omn-stagger-2 = 80ms) ── */
.section-tcg__eyebrow {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-tcg__eyebrow {
  opacity: 1;
  transform: translateY(0);
}

/* ── Heading stagger (--omn-stagger-3 = 120ms) ── */
.section-tcg__heading {
  margin-top: var(--space-5);
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.is-revealed .section-tcg__heading {
  opacity: 1;
  transform: translateY(0);
}

/* ── Intro body stagger (--omn-stagger-4 = 160ms) ──
   max-width: 56ch — matches sandbox .lede__body prose measure. */
.section-tcg__intro {
  max-width: 56ch;
  margin-top: var(--space-6) !important;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-tcg__intro {
  opacity: 1;
  transform: translateY(0);
}

/* ── Three-card grid ──
   1col mobile → 2col @768px → 3col @1024px.
   Mirrors sandbox .grid + .grid--3 breakpoints exactly.
   gap: --space-gap (clamp(20px, 2.4vw, 32px) — sandbox exact token). */
.section-tcg__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-gap);
}
@media (min-width: 768px) {
  .section-tcg__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .section-tcg__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ── Per-card reveal ──
   Each AppCard receives --reveal-delay inline (80ms + i*80ms).
   AppCard's own .app-card root carries the transition; we add the
   scroll-reveal opacity+translateY here at the grid-item level so
   the stagger works independently of AppCard's hover transitions.
   transition duration 600ms matches section header elements. */
.section-tcg__card {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 600ms var(--omn-ease) var(--reveal-delay, 80ms),
    transform 600ms var(--omn-ease) var(--reveal-delay, 80ms);
}
.is-revealed .section-tcg__card {
  opacity: 1;
  transform: translateY(0);
}

/* ── Outro block ──
   Optional slot content after grid (CTAs, follow-up copy).
   margin-top: --space-block provides the same separation as
   the header-to-grid gap. */
.section-tcg__outro {
  margin-top: var(--space-block);
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .section-tcg {
    padding: var(--space-16) 0;
  }
  .section-tcg__marker {
    display: none;
  }
}

/* ── Reduced motion ──
   Disable all transitions. Render final states immediately.
   The is-revealed class still applies (set by useReveal) so
   opacity/transform values remain correct without animation. */
@media (prefers-reduced-motion: reduce) {
  .section-tcg__marker,
  .section-tcg__eyebrow,
  .section-tcg__heading,
  .section-tcg__intro,
  .section-tcg__card {
    transition: none;
  }
  .section-tcg__marker { opacity: 1; transform: none; }
  .section-tcg__eyebrow,
  .section-tcg__heading,
  .section-tcg__intro { opacity: 1; transform: none; }
  .section-tcg__card { opacity: 1; transform: none; }
}
</style>
