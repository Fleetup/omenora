<template>
  <div class="preview-page">

    <!-- ── STATE A: LOADING ── -->
    <div v-if="isLoading" class="preview-loading">
      <div class="preview-loading__inner">
        <div class="loading-ornament">
          <PhoenixLoader :size="96" />
        </div>

        <AppEyebrow as="p" class="loading-status">
          <template v-if="loadingStage === 0">Mapping your natal chart, {{ store.firstName }}…</template>
          <template v-else-if="loadingStage === 1">Computing across four traditions…</template>
          <template v-else-if="loadingStage === 2">Your {{ loadingArchetypeLabel }} archetype is being mapped…</template>
          <template v-else>Your reading is ready.</template>
        </AppEyebrow>

        <div class="loading-progress">
          <div class="loading-progress__fill" />
        </div>

        <AppCaption as="p" class="loading-subtext">Computing across four traditions</AppCaption>
      </div>
    </div>

    <!-- ── STATE C: ERROR ── -->
    <div v-else-if="hasError" class="preview-error">
      <div class="preview-error__inner">
        <AppEyebrow variant="muted">Something went wrong</AppEyebrow>
        <AppHeadline as="h2" class="preview-error__msg">We couldn't generate your reading.</AppHeadline>
        <div class="preview-error__actions">
          <AppButton variant="primary" :arrow="true" @click="retryApiCall">Try again</AppButton>
          <AppButton variant="secondary" to="/analysis" :arrow="true">Start over</AppButton>
        </div>
      </div>
    </div>

    <!-- ── STATE B: PREVIEW ── -->
    <template v-else-if="report">

      <AppHeader>
        <template #action>
          <span class="label-caps preview-header__meta">Your Reading</span>
        </template>
      </AppHeader>

      <!-- Report header -->
      <section class="report-header">
        <AppEyebrow variant="muted" class="report-header__eyebrow">Natal Reading · {{ store.firstName }}</AppEyebrow>
        <AppHeadline as="h1" class="report-header__title">{{ report.archetypeName }}</AppHeadline>
        <div v-if="archetypeFile" class="report-header__symbol">
          <img
            :src="`/symbols/${archetypeFile}`"
            :alt="report.archetypeName"
            class="report-header__symbol-img"
          />
        </div>
        <div class="editorial-rule" />
        <div class="report-header__meta">
          <AppCaption>☉ Sun in {{ sunSign }}</AppCaption>
          <AppCaption :muted="true" class="report-header__sep">·</AppCaption>
          <AppCaption>☽ Moon in {{ moonSign }}</AppCaption>
          <template v-if="risingSign">
            <AppCaption :muted="true" class="report-header__sep">·</AppCaption>
            <AppCaption>↑ Rising {{ risingSign }}</AppCaption>
          </template>
        </div>
        <AppCaption as="p" class="report-header__element">
          {{ report.element }} · Life Path {{ store.lifePathNumber }}
        </AppCaption>
        <div class="report-header__traits">
          <AppEyebrow v-for="trait in report.powerTraits" :key="trait" as="span" class="report-trait">{{ trait }}</AppEyebrow>
        </div>
      </section>

      <!-- Free preview: identity section -->
      <section class="report-preview">
        <p class="report-preview__text">{{ report.sections?.identity?.content }}</p>

        <!-- Blurred hook -->
        <div class="report-preview__blurred" aria-hidden="true">
          <p>The window ahead carries a specific quality of momentum — not the loud kind of progress, but the kind that compounds quietly until it cannot be ignored. You have been building something in a register most people around you cannot yet read.</p>
        </div>

        <!-- Unlock progress meter -->
        <div class="unlock-meter">
          <AppEyebrow as="p" variant="muted" class="unlock-meter__label">Your reading is 14% revealed</AppEyebrow>
          <div class="unlock-meter__track">
            <div class="unlock-meter__fill" />
          </div>
        </div>

        <!-- Reading receipt -->
        <AppCaption as="p" class="report-receipt">
          Built from: your birth date · your natal chart ·
          your {{ archetypeShortName }} archetype (Life Path {{ store.lifePathNumber }}) ·
          {{ traditionLabel }} tradition
        </AppCaption>

        <!-- Urgency -->
        <AppCaption as="p" class="report-urgency">Your chart is calculated against today's planetary transits — this interpretation is specific to this window.</AppCaption>
      </section>

      <!-- Locked sections strip -->
      <section class="locked-sections">
        <div class="locked-sections__header">
          <AppEyebrow as="span" variant="muted" class="locked-sections__label">Still locked in your {{ archetypeShortName }} reading</AppEyebrow>
        </div>
        <ul class="locked-sections__list">
          <AppCaption as="li" class="locked-sections__item">◆ Your 2026 Destiny Forecast</AppCaption>
          <AppCaption as="li" class="locked-sections__item">◆ Love &amp; Relationship Patterns</AppCaption>
          <AppCaption as="li" class="locked-sections__item">◆ Your Hidden Gift</AppCaption>
          <AppCaption as="li" class="locked-sections__item">◆ Career &amp; Purpose</AppCaption>
          <AppCaption as="li" class="locked-sections__item">◆ Your Power Statement</AppCaption>
          <AppCaption as="li" class="locked-sections__item">◆ {{ traditionSectionLabel }}</AppCaption>
        </ul>
      </section>

      <!-- Trustpilot widget -->
      <div class="preview-tp-block">
        <AppCaption as="p" class="preview-tp-label">Rated Excellent by our readers</AppCaption>
        <TrustpilotWidget />
      </div>

      <!-- ── PAYWALL (subscription CTA) ── -->
      <section v-if="!appliedPromo || appliedPromo.codeType !== 'full_access'" class="paywall">
        <div class="editorial-rule" />

        <div class="paywall__header">
          <AppSubhead as="p" variant="strong" color="primary" class="paywall__personal">{{ store.firstName }}, {{ t('paywallHeading') }}</AppSubhead>
          <AppCaption as="p" class="paywall__sub">{{ t('paywallSubtitle') }}</AppCaption>
        </div>

        <!-- Promo code -->
        <div class="paywall__promo">
          <button
            v-if="!promoInputVisible && !appliedPromo"
            class="paywall__promo-toggle annotation"
            @click="promoInputVisible = true"
          >
            Have a promo code?
          </button>
          <template v-else-if="!appliedPromo || appliedPromo.codeType === 'discount_percent'">
            <div class="paywall__promo-row">
              <input
                id="promo-code"
                v-model="promoCodeInput"
                type="text"
                name="promo-code"
                class="paywall__promo-input editorial-input"
                placeholder="Enter code"
                autocomplete="off"
                :disabled="isValidatingPromo || (appliedPromo?.codeType === 'discount_percent')"
                @input="promoCodeInput = promoCodeInput.toUpperCase()"
                @keydown.enter="validatePromoCode"
              />
              <button
                v-if="!appliedPromo"
                class="paywall__promo-apply label-caps"
                :disabled="isValidatingPromo || !promoCodeInput.trim()"
                @click="validatePromoCode"
              >
                {{ isValidatingPromo ? '…' : 'Apply' }}
              </button>
            </div>
            <AppCaption as="p" v-if="promoValidationResult && !promoValidationResult.valid" class="paywall__promo-msg paywall__promo-msg--error">
              {{ promoValidationResult.message }}
            </AppCaption>
            <AppCaption as="p" v-if="appliedPromo?.codeType === 'discount_percent'" class="paywall__promo-msg paywall__promo-msg--success">
              ✦ {{ appliedPromo.message }}
            </AppCaption>
          </template>
        </div>

        <!-- Email capture (kept for abandonment sequence) -->
        <div class="paywall__email">
          <label class="label-caps paywall__email-label" for="email-address">Where should we send your full reading?</label>
          <input
            id="email-address"
            v-model="email"
            type="email"
            name="email"
            class="editorial-input"
            :placeholder="t('emailPlaceholder')"
            autocomplete="email"
            @blur="onEmailBlur"
          />
        </div>

        <!-- Founding Member CTA (primary) -->
        <button
          class="paywall__cta"
          :disabled="isProcessingPayment || isApplyingFreeAccess || !email"
          @click="handleFoundingCta()"
        >
          <span>{{ t('foundingCtaPreview') }}</span>
        </button>
        <AppCaption as="p" class="paywall__founding-sub">{{ t('foundingCtaSubtitle') }}</AppCaption>

        <!-- Trust line: refund + subscription -->
        <AppCaption as="div" class="paywall__guarantee">
          <span class="paywall__guarantee-check">✦</span>
          <span>{{ t('subscribeRefundClause') }}</span>
        </AppCaption>
        <AppCaption as="p" class="paywall__trust-onetime">{{ t('paywallTrustSubscription') }}</AppCaption>
        <AppCaption as="p" class="paywall__trust-secure">{{ t('securedStripe') }}</AppCaption>
      </section>

      <!-- Full-access promo section (replaces pricing when full_access code applied) -->
      <section v-if="appliedPromo?.codeType === 'full_access'" class="paywall paywall--free">
        <div class="editorial-rule" />
        <div class="paywall__email">
          <label class="label-caps paywall__email-label" for="email-address-promo">Where should we send your full reading?</label>
          <input
            id="email-address-promo"
            v-model="email"
            type="email"
            name="email"
            class="editorial-input"
            :placeholder="t('emailPlaceholder')"
            autocomplete="email"
            @blur="onEmailBlur"
          />
        </div>
        <button
          class="paywall__cta"
          :class="{ 'paywall__cta--processing': isApplyingFreeAccess }"
          :disabled="isApplyingFreeAccess || !email"
          @click="applyFreeAccess"
        >
          <span v-if="isApplyingFreeAccess">Processing…</span>
          <span v-else>Get My Complete Reading →</span>
        </button>
        <AppCaption as="p" v-if="promoErrorMessage" class="paywall__promo-msg paywall__promo-msg--error">{{ promoErrorMessage }}</AppCaption>
      </section>

      <!-- Footer -->
      <footer class="preview-footer" role="contentinfo">
        <nav aria-label="Legal">
          <NuxtLink to="/privacy" class="preview-footer__link annotation">Privacy Policy</NuxtLink>
          <AppCaption :muted="true" class="preview-footer__sep" aria-hidden="true">·</AppCaption>
          <NuxtLink to="/terms" class="preview-footer__link annotation">Terms of Service</NuxtLink>
        </nav>
        <AppCaption as="p" class="preview-footer__crisis">If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741</AppCaption>
      </footer>

    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ComputedRef } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'
