<template>
  <div class="ty-page">
    <AppHeader />

    <!-- ── Atmospheric layers — only in paid state ───────────────────────── -->
    <div v-if="pageState === 'paid'" class="page-grain" aria-hidden="true" />
    <div v-if="pageState === 'paid'" class="page-scroll-progress" aria-hidden="true">
      <div class="page-scroll-progress__bar" :style="{ transform: `scaleY(${pageProgress})` }" />
    </div>

    <main>

      <!-- ── LOADING ────────────────────────────────────────────────────────── -->
      <section v-if="pageState === 'loading'" class="ty-section ty-functional">
        <div class="page-wrapper">
          <LoaderBar :active="true" :messages="['Confirming your purchase…']" />
        </div>
      </section>

      <!-- ── PENDING ────────────────────────────────────────────────────────── -->
      <section v-else-if="pageState === 'pending'" class="ty-section ty-functional">
        <div class="page-wrapper">
          <LoaderBar :active="true" :messages="['Confirming your payment with Stripe…', 'This usually takes a few seconds…']" />
        </div>
      </section>

      <!-- ── PENDING TIMEOUT ────────────────────────────────────────────────── -->
      <section v-else-if="pageState === 'pending-timeout'" class="ty-section ty-functional">
        <div class="page-wrapper">
          <div class="ty-pending-timeout">
            <AppEyebrow class="ty-status">Payment processing</AppEyebrow>
            <AppHeadline variant="italic" as="h1" class="ty-headline">Your payment is being processed.</AppHeadline>
            <p class="ty-body">
              Your payment is being confirmed with Stripe. You'll receive a
              confirmation email at the address you used at checkout within
              a few minutes. If it doesn't arrive, check your spam folder
              or email
              <a href="mailto:support@omenora.com" class="ty-link">support@omenora.com</a>.
            </p>
          </div>
        </div>
      </section>

      <!-- ── ERROR ──────────────────────────────────────────────────────────── -->
      <section v-else-if="pageState === 'error'" class="ty-section ty-functional">
        <div class="page-wrapper">
          <div class="ty-error">
            <AppEyebrow class="ty-status">Something went wrong</AppEyebrow>
            <AppHeadline variant="italic" as="h1" class="ty-headline">We couldn't verify this purchase.</AppHeadline>
            <p class="ty-body">
              If you completed a payment, you'll receive a confirmation
              email at the address you used at checkout. Otherwise, please
              contact
              <a href="mailto:support@omenora.com" class="ty-link">support@omenora.com</a>.
            </p>
            <AppButton variant="secondary" to="/founding" class="ty-error__back">
              Back to founding membership
            </AppButton>
          </div>
        </div>
      </section>

      <!-- ── PAID ───────────────────────────────────────────────────────────── -->
      <template v-else-if="pageState === 'paid' && verifiedData">

        <!-- § 01 — Confirmation hero -->
        <SectionHero
          :display-lines="heroLines"
          :subhead="heroSubhead"
          image="/images/hero/Cosmic-gold-ascension.webp"
          image-pos="right 50%"
          image-pos-m="center 50%"
        >
          <template #eyebrow>You're in · Founding Member</template>
          <template #trust>
            <span class="hero-trust__dot hero-trust__dot--sage" />
            {{ verifiedData.email }}
            <span class="hero-trust__sep">·</span>
            <span class="hero-trust__dot hero-trust__dot--sage" />
            {{ formattedDate }}
            <span class="hero-trust__sep">·</span>
            <span class="hero-trust__dot hero-trust__dot--sage" />
            Order ref <span class="ty-order-ref">{{ orderRef }}</span>
          </template>
        </SectionHero>

        <!-- § 02 — What's next -->
        <SectionLede
          eyebrow="What's next"
          heading="Four things"
          body="Everything you've unlocked and what happens from here."
          :drop-cap="false"
          band-tone="page"
          marker="§ 02"
          bg-image="/images/hero/Distant-horizon-emergence.webp"
          bg-image-pos="left 50%"
          bg-image-pos-mobile="center 50%"
        >
          <template #heading-em>to know.</template>
          <template #body-extra>
            <ol class="ty-next-list">
              <li class="ty-next-item">
                <span class="ty-next-num">01</span>
                <div>
                  <strong class="ty-next-title">Confirmation email.</strong>
                  <p class="ty-next-desc">Your receipt should arrive within a few minutes. If it doesn't appear, check your spam folder. Still nothing? Email <a href="mailto:support@omenora.com" class="ty-link">support@omenora.com</a>.</p>
                </div>
              </li>
              <li class="ty-next-item">
                <span class="ty-next-num">02</span>
                <div>
                  <strong class="ty-next-title">The reading engine is live now.</strong>
                  <p class="ty-next-desc">OMENORA's natal and daily reading engines are running today. Your reading is waiting.</p>
                </div>
              </li>
              <li class="ty-next-item">
                <span class="ty-next-num">03</span>
                <div>
                  <strong class="ty-next-title">Your complete natal reading at launch.</strong>
                  <p class="ty-next-desc">Delivered the moment OMENORA opens — computed across Western, Vedic, BaZi, and Tarot. You'll be among the first to receive it.</p>
                </div>
              </li>
              <li class="ty-next-item">
                <span class="ty-next-num">04</span>
                <div>
                  <strong class="ty-next-title">Updates by email.</strong>
                  <p class="ty-next-desc">Periodic milestone announcements as Compatibility and Counsel approach launch. No noise.</p>
                </div>
              </li>
            </ol>
          </template>
        </SectionLede>

        <!-- Refund reminder — inline, between What's next and Final CTA -->
        <div class="ty-refund-wrap">
          <div class="page-wrapper">
            <p class="ty-refund-note">
              14 days, no questions asked —
              <NuxtLink to="/refund-policy" class="ty-refund-note__link">refund policy</NuxtLink>.
              Email support@omenora.com with the subject "Founding Member Refund."
            </p>
          </div>
        </div>

        <!-- § 03 — Final CTA -->
        <SectionFinalCTA
          eyebrow="Your reading"
          heading="Your reading"
          cta-label="Begin your natal reading"
          body="Today's horoscope is live. Your natal reading is one quiz away. Begin wherever feels right."
          band-tone="page"
          marker="§ 03"
          bg-image="/images/hero/final-cta-cosmic.webp"
          bg-image-pos="center 60%"
          bg-image-pos-mobile="center 55%"
        >
          <template #heading-em>Your reading <em>is ready.</em></template>
          <template #cta>
            <div class="ty-final-ctas">
              <AppButton variant="primary" to="/analysis" :arrow="true">
                Begin your natal reading
              </AppButton>
              <AppButton variant="ghost" to="/daily" :arrow="true">
                Read today's horoscope
              </AppButton>
            </div>
          </template>
        </SectionFinalCTA>

      </template>

    </main>

    <!-- ── Footer — only in paid state ──────────────────────────────────────── -->
    <SectionFooter
      v-if="pageState === 'paid'"
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
import SectionFinalCTA from '~/components/sections/SectionFinalCTA.vue'
import SectionFooter from '~/components/sections/SectionFooter.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppHeader from '~/components/AppHeader.vue'

