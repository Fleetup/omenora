-- Add user preferences to user_profiles
-- Cluster 4C dependency: server-first writes for language and
-- analytics toggle require these columns to exist.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS analytics_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS language_override text;

-- No backfill needed — defaults handle existing rows.
-- analytics_enabled defaults to true (opt-out model).
-- language_override is nullable; null means "use device language".
