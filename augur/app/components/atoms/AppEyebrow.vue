<!--
  AppEyebrow
  ─────────────────
  Purpose: Small-caps label placed above a headline; generalizes the .label-caps utility class in eyebrow position.
  Props: variant, as
  Slots: default
  Usage: <AppEyebrow>Premium</AppEyebrow>
         <AppEyebrow variant="accent">№ 001 · OMENORA</AppEyebrow>
         <AppEyebrow variant="muted" as="span">Common questions</AppEyebrow>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'accent' | 'muted'
  as?: string
}>(), {
  variant: 'default',
  as: 'p',
})
</script>

<template>
  <component
    :is="as"
    :class="['app-eyebrow', `app-eyebrow--${variant}`]"
  ><slot /></component>
</template>

<style scoped>
.app-eyebrow {
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
  font-size: var(--text-xs);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

/* Color variants */
.app-eyebrow--default { color: var(--text-secondary); }
.app-eyebrow--accent  { color: var(--accent-gold); }
.app-eyebrow--muted   { color: var(--text-tertiary); }
</style>
