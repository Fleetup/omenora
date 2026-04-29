<template>
  <!-- ── STATE: Loading ── -->
  <div v-if="isLoading" class="account-state-page">
    <OrbitalMark />
    <p class="annotation" style="margin-top: 16px; color: var(--color-ink-faint);">Loading your account…</p>
  </div>

  <!-- ── STATE: Magic link pending (click-to-confirm) ── -->
  <div v-else-if="pendingTokenHash" class="account-state-page">
    <AppHeader />
    <div class="auth-card">
      <p class="label-caps auth-card__eyebrow">Sign in</p>
      <h1 class="auth-card__headline font-display-italic">Complete your sign-in.</h1>
      <div class="editorial-rule" />
      <p class="auth-card__body">Click the button below to finish signing in to your account.</p>
      <button class="auth-submit label-caps" :disabled="isConfirming" @click="handleConfirmMagicLink">
        {{ isConfirming ? 'Signing in…' : 'Sign in to Omenora' }}
      </button>
      <div v-if="confirmError === 'expired'" class="auth-error">
        <p>This link has expired or was already used.</p>
        <button class="auth-link-btn" @click="pendingTokenHash = null">Request a new link →</button>
      </div>
      <div v-else-if="confirmError === 'error'" class="auth-error">
        <p>Something went wrong. Please try again.</p>
        <button class="auth-link-btn" @click="pendingTokenHash = null">Request a new link →</button>
      </div>
    </div>
  </div>

  <!-- ── STATE: Not authenticated ── -->
  <div v-else-if="!isAuthenticated" class="account-state-page">
    <AppHeader />
    <div class="auth-card">
      <p class="label-caps auth-card__eyebrow">Account</p>
      <h1 class="auth-card__headline font-display-italic">Sign in to your account.</h1>
      <div class="editorial-rule" />
      <p class="auth-card__body">We'll send a magic link to your email. No password needed.</p>

      <template v-if="!magicLinkSent">
        <label class="field-label label-caps" for="auth-email">Email address</label>
        <input
          id="auth-email"
          v-model="emailInput"
          type="email"
          class="editorial-input"
          placeholder="your@email.com"
          autocomplete="email"
          :disabled="isSendingLink"
          @keydown.enter="sendMagicLink"
        />
        <p v-if="magicLinkError" class="auth-error-inline">{{ magicLinkError }}</p>
        <button
          class="auth-submit label-caps"
          :disabled="isSendingLink || !emailInput.trim()"
          @click="sendMagicLink"
        >
          {{ isSendingLink ? 'Sending…' : 'Send magic link' }}
        </button>
      </template>

      <div v-else class="auth-sent">
        <p class="label-caps" style="color: var(--color-gold); margin-bottom: 12px;">✦ Check your email</p>
        <p class="auth-card__body">We sent a sign-in link to <strong>{{ emailInput }}</strong>. It expires in 1 hour.</p>
      </div>
    </div>
  </div>

  <!-- ── STATE: Authenticated dashboard ── -->
  <div v-else class="account-page">
    <AppHeader />

    <div class="account-layout">

      <!-- Sidebar -->
      <aside class="account-sidebar">
        <div class="account-sidebar__user">
          <p class="account-sidebar__name font-serif">
            {{ store.firstName || 'Your Account' }}
          </p>
          <p class="annotation account-sidebar__email">{{ userEmail }}</p>
        </div>

        <div class="editorial-rule" />

        <nav class="account-nav">
          <button
            v-for="section in sections"
            :key="section.id"
            class="account-nav__item label-caps"
            :class="{ 'account-nav__item--active': activeSection === section.id }"
            @click="activeSection = section.id as 'profile' | 'plan' | 'history'"
          >
            {{ section.label }}
          </button>
        </nav>

        <div class="editorial-rule" />

        <button class="account-signout label-caps" @click="handleSignOut">Sign out</button>
      </aside>

      <!-- Main content panel -->
      <main class="account-main">

        <!-- ── PROFILE ── -->
        <section v-if="activeSection === 'profile'">
          <h2 class="account-section__headline font-display-italic">Profile</h2>
          <p class="account-section__desc">Your birth data used for natal calculations.</p>
          <div class="editorial-rule" />

          <div class="data-row">
            <span class="data-row__label">Email</span>
            <span class="data-row__value">{{ userEmail }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">Name</span>
            <span class="data-row__value">{{ store.firstName || '—' }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">Date of birth</span>
            <span class="data-row__value">{{ store.dateOfBirth || '—' }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">Time of birth</span>
            <span class="data-row__value">{{ store.timeOfBirth || 'Not provided' }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">City of birth</span>
            <span class="data-row__value">{{ store.city || '—' }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">Archetype</span>
            <span class="data-row__value font-serif">{{ store.archetype || '—' }}</span>
          </div>
          <div class="data-row">
            <span class="data-row__label">Life Path</span>
            <span class="data-row__value">{{ store.lifePathNumber || '—' }}</span>
          </div>

          <div class="account-section__actions">
            <CTAButton to="/analysis" variant="outline" :arrow="true">Recalculate chart</CTAButton>
          </div>
        </section>

        <!-- ── PLAN ── -->
        <section v-else-if="activeSection === 'plan'">
          <h2 class="account-section__headline font-display-italic">Your Plan</h2>
          <p class="account-section__desc">Manage your subscription and billing.</p>
          <div class="editorial-rule" />

          <div v-if="isLoadingSubscription" class="account-loading">
            <span class="account-loading__dot" />
            Checking subscription…
          </div>

          <template v-else-if="subscriptionActive">
            <div class="data-row">
              <span class="data-row__label">Status</span>
              <span class="status-badge status-badge--active">✦ Active</span>
            </div>
            <div class="data-row">
              <span class="data-row__label">Plan</span>
              <span class="data-row__value">{{ subscriptionPlanName || (subscriptionPlanType === 'compatibility_plus' ? 'Compatibility Plus' : 'Daily Personal Horoscope') }}</span>
            </div>
            <div class="data-row">
              <span class="data-row__label">Billing</span>
              <span class="data-row__value">{{ subscriptionPlanPrice || '$4.99' }} / month</span>
            </div>

            <div class="plan-includes-block">
              <p class="label-caps plan-includes-block__label">What's included</p>
              <ul class="plan-includes-list">
                <li v-if="subscriptionPlanType === 'compatibility_plus'">Unlimited compatibility readings</li>
                <li v-if="subscriptionPlanType === 'compatibility_plus'">Weekly relationship weather (coming soon)</li>
                <li>Daily horoscope tailored to your natal chart</li>
                <li>Love, work &amp; health insights</li>
                <li>Delivered to your inbox every morning</li>
              </ul>
            </div>

            <!-- Cancel flow -->
            <div class="cancel-flow">
              <template v-if="cancelState === 'idle'">
                <button class="cancel-trigger annotation" @click="cancelState = 'confirm'">
                  Cancel subscription
                </button>
              </template>

              <template v-else-if="cancelState === 'confirm'">
                <div class="cancel-confirm">
                  <div class="editorial-rule" />
                  <p class="label-caps cancel-confirm__eyebrow">Before you go</p>
                  <h3 class="cancel-confirm__headline font-serif">Are you sure you want to cancel?</h3>
                  <p class="cancel-confirm__body">
                    Your subscription will remain active until the end of the billing period.
                    After that, you will lose access to personalized daily readings.
                  </p>

                  <div class="cancel-reason">
                    <p class="label-caps cancel-reason__label">Reason (optional)</p>
                    <div class="cancel-reason__options">
                      <button
                        v-for="r in cancelReasons"
                        :key="r"
                        class="cancel-reason__option label-caps"
                        :class="{ 'cancel-reason__option--selected': cancelReason === r }"
                        @click="cancelReason = r"
                      >
                        {{ r }}
                      </button>
                    </div>
                  </div>

                  <div class="cancel-confirm__actions">
                    <CTAButton variant="outline" @click="cancelState = 'idle'">Keep my plan</CTAButton>
                    <button
                      class="cancel-confirm__confirm-btn label-caps"
                      :disabled="isCancelling"
                      @click="handleCancelSubscription"
                    >
                      {{ isCancelling ? 'Opening portal…' : 'Yes, cancel subscription' }}
                    </button>
                  </div>
                  <p v-if="portalError" class="cancel-error">{{ portalError }}</p>
                </div>
              </template>

              <template v-else-if="cancelState === 'cancelled'">
                <div class="cancel-done">
                  <div class="editorial-rule" />
                  <p class="label-caps" style="color: var(--color-ink-faint)">Cancellation initiated</p>
                  <p class="cancel-done__body font-serif">
                    Your access continues until the end of the billing period. We hope to see you again.
                  </p>
                </div>
              </template>
            </div>
          </template>

          <template v-else>
            <div class="data-row">
              <span class="data-row__label">Status</span>
              <span class="status-badge status-badge--inactive">No active plan</span>
            </div>
            <div class="account-section__actions">
              <p class="account-section__desc">Get personalized daily readings tailored to your natal chart and archetype.</p>
              <CTAButton to="/subscribe" :arrow="true">View plans</CTAButton>
            </div>
          </template>
        </section>

        <!-- ── HISTORY ── -->
        <section v-else-if="activeSection === 'history'">
          <h2 class="account-section__headline font-display-italic">History</h2>
          <p class="account-section__desc">Your natal readings and compatibility reports.</p>
          <div class="editorial-rule" />

          <!-- Natal / Archetype readings -->
          <template v-if="reports.length > 0">
            <p class="label-caps" style="color: var(--color-ink-faint); margin-bottom: 16px;">Natal Readings</p>
            <div
              v-for="report in reports.filter((r: any) => r.type !== 'compatibility')"
              :key="report.id"
              class="data-row"
            >
              <div>
                <span class="data-row__value font-serif">{{ report.archetype || report.first_name || 'Reading' }}</span>
                <span class="data-row__label" style="display: block; margin-top: 2px;">{{ formatDate(report.created_at) }}</span>
              </div>
              <button class="reading-card__view label-caps" @click="viewReport(report)">View</button>
            </div>
          </template>

          <!-- Daily insights (subscribers only) -->
          <template v-if="subscriptionActive && dailyInsights.length > 0">
            <p class="label-caps" style="color: var(--color-ink-faint); margin-top: 32px; margin-bottom: 16px;">Recent Daily Readings</p>
            <div
              v-for="insight in dailyInsights"
              :key="insight.sent_date"
              class="insight-row"
              :class="{ 'insight-row--open': expandedInsight === insight.sent_date }"
            >
              <!-- Header row — always visible, clickable -->
              <button
                class="insight-row__header data-row"
                @click="toggleInsight(insight.sent_date)"
              >
                <div class="insight-row__left">
                  <span class="data-row__value font-serif">
                    {{ insight.theme_used || 'Daily Reading' }}
                  </span>
                  <span class="data-row__label" style="display: block; margin-top: 2px;">
                    {{ formatDate(insight.sent_date) }}
                  </span>
                </div>
                <span class="insight-row__toggle label-caps">
                  {{ expandedInsight === insight.sent_date ? '−' : '+' }}
                </span>
              </button>

              <!-- Expanded content -->
              <Transition name="insight-expand">
                <div
                  v-if="expandedInsight === insight.sent_date"
                  class="insight-row__body"
                >
                  <!-- Structured insight (JSON format from generate-daily-insight) -->
                  <template v-if="insight.structured">
                    <div class="insight-sign-sections">
                      <div class="insight-sign-section-row">
                        <HoroscopeSymbol type="love" :size="16" />
                        <span class="label-caps insight-section-label">Love</span>
                        <span class="insight-section-text">{{ insight.structured.love }}</span>
                      </div>
                      <div class="insight-sign-section-row">
                        <HoroscopeSymbol type="work" :size="16" />
                        <span class="label-caps insight-section-label">Work</span>
                        <span class="insight-section-text">{{ insight.structured.work }}</span>
                      </div>
                      <div class="insight-sign-section-row">
                        <HoroscopeSymbol type="health" :size="16" />
                        <span class="label-caps insight-section-label">Health</span>
                        <span class="insight-section-text">{{ insight.structured.health }}</span>
                      </div>
                    </div>
                    <div v-if="insight.structured.reflection_question" class="insight-row__reflection">
                      <span class="label-caps insight-row__reflection-label">Today's reflection</span>
                      <p class="insight-row__reflection-text font-serif">{{ insight.structured.reflection_question }}</p>
                    </div>
                  </template>

                  <!-- Plain text fallback (new cache-based format or missing parse) -->
                  <template v-else>
                    <p class="insight-row__text">{{ insight.insight_preview }}</p>
                    <div v-if="insight.reflection_question" class="insight-row__reflection">
                      <span class="label-caps insight-row__reflection-label">Today's reflection</span>
                      <p class="insight-row__reflection-text font-serif">{{ insight.reflection_question }}</p>
                    </div>
                  </template>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Compatibility readings -->
          <template v-if="compatibilityReadings.length > 0">
            <p class="label-caps" style="color: var(--color-ink-faint); margin-top: 32px; margin-bottom: 16px;">Compatibility Readings</p>
            <div
              v-for="reading in compatibilityReadings"
              :key="reading.id"
              class="data-row"
            >
              <div>
                <span class="data-row__value font-serif">{{ reading.partnerName ? `With ${reading.partnerName}` : 'Compatibility Reading' }}</span>
                <span class="data-row__label" style="display: block; margin-top: 2px;">{{ formatDate(reading.createdAt) }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span v-if="reading.score" class="data-row__value font-serif">{{ reading.score }}/100</span>
                <button class="reading-card__view label-caps" @click="navigateTo('/compatibility?session_id=' + reading.sessionId)">View</button>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <div v-if="reports.length === 0 && compatibilityReadings.length === 0 && dailyInsights.length === 0">
            <p class="account-section__empty annotation">No readings yet.</p>
            <CTAButton to="/analysis" :arrow="true">Begin your reading</CTAButton>
          </div>

        </section>

      </main>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="account-toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAnalysisStore } from '~/stores/analysisStore'

useSeoMeta({ title: 'My Account — OMENORA', robots: 'noindex, nofollow' })

const store = useAnalysisStore()
const { isAuthenticated, userEmail, session, restoreSession, confirmMagicLink, getMyReports, signOut } = useAuth()

// ── Page state ─────────────────────────────────────────────────────────────────
const isLoading = ref(true)

// ── Sidebar navigation ─────────────────────────────────────────────────────────
const activeSection = ref<'profile' | 'plan' | 'history'>('profile')

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'plan',    label: 'Plan'    },
  { id: 'history', label: 'History' },
]

// ── Cancel flow ────────────────────────────────────────────────────────────────
const cancelState = ref<'idle' | 'confirm' | 'cancelled'>('idle')
const cancelReason = ref('')
const isCancelling = ref(false)

const cancelReasons = [
  'Too expensive',
  'Not using it enough',
  'Missing features',
  'Found an alternative',
  'Other',
]

// ── Auth form ──────────────────────────────────────────────────────────────────
const emailInput     = ref('')
const isSendingLink  = ref(false)
const magicLinkSent  = ref(false)
const magicLinkError = ref('')

const pendingTokenHash = ref<string | null>(null)
const isConfirming     = ref(false)
const confirmError     = ref<'expired' | 'error' | null>(null)

// ── Subscription state ─────────────────────────────────────────────────────────
const isLoadingSubscription = ref(false)
const subscriptionActive    = ref(false)
const subscriptionPlanName  = ref<string | null>(null)
const subscriptionPlanPrice = ref<string | null>(null)
const subscriptionPlanType  = ref<string | null>(null)
const isOpeningPortal       = ref(false)
const portalError           = ref('')

// ── Reports & insights ─────────────────────────────────────────────────────────
const isLoadingReports         = ref(false)
const reports                  = ref<any[]>([])
const isLoadingInsights        = ref(false)
const dailyInsights            = ref<any[]>([])
const expandedInsight          = ref<string | null>(null)
const compatibilityReadings    = ref<any[]>([])
const isLoadingCompatReadings  = ref(false)

// ── Download state ─────────────────────────────────────────────────────────────
const downloadingInsight = ref<string | null>(null)

// ── Toast ──────────────────────────────────────────────────────────────────────
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}

// ── Computed ───────────────────────────────────────────────────────────────────
function viewReport(report: any) {
  const sessionId = report.session_id || report.sessionId
  if (!sessionId) return
  if (report.type === 'compatibility') {
    navigateTo(`/compatibility?session_id=${sessionId}&from=history`)
  } else {
    navigateTo(`/report?session_id=${sessionId}`)
  }
}

// ── onMounted ──────────────────────────────────────────────────────────────────
onMounted(async () => {
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

// ── Confirm magic link ─────────────────────────────────────────────────────────
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

// ── Send magic link ────────────────────────────────────────────────────────────
async function sendMagicLink() {
  const email = emailInput.value.trim()
  if (!email || isSendingLink.value) return
  isSendingLink.value = true
  magicLinkError.value = ''
  try {
    await $fetch('/api/auth/request-magic-link', { method: 'POST', body: { email } })
    magicLinkSent.value = true
  } catch {
    magicLinkError.value = 'Something went wrong. Please try again.'
  } finally {
    isSendingLink.value = false
  }
}

// ── Load subscription ──────────────────────────────────────────────────────────
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
    }>('/api/me/subscription', { headers: { Authorization: `Bearer ${token}` } })
    subscriptionActive.value    = data.active
    subscriptionPlanName.value  = data.planName
    subscriptionPlanPrice.value = data.planPrice
    subscriptionPlanType.value  = data.planType
  } catch {
    // Non-critical
  } finally {
    isLoadingSubscription.value = false
  }
}

// ── Load daily insights ────────────────────────────────────────────────────────
async function loadDailyInsights() {
  isLoadingInsights.value = true
  try {
    const token = session.value?.access_token
    if (!token) return
    const data = await $fetch<{ insights: any[] }>('/api/me/daily-insights', {
      headers: { Authorization: `Bearer ${token}` },
    })
    dailyInsights.value = data.insights.map((item: any) => {
      let structured = null
      try { structured = item.insight_full ? JSON.parse(item.insight_full) : null } catch { structured = null }
      return { ...item, structured }
    })
  } catch {
    dailyInsights.value = []
  } finally {
    isLoadingInsights.value = false
  }
}

// ── Load reports ───────────────────────────────────────────────────────────────
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

// ── Load compatibility readings ────────────────────────────────────────────────
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

// ── Open Stripe portal (manage/cancel) ────────────────────────────────────────
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
    portalError.value = msg.includes('No active subscription')
      ? 'No active subscription found. Contact support@omenora.com'
      : 'Unable to open subscription portal. Please try again or contact support.'
    isOpeningPortal.value = false
  }
}

