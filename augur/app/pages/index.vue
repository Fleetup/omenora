<template>
  <div>
    <!-- ── Sticky editorial header + drawer ──
         Renders the OMENORA wordmark, primary nav, CTA pill and
         burger-triggered slide-in drawer (lang + account inside). -->
    <AppHeader />

    <!-- ── Atmospheric layers (pointer-events: none) ──
         Pulled from sandbox §11–§13 to give the page the same warmth +
         scroll affordance as the design source. -->
    <div class="page-grain" aria-hidden="true" />
    <div class="page-scroll-progress" aria-hidden="true">
      <div class="page-scroll-progress__bar" :style="{ transform: `scaleY(${pageProgress})` }" />
    </div>

    <SectionHero
      :display-lines="heroDisplayLines"
      :subhead="heroSubhead"
      image="/images/hero/Cosmic-gold-ascension.webp"
      image-pos="right 50%"
      image-pos-m="right 50%"
    >
      <template #vol>Vol.&nbsp;001&nbsp;·&nbsp;MMXXVI</template>
      <template #eyebrow>Founding Member · Now Open</template>
      <template #em>knew</template>
      <template #actions>
        <AppButton variant="primary" :href="heroVariant.primaryCtaTo">{{ heroVariant.primaryCtaText }}</AppButton>
        <AppButton v-if="heroVariant.secondaryCtaText" variant="ghost" :href="heroVariant.secondaryCtaTo!">{{ heroVariant.secondaryCtaText }}</AppButton>
      </template>
      <template #trust>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        Real Swiss Ephemeris
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        4 traditions
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        14-day refund
      </template>
    </SectionHero>

    <SectionSideBySide
      eyebrow="The offer · Founding Members"
      heading="$20 once."
      :columns="founderColumns"
      band-tone="primary"
      marker="§ 02"
      bg-image="/images/hero/Threshold-moment.webp"
      bg-image-pos="right 20%"
      bg-image-pos-mobile="right 20%"
    >
      <template #heading-em>50% off forever.</template>
      <template #heading-tail> </template>
      <template #intro>
        Compatibility and Counsel are still being built. Founding Members reserve
        their place now with a $20 deposit — and lock in 50% off every Premium
        plan, for life. When the OMENORA mobile app opens, Founding Members are
        in first.
      </template>
      <template #outro>
        <div class="founder-outro">
          <AppButton variant="primary" href="/founding">Claim founding membership — $20</AppButton>
          <AppButton variant="ghost" href="/analysis">Try the quiz first</AppButton>
        </div>
      </template>
    </SectionSideBySide>

    <div id="method">
    <SectionLede
      eyebrow="The method"
      heading="Why most apps are wrong about your sun sign."
      body="Most apps return one of twelve templates — the same one every Leo gets. OMENORA calculates the exact angular position of every body in the sky at the minute you were born, then reads those positions across four interpretive traditions. The result is a chart no one else has ever seen, because no one was born at your exact moment."
      :drop-cap="true"
      band-tone="page"
      marker="§ 03"
      bg-image="/images/hero/Architectural-cosmic.webp"
      bg-image-pos="right 60%"
      bg-image-pos-mobile="right center"
    >
      <template #heading-em></template>
      <template #heading-tail></template>
      <template #actions>
        <AppButton variant="ghost" href="/analysis">Read what your chart says →</AppButton>
      </template>
    </SectionLede>
    </div>

    <SectionThreeCardGrid
      eyebrow="What you receive"
      heading="One reading."
      intro-body="For $20, you reserve everything below. Your complete natal reading at launch, delivered inside the OMENORA mobile app — and 50% off Premium for life. Read what your chart actually says, computed across four traditions, the moment we open."
      :cards="receiveCards"
      band-tone="primary"
      marker="§ 04"
      bg-image="/images/hero/Cosmic-gold-ascension.webp"
      bg-image-pos="right 50%"
      bg-image-pos-mobile="right center"
    >
      <template #heading-em>Four lenses.</template>
      <template #heading-tail>Reserved for founders.</template>
    </SectionThreeCardGrid>

    <div id="traditions">
    <SectionSideBySide
      eyebrow="The traditions"
      heading="Read across four traditions —"
      :columns="traditionColumns"
      band-tone="page"
      marker="§ 05"
      bg-image="/images/hero/Distant-horizon-emergence.webp"
      bg-image-pos="center 78%"
      bg-image-pos-mobile="center 78%"
    >
      <template #heading-em>because no single one tells the whole chart.</template>
    </SectionSideBySide>
    </div>

    <div id="paywall" class="paywall-band">
      <SectionCenteredStatement
        eyebrow="Begin"
        heading="One reading."
        body="No subscription. No account. No recurring charge. Reserve your Founding-Member spot today and your complete natal reading lands the moment OMENORA opens — yours to keep, always."
        band-tone="page"
        marker="§ 06"
        bg-image="/images/hero/Threshold-moment.webp"
        bg-image-pos="right 80%"
        bg-image-pos-mobile="right 80%"
      >
        <template #heading-em>One price.</template>
        <template #heading-tail>One time.</template>
      </SectionCenteredStatement>

      <!-- PaywallCard wrapper — gives the card a proper container so it
           sits at the same 880px editorial measure as the .centered text
           above (sandbox container--narrow). Without this wrap the card
           stretches edge-to-edge of the viewport. -->
      <div class="paywall-band__card-wrap">
        <SectionPaywallCard
          :items="paywallItems"
          price-label="Founding Member"
          price-value="$20"
          price-unit="deposit"
          :trust-items="paywallTrust"
          cta-label="Reserve your reading"
          cta-href="/founding"
          :reveal-delay="120"
        />
      </div>
    </div>

    <!--
      Section 7 (Social Proof) removed 2026-05-27 per founder decision:
      Empty testimonials array + API-only counter produces hollow proof
      section. Restore when real testimonials exist from Founding Members
      or Trustpilot reviews. Tracked in PAGES_AND_SECTIONS.md §2.
    -->

    <SectionCenteredStatement
      eyebrow="One more thing"
      heading="The chart"
      body="Sixty seconds to begin. Fourteen days to change your mind. Founding-Member pricing closes at public launch — and the badge goes with whoever's in first."
      band-tone="page"
      marker="§ 08"
    >
      <template #heading-em>doesn't move.</template>
      <template #heading-tail>You do.</template>
      <template #actions>
        <AppButton variant="primary" href="/founding">Become a founding member</AppButton>
        <AppButton variant="ghost" href="#paywall">Review the offer</AppButton>
      </template>
    </SectionCenteredStatement>

    <SectionFAQ
      eyebrow="Common questions"
      heading="Ten things people ask before they buy."
      :items="faqItems"
      band-tone="primary"
      marker="§ 09"
    />

    <SectionFinalCTA
      eyebrow="Final"
      heading="The reading"
      body="Sixty seconds to begin. Fourteen days to refund. No account required. Founding-Member pricing closes at public launch."
      cta-label="Begin your reading"
      cta-href="/founding"
      :trust-items="finalCtaTrust"
      band-tone="page"
      marker="§ 10"
      bg-image="/images/hero/final-cta-cosmic.webp"
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
      :copyright="`© ${currentYear} OMENORA — United Northwest Carriers Inc.`"
      meta="Built on Swiss Ephemeris · Stripe payments"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SectionHero from '~/components/sections/SectionHero.vue'
