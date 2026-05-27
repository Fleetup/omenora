<template>
  <div class="analysis-page">

    <AppHeader>
      <template #action>
        <span class="label-caps analysis-header__step">
          {{ currentStep + 1 }} / {{ totalSteps }}
        </span>
      </template>
    </AppHeader>

    <!-- Progress bar — canonical QuizProgressBar (bronze fill) -->
    <QuizProgressBar :current="currentStep + 1" :total="totalSteps" />

    <!-- Step container -->
    <div class="analysis-steps">
      <Transition :name="transitionDir" mode="out-in">
        <div :key="currentStep" class="analysis-step">

          <AppEyebrow class="analysis-step__label">
            Step {{ currentStep + 1 }}
          </AppEyebrow>

          <AppHeadline variant="italic" as="h1" class="analysis-step__headline">
            {{ stepConfig[currentStep]?.headline }}
          </AppHeadline>

          <div class="analysis-step__rule" />

          <div class="analysis-step__content">

            <!-- Step 0: Clarity focus -->
            <template v-if="currentStep === 0">
              <div class="quiz-options">
                <button
                  v-for="option in clarityOptions"
                  :key="option.value"
                  class="quiz-option"
                  :class="{ 'quiz-option--selected': store.clarityFocus === option.value }"
                  @click="selectClarityFocus(option.value)"
                >
                  <span class="quiz-option__letter label-caps">
                    {{ String.fromCharCode(65 + clarityOptions.indexOf(option)) }}
                  </span>
                  <span class="quiz-option__text">{{ option.label }}</span>
                </button>
              </div>
            </template>

            <!-- Step 1: First name -->
            <template v-else-if="currentStep === 1">
              <label class="field-label label-caps" for="firstName">Your first name</label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                name="firstName"
                class="editorial-input"
                :placeholder="t('firstNamePlaceholder')"
                autocomplete="given-name"
                @keydown.enter="advance"
              />
            </template>

            <!-- Step 2: Date of birth -->
            <template v-else-if="currentStep === 2">
              <label class="field-label label-caps" for="dob">{{ t('dateOfBirth') }}</label>
              <input
                id="dob"
                v-model="dateOfBirth"
                type="date"
                class="editorial-input"
                min="1924-01-01"
                :max="todayMax"
                autocomplete="bday"
                required
              />
              <AppCaption variant="default" as="p" class="field-hint">Used only to calculate your planetary positions.</AppCaption>
            </template>

            <!-- Step 3: City -->
            <template v-else-if="currentStep === 3">
              <PlacesAutocomplete
                v-model="store.city"
                :label="t('cityCountry')"
                :placeholder="t('cityPlaceholder')"
                hint="Used only to determine the horizon position at your birth. Never stored or sold."
                input-id="city"
                @place-selected="onCitySelected"
              />
            </template>

            <!-- Step 4: Birth time -->
            <template v-else-if="currentStep === 4">
              <AppCaption variant="default" as="p" class="field-hint" style="margin-bottom: 24px;">Birth time improves your Rising sign accuracy.</AppCaption>
              <div class="birth-time-row">
                <label class="field-label label-caps" for="birth-time">Birth time</label>
                <button type="button" class="skip-time-btn label-caps" @click="skipBirthTime">Skip</button>
              </div>
              <input
                id="birth-time"
                v-model="birthTimeInput"
                type="time"
                class="editorial-input"
              />
              <AppCaption variant="default" as="p" class="field-hint">Leave blank if unknown — Rising sign won't be available without it.</AppCaption>
            </template>

            <!-- Step 5: Quiz p1 -->
            <template v-else-if="currentStep === 5">
              <div class="quiz-question">
                <AppCaption variant="default" class="quiz-question__num">01</AppCaption>
                <AppSubhead variant="default" as="p" class="quiz-question__text">{{ questions[0]!.text }}</AppSubhead>
              </div>
              <div class="quiz-options">
                <button
                  v-for="option in questions[0]!.options"
                  :key="option.value"
                  class="quiz-option"
                  :class="{ 'quiz-option--selected': (store.answers as Record<string,string>)['p1'] === option.value }"
                  @click="selectAndAdvance('p1', option.value)"
                >
                  <span class="quiz-option__letter label-caps">
                    {{ String.fromCharCode(65 + questions[0]!.options.indexOf(option)) }}
                  </span>
                  <span class="quiz-option__text">{{ option.label }}</span>
                </button>
              </div>
            </template>

            <!-- Step 6: Quiz p2 -->
            <template v-else-if="currentStep === 6">
              <div class="quiz-question">
                <AppCaption variant="default" class="quiz-question__num">02</AppCaption>
                <AppSubhead variant="default" as="p" class="quiz-question__text">{{ questions[1]!.text }}</AppSubhead>
              </div>
              <div class="quiz-options">
                <button
                  v-for="option in questions[1]!.options"
                  :key="option.value"
                  class="quiz-option"
                  :class="{ 'quiz-option--selected': (store.answers as Record<string,string>)['p2'] === option.value }"
                  @click="selectAndAdvance('p2', option.value)"
                >
                  <span class="quiz-option__letter label-caps">
                    {{ String.fromCharCode(65 + questions[1]!.options.indexOf(option)) }}
                  </span>
                  <span class="quiz-option__text">{{ option.label }}</span>
                </button>
              </div>
            </template>

            <!-- Step 7: Quiz p3 — manual submit -->
            <template v-else-if="currentStep === 7">
              <div class="quiz-question">
                <AppCaption variant="default" class="quiz-question__num">03</AppCaption>
                <AppSubhead variant="default" as="p" class="quiz-question__text">{{ questions[2]!.text }}</AppSubhead>
              </div>
              <div class="quiz-options">
                <button
                  v-for="option in questions[2]!.options"
                  :key="option.value"
                  class="quiz-option"
                  :class="{ 'quiz-option--selected': (store.answers as Record<string,string>)['p3'] === option.value }"
                  @click="handleAnswerSelect('p3', option.value)"
                >
                  <span class="quiz-option__letter label-caps">
                    {{ String.fromCharCode(65 + questions[2]!.options.indexOf(option)) }}
                  </span>
                  <span class="quiz-option__text">{{ option.label }}</span>
                </button>
              </div>
              <AppCaption v-if="submitError" variant="default" as="p" class="step-error">{{ submitError }}</AppCaption>
            </template>

          </div>

          <!-- Navigation -->
          <div class="analysis-step__nav">
            <button
              v-if="currentStep > 0"
              class="back-link label-caps"
              @click="back"
            >
              ← Back
            </button>

            <!-- Step 7: submit button instead of CTAButton -->
            <template v-if="currentStep === 7">
              <AppButton
                variant="primary"
                v-if="(store.answers as Record<string,string>)['p3']"
                :arrow="true"
                :disabled="isCalculating"
                class="advance-btn"
                @click="handleSubmit"
              >
                {{ isCalculating ? 'Calculating…' : t('revealDestiny') }}
              </AppButton>
            </template>

            <!-- Step 0: no nav button — selection auto-advances -->
            <template v-else-if="currentStep !== 0 && !(currentStep === 5 || currentStep === 6)">
              <AppButton
                variant="primary"
                :arrow="true"
                :disabled="!canAdvance"
                class="advance-btn"
                @click="advance"
              >
                Continue
              </AppButton>
            </template>
          </div>

        </div>
      </Transition>
    </div>

    <!-- Trust footer -->
    <AppCaption variant="default" as="p" class="trust-footer">🔒 Your birth data is used only to generate your reading. Never sold.</AppCaption>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAnalysisStore, type NatalChart } from '~/stores/analysisStore'
