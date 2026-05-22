<template>
  <AppShell>

    <!-- ── ABOVE THE FOLD ────────────────────────────────────────────────── -->
    <section class="founding-hero">
      <div class="page-wrapper">
        <div class="founding-hero__inner">

          <!-- Status line -->
          <p class="label-caps founding-hero__status">
            Founding membership&thinsp;·&thinsp;open now
          </p>

          <!-- h1 -->
          <h1 class="founding-hero__headline font-display-italic">
            Become a founding member of OMENORA.
          </h1>

          <!-- Sub-headline -->
          <p class="founding-hero__sub font-serif">
            Paid features — Compatibility and Counsel — are still being built.
            Founding members pay $20 once to support that work, and receive
            lifetime half-price access and first entry when they launch.
          </p>

          <!-- Benefits -->
          <ul class="founding-benefits" aria-label="Founding member benefits">
            <li
              v-for="benefit in BENEFITS"
              :key="benefit.label"
              class="founding-benefit"
            >
              <span class="founding-benefit__icon label-caps" aria-hidden="true">✦</span>
              <div>
                <span class="founding-benefit__label">{{ benefit.label }}</span>
                <span class="founding-benefit__desc">{{ benefit.desc }}</span>
              </div>
            </li>
          </ul>

          <!-- Price + CTA -->
          <div class="founding-cta-block">
            <div class="founding-price">
              <span class="founding-price__amount font-serif">$20</span>
              <span class="label-caps founding-price__type">One-time · Not a subscription</span>
            </div>

            <AppButton
              variant="primary"
              :disabled="loading"
              :full="true"
              :arrow="!loading"
              @click="handleCheckout"
            >
              {{ loading ? 'Opening checkout…' : 'Claim founding membership' }}
            </AppButton>

            <!-- Error states -->
            <p v-if="errorMessage" class="founding-error" role="alert">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Trust line -->
          <p class="founding-trust annotation">
            14-day refund, no questions asked —
            <NuxtLink to="/refund-policy" class="founding-trust__link">refund policy</NuxtLink>.
            The reading engine is live —
            <NuxtLink to="/daily" class="founding-trust__link">see today's horoscope</NuxtLink>.
          </p>

        </div>
      </div>
    </section>

    <!-- ── RULE ───────────────────────────────────────────────────────────── -->
    <div class="page-wrapper">
      <EditorialRule ornament="◇" />
    </div>

    <!-- ── A. WHAT THIS IS ───────────────────────────────────────────────── -->
    <section class="founding-section">
      <div class="page-wrapper">
        <div class="founding-section__inner">
          <p class="label-caps founding-section__eyebrow">What this is</p>
          <h2 class="founding-section__headline font-display-italic">
            A real reading platform, built carefully.
          </h2>
          <div class="founding-section__rule" />
          <p class="founding-section__body">
            OMENORA calculates your exact planetary positions at the minute
            you were born, then reads them across Western, Vedic, BaZi,
            Chinese, Mayan, and Tarot traditions to produce a reading specific
            to you — not to your sun sign. The daily horoscope is live today.
            The full natal report is available now.
          </p>
          <p class="founding-section__body">
            Founding members pay $20 once and receive the four benefits listed
            above — lifetime half-price access, early entry to Compatibility
            and Counsel when they launch, a founder badge, and their name in
            the credits. That is the complete offer. No recurring charge, no
            fine print.
          </p>
        </div>
      </div>
    </section>

    <!-- ── B. WHY FOUNDING MEMBERS EXIST ─────────────────────────────────── -->
    <section class="founding-section founding-section--tinted">
      <div class="page-wrapper">
        <div class="founding-section__inner">
          <p class="label-caps founding-section__eyebrow">Why founding members exist</p>
          <h2 class="founding-section__headline font-display-italic">
            We are building in the open.
          </h2>
          <div class="founding-section__rule" />
          <p class="founding-section__body">
            Compatibility and Counsel are in development. Building them
            correctly — with the same precision as the natal and daily engines
            — takes time and resources. Founding-member purchases support that
            work directly.
          </p>
          <p class="founding-section__body">
            In exchange, founding members pay half the price of any paid tier,
            permanently, and gain first access before public launch. We will not
            promise a specific date. We will contact you before anyone else
            when the features are ready.
          </p>
        </div>
      </div>
    </section>

    <!-- ── C. WHAT'S ALREADY LIVE ────────────────────────────────────────── -->
    <section class="founding-section">
      <div class="page-wrapper">
        <div class="founding-live">
          <p class="label-caps founding-live__eyebrow">Already live</p>
          <h2 class="founding-live__headline font-display-italic">
            Verify the product before you pay.
          </h2>
          <div class="founding-section__rule" />
          <p class="founding-live__body">
            The OMENORA reading engine is running now. Today's horoscopes are
            calculated daily with real Swiss Ephemeris data across all twelve
            signs. The full natal report combines birth chart, archetype,
            numerology, and all six traditions into a single reading.
            No account required.
          </p>
          <div class="founding-live__actions">
            <AppButton variant="secondary" to="/daily" :arrow="true">
              Read today's horoscope
            </AppButton>
            <AppButton variant="secondary" to="/analysis" :arrow="true">
              Begin a natal reading
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ── RULE ───────────────────────────────────────────────────────────── -->
    <div class="page-wrapper">
      <EditorialRule ornament="◇" />
    </div>

    <!-- ── D. FAQ ─────────────────────────────────────────────────────────── -->
    <section class="founding-section">
      <div class="page-wrapper">
        <div class="founding-faq">
          <p class="label-caps founding-section__eyebrow">Questions</p>
          <h2 class="founding-faq__headline font-display-italic">
            Frequently asked.
          </h2>

          <ul class="founding-faq__list" role="list">
            <li
              v-for="(item, i) in FAQ"
              :key="i"
              class="founding-faq__item"
            >
              <button
                class="founding-faq__question label-caps"
                :aria-expanded="openFaq === i"
                :aria-controls="`faq-answer-${i}`"
                @click="openFaq = openFaq === i ? null : i"
              >
                <span>{{ item.q }}</span>
                <span class="founding-faq__chevron" aria-hidden="true">
                  {{ openFaq === i ? '−' : '+' }}
                </span>
              </button>
              <div
                :id="`faq-answer-${i}`"
                class="founding-faq__answer"
                :class="{ 'founding-faq__answer--open': openFaq === i }"
                role="region"
              >
                <p class="founding-faq__answer-text">{{ item.a }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── RULE ───────────────────────────────────────────────────────────── -->
    <div class="page-wrapper">
      <EditorialRule ornament="◇" />
    </div>

    <!-- ── E. FINAL CTA ───────────────────────────────────────────────────── -->
    <section class="founding-section founding-final-cta">
      <div class="page-wrapper">
        <div class="founding-final-cta__inner">
          <p class="label-caps founding-final-cta__eyebrow">Founding membership</p>
          <div class="founding-price founding-price--center">
            <span class="founding-price__amount font-serif">$20</span>
            <span class="label-caps founding-price__type">One-time · Not a subscription</span>
          </div>

          <AppButton
            variant="primary"
            :disabled="loading"
            :full="true"
            :arrow="!loading"
            @click="handleCheckout"
          >
            {{ loading ? 'Opening checkout…' : 'Claim founding membership' }}
          </AppButton>

          <p v-if="errorMessage" class="founding-error" role="alert">
            {{ errorMessage }}
          </p>

          <p class="founding-trust annotation">
            14-day refund, no questions asked —
            <NuxtLink to="/refund-policy" class="founding-trust__link">refund policy</NuxtLink>.
          </p>
        </div>
      </div>
    </section>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { $trackInitiateCheckout } = useNuxtApp()

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
})

