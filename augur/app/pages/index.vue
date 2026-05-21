<template>
  <AppShell>

    <!-- ① HERO -->
    <section class="hero">
      <picture class="hero__bg">
        <source media="(max-width: 768px)" type="image/avif" srcset="/images/hero/hero-bg-mobile.avif" />
        <source media="(max-width: 768px)" type="image/webp" srcset="/images/hero/hero-bg-mobile.webp" />
        <source type="image/avif" srcset="/images/hero/hero-bg-desktop.avif" />
        <source type="image/webp" srcset="/images/hero/hero-bg-desktop.webp" />
        <img
          src="/images/hero/hero-bg-desktop.webp"
          alt=""
          width="1440"
          height="900"
          loading="eager"
          fetchpriority="high"
          class="hero__bg-img"
        />
      </picture>
      <div class="hero__scrim" aria-hidden="true" />

      <div class="hero__layout">
        <div class="hero__inner">
          <p class="label-caps hero__issue">№ 001 · OMENORA</p>

          <h1 class="hero__display">
            <span
              v-for="(w, i) in headlineWords"
              :key="i"
              class="hero__word"
              :style="{ '--d': (300 + i * 80) + 'ms' }"
            ><em v-if="w.emphasis" class="hero__display-em">{{ w.text }}</em><template v-else>{{ w.text }}</template></span>
          </h1>

          <p
            v-if="heroVariant.subhead"
            class="hero__subhead"
            :style="{ '--d': delays.subhead }"
          >{{ heroVariant.subhead }}</p>

          <p class="hero__body" :style="{ '--d': delays.body }">{{ heroVariant.bodyText }}</p>

          <p
            v-if="showPricing"
            class="hero__pricing"
            :style="{ '--d': delays.pricing }"
          >Founding deposit: <span class="hero__pricing-amount">$20</span> · One-time · Refundable for 7 days</p>

          <div class="hero__actions">
            <div
              class="hero__cta-wrap hero__cta-wrap--primary"
              :style="{ '--d': delays.primary, '--cta-pulse-delay': delays.primaryPulse }"
            >
              <CTAButton :to="heroVariant.primaryCtaTo" variant="cta" :full="true">{{ heroVariant.primaryCtaText }}</CTAButton>
            </div>
            <div
              v-if="heroVariant.secondaryCtaText"
              class="hero__cta-wrap hero__cta-wrap--secondary"
              :style="{ '--d': delays.secondary }"
            >
              <CTAButton :to="heroVariant.secondaryCtaTo!" variant="outline" :full="true">{{ heroVariant.secondaryCtaText }}</CTAButton>
            </div>
          </div>

          <p class="hero__social" :style="{ '--d': delays.social }">
            <span class="hero__social-count">{{ readingCount }}</span> charts read · No subscription required · 60 seconds
          </p>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <img
            src="/images/hero/archetype-glow.webp"
            alt=""
            loading="lazy"
            decoding="async"
            class="hero__glow"
          />
          <img
            src="/images/hero/hero-celestial.webp"
            alt=""
            loading="lazy"
            decoding="async"
            class="hero__celestial"
          />
          <div class="hero__archetypes">
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
      </div>
    </section>

    <!-- ② TRUST STRIP -->
    <section class="trust-strip">
      <div class="editorial-rule" />
      <div class="trust-strip__grid">
        <div class="trust-item">
          <span class="annotation trust-item__num">[01]</span>
          <span class="trust-item__label">Founding Member offer</span>
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

    <!-- ③ COMPATIBILITY TEASER -->
    <section class="compat-teaser">
      <div class="compat-teaser__inner">

        <!-- Left: copy -->
        <div class="compat-teaser__copy">
          <p class="label-caps compat-teaser__eyebrow">Compatibility</p>
          <h2 class="compat-teaser__headline font-display-italic">
            How two archetypes meet.
          </h2>
          <div class="compat-teaser__rule" />
          <p class="compat-teaser__body">
            Every relationship is a collision of two charts. Omenora calculates
            both natal profiles and reads them against each other — revealing
            what draws you together, where you'll clash, and what makes it last.
            No account. Results in 60 seconds.
          </p>
          <CTAButton to="/compatibility-quiz" variant="outline" :arrow="true">
            Check compatibility
          </CTAButton>
        </div>

        <!-- Right: two overlapping archetype symbols -->
        <div class="compat-teaser__visual" aria-hidden="true">
          <div class="compat-teaser__symbols">
            <img
              src="/symbols/phoenix.svg"
              alt="Phoenix archetype"
              class="compat-teaser__symbol compat-teaser__symbol--a symbol-editorial"
            />
            <img
              src="/symbols/guardian.svg"
              alt="Guardian archetype"
              class="compat-teaser__symbol compat-teaser__symbol--b symbol-editorial"
            />
          </div>
          <p class="annotation compat-teaser__visual-hint">
            Your archetype + theirs
          </p>
        </div>

      </div>
    </section>

    <!-- ④ TRADITIONS -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
