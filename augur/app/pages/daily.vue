<template>
  <div class="daily-root">

    <!-- ── Ambient layers ──────────────────── -->
    <div class="bg-deep"   aria-hidden="true" />
    <div class="bg-nebula" aria-hidden="true" />


    <!-- ═══════════════════════════════════════
         HEADER
    ═══════════════════════════════════════════ -->
    <header class="site-header" role="banner">
      <NuxtLink to="/" class="header-logo" aria-label="OMENORA home">
        OMENORA
      </NuxtLink>
    </header>


    <!-- ═══════════════════════════════════════
         HERO
    ═══════════════════════════════════════════ -->
    <section class="hero" aria-label="Daily readings">
      <p class="hero-eyebrow">DAILY READINGS</p>
      <h1 class="hero-title">Your Daily Horoscope &amp; Archetype Reading</h1>
      <p class="hero-date">{{ formattedDate }}<span v-if="moonPhase" class="hero-moon"> · {{ moonPhase }}</span></p>
    </section>


    <!-- ═══════════════════════════════════════
         TAB SWITCHER
    ═══════════════════════════════════════════ -->
    <div class="tab-bar" role="tablist" aria-label="Reading type">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'horoscope' }"
        role="tab"
        :aria-selected="activeTab === 'horoscope'"
        @click="activeTab = 'horoscope'"
      >
        Daily Horoscope
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'archetype' }"
        role="tab"
        :aria-selected="activeTab === 'archetype'"
        @click="activeTab = 'archetype'"
      >
        Archetype Reading
      </button>
    </div>


    <!-- ═══════════════════════════════════════
         MAIN CONTENT
    ═══════════════════════════════════════════ -->
    <main class="main-content">

      <!-- Loading state -->
      <div v-if="loading" class="state-message" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true" />
        <p class="state-text">Loading today's readings…</p>
      </div>

      <!-- ── HOROSCOPE TAB ─────────────────── -->
      <template v-else-if="activeTab === 'horoscope'">

        <!-- No zodiac data -->
        <div v-if="!zodiacData" class="state-message">
          <p class="state-text">Today's horoscopes are being prepared. Check back shortly.</p>
        </div>

        <!-- Featured sign view -->
        <template v-else-if="featuredSign && featuredSignReading">
          <section class="featured-section" aria-label="Your horoscope">
            <NuxtLink to="/daily" class="back-link">← All signs</NuxtLink>
            <p class="sect-label">YOUR HOROSCOPE</p>
            <article class="featured-card" :aria-label="signDisplayName(featuredSign) + ' horoscope'">
              <p class="featured-archetype-name">{{ signDisplayName(featuredSign) }}</p>
              <p class="card-date">{{ cardDate }}</p>
              <p class="featured-theme">{{ featuredSignReading.theme }}</p>
              <p class="featured-moon-line">☽ Moon in {{ featuredSignReading.moon_sign }} · {{ featuredSignReading.moon_phase }}</p>
              <div class="featured-divider" aria-hidden="true" />
              <div class="sign-sections">
                <div class="sign-section-row">
                  <span class="section-icon" aria-hidden="true">♥</span>
                  <span class="section-label">LOVE</span>
                  <span class="section-text">{{ featuredSignReading.love }}</span>
                </div>
                <div class="sign-section-row">
                  <span class="section-icon" aria-hidden="true">✦</span>
                  <span class="section-label">WORK</span>
                  <span class="section-text">{{ featuredSignReading.job }}</span>
                </div>
                <div class="sign-section-row">
                  <span class="section-icon" aria-hidden="true">✿</span>
                  <span class="section-label">HEALTH</span>
                  <span class="section-text">{{ featuredSignReading.health }}</span>
                </div>
              </div>
              <div v-if="featuredSignReading.planetary_weather" class="featured-weather">
                <div class="weather-divider" aria-hidden="true" />
                <p class="weather-text">{{ featuredSignReading.planetary_weather }}</p>
              </div>
            </article>
          </section>

          <section class="others-section" aria-label="Other sign horoscopes">
            <p class="sect-label">ALL SIGNS</p>
            <div class="grid-3col">
              <template
                v-for="sign in otherSigns"
                :key="sign"
              >
                <article
                  v-if="zodiacData?.[sign]"
                  class="mini-card"
                  :aria-label="signDisplayName(sign) + ' horoscope'"
                >
                  <NuxtLink :to="`/daily?sign=${sign}`" class="mini-card-link">
                    <p class="mini-archetype-name">{{ signDisplayName(sign) }}</p>
                    <p class="card-date">{{ cardDate }}</p>
                    <p class="mini-theme">{{ zodiacData[sign]?.theme }}</p>
                    <div class="sign-sections sign-sections--mini">
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">♥</span>
                        <span class="section-label">LOVE</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.love ?? '') }}</span>
                      </div>
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">✦</span>
                        <span class="section-label">WORK</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.job ?? '') }}</span>
                      </div>
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">✿</span>
                        <span class="section-label">HEALTH</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.health ?? '') }}</span>
                      </div>
                    </div>
                  </NuxtLink>
                </article>
              </template>
            </div>
          </section>
        </template>

        <!-- All 12 signs grid -->
        <template v-else>
          <section aria-label="All sign horoscopes">
            <p class="sect-label">ALL SIGNS</p>
            <div class="grid-3col">
              <template
                v-for="sign in ALL_SIGNS"
                :key="sign"
              >
                <article
                  v-if="zodiacData?.[sign]"
                  class="mini-card"
                  :aria-label="signDisplayName(sign) + ' horoscope'"
                >
                  <NuxtLink :to="`/daily?sign=${sign}`" class="mini-card-link">
                    <p class="mini-archetype-name">{{ signDisplayName(sign) }}</p>
                    <p class="card-date">{{ cardDate }}</p>
                    <p class="mini-theme">{{ zodiacData[sign]?.theme }}</p>
                    <div class="sign-sections sign-sections--mini">
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">♥</span>
                        <span class="section-label">LOVE</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.love ?? '') }}</span>
                      </div>
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">✦</span>
                        <span class="section-label">WORK</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.job ?? '') }}</span>
                      </div>
                      <div class="sign-section-row">
                        <span class="section-icon" aria-hidden="true">✿</span>
                        <span class="section-label">HEALTH</span>
                        <span class="section-text">{{ firstSentence(zodiacData[sign]?.health ?? '') }}</span>
                      </div>
                    </div>
                  </NuxtLink>
                </article>
              </template>
            </div>
          </section>
        </template>

      </template>

      <!-- ── ARCHETYPE TAB ─────────────────── -->
      <template v-else-if="activeTab === 'archetype'">

        <!-- No archetype data -->
        <div v-if="!archetypeData" class="state-message">
          <p class="state-text">Today's archetype readings are being prepared. Check back shortly.</p>
        </div>

        <!-- Featured archetype view -->
        <template v-else-if="featuredArchetype && featuredReading">
          <section class="featured-section" aria-label="Your archetype reading">
            <NuxtLink to="/daily?tab=archetype" class="back-link">← All archetypes</NuxtLink>
            <p class="sect-label">YOUR ARCHETYPE</p>
            <article class="featured-card" :aria-label="featuredDisplayName + ' reading'">
              <p class="featured-archetype-name">{{ featuredDisplayName }}</p>
              <p class="featured-theme">{{ featuredReading.theme }}</p>
              <div class="featured-divider" aria-hidden="true" />
              <p class="featured-insight">{{ featuredReading.insight }}</p>
              <div v-if="featuredReading.reflection" class="featured-reflection">
                <p class="reflection-label">REFLECTION</p>
                <p class="reflection-text">{{ featuredReading.reflection }}</p>
              </div>
            </article>
          </section>

          <section class="others-section" aria-label="Other archetype readings">
            <p class="sect-label">ALL ARCHETYPES</p>
            <div class="grid-3col">
              <article
                v-for="slug in otherArchetypes"
                :key="slug"
                class="mini-card"
                :aria-label="archetypeDisplayName(slug) + ' reading'"
              >
                <NuxtLink :to="`/daily?archetype=${slug}`" class="mini-card-link">
                  <p class="mini-archetype-name">{{ archetypeDisplayName(slug) }}</p>
                  <p v-if="archetypeData[slug]" class="mini-theme">{{ archetypeData[slug]?.theme }}</p>
                  <p v-if="archetypeData[slug]" class="mini-insight">{{ firstSentence(archetypeData[slug]?.insight ?? '') }}</p>
                </NuxtLink>
              </article>
            </div>
          </section>
        </template>

        <!-- All 12 archetypes grid -->
        <template v-else>
          <section aria-label="All archetype readings">
            <p class="sect-label">ALL ARCHETYPES</p>
            <div class="grid-3col">
              <article
                v-for="slug in ALL_ARCHETYPES"
                :key="slug"
                class="mini-card"
                :aria-label="archetypeDisplayName(slug) + ' reading'"
              >
                <NuxtLink :to="`/daily?archetype=${slug}`" class="mini-card-link">
                  <p class="mini-archetype-name">{{ archetypeDisplayName(slug) }}</p>
                  <p v-if="archetypeData[slug]" class="mini-theme">{{ archetypeData[slug]?.theme }}</p>
                  <p v-if="archetypeData[slug]" class="mini-insight">{{ firstSentence(archetypeData[slug]?.insight ?? '') }}</p>
                </NuxtLink>
              </article>
            </div>
          </section>
        </template>

      </template>

    </main>



    <!-- ═══════════════════════════════════════
         CTA SECTION
    ═══════════════════════════════════════════ -->
    <section class="cta-section" aria-label="Personal report call to action">
      <p class="cta-eyebrow">WANT MORE THAN THE GENERAL READING?</p>
      <p class="cta-copy">
        Your horoscope is the general reading. Get a full personal report built from your exact birth date, time, and city.
      </p>
      <button class="cta-primary" @click="navigateTo('/')">
        Get My Personal Reading
        <span class="cta-arr" aria-hidden="true">→</span>
      </button>
    </section>


    <!-- ═══════════════════════════════════════
         PERSONAL SUBSCRIPTION CTA
    ═══════════════════════════════════════════ -->
    <div class="daily-sub-wrap">
      <div class="daily-sub-card">
        <div class="daily-sub-top">
          <span class="daily-sub-badge">PERSONAL</span>
          <span class="daily-sub-price">$4.99<span class="daily-sub-price-period">/mo</span></span>
        </div>
        <h2 class="daily-sub-headline">Get YOUR personal horoscope every morning</h2>
        <p class="daily-sub-copy">Based on your exact birth chart — not just your sun sign. Love, Work &amp; Health, personalized to you.</p>
        <NuxtLink to="/subscribe" class="daily-sub-btn">
          Start Personal Horoscope →
        </NuxtLink>
        <p class="daily-sub-note">Complete your free reading first, then subscribe</p>
      </div>
    </div>


    <!-- ═══════════════════════════════════════
         FOOTER
    ═══════════════════════════════════════════ -->
    <footer class="site-footer">
      <nav class="footer-nav" aria-label="Footer links">
        <NuxtLink to="/privacy" class="footer-link">Privacy</NuxtLink>
        <span class="footer-dot" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link">Terms</NuxtLink>
      </nav>
      <p class="footer-copy">© 2026 OMENORA</p>
      <p class="footer-disc">For entertainment and personal enrichment only. Not a substitute for professional advice.</p>
    </footer>

  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// ── SEO ───────────────────────────────────────