import { LANGUAGES } from '~/utils/translations'
import { useLanguage } from '~/composables/useLanguage'

const { $trackStep1Complete, $trackQuestionAnswered, $trackAnalysisSubmit, $trackAnalysisStart } = useNuxtApp() as any

useSeoMeta({ title: 'Your Free Personality & Astrology Reading', robots: 'noindex, nofollow' })
useHead({ link: [{ rel: 'canonical', href: 'https://omenora.com/analysis' }] })

onMounted(() => {
  $trackAnalysisStart?.()
})

const store = useAnalysisStore()
const { t } = useLanguage()
const currentStep = ref(0)
const isCalculating = ref(false)
const submitError   = ref<string | null>(null)

// ── Transition direction ──────────────────────────────────────────────────────
const transitionDir = ref('slide-left')

// ── Step config ───────────────────────────────────────────────────────────────
const stepConfig = [
  { headline: 'What are you seeking?' },
  { headline: 'What shall we call you?' },
  { headline: 'When were you born?' },
  { headline: 'Where were you born?' },
  { headline: 'Do you know your birth time?' },
  { headline: 'Three questions.' },
  { headline: 'Three questions.' },
  { headline: 'Three questions.' },
]

const totalSteps = stepConfig.length

// ── Clarity options ───────────────────────────────────────────────────────────
const clarityOptions = [
  { label: 'Love & Relationships', value: 'love' },
  { label: 'Career & Purpose',     value: 'career' },
  { label: 'Who I Actually Am',    value: 'identity' },
  { label: 'My Path Forward',      value: 'path' },
]