const { $trackPurchase } = useNuxtApp()

// ── SEO ────────────────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Welcome, Founding Member — OMENORA',
  robots: 'noindex, nofollow',
})

// ── State ───────────────────────────────────────────────────────────────────────
type PageState = 'loading' | 'pending' | 'pending-timeout' | 'paid' | 'error'

const pageState    = ref<PageState>('loading')
const verifiedData = ref<{ email: string; purchasedAt: string } | null>(null)

const formattedDate = computed(() => {
  if (!verifiedData.value?.purchasedAt) return ''
  return new Intl.DateTimeFormat('en-US', {
    month:  'long',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
  }).format(new Date(verifiedData.value.purchasedAt))
})

// ── Order reference — last 4 chars of session_id ───────────────────────────────
const route    = useRoute()
const orderRef = computed(() => {
  const sid = (route.query.session_id ?? '') as string
  return sid ? sid.slice(-4).toUpperCase() : ''
})

// ── Hero copy ──────────────────────────────────────────────────────────────────
const heroLines   = ['Welcome,', 'Founding Member.']
const heroSubhead = 'Your $20 deposit is confirmed. You\'ve unlocked your complete natal reading at launch, lifetime 50% off OMENORA Premium ($2.99/week, $7.50/month, $49.99/year), early access to Compatibility and Counsel, your founder badge, and your name in the credits. Your place on the founding-member list is locked for life.'

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

