<template>
  <div>

    <SectionHero
      :display-lines="heroDisplayLines"
      :subhead="heroSubhead"
      image="/images/hero/Cosmic-gold-ascension.webp"
      image-pos="right 50%"
      image-pos-m="right 50%"
    >
      <template #vol>Vol.&nbsp;001&nbsp;·&nbsp;MMXXVI</template>
      <template #eyebrow>The complete natal reading</template>
      <template #em>personal</template>
      <template #actions>
        <AppButton variant="primary" :href="heroVariant.primaryCtaTo">{{ heroVariant.primaryCtaText }}</AppButton>
        <AppButton v-if="heroVariant.secondaryCtaText" variant="ghost" :href="heroVariant.secondaryCtaTo!">{{ heroVariant.secondaryCtaText }}</AppButton>
      </template>
      <template #trust>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        {{ readingCount }} charts written
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        4 traditions per reading
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        7-day refund
      </template>
    </SectionHero>

    <SectionLede
      eyebrow="The method"
      heading="Your chart,"
      body="Most apps return one of twelve templates that match your sun sign. Omenora calculates the exact angular position of every body at the minute you were born, then reads those positions against four interpretive traditions."
      :drop-cap="true"
      band-tone="page"
      marker="§ 02"
    >
      <template #heading-em>computed</template>
      <template #heading-tail>— not selected from a database.</template>
      <template #actions>
        <AppButton variant="ghost" href="/founding">Read what your chart says →</AppButton>
      </template>
    </SectionLede>

    <SectionThreeCardGrid
      eyebrow="What you receive"
      heading="Three documents."
      intro-body="Delivered as a continuous PDF and a web report. Yours forever, no subscription, no account."
      :cards="receiveCards"
      band-tone="primary"
      marker="§ 03"
    >
      <template #heading-em>One reading.</template>
    </SectionThreeCardGrid>

    <SectionSideBySide
      eyebrow="The traditions"
      heading="Read across four traditions —"
      :columns="traditionColumns"
      band-tone="page"
      marker="§ 04"
    >
      <template #heading-em>because no single one tells the whole chart.</template>
    </SectionSideBySide>

    <div id="paywall">
      <SectionCenteredStatement
        eyebrow="Begin"
        heading="One reading."
        body="No subscription, no account, no recurring charge. Reserve your founding-member spot and we'll deliver your complete natal reading the moment we open."
        band-tone="page"
        marker="§ 06"
      >
        <template #heading-em>One price.</template>
        <template #heading-tail>Yours for keeps.</template>
      </SectionCenteredStatement>

      <SectionPaywallCard
        :items="paywallItems"
        price-label="Founding member"
        price-value="$20"
        price-unit="deposit"
        :trust-items="paywallTrust"
        cta-label="Reserve your reading"
        cta-href="/founding"
        :reveal-delay="120"
      />
    </div>

    <SectionSocialProof
      eyebrow="Readers"
      heading="From a few of the"
      :counters="socialCounters"
      :testimonials="socialTestimonials"
      band-tone="primary"
      marker="§ 05"
    >
      <template #heading-em>{{ readingCount }}</template>
      <template #heading-tail>charts read so far.</template>
    </SectionSocialProof>

    <SectionFAQ
      eyebrow="Common questions"
      heading="Six things people ask before they buy."
      :items="faqItems"
      band-tone="primary"
      marker="§ 07"
    />

    <SectionFinalCTA
      eyebrow="Final"
      heading="The reading"
      body="Sixty seconds. Refundable for seven days. No account required."
      cta-label="Begin your reading"
      cta-href="/founding"
      :trust-items="finalCtaTrust"
      band-tone="page"
      marker="§ 08"
      bg-image="/images/hero/ChatGPT Image May 23, 2026, 10_02_49 AM.png"
      bg-image-pos="center 60%"
      bg-image-pos-mobile="center 55%"
    >
      <template #heading-em>already exists.</template>
      <template #heading-tail>You just haven't read it yet.</template>
    </SectionFinalCTA>

    <SectionFooter
      :columns="footerColumns"
      tagline="Computed natal readings, not horoscopes."
      brand-meta="Est. 2026 · Vol. 001 · MMXXVI"
      copyright="© 2026 OMENORA — United Northwest Carriers Inc."
      meta="Built on Swiss Ephemeris · Stripe payments"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SectionHero from '~/components/sections/SectionHero.vue'
