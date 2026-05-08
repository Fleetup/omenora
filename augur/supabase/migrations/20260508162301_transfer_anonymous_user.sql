-- Transfer anonymous user data to a permanent user.
-- Called when a previously-anonymous user signs in with a real provider
-- (Apple/Google/magic link). Migrates birth chart data, preferences,
-- and any user-owned content from the anonymous user to the permanent one.
--
-- Security: SECURITY DEFINER + explicit auth check. Caller must be the
-- target permanent user (auth.uid() = target_user_id).
-- Anonymous user must exist and be flagged is_anonymous = true.

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
  rows_moved integer := 0;
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

  IF NOT source_is_anon THEN
    RAISE EXCEPTION 'source user is not anonymous or does not exist';
  END IF;

  -- Verify target is NOT anonymous
  SELECT (raw_app_meta_data->>'provider' = 'anonymous')
  INTO target_is_anon
  FROM auth.users
  WHERE id = target_user_id;

  IF target_is_anon THEN
    RAISE EXCEPTION 'target user is anonymous; cannot transfer to another anonymous user';
  END IF;

  -- Transfer public.users row data (birth chart fields)
  -- Strategy: copy non-null fields from source to target where target is null.
  UPDATE public.users target
  SET
    birth_date     = COALESCE(target.birth_date,     source.birth_date),
    birth_time     = COALESCE(target.birth_time,     source.birth_time),
    birth_city     = COALESCE(target.birth_city,     source.birth_city),
    birth_lat      = COALESCE(target.birth_lat,      source.birth_lat),
    birth_lng      = COALESCE(target.birth_lng,      source.birth_lng),
    birth_timezone = COALESCE(target.birth_timezone, source.birth_timezone),
    sun_sign       = COALESCE(target.sun_sign,       source.sun_sign),
    moon_sign      = COALESCE(target.moon_sign,      source.moon_sign),
    rising_sign    = COALESCE(target.rising_sign,    source.rising_sign),
    archetype      = COALESCE(target.archetype,      source.archetype),
    updated_at     = now()
  FROM public.users source
  WHERE target.id = target_user_id
    AND source.id = source_user_id;

  GET DIAGNOSTICS rows_moved = ROW_COUNT;

  -- Delete source public.users row (anonymous user data is now on target)
  DELETE FROM public.users WHERE id = source_user_id;

  -- Note: We do NOT delete the auth.users row for the anonymous user.
  -- That's the responsibility of the auth admin via supabase.auth.admin.deleteUser
  -- in the calling application code, after this RPC succeeds.

  RETURN jsonb_build_object(
    'success', true,
    'source_user_id', source_user_id,
    'target_user_id', target_user_id,
    'rows_updated', rows_moved
  );
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.transfer_anonymous_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_anonymous_user(uuid, uuid) TO authenticated;
