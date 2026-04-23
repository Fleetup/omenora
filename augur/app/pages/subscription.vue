<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="center-page">
    <div class="center-content">
      <div class="logo-mark">
        <div class="logo-ring">
          <div class="logo-dot" />
        </div>
      </div>
      <p class="brand-text">OMENORA</p>
      <p class="status-text">Activating your daily insights...</p>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="hasError" class="center-page">
    <div class="center-content">
      <div class="logo-mark">
        <div class="logo-ring">
          <div class="logo-dot" />
        </div>
      </div>
      <p class="brand-text">OMENORA</p>
      <p class="status-text">Something went wrong. Please contact support.</p>
      <button class="return-btn" style="margin-top: 16px;" @click="navigateTo('/report')">
        Return to Report
      </button>
    </div>
  </div>

  <!-- Success state -->
  <div v-else class="sub-page">
    <!-- Check mark -->
    <div class="check-circle">
      <span class="check-symbol">✦</span>
    </div>

    <h1 class="success-title">You're Subscribed</h1>
    <p class="success-sub">Your first personal daily horoscope arrives tomorrow morning.</p>

    <!-- What to expect -->
    <div class="expect-box">
      <p class="expect-label">What happens next</p>
      <div class="expect-item">
        <span class="expect-dot" />
        <span class="expect-text">Delivered to {{ store.email }} every morning at 7am</span>
      </div>
      <div class="expect-item">
        <span class="expect-dot" />
        <span class="expect-text">Personalized to your exact natal chart</span>
      </div>
      <div class="expect-item" style="margin-bottom: 0;">
        <span class="expect-dot" />
        <span class="expect-text">Cancel anytime from your email</span>
      </div>
    </div>

    <button v-if="store.reportSessionId" class="return-btn" @click="returnToReport">
      Return to Your Report
    </button>
    <button v-else class="return-btn" @click="navigateTo('/')">
      Back to Home
    </button>
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
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

.center-page {
  background: #0a0a0f;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 0 24px;
}

.logo-mark {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.logo-ring {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(180, 150, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(200, 180, 255, 0.9);
}

.brand-text {
  font-size: 13px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.status-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* Success page */
.sub-page {
  background: #0a0a0f;
  min-height: 100vh;
  color: white;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  box-sizing: border-box;
}

.check-circle {
  width: 64px;
  height: 64px;
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px auto 24px;
}

.check-symbol {
  font-size: 24px;
  color: rgba(200, 180, 255, 0.8);
}

.success-title {
  font-size: 22px;
  font-weight: 500;
  color: white;
  text-align: center;
  margin: 0 0 8px;
}

.success-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  margin: 0 0 32px;
}

/* Expect box */
.expect-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.expect-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 16px;
}

.expect-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.expect-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(140, 110, 255, 0.5);
  flex-shrink: 0;
  margin-top: 5px;
}

.expect-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
}

/* Insight preview */
.insight-preview {
  background: rgba(140, 110, 255, 0.05);
  border: 1px solid rgba(140, 110, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.insight-meta {
  font-size: 10px;
  color: rgba(140, 110, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 8px;
}

.insight-greeting {
  font-size: 15px;
  font-weight: 500;
  color: rgba(230, 220, 255, 0.9);
  margin: 0 0 10px;
}

.insight-body {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  margin: 0 0 16px;
}

.insight-freq-box {
  padding: 12px 14px;
  background: rgba(140, 110, 255, 0.04);
  border: 1px solid rgba(140, 110, 255, 0.1);
  border-radius: 8px;
  text-align: center;
}

.insight-freq-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 6px;
}

.insight-freq {
  font-size: 14px;
  font-style: italic;
  color: rgba(200, 180, 255, 0.85);
  margin: 0;
}

/* Return button */
.return-btn {
  width: 100%;
  padding: 14px;
  background: transparent;
  border: 1px solid rgba(140, 110, 255, 0.4);
  border-radius: 10px;
  color: rgba(200, 180, 255, 0.8);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.return-btn:hover {
  border-color: rgba(140, 110, 255, 0.7);
  color: rgba(200, 180, 255, 1);
}
</style>
