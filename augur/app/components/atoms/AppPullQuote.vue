<!--
  AppPullQuote
  ─────────────────
  Purpose: Large emphasized italic text block for featured callouts; generalizes the .pull-quote utility class.
  Props: variant, as, balance
  Slots: default
  Usage: <AppPullQuote>One of these is yours.</AppPullQuote>
         <AppPullQuote variant="gold" as="blockquote">A featured insight in gold.</AppPullQuote>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'gold'
  as?: string
  balance?: boolean
}>(), {
  variant: 'default',
  as: 'p',
  balance: true,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-pull-quote',
      `app-pull-quote--${variant}`,
      { 'app-pull-quote--balance': balance },
    ]"
  ><slot /></component>
</template>

<style scoped>
.app-pull-quote {
  font-family: var(--font-sans);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: var(--text-2xl);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
}

/* Matches .pull-quote exactly */
.app-pull-quote--default {
  color: var(--text-primary);
}

/* Gold accent for highlighted/featured callout text */
.app-pull-quote--gold {
  color: var(--accent-gold);
}

/* Progressive enhancement — ignored by unsupporting browsers */
.app-pull-quote--balance {
  text-wrap: balance;
}
</style>
