<template>
  <AppShell :dark="true">

    <!-- Tab switcher in header action slot -->
    <template #headerAction>
      <div class="daily-tabs">
        <button
          class="daily-tab label-caps"
          :class="{ 'daily-tab--active': activeTab === 'horoscope' }"
          @click="activeTab = 'horoscope'"
        >
          Daily
        </button>
        <span class="daily-tab-sep">·</span>
        <button
          class="daily-tab label-caps"
          :class="{ 'daily-tab--active': activeTab === 'archetype' }"
          @click="activeTab = 'archetype'"
        >
          Archetype
        </button>
      </div>
    </template>

    <!-- ── TAB: DAILY HOROSCOPE ── -->
    <div v-if="activeTab === 'horoscope'" class="daily-horoscope">

      <!-- Section header -->
      <div class="daily-header">
        <p class="label-caps daily-header__eyebrow">{{ todayFormatted }}</p>
        <h1 class="daily-header__headline font-display-italic">Daily Horoscope</h1>
        <div class="daily-header__rule" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="daily-loading">
        <div class="daily-loading__bar"><div class="daily-loading__fill" /></div>
        <p class="annotation">Loading today's readings…</p>
      </div>

      <!-- No data -->
      <div v-else-if="!zodiacData" class="daily-empty">
        <p class="annotation">Today's horoscopes are being prepared. Check back shortly.</p>
      </div>

      <!-- Featured sign: no reading yet (cache empty or error) -->
      <template v-else-if="featuredSign && !featuredSignReading">
        <div class="reading-view">
          <button class="back-link label-caps" @click="navigateTo('/daily')">← All signs</button>

          <div class="reading-sign-header">
            <div class="reading-sign-header__sign">
              <img
                :src="`/symbols/${zodiacSignFile(featuredSign)}`"
                :alt="currentSignName"
                class="reading-sign-img"
              />
              <div>
                <h2 class="font-serif reading-sign-name">{{ currentSignName }}</h2>
                <span class="annotation">{{ currentSignDates }}</span>
              </div>
            </div>
          </div>

          <EditorialRule />

          <div class="reading-empty">
            <p class="label-caps reading-empty__label">{{ todayFormatted }}</p>
            <p class="pull-quote reading-empty__msg">Today's reading is being prepared.</p>
            <p class="annotation reading-empty__sub">Daily horoscopes are generated each morning. Check back shortly.</p>
            <button class="back-link label-caps" @click="navigateTo('/daily')" style="margin-top: 24px">← Choose another sign</button>
          </div>
        </div>
      </template>

      <!-- Featured sign view (deep link ?sign=) -->
      <template v-else-if="featuredSign && featuredSignReading">
        <div class="reading-view">
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
                <h2 class="font-serif reading-sign-name">{{ currentSignName }}</h2>
                <span class="annotation">{{ currentSignDates }}</span>
              </div>
            </div>
          </div>

          <EditorialRule />

          <div class="reading-content">
            <div class="reading-content__theme">
              <span class="label-caps reading-content__theme-label">Today's theme</span>
              <p class="pull-quote reading-content__theme-text">{{ featuredSignReading.theme }}</p>
            </div>

            <EditorialRule />

            <p class="annotation reading-moon-line">
              ☽ Moon in {{ featuredSignReading.moon_sign }} · {{ featuredSignReading.moon_phase }}
            </p>

            <div class="sign-sections">
              <div class="sign-section-row">
                <HoroscopeSymbol type="love" :size="18" class="section-icon" />
                <span class="section-label label-caps">Love</span>
                <span class="section-text">{{ featuredSignReading.love }}</span>
              </div>
              <div class="sign-section-row">
                <HoroscopeSymbol type="work" :size="18" class="section-icon" />
                <span class="section-label label-caps">Work</span>
                <span class="section-text">{{ featuredSignReading.job }}</span>
              </div>
              <div class="sign-section-row">
                <HoroscopeSymbol type="health" :size="18" class="section-icon" />
                <span class="section-label label-caps">Health</span>
                <span class="section-text">{{ featuredSignReading.health }}</span>
              </div>
            </div>

            <div v-if="featuredSignReading.planetary_weather" class="reading-weather">
              <EditorialRule />
              <p class="annotation reading-weather__text">{{ featuredSignReading.planetary_weather }}</p>
            </div>

            <div class="reading-cta">
              <EditorialRule ornament="◇" />
              <p class="pull-quote reading-cta__pull">
                This is your sun sign forecast. Your natal chart gives the full picture.
              </p>
              <CTAButton to="/analysis" :arrow="true">Get your natal reading</CTAButton>
            </div>
          </div>
        </div>

        <!-- Other signs grid -->
        <div class="others-section">
          <p class="label-caps others-section__label">All Signs</p>
          <div class="sign-grid sign-grid--mini">
            <template v-for="sign in otherSigns" :key="sign">
              <NuxtLink
                v-if="zodiacData?.[sign]"
                :to="`/daily?sign=${sign}`"
                class="sign-mini-card"
              >
                <img :src="`/symbols/${zodiacSignFile(sign)}`" :alt="signDisplayName(sign)" class="sign-mini-card__img" />
                <span class="label-caps sign-mini-card__name">{{ signDisplayName(sign) }}</span>
                <p class="annotation sign-mini-card__theme">{{ zodiacData[sign]?.theme }}</p>
                <p class="annotation sign-mini-card__preview">{{ firstSentence(zodiacData[sign]?.love ?? '') }}</p>
              </NuxtLink>
            </template>
          </div>
        </div>
      </template>

      <!-- All 12 signs selector grid -->
      <template v-else>
        <div class="sign-selector">
          <p class="annotation sign-selector__prompt">Select your sun sign</p>
          <div class="sign-grid">
            <button
              v-for="sign in zodiacSigns"
              :key="sign.key"
              class="sign-tile"
              @click="selectSign(sign.key)"
            >
              <img :src="`/symbols/${sign.file}`" :alt="sign.name" class="sign-tile__img" />
              <span class="label-caps sign-tile__name">{{ sign.name }}</span>
              <span class="annotation sign-tile__dates">{{ sign.dates }}</span>
            </button>
          </div>
        </div>
      </template>

    </div>

    <!-- ── TAB: ARCHETYPE READING ── -->
    <div v-if="activeTab === 'archetype'" class="daily-archetype">

      <div class="daily-header">
        <p class="label-caps daily-header__eyebrow">{{ todayFormatted }}</p>
        <h1 class="daily-header__headline font-display-italic">Archetype Reading</h1>
        <div class="daily-header__rule" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="daily-loading">
        <div class="daily-loading__bar"><div class="daily-loading__fill" /></div>
        <p class="annotation">Loading today's readings…</p>
      </div>

      <!-- No data -->
      <div v-else-if="!archetypeData" class="daily-empty">
        <p class="annotation">Today's archetype readings are being prepared. Check back shortly.</p>
      </div>

      <!-- Featured archetype: no reading yet (cache empty or error) -->
      <template v-else-if="featuredArchetype && !featuredReading">
        <div class="reading-view">
          <button class="back-link label-caps" @click="navigateTo('/daily?tab=archetype')">← All archetypes</button>

          <div class="reading-sign-header">
            <div class="reading-sign-header__sign">
              <img
                :src="`/symbols/${selectedArchetypeFile}`"
                :alt="featuredDisplayName"
                class="reading-archetype-symbol symbol-editorial"
              />
              <div>
                <h2 class="font-serif reading-sign-name">{{ featuredDisplayName }}</h2>
                <span class="annotation">Archetype Reading</span>
              </div>
            </div>
          </div>

          <EditorialRule />

          <div class="reading-empty">
            <p class="label-caps reading-empty__label">{{ todayFormatted }}</p>
            <p class="pull-quote reading-empty__msg">Today's reading is being prepared.</p>
            <p class="annotation reading-empty__sub">Archetype readings are generated each morning. Check back shortly.</p>
            <button class="back-link label-caps" @click="navigateTo('/daily?tab=archetype')" style="margin-top: 24px">← Choose another archetype</button>
          </div>
        </div>
      </template>

      <!-- Featured archetype view (deep link ?archetype=) -->
      <template v-else-if="featuredArchetype && featuredReading">
        <div class="reading-view">
          <button class="back-link label-caps" @click="navigateTo('/daily?tab=archetype')">← All archetypes</button>

          <div class="reading-sign-header">
            <div class="reading-sign-header__sign">
              <img
                :src="`/symbols/${selectedArchetypeFile}`"
                :alt="featuredDisplayName"
                class="reading-archetype-symbol symbol-editorial"
              />
              <div>
                <h2 class="font-serif reading-sign-name">{{ featuredDisplayName }}</h2>
                <span class="annotation">Archetype Reading</span>
              </div>
            </div>
          </div>

          <EditorialRule />

          <div class="reading-content">
            <div class="reading-content__theme">
              <span class="label-caps reading-content__theme-label">Today's focus</span>
              <p class="pull-quote reading-content__theme-text">{{ featuredReading.theme }}</p>
            </div>

            <EditorialRule />

            <div class="reading-content__body">
              <p class="reading-content__para">{{ featuredReading.insight }}</p>
            </div>

            <div v-if="featuredReading.reflection" class="reading-reflection">
              <p class="label-caps reading-reflection__label">Reflection</p>
              <p class="reading-reflection__text font-serif-italic">{{ featuredReading.reflection }}</p>
            </div>

            <div class="reading-cta">
              <EditorialRule ornament="◇" />
              <p class="pull-quote reading-cta__pull">Don't know your archetype yet?</p>
              <CTAButton to="/analysis" :arrow="true">Discover yours</CTAButton>
            </div>
          </div>
        </div>

        <!-- Other archetypes grid -->
        <div class="others-section">
          <p class="label-caps others-section__label">All Archetypes</p>
          <div class="archetype-grid archetype-grid--mini">
            <NuxtLink
              v-for="slug in otherArchetypes"
              :key="slug"
              :to="`/daily?archetype=${slug}`"
              class="archetype-mini-card"
            >
              <img
                :src="`/symbols/${archetypeFile(slug)}`"
                :alt="archetypeDisplayName(slug)"
                class="archetype-mini-card__img symbol-editorial"
              />
              <span class="label-caps archetype-mini-card__name">{{ archetypeDisplayName(slug) }}</span>
              <p v-if="archetypeData[slug]" class="annotation archetype-mini-card__theme">{{ archetypeData[slug]?.theme }}</p>
            </NuxtLink>
          </div>
        </div>
      </template>

      <!-- All archetypes selector grid -->
      <template v-else>
        <div class="archetype-selector">
          <p class="annotation archetype-selector__prompt">Select your archetype</p>
          <div class="archetype-grid">
            <button
              v-for="a in archetypeList"
              :key="a.key"
              class="archetype-tile"
              @click="selectArchetype(a.key)"
            >
              <img
                :src="`/symbols/${a.file}`"
                :alt="a.name"
                class="archetype-tile__img symbol-editorial"
              />
              <span class="label-caps archetype-tile__name">{{ a.name }}</span>
            </button>
          </div>
        </div>
      </template>

    </div>

    <!-- ── CTA STRIP ── -->
    <div class="daily-cta-strip">
      <EditorialRule />
      <div class="daily-cta-strip__inner">
        <p class="pull-quote daily-cta-strip__pull">
          <template v-if="featuredSign">See what YOUR chart says beyond {{ signDisplayName(featuredSign) }}</template>
          <template v-else-if="featuredArchetype">Get your full {{ archetypeDisplayName(featuredArchetype) }} reading</template>
          <template v-else>Your horoscope is the general reading. Get the full picture.</template>
        </p>
        <CTAButton to="/analysis" :arrow="true">Get my natal reading</CTAButton>
      </div>
    </div>

    <!-- ── SUBSCRIPTION CARD ── -->
    <div class="daily-sub-wrap">
      <div class="daily-sub-card">
        <div class="daily-sub-top">
          <span class="label-caps daily-sub-badge">Personal</span>
          <span class="daily-sub-price font-serif">$4.99<span class="daily-sub-price-period">/mo</span></span>
        </div>
        <h2 class="font-serif-italic daily-sub-headline">Get YOUR personal horoscope every morning</h2>
        <p class="annotation daily-sub-copy">Based on your exact birth chart — not just your sun sign. Love, Work &amp; Health, personalized to you.</p>
        <NuxtLink to="/subscribe" class="daily-sub-btn label-caps">Start Personal Horoscope →</NuxtLink>
        <p class="annotation daily-sub-note">Cancel anytime · No commitment</p>
      </div>
    </div>

  </AppShell>
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

