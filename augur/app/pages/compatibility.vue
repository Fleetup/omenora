<template>
  <!-- ── Atmospheric page root — shared by all states ── -->
  <div class="compat-page">

    <!-- Atmospheric background layers (same pattern as compatibility-quiz.vue) -->
    <div class="compat-page__bg-image" aria-hidden="true" />
    <div class="compat-page__bg-overlay" aria-hidden="true" />
    <div class="page-grain" aria-hidden="true" />

    <!-- ── Loading ── -->
    <LoaderBar :active="isLoading" :messages="compatLoadingMessages" :interval="1200" />

    <!-- ── Error (post-payment path) ── -->
    <div v-if="hasError && !isPreviewMode" class="compat-state-layer">
      <AppCard variant="glass" :hoverable="false" class="compat-state-card">
        <AppEyebrow class="compat-state-brand">Omenora</AppEyebrow>
        <AppCaption as="p" class="compat-state-msg">{{ t('somethingWrong') }}</AppCaption>
        <AppButton variant="primary" :arrow="true" @click="navigateTo('/compatibility-quiz')">{{ t('compatRestartQuiz') }}</AppButton>
      </AppCard>
    </div>

    <!-- ── Session expired (preview path, no store data) ── -->
    <div v-else-if="isPreviewMode && !previewData" class="compat-state-layer">
      <AppCard variant="glass" :hoverable="false" class="compat-state-card">
        <AppEyebrow class="compat-state-brand">Omenora</AppEyebrow>
        <AppCaption as="p" class="compat-state-msg" style="max-width: 280px;">{{ t('compatSessionExpired') }}</AppCaption>
        <AppButton variant="primary" :arrow="true" @click="navigateTo('/compatibility-quiz')">{{ t('compatRestartQuiz') }}</AppButton>
      </AppCard>
    </div>

  <!-- ── CASE A: Full post-payment report ── -->
  <div v-else-if="!isPreviewMode && compatibility" class="compat-full-page">

    <AppHeader>
      <template #action>
        <AppEyebrow as="span" class="compat-full-page__badge">{{ t('compatReading') }}</AppEyebrow>
      </template>
    </AppHeader>

    <main>

    <!-- Report masthead -->
    <div class="compat-masthead">
      <AppEyebrow class="compat-masthead__kicker">{{ t('destinyCompat') }}</AppEyebrow>
      <AppHeadline as="h1" class="compat-masthead__names">
        {{ store.firstName || 'You' }} &amp; {{ store.partnerName || 'Them' }}
      </AppHeadline>
      <AppSubhead as="p" variant="strong" class="compat-masthead__score" :style="{ color: scoreColor }">
        {{ compatibility.compatibilityScore }}%
      </AppSubhead>
      <div class="editorial-rule" />
      <AppHeadline as="p" class="compat-masthead__title">{{ compatibility.compatibilityTitle }}</AppHeadline>
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
          <AppEyebrow as="span" class="report-section__num">{{ String(idx + 1).padStart(2, '0') }}</AppEyebrow>
          <div class="report-section__rule" />
        </div>
        <AppHeadline as="h2" class="report-section__heading">
          {{ compatibility.sections[key]?.title }}
        </AppHeadline>
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
          <AppEyebrow as="span" class="report-section__num">❖</AppEyebrow>
          <div class="report-section__rule" />
        </div>
        <AppEyebrow class="compat-bc-section__person">{{ store.firstName || 'You' }}'s Birth Chart</AppEyebrow>
        <AppHeadline as="h2" class="report-section__heading">{{ userBirthChart.chartTitle }}</AppHeadline>
        <div class="birth-chart-signs-grid">
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Rising</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ userBirthChart.risingSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Sun</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ userBirthChart.sunSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Moon</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ userBirthChart.moonSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Dominant</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ userBirthChart.dominantPlanet }}</AppSubhead>
          </div>
          <div v-if="userBirthChart.powerHouse" class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Power House</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ userBirthChart.powerHouse }}</AppSubhead>
          </div>
        </div>
        <p class="report-section__body">{{ userBirthChart.reading }}</p>
        <div v-if="userBirthChart.forecast2026" class="bc-forecast-box">
          <AppEyebrow class="bc-forecast-box__label">2026 Planetary Forecast</AppEyebrow>
          <p class="bc-forecast-box__text">{{ userBirthChart.forecast2026 }}</p>
        </div>
        <AppCaption as="p" v-if="userNoonFallback" class="compat-bc-noon-note">Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.</AppCaption>
      </div>

      <div v-if="partnerBirthChart" class="compat-bc-section">
        <div class="report-section__header">
          <AppEyebrow as="span" class="report-section__num">❖</AppEyebrow>
          <div class="report-section__rule" />
        </div>
        <AppEyebrow class="compat-bc-section__person">{{ store.partnerName || 'Them' }}'s Birth Chart</AppEyebrow>
        <AppHeadline as="h2" class="report-section__heading">{{ partnerBirthChart.chartTitle }}</AppHeadline>
        <div class="birth-chart-signs-grid">
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Rising</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ partnerBirthChart.risingSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Sun</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ partnerBirthChart.sunSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Moon</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ partnerBirthChart.moonSign }}</AppSubhead>
          </div>
          <div class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Dominant</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ partnerBirthChart.dominantPlanet }}</AppSubhead>
          </div>
          <div v-if="partnerBirthChart.powerHouse" class="bc-sign-cell">
            <AppEyebrow class="bc-sign-cell__label">Power House</AppEyebrow>
            <AppSubhead as="p" variant="strong" class="bc-sign-cell__value">{{ partnerBirthChart.powerHouse }}</AppSubhead>
          </div>
        </div>
        <p class="report-section__body">{{ partnerBirthChart.reading }}</p>
        <div v-if="partnerBirthChart.forecast2026" class="bc-forecast-box">
          <AppEyebrow class="bc-forecast-box__label">2026 Planetary Forecast</AppEyebrow>
          <p class="bc-forecast-box__text">{{ partnerBirthChart.forecast2026 }}</p>
        </div>
        <AppCaption as="p" v-if="partnerNoonFallback" class="compat-bc-noon-note">Houses calculated using 12:00 PM as birth time — for precise placements, please contact support.</AppCaption>
      </div>

    </div>

    <!-- Calculation receipt -->
    <div v-if="compatibility.calculationReceipt" class="calc-receipt calc-receipt--full">
      <AppEyebrow class="calc-receipt__header">{{ t('compatHowCalculated') }}</AppEyebrow>
      <div class="calc-receipt__rows">
        <div class="calc-receipt__row">
          <AppCaption class="calc-receipt__person">{{ compatibility.calculationReceipt.person1?.name || t('quizYouLabel') }}</AppCaption>
          <AppCaption class="calc-receipt__detail">
            {{ compatibility.calculationReceipt.person1?.sunSign }}
            · {{ compatibility.calculationReceipt.person1?.element }}
            · {{ t('compatLifePathLabel') }} {{ compatibility.calculationReceipt.person1?.lifePathNumber }}
            <template v-if="compatibility.calculationReceipt.person1?.archetype">
              · {{ compatibility.calculationReceipt.person1.archetype }}
            </template>
          </AppCaption>
        </div>
        <div class="calc-receipt__row">
          <AppCaption class="calc-receipt__person">{{ compatibility.calculationReceipt.person2?.name || t('quizThemLabel') }}</AppCaption>
          <AppCaption class="calc-receipt__detail">
            {{ compatibility.calculationReceipt.person2?.sunSign }}
            · {{ compatibility.calculationReceipt.person2?.element }}
            · {{ t('compatLifePathLabel') }} {{ compatibility.calculationReceipt.person2?.lifePathNumber }}
          </AppCaption>
        </div>
        <div v-for="(note, i) in compatibility.calculationReceipt.synastryNotes" :key="i" class="calc-receipt__row calc-receipt__row--note">
          <AppCaption class="calc-receipt__detail">{{ note }}</AppCaption>
        </div>
      </div>
      <AppCaption as="p" class="calc-receipt__meta">{{ compatibility.calculationReceipt.tradition }} · {{ compatibility.calculationReceipt.calculationSource }}</AppCaption>
    </div>

    <!-- Trustpilot widget -->
    <div class="compat-tp-block">
      <AppCaption as="p" class="compat-tp-label">Rated Excellent by our readers</AppCaption>
      <TrustpilotWidget />
    </div>

    <!-- Share / download -->
    <div class="compat-share">
      <AppHeadline as="h2" class="compat-share__heading">{{ t('shareYourReading') }}</AppHeadline>
      <AppCaption as="p" class="compat-share__sub">
        {{ t('shareCompatSubtitle').replace('{name}', store.partnerName || 'them') }}
      </AppCaption>

      <div class="compat-share-card">
        <AppEyebrow class="compat-share-card__kicker">{{ t('compatShareCardKicker') }}</AppEyebrow>
        <AppSubhead as="p" variant="strong" class="compat-share-card__names">{{ store.firstName || 'You' }} &amp; {{ store.partnerName || 'Them' }}</AppSubhead>
        <AppSubhead as="p" variant="strong" class="compat-share-card__score" :style="{ color: scoreColor }">
          {{ compatibility.compatibilityScore }}%
        </AppSubhead>
        <p class="compat-share-card__title">{{ compatibility.compatibilityTitle }}</p>
        <AppEyebrow class="compat-share-card__domain">omenora.com</AppEyebrow>
      </div>

      <AppButton
        variant="primary"
        :arrow="false"
        :disabled="isDownloadingCard"
        class="compat-download-btn"
        @click="downloadCompatCard"
      >
        {{ isDownloadingCard ? t('compatDownloadGenerating') : t('compatDownloadCta') }}
      </AppButton>
      <AppCaption as="p" v-if="cardDownloadError" class="compat-download-error">{{ cardDownloadError }}</AppCaption>
    </div>

    </main>

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
        <AppEyebrow as="span" class="compat-preview__badge">{{ t('compatFreeBadge') }}</AppEyebrow>
      </template>
    </AppHeader>

    <main>

    <!-- Canceled banner (CASE C) -->
    <div v-if="isCanceled" class="compat-canceled" role="status">
      <AppCaption as="p">{{ t('compatCanceled') }}</AppCaption>
    </div>

    <!-- Preview masthead -->
    <div class="compat-masthead compat-masthead--preview">
      <AppEyebrow class="compat-masthead__kicker">{{ t('compatDestinyLabel') }}</AppEyebrow>
      <AppHeadline as="h1" class="compat-masthead__names">
        {{ displayMyName }} &amp; {{ displayTheirName }}
      </AppHeadline>
      <AppSubhead as="p" variant="strong" class="compat-masthead__score" :style="{ color: previewScoreColor }">
        {{ previewData.compatibilityScore }}%
      </AppSubhead>
      <div class="editorial-rule" />
      <AppHeadline as="p" class="compat-masthead__title">{{ previewData.compatibilityTitle }}</AppHeadline>
    </div>

    <!-- Challenge section (free hook) -->
    <div class="report-body">
      <div class="report-section report-section--challenge">
        <AppEyebrow class="report-section__kicker">{{ t('compatChallengeKicker') }}</AppEyebrow>
        <div class="report-section__header">
          <AppEyebrow as="span" class="report-section__num">01</AppEyebrow>
          <div class="report-section__rule" />
        </div>
        <AppHeadline as="h2" class="report-section__heading">
          {{ previewData.sections?.challenge?.title }}
        </AppHeadline>
        <p class="report-section__body">{{ previewData.sections?.challenge?.content }}</p>
      </div>
    </div>

    <!-- Locked sections strip -->
    <div class="locked-strip">
      <div class="locked-strip__header">
        <AppEyebrow as="span" class="locked-strip__label">{{ t('compatLockedLabel') }}</AppEyebrow>
      </div>
      <div class="locked-strip__cards">
        <div v-for="key in LOCKED_SECTIONS" :key="key" class="locked-card">
          <div class="locked-card__header">
            <span class="locked-card__icon">—</span>
            <AppCaption class="locked-card__title">
              {{ previewData.sections?.[key]?.title || LOCKED_FALLBACK_TITLES[key] }}
            </AppCaption>
          </div>
          <AppCaption as="p" class="locked-card__blur">{{ LOCKED_PLACEHOLDER_TEXT[key] }}</AppCaption>
        </div>
      </div>
    </div>

    <!-- Calculation receipt -->
    <div class="calc-receipt">
      <AppEyebrow class="calc-receipt__header">{{ t('compatHowCalculated') }}</AppEyebrow>
      <AppCaption as="p" class="calc-receipt__body">
        {{ t('compatBornPrefix') }} {{ formatDob(store.dateOfBirth) }}{{ store.city ? t('compatBornIn') + store.city : '' }}
        · {{ t('compatBornPrefix') }} {{ formatDob(store.partnerDob) }}{{ store.partnerCity ? t('compatBornIn') + store.partnerCity : '' }}
      </AppCaption>
      <AppCaption as="p" class="calc-receipt__meta">{{ t('compatCalcSource') }}</AppCaption>
    </div>

    <!-- Trust line -->
    <AppCaption as="p" class="compat-trust">{{ t('compatTrustLine') }}</AppCaption>

    <div class="compat-tp-block">
      <AppCaption as="p" class="compat-tp-label">Rated Excellent by our readers</AppCaption>
      <TrustpilotWidget />
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
        <AppCaption as="p" v-if="compatPromoValidationResult && !compatPromoValidationResult.valid" class="compat-promo__msg compat-promo__msg--error">
          {{ compatPromoValidationResult.message }}
        </AppCaption>
      </template>
      <AppCaption as="p" v-if="compatAppliedPromo" class="compat-promo__msg compat-promo__msg--success">
        ✦ Full access unlocked
      </AppCaption>
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
      <AppCaption as="p" v-if="compatPromoErrorMessage" class="compat-promo__msg compat-promo__msg--error" role="alert">
        {{ compatPromoErrorMessage }}
      </AppCaption>
      <AppButton
        variant="primary"
        :arrow="false"
        :disabled="isApplyingCompatAccess || !emailInput"
        :class="{ 'pay-card__btn--processing': isApplyingCompatAccess }"
        @click="applyCompatFreeAccess"
      >
        <span v-if="isApplyingCompatAccess">{{ t('compatProcessing') }}</span>
        <span v-else>Get Free Access →</span>
      </AppButton>
    </div>

    <!-- Paywall block (single $4.99 IAP) -->
    <div v-if="!compatAppliedPromo" class="paywall">
      <AppHeadline as="h2" class="paywall__heading">{{ t('compatUnlockHeading') }}</AppHeadline>

      <AppCaption as="div" v-if="checkoutError" class="compat-checkout-error" role="alert">
        {{ checkoutError }}
      </AppCaption>

      <!-- Single IAP card -->
      <SectionPaywallCard
        :items="compatPaywallItems"
        :price-label="t('compatIAPLabel')"
        :price-value="t('compatIAPPrice')"
        :trust-items="compatPaywallTrust"
        :cta-label="isProcessing ? t('compatProcessing') : t('compatIAPCta')"
        class="compat-paywall-card"
      >
        <template #cta>
          <AppButton
            variant="primary"
            :full="true"
            :disabled="isProcessing || !isEmailValid"
            :class="{ 'pay-card__btn--processing': isProcessing }"
            @click="handleCheckout()"
          >
            <span v-if="isProcessing">{{ t('compatProcessing') }}</span>
            <span v-else>{{ t('compatIAPCta') }}</span>
          </AppButton>
        </template>
      </SectionPaywallCard>

      <!-- Upsell link to Founding Member -->
      <NuxtLink to="/founding" class="paywall__premium-link annotation">
        {{ t('compatOrPremium') }}
      </NuxtLink>

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
        <AppCaption as="p" class="guarantee__text">
          {{ t('compatGuarantee') }}
        </AppCaption>
      </div>
      <AppEyebrow class="compat-trust-secure">{{ t('compatSecurePayment') }}</AppEyebrow>
    </div>

    </main>

    <footer class="compat-footer">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link annotation">{{ t('compatPrivacy') }}</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link annotation">{{ t('compatTerms') }}</NuxtLink>
      </nav>
    </footer>
  </div>

  </div><!-- /.compat-page -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import type { CompatibilityQuizAnswers } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'