// ── Cancel subscription (via Stripe portal) ────────────────────────────────────
async function handleCancelSubscription() {
  isCancelling.value = true
  try {
    await openPortal()
    cancelState.value = 'cancelled'
  } catch {
    // portalError already set inside openPortal
  } finally {
    isCancelling.value = false
  }
}

// ── Sign out ───────────────────────────────────────────────────────────────────
async function handleSignOut() {
  await signOut()
  navigateTo('/')
}

// ── Insight helpers ────────────────────────────────────────────────────────────
function toggleInsight(date: string) {
  expandedInsight.value = expandedInsight.value === date ? null : date
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-gold)'
  if (score >= 60) return 'rgba(200, 150, 50, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '' }
}

// ── Canvas insight download (preserved) ───────────────────────────────────────
async function downloadInsightCard(entry: { sent_date: string; theme_used: string; insight_full?: string; insight_preview?: string; reflection_question?: string }) {
  if (downloadingInsight.value) return
  downloadingInsight.value = entry.sent_date
  try {
    const W = 1080, H = 1350
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#07070D'; ctx.fillRect(0, 0, W, H)
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.65)
    glow.addColorStop(0, 'rgba(75,45,155,0.30)'); glow.addColorStop(0.5, 'rgba(50,25,110,0.12)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(72, 120); ctx.lineTo(W - 72, 120); ctx.stroke()
    ctx.font = '500 28px -apple-system,BlinkMacSystemFont,sans-serif'; ctx.letterSpacing = '0.22em'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.textAlign = 'left'; ctx.fillText('OMENORA', 72, 92)
    ctx.font = '400 26px -apple-system,BlinkMacSystemFont,sans-serif'; ctx.letterSpacing = '0.04em'
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.textAlign = 'right'; ctx.fillText(formatDate(entry.sent_date), W - 72, 92)
    ctx.font = '400 48px serif'; ctx.fillStyle = 'rgba(107,72,224,0.60)'; ctx.textAlign = 'center'; ctx.fillText('✦', W / 2, 200)
    ctx.font = '300 52px Georgia,serif'; ctx.fillStyle = 'rgba(220,210,255,0.88)'; ctx.textAlign = 'center'; ctx.letterSpacing = '0.02em'
    wrapText(ctx, entry.theme_used, W / 2, 280, W - 144, 68)
    const divY = 380
    ctx.strokeStyle = 'rgba(107,72,224,0.20)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(144, divY); ctx.lineTo(W - 144, divY); ctx.stroke()
    const bodyText = entry.insight_full || entry.insight_preview || ''
    ctx.font = '300 34px -apple-system,BlinkMacSystemFont,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.textAlign = 'left'; ctx.letterSpacing = '0.01em'
    const bodyEndY = wrapText(ctx, bodyText, 72, 440, W - 144, 50)
    if (entry.reflection_question) {
      const rfY = Math.max(bodyEndY + 60, 900)
      ctx.font = 'italic 400 30px Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.textAlign = 'left'; ctx.letterSpacing = '0.01em'
      ctx.fillText('Reflection', 72, rfY)
      ctx.font = 'italic 300 30px Georgia,serif'; ctx.fillStyle = 'rgba(200,180,255,0.60)'
      wrapText(ctx, entry.reflection_question, 72, rfY + 48, W - 144, 44)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(72, H - 100); ctx.lineTo(W - 72, H - 100); ctx.stroke()
    ctx.font = '400 24px -apple-system,BlinkMacSystemFont,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.textAlign = 'center'; ctx.letterSpacing = '0.10em'
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
  let line = '', cy = y
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cy); line = words[n] + ' '; cy += lineHeight
    } else { line = testLine }
  }
  if (line.trim()) { ctx.fillText(line.trim(), x, cy); cy += lineHeight }
  return cy
}
</script>

