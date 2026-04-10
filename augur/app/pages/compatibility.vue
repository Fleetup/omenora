<template>
  <!-- Loading -->
  <div v-if="isLoading" class="center-page">
    <div class="center-content">
      <div class="logo-mark">
        <div class="logo-ring">
          <div class="logo-dot" />
        </div>
      </div>
      <p class="brand-text">OMENORA</p>
      <p class="status-text">Analyzing your compatibility...</p>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="hasError" class="center-page">
    <div class="center-content">
      <div class="logo-mark">
        <div class="logo-ring">
          <div class="logo-dot" />
        </div>
      </div>
      <p class="brand-text">OMENORA</p>
      <p class="status-text">Something went wrong. Please try again.</p>
    </div>
  </div>

  <!-- Report -->
  <div v-else-if="compatibility" class="compat-page">

    <!-- Top bar -->
    <div class="top-bar">
      <p class="top-brand">OMENORA</p>
      <span class="report-label">Compatibility Reading</span>
    </div>

    <!-- Hero: score + title -->
    <div class="hero-block">
      <p class="archetype-label">DESTINY COMPATIBILITY</p>

      <p class="names-line">
        {{ store.firstName }} &amp; {{ store.partnerName }}
      </p>

      <p class="score-display" :style="{ color: scoreColor }">
        {{ compatibility.compatibilityScore }}%
      </p>

      <p class="compat-title-text">{{ compatibility.compatibilityTitle }}</p>
    </div>

    <!-- Sections -->
    <div
      v-for="(key, idx) in SECTION_ORDER"
      :key="key"
      class="section-wrapper"
      :class="{ 'no-border': idx === SECTION_ORDER.length - 1 }"
    >
      <h3 class="section-title">{{ compatibility.sections[key]?.title }}</h3>
      <div v-if="key === 'advice'" class="advice-box">
        {{ compatibility.sections[key]?.content }}
      </div>
      <p v-else class="section-content">{{ compatibility.sections[key]?.content }}</p>
    </div>

    <!-- Share section -->
    <div class="share-section">
      <h3 class="share-title">Share Your Reading</h3>
      <p class="share-subtitle">Download your compatibility card to share with {{ store.partnerName }}</p>
      <button class="download-btn" @click="downloadCompatibilityCard">
        Download Card
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Your Love Compatibility Reading', robots: 'noindex, nofollow' })


const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()

const isLoading = ref(true)
const hasError = ref(false)
const compatibility = ref<any>(null)

const SECTION_ORDER = ['bond', 'strength', 'challenge', 'forecast', 'advice']

const scoreColor = computed(() => {
  const score = compatibility.value?.compatibilityScore || 0
  if (score >= 80) return 'rgba(140, 110, 255, 0.9)'
  if (score >= 60) return 'rgba(200, 150, 50, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
})

onMounted(async () => {
  const sessionId = route.query.session_id as string

  if (!sessionId) {
    navigateTo('/report')
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
    if (!store.partnerName) store.partnerName = meta.partnerName || ''
    if (!store.tempId) store.setTempId(meta.tempId || '')
    if (!store.languageManualOverride && meta.language) store.setLanguage(meta.language)

    const { compatibility: data } = await $fetch<{
      success: boolean
      compatibility: any
    }>('/api/generate-compatibility', {
      method: 'POST',
      body: {
        firstName: store.firstName,
        archetype: store.archetype,
        element: store.report?.element,
        lifePathNumber: store.lifePathNumber,
        powerTraits: store.report?.powerTraits,
        partnerName: store.partnerName,
        partnerDob: store.partnerDob,
        partnerCity: store.partnerCity,
        language: store.language,
      },
    })

    compatibility.value = data

    if (store.email) {
      try {
        await $fetch('/api/send-compatibility-email', {
          method: 'POST',
          body: {
            email: store.email,
            firstName: store.firstName,
            partnerName: store.partnerName,
            compatibility: data,
            language: store.language,
          },
        })
        // Email sent successfully
      } catch {
        console.error('Compatibility email failed')
      }
    }

    isLoading.value = false
  } catch {
    console.error('Compatibility page load failed')
    hasError.value = true
    isLoading.value = false
  }
})

function downloadCompatibilityCard() {
  // TODO: Implement compatibility card download
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

/* ── Shared centered states ── */
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

/* ── Compatibility page ── */
.compat-page {
  background: #0a0a0f;
  min-height: 100vh;
  color: white;
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-brand {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.report-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* Hero */
.hero-block {
  padding: 32px 24px;
  background: linear-gradient(180deg, rgba(140, 110, 255, 0.1) 0%, transparent 100%);
  border-radius: 16px;
  margin-bottom: 32px;
  text-align: center;
}

.archetype-label {
  font-size: 10px;
  color: rgba(140, 110, 255, 0.7);
  letter-spacing: 0.1em;
  margin: 0 0 8px;
}

.names-line {
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px;
}

.score-display {
  font-size: 72px;
  font-weight: 600;
  line-height: 1;
  margin: 0 0 16px;
  letter-spacing: -2px;
}

.compat-title-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  margin: 0;
  font-style: italic;
}

/* Sections */
.section-wrapper {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.section-wrapper.no-border {
  border-bottom: none;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  color: rgba(140, 110, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 10px;
}

.section-content {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
  margin: 0;
}

.advice-box {
  background: rgba(140, 110, 255, 0.08);
  border: 1px solid rgba(140, 110, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  font-size: 17px;
  font-style: italic;
  color: rgba(200, 180, 255, 0.95);
  line-height: 1.6;
  text-align: center;
}

/* Share section */
.share-section {
  margin-top: 48px;
  text-align: center;
}

.share-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px;
}

.share-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 16px;
}

.download-btn {
  background: transparent;
  border: 1px solid rgba(140, 110, 255, 0.4);
  color: rgba(200, 180, 255, 0.8);
  border-radius: 10px;
  padding: 12px 28px;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s, color 0.2s;
}

.download-btn:hover {
  border-color: rgba(140, 110, 255, 0.7);
  color: rgba(200, 180, 255, 1);
}
</style>