const { $trackLandingView, $trackCustomEvent } = useNuxtApp() as any
const route = useRoute()
const { trackEvent: clarityTrack } = useClarity()

// ── Hero variant system ───────────────────────────────────────────────
interface HeroVariant {
  variantKey:       string
  headline:         string
  headlineEmphasis?: string   // single word italicized in the display headline
  subhead:          string
  bodyText:         string
  primaryCtaText:   string
  primaryCtaTo:     string
  secondaryCtaText: string | null
  secondaryCtaTo:   string | null
}

const DEFAULT_HERO: HeroVariant = {
  variantKey:       'default_founding',
  headline:         'Find out who you actually are.',
  headlineEmphasis: 'actually',
  subhead:          'Six traditions. One reading. Built from your exact planetary positions, in 60 seconds.',
  bodyText:         'Most horoscopes are written for 1 in 12 people. OMENORA reads your exact birth chart across six traditions. Join before public launch — $20 today, 50% off Premium for life.',
  primaryCtaText:   'Become a Founding Member — $20',
  primaryCtaTo:     '/founding',
  secondaryCtaText: 'Try the free reading',
  secondaryCtaTo:   '/analysis',
}

function resolveHeroVariant(utmCreative: string): HeroVariant {
  const c = utmCreative.toLowerCase()

  if (c.includes('archetype')) {
    return {
      variantKey:       'archetype',
      headline:         'One of twelve archetypes is yours.',
      subhead:          'Find out which one in 60 seconds.',
      bodyText:         'Your exact planetary positions at the minute you were born map to one of twelve cosmic archetypes. Free reading. No account. 60 seconds.',
      primaryCtaText:   'Find your archetype',
      primaryCtaTo:     '/analysis',
      secondaryCtaText: null,
      secondaryCtaTo:   null,
    }
  }

  if (c.includes('compat') || c.includes('relationship')) {
    return {
      variantKey:       'compatibility',
      headline:         'Are you actually compatible?',
      subhead:          'Real birth chart comparison. Not a sun sign quiz.',
      bodyText:         'Two birth charts read against each other across seven dimensions of compatibility. Bond, strength, challenge, communication, power dynamic, forecast, and advice. Free preview in 60 seconds.',
      primaryCtaText:   'Check compatibility',
      primaryCtaTo:     '/compatibility-quiz',
      secondaryCtaText: null,
      secondaryCtaTo:   null,
    }
  }

  if (c.includes('accuracy') || c.includes('shock')) {
    return {
      variantKey:       'accuracy',
      headline:         'This will read you better than your therapist.',
      subhead:          'Real planetary calculations. Not vague horoscope text.',
      bodyText:         'OMENORA uses Swiss Ephemeris — the same software professional astrologers use — to calculate your exact birth chart. Then it reads you across six traditions to find the patterns you already know are true.',
      primaryCtaText:   'See what it knows about you',
      primaryCtaTo:     '/analysis',
      secondaryCtaText: null,
      secondaryCtaTo:   null,
    }
  }

  if (c.includes('pattern')) {
    return {
      variantKey:       'pattern',
      headline:         'The pattern you keep seeing isn\'t random.',
      subhead:          'It\'s in your chart.',
      bodyText:         'The things you keep attracting, the situations that keep repeating, the way you keep responding — these are written in your planetary positions. OMENORA reads them and shows you the pattern.',
      primaryCtaText:   'Read my chart',
      primaryCtaTo:     '/analysis',
      secondaryCtaText: null,
      secondaryCtaTo:   null,
    }
  }

  if (c.includes('disappear')) {
    return {
      variantKey:       'disappear',
      headline:         'Why people keep disappearing from your life.',
      subhead:          'Your birth chart explains the pattern.',
      bodyText:         'When the same kind of person keeps leaving, it\'s not random. Your chart shows the dynamic you keep recreating — and how to break it. Read in 60 seconds.',
      primaryCtaText:   'See the pattern',
      primaryCtaTo:     '/analysis',
      secondaryCtaText: null,
      secondaryCtaTo:   null,
    }
  }

  return { ...DEFAULT_HERO }
}