function selectClarityFocus(value: string) {
  store.clarityFocus = value
  transitionDir.value = 'slide-left'
  currentStep.value = 1
}

function selectLanguage(code: string) {
  store.setLanguageOverride(code)
}

const firstName = computed({
  get: () => store.firstName,
  set: (val: string) => { store.firstName = val },
})

const city = computed({
  get: () => store.city,
  set: (val: string) => { store.city = val },
})

// ── canAdvance per step ───────────────────────────────────────────────────────
const canAdvance = computed(() => {
  switch (currentStep.value) {
    case 0: return !!store.clarityFocus
    case 1: return !!store.firstName
    case 2: return dateStep2Valid.value
    case 3: return !!store.city
    case 4: return true
    default: return true
  }
})

// ── Navigation ────────────────────────────────────────────────────────────────
function back() {
  transitionDir.value = 'slide-right'
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    navigateTo('/')
  }
}

function advance() {
  transitionDir.value = 'slide-left'
  if (currentStep.value === 3) {
    $trackStep1Complete({ language: store.language })
  }
  currentStep.value++
}

function advanceStep() {
  transitionDir.value = 'slide-left'
  currentStep.value++
}

function advanceFromCity() {
  $trackStep1Complete({ language: store.language })
  transitionDir.value = 'slide-left'
  currentStep.value++
}

// ── todayMax for date input ──────────────────────────────────────────────────
const todayMax = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

// ── Native date / time input refs ────────────────────────────────────────────
const dateOfBirth   = ref<string>(store.dateOfBirth ?? '')
const birthTimeInput = ref<string>('')

// ── Sync native inputs → store ───────────────────────────────────────────────
watch(dateOfBirth, (val) => {
  store.dateOfBirth = val
})

watch(birthTimeInput, (val) => {
  store.timeOfBirth = val
})

watch(
  () => store.answers,
  (newAnswers, oldAnswers) => {
    for (const [key, val] of Object.entries(newAnswers)) {
      if (val && val !== (oldAnswers as Record<string, string>)?.[key]) {
        $trackQuestionAnswered({ questionId: key, answer: val as string, language: store.language })
      }
    }
  },
  { deep: true },
)

const dateStep2Valid = computed(() => !!dateOfBirth.value)

function handleAnswerSelect(questionId: string, answerValue: string) {
  store.setAnswer(questionId, answerValue)
}

function selectAndAdvance(questionId: string, answerValue: string) {
  store.setAnswer(questionId, answerValue)
  transitionDir.value = 'slide-left'
  currentStep.value++
}

function onCitySelected(place: { name: string; lat: number; lng: number; placeId: string }) {
  store.city        = place.name
  store.cityLat     = place.lat
  store.cityLng     = place.lng
  store.cityPlaceId = place.placeId
}

function skipBirthTime() {
  birthTimeInput.value = ''
  store.timeOfBirth = ''
  transitionDir.value = 'slide-left'
  currentStep.value++
}

const step1Valid = computed(
  () => !!store.firstName && !!dateOfBirth.value && !!store.city,
)

