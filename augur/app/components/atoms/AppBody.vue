<!--
  AppBody
  ─────────────────
  Purpose: Standard body text; generalizes .font-sans (default), local .font-serif-italic (italic), and intro paragraph (large).
  Props: variant, as, color, balance
  Slots: default (may contain inline HTML: strong, em, a, br)
  Usage: <AppBody>Regular body copy at 16px.</AppBody>
         <AppBody variant="italic">Affirmation or reflection text.</AppBody>
         <AppBody variant="large" color="secondary">Intro lede paragraph.</AppBody>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'italic' | 'large'
  as?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  balance?: boolean
}>(), {
  variant: 'default',
  as: 'p',
  color: undefined,
  balance: false,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-body',
      `app-body--${variant}`,
      color ? `app-body--color-${color}` : '',
      { 'app-body--balance': balance },
    ]"
  ><slot /></component>
</template>

<style scoped>
.app-body {
  font-family: var(--font-sans);
  letter-spacing: var(--tracking-normal);
}

/* Variants */
.app-body--default {
  font-weight: var(--weight-regular);
  font-style: normal;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

/* Replaces local .font-serif-italic in report.vue and daily.vue */
.app-body--italic {
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.app-body--large {
  font-weight: var(--weight-regular);
  font-style: normal;
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

/* Color overrides */
.app-body--color-primary   { color: var(--text-primary); }
.app-body--color-secondary { color: var(--text-secondary); }
.app-body--color-tertiary  { color: var(--text-tertiary); }

/* Balance: progressive enhancement, ignored by unsupporting browsers */
.app-body--balance {
  text-wrap: balance;
}
</style>