// ── Content ────────────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    label: 'Lifetime 50% off subscriptions',
    desc: 'When paid tiers launch, you pay half. Permanently.',
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
    desc: 'Listed as a founding member at public launch.',
  },
]

const FAQ = [
  {
    q: 'What do I actually get for $20?',
    a: 'Four things: (1) lifetime 50% off any paid subscription tier when they launch, (2) early access to Compatibility and Counsel before public release, (3) a founder badge on your OMENORA profile, and (4) your name in the credits at public launch. You also get the satisfaction of making the thing exist.',
  },
  {
    q: 'When will paid features launch?',
    a: 'We are not committing to a date. Compatibility and Counsel are in active development. Founding members will receive direct communication before anyone else when features are ready. We will not spam you in the meantime.',
  },
  {
    q: 'Can I get a refund?',
    a: '14 days, no questions asked. Email support@omenora.com with the subject "Founding Member Refund." Full terms are at omenora.com/refund-policy.',
  },
  {
    q: 'Is OMENORA AI?',
    a: 'The reading engines use real Swiss Ephemeris calculations, Vedic sidereal math, BaZi four-pillar calculations, and traditional Tarot card draws — not AI. AI is used only to phrase the output in natural language. The underlying calculation is the same as a professional astrologer would perform.',
  },
  {
    q: 'Why $20 and not $50 or $100?',
    a: 'Because $20 is a decision, not a commitment. It funds real development work and puts you on the founding member list. We would rather have a thousand genuine early believers at $20 than a smaller number of people who overpaid and later feel resentful.',
  },
] as const