useSeoMeta({
  title: 'Free Daily Horoscope for All 12 Signs — OMENORA',
  description: 'Your free daily horoscope for today. Love, work and health reading for all 12 zodiac signs. Real planetary positions updated every morning.',
  ogTitle: 'Free Daily Horoscope for All 12 Signs — OMENORA',
  ogDescription: 'Love, work and health horoscope for Aries, Taurus, Gemini and all 12 signs. Real planetary data. Free every day.',
  ogUrl: 'https://omenora.com/daily',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
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

// ── Archetype map ──────────────────────────────
const ARCHETYPE_NAMES: Record<string, string> = {
  phoenix:    'The Phoenix',
  architect:  'The Silent Architect',
  storm:      'The Storm Caller',
  lighthouse: 'The Lighthouse',
  wanderer:   'The Wanderer',
  alchemist:  'The Alchemist',
  guardian:   'The Guardian',
  visionary:  'The Visionary',
  mirror:     'The Mirror',
  catalyst:   'The Catalyst',
  sage:       'The Sage',
  wildfire:   'The Wildfire',
}

const ALL_ARCHETYPES = Object.keys(ARCHETYPE_NAMES)

function archetypeDisplayName(slug: string): string {
  return ARCHETYPE_NAMES[slug] ?? slug
}

// ── Route & params ─────────────────────────────
const route = useRoute()

// ── Tab state ──────────────────────────────────
const activeTab = ref<'horoscope' | 'archetype'>('horoscope')

// ── Featured sign (horoscope tab) ─────────────
const featuredSign = computed<string | null>(() => {
  const param = route.query.sign
  if (typeof param === 'string' && param in SIGN_NAMES) return param
  return null
})

const otherSigns = computed(() =>
  ALL_SIGNS.filter(s => s !== featuredSign.value)
)

// ── Featured archetype (archetype tab) ────────
const featuredArchetype = computed<string | null>(() => {
  const param = route.query.archetype
  if (typeof param === 'string' && param in ARCHETYPE_NAMES) return param
  return null
})

const featuredDisplayName = computed(() =>
  featuredArchetype.value ? archetypeDisplayName(featuredArchetype.value) : ''
)

const otherArchetypes = computed(() =>
  ALL_ARCHETYPES.filter(s => s !== featuredArchetype.value)
)

// ── Date & moon phase ──────────────────────────
const today = new Date()

const formattedDate = computed(() =>
  today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const cardDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

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
interface ArchetypeReading {
  theme:      string
  insight:    string
  reflection: string
  moon_phase: string
}

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
const archetypeData = ref<Record<string, ArchetypeReading> | null>(null)
const zodiacData    = ref<Record<string, ZodiacReading> | null>(null)

const featuredReading = computed<ArchetypeReading | null>(() => {
  if (!featuredArchetype.value || !archetypeData.value) return null
  return archetypeData.value[featuredArchetype.value] ?? null
})

const featuredSignReading = computed<ZodiacReading | null>(() => {
  if (!featuredSign.value || !zodiacData.value) return null
  return zodiacData.value[featuredSign.value] ?? null
})

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0] : text
}

// ── Fetch on mount ─────────────────────────────
onMounted(async () => {
  moonPhase.value = computeMoonPhase(today)

  const tabParam = route.query.tab
  if (tabParam === 'archetype' || (route.query.archetype && typeof route.query.archetype === 'string')) {
    activeTab.value = 'archetype'
  } else if (route.query.sign && typeof route.query.sign === 'string') {
    activeTab.value = 'horoscope'
  }

  try {
    const res = await $fetch<{
      success:    boolean
      date:       string
      archetypes: Record<string, ArchetypeReading> | null
      zodiac:     Record<string, ZodiacReading>    | null
    }>('/api/get-daily-cache', { method: 'POST' })

    archetypeData.value = res.archetypes && Object.keys(res.archetypes).length > 0 ? res.archetypes : null
    zodiacData.value    = res.zodiac    && Object.keys(res.zodiac).length    > 0 ? res.zodiac    : null
  } catch {
    archetypeData.value = null
    zodiacData.value    = null
  } finally {
    loading.value = false
  }
})
</script>


<style scoped>

/* ─────────────────────────────────────────────
   ROOT & BACKGROUND
───────────────────────────────────────────── */
.daily-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--white-94);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.bg-deep {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 55% at 50% 0%,
      rgba(75,45,155,0.22) 0%,
      transparent 68%
    ),
    radial-gradient(
      ellipse 55% 45% at 15% 55%,
      rgba(50,25,110,0.12) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 45% 40% at 88% 75%,
      rgba(30,15,85,0.10) 0%,
      transparent 58%
    );
  pointer-events: none;
  z-index: 0;
}

