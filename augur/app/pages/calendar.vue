<template>
  <!-- Loading -->
  <div v-if="isLoading" class="center-page">
    <div class="center-content">
      <div class="orbital-mark">
        <div class="orbit-outer"><div class="orbit-planet" /></div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="brand-text">OMENORA</p>
      <p :key="currentMessageIndex" class="loading-msg">
        {{ loadingMessages[currentMessageIndex] }}
      </p>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="hasError" class="center-page">
    <div class="center-content">
      <div class="orbital-mark">
        <div class="orbit-outer"><div class="orbit-planet" /></div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="brand-text">OMENORA</p>
      <p class="loading-msg">{{ t('somethingWrong') }}</p>
    </div>
  </div>

  <!-- Calendar -->
  <div v-else-if="calendarData" class="cal-page">

    <!-- Top bar -->
    <div class="top-bar">
      <p class="top-brand">OMENORA</p>
      <span class="page-label">{{ t('luckyTimingCalendar') }}</span>
    </div>

    <!-- Hero -->
    <div class="cal-hero">
      <div class="cal-hero-glow" aria-hidden="true" />
      <p class="cal-hero-label">{{ t('calDestinyCalendar') }}</p>
      <h1 class="cal-hero-title">{{ store.firstName }}'s<br>{{ t('yearOfBecoming') }}</h1>
      <p class="cal-hero-theme">{{ calendarData.overallTheme }}</p>
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
/* ── Centered states ── */
.center-page {
  background: #050410;
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

/* ── Orbital mark ── */
.orbital-mark {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-outer {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(201, 168, 76, 0.3);
  animation: orbit-spin 18s linear infinite;
}

.orbit-planet {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.85);
  box-shadow: 0 0 6px rgba(201, 168, 76, 0.5);
}

.orbit-inner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(140, 110, 255, 0.2);
}

.orbit-center {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(200, 180, 255, 0.9);
  box-shadow: 0 0 8px rgba(180, 150, 255, 0.6);
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.brand-text {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
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
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  animation: fadeInMsg 0.45s ease;
  max-width: 260px;
  line-height: 1.5;
}

/* ── Calendar page ── */
.cal-page {
  background: #050410;
  min-height: 100vh;
  color: white;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  box-sizing: border-box;
}

/* ── Top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.top-brand {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.22);
  margin: 0;
}

.page-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.55);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 2px;
  padding: 3px 10px;
}

/* ── Hero ── */
.cal-hero {
  position: relative;
  margin-bottom: 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.cal-hero-glow {
  position: absolute;
  top: -40px;
  right: -80px;
  width: 320px;
  height: 220px;
  background: radial-gradient(ellipse at right top, rgba(201, 168, 76, 0.07) 0%, transparent 60%);
  pointer-events: none;
}

.cal-hero-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.6);
  margin: 0 0 14px;
  text-transform: uppercase;
}

.cal-hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 52px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.94);
  margin: 0 0 12px;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.cal-hero-theme {
  font-size: 14px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.65;
  margin: 0;
  max-width: 420px;
}

/* ── Peak / Caution summary ── */
.cal-summary {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
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
  background: rgba(255, 255, 255, 0.05);
  margin: 4px 0;
}

.summary-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  flex-shrink: 0;
  width: 110px;
}

.peak-months {
  font-size: 12px;
  color: rgba(201, 168, 76, 0.82);
  letter-spacing: 0.04em;
}

.caution-months {
  font-size: 12px;
  color: rgba(255, 130, 130, 0.6);
  letter-spacing: 0.04em;
}

/* ── Month card ── */
.month-card {
  position: relative;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 18px 20px 16px 24px;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.month-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.month-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  border-radius: 2px 0 0 2px;
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
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.01em;
}

.month-theme-text {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
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
  font-size: 8px;
  color: rgba(255, 255, 255, 0.2);
  margin: 3px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Energy bar ── */
.energy-track {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
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
  color: rgba(255, 255, 255, 0.52);
  line-height: 1.5;
  font-weight: 300;
}

/* ── Warning ── */
.month-warning {
  background: rgba(180, 80, 80, 0.05);
  border: 1px solid rgba(180, 80, 80, 0.12);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  color: rgba(255, 140, 140, 0.55);
  margin-bottom: 12px;
}

/* ── Lucky days ── */
.lucky-days {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.lucky-label {
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.18);
  margin-right: 4px;
}

.lucky-chip {
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 11px;
  color: rgba(201, 168, 76, 0.7);
  letter-spacing: 0.02em;
}

/* ── Save section ── */
.save-section {
  margin-top: 52px;
  text-align: center;
}

.save-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent);
  margin-bottom: 32px;
}

.save-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.5);
  margin: 0 0 10px;
  text-transform: uppercase;
}

.save-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.88);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.save-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0 0 24px;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.45);
  border-radius: 4px;
  padding: 13px 20px;
  font-size: 12px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s;
}

.download-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.72);
}

.download-btn--primary {
  background: rgba(201, 168, 76, 0.1);
  border-color: rgba(201, 168, 76, 0.42);
  color: rgba(201, 168, 76, 0.88);
}

.download-btn--primary:not(:disabled):hover {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.68);
  color: rgba(201, 168, 76, 1);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.08);
}

.download-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* ── Mobile responsive fixes ── */
@media (max-width: 400px) {
  .cal-page {
    padding: 20px 16px 80px;
  }

  .cal-hero-title {
    font-size: 40px;
  }

  .cal-hero-theme {
    font-size: 13px;
  }

  /* Summary row: allow label to wrap */
  .cal-summary-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .summary-label {
    width: auto;
    flex-shrink: 0;
  }

  /* Month card: tighter padding */
  .month-card {
    padding: 16px 16px 14px 20px;
  }

  /* Download row: stack vertically */
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

@media (max-width: 360px) {
  .cal-page {
    padding: 16px 12px 80px;
  }

  .cal-hero-title {
    font-size: 34px;
  }
}
</style>
