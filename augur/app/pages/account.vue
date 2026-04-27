<template>
  <!-- ── STATE 1: Loading ── -->
  <div v-if="isLoading" class="center-page">
    <div class="center-content">
      <OrbitalMark />
      <p class="brand-text">OMENORA</p>
      <p class="status-text">Loading your account...</p>
    </div>
  </div>

  <!-- ── STATE 2b: Magic link pending — require explicit click to confirm ── -->
  <div v-else-if="pendingTokenHash" class="center-page auth-page">
    <div class="auth-top-bar">
      <p class="top-brand">OMENORA</p>
    </div>
    <div class="auth-card">
      <p class="sent-icon">✦</p>
      <p class="auth-title">Complete your sign-in</p>
      <p class="auth-sub">Click the button below to finish signing in to your account.</p>

      <button
        class="cta-btn"
        :disabled="isConfirming"
        @click="handleConfirmMagicLink"
      >
        {{ isConfirming ? 'Signing in...' : 'Sign in to OMENORA' }}
      </button>

      <div v-if="confirmError === 'expired'" class="confirm-error">
        <p>This link has expired or was already used.</p>
        <button class="link-btn" @click="pendingTokenHash = null">Request a new link →</button>
      </div>
      <div v-else-if="confirmError === 'error'" class="confirm-error">
        <p>Something went wrong. Please try again.</p>
        <button class="link-btn" @click="pendingTokenHash = null">Request a new link →</button>
      </div>
    </div>
  </div>

  <!-- ── STATE 2: Not authenticated — magic link sign-in ── -->
  <div v-else-if="!isAuthenticated" class="center-page auth-page">
    <div class="auth-top-bar">
      <p class="top-brand">OMENORA</p>
    </div>
    <div class="auth-card">
      <p class="auth-title">Sign in to your account</p>
      <p class="auth-sub">We'll send a magic link to your email. No password needed.</p>

      <div v-if="!magicLinkSent">
        <input
          v-model="emailInput"
          type="email"
          class="email-input"
          placeholder="your@email.com"
          autocomplete="email"
          :disabled="isSendingLink"
          @keydown.enter="sendMagicLink"
        >
        <button
          class="cta-btn"
          :disabled="isSendingLink || !emailInput.trim()"
          @click="sendMagicLink"
        >
          {{ isSendingLink ? 'Sending...' : 'Send magic link' }}
        </button>
        <p v-if="magicLinkError" class="error-text">{{ magicLinkError }}</p>
      </div>

      <div v-else class="sent-message">
        <p class="sent-icon">✦</p>
        <p class="sent-title">Check your email</p>
        <p class="sent-sub">We sent a sign-in link to <strong>{{ emailInput }}</strong>. It expires in 1 hour.</p>
      </div>
    </div>
  </div>

  <!-- ── STATE 3: Authenticated dashboard ── -->
  <div v-else class="account-page">

    <div class="top-bar">
      <p class="top-brand">OMENORA</p>
      <p class="top-email">{{ userEmail }}</p>
      <button class="signout-btn" @click="handleSignOut">Sign out</button>
    </div>

    <div class="account-content">

      <!-- ── Section 1: Subscription status ── -->
      <section class="account-section">
        <h2 class="section-heading">Subscription</h2>

        <div v-if="isLoadingSubscription" class="status-loading">
          <span class="status-dot-pulse" /> Checking subscription...
        </div>

        <div v-else-if="subscriptionActive" class="sub-status-card">
          <div class="sub-status-row">
            <span class="active-badge">Active</span>
            <span class="sub-label">Compatibility Plus</span>
          </div>
          <button
            class="action-btn"
            :disabled="isOpeningPortal"
            @click="openPortal"
          >
            {{ isOpeningPortal ? 'Opening...' : 'Manage subscription' }}
          </button>
          <p v-if="portalError" class="error-text">{{ portalError }}</p>
        </div>

        <div v-else class="sub-status-card inactive">
          <p class="no-sub-text">No active subscription</p>
          <button class="action-btn" @click="navigateTo('/compatibility-quiz')">
            See plans
          </button>
        </div>
      </section>

      <!-- ── Section 2: Reading history ── -->
      <section class="account-section">
        <h2 class="section-heading">Reading History</h2>

        <div v-if="isLoadingReports" class="status-loading">
          <span class="status-dot-pulse" /> Loading readings...
        </div>

        <div v-else-if="reports.length === 0" class="no-reports">
          No readings yet.
        </div>

        <div v-else class="reading-list">
          <div
            v-for="report in reports"
            :key="report.id"
            class="reading-card"
          >
            <div class="reading-card-left">
              <span class="reading-icon">{{ report.type === 'compatibility' ? '♥' : '✦' }}</span>
              <div class="reading-info">
                <p class="reading-title">
                  {{ report.type === 'compatibility'
                    ? `Compatibility — ${report.partner_name || 'Unknown'}`
                    : 'Archetype Reading' }}
                </p>
                <p class="reading-date">{{ formatDate(report.created_at) }}</p>
              </div>
            </div>
            <button class="view-btn" @click="navigateTo(`/report?session_id=${report.session_id}`)">View</button>
          </div>
        </div>
      </section>

      <!-- ── Section 3: Account actions ── -->
      <section class="account-section account-actions">
        <button class="action-btn signout-action" @click="handleSignOut">Sign out</button>
        <p class="support-text">Questions? <a href="mailto:support@omenora.com" class="support-link">support@omenora.com</a></p>
      </section>

    </div>

    <!-- Toast notification -->
    <div v-if="toast" class="toast">{{ toast }}</div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

