<template>
  <!-- ── Loading ── -->
  <div v-if="isLoading" class="center-page" aria-live="polite">
    <div class="center-content">
      <OrbitalMark />
      <p class="brand-text">OMENORA</p>
      <p class="status-text">{{ t('analyzingCompat') }}</p>
    </div>
  </div>

  <!-- ── Error (post-payment path) ── -->
  <div v-else-if="hasError && !isPreviewMode" class="center-page">
    <div class="center-content">
      <OrbitalMark />
      <p class="brand-text">OMENORA</p>
      <p class="status-text">{{ t('somethingWrong') }}</p>
    </div>
  </div>

  <!-- ── Session expired (preview path, no store data) ── -->
  <div v-else-if="isPreviewMode && !previewData" class="center-page">
    <div class="center-content">
      <p class="brand-text">OMENORA</p>
      <p class="status-text" style="max-width: 260px; line-height: 1.6;">Session expired. Start the quiz again to see your reading.</p>
      <button class="retry-btn" @click="navigateTo('/compatibility-quiz')">Restart the quiz</button>
    </div>
  </div>

  <!-- ── CASE A: Full post-payment report ── -->
  <div v-else-if="!isPreviewMode && compatibility" class="compat-page">

    <div class="top-bar">
      <p class="top-brand">OMENORA</p>
      <span class="report-label">{{ t('compatReading') }}</span>
    </div>

    <!-- Hero -->
    <div class="hero-block">
      <p class="archetype-label">{{ t('destinyCompat') }}</p>
      <p class="names-line">{{ store.firstName || 'You' }} &amp; {{ store.partnerName || 'Them' }}</p>
      <p class="score-display" :style="{ color: scoreColor }">{{ compatibility.compatibilityScore }}%</p>
      <p class="compat-title-text">{{ compatibility.compatibilityTitle }}</p>
    </div>

    <!-- All 5 sections (post-payment full read) -->
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

    <!-- Share -->
    <div class="share-section">
      <h3 class="share-title">{{ t('shareYourReading') }}</h3>
      <p class="share-subtitle">{{ t('shareCompatSubtitle').replace('{name}', store.partnerName) }}</p>
    </div>
  </div>

  <!-- ── CASE B / C: Preview state ── -->
  <div v-else-if="isPreviewMode && previewData" class="preview-page">

    <!-- Top bar -->
    <div class="top-bar">
      <p class="top-brand">OMENORA</p>
      <span class="preview-badge">FREE PREVIEW</span>
    </div>

    <!-- Checkout canceled banner (CASE C) -->
    <div v-if="isCanceled" class="canceled-banner" role="status">
      Checkout canceled. Your reading is still here when you're ready.
    </div>

    <!-- Hero (same structure as full report) -->
    <div class="hero-block hero-block--preview">
      <p class="archetype-label">DESTINY COMPATIBILITY</p>
      <p class="names-line">{{ displayMyName }} &amp; {{ displayTheirName }}</p>
      <p class="score-display" :style="{ color: previewScoreColor }">{{ previewData.compatibilityScore }}%</p>
      <p class="compat-title-text">{{ previewData.compatibilityTitle }}</p>
    </div>

    <!-- Challenge section (full, visible — the hook) -->
    <div class="section-wrapper challenge-section">
      <div class="challenge-badge">THE TENSION YOU MUST NAVIGATE</div>
      <h3 class="section-title section-title--challenge">{{ previewData.sections?.challenge?.title }}</h3>
      <p class="section-content">{{ previewData.sections?.challenge?.content }}</p>
    </div>

    <!-- Locked sections (bond, strength, forecast, advice) -->
    <div class="locked-sections-strip">
      <div class="locked-header">
        <span class="lock-icon">🔒</span>
        <span class="locked-strip-label">Still locked in your reading:</span>
      </div>
      <div class="locked-cards">
        <div v-for="key in LOCKED_SECTIONS" :key="key" class="locked-card">
          <div class="locked-card-header">
            <span class="lock-icon-sm">🔒</span>
            <span class="locked-card-title">{{ previewData.sections?.[key]?.title || LOCKED_FALLBACK_TITLES[key] }}</span>
          </div>
          <div class="blurred-preview">
            <p>{{ LOCKED_PLACEHOLDER_TEXT[key] }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Calculation receipt -->
    <div class="calc-receipt">
      <p class="calc-receipt-header">How we calculated this</p>
      <p class="calc-receipt-body">
        Born {{ formatDob(store.dateOfBirth) }}{{ store.city ? ' in ' + store.city : '' }}
        · Born {{ formatDob(store.partnerDob) }}{{ store.partnerCity ? ' in ' + store.partnerCity : '' }}
      </p>
      <p class="calc-receipt-meta">Western (Tropical) · Calculated with Swiss Ephemeris</p>
    </div>

    <!-- Trust banner -->
    <p class="trust-banner">Not a $1 soulmate sketch. Not a psychic chat. Just real birth charts compared.</p>

    <!-- Paywall -->
    <div class="paywall-block">
      <h2 class="paywall-heading">Unlock your full reading</h2>
      <p class="paywall-sub">{{ previewData.compatibilityScore }}% is just the surface. The bond, strength, forecast, and one piece of advice — written for this exact connection.</p>

      <!-- Name + email capture -->
      <div class="email-capture-card">
        <label class="email-label" for="compat-my-name">Your first name</label>
        <input
          id="compat-my-name"
          v-model="myNameInput"
          type="text"
          placeholder="Your first name"
          autocomplete="given-name"
          maxlength="50"
          class="email-input"
          @focus="trackEvent('name_field_focused')"
        >
        <label class="email-label email-label--spaced" for="compat-their-name">Their first name</label>
        <input
          id="compat-their-name"
          v-model="theirNameInput"
          type="text"
          placeholder="Their first name"
          autocomplete="off"
          maxlength="50"
          class="email-input"
          @focus="trackEvent('name_field_focused')"
        >
        <label class="email-label email-label--spaced" for="compat-email">Where should we send your reading?</label>
        <input
          id="compat-email"
          v-model="emailInput"
          type="email"
          placeholder="your@email.com"
          autocomplete="email"
          class="email-input"
          @focus="trackEvent('email_field_focused')"
          @blur="onEmailBlur"
        >
      </div>

      <!-- Subscription email prompt -->
      <p v-if="emailPrompt" class="email-prompt-msg" role="alert">Please enter your email to start the subscription.</p>

      <!-- Checkout error -->
      <div v-if="checkoutError" class="checkout-error-msg" role="alert">
        {{ checkoutError }}
      </div>

      <!-- Option 1: Subscription (primary) -->
      <div class="pay-card pay-card--primary">
        <div class="pay-card-badge">RECOMMENDED</div>
        <p class="pay-card-name">Compatibility Plus</p>
        <p class="pay-card-price">$9.99<span class="pay-card-freq"> / month</span></p>
        <ul class="pay-card-bullets">
          <li>Unlimited compatibility readings (any pairing)</li>
          <li>Weekly relationship transit forecasts</li>
          <li>Daily personalized horoscope</li>
          <li>Save up to 10 people for ongoing tracking</li>
        </ul>
        <button
          class="pay-btn pay-btn--primary"
          :class="{ 'pay-btn--processing': isProcessing && activeTier === 'subscription' }"
          :disabled="isProcessing"
          @click="handleCheckout('subscription')"
        >
          <span v-if="isProcessing && activeTier === 'subscription'">Processing…</span>
          <span v-else>Start subscription — $9.99/month</span>
        </button>
        <p class="pay-btn-footnote">Cancel anytime in 1 click. No hidden trial.</p>
        <p class="pay-btn-footnote">Next charge: {{ nextChargeDate }}</p>
        <p class="pay-btn-footnote pay-btn-footnote--muted">Apple Pay &amp; Google Pay accepted</p>
      </div>

      <!-- Option 2: Single (secondary) -->
      <div class="pay-card pay-card--secondary">
        <p class="pay-card-name">Just this reading</p>
        <p class="pay-card-price">$7.99<span class="pay-card-freq"> one-time</span></p>
        <ul class="pay-card-bullets">
          <li>Full compatibility analysis for this pairing only</li>
          <li>All 5 sections unlocked</li>
          <li>PDF export</li>
        </ul>
        <button
          class="pay-btn pay-btn--secondary"
          :class="{ 'pay-btn--processing': isProcessing && activeTier === 'single' }"
          :disabled="isProcessing"
          @click="handleCheckout('single')"
        >
          <span v-if="isProcessing && activeTier === 'single'">Processing…</span>
          <span v-else>Get this reading — $7.99</span>
        </button>
      </div>

      <!-- Guarantee & trust signals -->
      <div class="guarantee-block">
        <p class="guarantee-text">✦ If it doesn't feel like it was written for you, full refund within 24 hours. No form to fill.</p>
      </div>
      <p class="trust-secure">Secure payment by Stripe</p>
    </div>

    <!-- Footer -->
    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link">Privacy Policy</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link">Terms of Service</NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Your Love Compatibility Reading', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()
const { $trackCustomEvent } = useNuxtApp() as any

function trackEvent(name: string, props?: Record<string, unknown>) {
  try { $trackCustomEvent?.(name, props ?? {}) } catch { /* never block UI */ }
}

// ── Shared section order ───────────────────────────────────────────────────────
const SECTION_ORDER = ['bond', 'strength', 'challenge', 'forecast', 'advice']
const LOCKED_SECTIONS = ['bond', 'strength', 'forecast', 'advice'] as const

const LOCKED_FALLBACK_TITLES: Record<string, string> = {
  bond:     'The Bond Between You',
  strength: 'Your Shared Strength',
  forecast: '12-Month Relationship Forecast',
  advice:   'One Piece of Advice',
}

const LOCKED_PLACEHOLDER_TEXT: Record<string, string> = {
  bond:     'The gravitational pull between your charts reveals a pattern that most couples never identify — a shared frequency that either becomes your greatest resource or your blind spot.',
  strength: 'Hidden inside this pairing is a specific combination of planetary placements that creates unusual resilience under pressure. This section maps exactly where that strength lives.',
  forecast: 'The next 12 months carry three distinct windows for this connection — one that opens in the next 60 days, and two that require you to pay attention to specific planetary shifts.',
  advice:   'One concrete move — rooted in both of your charts — that will shift the dynamic of this connection more than any other single action you could take.',
}

// ── Routing flags ─────────────────────────────────────────────────────────────
const isPreviewMode = computed(() =>
  route.query.preview === '1' || route.query.canceled === '1',
)
const isCanceled = computed(() => route.query.canceled === '1')

// ── Loading / error state (post-payment path only) ────────────────────────────
const isLoading  = ref(false)
const hasError   = ref(false)
const compatibility = ref<any>(null)

// ── Preview path data (read from Pinia store, not re-fetched) ─────────────────
const previewData = computed(() => isPreviewMode.value ? store.compatibilityData : null)

// ── Score colors ──────────────────────────────────────────────────────────────
const scoreColor = computed(() => {
  const score = compatibility.value?.compatibilityScore || 0
  if (score >= 80) return 'rgba(107, 72, 224, 0.9)'
  if (score >= 60) return 'rgba(201, 168, 76, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
})

const previewScoreColor = computed(() => {
  const score = previewData.value?.compatibilityScore || 0
  if (score >= 80) return 'rgba(107, 72, 224, 0.9)'
  if (score >= 60) return 'rgba(201, 168, 76, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
})

// ── Display names (quiz flow has empty names — show neutral fallback) ─────────
const displayMyName    = computed(() => store.firstName   || 'You')
const displayTheirName = computed(() => store.partnerName || 'Them')

// ── DOB formatter ─────────────────────────────────────────────────────────────
function formatDob(dob: string): string {
  if (!dob || dob.length < 10) return dob || ''
  try {
    const [y, m, d] = dob.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[Number(m) - 1]} ${Number(d)}, ${y}`
  } catch { return dob }
}

// ── Next charge date (30 days from today) ─────────────────────────────────────
const nextChargeDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

// ── Name + email capture ──────────────────────────────────────────────────────
const myNameInput         = ref(store.firstName   || '')
const theirNameInput      = ref(store.partnerName || '')
const emailInput          = ref(store.email       || '')
const emailCaptureSubmitted = ref(false)
const emailPrompt         = ref(false)

const isEmailValid = computed(() =>
  emailInput.value.includes('@') && emailInput.value.includes('.'),
)

watch(emailInput, () => {
  emailCaptureSubmitted.value = false
  emailPrompt.value = false
})

async function onEmailBlur() {
  if (!isEmailValid.value || emailCaptureSubmitted.value) return
  emailCaptureSubmitted.value = true
  store.setEmail(emailInput.value)
  try {
    await $fetch('/api/capture-email', {
      method: 'POST',
      body: {
        email:          emailInput.value,
        firstName:      myNameInput.value.trim() || store.firstName || '',
        archetypeName:  '',
        archetypeEmoji: '',
        archetypeElement: '',
        lifePath:       '',
        archetypeTraits: [],
        birthCity:      store.city || '',
        readingTradition: 'western',
        language:       store.language || 'en',
        sessionId:      store.tempId || `compat_${Date.now()}`,
      },
    })
  } catch { /* silent — never block UI */ }
}

// ── Checkout ──────────────────────────────────────────────────────────────────
const isProcessing  = ref(false)
const activeTier    = ref<'subscription' | 'single' | null>(null)
const checkoutError = ref('')

async function handleCheckout(tier: 'subscription' | 'single') {
  if (isProcessing.value) return

  if (tier === 'subscription' && !emailInput.value) {
    emailPrompt.value = true
    return
  }
  emailPrompt.value = false

  trackEvent('initiate_checkout', {
    tier,
    value: tier === 'subscription' ? 9.99 : 7.99,
  })

  isProcessing.value  = true
  activeTier.value    = tier
  checkoutError.value = ''

  const email       = emailInput.value.trim()   || store.email       || ''
  const firstName   = myNameInput.value.trim()   || store.firstName   || 'User'
  const partnerName = theirNameInput.value.trim() || store.partnerName || 'Partner'

  if (email)       store.setEmail(email)
  if (myNameInput.value.trim())    store.setPersonalInfo(myNameInput.value.trim(), store.dateOfBirth, store.city)
  if (theirNameInput.value.trim()) store.setPartnerData({ name: theirNameInput.value.trim(), dob: store.partnerDob, city: store.partnerCity })

  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-compatibility-payment',
      {
        method: 'POST',
        body: {
          tier,
          firstName,
          partnerName,
          partnerDob:  store.partnerDob,
          partnerCity: store.partnerCity,
          email,
          tempId:      store.tempId || `compat_${Date.now()}`,
          language:    store.language || 'en',
          origin:      window.location.origin,
        },
      },
    )
    if (url) window.location.href = url
  } catch {
    isProcessing.value  = false
    activeTier.value    = null
    checkoutError.value = 'Payment service unavailable. Please try again.'
    trackEvent('checkout_failed', { tier, error: 'api_error' })
  }
}

// ── onMounted: routing branches ───────────────────────────────────────────────
onMounted(async () => {
  const sessionId = route.query.session_id as string | undefined
  const preview   = route.query.preview   as string | undefined
  const canceled  = route.query.canceled  as string | undefined

  // CASE B / C — preview or post-cancel
  if (preview === '1' || canceled === '1') {
    if (!store.compatibilityData) {
      return // template renders "session expired" state
    }
    trackEvent('paywall_view', {
      tier_shown: 'compatibility',
      score: store.compatibilityData?.compatibilityScore,
      has_names: false,
    })
    return
  }

  // CASE A — post-payment
  if (sessionId) {
    isLoading.value = true
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
        await navigateTo('/report')
        return
      }

      const meta = paymentData.metadata || {}
      if (!store.firstName)   store.setPersonalInfo(meta.firstName  || '', store.dateOfBirth, store.city)
      if (!store.email)       store.setEmail(meta.email || paymentData.customerEmail || '')
      if (!store.partnerName) store.setPartnerData({ name: meta.partnerName || '', dob: store.partnerDob, city: store.partnerCity })
      if (!store.tempId)      store.setTempId(meta.tempId || '')
      if (!store.languageManualOverride && meta.language) store.setLanguage(meta.language)

      const { compatibility: data } = await $fetch<{
        success: boolean
        compatibility: any
      }>('/api/generate-compatibility', {
        method: 'POST',
        body: {
          firstName:      store.firstName,
          archetype:      store.archetype,
          element:        store.report?.element,
          lifePathNumber: store.lifePathNumber,
          powerTraits:    store.report?.powerTraits,
          partnerName:    store.partnerName,
          partnerDob:     store.partnerDob,
          partnerCity:    store.partnerCity,
          language:       store.language,
        },
      })

      compatibility.value = data

      if (store.email) {
        try {
          await $fetch('/api/send-compatibility-email', {
            method: 'POST',
            body: {
              email:       store.email,
              firstName:   store.firstName,
              partnerName: store.partnerName,
              compatibility: data,
              language:    store.language,
            },
          })
        } catch {
          console.error('Compatibility email failed')
        }
      }

      isLoading.value = false
    } catch {
      console.error('Compatibility page load failed')
      hasError.value  = true
      isLoading.value = false
    }
    return
  }

  // CASE D — no recognised param → redirect
  await navigateTo('/report')
})

</script>

<style scoped>
/* ── Shared bg + font base ── */
.center-page,
.compat-page,
.preview-page {
  background: #07070D;
  color: rgba(255, 255, 255, 0.94);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  box-sizing: border-box;
}

.center-page::before,
.compat-page::before,
.preview-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 55% at 50% 0%, rgba(75, 45, 155, 0.18) 0%, transparent 68%),
    radial-gradient(ellipse 50% 40% at 15% 55%, rgba(50, 25, 110, 0.10) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.center-page > *,
.compat-page > *,
.preview-page > * {
  position: relative;
  z-index: 1;
}

/* ── Centered states ── */
.center-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 0 24px;
}

.brand-text {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

.status-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.retry-btn {
  background: transparent;
  border: 1px solid rgba(107, 72, 224, 0.40);
  border-radius: 12px;
  padding: 14px 36px;
  min-height: 48px;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: rgba(200, 180, 255, 0.78);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s ease, border-color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.retry-btn:hover {
  background: rgba(107, 72, 224, 0.10);
  border-color: rgba(107, 72, 224, 0.65);
}

/* ── Full-report page layout ── */
.compat-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* ── Preview page layout ── */
.preview-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 28px 24px calc(52px + env(safe-area-inset-bottom, 0px));
}

/* ── Top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

.report-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.04em;
}

.preview-badge {
  font-size: 9px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.60);
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: 3px;
  padding: 3px 10px;
}

/* ── Canceled banner ── */
.canceled-banner {
  background: rgba(107, 72, 224, 0.07);
  border: 1px solid rgba(107, 72, 224, 0.18);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: rgba(200, 180, 255, 0.70);
  line-height: 1.5;
  text-align: center;
  margin-bottom: 20px;
}

/* ── Hero block ── */
.hero-block {
  padding: 32px 24px;
  background: linear-gradient(180deg, rgba(107, 72, 224, 0.10) 0%, transparent 100%);
  border-radius: 16px;
  margin-bottom: 32px;
  text-align: center;
}

.hero-block--preview {
  margin-bottom: 24px;
}

.archetype-label {
  font-size: 10px;
  color: rgba(107, 72, 224, 0.70);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.names-line {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 20px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 16px;
  letter-spacing: 0.02em;
}

.score-display {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 80px;
  font-weight: 300;
  line-height: 1;
  margin: 0 0 16px;
  letter-spacing: -2px;
}

.compat-title-text {
  font-size: 14px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.55;
  margin: 0;
}

/* ── Sections (shared) ── */
.section-wrapper {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.section-wrapper.no-border { border-bottom: none; }

.section-title {
  font-size: 9px;
  font-weight: 500;
  color: rgba(107, 72, 224, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin: 0 0 12px;
}

.section-content {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.82;
  margin: 0;
}

.advice-box {
  background: rgba(107, 72, 224, 0.08);
  border: 1px solid rgba(107, 72, 224, 0.20);
  border-radius: 12px;
  padding: 20px;
  font-size: 17px;
  font-style: italic;
  color: rgba(200, 180, 255, 0.95);
  line-height: 1.6;
  text-align: center;
}

/* ── Challenge section highlight (preview only) ── */
.challenge-section {
  background: rgba(107, 72, 224, 0.05);
  border: 1px solid rgba(107, 72, 224, 0.14);
  border-left: 2px solid rgba(201, 168, 76, 0.50);
  border-radius: 14px;
  padding: 20px 20px 24px 24px;
  margin-bottom: 24px;
}

.challenge-badge {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.65);
  margin-bottom: 10px;
}

.section-title--challenge {
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  margin-bottom: 14px;
}

/* ── Locked sections strip ── */
.locked-sections-strip {
  background: rgba(107, 72, 224, 0.06);
  border: 1px solid rgba(107, 72, 224, 0.15);
  border-radius: 14px;
  padding: 20px 20px 16px;
  margin-bottom: 24px;
}

.locked-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.lock-icon {
  font-size: 11px;
}

.locked-strip-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.locked-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.locked-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 14px 16px 12px;
}

.locked-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.lock-icon-sm {
  font-size: 10px;
  opacity: 0.5;
}

.locked-card-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.60);
  letter-spacing: 0.01em;
}

/* Blurred locked content */
.blurred-preview {
  filter: blur(5px);
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
  font-size: 13px;
  line-height: 1.72;
  color: rgba(255, 255, 255, 0.65);
  overflow: hidden;
  max-height: 52px;
}

.blurred-preview p { margin: 0; }

/* ── Calculation receipt ── */
.calc-receipt {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 16px;
  opacity: 0.65;
}

.calc-receipt-header {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.40);
  margin: 0 0 8px;
}

.calc-receipt-body {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.50);
  line-height: 1.6;
  margin: 0 0 6px;
}

.calc-receipt-meta {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
  letter-spacing: 0.01em;
}

/* ── Trust banner ── */
.trust-banner {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.25);
  text-align: center;
  line-height: 1.6;
  margin: 0 0 32px;
  padding: 0 12px;
}

/* ── Paywall block ── */
.paywall-block {
  margin-bottom: 40px;
}

.paywall-heading {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 32px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.94);
  margin: 0 0 8px;
  letter-spacing: 0.01em;
}

.paywall-sub {
  font-size: 14px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.55;
  margin: 0 0 24px;
}

/* ── Email capture card ── */
.email-capture-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.email-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.28);
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.email-label--spaced {
  margin-top: 16px;
}

.email-input {
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.88);
  font-size: 15px;
  width: 100%;
  font-family: inherit;
  padding: 0;
}

.email-input::placeholder { color: rgba(255, 255, 255, 0.18); }

.email-input:-webkit-autofill,
.email-input:-webkit-autofill:hover,
.email-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #0d0b1e inset !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.88) !important;
  caret-color: rgba(255, 255, 255, 0.88);
  transition: background-color 9999s ease-in-out 0s;
}

/* ── Email prompt ── */
.email-prompt-msg {
  font-size: 12px;
  color: rgba(201, 168, 76, 0.85);
  border: 1px solid rgba(201, 168, 76, 0.25);
  background: rgba(201, 168, 76, 0.06);
  border-radius: 8px;
  padding: 10px 14px;
  text-align: center;
  margin-bottom: 12px;
  line-height: 1.5;
}

/* ── Checkout error ── */
.checkout-error-msg {
  background: rgba(220, 80, 80, 0.07);
  border: 1px solid rgba(220, 80, 80, 0.35);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: rgba(255, 160, 160, 0.9);
  line-height: 1.55;
  text-align: center;
  margin-bottom: 16px;
}

/* ── Purchase option cards ── */
.pay-card {
  border-radius: 14px;
  padding: 22px 20px;
  margin-bottom: 12px;
  position: relative;
}

.pay-card--primary {
  background: rgba(107, 72, 224, 0.08);
  border: 1px solid rgba(107, 72, 224, 0.22);
  border-left: 2px solid rgba(201, 168, 76, 0.65);
  box-shadow:
    0 0 0 1px rgba(201, 168, 76, 0.30),
    0 8px 32px rgba(107, 72, 224, 0.16);
  padding-top: 32px;
}

.pay-card--secondary {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.pay-card-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(201, 168, 76, 0.92);
  color: #07070D;
  font-size: 9px;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 3px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.pay-card-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.90);
  margin: 0 0 6px;
}

.pay-card--secondary .pay-card-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.60);
}

.pay-card-price {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 36px;
  font-weight: 300;
  color: rgba(200, 180, 255, 0.95);
  margin: 0 0 14px;
  line-height: 1;
}

.pay-card--secondary .pay-card-price {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.45);
}

.pay-card-freq {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  font-family: inherit;
}

.pay-card-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pay-card-bullets li {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.5;
  padding-left: 18px;
  position: relative;
}

.pay-card-bullets li::before {
  content: '◆';
  position: absolute;
  left: 0;
  font-size: 7px;
  color: rgba(107, 72, 224, 0.55);
  top: 4px;
}

/* ── Purchase buttons ── */
.pay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 8px;
}

.pay-btn--primary {
  background: #6B48E0;
  border: none;
  color: #ffffff;
  box-shadow:
    0 0 0 1px rgba(107, 72, 224, 0.55),
    0 8px 32px rgba(107, 72, 224, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.35);
}

.pay-btn--primary:hover:not(:disabled) {
  background: #7B5AF2;
  box-shadow:
    0 0 0 1px rgba(123, 90, 242, 0.65),
    0 12px 44px rgba(107, 72, 224, 0.44),
    0 4px 12px rgba(0, 0, 0, 0.40);
  transform: translateY(-1px);
}

.pay-btn--primary:active:not(:disabled) {
  transform: translateY(0) scale(0.985);
  background: #5B38D0;
}

.pay-btn--secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.50);
}

.pay-btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.24);
  color: rgba(255, 255, 255, 0.72);
}

.pay-btn--processing {
  opacity: 0.62;
  cursor: default;
  transform: none !important;
}

.pay-btn:disabled {
  opacity: 0.35;
  cursor: default;
  transform: none;
  pointer-events: none;
}

.pay-btn-footnote {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  text-align: center;
  margin: 4px 0 0;
  line-height: 1.5;
}

.pay-btn-footnote--muted {
  color: rgba(255, 255, 255, 0.18);
}

/* ── Guarantee ── */
.guarantee-block {
  margin-top: 20px;
  padding: 14px 18px;
  background: rgba(107, 72, 224, 0.05);
  border: 1px solid rgba(107, 72, 224, 0.13);
  border-radius: 12px;
  text-align: center;
}

.guarantee-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.6;
  margin: 0;
}

.trust-secure {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.14);
  text-align: center;
  margin: 12px 0 0;
  letter-spacing: 0.02em;
}

/* ── Share section (post-payment) ── */
.share-section {
  margin-top: 48px;
  text-align: center;
}

.share-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.90);
  margin: 0 0 4px;
}

.share-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* ── Footer ── */
.compat-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 0 28px;
  margin-top: 8px;
}

.compat-footer nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-link {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  text-decoration: none;
  letter-spacing: 0.06em;
}

.footer-sep {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.10);
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .preview-page { padding: 20px 16px calc(44px + env(safe-area-inset-bottom, 0px)); }
  .paywall-heading { font-size: 26px; }
  .score-display { font-size: 68px; }
  .pay-card-price { font-size: 30px; }
  .pay-card--secondary .pay-card-price { font-size: 24px; }
}

@media (max-width: 360px) {
  .preview-page { padding: 16px 12px calc(40px + env(safe-area-inset-bottom, 0px)); }
  .paywall-heading { font-size: 22px; }
  .score-display { font-size: 60px; }
}

@media (prefers-reduced-motion: reduce) {
  .pay-btn--primary:hover:not(:disabled),
  .pay-btn--secondary:hover:not(:disabled) { transform: none; }
}
</style>
