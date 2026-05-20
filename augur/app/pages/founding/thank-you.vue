<template>
  <AppShell>

    <!-- ── LOADING ──────────────────────────────────────────────────────────── -->
    <section v-if="pageState === 'loading'" class="ty-section">
      <div class="page-wrapper">
        <div class="ty-loading">
          <div class="ty-loading__bar">
            <div class="ty-loading__fill" />
          </div>
          <p class="annotation ty-loading__label">Confirming your purchase…</p>
        </div>
      </div>
    </section>

    <!-- ── PENDING ──────────────────────────────────────────────────────────── -->
    <section v-else-if="pageState === 'pending'" class="ty-section">
      <div class="page-wrapper">
        <div class="ty-pending">
          <div class="ty-loading__bar">
            <div class="ty-loading__fill" />
          </div>
          <p class="ty-pending__label font-serif">Confirming your payment with Stripe…</p>
          <p class="annotation ty-pending__sub">This usually takes a few seconds.</p>
        </div>
      </div>
    </section>

    <!-- ── PENDING TIMEOUT ──────────────────────────────────────────────────── -->
    <section v-else-if="pageState === 'pending-timeout'" class="ty-section">
      <div class="page-wrapper">
        <div class="ty-pending-timeout">
          <p class="label-caps ty-status">Payment processing</p>
          <h1 class="ty-headline font-display-italic">Your payment is being processed.</h1>
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

    <!-- ── ERROR ────────────────────────────────────────────────────────────── -->
    <section v-else-if="pageState === 'error'" class="ty-section">
      <div class="page-wrapper">
        <div class="ty-error">
          <p class="label-caps ty-status">Something went wrong</p>
          <h1 class="ty-headline font-display-italic">We couldn't verify this purchase.</h1>
          <p class="ty-body">
            If you completed a payment, you'll receive a confirmation
            email at the address you used at checkout. Otherwise, please
            contact
            <a href="mailto:support@omenora.com" class="ty-link">support@omenora.com</a>.
          </p>
          <CTAButton to="/founding" variant="outline" class="ty-error__back">
            Back to founding membership
          </CTAButton>
        </div>
      </div>
    </section>

    <!-- ── PAID ─────────────────────────────────────────────────────────────── -->
    <template v-else-if="pageState === 'paid' && verifiedData">

      <!-- Above the fold -->
      <section class="ty-section ty-hero">
        <div class="page-wrapper">
          <div class="ty-hero__inner">

            <p class="label-caps ty-status">You're in.</p>

            <h1 class="ty-headline ty-headline--hero font-display-italic">
              Welcome, founding member.
            </h1>

            <!-- Confirmation block -->
            <div class="ty-confirm">
              <div class="ty-confirm__row">
                <span class="annotation ty-confirm__label">Confirmation sent to</span>
                <span class="ty-confirm__value">{{ verifiedData.email }}</span>
              </div>
              <div class="ty-confirm__row">
                <span class="annotation ty-confirm__label">Purchased</span>
                <span class="ty-confirm__value">{{ formattedDate }}</span>
              </div>
            </div>

            <p class="ty-body ty-body--hero">
              Your $20 founding membership is confirmed. You've unlocked
              lifetime 50% off future paid tiers, early access to
              Compatibility and Counsel, a founder badge on your profile,
              and your name in the credits at public launch. You're on the
              founding-member list and you'll hear from us before anyone else.
            </p>

          </div>
        </div>
      </section>

      <!-- Rule -->
      <div class="page-wrapper">
        <EditorialRule ornament="◇" />
      </div>

      <!-- A. What's next -->
      <section class="ty-section">
        <div class="page-wrapper">
          <div class="ty-next">
            <p class="label-caps founding-section__eyebrow">What's next</p>
            <h2 class="ty-subheadline font-display-italic">Three things to know.</h2>

            <div class="ty-next__grid">

              <div class="ty-next__item">
                <span class="ty-next__num annotation">[01]</span>
                <h3 class="ty-next__title">Confirmation email</h3>
                <p class="ty-next__desc">
                  Your confirmation should arrive within a few minutes.
                  If it doesn't appear, check your spam folder. Still
                  nothing? Email
                  <a href="mailto:support@omenora.com" class="ty-link">support@omenora.com</a>.
                </p>
              </div>

              <div class="ty-next__item">
                <span class="ty-next__num annotation">[02]</span>
                <h3 class="ty-next__title">The reading engine is live now</h3>
                <p class="ty-next__desc">
                  OMENORA's natal and daily reading engines are running
                  today. Your founding membership supports what comes
                  next — in the meantime, your reading is waiting.
                </p>
                <NuxtLink to="/daily" class="label-caps ty-next__link">
                  Read today's horoscope →
                </NuxtLink>
              </div>

              <div class="ty-next__item">
                <span class="ty-next__num annotation">[03]</span>
                <h3 class="ty-next__title">Updates by email</h3>
                <p class="ty-next__desc">
                  You'll receive periodic updates as Compatibility and
                  Counsel approach launch. No noise — only milestone
                  announcements, and you'll always be first.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <!-- B. Refund reminder -->
      <div class="page-wrapper">
        <div class="ty-refund-note">
          <p class="annotation">
            14 days, no questions asked —
            <NuxtLink to="/refund-policy" class="ty-refund-note__link">refund policy</NuxtLink>.
            Email support@omenora.com with the subject "Founding Member Refund."
          </p>
        </div>
      </div>

      <!-- Rule -->
      <div class="page-wrapper">
        <EditorialRule ornament="◇" />
      </div>

      <!-- C. Final CTA -->
      <section class="ty-section ty-final">
        <div class="page-wrapper">
          <div class="ty-final__inner">
            <p class="ty-final__prompt font-serif">
              Your reading is ready.
            </p>
            <CTAButton to="/daily" :arrow="true">
              Open today's reading
            </CTAButton>
          </div>
        </div>
      </section>

    </template>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const { $trackPurchase } = useNuxtApp()

