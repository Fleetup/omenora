<template>
  <!-- ── Step 0: UTM landing / pre-sell ── -->
  <div v-if="currentStep === 0" class="compat-landing">
    <AppHeader>
      <template #action>
        <span class="label-caps compat-landing__badge">Free Preview</span>
      </template>
    </AppHeader>

    <div class="compat-landing__inner">
      <p class="label-caps compat-landing__eyebrow">Compatibility Reading</p>
      <h1 class="compat-landing__headline font-display-italic" v-html="heroVariant.headline" />
      <div class="compat-landing__rule" />
      <p class="compat-landing__body">{{ heroVariant.body }}</p>

      <div class="compat-landing__trust">
        <span class="annotation compat-landing__trust-item">Free preview</span>
        <span class="compat-landing__trust-sep" aria-hidden="true">·</span>
        <span class="annotation compat-landing__trust-item">No account needed</span>
        <span class="compat-landing__trust-sep" aria-hidden="true">·</span>
        <span class="annotation compat-landing__trust-item">Results in 60 seconds</span>
      </div>

      <CTAButton :arrow="true" class="compat-landing__cta" @click="startQuiz">
        {{ heroVariant.ctaLabel }}
      </CTAButton>

      <p class="annotation compat-landing__privacy">Your birth data is used only to generate your reading. Never sold.</p>
    </div>
  </div>

  <!-- ── Loading state (step 4) ── -->
  <div v-else-if="currentStep === 4" class="compat-loading" aria-live="polite">
    <div class="compat-loading__inner">
      <OrbitalMark />
      <p class="label-caps compat-loading__brand">Omenora</p>
      <p :key="loadingMsgIdx" class="compat-loading__msg font-display-italic">
        {{ loadingMessages[loadingMsgIdx] }}
      </p>
      <div class="progress-track">
        <div class="compat-loading__fill" />
      </div>
      <p v-if="apiError" class="compat-loading__error annotation">
        {{ t('quizErrorMsg') }}
        <button class="compat-loading__retry" @click="runApiCall">{{ t('quizRetry') }}</button>
      </p>
    </div>
  </div>

  <!-- ── Quiz steps (1–3) ── -->
  <div v-else class="analysis-page">

    <AppHeader>
      <template #action>
        <span class="label-caps analysis-header__step">
          {{ currentStep }} / 3
        </span>
      </template>
    </AppHeader>

    <!-- Progress bar -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }" />
    </div>

    <!-- Step container -->
    <div class="analysis-steps">
      <Transition :name="transitionDir" mode="out-in">
        <div :key="currentStep" class="analysis-step">

          <p class="label-caps analysis-step__label">Step {{ currentStep }}</p>

          <h1 class="analysis-step__headline font-display-italic">
            {{ stepConfig[currentStep - 1]?.headline }}
          </h1>

          <div class="analysis-step__rule" />

          <div class="analysis-step__content">

            <!-- ── Step 1: Your birth details ── -->
            <template v-if="currentStep === 1">
              <label class="field-label label-caps" for="compat-my-dob">{{ t('quizMyBirthDate') }}</label>
              <input
                id="compat-my-dob"
                v-model="myDob"
                type="date"
                class="editorial-input"
                min="1924-01-01"
                :max="todayMax"
                required
              />

              <div style="margin-top: 32px;">
                <PlacesAutocomplete
                  v-model="myCity"
                  :label="t('quizMyBirthCity')"
                  :placeholder="t('quizCityPlaceholder')"
                  input-id="myCity"
                  @place-selected="onMyCitySelected"
                />
              </div>

              <div class="compat-time-row">
                <label class="field-label label-caps" for="compat-my-time">{{ t('quizBirthTime') }}</label>
                <button type="button" class="compat-skip-time label-caps" @click="myTime = ''">{{ t('quizSkip') }}</button>
              </div>
              <input
                id="compat-my-time"
                v-model="myTime"
                type="time"
                class="editorial-input"
              />
              <p class="field-hint annotation">{{ t('quizBirthTimeHint') }}</p>
            </template>

            <!-- ── Step 2: Their birth details ── -->
            <template v-else-if="currentStep === 2">

              <!-- Your sign reveal card -->
              <div class="compat-reveal" :class="{ 'compat-reveal--visible': revealVisible }">
                <p class="label-caps compat-reveal__label">{{ t('quizYouLabel') }}</p>
                <p class="compat-reveal__sign font-serif">
                  <ZodiacSymbol v-if="mySunSign" :sign="mySunSign.name" :size="22" />
                  {{ mySunSign?.name }}
                </p>
                <p class="compat-reveal__path annotation">{{ t('quizLifePath') }} {{ myLifePath }}</p>
              </div>

              <label class="field-label label-caps" for="compat-their-dob">{{ t('quizTheirBirthDate') }}</label>
              <input
                id="compat-their-dob"
                v-model="theirDob"
                type="date"
                class="editorial-input"
                min="1924-01-01"
                :max="todayMax"
                required
              />

              <div style="margin-top: 32px;">
                <PlacesAutocomplete
                  v-model="theirCity"
                  :label="t('quizTheirBirthCity')"
                  :placeholder="t('quizCityPlaceholder')"
                  input-id="theirCity"
                  @place-selected="onTheirCitySelected"
                />
              </div>

              <div class="compat-time-row">
                <label class="field-label label-caps" for="compat-their-time">{{ t('quizBirthTime') }}</label>
                <button type="button" class="compat-skip-time label-caps" @click="theirTime = ''">{{ t('quizSkip') }}</button>
              </div>
              <input
                id="compat-their-time"
                v-model="theirTime"
                type="time"
                class="editorial-input"
              />
              <p class="field-hint annotation">{{ t('quizBirthTimeHint') }}</p>
            </template>

            <!-- ── Step 3: Confirm & calculate ── -->
            <template v-else-if="currentStep === 3">
              <div class="compat-dual-reveal" :class="{ 'compat-dual-reveal--visible': revealVisible }">
                <div class="compat-dual-reveal__card">
                  <p class="label-caps compat-reveal__label">{{ t('quizYouLabel') }}</p>
                  <p class="compat-reveal__sign font-serif">
                    <ZodiacSymbol v-if="mySunSign" :sign="mySunSign.name" :size="20" />
                    {{ mySunSign?.name }}
                  </p>
                  <p class="compat-reveal__path annotation">{{ t('quizLifePath') }} {{ myLifePath }}</p>
                </div>
                <div class="compat-dual-reveal__sep font-display">×</div>
                <div class="compat-dual-reveal__card">
                  <p class="label-caps compat-reveal__label">{{ t('quizThemLabel') }}</p>
                  <p class="compat-reveal__sign font-serif">
                    <ZodiacSymbol v-if="theirSunSign" :sign="theirSunSign.name" :size="20" />
                    {{ theirSunSign?.name }}
                  </p>
                  <p class="compat-reveal__path annotation">{{ t('quizLifePath') }} {{ theirLifePath }}</p>
                </div>
              </div>

              <p class="field-hint annotation" style="margin-top: 0;">{{ t('quizSynastryHint') }}</p>
            </template>

          </div>

          <!-- Navigation -->
          <div class="analysis-step__nav">
            <button
              v-if="currentStep > 1"
              class="back-link label-caps"
              @click="goBack"
            >
              {{ t('quizBack') }}
            </button>

            <CTAButton
              v-if="currentStep === 3"
              :arrow="true"
              class="advance-btn"
              @click="advanceStep3"
            >
              {{ t('quizCalculate') }}
            </CTAButton>

            <CTAButton
              v-else-if="currentStep === 1"
              :arrow="true"
              :disabled="!step1Valid"
              class="advance-btn"
              @click="advanceStep1"
            >
              {{ t('quizContinue') }}
            </CTAButton>

            <CTAButton
              v-else-if="currentStep === 2"
              :arrow="true"
              :disabled="!step2Valid"
              class="advance-btn"
              @click="advanceStep2"
            >
              {{ t('quizContinue') }}
            </CTAButton>
          </div>

        </div>
      </Transition>
    </div>

    <p class="trust-footer annotation">{{ t('quizTrustFooter') }}</p>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { getSunSign, getLifePathNumber, type SunSign } from '~/utils/quick-signs-client'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Free Compatibility Reading — OMENORA', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { t } = useLanguage()