// ── Polling ──────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS  = 20_000

let pollTimer:    ReturnType<typeof setInterval> | null = null
let timeoutTimer: ReturnType<typeof setTimeout>  | null = null

function stopPolling() {
  if (pollTimer)    { clearInterval(pollTimer);   pollTimer    = null }
  if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null }
}

onUnmounted(() => {
  stopPolling()
  window.removeEventListener('scroll', onPageScroll)
  if (pageProgressRaf != null) cancelAnimationFrame(pageProgressRaf)
})

// ── Core verify function ──────────────────────────────────────────────────────
async function verifySession(sessionId: string): Promise<void> {
  try {
    const data = await $fetch<{
      status: string
      email?: string
      purchasedAt?: string
    }>(`/api/founding/verify-session?session_id=${encodeURIComponent(sessionId)}`)

    if (data.status === 'paid' && data.email && data.purchasedAt) {
      stopPolling()
      verifiedData.value = { email: data.email, purchasedAt: data.purchasedAt }
      pageState.value    = 'paid'

      // ── Purchase pixel — idempotent, matches pattern in report.vue / compatibility.vue ──
      try {
        const pixelKey = `omenora_purchase_tracked_${sessionId}`
        if (!sessionStorage.getItem(pixelKey)) {
          sessionStorage.setItem(pixelKey, '1')
          $trackPurchase({ value: 20, currency: 'USD', content_name: 'Founding Membership' })
        }
      } catch (pixelErr) {
        console.warn('[thank-you] trackPurchase error:', pixelErr)
      }
      return
    }

    if (data.status === 'pending') {
      // Only set pending state if we're still in loading (first call)
      // or already in pending. Don't regress from paid.
      if (pageState.value === 'loading' || pageState.value === 'pending') {
        pageState.value = 'pending'
      }
      return
    }

    // refunded / disputed / unexpected
    stopPolling()
    pageState.value = 'error'
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 404) {
      // Not in our DB at all — hard error
      stopPolling()
      pageState.value = 'error'
      return
    }
    if (status === 429) {
      // Rate-limited — stop polling, degrade gracefully to pending-timeout
      stopPolling()
      if (pageState.value === 'loading' || pageState.value === 'pending') {
        pageState.value = 'pending-timeout'
      }
      return
    }
    // Network error or 5xx during an active poll — stop and degrade gracefully
    stopPolling()
    console.error('[thank-you] verify-session error:', err)
    if (pageState.value === 'loading') {
      // Failed on very first call with no prior pending state → hard error
      pageState.value = 'error'
    } else {
      // Was polling — degrade to pending-timeout so the user isn't stranded
      pageState.value = 'pending-timeout'
    }
  }
}

// ── Mount: read session_id from URL and start verification ─────────────────────
onMounted(async () => {
  window.addEventListener('scroll', onPageScroll, { passive: true })
  updatePageProgress()

  const query     = import.meta.client ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const sessionId = query.get('session_id') ?? ''

  if (!sessionId || !sessionId.startsWith('cs_')) {
    pageState.value = 'error'
    return
  }

  // First call — immediate
  await verifySession(sessionId)

  // If still pending after first call, start polling
  if (pageState.value === 'pending') {
    timeoutTimer = setTimeout(() => {
      stopPolling()
      if (pageState.value === 'pending') {
        pageState.value = 'pending-timeout'
      }
    }, POLL_TIMEOUT_MS)

    pollTimer = setInterval(() => {
      verifySession(sessionId)
    }, POLL_INTERVAL_MS)
  }
})

