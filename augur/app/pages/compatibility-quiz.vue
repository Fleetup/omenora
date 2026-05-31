<template>
  <div class="cq" :style="bgStyle">

    <!-- ── Atmospheric background layers ──────────────────────────────────── -->
    <div class="cq__bg-image" aria-hidden="true" />
    <div class="cq__bg-overlay" aria-hidden="true" />

    <!-- ── Page grain texture ──────────────────────────────────────────────── -->
    <div class="page-grain" aria-hidden="true" />

    <!-- ── Sticky header — translucent bg + backdrop blur floats over image ── -->
    <AppHeader />

    <!-- ── Progress bar — bronze fill, hairline below header ─────────────── -->
    <div class="cq__progress">
      <QuizProgressBar :current="currentStepIndex + 1" :total="QUIZ_SCHEMA.length" />
    </div>

    <!-- ── Step content ────────────────────────────────────────────────────── -->
    <Transition name="step-fade" mode="out-in">
      <div
        :key="currentStepIndex"
        class="cq__step"
        :class="{ 'cq__step--sticky-cta': step.type !== 'single_select' }"
      >

        <!-- Back button — top of card, hidden on reward screens and step 1 -->
        <div v-if="step.type !== 'reward' && currentStepIndex > 0" class="cq__back">
          <AppButton
            variant="ghost"
            size="sm"
            @click="goBack"
          >
            ← Back
          </AppButton>
        </div>

        <!-- AppCard glass variant — transparent frosted surface over atmospheric image -->
        <AppCard variant="glass" :hoverable="false" class="cq__card">

          <!-- single_select -->
          <QuizSingleSelect
            v-if="step.type === 'single_select'"
            :headline="step.headline"
            :subtext="step.subtext"
            :options="step.options"
            :selected="getSingleSelectValue(step)"
            @select="onSingleSelect(step, $event)"
          />

          <!-- date_input -->
          <QuizDateInput
            v-else-if="step.type === 'date_input'"
            :headline="step.headline"
            :subtext="step.subtext"
            :value="getDateValue(step)"
            :required="step.required"
            @update="onDateUpdate(step, $event)"
            @continue="advance"
          />

          <!-- time_input -->
          <QuizTimeInput
            v-else-if="step.type === 'time_input'"
            :headline="step.headline"
            :subtext="step.subtext"
            :value="getTimeValue(step)"
            :skip-label="step.skipLabel"
            @update="onTimeUpdate(step, $event)"
            @continue="advance"
          />

          <!-- city_input -->
          <QuizCityInput
            v-else-if="step.type === 'city_input'"
            :headline="step.headline"
            :subtext="step.subtext"
            :value="getCityValue(step)"
            :lat="getCityLat(step)"
            :lng="getCityLng(step)"
            :skip-label="step.skipLabel"
            :required="step.required"
            @update="onCityUpdate(step, $event)"
            @skip="advance"
            @continue="advance"
          />

          <!-- text_input -->
          <QuizTextInput
            v-else-if="step.type === 'text_input'"
            :headline="step.headline"
            :subtext="step.subtext"
            :value="getTextValue(step)"
            :placeholder="step.placeholder"
            :max-length="step.maxLength"
            :input-type="step.inputType"
            :required="step.required"
            :disclaimer-text="step.disclaimerText"
            @update="onTextUpdate(step, $event)"
            @continue="onTextContinue(step)"
          />

          <!-- reward -->
          <QuizRewardScreen
            v-else-if="step.type === 'reward'"
            :headline="step.headline"
            :body="step.body"
            @continue="advance"
          />

        </AppCard>

      </div>
    </Transition>

    <!-- ── Loading ────────────────────────────────────────────────────────── -->
    <LoaderBar :active="isLoading" :messages="loadingMessages" :interval="1200" />

    <!-- ── Error state ──────────────────────────────────────────────────────── -->
    <div v-if="apiError" class="cq__error">
      <AppCaption variant="default" as="p" class="cq__error-msg">
        Something went wrong. Please try again.
      </AppCaption>
      <AppButton variant="primary" @click="runApiCall">
        Retry
      </AppButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QUIZ_SCHEMA, type QuizStep, type SingleSelectStep, type DateInputStep, type TimeInputStep, type CityInputStep, type TextInputStep } from '~/components/quiz/quiz-schema'