const route = useRoute()
const { $trackCustomEvent } = useNuxtApp() as any

function trackEvent(name: string, props?: Record<string, unknown>) {
  try { $trackCustomEvent?.(name, props ?? {}) } catch { /* never throw into the funnel */ }
}

// ── Date/time form state ───────────────────────────────────────────────────
const myDob    = ref('')
const myTime   = ref('')
const theirDob = ref('')
const theirTime = ref('')

const todayMax = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// ── Other form state ──────────────────────────────────────────────────────
const myCity    = ref('')
const theirCity = ref('')
const myCityLat    = ref<number | null>(null)
const myCityLng    = ref<number | null>(null)
const theirCityLat = ref<number | null>(null)
const theirCityLng = ref<number | null>(null)
const focusedField = ref<string | null>(null)

function onMyCitySelected(place: { name: string; lat: number; lng: number; placeId: string }) {
  myCity.value    = place.name
  myCityLat.value = place.lat
  myCityLng.value = place.lng
}

function onTheirCitySelected(place: { name: string; lat: number; lng: number; placeId: string }) {
  theirCity.value    = place.name
  theirCityLat.value = place.lat
  theirCityLng.value = place.lng
}

// ── Step config ─────────────────────────────────────────────────────
const stepConfig = computed(() => [
  { headline: t('quizStep1Headline') },
  { headline: t('quizStep2Headline') },
  { headline: t('quizStep3Headline') },
])

