/**
 * Crisis keyword detection for Counsel chat.
 *
 * Client-side pre-filter that intercepts messages containing crisis signals
 * BEFORE any API call. This ensures no crisis content reaches the LLM context.
 *
 * The server-side system prompt also instructs Claude to redirect crisis signals,
 * providing defence-in-depth.
 *
 * Keyword list locked per Phase 5 Cluster 3 spec.
 */

const CRISIS_KEYWORDS = [
  'suicide',
  'suicidal',
  'kill myself',
  'kms',
  'end my life',
  'end it all',
  'want to die',
  'going to die tonight',
  'no reason to live',
  'better off dead',
] as const

export function detectCrisisKeywords(text: string): boolean {
  const normalized = text.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) => normalized.includes(keyword))
}
