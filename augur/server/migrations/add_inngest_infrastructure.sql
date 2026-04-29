-- Migration: Inngest infrastructure support tables + daily_archetype_cache columns
-- Phase 0 of the Inngest migration.
--
-- New objects (all additive — nothing existing is dropped, renamed, or modified):
--   1. stripe_webhook_events  — Stripe webhook idempotency log
--   2. email_send_log         — append-only audit log for every outbound email
--   3. email_suppression      — permanent suppression list (bounces, complaints, unsubscribes)
--   4. daily_archetype_cache  — four new nullable columns: love, work, health, reflection
--
-- Safe to re-run: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS on every statement.
-- Do not run a backfill — new columns on daily_archetype_cache stay NULL on existing rows
-- until Phase 3 generates fresh per-section content.


-- ── 1. stripe_webhook_events ─────────────────────────────────────────────────
--
-- Idempotency table for the Stripe webhook handler.
-- Primary key is the Stripe event ID (text) — a unique-constraint violation on
-- insert signals a duplicate delivery and allows the handler to return 200 early.
--
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id    text PRIMARY KEY,
  event_type  text NOT NULL,
  received_at timestamp with time zone DEFAULT now()
);


-- ── 2. email_send_log ────────────────────────────────────────────────────────
--
-- Append-only audit log for every outbound email sent by any Inngest function.
-- Coexists with daily_insight_logs during the migration; eventually replaces it
-- in Phase 5 after a backfill.
--
-- send_type values (not enforced at DB level to allow future additions without
-- another migration): welcome_insight, daily_insight, weekly_transit,
-- abandonment_1, abandonment_2, abandonment_3, abandonment_4
--
-- resend_email_id is nullable — populated in Phase 2 once Resend webhooks land.
--
CREATE TABLE IF NOT EXISTS email_send_log (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email          text NOT NULL,
  send_type      text NOT NULL,
  send_date      date NOT NULL,
  resend_email_id text,
  sent_at        timestamp with time zone DEFAULT now(),
  UNIQUE (email, send_type, send_date)
);

CREATE INDEX IF NOT EXISTS email_send_log_lookup_idx
  ON email_send_log (email, send_type, send_date);


-- ── 3. email_suppression ─────────────────────────────────────────────────────
--
-- Permanent suppression list. Every fan-out subscriber query in Inngest functions
-- will filter against this table.
--
-- reason values: bounce_permanent, complaint, unsubscribe, manual
-- metadata (nullable jsonb): stores Resend bounce subtype, feedback type, etc.
--
CREATE TABLE IF NOT EXISTS email_suppression (
  email          text PRIMARY KEY,
  reason         text NOT NULL,
  suppressed_at  timestamp with time zone DEFAULT now(),
  metadata       jsonb
);


-- ── 4. daily_archetype_cache — new per-section content columns ───────────────
--
-- The existing `insight` column is NOT touched — it remains in place.
-- New columns are nullable; existing rows correctly have NULL here.
-- Phase 3 will populate them with fresh per-section content going forward.
--
ALTER TABLE daily_archetype_cache
  ADD COLUMN IF NOT EXISTS love        text,
  ADD COLUMN IF NOT EXISTS work        text,
  ADD COLUMN IF NOT EXISTS health      text,
  ADD COLUMN IF NOT EXISTS reflection  text;
