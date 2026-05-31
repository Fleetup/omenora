-- founding_members: tracks $20 founding-member purchases from omenora.com/founding,
-- written in 'pending' state at checkout-session creation and transitioned to 'paid'
-- by the Stripe webhook.
--
-- Design notes:
--   - stripe_checkout_session_id is the natural idempotency key for the webhook handler.
--   - No FK to auth.users: purchases may come from unauthenticated visitors.
--   - RLS is enabled with no policies: only service_role can read or write.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.founding_members (
  id                          uuid        NOT NULL DEFAULT gen_random_uuid(),
  stripe_checkout_session_id  text        NOT NULL,
  stripe_payment_intent_id    text,
  stripe_charge_id            text,
  stripe_customer_id          text,
  email                       text,
  amount_cents                integer     NOT NULL,
  currency                    text        NOT NULL DEFAULT 'usd',
  status                      text        NOT NULL DEFAULT 'pending',
  paid_at                     timestamptz,
  refunded_at                 timestamptz,
  confirmation_email_sent_at  timestamptz,
  utm_source                  text,
  utm_medium                  text,
  utm_campaign                text,
  utm_content                 text,
  utm_term                    text,
  referrer                    text,
  landing_page                text,
  metadata                    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT founding_members_pkey
    PRIMARY KEY (id),
  CONSTRAINT founding_members_checkout_session_id_unique
    UNIQUE (stripe_checkout_session_id),
  CONSTRAINT founding_members_payment_intent_id_unique
    UNIQUE (stripe_payment_intent_id),
  CONSTRAINT founding_members_status_valid
    CHECK (status IN ('pending', 'paid', 'refunded', 'disputed', 'expired'))
);

COMMENT ON TABLE public.founding_members IS
  'Tracks $20 founding-member purchases from omenora.com/founding, written in '
  '''pending'' state at checkout-session creation and transitioned to ''paid'' by the Stripe webhook.';

COMMENT ON COLUMN public.founding_members.status IS
  'pending: checkout session created but not yet paid; '
  'paid: stripe checkout.session.completed confirmed; '
  'refunded: full refund issued via charge.refunded; '
  'disputed: chargeback opened via charge.dispute.created; '
  'expired: checkout session expired without payment.';

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_founding_members_email
  ON public.founding_members (email);

CREATE INDEX IF NOT EXISTS idx_founding_members_created_at
  ON public.founding_members (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_founding_members_status_non_paid
  ON public.founding_members (status)
  WHERE status <> 'paid';

CREATE INDEX IF NOT EXISTS idx_founding_members_utm_source
  ON public.founding_members (utm_source)
  WHERE utm_source IS NOT NULL;

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Reuses set_updated_at() defined in 20260508174952_subscriptions_table.sql.
-- CREATE OR REPLACE ensures no conflict if the function already exists.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS founding_members_set_updated_at ON public.founding_members;
CREATE TRIGGER founding_members_set_updated_at
  BEFORE UPDATE ON public.founding_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- RLS enabled with no policies. Service role bypasses RLS automatically.
-- Anon and authenticated roles have zero access by default.

ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;