<style scoped>
/* ── Loading / auth states ── */
.account-state-page {
  min-height: 100vh;
  background: var(--color-bone);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 0;
}

/* ── Auth card ── */
.auth-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: clamp(32px, 5vw, 56px) clamp(24px, 4vw, 40px);
  background: var(--color-bone);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-card__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.auth-card__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(36px, 7vw, 56px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  margin: 0 0 20px;
}

.auth-card__body {
  font-size: 15px;
  color: var(--color-ink-mid);
  line-height: 1.65;
  margin: 0 0 24px;
}

.field-label {
  display: block;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-bottom: 8px;
}

.editorial-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-ink-ghost);
  padding: 8px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  color: var(--color-ink);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  margin-bottom: 24px;
}

.editorial-input:focus {
  border-bottom-color: var(--color-ink-mid);
}

.editorial-input::placeholder {
  color: var(--color-ink-ghost);
}

.auth-submit {
  background: var(--color-ink);
  color: var(--color-bone);
  border: none;
  padding: 14px 28px;
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.auth-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.auth-submit:hover:not(:disabled) {
  opacity: 0.85;
}

.auth-error {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid rgba(139, 37, 0, 0.2);
  background: rgba(139, 37, 0, 0.04);
  font-size: 13px;
  color: #8B2500;
  line-height: 1.5;
}

.auth-error-inline {
  font-size: 12px;
  color: #8B2500;
  margin: -16px 0 16px;
}

.auth-link-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-mid);
  font-size: 13px;
  font-family: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  display: block;
  margin-top: 8px;
}