const todayFormatted = formattedDate

const cardDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

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

// ── Archetype list (for selector grid) ────────
const archetypeList = [
  { key: 'phoenix',    name: 'The Phoenix',          file: 'phoenix@2x.png'    },
  { key: 'architect',  name: 'The Silent Architect',  file: 'architect@2x.png'  },
  { key: 'storm',      name: 'The Storm Caller',      file: 'storm@2x.png'      },
  { key: 'lighthouse', name: 'The Lighthouse',        file: 'lighthouse@2x.png' },
  { key: 'wanderer',   name: 'The Wanderer',          file: 'wanderer@2x.png'   },
  { key: 'alchemist',  name: 'The Alchemist',         file: 'alchemist@2x.png'  },
  { key: 'guardian',   name: 'The Guardian',          file: 'guardian@2x.png'   },
  { key: 'visionary',  name: 'The Visionary',         file: 'visionary@2x.png'  },
  { key: 'mirror',     name: 'The Mirror',            file: 'mirror@2x.png'     },
  { key: 'catalyst',   name: 'The Catalyst',          file: 'catalyst@2x.png'   },
  { key: 'sage',       name: 'The Sage',              file: 'sage@2x.png'       },
  { key: 'wildfire',   name: 'The Wildfire',          file: 'wildfire@2x.png'   },
]

