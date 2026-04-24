<template>
  <div class="page">
    <!-- Top bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="brand">OMENORA</span>
      <span class="step-indicator">{{ currentStep }} of 7</span>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: (currentStep / 7 * 100) + '%' }" />
    </div>

    <!-- Screen 1: First Name -->
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

      <button
        class="cta-button"
        :class="{ disabled: !store.firstName }"
        :disabled="!store.firstName"
        @click="advanceStep"
      >
        {{ t('continueBtn') }}
      </button>
    </template>

    <!-- Screen 2: Date of Birth -->
    <template v-else-if="currentStep === 2">
      <h1 class="heading">{{ t('dateOfBirth') }}</h1>
      <p class="subheading">{{ t('takesSeconds') }}</p>

      <div class="date-group">
        <div class="field-label">{{ t('dateOfBirth') }}</div>
        <div class="wheel-row">
          <!-- Day wheel -->
          <div class="wheel-col">
            <div class="wheel-label">DD</div>
            <div class="wheel-drum" ref="dayWheelRef">
              <div class="wheel-track">
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
          </div>
          <!-- Month wheel -->
          <div class="wheel-col">
            <div class="wheel-label">MM</div>
            <div class="wheel-drum" ref="monthWheelRef">
              <div class="wheel-track">
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
          </div>
          <!-- Year wheel -->
          <div class="wheel-col wheel-col--wide">
            <div class="wheel-label">YYYY</div>
            <div class="wheel-drum" ref="yearWheelRef">
              <div class="wheel-track">
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
        </div>
        <!-- Hidden inputs for autofill -->
        <input id="bday-day" name="bday-day" type="hidden" autocomplete="bday-day" :value="birthDay">
        <input id="bday-month" name="bday-month" type="hidden" autocomplete="bday-month" :value="birthMonth">
        <input id="bday-year" name="bday-year" type="hidden" autocomplete="bday-year" :value="birthYear">
      </div>

      <button
        class="cta-button"
        :class="{ disabled: !dateStep2Valid }"
        :disabled="!dateStep2Valid"
        @click="advanceStep"
      >
        {{ t('continueBtn') }}
      </button>
    </template>

    <!-- Screen 3: City -->
    <template v-else-if="currentStep === 3">
      <h1 class="heading">{{ t('cityCountry') }}</h1>
      <p class="subheading">{{ t('takesSeconds') }}</p>

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

      <button
        class="cta-button"
        :class="{ disabled: !store.city }"
        :disabled="!store.city"
        @click="advanceFromCity"
      >
        {{ t('continueBtn') }}
      </button>
    </template>

    <!-- Screen 4: Birth Time (optional) -->
    <template v-else-if="currentStep === 4">
      <h1 class="heading">Do you know your birth time?</h1>
      <p class="subheading">Birth time improves your Rising sign accuracy.</p>

      <div class="time-choice-row">
        <button
          class="option-tile"
          :class="{ selected: timeKnown === true }"
          @click="timeKnown = true"
        >
          Yes, I know it
        </button>
        <button
          class="option-tile"
          :class="{ selected: timeKnown === false }"
          @click="skipBirthTime"
        >
          Skip for now
        </button>
      </div>

      <template v-if="timeKnown === true">
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
                <div class="wheel-track">
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
            </div>
            <!-- Minute wheel -->
            <div class="wheel-col">
              <div class="wheel-label">Min</div>
              <div class="wheel-drum" ref="minuteWheelRef">
                <div class="wheel-track">
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
            </div>
            <!-- AM/PM wheel -->
            <div class="wheel-col">
              <div class="wheel-label">AM/PM</div>
              <div class="wheel-drum" ref="ampmWheelRef">
                <div class="wheel-track">
                  <div class="wheel-pad" />
                  <div class="wheel-item" :class="{ selected: birthAmPm === 'AM' }">AM</div>
                  <div class="wheel-item" :class="{ selected: birthAmPm === 'PM' }">PM</div>
                  <div class="wheel-pad" />
                </div>
              </div>
            </div>
          </div>
          <div v-if="timeOfBirth" class="birth-unlock-row">
            <span class="birth-unlock-icon">✦</span>
            <span class="birth-unlock-text">{{ t('birthChartUnlocked') }}</span>
          </div>
          <p class="time-hint">Without a birth time, Rising sign and house positions won't be available — the reading still works, with less precision.</p>
        </div>

        <button
          class="cta-button"
          @click="advanceStep"
        >
          {{ t('continueBtn') }}
        </button>
      </template>
    </template>

    <!-- Screen 5: Question p1 -->
    <template v-else-if="currentStep === 5">
      <h1 class="heading">{{ t('fiveQuestions') }}</h1>
      <p class="subheading">{{ t('tapAnswer') }}</p>

      <div class="question-block">
        <div class="question-header">
          <span class="question-number">01</span>
          <p class="question-text">{{ questions[0]!.text }}</p>
        </div>
        <div class="options-row">
          <button
            v-for="option in questions[0]!.options"
            :key="option.value"
            class="option-tile"
            :class="{ selected: (store.answers as Record<string, string>)['p1'] === option.value }"
            @click="selectAndAdvance('p1', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- Screen 6: Question p2 -->
    <template v-else-if="currentStep === 6">
      <h1 class="heading">{{ t('fiveQuestions') }}</h1>
      <p class="subheading">{{ t('tapAnswer') }}</p>

      <div class="question-block">
        <div class="question-header">
          <span class="question-number">02</span>
          <p class="question-text">{{ questions[1]!.text }}</p>
        </div>
        <div class="options-row">
          <button
            v-for="option in questions[1]!.options"
            :key="option.value"
            class="option-tile"
            :class="{ selected: (store.answers as Record<string, string>)['p2'] === option.value }"
            @click="selectAndAdvance('p2', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- Screen 7: Question p3 -->
    <template v-else-if="currentStep === 7">
      <h1 class="heading">{{ t('fiveQuestions') }}</h1>
      <p class="subheading">{{ t('tapAnswer') }}</p>

      <div class="question-block">
        <div class="question-header">
          <span class="question-number">03</span>
          <p class="question-text">{{ questions[2]!.text }}</p>
        </div>
        <div class="options-row">
          <button
            v-for="option in questions[2]!.options"
            :key="option.value"
            class="option-tile"
            :class="{ selected: (store.answers as Record<string, string>)['p3'] === option.value }"
            @click="handleAnswerSelect('p3', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

      <button
        v-if="(store.answers as Record<string, string>)['p3']"
        class="cta-button submit-btn"
        :class="{ disabled: isCalculating }"
        :disabled="isCalculating"
        @click="handleSubmit"
      >
        {{ isCalculating ? 'Calculating…' : t('revealDestiny') }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useAnalysisStore, type NatalChart } from '~/stores/analysisStore'