import SectionLede from '~/components/sections/SectionLede.vue'
import SectionThreeCardGrid from '~/components/sections/SectionThreeCardGrid.vue'
import SectionSideBySide from '~/components/sections/SectionSideBySide.vue'
import SectionCenteredStatement from '~/components/sections/SectionCenteredStatement.vue'
import SectionPaywallCard from '~/components/sections/SectionPaywallCard.vue'
import SectionFAQ from '~/components/sections/SectionFAQ.vue'
import SectionFinalCTA from '~/components/sections/SectionFinalCTA.vue'
import SectionFooter from '~/components/sections/SectionFooter.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppHeader from '~/components/AppHeader.vue'
import type { CardItem } from '~/components/sections/SectionThreeCardGrid.vue'
import type { ColumnItem } from '~/components/sections/SectionSideBySide.vue'
import type { PaywallItem } from '~/components/sections/SectionPaywallCard.vue'
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
  // Default primary CTA is brand-forward per PAGES_AND_SECTIONS.md §2.1;
  // the founding-member pricing is surfaced explicitly in the Section 2
  // Founding Members band and the paywall band, not on the hero label.
  primaryCtaText:   'Reserve at $20 — Founding Member',
  primaryCtaTo:     '/founding',
  secondaryCtaText: 'Preview your archetype',
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