import { useClarity } from '~/composables/useClarity'

useSeoMeta({ title: 'Your Personality Archetype Reading', robots: 'noindex, nofollow' })
useHead({ link: [{ rel: 'canonical', href: 'https://omenora.com/preview' }] })

const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()
const { $trackViewContent, $trackInitiateCheckout, $trackPreviewLoadingStart, $trackPreviewLoaded, $trackPaywallView, $trackTierSelected, $trackEmailCaptureSuccess } = useNuxtApp() as any

const isLoading = ref(true)
const hasError = ref(false)
const loadingStage = ref(0)

const report = computed(() => store.report)

const archetypeName: ComputedRef<string> = computed(() => store.report?.archetypeName ?? '')

const archetypeShortName: ComputedRef<string> = computed(() =>
  archetypeName.value?.replace(/^The\s+/i, '') ?? 'destiny'
)

const loadingArchetypeLabel = computed(() =>
  store.archetype ? archetypeShortName.value : 'Your destiny archetype'
)

// Map archetype name → @2x.png filename in /public/symbols/
// e.g. "The Alchemist" → "alchemist@2x.png"
const archetypeFile = computed(() => {
  const name = (store.report?.archetypeName || store.archetype || '').trim()
  if (!name) return ''
  return name.toLowerCase().replace(/^the\s+/i, '').replace(/\s+/g, '-') + '@2x.png'
})

