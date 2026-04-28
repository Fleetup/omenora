<template>
  <AppShell>

    <!-- ① HERO -->
    <section class="hero">
      <div class="hero__layout">
        <div class="hero__inner">
          <p class="label-caps hero__issue">№ 001 — Six Traditions · Swiss Ephemeris Precision</p>
          <h1 class="hero__display">
            <span class="hero__display-italic">Omen</span>ora
          </h1>
          <div class="hero__rule" />
          <p class="pull-quote hero__pull">
            Six traditions. One reading.
            Built from your exact planetary positions.
          </p>
          <p class="hero__body">
            Most horoscopes are written for 1 in 12 people.
            Omenora calculates your exact planetary positions
            at the minute you were born — then reads them across
            Western, Vedic, BaZi, Tarot, Mayan, and Chinese
            traditions to build something written for you alone.
            Free. No account. 60 seconds.
          </p>
          <div class="hero__actions">
            <CTAButton to="/analysis" :arrow="true">Begin the reading</CTAButton>
            <CTAButton to="/compatibility-quiz" variant="outline">Check compatibility</CTAButton>
          </div>
        </div>

        <div class="hero__archetypes" aria-hidden="true">
          <div class="hero__archetypes-grid">
            <button
              v-for="(a, i) in archetypeSymbols"
              :key="a.key"
              class="hero__archetype-item"
              :class="{ 'hero__archetype-item--lit': litIndex === i }"
              @mouseenter="litIndex = i"
              @mouseleave="litIndex = highlightIndex"
              @click="navigateTo('/analysis')"
            >
              <img
                :src="`/symbols/${a.file}`"
                :alt="a.name"
                class="hero__archetype-img"
              />
            </button>
          </div>

          <div class="hero__archetypes-hook">
            <p class="hero__archetypes-question font-serif">
              One of these is yours.
            </p>
            <NuxtLink to="/analysis" class="label-caps hero__archetypes-cta">
              Find out which →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ② TRUST STRIP -->
    <section class="trust-strip">
      <div class="editorial-rule" />
      <div class="trust-strip__grid">
        <div class="trust-item">
          <span class="annotation trust-item__num">[01]</span>
          <span class="trust-item__label">No subscription</span>
        </div>
        <div class="trust-item">
          <span class="annotation trust-item__num">[02]</span>
          <span class="trust-item__label">No account required</span>
        </div>
        <div class="trust-item">
          <span class="annotation trust-item__num">[03]</span>
          <span class="trust-item__label">Results in 60 seconds</span>
        </div>
        <div class="trust-item">
          <span class="annotation trust-item__num">[04]</span>
          <span class="trust-item__label">Full report optional</span>
        </div>
      </div>
      <div class="editorial-rule" />
    </section>

    <!-- ③ TRADITIONS -->
    <section class="traditions">
      <div class="traditions__header">
        <p class="label-caps traditions__label">Six traditions. One chart.</p>
        <h2 class="traditions__headline font-serif">
          The most complete natal reading available.
        </h2>
      </div>
      <div class="traditions__grid">
        <article class="tradition-item" v-for="(t, i) in traditions" :key="i">
          <span class="annotation tradition-item__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="tradition-item__body">
            <h3 class="tradition-item__name font-serif">{{ t.name }}</h3>
            <p class="tradition-item__desc">{{ t.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- ④ ARCHETYPE SLIDESHOW -->
    <section class="archetype-slide-section">

      <div class="archetype-slide-section__inner">

        <!-- Left: symbol -->
        <div class="archetype-slide__visual">
          <Transition name="arch-fade" mode="out-in">
            <div
              :key="currentArchSlide"
              class="archetype-slide__symbol-wrap"
            >
              <img
                :src="`/symbols/${slides[currentArchSlide]?.file}`"
                :alt="slides[currentArchSlide]?.name"
                class="archetype-slide__symbol symbol-editorial"
              />
            </div>
          </Transition>
        </div>

        <!-- Right: text content -->
        <div class="archetype-slide__content">

          <p class="label-caps archetype-slide__eyebrow">
            Your Archetype
          </p>

          <Transition name="arch-slide" mode="out-in">
            <div :key="currentArchSlide" class="archetype-slide__text">
              <h2 class="archetype-slide__name font-display-italic">
                {{ slides[currentArchSlide]?.name }}
              </h2>
              <p class="archetype-slide__identity pull-quote">
                {{ slides[currentArchSlide]?.identity }}
              </p>
            </div>
          </Transition>

          <!-- Progress pips -->
          <div class="archetype-slide__progress">
            <button
              v-for="(_, i) in slides"
              :key="i"
              class="archetype-slide__pip"
              :class="{ 'archetype-slide__pip--active': i === currentArchSlide }"
              :aria-label="`View ${slides[i]?.name}`"
              @click="goToSlide(i)"
            />
          </div>

          <!-- Prev / next arrows -->
          <div class="archetype-slide__nav">
            <button
              class="archetype-slide__arrow label-caps"
              aria-label="Previous archetype"
              @click="prevSlide"
            >←</button>
            <button
              class="archetype-slide__arrow label-caps"
              aria-label="Next archetype"
              @click="nextSlide"
            >→</button>
          </div>

          <!-- CTA -->
          <div class="archetype-slide__cta">
            <EditorialRule />
            <p class="annotation archetype-slide__cta-hint">
              {{ currentArchSlide + 1 }} of {{ slides.length }}
            </p>
            <CTAButton to="/analysis" :arrow="true">
              Find your archetype
            </CTAButton>
          </div>

        </div>

      </div>

    </section>

    <!-- ⑤ FAQ -->
    <section class="faq">
      <p class="label-caps faq__label">Common questions</p>
      <div class="faq__list">
        <details class="faq-item" v-for="(item, i) in faqItems" :key="i">
          <summary class="faq-item__question font-serif">{{ item.question }}</summary>
          <p class="faq-item__answer">{{ item.answer }}</p>
        </details>
      </div>
    </section>

    <!-- ⑥ FINAL CTA -->
    <section class="final-cta">
      <div class="editorial-rule" />
      <div class="final-cta__inner">
        <h2 class="final-cta__headline font-display-italic">Your chart is waiting.</h2>
        <CTAButton to="/analysis" :arrow="true" :full="false">Begin the reading</CTAButton>
      </div>
      <div class="editorial-rule" />
    </section>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const { $trackLandingView } = useNuxtApp() as any

useSeoMeta({
  title: 'OMENORA — Free Daily Horoscope & Personal Astrology Reading',
  description: 'Free daily horoscope for all 12 signs plus your personal natal chart reading across 4 ancient traditions — Western, Vedic, BaZi & Tarot. No account required. Results in 60 seconds.',
  ogTitle: 'OMENORA — Free Daily Horoscope & Personal Astrology Reading',
  ogDescription: 'Free daily horoscope updated every morning. Personal natal chart reading across 4 ancient traditions. No account. 60 seconds.',
  ogImage: 'https://omenora.com/og-image.png',
  ogUrl: 'https://omenora.com',
  twitterCard: 'summary_large_image',
  twitterTitle: 'OMENORA — Personality & Astrology Reading',
  twitterDescription: 'Personality archetype + natal chart + 2026 forecast. Real Swiss Ephemeris calculations. No account. 60 seconds.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://omenora.com' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': 'https://omenora.com/#webapp',
        name: 'OMENORA',
        url: 'https://omenora.com',
        description: 'Personalized astrology and numerology reading based on real natal chart calculations across 4 ancient traditions.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        offers: [
          { '@type': 'Offer', name: 'Free Personality Preview', price: '0', priceCurrency: 'USD', description: 'Free personality archetype preview — identity section unlocked immediately' },
          { '@type': 'Offer', name: 'Basic Reading', price: '2.99', priceCurrency: 'USD', description: 'Full 7-section personality reading' },
          { '@type': 'Offer', name: 'Popular Bundle', price: '4.99', priceCurrency: 'USD', description: 'Full reading + 2026 destiny forecast + compatibility' },
          { '@type': 'Offer', name: 'Full Oracle', price: '12.99', priceCurrency: 'USD', description: 'Complete reading — all 7 sections, life path calendar, birth chart & all traditions' },
        ],
        featureList: ['Natal chart calculation via Swiss Ephemeris', 'Personality archetype from Sun, Moon and Rising signs', 'Numerology Life Path calculation', '2026 astrology forecast', 'Western, Vedic, BaZi and Tarot traditions'],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://omenora.com/#organization',
        name: 'OMENORA',
        url: 'https://omenora.com',
        logo: { '@type': 'ImageObject', url: 'https://omenora.com/android-chrome-512x512.png', width: 512, height: 512 },
        sameAs: [],
      }),
    },
  ],
})

