-- user_credits: per-user current balance of consumable credits
-- Granted via RevenueCat webhook on NON_RENEWING_PURCHASE events for boost packs
-- and the compatibility single-purchase product. Consumed by the counsel and
-- compatibility endpoints. Clawed back on refund/cancellation webhooks.

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  counsel_credits  integer NOT NULL DEFAULT 0,
  compat_credits   integer NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_credits_counsel_non_negative CHECK (counsel_credits >= 0),
  CONSTRAINT user_credits_compat_non_negative  CHECK (compat_credits >= 0)
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.user_credits_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_credits_set_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.user_credits_touch_updated_at();

-- RLS: users can SELECT their own row; INSERT and UPDATE happen via service_role only
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_credits_select_own
  ON public.user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Backfill: create empty row for every existing user so credit-balance reads always succeed
INSERT INTO public.user_credits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
