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
      <NuxtLink to="/" class="header-back">
        ← Back to home
      </NuxtLink>
    </header>


    <!-- ═══════════════════════════════════════
         HERO LABEL
    ═══════════════════════════════════════════ -->
    <section class="hero" aria-label="Daily archetype readings">
      <p class="hero-eyebrow">DAILY READINGS</p>
      <h1 class="hero-title">Today's Archetype Readings</h1>
      <p class="hero-date">{{ formattedDate }}<span v-if="moonPhase" class="hero-moon"> · {{ moonPhase }}</span></p>
    </section>


    <!-- ═══════════════════════════════════════
         MAIN CONTENT
    ═══════════════════════════════════════════ -->
    <main class="main-content">

      <!-- Loading state -->
      <div v-if="loading" class="state-message" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true" />
        <p class="state-text">Loading today's readings…</p>
      </div>

      <!-- No cache state -->
      <div v-else-if="!loading && !cacheData" class="state-message">
        <p class="state-text">Today's readings are being prepared. Check back shortly.</p>
      </div>

      <!-- Content: single archetype featured -->
      <template v-else-if="featuredArchetype && featuredReading">

        <!-- Featured card -->
        <section class="featured-section" aria-label="Your archetype reading">
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

        <!-- Other archetypes -->
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
                <p v-if="cacheData?.[slug]" class="mini-theme">{{ cacheData?.[slug]?.theme }}</p>
                <p v-if="cacheData?.[slug]" class="mini-insight">{{ firstSentence(cacheData?.[slug]?.insight ?? '') }}</p>
              </NuxtLink>
            </article>
          </div>
        </section>

      </template>

      <!-- Content: all 12 archetypes grid -->
      <template v-else-if="!featuredArchetype && cacheData">
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
                <p v-if="cacheData?.[slug]" class="mini-theme">{{ cacheData?.[slug]?.theme }}</p>
                <p v-if="cacheData?.[slug]" class="mini-insight">{{ firstSentence(cacheData?.[slug]?.insight ?? '') }}</p>
              </NuxtLink>
            </article>
          </div>
        </section>
      </template>

    </main>


    <!-- ═══════════════════════════════════════
         EMAIL CAPTURE
    ═══════════════════════════════════════════ -->
    <section class="email-section" aria-label="Daily reading email signup">
      <p class="sect-label">STAY CONNECTED</p>
      <h2 class="email-headline">Get your archetype's daily reading in your inbox</h2>

      <form
        v-if="!emailSuccess"
        class="email-form"
        @submit.prevent="submitEmail"
        aria-label="Email capture form"
        novalidate
      >
        <div class="email-row">
          <input
            v-model="emailInput"
            type="email"
            class="email-input"
            placeholder="your@email.com"
            autocomplete="email"
            inputmode="email"
            aria-label="Your email address"
            :aria-invalid="emailError ? 'true' : 'false'"
            :disabled="emailSubmitting"
          />
          <button
            type="submit"
            class="email-btn"
            :disabled="emailSubmitting"
          >
            {{ emailSubmitting ? 'Sending…' : 'Subscribe' }}
          </button>
        </div>
        <p v-if="emailError" class="email-error" role="alert">{{ emailError }}</p>
        <p class="email-privacy">No spam. Unsubscribe anytime.</p>
      </form>

      <div v-else class="email-success" role="status" aria-live="polite">
        <p class="email-success-text">You're in. Your daily reading arrives tomorrow morning.</p>
      </div>
    </section>


    <!-- ═══════════════════════════════════════
         CTA SECTION
    ═══════════════════════════════════════════ -->
    <section class="cta-section" aria-label="Personal report call to action">
      <p class="cta-eyebrow">WANT MORE THAN THE GENERAL READING?</p>
      <p class="cta-copy">
        This is the general reading for your archetype. Get your personal report — built from your exact birth data.
      </p>
      <button class="cta-primary" @click="navigateTo('/')">
        Get My Personal Reading
        <span class="cta-arr" aria-hidden="true">→</span>
      </button>
    </section>


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
  title: 'Daily Archetype Readings — OMENORA',
  description:
    'Daily cosmic insight for all 12 personality archetypes. ' +
    'Discover today\'s theme, reflection, and guidance based on your OMENORA archetype.',
  ogTitle: 'Daily Archetype Readings — OMENORA',
  ogDescription: 'Daily insight for all 12 personality archetypes — themes, reflections, and guidance.',
  ogUrl: 'https://omenora.com/daily',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
})

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
}

