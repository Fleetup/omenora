-- ── Promo code security hardening ───────────────────────────────────────────
--
-- STATEMENT 1: Atomic increment function
--   Checks the limit AND increments current_uses in a single operation.
--   Postgres row-level locking makes concurrent races impossible.
--   Returns success: false (without incrementing) if the code is at its limit,
--   inactive, or expired.
--
CREATE OR REPLACE FUNCTION claim_promo_use(p_code_id uuid)
RETURNS TABLE(
  success      boolean,
  code_id      uuid,
  current_uses integer,
  max_uses     integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE id = p_code_id
    AND active = true
    AND current_uses < max_uses
    AND (expires_at IS NULL OR expires_at > now())
  RETURNING
    true          AS success,
    id            AS code_id,
    current_uses,
    max_uses;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      false       AS success,
      p_code_id   AS code_id,
      0           AS current_uses,
      0           AS max_uses;
  END IF;
END;
$$;

-- ── STATEMENT 2: Unique constraint on promo_code_uses ────────────────────────
--   DB-level guard: a second insert with the same (code_id, email) throws a
--   unique violation rather than silently succeeding.
--
ALTER TABLE promo_code_uses
  ADD CONSTRAINT IF NOT EXISTS unique_code_email
  UNIQUE (code_id, email);

-- ── STATEMENT 3: Discount value range check ──────────────────────────────────
--   Prevents bad data (e.g. discount_value = 150) from producing a negative
--   Stripe unit_amount that Math.max(1, ...) would silently clip to 1 cent.
--
ALTER TABLE promo_codes
  ADD CONSTRAINT IF NOT EXISTS valid_discount_value
  CHECK (discount_value >= 0 AND discount_value <= 100);
