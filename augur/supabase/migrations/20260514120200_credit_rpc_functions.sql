-- Credit infrastructure RPC functions.
-- All three are SECURITY DEFINER with EXECUTE granted to service_role only.
-- Idempotency for purchase/refund is enforced by the UNIQUE constraint on
-- credit_transactions.revenuecat_event_id (set in the prior migration).
-- Consumption events have rc_event_id = NULL; idempotency for consumption is
-- handled at the application layer, consistent with the existing
-- increment_feature_usage pattern.

-- grant_credits: idempotently add credits on RC NON_RENEWING_PURCHASE webhook
CREATE OR REPLACE FUNCTION public.grant_credits(
  p_user_id       uuid,
  p_credit_type   text,
  p_delta         integer,
  p_rc_event_id   text,
  p_product_id    text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_credit_type NOT IN ('counsel', 'compat') THEN
    RAISE EXCEPTION 'invalid credit_type: %', p_credit_type;
  END IF;

  IF p_delta <= 0 THEN
    RAISE EXCEPTION 'grant_credits requires positive delta, got %', p_delta;
  END IF;

  IF p_rc_event_id IS NULL OR p_rc_event_id = '' THEN
    RAISE EXCEPTION 'grant_credits requires non-null rc_event_id';
  END IF;

  BEGIN
    INSERT INTO public.credit_transactions
      (user_id, revenuecat_event_id, transaction_type, credit_type, delta, product_id)
    VALUES
      (p_user_id, p_rc_event_id, 'purchase', p_credit_type, p_delta, p_product_id);
  EXCEPTION
    WHEN unique_violation THEN
      IF p_credit_type = 'counsel' THEN
        SELECT counsel_credits INTO v_new_balance
        FROM public.user_credits WHERE user_id = p_user_id;
      ELSE
        SELECT compat_credits INTO v_new_balance
        FROM public.user_credits WHERE user_id = p_user_id;
      END IF;
      RETURN COALESCE(v_new_balance, 0);
  END;

  IF p_credit_type = 'counsel' THEN
    INSERT INTO public.user_credits (user_id, counsel_credits)
    VALUES (p_user_id, p_delta)
    ON CONFLICT (user_id) DO UPDATE
      SET counsel_credits = public.user_credits.counsel_credits + p_delta
    RETURNING counsel_credits INTO v_new_balance;
  ELSE
    INSERT INTO public.user_credits (user_id, compat_credits)
    VALUES (p_user_id, p_delta)
    ON CONFLICT (user_id) DO UPDATE
      SET compat_credits = public.user_credits.compat_credits + p_delta
    RETURNING compat_credits INTO v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_credits(uuid, text, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_credits(uuid, text, integer, text, text) TO service_role;

-- clawback_credits: idempotently subtract credits on refund/cancellation
-- Floors at 0 — never produces negative balance.
CREATE OR REPLACE FUNCTION public.clawback_credits(
  p_user_id       uuid,
  p_credit_type   text,
  p_delta         integer,
  p_rc_event_id   text,
  p_product_id    text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_credit_type NOT IN ('counsel', 'compat') THEN
    RAISE EXCEPTION 'invalid credit_type: %', p_credit_type;
  END IF;

  IF p_delta <= 0 THEN
    RAISE EXCEPTION 'clawback_credits requires positive delta, got %', p_delta;
  END IF;

  IF p_rc_event_id IS NULL OR p_rc_event_id = '' THEN
    RAISE EXCEPTION 'clawback_credits requires non-null rc_event_id';
  END IF;

  BEGIN
    INSERT INTO public.credit_transactions
      (user_id, revenuecat_event_id, transaction_type, credit_type, delta, product_id)
    VALUES
      (p_user_id, p_rc_event_id, 'refund', p_credit_type, -p_delta, p_product_id);
  EXCEPTION
    WHEN unique_violation THEN
      IF p_credit_type = 'counsel' THEN
        SELECT counsel_credits INTO v_new_balance
        FROM public.user_credits WHERE user_id = p_user_id;
      ELSE
        SELECT compat_credits INTO v_new_balance
        FROM public.user_credits WHERE user_id = p_user_id;
      END IF;
      RETURN COALESCE(v_new_balance, 0);
  END;

  IF p_credit_type = 'counsel' THEN
    INSERT INTO public.user_credits (user_id, counsel_credits)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET counsel_credits = GREATEST(0, public.user_credits.counsel_credits - p_delta)
    RETURNING counsel_credits INTO v_new_balance;
  ELSE
    INSERT INTO public.user_credits (user_id, compat_credits)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET compat_credits = GREATEST(0, public.user_credits.compat_credits - p_delta)
    RETURNING compat_credits INTO v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.clawback_credits(uuid, text, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clawback_credits(uuid, text, integer, text, text) TO service_role;

-- consume_credit: atomically decrement balance by 1 on successful endpoint call
-- Ledger entry has rc_event_id = NULL. Race-tolerance posture matches
-- increment_feature_usage. CHECK constraint blocks negative balance.
CREATE OR REPLACE FUNCTION public.consume_credit(
  p_user_id       uuid,
  p_credit_type   text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_credit_type NOT IN ('counsel', 'compat') THEN
    RAISE EXCEPTION 'invalid credit_type: %', p_credit_type;
  END IF;

  INSERT INTO public.credit_transactions
    (user_id, revenuecat_event_id, transaction_type, credit_type, delta, product_id)
  VALUES
    (p_user_id, NULL, 'consumption', p_credit_type, -1, NULL);

  IF p_credit_type = 'counsel' THEN
    UPDATE public.user_credits
      SET counsel_credits = counsel_credits - 1
      WHERE user_id = p_user_id
      RETURNING counsel_credits INTO v_new_balance;
  ELSE
    UPDATE public.user_credits
      SET compat_credits = compat_credits - 1
      WHERE user_id = p_user_id
      RETURNING compat_credits INTO v_new_balance;
  END IF;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'consume_credit: no user_credits row for user %', p_user_id;
  END IF;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_credit(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credit(uuid, text) TO service_role;
