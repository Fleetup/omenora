-- Add access_tier to promo_codes to control what level of access a full_access code grants.
-- Values: 'basic' | 'bundle' | 'oracle'
-- Defaults to 'oracle' for all existing personal codes (VIP intent).
ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS access_tier text NOT NULL DEFAULT 'oracle'
    CHECK (access_tier IN ('basic', 'bundle', 'oracle'));
