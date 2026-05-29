<template>
  <div class="daily-page">

    <AppHeader />

    <!-- ── Atmospheric layers (pointer-events: none) ── -->
    <div class="page-grain" aria-hidden="true" />
    <div class="page-scroll-progress" aria-hidden="true">
      <div class="page-scroll-progress__bar" :style="{ transform: `scaleY(${pageProgress})` }" />
    </div>

    <!-- ── HERO BAND (diag-band with background image) ── -->
    <section
      :ref="setHeroRevealEl"
      class="daily-hero diag-band"
      :class="{ 'is-revealed': heroIsRevealed }"
      :style="{ '--section-img': `url('/images/hero/Nebula-void.webp')`, '--section-img-pos': 'center 40%', '--section-img-pos-mobile': 'center 50%' }"
    >
      <div class="diag-band__image" aria-hidden="true" />
      <div class="diag-band__overlay" aria-hidden="true" />

      <div class="diag-band__content daily-hero__content page-wrapper">
        <!-- Section headline -->
        <div class="daily-hero__headline-block">
          <AppEyebrow class="daily-hero__eyebrow">{{ todayFormatted }}</AppEyebrow>
          <AppHeadline variant="display" as="h1" class="daily-hero__headline">
            Daily Horoscope
          </AppHeadline>
          <div class="daily-hero__rule" />
        </div>
      </div>
    </section>

    <!-- ── TAB: DAILY HOROSCOPE ── -->
    <div class="daily-horoscope">

      <!-- Loading -->
      <div v-if="loading" class="daily-loading page-wrapper">
        <div class="daily-loading__bar"><div class="daily-loading__fill" /></div>
        <AppCaption as="p">Loading today's readings…</AppCaption>
      </div>

      <!-- No data -->
      <div v-else-if="!zodiacData" class="daily-empty page-wrapper">
        <AppCaption as="p">Today's horoscopes are being prepared. Check back shortly.</AppCaption>
      </div>

      <!-- Featured sign: no reading yet (cache empty or error) -->
      <template v-else-if="featuredSign && !featuredSignReading">
        <div class="reading-view page-wrapper">
          <button class="back-link label-caps" @click="navigateTo('/daily')">← All signs</button>

          <div class="reading-sign-header">
            <div class="reading-sign-header__sign">
              <img
                :src="`/symbols/${zodiacSignFile(featuredSign)}`"
                :alt="currentSignName"
                class="reading-sign-img"
              />
              <div>
                <AppSubhead as="h2" variant="strong" color="primary" class="reading-sign-name">{{ currentSignName }}</AppSubhead>
                <AppCaption>{{ currentSignDates }}</AppCaption>
              </div>
            </div>
          </div>

          <AppDivider variant="rule" />

          <div class="reading-empty">
            <AppEyebrow variant="muted" class="reading-empty__label">{{ todayFormatted }}</AppEyebrow>
            <AppSubhead variant="default" color="primary" class="reading-empty__msg">Today's reading is being prepared.</AppSubhead>
            <AppCaption as="p" class="reading-empty__sub">Daily horoscopes are generated each morning. Check back shortly.</AppCaption>
            <button class="back-link label-caps" @click="navigateTo('/daily')" style="margin-top: 24px">← Choose another sign</button>
          </div>
        </div>
      </template>

      <!-- Featured sign view (deep link ?sign=) -->
      <template v-else-if="featuredSign && featuredSignReading">
        <div class="reading-view page-wrapper">
          <button class="back-link label-caps" @click="navigateTo('/daily')">← All signs</button>

          <div class="reading-sign-header">
            <div class="reading-sign-header__sign">
              <img
                v-if="featuredSign"
                :src="`/symbols/${zodiacSignFile(featuredSign)}`"
                :alt="currentSignName"
                class="reading-sign-img"
              />
              <div>
                <AppSubhead as="h2" variant="strong" color="primary" class="reading-sign-name">{{ currentSignName }}</AppSubhead>
                <AppCaption>{{ currentSignDates }}</AppCaption>
              </div>
            </div>
          </div>

          <AppDivider variant="rule" />

          <div class="reading-content">
            <div class="reading-content__theme">
              <AppEyebrow as="span" variant="accent" class="reading-content__theme-label">Today's theme</AppEyebrow>
              <AppSubhead variant="default" color="primary" class="reading-content__theme-text">{{ featuredSignReading.theme }}</AppSubhead>
            </div>

            <AppDivider variant="rule" />

            <AppCaption as="p" class="reading-moon-line">
              ☽ Moon in {{ featuredSignReading.moon_sign }} · {{ featuredSignReading.moon_phase }}
            </AppCaption>

            <div class="sign-sections">
              <div class="sign-section-row">
                <HoroscopeSymbol type="love" :size="18" class="section-icon" />
                <AppEyebrow as="span" variant="muted" class="section-label">Love</AppEyebrow>
                <span class="section-text">{{ featuredSignReading.love }}</span>
              </div>
              <div class="sign-section-row">
                <HoroscopeSymbol type="work" :size="18" class="section-icon" />
                <AppEyebrow as="span" variant="muted" class="section-label">Work</AppEyebrow>
                <span class="section-text">{{ featuredSignReading.job }}</span>
              </div>
              <div class="sign-section-row">
                <HoroscopeSymbol type="health" :size="18" class="section-icon" />
                <AppEyebrow as="span" variant="muted" class="section-label">Health</AppEyebrow>
                <span class="section-text">{{ featuredSignReading.health }}</span>
              </div>
            </div>

            <div v-if="featuredSignReading.planetary_weather" class="reading-weather">
              <AppDivider variant="rule" />
              <AppCaption as="p" class="reading-weather__text">{{ featuredSignReading.planetary_weather }}</AppCaption>
            </div>

            <div class="reading-cta">
              <AppDivider variant="labeled" label="◇" />
              <AppSubhead variant="default" class="reading-cta__pull">
                This is your sun sign forecast. Your natal chart gives the full picture.
              </AppSubhead>
              <AppButton variant="primary" to="/analysis" :arrow="true">Get your natal reading</AppButton>
            </div>
          </div>
        </div>

        <!-- Other signs grid -->
        <div class="others-section page-wrapper">
          <AppEyebrow variant="muted" class="others-section__label">All Signs</AppEyebrow>
          <div class="sign-grid sign-grid--mini">
            <template v-for="sign in otherSigns" :key="sign">
              <NuxtLink
                v-if="zodiacData?.[sign]"
                :to="`/daily?sign=${sign}`"
                class="sign-mini-card"
              >
                <img :src="`/symbols/${zodiacSignFile(sign)}`" :alt="signDisplayName(sign)" class="sign-mini-card__img" />
                <AppEyebrow as="span" class="sign-mini-card__name">{{ signDisplayName(sign) }}</AppEyebrow>
                <AppCaption as="p" class="sign-mini-card__theme">{{ zodiacData[sign]?.theme }}</AppCaption>
                <AppCaption as="p" class="sign-mini-card__preview">{{ firstSentence(zodiacData[sign]?.love ?? '') }}</AppCaption>
              </NuxtLink>
            </template>
          </div>
        </div>
      </template>

      <!-- All 12 signs selector grid -->
      <template v-else>
        <div class="sign-selector page-wrapper">
          <AppCaption as="p" class="sign-selector__prompt">Select your sun sign</AppCaption>
          <div class="sign-grid">
            <button
              v-for="sign in zodiacSigns"
              :key="sign.key"
              class="sign-tile"
              @click="selectSign(sign.key)"
            >
              <img :src="`/symbols/${sign.file}`" :alt="sign.name" class="sign-tile__img" />
              <AppEyebrow as="span" class="sign-tile__name">{{ sign.name }}</AppEyebrow>
              <AppCaption class="sign-tile__dates">{{ sign.dates }}</AppCaption>
            </button>
          </div>
        </div>
      </template>

    </div>


    <!-- ── CLOSING CTA BAND ── -->
    <SectionFinalCTA
      eyebrow="Your chart · Full picture"
      heading="The sun sign reading"
      :heading-variant="'xl'"
      body="Daily horoscopes give you the sky's energy for your sun sign. Your natal chart reveals how that energy lands specifically for you — your exact rising, moon, and 10-planet positions across four traditions."
      cta-label="Start your natal reading"
      cta-href="/analysis"
      :trust-items="['No account required', 'Real Swiss Ephemeris', '14-day refund']"
      band-tone="page"
      bg-image="/images/hero/Cosmic-gold-ascension.webp"
      bg-image-pos="right 50%"
      bg-image-pos-mobile="right center"
    >
      <template #heading-em>is only the start.</template>
      <template #secondary-cta>
        <AppButton variant="ghost" to="/founding">Founding membership — $20 →</AppButton>
      </template>
    </SectionFinalCTA>

    <!-- ── FOOTER ── -->
    <SectionFooter
      :columns="footerColumns"
      tagline="Computed natal readings, not horoscopes."
      brand-meta="Est. 2026 · Vol. 001 · MMXXVI"
      :copyright="`© ${currentYear} OMENORA — United Northwest Carriers Inc.`"
      meta="Built on Swiss Ephemeris · Stripe payments"
    />

  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type ComponentPublicInstance } from 'vue'