function archetypeFile(key: string): string {
  return archetypeList.find(a => a.key === key)?.file ?? `${key}@2x.png`
}

const selectedArchetypeFile = computed(() =>
  featuredArchetype.value ? archetypeFile(featuredArchetype.value) : ''
)

function selectArchetype(key: string): void {
  navigateTo(`/daily?archetype=${key}`)
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
   TAB SWITCHER
───────────────────────────────────────────── */
.daily-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.daily-tab {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--color-ink-faint);
  transition: color 0.2s;
}

.daily-tab--active {
  color: var(--color-ink);
}

.daily-tab-sep {
  color: var(--color-ink-faint);
  opacity: 0.5;
  font-size: 12px;
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
.daily-header {
  padding: clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px) 0;
  max-width: 1400px;
  margin: 0 auto;
}

.daily-header__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.daily-header__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 9vw, 80px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 32px;
  color: var(--color-ink);
}

.daily-header__rule {
  width: 48px;
  height: 1px;
  background: var(--color-ink-ghost);
  margin-bottom: 40px;
}

/* ─────────────────────────────────────────────
   LOADING / EMPTY
───────────────────────────────────────────── */
.daily-loading {
  padding: clamp(20px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 240px;
}

.daily-loading__bar {
  width: 160px;
  height: 1px;
  background: var(--color-ink-ghost);
  overflow: hidden;
}

.daily-loading__fill {
  height: 100%;
  background: var(--color-gold);
  width: 0;
  animation: load-sweep 1.8s ease-in-out infinite;
}

@keyframes load-sweep {
  0%   { width: 0%;  margin-left: 0%; }
  50%  { width: 60%; margin-left: 20%; }
  100% { width: 0%;  margin-left: 100%; }
}

.daily-empty {
  padding: clamp(20px, 5vw, 48px);
  color: var(--color-ink-faint);
}

.reading-empty {
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reading-empty__label {
  color: var(--color-ink-faint);
}

.reading-empty__msg {
  max-width: 32ch;
  margin: 0;
}

.reading-empty__sub {
  color: var(--color-ink-faint);
  max-width: 44ch;
}

/* ─────────────────────────────────────────────
   SIGN SELECTOR GRID
───────────────────────────────────────────── */
.sign-selector {
  padding: 0 clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.sign-selector__prompt {
  color: var(--color-ink-faint);
  margin-bottom: 28px;
}

.sign-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-ink-ghost);
  border: 1px solid var(--color-ink-ghost);
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
  gap: 10px;
  padding: 24px 12px 20px;
  background: var(--color-bone);
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: center;
}

.sign-tile:hover {
  background: var(--color-bone-dim);
}

.sign-tile__img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  /* Darken the gold fill to ink color for strong contrast on bone */
  filter: brightness(0) saturate(0);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.sign-tile:hover .sign-tile__img {
  opacity: 1;
}

.sign-tile__name {
  color: var(--color-ink);
}

.sign-tile__dates {
  color: var(--color-ink-faint);
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
  gap: 6px;
  padding: 18px 12px;
  background: var(--color-bone);
  text-decoration: none;
  transition: background 0.15s;
  text-align: center;
}

.sign-mini-card:hover {
  background: var(--color-bone-dim);
}

.sign-mini-card__img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: brightness(0) saturate(0);
  opacity: 0.45;
  transition: opacity 0.2s;
}

