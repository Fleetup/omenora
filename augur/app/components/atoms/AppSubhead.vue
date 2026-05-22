<!--
  AppSubhead
  ─────────────────
  Purpose: Subheading below a headline; generalizes the .font-serif utility class (Geist light italic at --text-md).
  Props: variant, as, color
  Slots: default
  Usage: <AppSubhead>Ancient wisdom. Modern precision.</AppSubhead>
         <AppSubhead variant="strong" as="h3">Section heading with more authority</AppSubhead>
         <AppSubhead color="primary">Override to full brightness</AppSubhead>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'strong'
  as?: string
  color?: 'primary' | 'secondary' | 'tertiary'
}>(), {
  variant: 'default',
  as: 'p',
  color: undefined,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-subhead',
      `app-subhead--${variant}`,
      color ? `app-subhead--color-${color}` : '',
    ]"
  ><slot /></component>
</template>

<style scoped>
.app-subhead {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  letter-spacing: var(--tracking-normal);
}

/* Matches .font-serif: light italic, secondary color */
.app-subhead--default {
  font-weight: var(--weight-light);
  font-style: italic;
  color: var(--text-secondary);
}

/* Drops italic axis, raises weight for section headings needing more presence */
.app-subhead--strong {
  font-weight: var(--weight-regular);
  font-style: normal;
  color: var(--text-primary);
}

/* Color overrides */
.app-subhead--color-primary   { color: var(--text-primary); }
.app-subhead--color-secondary { color: var(--text-secondary); }
.app-subhead--color-tertiary  { color: var(--text-tertiary); }
</style>