// ── Hero copy variants (UTM-driven) ──────────────────────────────────
interface HeroVariant {
  headline:  string
  body:      string
  ctaLabel:  string
}

const DEFAULT_HERO: HeroVariant = {
  headline:  'Are you and this person<br>actually compatible?',
  body:      'Your birth charts reveal patterns most people never see. Enter both dates and we\'ll calculate your synastry score, core bond, and the one thing driving the dynamic between you.',
  ctaLabel:  'Check Our Compatibility',
}

const heroVariant = ref<HeroVariant>({ ...DEFAULT_HERO })

function resolveHeroVariant(utmCreative: string): HeroVariant {
  const c = utmCreative.toLowerCase()

  // v3_ignoring — being left on read / ignored
  if (c.includes('ignoring') || c.includes('left_on_read') || c.includes('read') || c.includes('seen')) {
    return {
      headline:  'Why do they go cold<br>after showing so much interest?',
      body:      'Your synastry chart shows whether the pull between you is real — or a pattern your chart keeps recreating. Enter both birth dates and we\'ll show you what\'s actually happening.',
      ctaLabel:  'See What\'s Really Happening',
    }
  }

  // v4_weather — going through a rough patch / can this survive
  if (c.includes('weather') || c.includes('storm') || c.includes('rough') || c.includes('survive') || c.includes('work_out')) {
    return {
      headline:  'Can this relationship<br>actually survive this?',
      body:      'Your birth charts reveal whether two people have the structural bond to get through hard periods — or whether the tension is written into the connection itself.',
      ctaLabel:  'Check Our Bond',
    }
  }

  // v5_antiscam — is this person genuine / red flags / real feelings
  if (c.includes('antiscam') || c.includes('scam') || c.includes('real') || c.includes('genuine') || c.includes('redflag') || c.includes('red_flag')) {
    return {
      headline:  'Is what they feel for you<br>actually real?',
      body:      'Your synastry chart shows whether someone\'s feelings have a genuine astrological foundation — or whether the attraction is one-sided by design. Enter both dates to find out.',
      ctaLabel:  'Find Out If It\'s Real',
    }
  }

  // v1_disappear / alone
  if (c.includes('disappear') || c.includes('alone') || c.includes('end_up')) {
    return {
      headline:  'Why do people who matter<br>always disappear?',
      body:      'Your Venus placement and life-path number reveal the pattern. It\'s written in your birth chart — not your sun sign. Enter your details and we\'ll show you what\'s actually driving it.',
      ctaLabel:  'See My Pattern',
    }
  }

  // wrong person / attraction pattern
  if (c.includes('wrong') || c.includes('attract') || c.includes('trust')) {
    return {
      headline:  'You don\'t attract the<br>wrong people by accident.',
      body:      'Your chart carries a specific relational pattern that shows up in every dynamic. Enter both birth dates and we\'ll map exactly where it comes from — and whether you two can work.',
      ctaLabel:  'Reveal the Pattern',
    }
  }

  // empty / off feeling
  if (c.includes('feeling') || c.includes('empty') || c.includes('connection')) {
    return {
      headline:  'Something feels off<br>even when things are good.',
      body:      'Your synastry chart shows whether the connection between two people has a genuine structural match — or a pattern that creates distance no matter how hard you try.',
      ctaLabel:  'Check the Connection',
    }
  }

  // score / match
  if (c.includes('score') || c.includes('percent') || c.includes('match')) {
    return {
      headline:  'What\'s the real compatibility<br>score between you two?',
      body:      'Not a sun-sign quiz. Your synastry score is calculated from exact planetary positions at birth — both charts, cross-referenced across six astrological factors.',
      ctaLabel:  'Calculate Our Score',
    }
  }

  return { ...DEFAULT_HERO }
}

