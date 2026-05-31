<template>
  <div class="aq" :style="bgStyle">

    <!-- ── Atmospheric background layers ──────────────────────────────────── -->
    <div class="aq__bg-image" aria-hidden="true" />
    <div class="aq__bg-overlay" aria-hidden="true" />

    <!-- ── Page grain texture ──────────────────────────────────────────────── -->
    <div class="page-grain" aria-hidden="true" />

    <!-- ── Sticky header ───────────────────────────────────────────────────── -->
    <AppHeader />

    <main>

    <!-- ── Progress bar ────────────────────────────────────────────────────── -->
    <div class="aq__progress">
      <QuizProgressBar :current="currentStep + 1" :total="totalSteps" />
    </div>

    <!-- ── Step content ────────────────────────────────────────────────────── -->
    <Transition name="step-fade" mode="out-in">
      <div
        :key="currentStep"
        class="aq__step"
        :class="{ 'aq__step--sticky-cta': currentStep !== 0 && currentStep !== 5 && currentStep !== 6 }"
      >

        <!-- Back button -->
        <div v-if="currentStep > 0" class="aq__back">
          <AppButton variant="ghost" size="sm" @click="back">
            ← Back
          </AppButton>
        </div>

        <!-- AppCard glass variant — transparent frosted surface over atmospheric image -->
        <AppCard variant="glass" :hoverable="false" class="aq__card">

          <AppEyebrow class="aq-step__eyebrow">
            Step {{ currentStep + 1 }}
          </AppEyebrow>

          <AppHeadline variant="lg" as="h1" class="aq-step__headline">
            {{ stepConfig[currentStep]?.headline }}
          </AppHeadline>

          <div class="aq-step__content">

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
              <AppCaption variant="default" as="p" class="field-hint field-hint--top">Birth time improves your Rising sign accuracy.</AppCaption>
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
          <div class="aq-step__nav">
            <!-- Step 7: submit -->
            <template v-if="currentStep === 7">
              <AppButton
                v-if="(store.answers as Record<string,string>)['p3']"
                variant="primary"
                :arrow="true"
                :disabled="isCalculating"
                @click="handleSubmit"
              >
                {{ isCalculating ? 'Calculating…' : t('revealDestiny') }}
              </AppButton>
            </template>

            <!-- Steps 1–4: Continue -->
            <template v-else-if="currentStep !== 0 && currentStep !== 5 && currentStep !== 6">
              <AppButton
                variant="primary"
                :arrow="true"
                :disabled="!canAdvance"
                @click="advance"
              >
                Continue
              </AppButton>
            </template>
          </div>

        </AppCard>

      </div>
    </Transition>

    <!-- ── Trust footer ──────────────────────────────────────────────────────── -->
    <AppCaption variant="default" as="p" class="aq__trust">
      Your birth data is used only to generate your reading. Never sold.
    </AppCaption>

    </main>

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

// ── Background phase map ───────────────────────────────────────────────────────
// Steps 0–2 = emotional/personal context, 3–5 = birth data, 6–7 = personality quiz
const PHASE_IMAGES: Record<'A' | 'B' | 'C', string> = {
  A: '/images/hero/Distant-horizon-emergence.webp',
  B: '/images/hero/Nebula-void.webp',
  C: '/images/hero/Cosmic-gold-ascension.webp',
}

function getPhase(idx: number): 'A' | 'B' | 'C' {
  if (idx <= 2) return 'A'
  if (idx <= 5) return 'B'
  return 'C'
}

const bgStyle = computed(() => ({
  '--aq-bg-image': `url('${PHASE_IMAGES[getPhase(currentStep.value)]}')`,
}))
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
/* ── Page root ──
   Full-bleed atmospheric canvas. position: relative contains the
   absolutely-positioned background layers. */
.aq {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--omn-bg-page);
  color: var(--omn-text-primary);
  overflow: hidden;
}

/* ── Bronze diagonal seam glow (::after) ──
   Identical geometry to compatibility-quiz and SectionHero. */
.aq::after {
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

/* ── Atmospheric background image ──
   Driven by --aq-bg-image CSS variable from bgStyle computed.
   168° diagonal mask mirrors compatibility-quiz pattern. */
.aq__bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: var(--aq-bg-image);
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

/* ── Dark overlay ──
   Two-gradient composite: top-to-bottom vignette + diagonal bronze warmth. */
.aq__bg-overlay {
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

/* ── Page grain texture ──
   Fixed, pointer-events: none. z-index 200 sits above all content. */
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

/* ── Progress bar wrapper ── */
.aq__progress {
  position: relative;
  z-index: 3;
}

/* ── Step outer container ──
   Flex column, vertically and horizontally centered.
   z-index 3 brings it above all background layers. */
.aq__step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-8) var(--space-6) var(--space-12);
  position: relative;
  z-index: 3;
}
@media (min-width: 768px) {
  .aq__step {
    padding: var(--space-12) var(--space-8) var(--space-16);
  }
}

/* ── Back button row ── */
.aq__back {
  width: 100%;
  max-width: 36rem;
  margin-bottom: var(--space-3);
}

/* ── AppCard quiz overrides ──
   glass variant handles background, backdrop-filter, and border.
   Override: max-width for editorial column + mobile edge-to-edge. */
.aq__card {
  width: 100%;
  max-width: 36rem;
}
@media (max-width: 767px) {
  .aq__card {
    max-width: 100%;
    border-left: none !important;
    border-right: none !important;
  }
}

/* ── Step eyebrow ── */
.aq-step__eyebrow {
  margin-bottom: var(--space-3);
  color: var(--omn-text-tertiary);
}

/* ── Step headline ──
   AppHeadline variant="lg" handles sizing; only override is bottom margin. */
.aq-step__headline {
  margin-bottom: var(--space-6);
}

/* ── Step content ── */
.aq-step__content {
  margin-bottom: var(--space-6);
}

/* ── Nav row ── */
.aq-step__nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}

/* ── Field label ── */
.field-label {
  display: block;
  color: var(--omn-text-tertiary);
  margin-bottom: 12px;
}

/* ── Editorial inputs ── */
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
.field-hint--top {
  margin-top: 0;
  margin-bottom: 24px;
}

/* ── Quiz options ── */
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

/* ── Error ── */
.step-error {
  margin-top: var(--space-4);
  color: var(--omn-error);
}

/* ── Trust footer ── */
.aq__trust {
  text-align: center;
  color: var(--omn-text-tertiary);
  padding: 20px clamp(20px, 5vw, 80px) clamp(32px, 6vw, 48px);
  position: relative;
  z-index: 3;
}

/* ── Sticky Continue CTA on mobile ──
   Mirrors compatibility-quiz pattern for non-select steps. */
@media (max-width: 767px) {
  .aq__step--sticky-cta :deep(.app-button--primary) {
    position: sticky;
    bottom: env(safe-area-inset-bottom, 0px);
    z-index: 10;
    width: 100%;
    align-self: stretch;
  }
}

/* ── Step transition ── */
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

/* ── Responsive ── */
@media (max-width: 480px) {
  .quiz-option__text  { font-size: var(--text-md); }
  .quiz-question__text { font-size: var(--text-lg); }
  .editorial-input    { font-size: var(--text-lg); }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .step-fade-enter-active,
  .step-fade-leave-active { transition: none; }
  .page-grain { animation: none; }
}
</style>
