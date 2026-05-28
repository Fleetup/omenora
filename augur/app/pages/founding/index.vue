<template>
  <div>
    <AppHeader />

    <!-- ── Atmospheric layers (pointer-events: none) ── -->
    <div class="page-grain" aria-hidden="true" />
    <div class="page-scroll-progress" aria-hidden="true">
      <div class="page-scroll-progress__bar" :style="{ transform: `scaleY(${pageProgress})` }" />
    </div>

    <!-- ── § 01 — Hero ───────────────────────────────────────────────────── -->
    <SectionHero
      :display-lines="heroLines"
      :subhead="heroSubhead"
      image="/images/hero/Threshold-moment.webp"
      image-pos="right 30%"
      image-pos-m="center 40%"
    >
      <template #vol>Vol.&nbsp;001&nbsp;·&nbsp;MMXXVI</template>
      <template #eyebrow>Founding Member · Now Open</template>
      <template #actions>
        <!-- Inline checkout block inside hero — keeps the CTA above the fold -->
        <div class="hero-checkout">
          <div class="hero-checkout__price">
            <span class="hero-checkout__amount">$20</span>
            <span class="hero-checkout__label">one-time · not a subscription</span>
          </div>

          <AppButton
            variant="primary"
            size="lg"
            :disabled="loading"
            :arrow="!loading"
            @click="handleCheckout"
          >
            {{ loading ? 'Opening checkout…' : 'Claim founding membership' }}
          </AppButton>

          <p v-if="errorMessage" class="hero-checkout__error" role="alert">
            {{ errorMessage }}
          </p>
        </div>
      </template>
      <template #trust>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        14-day refund
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        Stripe-secured
        <span class="hero-trust__sep">·</span>
        <span class="hero-trust__dot hero-trust__dot--sage" />
        <NuxtLink to="/refund-policy" class="hero-trust__link">refund policy</NuxtLink>
      </template>
    </SectionHero>

    <!-- ── § 02 — Benefits / What this is ───────────────────────────────── -->
    <SectionLede
      eyebrow="The offer · Founding Members"
      heading="A real reading platform,"
      body="OMENORA calculates your exact planetary positions at the minute you were born, then reads them across Western, Vedic, BaZi, and Tarot traditions to produce a reading specific to you — not to your sun sign. Founding Members reserve their place now with a $20 deposit and lock in five founding benefits, for life."
      :drop-cap="true"
      band-tone="primary"
      marker="§ 02"
      bg-image="/images/hero/Architectural-cosmic.webp"
      bg-image-pos="right 60%"
      bg-image-pos-mobile="right center"
    >
      <template #heading-em>built carefully.</template>
      <template #body-extra>
        <ul class="founding-benefits">
          <li v-for="benefit in BENEFITS" :key="benefit.label" class="founding-benefit">
            <span class="founding-benefit__icon" aria-hidden="true">✦</span>
            <div>
              <span class="founding-benefit__label">{{ benefit.label }}</span>
              <span class="founding-benefit__desc">{{ benefit.desc }}</span>
            </div>
          </li>
        </ul>
      </template>
      <template #actions>
        <AppButton variant="primary" @click="handleCheckout" :disabled="loading" :arrow="!loading">
          {{ loading ? 'Opening checkout…' : 'Claim founding membership — $20' }}
        </AppButton>
        <AppButton variant="ghost" href="/analysis">Try the quiz first</AppButton>
      </template>
    </SectionLede>

    <!-- ── § 03 — Why Founding Members exist ─────────────────────────────── -->
    <SectionLede
      eyebrow="Why Founding Members exist"
      heading="We are"
      body="Compatibility and Counsel are in development. Building them correctly — with the same arc-second precision as the natal and daily engines — takes time and resources. Founding-Member deposits support that work directly. In exchange, Founding Members pay half the price of any paid tier, permanently, and gain first access before public launch."
      :drop-cap="false"
      band-tone="page"
      marker="§ 03"
      bg-image="/images/hero/Distant-horizon-emergence.webp"
      bg-image-pos="center 78%"
      bg-image-pos-mobile="center 78%"
    >
      <template #heading-em>building in the open.</template>
      <template #actions>
        <AppButton variant="ghost" href="/daily">See the reading engine live →</AppButton>
      </template>
    </SectionLede>

    <!-- ── § 04 — Already live ────────────────────────────────────────────── -->
    <SectionLede
      eyebrow="Already live"
      heading="Verify the product "
      body="The OMENORA reading engine is running now. Today's horoscopes are calculated daily with real Swiss Ephemeris data across all twelve signs. The full natal report combines birth chart, archetype, numerology, and all four traditions into a single reading. No account required."
      :drop-cap="false"
      band-tone="primary"
      marker="§ 04"
      bg-image="/images/hero/Nebula-void.webp"
      bg-image-pos="center 50%"
      bg-image-pos-mobile="center 50%"
    >
      <template #heading-em>before you pay.</template>
      <template #actions>
        <AppButton variant="secondary" href="/daily" :arrow="true">Read today's horoscope</AppButton>
        <AppButton variant="secondary" href="/analysis" :arrow="true">Begin a natal reading</AppButton>
      </template>
    </SectionLede>

    <!-- ── § 05 — FAQ ─────────────────────────────────────────────────────── -->
    <SectionFAQ
      eyebrow="Common questions"
      heading="Before you decide."
      :items="faqItems"
      band-tone="page"
      marker="§ 05"
    />

    <!-- ── § 06 — Final CTA ───────────────────────────────────────────────── -->
    <SectionFinalCTA
      eyebrow="Founding membership"
      heading="The reading"
      body="Sixty seconds to begin. Fourteen days to refund. Founding-Member pricing closes at public launch."
      cta-label="Claim founding membership — $20"
      :trust-items="finalTrust"
      band-tone="page"
      marker="§ 06"
      bg-image="/images/hero/final-cta-cosmic.webp"
      bg-image-pos="center 60%"
      bg-image-pos-mobile="center 55%"
    >
      <template #heading-em>The reading <em>already exists.</em></template>
      <template #heading-tail> You just haven't read it yet.</template>
      <template #cta>
        <AppButton
          variant="primary"
          size="lg"
          :disabled="loading"
          :arrow="!loading"
          @click="handleCheckout"
        >
          {{ loading ? 'Opening checkout…' : 'Claim founding membership — $20' }}
        </AppButton>
        <p v-if="errorMessage" class="fcta-error" role="alert">{{ errorMessage }}</p>
      </template>
    </SectionFinalCTA>

    <!-- ── Footer ─────────────────────────────────────────────────────────── -->
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
import SectionFAQ from '~/components/sections/SectionFAQ.vue'
import SectionFinalCTA from '~/components/sections/SectionFinalCTA.vue'
import SectionFooter from '~/components/sections/SectionFooter.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppHeader from '~/components/AppHeader.vue'
import type { FaqItem } from '~/components/sections/SectionFAQ.vue'

