<!--
  SectionFinalCTA
  ───────────────
  Purpose: P-09 closing conversion section. Centered editorial
  layout with diagonal background image system, bracketed eyebrow,
  large headline, deck body, primary CTA, and optional trust strip.

  Sandbox source: §09 "The close" band in redesign-home.vue
  (lines 491–528). Class: band.band--page.band--diag.section-marked.

  Structural relationship to SectionCenteredStatement (P-04):
    ~95% overlap in inner layout (.centered block pattern).
    Key divergences:
      1. Diagonal background image layer (band--diag) with
         band__image + band__overlay — SectionCenteredStatement has
         no image system.
      2. bgImage / bgImagePos props feed CSS custom properties for
         the image layer.
      3. Trust strip is a first-class concern here (inline, below
         CTA); SectionCenteredStatement defers to #actions slot.
      4. CTA is a first-class prop (ctaLabel/ctaHref/ctaSize) +
         override slot; SectionCenteredStatement defers everything
         to #actions.
    Verdict: separate molecule (distinct semantic + visual contract).

  Trust strip: 3rd inline instance in the sandbox (Hero, PaywallCard,
  FinalCTA). Extraction threshold = 4th instance. Not yet reached.
  Deferred — inline here with AppTrustStrip extraction flagged for
  cleanup commit after all 10 molecules complete.

  Props:
    eyebrow          string — section eyebrow (bracketed)
    heading          string — h2 headline
    headingVariant?  'xl' | 'lg' | 'md' — default 'xl'
                     (sandbox: head--xl for this final section)
    body?            string — optional deck/subhead paragraph
    ctaLabel         string — primary CTA button label
    ctaHref?         string — CTA anchor href (default '#')
    trustItems?      string[] — trust strip items; rendered with
                     sage dots + · separator. Empty → strip hidden.
    bandTone?        'page' | 'primary' — default 'page'
    marker?          string — optional section marker
    bgImage?         string — CSS url() value for diagonal bg image
    bgImagePos?      string — object-position for desktop
    bgImagePosMobile? string — object-position for mobile

  Slots:
    #heading-em    — rich heading emphasis
    #heading-tail  — heading tail text
    #cta           — overrides default AppButton CTA entirely
    #secondary-cta — optional second action below primary
    #footnote      — optional small text below trust strip

  Reveal behavior:
    Section root: useReveal (threshold 0.05) → is-revealed.
    band__image: scale(1.06→1) on reveal (sandbox pattern).
    band__overlay: opacity draw on reveal.
    Marker: 700ms + 200ms delay.
    Eyebrow → heading → body: stagger-2/3/4.
    CTA row: stagger-5 (240ms).
    Trust strip: 300ms — slightly later than CTA for emphasis.

  Token map:
    Section bg (base)      → --omn-bg-page / --omn-bg-primary
    Section border-top     → --omn-border-subtle
    Section padding        → --space-section (clamp 96px→192px)
    Container max-width    → --width-content (880px)
    Heading max-width      → 18ch — sandbox .centered__head exact
    Body max-width         → 50ch — sandbox exact
    Body font-size         → --text-lg (18px)
    Marker gap             → --space-1
    Trust gap              → 10px — sandbox .trust exact
    Trust dot              → 6px circle — sandbox exact
    Trust dot color        → --omn-success
    Trust sep opacity      → 0.4 — sandbox exact
    Trust margin-top       → 28px — sandbox .trust--centered exact
    Stagger tokens         → --omn-stagger-2/3/4/5

  Hardcoded values justified:
    18ch heading max-width  — sandbox .centered__head exact;
                              no token; structural tight measure
    50ch body max-width     — sandbox .centered__body exact;
                              no token; structural prose measure
    18px body font-size     — sandbox exact; = --text-lg ✅
    line-height: 1.55       — sandbox exact; no line-height token
    28px trust margin-top   — sandbox .trust--centered exact;
                              between --space-6 (24px) and
                              --space-8 (32px); structural
    10px trust gap          — sandbox .trust exact; structural
    6px trust dot           — sandbox exact; structural circle
    0.4 sep opacity         — sandbox exact; structural
    0px 2px sep padding     — sandbox exact; structural
    z-index: 2/3            — structural layer order (overlay/container)
    clamp marker position   — SectionLede-exact structural pattern
    700ms / 600ms durations — structural animation values
    1.06 image scale        — band--diag parallax scale; structural
    300ms trust delay       — slightly after stagger-5 (240ms);
                              structural CTA-first emphasis
    line-height: 1.5 mobile — sandbox mobile override exact
    17px mobile body        — sandbox mobile override exact
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import { useReveal } from '~/composables/useReveal'

