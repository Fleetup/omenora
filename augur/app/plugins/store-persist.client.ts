/**
 * store-persist.client.ts
 *
 * Persists critical analysisStore fields to localStorage so a browser reload
 * on /report does not lose the user's data. Only runs client-side.
 *
 * Persisted fields are deliberately minimal — no full report_data blob (too
 * large), no answers (not needed post-generation). Session recovery is handled
 * by the ?session_id= query param + /api/check-report-exists for paid users.
 */
import { watch } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'

const STORAGE_KEY = 'omenora_store_v2'

interface PersistedState {
  firstName: string
  email: string
  archetype: string
  lifePathNumber: number
  dateOfBirth: string
  timeOfBirth: string
  city: string
  region: string
  country: string
  language: string
  tempId: string
  reportSessionId: string
  paymentComplete: boolean
  calendarPurchased: boolean
  bundlePurchased: boolean
  oraclePurchased: boolean
  birthChartPurchased: boolean
  subscriptionActive: boolean
  addonPurchased: boolean
}

function save(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage may be unavailable (private mode quota exceeded)
  }
}

function load(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : {}
  } catch {
    return {}
  }
}

export default defineNuxtPlugin(() => {
  const store = useAnalysisStore()

  // ── Rehydrate from localStorage on boot ──────────────────────────────────
  const saved = load()

  if (saved.firstName)            store.firstName            = saved.firstName
  if (saved.email)                store.setEmail(saved.email)
  if (saved.archetype)            store.setArchetype(saved.archetype)
  if (saved.lifePathNumber)       store.lifePathNumber       = saved.lifePathNumber
  if (saved.dateOfBirth)          store.dateOfBirth          = saved.dateOfBirth
  if (saved.timeOfBirth)          store.timeOfBirth          = saved.timeOfBirth
  if (saved.city)                 store.city                 = saved.city
  if (saved.region && saved.country) store.setRegion(saved.region, saved.country)
  if (saved.language)             store.setLanguage(saved.language)
  if (saved.tempId)               store.setTempId(saved.tempId)
  if (saved.reportSessionId)      store.setReportSessionId(saved.reportSessionId)
  if (saved.paymentComplete)      store.setPaymentComplete(saved.paymentComplete)
  if (saved.calendarPurchased)    store.setCalendarPurchased(saved.calendarPurchased)
  if (saved.bundlePurchased)      store.setBundlePurchased(saved.bundlePurchased)
  if (saved.oraclePurchased)      store.setOraclePurchased(saved.oraclePurchased)
  if (saved.birthChartPurchased)  store.setBirthChartPurchased(saved.birthChartPurchased)
  if (saved.subscriptionActive)   store.setSubscriptionActive(saved.subscriptionActive)
  if (saved.addonPurchased)       store.addonPurchased       = saved.addonPurchased

  // ── Persist on every change ───────────────────────────────────────────────
  watch(
    () => ({
      firstName:           store.firstName,
      email:               store.email,
      archetype:           store.archetype,
      lifePathNumber:      store.lifePathNumber,
      dateOfBirth:         store.dateOfBirth,
      timeOfBirth:         store.timeOfBirth,
      city:                store.city,
      region:              store.region,
      country:             store.country,
      language:            store.language,
      tempId:              store.tempId,
      reportSessionId:     store.reportSessionId,
      paymentComplete:     store.paymentComplete,
      calendarPurchased:   store.calendarPurchased,
      bundlePurchased:     store.bundlePurchased,
      oraclePurchased:     store.oraclePurchased,
      birthChartPurchased: store.birthChartPurchased,
      subscriptionActive:  store.subscriptionActive,
      addonPurchased:      store.addonPurchased,
    }),
    (snapshot) => save(snapshot),
    { deep: true },
  )
})
