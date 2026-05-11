/**
 * Time utility helpers.
 */

/**
 * Returns a human-readable string for the time remaining until an ISO timestamp.
 * Used by Counsel chat to display cap-reset time to the user.
 *
 * Examples:
 *   timeUntil('2026-05-10T23:59:59Z') → "3 hours" or "45 minutes"
 */
export function timeUntil(isoTimestamp: string): string {
  const diffMs = new Date(isoTimestamp).getTime() - Date.now()
  if (diffMs <= 0) return 'soon'

  const diffMins = Math.ceil(diffMs / 60_000)
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'}`

  const diffHours = Math.ceil(diffMins / 60)
  return `${diffHours} hour${diffHours === 1 ? '' : 's'}`
}

/**
 * Returns true if an ISO date string (YYYY-MM-DD) is in the past relative to today.
 * Used to detect stale forecast periods.
 *
 * Pure function — no side effects. Relies on lexicographic ordering of YYYY-MM-DD
 * strings, which is identical to chronological ordering.
 *
 * Examples:
 *   isPastDate('2025-01-01') → true
 *   isPastDate('2099-12-31') → false
 */
export function isPastDate(isoDate: string): boolean {
  return isoDate < new Date().toISOString().slice(0, 10)
}