import { LANGUAGES } from '~/utils/translations'
import { useLanguage } from '~/composables/useLanguage'

const { $trackStep1Complete, $trackQuestionAnswered, $trackAnalysisSubmit } = useNuxtApp() as any

useSeoMeta({ title: 'Your Free Personality & Astrology Reading', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { t } = useLanguage()
const currentStep = ref(1)
const focusedField = ref<string | null>(null)
const isCalculating = ref(false)
const submitError   = ref<string | null>(null)
const timeKnown     = ref<boolean | null>(null)

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
const yearOptions = Array.from({ length: currentYear - 1923 }, (_, i) => String(currentYear - 1 - i))
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

// ── Enterprise-grade Apple-style wheel engine ─────────────────────────────────
// Architecture:
//   • Position is driven by CSS transform:translateY on the inner .wheel-track.
//     This runs on the GPU compositor thread — zero layout/paint during drag.
//   • pointermove/pointerup are registered on `document` so fast drags that
//     leave the drum element still track correctly.
//   • Momentum uses a real timestamp delta (dt) each rAF frame — no assumed 16ms.
//   • Deceleration constant matches Apple's UIScrollView: ~0.998 per ms.
//   • Click-to-select: if total pointer travel < 5 px treat as tap and compute
//     the tapped item index from the drum-relative Y position.
//   • WheelEvent (trackpad/mouse wheel) steps one item per discrete event and
//     debounces snap so rapid scrolling feels continuous.

const wheelListenerCleanups: Array<() => void> = []


function getOptionsLength(type: string): number {
  if (type === 'day') return dayOptions.length
  if (type === 'month') return monthOptions.length
  if (type === 'year') return yearOptions.length
  if (type === 'hour') return hourOptions.length
  if (type === 'minute') return minuteOptions.length
  if (type === 'ampm') return 2
  return 1
}

function applyWheelValue(type: string, idx: number) {
  const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max))
  if (type === 'day')    birthDay.value    = dayOptions[clamp(idx, dayOptions.length - 1)]!
  else if (type === 'month')  birthMonth.value  = monthOptions[clamp(idx, monthOptions.length - 1)]!
  else if (type === 'year')   birthYear.value   = yearOptions[clamp(idx, yearOptions.length - 1)]!
  else if (type === 'hour')   birthHour.value   = hourOptions[clamp(idx, hourOptions.length - 1)]!
  else if (type === 'minute') birthMinute.value = minuteOptions[clamp(idx, minuteOptions.length - 1)]!
  else if (type === 'ampm')   birthAmPm.value   = idx === 0 ? 'AM' : 'PM'
}