// ── Footer data ────────────────────────────────────────────────────────────────
const currentYear   = computed(() => new Date().getFullYear())
const footerColumns = [
  { heading: 'Product', links: [{ label: 'Try the quiz', href: '/analysis' }, { label: 'Daily reading', href: '/daily' }, { label: 'Founding Member', href: '/founding' }] },
  { heading: 'Company', links: [{ label: 'Contact', href: 'mailto:hello@omenora.com' }] },
  { heading: 'Legal',   links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'Refund policy', href: '/refund-policy' }] },
]
</script>

<style scoped>
/* ── Page wrapper ──────────────────────────────────────────────────────────── */
.ty-page {
  min-height: 100vh;
}

/* ── Atmospheric layers (paid state only) ───────────────────────────────────
   Identical pattern to founding/index.vue and index.vue. */

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

/* ── Functional states (loading / pending / error) ──────────────────────────
   Plain layout — no atmospheric depth, intentionally neutral. */

.ty-functional {
  padding: clamp(48px, 8vw, 96px) 0;
}

/* ── Status eyebrow ────────────────────────────────────────────────────────── */
.ty-status {
  color: var(--omn-accent);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 20px;
}

/* ── Functional-state headlines ────────────────────────────────────────────── */
.ty-headline {
  font-size: clamp(28px, 6vw, 52px);
  line-height: 1.1;
  color: var(--omn-text-primary);
  margin-bottom: 28px;
  text-wrap: balance;
}

/* ── Functional-state body text ────────────────────────────────────────────── */
.ty-body {
  font-family: var(--omn-font-body);
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--omn-text-secondary);
  max-width: 600px;
}

/* ── Links ─────────────────────────────────────────────────────────────────── */
.ty-link {
  color: var(--omn-text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.ty-link:hover {
  color: var(--omn-text-primary);
}

/* ── Loading bar ───────────────────────────────────────────────────────────── */

/* ── Pending ───────────────────────────────────────────────────────────────── */

/* ── Error / Pending-timeout ────────────────────────────────────────────────── */
.ty-error,
.ty-pending-timeout {
  max-width: 580px;
}

.ty-error__back {
  margin-top: 28px;
}

/* ── Hero trust strip (inside #trust slot of SectionHero) ──────────────────── */
.ty-order-ref {
  font-family: var(--omn-font-body);
  letter-spacing: 0.1em;
  color: var(--omn-text-primary);
}

/* ── "What's next" numbered list (inside #body-extra slot of § 02) ──────────
   Rendered inside SectionLede's .section-lede__extra container. */
.ty-next-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.ty-next-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ty-next-num {
  font-family: var(--omn-font-body);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--omn-accent);
  flex-shrink: 0;
  padding-top: 3px;
  min-width: 20px;
}

.ty-next-title {
  font-family: var(--omn-font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--omn-text-primary);
  display: block;
  margin-bottom: 4px;
}

.ty-next-desc {
  font-family: var(--omn-font-body);
  font-size: 14px;
  line-height: 1.7;
  color: var(--omn-text-secondary);
  margin: 0;
}

/* ── Refund reminder — between SectionLede and SectionFinalCTA ──────────────── */
.ty-refund-wrap {
  background: var(--omn-bg-page);
}

.ty-refund-note {
  padding: 20px 0;
  font-family: var(--omn-font-body);
  font-size: 12px;
  line-height: 1.6;
  color: var(--omn-text-tertiary);
  border-top: 1px solid var(--omn-border-subtle);
  margin: 0;
}

.ty-refund-note__link {
  color: var(--omn-text-tertiary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.ty-refund-note__link:hover {
  color: var(--omn-text-secondary);
}

/* ── Final CTA dual-button layout (inside #cta slot of SectionFinalCTA) ──────── */
.ty-final-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: center;
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .ty-final-ctas {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
