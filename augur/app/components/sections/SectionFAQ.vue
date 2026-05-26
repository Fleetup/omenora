<!--
  SectionFAQ
  ──────────
  Purpose: P-08 FAQ section. Section header (eyebrow + heading +
  optional intro) + accordion Q&A list using native <details>/
  <summary> for built-in accessibility and zero JS state.

  Sandbox source: §08 "Questions" band in redesign-home.vue
  (lines 459–489). Container: container--prose (max-width 720px).

  Disclosure mechanism: NATIVE <details>/<summary>.
  Confirmed in sandbox: `<details class="faq__item">` +
  `<summary class="faq__q">`. No custom JS accordion.
  Browser handles open/close and keyboard (Tab/Enter/Space).
  Native one-at-a-time behavior: browser default (multiple
  items can be open; true one-at-a-time requires name attribute
  on <details> — see SD3 note).

  Structure:
    <section> root (uses is-marked for optional hairline)
      <p> section-marker (optional)
      <div> container (max-width 720px)
        <header> header — AppEyebrow + AppHeadline + optional intro
        <div> faq list
          <details class="section-faq__item"> × N
            <summary class="section-faq__q">
              <span> question text
              <span aria-hidden> + indicator (rotates 45° on open)
            <p class="section-faq__a"> answer text

  Props:
    eyebrow          string — section eyebrow
    heading          string — section heading
    headingVariant?  'xl' | 'lg' | 'md' — default 'md' (sandbox
                     uses head--md for this section)
    introBody?       string — optional intro paragraph
    items            FaqItem[] — required Q+A pairs
    bandTone?        'page' | 'primary' — default 'primary'
                     (sandbox: band--primary)
    marker?          string — optional section marker text

  FaqItem interface:
    interface FaqItem {
      question: string;
      answer:   string;  // plain text; no sanitized HTML
    }

  Slots:
    #heading-em   — rich heading emphasis
    #heading-tail — heading tail
    #outro        — content after the FAQ list

  Reveal behavior:
    Section root: useReveal (threshold 0.08) → is-revealed.
    Header elements: stagger via --omn-stagger-* tokens.
    FAQ items: opacity+translateY; stagger via --reveal-delay
    inline style: 40 × i ms — sandbox exact.

  Smooth expand (SD5):
    interpolate-size: allow-keywords on .section-faq__a enables
    `height: auto` transitioning. Transition: height 280ms ease
    + overflow: clip. Fallback: instant expand on older browsers
    (behavior correct, just no animation).
    Reduced-motion: no transition, instant.

  Token map:
    Section bg         → bandTone modifier (--omn-bg-primary or page)
    Section border-top → --omn-border-subtle
    FAQ list margin-top → 56px — sandbox .faq exact
    Item border        → --omn-border-subtle
    Question font      → --omn-font-display
    Question color     → --omn-text-primary
    Chevron color      → --omn-accent
    Chevron font       → --omn-font-mono
    Answer color       → --omn-text-secondary
    Transition         → --omn-ease

  Hardcoded values justified:
    max-width: 720px     — sandbox .container--prose exact;
                           between --width-prose (640px) and
                           --width-content (880px); no token match
    faq margin-top: 56px — sandbox .faq exact; between --space-12
                           (48px) and --space-16 (64px); structural
    item padding: 24px 0 — sandbox .faq__item exact;
                           = --space-6 ✅ token
    gap: 24px            — sandbox .faq__q exact; = --space-6 ✅
    q font-size: 18px    — sandbox exact; = --text-lg ✅ token
    q tracking: -0.015em — sandbox exact; no token
    q font-weight: 500   — sandbox exact; structural
    chev font-size: 22px — sandbox exact; between --text-lg (18px)
                           and display sizes; structural
    chev transition 250ms — sandbox exact; structural
    a font-size: 16px    — sandbox exact; --text-md candidate;
                           if --text-md = 16px ✅
    a line-height: 1.65  — sandbox exact; no token
    a margin-top: 16px   — sandbox exact; = --space-4 ✅ token
    a max-width: 62ch    — sandbox exact; structural prose width
    item mobile: 20px    — sandbox mobile override exact
    stagger: 40ms × i   — sandbox exact per-item stagger
    reveal translateY    — animation; structural

  §8 compliance: zero shadows; square corners.
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import { useReveal } from '~/composables/useReveal'