// Hero copy locked in PAGES_AND_SECTIONS.md §2.1 — strategy-aligned
// natal positioning, not the sandbox-decorative "Astrology that feels
// personal" line, and no "daily cosmic patterns" framing.
// Lines 0/2 render as static text; line 1 is intentionally empty so the
// hero's animated bronze underline (the #em slot) carries the emphasized
// word on its own line. Final line gets the quiet (secondary) color.
const heroDisplayLines = ['Know yourself', 'like the sky', 'you.']
const heroSubhead = 'Your complete natal reading — computed from your exact birth moment, read across Western, Vedic, BaZi, and Tarot. Reserve at $20 as a Founding Member and lock in 50% off OMENORA Premium for life.'

const currentYear = computed(() => new Date().getFullYear())

// ── Page scroll progress (0→1) for right-edge bronze hairline ──────
// rAF-coalesced; only updates on actual scroll. Reduced-motion respects
// the static state (bar still draws but no easing animation needed).
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
onMounted(() => {
  window.addEventListener('scroll', onPageScroll, { passive: true })
  updatePageProgress()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onPageScroll)
  if (pageProgressRaf != null) cancelAnimationFrame(pageProgressRaf)
})

// ── Three-card grid content ──
// Rewritten per DEPRECATED.md §8.2 / PAGES_AND_SECTIONS.md §2.4 to describe
// the launch product (mobile-app readings + tradition switching + premium
// cadence) rather than the legacy destiny-report document format. No
// word-count footers; no PDF/web-report framing.
const receiveCards: CardItem[] = [
  {
    numeral: '01',
    label:   'Archetype',
    heading: 'The archetype your chart actually maps to',
    body:    'Your Sun, Moon and Rising synthesized into one archetype — the one your full chart points to, not the one your birthday suggests. Available inside Premium, unlocked first for Founding Members.',
    foot:    'Reading',
    tag:     'Computed',
    sample:  'Preview your archetype →',
    sampleHref: '/analysis',
  },
  {
    numeral: '02',
    label:   'Natal chart',
    heading: 'Your birth chart, read four ways',
    body:    'Every planet, every house, every aspect — read in parallel across Western, Vedic, BaZi, and Tarot. Switch between traditions any time inside OMENORA Premium.',
    foot:    'Reading',
    tag:     'Computed',
    sample:  'Reserve your reading →',
    sampleHref: '/founding',
  },
  {
    numeral: '03',
    label:   'Forecast',
    heading: 'What the next 90 days actually hold',
    body:    'A 90-day forecast computed from the planets moving through your chart right now — what to expect, what to act on, what to leave alone. Up to four forecasts per month inside Premium.',
    foot:    'Reading',
    tag:     'Computed',
    sample:  'Reserve your reading →',
    sampleHref: '/founding',
  },
]