.auth-sent {
  padding: 8px 0;
}

/* ── Authenticated page shell ── */
.account-page {
  min-height: 100vh;
  background: var(--color-bone);
}

.account-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: calc(100vh - 57px);
  border-top: 1px solid var(--color-ink-ghost);
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}

/* ── Sidebar ── */
.account-sidebar {
  padding: 40px 32px;
  border-right: 1px solid var(--color-ink-ghost);
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media (max-width: 768px) {
  .account-sidebar {
    padding: 24px 20px;
    border-right: none;
    border-bottom: 1px solid var(--color-ink-ghost);
  }
}

.account-sidebar__user {
  padding-bottom: 24px;
}

.account-sidebar__name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--color-ink);
  margin: 0 0 4px;
}

.account-sidebar__email {
  color: var(--color-ink-faint);
  word-break: break-all;
}

.account-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .account-nav {
    flex-direction: row;
    gap: 4px;
  }

  .account-main {
    padding: 28px 20px 48px;
  }

  .account-nav__item {
    min-height: 44px;
    padding: 10px 16px;
  }

  .auth-submit {
    min-height: 48px;
  }

  .account-state-page {
    justify-content: flex-start;
  }
}

.account-nav__item {
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 10px 12px;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  color: var(--color-ink-faint);
  transition: color 0.15s, background 0.15s;
  border-radius: 2px;
}