const loading  = ref(true)
const cacheData = ref<Record<string, ArchetypeReading> | null>(null)

const featuredReading = computed<ArchetypeReading | null>(() => {
  if (!featuredArchetype.value || !cacheData.value) return null
  return cacheData.value[featuredArchetype.value] ?? null
})

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0] : text
}

// ── Email capture ──────────────────────────────
const emailInput     = ref('')
const emailError     = ref('')
const emailSubmitting = ref(false)
const emailSuccess   = ref(false)

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function submitEmail() {
  emailError.value = ''
  if (!validateEmail(emailInput.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  emailSubmitting.value = true
  try {
    await $fetch('/api/capture-email', {
      method: 'POST',
      body: {
        email:     emailInput.value.trim().toLowerCase(),
        source:    'daily-page',
        archetype: featuredArchetype.value ?? null,
      },
    })
    emailSuccess.value = true
  } catch {
    emailError.value = 'Something went wrong. Please try again.'
  } finally {
    emailSubmitting.value = false
  }
}

// ── Fetch on mount ─────────────────────────────
onMounted(async () => {
  moonPhase.value = computeMoonPhase(today)
  try {
    const res = await $fetch<{ success: boolean; date: string; data: Record<string, ArchetypeReading> | null }>('/api/get-daily-cache', { method: 'POST' })
    cacheData.value = res.data && Object.keys(res.data).length > 0 ? res.data : null
    console.log('[daily] cacheData keys:', cacheData.value ? Object.keys(cacheData.value) : 'null')
  } catch {
    cacheData.value = null
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

.header-back {
  font-size: 13px;
  color: var(--white-55);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 0.15s ease;
}

.header-back:hover {
  color: var(--white-94);
}


/* ─────────────────────────────────────────────
   HERO LABEL
───────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px 40px;
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
    background  0.18s ease,
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
  margin: 0 0 24px;
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


/* ─────────────────────────────────────────────
   OTHERS / ALL ARCHETYPES GRID
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
    background  0.18s ease,
    border-color 0.18s ease,
    transform   0.18s ease;
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
  color: var(--white-38);
  margin: 0 0 10px;
}

.mini-insight {
  font-size: 13px;
  line-height: 1.6;
  color: var(--white-55);
  margin: 0;
}


/* ─────────────────────────────────────────────
   EMAIL CAPTURE
───────────────────────────────────────────── */
.email-section {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  padding: 72px 24px 56px;
  text-align: center;
}

.email-headline {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 400;
  color: var(--white-94);
  margin: 0 0 32px;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.email-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.email-row {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 440px;
}

.email-input {
  flex: 1;
  height: 50px;
  padding: 0 18px;
  background: var(--white-05);
  border: 1px solid var(--white-22);
  border-radius: 12px;
  color: var(--white-94);
  font-size: 15px;
  font-family: var(--sans);
  outline: none;
  transition:
    border-color 0.15s ease,
    background   0.15s ease;
  -webkit-appearance: none;
  appearance: none;
}

.email-input::placeholder {
  color: var(--white-38);
}

.email-input:focus {
  border-color: var(--purple-hi);
  background: rgba(107,72,224,0.07);
}

.email-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.email-btn {
  height: 50px;
  padding: 0 24px;
  background: var(--purple);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--sans);
  letter-spacing: 0.02em;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background  0.18s ease,
    transform   0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.email-btn:hover {
  background: var(--purple-hi);
  transform: translateY(-1px);
}

.email-btn:active {
  transform: translateY(0) scale(0.985);
  background: #5B38D0;
}

.email-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.email-error {
  font-size: 13px;
  color: #f08080;
  margin: 0;
}

.email-privacy {
  font-size: 12px;
  color: var(--white-38);
  margin: 4px 0 0;
  letter-spacing: 0.02em;
}

.email-success {
  padding: 20px 28px;
  background: rgba(107,72,224,0.12);
  border: 1px solid rgba(107,72,224,0.28);
  border-radius: 14px;
  max-width: 440px;
  margin: 0 auto;
}

.email-success-text {
  font-size: 16px;
  color: var(--white-94);
  margin: 0;
  line-height: 1.5;
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

  .email-row {
    flex-direction: column;
  }

  .email-btn {
    width: 100%;
  }

  .cta-primary {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: 721px) and (max-width: 960px) {
  .grid-3col {
    grid-template-columns: repeat(2, 1fr);
  }
}

</style>
