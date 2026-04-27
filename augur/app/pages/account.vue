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
    <div class="account-content">

      <!-- ── Page header ── -->
      <div class="page-header">
        <BackButton to="/" text="Home" />
        <p class="page-header-brand">OMENORA</p>
        <p class="page-header-email">{{ userEmail }}</p>
      </div>

      <!-- ── Hero ── -->
      <div class="account-hero">
        <div class="account-hero-glyph" aria-hidden="true">✦</div>
        <p class="account-hero-label">YOUR ACCOUNT</p>
        <p class="account-hero-email">{{ userEmail }}</p>
      </div>

      <!-- ── Section 1: Subscription ── -->
      <section class="account-section">
        <h2 class="section-heading">Subscription</h2>

        <div v-if="isLoadingSubscription" class="status-loading">
          <span class="status-dot-pulse" /> Checking subscription...
        </div>

        <div v-else-if="subscriptionActive" class="sub-status-card">
          <div class="sub-status-top">
            <div class="sub-status-row">
              <span class="active-badge">Active</span>
              <span class="sub-label">{{ subscriptionPlanName }}</span>
            </div>
            <span class="sub-price">{{ subscriptionPlanPrice }}<span class="sub-price-period">/mo</span></span>
          </div>
          <ul v-if="subscriptionPlanType === 'compatibility_plus'" class="sub-features">
            <li>Unlimited compatibility readings</li>
            <li>Daily horoscope — love, work &amp; health</li>
            <li>Reading history saved to your account</li>
            <li>Weekly relationship weather (coming soon)</li>
          </ul>
          <ul v-else class="sub-features">
            <li>Daily personalized horoscope</li>
            <li>Love, work &amp; health insights</li>
            <li>Delivered to your inbox every morning</li>
          </ul>
          <button
            class="action-btn"
            :disabled="isOpeningPortal"
            @click="openPortal"
          >
            {{ isOpeningPortal ? 'Opening...' : 'Manage subscription' }}
          </button>
          <p v-if="portalError" class="error-text">{{ portalError }}</p>
        </div>

        <div v-else class="sub-status-card sub-status-card--inactive">
          <div class="no-sub-row">
            <span class="inactive-badge">Inactive</span>
            <span class="sub-label">No active subscription</span>
          </div>
          <p class="sub-desc">Get a daily personal horoscope built from your exact birth chart.</p>
          <button class="action-btn action-btn--primary" @click="navigateTo('/subscribe')">
            Start Personal Horoscope — $4.99/mo
          </button>
        </div>
      </section>

      <!-- ── Section 2: Daily Horoscope Insights (subscribers only) ── -->
      <section v-if="subscriptionActive" class="account-section">
        <div class="section-header-row">
          <h2 class="section-heading">Daily Horoscope</h2>
          <span class="section-badge">Last 7 days</span>
        </div>

        <div v-if="isLoadingInsights" class="status-loading">
          <span class="status-dot-pulse" /> Loading insights...
        </div>

        <div v-else-if="dailyInsights.length === 0" class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">☽</div>
          <p class="empty-state-text">Your first daily insight will appear here after tomorrow morning's delivery.</p>
        </div>

        <div v-else class="insight-cards-list">
          <div
            v-for="entry in dailyInsights"
            :key="entry.sent_date"
            class="insight-entry"
          >
            <!-- Collapsed header -->
            <button
              class="insight-entry-header"
              :aria-expanded="expandedInsight === entry.sent_date"
              @click="toggleInsight(entry.sent_date)"
            >
              <div class="insight-entry-left">
                <span class="insight-entry-glyph" aria-hidden="true">✦</span>
                <div class="insight-entry-meta">
                  <p class="insight-entry-date">{{ formatDate(entry.sent_date) }}</p>
                  <p class="insight-entry-theme">{{ entry.theme_used }}</p>
                </div>
              </div>
              <svg
                class="insight-entry-chevron"
                :class="{ 'insight-entry-chevron--open': expandedInsight === entry.sent_date }"
                viewBox="0 0 16 16" fill="none" aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Expanded body -->
            <div v-if="expandedInsight === entry.sent_date" class="insight-entry-body">

              <!-- Insight card (visual, downloadable) -->
              <div class="insight-visual-card">
                <div class="ivc-header">
                  <span class="ivc-brand">OMENORA</span>
                  <span class="ivc-date">{{ formatDate(entry.sent_date) }}</span>
                </div>
                <div class="ivc-theme-line" aria-hidden="true" />
                <p class="ivc-theme">{{ entry.theme_used }}</p>
                <div v-if="entry.structured" class="insight-sections">
                  <div class="insight-section-row">
                    <span class="insight-section-label insight-section-label--love">♥ LOVE</span>
                    <p class="insight-section-text">{{ entry.structured.love }}</p>
                  </div>
                  <div class="insight-section-row">
                    <span class="insight-section-label insight-section-label--work">✦ WORK</span>
                    <p class="insight-section-text">{{ entry.structured.work }}</p>
                  </div>
                  <div class="insight-section-row">
                    <span class="insight-section-label insight-section-label--health">✿ HEALTH</span>
                    <p class="insight-section-text">{{ entry.structured.health }}</p>
                  </div>
                  <p v-if="entry.structured.reflection_question" class="insight-reflection">
                    {{ entry.structured.reflection_question }}
                  </p>
                </div>
                <p v-else class="ivc-body">{{ entry.insight_preview }}</p>
                <div v-if="!entry.structured && entry.reflection_question" class="ivc-reflection">
                  <span class="ivc-reflection-label">REFLECTION</span>
                  <p class="ivc-reflection-text">{{ entry.reflection_question }}</p>
                </div>
              </div>

              <!-- Download button -->
              <button
                class="insight-dl-btn"
                :disabled="downloadingInsight === entry.sent_date"
                @click="downloadInsightCard(entry)"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="insight-dl-icon">
                  <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ downloadingInsight === entry.sent_date ? 'Generating...' : 'Download as Image' }}
              </button>

            </div>
          </div>
        </div>
      </section>

      <!-- ── Section 3: Compatibility readings ── -->
      <section class="account-section">
        <h2 class="section-heading">Compatibility Readings</h2>

        <div v-if="isLoadingCompatReadings" class="section-loading">Loading readings...</div>

        <div v-else-if="compatibilityReadings.length === 0" class="section-empty">
          <p>No compatibility readings yet.</p>
          <button class="cta-small" @click="navigateTo('/compatibility-quiz')">
            Try your first reading →
          </button>
        </div>

        <div v-else class="compat-readings-list">
          <div
            v-for="reading in compatibilityReadings"
            :key="reading.id"
            class="compat-reading-card"
          >
            <div class="crc-header">
              <span class="crc-partner">{{ reading.partnerName || 'Unknown partner' }}</span>
              <span v-if="reading.score !== null" class="crc-score" :style="{ color: scoreColor(reading.score) }">
                {{ reading.score }}%
              </span>
            </div>
            <p v-if="reading.title" class="crc-title">{{ reading.title }}</p>
            <div class="crc-footer">
              <span class="crc-date">{{ formatDate(reading.createdAt) }}</span>
              <button class="crc-view-btn" @click="navigateTo('/compatibility?session_id=' + reading.sessionId)">
                View reading →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Section 4: Reading history ── -->
      <section class="account-section">
        <h2 class="section-heading">Reading History</h2>

        <div v-if="isLoadingReports" class="status-loading">
          <span class="status-dot-pulse" /> Loading readings...
        </div>

        <div v-else-if="reports.length === 0" class="empty-state">
          <p class="empty-state-text">No readings yet.</p>
          <button class="action-btn action-btn--ghost" @click="navigateTo('/')">
            Get your first reading
          </button>
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
            <button
              class="view-btn"
              @click="navigateTo(report.type === 'compatibility' ? `/compatibility?session_id=${report.session_id}&from=history` : `/report?session_id=${report.session_id}`)"
            >View</button>
          </div>
        </div>
      </section>

      <!-- ── Section 4: Account actions ── -->
      <section class="account-section account-section--last">
        <button class="action-btn action-btn--ghost" @click="handleSignOut">Sign out</button>
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