import { useAuth } from '~/composables/useAuth'
import { useClarity } from '~/composables/useClarity'
import SectionPaywallCard from '~/components/sections/SectionPaywallCard.vue'

useSeoMeta({ title: 'Your Love Compatibility Reading', robots: 'noindex, nofollow' })
useHead({ link: [{ rel: 'canonical', href: 'https://omenora.com/compatibility' }] })

const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()
const { provisionUser, session, restoreSession } = useAuth()
const { $trackCustomEvent, $trackInitiateCheckout, $trackPurchase, $identifyUser, $trackCompatibilityPaywallView } = useNuxtApp() as any

const { trackEvent: clarityTrack } = useClarity()

function trackEvent(name: string, props?: Record<string, unknown>) {
  try { $trackCustomEvent?.(name, props ?? {}) } catch { /* never block UI */ }
  clarityTrack(name)
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

// ── Loading messages (mirrors compatibility-quiz.vue pattern) ─────────────────
const compatLoadingMessages = [
  'Reading the charts…',
  'Mapping the connection…',
  'Finding what matters…',
  'Almost there…',
]
// ── Pay card items (SectionPaywallCard) ───────────────────────────────────────
const compatPaywallItems = computed(() => [
  { key: 'What you unlock', value: '7 compatibility sections' },
  { key: 'Sections', value: 'Bond · Strength · Challenge · Communication · Dynamics · Forecast · Advice' },
  { key: 'Format', value: 'Full written reading' },
])
const compatPaywallTrust = ['Secure checkout', '14-day refund', 'Stripe protected']

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
const checkoutError = ref('')

async function handleCheckout() {
  if (isProcessing.value) return

  try {
    $trackInitiateCheckout?.({
      value:        4.99,
      currency:     'USD',
      content_name: 'Compatibility Reading',
    })
  } catch { /* never block UI */ }
  trackEvent('initiate_checkout', {
    value: 4.99,
  })

  isProcessing.value  = true
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
          firstName,
          partnerName,
          dateOfBirth: store.dateOfBirth,
          partnerDob:  store.partnerDob,
          partnerCity:  store.partnerCity,
          city:              store.city,
          timeOfBirth:       store.timeOfBirth        || undefined,
          partnerTimeOfBirth: undefined,
          email,
          tempId:            store.tempId || `compat_${Date.now()}`,
          language:          store.language || 'en',
          archetype:         store.archetype          || undefined,
          element:           store.report?.element    || undefined,
          lifePathNumber:    store.lifePathNumber      || undefined,
          origin:            window.location.origin,
          quizAnswers:       store.compatibilityQuizAnswers,
          cityLat:           store.cityLat        ?? undefined,
          cityLng:           store.cityLng        ?? undefined,
          partnerCityLat:    store.partnerCityLat ?? undefined,
          partnerCityLng:    store.partnerCityLng ?? undefined,
          utmCreative:       utmParams.utm_creative || '',
          utmSource:         utmParams.utm_source   || '',
          utmCampaign:       utmParams.utm_campaign  || '',
          utmMedium:         utmParams.utm_medium    || '',
        },
      },
    )
    if (url) window.location.href = url
  } catch {
    isProcessing.value  = false
    checkoutError.value = 'Payment service unavailable. Please try again.'
    trackEvent('checkout_failed', { error: 'api_error' })
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
    clarityTrack('compatibility_paywall_view')
    return
  }

  // CASE A — post-payment (only reachable when preview/canceled are both absent)
  if (!isPreview && !isCanceled && sessionId) {
    // Refresh guard: Pinia is in-memory and wiped on full-page reload, but the
    // session_id stays in the URL. Without this check every refresh re-generates
    // the reading, re-sends the email, and re-saves to the DB.
    // sessionStorage survives F5 within the same tab — use it as the cache.
    const cacheKey  = `omenora_compat_result_${sessionId}`
    const cachedRaw = sessionStorage.getItem(cacheKey)
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw)
        compatibility.value       = cached.compatibility
        userBirthChart.value      = cached.userBirthChart    ?? null
        partnerBirthChart.value   = cached.partnerBirthChart ?? null
        userNoonFallback.value    = cached.userNoonFallback    ?? false
        partnerNoonFallback.value = cached.partnerNoonFallback ?? false
        if (cached.firstName)   store.setPersonalInfo(cached.firstName, store.dateOfBirth, store.city)
        if (cached.partnerName) store.setPartnerData({ name: cached.partnerName, dob: store.partnerDob, city: store.partnerCity })
        if (cached.email)       store.setEmail(cached.email)
        if (cached.language)    store.setLanguage(cached.language)
        return
      } catch {
        sessionStorage.removeItem(cacheKey)
      }
    }

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
      if (!store.archetype && meta.archetype) store.archetype = meta.archetype

      // ── New quiz answer hydration ─────────────────────────────────────
      const newQuizKeys: (keyof CompatibilityQuizAnswers)[] = [
        'q1_intent', 'q2_feeling', 'q3_duration', 'q4_approach',
        'q5_communication', 'q6_closeness', 'q7_conflict',
        'q8_intimacy', 'q9_value', 'q14_descriptor', 'q15_chapter',
        'q16_season', 'q17_pattern', 'q18_trust_texture',
        'q19_curiosity', 'q23_time_of_day', 'q24_helpfulness',
        'q25_agency',
      ]
      for (const key of newQuizKeys) {
        if (!store.compatibilityQuizAnswers[key] && meta[key]) {
          store.setCompatibilityQuizAnswer(key, meta[key] as any)
        }
      }

      // ── Partner lat/lng hydration ────────────────────────────────
      if (store.partnerCityLat == null && meta.partnerCityLat) {
        store.partnerCityLat = parseFloat(meta.partnerCityLat)
      }
      if (store.partnerCityLng == null && meta.partnerCityLng) {
        store.partnerCityLng = parseFloat(meta.partnerCityLng)
      }

      // ── timeOfBirth hydration ────────────────────────────────────
      if (!store.timeOfBirth && meta.timeOfBirth) {
        store.timeOfBirth = meta.timeOfBirth
      }
      // partnerTimeOfBirth is NOT in the store — passed directly to generation call below
      const metaPartnerTimeOfBirth = meta.partnerTimeOfBirth || undefined

      const { compatibility: data } = await $fetch<{
        success: boolean
        compatibility: any
      }>('/api/generate-compatibility', {
        method: 'POST',
        body: {
          firstName:      store.firstName,
          dateOfBirth:    store.dateOfBirth || meta.dateOfBirth || '',
          archetype:      store.archetype   || meta.archetype   || undefined,
          element:        store.report?.element        || meta.element        || undefined,
          lifePathNumber: store.lifePathNumber          || (meta.lifePathNumber ? Number(meta.lifePathNumber) : undefined) || undefined,
          powerTraits:    store.report?.powerTraits     || undefined,
          partnerName:    store.partnerName,
          partnerDob:          store.partnerDob,
          partnerCity:         store.partnerCity,
          language:            store.language,
          previewMode:         false,
          quizAnswers:         store.compatibilityQuizAnswers,
          timeOfBirth:         store.timeOfBirth || meta.timeOfBirth || undefined,
          partnerTimeOfBirth:  metaPartnerTimeOfBirth,
          cityLat:             store.cityLat              ?? (meta.cityLat        ? parseFloat(meta.cityLat)        : undefined),
          cityLng:             store.cityLng              ?? (meta.cityLng        ? parseFloat(meta.cityLng)        : undefined),
          partnerCityLat:      store.partnerCityLat       ?? (meta.partnerCityLat ? parseFloat(meta.partnerCityLat) : undefined),
          partnerCityLng:      store.partnerCityLng       ?? (meta.partnerCityLng ? parseFloat(meta.partnerCityLng) : undefined),
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
          const purchaseValue = paymentData.amountTotal ?? 4.99
          $trackPurchase?.({
            value: purchaseValue,
            currency: 'USD',
            content_name: 'Compatibility Reading',
          })
        }
      } catch { /* never block UI */ }

      // Persist result to sessionStorage so a page refresh restores from cache
      // instead of triggering a full re-generation + duplicate email send.
      try {
        sessionStorage.setItem(`omenora_compat_result_${sessionId}`, JSON.stringify({
          compatibility:       compatibility.value,
          userBirthChart:      userBirthChart.value,
          partnerBirthChart:   partnerBirthChart.value,
          userNoonFallback:    userNoonFallback.value,
          partnerNoonFallback: partnerNoonFallback.value,
          firstName:           store.firstName,
          partnerName:         store.partnerName,
          email:               store.email,
          language:            store.language,
        }))
      } catch { /* sessionStorage quota exceeded — non-critical */ }

      isLoading.value = false
    } catch {
      console.error('Compatibility page load failed')
      hasError.value  = true
      isLoading.value = false
    }
    return
  }

  // CASE D — no recognised param → redirect to quiz funnel
  await navigateTo('/compatibility-quiz')
})

