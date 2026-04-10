<template>
  <!-- STATE A: Loading -->
  <div v-if="isLoading" class="loading-page">
    <div class="loading-content">
      <div class="orbital-mark">
        <div class="orbit-outer">
          <div class="orbit-planet" />
        </div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="brand-text">OMENORA</p>
      <p :key="currentMessageIndex" class="loading-message">
        {{ loadingMessages[currentMessageIndex] }}
      </p>
      <div class="progress-track">
        <div class="progress-fill" />
      </div>
    </div>
  </div>

  <!-- STATE: Error -->
  <div v-else-if="hasError" class="error-page">
    <div class="error-content">
      <p class="error-text">Something went wrong. Please try again.</p>
      <button class="retry-btn" @click="retryApiCall">Try Again</button>
    </div>
  </div>

  <!-- STATE B: Free preview + paywall -->
  <div v-else class="preview-page">
    <!-- Top bar -->
    <div class="top-bar">
      <span class="brand-text">OMENORA</span>
      <span class="report-badge">{{ t('behavioralReport') }}</span>
    </div>

    <!-- Archetype reveal block -->
    <div class="archetype-block">
      <div class="archetype-glow" aria-hidden="true" />
      <p class="archetype-label">{{ t('yourArchetype') }}</p>
      <span class="archetype-symbol">{{ report.archetypeSymbol }}</span>
      <h2 class="archetype-name">{{ report.archetypeName }}</h2>
      <p class="archetype-meta">{{ report.element }} · Life Path {{ store.lifePathNumber }}</p>
      <div class="traits-row">
        <span v-for="trait in report.powerTraits" :key="trait" class="trait-pill">
          {{ trait }}
        </span>
      </div>
    </div>

    <!-- Free preview: identity section only -->
    <p class="preview-text">{{ report.sections.identity.content }}</p>

    <!-- Blurred locked sections -->
    <div class="locked-wrapper">
      <div class="blurred-content">
        <div class="fake-line" style="width: 90%" />
        <div class="fake-line" style="width: 75%" />
        <div class="fake-line" style="width: 85%" />
      </div>
      <p class="locked-label">🔒 {{ t('sectionsIncluded') }}</p>
    </div>

    <!-- 3-tier pricing selector -->
    <div class="pricing-section">
      <div class="pricing-header">
        <p class="pricing-title">{{ t('chooseReading') }}</p>
        <p class="pricing-subtitle">{{ t('destinyCalculated') }}</p>
      </div>

      <div class="tier-list">

        <!-- Tier 1: Basic (Decoy) -->
        <div
          class="tier-card tier-basic"
          :class="{ 'tier-selected-basic': selectedTier === 1 }"
          @click="selectedTier = 1"
        >
          <div class="tier-info">
            <p class="tier-name">{{ t('basicReport') }}</p>
            <p class="tier-desc">{{ t('basicDesc') }}</p>
          </div>
          <p class="tier-price">$1.99</p>
        </div>

        <!-- Tier 2: Most Popular (Target) -->
        <div
          class="tier-card tier-popular"
          :class="{ 'tier-selected-popular': selectedTier === 2 }"
          @click="selectedTier = 2"
        >
          <div class="tier-badge">★ MOST POPULAR</div>
          <div class="tier-popular-inner">
            <div class="tier-info">
              <p class="tier-name tier-name-popular">{{ t('popularBundle') }}</p>
              <p class="tier-features">❆ {{ t('fullReport') }}<br>❆ {{ t('luckyCalendar') }}<br>❆ {{ t('compatibilityReading') }}</p>
            </div>
            <div class="tier-price-block">
              <p class="tier-price tier-price-popular">$4.99</p>
              <p class="tier-price-note">one-time</p>
            </div>
          </div>
        </div>

        <!-- Tier 3: Full Oracle (Anchor) -->
        <div
          class="tier-card tier-oracle"
          :class="{ 'tier-selected-oracle': selectedTier === 3 }"
          @click="selectedTier = 3"
        >
          <div class="tier-oracle-inner">
            <div class="tier-info">
              <p class="tier-name tier-name-oracle">{{ t('fullOracle') }}</p>
              <p class="tier-features tier-features-oracle">✦ {{ t('fullReport') }}<br>✦ {{ t('luckyCalendar') }}<br>✦ {{ t('compatibilityReading') }}<br>✦ Full birth chart<br>✦ 30 days of daily insights</p>
            </div>
            <div class="tier-price-block">
              <p class="tier-price tier-price-oracle">$12.99</p>
              <p class="tier-price-note tier-price-note-oracle">save $8</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Email input -->
      <div class="email-field-wrapper">
        <label class="email-label">{{ t('emailDelivery') }}</label>
        <input
          type="email"
          :placeholder="t('emailPlaceholder')"
          class="email-input"
          v-model="email"
        />
      </div>

      <!-- CTA Button -->
      <button
        class="unlock-btn"
        :class="{
          'unlock-btn-processing': isProcessingPayment,
          'unlock-btn-basic': selectedTier === 1,
          'unlock-btn-oracle': selectedTier === 3,
        }"
        :disabled="isProcessingPayment || !email"
        @click="handlePayment"
      >
        <span v-if="isProcessingPayment">Processing...</span>
        <span v-else-if="selectedTier === 1">{{ t('unlockBasic') }}</span>
        <span v-else-if="selectedTier === 2">{{ t('unlockPopular') }}</span>
        <span v-else>{{ t('unlockOracle') }}</span>
      </button>

      <p class="trust-note">{{ t('readingExpires') }}</p>
      <p class="trust-secure">{{ t('securedStripe') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Your Destiny Preview', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { t } = useLanguage()

const isLoading = ref(true)
const hasError = ref(false)
const currentMessageIndex = ref(0)

const loadingMessages = computed(() => [
  t('processingProfile'),
  t('mappingPatterns'),
  t('calculatingArchetype'),
  t('generatingReport'),
])

const report = computed(() => store.report)

let messageInterval: ReturnType<typeof setInterval> | null = null

function startMessageCycle() {
  currentMessageIndex.value = 0
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % loadingMessages.value.length
  }, 2000)
}

