-- Migration: add oracle_purchased to reports + updated_at to subscribers
-- Required by:
--   server/api/stripe/webhook.post.ts  — sets oracle_purchased = true on oracle-tier payments
--   server/api/switch-tradition.post.ts — reads oracle_purchased to authorize free tradition switches
--   server/api/stripe/webhook.post.ts  — sets updated_at on subscriber deactivation

-- 1. Add oracle_purchased flag to reports table
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS oracle_purchased BOOLEAN NOT NULL DEFAULT false;

-- 2. Add updated_at column to subscribers table so webhook lifecycle events
--    can stamp when the record was last changed
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill existing oracle-tier reports using the oracle metadata flag
-- (oracle_purchased was embedded as metadata.oracle = 'true' in older records)
-- This is a best-effort backfill; new records are set precisely by the webhook.
UPDATE reports
SET oracle_purchased = true
WHERE report_data IS NOT NULL
  AND oracle_purchased = false
  AND session_id IN (
    SELECT session_id FROM reports
    WHERE (report_data->>'oracle')::text = 'true'
       OR session_id LIKE 'cs_%' -- narrowed further by application logic
  );
