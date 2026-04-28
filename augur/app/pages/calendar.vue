<template>
  <!-- Loading -->
  <div v-if="isLoading" class="center-page">
    <div class="center-content">
      <PhoenixLoader :size="72" />
      <p :key="currentMessageIndex" class="loading-msg">
        {{ loadingMessages[currentMessageIndex] }}
      </p>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="hasError" class="center-page">
    <div class="center-content">
      <PhoenixLoader :size="72" />
      <p class="loading-msg">{{ t('somethingWrong') }}</p>
    </div>
  </div>

  <!-- Calendar -->
  <div v-else-if="calendarData" class="cal-page">

    <!-- Header -->
    <AppHeader>
      <template #action>
        <span class="cal-page-label label-caps">{{ t('luckyTimingCalendar') }}</span>
      </template>
    </AppHeader>

    <!-- Hero / Masthead -->
    <div class="cal-hero">
      <p class="label-caps cal-hero__eyebrow">{{ t('calDestinyCalendar') }}</p>
      <h1 class="cal-hero__title font-display-italic">{{ store.firstName }}'s<br>{{ t('yearOfBecoming') }}</h1>
      <div class="editorial-rule" />
      <p class="cal-hero__theme">{{ calendarData.overallTheme }}</p>
    </div>

    <!-- Peak / Caution summary -->
    <div class="cal-summary">
      <div class="cal-summary-row">
        <span class="summary-label">{{ t('peakMonths') }}</span>
        <span class="peak-months">{{ calendarData.peakMonths.join(' · ') }}</span>
      </div>
      <div class="cal-summary-divider" />
      <div class="cal-summary-row">
        <span class="summary-label">{{ t('cautionMonths') }}</span>
        <span class="caution-months">{{ calendarData.cautionMonths.join(' · ') }}</span>
      </div>
    </div>

    <!-- Month cards -->
    <div
      v-for="month in visibleMonths"
      :key="month.month"
      class="month-card"
    >
      <!-- Left accent bar -->
      <div class="month-accent" :style="{ background: month.color }" />

      <!-- Header row -->
      <div class="month-header">
        <div class="month-header-left">
          <p class="month-name"><span class="month-name-display">{{ month.month }}</span></p>
          <p class="month-theme-text">{{ month.theme }}</p>
        </div>
        <div class="month-header-right">
          <p class="month-energy" :style="{ color: energyColor(month.energyLevel) }">
            {{ month.energyLevel }}
          </p>
          <p class="energy-label">{{ t('energyLabel') }}</p>
        </div>
      </div>

      <!-- Energy bar -->
      <div class="energy-track">
        <div
          class="energy-fill"
          :style="{ width: month.energyLevel + '%', background: energyColor(month.energyLevel) }"
        />
      </div>

      <!-- Insights -->
      <div class="month-insights">
        <div class="insight-row">
          <span class="insight-icon">🤍</span>
          <span class="insight-text">{{ month.love }}</span>
        </div>
        <div class="insight-row">
          <span class="insight-icon insight-sym" style="color: rgba(200,180,255,0.5);">✦</span>
          <span class="insight-text">{{ month.money }}</span>
        </div>
        <div class="insight-row">
          <span class="insight-icon insight-sym" style="color: rgba(140,110,255,0.5);">◆</span>
          <span class="insight-text">{{ month.career }}</span>
        </div>
      </div>

      <!-- Warning -->
      <div v-if="month.warning" class="month-warning">
        ⚠ {{ month.warning }}
      </div>

      <!-- Lucky days -->
      <div class="lucky-days">
        <span class="lucky-label">{{ t('luckyDays') }}</span>
        <span
          v-for="day in month.luckyDays"
          :key="day"
          class="lucky-chip"
        >{{ day }}</span>
      </div>
    </div>

    <!-- Save section -->
    <div class="save-section">
      <div class="save-divider" />
      <p class="save-label">{{ t('savingCalendar') }}</p>
      <h3 class="save-title">{{ t('downloadShareReading') }}</h3>
      <p class="save-subtitle">{{ t('pdfInstantPng') }}</p>
      <div class="download-row">
        <button class="download-btn" :disabled="isDownloadingCalendar" @click="downloadCalendar">
          {{ isDownloadingCalendar ? t('downloading') : t('downloadCalendar') }}
        </button>
        <button class="download-btn download-btn--primary" :disabled="isDownloadingCalPDF" @click="downloadCalendarPDF">
          {{ isDownloadingCalPDF ? t('generating') : t('fullCalendarPdf') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'

useSeoMeta({ title: 'Your Cosmic Calendar', robots: 'noindex, nofollow' })


const store = useAnalysisStore()
const route = useRoute()
const { t } = useLanguage()

const isLoading = ref(true)
const hasError = ref(false)
const calendarData = ref<any>(null)

const loadingMessages = computed(() => [
  t('calLoading1'),
  t('calLoading2'),
  t('calLoading3'),
  t('calLoading4'),
])
const currentMessageIndex = ref(0)
let messageInterval: ReturnType<typeof setInterval> | null = null

function energyColor(level: number): string {
  if (level >= 75) return 'rgba(140, 110, 255, 0.9)'
  if (level >= 55) return 'rgba(200, 180, 100, 0.8)'
  return 'rgba(180, 100, 100, 0.7)'
}

const currentMonthNumber = new Date().getMonth() + 1

const visibleMonths = computed(() => {
  const months: any[] = calendarData.value?.months ?? []
  const future = months.filter((m: any) => typeof m.number === 'number' ? m.number >= currentMonthNumber : true)
  return future.length > 0 ? future : months
})

onMounted(async () => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % loadingMessages.value.length
  }, 2000)

  const sessionId = route.query.session_id as string

  if (!sessionId) {
    navigateTo('/report')
    return
  }

  try {
    const paymentData = await $fetch<{
      paid: boolean
      customerEmail: string | null
      metadata: Record<string, string> | null
    }>('/api/verify-payment', {
      method: 'POST',
      body: { sessionId },
    })

    if (!paymentData.paid) {
      navigateTo('/report')
      return
    }

    const meta = paymentData.metadata || {}
    if (!store.firstName) store.firstName = meta.firstName || ''
    if (!store.email) store.setEmail(meta.email || paymentData.customerEmail || '')
    if (!store.tempId) store.setTempId(meta.tempId || '')
    if (!store.languageManualOverride && meta.language) store.setLanguage(meta.language)

    if (store.calendarData) {
      calendarData.value = store.calendarData
    } else {
      let resolved = false

      if (store.tempId) {
        try {
          const { calendar: dbCal } = await $fetch<{ calendar: { first_name: string; calendar_data: any } }>(
            '/api/get-calendar',
            { method: 'POST', body: { sessionId: store.tempId } }
          )
          if (dbCal?.calendar_data) {
            calendarData.value = dbCal.calendar_data
            store.setCalendarData(dbCal.calendar_data)
            if (!store.firstName && dbCal.first_name) store.firstName = dbCal.first_name
            resolved = true
          }
        } catch {
          // not in DB yet — will generate below
        }
      }

      if (!resolved) {
        const { calendar } = await $fetch<{ success: boolean; calendar: any }>('/api/generate-calendar', {
          method: 'POST',
          body: {
            firstName: store.firstName,
            archetype: store.archetype,
            element: store.report?.element,
            lifePathNumber: store.lifePathNumber,
            answers: store.answers,
            dateOfBirth: store.dateOfBirth,
            city: store.city,
            language: store.language,
          },
        })
        calendarData.value = calendar
        store.setCalendarData(calendar)
        if (store.tempId) {
          $fetch('/api/save-calendar', {
            method: 'POST',
            body: { sessionId: store.tempId, calendarData: calendar, firstName: store.firstName },
          }).catch(() => {})
        }
      }
    }

    store.setCalendarPurchased(true)

    if (!store.email && store.tempId) {
      try {
        const reportData = await $fetch<{ report: { email: string } }>(
          '/api/get-report',
          { method: 'POST', body: { sessionId: store.tempId } }
        )
        if (reportData?.report?.email) {
          store.setEmail(reportData.report.email)
        }
      } catch {
        // Silently ignore - report may not exist yet
      }
    }

    if (store.email) {
      try {
        await $fetch('/api/send-calendar-email', {
          method: 'POST',
          body: {
            email: store.email,
            firstName: store.firstName,
            calendar: store.calendarData,
            language: store.language,
          },
        })
        // Email sent successfully
      } catch {
        console.error('Calendar email failed')
      }
    }

    isLoading.value = false
  } catch {
    console.error('Calendar page load failed')
    hasError.value = true
    isLoading.value = false
  } finally {
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }
})

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
})