import { useRoute } from 'vue-router'
import { useReveal } from '~/composables/useReveal'
import SectionFinalCTA from '~/components/sections/SectionFinalCTA.vue'
import SectionFooter from '~/components/sections/SectionFooter.vue'
import AppHeader from '~/components/AppHeader.vue'
import AppButton from '~/components/atoms/AppButton.vue'

// ── SEO ───────────────────────────────────────
useSeoMeta({
  title: 'Free Daily Horoscope for All 12 Signs — OMENORA',
  description: 'Your free daily horoscope for today. Love, work and health reading for all 12 zodiac signs. Real planetary positions updated every morning.',
  ogTitle: 'Free Daily Horoscope for All 12 Signs — OMENORA',
  ogDescription: 'Love, work and health horoscope for Aries, Taurus, Gemini and all 12 signs. Real planetary data. Free every day.',
  ogImage: 'https://omenora.com/og-image.png',
  ogUrl: 'https://omenora.com/daily',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://omenora.com/og-image.png',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://omenora.com/daily' }],
})

// ── Zodiac sign map ────────────────────────────
const SIGN_NAMES: Record<string, string> = {
  aries:       'Aries',
  taurus:      'Taurus',
  gemini:      'Gemini',
  cancer:      'Cancer',
  leo:         'Leo',
  virgo:       'Virgo',
  libra:       'Libra',
  scorpio:     'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn:   'Capricorn',
  aquarius:    'Aquarius',
  pisces:      'Pisces',
}