.account-nav__item:hover {
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.account-nav__item--active {
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.06);
}

.account-signout {
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 10px 12px;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  color: var(--color-ink-faint);
  transition: color 0.15s;
  margin-top: 8px;
}

.account-signout:hover {
  color: #8B2500;
}

/* ── Main panel ── */
.account-main {
  padding: clamp(32px, 5vw, 56px) clamp(28px, 5vw, 56px);
  max-width: 680px;
}

.account-section__headline {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(32px, 6vw, 52px);
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
  color: var(--color-ink);
}

.account-section__desc {
  font-size: 15px;
  color: var(--color-ink-mid);
  line-height: 1.6;
  margin: 0 0 8px;
}

.account-section__actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.account-section__empty {
  color: var(--color-ink-faint);
  margin-bottom: 24px;
  display: block;
}

/* ── Loading inline ── */
.account-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-ink-faint);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  padding: 16px 0;
}

@keyframes account-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.account-loading__dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-ink-mid);
  animation: account-pulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

/* ── Data rows ── */
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
  gap: 16px;
  flex-wrap: wrap;
}

.data-row:first-of-type {
  border-top: 1px solid var(--color-ink-ghost);
}

.data-row__label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  flex-shrink: 0;
}

.data-row__value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 400;
  color: var(--color-ink);
  text-align: right;
}

