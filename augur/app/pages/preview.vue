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
      <ArchetypeSymbol :symbol="report.archetypeSymbol" :size="44" class="archetype-symbol" />
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

    <!-- Blurred content hook -->
    <div class="blurred-preview">
      <p>The window ahead carries a specific quality of momentum — not the loud kind of progress, but the kind that compounds quietly until it cannot be ignored. You have been building something in a register most people around you cannot yet read.</p>
    </div>

    <!-- Locked sections strip -->
    <div class="locked-sections-strip">
      <div class="locked-header">
        <span class="lock-icon">🔒</span>
        <span class="locked-strip-label">Still locked in your {{ archetypeShortName }} reading:</span>
      </div>
      <ul class="locked-section-list">
        <li>◆ Your 2026 Destiny Forecast</li>
        <li>◆ Love &amp; Relationship Patterns</li>
        <li>◆ Your Hidden Gift</li>
        <li>◆ Career &amp; Purpose</li>
        <li>◆ Your Power Statement</li>
        <li>◆ {{ traditionSectionLabel }}</li>
      </ul>
    </div>

    <!-- Social proof: renders only when REAL_TESTIMONIALS array is populated -->
    <div v-if="showTestimonialSlot" class="social-proof-line">
      <div class="stars">★★★★★</div>
      <p class="proof-quote">"{{ currentTestimonial.quote }}"</p>
      <p class="proof-attribution">— {{ currentTestimonial.author }}</p>
    </div>

    <!-- 3-tier pricing selector (hidden when full access code applied) -->
    <div v-if="!appliedPromo || appliedPromo.codeType !== 'full_access'" class="pricing-section">
      <div class="paywall-header">
        <p class="paywall-personal-line">{{ store.firstName }}, your {{ archetypeShortName }} reading is 85% complete.</p>
        <p class="paywall-sub-line">The sections below reveal what the identity section could only begin to show.</p>
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
            <p class="tier-desc">Full 7-section {{ archetypeShortName }} reading revealing why you operate the way you do</p>
          </div>
          <p class="tier-price">$2.99</p>
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
              <p class="tier-features">❆ Full reading + 2026 lucky timing calendar + compatibility check with one person</p>
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
              <p class="tier-features tier-features-oracle">✦ Complete map — full reading, calendar, compatibility, birth chart, and all traditions unlocked</p>
            </div>
            <div class="tier-price-block">
              <p class="tier-price tier-price-oracle">$12.99</p>
              <p class="tier-price-note tier-price-note-oracle">save $8</p>
            </div>
          </div>
        </div>
      </div>

      <!--
        PRICE VERIFICATION — last checked 2026-04-17
        Basic:  display $2.99 = Stripe 299 ✓
        Middle: display $4.99 = Stripe 499 ✓
        Oracle: display $12.99 = Stripe 1299 ✓

        If display prices change, update corresponding Stripe unit_amount in:
          server/api/create-payment.post.ts (basic)
          server/api/create-bundle-payment.post.ts (middle)
          server/api/create-oracle-payment.post.ts (oracle)
        Never change display without updating Stripe.
      -->

      <!-- Promo code section -->
      <div class="promo-section">
        <!-- STATE A: collapsed link -->
        <button
          v-if="!promoInputVisible && !appliedPromo"
          class="promo-toggle-link"
          @click="promoInputVisible = true"
        >
          Have a promo code?
        </button>

        <!-- STATE B/C/D: expanded -->
        <template v-else-if="!appliedPromo || appliedPromo.codeType === 'discount_percent'">
          <div class="promo-input-row">
            <input
              id="promo-code"
              v-model="promoCodeInput"
              type="text"
              name="promo-code"
              class="promo-input"
              placeholder="Enter code"
              autocomplete="off"
              :disabled="isValidatingPromo || (appliedPromo?.codeType === 'discount_percent')"
              @input="promoCodeInput = promoCodeInput.toUpperCase()"
              @keydown.enter="validatePromoCode"
            />
            <button
              v-if="!appliedPromo"
              class="promo-apply-btn"
              :disabled="isValidatingPromo || !promoCodeInput.trim()"
              @click="validatePromoCode"
            >
              {{ isValidatingPromo ? '...' : 'Apply' }}
            </button>
          </div>
          <p v-if="promoValidationResult && !promoValidationResult.valid" class="promo-msg promo-msg-error">
            {{ promoValidationResult.message }}
          </p>
          <p v-if="appliedPromo?.codeType === 'discount_percent'" class="promo-msg promo-msg-success">
            ✦ {{ appliedPromo.message }}
          </p>
        </template>

      </div>

      <!-- Email input -->
      <div class="email-field-wrapper">
        <label class="email-label" for="email-address">WHERE SHOULD WE SEND YOUR READING?</label>
        <input
          id="email-address"
          v-model="email"
          type="email"
          name="email"
          :placeholder="t('emailPlaceholder')"
          class="email-input"
          autocomplete="email"
          @blur="onEmailBlur"
        >
      </div>

      <!-- CTA Button -->
      <button
        class="unlock-btn"
        :class="{
          'unlock-btn-processing': isProcessingPayment || isApplyingFreeAccess,
          'unlock-btn-basic': selectedTier === 1 && !appliedPromo,
          'unlock-btn-oracle': selectedTier === 3 && !appliedPromo,
        }"
        :disabled="isProcessingPayment || isApplyingFreeAccess || !email"
        @click="appliedPromo?.codeType === 'full_access' ? applyFreeAccess() : handlePayment()"
      >
        <span v-if="isProcessingPayment || isApplyingFreeAccess">Processing...</span>
        <span v-else-if="appliedPromo?.codeType === 'full_access'">Get My Complete Reading →</span>
        <span v-else-if="selectedTier === 1">{{ t('unlockBasic') }}</span>
        <span v-else-if="selectedTier === 2">{{ t('unlockPopular') }}</span>
        <span v-else>{{ t('unlockOracle') }}</span>
      </button>

      <div class="guarantee-line">
        <span class="guarantee-check">✦</span>
        <span class="guarantee-text">Not what you expected? Full refund within 24 hours — no questions asked.</span>
      </div>
      <p class="trust-secure">{{ t('securedStripe') }}</p>
      </div><!-- end pricing-section -->

      <!-- Full access promo: shown when full_access code applied (replaces pricing section) -->
      <div v-if="appliedPromo?.codeType === 'full_access'" class="pricing-section">
        <div class="email-field-wrapper">
          <label class="email-label" for="email-address-promo">WHERE SHOULD WE SEND YOUR READING?</label>
          <input
            id="email-address-promo"
            v-model="email"
            type="email"
            name="email"
            :placeholder="t('emailPlaceholder')"
            class="email-input"
            autocomplete="email"
            @blur="onEmailBlur"
          />
        </div>
        <button
          class="unlock-btn"
          :class="{ 'unlock-btn-processing': isApplyingFreeAccess }"
          :disabled="isApplyingFreeAccess || !email"
          @click="applyFreeAccess"
        >
          <span v-if="isApplyingFreeAccess">Processing...</span>
          <span v-else>Get My Complete Reading →</span>
        </button>
        <p v-if="promoErrorMessage" class="promo-msg promo-msg-error" style="margin-top:10px;text-align:center;">{{ promoErrorMessage }}</p>
      </div>
  </div>

  <!-- Crisis signpost footer -->
  <footer class="preview-footer" role="contentinfo">
    <nav aria-label="Legal">
      <NuxtLink to="/privacy" class="preview-footer-link">Privacy Policy</NuxtLink>
      <span class="preview-footer-sep" aria-hidden="true">·</span>
      <NuxtLink to="/terms" class="preview-footer-link">Terms of Service</NuxtLink>
    </nav>
    <p class="preview-footer-crisis">If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741</p>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ComputedRef } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'


