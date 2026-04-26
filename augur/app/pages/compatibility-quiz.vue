<template>
  <div v-if="currentStep === 4" class="center-page" aria-live="polite">
    <!-- ── STATE 4: Loading ── -->
    <div class="center-content">
      <OrbitalMark />
      <p class="brand-text">OMENORA</p>
      <p :key="loadingMsgIdx" class="loading-message">{{ loadingMessages[loadingMsgIdx] }}</p>
      <div class="progress-track">
        <div class="loading-fill" />
      </div>
      <p v-if="apiError" class="submit-error">
        Something went wrong. <button class="retry-link" @click="runApiCall">Try again</button>
      </p>
    </div>
  </div>

  <div v-else class="page">

    <!-- Top bar -->
    <div class="top-bar">
      <button
        class="back-btn"
        aria-label="Go back"
        @click="goBack"
      >←</button>
      <span class="brand">OMENORA</span>
      <span class="step-indicator">{{ currentStep }} of 3</span>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar" role="progressbar" :aria-valuenow="currentStep" aria-valuemin="1" aria-valuemax="3">
      <div class="progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }" />
    </div>

    <!-- ── STATE 1 ── -->
    <template v-if="currentStep === 1">
      <h1 class="heading">Whose chart are<br>we comparing?</h1>
      <p class="subheading">Enter your birth details to start</p>

      <!-- Birth date -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'myDob' }">
        <label class="field-label" for="compat-my-dob">Your birth date</label>
        <input
          id="compat-my-dob"
          v-model="myDob"
          type="date"
          class="field-input native-date"
          min="1924-01-01"
          :max="todayMax"
          required
          @focus="focusedField = 'myDob'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Birth city -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'myCity' }">
        <label class="field-label" for="myCity">Your birth city</label>
        <input
          id="myCity"
          v-model="myCity"
          type="text"
          placeholder="City, Country"
          autocomplete="address-level2"
          class="field-input"
          @focus="focusedField = 'myCity'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Birth time (optional) -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'myTime' }">
        <div class="field-header-row">
          <label class="field-label" for="compat-my-time">Your birth time</label>
          <button type="button" class="skip-time-btn" @click="myTime = ''">Skip</button>
        </div>
        <input
          id="compat-my-time"
          v-model="myTime"
          type="time"
          class="field-input native-date"
          @focus="focusedField = 'myTime'"
          @blur="focusedField = null"
        >
        <p class="time-hint">More accurate Rising sign — leave blank if unknown</p>
      </div>

      <p class="privacy-note">Used only to calculate your planetary positions. Never sold.</p>

      <button
        class="cta-button"
        :class="{ disabled: !step1Valid }"
        :disabled="!step1Valid"
        aria-label="Continue to step 2"
        @click="advanceStep1"
      >
        Continue →
      </button>
    </template>

    <!-- ── STATE 2 ── -->
    <template v-else-if="currentStep === 2">
      <div class="micro-reveal" :class="{ visible: revealVisible }">
        <p class="reveal-label">YOU</p>
        <p class="reveal-sign">{{ mySunSign?.symbol }} {{ mySunSign?.name }}</p>
        <p class="reveal-lifepath">Life Path {{ myLifePath }}</p>
      </div>

      <h1 class="heading">Now their<br>birth details</h1>
      <p class="subheading">We'll compare your charts</p>

      <!-- Their birth date -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'theirDob' }">
        <label class="field-label" for="compat-their-dob">Their birth date</label>
        <input
          id="compat-their-dob"
          v-model="theirDob"
          type="date"
          class="field-input native-date"
          min="1924-01-01"
          :max="todayMax"
          required
          @focus="focusedField = 'theirDob'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Their birth city -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'theirCity' }">
        <label class="field-label" for="theirCity">Their birth city</label>
        <input
          id="theirCity"
          v-model="theirCity"
          type="text"
          placeholder="City, Country"
          autocomplete="off"
          class="field-input"
          @focus="focusedField = 'theirCity'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Their birth time (optional) -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'theirTime' }">
        <div class="field-header-row">
          <label class="field-label" for="compat-their-time">Their birth time</label>
          <button type="button" class="skip-time-btn" @click="theirTime = ''">Skip</button>
        </div>
        <input
          id="compat-their-time"
          v-model="theirTime"
          type="time"
          class="field-input native-date"
          @focus="focusedField = 'theirTime'"
          @blur="focusedField = null"
        >
        <p class="time-hint">More accurate Rising sign — leave blank if unknown</p>
      </div>

      <p class="privacy-note">Used only to calculate chart positions. Never sold.</p>

      <button
        class="cta-button"
        :class="{ disabled: !step2Valid }"
        :disabled="!step2Valid"
        aria-label="Continue to step 3"
        @click="advanceStep2"
      >
        Continue →
      </button>
    </template>

    <!-- ── STATE 3 ── -->
    <template v-else-if="currentStep === 3">
      <div class="dual-reveal" :class="{ visible: revealVisible }">
        <div class="reveal-card">
          <p class="reveal-label">YOU</p>
          <p class="reveal-sign">{{ mySunSign?.symbol }} {{ mySunSign?.name }}</p>
          <p class="reveal-lifepath">Life Path {{ myLifePath }}</p>
        </div>
        <div class="reveal-divider">×</div>
        <div class="reveal-card">
          <p class="reveal-label">THEM</p>
          <p class="reveal-sign">{{ theirSunSign?.symbol }} {{ theirSunSign?.name }}</p>
          <p class="reveal-lifepath">Life Path {{ theirLifePath }}</p>
        </div>
      </div>

      <h1 class="heading">Ready to see what your charts say?</h1>
      <p class="subheading">We'll map the synastry between your two birth charts — communication, conflict, attraction, and what's coming next.</p>

      <button
        class="cta-button submit-btn"
        aria-label="Reveal compatibility reading"
        @click="advanceStep3"
      >
        Reveal compatibility →
      </button>
    </template>

    <p class="trust-footer">&#128274; Your birth data is used only to generate your reading. Never sold.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { getSunSign, getLifePathNumber, type SunSign } from '~/utils/quick-signs-client'