const heroVariant = computed<HeroVariant>(() => {
  const src = route.query.utm_source as string | undefined
  if (!src) return { ...DEFAULT_HERO }
  const creative = (route.query.utm_creative as string) || ''
  return resolveHeroVariant(creative)
})

// ── Hero entrance choreography ────────────────────────────────────────
// Headline reveals word-by-word; downstream stages cascade from word count.
const headlineWords = computed(() =>
  heroVariant.value.headline.split(' ').map((text) => ({
    text,
    emphasis: !!heroVariant.value.headlineEmphasis
      && text.replace(/[.,!?;:]+$/, '') === heroVariant.value.headlineEmphasis,
  }))
)

// Pricing strip only shows on the founding-deposit funnel, hidden on free-reading variants.
const showPricing = computed(() => heroVariant.value.primaryCtaTo === '/founding')

// Stage delays (ms), derived from headline length so the cascade adapts per variant.
const delays = computed(() => {
  const n = headlineWords.value.length
  const subhead = 300 + n * 80 + 200
  const body = subhead + 200
  const pricing = body + 200
  const primary = (showPricing.value ? pricing : body) + 200
  const secondary = primary + 100
  const social = secondary + 100
  return {
    subhead:      `${subhead}ms`,
    body:         `${body}ms`,
    pricing:      `${pricing}ms`,
    primary:      `${primary}ms`,
    primaryPulse: `${primary + 500}ms`,
    secondary:    `${secondary}ms`,
    social:       `${social}ms`,
  }
})

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
          { '@type': 'Offer', name: 'Basic Reading', price: '4.99', priceCurrency: 'USD', description: 'Full 7-section personality reading' },
          { '@type': 'Offer', name: 'Popular Bundle', price: '9.99', priceCurrency: 'USD', description: 'Full reading + 2026 destiny forecast + compatibility' },
          { '@type': 'Offer', name: 'Full Oracle', price: '24.99', priceCurrency: 'USD', description: 'Complete reading — all 7 sections, life path calendar, birth chart & all traditions' },
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
  { question: 'Is the free preview really free?', answer: 'Yes. Your personality archetype and the Identity section of your reading are unlocked at no cost. The full report — all seven sections including your 2026 forecast — is available for a one-time $4.99 payment, OR included with Premium subscription, OR free for Founding Members.' },
  { question: 'Do two people born on the same day get the same reading?', answer: 'No. Birth time and city change every planetary position. Two people born on the same day but in different cities or at different hours will have meaningfully different charts, different archetypes, and different readings.' },
  { question: 'Is there a subscription?', answer: 'OMENORA Premium is a $14.99/month subscription that unlocks the full mobile app experience — daily insights, unlimited Counsel, compatibility readings, and your complete birth chart. Web-only one-time purchases remain available if you prefer no subscription. Founding Members get 50% off Premium for life.' },
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
  try { $trackCustomEvent?.('landing_hero_variant', { variant: heroVariant.value.variantKey }) } catch { /* never block UI */ }
  clarityTrack('landing_hero_variant_' + heroVariant.value.variantKey)

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
  position: relative;
  padding-top: clamp(56px, 12vw, 120px);
  padding-bottom: clamp(48px, 8vw, 80px);
  overflow: hidden;
}
.hero__bg { position: absolute; inset: 0; z-index: 0; }
.hero__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  animation: heroBgIn 800ms var(--ease-out-expo) both;
}
.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(26, 14, 34, 0.58) 0%,
    rgba(26, 14, 34, 0.32) 38%,
    rgba(26, 14, 34, 0.82) 100%
  );
}
.hero__layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  align-items: center;
}
@media (min-width: 900px) {
  .hero__layout { grid-template-columns: 1.05fr 0.95fr; gap: 72px; }
}
.hero__inner { max-width: 540px; }
@media (min-width: 900px) { .hero__inner { max-width: 600px; } }

