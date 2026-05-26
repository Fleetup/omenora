<!--
  AppHeadline
  ─────────────────
  Purpose: Display headlines at section and page level. Maps to the
  sandbox .display / .head--xl / .head--lg / .head--md hierarchy.

  Props:
    variant  see table below                              default: 'lg'
    as       string — rendered element                   default: 'h2'
    color    'primary' | 'secondary' | 'accent'          default: undefined

  Variants (sandbox alignment):
    display  → .display  — hero scale  clamp(48px → 112px), lh 0.96
    xl       → .head--xl — section     clamp(44px → 92px),  lh 1.0
    lg       → .head--lg — subsection  clamp(36px → 68px),  lh 1.05, upright
    md       → .head--md — panel       clamp(28px → 48px),  lh 1.08

  API-compat aliases (map to lg; preserve 23+ consumer usages):
    italic   → lg + font-style: italic  (prior default)
    upright  → lg                       (prior non-italic variant)

  Fluid clamp() sizes are atom-internal per the 3+ threshold rule:
  each variant is used in exactly one sandbox section, so the sizes
  are not promoted to global tokens.

  Slots:
    default — headline text. Wrap words in <em> for emphasis weight:
      <AppHeadline variant="lg"><em>Six</em> traditions.</AppHeadline>
    Scoped CSS applies font-weight: var(--weight-medium) to <em>
    inside this atom. Animated underline (.display__em::after) is a
    hero-molecule concern and intentionally NOT included here.

  Usage:
    <AppHeadline variant="display" as="h1">Your chart is ready.</AppHeadline>
    <AppHeadline variant="xl" as="h2">Six traditions.</AppHeadline>
    <AppHeadline variant="lg" as="h2">What you receive.</AppHeadline>
    <AppHeadline variant="md" as="h3">Common questions.</AppHeadline>
    <AppHeadline variant="italic" as="h1">The founding.</AppHeadline>
    <AppHeadline color="secondary" variant="lg" as="h2">Quiet line.</AppHeadline>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'display' | 'xl' | 'lg' | 'md' | 'italic' | 'upright'
  as?: string
  color?: 'primary' | 'secondary' | 'accent'
}>(), {
  variant: 'lg',
  as: 'h2',
  color: undefined,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-headline',
      `app-headline--${variant}`,
      color ? `app-headline--color-${color}` : '',
    ]"
  ><slot /></component>
</template>

<style scoped>
/* ── Base ── */
.app-headline {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  margin: 0;
  text-wrap: balance;
}

/* Emphasized word inside any headline — matches .head__em / .display__em weight */
.app-headline :deep(em) {
  font-weight: var(--weight-medium);
  font-style: normal;
  color: var(--omn-text-primary);
}

/* ── DISPLAY variant — hero scale ──
   Sandbox: .display — clamp(48px, 7.2vw, 112px), lh 0.96, ls -0.042em
   Fluid clamp kept inline per 3+ threshold (used once in sandbox). */
.app-headline--display {
  font-size: clamp(48px, 7.2vw, 112px);
  line-height: var(--leading-7xl);
  letter-spacing: -0.042em;
}

/* ── XL variant — section scale ──
   Sandbox: .head--xl — clamp(44px, 6vw, 92px), lh 1.0, ls -0.038em */
.app-headline--xl {
  font-size: clamp(44px, 6vw, 92px);
  line-height: var(--leading-6xl);
  letter-spacing: -0.038em;
}

/* ── LG variant — subsection scale (sandbox default head size) ──
   Sandbox: .head--lg — clamp(36px, 4.8vw, 68px), lh 1.05, ls -0.032em */
.app-headline--lg {
  font-size: clamp(36px, 4.8vw, 68px);
  line-height: var(--leading-5xl);
  letter-spacing: -0.032em;
}

/* ── MD variant — panel scale ──
   Sandbox: .head--md — clamp(28px, 3.4vw, 48px), lh 1.08, ls -0.028em */
.app-headline--md {
  font-size: clamp(28px, 3.4vw, 48px);
  line-height: var(--leading-4xl);
  letter-spacing: -0.028em;
}

/* ── API-compat aliases ──
   italic → lg scale + italic style (maps prior default variant; 23 consumers)
   upright → lg scale, normal style (maps prior upright variant; 1 consumer) */
.app-headline--italic {
  font-size: clamp(36px, 4.8vw, 68px);
  line-height: var(--leading-5xl);
  letter-spacing: -0.032em;
  font-style: italic;
}

.app-headline--upright {
  font-size: clamp(36px, 4.8vw, 68px);
  line-height: var(--leading-5xl);
  letter-spacing: -0.032em;
  font-style: normal;
}

/* ── Color overrides ── */
.app-headline--color-primary   { color: var(--omn-text-primary); }
.app-headline--color-secondary { color: var(--omn-text-secondary); }
.app-headline--color-accent    { color: var(--omn-accent); }
</style>
