<template>
  <div class="page">
    <!-- Ambient background -->
    <div class="bg-ambient" aria-hidden="true" />

    <!-- Header -->
    <header class="top-bar">
      <NuxtLink to="/" class="brand" aria-label="OMENORA home">OMENORA</NuxtLink>
    </header>

    <!-- Price banner -->
    <div class="price-banner">
      <span class="price-label">Personal Daily Horoscope</span>
      <span class="price-amount">$4.99<span class="price-period">/month</span></span>
    </div>

    <!-- Form -->
    <form class="form" novalidate @submit.prevent="handleSubmit">

      <!-- First name -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'firstName' }">
        <div class="field-label">First Name</div>
        <input
          id="sub-firstName"
          v-model="firstName"
          type="text"
          name="firstName"
          autocomplete="given-name"
          placeholder="Your first name"
          class="field-input"
          @focus="focusedField = 'firstName'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Email -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'email' }">
        <div class="field-label">Email</div>
        <input
          id="sub-email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="your@email.com"
          class="field-input"
          @focus="focusedField = 'email'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Date of birth -->
      <div class="date-group">
        <div class="field-label">Date of Birth</div>
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

      <!-- Time of birth (optional) -->
      <div class="time-group">
        <div class="field-header-row">
          <div class="field-label">Time of Birth</div>
          <span class="field-optional-badge">Optional</span>
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
          <span class="birth-unlock-text">Birth chart unlocked</span>
        </div>
      </div>

      <!-- City of birth -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'city' }">
        <div class="field-label">City of Birth</div>
        <input
          id="sub-city"
          v-model="city"
          type="text"
          name="city"
          autocomplete="address-level2"
          placeholder="e.g. New York, USA"
          class="field-input"
          @focus="focusedField = 'city'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Error -->
      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>

      <!-- Submit -->
      <button
        type="submit"
        class="cta-button"
        :class="{ disabled: isLoading }"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner" aria-hidden="true" />
        {{ isLoading ? 'Preparing checkout…' : 'Start Personal Horoscope →' }}
      </button>

    </form>

    <p class="sub-note">Cancel anytime. Billed monthly via Stripe.</p>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

useSeoMeta({
  title: 'Personal Daily Horoscope — OMENORA',
  robots: 'noindex',
})

const focusedField = ref<string | null>(null)
const isLoading    = ref(false)
const submitError  = ref<string | null>(null)

const firstName = ref('')
const email     = ref('')
const city      = ref('')

// ── Wheel options ─────────────────────────────────────────────────────────────
const currentYear  = new Date().getFullYear()
const ITEM_H       = 44

const dayOptions    = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const monthOptions  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const yearOptions   = Array.from({ length: currentYear - 1923 }, (_, i) => String(currentYear - 1 - i))
const hourOptions   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

// ── Wheel selected values ─────────────────────────────────────────────────────
const birthDay    = ref<string>('')
const birthMonth  = ref<string>('')
const birthYear   = ref<string>('')
const birthHour   = ref<string>('')
const birthMinute = ref<string>('')
const birthAmPm   = ref<'AM' | 'PM'>('AM')

// ── Wheel refs ────────────────────────────────────────────────────────────────
const dayWheelRef    = ref<HTMLElement>()
const monthWheelRef  = ref<HTMLElement>()
const yearWheelRef   = ref<HTMLElement>()
const hourWheelRef   = ref<HTMLElement>()
const minuteWheelRef = ref<HTMLElement>()
const ampmWheelRef   = ref<HTMLElement>()

// ── Wheel engine ──────────────────────────────────────────────────────────────
const wheelListenerCleanups: Array<() => void> = []

function getOptionsLength(type: string): number {
  if (type === 'day')    return dayOptions.length
  if (type === 'month')  return monthOptions.length
  if (type === 'year')   return yearOptions.length
  if (type === 'hour')   return hourOptions.length
  if (type === 'minute') return minuteOptions.length
  if (type === 'ampm')   return 2
  return 1
}

function applyWheelValue(type: string, idx: number) {
  const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max))
  if (type === 'day')         birthDay.value    = dayOptions[clamp(idx, dayOptions.length - 1)]!
  else if (type === 'month')  birthMonth.value  = monthOptions[clamp(idx, monthOptions.length - 1)]!
  else if (type === 'year')   birthYear.value   = yearOptions[clamp(idx, yearOptions.length - 1)]!
  else if (type === 'hour')   birthHour.value   = hourOptions[clamp(idx, hourOptions.length - 1)]!
  else if (type === 'minute') birthMinute.value = minuteOptions[clamp(idx, minuteOptions.length - 1)]!
  else if (type === 'ampm')   birthAmPm.value   = idx === 0 ? 'AM' : 'PM'
}