// Sun / Moon / Rising derived from natalChart
const sunSign = computed(() => store.natalChart?.sun?.sign ?? '')
const moonSign = computed(() => store.natalChart?.moon?.sign ?? '')
const risingSign = computed(() => store.natalChart?.ascendant?.sign ?? '')

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

const traditionLabel: ComputedRef<string> = computed(() => {
  const labels: Record<string, string> = {
    western: 'Western',
    india: 'Vedic',
    china: 'BaZi',
    latam: 'Tarot',
    korea: 'Korean',
    middleeast: 'Middle Eastern',
  }
  return labels[store.region] ?? 'Western'
})

let stageTimers: ReturnType<typeof setTimeout>[] = []

function startMessageCycle() {
  loadingStage.value = 0
  stageTimers.push(setTimeout(() => { loadingStage.value = 1 }, 2000))
  stageTimers.push(setTimeout(() => { loadingStage.value = 2 }, 4000))
  stageTimers.push(setTimeout(() => { loadingStage.value = 3 }, 6000))
}

function stopMessageCycle() {
  stageTimers.forEach(t => clearTimeout(t))
  stageTimers = []
}

async function triggerApiCall() {
  isLoading.value = true
  hasError.value = false
  startMessageCycle()
  $trackPreviewLoadingStart()

  if (!store.natalChart) {
    console.error('[preview] natalChart is null — cannot generate report')
    isLoading.value = false
    hasError.value = true
    return
  }

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
        chart: store.natalChart,
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
        value: 20,
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
async function handleFoundingCta() {
  if (isProcessingPayment.value) return
  if (!email.value) return

  $trackTierSelected({
    tier: 'founding' as any,
    price: 20,
    archetype: store.archetype,
    language: store.language,
  })
  $trackInitiateCheckout({
    value: 20,
    currency: 'USD',
    content_name: 'Founding Membership',
  })
  useClarity().trackEvent('founding_cta_clicked')

  store.setEmail(email.value)

  try {
    const utms = sessionStorage.getItem('omenora_utms')
    const utmParams: Record<string, string> = utms ? JSON.parse(utms) : {}

    const context = {
      firstName:      store.firstName,
      email:          email.value,
      archetype:      store.archetype,
      lifePathNumber: store.lifePathNumber,
      dateOfBirth:    store.dateOfBirth,
      timeOfBirth:    store.timeOfBirth,
      city:           store.city,
      region:         store.region,
      language:       store.language,
      tempId:         store.tempId,
      ...utmParams,
    }
    sessionStorage.setItem('omenora_preview_context', JSON.stringify(context))
  } catch {
    // sessionStorage unavailable — proceed without context
  }

  await navigateTo('/founding')
}

async function handlePayment() {
  if (isProcessingPayment.value) return
  if (!email.value) return

  isProcessingPayment.value = true

  store.setEmail(email.value)

  try {
    // Discount promo code path — routes through apply-promo-discount
    if (appliedPromo.value?.codeType === 'discount_percent') {
      const { url } = await $fetch<{ sessionId: string; url: string | null }>('/api/apply-promo-discount', {
        method: 'POST',
        body: {
          codeId:        appliedPromo.value.codeId,
          code:          promoCodeInput.value.trim(),
          email:         email.value,
          tier:          'bundle',
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
  } catch {
    console.error('Payment processing failed')
    isProcessingPayment.value = false
  }
}
</script>

<style scoped>
/* ── Page shell ── */
.preview-page {
  min-height: 100vh;
  background: var(--surface-base);
  display: flex;
  flex-direction: column;
}

/* ── Header meta ── */
.preview-header__meta {
  color: var(--text-tertiary);
  font-size: 10px;
}

/* ── LOADING STATE ── */
.preview-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 48px);
}

.preview-loading__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 360px;
  text-align: center;
}

.loading-ornament {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-ornament__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.7;
}

.loading-ornament__placeholder {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
}


.loading-status {
  color: var(--text-primary);
  font-size: 11px;
  min-height: 1.4em;
}

.loading-progress {
  width: 200px;
  height: 1px;
  background: var(--border-subtle);
}

.loading-progress__fill {
  height: 100%;
  background: var(--text-primary);
  width: 0%;
  animation: loading-fill 8s ease forwards;
}

@keyframes loading-fill {
  0%   { width: 0%; }
  30%  { width: 35%; }
  60%  { width: 65%; }
  90%  { width: 90%; }
  100% { width: 95%; }
}

.loading-subtext {
  color: var(--text-tertiary);
}

/* ── ERROR STATE ── */
.preview-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 48px);
}