const ALL_SIGNS = Object.keys(SIGN_NAMES)

function signDisplayName(slug: string): string {
  return SIGN_NAMES[slug] ?? slug
}

// ── Route & params ─────────────────────────────
const route = useRoute()

// ── Hero reveal (diag-band entrance animation) ──
const { el: heroRevealEl, isRevealed: heroIsRevealed } = useReveal()
function setHeroRevealEl(el: Element | ComponentPublicInstance | null) {
  heroRevealEl.value = el instanceof HTMLElement ? el : null
}

// ── Page scroll progress ──────────────────────
const pageProgress = ref(0)
let pageProgressRaf: number | null = null
function updatePageProgress() {
  pageProgressRaf = null
  const doc = document.documentElement
  const max = Math.max(1, doc.scrollHeight - window.innerHeight)
  pageProgress.value = Math.min(1, Math.max(0, window.scrollY / max))
}
function onPageScroll() {
  if (pageProgressRaf == null) pageProgressRaf = requestAnimationFrame(updatePageProgress)
}

// ── Footer columns ─────────────────────────────
const footerColumns = [
  { heading: 'Product',  links: [{ label: 'Daily horoscope', href: '/daily' }, { label: 'Natal reading', href: '/analysis' }, { label: 'Founding Member', href: '/founding' }, { label: 'Compatibility', href: '/compatibility-quiz' }] },
  { heading: 'Company',  links: [{ label: 'Contact', href: 'mailto:hello@omenora.com' }] },
  { heading: 'Legal',    links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'Refund policy', href: '/refund-policy' }] },
]

const currentYear = computed(() => new Date().getFullYear())

// ── Featured sign (horoscope tab) ─────────────
const featuredSign = computed<string | null>(() => {
  const param = route.query.sign
  if (typeof param === 'string' && param in SIGN_NAMES) return param
  return null
})

const otherSigns = computed(() =>
  ALL_SIGNS.filter(s => s !== featuredSign.value)
)