function stopMessageCycle() {
  if (messageInterval) {
    clearInterval(messageInterval)
    messageInterval = null
  }
}

async function triggerApiCall() {
  isLoading.value = true
  hasError.value = false
  startMessageCycle()

  try {
    const data = await $fetch<{ success: boolean; report: any }>('/api/generate-report', {
      method: 'POST',
      body: {
        firstName: store.firstName,
        dateOfBirth: store.dateOfBirth,
        city: store.city,
        answers: store.answers,
        archetype: store.archetype,
        lifePathNumber: store.lifePathNumber,
        region: store.region,
        timeOfBirth: store.timeOfBirth,
        language: store.language,
      },
    })
    store.setReport(data.report)

    const tempId = `temp_${Date.now()}_${store.firstName}`
    store.setTempId(tempId)

    try {
      await $fetch('/api/save-report', {
        method: 'POST',
        body: {
          sessionId: tempId,
          report: data.report,
          firstName: store.firstName,
          archetype: store.archetype,
          lifePathNumber: store.lifePathNumber,
          answers: store.answers,
          city: store.city,
          dateOfBirth: store.dateOfBirth,
          region: store.region,
          email: store.email,
        },
      })
    } catch {
      // Report save failed, continue without saving
    }

    isLoading.value = false
  } catch {
    hasError.value = true
    isLoading.value = false
  } finally {
    stopMessageCycle()
  }
}

async function retryApiCall() {
  await triggerApiCall()
}

onMounted(async () => {
  if (!store.firstName) {
    await navigateTo('/analysis')
    return
  }
  await triggerApiCall()
})

onUnmounted(() => {
  stopMessageCycle()
})

const email = ref('')
const isProcessingPayment = ref(false)
const selectedTier = ref<1 | 2 | 3>(2)

