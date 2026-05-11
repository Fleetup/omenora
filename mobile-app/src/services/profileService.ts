import { supabase } from '../lib/supabase'

// Mirrors the public.user_profiles Supabase table.
// date_of_birth comes back as 'YYYY-MM-DD', time_of_birth as 'HH:MM:SS'.
export interface ServerProfile {
  user_id:          string
  first_name:       string | null
  date_of_birth:    string | null
  time_of_birth:    string | null
  city:             string | null
  archetype:        string | null
  sun_sign:         string | null
  moon_sign:        string | null
  rising_sign:      string | null
  life_path_number: number | null
  answers:          Record<string, string>
}

export type ProfilePayload = Partial<Omit<ServerProfile, 'user_id'>>

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

/**
 * Upsert the server profile for a user.
 * Keyed on user_id — safe to call from anonymous or permanent sessions.
 * Throws on error so callers can decide whether to surface it.
 */
export async function saveProfile(userId: string, payload: ProfilePayload): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: userId, ...payload },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('[profileService] saveProfile error:', error.message)
    throw error
  }
}