.sign-mini-card:hover .sign-mini-card__img {
  opacity: 0.75;
}

.sign-mini-card__name {
  color: var(--color-ink);
}

.sign-mini-card__theme {
  color: var(--color-ink-faint);
  margin: 0;
  line-height: 1.4;
}

.sign-mini-card__preview {
  display: none;
}

/* ─────────────────────────────────────────────
   ARCHETYPE SELECTOR GRID
───────────────────────────────────────────── */
.archetype-selector {
  padding: 0 clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.archetype-selector__prompt {
  color: var(--color-ink-faint);
  margin-bottom: 28px;
}

.archetype-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-ink-ghost);
  border: 1px solid var(--color-ink-ghost);
  max-width: 680px;
}

@media (min-width: 640px) {
  .archetype-grid { grid-template-columns: repeat(4, 1fr); }
}

.archetype-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 12px;
  background: var(--color-bone);
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.archetype-tile:hover {
  background: var(--color-bone-dim);
}

.archetype-tile__img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.archetype-tile:hover .archetype-tile__img {
  opacity: 1;
}

.archetype-tile__name {
  color: var(--color-ink);
}

/* ─────────────────────────────────────────────
   ARCHETYPE MINI CARDS
───────────────────────────────────────────── */
.archetype-grid--mini {
  gap: 1px;
}

