-- Subscription state cache from RevenueCat webhook events.
--
-- This table is the authoritative server-side mirror of RC entitlements.
-- The mobile client reads its own state from CustomerInfo (RC SDK), but
-- backend handlers (report generation, counsel chat, etc.) read from this
-- table to gate paid features without having to hit the RC API on every
-- request.
--
-- Webhook handler upserts on user_id+entitlement_id; status reflects current
-- state (active/expired/cancelled/billing_issue/in_grace_period).
--
-- Indexes: user_id (read path), expires_at (background expiry sweeps).

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_id text NOT NULL,
  product_id text,
  store text,                                  -- 'app_store' | 'play_store' | 'rc_test_store' | 'web_billing'
  status text NOT NULL DEFAULT 'active',       -- active|expired|cancelled|billing_issue|in_grace_period
  is_in_trial_period boolean DEFAULT false,
  is_sandbox boolean DEFAULT false,
  purchased_at timestamptz NOT NULL,
  expires_at timestamptz,                      -- null for lifetime
  cancelled_at timestamptz,
  unsubscribe_detected_at timestamptz,
  billing_issues_detected_at timestamptz,
  rc_event_id text,                            -- last webhook event id (idempotency aid)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entitlement_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status     ON public.subscriptions(status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: users can read their own subscription rows; only service role writes.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
