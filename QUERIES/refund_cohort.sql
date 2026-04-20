-- =============================================================================
-- OMENORA — Weekly Refund / Chargeback Cohort Table
-- =============================================================================
-- Purpose: Produces a week-by-week revenue and refund/chargeback summary from
--          Supabase data. Run against the Supabase Postgres instance.
--
-- Prerequisites:
--   • A `purchases` or `reports` table with at least:
--       session_id, email, amount_cents, currency, created_at
--   • A `refunds` table populated from B-4 data (see NOTE below).
--   • A `chargebacks` table populated from B-4 data (see NOTE below).
--
-- ⚠️  B-4 NOTE — Railway logs only (no Supabase write):
--   B-4 currently writes chargeback and refund events to Railway logs ONLY
--   using console.warn('[B-4] chargeback', {...}) and console.warn('[B-4] refund', {...}).
--   These events are NOT stored in Supabase.
--
--   To run this query, you must first export the [B-4] log entries from Railway:
--     1. Go to Railway dashboard → your service → Logs
--     2. Filter by:  [B-4]
--     3. Export as JSON or copy the relevant lines
--     4. Parse the JSON payloads and INSERT into the staging tables below:
--          refund_events_staging(charge_id, refund_amount_cents, currency, archetype, region, language, timestamp)
--          chargeback_events_staging(dispute_id, charge_id, amount_cents, currency, reason, archetype, region, language, timestamp)
--     5. Run this query against Supabase after the staging tables are populated.
--
-- Until B-4 is updated to write directly to Supabase, refund_count,
-- refund_rate_pct, chargeback_count, and chargeback_rate_pct will show 0
-- unless staging tables are populated from the Railway log export.
-- =============================================================================

-- ── Staging table definitions (create once, then populate from Railway logs) ─

CREATE TABLE IF NOT EXISTS refund_events_staging (
    id               SERIAL PRIMARY KEY,
    charge_id        TEXT,
    refund_amount_cents BIGINT,
    currency         TEXT,
    archetype        TEXT,
    region           TEXT,
    language         TEXT,
    "timestamp"      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chargeback_events_staging (
    id               SERIAL PRIMARY KEY,
    dispute_id       TEXT UNIQUE,
    charge_id        TEXT,
    amount_cents     BIGINT,
    currency         TEXT,
    reason           TEXT,
    archetype        TEXT,
    region           TEXT,
    language         TEXT,
    "timestamp"      TIMESTAMPTZ
);

-- ── Main cohort query ─────────────────────────────────────────────────────────

WITH

-- Cohort: all purchases (one row per session_id) bucketed by ISO week
purchases_weekly AS (
    SELECT
        date_trunc('week', created_at)::date        AS week_of_purchase,
        COUNT(*)                                     AS purchase_count,
        SUM(amount_cents)                            AS gross_revenue_cents
    FROM reports
    WHERE amount_cents IS NOT NULL
      AND created_at IS NOT NULL
    GROUP BY 1
),

-- Refunds bucketed by the timestamp of the refund event (not purchase week)
refunds_weekly AS (
    SELECT
        date_trunc('week', "timestamp")::date        AS week_of_purchase,
        COUNT(*)                                     AS refund_count,
        SUM(refund_amount_cents)                     AS refund_amount_cents
    FROM refund_events_staging
    GROUP BY 1
),

-- Chargebacks bucketed by the timestamp of the dispute event
chargebacks_weekly AS (
    SELECT
        date_trunc('week', "timestamp")::date        AS week_of_purchase,
        COUNT(*)                                     AS chargeback_count,
        SUM(amount_cents)                            AS chargeback_amount_cents
    FROM chargeback_events_staging
    GROUP BY 1
),

-- Full week spine: all weeks present in any of the three sources
weeks AS (
    SELECT week_of_purchase FROM purchases_weekly
    UNION
    SELECT week_of_purchase FROM refunds_weekly
    UNION
    SELECT week_of_purchase FROM chargebacks_weekly
)

SELECT
    w.week_of_purchase,

    -- Revenue
    COALESCE(p.gross_revenue_cents, 0) / 100.0                                  AS gross_revenue,
    COALESCE(p.purchase_count, 0)                                                AS purchase_count,

    -- Refunds
    COALESCE(r.refund_count, 0)                                                  AS refund_count,
    CASE
        WHEN COALESCE(p.purchase_count, 0) = 0 THEN 0
        ELSE ROUND(
            COALESCE(r.refund_count, 0)::numeric / p.purchase_count * 100, 2
        )
    END                                                                          AS refund_rate_pct,

    -- Chargebacks
    COALESCE(cb.chargeback_count, 0)                                             AS chargeback_count,
    CASE
        WHEN COALESCE(p.purchase_count, 0) = 0 THEN 0
        ELSE ROUND(
            COALESCE(cb.chargeback_count, 0)::numeric / p.purchase_count * 100, 2
        )
    END                                                                          AS chargeback_rate_pct,

    -- Net revenue (gross minus refund amounts — chargebacks net out separately)
    (
        COALESCE(p.gross_revenue_cents, 0)
        - COALESCE(r.refund_amount_cents, 0)
        - COALESCE(cb.chargeback_amount_cents, 0)
    ) / 100.0                                                                    AS net_revenue

FROM weeks w
LEFT JOIN purchases_weekly  p  ON p.week_of_purchase  = w.week_of_purchase
LEFT JOIN refunds_weekly     r  ON r.week_of_purchase  = w.week_of_purchase
LEFT JOIN chargebacks_weekly cb ON cb.week_of_purchase = w.week_of_purchase

ORDER BY w.week_of_purchase DESC;

-- =============================================================================
-- Railway log filter string (for manual export step):
--
--   Filter:  [B-4]
--   This matches both:
--     console.warn('[B-4] chargeback', {...})
--     console.warn('[B-4] refund', {...})
--
--   Each log line is JSON-structured. Fields to extract per event type:
--
--   Refund log fields → refund_events_staging columns:
--     charge_id, refund_amount_cents, currency, archetype, region, language, timestamp
--
--   Chargeback log fields → chargeback_events_staging columns:
--     dispute_id, charge_id, amount_cents, currency, reason, archetype, region, language, timestamp
--
-- Recommended: update B-4 in webhook.post.ts to INSERT directly into
-- chargeback_events_staging and refund_events_staging so this manual step
-- is eliminated. Add to IMPROVEMENT_PLAN.md as B-4b.
-- =============================================================================