.bg-nebula {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 40% 30% at 50% 20%,
      rgba(100,65,200,0.07) 0%,
      transparent 55%
    );
  pointer-events: none;
  z-index: 0;
}


/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */
.site-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid var(--white-09);
}

.header-logo {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--white-94);
  text-decoration: none;
}



/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px 32px;
}

.hero-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(201,168,76,0.55);
  text-transform: uppercase;
  margin: 0 0 16px;
}

.hero-title {
  font-family: var(--serif);
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--white-94);
  margin: 0 0 16px;
  line-height: 1.2;
}

.hero-date {
  font-size: 14px;
  color: var(--white-55);
  margin: 0;
  letter-spacing: 0.02em;
}

.hero-moon {
  color: var(--white-38);
}


/* ─────────────────────────────────────────────
   TAB BAR
───────────────────────────────────────────── */
.tab-bar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 0;
  border-bottom: 1px solid var(--white-09);
  margin-bottom: 40px;
  padding: 0 24px;
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--sans);
  letter-spacing: 0.04em;
  color: var(--white-38);
  cursor: pointer;
  transition:
    color        0.15s ease,
    border-color 0.15s ease;
  margin-bottom: -1px;
  -webkit-tap-highlight-color: transparent;
}

.tab-btn--active {
  color: var(--white-94);
  border-bottom-color: var(--gold);
}

