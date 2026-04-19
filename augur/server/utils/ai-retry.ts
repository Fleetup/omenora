/**
 * Anthropic API retry utility.
 *
 * Wraps an async Anthropic API call with up to 3 total attempts (1 initial +
 * 2 retries) and exponential backoff. Only retries on transient errors where
 * a retry has a reasonable chance of succeeding. Never retries on auth errors,
 * bad requests, rate limits, or schema validation failures.
 *
 * Usage:
 *   const message = await withAiRetry('endpoint-name', () =>
 *     client.messages.parse({ ... })
 *   )
 */

const RETRY_DELAYS_MS = [1000, 3000] as const

function isRetryable(err: any): boolean {
  const status: number = err?.status ?? err?.statusCode ?? 0
  const code: string   = err?.code ?? ''
  const msg: string    = err?.message ?? ''

  if (status === 401 || status === 403) return false
  if (status === 400)                   return false
  if (status === 404)                   return false
  if (status === 429)                   return false

  if (status === 500 || status === 503 || status === 529) return true

  if (
    code === 'ECONNRESET'  ||
    code === 'ETIMEDOUT'   ||
    code === 'ENOTFOUND'   ||
    msg.toLowerCase().includes('fetch failed') ||
    msg.toLowerCase().includes('timeout')
  ) return true

  return false
}

export async function withAiRetry<T>(
  endpoint: string,
  fn: () => Promise<T>,
): Promise<T> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const isLast = attempt === maxAttempts

      if (isLast || !isRetryable(err)) {
        if (attempt > 1) {
          console.error(`[ai-retry] Final failure on attempt ${attempt}/${maxAttempts}`, {
            endpoint,
            attempt,
            status:  err?.status ?? err?.statusCode,
            code:    err?.code,
            message: err?.message,
          })
        }
        throw err
      }

      const delayMs = RETRY_DELAYS_MS[attempt - 1]
      console.warn(`[ai-retry] Attempt ${attempt}/${maxAttempts} failed — retrying in ${delayMs}ms`, {
        endpoint,
        attempt,
        status:  err?.status ?? err?.statusCode,
        code:    err?.code,
        message: err?.message,
        retryable: true,
        waitMs: delayMs,
      })

      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('[ai-retry] Unreachable')
}
