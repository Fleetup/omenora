-- Migration: Add plan_type to subscribers table
-- Required by:
--   server/api/save-subscriber.post.ts — needs to distinguish subscription tiers
--
-- Run once against Supabase production database via SQL Editor.
-- Safe to re-run: IF NOT EXISTS prevents duplicate column/index errors.

-- Add plan_type to distinguish between subscription tiers
-- Values: 'daily_horoscope' (SUB-1, $4.99/mo) or 'compatibility_plus' (SUB-2, $9.99/mo)
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'daily_horoscope';

-- Backfill: existing subscribers without archetype data are likely compatibility subscribers
-- We can't perfectly distinguish old records, so we leave them as 'daily_horoscope' (safe default)
-- New subscribers will have plan_type set correctly going forward

-- Add index for fast lookup by plan_type (needed for weekly email cron that targets only compatibility_plus)
CREATE INDEX IF NOT EXISTS subscribers_plan_type_idx ON subscribers (plan_type);

-- Add index for active + plan_type combination (most common query pattern)
CREATE INDEX IF NOT EXISTS subscribers_active_plan_type_idx ON subscribers (active, plan_type);