.preview-error__inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 480px;
}

.preview-error__msg {
  font-family: var(--font-sans);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(28px, 6vw, 44px);
  line-height: 1.1;
  margin: 0;
  color: var(--text-primary);
}

.preview-error__actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ── REPORT HEADER ── */
.report-header {
  padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px) 0;
  max-width: 1400px;
  margin: 0 auto;
}

.report-header__eyebrow {
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.report-header__title {
  font-family: var(--font-sans);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(48px, 10vw, 96px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 40px;
  color: var(--text-primary);
}

.report-header__symbol {
  width: 80px;
  height: 80px;
  margin-bottom: 32px;
}

.report-header__symbol-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.85;
}

.report-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 20px 0;
}

.report-header__sep { opacity: 0.3; }

.report-header__element {
  color: var(--text-secondary);
  margin: 4px 0 16px;
}

.report-header__traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.report-trait {
  padding: 5px 12px;
  border: 1px solid var(--border-subtle);
  font-size: 9px;
  color: var(--text-secondary);
  letter-spacing: 0.2em;
}

/* ── PREVIEW SECTION ── */
.report-preview {
  padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.report-preview__text {
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

.report-preview__blurred {
  position: relative;
  overflow: hidden;
  max-height: 80px;
  margin-bottom: 32px;
}

.report-preview__blurred::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, var(--surface-base) 70%);
}

.report-preview__blurred p {
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 0;
  filter: blur(3px);
  user-select: none;
}

/* ── Unlock meter ── */
.unlock-meter { margin-bottom: 24px; }

