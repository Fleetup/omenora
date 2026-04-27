-- Add full insight text and reflection question to daily_insight_logs.
-- These columns enable the account page to display the last 7 daily insights
-- so subscribers can re-read past entries without searching their email.
--
-- Safe to run on an existing table — ALTER TABLE IF NOT EXISTS column.
-- Existing rows will have NULL in both new columns (acceptable — only new sends populate them).

ALTER TABLE daily_insight_logs
  ADD COLUMN IF NOT EXISTS insight_full text,
  ADD COLUMN IF NOT EXISTS reflection_question text;
