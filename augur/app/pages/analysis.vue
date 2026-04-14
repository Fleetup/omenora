<template>
  <div class="page">
    <!-- Top bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="brand">OMENORA</span>
      <span class="step-indicator">{{ currentStep }} of 2</span>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress-segment" :class="{ active: currentStep >= 1 }" />
      <div class="progress-segment" :class="{ active: currentStep >= 2 }" />
    </div>

    <!-- Step 1: Personal Info -->
    <template v-if="currentStep === 1">
      <h1 class="heading">{{ t('tellUs') }}</h1>
      <p class="subheading">{{ t('takesSeconds') }}</p>

      <div
        class="field-wrapper"
        :class="{ focused: focusedField === 'firstName' }"
      >
        <div class="field-label">{{ t('firstName') }}</div>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          name="firstName"
          autocomplete="given-name"
          :placeholder="t('firstNamePlaceholder')"
          class="field-input"
          @focus="focusedField = 'firstName'"
          @blur="focusedField = null"
        >
      </div>

      <div class="date-group">
        <div class="field-label">{{ t('dateOfBirth') }}</div>
        <div class="wheel-row">
          <!-- Day wheel -->
          <div class="wheel-col">
            <div class="wheel-label">DD</div>
            <div class="wheel-drum" ref="dayWheelRef">
              <div class="wheel-pad" />
              <div
                v-for="d in dayOptions"
                :key="d"
                class="wheel-item"
                :class="{ selected: birthDay === d }"
              >{{ d }}</div>
              <div class="wheel-pad" />
            </div>
          </div>
          <!-- Month wheel -->
          <div class="wheel-col">
            <div class="wheel-label">MM</div>
            <div class="wheel-drum" ref="monthWheelRef">
              <div class="wheel-pad" />
              <div
                v-for="m in monthOptions"
                :key="m"
                class="wheel-item"
                :class="{ selected: birthMonth === m }"
              >{{ m }}</div>
              <div class="wheel-pad" />
            </div>
          </div>
          <!-- Year wheel -->
          <div class="wheel-col wheel-col--wide">
            <div class="wheel-label">YYYY</div>
            <div class="wheel-drum" ref="yearWheelRef">
              <div class="wheel-pad" />
              <div
                v-for="y in yearOptions"
                :key="y"
                class="wheel-item"
                :class="{ selected: birthYear === y }"
              >{{ y }}</div>
              <div class="wheel-pad" />
            </div>
          </div>
        </div>
        <!-- Hidden inputs for autofill -->
        <input id="bday-day" name="bday-day" type="hidden" autocomplete="bday-day" :value="birthDay">
        <input id="bday-month" name="bday-month" type="hidden" autocomplete="bday-month" :value="birthMonth">
        <input id="bday-year" name="bday-year" type="hidden" autocomplete="bday-year" :value="birthYear">
      </div>

      <div
        class="field-wrapper"
        :class="{ focused: focusedField === 'city' }"
      >
        <div class="field-label">{{ t('cityCountry') }}</div>
        <input
          id="city"
          v-model="city"
          type="text"
          name="city"
          autocomplete="address-level2"
          :placeholder="t('cityPlaceholder')"
          class="field-input"
          @focus="focusedField = 'city'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Time of Birth -->
      <div class="time-group">
        <div class="field-header-row">
          <div class="field-label">{{ t('timeOfBirth') }}</div>
          <span class="field-optional-badge">{{ t('timeOptional') }}</span>
        </div>
        <div class="wheel-row">
          <!-- Hour wheel -->
          <div class="wheel-col">
            <div class="wheel-label">Hour</div>
            <div class="wheel-drum" ref="hourWheelRef">
              <div class="wheel-pad" />
              <div
                v-for="h in hourOptions"
                :key="h"
                class="wheel-item"
                :class="{ selected: birthHour === h }"
              >{{ h }}</div>
              <div class="wheel-pad" />
            </div>
          </div>
          <!-- Minute wheel -->
          <div class="wheel-col">
            <div class="wheel-label">Min</div>
            <div class="wheel-drum" ref="minuteWheelRef">
              <div class="wheel-pad" />
              <div
                v-for="m in minuteOptions"
                :key="m"
                class="wheel-item"
                :class="{ selected: birthMinute === m }"
              >{{ m }}</div>
              <div class="wheel-pad" />
            </div>
          </div>
          <!-- AM/PM wheel -->
          <div class="wheel-col">
            <div class="wheel-label">AM/PM</div>
            <div class="wheel-drum" ref="ampmWheelRef">
              <div class="wheel-pad" />
              <div class="wheel-item" :class="{ selected: birthAmPm === 'AM' }">AM</div>
              <div class="wheel-item" :class="{ selected: birthAmPm === 'PM' }">PM</div>
              <div class="wheel-pad" />
            </div>
          </div>
        </div>
        <div v-if="timeOfBirth" class="birth-unlock-row">
          <span class="birth-unlock-icon">✦</span>
          <span class="birth-unlock-text">{{ t('birthChartUnlocked') }}</span>
        </div>
      </div>

      <div class="region-section">
        <p class="region-label">{{ t('readingTradition') }}</p>
        <div class="region-options">
          <button
            v-for="opt in regionOptions"
            :key="opt.value"
            class="region-btn"
            :class="{ active: store.region === opt.value }"
            @click="selectRegion(opt.value)"
          >{{ opt.label }}</button>
        </div>
      </div>

      <div style="margin-top: 16px; text-align: center;">
        <p style="font-size: 11px; color: rgba(255,255,255,0.2); margin-bottom: 10px; letter-spacing: 0.06em;">{{ t('language') }}</p>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <button
            v-for="lang in LANGUAGES"
            :key="lang.code"
            :style="{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              border: store.language === lang.code
                ? '1px solid rgba(140,110,255,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              background: store.language === lang.code
                ? 'rgba(140,110,255,0.15)'
                : 'transparent',
              color: store.language === lang.code
                ? 'rgba(200,180,255,0.9)'
                : 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }"
            @click="selectLanguage(lang.code)"
          >
            <span>{{ lang.flag }}</span>
            <span>{{ lang.label }}</span>
          </button>
        </div>
      </div>

      <button
        class="cta-button"
        :class="{ disabled: !step1Valid }"
        :disabled="!step1Valid"
        @click="continueToStep2"
      >
        {{ t('continueBtn') }}
      </button>
    </template>

    <!-- Step 2: Seven Questions -->
    <template v-else>
      <h1 class="heading">{{ t('fiveQuestions') }}</h1>
      <p class="subheading">{{ t('tapAnswer') }}</p>

      <div v-for="(question, index) in questions" :key="question.id" class="question-block">
        <div class="question-header">
          <span class="question-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <p class="question-text">{{ question.text }}</p>
        </div>
        <div class="options-row">
          <button
            v-for="option in question.options"
            :key="option.value"
            class="option-tile"
            :class="{
              selected:
                store.answers[question.id as keyof typeof store.answers] ===
                option.value,
            }"
            @click="store.setAnswer(question.id, option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <div v-if="index < questions.length - 1" class="divider" />
      </div>

      <button
        class="cta-button submit-btn"
        :class="{ disabled: !allAnswered }"
        :disabled="!allAnswered"
        @click="submitAnalysis"
      >
        {{ t('revealDestiny') }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { calculateLifePathNumber } from '~/utils/lifePathNumber'
import { assignArchetype } from '~/utils/archetypes'
import { LANGUAGES } from '~/utils/translations'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Your Free AI Destiny Analysis', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { t } = useLanguage()
const currentStep = ref(1)
const focusedField = ref<string | null>(null)

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

// ── Wheel options ─────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const ITEM_H = 44 // px — must match .wheel-item height in CSS

const dayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const yearOptions = Array.from({ length: currentYear - 1939 }, (_, i) => String(currentYear - i))
const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

// ── Wheel selected values ─────────────────────────────────────────────────────
const birthDay = ref<string>('')
const birthMonth = ref<string>('')
const birthYear = ref<string>('')
const birthHour = ref<string>('')
const birthMinute = ref<string>('')
const birthAmPm = ref<'AM' | 'PM'>('AM')

// ── Wheel refs ────────────────────────────────────────────────────────────────
const dayWheelRef = ref<HTMLElement>()
const monthWheelRef = ref<HTMLElement>()
const yearWheelRef = ref<HTMLElement>()
const hourWheelRef = ref<HTMLElement>()
const minuteWheelRef = ref<HTMLElement>()
const ampmWheelRef = ref<HTMLElement>()

// ── Scroll → value mapping ────────────────────────────────────────────────────
// scrollend fires exactly once when ALL momentum has settled (Chrome 114+, Firefox 109+,
// Safari 26.2+). For older iOS Safari we fall back to a 200ms debounced scroll listener.
// During the actual scroll motion, zero JS runs — the browser compositor owns the thread.
const scrollFallbackTimers: Record<string, ReturnType<typeof setTimeout>> = {}
const wheelListenerCleanups: Array<() => void> = []

function readAndApply(type: string, el: HTMLElement) {
  requestAnimationFrame(() => {
    const idx = Math.round(el.scrollTop / ITEM_H)
    applyWheelValue(type, idx)
    delete el.dataset.scrolling
  })
}

function attachWheelListener(type: string, elArg: HTMLElement) {
  // Capture into a plain typed local to prevent TypeScript's 'in' narrowing
  // from incorrectly widening the type to 'never' in the else branch.
  const el: HTMLElement = elArg
  const supportsScrollEnd = 'onscrollend' in window

  if (supportsScrollEnd) {
    const handler = () => readAndApply(type, el)
    el.addEventListener('scrollend', handler, { passive: true })
    wheelListenerCleanups.push(() => el.removeEventListener('scrollend', handler))
  } else {
    // Fallback: debounced scroll listener for older iOS Safari (< 26.2)
    const handler = () => {
      if (!el.dataset.scrolling) el.dataset.scrolling = '1'
      clearTimeout(scrollFallbackTimers[type])
      scrollFallbackTimers[type] = setTimeout(() => readAndApply(type, el), 200)
    }
    el.addEventListener('scroll', handler, { passive: true })
    wheelListenerCleanups.push(() => {
      el.removeEventListener('scroll', handler)
      clearTimeout(scrollFallbackTimers[type])
    })
  }
}

function applyWheelValue(type: string, idx: number) {
  if (type === 'day') birthDay.value = dayOptions[Math.max(0, Math.min(idx, dayOptions.length - 1))] ?? ''
  else if (type === 'month') birthMonth.value = monthOptions[Math.max(0, Math.min(idx, monthOptions.length - 1))] ?? ''
  else if (type === 'year') birthYear.value = yearOptions[Math.max(0, Math.min(idx, yearOptions.length - 1))] ?? ''
  else if (type === 'hour') birthHour.value = hourOptions[Math.max(0, Math.min(idx, hourOptions.length - 1))] ?? ''
  else if (type === 'minute') birthMinute.value = minuteOptions[Math.max(0, Math.min(idx, minuteOptions.length - 1))] ?? ''
  else if (type === 'ampm') birthAmPm.value = idx === 0 ? 'AM' : 'PM'
}

function scrollWheelToIndex(el: HTMLElement | undefined, idx: number) {
  if (!el) return
  el.scrollTop = idx * ITEM_H
}

onUnmounted(() => {
  wheelListenerCleanups.forEach(fn => fn())
})

// ── Initialise wheels to sensible defaults on mount ───────────────────────────
onMounted(() => {
  nextTick(() => {
    // Default: day=01, month=01, year=1990, hour=12, minute=00, ampm=AM
    const defaultDayIdx = 0
    const defaultMonthIdx = 0
    const defaultYearIdx = yearOptions.indexOf('1990') >= 0 ? yearOptions.indexOf('1990') : 0
    birthDay.value = dayOptions[defaultDayIdx]!
    birthMonth.value = monthOptions[defaultMonthIdx]!
    birthYear.value = yearOptions[defaultYearIdx]!
    scrollWheelToIndex(dayWheelRef.value, defaultDayIdx)
    scrollWheelToIndex(monthWheelRef.value, defaultMonthIdx)
    scrollWheelToIndex(yearWheelRef.value, defaultYearIdx)
    // Time wheels default empty (optional field) — scroll to 0
    scrollWheelToIndex(hourWheelRef.value, 0)
    scrollWheelToIndex(minuteWheelRef.value, 0)
    scrollWheelToIndex(ampmWheelRef.value, 0)

    // Attach scroll-end listeners AFTER initial positions are set so the
    // programmatic scrollTop assignment above does not fire value reads.
    if (dayWheelRef.value) attachWheelListener('day', dayWheelRef.value)
    if (monthWheelRef.value) attachWheelListener('month', monthWheelRef.value)
    if (yearWheelRef.value) attachWheelListener('year', yearWheelRef.value)
    if (hourWheelRef.value) attachWheelListener('hour', hourWheelRef.value)
    if (minuteWheelRef.value) attachWheelListener('minute', minuteWheelRef.value)
    if (ampmWheelRef.value) attachWheelListener('ampm', ampmWheelRef.value)
  })
})

// ── Derived values → store ────────────────────────────────────────────────────
const computedDateOfBirth = computed(() => {
  if (!birthDay.value || !birthMonth.value || !birthYear.value) return ''
  return `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
})

watch(computedDateOfBirth, (val) => {
  if (val) store.dateOfBirth = val
})

const timeOfBirth = computed(() => {
  if (!birthHour.value || !birthMinute.value) return ''
  return `${birthHour.value}:${birthMinute.value} ${birthAmPm.value}`
})

watch(timeOfBirth, (val) => {
  store.timeOfBirth = val
})

const step1Valid = computed(
  () => !!store.firstName && !!computedDateOfBirth.value && !!store.city,
)

const questions = computed(() => [
  {
    id: 'q1',
    text: t('q1Text'),
    options: [
      { label: t('q1opt1'), value: 'trust' },
      { label: t('q1opt2'), value: 'wait' },
      { label: t('q1opt3'), value: 'talk' },
      { label: t('q1opt4'), value: 'push' },
    ],
  },
  {
    id: 'q2',
    text: t('q2Text'),
    options: [
      { label: t('q2opt1'), value: 'softer' },
      { label: t('q2opt2'), value: 'sharper' },
      { label: t('q2opt3'), value: 'ambitious' },
      { label: t('q2opt4'), value: 'lost' },
    ],
  },
  {
    id: 'q3',
    text: t('q3Text'),
    options: [
      { label: t('q3opt1'), value: 'leaving' },
      { label: t('q3opt2'), value: 'unseen' },
      { label: t('q3opt3'), value: 'giving' },
      { label: t('q3opt4'), value: 'burden' },
    ],
  },
  {
    id: 'q4',
    text: t('q4Text'),
    options: [
      { label: t('q4opt1'), value: 'capable' },
      { label: t('q4opt2'), value: 'alone' },
      { label: t('q4opt3'), value: 'matters' },
      { label: t('q4opt4'), value: 'toomuch' },
    ],
  },
  {
    id: 'q5',
    text: t('q5Text'),
    options: [
      { label: t('q5opt1'), value: 'strong' },
      { label: t('q5opt2'), value: 'reliable' },
      { label: t('q5opt3'), value: 'intense' },
      { label: t('q5opt4'), value: 'independent' },
    ],
  },
  {
    id: 'q6',
    text: t('q6Text'),
    options: [
      { label: t('q6opt1'), value: 'enjoy' },
      { label: t('q6opt2'), value: 'wonder' },
      { label: t('q6opt3'), value: 'share' },
      { label: t('q6opt4'), value: 'next' },
    ],
  },
  {
    id: 'q7',
    text: t('q7Text'),
    options: [
      { label: t('q7opt1'), value: 'givesup' },
      { label: t('q7opt2'), value: 'feelsnothing' },
      { label: t('q7opt3'), value: 'needstoo' },
      { label: t('q7opt4'), value: 'pushesaway' },
    ],
  },
])

const allAnswered = computed(() =>
  questions.value.every(
    (q) => !!store.answers[q.id as keyof typeof store.answers],
  ),
)

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    navigateTo('/')
  }
}

function continueToStep2() {
  if (step1Valid.value) {
    currentStep.value = 2
  }
}

const regionOptions = [
  { value: 'western', label: 'Western' },
  { value: 'india', label: 'Vedic' },
  { value: 'china', label: 'Chinese' },
  { value: 'latam', label: 'Tarot' },
]

function selectRegion(value: string) {
  store.setRegionOverride(value)
}

function submitAnalysis() {
  if (allAnswered.value) {
    const lpn = calculateLifePathNumber(store.dateOfBirth)
    const archetype = assignArchetype(store.answers)
    store.setLifePathNumber(lpn)
    store.setArchetype(archetype)
    navigateTo('/preview')
  }
}
</script>

<style scoped>
/* ── Page ── */
.page {
  background: #050410;
  min-height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 52px;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
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
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.back-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.brand {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.22);
}

.step-indicator {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
}

/* ── Progress bar ── */
.progress-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 36px;
}

.progress-segment {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.4s ease;
}

.progress-segment.active {
  background: rgba(201, 168, 76, 0.55);
}

/* ── Headings ── */
.heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 6px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.subheading {
  font-size: 13px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0 32px;
}

/* ── Text input fields ── */
.field-wrapper {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: border-color 0.25s, background 0.25s;
}

.field-wrapper.focused {
  border-color: rgba(201, 168, 76, 0.4);
  background: rgba(201, 168, 76, 0.025);
}

.field-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.22);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 4px;
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

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.18);
}

/* ── Date group ── */
.date-group {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.date-group .field-label {
  margin-bottom: 12px;
}

/* ── Time group ── */
.time-group {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.field-optional-badge {
  font-size: 10px;
  color: rgba(140, 110, 255, 0.52);
  letter-spacing: 0.02em;
}

/* ── Scroll-wheel drum picker ── */
.wheel-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.wheel-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.wheel-col--wide {
  flex: 1.6;
}

.wheel-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.22);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.wheel-drum {
  width: 100%;
  height: 132px; /* 3 visible items × 44px */
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
  scrollbar-width: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  position: relative;
  touch-action: pan-y;
  will-change: scroll-position;
  /* Fade mask top/bottom for depth illusion */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.4) 20%,
    rgba(0,0,0,1) 35%,
    rgba(0,0,0,1) 65%,
    rgba(0,0,0,0.4) 80%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.4) 20%,
    rgba(0,0,0,1) 65%,
    rgba(0,0,0,0.4) 80%,
    transparent 100%
  );
}

.wheel-drum::-webkit-scrollbar {
  display: none;
}

.wheel-pad {
  height: 44px; /* one item height — keeps first/last item centerable */
  flex-shrink: 0;
}

.wheel-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.28);
  cursor: pointer;
  user-select: none;
  transition: color 0.18s ease, background 0.18s ease;
  border-radius: 4px;
  letter-spacing: 0.04em;
  contain: layout style;
}

.wheel-drum[data-scrolling] .wheel-item {
  transition: none;
}

.wheel-item.selected {
  color: rgba(201, 168, 76, 0.95);
  background: rgba(201, 168, 76, 0.07);
}

/* ── Birth unlock indicator ── */
.birth-unlock-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.birth-unlock-icon {
  font-size: 10px;
  color: rgba(140, 110, 255, 0.65);
}

.birth-unlock-text {
  font-size: 11px;
  color: rgba(140, 110, 255, 0.65);
  letter-spacing: 0.02em;
}

/* ── Region selector ── */
.region-section {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.region-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 12px;
}

.region-options {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.region-btn {
  padding: 7px 16px;
  border-radius: 3px;
  font-size: 11px;
  letter-spacing: 0.07em;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: rgba(255, 255, 255, 0.25);
  font-family: inherit;
  transition: all 0.2s;
}

.region-btn.active {
  border-color: rgba(201, 168, 76, 0.42);
  background: rgba(201, 168, 76, 0.07);
  color: rgba(201, 168, 76, 0.88);
}

.region-btn:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.45);
}

/* ── CTA continue button ── */
.cta-button {
  background: transparent;
  border: 1px solid rgba(201, 168, 76, 0.32);
  border-radius: 3px;
  padding: 16px;
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 28px;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(140,110,255,0.04));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-button:hover:not(.disabled)::before {
  opacity: 1;
}

.cta-button:hover:not(.disabled) {
  border-color: rgba(201, 168, 76, 0.58);
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.08);
}

.cta-button.disabled {
  opacity: 0.22;
  cursor: default;
}

/* ── Submit / reveal button (step 2) ── */
.submit-btn {
  margin-top: 40px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid rgba(201, 168, 76, 0.45);
  color: rgba(201, 168, 76, 0.92);
  letter-spacing: 0.12em;
  font-size: 12px;
}

.submit-btn:hover:not(.disabled) {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.7);
  color: rgba(201, 168, 76, 1);
  box-shadow: 0 0 24px rgba(201, 168, 76, 0.1);
}

/* ── Question blocks ── */
.question-block {
  margin-bottom: 4px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.question-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 300;
  color: rgba(201, 168, 76, 0.4);
  line-height: 1.2;
  flex-shrink: 0;
  margin-top: 0;
  letter-spacing: 0.02em;
  min-width: 28px;
}

.question-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
  line-height: 1.5;
  font-weight: 300;
  padding-top: 2px;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Oracle tiles (Step 2 options) ── */
.option-tile {
  flex: 1 0 calc(50% - 4px);
  min-height: 52px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 13px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  line-height: 1.35;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
}

.option-tile:hover {
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.04);
}

.option-tile.selected {
  background: rgba(201, 168, 76, 0.08);
  border-color: rgba(201, 168, 76, 0.42);
  color: rgba(201, 168, 76, 0.9);
}

/* ── Question divider ── */
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0.06) 70%, transparent);
  margin: 24px 0;
}
</style>
