-- Migration: Add compatibility reading columns to reports table
-- Required by:
--   server/api/save-compatibility-reading.post.ts — stores compatibility readings alongside archetype reports
--
-- Run once against Supabase production database via SQL editor or psql.
-- Safe to re-run: IF NOT EXISTS prevents duplicate column errors.

-- 1. Type discriminator so the dashboard can distinguish archetype vs compatibility readings.
--    Existing rows default to 'archetype' — no backfill required.
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'archetype';

-- 2. Full compatibility API response stored as JSONB (mirrors report_data for archetype rows).
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS compatibility_data jsonb;

-- 3. Partner details — only populated on compatibility rows.
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS partner_name text;

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS partner_dob text;