import { useAnalysisStore } from '~/stores/analysisStore'
import type { CompatibilityQuizAnswers } from '~/stores/analysisStore'

const store = useAnalysisStore()
const router = useRouter()

useSeoMeta({
  title: 'Compatibility Reading — OMENORA',
  description: 'Discover how two charts align across Western, Vedic, BaZi, and Tarot — and what their connection actually means.',
  robots: 'noindex, nofollow',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://omenora.com/compatibility-quiz' }],
})

const {
  $trackCompatibilityQuizStart,
  $trackQuestionAnswered,
  $trackInitiateCheckout,
} = useNuxtApp()

onMounted(() => {
  $trackCompatibilityQuizStart?.()
})

// ── Background phase map ───────────────────────────────────────────────────────
// Four atmospheric images keyed to narrative phases of the 30-step quiz:
//   Phase A  steps  1–8   emotional context (user)
//   Phase B  steps  9–14  birth data capture (user)
//   Phase C  steps 15–21  partner data capture
//   Phase D  steps 22–30  email + resolution

const PHASE_IMAGES: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: '/images/hero/Distant-horizon-emergence.webp',
  B: '/images/hero/Nebula-void.webp',
  C: '/images/hero/Architectural-cosmic.webp',
  D: '/images/hero/Cosmic-gold-ascension.webp',
}

// ── Local state ───────────────────────────────────────────────────────────────

const currentStepIndex = ref(0)

function getPhase(idx: number): 'A' | 'B' | 'C' | 'D' {
  if (idx <= 7)  return 'A'
  if (idx <= 13) return 'B'
  if (idx <= 20) return 'C'
  return 'D'
}

const bgStyle = computed(() => ({
  '--cq-bg-image': `url('${PHASE_IMAGES[getPhase(currentStepIndex.value)]}')`,
}))
const partnerTime = ref<string | null>(null)
const userTime    = ref<string | null>(null)
const isLoading   = ref(false)
const apiError    = ref(false)
const loadingMessages = [
  'Reading the charts…',
  'Mapping the connection…',
  'Finding what matters…',
  'Almost there…',
]

// ── Current step ──────────────────────────────────────────────────────────────

const step = computed<QuizStep>(() => QUIZ_SCHEMA[currentStepIndex.value]!)

// ── Value accessors (bridge schema → store / local state) ─────────────────────

function getSingleSelectValue(s: SingleSelectStep): string | undefined {
  if (!s.storeKey) return undefined
  return store.compatibilityQuizAnswers[s.storeKey] as string | undefined
}

function getDateValue(s: DateInputStep): string | undefined {
  if (s.storeTarget === 'userDob')    return store.dateOfBirth || undefined
  if (s.storeTarget === 'partnerDob') return store.partnerDob  || undefined
  return undefined
}

function getTimeValue(s: TimeInputStep): string | undefined {
  if (s.storeTarget === 'userTime')    return userTime.value    ?? undefined
  if (s.storeTarget === 'partnerTime') return partnerTime.value ?? undefined
  return undefined
}

function getCityValue(s: CityInputStep): string | undefined {
  if (s.storeTarget === 'userCity')    return store.city        || undefined
  if (s.storeTarget === 'partnerCity') return store.partnerCity || undefined
  return undefined
}

function getCityLat(s: CityInputStep): number | null {
  if (s.storeTarget === 'userCity')    return store.cityLat
  if (s.storeTarget === 'partnerCity') return store.partnerCityLat
  return null
}

function getCityLng(s: CityInputStep): number | null {
  if (s.storeTarget === 'userCity')    return store.cityLng
  if (s.storeTarget === 'partnerCity') return store.partnerCityLng
  return null
}