.archetype-mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--color-bone);
  text-decoration: none;
  transition: background 0.15s;
  text-align: center;
}

.archetype-mini-card:hover {
  background: var(--color-bone-dim);
}

.archetype-mini-card__img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  opacity: 0.75;
  transition: opacity 0.15s;
}

.archetype-mini-card:hover .archetype-mini-card__img {
  opacity: 1;
}

.archetype-mini-card__name {
  color: var(--color-ink);
}

.archetype-mini-card__theme {
  color: var(--color-ink-faint);
  margin: 0;
  line-height: 1.4;
}

/* ─────────────────────────────────────────────
   READING VIEW
───────────────────────────────────────────── */
.reading-view {
  padding: 0 clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Back link ── */
.back-link {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-faint);
  padding: 0;
  margin-bottom: 28px;
  display: inline-block;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-ink);
}

/* ── Reading sign header ── */
.reading-sign-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 8px;
}

.reading-sign-header__sign {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reading-sign-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: brightness(0) saturate(0);
  opacity: 0.6;
  flex-shrink: 0;
}

.reading-archetype-symbol {
  width: 48px;
  height: 48px;
  object-fit: contain;
  opacity: 0.8;
  flex-shrink: 0;
}

.reading-sign-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 4px;
  color: var(--color-ink);
}

