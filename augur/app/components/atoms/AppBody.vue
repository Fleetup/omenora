<!--
  AppBody
  ─────────────────
  Purpose: Standard body text across default paragraphs, lede intros,
  and italic affirmation / reflection copy.

  Variants:
    default  — section body copy (17px, secondary color, 1.6 lh)
    lede     — intro paragraph (19px, secondary color, 1.55 lh); supports
               drop-cap prop for editorial ::first-letter bronze initial
    italic   — affirmation / reflection copy (light italic, relaxed lh);
               used by report.vue and daily.vue

  Props:
    variant   'default' | 'lede' | 'italic'    default: 'default'
    as        string — rendered element         default: 'p'
    color     'primary' | 'secondary' | 'tertiary'  default: undefined
    balance   boolean — text-wrap: balance      default: false
    drop-cap  boolean — ::first-letter bronze initial (lede only)
                        default: false

  Slots:
    default (may contain inline HTML: strong, em, a, br)

  Usage:
    <AppBody>Section body copy at 17px.</AppBody>

    <AppBody variant="lede" :drop-cap="true">
      Intro paragraph with bronze drop cap.
    </AppBody>

    <AppBody variant="italic">Affirmation or reflection text.</AppBody>

    <AppBody variant="lede" color="primary">
      Centered lede without drop cap (color override).
    </AppBody>

  Backward compat:
    variant="large" was renamed to variant="lede". Existing consumers
    using variant="large" will receive the default variant styling
    (class falls back to app-body--large which is unstyled → inherits
    base). No consumer currently uses variant="large" in pages; only
    QuizRewardScreen uses AppBody (no variant prop set).
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'lede' | 'italic'
  as?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  balance?: boolean
  dropCap?: boolean
}>(), {
  variant: 'default',
  as: 'p',
  color: undefined,
  balance: false,
  dropCap: false,
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
      { 'app-body--drop-cap': dropCap },
    ]"
  ><slot /></component>
</template>

<style scoped>
/* ── Base ── */
.app-body {
  font-family: var(--omn-font-body);
  font-weight: var(--weight-regular);
  letter-spacing: var(--tracking-body);
  margin: 0;
}

/* ── DEFAULT variant — section body copy ── */
.app-body--default {
  font-size: var(--text-md);
  line-height: var(--leading-base);
  color: var(--omn-text-secondary);
}

/* ── LEDE variant — intro paragraph (larger, editorial) ── */
.app-body--lede {
  font-size: var(--text-lg);
  line-height: var(--leading-lg);
  color: var(--omn-text-secondary);
}

/* Drop cap: editorial bronze first-letter, lede paragraphs only.
   - font-size 3.8em is intentionally relative — it scales with the
     lede's own font-size for a locked optical ratio. No token exists
     for this ratio; it is a typographic constant specific to drop caps.
   - line-height 0.82 is below --leading-7xl (0.96); no token maps
     to this value — it is drop-cap-specific optical tuning.
   - em-based margins are also optical constants for the float layout.
   - letter-spacing -0.04em is drop-cap-specific (1 use in sandbox). */
.app-body--drop-cap::first-letter {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-size: 3.8em;
  line-height: 0.82;
  float: left;
  margin: 0.08em 0.14em 0 -0.04em;
  color: var(--omn-accent);
  letter-spacing: -0.04em;
}

/* ── ITALIC variant — affirmation / reflection copy ── */
/* Used by report.vue and daily.vue (replaces local .font-serif-italic) */
.app-body--italic {
  font-style: italic;
  font-weight: var(--weight-light);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--omn-text-primary);
}

/* ── Color overrides ── */
.app-body--color-primary   { color: var(--omn-text-primary); }
.app-body--color-secondary { color: var(--omn-text-secondary); }
.app-body--color-tertiary  { color: var(--omn-text-tertiary); }

/* ── Balance: progressive enhancement ── */
.app-body--balance {
  text-wrap: balance;
}
</style>
