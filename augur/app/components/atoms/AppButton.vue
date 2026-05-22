<!--
  AppButton — Universal interactive element atom.

  Purpose:
    Replaces CTAButton. Renders a <button>, <NuxtLink>, or <a> element
    depending on which routing props are provided. Three visual variants
    (primary, secondary, ghost) and three sizes (sm, md, lg). Includes
    entrance pulse animation (primary variant only), loading state with
    animated dots, disabled handling for all render modes, and full
    reduced-motion support.

  Props:
    variant   'primary' | 'secondary' | 'ghost'   default: 'primary'
    size      'sm' | 'md' | 'lg'                  default: 'md'
    to        string (optional) — renders as NuxtLink (client-side route)
    href      string (optional) — renders as <a> (external link)
    type      'button' | 'submit'                 default: 'button'
    arrow     boolean  — appends trailing "→"     default: false
    full      boolean  — width: 100%              default: false
    disabled  boolean                              default: false
    loading   boolean  — shows animated dots, sets aria-busy   default: false

  Slots:
    default (required) — button label text

  Rendering logic:
    `to` set   → NuxtLink (client-side routing)
    `href` set → <a>     (external link, `to` takes precedence)
    neither    → <button>

  Animation:
    Primary variant: ctaPulse entrance animation on mount.
    Callers may set `--cta-pulse-delay` via inline style for staggered
    entrances (e.g., style="--cta-pulse-delay: 400ms").

  Usage:
    <AppButton variant="primary" size="md" to="/analysis" :arrow="true">
      Begin the reading
    </AppButton>

    <AppButton variant="secondary" href="https://example.com">
      Learn more
    </AppButton>

    <AppButton variant="ghost" size="sm">
      Sign in
    </AppButton>

    <AppButton variant="primary" :loading="isSubmitting" type="submit">
      Submit
    </AppButton>
-->

<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  type?: 'button' | 'submit'
  arrow?: boolean
  full?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  arrow: false,
  full: false,
  disabled: false,
  loading: false,
})

const elementType = computed(() => {
  if (props.to) return NuxtLink
  if (props.href) return 'a'
  return 'button'
})

const isLink = computed(() => !!props.to || !!props.href)
const isDisabled = computed(() => props.disabled || props.loading)

const elementAttrs = computed(() => {
  if (props.to) {
    return {
      to: props.to,
      'aria-disabled': props.disabled || undefined,
      'aria-busy': props.loading || undefined,
    }
  }
  if (props.href) {
    return {
      href: props.href,
      'aria-disabled': props.disabled || undefined,
      'aria-busy': props.loading || undefined,
    }
  }
  return {
    type: props.type,
    disabled: isDisabled.value || undefined,
    'aria-busy': props.loading || undefined,
  }
})
</script>

<template>
  <component
    :is="elementType"
    v-bind="elementAttrs"
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      {
        'app-button--full': full,
        'app-button--disabled': isDisabled && isLink,
      },
    ]"
  >
    <span v-if="loading" class="app-button__loading" aria-hidden="true">
      <span class="app-button__dot" />
      <span class="app-button__dot" />
      <span class="app-button__dot" />
    </span>
    <span v-else class="app-button__label">
      <slot />
    </span>
    <span v-if="arrow && !loading" class="app-button__arrow" aria-hidden="true">→</span>
  </component>
</template>

<style scoped>
/* ── Base ── */
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 10px gap between label and arrow — optical constant from CTAButton.
     No --space-* token maps to exactly 10px (scale goes 8px→12px). */
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  line-height: var(--leading-tight);
  white-space: nowrap;
  border: none;
  border-radius: var(--radius-md);
  user-select: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color           var(--duration-fast) var(--ease-out),
    border-color    var(--duration-fast) var(--ease-out),
    transform       var(--duration-base) var(--ease-out),
    box-shadow      var(--duration-base) var(--ease-out);
}

/* ── Sizes ── */
.app-button--sm {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-xs);
}

.app-button--md {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-xs);
}

