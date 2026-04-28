<template>
  <!-- ── Loading ── -->
  <div v-if="isLoading" class="compat-state-page" aria-live="polite">
    <div class="compat-state-inner">
      <OrbitalMark />
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg">{{ t('analyzingCompat') }}</p>
    </div>
  </div>

  <!-- ── Error (post-payment path) ── -->
  <div v-else-if="hasError && !isPreviewMode" class="compat-state-page">
    <div class="compat-state-inner">
      <OrbitalMark />
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg">{{ t('somethingWrong') }}</p>
    </div>
  </div>

  <!-- ── Session expired (preview path, no store data) ── -->
  <div v-else-if="isPreviewMode && !previewData" class="compat-state-page">
    <div class="compat-state-inner">
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg" style="max-width: 280px;">Session expired. Start the quiz again to see your reading.</p>
      <CTAButton :arrow="true" @click="navigateTo('/compatibility-quiz')">Restart the quiz</CTAButton>
    </div>
  </div>

  <!-- ── CASE A: Full post-payment report ── -->
  <div v-else-if="!isPreviewMode && compatibility" class="compat-full-page">

    <AppHeader>
      <template #action>
        <span class="label-caps compat-full-page__badge">{{ t('compatReading') }}</span>
      </template>
    </AppHeader>

    <!-- Report masthead -->
    <div class="compat-masthead">
      <p class="label-caps compat-masthead__kicker">{{ t('destinyCompat') }}</p>
      <h1 class="compat-masthead__names font-display-italic">
        {{ store.firstName || 'You' }} &amp; {{ store.partnerName || 'Them' }}
      </h1>
      <p class="compat-masthead__score font-serif" :style="{ color: scoreColor }">
        {{ compatibility.compatibilityScore }}%
      </p>
      <div class="editorial-rule" />
      <p class="compat-masthead__title font-display-italic">{{ compatibility.compatibilityTitle }}</p>
    </div>

    <!-- All 5 sections (full read) -->
    <div class="report-body">
      <div
        v-for="(key, idx) in SECTION_ORDER"
        :key="key"
        class="report-section"
        :class="{ 'report-section--last': idx === SECTION_ORDER.length - 1 }"
      >
        <div class="report-section__header">
          <span class="report-section__num label-caps">{{ String(idx + 1).padStart(2, '0') }}</span>
          <div class="report-section__rule" />
        </div>
        <h2 class="report-section__heading font-display-italic">
          {{ compatibility.sections[key]?.title }}
        </h2>
        <div v-if="key === 'advice'" class="advice-block">
          <p class="report-section__body">{{ compatibility.sections[key]?.content }}</p>
        </div>
        <p v-else class="report-section__body">{{ compatibility.sections[key]?.content }}</p>
      </div>
    </div>

    <!-- Share / download -->
    <div class="compat-share">
      <h2 class="compat-share__heading font-display-italic">{{ t('shareYourReading') }}</h2>
      <p class="compat-share__sub annotation">
        {{ t('shareCompatSubtitle').replace('{name}', store.partnerName || 'them') }}
      </p>

      <div class="compat-share-card">
        <p class="label-caps compat-share-card__kicker">Destiny Compatibility</p>
        <p class="compat-share-card__names font-serif">{{ store.firstName || 'You' }} &amp; {{ store.partnerName || 'Them' }}</p>
        <p class="compat-share-card__score font-serif" :style="{ color: scoreColor }">
          {{ compatibility.compatibilityScore }}%
        </p>
        <p class="compat-share-card__title">{{ compatibility.compatibilityTitle }}</p>
        <p class="label-caps compat-share-card__domain">omenora.com</p>
      </div>

      <CTAButton
        :arrow="false"
        :disabled="isDownloadingCard"
        class="compat-download-btn"
        @click="downloadCompatCard"
      >
        {{ isDownloadingCard ? 'Generating…' : 'Download your compatibility card' }}
      </CTAButton>
      <p v-if="cardDownloadError" class="annotation compat-download-error">{{ cardDownloadError }}</p>
    </div>

    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link annotation">Privacy Policy</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link annotation">Terms of Service</NuxtLink>
      </nav>
    </footer>
  </div>

  <!-- ── CASE B / C: Preview + paywall ── -->
  <div v-else-if="isPreviewMode && previewData" class="compat-preview-page">

    <AppHeader>
      <template #action>
        <span class="label-caps compat-preview__badge">Free Preview</span>
      </template>
    </AppHeader>

    <!-- Canceled banner (CASE C) -->
    <div v-if="isCanceled" class="compat-canceled" role="status">
      <p class="annotation">Checkout canceled. Your reading is still here when you're ready.</p>
    </div>

    <!-- Preview masthead -->
    <div class="compat-masthead compat-masthead--preview">
      <p class="label-caps compat-masthead__kicker">Destiny Compatibility</p>
      <h1 class="compat-masthead__names font-display-italic">
        {{ displayMyName }} &amp; {{ displayTheirName }}
      </h1>
      <p class="compat-masthead__score font-serif" :style="{ color: previewScoreColor }">
        {{ previewData.compatibilityScore }}%
      </p>
      <div class="editorial-rule" />
      <p class="compat-masthead__title font-display-italic">{{ previewData.compatibilityTitle }}</p>
    </div>

    <!-- Challenge section (free hook) -->
    <div class="report-body">
      <div class="report-section report-section--challenge">
        <p class="label-caps report-section__kicker">The Tension You Must Navigate</p>
        <div class="report-section__header">
          <span class="report-section__num label-caps">01</span>
          <div class="report-section__rule" />
        </div>
        <h2 class="report-section__heading font-display-italic">
          {{ previewData.sections?.challenge?.title }}
        </h2>
        <p class="report-section__body">{{ previewData.sections?.challenge?.content }}</p>
      </div>
    </div>

    <!-- Locked sections strip -->
    <div class="locked-strip">
      <div class="locked-strip__header">
        <span class="label-caps locked-strip__label">Still locked in your reading</span>
      </div>
      <div class="locked-strip__cards">
        <div v-for="key in LOCKED_SECTIONS" :key="key" class="locked-card">
          <div class="locked-card__header">
            <span class="locked-card__icon">—</span>
            <span class="locked-card__title annotation">
              {{ previewData.sections?.[key]?.title || LOCKED_FALLBACK_TITLES[key] }}
            </span>
          </div>
          <p class="locked-card__blur annotation">{{ LOCKED_PLACEHOLDER_TEXT[key] }}</p>
        </div>
      </div>
    </div>

    <!-- Calculation receipt -->
    <div class="calc-receipt">
      <p class="label-caps calc-receipt__header">How we calculated this</p>
      <p class="annotation calc-receipt__body">
        Born {{ formatDob(store.dateOfBirth) }}{{ store.city ? ' in ' + store.city : '' }}
        · Born {{ formatDob(store.partnerDob) }}{{ store.partnerCity ? ' in ' + store.partnerCity : '' }}
      </p>
      <p class="annotation calc-receipt__meta">Western (Tropical) · Calculated with Swiss Ephemeris</p>
    </div>

    <!-- Trust line -->
    <p class="compat-trust annotation">Not a $1 soulmate sketch. Not a psychic chat. Just real birth charts compared.</p>

    <!-- Paywall block -->
    <div class="paywall">
      <h2 class="paywall__heading font-display-italic">Unlock your full reading</h2>
      <p class="paywall__sub annotation">
        Your challenge is just the beginning. The bond, strength, forecast, and one piece of advice — written for this exact connection, grounded in real chart data.
      </p>

      <!-- Name + email capture -->
      <div class="capture-block">
        <label class="label-caps capture-block__label" for="compat-my-name">Your first name</label>
        <input
          id="compat-my-name"
          v-model="myNameInput"
          type="text"
          placeholder="Your first name"
          autocomplete="given-name"
          maxlength="50"
          class="editorial-input"
          @focus="trackEvent('name_field_focused')"
        />
        <label class="label-caps capture-block__label capture-block__label--spaced" for="compat-their-name">Their first name</label>
        <input
          id="compat-their-name"
          v-model="theirNameInput"
          type="text"
          placeholder="Their first name"
          autocomplete="off"
          maxlength="50"
          class="editorial-input"
          @focus="trackEvent('name_field_focused')"
        />
        <label class="label-caps capture-block__label capture-block__label--spaced" for="compat-email">Where should we send your reading?</label>
        <input
          id="compat-email"
          v-model="emailInput"
          type="email"
          placeholder="your@email.com"
          autocomplete="email"
          class="editorial-input"
          @focus="trackEvent('email_field_focused')"
          @blur="onEmailBlur"
        />
      </div>

      <p v-if="emailPrompt" class="compat-email-prompt annotation" role="alert">
        Please enter your email to start the subscription.
      </p>
      <div v-if="checkoutError" class="compat-checkout-error annotation" role="alert">
        {{ checkoutError }}
      </div>

      <!-- Option 1: Subscription (primary) -->
      <div class="pay-card pay-card--primary">
        <p class="label-caps pay-card__badge">Recommended</p>
        <p class="pay-card__name">Compatibility Plus</p>
        <p class="pay-card__price font-serif">$9.99<span class="pay-card__freq annotation"> / month</span></p>
        <ul class="pay-card__bullets annotation">
          <li>Unlimited compatibility readings — any pairing, any time</li>
          <li>Weekly relationship weather — every Monday in your inbox</li>
          <li>Daily horoscope — love, work &amp; health, personalized to your chart</li>
          <li>Full reading history on your account</li>
          <li>Real chart math — Swiss Ephemeris, not sun sign guesses</li>
        </ul>
        <CTAButton
          :arrow="false"
          :disabled="isProcessing"
          class="pay-card__btn"
          :class="{ 'pay-card__btn--processing': isProcessing && activeTier === 'subscription' }"
          @click="handleCheckout('subscription')"
        >
          <span v-if="isProcessing && activeTier === 'subscription'">Processing…</span>
          <span v-else>Start subscription — $9.99/month</span>
        </CTAButton>
        <p class="annotation pay-card__footnote">Cancel anytime in 1 click. No hidden trial.</p>
        <p class="annotation pay-card__footnote">Next charge: {{ nextChargeDate }}</p>
        <p class="annotation pay-card__footnote pay-card__footnote--muted">Apple Pay &amp; Google Pay accepted</p>
      </div>

      <!-- Option 2: Single (secondary) -->
      <div class="pay-card pay-card--secondary">
        <p class="pay-card__name">Just this reading</p>
        <p class="pay-card__price font-serif">$7.99<span class="pay-card__freq annotation"> one-time</span></p>
        <ul class="pay-card__bullets annotation">
          <li>Full compatibility analysis for this pairing only</li>
          <li>All 5 sections unlocked — bond, strength, challenge, forecast &amp; advice</li>
          <li>Shareable reading card included</li>
        </ul>
        <button
          class="pay-card__btn pay-card__btn--secondary"
          :class="{ 'pay-card__btn--processing': isProcessing && activeTier === 'single' }"
          :disabled="isProcessing"
          @click="handleCheckout('single')"
        >
          <span v-if="isProcessing && activeTier === 'single'">Processing…</span>
          <span v-else>Get this reading — $7.99</span>
        </button>
      </div>

      <!-- Guarantee -->
      <div class="guarantee">
        <p class="annotation guarantee__text">
          ✦ If it doesn't feel like it was written for you, full refund within 24 hours. No form to fill.
        </p>
      </div>
      <p class="label-caps compat-trust-secure">Secure payment by Stripe</p>
    </div>

    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link annotation">Privacy Policy</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link annotation">Terms of Service</NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'
