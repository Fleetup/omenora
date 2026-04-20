-- B-2: Add prompt_version column to reports table
--
-- APPLY THIS MIGRATION BEFORE deploying save-report.post.ts changes.
-- Safe to re-run: IF NOT EXISTS prevents duplicate column errors.
--
-- Steps:
--   1. Run this SQL in Supabase Dashboard → SQL Editor (or via psql)
--   2. Verify column exists: SELECT column_name FROM information_schema.columns
--      WHERE table_name = 'reports' AND column_name = 'prompt_version';
--   3. Deploy updated save-report.post.ts code
--
-- Default 'v1.0' backfills all existing rows so the column is never NULL.

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS prompt_version TEXT DEFAULT 'v1.0';
