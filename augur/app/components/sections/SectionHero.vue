<!--
  SectionHero
  ─────────────────
  Purpose: Full-bleed hero band with atmospheric diagonal-masked background,
  display headline with animated bronze underline on an emphasized word,
  deck text, and a CTA row. First molecule in the design system.

  Architecture: hybrid API — semantic content via props, decorative chrome
  via named slots. Composed of sandbox-aligned atoms. All animations are
  CSS transitions gated on .is-revealed (applied via useReveal composable).

  Props:
    displayLines  string[]  (required)
      Each entry becomes one .hero__display-line block inside the <h1>.
      The last entry receives .hero__display-line--quiet (secondary color).
      To use an animated em on a word, wrap it in <em> in the string — but
      since props are plain strings, the emphasized word is provided via the
      #em slot instead (see below). For simple use without em animation,
      plain text lines work without the slot.

    subhead  string  (required)
      Deck text rendered as AppSubhead below the h1.

    image  string | undefined  (optional)
      Absolute URL or path to the atmospheric background image.
      Bound to --section-img CSS variable. If absent, no background image
      is shown; the dark base color is the background.

    imagePos  string  (optional, default: 'center 62%')
      CSS background-position for the image layer (desktop).

    imagePosM  string  (optional, default: 'center 62%')
      CSS background-position for mobile (set via @media override in CSS).

  Slots:
    #vol        — volume notation line (e.g. "Vol. 001 · MMXXVI")
                  Rendered as AppCaption variant="mono" if provided.
    #eyebrow    — eyebrow text (e.g. "The complete natal reading")
                  Rendered as AppEyebrow :rule="true" if provided.
    #em         — the emphasized word inside the display headline.
                  Rendered as .hero__display-em with animated ::after underline.
                  Appears at end of the second-to-last display line.
    #actions    — CTA row (one or two AppButton instances).
    #trust      — trust/social proof line below the CTA row.

  Reveal behavior:
    The section root element gets :ref="revealEl" and .is-revealed when
    the section enters the viewport. All enter animations are CSS transitions
    that respond to .is-revealed on the section or .hero__content descendants.
    useReveal defaults: threshold 0.05, rootMargin '0px 0px -10% 0px', once.

  Animated bronze underline:
    .hero__display-em::after uses transform: scaleX(0→1) on .is-revealed.
    Reduced motion: @media (prefers-reduced-motion: reduce) sets the
    transition to none and scaleX to 1 immediately.

  Usage:
    <SectionHero
      :display-lines="['Astrology that', 'feels', 'not generic.']"
      subhead="Birth-chart insights..."
      image="/images/hero/Cosmic-gold-ascension.webp"
      image-pos="right 50%"
    >
      <template #vol>Vol.&nbsp;001&nbsp;·&nbsp;MMXXVI</template>
      <template #eyebrow>The complete natal reading</template>
      <template #em>personal</template>
      <template #actions>
        <AppButton variant="cta" href="#paywall">Start your reading</AppButton>
        <AppButton variant="ghost" href="#traditions">Explore compatibility</AppButton>
      </template>
      <template #trust>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        12,400 charts written
      </template>
    </SectionHero>

  Out of scope (molecule concern, NOT this atom):
    – Motion-v enter animations (staggered opacity/y — sandbox uses Motion
      component; SectionHero uses CSS-only reveal for production build)
    – useMagnetic directive on buttons
    – Section marker hairline animation (.section-marked system)
-->

<script setup lang="ts">
import { computed, useSlots, type ComponentPublicInstance } from 'vue'
import AppEyebrow from '~/components/atoms/AppEyebrow.vue'
import AppSubhead from '~/components/atoms/AppSubhead.vue'
import AppCaption from '~/components/atoms/AppCaption.vue'
import { useReveal } from '~/composables/useReveal'