const REAL_TESTIMONIALS: Array<{ quote: string; author: string }> = [
  // ADD REAL BUYER QUOTES HERE — leave empty until collected from post-purchase emails
  // Format: { quote: 'Under 20 words verbatim.', author: 'First name · something specific' }
]
const showTestimonialSlot = computed(() => REAL_TESTIMONIALS.length > 0)
const currentTestimonial = computed(() => REAL_TESTIMONIALS[0] ?? { quote: '', author: '' })

useSeoMeta({ title: 'Your Destiny Preview', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { t } = useLanguage()
const { $trackViewContent, $trackInitiateCheckout, $trackPreviewLoadingStart, $trackPreviewLoaded, $trackPaywallView, $trackTierSelected, $trackEmailCaptureSuccess } = useNuxtApp() as any

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

const archetypeName: ComputedRef<string> = computed(() => store.report?.archetypeName ?? '')

const archetypeShortName: ComputedRef<string> = computed(() =>
  archetypeName.value?.replace(/^The\s+/i, '') ?? 'destiny'
)

const traditionSectionLabel: ComputedRef<string> = computed(() => {
  const labels: Record<string, string> = {
    western: 'Astrological Birth Season Reading',
    india: 'Your Nakshatra & Karmic Mission',
    china: 'Four Pillars Element Reading',
    latam: 'Your Soul Card & Tarot Path',
    korea: 'Your Personality Destiny Map',
    middleeast: 'Your Destined Path Reading',
  }
  return labels[store.region] ?? 'Your Tradition-Specific Reading'
})

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
  $trackPreviewLoadingStart()

  try {
    const data = await $fetch<{ success: boolean; report: any; promptVersion?: string }>('/api/generate-report', {
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
          promptVersion: data.promptVersion ?? null,
        },
      })
    } catch {
      // Report save failed, continue without saving
    }

    isLoading.value = false
    nextTick(() => {
      $trackViewContent({
        content_name: store.report?.archetypeName || 'Destiny Reading Preview',
        content_id: store.report?.archetypeName || 'preview',
        value: 4.99,
        currency: 'USD',
      })
      $trackPreviewLoaded({
        archetype: store.archetype || '',
        lifePathNumber: store.lifePathNumber,
        tradition: store.region,
        language: store.language,
      })
      $trackPaywallView({
        archetype: store.archetype,
        language: store.language,
        region: store.region,
      })
    })
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
  // ── Deep-link restoration from abandonment email (?tempId=...) ──────────────
  // If the store is empty (user arrived via email CTA, not via the quiz flow),
  // attempt to restore report state from the saved temp record before applying
  // the firstName guard. Uses POST /api/get-report which accepts { sessionId }.
  const route = useRoute()
  const tempIdParam = route.query.tempId as string | undefined
  if (tempIdParam && !store.report) {
    try {
      const result = await $fetch<{ report: any }>('/api/get-report', {
        method: 'POST',
        body: { sessionId: tempIdParam },
      })
      if (result?.report) {
        const r = result.report
        store.setReport(r.report_data)
        store.setTempId(r.session_id || tempIdParam)
        if (r.first_name) store.setPersonalInfo(r.first_name, '', r.city || '')
        if (r.archetype) store.setArchetype(r.archetype)
        if (r.life_path_number) store.setLifePathNumber(r.life_path_number)
        if (r.region) store.setRegion(r.region, store.country)
      }
    } catch {
      // Report not found or fetch failed — fall through to normal guard below
    }
  }

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
const captureSubmitted = ref(false)
const isProcessingPayment = ref(false)

const promoInputVisible     = ref(false)
const promoCodeInput        = ref('')
const isValidatingPromo     = ref(false)
const promoValidationResult = ref<{ valid: boolean; message: string; codeId?: string; codeType?: string; codeSubtype?: string; discountValue?: number; accessTier?: string } | null>(null)
const appliedPromo          = ref<{ valid: boolean; message: string; codeId: string; codeType: string; codeSubtype: string; discountValue: number; accessTier: string } | null>(null)
const isApplyingFreeAccess  = ref(false)
const promoErrorMessage     = ref('')

async function validatePromoCode() {
  const code = promoCodeInput.value.trim()
  if (!code) return
  isValidatingPromo.value = true
  promoValidationResult.value = null
  try {
    const result = await $fetch<{ valid: boolean; message: string; codeId?: string; codeType?: string; codeSubtype?: string; discountValue?: number; accessTier?: string }>('/api/validate-promo', {
      method: 'POST',
      body: { code, email: email.value || '' },
    })
    promoValidationResult.value = result
    if (result.valid && result.codeId && result.codeType && result.codeSubtype) {
      appliedPromo.value = {
        valid:         true,
        message:       result.message,
        codeId:        result.codeId,
        codeType:      result.codeType,
        codeSubtype:   result.codeSubtype,
        discountValue: result.discountValue ?? 0,
        accessTier:    result.accessTier || 'oracle',
      }
    }
  } catch {
    promoValidationResult.value = { valid: false, message: 'Unable to validate code. Please try again.' }
  } finally {
    isValidatingPromo.value = false
  }
}

async function applyFreeAccess() {
  if (!email.value || !email.value.includes('@')) {
    promoErrorMessage.value = 'Please enter your email address first.'
    return
  }
  if (!appliedPromo.value) return
  isApplyingFreeAccess.value = true
  promoErrorMessage.value = ''
  store.setEmail(email.value)
  try {
    const result = await $fetch<{ success: boolean; report: any; sessionId: string; bundlePurchased: boolean; oraclePurchased: boolean; accessTier: string }>('/api/apply-promo-access', {
      method: 'POST',
      body: {
        codeId:        appliedPromo.value.codeId,
        code:          promoCodeInput.value.trim(),
        email:         email.value,
        firstName:     store.firstName,
        dateOfBirth:   store.dateOfBirth,
        city:          store.city,
        archetype:     store.archetype,
        lifePathNumber: store.lifePathNumber,
        region:        store.region,
        language:      store.language,
        answers:       store.answers,
        timeOfBirth:   store.timeOfBirth,
        accessTier:    appliedPromo.value.accessTier,
      },
    })
    store.setReport(result.report)
    store.setPaymentComplete(true)
    store.setReportSessionId(result.sessionId)
    if (result.bundlePurchased) {
      store.setBundlePurchased(true)
      store.setCalendarPurchased(true)
    }
    if (result.oraclePurchased) {
      store.setOraclePurchased(true)
      store.setSubscriptionActive(true)
      store.setBirthChartPurchased(true)
    }
    await navigateTo('/report')
  } catch (err: any) {
    promoErrorMessage.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    isApplyingFreeAccess.value = false
  }
}

async function onEmailBlur() {
  if (!email.value || !email.value.includes('@') || captureSubmitted.value) return
  captureSubmitted.value = true

  $trackEmailCaptureSuccess({ source: 'paywall', language: store.language })
  try {
    await $fetch('/api/capture-email', {
      method: 'POST',
      body: {
        email: email.value,
        firstName: store.firstName,
        archetypeName: store.report?.archetypeName || '',
        archetypeEmoji: store.report?.archetypeSymbol || '✨',
        archetypeElement: store.report?.element || '',
        lifePath: store.lifePathNumber ? String(store.lifePathNumber) : '',
        archetypeTraits: store.report?.powerTraits || [],
        birthCity: store.city,
        readingTradition: store.region,
        language: store.language,
        sessionId: store.tempId || `temp_${Date.now()}_${store.firstName}`,
      },
    })
  } catch {
    // Silent fail — never block the UI
  }
}
const selectedTier = ref<1 | 2 | 3>(2)

async function handlePayment() {
  if (isProcessingPayment.value) return
  if (!email.value) return

  const tierValues: Record<number, number> = { 1: 2.99, 2: 4.99, 3: 12.99 }
  $trackTierSelected({
    tier: selectedTier.value,
    price: tierValues[selectedTier.value] || 4.99,
    archetype: store.archetype,
    language: store.language,
  })
  $trackInitiateCheckout({
    value: tierValues[selectedTier.value] || 4.99,
    currency: 'USD',
    content_name: 'Destiny Reading',
  })

  isProcessingPayment.value = true

  store.setEmail(email.value)

  try {
    // If a discount promo code is applied, route through apply-promo-discount
    if (appliedPromo.value?.codeType === 'discount_percent') {
      const tierName = selectedTier.value === 1 ? 'basic' : selectedTier.value === 2 ? 'bundle' : 'oracle'
      const { url } = await $fetch<{ sessionId: string; url: string | null }>('/api/apply-promo-discount', {
        method: 'POST',
        body: {
          codeId:        appliedPromo.value.codeId,
          code:          promoCodeInput.value.trim(),
          email:         email.value,
          tier:          tierName,
          firstName:     store.firstName,
          archetype:     store.archetype,
          lifePathNumber: store.lifePathNumber,
          dateOfBirth:   store.dateOfBirth,
          timeOfBirth:   store.timeOfBirth,
          tempId:        store.tempId,
          region:        store.region,
          language:      store.language,
          origin:        window.location.origin,
        },
      })
      if (url) window.location.href = url
      return
    }

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
  display: block;
  margin-bottom: 8px;
  opacity: 0.85;
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

/* ── Blurred content hook ── */
.blurred-preview {
  filter: blur(5px);
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
  margin: 24px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  max-height: 60px;
}

.blurred-preview p {
  margin: 0;
}

/* ── Locked sections strip ── */
.locked-sections-strip {
  background: rgba(140, 110, 255, 0.06);
  border: 1px solid rgba(140, 110, 255, 0.15);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 32px 0;
}

.locked-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.lock-icon {
  font-size: 11px;
}

.locked-strip-label {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.locked-section-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.locked-section-list li {
  color: rgba(255, 255, 255, 0.65);
  font-size: 15px;
  line-height: 2.2;
}

/* ── Social proof ── */
.social-proof-line {
  text-align: center;
  margin: 0 0 24px;
}

.stars {
  color: #c9a84c;
  font-size: 14px;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.proof-quote {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 4px;
}

.proof-attribution {
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  margin: 0;
}

/* ── Pricing section ── */
.pricing-section {
  margin-top: 0;
}

.paywall-header {
  text-align: center;
  margin-bottom: 20px;
}

.paywall-personal-line {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px;
}

.paywall-sub-line {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0 0 28px;
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

/* ── Urgency & guarantee ── */
.urgency-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  margin: 16px 0 8px;
}

.urgency-icon {
  font-size: 12px;
}

.guarantee-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin: 0 0 24px;
}

.guarantee-check {
  color: rgba(140, 110, 255, 0.6);
  font-size: 10px;
}

.guarantee-text {
  color: rgba(255, 255, 255, 0.3);
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

/* ── Promo code section ── */
.promo-section {
  margin-top: 14px;
  margin-bottom: 2px;
}

.promo-toggle-link {
  background: transparent;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.28);
  cursor: pointer;
  letter-spacing: 0.02em;
  text-decoration: underline;
  text-underline-offset: 3px;
  display: block;
  text-align: center;
  width: 100%;
  margin-bottom: 4px;
  transition: color 0.2s;
}

.promo-toggle-link:hover {
  color: rgba(255, 255, 255, 0.48);
}

.promo-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.promo-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
  letter-spacing: 0.06em;
  flex: 1;
  outline: none;
  box-sizing: border-box;
  text-transform: uppercase;
  transition: border-color 0.2s;
}

.promo-input:focus {
  border-color: rgba(201, 168, 76, 0.35);
}

.promo-input::placeholder {
  color: rgba(255, 255, 255, 0.18);
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: none;
}

.promo-input:disabled {
  opacity: 0.5;
}

.promo-apply-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  padding: 10px 16px;
  transition: all 0.2s;
  white-space: nowrap;
}

.promo-apply-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.75);
}

.promo-apply-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.promo-msg {
  font-size: 12px;
  margin: 8px 0 0;
  padding: 0;
  text-align: center;
}

.promo-msg-error {
  color: rgba(255, 110, 110, 0.85);
}

.promo-msg-success {
  color: rgba(100, 210, 130, 0.85);
  letter-spacing: 0.02em;
}

.promo-full-access-block {
  background: rgba(100, 210, 130, 0.05);
  border: 1px solid rgba(100, 210, 130, 0.2);
  border-radius: 8px;
  padding: 16px 20px;
  text-align: center;
}

.promo-full-access-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(100, 210, 130, 0.9);
  margin: 0 0 6px;
  letter-spacing: 0.03em;
}

.promo-full-access-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  line-height: 1.6;
}

.preview-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 20px 28px;
  box-sizing: border-box;
  margin-top: 8px;
}

.preview-footer nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-footer-link {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  text-decoration: none;
  letter-spacing: 0.06em;
}

.preview-footer-sep {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.1);
}

.preview-footer-crisis {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.1);
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.5;
  max-width: 320px;
}
</style>
