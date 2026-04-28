<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : (type || 'button')"
    :disabled="!to && disabled ? true : undefined"
    class="cta-btn"
    :class="[`cta-btn--${variant}`, { 'cta-btn--full': full, 'cta-btn--disabled': !to && disabled }]"
    v-bind="$attrs"
  >
    <span class="cta-btn__label label-caps">
      <slot />
    </span>
    <span v-if="arrow" class="cta-btn__arrow">→</span>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

withDefaults(defineProps<{
  variant?: 'solid' | 'outline'   // default: 'solid'
  to?: string                      // renders as NuxtLink if provided
  type?: 'button' | 'submit'
  arrow?: boolean
  full?: boolean                   // full width
  disabled?: boolean               // button only; ignored for NuxtLink
}>(), {
  variant: 'solid',
})
</script>

<style scoped>
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, transform 0.15s;
  user-select: none;
}

.cta-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.cta-btn:active {
  transform: translateY(0);
}

.cta-btn--solid {
  background: var(--color-ink);
  color: var(--color-bone);
}

.cta-btn--outline {
  background: transparent;
  color: var(--color-ink);
  border: 1px solid rgba(26, 22, 18, 0.4);
}

.cta-btn--outline:hover {
  border-color: var(--color-ink);
}

.cta-btn--full {
  width: 100%;
  justify-content: center;
}

.cta-btn__label {
  font-size: 11px;
}

.cta-btn__arrow {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  line-height: 1;
  margin-top: -1px;
}

.cta-btn:disabled,
.cta-btn[disabled],
.cta-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}
</style>