const props = withDefaults(defineProps<{
  displayLines: string[]
  subhead: string
  image?: string
  imagePos?: string
  imagePosM?: string
}>(), {
  image: undefined,
  imagePos: 'center 62%',
  imagePosM: 'center 62%',
})

const { el: revealEl, isRevealed } = useReveal({ threshold: 0.05 })

function setRevealEl(el: Element | ComponentPublicInstance | null) {
  revealEl.value = el instanceof HTMLElement ? el : null
}

const sectionStyle = computed(() => ({
  ...(props.image ? { '--section-img': `url('${props.image}')` } : {}),
  '--section-img-pos': props.imagePos,
  '--section-img-pos-mobile': props.imagePosM,
}))

const hasEm = computed(() => !!useSlots().em)
</script>

<template>
  <section
    :ref="setRevealEl"
    class="section-hero"
    :class="{ 'is-revealed': isRevealed }"
    :style="sectionStyle"
    aria-label="Hero"
  >
    <!-- Atmospheric background layers (aria-hidden — purely decorative) -->
    <div v-if="image" class="hero-band__image" aria-hidden="true" />
    <div v-if="image" class="hero-band__overlay" aria-hidden="true" />
    <!-- Bronze diagonal seam glow (::after pseudo on section via CSS) -->

    <div class="hero__container">
      <div class="hero__content">

        <!-- Vol. notation — optional editorial marker -->
        <AppCaption
          v-if="$slots.vol"
          variant="mono"
          class="hero__vol"
        ><slot name="vol" /></AppCaption>

        <!-- Eyebrow — optional category label -->
        <AppEyebrow
          v-if="$slots.eyebrow"
          :rule="true"
          class="hero__eyebrow"
        ><slot name="eyebrow" /></AppEyebrow>

        <!-- Display headline -->
        <h1 class="hero__display">
          <template v-for="(line, i) in displayLines" :key="i">
            <span
              class="hero__display-line"
              :class="{ 'hero__display-line--quiet': i === displayLines.length - 1 }"
            >
              <!--
                Second-to-last line: inject the #em slot (animated word)
                after the line text if provided. The consumer writes the line
                text up to the em in displayLines[n-2], then the em word comes
                from the #em slot, then any trailing punctuation should be part
                of the slot content or the next line.
                For simplicity: #em renders after line i === displayLines.length - 2.
              -->
              {{ line }}<template v-if="hasEm && i === displayLines.length - 2">
                {{ ' ' }}<span
                  class="hero__display-em"
                  :class="{ 'hero__display-em--lit': isRevealed }"
                ><slot name="em" /></span></template>
            </span>
          </template>
        </h1>

        <!-- Deck text -->
        <AppSubhead class="hero__subhead">{{ subhead }}</AppSubhead>

        <!-- CTA row -->
        <div v-if="$slots.actions" class="hero__cta-row">
          <slot name="actions" />
        </div>

        <!-- Trust / social proof -->
        <p v-if="$slots.trust" class="hero__trust">
          <slot name="trust" />
        </p>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section root ──
   Full-bleed band with diagonal atmospheric background system.
   Position relative + overflow hidden contain the absolute image/overlay layers.
   Background: --omn-bg-page (darkest surface) as fallback when no image. */
.section-hero {
  position: relative;
  overflow: hidden;
  background: var(--omn-bg-page);
  border-top: 0;
  /* Fluid vertical sizing — hero needs more real estate than regular bands.
     clamp: 820px min, 100vh preferred, 1100px max. */
  min-height: clamp(820px, 100vh, 1100px);
  padding-top: clamp(96px, 12vw, 160px);
  padding-bottom: clamp(140px, 18vw, 240px);
}

/* ── Bronze diagonal seam glow (::after) ──
   Warm accent band along the 168° diagonal, revealed on scroll.
   rgba values are structural to the bronze glow effect — no token. */
