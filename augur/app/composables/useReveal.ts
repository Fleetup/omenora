import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseRevealOptions {
  /** IntersectionObserver threshold — fraction of element visible before firing. Default: 0.05 */
  threshold?: number
  /** IntersectionObserver rootMargin. Default: '0px 0px -10% 0px' (fires slightly before bottom edge) */
  rootMargin?: string
  /** Fire only once, then disconnect observer. Default: true */
  once?: boolean
}

export interface UseRevealReturn {
  /** Attach to the target element via template ref: <div :ref="el"> */
  el: Ref<HTMLElement | null>
  /** Reactive boolean — true when element has intersected per threshold */
  isRevealed: Ref<boolean>
}

/**
 * useReveal — shared IntersectionObserver reveal composable.
 *
 * Usage:
 *   const { el, isRevealed } = useReveal()
 *   // template: <section :ref="el" :class="{ 'is-revealed': isRevealed }">
 *
 * Reduced-motion: if the user prefers reduced motion, isRevealed is set to
 * true immediately so consumers skip enter animations and show final state.
 *
 * SSR-safe: IntersectionObserver is only accessed inside onMounted (browser only).
 */
export function useReveal(options: UseRevealOptions = {}): UseRevealReturn {
  const {
    threshold = 0.05,
    rootMargin = '0px 0px -10% 0px',
    once = true,
  } = options

  const el = ref<HTMLElement | null>(null)
  const isRevealed = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof window === 'undefined') return

    // Respect prefers-reduced-motion — skip animation entirely
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      isRevealed.value = true
      return
    }

    // IntersectionObserver not available (e.g., old WebKit)
    if (typeof IntersectionObserver === 'undefined') {
      isRevealed.value = true
      return
    }

    if (!el.value) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isRevealed.value = true
            if (once && observer) {
              observer.unobserve(entry.target)
              observer.disconnect()
              observer = null
            }
          } else if (!once) {
            isRevealed.value = false
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return { el, isRevealed }
}
