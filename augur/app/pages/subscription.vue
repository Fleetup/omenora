<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="sub-center-page">
    <PhoenixLoader :size="72" />
    <p class="annotation sub-center-page__text">Activating your daily insights…</p>
  </div>

  <!-- Error state -->
  <div v-else-if="hasError" class="sub-center-page">
    <p class="label-caps sub-center-page__text" style="color: #8B2500;">Something went wrong.</p>
    <p class="sub-center-page__sub">Please contact support@omenora.com</p>
    <button class="sub-return-btn label-caps" @click="navigateTo('/report')">
      Return to Report
    </button>
  </div>

  <!-- Success state -->
  <div v-else class="sub-success-page">
    <AppHeader />

    <div class="sub-success-body">
      <p class="label-caps sub-success__eyebrow">Subscription confirmed</p>
      <h1 class="sub-success__headline font-display-italic">You're subscribed.</h1>
      <div class="editorial-rule" />
      <p class="sub-success__sub">Your first personal daily horoscope arrives tomorrow morning.</p>

      <div class="sub-expect-box">
        <p class="label-caps sub-expect-box__label">What happens next</p>
        <div class="sub-expect-item">
          <span class="sub-expect-item__icon">✦</span>
          <span class="sub-expect-item__text">Delivered to {{ store.email }} every morning at 7am</span>
        </div>
        <div class="sub-expect-item">
          <span class="sub-expect-item__icon">✦</span>
          <span class="sub-expect-item__text">Personalized to your exact natal chart</span>
        </div>
        <div class="sub-expect-item">
          <span class="sub-expect-item__icon">✦</span>
          <span class="sub-expect-item__text">Cancel anytime from your account</span>
        </div>
      </div>

      <CTAButton v-if="store.reportSessionId" @click="returnToReport" :arrow="true">
        Return to your report
      </CTAButton>
      <CTAButton v-else to="/" :arrow="true">Back to home</CTAButton>

      <p class="sub-account-note">
        Manage your subscription any time in
        <NuxtLink to="/account">your account →</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'

useSeoMeta({ title: 'Daily Cosmic Insights Subscription', robots: 'noindex, nofollow' })


const store = useAnalysisStore()
const route = useRoute()

const isLoading = ref(true)
const hasError = ref(false)

function returnToReport() {
  const sessionId = store.reportSessionId
  if (sessionId) {
    navigateTo(`/report?session_id=${sessionId}`)
  } else {
    navigateTo('/')
  }
}

onMounted(async () => {
  const sessionId = route.query.session_id as string

  if (!sessionId) {
    navigateTo('/')
    return
  }

  try {
    const paymentData = await $fetch<{
      paid: boolean
      customerEmail: string | null
      metadata: Record<string, string> | null
    }>('/api/verify-payment', {
      method: 'POST',
      body: { sessionId },
    })

    if (!paymentData.paid) {
      navigateTo('/report')
      return
    }

    const meta = paymentData.metadata || {}
    if (!store.firstName) store.firstName = meta.firstName || ''
    if (!store.email) store.setEmail(meta.email || paymentData.customerEmail || '')
    if (!store.archetype) store.setArchetype(meta.archetype || '')
    if (!store.lifePathNumber && meta.lifePathNumber) store.lifePathNumber = Number.parseInt(meta.lifePathNumber)
    if (meta.region) store.setRegion(meta.region, store.country)

    store.setSubscriptionActive(true)

    isLoading.value = false
  } catch {
    console.error('Subscription page failed')
    isLoading.value = false
    hasError.value = true
  }
})
</script>

<style scoped>
/* ── Loading / error centered states ── */
.sub-center-page {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 24px;
}

.sub-center-page__text {
  color: var(--color-ink-faint);
  margin: 0;
}

.sub-center-page__sub {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 13px;
  color: var(--color-ink-faint);
  margin: 0;
}

.sub-return-btn {
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.sub-return-btn:hover {
  opacity: 0.85;
}

/* ── Success page ── */
.sub-success-page {
  min-height: 100vh;
  background: var(--color-bone);
}

.sub-success-body {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 72px) clamp(24px, 5vw, 48px) 80px;
}

.sub-success__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

.sub-success__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 10vw, 72px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  margin: 0 0 24px;
}

.sub-success__sub {
  font-size: 16px;
  color: var(--color-ink-mid);
  line-height: 1.65;
  margin: 20px 0 32px;
}

/* ── Expect box ── */
.sub-expect-box {
  border: 1px solid var(--color-ink-ghost);
  padding: 24px;
  margin-bottom: 32px;
}

.sub-expect-box__label {
  color: var(--color-ink-faint);
  display: block;
  margin-bottom: 16px;
}

.sub-expect-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.sub-expect-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.sub-expect-item__icon {
  font-size: 10px;
  color: var(--color-gold);
  flex-shrink: 0;
  margin-top: 3px;
}

.sub-expect-item__text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 13px;
  color: var(--color-ink-mid);
  line-height: 1.55;
}

/* ── Account note ── */
.sub-account-note {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  color: var(--color-ink-faint);
  margin-top: 20px;
  letter-spacing: 0.04em;
}

.sub-account-note a {
  color: var(--color-ink-mid);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
