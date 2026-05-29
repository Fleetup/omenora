<script setup lang="ts">
interface Props {
  /** Short headline — rendered as AppHeadline h2. */
  title: string
  /** Explanatory body copy. */
  message: string
  /** Primary action label (required). */
  primaryLabel: string
  /** Render primary as an anchor to this href. Mutually exclusive with primaryAction. */
  primaryHref?: string
  /** Render primary as a button invoking this handler. Mutually exclusive with primaryHref. */
  primaryAction?: () => void
  /** Optional secondary action label. */
  secondaryLabel?: string
  /** Secondary rendered as an anchor. */
  secondaryHref?: string
}

defineProps<Props>()
</script>

<template>
  <div class="error-state" role="alert">
    <div class="error-state__inner">
      <AppEyebrow class="error-state__eyebrow">Something went wrong</AppEyebrow>

      <AppHeadline as="h2" class="error-state__title">{{ title }}</AppHeadline>

      <p class="error-state__message">{{ message }}</p>

      <div class="error-state__actions">
        <a
          v-if="primaryHref"
          :href="primaryHref"
          class="error-state__btn error-state__btn--primary"
        >{{ primaryLabel }}</a>
        <button
          v-else-if="primaryAction"
          class="error-state__btn error-state__btn--primary"
          @click="primaryAction"
        >{{ primaryLabel }}</button>

        <a
          v-if="secondaryHref && secondaryLabel"
          :href="secondaryHref"
          class="error-state__link"
        >{{ secondaryLabel }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-state {
  background: var(--omn-surface-base);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;
}

.error-state__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 480px;
  width: 100%;
}

.error-state__eyebrow {
  margin: 0;
  color: var(--omn-text-tertiary);
}

.error-state__title {
  margin: 0;
}

.error-state__message {
  font-family: var(--omn-font-body);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.65;
  color: var(--omn-text-secondary);
  margin: 0;
}

.error-state__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
}

.error-state__btn--primary {
  display: inline-block;
  background: var(--omn-text-primary);
  color: var(--omn-surface-base);
  font-family: var(--omn-font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  padding: 12px 28px;
  cursor: pointer;
  transition: opacity var(--omn-duration-base) var(--omn-ease);
}

.error-state__btn--primary:hover {
  opacity: 0.85;
}

.error-state__link {
  font-family: var(--omn-font-body);
  font-size: 12px;
  color: var(--omn-text-tertiary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--omn-duration-base) var(--omn-ease);
}

.error-state__link:hover {
  color: var(--omn-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .error-state__btn--primary,
  .error-state__link {
    transition: none;
  }
}
</style>
