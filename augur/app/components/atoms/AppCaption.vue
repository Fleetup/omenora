<!--
  AppCaption
  ─────────────────
  Purpose: Small metadata and annotation text — field hints, sub-labels,
  fine print, and technical mono labels.

  Variants:
    default  — general annotation (13px sans, secondary color)
    fine     — fine print / legal dates (11px sans, tertiary color)
    mono     — technical label (11px mono, caps, 0.18em tracking,
               tertiary color) — covers trust strip, volume notations,
               card labels, footer meta/headings

  Props:
    variant  'default' | 'fine' | 'mono'          default: 'default'
    as       string — rendered element             default: 'span'
    color    'primary' | 'secondary' | 'tertiary'  default: undefined
    muted    boolean — opacity 0.3 (separator/decorative chars)
                       default: false

  Slots:
    default

  Usage:
    <AppCaption>Field hint text.</AppCaption>

    <AppCaption variant="fine" as="p">Last Updated: April 20, 2026</AppCaption>

    <AppCaption variant="mono">VOL. I</AppCaption>

    <AppCaption :muted="true" aria-hidden="true">·</AppCaption>
-->

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'fine' | 'mono'
  as?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  muted?: boolean
}>(), {
  variant: 'default',
  as: 'span',
  color: undefined,
  muted: false,
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'app-caption',
      `app-caption--${variant}`,
      color ? `app-caption--color-${color}` : '',
      { 'app-caption--muted': muted },
    ]"
  ><slot /></component>
</template>

<style scoped>
/* ── Base ── */
.app-caption {
  font-family: var(--omn-font-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-body);
  margin: 0;
}

/* ── DEFAULT variant — general annotation / field hint ── */
.app-caption--default {
  font-size: var(--text-sm);
  color: var(--omn-text-secondary);
}

/* ── FINE variant — fine print, legal dates, small disclaimers ── */
.app-caption--fine {
  font-size: var(--text-xs);
  color: var(--omn-text-tertiary);
}

/* ── MONO variant — technical labels, volume/version, footer meta ──
   Covers sandbox: .vol, .card__label, .footer__meta, .footer__h,
   .trust (prose tracking variant), and similar 0.18em mono patterns. */
.app-caption--mono {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}

/* ── Color overrides ── */
.app-caption--color-primary   { color: var(--omn-text-primary); }
.app-caption--color-secondary { color: var(--omn-text-secondary); }
.app-caption--color-tertiary  { color: var(--omn-text-tertiary); }

/* ── Muted: separator / decorative character treatment ── */
.app-caption--muted {
  opacity: 0.3;
}
</style>