.data-row__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── Status badges ── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--color-ink-ghost);
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.status-badge--active {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.status-badge--inactive {
  color: var(--color-ink-faint);
}

/* ── Plan includes ── */
.plan-includes-block {
  margin: 28px 0;
  padding: 24px;
  border: 1px solid var(--color-ink-ghost);
}

.plan-includes-block__label {
  color: var(--color-ink-faint);
  margin-bottom: 16px;
  display: block;
}

.plan-includes-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-includes-list li {
  font-size: 14px;
  color: var(--color-ink-mid);
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan-includes-list li::before {
  content: '✦';
  color: var(--color-gold);
  font-size: 10px;
  flex-shrink: 0;
}

/* ── Cancel flow ── */
.cancel-flow {
  margin-top: 28px;
}

.cancel-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-faint);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.cancel-trigger:hover {
  color: #8B2500;
}

.cancel-confirm {
  margin-top: 8px;
}

.cancel-confirm__eyebrow {
  color: var(--color-ink-faint);
  margin-bottom: 12px;
}

.cancel-confirm__headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 400;
  color: var(--color-ink);
  margin: 0 0 16px;
}

.cancel-confirm__body {
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-ink-mid);
  margin-bottom: 24px;
}

.cancel-reason {
  margin-bottom: 28px;
}