import SectionLede from '~/components/sections/SectionLede.vue'
import SectionThreeCardGrid from '~/components/sections/SectionThreeCardGrid.vue'
import SectionSideBySide from '~/components/sections/SectionSideBySide.vue'
import SectionCenteredStatement from '~/components/sections/SectionCenteredStatement.vue'
import SectionPaywallCard from '~/components/sections/SectionPaywallCard.vue'
import SectionSocialProof from '~/components/sections/SectionSocialProof.vue'
import SectionFAQ from '~/components/sections/SectionFAQ.vue'
import SectionFinalCTA from '~/components/sections/SectionFinalCTA.vue'
import SectionFooter from '~/components/sections/SectionFooter.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import type { CardItem } from '~/components/sections/SectionThreeCardGrid.vue'
import type { ColumnItem } from '~/components/sections/SectionSideBySide.vue'
import type { PaywallItem } from '~/components/sections/SectionPaywallCard.vue'
import type { CounterItem, TestimonialItem } from '~/components/sections/SectionSocialProof.vue'
import type { FaqItem } from '~/components/sections/SectionFAQ.vue'

const { $trackLandingView, $trackCustomEvent } = useNuxtApp() as any
const route = useRoute()
const { trackEvent: clarityTrack } = useClarity()

// ── Hero variant system ───────────────────────────────────────────────
interface HeroVariant {
  variantKey:        string
  primaryCtaText:    string
  primaryCtaTo:      string
  secondaryCtaText:  string | null
  secondaryCtaTo:    string | null
}

const DEFAULT_HERO: HeroVariant = {
  variantKey:       'default_founding',
  primaryCtaText:   'Become a Founding Member — $20',
  primaryCtaTo:     '/founding',
  secondaryCtaText: 'Try the free reading',
  secondaryCtaTo:   '/analysis',
}

function resolveHeroVariant(utmCreative: string): HeroVariant {
  const c = utmCreative.toLowerCase()
  if (c.includes('archetype')) {
    return { variantKey: 'archetype', primaryCtaText: 'Find your archetype', primaryCtaTo: '/analysis', secondaryCtaText: null, secondaryCtaTo: null }
  }
  if (c.includes('compat') || c.includes('relationship')) {
    return { variantKey: 'compatibility', primaryCtaText: 'Check compatibility', primaryCtaTo: '/compatibility-quiz', secondaryCtaText: null, secondaryCtaTo: null }
  }
  if (c.includes('accuracy') || c.includes('shock')) {
    return { variantKey: 'accuracy', primaryCtaText: 'See what it knows about you', primaryCtaTo: '/analysis', secondaryCtaText: null, secondaryCtaTo: null }
  }
  if (c.includes('pattern')) {
    return { variantKey: 'pattern', primaryCtaText: 'Read my chart', primaryCtaTo: '/analysis', secondaryCtaText: null, secondaryCtaTo: null }
  }
  if (c.includes('disappear')) {
    return { variantKey: 'disappear', primaryCtaText: 'See the pattern', primaryCtaTo: '/analysis', secondaryCtaText: null, secondaryCtaTo: null }
  }
  return { ...DEFAULT_HERO }
}

const heroVariant = computed<HeroVariant>(() => {
  const src = route.query.utm_source as string | undefined
  if (!src) return { ...DEFAULT_HERO }
  const creative = (route.query.utm_creative as string) || ''
  return resolveHeroVariant(creative)
})

const heroDisplayLines = ['Astrology that', 'feels', 'not generic.']
const heroSubhead = 'Birth-chart insights, compatibility guidance and daily cosmic patterns — computed from your exact planetary positions, read in a calm, premium register.'

// ── Reading count ────────────────────────────
const readingCount = ref('47,392')

// ── Three-card grid content ──────────────────
const receiveCards: CardItem[] = [
  { numeral: '01', label: 'Identity',  heading: 'Who you are, computed',        body: 'Your Sun, Moon and Rising synthesized into one of twelve archetypes — the one your exact chart actually maps to, not the one your sun sign suggests.',                                               foot: '1,200 words', tag: 'Computed', sample: 'Read a sample excerpt →', sampleHref: '/founding' },
  { numeral: '02', label: 'Forecast',  heading: 'The next twelve months',        body: 'A month-by-month forecast built from your transits, not from a generic horoscope. What to expect, what to act on, what to leave alone.',                                                             foot: '1,800 words', tag: 'Computed', sample: 'Read a sample excerpt →', sampleHref: '/founding' },
  { numeral: '03', label: 'Pattern',   heading: 'The recurring thread',          body: 'The one pattern your chart keeps producing — across relationships, work, money. Why it happens, and the specific lever that breaks it.',                                                               foot: '1,800 words', tag: 'Computed', sample: 'Read a sample excerpt →', sampleHref: '/founding' },
]

// ── Side-by-side traditions ──────────────────
const traditionColumns: ColumnItem[] = [
  {
    eyebrow: 'Western · Vedic',
    heading: 'Tropical & sidereal, read against each other.',
    body:    'Western tropical placements explain how you operate; Vedic sidereal Nakshatra explains what underlies it. Omenora reports both and notes where they agree, disagree, and where the disagreement is itself the insight.',
    kvs: [
      { key: 'Sun · Moon · Rising', value: 'Tropical' },
      { key: 'Moon Nakshatra',      value: 'Sidereal · 27 mansions' },
      { key: 'House system',        value: 'Placidus & Whole-sign' },
    ],
  },
  {
    eyebrow: 'BaZi · Tarot · Numerology',
    heading: 'Three more lenses, each computed from the same birth moment.',
    body:    'Your Four Pillars of Destiny in BaZi, your two Tarot birth cards from the Major Arcana, and your Life Path number from numerology — each adds a distinct axis of self-knowledge that Western astrology alone cannot reach.',
    kvs: [
      { key: 'BaZi',       value: 'Year · Month · Day · Hour pillars' },
      { key: 'Tarot',      value: 'Major Arcana birth pair' },
      { key: 'Numerology', value: 'Life Path · Destiny' },
    ],
  },
]