/* ── Reading content ── */
.reading-content {
  padding: 0 0 clamp(40px, 6vw, 80px);
}

.reading-content__theme {
  margin-bottom: 8px;
}

.reading-content__theme-label {
  color: var(--color-gold);
  display: block;
  margin-bottom: 12px;
}

.reading-content__theme-text {
  margin: 0;
  max-width: 44ch;
  color: var(--color-ink);
}

.reading-moon-line {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
  display: block;
}

.reading-content__body {
  padding: 8px 0;
}

.reading-content__para {
  font-size: var(--text-body, 17px);
  line-height: 1.8;
  color: var(--color-ink-mid);
  margin-bottom: 20px;
}

/* ── Sign sections (love / work / health) ── */
.sign-sections {
  display: flex;
  flex-direction: column;
  margin: 16px 0;
}

.sign-section-row {
  display: grid;
  grid-template-columns: 16px 52px 1fr;
  align-items: baseline;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.sign-section-row:first-child {
  border-top: none;
  padding-top: 0;
}

.section-icon {
  font-size: 11px;
  color: var(--color-gold);
  line-height: 1;
}

.section-label {
  color: var(--color-ink-faint);
}

.section-text {
  font-size: var(--text-caption, 13px);
  line-height: 1.65;
  color: var(--color-ink-mid);
}

/* ── Planetary weather ── */
.reading-weather__text {
  color: var(--color-ink-faint);
  font-style: italic;
  font-size: var(--text-caption, 13px);
}

/* ── Reflection block ── */
.reading-reflection {
  padding: 20px 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.reading-reflection__label {
  color: var(--color-gold);
  margin-bottom: 8px;
  display: block;
}

.reading-reflection__text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 18px;
  font-weight: 300;
  color: var(--color-ink-mid);
  line-height: 1.65;
  margin: 0;
}

/* ── Reading CTA ── */
.reading-cta {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reading-cta__pull {
  max-width: 36ch;
  margin: 0;
  color: var(--color-ink-mid);
}

/* ─────────────────────────────────────────────
   OTHERS SECTION
───────────────────────────────────────────── */
.others-section {
  padding: 0 clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.others-section__label {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

/* ─────────────────────────────────────────────
   CTA STRIP
───────────────────────────────────────────── */
.daily-cta-strip {
  padding: 0 clamp(20px, 5vw, 80px) clamp(32px, 5vw, 48px);
  max-width: 1400px;
  margin: 0 auto;
}

.daily-cta-strip__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 24px 0;
}

.daily-cta-strip__pull {
  margin: 0;
  max-width: 44ch;
  color: var(--color-ink-mid);
}

/* ─────────────────────────────────────────────
   SUBSCRIPTION CARD
───────────────────────────────────────────── */
.daily-sub-wrap {
  padding: 0 clamp(20px, 5vw, 80px) clamp(48px, 8vw, 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.daily-sub-card {
  padding: 24px 20px;
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid var(--rule-gold, rgba(201, 169, 97, 0.4));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  max-width: 480px;
}

.daily-sub-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.daily-sub-badge {
  color: var(--color-gold);
}

.daily-sub-price {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--color-gold);
  line-height: 1;
}

.daily-sub-price-period {
  font-size: 13px;
  color: var(--color-gold-dim);
}

.daily-sub-headline {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 20px;
  font-weight: 300;
  color: var(--color-ink);
  margin: 0;
  line-height: 1.35;
}

.daily-sub-copy {
  color: var(--color-ink-faint);
  margin: 0;
}

.daily-sub-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid var(--rule-gold, rgba(201, 169, 97, 0.4));
  color: var(--color-gold);
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.daily-sub-btn:hover {
  background: rgba(201, 169, 97, 0.18);
  border-color: var(--color-gold);
}

.daily-sub-note {
  color: var(--color-ink-faint);
  margin: 0;
  text-align: left;
}

/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */
@media (max-width: 480px) {
  .reading-sign-name {
    font-size: 22px;
  }

  .daily-sub-headline {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-loading__fill {
    animation: none;
  }
}
</style>
