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
      <div class="field-wrapper" :class="{ focused: focusedField === 'dateOfBirth' }">
        <div class="field-label">Date of Birth</div>
        <input
          id="sub-dob"
          v-model="dateOfBirth"
          type="date"
          name="dateOfBirth"
          autocomplete="bday"
          class="field-input field-input--date"
          @focus="focusedField = 'dateOfBirth'"
          @blur="focusedField = null"
        >
      </div>

      <!-- Time of birth (optional) -->
      <div class="field-wrapper" :class="{ focused: focusedField === 'timeOfBirth' }">
        <div class="field-header-row">
          <div class="field-label">Time of Birth</div>
          <span class="field-optional-badge">Optional</span>
        </div>
        <input
          id="sub-tob"
          v-model="timeOfBirth"
          type="time"
          name="timeOfBirth"
          autocomplete="off"
          class="field-input field-input--time"
          @focus="focusedField = 'timeOfBirth'"
          @blur="focusedField = null"
        >
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
import { ref } from 'vue'

useSeoMeta({
  title: 'Personal Daily Horoscope — OMENORA',
  robots: 'noindex',
})

const focusedField = ref<string | null>(null)
const isLoading    = ref(false)
const submitError  = ref<string | null>(null)

const firstName   = ref('')
const email       = ref('')
const dateOfBirth = ref('')
const timeOfBirth = ref('')
const city        = ref('')

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

    // Format timeOfBirth from native time input (HH:MM 24h) to "HH:MM AM/PM"
    let formattedTime = ''
    if (timeOfBirth.value) {
      const [hStr, mStr] = timeOfBirth.value.split(':')
      const h = parseInt(hStr ?? '0', 10)
      const m = mStr ?? '00'
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      formattedTime = `${String(h12).padStart(2, '0')}:${m} ${ampm}`
    }

    const chartResult = await $fetch('/api/calculate-chart', {
      method: 'POST',
      body: {
        firstName:        firstName.value.trim(),
        dateOfBirth:      dateOfBirth.value,
        timeOfBirth:      formattedTime || null,
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
        timeOfBirth:    formattedTime,
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

.field-input--date,
.field-input--time {
  color-scheme: dark;
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
