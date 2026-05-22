<!--
  AppHeadline
  ─────────────────
  Purpose: Display headlines at section and page level; generalizes .font-display-italic (italic, most common),
           .font-display (upright), and hero-scale display variant.
  Props: variant, as, color
  Slots: default
  Usage: <AppHeadline as="h1">Your chart is waiting.</AppHeadline>
         <AppHeadline variant="upright" as="h2">Six traditions. One reading.</AppHeadline>
         <AppHeadline variant="display" as="h1">Omenora</AppHeadline>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'italic' | 'upright' | 'display'
  as?: string
  color?: 'primary' | 'secondary' | 'accent'
}>(), {
  variant: 'italic',
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
.app-headline {
  font-family: var(--font-sans);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Matches .font-display-italic — primary section headline style */
.app-headline--italic {
  font-style: italic;
  font-size: var(--text-5xl);
}

/* Matches .font-display — non-italic variant */
.app-headline--upright {
  font-style: normal;
  font-size: var(--text-5xl);
}

/* Hero-scale display — larger than section headlines */
.app-headline--display {
  font-style: italic;
  font-size: var(--text-display);
}

/* Responsive ramp at 768px — matches editorial.css .font-display desktop override:
   italic/upright: --text-5xl (56px) → --text-6xl (72px)
   display: --text-display (96px) → stays at 96px on tablet, further up at 1024px+ */
@media (min-width: 768px) {
  .app-headline--italic,
  .app-headline--upright {
    font-size: var(--text-6xl);
  }
}

/* Color overrides */
.app-headline--color-primary   { color: var(--text-primary); }
.app-headline--color-secondary { color: var(--text-secondary); }
.app-headline--color-accent    { color: var(--accent-gold); }
</style>