.hero__issue {
  color: var(--color-ink-faint);
  margin: 0 0 22px;
  animation: heroDrop 400ms var(--ease-out-expo) 100ms both;
}

.hero__display {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-size: var(--text-hero-headline);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0 0 22px;
  color: var(--color-ink);
}
@media (min-width: 900px) {
  .hero__display { font-size: clamp(48px, 5vw, 66px); line-height: 0.98; }
}
.hero__word {
  display: inline-block;
  margin-right: 0.26em;
  animation: heroRise 600ms var(--ease-out-expo) var(--d, 0ms) both;
}
.hero__display-em { font-style: italic; }

.hero__subhead {
  font-family: 'Cormorant Garamond', serif;
  font-size: var(--text-subhead);
  font-style: italic;
  font-weight: 300;
  line-height: 1.35;
  color: var(--color-ink-mid);
  max-width: 30ch;
  margin: 0 0 22px;
  --rise: 8px;
  animation: heroRise 500ms var(--ease-out-expo) var(--d, 0ms) both;
}

.hero__body {
  font-size: var(--text-body);
  line-height: 1.62;
  max-width: 32ch;
  color: var(--color-ink);
  margin: 0 0 24px;
  animation: heroFade 500ms var(--ease-out-expo) var(--d, 0ms) both;
}
@media (min-width: 900px) { .hero__body { max-width: 42ch; } }

.hero__pricing {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: var(--text-pricing-meta);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-mid);
  margin: 0 0 22px;
  animation: heroFade 400ms var(--ease-out-expo) var(--d, 0ms) both;
}
.hero__pricing-amount { color: var(--color-gold); font-weight: 700; }

.hero__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
  margin-bottom: 22px;
}
.hero__cta-wrap { width: 100%; }
.hero__cta-wrap--primary {
  --rise: 8px;
  animation: heroRise 500ms var(--ease-out-expo) var(--d, 0ms) both;
}
.hero__cta-wrap--secondary {
  animation: heroFade 400ms var(--ease-out-expo) var(--d, 0ms) both;
}

.hero__social {
  font-size: var(--text-caption);
  line-height: 1.5;
  color: var(--color-ink-faint);
  margin: 0;
  animation: heroFade 400ms var(--ease-out-expo) var(--d, 0ms) both;
}
.hero__social-count { color: var(--color-gold); font-weight: 600; }

/* Entrance keyframes (Level 2 premium consumer-brand cascade) */
/* Scale-only settle (no opacity fade): keeps the full-bleed bg a valid FCP/LCP
   candidate from first paint — an opacity-0 start delays both metrics. */