</script>

<style scoped>
/* ════════════════════════════════════════════════════════════════
   ATMOSPHERIC PAGE ROOT
   Shared canvas for all states: loading, error, preview, full report.
   Pattern mirrors compatibility-quiz.vue exactly.
   ════════════════════════════════════════════════════════════════ */
.compat-page {
  position: relative;
  min-height: 100dvh;
  background: var(--omn-bg-page);
  color: var(--omn-text-primary);
  overflow: hidden;
}

/* Bronze diagonal seam glow — identical geometry to compatibility-quiz */
.compat-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    168deg,
    transparent 0%,
    transparent 40%,
    rgba(168, 125, 78, 0.08) 48%,
    rgba(168, 125, 78, 0.15) 52%,
    rgba(168, 125, 78, 0.08) 56%,
    transparent 64%,
    transparent 100%
  );
  mix-blend-mode: screen;
}

/* Atmospheric background image — fixed, diagonal mask */
.compat-page__bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: url('/images/hero/Nebula-void.webp');
  background-size: cover;
  background-position: center 55%;
  background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(
    168deg,
    transparent 0%,
    transparent 25%,
    rgba(0, 0, 0, 0.15) 38%,
    rgba(0, 0, 0, 0.55) 52%,
    rgba(0, 0, 0, 0.88) 68%,
    rgb(0, 0, 0) 80%,
    rgb(0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    168deg,
    transparent 0%,
    transparent 25%,
    rgba(0, 0, 0, 0.15) 38%,
    rgba(0, 0, 0, 0.55) 52%,
    rgba(0, 0, 0, 0.88) 68%,
    rgb(0, 0, 0) 80%,
    rgb(0, 0, 0) 100%
  );
  filter: saturate(0.85) contrast(1.05);
  opacity: 0.82;
  pointer-events: none;
}