const props = withDefaults(defineProps<{
  eyebrow: string
  heading: string
  headingVariant?: 'xl' | 'lg' | 'md'
  body?: string
  ctaLabel: string
  ctaHref?: string
  trustItems?: string[]
  bandTone?: 'page' | 'primary'
  marker?: string
  bgImage?: string
  bgImagePos?: string
  bgImagePosMobile?: string
}>(), {
  headingVariant: 'xl',
  body: undefined,
  ctaHref: '#',
  trustItems: undefined,
  bandTone: 'page',
  marker: undefined,
  bgImage: undefined,
  bgImagePos: 'center 60%',
  bgImagePosMobile: 'center 55%',
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-fcta',
  `section-fcta--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'section-fcta--diag': !!props.bgImage },
  { 'is-revealed': isRevealed.value },
])

// CSS custom properties for the diagonal background image system.
const sectionStyle = computed(() => {
  if (!props.bgImage) return {}
  return {
    '--section-img': `url('${props.bgImage}')`,
    '--section-img-pos': props.bgImagePos,
    '--section-img-pos-mobile': props.bgImagePosMobile,
  }
})

const hasTrust = computed(() =>
  Array.isArray(props.trustItems) && props.trustItems.length > 0,
)
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
    :style="sectionStyle"
  >
    <!-- ── Diagonal background layers (optional) ──
         band__image: the actual image, scale-on-reveal parallax.
         band__overlay: gradient vignette over image. -->
    <div v-if="bgImage" class="section-fcta__bg-image" aria-hidden="true" />
    <div v-if="bgImage" class="section-fcta__bg-overlay" aria-hidden="true" />

    <!-- Bronze hairline ::before handled by .is-marked utility -->

    <!-- ── Optional section marker ── -->
    <p v-if="marker" class="section-fcta__marker" aria-hidden="true">
      <span class="section-fcta__marker-no">{{ marker.split(/\s+/)[0] }}</span>
      <span class="section-fcta__marker-name">{{ marker.split(/\s+/).slice(1).join(' ') }}</span>
    </p>

    <div class="section-fcta__container">
      <div class="section-fcta__inner">

        <!-- ── Eyebrow (bracketed) ── -->
        <AppEyebrow
          :bracketed="true"
          class="section-fcta__eyebrow"
        >{{ eyebrow }}</AppEyebrow>

        <!-- ── Heading ── -->
        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-fcta__heading"
        >
          <slot name="heading-em">{{ heading }}</slot>
          <slot name="heading-tail" />
        </AppHeadline>

        <!-- ── Body / deck ── -->
        <p v-if="body" class="section-fcta__body">{{ body }}</p>

        <!-- ── CTA row ── -->
        <div class="section-fcta__cta-row">
          <slot name="cta">
            <AppButton
              variant="primary"
              size="lg"
              :href="ctaHref"
            >{{ ctaLabel }}</AppButton>
          </slot>
          <slot name="secondary-cta" />
        </div>

        <!-- ── Trust strip ──
             Inline pattern: sage dot + text + · separator.
             Instance #3 of 3 inline uses (Hero, PaywallCard,
             FinalCTA). Extraction deferred to cleanup commit
             after all 10 molecules complete. -->
        <p v-if="hasTrust" class="section-fcta__trust">
          <template v-for="(item, i) in trustItems" :key="item">
            <span class="section-fcta__trust-dot" aria-hidden="true" />
            {{ item }}
            <span
              v-if="i < trustItems!.length - 1"
              class="section-fcta__trust-sep"
              aria-hidden="true"
            >·</span>
          </template>
        </p>

        <!-- ── Footnote slot ── -->
        <div v-if="$slots.footnote" class="section-fcta__footnote">
          <slot name="footnote" />
        </div>

      </div>
    </div>

    <!-- ── Outro slot ── -->
    <div v-if="$slots.outro" class="section-fcta__outro">
      <slot name="outro" />
    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   position: relative — for marker, hairline, and bg layers.
   padding: --space-section (clamp 96px→192px) — band rhythm.
   border-top: 1px --omn-border-subtle — band separator. */
.section-fcta {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
  overflow: hidden;
}
.section-fcta--page    { background: var(--omn-bg-page); }
.section-fcta--primary { background: var(--omn-bg-primary); }


/* ── Diagonal background image layer ──
   band__image: absolutely fills section, scales 1.06→1 on reveal
   for subtle parallax entrance. Uses --section-img CSS var set via
   inline style prop.
   z-index: 1 — sits above section bg color, below overlay. */
.section-fcta__bg-image {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: var(--section-img);
  background-size: cover;
  background-position: var(--section-img-pos, center 60%);
  transform: scale(1.06);
  transition: transform 1200ms var(--omn-ease);
}
.is-revealed .section-fcta__bg-image {
  transform: scale(1);
}

/* band__overlay: gradient vignette over image for text legibility.
   Gradient: transparent center → --omn-bg-page at edges.
   z-index: 2 — above image, below container. */
.section-fcta__bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    radial-gradient(
      ellipse 120% 100% at 50% 50%,
      transparent 0%,
      var(--omn-bg-page) 90%
    );
  opacity: 0;
  transition: opacity 800ms var(--omn-ease) 200ms;
}
.is-revealed .section-fcta__bg-overlay {
  opacity: 1;
}

@media (max-width: 767px) {
  .section-fcta__bg-image {
    background-position: var(--section-img-pos-mobile, center 55%);
    transform: none;
  }
  .is-revealed .section-fcta__bg-image {
    transform: none;
  }
  .section-fcta__bg-overlay {
    opacity: 1;
    transition: none;
  }
}


/* ── Section marker ──
   Absolute top-left. Same pattern as all other section molecules. */
.section-fcta__marker {
  position: absolute;
  top: clamp(24px, 4vw, 56px);
  left: clamp(20px, 5vw, 64px);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 700ms var(--omn-ease) 200ms,
    transform 700ms var(--omn-ease) 200ms;
}
.is-revealed .section-fcta__marker {
  opacity: 1;
  transform: none;
}

.section-fcta__marker-no,
.section-fcta__marker-name {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  line-height: 1.4;
}
.section-fcta__marker-no { color: var(--omn-accent); }

@media (max-width: 767px) {
  .section-fcta__marker { display: none; }
}


/* ── Container ──
   max-width: --width-content (880px) — sandbox container--narrow
   exact value, same as SectionCenteredStatement.
   z-index: 3 — above image + overlay layers. */
.section-fcta__container {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: var(--width-content);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Inner centered block ──
   text-align: center — drives all child alignment.
   Mirrors .centered in sandbox. */
.section-fcta__inner {
  text-align: center;
}


/* ── Eyebrow (--omn-stagger-2 = 80ms) ──
   justify-content: center — centers the bracketed inline-flex row. */
.section-fcta__eyebrow {
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-fcta__eyebrow {
  opacity: 1;
  transform: none;
}


/* ── Heading (--omn-stagger-3 = 120ms) ──
   max-width: 18ch — sandbox .centered__head exact tight editorial
   measure for final statement headings. No token equivalent.
   margin: auto centers the block. */
.section-fcta__heading {
  margin: var(--space-4) auto 0;
  max-width: 18ch;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.is-revealed .section-fcta__heading {
  opacity: 1;
  transform: none;
}


/* ── Body / deck (--omn-stagger-4 = 160ms) ──
   font-size: 18px — sandbox .centered__body exact; = --text-lg ✅.
   line-height: 1.55 — sandbox exact; no line-height token.
   max-width: 50ch — sandbox exact prose measure; no token.
   margin: auto centers; bottom clears to CTA row. */
.section-fcta__body {
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--omn-text-secondary);
  max-width: 50ch;
  margin: var(--space-6) auto var(--space-10);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-fcta__body {
  opacity: 1;
  transform: none;
}


/* ── CTA row (--omn-stagger-5 = 240ms) ──
   flex column on mobile (full-width button), row on desktop. */
.section-fcta__cta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-5),
    transform 600ms var(--omn-ease) var(--omn-stagger-5);
}
.is-revealed .section-fcta__cta-row {
  opacity: 1;
  transform: none;
}


/* ── Trust strip ──
   Inline instance #3 of 3. Extraction deferred.
   font-family: --omn-font-mono, 12px, 0.04em — sandbox .trust exact.
   gap: 10px — sandbox exact; structural.
   justify-content: center — sandbox .trust--centered exact.
   margin-top: 28px — sandbox .trust--centered exact; between
   --space-6 (24px) and --space-8 (32px); structural.
   Stagger: 300ms delay — after CTA (stagger-5 = 240ms) for
   CTA-first visual hierarchy. */
.section-fcta__trust {
  font-family: var(--omn-font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--omn-text-tertiary);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 28px 0 0;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 600ms var(--omn-ease) 300ms,
    transform 600ms var(--omn-ease) 300ms;
}
.is-revealed .section-fcta__trust {
  opacity: 1;
  transform: none;
}

/* Sage dot: 6px circle — sandbox .trust__dot / .trust__dot--sage exact. */
.section-fcta__trust-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--omn-success);
  flex-shrink: 0;
}

/* Separator: · at 0.4 opacity with side padding — sandbox exact. */
.section-fcta__trust-sep {
  opacity: 0.4;
  padding: 0 2px;
}


/* ── Footnote ── */
.section-fcta__footnote {
  margin-top: var(--space-6);
  font-size: var(--text-xs);
  color: var(--omn-text-tertiary);
}

/* ── Outro ── */
.section-fcta__outro {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: var(--width-content);
  margin: var(--space-block) auto 0;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Mobile ── */
@media (max-width: 767px) {
  /* font-size: 17px / line-height: 1.5 — sandbox mobile override exact */
  .section-fcta__body {
    font-size: 17px;
    line-height: 1.5;
  }
}


/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-fcta__bg-image,
  .section-fcta__bg-overlay,
  .section-fcta__marker,
  .section-fcta__eyebrow,
  .section-fcta__heading,
  .section-fcta__body,
  .section-fcta__cta-row,
  .section-fcta__trust {
    transition: none;
  }
  .section-fcta__bg-image  { transform: none; }
  .section-fcta__bg-overlay { opacity: 1; }
  .section-fcta__marker    { opacity: 1; transform: none; }
  .section-fcta__eyebrow,
  .section-fcta__heading,
  .section-fcta__body,
  .section-fcta__cta-row,
  .section-fcta__trust     { opacity: 1; transform: none; }
}
</style>
