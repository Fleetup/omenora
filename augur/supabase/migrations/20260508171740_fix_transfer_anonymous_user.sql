-- Fix transfer_anonymous_user RPC.
--
-- The original migration (20260508162301_transfer_anonymous_user.sql)
-- referenced birth chart columns (birth_date, birth_time, etc.) that
-- don't exist in public.users. CREATE FUNCTION accepts that body
-- because Postgres validates lazily; the column error only fires
-- when the RPC actually runs.
--
-- Actual public.users schema is much simpler — it tracks user identity
-- and provider info, not birth chart data. Transfer reduces to:
--   1. Stamp converted_from_anonymous_at + previous_anonymous_user_id on target
--   2. Delete source row from public.users (auth.users row deletion happens
--      in app code via supabase.auth.admin.deleteUser)
--
-- Birth chart data transfer (when those tables exist in Phase 2)
-- will be added as a separate migration that extends this function.

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
  source_is_anon boolean;
  target_is_anon boolean;
  source_existed boolean := false;
BEGIN
  -- Auth check: caller must be target user
  IF auth.uid() IS NULL OR auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'unauthorized: caller must be target user';
  END IF;

  -- Verify source is anonymous
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

  -- Verify target is NOT anonymous
  SELECT (raw_app_meta_data->>'provider' = 'anonymous')
  INTO target_is_anon
  FROM auth.users
  WHERE id = target_user_id;

  IF target_is_anon THEN
    RAISE EXCEPTION 'target user is anonymous; cannot transfer to another anonymous user';
  END IF;

  -- Check if source has a public.users row to transfer from
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = source_user_id) INTO source_existed;

  -- Stamp transfer metadata on the target user
  UPDATE public.users
  SET
    converted_from_anonymous_at = now(),
    previous_anonymous_user_id  = source_user_id,
    updated_at                  = now()
  WHERE id = target_user_id;

  -- Delete source row if it exists (cleanup)
  IF source_existed THEN
    DELETE FROM public.users WHERE id = source_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'source_user_id', source_user_id,
    'target_user_id', target_user_id,
    'source_row_existed', source_existed
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_anonymous_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_anonymous_user(uuid, uuid) TO authenticated;
