<!--
  AppStat
  ─────────────────
  Purpose: Single stat unit — large display value with optional
  inline unit suffix and optional mono label below. Maps to the
  sandbox .counter / .counter__value / .counter__unit /
  .counter__label pattern.

  The .counters grid container (multi-stat horizontal layout) is
  a MOLECULE concern (future SectionCounters). AppStat is the
  individual stat unit.

  Props:
    value    string (required) — the prominent number or text
    label    string (required) — descriptor rendered below value
    unit     string (optional) — inline suffix next to value
             e.g. "+" or "k" — rendered at 0.6em, --omn-text-tertiary
    variant  'default' | 'inline'   default: 'default'
             default → stacked (value above, label below)
             inline  → value + label on one baseline row
    accent   boolean   default: false
             Renders value in --omn-accent (bronze) — for featured
             or highlighted stats

  Slots: none — all content via props

  Animation: counter rollup (1400ms number increment) is a consumer
  concern — apply via composable, binding an animated ref to :value.
  AppStat only handles static presentation.

  Typography source: sandbox .counter system
    .counter__value  → --omn-font-display, 300, clamp(32px,4vw,44px),
                        ls -0.025em, tabular-nums, --omn-text-primary
    .counter__unit   → 0.6em of parent, --omn-text-tertiary
    .counter__label  → --omn-font-mono, --text-xs, --tracking-label,
                        uppercase, --omn-text-tertiary

  Usage:
    <AppStat value="47,392" label="charts read" />
    <AppStat value="12,400" unit="+" label="active members" :accent="true" />
    <AppStat value="98" unit="%" label="satisfaction" />
    <AppStat value="[01]" label="Founding Member offer" variant="inline" />
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'inline'
  value: string
  label: string
  unit?: string
  accent?: boolean
}>(), {
  variant: 'default',
  unit: undefined,
  accent: false,
})
</script>

<template>
  <div :class="['app-stat', `app-stat--${variant}`]">
    <div class="app-stat__row">
      <span :class="['app-stat__value', { 'app-stat__value--accent': accent }]">{{ value }}</span>
      <span v-if="unit" class="app-stat__unit" aria-hidden="true">{{ unit }}</span>
    </div>
    <span class="app-stat__label">{{ label }}</span>
  </div>
</template>

<style scoped>
/* ── Default variant: stacked — value row above, label below ──
   DOM order: value → label (natural screen reader order).
   Visual: value prominent, label as descriptor beneath. */
.app-stat--default {
  display: flex;
  flex-direction: column;
}

/* ── Inline variant: value + label on one baseline row ── */
.app-stat--inline {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
}

/* ── Value + unit row ── */
.app-stat__row {
  display: flex;
  align-items: baseline;
}

/* ── Value ──
   Sandbox: .counter__value
   Font: --omn-font-display (Onest), weight 300
   Size: clamp(32px, 4vw, 44px) — 1 sandbox use, inline per 3+ threshold
   Letter-spacing: -0.025em — unique per sandbox, no token match, inline
   tabular-nums: critical for animated counters to prevent layout shift */
.app-stat__value {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-size: clamp(32px, 4vw, 44px);
  line-height: var(--leading-3xl);
  letter-spacing: -0.025em;
  color: var(--omn-text-primary);
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--space-2);
}

/* Inline variant value: smaller, matches inline context */
.app-stat--inline .app-stat__value {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  margin-bottom: 0;
}

/* ── Unit ──
   Sandbox: .counter__unit — 0.6em relative to value, --omn-text-tertiary
   margin-left keeps unit off the value digit with minimal gap */
.app-stat__unit {
  font-size: 0.6em;
  color: var(--omn-text-tertiary);
  margin-left: var(--space-1);
}

/* ── Label ──
   Sandbox: .counter__label
   Font: --omn-font-mono, --text-xs (11px), --tracking-label (0.14em),
   uppercase, --omn-text-tertiary */
.app-stat__label {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  line-height: var(--leading-normal);
}

/* Inline variant label: plain secondary text, no mono caps */
.app-stat--inline .app-stat__label {
  font-family: inherit;
  font-size: var(--text-base);
  letter-spacing: normal;
  text-transform: none;
  color: var(--omn-text-secondary);
}

/* ── Accent: value in --omn-accent (bronze) ── */
.app-stat__value--accent {
  color: var(--omn-accent);
}
</style>
