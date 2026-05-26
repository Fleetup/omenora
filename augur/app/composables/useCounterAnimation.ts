/**
 * useCounterAnimation
 * ────────────────────
 * rAF-driven counter rollup from 0 to a target value, returning a
 * reactive formatted string. Trigger-driven: animation starts when
 * the `trigger` ref flips to true (ideal for pairing with useReveal).
 *
 * Sandbox source: onMounted counter rollup in redesign-home.vue
 * (lines 770–785). Easing: easeOutCubic (1 - (1-t)³) — same as
 * sandbox. Default duration: 1400ms — sandbox exact.
 *
 * SSR-safe: requestAnimationFrame and window.matchMedia are guarded
 * behind typeof window checks. On the server the returned ref holds
 * the final formatted value immediately.
 *
 * Reduced-motion: if prefers-reduced-motion: reduce is set, the
 * counter jumps to the final formatted value without animation.
 *
 * Usage:
 *   // Simple — starts immediately on mount:
 *   const display = useCounterAnimation(12400)
 *
 *   // Reveal-triggered — starts when section becomes visible:
 *   const { isRevealed } = useReveal()
 *   const display = useCounterAnimation(12400, { trigger: isRevealed })
 *
 *   // With unit formatting (e.g., "96" → "96"):
 *   const pct = useCounterAnimation(96, { formatter: n => String(n) })
 *
 *   // Decimal (e.g., 4.8 → "4.8"):
 *   const rating = useCounterAnimation(4.8, {
 *     precision: 1,
 *     formatter: n => n.toFixed(1),
 *   })
 *
 * Signature:
 *   useCounterAnimation(
 *     targetValue: number | Ref<number>,
 *     options?: UseCounterAnimationOptions
 *   ): Readonly<Ref<string>>
 *
 * Options:
 *   duration?   number                     — ms; default 1400
 *   trigger?    Ref<boolean>               — default ref(true) = immediate
 *   formatter?  (n: number) => string      — default: Intl thousands separator
 *   precision?  number                     — decimal places; default 0
 *                                            Passed to default formatter.
 *                                            Ignored if formatter is provided.
 */

import { ref, watch, onUnmounted, isRef, readonly, type Ref } from 'vue'

export interface UseCounterAnimationOptions {
  duration?: number
  trigger?: Ref<boolean>
  formatter?: (n: number) => string
  precision?: number
}

/** easeOutCubic: fast start, smooth deceleration into target. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Default formatter: Intl thousands separator, respects precision. */
function makeDefaultFormatter(precision: number): (n: number) => string {
  const fmt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
  return (n: number) => fmt.format(n)
}

/** Returns true if prefers-reduced-motion: reduce is active. SSR-safe. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCounterAnimation(
  targetValue: number | Ref<number>,
  options: UseCounterAnimationOptions = {},
): Readonly<Ref<string>> {
  const {
    duration = 1400,
    trigger,
    precision = 0,
  } = options

  const target = isRef(targetValue) ? targetValue : ref(targetValue)
  const formatter = options.formatter ?? makeDefaultFormatter(precision)

  // Start with the final formatted value on SSR; on client starts at 0.
  const display = ref<string>(
    typeof window === 'undefined'
      ? formatter(target.value)
      : formatter(0),
  )

  let rafId: number | null = null

  function cancelAnimation(): void {
    if (rafId !== null) {
      if (typeof window !== 'undefined') cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function runAnimation(): void {
    if (typeof window === 'undefined') return
    cancelAnimation()

    // Reduced-motion: instant final state.
    if (prefersReducedMotion()) {
      display.value = formatter(target.value)
      return
    }

    const startTime = performance.now()
    const endValue = target.value

    const step = (now: number): void => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      const eased = easeOutCubic(t)
      const current = endValue * eased

      // For integer targets snap to integer; for decimals use precision.
      const rounded = precision === 0
        ? Math.round(current)
        : parseFloat(current.toFixed(precision))

      display.value = formatter(rounded)

      if (t < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        // Ensure exact final value on last frame.
        display.value = formatter(endValue)
        rafId = null
      }
    }

    rafId = requestAnimationFrame(step)
  }

  // If trigger is provided, watch for it to become true once.
  // If no trigger, start immediately on mount (typeof window guard).
  if (trigger) {
    const stop = watch(
      trigger,
      (val) => {
        if (val) {
          runAnimation()
          stop() // fire once — no re-run on subsequent changes
        }
      },
      { immediate: true },
    )
  } else {
    // No trigger: run immediately (client only).
    if (typeof window !== 'undefined') {
      // Defer one tick so the component is mounted.
      Promise.resolve().then(runAnimation)
    }
  }

  onUnmounted(cancelAnimation)

  return readonly(display)
}
