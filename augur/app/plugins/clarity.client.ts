import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const projectId = config.public.clarityProjectId as string

  if (!projectId) return

  const route = useRoute()

  // ── Test traffic exclusion ────────────────────────────────────────────────
  try {
    const isTest =
      route.query.test === '1' ||
      localStorage.getItem('omenora_internal_test') === 'true'

    if (isTest) {
      console.warn('[Clarity] Skipped init: internal test traffic')
      return
    }
  } catch {
    // ignore localStorage access errors (e.g. private browsing restrictions)
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  try {
    Clarity.init(projectId)
  } catch (err) {
    console.warn('[Clarity] Init failed:', err)
    return
  }

  // ── UTM + deep-link tags ──────────────────────────────────────────────────
  try {
    const TAG_KEYS = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'sign', 'archetype',
    ] as const

    for (const key of TAG_KEYS) {
      const val = route.query[key]
      if (val) {
        Clarity.setTag(key, String(val))
      }
    }
  } catch (err) {
    console.warn('[Clarity] setTag error:', err)
  }
})
