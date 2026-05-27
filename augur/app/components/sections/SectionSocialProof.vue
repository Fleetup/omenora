<!--
  SectionSocialProof
  ──────────────────
  Purpose: P-07 social proof section. Section header (eyebrow +
  heading) + testimonials grid (1 hero + N secondary AppTestimonialCard)
  + counters grid (AppStat instances with animated rollup via
  useCounterAnimation).

  Sandbox source: §06 "Readers" band in redesign-home.vue (lines
  310–380). Contains: .lede header, .proof-grid (testimonials),
  .counters (stats).

  Layout order (preserving sandbox DOM order):
    1. Section header (.section-ssp__header) — eyebrow + heading
    2. Testimonials grid (.section-ssp__proof-grid) — AppTestimonialCard
    3. Counters grid (.section-ssp__counters) — AppStat

  Props:
    eyebrow          string — section eyebrow text
    heading          string — section heading
    headingVariant?  'xl' | 'lg' | 'md' — default 'lg'
    introBody?       string — optional intro paragraph below heading
    counters         CounterItem[] — array of stat data
    testimonials     TestimonialItem[] — array of testimonial data.
                     Index 0 → hero variant; index 1+ → secondary.
    bandTone?        'page' | 'primary' — default 'primary'
    marker?          string — optional section marker text
                     (e.g., "§ 05  Readers"); enables .is-marked
                     bronze hairline via is-marked utility class

  CounterItem:
    interface CounterItem {
      value: number | string; // number → animated rollup
                               // string → static pass-through
      unit?:  string;          // optional suffix (e.g., "%", "/5")
      label:  string;          // descriptor
    }

  TestimonialItem:
    interface TestimonialItem {
      body:      string;
      name:      string;
      context?:  string;
      glyph?:    string;
    }

  Slots:
    #heading-em   — rich heading emphasis (span.head__em)
    #heading-tail — heading tail text (span.head__tail)
    #outro        — content after counters

  Counter animation:
    Each CounterItem with a numeric value is wired through
    useCounterAnimation triggered by the section's isRevealed ref.
    String values are passed directly to AppStat without animation.
    Animation starts once when the section intersects (useReveal
    threshold 0.1). Duration: 1400ms (sandbox exact).

  Reveal behavior:
    Section root: useReveal (threshold 0.1) → is-revealed class.
    Header elements: staggered via CSS + --omn-stagger-* tokens.
    AppTestimonialCard: each has own useReveal + revealDelay prop.
    Counter stats: opacity+translateY gated on is-revealed,
    staggered via --reveal-delay inline style per item.

  Token map:
    Section bg          → bandTone modifier (--omn-bg-page or
                          --omn-bg-primary)
    Section border-top  → --omn-border-subtle
    Header eyebrow/heading → AppEyebrow / AppHeadline atoms
    Counter grid gap    → 24px — sandbox exact; matches --space-6 ✅
    Counter border-top  → --omn-border-subtle
    Proof grid gap      → 24px / 32px — sandbox exact
    Proof hero col      → 7fr; secondary col → 5fr
    Section padding     → --space-section (clamp 96px→192px)
    Container width     → --width-section (1192px)

  Hardcoded values justified:
    padding: 36px 32px   — inherited by AppTestimonialCard (atom)
    gap: 20px            — inherited by AppTestimonialCard (atom)
    counters gap: 24px   — sandbox exact; = --space-6 token ✅
    proof-grid gap 24px/32px — sandbox exact; structural
    counters margin-top: 64px — sandbox .counters exact; between
                               --space-16 (64px) ≈ token ✅
    counters padding-top: 48px — sandbox exact; between --space-12
                               (48px) ≈ token ✅
    header max-width: 52ch — sandbox .lede--narrow exact; structural
    proof-grid 7fr 5fr   — sandbox asymmetric layout; structural
    stagger offsets      — animation deltas; structural
-->

<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import AppStat from '~/components/atoms/AppStat.vue'
import AppTestimonialCard from '~/components/atoms/AppTestimonialCard.vue'
import { useReveal } from '~/composables/useReveal'
import { useCounterAnimation } from '~/composables/useCounterAnimation'

export interface CounterItem {
  value: number | string
  unit?: string
  label: string
}

export interface TestimonialItem {
  body: string
  name: string
  context?: string
  glyph?: string
}