// ── Transition direction ─────────────────────────────────────────────
const transitionDir = ref('slide-left')

// ── Step state ──────────────────────────────────────────────────────
const currentStep    = ref(1)
const hadLandingStep = ref(false)
const revealVisible  = ref(false)

const mySunSign:     Ref<SunSign | null> = ref(null)
const myLifePath:    Ref<number>         = ref(0)
const theirSunSign:  Ref<SunSign | null> = ref(null)
const theirLifePath: Ref<number>         = ref(0)

// ── Validation ──────────────────────────────────────────────────────
const step1Valid = computed(() => myDob.value.length === 10 && myCity.value.trim().length >= 2)
const step2Valid = computed(() => theirDob.value.length === 10 && theirCity.value.trim().length >= 2)

// ── Loading ─────────────────────────────────────────────────────────
const apiError       = ref(false)
const loadingMsgIdx  = ref(0)
const loadingMessages = computed(() => [
  t('quizLoadingMsg1'),
  t('quizLoadingMsg2'),
  t('quizLoadingMsg3'),
])
let loadingInterval: ReturnType<typeof setInterval> | null = null

// ── Navigation ────────────────────────────────────────────────────────────────
function triggerReveal() {
  revealVisible.value = false
  setTimeout(() => { revealVisible.value = true }, 60)
}

function startQuiz() {
  transitionDir.value = 'slide-left'
  currentStep.value = 1
  triggerReveal()
  trackEvent('compatibility_quiz_started')
  trackEvent('compatibility_landing_cta_clicked', { utm_creative: (route.query.utm_creative as string) || '' })
}

function goBack() {
  if (currentStep.value > 1) {
    transitionDir.value = 'slide-right'
    currentStep.value--
    triggerReveal()
  } else if (currentStep.value === 1 && hadLandingStep.value) {
    transitionDir.value = 'slide-right'
    currentStep.value = 0
  } else {
    navigateTo('/')
  }
}

function advanceStep1() {
  if (!step1Valid.value) return
  try {
    mySunSign.value  = getSunSign(myDob.value)
    myLifePath.value = getLifePathNumber(myDob.value).number
  } catch { return }
  transitionDir.value = 'slide-left'
  currentStep.value = 2
  triggerReveal()
  trackEvent('compatibility_quiz_step_1_complete', { sun_sign: mySunSign.value?.name, life_path: myLifePath.value })
}

function advanceStep2() {
  if (!step2Valid.value) return
  try {
    theirSunSign.value  = getSunSign(theirDob.value)
    theirLifePath.value = getLifePathNumber(theirDob.value).number
  } catch { return }
  transitionDir.value = 'slide-left'
  currentStep.value = 3
  triggerReveal()
  trackEvent('compatibility_quiz_step_2_complete', { their_sun_sign: theirSunSign.value?.name, their_life_path: theirLifePath.value })
}

function advanceStep3() {
  currentStep.value = 4
  trackEvent('compatibility_quiz_step_3_complete')
  trackEvent('compatibility_preview_requested')
  startLoadingCycle()
  runApiCall()
}

function startLoadingCycle() {
  loadingMsgIdx.value = 0
  loadingInterval = setInterval(() => {
    loadingMsgIdx.value = (loadingMsgIdx.value + 1) % loadingMessages.value.length
  }, 1200)
}

function stopLoadingCycle() {
  if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null }
}