.section-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    168deg,
    transparent 0%,
    transparent 40%,
    rgba(168, 125, 78, 0.10) 48%,
    rgba(168, 125, 78, 0.18) 52%,
    rgba(168, 125, 78, 0.10) 56%,
    transparent 64%,
    transparent 100%
  );
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 1100ms var(--omn-ease) 300ms;
}
.section-hero.is-revealed::after { opacity: 1; }

/* ── Atmospheric image layer ──
   Absolutely positioned, fills the section, masked with a soft 168° diagonal
   so it fades from transparent upper-left to fully visible lower-right.
   Uses CSS custom property --section-img (set via inline style from image prop).
   Mask gradient stops are structural geometry — no token equivalent. */
.hero-band__image {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--section-img);
  background-size: cover;
  background-position: var(--section-img-pos, center 62%);
  background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(
    168deg,
    transparent 0%,
    transparent 30%,
    rgba(0, 0, 0, 0.18) 42%,
    rgba(0, 0, 0, 0.55) 52%,
    rgba(0, 0, 0, 0.88) 64%,
    rgb(0, 0, 0) 78%,
    rgb(0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    168deg,
    transparent 0%,
    transparent 30%,
    rgba(0, 0, 0, 0.18) 42%,
    rgba(0, 0, 0, 0.55) 52%,
    rgba(0, 0, 0, 0.88) 64%,
    rgb(0, 0, 0) 78%,
    rgb(0, 0, 0) 100%
  );
  filter: saturate(0.85) contrast(1.05);
  opacity: 0.85;
  pointer-events: none;
  /* Subtle scale-in on reveal — compositor-friendly (transform only) */
  transform: scale(1.02);
  transition: transform 1400ms var(--omn-ease);
}
.section-hero.is-revealed .hero-band__image { transform: scale(1); }

/* ── Overlay ──
   Two-gradient composite: top-to-bottom dark vignette for text legibility
   + diagonal bronze warmth along the seam.
   rgba values are structural — they reference the dark page base color
   (#121214 = --omn-bg-page) but as rgba since they need partial opacity. */
.hero-band__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg,
      var(--omn-bg-page) 0%,
      rgba(18, 18, 20, 0.78) 28%,
      rgba(18, 18, 20, 0.00) 46%,
      rgba(18, 18, 20, 0.40) 78%,
      rgba(18, 18, 20, 0.85) 100%),
    linear-gradient(168deg,
      transparent 0%,
      transparent 40%,
      rgba(168, 125, 78, 0.06) 50%,
      transparent 60%,
      transparent 100%);
}

/* ── Container ──
   Wraps content with standard editorial gutters so hero respects the
   same horizontal rhythm as every other section. Without this the text
   bleeds to the viewport edge (the bug the user reported). max-width
   matches sandbox .container at hero's max bleed (1320px / --width-bleed)
   so the headline can occupy the full editorial column on ultra-wide.
   Padding token --space-edge keeps it identical to all sibling sections. */
.hero__container {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: var(--width-bleed);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* ── Content column ──
   Sits above image + overlay layers (z-index 2+).
   Flex column, max-width of each child capped at 640px.
   min-height calculation keeps content vertically centered within
   the section accounting for the top + bottom padding sums. */
.hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(clamp(820px, 100vh, 1100px) - clamp(236px, 30vw, 400px));
}
.hero__content > * { max-width: 640px; }

/* ── Vol. notation ──
   Editorial volume marker above eyebrow. Uses AppCaption variant="mono"
   which provides the font/size/tracking. We override margin here to
   match sandbox: 0 0 28px. */
.hero__vol {
  margin: 0 0 var(--space-7) !important;
}

/* ── Eyebrow ──
   AppEyebrow handles font/color/rule. Margin to separate from display. */
.hero__eyebrow {
  margin-bottom: var(--space-5);
}

/* ── Display headline ──
   Typography source: sandbox .display
   Font: --omn-font-display, weight 300, clamp(48px, 7.2vw, 112px)
   Line-height: 0.98 (tighter than any token — hero-specific, justified inline)
   Letter-spacing: -0.042em (hero-specific, no token match, inline)
   text-wrap: balance — progressive enhancement */