// Translate the inner track element. offset is how many px from the top
// the first real item (index 0) sits — starts at 0, negative = scrolled down.
// We store position as a positive "scroll offset" (like scrollTop) internally.

function getTrack(drum: HTMLElement): HTMLElement {
  return drum.firstElementChild as HTMLElement
}

function setTrackY(track: HTMLElement, offset: number) {
  track.style.transform = `translateY(${-offset}px)`
}

// Smooth animate from current position to target using ease-out-quart.
// Cancels any in-flight animation via the returned cancel function.
function animateTo(
  track: HTMLElement,
  fromOffset: number,
  toOffset: number,
  duration: number,
  onDone?: () => void,
): () => void {
  let rafId = 0
  const startTime = performance.now()
  const delta = toOffset - fromOffset

  if (Math.abs(delta) < 0.5) {
    setTrackY(track, toOffset)
    onDone?.()
    return () => {}
  }

  function step(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    // Ease-out quart — very close to Apple's UIScrollView snap curve
    const ease = 1 - Math.pow(1 - t, 4)
    setTrackY(track, fromOffset + delta * ease)
    if (t < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      setTrackY(track, toOffset)
      onDone?.()
    }
  }
  rafId = requestAnimationFrame(step)
  return () => { if (rafId) cancelAnimationFrame(rafId) }
}

