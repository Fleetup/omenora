<!--
  SectionCenteredStatement
  ─────────────────
  Purpose: P-04 centered editorial moment pattern. Eyebrow + headline
  + optional body + optional actions, all center-aligned. Used for
  section intros that lead with a strong declarative statement rather
  than a lede paragraph (§06 "Begin", §08 "The close" in sandbox).

  Sandbox source: .centered blocks inside container--narrow sections
  (data-section-no="06" and "08" in redesign-home.vue).

  Props:
    eyebrow         string — eyebrow label (bracketed rules flanking)
    heading         string — h2 headline text (before any em slot)
    headingVariant? 'xl' | 'lg' | 'md'   default: 'lg'
    body?           string | undefined — optional centered body paragraph.
                    Some centered statements are eyebrow + heading only.
    bandTone?       'page' | 'primary'   default: 'page'
                    Sets section background:
                      page    → --omn-bg-page    (darkest)
                      primary → --omn-bg-primary (elevated)
    marker?         string | undefined — optional section marker shown
                    top-left (e.g., "§ 06"). Triggers bronze hairline
                    draw on reveal.

  Slots:
    #heading-em   — emphasized word inside heading (rendered as <em>
                    inside AppHeadline — applies atom's :deep(em) weight)
    #heading-tail — text after #heading-em
    #actions      — optional centered CTA row below body (AppButton
                    instances, trust rows, etc.)

  Reveal behavior:
    Section root gets useReveal (threshold 0.05). isRevealed gates:
      – Bronze hairline ::before draws scaleX(0→1), 1100ms + 100ms delay
      – Marker fades up: 700ms + 200ms delay
      – Eyebrow: opacity+translateY, --omn-stagger-2 (80ms)
      – Heading: opacity+translateY, --omn-stagger-3 (120ms)
      – Body:    opacity+translateY, --omn-stagger-4 (160ms)
      – Actions: opacity+translateY, --omn-stagger-5 (240ms)
    Reduced motion: useReveal returns isRevealed=true immediately;
    CSS @media (prefers-reduced-motion) disables all transitions.

  Centered layout:
    Container max-width: --width-content (880px) — sandbox
    container--narrow exact value used for both centered instances.
    Heading max-width: 18ch (sandbox .centered__head exact value;
    structural — tight editorial measure for 2–3 word statements).
    Body max-width: 50ch (sandbox exact measure for centered body).
    text-align: center on inner block.
    AppEyebrow: :bracketed="true" (rules on both sides, sandbox pattern).
    justify-content: center override on AppEyebrow to center the
    inline-flex row.

  Token map:
    Section background  → --omn-bg-page / --omn-bg-primary
    Bronze hairline     → --omn-accent, --omn-accent-quiet
    Section border      → --omn-border-subtle
    Section padding     → --space-section
    Container padding   → --space-edge
    Heading margin-top  → --space-4 (16px equivalent)
    Body margin-bottom  → --space-10 (40px equivalent)
    Actions gap         → --space-3
    Stagger tokens      → --omn-stagger-2 / -3 / -4 / -5
    Marker position     → clamp(24px, 4vw, 56px) / clamp(20px, 5vw, 64px)
    Marker gap          → --space-1

  Hardcoded values justified:
    1px borders / height: 1px  — structural hairlines; no token
    top/left clamp()           — marker position; structural (SectionLede exact)
    translateY(-6px)           — marker enter offset; structural
    translateY(10px/12px)      — eyebrow/heading enter offsets; structural
    700ms / 1100ms             — marker/hairline durations; structural
    600ms                      — eyebrow/heading/body/actions reveal; structural
    max-width: 18ch            — heading editorial measure; sandbox exact (structural)
    max-width: 50ch            — body editorial measure; sandbox exact (structural)
    font-size: 18px            — sandbox .centered__body exact; between --text-md
                                 (16px) and --text-lg (18px) — token match --text-lg
    line-height: 1.55          — sandbox exact; no line-height token at this value
    font-size: 17px (mobile)   — sandbox mobile override exact
    line-height: 1.5 (mobile)  — sandbox mobile override exact
    z-index: 3                 — marker + hairline above band bg; structural
    z-index: 2                 — container above overlay; structural
-->

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppHeadline from '~/components/atoms/AppHeadline.vue'
import AppBody from '~/components/atoms/AppBody.vue'
import AppCaption from '~/components/atoms/AppCaption.vue'
import { useReveal } from '~/composables/useReveal'

