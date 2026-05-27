<template>
  <div class="cq">
    <!-- Editorial sticky header (sandbox §01 visual pattern) -->
    <AppHeader />

    <!-- Quiz progress bar sits directly under the header — uses bronze
         fill (accent token) so it visually extends the header hairline. -->
    <QuizProgressBar :current="currentStepIndex + 1" :total="QUIZ_SCHEMA.length" />

    <Transition name="step-fade" mode="out-in">
      <div :key="currentStepIndex" class="cq__step" :class="{ 'cq__step--sticky-cta': step.type !== 'single_select' }">

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
          :emoji="step.emoji"
          :headline="step.headline"
          :body="step.body"
          @continue="advance"
        />

      </div>
    </Transition>

    <!-- Back button — hidden on reward screens and step 1 -->
    <div class="cq__nav">
      <AppButton
        v-if="step.type !== 'reward' && currentStepIndex > 0"
        variant="ghost"
        size="sm"
        @click="goBack"
      >
        ← Back
      </AppButton>
    </div>

    <!-- Loading overlay -->
    <Transition name="step-fade">
      <div v-if="isLoading" class="cq__loading">
        <AppHeadline variant="italic" as="p" class="cq__loading-msg">
          {{ loadingMessages[loadingMsgIdx % loadingMessages.length] }}
        </AppHeadline>
      </div>
    </Transition>

    <!-- Error -->
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

// ── Local state ───────────────────────────────────────────────────────────────

const currentStepIndex = ref(0)
const partnerTime = ref<string | null>(null)
const userTime    = ref<string | null>(null)
const isLoading   = ref(false)
const apiError    = ref(false)
const loadingMsgIdx = ref(0)

let loadingInterval: ReturnType<typeof setInterval> | null = null

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
  loadingMsgIdx.value = 0

  if ($trackInitiateCheckout) {
    ;($trackInitiateCheckout as Function)({
      value: 4.99,
      currency: 'USD',
      content_name: 'Compatibility Reading',
    })
  }
  loadingInterval = setInterval(() => {
    loadingMsgIdx.value++
  }, 1200)

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

    if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null }
    isLoading.value = false

    store.setCompatibilityData(result.compatibility)
    router.push('/compatibility?preview=1')
  } catch {
    if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null }
    isLoading.value = false
    apiError.value  = true
  }
}

onBeforeUnmount(() => {
  if (loadingInterval) clearInterval(loadingInterval)
})
</script>

<style scoped>
.cq {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--omn-bg-page);
  color: var(--omn-text-primary);
}

/* Step container — narrow form measure (32rem ≈ 512px). Editorial bg,
   centered, with --space-* tokens for rhythm. */
.cq__step {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 32rem;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
}
@media (min-width: 768px) {
  .cq__step { padding: var(--space-16) var(--space-8); }
}

.cq__nav {
  max-width: 32rem;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6) var(--space-8);
}

.cq__loading {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--omn-bg-page);
  z-index: 50;
}

.cq__loading-msg {
  text-align: center;
  padding: var(--space-6);
  color: var(--omn-text-primary);
}

.cq__error {
  max-width: 32rem;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.cq__error-msg {
  color: var(--omn-text-secondary);
}

/* Step transition — uses canonical motion tokens so the timing
   matches every other section reveal in the design system. */
.step-fade-enter-active,
.step-fade-leave-active {
  transition:
    opacity var(--omn-duration-base) var(--omn-ease),
    transform var(--omn-duration-base) var(--omn-ease);
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .step-fade-enter-active,
  .step-fade-leave-active { transition: none; }
}

/* Sticky Continue CTA on mobile — pins the primary action button to the
   viewport bottom so it remains reachable without scrolling. Applied to
   all step types that render a Continue button (not single_select,
   which auto-advances on tap with no Continue button needed). */
@media (max-width: 767px) {
  .cq__step--sticky-cta :deep(.app-button--primary) {
    position: sticky;
    bottom: 0;
    bottom: env(safe-area-inset-bottom, 0px);
    z-index: 10;
    width: 100%;
    align-self: stretch;
  }
}
</style>