async function runApiCall() {
  apiError.value = false
  try {
    const result = await $fetch<{ success: boolean; compatibility: any }>('/api/generate-compatibility', {
      method: 'POST',
      body: {
        firstName:   '',
        dateOfBirth: myDob.value,
        partnerName: '',
        partnerDob:  theirDob.value,
        partnerCity: theirCity.value,
        language:    'en',
        previewMode: true,
      },
    })
    stopLoadingCycle()
    store.setPersonalInfo('', myDob.value, myCity.value)
    store.cityLat = myCityLat.value
    store.cityLng = myCityLng.value
    store.setPartnerData({ name: '', dob: theirDob.value, city: theirCity.value })
    store.partnerCityLat = theirCityLat.value
    store.partnerCityLng = theirCityLng.value
    store.setCompatibilityData(result.compatibility)
    trackEvent('compatibility_preview_loaded', { score: result.compatibility?.compatibilityScore, sun_sign: mySunSign.value?.name })
    navigateTo('/compatibility?preview=1')
  } catch {
    stopLoadingCycle()
    apiError.value = true
    trackEvent('compatibility_preview_failed')
  }
}

onMounted(() => {
  const utmParams = {
    utm_source:   (route.query.utm_source   as string) || '',
    utm_campaign: (route.query.utm_campaign as string) || '',
    utm_creative: (route.query.utm_creative as string) || '',
    utm_medium:   (route.query.utm_medium   as string) || '',
    utm_content:  (route.query.utm_content  as string) || '',
  }
  if (utmParams.utm_source) {
    sessionStorage.setItem('omenora_utms', JSON.stringify(utmParams))
    heroVariant.value = resolveHeroVariant(utmParams.utm_creative)
    hadLandingStep.value = true
    currentStep.value = 0
    trackEvent('compatibility_landing_viewed', {
      utm_source:   utmParams.utm_source,
      utm_campaign: utmParams.utm_campaign,
      utm_creative: utmParams.utm_creative,
    })
  } else {
    trackEvent('compatibility_quiz_started')
    triggerReveal()
  }
})

onUnmounted(() => {
  stopLoadingCycle()
})
</script>

<style scoped>
/* ── Page shell ── */
.analysis-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bone);
}