/* Dark overlay — vignette for text legibility */
.compat-page__bg-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg,
      rgba(18, 18, 20, 0.92) 0%,
      rgba(18, 18, 20, 0.55) 25%,
      rgba(18, 18, 20, 0.10) 50%,
      rgba(18, 18, 20, 0.50) 80%,
      rgba(18, 18, 20, 0.90) 100%),
    linear-gradient(168deg,
      transparent 0%,
      transparent 40%,
      rgba(168, 125, 78, 0.05) 50%,
      transparent 60%,
      transparent 100%);
}

/* Page grain texture — mirrors home/founding/quiz pages */
.page-grain {
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: pageGrainShift 8s steps(1) infinite;
}

@keyframes pageGrainShift {
  0%   { background-position:   0px   0px; }
  12%  { background-position: -40px -20px; }
  24%  { background-position:  20px -40px; }
  36%  { background-position: -60px  10px; }
  48%  { background-position:  30px  40px; }
  60%  { background-position: -20px -50px; }
  72%  { background-position:  50px  20px; }
  84%  { background-position: -30px  60px; }
  100% { background-position:   0px   0px; }
}

/* ── Centered state layer (error / session expired) ── */
.compat-state-layer {
  position: relative;
  z-index: 3;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-edge);
}

.compat-state-card {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  text-align: center;
}

