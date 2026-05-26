<!--
  AppDivider
  ─────────────────
  Purpose: Standalone horizontal (or labeled) visual separator.
  Generalizes the .editorial-rule utility class and supersedes
  EditorialRule.vue. Handles only standalone divider elements —
  NOT container border-top/border-bottom (those belong on the
  molecule), and NOT animated section-reveal hairlines (those
  are pseudo-elements on their section molecule).

  Props:
    variant  'rule' | 'labeled'                        default: 'rule'
    color    'subtle' | 'faint' | 'default' | 'strong' default: 'subtle'
             subtle  → --omn-border-subtle  (lightest; most common)
             faint   → --omn-border-subtle  (deprecated alias for subtle;
                       retained for API compat, renders same as subtle)
             default → --omn-border-primary
             strong  → --omn-border-emphasis
    label    string (optional) — ornament character for labeled variant
    spacing  'none' | 'sm' | 'md' | 'lg'              default: 'none'

  Slots:
    default (optional) — overrides label prop for richer label content

  Usage:
    <AppDivider />
    <AppDivider spacing="lg" />
    <AppDivider color="default" />
    <AppDivider variant="labeled" label="◇" spacing="lg" />
    <AppDivider variant="labeled" spacing="lg"><span>or</span></AppDivider>

  Out of scope (handled at molecule layer):
    – Container border-top/border-bottom patterns (kvs, faq, card__foot…)
    – Animated section-reveal hairlines (.section-marked::before)
    – Gradient vertical separators (.section-rail__sep)
    – Scroll-progress track (.scroll-progress)
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'rule' | 'labeled'
  color?: 'subtle' | 'faint' | 'default' | 'strong'
  label?: string
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}>(), {
  variant: 'rule',
  color: 'subtle',
  label: undefined,
  spacing: 'none',
})
</script>

<template>
  <!-- Rule variant: semantic <hr>, void element — no children permitted -->
  <hr
    v-if="variant === 'rule'"
    :class="['app-divider', 'app-divider--rule', `app-divider--color-${color}`, `app-divider--spacing-${spacing}`]"
    aria-hidden="true"
  />

  <!-- Labeled variant: <div role="separator"> with [line][label][line] flex layout -->
  <div
    v-else
    role="separator"
    :class="['app-divider', 'app-divider--labeled', `app-divider--color-${color}`, `app-divider--spacing-${spacing}`]"
  >
    <span class="app-divider__line" aria-hidden="true" />
    <span class="app-divider__label">
      <slot>{{ label }}</slot>
    </span>
    <span class="app-divider__line" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* ── Base: strip browser <hr> defaults ── */
.app-divider {
  display: block;
  border: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ── Rule variant ── */
/* height: 1px is a structural border-width constant, not a spacing token */
.app-divider--rule {
  width: 100%;
  height: 1px;
  background-color: var(--divider-color);
}

/* ── Labeled variant: flex row [line][label][line] ── */
.app-divider--labeled {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

/* height: 1px — same justification as rule variant above */
.app-divider__line {
  flex: 1;
  height: 1px;
  display: block;
  background-color: var(--divider-color);
}

.app-divider__label {
  flex-shrink: 0;
  font-family: var(--omn-font-display);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-accent);
  /* Horizontal breathing room between label and flanking lines */
  padding: 0 var(--space-3);
}

/* ── Color variants ──
   Sets --divider-color for the rule background and labeled flanking lines.
   'faint' is a deprecated alias; retained for API compat, maps to subtle. */
.app-divider--color-subtle,
.app-divider--color-faint   { --divider-color: var(--omn-border-subtle); }
.app-divider--color-default { --divider-color: var(--omn-border-primary); }
.app-divider--color-strong  { --divider-color: var(--omn-border-emphasis); }

/* ── Spacing variants — vertical padding (not margin, avoids collapse) ── */
.app-divider--spacing-none { padding-top: var(--space-0);  padding-bottom: var(--space-0); }
.app-divider--spacing-sm   { padding-top: var(--space-2);  padding-bottom: var(--space-2); }
.app-divider--spacing-md   { padding-top: var(--space-4);  padding-bottom: var(--space-4); }
/* lg = --space-12 (48px) — matches prior EditorialRule.vue margin spec */
.app-divider--spacing-lg   { padding-top: var(--space-12); padding-bottom: var(--space-12); }
</style>