const questions = computed(() => [
  {
    id: 'p1',
    text: t('p1Text'),
    options: [
      { label: t('p1opt1'), value: 'connection' },
      { label: t('p1opt2'), value: 'purpose' },
      { label: t('p1opt3'), value: 'growth' },
      { label: t('p1opt4'), value: 'creativity' },
    ],
  },
  {
    id: 'p2',
    text: t('p2Text'),
    options: [
      { label: t('p2opt1'), value: 'direct' },
      { label: t('p2opt2'), value: 'gentle' },
      { label: t('p2opt3'), value: 'detailed' },
      { label: t('p2opt4'), value: 'intuitive' },
    ],
  },
  {
    id: 'p3',
    text: t('p3Text'),
    options: [
      { label: t('p3opt1'), value: 'self' },
      { label: t('p3opt2'), value: 'situation' },
      { label: t('p3opt3'), value: 'curiosity' },
      { label: t('p3opt4'), value: 'recommended' },
    ],
  },
])

const allAnswered = computed(() =>
  questions.value.every(
    (q) => !!(store.answers as Record<string, string>)[q.id],
  ),
)

const regionOptions = computed(() => [
  { value: 'western', icon: '⭐', name: t('traditionWesternName'), sub: t('traditionWesternSub') },
  { value: 'india',   icon: '🕉', name: t('traditionVedicName'),   sub: t('traditionVedicSub') },
  { value: 'china',   icon: '☯', name: t('traditionChineseName'), sub: t('traditionChineseSub') },
  { value: 'latam',   icon: '🔮', name: t('traditionTarotName'),   sub: t('traditionTarotSub') },
])

function selectRegion(value: string) {
  store.setRegionOverride(value)
}

async function handleSubmit() {
  if (!allAnswered.value) return
  isCalculating.value = true
  submitError.value   = null
  store.natalChart = null

  const utcOffsetMinutes = -(new Date().getTimezoneOffset())

  try {
    const result = await $fetch('/api/calculate-chart', {
      method: 'POST',
      body: {
        firstName:        store.firstName,
        dateOfBirth:      store.dateOfBirth,
        timeOfBirth:      store.timeOfBirth || null,
        city:             store.city,
        cityLat:          store.cityLat,
        cityLng:          store.cityLng,
        utcOffsetMinutes,
      },
    }) as {
      archetype:      string
      lifePathNumber: number
      geocodeFailed:  boolean
      chart:          NatalChart
    }

    store.archetype      = result.archetype
    store.lifePathNumber = result.lifePathNumber
    store.natalChart     = result.chart

    if (result.geocodeFailed) {
      console.warn('[analysis] geocoding failed for city — ascendant will be unavailable')
    }

    $trackAnalysisSubmit({ archetype: result.archetype, lifePathNumber: result.lifePathNumber, language: store.language, region: store.region })
    await navigateTo('/preview')
  } catch (err) {
    console.error('[analysis] chart calculation failed:', err)
    submitError.value   = 'Something went wrong. Please check your connection and try again.'
    isCalculating.value = false
  }
}
</script>

<style scoped>
/* ── Page shell ── */
.analysis-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--omn-bg-page);
  color: var(--omn-text-primary);
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
  color: var(--omn-text-tertiary);
  margin-bottom: 20px;
}

/* ── Step headline ── */
.analysis-step__headline {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-light);
  font-style: italic;
  font-size: clamp(36px, 8vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 32px;
  color: var(--omn-text-primary);
}

/* ── Decorative rule ── */
.analysis-step__rule {
  width: 48px;
  height: 1px;
  background: var(--omn-text-secondary);
  margin-bottom: 36px;
}

.analysis-step__content {
  margin-bottom: 40px;
}

/* ── Field label ── */
.field-label {
  display: block;
  color: var(--omn-text-tertiary);
  margin-bottom: 12px;
}

/* ── Editorial inputs ──
   Aligned to QuizTextInput/QuizDateInput pattern: --omn-font-display,
   weight-light, --omn-border-primary baseline, --omn-accent on focus,
   italic placeholder. Width cap (480px) and bottom margin preserved
   because /analysis lays inputs out inline rather than via gap. */