// ── Reading count ────────────────────────────
const readingCount = ref('47,392')

// ── Traditions ───────────────────────────────
const traditions = [
  { name: 'Western Astrology', description: 'Your Sun, Moon, and Rising computed to the exact minute via Swiss Ephemeris. Not a sun-sign template — every planetary position is calculated from your precise birth data.' },
  { name: 'Vedic — Nakshatra', description: 'Your Moon Nakshatra placement within the 27-mansion lunar zodiac. Reveals the specific quality of your mind, instincts, and the hidden pattern beneath your surface personality.' },
  { name: 'Chinese — BaZi', description: 'Your Four Pillars of Destiny — the year, month, day, and hour stems and branches of your birth. Maps the elemental forces shaping your life path and timing windows.' },
  { name: 'Tarot Archetype', description: 'Your birth cards drawn from the Major Arcana. Each card maps to specific archetypal energies that run as a thread through your character and recurring life themes.' },
  { name: 'Personality Archetype', description: 'Your Sun, Moon, and Rising combined into 1 of 12 archetypes — reveals your core behavioral patterns, hidden strengths, relationship wiring, and the role you play in others\' lives.' },
  { name: 'Life Path Numerology', description: 'Calculated from your birth date — the single number that reveals the purpose and hidden pattern running through every major decision and recurring theme in your life.' },
]