// ── Date & moon phase ──────────────────────────
const today = new Date()

const formattedDate = computed(() =>
  today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const todayFormatted = formattedDate


// ── Zodiac signs array (for selector grid) ────
const zodiacSigns = [
  { key: 'aries',       name: 'Aries',       file: 'Aries.svg',       dates: 'Mar 21 – Apr 19' },
  { key: 'taurus',      name: 'Taurus',      file: 'Taurus.png',      dates: 'Apr 20 – May 20' },
  { key: 'gemini',      name: 'Gemini',      file: 'Gemini.svg',      dates: 'May 21 – Jun 20' },
  { key: 'cancer',      name: 'Cancer',      file: 'Cancer.svg',      dates: 'Jun 21 – Jul 22' },
  { key: 'leo',         name: 'Leo',         file: 'Leo.svg',         dates: 'Jul 23 – Aug 22' },
  { key: 'virgo',       name: 'Virgo',       file: 'Virgo.svg',       dates: 'Aug 23 – Sep 22' },
  { key: 'libra',       name: 'Libra',       file: 'Libra.svg',       dates: 'Sep 23 – Oct 22' },
  { key: 'scorpio',     name: 'Scorpio',     file: 'Scorpio.svg',     dates: 'Oct 23 – Nov 21' },
  { key: 'sagittarius', name: 'Sagittarius', file: 'Sagittarius.svg', dates: 'Nov 22 – Dec 21' },
  { key: 'capricorn',   name: 'Capricorn',   file: 'Capricorn.svg',   dates: 'Dec 22 – Jan 19' },
  { key: 'aquarius',    name: 'Aquarius',    file: 'Aquarius.svg',    dates: 'Jan 20 – Feb 18' },
  { key: 'pisces',      name: 'Pisces',      file: 'Pisces.svg',      dates: 'Feb 19 – Mar 20' },
]

function zodiacSignFile(key: string): string {
  return zodiacSigns.find(s => s.key === key)?.file ?? `${key}.svg`
}

const currentSignName = computed(() =>
  featuredSign.value ? signDisplayName(featuredSign.value) : ''
)

const currentSignDates = computed(() =>
  zodiacSigns.find(s => s.key === featuredSign.value)?.dates ?? ''
)

function selectSign(key: string): void {
  navigateTo(`/daily?sign=${key}`)
}

const moonPhase = ref<string | null>(null)

function computeMoonPhase(date: Date): string {
  const known = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058867
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const cycle = ((diff % synodicMonth) + synodicMonth) % synodicMonth
  const pct = cycle / synodicMonth

  if (pct < 0.03 || pct >= 0.97) return '🌑 New Moon'
  if (pct < 0.22) return '🌒 Waxing Crescent'
  if (pct < 0.28) return '🌓 First Quarter'
  if (pct < 0.47) return '🌔 Waxing Gibbous'
  if (pct < 0.53) return '🌕 Full Moon'
  if (pct < 0.72) return '🌖 Waning Gibbous'
  if (pct < 0.78) return '🌗 Last Quarter'
  return '🌘 Waning Crescent'
}

// ── Cache data ─────────────────────────────────
interface ZodiacReading {
  horoscope:         string
  love:              string
  job:               string
  health:            string
  theme:             string
  moon_phase:        string
  sun_sign:          string
  moon_sign:         string
  planetary_weather: string
}

const loading      = ref(true)
const zodiacData    = ref<Record<string, ZodiacReading> | null>(null)

const featuredSignReading = computed<ZodiacReading | null>(() => {
  if (!featuredSign.value || !zodiacData.value) return null
  return zodiacData.value[featuredSign.value] ?? null
})

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0] : text
}

// ── Fetch on mount + scroll watcher ───────────
onMounted(async () => {
  window.addEventListener('scroll', onPageScroll, { passive: true })
  updatePageProgress()

  moonPhase.value = computeMoonPhase(today)

  try {
    const res = await $fetch<{
      success: boolean
      date:    string
      zodiac:  Record<string, ZodiacReading> | null
    }>('/api/get-daily-cache', { method: 'POST' })

    zodiacData.value    = res.zodiac    && Object.keys(res.zodiac).length    > 0 ? res.zodiac    : null
  } catch {
    zodiacData.value    = null
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onPageScroll)
  if (pageProgressRaf != null) cancelAnimationFrame(pageProgressRaf)
})