export interface FaqItem {
  question: string
  answer: string
}

const props = withDefaults(defineProps<{
  eyebrow: string
  heading: string
  headingVariant?: 'xl' | 'lg' | 'md'
  introBody?: string
  items: FaqItem[]
  bandTone?: 'page' | 'primary'
  marker?: string
}>(), {
  headingVariant: 'md',
  introBody: undefined,
  bandTone: 'primary',
  marker: undefined,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.08 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-faq',
  `section-faq--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'is-revealed': isRevealed.value },
])

// Per-item reveal stagger: 40ms × i — sandbox exact.
function itemRevealDelay(index: number): string {
  return `${40 * index}ms`
}
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
  >
    <!-- Bronze hairline ::before handled by .is-marked utility -->

    <!-- ── Optional section marker ── -->
    <p v-if="marker" class="section-faq__marker" aria-hidden="true">
      <span class="section-faq__marker-no">{{ marker.split(/\s+/)[0] }}</span>
      <span class="section-faq__marker-name">{{ marker.split(/\s+/).slice(1).join(' ') }}</span>
    </p>

    <div class="section-faq__container">

      <!-- ── Section header ── -->
      <header class="section-faq__header">
        <AppEyebrow class="section-faq__eyebrow">{{ eyebrow }}</AppEyebrow>
        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-faq__heading"
        >
          <slot name="heading-em">{{ heading }}</slot>
          <slot name="heading-tail" />
        </AppHeadline>
        <p v-if="introBody" class="section-faq__intro">{{ introBody }}</p>
      </header>

      <!-- ── FAQ accordion list ──
           Native <details>/<summary> for built-in accessibility.
           Each <details> is the item wrapper (matches sandbox).
           Browser handles open/close and keyboard interaction.
           SD3 note: add name="faq-group" to <details> for
           exclusive-accordion (one open at a time) behavior —
           available in modern browsers. Not set by default to
           preserve sandbox behavior (multiple open allowed). -->
      <div class="section-faq__list">
        <details
          v-for="(item, i) in items"
          :key="item.question"
          class="section-faq__item"
          :style="{ '--reveal-delay': itemRevealDelay(i) }"
        >
          <summary class="section-faq__q">
            <span>{{ item.question }}</span>
            <span class="section-faq__chev" aria-hidden="true">+</span>
          </summary>
          <p class="section-faq__a">{{ item.answer }}</p>
        </details>
      </div>

    </div>

    <!-- ── Outro slot ── -->
    <div v-if="$slots.outro" class="section-faq__outro">
      <slot name="outro" />
    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   position: relative — for .is-marked ::before and marker positioning.
   padding: --space-section (clamp 96px→192px) — band rhythm. */
.section-faq {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-faq--page    { background: var(--omn-bg-page); }
.section-faq--primary { background: var(--omn-bg-primary); }


/* ── Section marker ── */
.section-faq__marker {
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
.is-revealed .section-faq__marker { opacity: 1; transform: none; }

.section-faq__marker-no,
.section-faq__marker-name {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  line-height: 1.4;
}

@media (max-width: 767px) {
  .section-faq__marker { display: none; }
}


/* ── Container ──
   max-width: 720px — sandbox .container--prose exact; between
   --width-prose (640px) and --width-content (880px); no token match.
   Justified inline as sandbox-exact structural value. */
.section-faq__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Header ── */
.section-faq__eyebrow {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.section-faq__heading {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.section-faq__intro {
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
.is-revealed .section-faq__eyebrow,
.is-revealed .section-faq__heading,
.is-revealed .section-faq__intro {
  opacity: 1;
  transform: none;
}


/* ── FAQ list wrapper ──
   margin-top: 56px — sandbox .faq exact; structural.
   border-top: first item hairline — sandbox .faq exact.
   The list has a top border; each item has a border-bottom. */
.section-faq__list {
  margin-top: 56px;
  border-top: 1px solid var(--omn-border-subtle);
}


/* ── FAQ item (<details> element) ──
   padding: 24px 0 — sandbox exact; = --space-6.
   border-bottom: item separator hairline — sandbox exact.
   Reveal stagger via --reveal-delay inline style. */
.section-faq__item {
  border-bottom: 1px solid var(--omn-border-subtle);
  padding: var(--space-6) 0;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 500ms var(--omn-ease) var(--reveal-delay, 0ms),
    transform 500ms var(--omn-ease) var(--reveal-delay, 0ms);
}
.is-revealed .section-faq__item {
  opacity: 1;
  transform: none;
}


/* ── Summary (question row) ──
   list-style: none + ::-webkit-details-marker suppress the
   default browser disclosure triangle.
   flex justify-between: question left, chevron right.
   gap: 24px — sandbox exact; = --space-6.
   q font-size: 18px = --text-lg ✅. tracking: -0.015em — no token.
   font-weight: 500 — sandbox exact. */
.section-faq__q {
  list-style: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: var(--space-6);
  align-items: center;
  font-family: var(--omn-font-display);
  font-weight: 500;
  font-size: var(--text-lg);
  color: var(--omn-text-primary);
  letter-spacing: -0.015em;
  user-select: none;
}
/* Suppress webkit built-in disclosure triangle. */
.section-faq__q::-webkit-details-marker { display: none; }
/* Suppress Firefox built-in disclosure triangle. */
.section-faq__q::marker { display: none; }


/* ── Chevron indicator ──
   + glyph; mono weight 300; 22px — sandbox exact structural size.
   Accent color. Rotates 45deg to × on open.
   transition: 250ms — sandbox exact.
   flex-shrink: 0 — prevents squashing on long questions. */
.section-faq__chev {
  font-family: var(--omn-font-mono);
  font-weight: 300;
  font-size: 22px;
  line-height: 1;
  color: var(--omn-accent);
  transition: transform 250ms var(--omn-ease);
  flex-shrink: 0;
}
.section-faq__item[open] .section-faq__chev {
  transform: rotate(45deg);
}


/* ── Answer (<p> inside <details>) ──
   Smooth expand via interpolate-size: allow-keywords +
   height 0→auto transition. Overflow: clip hides content during
   transition. Fallback: instant expand on unsupported browsers.
   font-size: 16px = --text-md ✅ (if 16px).
   line-height: 1.65 — sandbox exact; no token.
   margin-top: 16px — sandbox exact; = --space-4.
   max-width: 62ch — sandbox exact; structural prose limit. */
.section-faq__a {
  /* Modern smooth height transition. */
  interpolate-size: allow-keywords;
  overflow: clip;
  height: 0;
  transition: height 280ms var(--omn-ease);

  font-size: var(--text-md, 16px);
  line-height: 1.65;
  color: var(--omn-text-secondary);
  margin: var(--space-4) 0 0;
  max-width: 62ch;
}
/* When <details> is open, animate height to auto. */
.section-faq__item[open] .section-faq__a {
  height: auto;
}


/* ── Outro ── */
.section-faq__outro {
  width: 100%;
  max-width: 720px;
  margin: var(--space-block) auto 0;
  padding: 0 clamp(20px, 5vw, 64px);
}


/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-faq__marker,
  .section-faq__eyebrow,
  .section-faq__heading,
  .section-faq__intro,
  .section-faq__item {
    transition: none;
  }
  .section-faq__marker { opacity: 1; transform: none; }
  .section-faq__eyebrow,
  .section-faq__heading,
  .section-faq__intro { opacity: 1; transform: none; }
  .section-faq__item { opacity: 1; transform: none; }
  /* Answer: instant expand, no height transition. */
  .section-faq__a {
    interpolate-size: allow-keywords;
    transition: none;
  }
  .section-faq__item[open] .section-faq__a {
    height: auto;
  }
  .section-faq__chev {
    transition: none;
  }
}


/* ── Mobile ── */
@media (max-width: 767px) {
  /* padding: 20px 0 — sandbox .faq__item mobile override exact. */
  .section-faq__item {
    padding: 20px 0;
  }
}
</style>
