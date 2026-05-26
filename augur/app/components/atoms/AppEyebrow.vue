<!--
  AppEyebrow
  ─────────────────
  Purpose: Small mono-uppercase section label, placed above a headline
  or used as inline annotation. Signature editorial atom.

  Props:
    variant    'default' | 'accent' | 'quiet' | 'muted'  default: 'default'
               default  → --omn-accent (bronze; sandbox base)
               accent   → --omn-accent (alias for default; API compat)
               quiet    → --omn-accent-quiet (darker bronze; sandbox --quiet)
               muted    → --omn-text-tertiary (app-specific; not in sandbox)
    as         string — rendered element              default: 'p'
    rule       boolean — leading hairline rule (::before)
                         matches sandbox .eyebrow__rule pattern
                         default: false
    bracketed  boolean — flanking hairline rules (::before + ::after)
                         matches sandbox .eyebrow--bracketed pattern
                         default: false

  Slots:
    default

  Usage:
    <AppEyebrow>The method</AppEyebrow>
    <AppEyebrow :rule="true">What you receive</AppEyebrow>
    <AppEyebrow variant="quiet" :rule="true">Engine</AppEyebrow>
    <AppEyebrow :bracketed="true">Begin</AppEyebrow>
    <AppEyebrow variant="muted" as="span">Common questions</AppEyebrow>

  Sandbox alignment:
    default → .eyebrow (omn-accent, inline-flex, gap 12px, mono, caps, 0.18em)
    quiet   → .eyebrow--quiet
    bracketed → .eyebrow--bracketed (rule before + after)
    rule decoration → ::before/::after pseudo-elements (not child spans)

  Proximity rules (.centered .eyebrow { justify-content: center })
  belong to the consuming molecule scoped styles, not to this atom.
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'accent' | 'quiet' | 'muted'
  as?: string
  rule?: boolean
  bracketed?: boolean
}>(), {
  variant: 'default',
  as: 'p',
  rule: false,
  bracketed: false,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-eyebrow',
      `app-eyebrow--${variant}`,
      { 'app-eyebrow--rule': rule },
      { 'app-eyebrow--bracketed': bracketed },
    ]"
  ><slot /></component>
</template>

<style scoped>
/* ── Base ── */
.app-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--omn-font-mono);
  font-weight: var(--weight-medium);
  font-size: var(--text-xs);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  margin: 0;
}

/* ── Color variants ── */
/* default and accent both map to --omn-accent; accent kept for API compat */
.app-eyebrow--default,
.app-eyebrow--accent  { color: var(--omn-accent); }
.app-eyebrow--quiet   { color: var(--omn-accent-quiet); }
.app-eyebrow--muted   { color: var(--omn-text-tertiary); }

/* ── Rule decoration ──
   Hairline before the label text — matches sandbox .eyebrow__rule <span>.
   Implemented as ::before to keep the template semantic (label text only).
   width: var(--space-6) = 24px; height: 1px — structural hairline constant. */
.app-eyebrow--rule::before {
  content: '';
  display: inline-block;
  width: var(--space-6);
  height: 1px;
  background: currentColor;
  opacity: 0.7;
  flex-shrink: 0;
}

/* ── Bracketed decoration ──
   Hairline before AND after — matches sandbox .eyebrow--bracketed pattern.
   Same styling as ::before; ::after mirrors it. */
.app-eyebrow--bracketed::before,
.app-eyebrow--bracketed::after {
  content: '';
  display: inline-block;
  width: var(--space-6);
  height: 1px;
  background: currentColor;
  opacity: 0.7;
  flex-shrink: 0;
}
</style>