const isDownloadingCalendar = ref(false)

async function downloadCalendar() {
  if (isDownloadingCalendar.value) return
  isDownloadingCalendar.value = true
  try {
    const response = await fetch('/api/generate-calendar-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: store.firstName,
        calendar: store.calendarData,
      }),
    })
    if (!response.ok) throw new Error('Failed to generate calendar card')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omenora-calendar-${store.firstName || 'report'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    console.error('Calendar download failed')
  } finally {
    isDownloadingCalendar.value = false
  }
}

const isDownloadingCalPDF = ref(false)

async function downloadCalendarPDF() {
  if (isDownloadingCalPDF.value) return
  isDownloadingCalPDF.value = true
  try {
    const response = await fetch('/api/generate-calendar-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: store.firstName,
        calendar: store.calendarData,
        language: store.language,
      }),
    })
    if (!response.ok) throw new Error('Failed to generate calendar PDF')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omenora-calendar-${store.firstName || 'report'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    console.error('Calendar PDF download failed')
  } finally {
    isDownloadingCalPDF.value = false
  }
}
</script>

<style scoped>
/* ── Centered states (loading / error) ── */
.center-page {
  background: var(--color-bone);
  min-height: 100vh;
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

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-msg {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: var(--color-ink-mid);
  margin: 0;
  animation: fadeInMsg 0.45s ease;
  max-width: 260px;
  line-height: 1.5;
}

/* ── Calendar page ── */
.cal-page {
  background: var(--color-bone);
  min-height: 100vh;
  color: var(--color-ink);
  max-width: 100%;
  box-sizing: border-box;
}

/* ── Page label in header slot ── */
.cal-page-label {
  font-size: 9px;
  color: var(--color-gold);
  letter-spacing: 0.2em;
}

/* ── Hero / Masthead ── */
.cal-hero {
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 72px) clamp(20px, 5vw, 56px) 0;
  padding-bottom: 0;
  margin-bottom: 32px;
}

