<!--
  AppStat
  ─────────────────
  Purpose: Number/value and label pair for social proof and feature callouts; generalizes the trust-strip item and live reading count patterns.
  Props: variant, value, label, accent
  Slots: none — value and label are both props
  Usage: <AppStat value="47,392" label="charts read" :accent="true" variant="inline" />
         <AppStat value="[01]" label="Founding Member offer" />
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'inline'
  value: string
  label: string
  accent?: boolean
}>(), {
  variant: 'default',
  accent: false,
})
</script>

<template>
  <div :class="['app-stat', `app-stat--${variant}`]">
    <span :class="['app-stat__value', { 'app-stat__value--accent': accent }]">{{ value }}</span>
    <span class="app-stat__label">{{ label }}</span>
  </div>
</template>

<style scoped>
/* ── Default variant: stacked (label above visually via column-reverse, value prominent below) ── */
/* Per spec: "label above, value below" — use flex-direction: column, label first in DOM but
   visually the value is the prominent element. We keep DOM order value-then-label for
   screen reader natural order (value first, label second reads correctly) and use
   flex-direction: column with value as the second (larger) element. */
.app-stat--default {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.app-stat--default .app-stat__value {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  order: 2;
}

.app-stat--default .app-stat__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
  order: 1;
}

/* ── Inline variant: value + label on same line ── */
.app-stat--inline {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
}

.app-stat--inline .app-stat__value {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.app-stat--inline .app-stat__label {
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

/* Accent: renders value in gold — used for live counters and highlighted stats */
.app-stat__value--accent {
  color: var(--accent-gold);
}
</style>