// ── Archetype symbols (hero grid) ────────────
const archetypeSymbols = [
  { key: 'alchemist',  name: 'Alchemist',  file: 'alchemist.svg'  },
  { key: 'architect',  name: 'Architect',  file: 'architect.svg'  },
  { key: 'catalyst',   name: 'Catalyst',   file: 'catalyst.svg'   },
  { key: 'guardian',   name: 'Guardian',   file: 'guardian.svg'   },
  { key: 'lighthouse', name: 'Lighthouse', file: 'lighthouse.svg' },
  { key: 'mirror',     name: 'Mirror',     file: 'mirror.svg'     },
  { key: 'phoenix',    name: 'Phoenix',    file: 'phoenix.svg'    },
  { key: 'sage',       name: 'Sage',       file: 'sage.svg'       },
  { key: 'storm',      name: 'Storm',      file: 'storm.svg'      },
  { key: 'visionary',  name: 'Visionary',  file: 'visionary.svg'  },
  { key: 'wanderer',   name: 'Wanderer',   file: 'wanderer.svg'   },
  { key: 'wildfire',   name: 'Wildfire',   file: 'wildfire.svg'   },
]

const highlightIndex = ref(0)
const litIndex = ref(0)

let cycleTimer: ReturnType<typeof setInterval> | null = null