import { useAnalysisStore } from '~/stores/analysisStore'

useSeoMeta({ title: 'Free Compatibility Reading — OMENORA', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
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
const focusedField = ref<string | null>(null)

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
  if (currentStep.value > 1) { currentStep.value--; triggerReveal() }
  else { navigateTo('/') }
}

function advanceStep1() {
  if (!step1Valid.value) return
  try {
    mySunSign.value  = getSunSign(myDob.value)
    myLifePath.value = getLifePathNumber(myDob.value).number
  } catch { return }
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
    store.setPartnerData({ name: '', dob: theirDob.value, city: theirCity.value })
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
})

onUnmounted(() => {
  stopLoadingCycle()
})
</script>

<style scoped>
/* ── Page shell ── */
.page {
  position: relative;
  min-height: 100vh;
  background: #07070D;
  color: rgba(255, 255, 255, 0.94);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  padding: 28px 24px calc(52px + env(safe-area-inset-bottom, 0px));
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 55% at 50% 0%, rgba(75, 45, 155, 0.18) 0%, transparent 68%),
    radial-gradient(ellipse 50% 40% at 15% 55%, rgba(50, 25, 110, 0.10) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.page > * {
  position: relative;
  z-index: 1;
}

/* ── Top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.38);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  margin: -8px;
  line-height: 1;
  transition: color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.back-btn:hover { color: rgba(255, 255, 255, 0.75); }

.brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.28);
}

.step-indicator {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.22);
}

/* ── Progress bar ── */
.progress-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  margin-bottom: 36px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(201, 168, 76, 0.60);
  border-radius: 1px;
  transition: width 0.3s ease;
}

/* ── Headings ── */
.heading {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 38px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.94);
  margin: 0 0 8px;
  line-height: 1.12;
  letter-spacing: 0.01em;
}

.subheading {
  font-size: 14px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.38);
  margin: 0 0 24px;
  line-height: 1.55;
}

/* ── Field wrappers (city input) ── */
.field-wrapper {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: border-color 0.22s ease, background 0.22s ease;
}

.field-wrapper.focused {
  border-color: rgba(201, 168, 76, 0.42);
  background: rgba(201, 168, 76, 0.03);
}

.field-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.28);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 5px;
}

.field-input {
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.88);
  font-size: 15px;
  width: 100%;
  font-family: inherit;
}

.field-input::placeholder { color: rgba(255, 255, 255, 0.18); }

.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #0d0b1e inset !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.88) !important;
  caret-color: rgba(255, 255, 255, 0.88);
  transition: background-color 9999s ease-in-out 0s;
}

/* ── Field header row (label + skip button) ── */
.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

/* ── Native date / time inputs ── */
.native-date {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.88);
  font-size: max(16px, 1em);
  font-family: inherit;
  width: 100%;
  min-height: 28px;
  padding: 0;
  cursor: pointer;
  caret-color: rgba(201, 168, 76, 0.85);
}

.native-date::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.45);
  cursor: pointer;
  margin-left: 4px;
  flex-shrink: 0;
}

.native-date::-webkit-datetime-edit-fields-wrapper { padding: 0; }
.native-date::-webkit-datetime-edit             { padding: 0; color: rgba(255, 255, 255, 0.88); }
.native-date::-webkit-datetime-edit-text         { color: rgba(255, 255, 255, 0.30); }
.native-date::-webkit-datetime-edit-year-field,
.native-date::-webkit-datetime-edit-month-field,
.native-date::-webkit-datetime-edit-day-field,
.native-date::-webkit-datetime-edit-hour-field,
.native-date::-webkit-datetime-edit-minute-field,
.native-date::-webkit-datetime-edit-ampm-field  { color: rgba(255, 255, 255, 0.88); }

.native-date:focus::-webkit-datetime-edit-year-field,
.native-date:focus::-webkit-datetime-edit-month-field,
.native-date:focus::-webkit-datetime-edit-day-field,
.native-date:focus::-webkit-datetime-edit-hour-field,
.native-date:focus::-webkit-datetime-edit-minute-field,
.native-date:focus::-webkit-datetime-edit-ampm-field {
  background: rgba(140, 110, 255, 0.18);
  color: #ffffff;
  border-radius: 3px;
}