async function handlePayment() {
  if (isProcessingPayment.value) return
  if (!email.value) return
  isProcessingPayment.value = true

  store.setEmail(email.value)

  try {
    let endpoint = '/api/create-payment'

    if (selectedTier.value === 2) {
      endpoint = '/api/create-bundle-payment'
    } else if (selectedTier.value === 3) {
      endpoint = '/api/create-oracle-payment'
    }

    const { url } = await $fetch<{ sessionId: string; url: string | null }>(endpoint, {
      method: 'POST',
      body: {
        email: email.value,
        firstName: store.firstName,
        archetype: store.archetype,
        lifePathNumber: store.lifePathNumber,
        dateOfBirth: store.dateOfBirth,
        timeOfBirth: store.timeOfBirth,
        tempId: store.tempId,
        region: store.region,
        language: store.language,
        origin: window.location.origin,
      },
    })

    if (url) window.location.href = url
  } catch {
    console.error('Payment processing failed')
    isProcessingPayment.value = false
  }
}
</script>

<style scoped>
/* ── Loading page ── */
.loading-page {
  background: #050410;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ── Orbital mark ── */
.orbital-mark {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-outer {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(201, 168, 76, 0.3);
  animation: orbit-spin 18s linear infinite;
}

.orbit-planet {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.85);
  box-shadow: 0 0 6px rgba(201, 168, 76, 0.5);
}

.orbit-inner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(140, 110, 255, 0.2);
}

.orbit-center {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(200, 180, 255, 0.9);
  box-shadow: 0 0 8px rgba(180, 150, 255, 0.6);
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Loading text ── */
.brand-text {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-message {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.48);
  min-height: 28px;
  text-align: center;
  margin: 0;
  animation: fadeInMsg 0.45s ease;
  max-width: 280px;
  line-height: 1.5;
}

.progress-track {
  width: 160px;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

@keyframes fillProgress {
  from { width: 0%; }
  to { width: 95%; }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(140, 110, 255, 0.55), rgba(201, 168, 76, 0.55));
  animation: fillProgress 8s ease-out forwards;
}

/* ── Error page ── */
.error-page {
  background: #050410;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 0 24px;
}

.error-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.retry-btn {
  background: transparent;
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: 3px;
  padding: 12px 32px;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.78);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(201, 168, 76, 0.08);
  border-color: rgba(201, 168, 76, 0.6);
}

/* ── Preview page ── */
.preview-page {
  background: #050410;
  min-height: 100vh;
  color: white;
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  box-sizing: border-box;
}

/* ── Top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-bar .brand-text {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

.report-badge {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.6);
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: 2px;
  padding: 3px 10px;
}

/* ── Archetype block ── */
.archetype-block {
  position: relative;
  border-left: 2px solid rgba(201, 168, 76, 0.38);
  padding: 24px 24px 24px 28px;
  margin-bottom: 24px;
  overflow: hidden;
}

.archetype-glow {
  position: absolute;
  top: 50%;
  left: -80px;
  transform: translateY(-50%);
  width: 280px;
  height: 200px;
  background: radial-gradient(ellipse at left center, rgba(201, 168, 76, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.archetype-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.62);
  margin: 0 0 12px;
  text-transform: uppercase;
}

.archetype-symbol {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.8;
}

.archetype-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.01em;
}

.archetype-meta {
  font-size: 12px;
  color: rgba(140, 110, 255, 0.58);
  margin: 8px 0 0;
  letter-spacing: 0.04em;
}

.traits-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.trait-pill {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  padding: 4px 10px;
  background: transparent;
}

/* ── Free preview text ── */
.preview-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.82;
  padding: 0;
  margin: 0 0 20px;
}

/* ── Locked sections ── */
.locked-wrapper {
  position: relative;
  margin-bottom: 24px;
  overflow: hidden;
}

.blurred-content {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  filter: blur(5px);
  opacity: 0.35;
}

.fake-line {
  height: 7px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  margin-bottom: 9px;
}

.fake-line:last-child {
  margin-bottom: 0;
}

.locked-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.32);
  text-align: center;
  margin: 10px 0 0;
  letter-spacing: 0.04em;
}

/* ── Pricing section ── */
.pricing-section {
  margin-top: 24px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 20px;
}

.pricing-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.pricing-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.27);
  margin: 0;
  line-height: 1.5;
}

/* ── Tier list ── */
.tier-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Tier card base ── */
.tier-card {
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s, opacity 0.2s;
}