// ── Archetype slideshow ───────────────────────
const slides = [
  { key: 'alchemist',  name: 'The Alchemist',  file: 'alchemist.svg',  identity: 'The one who turns crisis into invention.' },
  { key: 'architect',  name: 'The Architect',  file: 'architect.svg',  identity: 'The one who builds what others only imagine.' },
  { key: 'catalyst',   name: 'The Catalyst',   file: 'catalyst.svg',   identity: 'The one who changes every room they enter.' },
  { key: 'guardian',   name: 'The Guardian',   file: 'guardian.svg',   identity: 'The one who protects without being asked.' },
  { key: 'lighthouse', name: 'The Lighthouse', file: 'lighthouse.svg', identity: 'The one others navigate toward in the dark.' },
  { key: 'mirror',     name: 'The Mirror',     file: 'mirror.svg',     identity: 'The one who reflects truth back to the world.' },
  { key: 'phoenix',    name: 'The Phoenix',    file: 'phoenix.svg',    identity: 'The one who rises stronger from every ending.' },
  { key: 'sage',       name: 'The Sage',       file: 'sage.svg',       identity: 'The one who knows before being told.' },
  { key: 'storm',      name: 'The Storm',      file: 'storm.svg',      identity: 'The one who moves through chaos with calm.' },
  { key: 'visionary',  name: 'The Visionary',  file: 'visionary.svg',  identity: 'The one who lives ten years ahead.' },
  { key: 'wanderer',   name: 'The Wanderer',   file: 'wanderer.svg',   identity: 'The one who finds home everywhere and nowhere.' },
  { key: 'wildfire',   name: 'The Wildfire',   file: 'wildfire.svg',   identity: 'The one who loves without a safety net.' },
]

const currentArchSlide = ref(0)
let archTimer: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  currentArchSlide.value = (currentArchSlide.value + 1) % slides.length
}

function prevSlide() {
  currentArchSlide.value = (currentArchSlide.value - 1 + slides.length) % slides.length
}

function goToSlide(i: number) {
  currentArchSlide.value = i
  if (archTimer) {
    clearInterval(archTimer)
    startArchTimer()
  }
}

function startArchTimer() {
  archTimer = setInterval(() => { nextSlide() }, 3200)
}

// ── FAQ ──────────────────────────────────────
const faqItems = [
  { question: 'How is this different from a regular horoscope?', answer: 'Regular horoscopes are written for 1 in 12 people who share your sun sign. Omenora calculates your exact planetary positions at the minute you were born using Swiss Ephemeris — the same software used by professional astrologers — then builds a reading specific to your unique chart.' },
  { question: 'Do I need to know my exact birth time?', answer: 'Birth time is optional. If you don\'t know it, we calculate your chart using solar noon as a default. The reading will still be accurate for your Sun, Moon, and most planetary positions — only your Rising sign and house placements require an exact time.' },
  { question: 'What traditions are included?', answer: 'Your reading covers six traditions: Western astrology, Vedic Nakshatra, Chinese BaZi (Four Pillars), Tarot archetypes, your Personality Archetype (synthesized from Sun, Moon, and Rising), and your Numerology Life Path number. Your initial reading is generated in one tradition — you can switch to any other tradition from the report page.' },
  { question: 'How long does it take?', answer: 'About 30 seconds to enter your birth details, then roughly 60 seconds for the AI to compute and write your full reading. The free preview is available immediately — no account, no subscription required.' },
  { question: 'Is the free preview really free?', answer: 'Yes. Your personality archetype and the Identity section of your reading are unlocked at no cost. The full report — all seven sections including your 2026 forecast — is available for a one-time payment starting at $2.99.' },
  { question: 'Do two people born on the same day get the same reading?', answer: 'No. Birth time and city change every planetary position. Two people born on the same day but in different cities or at different hours will have meaningfully different charts, different archetypes, and different readings.' },
  { question: 'Is there a subscription?', answer: 'The natal reading is a one-time payment — no subscription, no recurring charges. A separate Compatibility Plus subscription ($9.99/month) is available for unlimited compatibility readings and weekly relationship forecasts, but it is entirely optional.' },
]

onUnmounted(() => {
  if (cycleTimer) clearInterval(cycleTimer)
  if (archTimer) clearInterval(archTimer)
})