// ── Founding-member columns (Member Founders section) ───────────────
const founderColumns: ColumnItem[] = [
  {
    eyebrow: 'Why this exists',
    heading: 'We are building in the open.',
    body:    'Compatibility and Counsel are still being built — with the same arc-second precision as the natal engine. Founding Members reserve their place in line and lock in half-price access, forever. Founding-Member pricing closes at public launch.',
    kvs: [
      { key: 'Price',     value: '$20 · one-time' },
      { key: 'Refund',    value: '14 days · no questions' },
      { key: 'Already live', value: 'Daily horoscope · Full natal' },
    ],
  },
  {
    eyebrow: 'What you get',
    heading: 'Four benefits, locked in for life.',
    body:    'Founding Members get everything below — and pay nothing else until they choose to. No upsell, no recurring charge, no fine print. The $20 deposit is your seat. Premium is your call to make later, at half price for life.',
    kvs: [
      { key: '50% off',      value: 'Every paid tier · for life' },
      { key: 'Early access', value: 'Compatibility & Counsel first' },
      { key: 'App launch',   value: 'OMENORA mobile app · iOS first, you first' },
      { key: 'Founder badge', value: 'Displayed at public launch' },
      { key: 'Your name',    value: 'In the credits' },
    ],
  },
]

// ── Side-by-side traditions ──────────────────
const traditionColumns: ColumnItem[] = [
  {
    eyebrow: 'Western · Vedic',
    heading: 'Tropical & sidereal, read against each other.',
    body:    'Western tropical placements explain how you operate; Vedic sidereal Nakshatra explains what underlies it. OMENORA reports both and notes where they agree, disagree, and where the disagreement is itself the insight.',
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
const paywallTrust = ['Stripe-secured checkout', '14-day full refund', 'Founding price locks for life']

// ── FAQ ──────────────────────────────────────
const faqItems: FaqItem[] = [
  { question: 'How is this different from a regular horoscope?',       answer: 'Regular horoscopes are written for 1-in-12 people who share your sun sign. OMENORA calculates your exact planetary positions and writes a reading specific to that chart. No template selection.' },
  { question: 'Do I need to know my exact birth time?',                answer: 'Recommended but not required. Without a birth time we use solar noon as the default — Sun, Moon and most placements remain accurate; only your Rising sign and house placements need the exact minute.' },
  { question: 'What traditions are included?',                          answer: 'Four: Western tropical, Vedic Nakshatra, Chinese BaZi (Four Pillars), and Tarot Major Arcana birth pair. Each is computed from your exact birth data — nothing is approximated or templated.' },
  { question: 'How long does it take?',                                 answer: 'Thirty seconds to enter your birth details. Sixty seconds to compute. Then the writing renders, and your archetype preview unlocks immediately — before you decide whether to claim the Founding-Member offer.' },
  { question: 'What do I actually get for the $20 Founding-Member deposit?',   answer: 'Four things: (1) lifetime 50% off any paid subscription tier when they launch, (2) early access to Compatibility and Counsel before public release, (3) a founder badge on your OMENORA profile, and (4) your name in the credits at public launch. The deposit applies to your full reading.' },
  { question: 'When will Compatibility and Counsel launch?',            answer: 'We are not committing to a date. Both are in active development. Founding Members are contacted directly before anyone else when each feature is ready — and unlock it at half price for life.' },
  { question: 'Why $20 and not $50 or $100?',                          answer: 'Because $20 is a decision, not a commitment. It funds real development work and puts you on the Founding-Member list. We would rather have a thousand genuine early believers at $20 than a smaller number who overpaid and later feel resentful.' },
  { question: 'Is OMENORA AI?',                                         answer: 'The engines use real Swiss Ephemeris calculations, Vedic sidereal math, BaZi four-pillar calculations, and traditional Tarot draws — not AI. Language models are used only to phrase the output. The underlying calculation is the same as a professional astrologer would perform.' },
  { question: 'Is there a subscription?',                               answer: 'OMENORA Premium runs on the mobile app — $5.99/week, $14.99/month, or $99.99/year, no trial. The Founding-Member deposit is a one-time $20 that reserves the complete natal reading at launch and locks in 50% off Premium for life — on any plan. That is $2.99/week, $7.50/month, or $49.99/year, forever.' },
  { question: 'What is the refund policy?',                             answer: 'Full refund within fourteen days of the founding deposit, no questions, no friction. Email support@omenora.com with the subject "Founding Member Refund." We process refunds same-day.' },
]

// ── Final CTA trust ──────────────────────────
const finalCtaTrust = ['Secure checkout', '14-day refund', 'Stripe protected']

// ── Footer ───────────────────────────────────
const footerColumns = [
  { heading: 'Product',  links: [{ label: 'Try the quiz',    href: '/analysis' }, { label: 'Founding Member',   href: '/founding' }, { label: 'Compatibility',     href: '/compatibility-quiz' }] },
  { heading: 'Company',  links: [{ label: 'Contact',         href: 'mailto:hello@omenora.com' }] },
  { heading: 'Legal',    links: [{ label: 'Terms',           href: '/terms' }, { label: 'Privacy',           href: '/privacy' }, { label: 'Refund policy',     href: '/refund-policy' }] },
]

// ── SEO meta (preserved verbatim from legacy) ───────────────────────
useSeoMeta({
  title: 'OMENORA — Your Natal Reading, Computed Across Four Traditions',
  description: 'Your complete natal-chart reading — computed across four traditions (Western, Vedic, BaZi, Tarot) using real Swiss Ephemeris positions. Reserve at $20 as a Founding Member; lock in 50% off OMENORA Premium for life.',
  ogTitle: 'OMENORA — Your Natal Reading, Computed Across Four Traditions',
  ogDescription: 'Your complete natal reading across Western, Vedic, BaZi, and Tarot. Reserve at $20 as a Founding Member; 50% off OMENORA Premium for life when the mobile app launches.',
  ogImage: 'https://omenora.com/og-image.png',
  ogUrl: 'https://omenora.com',
  twitterCard: 'summary_large_image',
  twitterTitle: 'OMENORA — Your Natal Reading, Computed Across Four Traditions',
  twitterDescription: 'Complete natal reading across four traditions. Founding-Member deposit $20 — 50% off Premium for life.',
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
        description: 'Personalized natal-chart reading computed across four traditions — Western, Vedic, BaZi, Tarot. Reserve at $20 as a Founding Member; lock in 50% off OMENORA Premium for life when the mobile app launches.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        offers: [
          { '@type': 'Offer', name: 'Founding Member Deposit', price: '20', priceCurrency: 'USD', description: 'Founding-Member deposit. Reserves the complete natal reading at launch and locks in 50% off OMENORA Premium for life.', url: 'https://omenora.com/founding' },
        ],
        featureList: ['Natal chart calculation via Swiss Ephemeris', 'Multi-tradition reading: Western, Vedic, BaZi, Tarot', 'Founding-Member 50% off OMENORA Premium for life'],
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

// ── Analytics + lifecycle (preserved from legacy) ───────────────────
onMounted(() => {
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

<style scoped>
/* ──────────────────────────────────────────────────────────────────────────
   Page-level decoration layers — pulled from sandbox redesign-home.vue.
   All pointer-events: none, purely atmospheric, respect reduced motion.
   ────────────────────────────────────────────────────────────────────────── */

/* Film grain — analog warmth so dark surfaces don't read flat-digital.
   SVG turbulence rendered once as a data URL, animated via translate. */
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

/* Right-edge scroll-progress hairline — bronze tone, fills as user scrolls. */
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

/* Member Founders outro CTA row — uses SectionSideBySide's #outro slot.
   The slot wrapper (.section-sbs__outro) already supplies margin-top via
   --space-block, so only flex+gap is needed here. */
.founder-outro {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

/* ── Begin / Paywall band ──
   Two sibling components (CenteredStatement + PaywallCard) compose one
   conceptual band. The page wrapper supplies the shared background so
   the seam between the imaged CenteredStatement and the card below it
   reads as one continuous surface. */
.paywall-band {
  background: var(--omn-bg-page);
}

/* Card wrapper — sandbox's container--narrow (880px) so the card sits
   at the same editorial measure as the centered text above. Bottom
   padding completes the band rhythm; top padding is intentionally 0
   because CenteredStatement's own bottom padding handles the gap. */
.paywall-band__card-wrap {
  width: 100%;
  max-width: var(--width-content);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) var(--space-section);
}
@media (max-width: 767px) {
  .paywall-band__card-wrap {
    padding-bottom: var(--space-16);
  }
}
</style>