.editorial-input {
  width: 100%;
  max-width: 480px;
  padding: var(--space-4) 0;
  font-family: var(--omn-font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  letter-spacing: var(--tracking-snug);
  color: var(--omn-text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--omn-border-primary);
  outline: none;
  border-radius: 0;
  transition: border-color var(--omn-duration-fast) var(--omn-ease);
  display: block;
  margin-bottom: 28px;
}

.editorial-input:focus {
  border-bottom-color: var(--omn-accent);
}

.editorial-input::placeholder {
  color: var(--omn-text-tertiary);
  font-style: italic;
}

input[type="date"],
input[type="time"] {
  -webkit-appearance: none;
  appearance: none;
  color-scheme: dark;
}

/* ── Field hint ── */
.field-hint {
  margin-top: 10px;
  color: var(--omn-text-tertiary);
}

/* ── Quiz options ──
   Aligned to QuizSingleSelect chip pattern: --omn-bg-primary surface,
   --omn-border-subtle baseline, hover lifts to --omn-bg-elevated +
   --omn-border-emphasis, selected uses bronze --omn-accent border.
   Border-radius stays 0 per design system (editorial cards are square). */
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 540px;
}

.quiz-options--two {
  max-width: 380px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--omn-bg-primary);
  border: 1px solid var(--omn-border-subtle);
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition:
    background var(--omn-duration-fast) var(--omn-ease),
    border-color var(--omn-duration-fast) var(--omn-ease),
    transform var(--omn-duration-fast) var(--omn-ease);
}

.quiz-option:hover {
  background: var(--omn-bg-elevated);
  border-color: var(--omn-border-emphasis);
}
.quiz-option:active { transform: translateY(1px); }

.quiz-option--selected {
  background: var(--omn-bg-elevated);
  border-color: var(--omn-accent);
}

.quiz-option:focus-visible {
  outline: 2px solid var(--omn-accent);
  outline-offset: 3px;
}

.quiz-option__letter {
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
  flex-shrink: 0;
  width: 16px;
}

.quiz-option__text {
  font-family: var(--omn-font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-regular);
  color: var(--omn-text-primary);
  line-height: 1.3;
  letter-spacing: var(--tracking-body);
}

/* ── Quiz question header ── */
.quiz-question {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: 28px;
  max-width: 540px;
}

.quiz-question__num {
  color: var(--omn-text-tertiary);
  flex-shrink: 0;
  padding-top: 4px;
}

.quiz-question__text {
  font-family: var(--omn-font-body);
  font-size: var(--text-xl);
  font-weight: var(--weight-regular);
  line-height: 1.4;
  color: var(--omn-text-primary);
  margin: 0;
}

/* ── Birth time row (label + skip) ── */
.birth-time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 480px;
  margin-bottom: 12px;
}

.birth-time-row .field-label {
  margin-bottom: 0;
}

.skip-time-btn {
  background: none;
  border: none;
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0;
  font-family: var(--omn-font-mono);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-mid);
  text-transform: uppercase;
  transition: color var(--omn-duration-fast) var(--omn-ease);
}

.skip-time-btn:hover { color: var(--omn-text-primary); }

/* ── Navigation ── */
.analysis-step__nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.back-link {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  font-family: var(--omn-font-mono);
  font-weight: var(--weight-medium);
  padding: 0;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}

.back-link:hover { color: var(--omn-text-primary); }

/* ── Error ── */
.step-error {
  margin-top: var(--space-4);
  color: var(--omn-error);
}

/* ── Trust footer ── */
.trust-footer {
  text-align: center;
  color: var(--omn-text-tertiary);
  padding: 20px clamp(20px, 5vw, 80px) clamp(32px, 6vw, 48px);
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Header step counter ── */
.analysis-header__step {
  color: var(--omn-text-tertiary);
  font-size: var(--text-xs);
  font-family: var(--omn-font-mono);
  letter-spacing: var(--tracking-caps);
}

/* ── Step transitions — canonical motion tokens ── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all var(--omn-duration-base) var(--omn-ease);
}

.slide-left-enter-from  { opacity: 0; transform: translateX(32px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-32px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-32px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(32px); }

/* ── Advance button disabled state ── */
.advance-btn:disabled,
.advance-btn[disabled] {
  opacity: 0.35;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .analysis-step__headline { font-size: clamp(30px, 9vw, 42px); }
  .quiz-option__text { font-size: var(--text-md); }
  .quiz-question__text { font-size: var(--text-lg); }
  .editorial-input { font-size: var(--text-lg); }
}

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: opacity var(--omn-duration-fast) var(--omn-ease);
  }
  .slide-left-enter-from,
  .slide-right-enter-from { transform: none; }
  .slide-left-leave-to,
  .slide-right-leave-to   { transform: none; }
}
</style>