.cal-hero__eyebrow {
  color: var(--color-ink-faint);
  margin: 0 0 20px;
}

.cal-hero__title {
  font-family: 'Fraunces', serif;
  font-size: clamp(44px, 12vw, 96px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-ink);
  margin: 0 0 24px;
  line-height: 1.0;
  letter-spacing: -0.03em;
}

.cal-hero__theme {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-style: italic;
  color: var(--color-ink-mid);
  line-height: 1.65;
  margin: 16px 0 0;
  max-width: 520px;
}

/* inner content wrapper */
.cal-page > *:not(.cal-page) {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: clamp(20px, 5vw, 80px);
  padding-right: clamp(20px, 5vw, 80px);
}

/* header spans full width */
.cal-page > header {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

/* ── Peak / Caution summary ── */
.cal-summary {
  border: 1px solid var(--color-ink-ghost);
  padding: 16px 20px;
  margin-bottom: 32px;
}

.cal-summary-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
}

.cal-summary-divider {
  height: 1px;
  background: var(--color-ink-ghost);
  margin: 4px 0;
}

.summary-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
  flex-shrink: 0;
  width: 110px;
}

.peak-months {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  color: var(--color-gold);
  letter-spacing: 0.04em;
}

.caution-months {
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  color: #8B2500;
  letter-spacing: 0.04em;
}

/* ── Month card ── */
.month-card {
  position: relative;
  margin-bottom: 8px;
  border: 1px solid var(--color-ink-ghost);
  padding: 18px 20px 16px 24px;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.month-card:hover {
  border-color: var(--color-ink-mid);
}

.month-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
}

.month-header-left {
  flex: 1;
}

.month-name {
  margin: 0;
  line-height: 1;
}

.month-name-display {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 300;
  color: var(--color-ink);
  letter-spacing: 0.01em;
}

.month-theme-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin: 4px 0 0;
}

.month-header-right {
  text-align: right;
  flex-shrink: 0;
}

.month-energy {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  line-height: 1;
}

.energy-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 8px;
  color: var(--color-ink-faint);
  margin: 3px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Energy bar ── */
.energy-track {
  height: 1px;
  background: var(--color-ink-ghost);
  margin: 12px 0;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  transition: width 0.6s ease;
}

/* ── Insights ── */
.month-insights {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 12px;
}

.insight-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.insight-icon {
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 2px;
  line-height: 1.4;
}

.insight-sym {
  font-size: 10px;
  line-height: 1.6;
}

.insight-text {
  font-size: 13px;
  color: var(--color-ink-mid);
  line-height: 1.5;
  font-weight: 300;
}

/* ── Warning ── */
.month-warning {
  border: 1px solid rgba(139, 37, 0, 0.15);
  background: rgba(139, 37, 0, 0.03);
  padding: 8px 12px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 11px;
  color: #8B2500;
  margin-bottom: 12px;
}

/* ── Lucky days ── */
.lucky-days {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  padding-top: 10px;
  border-top: 1px solid var(--color-ink-ghost);
}

.lucky-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-right: 4px;
}

.lucky-chip {
  border: 1px solid var(--color-gold-dim);
  padding: 2px 8px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  color: var(--color-gold);
  letter-spacing: 0.02em;
}

/* ── Save section ── */
.save-section {
  margin-top: 52px;
  text-align: center;
  padding-bottom: 80px;
}

.save-divider {
  height: 1px;
  background: var(--color-ink-ghost);
  margin-bottom: 32px;
}

.save-label {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--color-gold);
  margin: 0 0 10px;
  text-transform: uppercase;
}

.save-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-ink);
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.save-subtitle {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 12px;
  color: var(--color-ink-faint);
  margin: 0 0 24px;
  letter-spacing: 0.05em;
}

/* ── Download buttons ── */
.download-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.download-row .download-btn {
  flex: 1;
}

.download-btn {
  background: transparent;
  border: 1px solid var(--color-ink-ghost);
  color: var(--color-ink-faint);
  padding: 13px 20px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.22s;
}

.download-btn:hover:not(:disabled) {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

.download-btn--primary {
  background: var(--color-ink);
  border-color: var(--color-ink);
  color: var(--color-bone);
}

.download-btn--primary:not(:disabled):hover {
  opacity: 0.85;
}

.download-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* ── Mobile responsive fixes ── */
@media (max-width: 640px) {
  .cal-hero__title {
    font-size: clamp(36px, 12vw, 56px);
  }

  .cal-summary-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .summary-label {
    width: auto;
  }

  .month-card {
    padding: 16px 16px 14px 20px;
  }

  .download-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .download-row .download-btn {
    flex: unset;
    width: 100%;
  }
}
</style>