@keyframes heroBgIn   { from { transform: scale(1.05); } to { transform: scale(1); } }
@keyframes heroDrop   { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes heroRise   { from { opacity: 0; transform: translateY(var(--rise, 12px)); } to { opacity: 1; transform: translateY(0); } }
@keyframes heroFade   { from { opacity: 0; } to { opacity: 1; } }
@keyframes celestialIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 0.7; transform: scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .hero__bg-img,
  .hero__issue,
  .hero__word,
  .hero__subhead,
  .hero__body,
  .hero__pricing,
  .hero__cta-wrap--primary,
  .hero__cta-wrap--secondary,
  .hero__social {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .hero__celestial { animation: none !important; transform: none !important; }
}

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

/* ── ③ Compatibility teaser ── */
.compat-teaser {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
  border-bottom: 1px solid var(--color-ink-ghost);
}

.compat-teaser__inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  align-items: center;
}

@media (min-width: 768px) {
  .compat-teaser__inner {
    grid-template-columns: 1fr 1fr;
    gap: clamp(48px, 8vw, 120px);
  }
}

.compat-teaser__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 20px;
}

.compat-teaser__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(36px, 5vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 28px;
  color: var(--color-ink);
}

.compat-teaser__rule {
  width: 48px;
  height: 1px;
  background: var(--color-ink-mid);
  margin-bottom: 28px;
}

.compat-teaser__body {
  font-size: var(--text-body);
  line-height: 1.7;
  color: var(--color-ink-mid);
  max-width: 46ch;
  margin-bottom: 36px;
}

.compat-teaser__visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.compat-teaser__symbols {
  position: relative;
  width: min(320px, 100%);
  height: min(320px, 100%);
  aspect-ratio: 1;
}

.compat-teaser__symbol {
  position: absolute;
  width: 62%;
  height: 62%;
  object-fit: contain;
  opacity: 0.72;
}

.compat-teaser__symbol--a {
  top: 0;
  left: 0;
}

.compat-teaser__symbol--b {
  bottom: 0;
  right: 0;
  opacity: 0.52;
}

.compat-teaser__visual-hint {
  color: var(--color-ink-faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 10px;
}

@media (max-width: 767px) {
  .compat-teaser__visual { display: none; }
}

/* ── ④ Traditions ── */
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

/* ── Hero right-column visual (desktop only): celestial portal + archetype grid ── */
.hero__visual { display: none; }
@media (min-width: 900px) {
  .hero__visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 480px;
  }
}
.hero__glow {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 96%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  opacity: 0.38;
  pointer-events: none;
  z-index: 0;
}
.hero__celestial {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 100%;
  height: auto;
  max-height: 520px;
  object-fit: contain;
  opacity: 0.7;
  pointer-events: none;
  z-index: 1;
  animation: celestialIn 1000ms var(--ease-out-expo) 100ms both;
}
.hero__archetypes {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  width: 100%;
  max-width: 360px;
}
.hero__archetypes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
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
  opacity: 0.3;
}
.hero__archetype-item:hover {
  opacity: 1;
  transform: scale(1.08);
}
.hero__archetype-item--lit {
  opacity: 1;
  transform: scale(1.06);
}
.hero__archetype-img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  filter: brightness(0) invert(1);
  display: block;
  transition: filter 0.3s ease;
}
.hero__archetype-item--lit .hero__archetype-img,
.hero__archetype-item:hover .hero__archetype-img {
  filter: brightness(0) invert(1) drop-shadow(0 0 12px var(--color-gold-glow));
}
.hero__archetypes-hook {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
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
  color: var(--color-gold-dim);
  text-decoration: none;
  font-size: 10px;
  letter-spacing: 0.3em;
  transition: color 0.2s;
}
.hero__archetypes-cta:hover { color: var(--color-gold); }
@media (max-width: 899px) {
  .hero__visual { display: none; }
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