function getTextValue(s: TextInputStep): string | undefined {
  if (s.storeTarget === 'partnerName') return store.partnerName || undefined
  if (s.storeTarget === 'firstName')   return store.firstName   || undefined
  if (s.storeTarget === 'email')       return store.email       || undefined
  return undefined
}

// ── Write handlers ────────────────────────────────────────────────────────────

function onSingleSelect(s: SingleSelectStep, id: string) {
  if (s.storeKey) {
    store.setCompatibilityQuizAnswer(
      s.storeKey,
      id as CompatibilityQuizAnswers[typeof s.storeKey],
    )
  }
  advance()
}

function onDateUpdate(s: DateInputStep, val: string) {
  if (s.storeTarget === 'userDob') {
    store.setPersonalInfo(store.firstName, val, store.city)
  } else if (s.storeTarget === 'partnerDob') {
    store.setPartnerData({ name: store.partnerName, dob: val, city: store.partnerCity })
  }
}

function onTimeUpdate(s: TimeInputStep, val: string | null) {
  if (s.storeTarget === 'userTime')    userTime.value    = val
  if (s.storeTarget === 'partnerTime') partnerTime.value = val
  if (s.storeTarget === 'userTime' && val !== null) {
    store.timeOfBirth = val
  }
}

function onCityUpdate(s: CityInputStep, payload: { city: string; lat: number | null; lng: number | null }) {
  if (s.storeTarget === 'userCity') {
    store.setPersonalInfo(store.firstName, store.dateOfBirth, payload.city)
    if (payload.lat != null) store.cityLat = payload.lat
    if (payload.lng != null) store.cityLng = payload.lng
  } else if (s.storeTarget === 'partnerCity') {
    store.setPartnerData({ name: store.partnerName, dob: store.partnerDob, city: payload.city })
    if (payload.lat != null) store.partnerCityLat = payload.lat
    if (payload.lng != null) store.partnerCityLng = payload.lng
  }
}

function onTextUpdate(s: TextInputStep, val: string) {
  if (s.storeTarget === 'partnerName') {
    store.setPartnerData({ name: val, dob: store.partnerDob, city: store.partnerCity })
  } else if (s.storeTarget === 'firstName') {
    store.setPersonalInfo(val, store.dateOfBirth, store.city)
  } else if (s.storeTarget === 'email') {
    store.setEmail(val)
  }
}

