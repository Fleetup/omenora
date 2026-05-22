<!--
  AppCaption
  ─────────────────
  Purpose: Small metadata and annotation text; generalizes the .annotation utility class.
  Props: variant, as, color, muted
  Slots: default
  Usage: <AppCaption>14px annotation text</AppCaption>
         <AppCaption variant="fine" as="p" color="tertiary">12px fine print</AppCaption>
         <AppCaption :muted="true">·</AppCaption>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'fine'
  as?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  muted?: boolean
}>(), {
  variant: 'default',
  as: 'span',
  color: undefined,
  muted: false,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-caption',
      `app-caption--${variant}`,
      color ? `app-caption--color-${color}` : '',
      { 'app-caption--muted': muted },
    ]"
  ><slot /></component>
</template>

<style scoped>
.app-caption {
  font-family: var(--font-sans);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
}

/* Variants */
.app-caption--default {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.app-caption--fine {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Color overrides */
.app-caption--color-primary  { color: var(--text-primary); }
.app-caption--color-secondary { color: var(--text-secondary); }
.app-caption--color-tertiary  { color: var(--text-tertiary); }

/* Muted: separator/decorative character treatment */
.app-caption--muted {
  opacity: 0.3;
}
</style>