const props = withDefaults(defineProps<{
  eyebrow: string
  heading: string
  headingVariant?: 'xl' | 'lg' | 'md'
  introBody?: string
  counters: CounterItem[]
  testimonials: TestimonialItem[]
  bandTone?: 'page' | 'primary'
  marker?: string
  bgImage?: string
  bgImagePos?: string
  bgImagePosMobile?: string
}>(), {
  headingVariant: 'lg',
  introBody: undefined,
  bandTone: 'primary',
  marker: undefined,
  bgImage: undefined,
  bgImagePos: 'center 62%',
  bgImagePosMobile: 'center 70%',
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.1 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const hasBg = computed(() => !!props.bgImage)

const sectionClass = computed(() => [
  'section-ssp',
  `section-ssp--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'is-revealed': isRevealed.value },
  { 'diag-band': hasBg.value },
  { 'diag-band--primary': hasBg.value && props.bandTone === 'primary' },
])

const sectionStyle = computed(() => {
  if (!props.bgImage) return undefined
  return {
    '--section-img': `url('${props.bgImage}')`,
    '--section-img-pos': props.bgImagePos,
    '--section-img-pos-mobile': props.bgImagePosMobile,
  }
})

// ── Counter animation setup ──
// Each numeric CounterItem gets a useCounterAnimation ref.
// String CounterItems are static. Both are normalised into a plain
// string[] (counterDisplays) that the template reads directly.
// Composable calls happen at setup time so lifecycle hooks register.
type AnimRef = Readonly<import('vue').Ref<string>>

const counterAnimations: Array<AnimRef | null> = props.counters.map(
  (item): AnimRef | null => {
    if (typeof item.value === 'number') {
      const isDecimal = !Number.isInteger(item.value)
      return useCounterAnimation(item.value, {
        trigger: isRevealed,
        duration: 1400,
        precision: isDecimal ? 1 : 0,
        formatter: isDecimal ? (n: number) => n.toFixed(1) : undefined,
      })
    }
    return null
  },
)

// counterDisplays: reactive string[] — updated whenever any
// animated ref ticks. Template reads counterDisplays[i] directly.
const counterDisplays = ref<string[]>(
  props.counters.map((item, i): string => {
    const anim = counterAnimations[i] ?? null
    return anim !== null ? anim.value : String(item.value)
  }),
)

// Keep counterDisplays in sync with animated refs.
counterAnimations.forEach((anim, i) => {
  if (anim !== null) {
    watch(anim as AnimRef, (val: string) => {
      counterDisplays.value[i] = val
    })
  }
})

// Keep string-valued counters reactive to prop changes (e.g. live values
// fetched from an API after mount). Numeric counters are still owned by
// their useCounterAnimation refs and skipped here.
watch(() => props.counters, (newCounters) => {
  newCounters.forEach((item, i) => {
    if (counterAnimations[i] === null) {
      counterDisplays.value[i] = String(item.value)
    }
  })
}, { deep: true })

// Stagger per counter item: 240ms base + 80ms per index.
function counterRevealDelay(index: number): string {
  return `${240 + index * 80}ms`
}

// Testimonial reveal delay: hero=80ms, secondary starts at 160ms.
function testimonialRevealDelay(index: number): number {
  return index === 0 ? 80 : 160 + (index - 1) * 80
}
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
    :style="sectionStyle"
  >
    <!-- Diagonal background layers (only when bgImage is set) -->
    <div v-if="hasBg" class="diag-band__image" aria-hidden="true" />
    <div v-if="hasBg" class="diag-band__overlay" aria-hidden="true" />

    <!-- Bronze hairline ::before handled by .is-marked utility class -->

    <!-- ── Optional section marker ── -->
    <p v-if="marker" class="section-ssp__marker" aria-hidden="true">
      <span class="section-ssp__marker-no">{{ marker.split(/\s+/)[0] }}</span>
      <span class="section-ssp__marker-name">{{ marker.split(/\s+/).slice(1).join(' ') }}</span>
    </p>

    <div class="section-ssp__container diag-band__content">

      <!-- ── Section header ── -->
      <header class="section-ssp__header">
        <AppEyebrow class="section-ssp__eyebrow">{{ eyebrow }}</AppEyebrow>
        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-ssp__heading"
        >
          <slot name="heading-em">{{ heading }}</slot>
          <slot name="heading-tail" />
        </AppHeadline>
        <p v-if="introBody" class="section-ssp__intro">{{ introBody }}</p>
      </header>

      <!-- ── Testimonials grid ──
           Renders only when testimonials are supplied. Passing an empty
           array gracefully collapses the grid so the section reads as
           heading + counters alone — used while real testimonials are
           pending (per PAGES_AND_SECTIONS.md §2.7). -->
      <div v-if="testimonials.length" class="section-ssp__proof-grid">
        <!-- Index 0 → hero; index 1+ → secondary -->
        <AppTestimonialCard
          v-if="testimonials[0]"
          :body="testimonials[0].body"
          :name="testimonials[0].name"
          :context="testimonials[0].context"
          :glyph="testimonials[0].glyph"
          variant="hero"
          :reveal-delay="testimonialRevealDelay(0)"
          class="section-ssp__quote-hero"
        />
        <div v-if="testimonials.length > 1" class="section-ssp__proof-col">
          <AppTestimonialCard
            v-for="(t, i) in testimonials.slice(1)"
            :key="t.name"
            :body="t.body"
            :name="t.name"
            :context="t.context"
            :glyph="t.glyph"
            variant="secondary"
            :reveal-delay="testimonialRevealDelay(i + 1)"
          />
        </div>
      </div>

      <!-- ── Counters grid ──
           When no testimonials are supplied, drop the top hairline so the
           counters don't look severed from an invisible block above. -->
      <div
        class="section-ssp__counters"
        :class="{ 'section-ssp__counters--flush': !testimonials.length }"
      >
        <AppStat
          v-for="(item, i) in counters"
          :key="item.label"
          :value="counterDisplays[i] ?? String(item.value)"
          :unit="item.unit"
          :label="item.label"
          class="section-ssp__stat"
          :style="{ '--reveal-delay': counterRevealDelay(i) }"
        />
      </div>

    </div>

    <!-- ── Outro slot ── -->
    <div v-if="$slots.outro" class="section-ssp__outro">
      <slot name="outro" />
    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   position: relative — required for .is-marked ::before hairline
   and .section-ssp__marker absolute positioning.
   padding: --space-section (clamp 96px→192px) — major band rhythm.
   border-top: 1px --omn-border-subtle — band separator hairline. */
.section-ssp {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-ssp--page    { background: var(--omn-bg-page); }
.section-ssp--primary { background: var(--omn-bg-primary); }


/* ── Section marker (§ NN + name) ──
   Absolutely positioned top-left. Mirrors SectionLede exact pattern. */
.section-ssp__marker {
  position: absolute;
  top: clamp(24px, 4vw, 56px);
  left: clamp(20px, 5vw, 64px);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-ssp__marker { opacity: 1; transform: none; }

.section-ssp__marker-no,
.section-ssp__marker-name {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  line-height: 1.4;
}

@media (max-width: 767px) {
  .section-ssp__marker { display: none; }
}


/* ── Container ──
   Max-width: --width-section (1192px) — canonical section width.
   Horizontal padding mirrors standard container gutters. */
.section-ssp__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--width-section);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Header ──
   max-width: 52ch — sandbox .lede--narrow structural width limit.
   Staggered reveal: eyebrow → heading → intro. */
.section-ssp__header {
  max-width: 52ch;
  margin-bottom: var(--space-block);
}
.section-ssp__eyebrow {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.section-ssp__heading {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.section-ssp__intro {
  margin: var(--space-4) 0 0;
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--omn-text-secondary);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-ssp__eyebrow,
.is-revealed .section-ssp__heading,
.is-revealed .section-ssp__intro {
  opacity: 1;
  transform: none;
}


/* ── Testimonials grid ──
   Asymmetric: hero left (7fr) + secondary stack right (5fr) on
   desktop. Single column mobile. Matches sandbox .proof-grid.
   gap: 24px mobile / 32px desktop — sandbox exact; structural. */
.section-ssp__proof-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 1024px) {
  .section-ssp__proof-grid {
    grid-template-columns: 7fr 5fr;
    gap: 32px;
  }
}

/* Right column: secondary cards stack vertically. */
.section-ssp__proof-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-content: start;
}


/* ── Counters grid ──
   3 equal columns on tablet/desktop. Single column mobile.
   margin-top: 64px — sandbox .counters exact; = --space-16 ✅.
   padding-top: 48px — sandbox exact; = --space-12 ✅.
   border-top separates from testimonials grid. */
.section-ssp__counters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-ssp__counters--flush {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
@media (min-width: 768px) {
  .section-ssp__counters {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Each stat: reveal stagger via --reveal-delay from inline style. */
.section-ssp__stat {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--reveal-delay, 240ms),
    transform 600ms var(--omn-ease) var(--reveal-delay, 240ms);
}
.is-revealed .section-ssp__stat {
  opacity: 1;
  transform: none;
}


/* ── Outro ── */
.section-ssp__outro {
  width: 100%;
  max-width: var(--width-section);
  margin: var(--space-block) auto 0;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Mobile ── */
@media (max-width: 767px) {
  .section-ssp__counters {
    margin-top: 40px;
    padding-top: 32px;
  }
}


/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-ssp__marker,
  .section-ssp__eyebrow,
  .section-ssp__heading,
  .section-ssp__intro,
  .section-ssp__stat {
    transition: none;
  }
  .section-ssp__marker { opacity: 1; transform: none; }
  .section-ssp__eyebrow,
  .section-ssp__heading,
  .section-ssp__intro { opacity: 1; transform: none; }
  .section-ssp__stat { opacity: 1; transform: none; }
}
</style>