/* Tier 1: Basic */
.tier-basic {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.62;
}

.tier-basic:hover {
  opacity: 0.85;
}

.tier-info {
  flex: 1;
}

.tier-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin: 0 0 2px;
}

.tier-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  margin: 0;
}

.tier-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.42);
  margin: 0;
}

/* Tier 2: Popular */
.tier-popular {
  background: rgba(140, 110, 255, 0.07);
  border: 1px solid rgba(140, 110, 255, 0.18);
  border-left: 2px solid rgba(201, 168, 76, 0.65);
  position: relative;
  padding-top: 22px;
}

.tier-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(201, 168, 76, 0.92);
  color: #050410;
  font-size: 9px;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 2px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.tier-popular-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tier-name-popular {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 8px;
}

.tier-features {
  font-size: 11px;
  color: rgba(200, 180, 255, 0.6);
  line-height: 1.72;
  margin: 0;
}

.tier-price-block {
  text-align: right;
  flex-shrink: 0;
}

.tier-price-popular {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 300;
  color: rgba(200, 180, 255, 0.95);
  margin: 0;
}

.tier-price-note {
  font-size: 10px;
  color: rgba(140, 110, 255, 0.42);
  margin: 2px 0 0;
}

/* Tier 3: Oracle */
.tier-oracle {
  background: rgba(201, 168, 76, 0.04);
  border: 1px solid rgba(201, 168, 76, 0.18);
  border-radius: 10px;
}

.tier-oracle-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tier-name-oracle {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 215, 130, 0.78);
  margin: 0 0 8px;
}

.tier-features-oracle {
  font-size: 11px;
  color: rgba(201, 168, 76, 0.42);
  line-height: 1.72;
  margin: 0;
}

.tier-price-oracle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 300;
  color: rgba(201, 168, 76, 0.62);
  margin: 0;
}

.tier-price-note-oracle {
  font-size: 10px;
  color: rgba(201, 168, 76, 0.38);
  margin: 2px 0 0;
}

/* ── Selected states ── */
.tier-selected-basic {
  opacity: 1;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14);
}

.tier-selected-popular {
  box-shadow: 0 0 22px rgba(140, 110, 255, 0.22), 0 0 0 1px rgba(201, 168, 76, 0.45);
  border-left-color: rgba(201, 168, 76, 0.95);
}

.tier-selected-oracle {
  box-shadow: 0 0 18px rgba(201, 168, 76, 0.14), 0 0 0 1px rgba(201, 168, 76, 0.32);
}

/* ── Email input ── */
.email-field-wrapper {
  margin-top: 16px;
  margin-bottom: 0;
  text-align: left;
}

.email-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.22);
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.email-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 13px 14px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.25s, background 0.25s;
}

.email-input:focus {
  border-color: rgba(201, 168, 76, 0.4);
  background: rgba(201, 168, 76, 0.025);
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.18);
}

/* ── Unlock CTA button ── */
.unlock-btn {
  background: rgba(140, 110, 255, 0.88);
  border: none;
  border-radius: 6px;
  padding: 17px 16px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.04em;
  transition: background 0.22s, box-shadow 0.22s;
  margin-top: 12px;
}

.unlock-btn:hover:not(:disabled) {
  background: rgba(140, 110, 255, 1);
  box-shadow: 0 4px 28px rgba(140, 110, 255, 0.28);
}

.unlock-btn-basic {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.unlock-btn-basic:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.unlock-btn-oracle {
  background: transparent;
  border: 1px solid rgba(201, 168, 76, 0.5);
  color: rgba(201, 168, 76, 0.88);
}

.unlock-btn-oracle:hover:not(:disabled) {
  background: rgba(201, 168, 76, 0.1);
  border-color: rgba(201, 168, 76, 0.75);
  box-shadow: 0 4px 20px rgba(201, 168, 76, 0.1);
}

.unlock-btn-processing {
  opacity: 0.62;
  cursor: default;
}

/* ── Trust signals ── */
.trust-note {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.22);
  text-align: center;
  margin: 12px 0 0;
  line-height: 1.6;
}

.trust-secure {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.14);
  text-align: center;
  margin: 4px 0 0;
}
</style>
