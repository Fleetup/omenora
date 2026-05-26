<!--
  SectionSideBySide
  ─────────────────
  Purpose: P-05 text|text spread pattern. Two parallel content columns
  (eyebrow + heading + body + optional KV list) side by side on desktop,
  stacked on mobile. Used for multi-tradition / multi-lens comparisons.

  Sandbox source: §05 "The traditions" band in redesign-home.vue
  (data-section-no="04"). Template: .lede.lede--narrow section header
  above a .traditions-spread 2-column grid of .text-block items.

  Props:
    eyebrow?        string | undefined — section-level eyebrow label
    heading?        string | undefined — section-level h2 headline
    headingVariant? 'xl' | 'lg' | 'md'  default: 'lg'
    columns         ColumnItem[] — ordered array, length 2 expected
    bandTone?       'page' | 'primary'  default: 'page'
    marker?         string | undefined — optional section marker

  ColumnItem interface:
    eyebrow?  string — column eyebrow (rendered quiet/subdued)
    heading?  string — column heading (h3, variant md)
    body?     string — column body paragraph
    kvs?      KVItem[] — optional key-value list below body

  KVItem interface:
    key:   string — label (mono uppercase, tertiary, --tracking-mid)
    value: string — value (mono, secondary)

  Slots:
    #heading-em   — em word inside section heading
    #heading-tail — text after #heading-em
    #intro        — optional intro body between section heading and grid
    #outro        — optional content below the grid

  Reveal behavior:
    Section root gets useReveal (threshold 0.05). isRevealed gates:
      – Bronze hairline ::before draws scaleX(0→1), 1100ms + 100ms delay
      – Marker fades up: 700ms + 200ms delay
      – Section eyebrow: --omn-stagger-2 (80ms)
      – Section heading: --omn-stagger-3 (120ms)
      – Intro: --omn-stagger-4 (160ms)
      – Columns: --reveal-delay per column (80ms left, 160ms right)
        matching sandbox .text-block stagger pattern exactly
    Reduced motion: useReveal returns isRevealed=true immediately.

  Grid layout:
    1 column  < 900px  (mobile/tablet — matches sandbox breakpoint)
    2 columns ≥ 900px  (desktop)
    gap mobile:  56px  (sandbox exact — no --space-N token covers this)
    gap desktop: clamp(56px, 8vw, 112px)  (sandbox exact)
    Both gap values exceed existing space tokens; justified inline.
    Container: --width-section (1192px — sandbox .container default)

  KV list pattern (inline in scoped CSS, not extracted):
    <ul> element, border-top + per-row border-bottom hairlines.
    Row: key span (mono uppercase, --tracking-mid, tertiary) +
         value span (mono, secondary).
    font-size: 12px — between --text-xs (11px) and --text-sm (14px);
    no exact token. Justified structural.
    key letter-spacing: --tracking-mid (0.12em) — token exists, used.
    value letter-spacing: 0.04em — sandbox exact row value; no token.
    Paywall .kvs uses a different shape (grid 1fr auto, 0.14em keys)
    and is a distinct pattern — extraction deferred.

  Token map:
    Section background  → --omn-bg-page / --omn-bg-primary
    Bronze hairline     → --omn-accent, --omn-accent-quiet
    Section border      → --omn-border-subtle
    Section padding     → --space-section
    Container padding   → --space-edge (via clamp)
    Section lede mb     → --space-block
    Heading mt          → --space-5
    Body mb             → --space-7
    Column reveal delay → inline --reveal-delay (80ms / 160ms)
    KV key tracking     → --tracking-mid
    KV borders          → --omn-border-subtle
    KV key color        → --omn-text-tertiary
    KV value color      → --omn-text-secondary
    KV font family      → --omn-font-mono
    Stagger tokens      → --omn-stagger-2 / -3 / -4
    Marker position     → clamp(24px, 4vw, 56px) / clamp(20px, 5vw, 64px)

  Hardcoded values justified:
    1px borders / height: 1px  — structural hairlines; no token
    top/left clamp()           — marker position; structural
    translateY offsets         — animation enter; structural
    700ms / 1100ms / 600ms     — reveal durations; structural
    56px (mobile gap)          — sandbox exact; exceeds --space-14 (56px)
                                 wait: --space-14 may exist — see below
    clamp(56px, 8vw, 112px)   — sandbox exact desktop gap; no token
    12px (KV font-size)        — between tokens; sandbox exact; structural
    0.04em (KV row tracking)   — sandbox exact row value; no token
    24px (KV row gap)          — sandbox exact; matches --space-6 token
    16px (KV row padding)      — sandbox exact; matches --space-4 token
    28px (body margin-bottom)  — sandbox exact .text-block .body value
    z-index: 3 / 2             — marker/hairline above band; structural
    max-width: 720px           — section lede; sandbox exact editorial
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import AppBody from '~/components/atoms/AppBody.vue'
import AppCaption from '~/components/atoms/AppCaption.vue'
import { useReveal } from '~/composables/useReveal'