// ── SEO ────────────────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Welcome, founding member — OMENORA',
  robots: 'noindex, nofollow',
})

// ── State ───────────────────────────────────────────────────────────────────────
type PageState = 'loading' | 'pending' | 'pending-timeout' | 'paid' | 'error'

const pageState   = ref<PageState>('loading')
const verifiedData = ref<{ email: string; purchasedAt: string } | null>(null)

const formattedDate = computed(() => {
  if (!verifiedData.value?.purchasedAt) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
    hour:  'numeric',
    minute: '2-digit',
  }).format(new Date(verifiedData.value.purchasedAt))
})

// ── Polling ──────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS  = 20_000

let pollTimer:   ReturnType<typeof setInterval>  | null = null
let timeoutTimer: ReturnType<typeof setTimeout> | null = null

function stopPolling() {
  if (pollTimer)   { clearInterval(pollTimer);  pollTimer   = null }
  if (timeoutTimer){ clearTimeout(timeoutTimer); timeoutTimer = null }
}

onUnmounted(stopPolling)

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
</script>

<style scoped>
/* ── Shared layout ─────────────────────────────────────────────────────────── */
.ty-section {
  padding: clamp(48px, 8vw, 96px) 0;
}

.ty-hero {
  padding-top: clamp(40px, 7vw, 80px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.ty-hero__inner {
  max-width: 680px;
}

/* ── Status line ───────────────────────────────────────────────────────────── */
.ty-status {
  color: var(--color-gold);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 20px;
}

/* ── Headlines ─────────────────────────────────────────────────────────────── */
.ty-headline {
  font-size: clamp(28px, 6vw, 52px);
  line-height: 1.1;
  color: var(--color-ink);
  margin-bottom: 28px;
  text-wrap: balance;
}

.ty-headline--hero {
  font-size: clamp(32px, 7vw, 60px);
  margin-bottom: 24px;
}

.ty-subheadline {
  font-size: clamp(24px, 4vw, 40px);
  line-height: 1.15;
  color: var(--color-ink);
  margin-bottom: 36px;
  text-wrap: balance;
}

/* ── Confirmation block ────────────────────────────────────────────────────── */
.ty-confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 0;
  border-top: 1px solid var(--color-ink-ghost);
  border-bottom: 1px solid var(--color-ink-ghost);
  margin-bottom: 28px;
}

.ty-confirm__row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.ty-confirm__label {
  flex-shrink: 0;
  width: 160px;
}

.ty-confirm__value {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  color: var(--color-ink);
}

/* ── Body text ─────────────────────────────────────────────────────────────── */
.ty-body {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: var(--text-body);
  line-height: 1.75;
  color: var(--color-ink-mid);
  max-width: 600px;
}

.ty-body--hero {
  margin-bottom: 0;
}

/* ── Links ─────────────────────────────────────────────────────────────────── */
.ty-link {
  color: var(--color-ink-mid);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.ty-link:hover {
  color: var(--color-ink);
}

/* ── Loading bar ───────────────────────────────────────────────────────────── */
.ty-loading {
  padding: clamp(80px, 15vw, 140px) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.ty-loading__bar {
  width: 160px;
  height: 1px;
  background: var(--color-ink-ghost);
  overflow: hidden;
}

.ty-loading__fill {
  height: 100%;
  width: 40%;
  background: var(--color-gold);
  animation: ty-scan 1.6s ease-in-out infinite;
}

@keyframes ty-scan {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}

.ty-loading__label {
  font-size: 11px;
  color: var(--color-ink-faint);
}

/* ── Pending ───────────────────────────────────────────────────────────────── */
.ty-pending {
  padding: clamp(80px, 15vw, 140px) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.ty-pending__label {
  font-size: clamp(18px, 3vw, 24px);
  color: var(--color-ink);
  font-style: italic;
}

.ty-pending__sub {
  color: var(--color-ink-faint);
}

/* ── Error / Pending-timeout ────────────────────────────────────────────────── */
.ty-error,
.ty-pending-timeout {
  max-width: 580px;
}

.ty-error__back {
  margin-top: 28px;
}

/* ── What's next ───────────────────────────────────────────────────────────── */
.ty-next {
  max-width: 900px;
}

.founding-section__eyebrow {
  color: var(--color-ink-faint);
  font-size: 10px;
  letter-spacing: 0.3em;
  margin-bottom: 16px;
}

.ty-next__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(28px, 4vw, 48px);
}

.ty-next__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ty-next__num {
  font-size: 10px;
  color: var(--color-ink-faint);
}

.ty-next__title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.4;
}

.ty-next__desc {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-ink-mid);
  margin: 0;
}

.ty-next__link {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--color-ink-faint);
  text-decoration: none;
  margin-top: 4px;
  transition: color 0.2s;
}

.ty-next__link:hover {
  color: var(--color-ink);
}

/* ── Refund note ───────────────────────────────────────────────────────────── */
.ty-refund-note {
  padding: 24px 0;
}

.ty-refund-note__link {
  color: var(--color-ink-faint);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Final CTA ─────────────────────────────────────────────────────────────── */
.ty-final {
  padding-bottom: clamp(64px, 12vw, 128px);
}

.ty-final__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.ty-final__prompt {
  font-size: clamp(20px, 3.5vw, 28px);
  font-style: italic;
  color: var(--color-ink);
  margin: 0;
}

/* ── Mobile adjustments ─────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .ty-confirm__label {
    width: auto;
    display: block;
  }

  .ty-confirm__row {
    flex-direction: column;
    gap: 4px;
  }

  .ty-next__grid {
    grid-template-columns: 1fr;
  }
}
</style>
