<template>
  <div class="v2-page">

    <!-- ── Live activity badge ── -->
    <div class="v2-activity" aria-live="polite">
      <span class="v2-activity__dot" aria-hidden="true" />
      <span class="v2-activity__text label-caps">{{ liveCount.toLocaleString() }} reading right now</span>
    </div>

    <!-- ── Hero headline ── -->
    <h1 class="v2-headline font-display-italic" v-html="heroVariant.headline" />

    <!-- ── Sub-tagline (first sentence of variant body) ── -->
    <p class="v2-tagline">{{ heroSubtagline }}</p>

    <!-- ── Trust line ── -->
    <div class="v2-stars">
      <span class="v2-stars__glyphs" aria-label="5 out of 5 stars">★★★★★</span>
      <span class="v2-stars__label annotation">30,847 readings · 4.9 rating</span>
    </div>

    <!-- ── Quiz card ── -->
    <div class="v2-card">
      <div class="v2-card__header">
        <span class="label-caps v2-card__step">Step 1 of 4</span>
        <span class="annotation v2-card__pct">25% complete</span>
      </div>

      <div class="v2-card__progress-track">
        <div class="v2-card__progress-fill" />
      </div>

      <div class="v2-card__fields">
        <label class="v2-field-label label-caps" for="v2-dob">Your date of birth</label>
        <input
          id="v2-dob"
          v-model="myDob"
          type="date"
          class="v2-input"
          min="1924-01-01"
          :max="todayMax"
          required
        />

        <div class="v2-city-wrap">
          <PlacesAutocomplete
            v-model="myCity"
            label="Your birth city"
            placeholder="Start typing a city…"
            @place-selected="onCitySelected"
          />
        </div>
      </div>

      <AppButton
        variant="primary"
        :arrow="true"
        :full="true"
        :disabled="!step1Valid"
        @click="handleContinue"
      >
        Continue
      </AppButton>
    </div>

    <!-- ── Trust strip ── -->
    <div class="v2-strip">
      <div class="v2-strip__item">
        <span class="v2-strip__title label-caps">Free preview</span>
        <span class="v2-strip__sub annotation">No payment yet</span>
      </div>
      <div class="v2-strip__sep" aria-hidden="true" />
      <div class="v2-strip__item">
        <span class="v2-strip__title label-caps">Swiss Ephemeris</span>
        <span class="v2-strip__sub annotation">NASA-grade data</span>
      </div>
      <div class="v2-strip__sep" aria-hidden="true" />
      <div class="v2-strip__item">
        <span class="v2-strip__title label-caps">60 seconds</span>
        <span class="v2-strip__sub annotation">From start to result</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSunSign, getLifePathNumber, type SunSign } from '~/utils/quick-signs-client'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useClarity } from '~/composables/useClarity'