export interface KVItem {
  key: string
  value: string
}

export interface ColumnItem {
  eyebrow?: string
  heading?: string
  body?: string
  kvs?: KVItem[]
}

const props = withDefaults(defineProps<{
  eyebrow?: string
  heading?: string
  headingVariant?: 'xl' | 'lg' | 'md'
  columns: ColumnItem[]
  bandTone?: 'page' | 'primary'
  marker?: string
}>(), {
  eyebrow: undefined,
  heading: undefined,
  headingVariant: 'lg',
  bandTone: 'page',
  marker: undefined,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-sbs',
  `section-sbs--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'is-revealed': isRevealed.value },
])

function columnRevealDelay(index: number): string {
  return `${80 + index * 80}ms`
}
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
  >
    <!-- Bronze hairline ::before is CSS-only, gated on .is-revealed via --marked -->

    <!-- Section marker — § NN + section name, top-left -->
    <p v-if="marker" class="section-sbs__marker" aria-hidden="true">
      <AppCaption variant="mono" as="span" class="section-sbs__marker-no">
        {{ marker }}
      </AppCaption>
      <AppCaption variant="mono" as="span" class="section-sbs__marker-name">
        {{ eyebrow ?? '' }}
      </AppCaption>
    </p>

    <div class="section-sbs__container">

      <!-- Section header — eyebrow + heading (optional) -->
      <div
        v-if="eyebrow || heading || $slots['heading-em'] || $slots.intro"
        class="section-sbs__header"
      >
        <AppEyebrow
          v-if="eyebrow"
          :rule="true"
          class="section-sbs__eyebrow"
        >{{ eyebrow }}</AppEyebrow>

        <AppHeadline
          v-if="heading || $slots['heading-em']"
          :variant="headingVariant"
          as="h2"
          class="section-sbs__heading"
        >{{ heading }}<template v-if="$slots['heading-em']"
          > <em><slot name="heading-em" /></em></template><template
          v-if="$slots['heading-tail']"
          > <slot name="heading-tail" /></template></AppHeadline>

        <AppBody
          v-if="$slots.intro"
          variant="default"
          class="section-sbs__intro"
        ><slot name="intro" /></AppBody>
      </div>

      <!-- Two-column spread grid -->
      <div class="section-sbs__grid">
        <div
          v-for="(col, i) in columns"
          :key="col.heading ?? col.eyebrow ?? i"
          class="section-sbs__col"
          :style="{ '--reveal-delay': columnRevealDelay(i) }"
        >
          <AppEyebrow
            v-if="col.eyebrow"
            variant="quiet"
            :rule="true"
            class="section-sbs__col-eyebrow"
          >{{ col.eyebrow }}</AppEyebrow>

          <AppHeadline
            v-if="col.heading"
            variant="md"
            as="h3"
            class="section-sbs__col-heading"
          >{{ col.heading }}</AppHeadline>

          <AppBody
            v-if="col.body"
            variant="default"
            class="section-sbs__col-body"
          >{{ col.body }}</AppBody>

          <!-- KV list — key/value pairs below body -->
          <ul v-if="col.kvs?.length" class="section-sbs__kvs">
            <li
              v-for="(kv, j) in col.kvs"
              :key="j"
              class="section-sbs__kv"
            >
              <span class="section-sbs__kv-key">{{ kv.key }}</span>
              <span class="section-sbs__kv-value">{{ kv.value }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Outro slot (optional follow-up content below grid) -->
      <div v-if="$slots.outro" class="section-sbs__outro">
        <slot name="outro" />
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   Band background via tone modifier. Border-top hairline separates bands.
   padding: --space-section (clamp 96px→192px) — major band rhythm. */
.section-sbs {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-sbs--page    { background: var(--omn-bg-page); }
.section-sbs--primary { background: var(--omn-bg-primary); }


/* ── Section marker (§ NN + name) ──
   Absolutely positioned top-left. Mirrors SectionLede exact pattern.
   top/left: clamp structural position values (no token equivalent). */
.section-sbs__marker {
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
.is-revealed .section-sbs__marker {
  opacity: 1;
  transform: translateY(0);
}

.section-sbs__marker-no {
  color: var(--omn-accent) !important;
}

/* ── Container ──
   max-width: --width-section (1192px) — sandbox .container default.
   z-index: 2 sits above diagonal band overlay layers. */
.section-sbs__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--width-section);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* ── Section header block ──
   max-width: 720px — sandbox .lede exact editorial measure.
   margin-bottom: --space-block separates from grid. */
.section-sbs__header {
  max-width: 720px;
  margin-bottom: var(--space-block);
}

/* ── Section eyebrow stagger (--omn-stagger-2 = 80ms) ── */
.section-sbs__eyebrow {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-sbs__eyebrow {
  opacity: 1;
  transform: translateY(0);
}

/* ── Section heading stagger (--omn-stagger-3 = 120ms) ── */
.section-sbs__heading {
  margin-top: var(--space-5);
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.is-revealed .section-sbs__heading {
  opacity: 1;
  transform: translateY(0);
}

/* ── Section intro stagger (--omn-stagger-4 = 160ms) ── */
.section-sbs__intro {
  margin-top: var(--space-6) !important;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-sbs__intro {
  opacity: 1;
  transform: translateY(0);
}

/* ── Two-column spread grid ──
   1 column < 900px (matches sandbox .traditions-spread breakpoint).
   2 columns >= 900px.
   gap mobile:  56px — sandbox exact value; no single --space-N token
   gap desktop: clamp(56px, 8vw, 112px) — sandbox exact clamp; structural. */
.section-sbs__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
}
@media (min-width: 900px) {
  .section-sbs__grid {
    grid-template-columns: 1fr 1fr;
    gap: clamp(56px, 8vw, 112px);
  }
}

/* ── Column reveal ──
   Each column fades+slides in using its --reveal-delay inline style
   (80ms left, 160ms right — sandbox .text-block stagger pattern exact).
   opacity+translateY: 600ms, gated on .is-revealed parent. */
.section-sbs__col {
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 600ms var(--omn-ease) var(--reveal-delay, 80ms),
    transform 600ms var(--omn-ease) var(--reveal-delay, 80ms);
}
.is-revealed .section-sbs__col {
  opacity: 1;
  transform: translateY(0);
}

/* ── Column heading ──
   margin-top: --space-5 (20px) separates from column eyebrow. */
.section-sbs__col-heading {
  margin-top: var(--space-5);
}

/* ── Column body ──
   margin-bottom: 28px — sandbox .text-block .body exact value.
   Structural inter-element gap; no token at 28px. */
.section-sbs__col-body {
  margin-top: var(--space-4) !important;
  margin-bottom: 28px !important;
}

/* ── KV list ──
   border-top hairline opens the list. Each row flex-between with
   border-bottom separator. font-size: 12px — sandbox exact; between
   --text-xs (11px) and --text-sm (14px), no exact token; structural.
   Row letter-spacing: 0.04em — sandbox exact row value; no token.
   gap: 24px = --space-6; padding: 16px 0 = --space-4 per side. */
.section-sbs__kvs {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-sbs__kv {
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--omn-border-subtle);
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--omn-text-secondary);
}

/* KV key span: uppercase mono caps with --tracking-mid (0.12em).
   --tracking-mid token is defined in editorial.css for "KV list spans". */
.section-sbs__kv-key {
  color: var(--omn-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-mid);
}

/* KV value span: inherits row color (--omn-text-secondary). */
.section-sbs__kv-value {
  text-align: right;
}

/* ── Outro block ── */
.section-sbs__outro {
  margin-top: var(--space-block);
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .section-sbs {
    padding: var(--space-16) 0;
  }
  .section-sbs__marker {
    display: none;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-sbs__marker,
  .section-sbs__eyebrow,
  .section-sbs__heading,
  .section-sbs__intro,
  .section-sbs__col {
    transition: none;
  }
  .section-sbs__marker { opacity: 1; transform: none; }
  .section-sbs__eyebrow,
  .section-sbs__heading,
  .section-sbs__intro { opacity: 1; transform: none; }
  .section-sbs__col { opacity: 1; transform: none; }
}
</style>