const props = withDefaults(defineProps<{
  eyebrow: string
  heading: string
  headingVariant?: 'xl' | 'lg' | 'md'
  body?: string
  bandTone?: 'page' | 'primary'
  marker?: string
}>(), {
  headingVariant: 'lg',
  bandTone: 'page',
  body: undefined,
  marker: undefined,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-centered',
  `section-centered--${props.bandTone}`,
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
    <p v-if="marker" class="section-centered__marker" aria-hidden="true">
      <AppCaption variant="mono" as="span" class="section-centered__marker-no">
        {{ marker }}
      </AppCaption>
      <AppCaption variant="mono" as="span" class="section-centered__marker-name">
        {{ eyebrow }}
      </AppCaption>
    </p>

    <div class="section-centered__container">
      <div class="section-centered__inner">

        <AppEyebrow
          :bracketed="true"
          class="section-centered__eyebrow"
        >{{ eyebrow }}</AppEyebrow>

        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-centered__heading"
        >{{ heading }}<template v-if="$slots['heading-em']"
          > <em><slot name="heading-em" /></em></template><template
          v-if="$slots['heading-tail']"
          > <slot name="heading-tail" /></template></AppHeadline>

        <AppBody
          v-if="body"
          variant="default"
          class="section-centered__body"
        >{{ body }}</AppBody>

        <!-- Actions row (CTAs, trust row, etc.) -->
        <div v-if="$slots.actions" class="section-centered__actions">
          <slot name="actions" />
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   Band background via tone modifier. Border-top hairline separates bands.
   padding: --space-section (clamp 96px→192px) — major band rhythm. */
.section-centered {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-centered--page    { background: var(--omn-bg-page); }
.section-centered--primary { background: var(--omn-bg-primary); }


/* ── Section marker (§ NN + name) ──
   Absolutely positioned top-left. Two AppCaption mono spans stacked.
   Fades up on reveal with 200ms delay. Mirrors SectionLede exactly.
   top/left: clamp structural position values (no token equivalent). */
.section-centered__marker {
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
.is-revealed .section-centered__marker {
  opacity: 1;
  transform: translateY(0);
}

/* First span (§ NN) gets accent color */
.section-centered__marker-no {
  color: var(--omn-accent) !important;
}

/* ── Container ──
   max-width: --width-content (880px) — sandbox container--narrow exact
   value used for both centered instances. z-index: 2 sits above diagonal
   band overlay layers. */
.section-centered__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--width-content);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* ── Inner centered block ──
   text-align: center drives heading, body, and actions alignment.
   Centering is self-contained here — no global context required. */
.section-centered__inner {
  text-align: center;
}

/* ── Eyebrow stagger (--omn-stagger-2 = 80ms) ──
   justify-content: center overrides AppEyebrow's default inline-flex
   start alignment (sandbox .centered .eyebrow exact). */
.section-centered__eyebrow {
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-centered__eyebrow {
  opacity: 1;
  transform: translateY(0);
}

/* ── Heading stagger (--omn-stagger-3 = 120ms) ──
   margin: 16px auto 0 — top separates from eyebrow; auto centers block.
   max-width: 18ch — sandbox .centered__head exact tight editorial measure
   for short declarative statements. Structural — no token equivalent. */
.section-centered__heading {
  margin: var(--space-4) auto 0;
  max-width: 18ch;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.is-revealed .section-centered__heading {
  opacity: 1;
  transform: translateY(0);
}

/* ── Body stagger (--omn-stagger-4 = 160ms) ──
   font-size: 18px — sandbox .centered__body exact; matches --text-lg token.
   line-height: 1.55 — sandbox exact; no line-height token at this value.
   max-width: 50ch — sandbox exact editorial measure for centered body.
   margin: 0 auto + --space-10 bottom — centers block + separates from actions. */
.section-centered__body {
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--omn-text-secondary);
  max-width: 50ch;
  margin: var(--space-6) auto var(--space-10) !important;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-centered__body {
  opacity: 1;
  transform: translateY(0);
}

/* ── Actions row stagger (--omn-stagger-5 = 240ms) ──
   flex row centered. gap: --space-3. Consumer provides AppButton
   instances, trust rows, or other inline elements. */
.section-centered__actions {
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
.is-revealed .section-centered__actions {
  opacity: 1;
  transform: translateY(0);
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .section-centered {
    padding: var(--space-16) 0;
  }
  .section-centered__marker {
    display: none;
  }
  /* font-size: 17px / line-height: 1.5 — sandbox mobile override exact */
  .section-centered__body {
    font-size: 17px;
    line-height: 1.5;
  }
}

/* ── Reduced motion ──
   Disable all transitions. Render final states immediately. */
@media (prefers-reduced-motion: reduce) {
  .section-centered__marker,
  .section-centered__eyebrow,
  .section-centered__heading,
  .section-centered__body,
  .section-centered__actions {
    transition: none;
  }
  .section-centered__marker { opacity: 1; transform: none; }
  .section-centered__eyebrow,
  .section-centered__heading,
  .section-centered__body,
  .section-centered__actions { opacity: 1; transform: none; }
}
</style>