.compat-state-brand {
  color: var(--omn-text-tertiary);
}

/* ── Paywall card (SectionPaywallCard scoping) ── */
.compat-paywall-card {
  max-width: 480px;
  margin-bottom: var(--space-4);
}

/* ── Step fade transition (matches quiz) ── */
.step-fade-enter-active,
.step-fade-leave-active {
  transition:
    opacity var(--omn-duration-base) var(--omn-ease),
    transform var(--omn-duration-base) var(--omn-ease);
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.compat-state-msg {
  color: var(--omn-text-secondary);
  max-width: 280px;
  line-height: var(--leading-base);
}

/* ── Full report page ── */
.compat-full-page {
  position: relative;
  z-index: 3;
  min-height: 100dvh;
}

.compat-full-page__badge {
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
}

/* ── Preview page ── */
.compat-preview-page {
  position: relative;
  z-index: 3;
  min-height: 100dvh;
}

.compat-preview__badge {
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
}

/* ── Canceled banner ── */
.compat-canceled {
  border-top: 1px solid var(--omn-border-subtle);
  padding: var(--space-4) var(--space-edge);
  text-align: center;
}

/* ── Masthead ── */
.compat-masthead {
  padding: var(--space-block) var(--space-edge) var(--space-content);
  max-width: var(--width-bleed);
  margin: 0 auto;
}

.compat-masthead__kicker {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-5);
}