.app-button--lg {
  padding: var(--space-5) var(--space-10);
  font-size: var(--text-sm);
}

/* ── Full width ── */
.app-button--full {
  width: 100%;
}

/* ── Label ── */
.app-button__label {
  font-size: inherit;
  line-height: inherit;
}

/* ── Arrow ── */
.app-button__arrow {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1;
  margin-top: -1px; /* optical vertical alignment with label text */
}

/* ── Loading dots ── */
.app-button__loading {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.app-button__dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: var(--radius-full);
  background-color: currentColor;
  animation: appButtonDotPulse 1200ms var(--ease-out) infinite;
}

.app-button__dot:nth-child(1) { animation-delay: 0ms; }
.app-button__dot:nth-child(2) { animation-delay: 200ms; }
.app-button__dot:nth-child(3) { animation-delay: 400ms; }

@keyframes appButtonDotPulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40%           { opacity: 1;    transform: scale(1); }
}

/* ── PRIMARY variant ── */
.app-button--primary {
  background-color: var(--cta-primary);
  color: var(--text-primary);
  /* Entrance pulse animation. --cta-pulse-delay can be set by callers via
     inline style for staggered entrances (e.g. style="--cta-pulse-delay:400ms"). */
  animation: ctaPulse var(--duration-base) cubic-bezier(0.16, 1, 0.3, 1) var(--cta-pulse-delay, 800ms) 1;
  animation-fill-mode: backwards;
}

.app-button--primary:hover:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
  background-color: var(--cta-hover);
  box-shadow: var(--shadow-glow-cta);
  transform: translateY(-2px);
}

.app-button--primary:active:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
  transform: translateY(0);
}

/* ── SECONDARY variant ── */
.app-button--secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
}

.app-button--secondary:hover:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
  border-color: var(--text-primary);
}

.app-button--secondary:active:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
  transform: translateY(0);
}

/* ── GHOST variant ── */
.app-button--ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
}

.app-button--ghost:hover:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
  color: var(--text-primary);
}

/* ── FOCUS-VISIBLE (all variants) ── */
.app-button:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}

/* ── DISABLED state ── */
/* <button> native disabled attribute */
.app-button:disabled,
/* aria-disabled for NuxtLink / <a> variants */
.app-button[aria-disabled="true"],
/* loading state shares same visual treatment */
.app-button--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
  transform: none;
  box-shadow: none;
}

/* ── ENTRANCE PULSE animation (primary only) ── */
@keyframes ctaPulse {
  0%   { box-shadow: 0 0 0 0 var(--accent-gold-glow); }
  55%  { box-shadow: 0 0 32px 2px var(--accent-gold-glow); }
  100% { box-shadow: 0 0 0 0 var(--accent-gold-glow); }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  /* Suppress entrance pulse entirely */
  .app-button--primary {
    animation: none;
  }

  /* Replace transform-based hover with opacity-only */
  .app-button--primary:hover:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
    transform: none;
    opacity: 0.9;
  }

  .app-button--secondary:hover:not(:disabled):not([aria-disabled="true"]):not(.app-button--disabled) {
    transform: none;
    opacity: 0.9;
  }

  /* Zero out transform durations */
  .app-button {
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color           var(--duration-fast) var(--ease-out),
      border-color    var(--duration-fast) var(--ease-out),
      transform       0ms var(--ease-out),
      box-shadow      0ms var(--ease-out);
  }

  /* Slow loading dots to a near-static fade, no scale */
  .app-button__dot {
    animation: appButtonDotPulseReduced 2400ms var(--ease-out) infinite;
  }

  .app-button__dot:nth-child(1) { animation-delay: 0ms; }
  .app-button__dot:nth-child(2) { animation-delay: 800ms; }
  .app-button__dot:nth-child(3) { animation-delay: 1600ms; }

  @keyframes appButtonDotPulseReduced {
    0%, 100% { opacity: 0.25; }
    50%      { opacity: 1; }
  }
}
</style>
