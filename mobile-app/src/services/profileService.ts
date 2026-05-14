import { supabase } from '../lib/supabase'

// ── Retry ─────────────────────────────────────────────────────────────────────

const RETRY_BASE_DELAY_MS = 500
const RETRY_ATTEMPTS      = 2

function isRetryable(err: any): boolean {
  if (!err?.status) return true                                   // network error — no HTTP response
  const s = Number(err.status)
  return s >= 500                                                 // 5xx server error
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts  = RETRY_ATTEMPTS,
  baseDelay = RETRY_BASE_DELAY_MS,
): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      if (!isRetryable(err) || i === attempts - 1) break
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)))
    }
  }
  throw lastErr
}

// ── Typed error ───────────────────────────────────────────────────────────────

export class ProfileSaveError extends Error {
  kind: 'network' | 'auth' | 'validation' | 'unknown'
  constructor(message: string, kind: ProfileSaveError['kind']) {
    super(message)
    this.name = 'ProfileSaveError'
    this.kind = kind
  }
}

function toProfileSaveError(err: any): ProfileSaveError {
  const msg = err?.message ?? String(err)
  if (!err?.status) return new ProfileSaveError(msg, 'network')
  const s = Number(err.status)
  if (s === 401 || s === 403) return new ProfileSaveError(msg, 'auth')
  if (s >= 400 && s < 500)    return new ProfileSaveError(msg, 'validation')
  return new ProfileSaveError(msg, 'unknown')
}

// ── Types ─────────────────────────────────────────────────────────────────────

// Mirrors the public.user_profiles Supabase table.
// date_of_birth comes back as 'YYYY-MM-DD', time_of_birth as 'HH:MM:SS'.
export interface ServerProfile {
  user_id:           string
  first_name:        string | null
  date_of_birth:     string | null
  time_of_birth:     string | null
  city:              string | null
  archetype:         string | null
  sun_sign:          string | null
  moon_sign:         string | null
  rising_sign:       string | null
  life_path_number:  number | null
  answers:           Record<string, string>
  analytics_enabled: boolean
  language_override: string | null
}

export type ProfilePayload = Partial<Omit<ServerProfile, 'user_id'>>

// Whitelist for single-field server updates (matches migrated columns only).
const UPDATABLE_FIELDS: ReadonlySet<string> = new Set([
  'language_override',
  'analytics_enabled',
])

// ── fetchProfile ──────────────────────────────────────────────────────────────

/**
 * Fetch the server profile for a user.
 * Returns null if no row exists yet (first-time anonymous user with no profile)
 * or if the fetch fails (non-blocking — callers should degrade gracefully).
 */
export async function fetchProfile(userId: string): Promise<ServerProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[profileService] fetchProfile error:', error.message)
    return null
  }

  return data as ServerProfile | null
}

// ── saveProfile ───────────────────────────────────────────────────────────────

/**
 * Upsert the full server profile for a user with retry + typed errors.
 * Keyed on user_id — safe to call from anonymous or permanent sessions.
 * Throws ProfileSaveError on terminal failure.
 */
export async function saveProfile(userId: string, payload: ProfilePayload): Promise<void> {
  try {
    await retryWithBackoff(async () => {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          { user_id: userId, ...payload },
          { onConflict: 'user_id' },
        )
      if (error) throw error
    })
  } catch (err: any) {
    console.error('[profileService] saveProfile error:', err.message)
    throw toProfileSaveError(err)
  }
}

// ── updateProfileField ────────────────────────────────────────────────────────

/**
 * Write a single whitelisted column to user_profiles with retry + typed errors.
 * Only allows columns in UPDATABLE_FIELDS to guard against accidental field writes.
 * Throws ProfileSaveError on terminal failure.
 */
export async function updateProfileField(
  userId:    string,
  fieldName: string,
  value:     string | boolean | null,
): Promise<void> {
  if (!UPDATABLE_FIELDS.has(fieldName)) {
    throw new ProfileSaveError(
      `updateProfileField: '${fieldName}' is not in the allowed field whitelist`,
      'validation',
    )
  }

  try {
    await retryWithBackoff(async () => {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          { user_id: userId, [fieldName]: value },
          { onConflict: 'user_id' },
        )
      if (error) throw error
    })
  } catch (err: any) {
    console.error('[profileService] updateProfileField error:', err.message)
    throw toProfileSaveError(err)
  }
}
