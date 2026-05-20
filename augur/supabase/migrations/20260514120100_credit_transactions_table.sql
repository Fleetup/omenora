-- credit_transactions: append-only ledger for all credit balance changes
-- One row per purchase, consumption, or refund event.
-- The UNIQUE constraint on revenuecat_event_id enforces webhook idempotency:
-- if the same RC event arrives twice, the second insert raises unique_violation
-- which the grant_credits / clawback_credits RPCs trap and treat as no-op.
-- Consumption events have revenuecat_event_id = NULL (no RC event triggers them).

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revenuecat_event_id   text,
  transaction_type      text NOT NULL,
  credit_type           text NOT NULL,
  delta                 integer NOT NULL,
  product_id            text,
  metadata              jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_transactions_type_valid
    CHECK (transaction_type IN ('purchase', 'consumption', 'refund')),
  CONSTRAINT credit_transactions_credit_type_valid
    CHECK (credit_type IN ('counsel', 'compat')),
  CONSTRAINT credit_transactions_rc_event_id_unique
    UNIQUE (revenuecat_event_id)
);

CREATE INDEX idx_credit_transactions_user_created
  ON public.credit_transactions (user_id, created_at DESC);

CREATE INDEX idx_credit_transactions_rc_event_id
  ON public.credit_transactions (revenuecat_event_id)
  WHERE revenuecat_event_id IS NOT NULL;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY credit_transactions_select_own
  ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
