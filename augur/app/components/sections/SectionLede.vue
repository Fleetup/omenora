<!--
  SectionLede
  ─────────────────
  Purpose: P-02 "introduce a section" pattern. Eyebrow + display
  headline + lede paragraph with optional drop cap. Used after the
  hero to establish a section's premise in a single composed block.

  Sandbox source: .lede block inside band sections (P-02, P-03).
  The outer band (background, diagonal mask, overlay) is not part
  of this molecule — SectionLede is a self-contained content block
  that slots into any band tone ('page' | 'primary').

  Props:
    eyebrow          string — eyebrow label text
    heading          string — headline text (supports <em> via slot)
    headingVariant   'xl' | 'lg' | 'md'   default: 'lg'
    body             string — lede paragraph text
    dropCap          boolean — bronze drop cap on first letter
                               default: true
    bandTone         'page' | 'primary'   default: 'primary'
                     Sets section background:
                       page    → --omn-bg-page    (darkest)
                       primary → --omn-bg-primary (elevated)
    marker           string | undefined — optional section marker
                     shown top-left of section (e.g., "§ 02").
                     Triggers section-marker reveal animation and
                     bronze ::before hairline draw.

  Slots:
    #heading-em     — the emphasized word inside the heading.
                      Rendered as <em> inside AppHeadline so that
                      the atom's :deep(em) styling (weight 500)
                      applies. Inserted after the heading prop text.
                      If used, heading prop should be the text *up to*
                      the em word; any trailing text goes in
                      #heading-tail slot.
    #heading-tail   — text after the #heading-em word (e.g., " — not
                      selected from a database."). Optional.
    #actions        — CTA row below the lede body.
    #body-extra     — follow-up paragraph block below the main lede
                      (rendered as a .section-lede__text-block).

  Reveal behavior:
    Section root gets useReveal. isRevealed flips to true on
    intersection (threshold 0.05). Children stagger via CSS:
      – marker: 200ms delay
      – eyebrow: --omn-stagger-2 (80ms)
      – heading: --omn-stagger-3 (120ms)
      – body: --omn-stagger-4 (160ms)
    Section ::before hairline draws (scaleX 0→1) on isRevealed.
    Reduced motion: useReveal returns isRevealed=true immediately;
    CSS @media (prefers-reduced-motion) also disables transitions.

  Usage:
    <SectionLede
      eyebrow="The method"
      heading="Your chart,"
      body="Most apps return one of twelve templates…"
      :drop-cap="true"
      band-tone="page"
      marker="§ 02"
    >
      <template #heading-em>computed</template>
      <template #heading-tail>— not selected from a database.</template>
      <template #actions>
        <AppButton variant="ghost" href="#paywall">
          Read what your chart says →
        </AppButton>
      </template>
    </SectionLede>

  Token sources:
    Section marker:  --omn-font-mono, --omn-text-tertiary, --omn-accent
    Hairline:        --omn-accent, --omn-accent-quiet, --omn-ease
    Lede block:      max-width 720px (sandbox .lede value, structural)
    Spacing:         --space-block (between lede and follow-up block)
    Stagger delays:  --omn-stagger-2 through --omn-stagger-4
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
  body: string
  dropCap?: boolean
  bandTone?: 'page' | 'primary'
  marker?: string
}>(), {
  headingVariant: 'lg',
  dropCap: true,
  bandTone: 'primary',
  marker: undefined,
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionClass = computed(() => [
  'section-lede',
  `section-lede--${props.bandTone}`,
  { 'is-marked': !!props.marker },
  { 'is-revealed': isRevealed.value },
])
</script>

<template>
  <section
    :ref="setRevealEl"
    :class="sectionClass"
  >
    <!-- Bronze hairline ::before is CSS-only, gated on .is-revealed -->

    <!-- Section marker — § NN + section name, top-left of band -->
    <p v-if="marker" class="section-lede__marker" aria-hidden="true">
      <AppCaption variant="mono" as="span" class="section-lede__marker-no">
        {{ marker }}
      </AppCaption>
      <AppCaption variant="mono" as="span" class="section-lede__marker-name">
        {{ eyebrow }}
      </AppCaption>
    </p>

    <div class="section-lede__container">

      <!-- Lede block: eyebrow → heading → body -->
      <div class="section-lede__lede">

        <AppEyebrow :rule="true" class="section-lede__eyebrow">
          {{ eyebrow }}
        </AppEyebrow>

        <AppHeadline
          :variant="headingVariant"
          as="h2"
          class="section-lede__heading"
        >{{ heading }}<template v-if="$slots['heading-em']"
          > <em><slot name="heading-em" /></em></template><template
          v-if="$slots['heading-tail']"
          > <slot name="heading-tail" /></template></AppHeadline>

        <AppBody
          variant="lede"
          :drop-cap="dropCap"
          class="section-lede__body"
        >{{ body }}</AppBody>

        <!-- Actions row (optional) -->
        <div v-if="$slots.actions" class="section-lede__actions">
          <slot name="actions" />
        </div>

      </div>

      <!-- Follow-up content block (optional extra paragraph / text-block) -->
      <div v-if="$slots['body-extra']" class="section-lede__extra">
        <slot name="body-extra" />
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   Provides band background via tone modifier. No overflow:hidden here —
   the diagonal band system (mask + image) belongs to SectionHero when
   combined. SectionLede can be used standalone or embedded.
   padding uses --space-section (clamp 96px→192px) for major band rhythm. */
.section-lede {
  position: relative;
  padding: var(--space-section) 0;
  border-top: 1px solid var(--omn-border-subtle);
}
.section-lede--page    { background: var(--omn-bg-page); }
.section-lede--primary { background: var(--omn-bg-primary); }


/* ── Section marker (§ NN + name) ──
   Absolutely positioned top-left. Two AppCaption mono spans stacked.
   Fades up on reveal with 200ms delay (sandbox exact timing).
   clamp positions: top clamp(24px, 4vw, 56px), left clamp(20px, 5vw, 64px).
   These are structural position values — no token equivalent. */
.section-lede__marker {
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
.is-revealed .section-lede__marker {
  opacity: 1;
  transform: translateY(0);
}

/* First span (§ NN) gets accent color; name span stays tertiary via AppCaption */
.section-lede__marker-no {
  color: var(--omn-accent) !important;
}

/* ── Container ──
   Centers content with consistent horizontal padding.
   max-width: --width-content (880px) — lede heads need room;
   the prose body gets max-width via AppBody's own or .section-lede__body below. */
.section-lede__container {
  width: 100%;
  max-width: var(--width-content);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* ── Lede block ──
   max-width: 720px (sandbox .lede exact value — structural editorial width).
   margin-bottom: --space-block separates from follow-up block if present. */
.section-lede__lede {
  max-width: 720px;
  margin-bottom: var(--space-block);
}

/* ── Eyebrow stagger ── */
.section-lede__eyebrow {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-2),
    transform 600ms var(--omn-ease) var(--omn-stagger-2);
}
.is-revealed .section-lede__eyebrow {
  opacity: 1;
  transform: translateY(0);
}

/* ── Heading stagger ── */
.section-lede__heading {
  margin-top: var(--space-5);
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-3),
    transform 600ms var(--omn-ease) var(--omn-stagger-3);
}
.is-revealed .section-lede__heading {
  opacity: 1;
  transform: translateY(0);
}

/* ── Body stagger ──
   max-width: 56ch matches sandbox .lede__body max-width.
   AppBody provides font/size/lh/tracking; we add max-width + margin override. */
.section-lede__body {
  max-width: 56ch;
  margin-top: var(--space-6) !important;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--omn-ease) var(--omn-stagger-4),
    transform 600ms var(--omn-ease) var(--omn-stagger-4);
}
.is-revealed .section-lede__body {
  opacity: 1;
  transform: translateY(0);
}

/* ── Actions row ── */
.section-lede__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-8);
}

/* ── Follow-up block (body-extra slot) ──
   Receives arbitrary content from consumer. Separated from lede by
   --space-block gap (already on .section-lede__lede margin-bottom).
   max-width: 640px (sandbox .text-block value — prose measure). */
.section-lede__extra {
  max-width: 640px;
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .section-lede {
    padding: var(--space-16) 0;
  }
  .section-lede__marker {
    display: none;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .section-lede__marker,
  .section-lede__eyebrow,
  .section-lede__heading,
  .section-lede__body {
    transition: none;
  }
  .section-lede__marker { opacity: 1; transform: none; }
  .section-lede__eyebrow,
  .section-lede__heading,
  .section-lede__body { opacity: 1; transform: none; }
}
</style>
