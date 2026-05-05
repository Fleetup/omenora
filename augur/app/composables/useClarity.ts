import Clarity from '@microsoft/clarity'

export function useClarity() {
  function isReady(): boolean {
    return import.meta.client && 'clarity' in window
  }

  function trackEvent(eventName: string): void {
    if (!isReady()) return
    try {
      Clarity.event(eventName)
    } catch (err) {
      console.warn(`[Clarity] trackEvent error — ${eventName}:`, err)
    }
  }

  function setTag(key: string, value: string): void {
    if (!isReady()) return
    try {
      Clarity.setTag(key, value)
    } catch (err) {
      console.warn(`[Clarity] setTag error — ${key}:`, err)
    }
  }

  function identify(userId: string): void {
    if (!isReady()) return
    try {
      Clarity.identify(userId)
    } catch (err) {
      console.warn('[Clarity] identify error:', err)
    }
  }

  return { trackEvent, setTag, identify }
}