.tab-btn:not(.tab-btn--active):hover {
  color: var(--white-70);
}


/* ─────────────────────────────────────────────
   SECTION LABEL (shared)
───────────────────────────────────────────── */
.sect-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(201,168,76,0.45);
  text-transform: uppercase;
  text-align: center;
  margin: 0 0 28px;
}


/* ─────────────────────────────────────────────
   MAIN CONTENT
───────────────────────────────────────────── */
.main-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}


/* ─────────────────────────────────────────────
   STATE MESSAGES (loading / empty)
───────────────────────────────────────────── */
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 80px 24px;
  text-align: center;
}

.state-text {
  font-size: 16px;
  color: var(--white-55);
  margin: 0;
  line-height: 1.6;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--white-09);
  border-top-color: var(--purple);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


/* ─────────────────────────────────────────────
   FEATURED SECTION
───────────────────────────────────────────── */
.featured-section {
  margin-bottom: 56px;
  text-align: center;
}

.featured-card {
  background: var(--white-05);
  border: 1px solid var(--white-09);
  border-radius: 24px;
  padding: 40px 36px;
  text-align: left;
  transition:
    background   0.18s ease,
    border-color 0.18s ease;
}

.featured-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.13);
}

.featured-archetype-name {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 400;
  color: var(--gold);
  margin: 0 0 10px;
  letter-spacing: 0.03em;
}