import { useAuth } from '~/composables/useAuth'

useSeoMeta({ title: 'Your Love Compatibility Reading', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()
const { provisionUser, session, restoreSession } = useAuth()
const { $trackCustomEvent, $trackInitiateCheckout, $trackPurchase } = useNuxtApp() as any

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
const isDownloadingCard = ref(false)
const cardDownloadError = ref('')

async function downloadCompatCard() {
  if (isDownloadingCard.value || !compatibility.value) return
  isDownloadingCard.value = true
  cardDownloadError.value = ''
  try {
    const response = await fetch('/api/generate-compatibility-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName:          store.firstName          || '',
        partnerName:        store.partnerName        || '',
        compatibilityScore: compatibility.value.compatibilityScore,
        compatibilityTitle: compatibility.value.compatibilityTitle,
        challengeContent:   compatibility.value.sections?.challenge?.content || '',
      }),
    })
    if (!response.ok) throw new Error('Failed to generate card')
    const blob = await response.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `omenora-compatibility-${store.firstName || 'reading'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    cardDownloadError.value = 'Unable to generate image — please try again.'
  } finally {
    isDownloadingCard.value = false
  }
}

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

  try {
    $trackInitiateCheckout?.({
      value: tier === 'subscription' ? 9.99 : 7.99,
      currency: 'USD',
      content_name: tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
    })
  } catch { /* never block UI */ }
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
    const storedUtm = sessionStorage.getItem('omenora_utms')
    const utmParams = storedUtm ? (JSON.parse(storedUtm) as Record<string, string>) : {}

    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-compatibility-payment',
      {
        method: 'POST',
        body: {
          tier,
          firstName,
          partnerName,
          dateOfBirth: store.dateOfBirth,
          partnerDob:  store.partnerDob,
          partnerCity: store.partnerCity,
          email,
          tempId:      store.tempId || `compat_${Date.now()}`,
          language:    store.language || 'en',
          origin:      window.location.origin,
          utmCreative: utmParams.utm_creative || '',
          utmSource:   utmParams.utm_source   || '',
          utmCampaign: utmParams.utm_campaign  || '',
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
  await nextTick() // ensure route query is fully settled after navigation

  const sessionId  = route.query.session_id as string | undefined
  const preview    = route.query.preview    as string | undefined
  const canceled   = route.query.canceled   as string | undefined
  const fromHistory = route.query.from      === 'history'

  const isPreview  = preview  === '1'
  const isCanceled = canceled === '1'

  console.warn('[compatibility] onMounted params', { sessionId: !!sessionId, isPreview, isCanceled, fromHistory, hasStoreData: !!store.compatibilityData })

  // CASE H — history view from account page: load saved reading from DB, no re-generation
  if (fromHistory && sessionId) {
    isLoading.value = true
    try {
      // Restore session so we have a Bearer token
      await restoreSession()
      const token = session.value?.access_token
      if (!token) {
        await navigateTo('/account')
        return
      }
      const { reading } = await $fetch<{ reading: any }>('/api/get-compatibility-reading', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { sessionId },
      })
      compatibility.value = reading.compatibility_data
      if (!store.firstName   && reading.first_name)   store.firstName   = reading.first_name
      if (!store.partnerName && reading.partner_name)  store.setPartnerData({ name: reading.partner_name, dob: reading.partner_dob || '', city: '' })
      isLoading.value = false
    } catch {
      hasError.value  = true
      isLoading.value = false
    }
    return
  }

  // CASE B / C — preview or post-cancel: ALWAYS wins, even if session_id is also present
  if (isPreview || isCanceled) {
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

  // CASE A — post-payment (only reachable when preview/canceled are both absent)
  if (!isPreview && !isCanceled && sessionId) {
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
      if (!store.firstName)    store.setPersonalInfo(meta.firstName || '', meta.dateOfBirth || store.dateOfBirth, store.city)
      if (!store.dateOfBirth && meta.dateOfBirth) store.setPersonalInfo(store.firstName, meta.dateOfBirth, store.city)
      if (!store.email)        store.setEmail(meta.email || paymentData.customerEmail || '')
      if (!store.partnerName)  store.setPartnerData({ name: meta.partnerName || '', dob: meta.partnerDob || store.partnerDob, city: meta.partnerCity || store.partnerCity })
      if (!store.partnerDob && meta.partnerDob)   store.setPartnerData({ name: store.partnerName, dob: meta.partnerDob, city: meta.partnerCity || store.partnerCity })
      if (!store.tempId)       store.setTempId(meta.tempId || '')
      if (!store.languageManualOverride && meta.language) store.setLanguage(meta.language)

      const { compatibility: data } = await $fetch<{
        success: boolean
        compatibility: any
      }>('/api/generate-compatibility', {
        method: 'POST',
        body: {
          firstName:      store.firstName,
          dateOfBirth:    store.dateOfBirth || meta.dateOfBirth || '',
          archetype:      store.archetype   || undefined,
          element:        store.report?.element        || undefined,
          lifePathNumber: store.lifePathNumber          || undefined,
          powerTraits:    store.report?.powerTraits     || undefined,
          partnerName:    store.partnerName,
          partnerDob:     store.partnerDob,
          partnerCity:    store.partnerCity,
          language:       store.language,
          previewMode:    false,
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
              tier:        meta.tier || '',
            },
          })
        } catch {
          console.error('Compatibility email failed')
        }
      }

      // Silently provision Supabase Auth account (non-blocking)
      provisionUser({ sessionId }).catch(() => {})

      // Persist reading to DB so it appears in account history (fire-and-forget, never blocks render)
      $fetch('/api/save-compatibility-reading', {
        method: 'POST',
        body: {
          sessionId,
          email:             store.email || paymentData.customerEmail || '',
          firstName:         store.firstName || '',
          partnerName:       store.partnerName || '',
          partnerDob:        store.partnerDob || '',
          compatibilityData: compatibility.value,
          language:          store.language || 'en',
        },
      }).catch(() => {}) // fire-and-forget, never blocks reading render

      // Fire purchase pixel events (dedup guard prevents double-firing on re-mount)
      try {
        const pixelKey = `omenora_purchase_tracked_${sessionId}`
        if (!sessionStorage.getItem(pixelKey)) {
          sessionStorage.setItem(pixelKey, '1')
          const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 7.99 : 2.99)
          $trackPurchase?.({
            value: purchaseValue,
            currency: 'USD',
            content_name: meta.tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
          })
        }
      } catch { /* never block UI */ }

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
/* ── Centered state pages (loading / error / expired) ── */
.compat-state-page {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  align-items: center;
  justify-content: center;
}

.compat-state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 0 clamp(20px, 5vw, 48px);
}

.compat-state-brand {
  color: var(--color-ink-faint);
}

.compat-state-msg {
  color: var(--color-ink-faint);
  max-width: 300px;
  line-height: 1.6;
}

/* ── Full report page ── */
.compat-full-page {
  min-height: 100vh;
  background: var(--color-bone);
}

.compat-full-page__badge {
  color: var(--color-ink-faint);
  font-size: 10px;
}

/* ── Preview page ── */
.compat-preview-page {
  min-height: 100vh;
  background: var(--color-bone);
}

.compat-preview__badge {
  color: var(--color-ink-faint);
  font-size: 10px;
}

/* ── Canceled banner ── */
.compat-canceled {
  border-top: 1px solid var(--color-ink-ghost);
  padding: 14px clamp(20px, 5vw, 48px);
  text-align: center;
}

.compat-canceled .annotation {
  color: var(--color-ink-faint);
  font-style: italic;
}

/* ── Masthead ── */
.compat-masthead {
  padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px) clamp(40px, 6vw, 64px);
  max-width: 1400px;
  margin: 0 auto;
}

.compat-masthead__kicker {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

.compat-masthead__names {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(36px, 8vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  margin: 0 0 24px;
}

.compat-masthead__score {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(72px, 16vw, 120px);
  font-weight: 300;
  line-height: 1;
  margin: 0 0 24px;
  letter-spacing: -0.04em;
}

.editorial-rule {
  width: 48px;
  height: 1px;
  background: var(--color-ink-mid);
  margin-bottom: 24px;
}

.compat-masthead__title {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(18px, 3vw, 24px);
  line-height: 1.4;
  color: var(--color-ink-mid);
  margin: 0;
}

/* ── Report body ── */
.report-body {
  max-width: 1400px;
  padding: 0 clamp(20px, 5vw, 80px);
  margin: 0 auto;
}

/* ── Report sections ── */
.report-section {
  padding: clamp(36px, 6vw, 56px) 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.report-section--last {
  border-bottom: 1px solid var(--color-ink-ghost);
}

.report-section__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.report-section__num {
  color: var(--color-ink-faint);
  flex-shrink: 0;
}

.report-section__rule {
  flex: 1;
  height: 1px;
  background: var(--color-ink-ghost);
}

.report-section__kicker {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.report-section__heading {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(22px, 4vw, 32px);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin: 0 0 24px;
}

.report-section__body {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(17px, 2.5vw, 20px);
  font-weight: 300;
  line-height: 1.8;
  color: var(--color-ink-mid);
  margin: 0;
}

/* ── Advice block ── */
.advice-block {
  border-left: 2px solid var(--color-ink-mid);
  padding-left: 24px;
}

/* ── Challenge section (free preview hook) ── */
.report-section--challenge {
  border-top: 2px solid var(--color-ink);
}

/* ── Locked strip ── */
.locked-strip {
  max-width: 1400px;
  padding: clamp(28px, 4vw, 40px) clamp(20px, 5vw, 80px);
  border-top: 1px solid var(--color-ink-ghost);
  margin: 0 auto;
}

.locked-strip__header {
  margin-bottom: 20px;
}

.locked-strip__label {
  color: var(--color-ink-faint);
}

.locked-strip__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.locked-card {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
}

.locked-card:last-child {
  border-bottom: none;
}

.locked-card__header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
}

.locked-card__icon {
  color: var(--color-ink-faint);
  flex-shrink: 0;
}

.locked-card__title {
  color: var(--color-ink-mid);
  font-style: italic;
}

.locked-card__blur {
  filter: blur(4px);
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  max-height: 48px;
  color: var(--color-ink-mid);
  margin: 0;
  line-height: 1.6;
}

/* ── Calculation receipt ── */
.calc-receipt {
  max-width: 1400px;
  padding: clamp(20px, 3vw, 32px) clamp(20px, 5vw, 80px);
  border-top: 1px solid var(--color-ink-ghost);
  opacity: 0.7;
  margin: 0 auto;
}

.calc-receipt__header {
  color: var(--color-ink-faint);
  margin-bottom: 8px;
}

.calc-receipt__body {
  color: var(--color-ink-faint);
  line-height: 1.6;
  margin: 0 0 4px;
}

.calc-receipt__meta {
  color: var(--color-ink-faint);
  margin: 0;
  opacity: 0.7;
}

/* ── Trust line ── */
.compat-trust {
  max-width: 1400px;
  padding: 0 clamp(20px, 5vw, 80px) clamp(24px, 4vw, 36px);
  color: var(--color-ink-faint);
  font-style: italic;
  line-height: 1.6;
  margin: 0 auto;
}

/* ── Paywall ── */
.paywall {
  max-width: 1400px;
  padding: clamp(36px, 6vw, 56px) clamp(20px, 5vw, 80px) clamp(48px, 8vw, 72px);
  border-top: 1px solid var(--color-ink-ghost);
  margin: 0 auto;
}

.paywall__heading {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(28px, 6vw, 48px);
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  margin: 0 0 16px;
}

.paywall__sub {
  color: var(--color-ink-faint);
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 520px;
}

/* ── Capture block ── */
.capture-block {
  margin-bottom: 24px;
}

.capture-block__label {
  display: block;
  color: var(--color-ink-faint);
  margin-bottom: 10px;
}

.capture-block__label--spaced {
  margin-top: 24px;
}

.editorial-input {
  width: 100%;
  max-width: 480px;
  padding: 12px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
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

.editorial-input:focus {
  border-bottom-color: var(--color-ink);
}

.editorial-input::placeholder {
  color: var(--color-ink-faint);
  font-style: italic;
}

/* ── Prompts / errors ── */
.compat-email-prompt {
  color: var(--color-ink-faint);
  font-style: italic;
  border: 1px solid var(--color-ink-ghost);
  padding: 10px 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.compat-checkout-error {
  color: var(--color-ink-faint);
  border: 1px solid var(--color-ink-ghost);
  padding: 12px 16px;
  margin-bottom: 16px;
  line-height: 1.55;
}

/* ── Pay cards ── */
.pay-card {
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
}

.pay-card--primary {
  border: 1px solid var(--color-ink-mid);
  border-left: 2px solid var(--color-ink);
  padding-top: 36px;
}

.pay-card--secondary {
  border: 1px solid var(--color-ink-ghost);
}

.pay-card__badge {
  position: absolute;
  top: -1px;
  left: 24px;
  color: var(--color-ink);
  font-size: 9px;
  letter-spacing: 0.12em;
  background: var(--color-bone);
  padding: 0 8px;
  transform: translateY(-50%);
}

.pay-card__name {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0 0 8px;
  letter-spacing: 0.02em;
}

.pay-card--secondary .pay-card__name {
  color: var(--color-ink-mid);
  font-weight: 500;
}

.pay-card__price {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px, 6vw, 44px);
  font-weight: 300;
  color: var(--color-ink);
  margin: 0 0 16px;
  line-height: 1;
}

.pay-card--secondary .pay-card__price {
  font-size: clamp(26px, 5vw, 36px);
  color: var(--color-ink-mid);
}

.pay-card__freq {
  font-size: 14px;
  color: var(--color-ink-faint);
}

.pay-card__bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pay-card__bullets li {
  color: var(--color-ink-mid);
  line-height: 1.5;
  padding-left: 16px;
  position: relative;
}

.pay-card__bullets li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--color-ink-faint);
  font-size: 10px;
  top: 3px;
}

.pay-card__btn {
  width: 100%;
  margin-bottom: 8px;
}

.pay-card__btn--processing {
  opacity: 0.6;
  pointer-events: none;
}

.pay-card__btn--secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 14px 24px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost);
  color: var(--color-ink-mid);
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  margin-bottom: 8px;
}

.pay-card__btn--secondary:hover:not(:disabled) {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

.pay-card__btn--secondary:disabled {
  opacity: 0.35;
  pointer-events: none;
}

.pay-card__footnote {
  color: var(--color-ink-faint);
  margin: 4px 0 0;
  line-height: 1.5;
}

.pay-card__footnote--muted {
  opacity: 0.6;
}

/* ── Guarantee ── */
.guarantee {
  margin-top: 24px;
  padding: 16px 20px;
  border: 1px solid var(--color-ink-ghost);
}

.guarantee__text {
  color: var(--color-ink-faint);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

.compat-trust-secure {
  color: var(--color-ink-faint);
  text-align: center;
  margin-top: 14px;
  opacity: 0.7;
}

/* ── Share section (full report) ── */
.compat-share {
  max-width: 1400px;
  padding: clamp(40px, 6vw, 60px) clamp(20px, 5vw, 80px);
  border-top: 1px solid var(--color-ink-ghost);
  text-align: center;
  margin: 0 auto;
}

.compat-share__heading {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(22px, 4vw, 32px);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin: 0 0 10px;
}

.compat-share__sub {
  color: var(--color-ink-faint);
  margin: 0 0 28px;
}

.compat-share-card {
  width: min(300px, 100%);
  border: 1px solid var(--color-ink-ghost);
  margin: 0 auto 24px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.compat-share-card__kicker {
  color: var(--color-ink-faint);
  margin: 0 0 8px;
}

.compat-share-card__names {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 300;
  color: var(--color-ink);
  margin: 0;
}

.compat-share-card__score {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px;
  font-weight: 300;
  line-height: 1;
  margin: 4px 0 0;
}

.compat-share-card__title {
  font-size: 13px;
  font-style: italic;
  color: var(--color-ink-mid);
  margin: 4px 0 8px;
}

.compat-share-card__domain {
  color: var(--color-ink-faint);
  margin: 0;
  opacity: 0.7;
}

.compat-download-btn {
  margin: 0 auto;
}

.compat-download-error {
  color: var(--color-ink-faint);
  text-align: center;
  margin-top: 8px;
  font-style: italic;
}

/* ── Footer ── */
.compat-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 40px) clamp(20px, 5vw, 48px);
  border-top: 1px solid var(--color-ink-ghost);
}

.compat-footer nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-link {
  color: var(--color-ink-faint);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-ink-mid);
}

.footer-sep {
  color: var(--color-ink-ghost);
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .compat-masthead__score { font-size: clamp(60px, 18vw, 90px); }
  .pay-card__price { font-size: clamp(28px, 8vw, 36px); }
}
</style>
