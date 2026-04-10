import { computed } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { UI_STRINGS } from '~/utils/translations'

export function useLanguage() {
  const store = useAnalysisStore()

  function t(key: string): string {
    const lang: Record<string, string> = UI_STRINGS[store.language] ?? UI_STRINGS['en'] ?? {}
    const en: Record<string, string> = UI_STRINGS['en'] ?? {}
    return lang[key] ?? en[key] ?? key
  }

  return { t, language: computed(() => store.language) }
}