</script>

<style scoped>
/* ─────────────────────────────────────────────
   PAGE SHELL
───────────────────────────────────────────── */
.daily-page {
  min-height: 100vh;
  background: var(--omn-bg-page);
}

/* ── Film grain ── */
.page-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
  opacity: 0.08;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.93  0 0 0 0 0.90  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  animation: pageGrainShift 7s steps(8) infinite;
}
@keyframes pageGrainShift {
  0%   { transform: translate(0, 0); }
  20%  { transform: translate(3%, 4%); }
  40%  { transform: translate(4%, -2%); }
  60%  { transform: translate(2%, -4%); }
  80%  { transform: translate(4%, 3%); }
  100% { transform: translate(0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .page-grain { animation: none; }
}

/* ── Scroll progress hairline ── */
.page-scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 2px;
  height: 100vh;
  z-index: 100;
  pointer-events: none;
  background: var(--omn-border-subtle);
}
.page-scroll-progress__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: linear-gradient(180deg,
    var(--omn-accent-quiet) 0%,
    var(--omn-accent)       100%);
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 80ms linear;
}

/* ─────────────────────────────────────────────
   HERO BAND
───────────────────────────────────────────── */
.daily-hero {
  padding-bottom: 0 !important;
}

.daily-hero__content {
  padding-top: clamp(96px, 14vw, 160px);
  padding-bottom: clamp(48px, 6vw, 80px);
}

.daily-hero__headline-block {
  margin-top: var(--space-8);
}

.daily-hero__eyebrow {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-4);
  display: block;
}

.daily-hero__headline {
  margin: 0 0 var(--space-8);
}

.daily-hero__rule {
  width: var(--space-12);
  height: 1px;
  background: var(--omn-border-subtle);
}

/* ─────────────────────────────────────────────
   CONTENT SECTIONS — shared padding
───────────────────────────────────────────── */
.daily-horoscope {
  padding-top: clamp(40px, 6vw, 64px);
}

/* ─────────────────────────────────────────────
   LOADING / EMPTY
───────────────────────────────────────────── */
.daily-loading {
  padding-bottom: clamp(20px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 240px;
}

.daily-loading__bar {
  width: 160px;
  height: 1px;
  background: var(--omn-border-subtle);
  overflow: hidden;
}

.daily-loading__fill {
  height: 100%;
  background: var(--omn-accent);
  width: 0;
  animation: load-sweep 1.8s ease-in-out infinite;
}

@keyframes load-sweep {
  0%   { width: 0%;  margin-left: 0%; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%;  margin-left: 100%; }
}

.daily-empty {
  padding-bottom: clamp(20px, 5vw, 48px);
  color: var(--omn-text-tertiary);
}

.reading-empty {
  padding: var(--space-8) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reading-empty__label {
  color: var(--omn-text-tertiary);
}

.reading-empty__msg {
  max-width: 32ch;
  margin: 0;
}

.reading-empty__sub {
  color: var(--omn-text-tertiary);
  max-width: 44ch;
}

/* ─────────────────────────────────────────────
   SIGN SELECTOR GRID
───────────────────────────────────────────── */
.sign-selector {
  padding-bottom: clamp(48px, 8vw, 80px);
}

.sign-selector__prompt {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-7);
}

.sign-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--omn-border-subtle);
  border: 1px solid var(--omn-border-subtle);
  max-width: 680px;
}

@media (min-width: 640px) {
  .sign-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 900px) {
  .sign-grid { grid-template-columns: repeat(6, 1fr); }
}

.sign-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-3) var(--space-5);
  background: var(--omn-bg-page);
  border: none;
  cursor: pointer;
  transition: background var(--omn-duration-fast) var(--omn-ease);
  text-align: center;
}

.sign-tile:hover {
  background: var(--omn-bg-primary);
}

.sign-tile__img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  opacity: 0.7;
  transition: opacity var(--omn-duration-fast) var(--omn-ease);
}

.sign-tile:hover .sign-tile__img {
  opacity: 1;
}

.sign-tile__name {
  color: var(--omn-text-primary);
}

.sign-tile__dates {
  color: var(--omn-text-tertiary);
}