.compat-masthead__names {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(var(--text-3xl), 8vw, var(--text-6xl));
  line-height: var(--leading-3xl);
  letter-spacing: var(--tracking-tight);
  color: var(--omn-text-primary);
  margin: 0 0 var(--space-6);
}

.compat-masthead__score {
  font-family: var(--omn-font-display);
  font-size: clamp(var(--text-5xl), 16vw, var(--text-7xl));
  font-weight: var(--weight-light);
  line-height: var(--leading-7xl);
  margin: 0 0 var(--space-6);
  letter-spacing: var(--tracking-tight);
}

.editorial-rule {
  width: var(--space-12);
  height: 1px;
  background: var(--omn-text-secondary);
  margin-bottom: var(--space-6);
}

.compat-masthead__title {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(var(--text-md), 3vw, var(--text-xl));
  line-height: var(--leading-xl);
  color: var(--omn-text-secondary);
  margin: 0;
}

/* ── Report body ── */
.report-body {
  max-width: var(--width-bleed);
  padding: 0 var(--space-edge);
  margin: 0 auto;
}

/* ── Report sections ── */
.report-section {
  padding: var(--space-content) 0;
  border-top: 1px solid var(--omn-border-subtle);
}

.report-section--last {
  border-bottom: 1px solid var(--omn-border-subtle);
}

.report-section__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.report-section__num {
  color: var(--omn-text-tertiary);
  flex-shrink: 0;
}

.report-section__rule {
  flex: 1;
  height: 1px;
  background: var(--omn-border-subtle);
}

.report-section__kicker {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-4);
}

.report-section__heading {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(var(--text-xl), 4vw, var(--text-2xl));
  line-height: var(--leading-2xl);
  letter-spacing: var(--tracking-snug);
  color: var(--omn-text-primary);
  margin: 0 0 var(--space-6);
}

.report-section__body {
  font-family: var(--omn-font-body);
  font-size: clamp(var(--text-md), 2.5vw, var(--text-lg));
  font-weight: var(--weight-light);
  line-height: 1.8;
  color: var(--omn-text-secondary);
  margin: 0;
}

/* ── Advice block ── */
.advice-block {
  border-left: 2px solid var(--omn-text-secondary);
  padding-left: var(--space-6);
}

/* ── Challenge section (free preview hook) ── */
.report-section--challenge {
  border-top: 2px solid var(--omn-text-primary);
}

/* ── Locked strip ── */
.locked-strip {
  max-width: var(--width-bleed);
  padding: var(--space-content) var(--space-edge);
  border-top: 1px solid var(--omn-border-subtle);
  margin: 0 auto;
}

.locked-strip__header {
  margin-bottom: var(--space-5);
}

.locked-strip__label {
  color: var(--omn-text-tertiary);
}

.locked-strip__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.locked-card {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--omn-border-subtle);
}

.locked-card:last-child {
  border-bottom: none;
}

.locked-card__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.locked-card__icon {
  color: var(--omn-text-tertiary);
  flex-shrink: 0;
}

.locked-card__title {
  color: var(--omn-text-secondary);
  font-style: italic;
}

.locked-card__blur {
  filter: blur(4px);
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  max-height: 48px;
  color: var(--omn-text-secondary);
  margin: 0;
  line-height: var(--leading-base);
}

