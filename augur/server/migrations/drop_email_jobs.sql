-- Phase 5c cleanup: drop the email_jobs table.
-- The abandonment sequence has been fully migrated to Inngest (Phase 5b).
-- The Railway cron that drained this table has been disabled, and the
-- queue was confirmed empty (zero pending/processing rows) before this
-- migration was applied.
--
-- CASCADE drops any indexes and foreign key references automatically.
DROP TABLE IF EXISTS email_jobs CASCADE;