.unlock-meter__label {
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.unlock-meter__track {
  width: 100%;
  max-width: 320px;
  height: 1px;
  background: var(--border-subtle);
}

.unlock-meter__fill {
  height: 100%;
  width: 14%;
  background: var(--text-primary);
}

.report-receipt {
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.report-urgency { color: var(--text-tertiary); }

/* ── Locked sections ── */
.locked-sections {
  padding: 0 clamp(20px, 5vw, 80px) clamp(32px, 6vw, 48px);
  max-width: 1400px;
  margin: 0 auto;
}

.locked-sections__header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 16px;
}

.locked-sections__label { color: var(--text-tertiary); }

.locked-sections__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.locked-sections__item {
  color: var(--text-secondary);
  opacity: 0.5;
}

/* ── Testimonial ── */
.testimonial {
  padding: clamp(24px, 4vw, 40px) clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.testimonial__stars {
  color: var(--text-secondary);
  margin-bottom: 12px;
  letter-spacing: 0.1em;
}

.testimonial__quote {
  font-family: var(--font-sans);
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0 0 12px;
  font-style: italic;
}

.testimonial__attr { color: var(--text-tertiary); }

/* ── Trustpilot block ── */
.preview-tp-block {
  padding: clamp(16px, 2.5vw, 24px) clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.preview-tp-label {
  color: var(--text-tertiary);
  margin-bottom: 8px;
  letter-spacing: 0.15em;
}

/* ── PAYWALL ── */
.paywall {
  padding: clamp(32px, 6vw, 56px) clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.paywall__header { margin-bottom: 32px; }

.paywall__personal {
  font-family: var(--font-sans);
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 400;
  line-height: 1.35;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.paywall__sub { color: var(--text-secondary); }

/* ── Promo code ── */
.paywall__promo {
  margin-bottom: 24px;
  max-width: 400px;
}

.paywall__promo-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-family: inherit;
}

.paywall__promo-toggle:hover { color: var(--text-primary); }

.paywall__promo-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.paywall__promo-input {
  flex: 1;
  max-width: none;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.paywall__promo-apply {
  background: none;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.2em;
  padding: 10px 16px;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}

.paywall__promo-apply:hover:not(:disabled) {
  border-color: var(--text-primary);
  background: var(--border-faint);
}

.paywall__promo-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paywall__promo-msg { margin-top: 8px; }
.paywall__promo-msg--error  { color: #8B4513; }
.paywall__promo-msg--success { color: #3A6B4A; }

/* ── Email ── */
.paywall__email {
  margin-bottom: 24px;
  max-width: 480px;
}

.paywall__email-label {
  display: block;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

/* ── Editorial input (shared) ── */
.editorial-input {
  width: 100%;
  padding: 14px 0;
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 300;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-default);
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s;
  display: block;
}

.editorial-input:focus { border-bottom-color: var(--text-primary); }

.editorial-input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

/* ── CTA button ── */
.paywall__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 480px;
  padding: 18px 24px;
  background: var(--text-primary);
  color: var(--surface-base);
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: opacity 0.15s, transform 0.12s;
  margin-bottom: 20px;
}

.paywall__cta:hover:not(:disabled) {
  opacity: 0.85;
  transform: translateY(-1px);
}

.paywall__cta:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.paywall__cta--processing {
  opacity: 0.65;
  cursor: not-allowed;
}

.paywall__cta--secondary {
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 0;
}

.paywall__cta--secondary:hover:not(:disabled) {
  background: var(--border-faint);
  transform: none;
}

.paywall__founding-sub {
  color: var(--text-tertiary);
  margin-top: -12px;
  margin-bottom: 20px;
  max-width: 480px;
}

/* ── Guarantee & trust ── */
.paywall__guarantee {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  max-width: 480px;
}

.paywall__guarantee-check {
  color: var(--text-secondary);
  flex-shrink: 0;
  font-size: 10px;
  margin-top: 1px;
}

.paywall__trust-onetime,
.paywall__trust-secure {
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

/* ── Footer ── */
.preview-footer {
  padding: clamp(24px, 4vw, 40px) clamp(20px, 5vw, 80px);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.preview-footer nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-footer__link {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.15s;
}

.preview-footer__link:hover { color: var(--text-primary); }

.preview-footer__sep { color: var(--border-subtle); }

.preview-footer__crisis { color: var(--text-tertiary); }

/* ── Responsive ── */
@media (max-width: 480px) {
  .report-header__title { font-size: clamp(36px, 12vw, 64px); }
}

@media (prefers-reduced-motion: reduce) {
  .loading-ornament { animation: none; opacity: 1; }
  .loading-progress__fill { animation: none; width: 80%; }
  .paywall__cta:hover:not(:disabled) { transform: none; }
}


</style>