.cancel-reason__label {
  color: var(--color-ink-faint);
  display: block;
  margin-bottom: 12px;
}

.cancel-reason__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cancel-reason__option {
  background: none;
  border: 1px solid var(--color-ink-ghost);
  cursor: pointer;
  padding: 8px 14px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  color: var(--color-ink-faint);
  transition: all 0.15s;
}

.cancel-reason__option:hover {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

.cancel-reason__option--selected {
  border-color: var(--color-ink);
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.05);
}

.cancel-confirm__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cancel-confirm__confirm-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8B2500;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;
}

.cancel-confirm__confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-error {
  font-size: 12px;
  color: #8B2500;
  margin-top: 12px;
}

.cancel-done__body {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 400;
  color: var(--color-ink-mid);
  margin: 12px 0 0;
}

/* ── Reading cards (history / compat) ── */
.reading-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.reading-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
  gap: 16px;
}

.reading-card:first-child {
  border-top: 1px solid var(--color-ink-ghost);
}

.reading-card__info {
  min-width: 0;
  flex: 1;
}

.reading-card__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  color: var(--color-ink);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reading-card__date {
  color: var(--color-ink-faint);
  margin: 0;
}

.reading-card__view {
  background: none;
  border: 1px solid var(--color-ink-ghost);
  cursor: pointer;
  padding: 6px 14px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  color: var(--color-ink-faint);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}