/* ── Calculation receipt ── */
.calc-receipt {
  max-width: var(--width-bleed);
  padding: var(--space-gap) var(--space-edge);
  border-top: 1px solid var(--omn-border-subtle);
  opacity: 0.7;
  margin: 0 auto;
}

.calc-receipt--full {
  opacity: 1;
  border-top: 1px solid var(--omn-border-subtle);
  border-bottom: 1px solid var(--omn-border-subtle);
  margin-bottom: 0;
}

.calc-receipt__header {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-4);
}

.calc-receipt__rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.calc-receipt__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  align-items: baseline;
}

.calc-receipt__row--note {
  padding-top: var(--space-1);
  border-top: 1px solid var(--omn-border-subtle);
}

.calc-receipt__person {
  color: var(--omn-text-secondary);
  font-weight: var(--weight-medium);
  flex-shrink: 0;
  min-width: 72px;
}

.calc-receipt__detail {
  color: var(--omn-text-tertiary);
  line-height: var(--leading-base);
}

.calc-receipt__body {
  color: var(--omn-text-tertiary);
  line-height: var(--leading-base);
  margin: 0 0 var(--space-1);
}

.calc-receipt__meta {
  color: var(--omn-text-tertiary);
  margin: 0;
  opacity: 0.7;
}

/* ── Trustpilot block ── */
.compat-tp-block {
  max-width: var(--width-bleed);
  padding: var(--space-gap) var(--space-edge);
  margin: 0 auto;
}

.compat-tp-label {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-2);
  letter-spacing: var(--tracking-label);
}

.compat-tp-widget {
  width: 100%;
}

/* ── Trust line ── */
.compat-trust {
  max-width: var(--width-bleed);
  padding: 0 var(--space-edge) var(--space-content);
  color: var(--omn-text-tertiary);
  font-style: italic;
  line-height: var(--leading-base);
  margin: 0 auto;
}

/* ── Promo code (compatibility) ── */
.compat-promo {
  max-width: var(--width-bleed);
  padding: 0 var(--space-edge) var(--space-gap);
  margin: 0 auto;
}

.compat-promo__toggle {
  background: none;
  border: none;
  padding: 0;
  color: var(--omn-text-tertiary);
  font-style: italic;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.compat-promo__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
}

.compat-promo__input {
  flex: 1;
  max-width: 280px;
}

.compat-promo__apply {
  background: none;
  border: none;
  padding: 0 0 var(--space-3);
  color: var(--omn-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}

.compat-promo__apply:hover:not(:disabled) {
  color: var(--omn-text-primary);
}

.compat-promo__apply:disabled {
  opacity: 0.35;
  pointer-events: none;
}

.compat-promo__msg {
  margin: var(--space-2) 0 0;
  line-height: var(--leading-sm);
}

.compat-promo__msg--error {
  color: var(--omn-text-tertiary);
  font-style: italic;
}

.compat-promo__msg--success {
  color: var(--omn-text-secondary);
  font-style: italic;
}

/* ── Free-access paywall variant ── */
.paywall--free {
  border-top: none;
}

/* ── Paywall ── */
.paywall {
  max-width: var(--width-bleed);
  padding: var(--space-content) var(--space-edge) var(--space-block);
  border-top: 1px solid var(--omn-border-subtle);
  margin: 0 auto;
}

.paywall__heading {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(var(--text-2xl), 6vw, var(--text-4xl));
  line-height: var(--leading-4xl);
  letter-spacing: var(--tracking-tight);
  color: var(--omn-text-primary);
  margin: 0 0 var(--space-4);
}

.paywall__sub {
  color: var(--omn-text-tertiary);
  font-style: italic;
  line-height: var(--leading-base);
  margin: 0 0 var(--space-8);
  max-width: 520px;
}

/* ── Paywall urgency line ── */
.paywall__urgency {
  color: var(--omn-text-secondary);
  font-style: italic;
  line-height: var(--leading-base);
  margin: 0 0 var(--space-5);
}

/* ── Capture block ── */
.capture-block {
  margin-bottom: var(--space-6);
}

.capture-block__label {
  display: block;
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-2);
}

.capture-block__label--spaced {
  margin-top: var(--space-6);
}

.editorial-input {
  width: 100%;
  max-width: 480px;
  padding: var(--space-3) 0;
  font-family: var(--omn-font-body);
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(250, 250, 250, 0.15);
  outline: none;
  border-radius: 0;
  transition: border-color var(--omn-duration-micro) var(--omn-ease);
  display: block;
}

.editorial-input:focus {
  border-bottom-color: var(--omn-text-primary);
}

.editorial-input::placeholder {
  color: var(--omn-text-tertiary);
  font-style: italic;
}

/* ── Prompts / errors ── */
.compat-email-prompt {
  color: var(--omn-text-tertiary);
  font-style: italic;
  border: 1px solid var(--omn-border-subtle);
  padding: var(--space-2) var(--space-4);
  margin-bottom: var(--space-3);
  line-height: var(--leading-sm);
}

.compat-checkout-error {
  color: var(--omn-text-tertiary);
  border: 1px solid var(--omn-border-subtle);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  line-height: var(--leading-md);
}

/* ── Pay cards ── */
.pay-card {
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  position: relative;
}

.pay-card--single {
  border: 1px solid var(--omn-text-secondary);
  border-left: 2px solid var(--omn-text-primary);
}

.pay-card__price {
  font-family: var(--omn-font-display);
  font-size: clamp(var(--text-2xl), 6vw, var(--text-4xl));
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  margin: 0 0 var(--space-4);
  line-height: 1;
}

