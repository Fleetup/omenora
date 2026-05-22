<!--
  AppDivider
  ─────────────────
  Purpose: Horizontal visual separator; generalizes .editorial-rule utility class and supersedes EditorialRule.vue.
           Superset of EditorialRule: preserves ornament/label between two rule lines, adds configurable
           spacing, color, and semantic <hr> element for the plain rule variant.
  Props: variant, color, label, spacing
  Slots: default (optional — overrides label prop for richer label content)
  Usage: <AppDivider />
         <AppDivider spacing="lg" />
         <AppDivider variant="labeled" label="✦" />
         <AppDivider variant="labeled" spacing="lg"><span>or</span></AppDivider>
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
  <!-- Matches EditorialRule.vue ornament layout exactly -->
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
.app-divider--rule {
  width: 100%;
  height: 1px;
}

/* ── Labeled variant: flex row [line][label][line] ── */
/* Replicates EditorialRule.vue layout: flex, align-items center, gap --space-4 (16px), full width */
.app-divider--labeled {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.app-divider__line {
  flex: 1;
  height: 1px;
  display: block;
}

.app-divider__label {
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--accent-gold);
  /* Horizontal breathing room between label and flanking lines */
  padding: 0 var(--space-3);
}

/* ── Color variants — applied to rule background and labeled lines ── */
/* Rule: background-color via CSS custom property set per color class */
.app-divider--color-subtle  { --divider-color: var(--border-subtle); }
.app-divider--color-faint   { --divider-color: var(--border-faint); }
.app-divider--color-default { --divider-color: var(--border-default); }
.app-divider--color-strong  { --divider-color: var(--border-strong); }

/* Apply color to <hr> */
.app-divider--rule {
  background-color: var(--divider-color);
}

/* Apply color to flanking lines in labeled variant */
.app-divider__line {
  background-color: var(--divider-color);
}

/* ── Spacing variants — vertical padding on root element ── */
/* Padding (not margin) to avoid margin collapse, per spec */
.app-divider--spacing-none { padding-top: var(--space-0); padding-bottom: var(--space-0); }
.app-divider--spacing-sm   { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.app-divider--spacing-md   { padding-top: var(--space-4); padding-bottom: var(--space-4); }
/* lg = --space-12 (48px) — matches EditorialRule.vue hardcoded margin: var(--space-12) 0 */
.app-divider--spacing-lg   { padding-top: var(--space-12); padding-bottom: var(--space-12); }
</style>
