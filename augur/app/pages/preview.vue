<template>
  <div class="preview-page">

    <!-- ── STATE A: LOADING ── -->
    <div v-if="isLoading" class="preview-loading">
      <div class="preview-loading__inner">
        <div class="loading-ornament">
          <PhoenixLoader :size="96" />
        </div>

        <p class="loading-status label-caps">
          <template v-if="loadingStage === 0">Mapping your natal chart, {{ store.firstName }}…</template>
          <template v-else-if="loadingStage === 1">
            <template v-if="showTestimonialSlot">"{{ currentTestimonial.quote }}"</template>
            <template v-else>Computing across four traditions…</template>
          </template>
          <template v-else-if="loadingStage === 2">Your {{ loadingArchetypeLabel }} archetype is being mapped…</template>
          <template v-else>Your reading is ready.</template>
        </p>

        <div class="loading-progress">
          <div class="loading-progress__fill" />
        </div>

        <p class="loading-subtext annotation">Computing across four traditions</p>
      </div>
    </div>

    <!-- ── STATE C: ERROR ── -->
    <div v-else-if="hasError" class="preview-error">
      <div class="preview-error__inner">
        <p class="label-caps" style="color: var(--color-ink-faint)">Something went wrong</p>
        <h2 class="font-display-italic preview-error__msg">We couldn't generate your reading.</h2>
        <div class="preview-error__actions">
          <CTAButton :arrow="true" @click="retryApiCall">Try again</CTAButton>
          <CTAButton variant="outline" to="/analysis" :arrow="true">Start over</CTAButton>
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
        <p class="label-caps report-header__eyebrow">Natal Reading · {{ store.firstName }}</p>
        <h1 class="report-header__title font-display-italic">{{ report.archetypeName }}</h1>
        <div v-if="archetypeFile" class="report-header__symbol">
          <img
            :src="`/symbols/${archetypeFile}`"
            :alt="report.archetypeName"
            class="report-header__symbol-img"
          />
        </div>
        <div class="editorial-rule" />
        <div class="report-header__meta">
          <span class="annotation">☉ Sun in {{ sunSign }}</span>
          <span class="annotation report-header__sep">·</span>
          <span class="annotation">☽ Moon in {{ moonSign }}</span>
          <template v-if="risingSign">
            <span class="annotation report-header__sep">·</span>
            <span class="annotation">↑ Rising {{ risingSign }}</span>
          </template>
        </div>
        <p class="annotation report-header__element">
          {{ report.element }} · Life Path {{ store.lifePathNumber }}
        </p>
        <div class="report-header__traits">
          <span v-for="trait in report.powerTraits" :key="trait" class="report-trait label-caps">{{ trait }}</span>
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
          <p class="label-caps unlock-meter__label">Your reading is 14% revealed</p>
          <div class="unlock-meter__track">
            <div class="unlock-meter__fill" />
          </div>
        </div>

        <!-- Reading receipt -->
        <p class="annotation report-receipt">
          Built from: your birth date · your natal chart ·
          your {{ archetypeShortName }} archetype (Life Path {{ store.lifePathNumber }}) ·
          {{ traditionLabel }} tradition
        </p>

        <!-- Urgency -->
        <p class="annotation report-urgency">Your chart is calculated against today's planetary transits — this interpretation is specific to this window.</p>
      </section>

      <!-- Locked sections strip -->
      <section class="locked-sections">
        <div class="locked-sections__header">
          <span class="label-caps locked-sections__label">Still locked in your {{ archetypeShortName }} reading</span>
        </div>
        <ul class="locked-sections__list">
          <li class="annotation locked-sections__item">◆ Your 2026 Destiny Forecast</li>
          <li class="annotation locked-sections__item">◆ Love &amp; Relationship Patterns</li>
          <li class="annotation locked-sections__item">◆ Your Hidden Gift</li>
          <li class="annotation locked-sections__item">◆ Career &amp; Purpose</li>
          <li class="annotation locked-sections__item">◆ Your Power Statement</li>
          <li class="annotation locked-sections__item">◆ {{ traditionSectionLabel }}</li>
        </ul>
      </section>

      <!-- Social proof (only when REAL_TESTIMONIALS populated) -->
      <div v-if="showTestimonialSlot" class="testimonial">
        <div class="testimonial__stars annotation">★★★★★</div>
        <p class="testimonial__quote font-serif">"{{ currentTestimonial.quote }}"</p>
        <p class="annotation testimonial__attr">— {{ currentTestimonial.author }}</p>
      </div>

      <!-- ── PAYWALL (standard pricing) ── -->
      <section v-if="!appliedPromo || appliedPromo.codeType !== 'full_access'" class="paywall">
        <div class="editorial-rule" />

        <div class="paywall__header">
          <p class="paywall__personal font-serif">{{ store.firstName }}, your {{ archetypeShortName }} reading is 85% complete.</p>
          <p class="annotation paywall__sub">What you just read is the surface. The sections below go into the patterns that actually run your life.</p>
        </div>

        <!-- Tier cards -->
        <div class="paywall__tiers">

          <!-- Tier 1: Basic (decoy) -->
          <div
            class="tier tier--basic"
            :class="{ 'tier--selected': selectedTier === 1, 'tier--deprioritized': isPriceTest }"
            @click="selectedTier = 1"
          >
            <div v-if="isPriceTest" class="tier__debug">variant: deprioritize-1</div>
            <div class="tier__info">
              <p class="tier__name label-caps">{{ t('basicReport') }}</p>
              <p class="annotation tier__desc">Full 7-section {{ archetypeShortName }} reading revealing why you operate the way you do</p>
            </div>
            <p class="tier__price font-serif">$2.99</p>
          </div>

          <!-- Tier 2: Most Popular (target) -->
          <div
            class="tier tier--popular"
            :class="{ 'tier--selected-popular': selectedTier === 2 }"
            @click="selectedTier = 2"
          >
            <div class="tier__badge label-caps">★ Most Popular</div>
            <div class="tier__popular-inner">
              <div class="tier__info">
                <p class="tier__name tier__name--popular label-caps">{{ t('popularBundle') }}</p>
                <p class="annotation tier__desc tier__desc--popular">❆ Full {{ archetypeShortName }} reading + your 2026 destiny windows + compatibility with one person</p>
              </div>
              <div class="tier__price-block">
                <p class="tier__price tier__price--popular font-serif">$4.99</p>
                <p class="annotation tier__price-note">one-time payment</p>
              </div>
            </div>
          </div>

          <!-- Tier 3: Oracle (anchor) — hidden in 2-tier canary -->
          <template v-if="!isTwoTierVariant">
            <div
              class="tier tier--oracle"
              :class="{ 'tier--selected-oracle': selectedTier === 3 }"
              @click="selectedTier = 3"
            >
              <div class="tier__oracle-inner">
                <div class="tier__info">
                  <p class="tier__name tier__name--oracle label-caps">{{ t('fullOracle') }}</p>
                  <p class="annotation tier__desc tier__desc--oracle">✦ Complete {{ archetypeShortName }} map — all 7 sections, your Life Path {{ store.lifePathNumber }} calendar, birth chart &amp; all traditions</p>
                </div>
                <div class="tier__price-block">
                  <p class="tier__price tier__price--oracle font-serif">$12.99</p>
                  <p class="annotation tier__price-note tier__price-note--oracle">save $8</p>
                </div>
              </div>
            </div>
          </template>
          <div v-if="isTwoTierVariant" class="tier__debug">variant: 2-tier</div>

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
            <p v-if="promoValidationResult && !promoValidationResult.valid" class="paywall__promo-msg paywall__promo-msg--error annotation">
              {{ promoValidationResult.message }}
            </p>
            <p v-if="appliedPromo?.codeType === 'discount_percent'" class="paywall__promo-msg paywall__promo-msg--success annotation">
              ✦ {{ appliedPromo.message }}
            </p>
          </template>
        </div>

        <!-- Email -->
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

        <!-- CTA -->
        <button
          class="paywall__cta"
          :class="{
            'paywall__cta--processing': isProcessingPayment || isApplyingFreeAccess,
            'paywall__cta--basic': selectedTier === 1 && !appliedPromo,
            'paywall__cta--oracle': selectedTier === 3 && !appliedPromo,
          }"
          :disabled="isProcessingPayment || isApplyingFreeAccess || !email"
          @click="appliedPromo?.codeType === 'full_access' ? applyFreeAccess() : handlePayment()"
        >
          <span v-if="isProcessingPayment || isApplyingFreeAccess">Processing…</span>
          <span v-else-if="appliedPromo?.codeType === 'full_access'">Get My Complete Reading →</span>
          <span v-else-if="selectedTier === 1">{{ t('unlockBasic') }}</span>
          <span v-else-if="selectedTier === 2">{{ t('unlockPopular') }}</span>
          <span v-else>{{ t('unlockOracle') }}</span>
        </button>

        <!-- Guarantee & trust -->
        <div class="paywall__guarantee annotation">
          <span class="paywall__guarantee-check">✦</span>
          <span>If it doesn't feel like it was written for you — full refund, same day, no form to fill.</span>
        </div>
        <p class="annotation paywall__trust-onetime">One-time payment. Nothing recurring. Your reading arrives by email within seconds.</p>
        <p class="annotation paywall__trust-secure">{{ t('securedStripe') }}</p>
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
        <p v-if="promoErrorMessage" class="paywall__promo-msg paywall__promo-msg--error annotation">{{ promoErrorMessage }}</p>
      </section>

      <!-- Footer -->
      <footer class="preview-footer" role="contentinfo">
        <nav aria-label="Legal">
          <NuxtLink to="/privacy" class="preview-footer__link annotation">Privacy Policy</NuxtLink>
          <span class="annotation preview-footer__sep" aria-hidden="true">·</span>
          <NuxtLink to="/terms" class="preview-footer__link annotation">Terms of Service</NuxtLink>
        </nav>
        <p class="preview-footer__crisis annotation">If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741</p>
      </footer>

    </template>

  </div>
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