onMounted(async () => {
  const initial = Math.floor(Math.random() * 12)
  highlightIndex.value = initial
  litIndex.value = initial

  cycleTimer = setInterval(() => {
    const next = Math.floor(Math.random() * 12)
    highlightIndex.value = next
    litIndex.value = next
  }, 2500)

  startArchTimer()

  try {
    const data = await $fetch<{ count: number }>('/api/get-reading-count')
    if (data?.count) {
      readingCount.value = data.count.toLocaleString('en-US')
    }
  } catch {
    // silently keep fallback
  }

  $trackLandingView()

  // If the magic link email lands on the root URL instead of /account
  // (e.g. browser auto-strips the path), forward to /account preserving
  // the token_hash query param so the confirm flow can proceed.
  if (new URLSearchParams(window.location.search).get('token_hash')) {
    window.location.replace('/account' + window.location.search)
    return
  }
})
</script>

<style scoped>
/* ── Shared layout ── */
section {
  padding-left: clamp(20px, 5vw, 80px);
  padding-right: clamp(20px, 5vw, 80px);
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* ── ① Hero ── */
.hero {
  padding-top: clamp(64px, 12vw, 120px);
  padding-bottom: clamp(40px, 8vw, 80px);
}
.hero__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
  align-items: center;
}
@media (min-width: 900px) {
  .hero__layout { grid-template-columns: 1fr 1fr; gap: 80px; }
}
.hero__inner { max-width: 820px; }
.hero__issue { color: var(--color-ink-faint); margin-bottom: 28px; }
.hero__display {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-size: var(--text-display);
  line-height: 0.88;
  letter-spacing: -0.04em;
  margin: 0 0 40px;
  color: var(--color-ink);
}
.hero__display-italic { font-style: italic; }
.hero__rule { width: 64px; height: 1px; background: var(--color-ink-mid); margin-bottom: 36px; }
.hero__pull { max-width: 38ch; margin-bottom: 24px; color: var(--color-ink); }
.hero__body { font-size: var(--text-body); line-height: 1.7; max-width: 48ch; color: var(--color-ink-mid); margin-bottom: 40px; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 48px; }

/* ── ② Trust strip ── */
.trust-strip { padding-top: 0; padding-bottom: 0; }
.trust-strip__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 32px;
  padding: 32px 0;
}
@media (min-width: 640px) {
  .trust-strip__grid { grid-template-columns: repeat(4, 1fr); }
}
.trust-item { display: flex; flex-direction: column; gap: 4px; }
.trust-item__num { color: var(--color-ink-faint); }
.trust-item__label { font-family: 'Hanken Grotesk', sans-serif; font-size: 13px; font-weight: 500; color: var(--color-ink); }

/* ── ③ Traditions ── */
.traditions { padding-top: var(--space-section); padding-bottom: var(--space-section); }
.traditions__header { max-width: 600px; margin-bottom: var(--space-block); }
.traditions__label { color: var(--color-ink-faint); margin-bottom: 16px; }
.traditions__headline { font-size: var(--text-headline); font-weight: 300; line-height: 1.15; letter-spacing: -0.02em; margin: 0; color: var(--color-ink); }
.traditions__grid { display: grid; grid-template-columns: 1fr; gap: 0; border-top: 1px solid var(--color-ink-ghost); }
@media (min-width: 768px) { .traditions__grid { grid-template-columns: repeat(2, 1fr); } }
.tradition-item {
  padding: 28px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 0 16px;
  align-items: start;
}
@media (min-width: 768px) {
  .tradition-item:nth-child(odd) { padding-right: 40px; }
  .tradition-item:nth-child(even) { padding-left: 40px; border-left: 1px solid var(--color-ink-ghost); }
}
.tradition-item__num { padding-top: 4px; color: var(--color-ink-faint); }
.tradition-item__name { font-size: 20px; font-weight: 400; letter-spacing: -0.01em; margin: 0 0 8px; color: var(--color-ink); }
.tradition-item__desc { font-size: var(--text-caption); line-height: 1.65; color: var(--color-ink-mid); margin: 0; }