// ── Attribution bridge ─────────────────────────────────────────────────────────
const previewUtms = ref<Record<string, string>>({})

onMounted(() => {
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

// ── FAQ accordion ───────────────────────────────────────────────────────────────
const openFaq = ref<number | null>(null)
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────────────────────── */
.founding-hero {
  padding: clamp(40px, 8vw, 96px) 0 clamp(48px, 8vw, 96px);
}

.founding-hero__inner {
  max-width: 720px;
}

.founding-hero__status {
  color: var(--accent-gold);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 20px;
}

.founding-hero__headline {
  font-size: clamp(32px, 7vw, 60px);
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-wrap: balance;
}

.founding-hero__sub {
  font-size: clamp(17px, 2.5vw, 22px);
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 32px;
  max-width: 600px;
}

/* ── Benefits ──────────────────────────────────────────────────────────────── */
.founding-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.founding-benefit {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.founding-benefit__icon {
  color: var(--accent-gold);
  font-size: 10px;
  letter-spacing: 0;
  flex-shrink: 0;
  margin-top: 3px;
}

.founding-benefit__label {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.founding-benefit__desc {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-tertiary);
  display: block;
  line-height: 1.5;
}

/* ── CTA block ─────────────────────────────────────────────────────────────── */
.founding-cta-block {
  max-width: 420px;
  margin-bottom: 20px;
}

.founding-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.founding-price--center {
  justify-content: center;
  margin-bottom: 20px;
}

.founding-price__amount {
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 300;
  line-height: 1;
  color: var(--text-primary);
}

.founding-price__type {
  color: var(--text-tertiary);
  font-size: 10px;
}

/* ── Error ─────────────────────────────────────────────────────────────────── */
.founding-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #8b1e1e;
  margin-top: 12px;
  line-height: 1.5;
}

/* ── Trust line ────────────────────────────────────────────────────────────── */
.founding-trust {
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.7;
  margin-top: 14px;
}

.founding-trust__link {
  color: var(--text-tertiary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.founding-trust__link:hover {
  color: var(--text-primary);
}

/* ── Body sections ─────────────────────────────────────────────────────────── */
.founding-section {
  padding: clamp(48px, 8vw, 96px) 0;
}

.founding-section--tinted {
  background: var(--surface-raised);
}

.founding-section__inner {
  max-width: 720px;
}

.founding-section__eyebrow {
  color: var(--text-tertiary);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 16px;
}

.founding-section__headline {
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.founding-section__rule {
  width: 40px;
  height: 1px;
  background: var(--accent-gold);
  margin-bottom: 24px;
}

.founding-section__body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  max-width: 640px;
  margin-bottom: 20px;
}

.founding-section__body:last-child {
  margin-bottom: 0;
}

/* ── Already live ──────────────────────────────────────────────────────────── */
.founding-live {
  max-width: 720px;
}

.founding-live__headline {
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.founding-live__body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  max-width: 640px;
  margin-bottom: 28px;
}

.founding-live__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* ── FAQ ───────────────────────────────────────────────────────────────────── */
.founding-faq {
  max-width: 720px;
}

.founding-faq__headline {
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 32px;
}

.founding-faq__list {
  border-top: 1px solid var(--border-subtle);
  margin: 0;
  padding: 0;
}

.founding-faq__item {
  border-bottom: 1px solid var(--border-subtle);
}

.founding-faq__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 20px 0;
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--text-primary);
  transition: color 0.2s;
}

.founding-faq__question:hover {
  color: var(--text-secondary);
}

.founding-faq__question:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
  border-radius: 2px;
}

.founding-faq__chevron {
  font-family: var(--font-sans);
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  color: var(--accent-gold);
}

.founding-faq__answer {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.founding-faq__answer--open {
  max-height: 400px;
}

.founding-faq__answer-text {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  padding-bottom: 24px;
  margin: 0;
}

/* ── Final CTA ─────────────────────────────────────────────────────────────── */
.founding-final-cta {
  padding-top: clamp(48px, 8vw, 96px);
  padding-bottom: clamp(64px, 12vw, 128px);
}

.founding-final-cta__inner {
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
}

.founding-final-cta__eyebrow {
  color: var(--accent-gold);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 20px;
}

/* ── Mobile adjustments ─────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .founding-hero {
    padding-top: 32px;
    padding-bottom: 40px;
  }

  .founding-benefits {
    gap: 14px;
    margin-bottom: 28px;
  }

  .founding-cta-block {
    max-width: 100%;
  }

  .founding-live__actions {
    flex-direction: column;
  }
}
</style>