.featured-theme {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--white-55);
  margin: 0 0 12px;
}

.featured-moon-line {
  font-size: 13px;
  color: var(--white-38);
  margin: 0 0 24px;
  letter-spacing: 0.02em;
}

.featured-divider {
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, var(--gold), transparent);
  margin-bottom: 24px;
  opacity: 0.4;
}

.featured-insight {
  font-size: 17px;
  line-height: 1.75;
  color: var(--white-94);
  margin: 0 0 28px;
}

.featured-reflection {
  background: rgba(107,72,224,0.10);
  border: 1px solid rgba(107,72,224,0.22);
  border-radius: 14px;
  padding: 20px 24px;
}

.reflection-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--purple-hi);
  text-transform: uppercase;
  margin: 0 0 10px;
}

.reflection-text {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 300;
  color: var(--white-70);
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

.featured-weather {
  margin-top: 4px;
}

.weather-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(201,168,76,0.25), transparent);
  margin-bottom: 16px;
}

.weather-text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--white-55);
  margin: 0;
  font-style: italic;
}


/* ─────────────────────────────────────────────
   BACK LINK
───────────────────────────────────────────── */
.back-link {
  font-size: 13px;
  color: var(--white-55);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 24px;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--white-94);
}


/* ─────────────────────────────────────────────
   OTHERS / ALL GRID
───────────────────────────────────────────── */
.others-section {
  text-align: center;
}