// ── Paywall card ─────────────────────────────
const paywallItems: PaywallItem[] = [
  { key: 'Reading',    value: 'Complete natal — 50+ pages' },
  { key: 'Traditions', value: 'Western, Vedic, BaZi, Tarot' },
  { key: 'Delivery',   value: 'Instant on completion' },
  { key: 'Locked in',  value: 'Founding-member pricing for life' },
]
const paywallTrust = ['Secure checkout', 'Stripe protected', 'Refundable within 7 days']

// ── Social proof ─────────────────────────────
const socialCounters: CounterItem[] = [
  { value: 12400,  label: 'Charts written to date' },
  { value: '96',   unit: '%',  label: 'Would recommend to a friend' },
  { value: '4.8',  unit: '/5', label: 'Across 2,140 reading reviews' },
]

const socialTestimonials: TestimonialItem[] = [
  { body: 'Read me better than the therapist I\'ve been seeing for two years. The pattern section was almost upsetting in how exact it was.', name: 'Amara K.',  context: 'Sun in Aquarius · Vedic dominant' },
  { body: 'I expected horoscope-style fluff. Got a forecast that called my July almost to the week. Bought a second reading for my partner the same day.', name: 'Daniel R.', context: 'Sun in Scorpio · BaZi Water Tiger' },
  { body: 'The recurring thread part is what I paid $24 for. I\'ve been doing the same thing for ten years and it took ninety seconds to name it.', name: 'Priya S.',  context: 'Sun in Gemini · Life Path 7' },
]

// ── FAQ ──────────────────────────────────────
const faqItems: FaqItem[] = [
  { question: 'How is this different from a regular horoscope?',       answer: 'Regular horoscopes are written for 1-in-12 people who share your sun sign. Omenora calculates your exact planetary positions and writes a reading specific to that chart. No template selection.' },
  { question: 'Do I need to know my exact birth time?',                answer: 'Recommended but not required. Without a birth time we use solar noon as the default — Sun, Moon and most placements remain accurate; only your Rising sign and house placements need the exact minute.' },
  { question: 'What traditions are included?',                          answer: 'Four: Western tropical, Vedic Nakshatra, Chinese BaZi (Four Pillars), and Tarot Major Arcana birth pair. Each is computed from your exact birth data — nothing is approximated or templated.' },
  { question: 'How long does it take?',                                 answer: 'About 30 seconds to enter your birth details, then 60 seconds for the engine to compute and the writing to render. The Identity preview unlocks immediately.' },
  { question: 'Is there a subscription?',                               answer: 'The reading itself is a founding-member one-time purchase, yours forever. We also sell OMENORA Premium at $14.99/month for the full mobile app experience — daily insights, unlimited Counsel, and compatibility readings. Founding members lock in 50% off Premium for life.' },
  { question: 'What is the refund policy?',                             answer: 'Full refund within seven days, no questions, no friction. Email or use the link in your delivery confirmation. We process refunds same-day.' },
]

// ── Final CTA trust ──────────────────────────
const finalCtaTrust = ['Secure checkout', '7-day refund', 'Stripe protected']

// ── Footer ───────────────────────────────────
const footerColumns = [
  { heading: 'Product',  links: [{ label: 'Free reading',    href: '/analysis' }, { label: 'Founding member',   href: '/founding' }, { label: 'Compatibility',     href: '/compatibility-quiz' }] },
  { heading: 'Company',  links: [{ label: 'Contact',         href: 'mailto:hello@omenora.com' }] },
  { heading: 'Legal',    links: [{ label: 'Terms',           href: '/terms' }, { label: 'Privacy',           href: '/privacy' }, { label: 'Refund policy',     href: '/refund-policy' }] },
]

// ── SEO meta (preserved verbatim from legacy) ───────────────────────
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
    // ── TikTok Pixel — ID D7FTU6BC77U7IUI4896G ──────────────────────
    {
      innerHTML: `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('D7FTU6BC77U7IUI4896G');
  ttq.page();
}(window, document, 'ttq');`,
    },
    // ── Meta Pixel — ID 2426732040764916 ────────────────────────────
    {
      innerHTML: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','2426732040764916');fbq('track','PageView');`,
    },
  ],
})

// ── Analytics + lifecycle (preserved from legacy) ───────────────────
onMounted(async () => {
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
  }
})
</script>