/* ── Progress bar ── */
.progress-track {
  height: 2px;
  background: var(--color-ink-ghost);
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  background: var(--color-ink);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Step container ── */
.analysis-steps {
  flex: 1;
  display: flex;
  align-items: flex-start;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 80px) 80px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.analysis-step {
  width: 100%;
}

/* ── Step label ── */
.analysis-step__label {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

/* ── Step headline ── */
.analysis-step__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(36px, 8vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 32px;
  color: var(--color-ink);
}

/* ── Decorative rule ── */
.analysis-step__rule {
  width: 48px;
  height: 1px;
  background: var(--color-ink-mid);
  margin-bottom: 36px;
}

.analysis-step__content {
  margin-bottom: 40px;
}

/* ── Field label ── */
.field-label {
  display: block;
  color: var(--color-ink-faint);
  margin-bottom: 12px;
}

/* ── Editorial inputs ── */
.editorial-input {
  width: 100%;
  max-width: 480px;
  padding: 14px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 300;
  color: var(--color-ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(26, 22, 18, 0.3);
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s;
  display: block;
  margin-bottom: 28px;
}

.editorial-input:focus {
  border-bottom-color: var(--color-ink);
}

.editorial-input::placeholder {
  color: var(--color-ink-faint);
  font-style: italic;
}

input[type="date"],
input[type="time"] {
  -webkit-appearance: none;
  appearance: none;
  color-scheme: light;
}

/* ── Field hint ── */
.field-hint {
  margin-top: 10px;
  color: var(--color-ink-faint);
}

/* ── Time row (label + skip) ── */
.compat-time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 480px;
  margin-bottom: 12px;
}

.compat-time-row .field-label {
  margin-bottom: 0;
}

.compat-skip-time {
  background: none;
  border: none;
  color: var(--color-ink-faint);
  font-size: 9px;
  cursor: pointer;
  padding: 0;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  letter-spacing: 0.12em;
  transition: color 0.15s;
}

.compat-skip-time:hover { color: var(--color-ink); }

/* ── Reveal card (step 2 — your sign) ── */
.compat-reveal {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 0 20px;
  border-bottom: 1px solid var(--color-ink-ghost);
  margin-bottom: 36px;
}

.compat-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

.compat-reveal__label {
  color: var(--color-ink-faint);
  flex-shrink: 0;
}

.compat-reveal__sign {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 400;
  color: var(--color-ink);
  margin: 0;
  flex: 1;
}

.compat-reveal__path {
  color: var(--color-ink-faint);
  margin: 0;
  flex-shrink: 0;
}

/* ── Dual reveal (step 3) ── */
.compat-dual-reveal {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-ink-ghost);
}

.compat-dual-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

.compat-dual-reveal__card {
  padding: 20px;
  border: 1px solid var(--color-ink-ghost);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compat-dual-reveal__sep {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 300;
  color: var(--color-ink-faint);
  text-align: center;
  flex-shrink: 0;
}

/* ── Navigation ── */
.analysis-step__nav {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.back-link {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-faint);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  padding: 0;
  transition: color 0.2s;
}

.back-link:hover { color: var(--color-ink); }

/* ── Header step counter ── */
.analysis-header__step {
  color: var(--color-ink-faint);
  font-size: 10px;
}

/* ── Trust footer ── */
.trust-footer {
  text-align: center;
  color: var(--color-ink-faint);
  padding: 20px clamp(20px, 5vw, 80px) clamp(32px, 6vw, 48px);
  max-width: 1400px;
  margin: 0 auto;
}

/* ── CTAButton disabled ── */
.advance-btn:disabled,
.advance-btn[disabled] {
  opacity: 0.35;
  pointer-events: none;
}

/* ── Loading state ── */
.compat-loading {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  align-items: center;
  justify-content: center;
}

.compat-loading__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 0 24px;
}

.compat-loading__brand {
  color: var(--color-ink-faint);
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.compat-loading__msg {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 300;
  font-size: clamp(18px, 4vw, 26px);
  color: var(--color-ink-mid);
  min-height: 36px;
  max-width: 320px;
  line-height: 1.4;
  margin: 0;
  animation: fadeInMsg 0.45s ease;
}

.compat-loading .progress-track {
  width: 160px;
  height: 1px;
  background: var(--color-ink-ghost);
}

@keyframes fillProgress {
  from { width: 0%; }
  to   { width: 95%; }
}

.compat-loading__fill {
  height: 100%;
  background: var(--color-ink);
  animation: fillProgress 8s ease-out forwards;
}

.compat-loading__error {
  color: var(--color-ink-faint);
  max-width: 280px;
  text-align: center;
}

.compat-loading__retry {
  background: none;
  border: none;
  color: var(--color-gold);
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
}

/* ── Step 0: Landing / pre-sell ── */
.compat-landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bone);
}

.compat-landing__badge {
  color: var(--color-ink-faint);
  font-size: 10px;
}

.compat-landing__inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(48px, 10vw, 96px) clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
}

.compat-landing__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 28px;
}

.compat-landing__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 9vw, 76px);
  line-height: 1.04;
  letter-spacing: -0.03em;
  margin: 0 0 36px;
  color: var(--color-ink);
}

.compat-landing__rule {
  width: 56px;
  height: 1px;
  background: var(--color-ink-mid);
  margin-bottom: 32px;
}

.compat-landing__body {
  font-size: clamp(15px, 2.2vw, 18px);
  line-height: 1.75;
  color: var(--color-ink-mid);
  max-width: 52ch;
  margin-bottom: 40px;
}

.compat-landing__trust {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 36px;
}

.compat-landing__trust-item {
  color: var(--color-ink-faint);
}

.compat-landing__trust-sep {
  color: var(--color-ink-ghost);
  font-size: 12px;
}

.compat-landing__cta {
  align-self: flex-start;
  margin-bottom: 28px;
}

.compat-landing__privacy {
  color: var(--color-ink-faint);
  max-width: 44ch;
}

/* ── Step transitions ── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from  { opacity: 0; transform: translateX(32px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-32px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-32px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(32px); }

/* ── Responsive ── */
@media (max-width: 480px) {
  .analysis-step__headline { font-size: clamp(30px, 9vw, 42px); }
  .compat-dual-reveal { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active { transition: opacity 0.15s; }
  .slide-left-enter-from,
  .slide-right-enter-from { transform: none; }
  .slide-left-leave-to,
  .slide-right-leave-to   { transform: none; }
}
</style>