useSeoMeta({ title: 'Free Compatibility Reading — OMENORA', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const route = useRoute()
const { $trackCustomEvent, $trackCompatibilityQuizStart } = useNuxtApp() as any
const { trackEvent: clarityTrack } = useClarity()

function trackEvent(name: string, props?: Record<string, unknown>) {
  try { $trackCustomEvent?.(name, props ?? {}) } catch { /* never throw into the funnel */ }
  clarityTrack(name)
}

// ── Form state ────────────────────────────────────────────────────────────
const myDob     = ref('')
const myCity    = ref('')
const myCityLat = ref<number | null>(null)
const myCityLng = ref<number | null>(null)
const mySunSign  = ref<SunSign | null>(null)
const myLifePath = ref(0)
const liveCount  = ref(0)

const todayMax = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function onCitySelected(place: { name: string; lat: number; lng: number; placeId: string }) {
  myCity.value    = place.name
  myCityLat.value = place.lat
  myCityLng.value = place.lng
}

// ── Validation ────────────────────────────────────────────────────────────
const step1Valid = computed(() => myDob.value.length === 10 && myCity.value.trim().length >= 2)

// ── Hero copy variants (inlined — not shared with v1) ─────────────────────
interface HeroVariant {
  headline: string
  body:     string
  ctaLabel: string
}

const DEFAULT_HERO: HeroVariant = {
  headline: 'Are you and this person<br>actually compatible?',
  body:     'Your birth charts reveal patterns most people never see. Enter both dates and we\'ll calculate your synastry score, core bond, and the one thing driving the dynamic between you.',
  ctaLabel: 'Check Our Compatibility',
}

function resolveHeroVariant(utmCreative: string): HeroVariant {
  const c = utmCreative.toLowerCase()

  if (c.includes('ignoring') || c.includes('left_on_read') || c.includes('read') || c.includes('seen')) {
    return {
      headline: 'Why do they go cold<br>after showing so much interest?',
      body:     'Your synastry chart shows whether the pull between you is real — or a pattern your chart keeps recreating. Enter both birth dates and we\'ll show you what\'s actually happening.',
      ctaLabel: 'See What\'s Really Happening',
    }
  }

  if (c.includes('weather') || c.includes('storm') || c.includes('rough') || c.includes('survive') || c.includes('work_out')) {
    return {
      headline: 'Can this relationship<br>actually survive this?',
      body:     'Your birth charts reveal whether two people have the structural bond to get through hard periods — or whether the tension is written into the connection itself.',
      ctaLabel: 'Check Our Bond',
    }
  }

  if (c.includes('antiscam') || c.includes('scam') || c.includes('real') || c.includes('genuine') || c.includes('redflag') || c.includes('red_flag')) {
    return {
      headline: 'Is what they feel for you<br>actually real?',
      body:     'Your synastry chart shows whether someone\'s feelings have a genuine astrological foundation — or whether the attraction is one-sided by design. Enter both dates to find out.',
      ctaLabel: 'Find Out If It\'s Real',
    }
  }

  if (c.includes('disappear') || c.includes('alone') || c.includes('end_up')) {
    return {
      headline: 'Why do people who matter<br>always disappear?',
      body:     'Your Venus placement and life-path number reveal the pattern. It\'s written in your birth chart — not your sun sign. Enter your details and we\'ll show you what\'s actually driving it.',
      ctaLabel: 'See My Pattern',
    }
  }

  if (c.includes('wrong') || c.includes('attract') || c.includes('trust')) {
    return {
      headline: 'You don\'t attract the<br>wrong people by accident.',
      body:     'Your chart carries a specific relational pattern that shows up in every dynamic. Enter both birth dates and we\'ll map exactly where it comes from — and whether you two can work.',
      ctaLabel: 'Reveal the Pattern',
    }
  }

  if (c.includes('feeling') || c.includes('empty') || c.includes('connection')) {
    return {
      headline: 'Something feels off<br>even when things are good.',
      body:     'Your synastry chart shows whether the connection between two people has a genuine structural match — or a pattern that creates distance no matter how hard you try.',
      ctaLabel: 'Check the Connection',
    }
  }

  if (c.includes('score') || c.includes('percent') || c.includes('match')) {
    return {
      headline: 'What\'s the real compatibility<br>score between you two?',
      body:     'Not a sun-sign quiz. Your synastry score is calculated from exact planetary positions at birth — both charts, cross-referenced across six astrological factors.',
      ctaLabel: 'Calculate Our Score',
    }
  }

  return { ...DEFAULT_HERO }
}

const heroVariant = ref<HeroVariant>({ ...DEFAULT_HERO })

const heroSubtagline = computed(() => {
  const body = heroVariant.value.body
  const dot  = body.indexOf('.')
  return dot !== -1 ? body.slice(0, dot + 1) : body
})

// ── Continue handler ──────────────────────────────────────────────────────
async function handleContinue() {
  if (!step1Valid.value) return
  try {
    mySunSign.value  = getSunSign(myDob.value)
    myLifePath.value = getLifePathNumber(myDob.value).number
  } catch { return }
  store.setPersonalInfo('', myDob.value, myCity.value)
  store.cityLat = myCityLat.value
  store.cityLng = myCityLng.value
  trackEvent('compatibility_quiz_step_1_complete', {
    sun_sign:  mySunSign.value?.name,
    life_path: myLifePath.value,
  })
  try { $trackCompatibilityQuizStart?.() } catch { /* never block UI */ }
  await navigateTo('/compatibility-quiz?step=2&from=v2')
}

// ── Mount ─────────────────────────────────────────────────────────────────
onMounted(() => {
  liveCount.value = Math.floor(Math.random() * (3400 - 2800 + 1)) + 2800

  const utmParams = {
    utm_source:   (route.query.utm_source   as string) || '',
    utm_campaign: (route.query.utm_campaign as string) || '',
    utm_creative: (route.query.utm_creative as string) || '',
    utm_medium:   (route.query.utm_medium   as string) || '',
    utm_content:  (route.query.utm_content  as string) || '',
  }

  if (utmParams.utm_source) {
    sessionStorage.setItem('omenora_utms', JSON.stringify(utmParams))
    heroVariant.value = resolveHeroVariant(utmParams.utm_creative)
  }

  trackEvent('compatibility_v2_landing_viewed', {
    utm_source:   utmParams.utm_source,
    utm_campaign: utmParams.utm_campaign,
    utm_creative: utmParams.utm_creative,
  })

  if (utmParams.utm_source) {
    trackEvent('compatibility_landing_viewed', {
      utm_source:   utmParams.utm_source,
      utm_campaign: utmParams.utm_campaign,
      utm_creative: utmParams.utm_creative,
    })
  } else {
    trackEvent('compatibility_quiz_started')
  }
})
</script>

<style scoped>
/* ── Page shell ── */
.v2-page {
  min-height: 100vh;
  background: var(--surface-base);
  padding: clamp(40px, 8vw, 72px) clamp(20px, 5vw, 40px) 64px;
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ── Live activity badge ── */
.v2-activity {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--border-faint);
  border: 1px solid var(--border-subtle);
  border-radius: 40px;
  padding: 6px 14px 6px 10px;
  margin-bottom: 32px;
}

.v2-activity__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2DBD6E;
  flex-shrink: 0;
  animation: v2-dot-pulse 2.2s ease-in-out infinite;
}

.v2-activity__text {
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-secondary);
}

