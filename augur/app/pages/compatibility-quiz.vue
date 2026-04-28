<template>
  <!-- ── Loading state (step 4) ── -->
  <div v-if="currentStep === 4" class="compat-loading" aria-live="polite">
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
        Something went wrong.
        <button class="compat-loading__retry" @click="runApiCall">Try again</button>
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
              <label class="field-label label-caps" for="compat-my-dob">Your birth date</label>
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
                  label="Your birth city"
                  placeholder="City, Country"
                  input-id="myCity"
                  @place-selected="onMyCitySelected"
                />
              </div>

              <div class="compat-time-row">
                <label class="field-label label-caps" for="compat-my-time">Birth time</label>
                <button type="button" class="compat-skip-time label-caps" @click="myTime = ''">Skip</button>
              </div>
              <input
                id="compat-my-time"
                v-model="myTime"
                type="time"
                class="editorial-input"
              />
              <p class="field-hint annotation">More accurate Rising sign — leave blank if unknown</p>
            </template>

            <!-- ── Step 2: Their birth details ── -->
            <template v-else-if="currentStep === 2">

              <!-- Your sign reveal card -->
              <div class="compat-reveal" :class="{ 'compat-reveal--visible': revealVisible }">
                <p class="label-caps compat-reveal__label">You</p>
                <p class="compat-reveal__sign font-serif">
                  <ZodiacSymbol v-if="mySunSign" :sign="mySunSign.name" :size="22" />
                  {{ mySunSign?.name }}
                </p>
                <p class="compat-reveal__path annotation">Life Path {{ myLifePath }}</p>
              </div>

              <label class="field-label label-caps" for="compat-their-dob">Their birth date</label>
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
                  label="Their birth city"
                  placeholder="City, Country"
                  input-id="theirCity"
                  @place-selected="onTheirCitySelected"
                />
              </div>

              <div class="compat-time-row">
                <label class="field-label label-caps" for="compat-their-time">Birth time</label>
                <button type="button" class="compat-skip-time label-caps" @click="theirTime = ''">Skip</button>
              </div>
              <input
                id="compat-their-time"
                v-model="theirTime"
                type="time"
                class="editorial-input"
              />
              <p class="field-hint annotation">More accurate Rising sign — leave blank if unknown</p>
            </template>

            <!-- ── Step 3: Confirm & calculate ── -->
            <template v-else-if="currentStep === 3">
              <div class="compat-dual-reveal" :class="{ 'compat-dual-reveal--visible': revealVisible }">
                <div class="compat-dual-reveal__card">
                  <p class="label-caps compat-reveal__label">You</p>
                  <p class="compat-reveal__sign font-serif">
                    <ZodiacSymbol v-if="mySunSign" :sign="mySunSign.name" :size="20" />
                    {{ mySunSign?.name }}
                  </p>
                  <p class="compat-reveal__path annotation">Life Path {{ myLifePath }}</p>
                </div>
                <div class="compat-dual-reveal__sep font-display">×</div>
                <div class="compat-dual-reveal__card">
                  <p class="label-caps compat-reveal__label">Them</p>
                  <p class="compat-reveal__sign font-serif">
                    <ZodiacSymbol v-if="theirSunSign" :sign="theirSunSign.name" :size="20" />
                    {{ theirSunSign?.name }}
                  </p>
                  <p class="compat-reveal__path annotation">Life Path {{ theirLifePath }}</p>
                </div>
              </div>

              <p class="field-hint annotation" style="margin-top: 0;">
                We'll map the synastry between your two birth charts — communication, conflict, attraction, and what's coming next.
              </p>
            </template>

          </div>

          <!-- Navigation -->
          <div class="analysis-step__nav">
            <button
              v-if="currentStep > 1"
              class="back-link label-caps"
              @click="goBack"
            >
              ← Back
            </button>

            <CTAButton
              v-if="currentStep === 3"
              :arrow="true"
              class="advance-btn"
              @click="advanceStep3"
            >
              Calculate compatibility
            </CTAButton>

            <CTAButton
              v-else-if="currentStep === 1"
              :arrow="true"
              :disabled="!step1Valid"
              class="advance-btn"
              @click="advanceStep1"
            >
              Continue
            </CTAButton>

            <CTAButton
              v-else-if="currentStep === 2"
              :arrow="true"
              :disabled="!step2Valid"
              class="advance-btn"
              @click="advanceStep2"
            >
              Continue
            </CTAButton>
          </div>

        </div>
      </Transition>
    </div>

    <p class="trust-footer annotation">🔒 Your birth data is used only to generate your reading. Never sold.</p>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { getSunSign, getLifePathNumber, type SunSign } from '~/utils/quick-signs-client'
import { useAnalysisStore } from '~/stores/analysisStore'

useSeoMeta({ title: 'Free Compatibility Reading — OMENORA', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
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
const stepConfig = [
  { headline: 'Whose chart are we comparing?' },
  { headline: 'Now their birth details.' },
  { headline: 'Ready to see what your charts say?' },
]

// ── Transition direction ─────────────────────────────────────────────
const transitionDir = ref('slide-left')

// ── Step state ──────────────────────────────────────────────────────
const currentStep   = ref(1)
const revealVisible = ref(false)

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
const loadingMessages = [
  'Reading your birth charts...',
  'Mapping the synastry aspects...',
  'Generating your reading...',
]
let loadingInterval: ReturnType<typeof setInterval> | null = null

// ── Navigation ────────────────────────────────────────────────────────────────
function triggerReveal() {
  revealVisible.value = false
  setTimeout(() => { revealVisible.value = true }, 60)
}

function goBack() {
  if (currentStep.value > 1) {
    transitionDir.value = 'slide-right'
    currentStep.value--
    triggerReveal()
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
    loadingMsgIdx.value = (loadingMsgIdx.value + 1) % loadingMessages.length
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
  trackEvent('compatibility_quiz_started')
  triggerReveal()

  // Capture UTM params from the landing URL and persist to sessionStorage.
  // Uses the same key ('omenora_utms') as getUtmParams() in pixels.client.ts
  // so pixel events on /compatibility automatically include attribution.
  try {
    const utmParams = {
      utm_source:   (route.query.utm_source   as string) || '',
      utm_campaign: (route.query.utm_campaign as string) || '',
      utm_creative: (route.query.utm_creative as string) || '',
      utm_medium:   (route.query.utm_medium   as string) || '',
    }
    if (utmParams.utm_source) {
      sessionStorage.setItem('omenora_utms', JSON.stringify(utmParams))
    }
  } catch { /* sessionStorage unavailable — non-blocking */ }
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
