<template>
  <div class="error-page">
    <AppHeader />

    <div class="error-inner">
      <p class="label-caps error-code">
        Error {{ error?.statusCode || '500' }}
      </p>

      <h1 class="font-display-italic error-headline">
        {{ error?.statusCode === 404 ? 'Page not found.' : 'Something went wrong.' }}
      </h1>

      <div class="error-rule" />

      <p class="error-message">
        {{ errorMessage }}
      </p>

      <div class="error-actions">
        <CTAButton @click="handleAction" :arrow="true">
          {{ error?.statusCode === 404 ? 'Back to Omenora' : 'Try again' }}
        </CTAButton>
        <CTAButton v-if="error?.statusCode !== 404" to="/" variant="outline">
          Back to Omenora
        </CTAButton>
      </div>

      <p v-if="error?.statusCode !== 404" class="error-support">
        If the problem persists, contact
        <a href="mailto:support@omenora.com" class="error-support__link">support@omenora.com</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

useSeoMeta({ robots: 'noindex, nofollow' })

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return "The page you're looking for doesn't exist."
  }
  return props.error?.statusMessage
    || props.error?.message
    || 'An unexpected error occurred. Please try again.'
})

const handleAction = () => {
  clearError({ redirect: '/' })
}

const router = useRouter()
router.beforeEach(() => {
  clearError()
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  flex-direction: column;
}

.error-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 48px);
  max-width: 680px;
}

.error-code {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

.error-headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 9vw, 80px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 32px;
  color: var(--color-ink);
}

.error-rule {
  width: 48px;
  height: 1px;
  background: var(--color-ink-mid);
  margin-bottom: 28px;
}

.error-message {
  font-size: var(--text-body);
  line-height: 1.7;
  color: var(--color-ink-mid);
  max-width: 44ch;
  margin-bottom: 36px;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

.error-support {
  font-size: 12px;
  color: var(--color-ink-faint);
  letter-spacing: 0.01em;
}

.error-support__link {
  color: var(--color-ink-mid);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