.hero__display {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-size: clamp(48px, 7.2vw, 112px);
  line-height: 0.98;
  letter-spacing: -0.042em;
  margin: 0 0 var(--space-8);
  color: var(--omn-text-primary);
  text-wrap: balance;
}

/* Each line is block-displayed so multi-line hero headlines wrap correctly */
.hero__display-line { display: block; }

/* Quiet line (last): secondary color, same weight */
.hero__display-line--quiet {
  color: var(--omn-text-secondary);
  font-weight: var(--weight-light);
}

/* ── Emphasized word (animated bronze underline) ──
   The #em slot word gets font-weight 500 (medium) and a ::after pseudo
   that draws a 1px bronze underline via transform: scaleX(0→1).
   bottom: 2px = 1px height + 1px gap — structural, justified inline.
   font-variation-settings animates the variable font weight axis for
   browsers that support it (Onest supports wght axis). */
.hero__display-em {
  font-weight: var(--weight-medium);
  color: var(--omn-text-primary);
  position: relative;
  transition:
    font-variation-settings 800ms var(--omn-ease),
    color 600ms var(--omn-ease);
}
.hero__display-em::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  /* 2px = 1px underline height + 1px gap above baseline; structural */
  bottom: 2px;
  height: 1px;
  background: var(--omn-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 700ms var(--omn-ease) 300ms;
}
.hero__display-em--lit {
  font-variation-settings: 'wght' 500;
}
.hero__display-em--lit::after { transform: scaleX(1); }

/* ── Deck text (AppSubhead) ──
   AppSubhead provides the font/size/lh/tracking. Molecule adds the
   max-width constraint (48ch) and margin per sandbox pattern. */
.hero__subhead {
  max-width: 48ch;
  margin: 0 0 var(--space-9) !important;
}

/* ── CTA row ──
   Flex row of buttons with wrap for mobile. gap: 14px — structural
   inter-button spacing, no token at this granularity. */
.hero__cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: var(--space-7);
}

/* On mobile the cosmic-gold imagery diffuses up into the CTA row and the
   ghost button's faint --omn-border-primary outline disappears. Restore
   legibility with a translucent dark backdrop and a stronger border so
   the secondary CTA reads cleanly over the image. Applies only inside
   the hero (other sections sit on solid surfaces). */
@media (max-width: 767px) {
  .hero__cta-row :deep(.app-button--ghost),
  .hero__cta-row :deep(.app-button--secondary) {
    background: rgba(18, 18, 20, 0.55);
    border-color: var(--omn-border-emphasis);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}

/* ── Trust line ──
   Inline mono text with dot separators and sage live indicator dots.
   font/size/tracking match sandbox .trust. */
.hero__trust {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-prose);
  color: var(--omn-text-tertiary);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
}

/* Trust dot helpers (consumers pass these in the #trust slot markup) */
:slotted(.hero-trust__dot) {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--omn-text-tertiary);
}
:slotted(.hero-trust__dot--sage) {
  background: var(--omn-success);
}
:slotted(.hero-trust__sep) {
  opacity: 0.4;
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .section-hero {
    min-height: 92vh;
    padding-top: var(--space-20);
    padding-bottom: var(--space-24);
  }
  .hero__content {
    min-height: 0;
    justify-content: flex-start;
  }
  .hero-band__image {
    background-position: var(--section-img-pos-mobile, center 62%);
  }
}

/* ── Reduced motion ──
   Skip all transitions; render final state immediately. */
@media (prefers-reduced-motion: reduce) {
  .hero-band__image,
  .section-hero::after,
  .hero__display-em,
  .hero__display-em::after {
    transition: none;
  }
  .hero__display-em--lit::after { transform: scaleX(1); }
  .section-hero::after { opacity: 1; }
  .hero-band__image { transform: scale(1); }
}
</style>
