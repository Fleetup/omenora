-- user_profiles: server-authoritative mirror of the client's local profileStore.
--
-- Purpose: allow any permanent user to restore their profile on a fresh device or
-- after sign-out without repeating the onboarding flow.
--
-- Write path: mobile client upserts after CalculatingScreen succeeds (anonymous or
-- permanent user). Row is keyed on user_id so re-running onboarding overwrites.
--
-- Read path: AuthProvider fetches and hydrates profileStore on every SIGNED_IN event
-- where the incoming user is permanent (not anonymous).
--
-- Transfer: transfer_anonymous_user (extended below) merges the anonymous user's
-- profile row into the permanent user's row using COALESCE so the target's existing
-- data is never overwritten.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id          uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name       text,
  date_of_birth    date,
  time_of_birth    time,
  city             text,
  archetype        text,
  sun_sign         text,
  moon_sign        text,
  rising_sign      text,
  life_path_number integer,
  answers          jsonb   NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Reuses set_updated_at() defined in 20260508174952_subscriptions_table.sql.

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Authenticated users (including anonymous Supabase users) can read, insert, and
-- update their own row. Service role bypasses RLS for admin operations.
-- No explicit DELETE policy: rows are deleted only via FK CASCADE when the
-- auth.users row is deleted (account deletion path).

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
CREATE POLICY user_profiles_insert_own
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Extend transfer_anonymous_user to transfer user_profiles ──────────────────
-- Replaces the Phase 1 stub (20260508171740_fix_transfer_anonymous_user.sql).
-- The public.users metadata transfer (converted_from_anonymous_at etc.) is kept.
-- The profile row is merged with COALESCE so the permanent user's existing data
-- (e.g. from a previous device) is never overwritten by the anonymous source.

CREATE OR REPLACE FUNCTION public.transfer_anonymous_user(
  source_user_id uuid,
  target_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_is_anon       boolean;
  target_is_anon       boolean;
  source_row_existed   boolean := false;
  profile_rows_moved   integer := 0;
BEGIN
  -- ── Auth guard ───────────────────────────────────────────────────────────────
  IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'unauthorized: caller must be target user';
  END IF;

  -- ── Source must be anonymous ─────────────────────────────────────────────────
  SELECT (raw_app_meta_data->>'provider' = 'anonymous')
  INTO source_is_anon
  FROM auth.users
  WHERE id = source_user_id;

  IF source_is_anon IS NULL THEN
    RAISE EXCEPTION 'source user does not exist';
  END IF;

  IF NOT source_is_anon THEN
    RAISE EXCEPTION 'source user is not anonymous';
  END IF;

  -- ── Target must NOT be anonymous ─────────────────────────────────────────────
  SELECT (raw_app_meta_data->>'provider' = 'anonymous')
  INTO target_is_anon
  FROM auth.users
  WHERE id = target_user_id;

  IF target_is_anon THEN
    RAISE EXCEPTION 'target user is anonymous; cannot transfer to another anonymous user';
  END IF;

  -- ── Transfer public.users metadata ───────────────────────────────────────────
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = source_user_id)
  INTO source_row_existed;

  UPDATE public.users
  SET
    converted_from_anonymous_at = now(),
    previous_anonymous_user_id  = source_user_id,
    updated_at                  = now()
  WHERE id = target_user_id;

  IF source_row_existed THEN
    DELETE FROM public.users WHERE id = source_user_id;
  END IF;

  -- ── Transfer user_profiles (merge COALESCE — never overwrite existing data) ──
  INSERT INTO public.user_profiles (
    user_id, first_name, date_of_birth, time_of_birth, city,
    archetype, sun_sign, moon_sign, rising_sign, life_path_number,
    answers, created_at, updated_at
  )
  SELECT
    target_user_id,
    first_name, date_of_birth, time_of_birth, city,
    archetype, sun_sign, moon_sign, rising_sign, life_path_number,
    answers, now(), now()
  FROM public.user_profiles
  WHERE user_id = source_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    first_name       = COALESCE(EXCLUDED.first_name,       public.user_profiles.first_name),
    date_of_birth    = COALESCE(EXCLUDED.date_of_birth,    public.user_profiles.date_of_birth),
    time_of_birth    = COALESCE(EXCLUDED.time_of_birth,    public.user_profiles.time_of_birth),
    city             = COALESCE(EXCLUDED.city,             public.user_profiles.city),
    archetype        = COALESCE(EXCLUDED.archetype,        public.user_profiles.archetype),
    sun_sign         = COALESCE(EXCLUDED.sun_sign,         public.user_profiles.sun_sign),
    moon_sign        = COALESCE(EXCLUDED.moon_sign,        public.user_profiles.moon_sign),
    rising_sign      = COALESCE(EXCLUDED.rising_sign,      public.user_profiles.rising_sign),
    life_path_number = COALESCE(EXCLUDED.life_path_number, public.user_profiles.life_path_number),
    answers          = COALESCE(EXCLUDED.answers,          public.user_profiles.answers),
    updated_at       = now();

  GET DIAGNOSTICS profile_rows_moved = ROW_COUNT;

  -- ── Clean up source profile row ───────────────────────────────────────────────
  DELETE FROM public.user_profiles WHERE user_id = source_user_id;

  RETURN jsonb_build_object(
    'success',            true,
    'source_user_id',     source_user_id,
    'target_user_id',     target_user_id,
    'source_row_existed', source_row_existed,
    'profile_rows_moved', profile_rows_moved
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_anonymous_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_anonymous_user(uuid, uuid) TO authenticated;