const { $trackInitiateCheckout } = useNuxtApp()

// ── Hero copy ──────────────────────────────────────────────────────────────────
const heroLines = ['Become a', 'founding member', 'of OMENORA.']
const heroSubhead = 'Reserve your place with a $20 deposit — lock in 50% off OMENORA Premium for life, your complete natal reading at launch, and first access when we open. Founding-Member pricing closes at public launch.'

// ── Page scroll progress ────────────────────────────────────────────────────────
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

const currentYear = computed(() => new Date().getFullYear())

// ── SEO ────────────────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Founding Membership — OMENORA',
  description: 'Pay $20 once to become a founding member of OMENORA — lifetime 50% off future paid tiers, early access to Compatibility and Counsel, founder badge, and your name in the credits.',
  ogTitle: 'Founding Membership — OMENORA',
  ogDescription: 'Pay $20 once. Lifetime 50% off paid features when they launch. Early access. Founder badge. 14-day refund.',
  ogImage: 'https://omenora.com/og-image.png',
  ogUrl: 'https://omenora.com/founding',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://omenora.com/founding' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'OMENORA Founding Membership',
        description: 'One-time $20 deposit reserving your complete natal reading at launch, lifetime 50% off OMENORA Premium, early access to Compatibility and Counsel, founder badge, and name in credits.',
        brand: { '@type': 'Brand', name: 'OMENORA' },
        offers: {
          '@type': 'Offer',
          price: '20.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://omenora.com/founding',
          priceValidUntil: '2026-12-31',
        },
      }),
    },
  ],
})

// ── Content ────────────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    label: 'Your complete natal reading at launch',
    desc: 'Delivered the moment OMENORA opens — computed across Western, Vedic, BaZi, and Tarot.',
  },
  {
    label: 'Lifetime 50% off Premium',
    desc: 'When Premium opens, you pay half. $2.99/week, $7.50/month, or $49.99/year — for life.',
  },
  {
    label: 'Early access to Compatibility & Counsel',
    desc: 'First to use every feature before public release.',
  },
  {
    label: 'Founder badge on your profile',
    desc: 'Displayed at public launch.',
  },
  {
    label: 'Your name in the credits',
    desc: 'Listed as a Founding Member at public launch.',
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'What do I actually get for $20?',
    answer: 'Five things: (1) your complete natal reading delivered the moment OMENORA opens, (2) lifetime 50% off OMENORA Premium on any plan — $2.99/week, $7.50/month, or $49.99/year, forever, (3) early access to Compatibility and Counsel before public release, (4) a founder badge on your OMENORA profile, and (5) your name in the credits at public launch.',
  },
  {
    question: 'When will paid features launch?',
    answer: 'We are not committing to a date. Compatibility and Counsel are in active development. Founding Members will receive direct communication before anyone else when features are ready. We will not spam you in the meantime.',
  },
  {
    question: 'Can I get a refund?',
    answer: '14 days, no questions asked. Email support@omenora.com with the subject "Founding Member Refund." Full terms are at omenora.com/refund-policy.',
  },
  {
    question: 'Is OMENORA AI?',
    answer: 'The reading engines use real Swiss Ephemeris calculations, Vedic sidereal math, BaZi four-pillar calculations, and traditional Tarot card draws — not AI. AI is used only to phrase the output in natural language. The underlying calculation is the same as a professional astrologer would perform.',
  },
  {
    question: 'Why $20 and not $50 or $100?',
    answer: 'Because $20 is a decision, not a commitment. It funds real development work and puts you on the Founding Member list. We would rather have a thousand genuine early believers at $20 than a smaller number of people who overpaid and later feel resentful.',
  },
]