useSeoMeta({ title: 'My Account — OMENORA', robots: 'noindex, nofollow' })

const { isAuthenticated, userEmail, session, restoreSession, confirmMagicLink, getMyReports, signOut } = useAuth()

// ── Page-level state ──────────────────────────────────────────────────────────
const isLoading = ref(true)

// ── Sign-in form state ────────────────────────────────────────────────────────
const emailInput      = ref('')
const isSendingLink   = ref(false)
const magicLinkSent   = ref(false)
const magicLinkError  = ref('')

// ── Magic link confirm state (click-to-confirm, prevents prefetch consumption)
const pendingTokenHash    = ref<string | null>(null)
const isConfirming        = ref(false)
const confirmError        = ref<'expired' | 'error' | null>(null)

// ── Subscription state ────────────────────────────────────────────────────────
const isLoadingSubscription = ref(false)
const subscriptionActive    = ref(false)
const isOpeningPortal       = ref(false)
const portalError           = ref('')

// ── Reports state ─────────────────────────────────────────────────────────────
const isLoadingReports = ref(false)
const reports          = ref<any[]>([])

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}

// ── onMounted: restore session then load data ─────────────────────────────────
onMounted(async () => {
  // Detect magic link token in URL — do NOT exchange it here.
  // Show a confirmation button instead so email prefetch scanners
  // (Gmail, Outlook Safe Links, etc.) cannot consume the one-time token.
  if (import.meta.client) {
    const urlToken = new URLSearchParams(window.location.search).get('token_hash')
    if (urlToken) {
      pendingTokenHash.value = urlToken
      isLoading.value = false
      return
    }
  }

  const authenticated = await restoreSession()
  isLoading.value = false

  if (authenticated) {
    loadSubscription()
    loadReports()
  }
})

// ── Confirm magic link on explicit user click ─────────────────────────────────
async function handleConfirmMagicLink() {
  if (!pendingTokenHash.value || isConfirming.value) return
  isConfirming.value = true
  confirmError.value = null

  const result = await confirmMagicLink(pendingTokenHash.value)

  if (result === 'ok') {
    pendingTokenHash.value = null
    loadSubscription()
    loadReports()
  } else {
    confirmError.value = result
  }
  isConfirming.value = false
}

// ── Load subscription status ──────────────────────────────────────────────────
async function loadSubscription() {
  isLoadingSubscription.value = true
  try {
    const token = session.value?.access_token
    if (!token) return

    const data = await $fetch<{ active: boolean; stripeSubscriptionId: string | null }>('/api/me/subscription', {
      headers: { Authorization: `Bearer ${token}` },
    })
    subscriptionActive.value = data.active
  } catch {
    // Non-critical — silently fail
  } finally {
    isLoadingSubscription.value = false
  }
}