function attachWheelListener(type: string, drum: HTMLElement) {
  const track = getTrack(drum)
  const maxIdx = getOptionsLength(type) - 1
  const maxOffset = maxIdx * ITEM_H

  // ── Per-drum state ─────────────────────────────────────────────────────────
  let offset = 0           // current logical scroll offset in px (positive = scrolled down)
  let isDragging = false
  let startClientY = 0
  let lastClientY = 0
  let lastTime = 0
  let velocity = 0         // px/ms  (positive = scrolling down)
  let cancelAnim = () => {}
  let rafId = 0

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clampOffset = (v: number) => Math.max(0, Math.min(v, maxOffset))

  function snapTo(idx: number, fast = false) {
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    const targetIdx = Math.max(0, Math.min(Math.round(idx), maxIdx))
    const targetOffset = targetIdx * ITEM_H
    const dist = Math.abs(targetOffset - offset)
    // Duration scales with distance but is capped — feels snappy, not slow
    const duration = fast ? 120 : Math.min(60 + dist * 0.4, 320)
    cancelAnim = animateTo(track, offset, targetOffset, duration, () => {
      offset = targetOffset
      applyWheelValue(type, targetIdx)
    })
    // Optimistically update reactive value immediately for responsive UI
    applyWheelValue(type, targetIdx)
  }

  function snapToNearest() {
    snapTo(offset / ITEM_H)
  }

  // ── Momentum loop ──────────────────────────────────────────────────────────
  // Uses real dt each frame. Deceleration: Apple UIScrollView ≈ 0.998^ms
  // which for 60fps frames (≈16.67ms) gives ~0.967 per frame.
  const DECEL = 0.998  // per ms — change to 0.995 for snappier stop
  const MIN_V = 0.02   // px/ms — stop threshold

  let lastRafTime = 0
  function runMomentum(now: number) {
    const dt = now - lastRafTime
    lastRafTime = now
    velocity *= Math.pow(DECEL, dt)
    offset = clampOffset(offset + velocity * dt)
    setTrackY(track, offset)

    if (Math.abs(velocity) > MIN_V) {
      rafId = requestAnimationFrame(runMomentum)
    } else {
      rafId = 0
      velocity = 0
      snapToNearest()
    }
  }

  // ── Pointer down — on drum ─────────────────────────────────────────────────
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    isDragging = true
    startClientY = e.clientY
    lastClientY = e.clientY
    lastTime = performance.now()
    velocity = 0
    e.preventDefault()
    // Track globally so fast drags outside the drum still register
    document.addEventListener('pointermove', onPointerMove, { passive: false })
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
  }

  // ── Pointer move — on document ─────────────────────────────────────────────
  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return
    const now = performance.now()
    const dt = Math.max(now - lastTime, 1)
    const dy = lastClientY - e.clientY  // positive = user dragging up = scroll down
    // Exponential moving average on velocity for smoother momentum tracking
    const instantV = dy / dt
    velocity = velocity * 0.6 + instantV * 0.4
    offset = clampOffset(offset + dy)
    setTrackY(track, offset)
    lastClientY = e.clientY
    lastTime = now
  }

  // ── Pointer up — on document ───────────────────────────────────────────────
  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return
    isDragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)

    const totalTravel = Math.abs(e.clientY - startClientY)

    // ── Click-to-select: travel < 5px = tap ───────────────────────────────
    if (totalTravel < 5) {
      const drumRect = drum.getBoundingClientRect()
      const tapY = e.clientY - drumRect.top  // Y within the drum viewport
      // Center of drum is the selected slot (ITEM_H per slot, pad = ITEM_H)
      const drumCenter = drumRect.height / 2
      const relativeSlot = (tapY - drumCenter) / ITEM_H
      const currentIdx = Math.round(offset / ITEM_H)
      const tappedIdx = currentIdx + Math.round(relativeSlot)
      snapTo(tappedIdx, true)
      return
    }

    // ── Momentum throw ────────────────────────────────────────────────────
    if (Math.abs(velocity) > MIN_V) {
      lastRafTime = performance.now()
      rafId = requestAnimationFrame(runMomentum)
    } else {
      snapToNearest()
    }
  }

  function onPointerCancel() {
    isDragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)
    snapToNearest()
  }

  // ── WheelEvent (trackpad / mouse scroll wheel) ─────────────────────────────
  // Step by one item per discrete event; debounce snap 100ms after last event.
  let wheelSnapTimer = 0
  function onWheel(e: WheelEvent) {
    e.preventDefault()
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }

    // Normalize: trackpads emit fractional deltaY, click-wheels emit ~100px steps
    const step = Math.abs(e.deltaY) > 50 ? Math.sign(e.deltaY) * ITEM_H : e.deltaY
    offset = clampOffset(offset + step)
    setTrackY(track, offset)

    clearTimeout(wheelSnapTimer)
    wheelSnapTimer = window.setTimeout(() => snapToNearest(), 100)
  }

  drum.addEventListener('pointerdown', onPointerDown)
  drum.addEventListener('wheel', onWheel, { passive: false })

  wheelListenerCleanups.push(() => {
    cancelAnim()
    if (rafId) cancelAnimationFrame(rafId)
    clearTimeout(wheelSnapTimer)
    drum.removeEventListener('pointerdown', onPointerDown)
    drum.removeEventListener('wheel', onWheel)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)
  })

  // Expose setIndex for programmatic init
  ;(drum as any)._wheelSetIndex = (idx: number) => {
    cancelAnim()
    offset = clampOffset(idx * ITEM_H)
    setTrackY(track, offset)
    applyWheelValue(type, idx)
  }
}