.pay-card__freq {
  font-size: var(--text-sm);
  color: var(--omn-text-tertiary);
}

.pay-card__bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pay-card__bullets li {
  color: var(--omn-text-secondary);
  line-height: var(--leading-sm);
  padding-left: var(--space-4);
  position: relative;
}

.pay-card__bullets li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
  top: 3px;
}

.pay-card__btn {
  width: 100%;
  margin-bottom: var(--space-2);
}

.pay-card__btn--processing {
  opacity: 0.6;
  pointer-events: none;
}

.paywall__premium-link {
  display: block;
  margin-top: var(--space-1);
  margin-bottom: var(--space-5);
  color: var(--omn-text-tertiary);
  text-decoration: none;
  font-style: italic;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}

.paywall__premium-link:hover {
  color: var(--omn-text-secondary);
}

.pay-card__footnote {
  color: var(--omn-text-tertiary);
  margin: var(--space-1) 0 0;
  line-height: var(--leading-sm);
}

.pay-card__footnote--muted {
  opacity: 0.6;
}

/* ── Guarantee ── */
.guarantee {
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--omn-border-subtle);
}

.guarantee__text {
  color: var(--omn-text-tertiary);
  font-style: italic;
  line-height: var(--leading-base);
  margin: 0;
}

.compat-trust-secure {
  color: var(--omn-text-tertiary);
  text-align: center;
  margin-top: var(--space-4);
  opacity: 0.7;
}

/* ── Share section (full report) ── */
.compat-share {
  max-width: var(--width-bleed);
  padding: var(--space-block) var(--space-edge);
  border-top: 1px solid var(--omn-border-subtle);
  text-align: center;
  margin: 0 auto;
}

.compat-share__heading {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(var(--text-xl), 4vw, var(--text-2xl));
  line-height: var(--leading-2xl);
  letter-spacing: var(--tracking-snug);
  color: var(--omn-text-primary);
  margin: 0 0 var(--space-2);
}

.compat-share__sub {
  color: var(--omn-text-tertiary);
  margin: 0 0 var(--space-7);
}

.compat-share-card {
  width: min(300px, 100%);
  border: 1px solid var(--omn-border-subtle);
  margin: 0 auto var(--space-6);
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.compat-share-card__kicker {
  color: var(--omn-text-tertiary);
  margin: 0 0 var(--space-2);
}

.compat-share-card__names {
  font-family: var(--omn-font-display);
  font-size: var(--text-md);
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  margin: 0;
}

.compat-share-card__score {
  font-family: var(--omn-font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-light);
  line-height: 1;
  margin: var(--space-1) 0 0;
}

.compat-share-card__title {
  font-size: var(--text-sm);
  font-style: italic;
  color: var(--omn-text-secondary);
  margin: var(--space-1) 0 var(--space-2);
}

.compat-share-card__domain {
  color: var(--omn-text-tertiary);
  margin: 0;
  opacity: 0.7;
}

.compat-download-btn {
  margin: 0 auto;
}

.compat-download-error {
  color: var(--omn-text-tertiary);
  text-align: center;
  margin-top: var(--space-2);
  font-style: italic;
}

/* ── Footer ── */
.compat-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-content) var(--space-edge);
  border-top: 1px solid var(--omn-border-subtle);
}

.compat-footer nav {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.footer-link {
  color: var(--omn-text-tertiary);
  text-decoration: none;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}

.footer-link:hover {
  color: var(--omn-text-secondary);
}

.footer-sep {
  color: var(--omn-border-subtle);
}

/* ── Birth Chart Sections (T2 with_charts tier) ── */
.compat-bc-body {
  max-width: var(--width-bleed);
  padding: 0 var(--space-edge);
  margin: 0 auto;
}

.compat-bc-section {
  padding: var(--space-content) 0;
  border-top: 1px solid var(--omn-border-subtle);
}

.compat-bc-section__person {
  color: var(--omn-text-tertiary);
  margin: 0 0 var(--space-3);
  letter-spacing: var(--tracking-mid);
}

.birth-chart-signs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  margin-bottom: var(--space-6);
  background: var(--omn-border-subtle);
}

.bc-sign-cell {
  flex: 1;
  min-width: 80px;
  padding: var(--space-3) var(--space-4);
  background: var(--omn-bg-page);
}

.bc-sign-cell__label {
  margin: 0 0 var(--space-1);
  color: var(--omn-text-tertiary);
}

.bc-sign-cell__value {
  font-family: var(--omn-font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  margin: 0;
}

.bc-forecast-box {
  padding: var(--space-4);
  border-left: 2px solid var(--omn-text-secondary);
  margin-top: var(--space-5);
}

.bc-forecast-box__label {
  margin: 0 0 var(--space-1);
  color: var(--omn-text-tertiary);
}

.bc-forecast-box__text {
  font-family: var(--omn-font-body);
  font-style: italic;
  font-size: clamp(var(--text-base), 2.2vw, var(--text-md));
  font-weight: var(--weight-light);
  color: var(--omn-text-secondary);
  margin: 0;
  line-height: 1.7;
}

.compat-bc-noon-note {
  margin-top: var(--space-4);
  color: var(--omn-text-tertiary);
  font-style: italic;
  line-height: var(--leading-sm);
  opacity: 0.7;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .compat-masthead__score { font-size: clamp(var(--text-5xl), 18vw, var(--text-6xl)); }
  .pay-card__price { font-size: clamp(var(--text-2xl), 8vw, var(--text-3xl)); }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .page-grain { animation: none; }
}
</style>