@keyframes v2-dot-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Hero headline ── */
.v2-headline {
  font-family: var(--font-sans);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(36px, 9vw, 60px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 20px;
}

/* ── Sub-tagline ── */
.v2-tagline {
  font-family: var(--font-sans);
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 24px;
  max-width: 42ch;
}

/* ── Stars / trust line ── */
.v2-stars {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}

.v2-stars__glyphs {
  color: var(--accent-gold);
  font-size: 13px;
  letter-spacing: 2px;
  line-height: 1;
}

.v2-stars__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--text-secondary);
}

/* ── Quiz card ── */
.v2-card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  padding: clamp(24px, 5vw, 36px) clamp(20px, 5vw, 32px);
  margin-bottom: 28px;
}

.v2-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.v2-card__step {
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--text-primary);
}

.v2-card__pct {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--accent-gold);
}

.v2-card__progress-track {
  height: 2px;
  background: var(--border-subtle);
  margin-bottom: 32px;
}

.v2-card__progress-fill {
  width: 25%;
  height: 100%;
  background: var(--text-primary);
}

.v2-card__fields {
  margin-bottom: 28px;
}

/* ── DOB field ── */
.v2-field-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.v2-input {
  width: 100%;
  padding: 14px 0;
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 300;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-strong);
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s;
  display: block;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
  color-scheme: light;
}

.v2-input:focus {
  border-bottom-color: var(--text-primary);
}

/* ── City autocomplete spacing ── */
.v2-city-wrap {
  margin-top: 32px;
}

/* ── Trust strip ── */
.v2-strip {
  display: flex;
  align-items: flex-start;
}

.v2-strip__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  text-align: center;
}

.v2-strip__item:first-child {
  padding-left: 0;
  align-items: flex-start;
  text-align: left;
}

.v2-strip__item:last-child {
  padding-right: 0;
  align-items: flex-end;
  text-align: right;
}

.v2-strip__sep {
  width: 1px;
  min-height: 32px;
  background: var(--border-subtle);
  flex-shrink: 0;
  align-self: center;
}

.v2-strip__title {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--text-primary);
  display: block;
}

.v2-strip__sub {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--text-tertiary);
  display: block;
}

/* ── Responsive ── */
@media (max-width: 380px) {
  .v2-strip__item {
    padding: 0 4px;
  }
  .v2-strip__title,
  .v2-strip__sub {
    letter-spacing: 0.12em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v2-activity__dot {
    animation: none;
  }
}
</style>
