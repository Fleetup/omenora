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