// ── Load reading history ──────────────────────────────────────────────────────
async function loadReports() {
  isLoadingReports.value = true
  try {
    const data = await getMyReports()
    reports.value = (data as any[]).slice(0, 10)
  } catch {
    reports.value = []
  } finally {
    isLoadingReports.value = false
  }
}

// ── Magic link send ───────────────────────────────────────────────────────────
async function sendMagicLink() {
  const email = emailInput.value.trim()
  if (!email || isSendingLink.value) return

  isSendingLink.value = true
  magicLinkError.value = ''

  try {
    await $fetch('/api/auth/request-magic-link', {
      method: 'POST',
      body: { email },
    })
    magicLinkSent.value = true
  } catch {
    magicLinkError.value = 'Something went wrong. Please try again.'
  } finally {
    isSendingLink.value = false
  }
}

// ── Open Stripe Customer Portal ───────────────────────────────────────────────
async function openPortal() {
  if (isOpeningPortal.value || !userEmail.value) return

  isOpeningPortal.value = true
  portalError.value = ''

  try {
    const { url } = await $fetch<{ url: string }>('/api/create-portal-session', {
      method: 'POST',
      body: { email: userEmail.value },
    })
    window.location.href = url
  } catch (err: any) {
    const msg = err?.data?.message || ''
    if (msg.includes('No active subscription')) {
      portalError.value = 'No active subscription found. If you believe this is an error, contact support@omenora.com'
    } else {
      portalError.value = 'Unable to open subscription portal. Please try again or contact support.'
    }
    isOpeningPortal.value = false
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────────
async function handleSignOut() {
  await signOut()
  navigateTo('/')
}

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
/* ── Base ── */
.center-page,
.account-page {
  background: #07070D;
  color: rgba(255, 255, 255, 0.94);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  box-sizing: border-box;
}

/* ── Radial gradient overlay — matches all other pages ── */
.center-page::before,
.account-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 55% at 50% 0%, rgba(75, 45, 155, 0.18) 0%, transparent 68%),
    radial-gradient(ellipse 50% 40% at 15% 55%, rgba(50, 25, 110, 0.10) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* All direct children sit above the gradient overlay */
.center-page > *,
.account-page > * {
  position: relative;
  z-index: 1;
}

/* ── STATE 1: Loading ── */
.center-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 0 24px;
}

.brand-text {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

.status-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* ── STATE 2: Auth page layout ── */
.auth-page {
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 0;
}

.auth-top-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 48px 24px 40px;
  margin: 0 auto;
  box-sizing: border-box;
}

.auth-title {
  font-size: 20px;
  font-weight: 400;
  color: rgba(230, 220, 255, 0.9);
  margin: 0 0 10px;
  text-align: center;
  line-height: 1.4;
}

.auth-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 28px;
  text-align: center;
  line-height: 1.6;
}

.email-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  font-family: inherit;
  padding: 13px 16px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 12px;
  transition: border-color 0.18s ease;
  -webkit-appearance: none;
  appearance: none;
}

.email-input:focus {
  border-color: rgba(107, 72, 224, 0.50);
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.email-input:disabled {
  opacity: 0.5;
}

/* ── CTA button (magic link send) ── */
.cta-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(107, 72, 224, 0.50);
  border-radius: 12px;
  padding: 14px 24px;
  min-height: 48px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: rgba(200, 180, 255, 0.85);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.cta-btn:hover:not(:disabled) {
  background: rgba(107, 72, 224, 0.10);
  border-color: rgba(107, 72, 224, 0.70);
  color: rgba(200, 180, 255, 1);
}

.cta-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.error-text {
  font-size: 13px;
  color: rgba(255, 100, 100, 0.75);
  margin: 10px 0 0;
  text-align: center;
  line-height: 1.5;
}

.confirm-error {
  margin-top: 20px;
  text-align: center;
}

.confirm-error p {
  font-size: 13px;
  color: rgba(255, 100, 100, 0.75);
  margin: 0 0 10px;
  line-height: 1.5;
}

.link-btn {
  background: none;
  border: none;
  color: rgba(140, 110, 255, 0.70);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.15s ease;
}

.link-btn:hover {
  color: rgba(170, 140, 255, 0.90);
}

/* ── Sent confirmation ── */
.sent-message {
  text-align: center;
  padding: 8px 0;
}

.sent-icon {
  font-size: 28px;
  color: rgba(107, 72, 224, 0.70);
  margin: 0 0 16px;
}

.sent-title {
  font-size: 18px;
  font-weight: 400;
  color: rgba(230, 220, 255, 0.9);
  margin: 0 0 10px;
}

.sent-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.6;
  margin: 0;
}