.reading-card__view:hover {
  color: var(--color-ink);
  border-color: var(--color-ink-mid);
}

/* ── Insight expandable rows ── */
.insight-row {
  border-bottom: 1px solid var(--color-ink-ghost);
}

.insight-row:first-of-type {
  border-top: 1px solid var(--color-ink-ghost);
}

.insight-row__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 16px;
  transition: opacity 0.15s;
}

.insight-row__header:hover {
  opacity: 0.75;
}

.insight-row__left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.insight-row__toggle {
  color: var(--color-gold);
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.insight-row__body {
  padding: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 60ch;
}

.insight-sign-sections {
  display: flex;
  flex-direction: column;
  margin: 4px 0;
}

.insight-sign-section-row {
  display: grid;
  grid-template-columns: 16px 52px 1fr;
  align-items: baseline;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--color-ink-ghost);
}

.insight-sign-section-row:first-child {
  border-top: none;
  padding-top: 0;
}

.insight-section-label {
  color: var(--color-ink-faint);
}

.insight-section-text {
  font-size: 13px;
  line-height: 1.65;
  color: var(--color-ink-mid);
}

.insight-row__text {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-ink-mid);
  margin: 0;
}

.insight-row__reflection {
  padding: 16px 20px;
  border-left: 2px solid var(--color-gold);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-row__reflection-label {
  color: var(--color-gold);
  font-size: 10px;
}

.insight-row__reflection-text {
  font-size: 15px;
  font-style: italic;
  line-height: 1.65;
  color: var(--color-ink-mid);
  margin: 0;
}

/* Transition */
.insight-expand-enter-active,
.insight-expand-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.insight-expand-enter-from,
.insight-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Toast ── */
.account-toast {
  position: fixed;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-ink);
  color: var(--color-bone);
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 10px 20px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}
</style>