/* ─────────────────────────────────────────────
   SIGN MINI CARDS (others grid after featured)
───────────────────────────────────────────── */
.sign-grid--mini {
  gap: 1px;
}

.sign-mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  background: var(--omn-bg-page);
  text-decoration: none;
  transition: background var(--omn-duration-fast) var(--omn-ease);
  text-align: center;
}

.sign-mini-card:hover {
  background: var(--omn-bg-primary);
}

.sign-mini-card__img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  opacity: 0.45;
  transition: opacity var(--omn-duration-fast) var(--omn-ease);
}

.sign-mini-card:hover .sign-mini-card__img {
  opacity: 0.75;
}

.sign-mini-card__name {
  color: var(--omn-text-primary);
}

.sign-mini-card__theme {
  color: var(--omn-text-tertiary);
  margin: 0;
  line-height: 1.4;
}

.sign-mini-card__preview {
  display: none;
}

/* ─────────────────────────────────────────────
   READING VIEW
───────────────────────────────────────────── */
.reading-view {
  padding-bottom: var(--space-8);
}

/* ── Back link ── */
.back-link {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--omn-text-tertiary);
  padding: 0;
  margin-bottom: var(--space-7);
  display: inline-block;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}

.back-link:hover {
  color: var(--omn-text-primary);
}

/* ── AppDivider margin rhythm in reading view ── */
.reading-view :deep(.app-divider) {
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
}

.reading-cta :deep(.app-divider) {
  margin-top: var(--space-8);
  margin-bottom: var(--space-6);
}

/* ── Reading sign header ── */
.reading-sign-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-bottom: 0;
  padding-top: var(--space-8);
}

.reading-sign-header__sign {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.reading-sign-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.65;
  flex-shrink: 0;
}


.reading-sign-name {
  font-family: var(--omn-font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-regular);
  margin: 0 0 var(--space-1);
  color: var(--omn-text-primary);
}

/* ── Reading content ── */
.reading-content {
  padding-bottom: clamp(40px, 6vw, 80px);
}

.reading-content__theme {
  margin-bottom: var(--space-2);
}

.reading-content__theme-label {
  color: var(--omn-accent);
  display: block;
  margin-bottom: 0;
}

.reading-content__theme-text {
  max-width: 44ch;
  margin-top: var(--space-3);
}

.reading-moon-line {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-5);
  display: block;
}

.reading-content__body {
  padding: var(--space-2) 0;
}

.reading-content__para {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--omn-text-secondary);
  margin-bottom: var(--space-5);
}

/* ── Sign sections (love / work / health) ── */
.sign-sections {
  display: flex;
  flex-direction: column;
  margin: var(--space-4) 0;
}

.sign-section-row {
  display: grid;
  grid-template-columns: 16px 52px 1fr;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--omn-border-subtle);
}

.sign-section-row:first-child {
  border-top: none;
  padding-top: 0;
}

.section-icon {
  font-size: 11px;
  color: var(--omn-accent);
  line-height: 1;
}

.section-label {
  color: var(--omn-text-tertiary);
}

.section-text {
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--omn-text-secondary);
}

/* ── Planetary weather ── */
.reading-weather__text {
  color: var(--omn-text-tertiary);
  font-style: italic;
  font-size: var(--text-sm);
}

/* ── Reflection block ── */
.reading-reflection {
  padding: var(--space-5) 0;
  border-top: 1px solid var(--omn-border-subtle);
}

.reading-reflection__label {
  color: var(--omn-accent);
  margin-bottom: var(--space-2);
  display: block;
}

.reading-reflection__text {
  font-family: var(--omn-font-body);
  font-style: italic;
  font-size: var(--text-md);
  font-weight: var(--weight-light);
  color: var(--omn-text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ── Reading CTA ── */
.reading-cta {
  padding-top: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.reading-cta__pull {
  max-width: 36ch;
}

/* ─────────────────────────────────────────────
   OTHERS SECTION
───────────────────────────────────────────── */
.others-section {
  padding-bottom: clamp(48px, 8vw, 80px);
}

.others-section__label {
  color: var(--omn-text-tertiary);
  margin-bottom: var(--space-5);
}

/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */
@media (max-width: 480px) {
  .reading-sign-name {
    font-size: var(--text-xl);
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-loading__fill {
    animation: none;
  }
}
</style>
