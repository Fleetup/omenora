-- Migration: extend access_tier CHECK to include 'compatibility'
-- Required by:
--   server/api/validate-promo.post.ts  — checks accessTier === 'compatibility'
--   admin/promo-generator.html        — inserts codes with access_tier = 'compatibility'
--
-- The original CHECK in add_promo_access_tier.sql only allows 'basic', 'bundle', 'oracle'.
-- Adding 'compatibility' allows promo codes that unlock the compatibility reading for free.
--
-- Postgres does not support modifying a CHECK constraint in place — the old one must be
-- dropped and a new one added. This is safe: the column already has NOT NULL + DEFAULT.
-- Safe to re-run: IF EXISTS / IF NOT EXISTS guards on both statements.

ALTER TABLE promo_codes
  DROP CONSTRAINT IF EXISTS promo_codes_access_tier_check;

ALTER TABLE promo_codes
  ADD CONSTRAINT promo_codes_access_tier_check
  CHECK (access_tier IN ('basic', 'bundle', 'oracle', 'compatibility'));