/* ── Hero archetype grid ── */
.hero__archetypes {
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: flex-start;
}
.hero__archetypes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
}
.hero__archetype-item {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 50%;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 0.18;
}
.hero__archetype-item:hover {
  opacity: 0.95;
  transform: scale(1.08);
}
.hero__archetype-item--lit {
  opacity: 0.9;
  transform: scale(1.06);
}
.hero__archetype-img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  filter: brightness(0) saturate(100%);
  display: block;
}
.hero__archetypes-hook {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hero__archetypes-question {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 400;
  font-style: italic;
  color: var(--color-ink);
  margin: 0;
  line-height: 1.2;
}
.hero__archetypes-cta {
  color: var(--color-ink-faint);
  text-decoration: none;
  font-size: 10px;
  letter-spacing: 0.3em;
  transition: color 0.2s;
}
.hero__archetypes-cta:hover { color: var(--color-ink); }
@media (max-width: 900px) {
  .hero__archetypes { display: none; }
}

/* ── ④ Archetype slideshow ── */
.archetype-slide-section {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
  border-top: 1px solid var(--color-ink-ghost);
  border-bottom: 1px solid var(--color-ink-ghost);
}

.archetype-slide-section__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(40px, 8vw, 120px);
  align-items: center;
  min-height: 480px;
}

@media (max-width: 768px) {
  .archetype-slide-section__inner {
    grid-template-columns: 1fr;
    gap: 40px;
    min-height: auto;
  }
}

.archetype-slide__visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.archetype-slide__symbol-wrap {
  width: min(380px, 100%);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.archetype-slide__symbol {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.archetype-slide__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.archetype-slide__eyebrow {
  color: var(--color-ink-faint);
}

.archetype-slide__text {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.archetype-slide__name {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(40px, 7vw, 72px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0;
  color: var(--color-ink);
}

.archetype-slide__identity {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(20px, 3vw, 28px);
  font-style: italic;
  font-weight: 300;
  line-height: 1.3;
  color: var(--color-ink-mid);
  margin: 0;
  max-width: 32ch;
}

.archetype-slide__progress {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.archetype-slide__pip {
  width: 20px;
  height: 1px;
  background: var(--color-ink-ghost);
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: background 0.2s;
  position: relative;
}

.archetype-slide__pip::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}

.archetype-slide__pip--active::after {
  transform: scaleX(1);
}

.archetype-slide__nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.archetype-slide__arrow {
  background: none;
  border: 1px solid var(--color-ink-ghost);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--color-ink-faint);
  transition: border-color 0.2s, color 0.2s;
}

.archetype-slide__arrow:hover {
  border-color: var(--color-ink);
  color: var(--color-ink);
}

.archetype-slide__cta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.archetype-slide__cta-hint {
  color: var(--color-ink-faint);
}

/* Transitions */
.arch-fade-enter-active,
.arch-fade-leave-active {
  transition: opacity 0.5s ease;
}
.arch-fade-enter-from,
.arch-fade-leave-to {
  opacity: 0;
}

.arch-slide-enter-active,
.arch-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.arch-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.arch-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── ⑤ FAQ ── */
.faq { padding-top: var(--space-section); padding-bottom: var(--space-section); max-width: 720px; }
.faq__label { color: var(--color-ink-faint); margin-bottom: var(--space-block); }
.faq__list { display: flex; flex-direction: column; }
.faq-item { border-top: 1px solid var(--color-ink-ghost); padding: 20px 0; }
.faq-item:last-child { border-bottom: 1px solid var(--color-ink-ghost); }
.faq-item__question {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.3;
  cursor: pointer;
  list-style: none;
  color: var(--color-ink);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq-item__question::after {
  content: '+';
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: var(--color-ink-faint);
  flex-shrink: 0;
  margin-left: 16px;
  transition: transform 0.2s;
}
details[open] .faq-item__question::after { transform: rotate(45deg); }
.faq-item__answer { font-size: 15px; line-height: 1.7; color: var(--color-ink-mid); margin: 16px 0 0; max-width: 60ch; }

/* ── ⑥ Final CTA ── */
.final-cta { padding-top: 0; padding-bottom: var(--space-section); }
.final-cta__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  padding: var(--space-block) 0;
}
@media (min-width: 640px) {
  .final-cta__inner { flex-direction: row; align-items: center; justify-content: space-between; }
}
.final-cta__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: var(--text-title);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
  color: var(--color-ink);
}
</style>
