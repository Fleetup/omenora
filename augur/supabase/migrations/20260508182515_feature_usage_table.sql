-- Per-user, per-feature usage tracking for paid feature rate limits.
--
-- Used by /api/reports/* and /api/counsel/message endpoints to enforce
-- monthly/daily caps on premium features. Period is a string for flexibility:
--   monthly features: 'YYYY-MM' (e.g., '2026-05')
--   daily features:   'YYYY-MM-DD' (e.g., '2026-05-08')
--
-- Counts increment via SECURITY DEFINER RPC for atomicity under concurrent
-- requests. Cleanup of old period rows is handled by a separate cron sweep.

CREATE TABLE IF NOT EXISTS public.feature_usage (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature      text NOT NULL,
  period       text NOT NULL,
  count        integer NOT NULL DEFAULT 0,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, feature, period)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_period
  ON public.feature_usage(user_id, period);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_period
  ON public.feature_usage(feature, period);

-- RLS: users read own usage; only service role writes
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_usage_select_own ON public.feature_usage;
CREATE POLICY feature_usage_select_own
  ON public.feature_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Atomic increment via SECURITY DEFINER. Service role only — endpoints call
-- this after passing the entitlement gate, never directly from client.
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_user_id uuid,
  p_feature text,
  p_period  text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.feature_usage (user_id, feature, period, count, last_used_at)
  VALUES (p_user_id, p_feature, p_period, 1, now())
  ON CONFLICT (user_id, feature, period)
  DO UPDATE SET
    count = feature_usage.count + 1,
    last_used_at = now()
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_feature_usage(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_feature_usage(uuid, text, text) TO service_role;