function scrollWheelToIndex(el: HTMLElement | undefined, idx: number) {
  if (!el) return
  const fn = (el as any)._wheelSetIndex
  if (fn) fn(idx)
}

onUnmounted(() => {
  wheelListenerCleanups.forEach(fn => fn())
})

// ── Initialise date wheels when Screen 2 first becomes visible ─────────────────
// onMounted runs on Screen 1 — date wheel DOM doesn't exist yet.
// Watch currentStep and init on first arrival at step 2.
let dateWheelsInitialised = false
watch(currentStep, (step) => {
  if (step === 2 && !dateWheelsInitialised) {
    nextTick(() => {
      const defaultDayIdx = 0
      const defaultMonthIdx = 0
      const defaultYearIdx = yearOptions.indexOf('1990') >= 0 ? yearOptions.indexOf('1990') : 0
      birthDay.value = dayOptions[defaultDayIdx]!
      birthMonth.value = monthOptions[defaultMonthIdx]!
      birthYear.value = yearOptions[defaultYearIdx]!
      scrollWheelToIndex(dayWheelRef.value, defaultDayIdx)
      scrollWheelToIndex(monthWheelRef.value, defaultMonthIdx)
      scrollWheelToIndex(yearWheelRef.value, defaultYearIdx)
      if (dayWheelRef.value) attachWheelListener('day', dayWheelRef.value)
      if (monthWheelRef.value) attachWheelListener('month', monthWheelRef.value)
      if (yearWheelRef.value) attachWheelListener('year', yearWheelRef.value)
      dateWheelsInitialised = true
    })
  }
})

// ── Initialise time wheels when user selects "Yes" on Screen 4 ─────────────────
let timeWheelsInitialised = false
watch(timeKnown, (val) => {
  if (val === true && !timeWheelsInitialised) {
    nextTick(() => {
      scrollWheelToIndex(hourWheelRef.value, 0)
      scrollWheelToIndex(minuteWheelRef.value, 0)
      scrollWheelToIndex(ampmWheelRef.value, 0)
      if (hourWheelRef.value) attachWheelListener('hour', hourWheelRef.value)
      if (minuteWheelRef.value) attachWheelListener('minute', minuteWheelRef.value)
      if (ampmWheelRef.value) attachWheelListener('ampm', ampmWheelRef.value)
      timeWheelsInitialised = true
    })
  }
})