useSeoMeta({ title: 'Your Personality Archetype Reading', robots: 'noindex, nofollow' })

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

// ── B6-2: 2-tier paywall canary (?preview_variant=2tier) ────────────
const previewVariant = computed(() => route.query.preview_variant as string | undefined)
const isTwoTierVariant = computed(() => previewVariant.value === '2tier')

// ── B6-3: Tier 1 de-emphasis canary (?price_test=deprioritize1) ─────
const isPriceTest = computed(() => route.query.price_test === 'deprioritize1')

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
        city: store.city,
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
/* ── Page shell ── */
.preview-page {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  flex-direction: column;
}

/* ── Header meta ── */
.preview-header__meta {
  color: var(--color-ink-faint);
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
  border: 1px solid var(--color-ink-ghost);
}


.loading-status {
  color: var(--color-ink);
  font-size: 11px;
  min-height: 1.4em;
}

.loading-progress {
  width: 200px;
  height: 1px;
  background: var(--color-ink-ghost);
}

.loading-progress__fill {
  height: 100%;
  background: var(--color-ink);
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
  color: var(--color-ink-faint);
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
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(28px, 6vw, 44px);
  line-height: 1.1;
  margin: 0;
  color: var(--color-ink);
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
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.report-header__title {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(48px, 10vw, 96px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 40px;
  color: var(--color-ink);
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
  color: var(--color-ink-mid);
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
  border: 1px solid var(--color-ink-ghost);
  font-size: 9px;
  color: var(--color-ink-mid);
  letter-spacing: 0.2em;
}

/* ── PREVIEW SECTION ── */
.report-preview {
  padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.report-preview__text {
  font-size: var(--text-body, 16px);
  line-height: 1.75;
  color: var(--color-ink-mid);
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
  background: linear-gradient(to bottom, transparent 0%, var(--color-bone) 70%);
}

.report-preview__blurred p {
  font-size: var(--text-body, 16px);
  line-height: 1.75;
  color: var(--color-ink-mid);
  margin: 0;
  filter: blur(3px);
  user-select: none;
}

/* ── Unlock meter ── */
.unlock-meter { margin-bottom: 24px; }

.unlock-meter__label {
  color: var(--color-ink-faint);
  margin-bottom: 10px;
}

.unlock-meter__track {
  width: 100%;
  max-width: 320px;
  height: 1px;
  background: var(--color-ink-ghost);
}

.unlock-meter__fill {
  height: 100%;
  width: 14%;
  background: var(--color-ink);
}

.report-receipt {
  color: var(--color-ink-faint);
  margin-bottom: 12px;
}

.report-urgency { color: var(--color-ink-faint); }

/* ── Locked sections ── */
.locked-sections {
  padding: 0 clamp(20px, 5vw, 80px) clamp(32px, 6vw, 48px);
  max-width: 1400px;
  margin: 0 auto;
}

.locked-sections__header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-ink-ghost);
  margin-bottom: 16px;
}

.locked-sections__label { color: var(--color-ink-faint); }

.locked-sections__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.locked-sections__item {
  color: var(--color-ink-mid);
  opacity: 0.5;
}

/* ── Testimonial ── */
.testimonial {
  padding: clamp(24px, 4vw, 40px) clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.testimonial__stars {
  color: var(--color-ink-mid);
  margin-bottom: 12px;
  letter-spacing: 0.1em;
}

.testimonial__quote {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-ink);
  margin: 0 0 12px;
  font-style: italic;
}

.testimonial__attr { color: var(--color-ink-faint); }

/* ── PAYWALL ── */
.paywall {
  padding: clamp(32px, 6vw, 56px) clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.paywall__header { margin-bottom: 32px; }

.paywall__personal {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 400;
  line-height: 1.35;
  color: var(--color-ink);
  margin: 0 0 12px;
}

.paywall__sub { color: var(--color-ink-mid); }

/* ── Tier cards ── */
.paywall__tiers {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
  max-width: 560px;
}

.tier {
  padding: 18px 20px;
  border: 1px solid var(--color-ink-ghost);
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tier:hover {
  border-color: rgba(26, 22, 18, 0.3);
  background: rgba(26, 22, 18, 0.02);
}

.tier--selected {
  border-color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.tier--deprioritized { opacity: 0.55; }

.tier__info { flex: 1; }

.tier__name {
  color: var(--color-ink);
  margin-bottom: 4px;
}

.tier__desc {
  color: var(--color-ink-faint);
  line-height: 1.4;
}

.tier__price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 400;
  color: var(--color-ink);
  flex-shrink: 0;
}

/* Popular tier */
.tier--popular {
  border-color: var(--color-ink-mid);
  padding: 0;
  overflow: hidden;
}

.tier--selected-popular {
  border-color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.tier__badge {
  background: var(--color-ink);
  color: var(--color-bone);
  padding: 6px 16px;
  font-size: 9px;
  letter-spacing: 0.2em;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 700;
}

.tier__popular-inner,
.tier__oracle-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.tier__name--popular,
.tier__name--oracle {
  color: var(--color-ink);
  margin-bottom: 4px;
}

.tier__desc--popular,
.tier__desc--oracle {
  color: var(--color-ink-faint);
  line-height: 1.4;
}

.tier__price-block {
  text-align: right;
  flex-shrink: 0;
}

.tier__price--popular,
.tier__price--oracle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 400;
  color: var(--color-ink);
}

.tier__price-note {
  color: var(--color-ink-faint);
  font-size: 10px;
  white-space: nowrap;
}

.tier__price-note--oracle { color: var(--color-ink-mid); }

/* Oracle tier */
.tier--oracle { border-color: var(--color-ink-ghost); }

.tier--selected-oracle {
  border-color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.tier__debug {
  font-size: 9px;
  color: var(--color-ink-faint);
  padding: 4px 8px;
  background: rgba(26, 22, 18, 0.05);
  font-family: monospace;
}

/* ── Promo code ── */
.paywall__promo {
  margin-bottom: 24px;
  max-width: 400px;
}

.paywall__promo-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-faint);
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-family: inherit;
}

.paywall__promo-toggle:hover { color: var(--color-ink); }

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
  border: 1px solid var(--color-ink-ghost);
  cursor: pointer;
  color: var(--color-ink);
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.2em;
  padding: 10px 16px;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}

.paywall__promo-apply:hover:not(:disabled) {
  border-color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
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
  color: var(--color-ink-faint);
  margin-bottom: 12px;
}

/* ── Editorial input (shared) ── */
.editorial-input {
  width: 100%;
  padding: 14px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 300;
  color: var(--color-ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(26, 22, 18, 0.3);
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s;
  display: block;
}

.editorial-input:focus { border-bottom-color: var(--color-ink); }

.editorial-input::placeholder {
  color: var(--color-ink-faint);
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
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
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

.paywall__cta--basic {
  background: transparent;
  color: var(--color-ink);
  border: 1px solid var(--color-ink-mid);
}

.paywall__cta--basic:hover:not(:disabled) {
  background: rgba(26, 22, 18, 0.06);
}

/* ── Guarantee & trust ── */
.paywall__guarantee {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-ink-mid);
  margin-bottom: 12px;
  max-width: 480px;
}

.paywall__guarantee-check {
  color: var(--color-ink-mid);
  flex-shrink: 0;
  font-size: 10px;
  margin-top: 1px;
}

.paywall__trust-onetime,
.paywall__trust-secure {
  color: var(--color-ink-faint);
  margin-bottom: 6px;
}

/* ── Footer ── */
.preview-footer {
  padding: clamp(24px, 4vw, 40px) clamp(20px, 5vw, 80px);
  border-top: 1px solid var(--color-ink-ghost);
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
  color: var(--color-ink-faint);
  text-decoration: none;
  transition: color 0.15s;
}

.preview-footer__link:hover { color: var(--color-ink); }

.preview-footer__sep { color: var(--color-ink-ghost); }

.preview-footer__crisis { color: var(--color-ink-faint); }

/* ── Responsive ── */
@media (max-width: 480px) {
  .report-header__title { font-size: clamp(36px, 12vw, 64px); }
  .tier__popular-inner,
  .tier__oracle-inner { flex-direction: column; align-items: flex-start; }
  .tier__price-block { text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-ornament { animation: none; opacity: 1; }
  .loading-progress__fill { animation: none; width: 80%; }
  .paywall__cta:hover:not(:disabled) { transform: none; }
}


</style>