const finalTrust = ['Stripe-secured checkout', '14-day full refund', 'Founding price locks for life']

const footerColumns = [
  { heading: 'Product',  links: [{ label: 'Try the quiz', href: '/analysis' }, { label: 'Founding Member', href: '/founding' }, { label: 'Compatibility', href: '/compatibility-quiz' }] },
  { heading: 'Company',  links: [{ label: 'Contact', href: 'mailto:hello@omenora.com' }] },
  { heading: 'Legal',    links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'Refund policy', href: '/refund-policy' }] },
]

// ── Attribution bridge ─────────────────────────────────────────────────────────
const previewUtms = ref<Record<string, string>>({})

onMounted(() => {
  // Scroll progress listener registered above via separate onMounted
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem('omenora_preview_context')
    if (raw) {
      const ctx = JSON.parse(raw) as Record<string, string>
      const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
      const utms: Record<string, string> = {}
      for (const k of UTM_KEYS) { if (ctx[k]) utms[k] = ctx[k]! }
      previewUtms.value = utms
    }
  } catch {
    // sessionStorage unavailable or corrupt — proceed without context
  }
})

// ── Checkout logic ──────────────────────────────────────────────────────────────
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function handleCheckout() {
  if (loading.value) return

  loading.value = true
  errorMessage.value = null

  try {
    const query = import.meta.client ? new URLSearchParams(window.location.search) : new URLSearchParams()

    const body: Record<string, string> = {
      landing_page: import.meta.client ? window.location.pathname : '/founding',
      referrer: import.meta.client ? document.referrer : '',
    }

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
    for (const key of utmKeys) {
      const val = query.get(key)
      if (val) body[key] = val
    }

    // Merge sessionStorage UTMs from /preview context — URL query params take precedence
    for (const [k, v] of Object.entries(previewUtms.value)) {
      if (!body[k] && v) body[k] = v
    }

    try {
      $trackInitiateCheckout({ value: 20, currency: 'USD', content_name: 'Founding Membership' })
    } catch (pixelErr) {
      console.warn('[founding] trackInitiateCheckout error:', pixelErr)
    }

    const res = await $fetch<{ url: string }>('/api/founding/create-checkout', {
      method: 'POST',
      body,
    })

    if (res?.url) {
      window.location.assign(res.url)
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (err: unknown) {
    loading.value = false

    const status = (err as { statusCode?: number })?.statusCode
    if (status === 429) {
      errorMessage.value = 'Too many attempts — please try again in a few minutes.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again or email support@omenora.com'
    }
  }
}

</script>

<style scoped>
/* ── Page-level atmospheric layers ─────────────────────────────────────────
   Identical pattern to index.vue — grain + scroll-progress hairline. */

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

/* ── Hero checkout block (inside #actions slot of SectionHero) ──────────────
   Displays $20 price row + CTA button + optional error message.
   max-width matches SectionHero's CTA row width. */
.hero-checkout {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 360px;
}

.hero-checkout__price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.hero-checkout__amount {
  font-family: var(--omn-font-display);
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 300;
  line-height: 1;
  color: var(--omn-text-primary);
}

.hero-checkout__label {
  font-family: var(--omn-font-body);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}

.hero-checkout__error {
  font-family: var(--omn-font-body);
  font-size: 13px;
  color: var(--omn-error);
  line-height: 1.5;
  margin: 0;
}

/* ── Trust line link (inside #trust slot) ───────────────────────────────────
   The SectionHero trust strip is plain text + spans; NuxtLink needs
   explicit inherit so it picks up the strip's color. */
.hero-trust__link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 200ms var(--omn-ease);
}
.hero-trust__link:hover {
  color: var(--omn-text-secondary);
}

/* ── Benefits list (inside #body-extra slot of § 02 SectionLede) ────────────
   Rendered inside SectionLede's .section-lede__extra container which
   already caps width at 640px. */
.founding-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.founding-benefit {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.founding-benefit__icon {
  color: var(--omn-accent);
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 4px;
}

.founding-benefit__label {
  font-family: var(--omn-font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--omn-text-primary);
  display: block;
  margin-bottom: 2px;
}

.founding-benefit__desc {
  font-family: var(--omn-font-body);
  font-size: 13px;
  color: var(--omn-text-tertiary);
  display: block;
  line-height: 1.5;
}

/* ── Final CTA error (inside #cta slot of SectionFinalCTA) ─────────────────── */
.fcta-error {
  font-family: var(--omn-font-body);
  font-size: 13px;
  color: var(--omn-error);
  line-height: 1.5;
  margin: var(--space-3) 0 0;
  text-align: center;
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .hero-checkout {
    max-width: 100%;
  }
  .founding-benefits {
    gap: var(--space-3);
  }
}
</style>