.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mini-card {
  background: var(--white-05);
  border: 1px solid var(--white-09);
  border-radius: 18px;
  overflow: hidden;
  transition:
    background   0.18s ease,
    border-color 0.18s ease,
    transform    0.18s ease;
}

.mini-card:hover {
  background: rgba(255,255,255,0.075);
  border-color: rgba(255,255,255,0.13);
  transform: translateY(-2px);
}

.mini-card-link {
  display: block;
  padding: 22px 18px;
  text-decoration: none;
}

.mini-archetype-name {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 400;
  color: var(--gold);
  margin: 0 0 6px;
  letter-spacing: 0.02em;
}

.mini-theme {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--white-55);
  margin: 0 0 10px;
}

.mini-insight {
  font-size: 13px;
  line-height: 1.6;
  color: var(--white-70);
  margin: 0;
}


/* ─────────────────────────────────────────────
   CARD DATE
───────────────────────────────────────────── */
.card-date {
  font-size: 11px;
  color: var(--white-38);
  margin: 0 0 8px;
  letter-spacing: 0.02em;
}


/* ─────────────────────────────────────────────
   SIGN SECTIONS (love / work / health)
───────────────────────────────────────────── */
.sign-sections {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 4px;
}

.sign-sections--mini {
  margin-top: 10px;
}

.sign-section-row {
  display: grid;
  grid-template-columns: 14px 44px 1fr;
  align-items: baseline;
  gap: 6px;
  padding: 10px 0;
  border-top: 1px solid var(--white-09);
}

.sign-section-row:first-child {
  border-top: none;
  padding-top: 0;
}

.sign-sections--mini .sign-section-row {
  padding: 8px 0;
}

.section-icon {
  font-size: 11px;
  color: var(--gold);
  line-height: 1;
}

.section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--white-38);
  line-height: 1.4;
}

.section-text {
  font-size: 13px;
  line-height: 1.55;
  color: var(--white-70);
}


/* ─────────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────────── */
.cta-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px 80px;
  max-width: 560px;
  margin: 0 auto;
  border-top: 1px solid var(--white-09);
}

.cta-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(201,168,76,0.45);
  text-transform: uppercase;
  margin: 0 0 16px;
}

.cta-copy {
  font-size: 17px;
  line-height: 1.7;
  color: var(--white-70);
  margin: 0 0 32px;
  max-width: 440px;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--purple);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--sans);
  letter-spacing: 0.01em;
  padding: 17px 40px;
  min-height: 54px;
  cursor: pointer;
  transition:
    background  0.18s ease,
    box-shadow  0.18s ease,
    transform   0.12s ease;
  box-shadow:
    0 0 0 1px rgba(107,72,224,0.55),
    0 8px 32px rgba(107,72,224,0.32),
    0 2px 8px  rgba(0,0,0,0.35);
  -webkit-tap-highlight-color: transparent;
}

