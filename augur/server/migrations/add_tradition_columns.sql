-- Migration: Add tradition-specific report cache columns and unlocked traditions tracking
-- Run once against Supabase production database via SQL editor or psql

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS report_data_vedic   jsonb    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS report_data_bazi    jsonb    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS report_data_latam   jsonb    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS traditions_unlocked text[]   DEFAULT ARRAY['western']::text[],
  ADD COLUMN IF NOT EXISTS language            text     DEFAULT 'en';