// ── Canvas-based insight card download ────────────────────────────────────────
const downloadingInsight = ref<string | null>(null)

async function downloadInsightCard(entry: { sent_date: string; theme_used: string; insight_full?: string; insight_preview?: string; reflection_question?: string }) {
  if (downloadingInsight.value) return
  downloadingInsight.value = entry.sent_date

  try {
    const W = 1080
    const H = 1350
    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#07070D'
    ctx.fillRect(0, 0, W, H)

    // Radial top glow
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.65)
    glow.addColorStop(0,   'rgba(75, 45, 155, 0.30)')
    glow.addColorStop(0.5, 'rgba(50, 25, 110, 0.12)')
    glow.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // Header line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(72, 120); ctx.lineTo(W - 72, 120); ctx.stroke()

    // Brand
    ctx.font = '500 28px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.letterSpacing = '0.22em'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.textAlign = 'left'
    ctx.fillText('OMENORA', 72, 92)

    // Date
    ctx.font = '400 26px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.letterSpacing = '0.04em'
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.textAlign = 'right'
    ctx.fillText(formatDate(entry.sent_date), W - 72, 92)

    // Glyph
    ctx.font = '400 48px serif'
    ctx.fillStyle = 'rgba(107, 72, 224, 0.60)'
    ctx.textAlign = 'center'
    ctx.fillText('✦', W / 2, 200)

    // Theme
    ctx.font = '300 52px Georgia, serif'
    ctx.fillStyle = 'rgba(220, 210, 255, 0.88)'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '0.02em'
    wrapText(ctx, entry.theme_used, W / 2, 280, W - 144, 68)

    // Divider
    const divY = 380
    ctx.strokeStyle = 'rgba(107, 72, 224, 0.20)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(144, divY); ctx.lineTo(W - 144, divY); ctx.stroke()

    // Insight body
    const bodyText = entry.insight_full || entry.insight_preview || ''
    ctx.font = '300 34px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.textAlign = 'left'
    ctx.letterSpacing = '0.01em'
    const bodyEndY = wrapText(ctx, bodyText, 72, 440, W - 144, 50)

    // Reflection
    if (entry.reflection_question) {
      const rfY = Math.max(bodyEndY + 60, 900)
      ctx.font = 'italic 400 30px Georgia, serif'
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.textAlign = 'left'
      ctx.letterSpacing = '0.01em'
      ctx.fillText('Reflection', 72, rfY)
      ctx.font = 'italic 300 30px Georgia, serif'
      ctx.fillStyle = 'rgba(200, 180, 255, 0.60)'
      wrapText(ctx, entry.reflection_question, 72, rfY + 48, W - 144, 44)
    }

    // Footer
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(72, H - 100); ctx.lineTo(W - 72, H - 100); ctx.stroke()
    ctx.font = '400 24px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '0.10em'
    ctx.fillText('omenora.com', W / 2, H - 60)

    const link = document.createElement('a')
    link.download = `omenora-insight-${entry.sent_date}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    showToast('Image saved!')
  } catch {
    showToast('Download failed. Please try again.')
  } finally {
    downloadingInsight.value = null
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (let n = 0; n < words.length; n++) {
    const testLine  = line + words[n] + ' '
    const metrics   = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cy)
      line = words[n] + ' '
      cy += lineHeight
    } else {
      line = testLine
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), x, cy); cy += lineHeight }
  return cy
}

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
const subscriptionPlanName  = ref<string | null>(null)
const subscriptionPlanPrice = ref<string | null>(null)
const subscriptionPlanType  = ref<string | null>(null)
const isOpeningPortal       = ref(false)
const portalError           = ref('')

// ── Reports state ─────────────────────────────────────────────────────────────
const isLoadingReports = ref(false)
const reports          = ref<any[]>([])

// ── Daily insights state ──────────────────────────────────────────────────────
const isLoadingInsights = ref(false)
const dailyInsights     = ref<any[]>([])
const expandedInsight   = ref<string | null>(null)

// ── Compatibility readings state ───────────────────────────────────────────────
const compatibilityReadings    = ref<any[]>([])
const isLoadingCompatReadings  = ref(false)

function toggleInsight(date: string) {
  expandedInsight.value = expandedInsight.value === date ? null : date
}

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
    loadDailyInsights()
    loadCompatibilityReadings()
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
    loadDailyInsights()
    loadCompatibilityReadings()
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

    const data = await $fetch<{
      active: boolean
      stripeSubscriptionId: string | null
      planName: string | null
      planPrice: string | null
      planType: string | null
    }>('/api/me/subscription', {
      headers: { Authorization: `Bearer ${token}` },
    })
    subscriptionActive.value    = data.active
    subscriptionPlanName.value  = data.planName
    subscriptionPlanPrice.value = data.planPrice
    subscriptionPlanType.value  = data.planType
  } catch {
    // Non-critical — silently fail
  } finally {
    isLoadingSubscription.value = false
  }
}

// ── Load daily insights ─────────────────────────────────────────────────────
async function loadDailyInsights() {
  isLoadingInsights.value = true
  try {
    const token = session.value?.access_token
    if (!token) return
    const data = await $fetch<{ insights: any[] }>('/api/me/daily-insights', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const parsedInsights = data.insights.map((item: any) => {
      let structured = null
      try {
        structured = item.insight_full ? JSON.parse(item.insight_full) : null
      } catch {
        structured = null
      }
      return { ...item, structured }
    })
    dailyInsights.value = parsedInsights
  } catch {
    dailyInsights.value = []
  } finally {
    isLoadingInsights.value = false
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

// ── Compatibility readings loader ────────────────────────────────────────────
async function loadCompatibilityReadings() {
  isLoadingCompatReadings.value = true
  try {
    const token = session.value?.access_token
    if (!token) return
    const data = await $fetch<{ readings: any[] }>('/api/me/compatibility-readings', {
      headers: { Authorization: `Bearer ${token}` },
    })
    compatibilityReadings.value = data.readings ?? []
  } catch {
    compatibilityReadings.value = []
  } finally {
    isLoadingCompatReadings.value = false
  }
}

// ── Score colour helper ───────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return 'rgba(140, 110, 255, 0.9)'
  if (score >= 60) return 'rgba(200, 150, 50, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
}

// ── Date formatter (shared by reports and insights) ─────────────────────────
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

.center-page::before,
.account-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(75, 45, 155, 0.22) 0%, transparent 65%),
    radial-gradient(ellipse 55% 45% at 85% 70%, rgba(50, 25, 110, 0.10) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.center-page > *,
.account-page > * {
  position: relative;
  z-index: 1;
}

.account-page {
  display: block;
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

/* ── STATE 2: Auth ── */
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
  border: 1px solid rgba(255, 255, 255, 0.10);
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

.email-input:focus { border-color: rgba(107, 72, 224, 0.50); }
.email-input::placeholder { color: rgba(255, 255, 255, 0.2); }
.email-input:disabled { opacity: 0.5; }

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

.cta-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.error-text {
  font-size: 13px;
  color: rgba(255, 100, 100, 0.75);
  margin: 10px 0 0;
  text-align: center;
  line-height: 1.5;
}

.confirm-error { margin-top: 20px; text-align: center; }

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

.link-btn:hover { color: rgba(170, 140, 255, 0.90); }

.sent-message { text-align: center; padding: 8px 0; }

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

/* ── Authenticated layout ── */
.account-content {
  max-width: 560px;
  margin: 0 auto;
  padding: 20px 20px 80px;
}

/* ── Page header — BackButton + brand + email ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}

.page-header-brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 13px;
  letter-spacing: 0.22em;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  flex: 1;
  text-align: center;
}

.page-header-email {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.20);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Hero ── */
.account-hero {
  text-align: center;
  padding: 20px 0 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.account-hero-glyph {
  font-size: 22px;
  color: rgba(107, 72, 224, 0.45);
  margin-bottom: 16px;
  display: block;
}

.account-hero-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.20em;
  color: rgba(107, 72, 224, 0.55);
  margin: 0 0 14px;
}

.account-hero-email {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 22px;
  font-weight: 300;
  color: rgba(220, 210, 255, 0.65);
  margin: 0;
  word-break: break-all;
  letter-spacing: 0.01em;
}

/* ── Sections ── */
.account-section {
  margin-bottom: 44px;
  padding-bottom: 44px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.account-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-heading {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  color: rgba(107, 72, 224, 0.65);
  text-transform: uppercase;
  margin: 0 0 18px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-header-row .section-heading {
  margin: 0;
}

.section-badge {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  padding: 3px 10px;
  letter-spacing: 0.04em;
}

/* ── Loading indicator ── */
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

/* ── Subscription card ── */
.sub-status-card {
  background: rgba(107, 72, 224, 0.04);
  border: 1px solid rgba(107, 72, 224, 0.16);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sub-status-card--inactive {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
}

.sub-status-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sub-status-row,
.no-sub-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.active-badge {
  font-size: 10px;
  font-weight: 500;
  color: rgba(90, 210, 130, 0.92);
  background: rgba(90, 210, 130, 0.08);
  border: 1px solid rgba(90, 210, 130, 0.20);
  border-radius: 20px;
  padding: 3px 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.inactive-badge {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.30);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 3px 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sub-label {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
}

.sub-price {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  color: rgba(220, 210, 255, 0.80);
  white-space: nowrap;
}

.sub-price-period {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.30);
}

.sub-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  line-height: 1.65;
}

.sub-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sub-features li {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.60);
  padding: 3px 0;
  padding-left: 1.1em;
  position: relative;
}

.sub-features li::before {
  content: '✦';
  position: absolute;
  left: 0;
  color: rgba(140, 110, 255, 0.70);
  font-size: 0.6rem;
  top: 5px;
}

/* ── Action buttons ── */
.action-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(107, 72, 224, 0.38);
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
  border-color: rgba(107, 72, 224, 0.62);
  color: rgba(200, 180, 255, 1);
}

.action-btn:disabled { opacity: 0.40; cursor: not-allowed; }

.action-btn--primary {
  background: rgba(107, 72, 224, 0.10);
  border-color: rgba(107, 72, 224, 0.50);
  color: rgba(200, 180, 255, 0.90);
}

.action-btn--primary:hover:not(:disabled) {
  background: rgba(107, 72, 224, 0.18);
  border-color: rgba(107, 72, 224, 0.75);
  color: rgba(220, 200, 255, 1);
}

.action-btn--ghost {
  width: auto;
  padding: 10px 20px;
  border-color: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.32);
  font-size: 12px;
}

.action-btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.58);
}

/* ── Empty states ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.empty-state-icon {
  font-size: 24px;
  color: rgba(107, 72, 224, 0.30);
  margin-bottom: 2px;
}

.empty-state-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
  line-height: 1.65;
}

/* ── Reading history ── */
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
  border-radius: 12px;
  padding: 14px 16px;
  gap: 12px;
  transition: border-color 0.18s ease;
}

.reading-card:hover {
  border-color: rgba(107, 72, 224, 0.18);
}

.reading-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.reading-icon {
  font-size: 14px;
  color: rgba(107, 72, 224, 0.50);
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 72, 224, 0.07);
  border-radius: 8px;
}

.reading-info { min-width: 0; }

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
  border: 1px solid rgba(107, 72, 224, 0.20);
  color: rgba(107, 72, 224, 0.60);
  font-size: 11px;
  font-family: inherit;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: 0.03em;
}

.view-btn:hover {
  background: rgba(107, 72, 224, 0.07);
  border-color: rgba(107, 72, 224, 0.45);
  color: rgba(140, 110, 255, 0.90);
}

/* ── Daily horoscope insight entries ── */
.insight-cards-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-entry {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.insight-entry:has(.insight-entry-body) {
  border-color: rgba(107, 72, 224, 0.20);
}

.insight-entry-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 16px 18px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font-family: inherit;
  gap: 12px;
  -webkit-tap-highlight-color: transparent;
}

.insight-entry-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.insight-entry-glyph {
  font-size: 12px;
  color: rgba(107, 72, 224, 0.55);
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 72, 224, 0.08);
  border-radius: 8px;
}

.insight-entry-meta { min-width: 0; }

.insight-entry-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 3px;
  font-weight: 400;
}

.insight-entry-theme {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.insight-entry-chevron {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.20);
  flex-shrink: 0;
  transition: transform 0.22s ease, color 0.18s ease;
}

.insight-entry-chevron--open {
  transform: rotate(180deg);
  color: rgba(107, 72, 224, 0.60);
}

/* ── Expanded insight body ── */
.insight-entry-body {
  padding: 0 18px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ── Visual insight card (premium readable card) ── */
.insight-visual-card {
  background: rgba(107, 72, 224, 0.05);
  border: 1px solid rgba(107, 72, 224, 0.12);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  margin-bottom: 14px;
}

.ivc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.ivc-brand {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 11px;
  letter-spacing: 0.20em;
  color: rgba(255, 255, 255, 0.22);
}

.ivc-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  letter-spacing: 0.03em;
}

.ivc-theme-line {
  height: 1px;
  background: rgba(107, 72, 224, 0.18);
  margin-bottom: 16px;
}

.ivc-theme {
  font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  font-size: 18px;
  font-weight: 400;
  color: rgba(220, 210, 255, 0.88);
  margin: 0 0 14px;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.ivc-body {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.75;
  margin: 0;
}

.insight-sections {
  margin-top: 12px;
}

.insight-section-row {
  margin-bottom: 14px;
}

.insight-section-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.insight-section-label--love   { color: rgba(200, 150, 50, 0.90); }
.insight-section-label--work   { color: rgba(140, 110, 255, 0.90); }
.insight-section-label--health { color: rgba(100, 200, 150, 0.90); }

.insight-section-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0;
}

.insight-reflection {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.40);
  font-style: italic;
  margin-top: 12px;
  margin-bottom: 0;
  line-height: 1.5;
}

.ivc-reflection {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(107, 72, 224, 0.10);
}

.ivc-reflection-label {
  display: block;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  color: rgba(107, 72, 224, 0.50);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.ivc-reflection-text {
  font-size: 13px;
  font-style: italic;
  color: rgba(200, 185, 255, 0.55);
  line-height: 1.65;
  margin: 0;
}

/* ── Download button ── */
.insight-dl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 11px 18px;
  font-size: 12px;
  font-family: inherit;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.38);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.insight-dl-btn:hover:not(:disabled) {
  background: rgba(107, 72, 224, 0.08);
  border-color: rgba(107, 72, 224, 0.30);
  color: rgba(200, 180, 255, 0.75);
}

.insight-dl-btn:disabled {
  opacity: 0.40;
  cursor: not-allowed;
}

.insight-dl-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ── Account actions section ── */
.account-section--last {
  border-bottom: none;
  margin-bottom: 0;
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

.support-link:hover { color: rgba(140, 110, 255, 0.70); }

/* ── Compatibility reading cards ── */
.compat-readings-list { display: flex; flex-direction: column; gap: 12px; }

.compat-reading-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
}

.crc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.crc-partner { font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.9); }
.crc-score { font-size: 18px; font-weight: 700; }

.crc-title { font-size: 12px; color: rgba(255, 255, 255, 0.5); font-style: italic; margin: 0 0 10px; line-height: 1.4; }

.crc-footer { display: flex; justify-content: space-between; align-items: center; }
.crc-date { font-size: 11px; color: rgba(255, 255, 255, 0.3); }

.crc-view-btn {
  font-size: 12px;
  color: rgba(140, 110, 255, 0.8);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.crc-view-btn:hover { color: rgba(140, 110, 255, 1); }

.section-loading { color: rgba(255, 255, 255, 0.4); font-size: 13px; padding: 12px 0; }

.section-empty { text-align: center; padding: 20px 0; }
.section-empty p { color: rgba(255, 255, 255, 0.4); font-size: 13px; margin-bottom: 12px; }

.cta-small {
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.3);
  color: rgba(140, 110, 255, 0.9);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.cta-small:hover { background: rgba(140, 110, 255, 0.25); }

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 18, 42, 0.96);
  border: 1px solid rgba(107, 72, 224, 0.28);
  color: rgba(220, 210, 255, 0.88);
  font-size: 13px;
  font-family: inherit;
  padding: 11px 22px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  letter-spacing: 0.01em;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .page-header-email { display: none; }

  .auth-card { padding: 36px 20px 32px; }

  .account-content { padding: 16px 16px 60px; }

  .reading-card { padding: 12px 14px; }

  .sub-status-card { padding: 16px; }

  .account-hero { padding: 12px 0 32px; }
}
</style>