.cta-primary:hover {
  background: var(--purple-hi);
  box-shadow:
    0 0 0 1px rgba(123,90,242,0.65),
    0 12px 44px rgba(107,72,224,0.48),
    0 4px 12px rgba(0,0,0,0.40);
  transform: translateY(-1px);
}

.cta-primary:active {
  transform: translateY(0) scale(0.985);
  background: #5B38D0;
  box-shadow:
    0 0 0 1px rgba(107,72,224,0.45),
    0 4px 16px rgba(107,72,224,0.25);
}

.cta-arr {
  font-size: 18px;
  transition: transform 0.15s ease;
}

.cta-primary:hover .cta-arr {
  transform: translateX(3px);
}


/* ─────────────────────────────────────────────
   PERSONAL SUBSCRIPTION CARD
───────────────────────────────────────────── */
.daily-sub-wrap {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  padding: 0 24px 72px;
}

.daily-sub-card {
  padding: 28px 24px;
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.06) 0%, rgba(107, 72, 224, 0.04) 100%);
  border: 1px solid rgba(201, 168, 76, 0.28);
  border-radius: 16px;
}

.daily-sub-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.daily-sub-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.75);
}

.daily-sub-price {
  font-size: 22px;
  font-weight: 600;
  color: rgba(201, 168, 76, 0.95);
  line-height: 1;
}

.daily-sub-price-period {
  font-size: 13px;
  font-weight: 400;
  color: rgba(201, 168, 76, 0.55);
}

.daily-sub-headline {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  color: var(--white-94);
  margin: 0 0 10px;
  line-height: 1.35;
  letter-spacing: 0.01em;
}

.daily-sub-copy {
  font-size: 14px;
  line-height: 1.65;
  color: var(--white-55);
  margin: 0 0 24px;
}

.daily-sub-btn {
  display: block;
  width: 100%;
  padding: 16px;
  background: rgba(201, 168, 76, 0.12);
  border: 1px solid rgba(201, 168, 76, 0.42);
  border-radius: 10px;
  color: rgba(201, 168, 76, 0.95);
  font-size: 15px;
  font-weight: 500;
  font-family: var(--sans);
  letter-spacing: 0.02em;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.22s ease;
  box-sizing: border-box;
}

.daily-sub-btn:hover {
  background: rgba(201, 168, 76, 0.20);
  border-color: rgba(201, 168, 76, 0.65);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.08);
}

.daily-sub-note {
  text-align: center;
  font-size: 11px;
  color: var(--white-22);
  margin: 10px 0 0;
  letter-spacing: 0.03em;
}


/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
.site-footer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 24px 40px;
  border-top: 1px solid var(--white-09);
  text-align: center;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-link {
  font-size: 13px;
  color: var(--white-38);
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--white-70);
}

.footer-dot {
  color: var(--white-22);
  font-size: 14px;
}

.footer-copy {
  font-size: 12px;
  color: var(--white-22);
  margin: 0;
  letter-spacing: 0.04em;
}

.footer-disc {
  font-size: 11px;
  color: var(--white-22);
  margin: 0;
  max-width: 340px;
  line-height: 1.5;
}


/* ─────────────────────────────────────────────
   RESPONSIVE — MOBILE
───────────────────────────────────────────── */
@media (max-width: 720px) {
  .hero-title {
    font-size: 28px;
  }

  .tab-btn {
    font-size: 13px;
    padding: 12px 16px;
  }

  .featured-card {
    padding: 28px 20px;
  }

  .featured-archetype-name {
    font-size: 26px;
  }

  .featured-insight {
    font-size: 15px;
  }

  .grid-3col {
    grid-template-columns: 1fr;
  }

  .cta-primary {
    width: 100%;
    justify-content: center;
  }

  .daily-sub-card {
    padding: 20px 16px;
  }

  .daily-sub-btn {
    font-size: 14px;
  }
}

@media (min-width: 721px) and (max-width: 960px) {
  .grid-3col {
    grid-template-columns: repeat(2, 1fr);
  }
}

</style>