function getTrack(drum: HTMLElement): HTMLElement {
  return drum.firstElementChild as HTMLElement
}

function setTrackY(track: HTMLElement, offset: number) {
  track.style.transform = `translateY(${-offset}px)`
}

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
  const track    = getTrack(drum)
  const maxIdx   = getOptionsLength(type) - 1
  const maxOffset = maxIdx * ITEM_H

  let offset      = 0
  let isDragging  = false
  let startClientY = 0
  let lastClientY  = 0
  let lastTime     = 0
  let velocity     = 0
  let cancelAnim   = () => {}
  let rafId        = 0

  const clampOffset = (v: number) => Math.max(0, Math.min(v, maxOffset))

  function snapTo(idx: number, fast = false) {
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    const targetIdx    = Math.max(0, Math.min(Math.round(idx), maxIdx))
    const targetOffset = targetIdx * ITEM_H
    const dist         = Math.abs(targetOffset - offset)
    const duration     = fast ? 120 : Math.min(60 + dist * 0.4, 320)
    cancelAnim = animateTo(track, offset, targetOffset, duration, () => {
      offset = targetOffset
      applyWheelValue(type, targetIdx)
    })
    applyWheelValue(type, targetIdx)
  }

  function snapToNearest() { snapTo(offset / ITEM_H) }

  const DECEL = 0.998
  const MIN_V = 0.02
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

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    isDragging   = true
    startClientY = e.clientY
    lastClientY  = e.clientY
    lastTime     = performance.now()
    velocity     = 0
    e.preventDefault()
    document.addEventListener('pointermove', onPointerMove, { passive: false })
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return
    const now    = performance.now()
    const dt     = Math.max(now - lastTime, 1)
    const dy     = lastClientY - e.clientY
    const instantV = dy / dt
    velocity     = velocity * 0.6 + instantV * 0.4
    offset       = clampOffset(offset + dy)
    setTrackY(track, offset)
    lastClientY  = e.clientY
    lastTime     = now
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return
    isDragging = false
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)

    const totalTravel = Math.abs(e.clientY - startClientY)
    if (totalTravel < 5) {
      const drumRect    = drum.getBoundingClientRect()
      const tapY        = e.clientY - drumRect.top
      const drumCenter  = drumRect.height / 2
      const relativeSlot = (tapY - drumCenter) / ITEM_H
      const currentIdx  = Math.round(offset / ITEM_H)
      const tappedIdx   = currentIdx + Math.round(relativeSlot)
      snapTo(tappedIdx, true)
      return
    }

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

  let wheelSnapTimer = 0
  function onWheel(e: WheelEvent) {
    e.preventDefault()
    cancelAnim()
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
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

onMounted(() => {
  nextTick(() => {
    const defaultYearIdx = yearOptions.indexOf('1990') >= 0 ? yearOptions.indexOf('1990') : 0
    birthDay.value    = dayOptions[0]!
    birthMonth.value  = monthOptions[0]!
    birthYear.value   = yearOptions[defaultYearIdx]!
    scrollWheelToIndex(dayWheelRef.value, 0)
    scrollWheelToIndex(monthWheelRef.value, 0)
    scrollWheelToIndex(yearWheelRef.value, defaultYearIdx)
    scrollWheelToIndex(hourWheelRef.value, 0)
    scrollWheelToIndex(minuteWheelRef.value, 0)
    scrollWheelToIndex(ampmWheelRef.value, 0)

    if (dayWheelRef.value)    attachWheelListener('day',    dayWheelRef.value)
    if (monthWheelRef.value)  attachWheelListener('month',  monthWheelRef.value)
    if (yearWheelRef.value)   attachWheelListener('year',   yearWheelRef.value)
    if (hourWheelRef.value)   attachWheelListener('hour',   hourWheelRef.value)
    if (minuteWheelRef.value) attachWheelListener('minute', minuteWheelRef.value)
    if (ampmWheelRef.value)   attachWheelListener('ampm',   ampmWheelRef.value)
  })
})

// ── Derived values ────────────────────────────────────────────────────────────
const dateOfBirth = computed(() => {
  if (!birthDay.value || !birthMonth.value || !birthYear.value) return ''
  return `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
})

const timeOfBirth = computed(() => {
  if (!birthHour.value || !birthMinute.value) return ''
  return `${birthHour.value}:${birthMinute.value} ${birthAmPm.value}`
})

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  submitError.value = null

  if (!firstName.value.trim()) {
    submitError.value = 'Please enter your first name.'
    return
  }
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    submitError.value = 'Please enter a valid email address.'
    return
  }
  if (!dateOfBirth.value) {
    submitError.value = 'Please enter your date of birth.'
    return
  }
  if (!city.value.trim()) {
    submitError.value = 'Please enter your city of birth.'
    return
  }

  isLoading.value = true

  try {
    const utcOffsetMinutes = -(new Date().getTimezoneOffset())

    const chartResult = await $fetch('/api/calculate-chart', {
      method: 'POST',
      body: {
        firstName:        firstName.value.trim(),
        dateOfBirth:      dateOfBirth.value,
        timeOfBirth:      timeOfBirth.value || null,
        city:             city.value.trim(),
        utcOffsetMinutes,
      },
    }) as {
      archetype:      string
      lifePathNumber: number
      geocodeFailed:  boolean
    }

    const subResult = await $fetch('/api/create-subscription', {
      method: 'POST',
      body: {
        firstName:      firstName.value.trim(),
        email:          email.value.trim(),
        archetype:      chartResult.archetype,
        lifePathNumber: chartResult.lifePathNumber,
        dateOfBirth:    dateOfBirth.value,
        timeOfBirth:    timeOfBirth.value,
        city:           city.value.trim(),
        element:        '',
        region:         '',
        origin:         window.location.origin,
      },
    }) as { sessionId: string; url: string }

    if (subResult.url) {
      window.location.href = subResult.url
    } else {
      throw new Error('No checkout URL returned.')
    }
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? ''
    submitError.value = msg || 'Something went wrong. Please check your connection and try again.'
    isLoading.value = false
  }
}
</script>

<style scoped>

/* ─────────────────────────────────────────────
   PAGE SHELL
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

.bg-ambient {
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

.page > * {
  position: relative;
  z-index: 1;
}


/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 15px;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.38);
  text-decoration: none;
  transition: color 0.18s ease;
}

.brand:hover {
  color: rgba(255, 255, 255, 0.65);
}


/* ─────────────────────────────────────────────
   PRICE BANNER
───────────────────────────────────────────── */
.price-banner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: rgba(201, 168, 76, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.22);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 28px;
}

.price-label {
  font-size: 13px;
  color: rgba(201, 168, 76, 0.80);
  letter-spacing: 0.02em;
}

.price-amount {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 22px;
  font-weight: 400;
  color: rgba(201, 168, 76, 0.95);
  letter-spacing: 0.03em;
}

.price-period {
  font-size: 13px;
  color: rgba(201, 168, 76, 0.55);
  letter-spacing: 0.01em;
}


/* ─────────────────────────────────────────────
   FORM
───────────────────────────────────────────── */
.form {
  display: flex;
  flex-direction: column;
}


/* ─────────────────────────────────────────────
   FIELD WRAPPERS — matches analysis.vue exactly
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

.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.field-optional-badge {
  font-size: 10px;
  color: rgba(107, 72, 224, 0.65);
  letter-spacing: 0.02em;
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

.time-group .field-header-row {
  margin-bottom: 12px;
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
  height: 132px;
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
   SUBMIT ERROR
───────────────────────────────────────────── */
.submit-error {
  margin: 4px 0 12px;
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
   CTA BUTTON — matches analysis.vue .submit-btn
───────────────────────────────────────────── */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(201, 168, 76, 0.10);
  border: 1px solid rgba(201, 168, 76, 0.45);
  border-radius: 14px;
  color: rgba(201, 168, 76, 0.92);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 17px 24px;
  min-height: 54px;
  width: 100%;
  cursor: pointer;
  box-shadow: none;
  transition:
    background  0.18s ease,
    border-color 0.18s ease,
    color       0.18s ease,
    transform   0.12s ease;
  margin-top: 20px;
  -webkit-tap-highlight-color: transparent;
}

.cta-button:hover:not(.disabled) {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.70);
  color: rgba(201, 168, 76, 1);
  box-shadow: 0 0 28px rgba(201, 168, 76, 0.12);
  transform: translateY(-1px);
}

.cta-button:active:not(.disabled) {
  transform: translateY(0) scale(0.985);
}

.cta-button.disabled {
  opacity: 0.40;
  cursor: default;
  transform: none;
}


/* ─────────────────────────────────────────────
   SPINNER (inline in button)
───────────────────────────────────────────── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(201, 168, 76, 0.25);
  border-top-color: rgba(201, 168, 76, 0.85);
  border-radius: 50%;
  animation: spin 0.72s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


/* ─────────────────────────────────────────────
   SUB NOTE
───────────────────────────────────────────── */
.sub-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.18);
  text-align: center;
  margin: 16px 0 0;
  letter-spacing: 0.02em;
}


/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */
@media (max-width: 400px) {
  .page {
    padding: 24px 20px calc(48px + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 360px) {
  .page {
    padding: 20px 16px calc(44px + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-button:hover:not(.disabled) {
    transform: none;
  }
  .spinner {
    animation: none;
  }
}

</style>