/* ── Skip time button ── */
.skip-time-btn {
  background: none;
  border: none;
  font-size: 10px;
  color: rgba(107, 72, 224, 0.65);
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s ease;
}

.skip-time-btn:hover { color: rgba(140, 110, 255, 0.90); }

/* ── Time hint ── */
.time-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.20);
  margin: 8px 0 0;
  line-height: 1.6;
  letter-spacing: 0.01em;
  padding: 0 4px;
}

/* ── Privacy note ── */
.privacy-note {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.28);
  text-align: center;
  margin: 0 0 20px;
  letter-spacing: 0.01em;
}

/* ── CTA button ── */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #6B48E0;
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: 0.01em;
  padding: 17px 24px;
  min-height: 54px;
  width: 100%;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
  box-shadow:
    0 0 0 1px rgba(107, 72, 224, 0.55),
    0 8px 32px rgba(107, 72, 224, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.35);
  margin-top: 32px;
  -webkit-tap-highlight-color: transparent;
}

.cta-button:hover:not(.disabled) {
  background: #7B5AF2;
  box-shadow:
    0 0 0 1px rgba(123, 90, 242, 0.65),
    0 12px 44px rgba(107, 72, 224, 0.44),
    0 4px 12px rgba(0, 0, 0, 0.40);
  transform: translateY(-1px);
}

.cta-button:active:not(.disabled) {
  transform: translateY(0) scale(0.985);
  background: #5B38D0;
  box-shadow: 0 0 0 1px rgba(107, 72, 224, 0.45), 0 4px 16px rgba(107, 72, 224, 0.22);
}

.cta-button.disabled {
  opacity: 0.30;
  cursor: default;
  transform: none;
}

/* ── Final step gold ghost button ── */
.submit-btn {
  margin-top: 44px;
  background: rgba(201, 168, 76, 0.10);
  border: 1px solid rgba(201, 168, 76, 0.45);
  border-radius: 14px;
  box-shadow: none;
  color: rgba(201, 168, 76, 0.92);
  font-size: 14px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.submit-btn:hover:not(.disabled) {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.70);
  color: rgba(201, 168, 76, 1);
  box-shadow: 0 0 28px rgba(201, 168, 76, 0.12);
  transform: translateY(-1px);
}

.submit-btn:active:not(.disabled) { transform: translateY(0) scale(0.985); }

/* ── Micro-reveal (STATE 2) ── */
.micro-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid rgba(201, 168, 76, 0.18);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 28px;
  text-align: center;
}

.micro-reveal.visible { opacity: 1; transform: translateY(0); }

/* ── Dual reveal (STATE 3) ── */
.dual-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
}

.dual-reveal.visible { opacity: 1; transform: translateY(0); }

.reveal-card {
  flex: 1;
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid rgba(201, 168, 76, 0.18);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.reveal-divider {
  font-size: 18px;
  color: rgba(201, 168, 76, 0.30);
  flex-shrink: 0;
}

.reveal-label {
  font-size: 9px;
  font-weight: 500;
  color: rgba(201, 168, 76, 0.55);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0 0 6px;
}

.reveal-sign {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 22px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.88);
  margin: 0 0 4px;
  letter-spacing: 0.02em;
}

.reveal-lifepath {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ── Trust footer ── */
.trust-footer {
  font-size: 10px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.22);
  text-align: center;
  margin: 40px 0 0;
  letter-spacing: 0.02em;
}

/* ── Loading state ── */
.center-page {
  background: #07070D;
  min-height: 100vh;
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

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

.loading-message {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.48);
  min-height: 28px;
  max-width: 280px;
  line-height: 1.5;
  margin: 0;
  animation: fadeInMsg 0.45s ease;
}

.progress-track {
  width: 160px;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  border-radius: 1px;
}

@keyframes fillProgress {
  from { width: 0%; }
  to   { width: 95%; }
}

.loading-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(107, 72, 224, 0.65), rgba(201, 168, 76, 0.55));
  animation: fillProgress 8s ease-out forwards;
  border-radius: 1px;
}

.submit-error {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(220, 80, 80, 0.35);
  background: rgba(220, 80, 80, 0.07);
  color: rgba(255, 160, 160, 0.9);
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}

.retry-link {
  background: none;
  border: none;
  color: rgba(201, 168, 76, 0.8);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  text-decoration: underline;
  -webkit-tap-highlight-color: transparent;
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .page { padding: 24px 20px calc(48px + env(safe-area-inset-bottom, 0px)); }
  .heading { font-size: 34px; }
}

@media (max-width: 360px) {
  .page { padding: 20px 16px calc(44px + env(safe-area-inset-bottom, 0px)); }
  .heading { font-size: 30px; }
  .dual-reveal { flex-direction: column; }
  .reveal-divider { transform: rotate(90deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cta-button:hover:not(.disabled),
  .submit-btn:hover:not(.disabled) { transform: none; }
}
</style>