/* ── Top bar (authenticated state) ── */
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.top-brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  flex-shrink: 0;
}

.top-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  text-align: center;
}

.signout-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  font-family: inherit;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.18s ease, color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.signout-btn:hover {
  border-color: rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.60);
}

/* ── Authenticated dashboard content ── */
.account-content {
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.account-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.account-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-heading {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: rgba(107, 72, 224, 0.70);
  text-transform: uppercase;
  margin: 0 0 20px;
}

/* ── Inline loading indicator ── */
.status-loading {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.30);
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.3); }
}

.status-dot-pulse {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(107, 72, 224, 0.60);
  animation: pulse-dot 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

/* ── Subscription / info cards ── */
.sub-status-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-status-card.inactive {
  border-color: rgba(255, 255, 255, 0.05);
}

.sub-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.active-badge {
  font-size: 10px;
  font-weight: 500;
  color: rgba(90, 210, 130, 0.90);
  background: rgba(90, 210, 130, 0.08);
  border: 1px solid rgba(90, 210, 130, 0.20);
  border-radius: 20px;
  padding: 3px 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sub-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.no-sub-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

/* ── Action button (matches retry-btn / return-btn pattern site-wide) ── */
.action-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(107, 72, 224, 0.40);
  border-radius: 12px;
  padding: 13px 24px;
  min-height: 46px;
  font-size: 13px;
  font-family: inherit;
  letter-spacing: 0.03em;
  color: rgba(200, 180, 255, 0.78);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.action-btn:hover:not(:disabled) {
  background: rgba(107, 72, 224, 0.10);
  border-color: rgba(107, 72, 224, 0.65);
  color: rgba(200, 180, 255, 1);
}

.action-btn:disabled {
  opacity: 0.40;
  cursor: not-allowed;
}

.action-btn.signout-action {
  width: auto;
  padding: 10px 20px;
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.40);
}

.action-btn.signout-action:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.60);
}

/* ── Reading history ── */
.no-reports {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.25);
}

.reading-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reading-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 14px 16px;
  gap: 12px;
}

.reading-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.reading-icon {
  font-size: 15px;
  color: rgba(107, 72, 224, 0.55);
  flex-shrink: 0;
}

.reading-info {
  min-width: 0;
}

.reading-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reading-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  margin: 0;
}

.view-btn {
  background: none;
  border: 1px solid rgba(107, 72, 224, 0.22);
  color: rgba(107, 72, 224, 0.65);
  font-size: 11px;
  font-family: inherit;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.18s ease, color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: 0.03em;
}

.view-btn:hover {
  border-color: rgba(107, 72, 224, 0.50);
  color: rgba(140, 110, 255, 0.90);
}

/* ── Account actions section ── */
.account-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.support-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.18);
  margin: 0;
}

.support-link {
  color: rgba(107, 72, 224, 0.45);
  text-decoration: underline;
  transition: color 0.15s ease;
}

.support-link:hover {
  color: rgba(140, 110, 255, 0.70);
}

/* ── Toast notification ── */
.toast {
  position: fixed;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 18, 42, 0.96);
  border: 1px solid rgba(107, 72, 224, 0.25);
  color: rgba(220, 210, 255, 0.85);
  font-size: 13px;
  font-family: inherit;
  padding: 11px 20px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  letter-spacing: 0.01em;
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .top-email {
    display: none;
  }

  .auth-card {
    padding: 36px 20px 32px;
  }

  .account-content {
    padding: 24px 16px 60px;
  }

  .reading-card {
    padding: 12px 14px;
  }

  .sub-status-card {
    padding: 16px;
  }
}
</style>
