<!--
  AppSubhead
  ─────────────────
  Purpose: Bridge text between AppHeadline and AppBody. Deck copy,
  section intros, descriptive lines below panel headings. Maps to
  the sandbox .subhead pattern (hero deck text under .display).

  Props:
    variant  'default' | 'strong'              default: 'default'
             default → light italic, --omn-text-secondary
                       (10 consumer uses; editorial quote-adjacent)
             strong  → regular upright, --omn-text-primary
                       (42 consumer uses; section label / UI heading)
    as       string — rendered element         default: 'p'
    color    'primary' | 'secondary' | 'tertiary'  default: undefined
             Overrides variant's default color — e.g., color="primary"
             on the default (italic) variant lifts it to primary.

  Slots: default

  Typography source: sandbox .subhead
    font-size:      19px   → --text-lg
    line-height:    1.55   → --leading-lg
    letter-spacing: -0.005em → --tracking-body
    color:          --omn-text-secondary (for deck / bridge text)

  Note: sandbox .subhead has max-width: 48ch and margin: 0 0 36px —
  those are layout concerns, not atom concerns. Consumers apply
  spacing and width constraints via their scoped molecule CSS.
  Atom sets margin: 0 per SD8.

  Usage:
    <AppSubhead>Ancient wisdom. Modern precision.</AppSubhead>
    <AppSubhead variant="strong" as="h3">Six traditions.</AppSubhead>
    <AppSubhead color="primary">Override to full brightness.</AppSubhead>
    <AppSubhead variant="strong" color="primary" as="h2">
      Your {{ name }} reading is ready.
    </AppSubhead>
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
/* ── Base ──
   Sandbox .subhead: 19px (--text-lg), lh 1.55 (--leading-lg),
   ls -0.005em (--tracking-body). No font-family override — inherits
   --omn-font-body (Onest) which matches the sandbox's implied body font. */
.app-subhead {
  font-family: var(--omn-font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-lg);
  letter-spacing: var(--tracking-body);
  margin: 0;
}

/* ── Default variant: light italic, secondary color ──
   Editorial deck register — used under display headlines and for
   introductory prose. 10 consumer uses. */
.app-subhead--default {
  font-weight: var(--weight-light);
  font-style: italic;
  color: var(--omn-text-secondary);
}

/* ── Strong variant: regular upright, primary color ──
   UI heading register — section labels, account headings, sign names,
   panel headings needing authority. 42 consumer uses. */
.app-subhead--strong {
  font-weight: var(--weight-regular);
  font-style: normal;
  color: var(--omn-text-primary);
}

/* ── Color overrides ── */
.app-subhead--color-primary   { color: var(--omn-text-primary); }
.app-subhead--color-secondary { color: var(--omn-text-secondary); }
.app-subhead--color-tertiary  { color: var(--omn-text-tertiary); }
</style>
