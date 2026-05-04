<template>
  <!-- ── Loading ── -->
  <div v-if="isLoading" class="compat-state-page" aria-live="polite">
    <div class="compat-state-inner">
      <PhoenixLoader :size="72" />
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg">{{ t('analyzingCompat') }}</p>
    </div>
  </div>

  <!-- ── Error (post-payment path) ── -->
  <div v-else-if="hasError && !isPreviewMode" class="compat-state-page">
    <div class="compat-state-inner">
      <PhoenixLoader :size="72" />
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg">{{ t('somethingWrong') }}</p>
    </div>
  </div>

  <!-- ── Session expired (preview path, no store data) ── -->
  <div v-else-if="isPreviewMode && !previewData" class="compat-state-page">
    <div class="compat-state-inner">
      <p class="label-caps compat-state-brand">Omenora</p>
      <p class="annotation compat-state-msg" style="max-width: 280px;">{{ t('compatSessionExpired') }}</p>
      <CTAButton :arrow="true" @click="navigateTo('/compatibility-quiz')">{{ t('compatRestartQuiz') }}</CTAButton>
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

    <!-- All 7 sections (full read) -->
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

    <!-- Birth Charts (T2 with_charts tier only) -->
    <div v-if="userBirthChart || partnerBirthChart" class="compat-bc-body">

      <div v-if="userBirthChart" class="compat-bc-section">
        <div class="report-section__header">
          <span class="report-section__num label-caps">❖</span>
          <div class="report-section__rule" />
        </div>
        <p class="label-caps compat-bc-section__person">{{ store.firstName || 'You' }}'s Birth Chart</p>
        <h2 class="report-section__heading font-display-italic">{{ userBirthChart.chartTitle }}</h2>
        <div class="birth-chart-signs-grid">
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Rising</p>
            <p class="bc-sign-cell__value font-serif">{{ userBirthChart.risingSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Sun</p>
            <p class="bc-sign-cell__value font-serif">{{ userBirthChart.sunSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Moon</p>
            <p class="bc-sign-cell__value font-serif">{{ userBirthChart.moonSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Dominant</p>
            <p class="bc-sign-cell__value font-serif">{{ userBirthChart.dominantPlanet }}</p>
          </div>
          <div v-if="userBirthChart.powerHouse" class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Power House</p>
            <p class="bc-sign-cell__value font-serif">{{ userBirthChart.powerHouse }}</p>
          </div>
        </div>
        <p class="report-section__body">{{ userBirthChart.reading }}</p>
        <div v-if="userBirthChart.forecast2026" class="bc-forecast-box">
          <p class="label-caps bc-forecast-box__label">2026 Planetary Forecast</p>
          <p class="bc-forecast-box__text">{{ userBirthChart.forecast2026 }}</p>
        </div>
        <p v-if="userNoonFallback" class="annotation compat-bc-noon-note">Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.</p>
      </div>

      <div v-if="partnerBirthChart" class="compat-bc-section">
        <div class="report-section__header">
          <span class="report-section__num label-caps">❖</span>
          <div class="report-section__rule" />
        </div>
        <p class="label-caps compat-bc-section__person">{{ store.partnerName || 'Them' }}'s Birth Chart</p>
        <h2 class="report-section__heading font-display-italic">{{ partnerBirthChart.chartTitle }}</h2>
        <div class="birth-chart-signs-grid">
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Rising</p>
            <p class="bc-sign-cell__value font-serif">{{ partnerBirthChart.risingSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Sun</p>
            <p class="bc-sign-cell__value font-serif">{{ partnerBirthChart.sunSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Moon</p>
            <p class="bc-sign-cell__value font-serif">{{ partnerBirthChart.moonSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Dominant</p>
            <p class="bc-sign-cell__value font-serif">{{ partnerBirthChart.dominantPlanet }}</p>
          </div>
          <div v-if="partnerBirthChart.powerHouse" class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Power House</p>
            <p class="bc-sign-cell__value font-serif">{{ partnerBirthChart.powerHouse }}</p>
          </div>
        </div>
        <p class="report-section__body">{{ partnerBirthChart.reading }}</p>
        <div v-if="partnerBirthChart.forecast2026" class="bc-forecast-box">
          <p class="label-caps bc-forecast-box__label">2026 Planetary Forecast</p>
          <p class="bc-forecast-box__text">{{ partnerBirthChart.forecast2026 }}</p>
        </div>
        <p v-if="partnerNoonFallback" class="annotation compat-bc-noon-note">Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.</p>
      </div>

    </div>

    <!-- Calculation receipt -->
    <div v-if="compatibility.calculationReceipt" class="calc-receipt calc-receipt--full">
      <p class="label-caps calc-receipt__header">{{ t('compatHowCalculated') }}</p>
      <div class="calc-receipt__rows">
        <div class="calc-receipt__row">
          <span class="annotation calc-receipt__person">{{ compatibility.calculationReceipt.person1?.name || t('quizYouLabel') }}</span>
          <span class="annotation calc-receipt__detail">
            {{ compatibility.calculationReceipt.person1?.sunSign }}
            · {{ compatibility.calculationReceipt.person1?.element }}
            · {{ t('compatLifePathLabel') }} {{ compatibility.calculationReceipt.person1?.lifePathNumber }}
            <template v-if="compatibility.calculationReceipt.person1?.archetype">
              · {{ compatibility.calculationReceipt.person1.archetype }}
            </template>
          </span>
        </div>
        <div class="calc-receipt__row">
          <span class="annotation calc-receipt__person">{{ compatibility.calculationReceipt.person2?.name || t('quizThemLabel') }}</span>
          <span class="annotation calc-receipt__detail">
            {{ compatibility.calculationReceipt.person2?.sunSign }}
            · {{ compatibility.calculationReceipt.person2?.element }}
            · {{ t('compatLifePathLabel') }} {{ compatibility.calculationReceipt.person2?.lifePathNumber }}
          </span>
        </div>
        <div v-for="(note, i) in compatibility.calculationReceipt.synastryNotes" :key="i" class="calc-receipt__row calc-receipt__row--note">
          <span class="annotation calc-receipt__detail">{{ note }}</span>
        </div>
      </div>
      <p class="annotation calc-receipt__meta">{{ compatibility.calculationReceipt.tradition }} · {{ compatibility.calculationReceipt.calculationSource }}</p>
    </div>

    <!-- Trustpilot widget -->
    <div class="compat-tp-block">
      <p class="annotation compat-tp-label">Rated Excellent by our readers</p>
      <div
        class="trustpilot-widget compat-tp-widget"
        data-locale="en-US"
        data-template-id="5419b6a8b0d04a076446a9ad"
        data-businessunit-id="69f37a2519d955d321733cd4"
        data-style-height="24px"
        data-style-width="100%"
        data-theme="dark"
      >
        <a href="https://www.trustpilot.com/review/omenora.com" target="_blank" rel="noopener">Trustpilot</a>
      </div>
    </div>

    <!-- Share / download -->
    <div class="compat-share">
      <h2 class="compat-share__heading font-display-italic">{{ t('shareYourReading') }}</h2>
      <p class="compat-share__sub annotation">
        {{ t('shareCompatSubtitle').replace('{name}', store.partnerName || 'them') }}
      </p>

      <div class="compat-share-card">
        <p class="label-caps compat-share-card__kicker">{{ t('compatShareCardKicker') }}</p>
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
        {{ isDownloadingCard ? t('compatDownloadGenerating') : t('compatDownloadCta') }}
      </CTAButton>
      <p v-if="cardDownloadError" class="annotation compat-download-error">{{ cardDownloadError }}</p>
    </div>

    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link annotation">{{ t('compatPrivacy') }}</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link annotation">{{ t('compatTerms') }}</NuxtLink>
      </nav>
    </footer>
  </div>

  <!-- ── CASE B / C: Preview + paywall ── -->
  <div v-else-if="isPreviewMode && previewData" class="compat-preview-page">

    <AppHeader>
      <template #action>
        <span class="label-caps compat-preview__badge">{{ t('compatFreeBadge') }}</span>
      </template>
    </AppHeader>

    <!-- Canceled banner (CASE C) -->
    <div v-if="isCanceled" class="compat-canceled" role="status">
      <p class="annotation">{{ t('compatCanceled') }}</p>
    </div>

    <!-- Preview masthead -->
    <div class="compat-masthead compat-masthead--preview">
      <p class="label-caps compat-masthead__kicker">{{ t('compatDestinyLabel') }}</p>
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
        <p class="label-caps report-section__kicker">{{ t('compatChallengeKicker') }}</p>
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
        <span class="label-caps locked-strip__label">{{ t('compatLockedLabel') }}</span>
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
      <p class="label-caps calc-receipt__header">{{ t('compatHowCalculated') }}</p>
      <p class="annotation calc-receipt__body">
        {{ t('compatBornPrefix') }} {{ formatDob(store.dateOfBirth) }}{{ store.city ? t('compatBornIn') + store.city : '' }}
        · {{ t('compatBornPrefix') }} {{ formatDob(store.partnerDob) }}{{ store.partnerCity ? t('compatBornIn') + store.partnerCity : '' }}
      </p>
      <p class="annotation calc-receipt__meta">{{ t('compatCalcSource') }}</p>
    </div>

    <!-- Trust line -->
    <p class="compat-trust annotation">{{ t('compatTrustLine') }}</p>

    <div class="compat-tp-block">
      <p class="annotation compat-tp-label">Rated Excellent by our readers</p>
      <div
        class="trustpilot-widget compat-tp-widget"
        data-locale="en-US"
        data-template-id="5419b6a8b0d04a076446a9ad"
        data-businessunit-id="69f37a2519d955d321733cd4"
        data-style-height="24px"
        data-style-width="100%"
        data-theme="dark"
      >
        <a href="https://www.trustpilot.com/review/omenora.com" target="_blank" rel="noopener">Trustpilot</a>
      </div>
    </div>

    <!-- Promo code -->
    <div class="compat-promo">
      <button
        v-if="!compatPromoInputVisible && !compatAppliedPromo"
        class="compat-promo__toggle annotation"
        @click="compatPromoInputVisible = true"
      >
        Have a promo code?
      </button>
      <template v-else-if="!compatAppliedPromo">
        <div class="compat-promo__row">
          <input
            id="compat-promo-code"
            v-model="compatPromoCodeInput"
            type="text"
            name="compat-promo-code"
            class="compat-promo__input editorial-input"
            placeholder="Enter code"
            autocomplete="off"
            :disabled="isValidatingCompatPromo"
            @input="compatPromoCodeInput = compatPromoCodeInput.toUpperCase()"
            @keydown.enter="validateCompatPromoCode"
          />
          <button
            class="compat-promo__apply label-caps"
            :disabled="isValidatingCompatPromo || !compatPromoCodeInput.trim()"
            @click="validateCompatPromoCode"
          >
            {{ isValidatingCompatPromo ? '…' : 'Apply' }}
          </button>
        </div>
        <p v-if="compatPromoValidationResult && !compatPromoValidationResult.valid" class="compat-promo__msg compat-promo__msg--error annotation">
          {{ compatPromoValidationResult.message }}
        </p>
      </template>
      <p v-if="compatAppliedPromo" class="compat-promo__msg compat-promo__msg--success annotation">
        ✦ Full access unlocked
      </p>
    </div>

    <!-- Free-access block (replaces paywall when full_access code applied) -->
    <div v-if="compatAppliedPromo" class="paywall paywall--free">
      <div class="editorial-rule" />
      <div class="capture-block">
        <label class="label-caps capture-block__label" for="compat-promo-email">{{ t('compatEmailLabel') }}</label>
        <input
          id="compat-promo-email"
          v-model="emailInput"
          type="email"
          :placeholder="t('emailPlaceholder')"
          autocomplete="email"
          class="editorial-input"
        />
      </div>
      <p v-if="compatPromoErrorMessage" class="compat-promo__msg compat-promo__msg--error annotation" role="alert">
        {{ compatPromoErrorMessage }}
      </p>
      <CTAButton
        :arrow="false"
        :disabled="isApplyingCompatAccess || !emailInput"
        :class="{ 'pay-card__btn--processing': isApplyingCompatAccess }"
        @click="applyCompatFreeAccess"
      >
        <span v-if="isApplyingCompatAccess">{{ t('compatProcessing') }}</span>
        <span v-else>Get Free Access →</span>
      </CTAButton>
    </div>

    <!-- Paywall block -->
    <div v-if="!compatAppliedPromo" class="paywall">
      <h2 class="paywall__heading font-display-italic">{{ t('compatUnlockHeading') }}</h2>
      <p class="paywall__sub annotation">{{ t('compatUnlockSub') }}</p>

      <div v-if="checkoutError" class="compat-checkout-error annotation" role="alert">
        {{ checkoutError }}
      </div>

      <!-- Urgency line -->
      <p class="paywall__urgency annotation">Your reading is ready — unlock it before this session expires.</p>

      <!-- Option 1: With Charts (featured — primary) -->
      <div class="pay-card pay-card--primary">
        <span class="pay-card__badge label-caps">❖ {{ t('compatWithChartsHeader') }}</span>
        <p class="pay-card__name">{{ t('compatWithChartsName') }}</p>
        <p class="pay-card__price font-serif">{{ t('compatWithChartsPrice') }}<span class="pay-card__freq annotation"> {{ t('compatWithChartsFreq') }}</span></p>
        <ul class="pay-card__bullets annotation">
          <li>{{ t('compatWithChartsBullet1') }}</li>
          <li>{{ t('compatWithChartsBullet2') }}</li>
          <li>{{ t('compatWithChartsBullet3') }}</li>
          <li>{{ t('compatWithChartsBullet4') }}</li>
        </ul>
        <CTAButton
          :arrow="false"
          :disabled="isProcessing"
          class="pay-card__btn"
          :class="{ 'pay-card__btn--processing': isProcessing && activeTier === 'with_charts' }"
          @click="handleCheckout('with_charts')"
        >
          <span v-if="isProcessing && activeTier === 'with_charts'">{{ t('compatProcessing') }}</span>
          <span v-else>{{ t('compatWithChartsCta') }}</span>
        </CTAButton>
      </div>

      <!-- Option 2: Single reading only -->
      <div class="pay-card pay-card--secondary">
        <p class="pay-card__name">{{ t('compatSingleName') }}</p>
        <p class="pay-card__price font-serif">{{ t('compatSinglePrice') }}<span class="pay-card__freq annotation"> {{ t('compatSingleFreq') }}</span></p>
        <ul class="pay-card__bullets annotation">
          <li>{{ t('compatSingleBullet1') }}</li>
          <li>{{ t('compatSingleBullet2') }}</li>
          <li>{{ t('compatSingleBullet3') }}</li>
        </ul>
        <button
          class="pay-card__btn--secondary"
          :disabled="isProcessing"
          @click="handleCheckout('single')"
        >
          <span v-if="isProcessing && activeTier === 'single'">{{ t('compatProcessing') }}</span>
          <span v-else>{{ t('compatSingleCta') }}</span>
        </button>
      </div>

      <!-- Name + email capture -->
      <div class="capture-block">
        <label class="label-caps capture-block__label" for="compat-my-name">{{ t('compatYourName') }}</label>
        <input
          id="compat-my-name"
          v-model="myNameInput"
          type="text"
          :placeholder="t('compatYourNamePlaceholder')"
          autocomplete="given-name"
          maxlength="50"
          class="editorial-input"
          @focus="trackEvent('name_field_focused')"
        />
        <label class="label-caps capture-block__label capture-block__label--spaced" for="compat-their-name">{{ t('compatTheirName') }}</label>
        <input
          id="compat-their-name"
          v-model="theirNameInput"
          type="text"
          :placeholder="t('compatTheirNamePlaceholder')"
          autocomplete="off"
          maxlength="50"
          class="editorial-input"
          @focus="trackEvent('name_field_focused')"
        />
        <label class="label-caps capture-block__label capture-block__label--spaced" for="compat-email">{{ t('compatEmailLabel') }}</label>
        <input
          id="compat-email"
          v-model="emailInput"
          type="email"
          :placeholder="t('emailPlaceholder')"
          autocomplete="email"
          class="editorial-input"
          @focus="trackEvent('email_field_focused')"
          @blur="onEmailBlur"
        />
      </div>

      <!-- Guarantee -->
      <div class="guarantee">
        <p class="annotation guarantee__text">
          {{ t('compatGuarantee') }}
        </p>
      </div>
      <p class="label-caps compat-trust-secure">{{ t('compatSecurePayment') }}</p>
    </div>

    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link annotation">{{ t('compatPrivacy') }}</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link annotation">{{ t('compatTerms') }}</NuxtLink>
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
const { $trackCustomEvent, $trackInitiateCheckout, $trackPurchase, $identifyUser, $trackCompatibilityPaywallView } = useNuxtApp() as any

function trackEvent(name: string, props?: Record<string, unknown>) {
  try { $trackCustomEvent?.(name, props ?? {}) } catch { /* never block UI */ }
}

// ── Shared section order ───────────────────────────────────────────────────────
const SECTION_ORDER = ['bond', 'strength', 'challenge', 'communication', 'powerDynamic', 'forecast', 'advice']
const LOCKED_SECTIONS = ['bond', 'strength', 'communication', 'powerDynamic', 'forecast', 'advice'] as const

const LOCKED_FALLBACK_TITLES: Record<string, string> = {
  bond:          'The Bond That Holds You Together',
  strength:      'Your Greatest Strength Together',
  communication: 'The Communication Pattern',
  powerDynamic:  'The Power Dynamic',
  forecast:      'The Next 7 Days',
  advice:        'The One Move That Changes Everything',
}

const LOCKED_PLACEHOLDER_TEXT: Record<string, string> = {
  bond:          'The gravitational pull between your charts reveals a pattern that most couples never identify — a shared frequency that either becomes your greatest resource or your blind spot.',
  strength:      'Hidden inside this pairing is a specific combination of elemental and archetypal placements that creates unusual resilience under pressure. This section maps exactly where that strength lives.',
  communication: 'How you talk to each other, how you fight, and what actually repairs the connection — grounded in Mercury\'s position and both of your elements. This section names the breakdown pattern before it costs you.',
  powerDynamic:  'Who leads in this pairing, who follows, and where the balance quietly tips — named by archetype and situation. Most couples feel this dynamic but never identify it clearly.',
  forecast:      'The next 7 days carry specific planetary weather for your connection — Venus, Mercury, and Mars are all moving through signs that affect this pairing directly. This section reads the week ahead for you.',
  advice:        'One concrete move — rooted in both of your charts — that will shift the dynamic of this connection more than any other single action you could take.',
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

// ── T2 birth chart data (compat with_charts tier) ─────────────────────────────
const userBirthChart    = ref<any>(null)
const partnerBirthChart = ref<any>(null)
const userNoonFallback    = ref(false)
const partnerNoonFallback = ref(false)

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
const identifyFired       = ref(false)

const isEmailValid = computed(() =>
  emailInput.value.includes('@') && emailInput.value.includes('.'),
)

watch(emailInput, () => {
  emailCaptureSubmitted.value = false
  if (isEmailValid.value && !identifyFired.value) {
    identifyFired.value = true
    try { $identifyUser?.(emailInput.value) } catch { /* never block UI */ }
  }
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

// ── Promo code (compatibility) ──────────────────────────────────────────────
const compatPromoInputVisible     = ref(false)
const compatPromoCodeInput        = ref('')
const isValidatingCompatPromo     = ref(false)
const compatPromoValidationResult = ref<{ valid: boolean; message: string } | null>(null)
const compatAppliedPromo          = ref<{ codeId: string; codeType: string; accessTier: string } | null>(null)
const isApplyingCompatAccess      = ref(false)
const compatPromoErrorMessage     = ref('')

async function validateCompatPromoCode() {
  const code = compatPromoCodeInput.value.trim()
  if (!code) return
  isValidatingCompatPromo.value = true
  compatPromoValidationResult.value = null
  try {
    const result = await $fetch<{ valid: boolean; message: string; codeId?: string; codeType?: string; accessTier?: string }>(
      '/api/validate-promo',
      { method: 'POST', body: { code, email: emailInput.value || '' } },
    )
    if (result.valid && result.codeType === 'full_access' && result.accessTier === 'compatibility') {
      compatAppliedPromo.value = {
        codeId:     result.codeId!,
        codeType:   result.codeType,
        accessTier: result.accessTier,
      }
      compatPromoValidationResult.value = null
    } else if (result.valid && result.codeType === 'full_access' && result.accessTier !== 'compatibility') {
      compatPromoValidationResult.value = { valid: false, message: 'This code is not valid for the compatibility reading.' }
    } else {
      compatPromoValidationResult.value = { valid: false, message: result.message }
    }
  } catch {
    compatPromoValidationResult.value = { valid: false, message: 'Unable to validate code. Please try again.' }
  } finally {
    isValidatingCompatPromo.value = false
  }
}

async function applyCompatFreeAccess() {
  if (!emailInput.value || !emailInput.value.includes('@')) {
    compatPromoErrorMessage.value = 'Please enter your email address first.'
    return
  }
  if (!compatAppliedPromo.value) return
  isApplyingCompatAccess.value = true
  compatPromoErrorMessage.value = ''
  store.setEmail(emailInput.value)
  try {
    const result = await $fetch<{ success: boolean; sessionId: string }>(
      '/api/apply-promo-access',
      {
        method: 'POST',
        body: {
          codeId:         compatAppliedPromo.value.codeId,
          code:           compatPromoCodeInput.value.trim(),
          email:          emailInput.value,
          firstName:      myNameInput.value.trim() || store.firstName || 'User',
          dateOfBirth:    store.dateOfBirth || '',
          city:           store.city || '',
          archetype:      store.archetype || 'phoenix',
          lifePathNumber: store.lifePathNumber || 1,
          region:         store.region || 'western',
          language:       store.language || 'en',
          answers:        store.answers || {},
          accessTier:     compatAppliedPromo.value.accessTier,
        },
      },
    )
    // Store the already-computed compatibility data into the full-report ref
    // before navigating so CASE P in onMounted can render it without re-fetching.
    if (store.compatibilityData) {
      compatibility.value = store.compatibilityData
    }
    await navigateTo('/compatibility?promo=1')
  } catch (err: any) {
    compatPromoErrorMessage.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    isApplyingCompatAccess.value = false
  }
}

// ── Checkout ──────────────────────────────────────────────────────────────────
const isProcessing  = ref(false)
const activeTier    = ref<'single' | 'with_charts' | null>(null)
const checkoutError = ref('')

async function handleCheckout(tier: 'single' | 'with_charts') {
  if (isProcessing.value) return

  const tierValue = tier === 'with_charts' ? 14.99 : 9.99
  const tierLabel = tier === 'with_charts' ? 'Compatibility Reading + Birth Charts' : 'Compatibility Reading'

  try {
    $trackInitiateCheckout?.({
      value:        tierValue,
      currency:     'USD',
      content_name: tierLabel,
    })
  } catch { /* never block UI */ }
  trackEvent('initiate_checkout', {
    tier,
    value: tierValue,
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
          partnerCity:  store.partnerCity,
          city:         store.city,
          timeOfBirth:  store.timeOfBirth,
          email,
          tempId:      store.tempId || `compat_${Date.now()}`,
          language:    store.language || 'en',
          origin:      window.location.origin,
          utmCreative: utmParams.utm_creative || '',
          utmSource:   utmParams.utm_source   || '',
          utmCampaign: utmParams.utm_campaign  || '',
          utmMedium:   utmParams.utm_medium    || '',
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

  const isPromo = route.query.promo === '1'

  console.warn('[compatibility] onMounted params', { sessionId: !!sessionId, isPreview, isCanceled, fromHistory, isPromo, hasStoreData: !!store.compatibilityData })

  // CASE P — promo free-access: compatibility data already in the ref (set before navigate)
  if (isPromo) {
    if (!compatibility.value && store.compatibilityData) {
      compatibility.value = store.compatibilityData
    }
    if (!compatibility.value) {
      hasError.value = true
    }
    return
  }

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
      // T2 history: extract birth chart data nested inside the JSONB blob
      if (reading.compatibility_data?.tier === 'with_charts') {
        userBirthChart.value      = reading.compatibility_data.userBirthChart    ?? null
        partnerBirthChart.value   = reading.compatibility_data.partnerBirthChart ?? null
        userNoonFallback.value    = reading.compatibility_data.userBirthChartNoonFallback    ?? false
        partnerNoonFallback.value = reading.compatibility_data.partnerBirthChartNoonFallback ?? false
      }
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
    try { $trackCompatibilityPaywallView?.({ score: store.compatibilityData?.compatibilityScore }) } catch { /* never block UI */ }
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
        amountTotal: number | null
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

      // T2: generate both birth charts in parallel before sending email/saving
      if (meta.tier === 'with_charts') {
        try {
          const [userChartRes, partnerChartRes] = await Promise.all([
            $fetch<{ success: boolean; birthChart: any; noonFallback: boolean }>(
              '/api/generate-birth-chart',
              {
                method: 'POST',
                body: {
                  firstName:   store.firstName,
                  dateOfBirth: store.dateOfBirth || meta.dateOfBirth || '',
                  timeOfBirth: store.timeOfBirth || meta.timeOfBirth  || '',
                  city:        store.city        || meta.city         || '',
                  language:    store.language,
                },
              },
            ),
            $fetch<{ success: boolean; birthChart: any; noonFallback: boolean }>(
              '/api/generate-birth-chart',
              {
                method: 'POST',
                body: {
                  firstName:   store.partnerName,
                  dateOfBirth: store.partnerDob,
                  timeOfBirth: meta.partnerTimeOfBirth || '',
                  city:        store.partnerCity       || '',
                  language:    store.language,
                },
              },
            ),
          ])
          userBirthChart.value      = userChartRes.birthChart    ?? null
          partnerBirthChart.value   = partnerChartRes.birthChart ?? null
          userNoonFallback.value    = userChartRes.noonFallback    ?? false
          partnerNoonFallback.value = partnerChartRes.noonFallback ?? false
        } catch (chartErr) {
          console.warn('[compatibility] T2 birth chart generation failed — degrading gracefully:', chartErr)
        }
      }

      if (store.email) {
        try {
          await $fetch('/api/send-compatibility-email', {
            method: 'POST',
            body: {
              email:         store.email,
              firstName:     store.firstName,
              partnerName:   store.partnerName,
              compatibility: data,
              language:      store.language,
              tier:          meta.tier || '',
              userBirthChart:                userBirthChart.value,
              partnerBirthChart:             partnerBirthChart.value,
              userBirthChartNoonFallback:    userNoonFallback.value,
              partnerBirthChartNoonFallback: partnerNoonFallback.value,
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
          tier:              meta.tier || 'single',
          userBirthChart:                userBirthChart.value,
          partnerBirthChart:             partnerBirthChart.value,
          userBirthChartNoonFallback:    userNoonFallback.value,
          partnerBirthChartNoonFallback: partnerNoonFallback.value,
        },
      }).catch(() => {}) // fire-and-forget, never blocks reading render

      // Fire purchase pixel events (dedup guard prevents double-firing on re-mount)
      try {
        const pixelKey = `omenora_purchase_tracked_${sessionId}`
        if (!sessionStorage.getItem(pixelKey)) {
          sessionStorage.setItem(pixelKey, '1')
          const purchaseValue = paymentData.amountTotal ?? 9.99
          $trackPurchase?.({
            value: purchaseValue,
            currency: 'USD',
            content_name: meta.tier === 'with_charts' ? 'Compatibility Reading + Birth Charts' : 'Compatibility Reading',
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

.calc-receipt--full {
  opacity: 1;
  border-top: 1px solid var(--color-ink-ghost);
  border-bottom: 1px solid var(--color-ink-ghost);
  margin-bottom: 0;
}

.calc-receipt__header {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.calc-receipt__rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.calc-receipt__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: baseline;
}

.calc-receipt__row--note {
  padding-top: 6px;
  border-top: 1px solid var(--color-ink-ghost);
}

.calc-receipt__person {
  color: var(--color-ink-mid);
  font-weight: 500;
  flex-shrink: 0;
  min-width: 72px;
}

.calc-receipt__detail {
  color: var(--color-ink-faint);
  line-height: 1.6;
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

/* ── Trustpilot block ── */
.compat-tp-block {
  max-width: 1400px;
  padding: clamp(16px, 2.5vw, 24px) clamp(20px, 5vw, 80px);
  margin: 0 auto;
}

.compat-tp-label {
  color: var(--color-ink-faint);
  margin-bottom: 8px;
  letter-spacing: 0.15em;
}

.compat-tp-widget {
  width: 100%;
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

/* ── Promo code (compatibility) ── */
.compat-promo {
  max-width: 1400px;
  padding: 0 clamp(20px, 5vw, 80px) clamp(20px, 3vw, 28px);
  margin: 0 auto;
}

.compat-promo__toggle {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-ink-faint);
  font-style: italic;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.compat-promo__row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.compat-promo__input {
  flex: 1;
  max-width: 280px;
}

.compat-promo__apply {
  background: none;
  border: none;
  padding: 0 0 12px;
  color: var(--color-ink-mid);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s;
}

.compat-promo__apply:hover:not(:disabled) {
  color: var(--color-ink);
}

.compat-promo__apply:disabled {
  opacity: 0.35;
  pointer-events: none;
}

.compat-promo__msg {
  margin: 10px 0 0;
  line-height: 1.5;
}

.compat-promo__msg--error {
  color: var(--color-ink-faint);
  font-style: italic;
}

.compat-promo__msg--success {
  color: var(--color-ink-mid);
  font-style: italic;
}

/* ── Free-access paywall variant ── */
.paywall--free {
  border-top: none;
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

/* ── Paywall urgency line ── */
.paywall__urgency {
  color: var(--color-ink-mid);
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 20px;
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

/* ── Birth Chart Sections (T2 with_charts tier) ── */
.compat-bc-body {
  max-width: 1400px;
  padding: 0 clamp(20px, 5vw, 80px);
  margin: 0 auto;
}

.compat-bc-section {
  padding: clamp(36px, 6vw, 56px) 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.compat-bc-section__person {
  color: var(--color-ink-faint);
  margin: 0 0 12px;
  letter-spacing: 0.1em;
}

.birth-chart-signs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  margin-bottom: 24px;
  background: var(--color-ink-ghost);
}

.bc-sign-cell {
  flex: 1;
  min-width: 80px;
  padding: 12px 14px;
  background: var(--color-bone);
}

.bc-sign-cell__label {
  margin: 0 0 4px;
  color: var(--color-ink-faint);
}

.bc-sign-cell__value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
  font-weight: 300;
  color: var(--color-ink);
  margin: 0;
}

.bc-forecast-box {
  padding: 14px 16px;
  border-left: 2px solid var(--color-ink-mid);
  margin-top: 20px;
}

.bc-forecast-box__label {
  margin: 0 0 6px;
  color: var(--color-ink-faint);
}

.bc-forecast-box__text {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: clamp(16px, 2.2vw, 18px);
  font-weight: 300;
  color: var(--color-ink-mid);
  margin: 0;
  line-height: 1.7;
}

.compat-bc-noon-note {
  margin-top: 14px;
  color: var(--color-ink-faint);
  font-style: italic;
  line-height: 1.5;
  opacity: 0.7;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .compat-masthead__score { font-size: clamp(60px, 18vw, 90px); }
  .pay-card__price { font-size: clamp(28px, 8vw, 36px); }
}
</style>