// ── Derived values → store ────────────────────────────────────────────────────
const computedDateOfBirth = computed(() => {
  if (!birthDay.value || !birthMonth.value || !birthYear.value) return ''
  return `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
})

watch(computedDateOfBirth, (val) => {
  if (val) store.dateOfBirth = val
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

const timeOfBirth = computed(() => {
  if (!birthHour.value || !birthMinute.value) return ''
  return `${birthHour.value}:${birthMinute.value} ${birthAmPm.value}`
})

watch(timeOfBirth, (val) => {
  store.timeOfBirth = val
})


const dateStep2Valid = computed(
  () => !!birthDay.value && !!birthMonth.value && !!birthYear.value,
)

function handleAnswerSelect(questionId: string, answerValue: string) {
  store.setAnswer(questionId, answerValue)
}

function selectAndAdvance(questionId: string, answerValue: string) {
  store.setAnswer(questionId, answerValue)
  currentStep.value++
}

function advanceStep() {
  currentStep.value++
}

function advanceFromCity() {
  $trackStep1Complete({ language: store.language })
  currentStep.value++
}

function skipBirthTime() {
  store.timeOfBirth = ''
  currentStep.value++
}

const step1Valid = computed(
  () => !!store.firstName && !!computedDateOfBirth.value && !!store.city,
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

function goBack() {
  if (currentStep.value > 1) {
    if (currentStep.value === 5) {
      timeKnown.value = null
    }
    currentStep.value--
  } else {
    navigateTo('/')
  }
}


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
  // Clear stale chart so a failed re-submission never carries over old data.
  store.natalChart = null

  // The browser knows its current UTC offset. We send it so the server can
  // convert local birth time → UT accurately without a timezone API call.
  // Note: getTimezoneOffset() returns offset as (UTC − local) minutes,
  // so we negate it to get (local − UTC) minutes as expected by the server.
  const utcOffsetMinutes = -(new Date().getTimezoneOffset())

  try {
    const result = await $fetch('/api/calculate-chart', {
      method: 'POST',
      body: {
        firstName:        store.firstName,
        dateOfBirth:      store.dateOfBirth,
        timeOfBirth:      store.timeOfBirth || null,
        city:             store.city,
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

/* ─────────────────────────────────────────────
   PAGE SHELL — matches landing bg system
───────────────────────────────────────────── */
.page {
  position: relative;
  min-height: 100vh;
  background: #07070D;
  color: rgba(255, 255, 255, 0.94);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text',
               'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  padding: 28px 24px calc(52px + env(safe-area-inset-bottom, 0px));
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Fixed ambient gradient — same visual language as landing,
   no canvas needed for a form page */
.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 55% at 50% 0%,
      rgba(75, 45, 155, 0.18) 0%,
      transparent 68%
    ),
    radial-gradient(
      ellipse 50% 40% at 15% 55%,
      rgba(50, 25, 110, 0.10) 0%,
      transparent 60%
    );
  pointer-events: none;
  z-index: 0;
}

/* All direct children sit above the bg pseudo-element */
.page > * {
  position: relative;
  z-index: 1;
}


/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
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

.back-btn:hover {
  color: rgba(255, 255, 255, 0.75);
}

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


/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
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


/* ─────────────────────────────────────────────
   HEADINGS
───────────────────────────────────────────── */
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

.data-use-notice {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  margin: 0 0 28px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

.time-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.20);
  margin: 8px 0 0;
  line-height: 1.6;
  letter-spacing: 0.01em;
  padding: 0 4px;
}

.privacy-micro {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.20);
  margin: 0 0 12px;
  text-align: center;
  letter-spacing: 0.01em;
}


/* ─────────────────────────────────────────────
   TEXT INPUT FIELDS
───────────────────────────────────────────── */
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

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.18);
}

.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus,
.field-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #0d0b1e inset !important;
  box-shadow: 0 0 0 1000px #0d0b1e inset !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.88) !important;
  caret-color: rgba(255, 255, 255, 0.88);
  transition: background-color 9999s ease-in-out 0s;
}


/* ─────────────────────────────────────────────
   DATE GROUP & TIME GROUP
───────────────────────────────────────────── */
.date-group,
.time-group {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 16px 16px 14px;
  margin-bottom: 12px;
}

.date-group .field-label {
  margin-bottom: 14px;
}

.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.field-optional-badge {
  font-size: 10px;
  color: rgba(107, 72, 224, 0.65);
  letter-spacing: 0.02em;
}


/* ─────────────────────────────────────────────
   SCROLL-WHEEL DRUM PICKER
   ITEM_H = 44px — JS contract, do not change
───────────────────────────────────────────── */
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
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.wheel-drum {
  width: 100%;
  height: 132px; /* 3 × 44px — must match ITEM_H in script */
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  position: relative;
  touch-action: none;
  user-select: none;
  cursor: grab;
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
    rgba(0,0,0,1) 35%,
    rgba(0,0,0,1) 65%,
    rgba(0,0,0,0.4) 80%,
    transparent 100%
  );
}

.wheel-drum:active {
  cursor: grabbing;
}

/* Hairline selection indicator — centered on the middle slot */
.wheel-drum::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: calc(50% - 22px);
  height: 44px;
  border-top: 1px solid rgba(201, 168, 76, 0.18);
  border-bottom: 1px solid rgba(201, 168, 76, 0.18);
  pointer-events: none;
  border-radius: 2px;
}

.wheel-track {
  display: flex;
  flex-direction: column;
  will-change: transform;
  transform: translateY(0);
}

.wheel-pad {
  height: 44px;
  flex-shrink: 0;
}

.wheel-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  user-select: none;
  transition: color 0.18s ease, background 0.18s ease;
  border-radius: 4px;
  letter-spacing: 0.04em;
  contain: layout style;
}

.wheel-item.selected {
  color: rgba(201, 168, 76, 0.95);
  background: rgba(201, 168, 76, 0.07);
}


/* ─────────────────────────────────────────────
   BIRTH UNLOCK INDICATOR
───────────────────────────────────────────── */
.birth-unlock-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.birth-unlock-icon {
  font-size: 10px;
  color: rgba(107, 72, 224, 0.70);
}

.birth-unlock-text {
  font-size: 11px;
  color: rgba(107, 72, 224, 0.70);
  letter-spacing: 0.02em;
}


/* ─────────────────────────────────────────────
   TIME CHOICE BUTTONS (Screen 4)
───────────────────────────────────────────── */
.time-choice-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.time-choice-row .option-tile {
  flex: 1 0 100%;
  min-height: 56px;
  font-size: 15px;
  text-align: center;
}


/* ─────────────────────────────────────────────
   REGION / TRADITION SELECTOR
───────────────────────────────────────────── */
.region-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.region-label {
  font-size: 9px;
  color: rgba(201, 168, 76, 0.45);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  margin: 0 0 6px;
}

.tradition-explanation {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.28);
  text-align: center;
  margin: 0 0 16px;
  line-height: 1.5;
}

.region-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.region-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.45);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    background   0.18s ease;
  width: 100%;
  min-height: 64px;
  -webkit-tap-highlight-color: transparent;
}

.region-card.active {
  border-color: rgba(201, 168, 76, 0.45);
  background: rgba(201, 168, 76, 0.07);
}

.region-card:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.05);
}

.region-card-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.region-card-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.region-card-name {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.75);
}

.region-card.active .region-card-name {
  color: rgba(201, 168, 76, 0.95);
}

.region-card-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.region-card.active .region-card-sub {
  color: rgba(201, 168, 76, 0.55);
}


/* ─────────────────────────────────────────────
   LANGUAGE SELECTOR
───────────────────────────────────────────── */
.lang-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.lang-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.20);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.lang-row {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: rgba(255, 255, 255, 0.25);
  transition:
    border-color 0.18s ease,
    background   0.18s ease,
    color        0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.lang-btn:hover:not(.lang-btn--active) {
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.45);
}

.lang-btn--active {
  border-color: rgba(107, 72, 224, 0.50);
  background: rgba(107, 72, 224, 0.14);
  color: rgba(200, 180, 255, 0.90);
}


/* ─────────────────────────────────────────────
   PRIMARY CTA — matches landing page solid purple
   Apple HIG: 44pt minimum touch target
───────────────────────────────────────────── */
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
  transition:
    background  0.18s ease,
    box-shadow  0.18s ease,
    transform   0.12s ease;
  box-shadow:
    0 0 0 1px rgba(107, 72, 224, 0.55),
    0 8px 32px rgba(107, 72, 224, 0.28),
    0 2px 8px  rgba(0, 0, 0, 0.35);
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
  box-shadow:
    0 0 0 1px rgba(107, 72, 224, 0.45),
    0 4px 16px rgba(107, 72, 224, 0.22);
}

.cta-button.disabled {
  opacity: 0.30;
  cursor: default;
  transform: none;
}


/* ─────────────────────────────────────────────
   SUBMIT / REVEAL BUTTON — step 2
   Differentiated from step 1 CTA by gold tint
   so users feel progression toward their reading
───────────────────────────────────────────── */
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

.submit-btn:active:not(.disabled) {
  transform: translateY(0) scale(0.985);
}


/* ─────────────────────────────────────────────
   SUBMIT ERROR
───────────────────────────────────────────── */
.submit-error {
  margin: 16px 0 0;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(220, 80, 80, 0.35);
  background: rgba(220, 80, 80, 0.07);
  color: rgba(255, 160, 160, 0.9);
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}


/* ─────────────────────────────────────────────
   QUESTION BLOCKS (STEP 2)
───────────────────────────────────────────── */
.question-block {
  margin-bottom: 6px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.question-number {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 22px;
  font-weight: 300;
  color: rgba(201, 168, 76, 0.40);
  line-height: 1.2;
  flex-shrink: 0;
  margin-top: 0;
  letter-spacing: 0.02em;
  min-width: 28px;
}

.question-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.55;
  font-weight: 300;
  padding-top: 2px;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}


/* ─────────────────────────────────────────────
   ANSWER TILES
───────────────────────────────────────────── */
@keyframes tilePulse {
  from { opacity: 0.65; }
  to   { opacity: 1; }
}

.option-tile {
  flex: 1 0 calc(50% - 4px);
  min-height: 54px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  line-height: 1.45;
  transition:
    transform      0.15s ease,
    border-color   0.15s ease,
    background     0.15s ease,
    color          0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.option-tile:hover {
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.05);
}

.option-tile.selected {
  background: rgba(107, 72, 224, 0.12);
  border-color: rgba(107, 72, 224, 0.45);
  color: rgba(200, 180, 255, 0.92);
  transform: scale(1.02);
  animation: tilePulse 0.15s ease forwards;
}


/* ─────────────────────────────────────────────
   QUESTION DIVIDER
───────────────────────────────────────────── */
.divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.06) 30%,
    rgba(255, 255, 255, 0.06) 70%,
    transparent
  );
  margin: 28px 0;
}


/* ─────────────────────────────────────────────
   FADE TRANSITION
───────────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* ─────────────────────────────────────────────
   PERSONALIZATION INTERSTITIAL
───────────────────────────────────────────── */
.personalization-interstitial {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.40);
  line-height: 1.65;
  text-align: center;
  padding: 14px 20px;
  margin: 8px 0;
  font-style: italic;
}


/* ─────────────────────────────────────────────
   RESPONSIVE
   Apple HIG: 44pt minimum touch targets
───────────────────────────────────────────── */
@media (max-width: 400px) {
  .page {
    padding: 24px 20px calc(48px + env(safe-area-inset-bottom, 0px));
  }

  .heading {
    font-size: 34px;
  }

  .option-tile {
    flex: 1 0 calc(50% - 4px);
    padding: 12px;
    font-size: 12px;
    min-height: 50px;
  }

  .region-card {
    padding: 12px 14px;
    min-height: 58px;
  }
}

@media (max-width: 360px) {
  .page {
    padding: 20px 16px calc(44px + env(safe-area-inset-bottom, 0px));
  }

  .heading {
    font-size: 30px;
  }

  .option-tile {
    flex: 1 0 100%;
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .page {
    padding: 16px 14px calc(40px + env(safe-area-inset-bottom, 0px));
  }

  .heading {
    font-size: 28px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cta-button:hover:not(.disabled),
  .submit-btn:hover:not(.disabled) {
    transform: none;
  }
  .option-tile.selected {
    transform: none;
    animation: none;
  }
}

</style>
