/**
 * store-persist.client.ts
 *
 * Persists critical analysisStore fields to localStorage so a browser reload
 * on /report does not lose the user's data. Only runs client-side.
 *
 * Persisted fields are deliberately minimal — no full report_data blob (too
 * large), no answers (not needed post-generation). Session recovery is handled
 * by the ?session_id= query param + /api/check-report-exists for paid users.
 *
 * Cache versioning: CACHE_VERSION is bumped whenever a change would make
 * stale cached data incorrect. On version mismatch, assignment fields
 * (archetype, report session, payment state) are cleared while user
 * preferences (language, region) are preserved.
 */
import { watch } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'

const STORAGE_KEY = 'omenora_store_v2'

/**
 * Bump this string whenever stale cached assignment data must be cleared.
 *
 * v3-archetype-fix — 2026-04-18
 *   Invalidates all sessions that received 'wildfire' from the broken
 *   if/else system. Forces a clean archetype assignment on next quiz run.
 */
const CACHE_VERSION = 'v3-archetype-fix'
const VERSION_KEY   = 'omenora_cache_version'

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

/**
 * Compare the saved cache version to the current one.
 * If they differ, clear stale assignment fields from the saved state
 * while preserving user preference fields (language, region, firstName, email).
 * Writes the current version to localStorage regardless.
 */
function applyVersionMigration(saved: Partial<PersistedState>): Partial<PersistedState> {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (storedVersion === CACHE_VERSION) return saved

    // Version mismatch — clear stale assignment data.
    // Preserve: firstName, email, language, region, country
    // Clear: archetype, lifePathNumber, dateOfBirth, timeOfBirth, city,
    //        tempId, reportSessionId, paymentComplete, all purchase flags
    const migrated: Partial<PersistedState> = {
      firstName: saved.firstName,
      email:     saved.email,
      language:  saved.language,
      region:    saved.region,
      country:   saved.country,
    }

    localStorage.setItem(VERSION_KEY, CACHE_VERSION)
    return migrated
  } catch {
    return saved
  }
}

export default defineNuxtPlugin(() => {
  const store = useAnalysisStore()

  // ── Rehydrate from localStorage on boot ──────────────────────────────────
  const raw   = load()
  const saved = applyVersionMigration(raw)

  // Field-level type guards: only accept primitives of the expected type.
  // A tampered or corrupt localStorage entry cannot inject unexpected types.
  const str = (v: unknown, max = 200): string =>
    typeof v === 'string' && v.length <= max ? v : ''
  const num = (v: unknown): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : 0

  const s = saved as Record<string, unknown>
  if (str(s.firstName, 50))   store.firstName      = str(s.firstName, 50)
  if (str(s.email, 254))      store.setEmail(str(s.email, 254))
  if (str(s.archetype, 30))   store.setArchetype(str(s.archetype, 30))
  if (num(s.lifePathNumber))  store.lifePathNumber = num(s.lifePathNumber)
  if (str(s.dateOfBirth, 10)) store.dateOfBirth    = str(s.dateOfBirth, 10)
  if (str(s.timeOfBirth, 10)) store.timeOfBirth    = str(s.timeOfBirth, 10)
  if (str(s.city, 100))       store.city           = str(s.city, 100)
  if (str(s.region, 20) && str(s.country, 10)) store.setRegion(str(s.region, 20), str(s.country, 10))
  if (str(s.language, 5))     store.setLanguage(str(s.language, 5))
  if (str(s.tempId, 200))     store.setTempId(str(s.tempId, 200))
  if (str(s.reportSessionId, 200)) store.setReportSessionId(str(s.reportSessionId, 200))

  // ── Purchase flags are intentionally NOT rehydrated from localStorage. ────
  // They must only be set from the server-verified Stripe payment response
  // (report.vue onMounted → /api/verify-payment). Rehydrating them from
  // localStorage would let a user set bundlePurchased:true in DevTools and
  // get locked sections to render without a valid payment.
  // All flags default to false in the Pinia store definition.

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