async function onTextContinue(s: TextInputStep) {
  if (s.storeTarget === 'email') {
    await runApiCall()
  } else {
    advance()
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function advance() {
  const currentStep = QUIZ_SCHEMA[currentStepIndex.value]
  if (currentStep && $trackQuestionAnswered) {
    const stepId = (currentStep as any).id ?? (currentStep as any).storeKey ?? (currentStep as any).storeTarget ?? String(currentStepIndex.value)
    const answer = (currentStep as any).storeKey
      ? String((store.compatibilityQuizAnswers as any)[(currentStep as any).storeKey] ?? 'continue')
      : 'continue'
    ;($trackQuestionAnswered as Function)({ questionId: stepId, answer })
  }

  if (currentStepIndex.value < QUIZ_SCHEMA.length - 1) {
    currentStepIndex.value++
  }
}

function goBack() {
  let idx = currentStepIndex.value - 1
  while (idx > 0 && QUIZ_SCHEMA[idx]!.type === 'reward') {
    idx--
  }
  currentStepIndex.value = Math.max(0, idx)
}

// ── Preview API call ──────────────────────────────────────────────────────────

async function runApiCall() {
  isLoading.value  = true
  apiError.value   = false

  if ($trackInitiateCheckout) {
    ;($trackInitiateCheckout as Function)({
      value: 4.99,
      currency: 'USD',
      content_name: 'Compatibility Reading',
    })
  }

  try {
    const result = await $fetch<{ success: boolean; compatibility: Record<string, unknown> }>(
      '/api/generate-compatibility',
      {
        method: 'POST',
        body: {
          firstName:           store.firstName,
          dateOfBirth:         store.dateOfBirth,
          partnerName:         store.partnerName,
          partnerDob:          store.partnerDob,
          partnerCity:         store.partnerCity,
          language:            'en',
          previewMode:         true,
          quizAnswers:         store.compatibilityQuizAnswers,
          timeOfBirth:         store.timeOfBirth    || undefined,
          partnerTimeOfBirth:  partnerTime.value    || undefined,
          cityLat:             store.cityLat        ?? undefined,
          cityLng:             store.cityLng        ?? undefined,
          partnerCityLat:      store.partnerCityLat ?? undefined,
          partnerCityLng:      store.partnerCityLng ?? undefined,
        },
      },
    )

    isLoading.value = false

    store.setCompatibilityData(result.compatibility)
    router.push('/compatibility?preview=1')
  } catch {
    isLoading.value = false
    apiError.value  = true
  }
}
</script>

<style scoped>
/* ── Page root ──
   Full-bleed atmospheric canvas. position: relative contains the
   absolutely-positioned background layers. Overflow: hidden clips the
   diagonal mask geometry at the viewport edge. */
.cq {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--omn-bg-page);
  color: var(--omn-text-primary);
  overflow: hidden;
}

/* ── Bronze diagonal seam glow (::after) ──
   Identical geometry to SectionHero — warm accent band along the
   168° diagonal. rgba values are structural to the bronze glow. */
.cq::after {
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
   Absolutely positioned, fills the page, masked with 168° diagonal
   so the image fades from transparent upper-left to visible lower-right.
   Image is driven by the --cq-bg-image CSS variable set from bgStyle
   computed. transition on background-image is not supported; instead
   we rely on the step-fade Transition to crossfade the whole step,
   and the image swap is imperceptible at phase boundaries. */
.cq__bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: var(--cq-bg-image);
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
   Two-gradient composite: top-to-bottom vignette for text legibility
   over input fields + diagonal bronze warmth on the seam.
   rgba(18, 18, 20, …) = --omn-bg-page as rgba (partial opacity). */
.cq__bg-overlay {
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
   Identical to home/founding pages. Fixed so it doesn't scroll.
   z-index 200 sits above all content but is pointer-events: none.
   The SVG turbulence filter is inlined via the data-URI. */
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

/* ── Progress bar wrapper ──
   Sits directly in the stacking order above the atmospheric layers
   (z-index 3) and below the glass card (z-index 4). */
.cq__progress {
  position: relative;
  z-index: 3;
}

/* ── Step outer container ──
   Flex column, vertically and horizontally centered within the
   remaining viewport height. Provides editorial gutters.
   z-index 3 brings it above all background layers. */
.cq__step {
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
  .cq__step {
    padding: var(--space-12) var(--space-8) var(--space-16);
  }
}

/* ── Back button row ──
   Sits above the glass card, left-aligned within the card's max-width. */
.cq__back {
  width: 100%;
  max-width: 36rem;
  margin-bottom: var(--space-3);
}

/* ── AppCard quiz overrides ──
   glass variant handles background, backdrop-filter, and border.
   Only override: max-width for editorial column + mobile edge-to-edge. */
.cq__card {
  width: 100%;
  max-width: 36rem;
}
@media (max-width: 767px) {
  .cq__card {
    max-width: 100%;
    border-left: none !important;
    border-right: none !important;
  }
}

/* ── Error state ──
   Centered card matching glass card dimensions. */
.cq__error {
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  position: relative;
  z-index: 3;
}

.cq__error-msg {
  color: var(--omn-text-secondary);
}

/* ── Step transition ──
   Canonical motion tokens match every other section reveal. */
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

/* ── Sticky Continue CTA on mobile ──
   Pins .app-button--primary to the viewport bottom on narrow screens.
   Applied only to non-single_select steps via the --sticky-cta modifier. */
@media (max-width: 767px) {
  .cq__step--sticky-cta :deep(.app-button--primary) {
    position: sticky;
    bottom: env(safe-area-inset-bottom, 0px);
    z-index: 10;
    width: 100%;
    align-self: stretch;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .step-fade-enter-active,
  .step-fade-leave-active { transition: none; }
  .page-grain { animation: none; }
}
</style>
