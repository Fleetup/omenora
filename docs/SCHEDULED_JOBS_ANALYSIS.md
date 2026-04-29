# OMENORA — Scheduled Jobs & Subscriber Email System
## Comprehensive Analysis Document
_Last updated: 2026-04-29_

---

## 1. Overview

OMENORA has **three distinct email pipelines** running on different cadences:

| Pipeline | Audience | Cadence | Trigger |
|---|---|---|---|
| **Abandonment Sequence** | Non-purchasers who submitted email | 4-step async queue | `capture-email` → Railway cron every 2 min |
| **Daily Insights** | Active `daily_horoscope` + `compatibility_plus` subscribers | Daily AM | Railway cron chain |
| **Weekly Relationship Weather** | Active `compatibility_plus` subscribers only | Every Monday 8:00 AM UTC | Railway cron |

---

## 2. Database Tables Involved

| Table | Purpose |
|---|---|
| `email_captures` | Abandonment funnel leads (pre-purchase) |
| `email_jobs` | Supabase-backed job queue for abandonment sequence |
| `subscribers` | Paid active subscribers (`active`, `plan_type`) |
| `daily_insight_logs` | Idempotency log — one row per (subscriber_email, sent_date) |
| `daily_archetype_cache` | Pre-generated daily insight content per archetype |
| `daily_zodiac_cache` | Pre-generated daily horoscope content per zodiac sign |
| `reports` | Compatibility readings used by weekly transit |

**Subscriber `plan_type` values:**
- `daily_horoscope` — archetype subscription (daily emails)
- `compatibility_plus` — compatibility subscription (daily emails + weekly transit)

---

## 3. Pipeline A — Abandonment Email Sequence

### 3.1 Trigger (User enters email at paywall)
**File:** `server/api/capture-email.post.ts`

- Inserts/updates row in `email_captures` (never overwrites `sequence_completed` or `purchased` flags on existing rows)
- Immediately calls `scheduleEmailJob(email, step=1, delay=10min)` — fire-and-forget

### 3.2 Job Queue Utility
**File:** `server/utils/email-jobs.ts`

**Delay schedule:**
| Step | Delay |
|---|---|
| 1 | 10 minutes |
| 2 | 3 hours |
| 3 | 24 hours |
| 4 | 47 hours |

- `scheduleEmailJob()` — inserts into `email_jobs` with `run_at = now + delay`; idempotent (skips if pending/processing row already exists for `(email, step)`)
- `cancelEmailJobs()` — marks all `pending` jobs for an email as `done`

### 3.3 Worker (Railway cron every 2 minutes)
**File:** `server/api/email-sequence/process-jobs.post.ts`

- Fetches up to 20 `pending` jobs where `run_at <= now`
- **Optimistic lock:** flips `status = processing` before work (prevents duplicate sends on overlapping cron runs)
- **Suppression check:** looks up `email_captures` row — skips if `purchased = true` OR `sequence_completed = true`
- Sends via Resend using template from `getEmailTemplate(step, ...)`
- On success:
  - Marks job `done`
  - Updates `email_captures.sequence_step` and `sequence_completed` (true at step 4)
  - **At step 4:** deletes report from `reports` table (by `session_id`) — removes unredeemed data
  - Schedules next step via `scheduleEmailJob()`
- On failure: retries up to 3 attempts with 5-min back-off; marks `failed` after 3

### 3.4 Manual Trigger
**File:** `server/api/email-sequence/trigger.post.ts`

- Auth-protected (`x-job-secret`)
- Enqueues a specific step for a specific email — used internally

### 3.5 Suppression
**Files:** `server/api/suppress-abandon-sequence.post.ts`, `server/api/unsubscribe.get.ts`

- `suppress-abandon-sequence` — sets `sequence_completed = true` + calls `cancelEmailJobs()` (used on purchase)
- `unsubscribe.get` — sets `sequence_completed = true` + `cancelEmailJobs()` + sets `subscribers.active = false`

> **⚠️ ISSUE FOUND — A:** The webhook (`stripe/webhook.post.ts`) does **not** call `suppress-abandon-sequence` or `cancelEmailJobs` after a confirmed purchase. This means abandonment emails can still fire after someone has paid.

---

## 4. Pipeline B — Daily Insight Emails

### 4.1 Step 1: Generate Archetype Cache (Railway cron — 6:00 AM UTC daily)
**File:** `server/api/generate-daily-cache.post.ts`

- Auth: `x-job-secret`
- **Returns immediately** (`setImmediate`) — background processing so Railway doesn't kill it on HTTP timeout
- Loops through all 12 archetypes: `phoenix, architect, storm, lighthouse, wanderer, alchemist, guardian, visionary, mirror, catalyst, sage, wildfire`
- For each archetype, calls `/api/generate-daily-insight` (Claude `claude-sonnet-4-6`, max_tokens 800)
- Upserts into `daily_archetype_cache(archetype, cache_date, language)` — idempotent
- **Retry logic:** after first pass, re-checks DB for missing archetypes, retries up to 3×2s per archetype
- Accepts optional `targetDate` and `language` body params

### 4.2 Step 2: Generate Zodiac Cache (Railway cron — 5:00 AM UTC daily)
**File:** `server/api/generate-daily-horoscope.post.ts`

- Auth: `x-job-secret`
- **Returns immediately** (`setImmediate`) — same pattern
- Loops through 12 zodiac signs: Aries … Pisces
- For each sign, calls Claude (`claude-sonnet-4-6`, max_tokens 800) with real planetary transit data
- Upserts into `daily_zodiac_cache(zodiac_sign, cache_date, language)` — idempotent
- **Retry logic:** same 3-attempt retry pattern as archetype cache
- ⚠️ The zodiac cache is generated but **never actually consumed for subscriber emails** — it's only used by the app's UI horoscope page. There is no cron job that sends zodiac emails to subscribers.

### 4.3 Step 3: Send Daily Insights to Subscribers (Railway cron — every 5 minutes)
**File:** `server/api/process-daily-insights.post.ts`

- Auth: `x-job-secret`
- Batch size: **20 subscribers per cron run**
- Fetches `daily_archetype_cache` for today (all 12 archetypes) once
- Fetches `daily_insight_logs.sent_date = today` to build exclusion set
- Fetches up to 20 active subscribers (`.eq('active', true)`) **without filtering by plan_type**
- For each subscriber not yet sent today:
  - Skips with `cacheNotReady` if archetype not in cache yet
  - Builds insight object from cache row (same `insight` field for love/work/health)
  - Calls `/api/send-daily-insight` (Resend)
  - Upserts into `daily_insight_logs` for idempotency
- Returns `{ success, sent, skipped, failed, cacheNotReady }`

> **⚠️ ISSUE FOUND — B1:** `process-daily-insights` queries subscribers with `.eq('active', true)` but **no `.limit()` on the exclusion set** — `sentToday` fetches ALL logs for today with no limit. As subscriber count grows, this becomes a full-table scan on `daily_insight_logs`.

> **⚠️ ISSUE FOUND — B2:** The subscriber fetch uses `.limit(BATCH_SIZE)` (20) on `subscribers` but does **not apply cursor/pagination**. Every 5-minute run re-fetches the same top-20 subscribers (alphabetical by email). Subscribers deeper in the list are **never reached** unless all earlier ones are already in `alreadySentEmails`. This means only the first 20 (alphabetically) ever get daily emails.

> **⚠️ ISSUE FOUND — B3:** `love`, `work`, and `health` sections in the email all receive the **same `cached.insight` string** — there are no separate per-section values in `daily_archetype_cache`. The email template renders three identically-worded sections.

### 4.4 Send Worker
**File:** `server/api/send-daily-insight.post.ts`

- Auth: `x-job-secret`
- Builds HTML email (Georgia/serif, OMENORA branding)
- Sections: Greeting, LOVE, WORK, HEALTH, Reflection Question
- Unsubscribe link uses HMAC-SHA256 token (timing-safe comparison)
- Mental health disclaimer included in footer
- From: `reading@omenora.com`, Reply-To: `support@omenora.com`

### 4.5 Welcome Insight (on Subscription Purchase)
**File:** `server/api/stripe/webhook.post.ts` (lines 306–347)

- Triggered inline on `checkout.session.completed` for `type = 'subscription'` or `type = 'compatibility' + tier = 'subscription'`
- Calls `/api/generate-daily-insight` then `/api/send-daily-insight` synchronously in the webhook handler
- Non-blocking (`try/catch` — never fails the webhook)
- Guards: requires `jobSecret`, `isValidEmail`, `isValidArchetype`

> **⚠️ ISSUE FOUND — B4:** Welcome insight is generated live via Claude inside the Stripe webhook handler (synchronously). If Claude is slow or rate-limited, the Stripe webhook response could time out (Stripe requires a 200 within 30 seconds). This is partially mitigated by the `withAiRetry` wrapper but is still a latency risk.

---

## 5. Pipeline C — Weekly Relationship Weather (Compatibility Plus)

### 5.1 Orchestrator (Railway cron — every Monday 8:00 AM UTC)
**File:** `server/api/cron/send-weekly-transits.post.ts`

- Auth: `x-job-secret`
- Fetches all subscribers where `active = true AND plan_type = 'compatibility_plus'`
- Processes **sequentially** with a **2-second delay** between each subscriber
- For each subscriber, calls `/api/generate-weekly-transit`
- Counts: `processed`, `failed`, `skipped` (no compatibility reading)
- Returns counts summary

> **⚠️ ISSUE FOUND — C1:** Sequential processing with 2s delays means at **N subscribers × ~(Claude time + 2s)** per person. At even 50 subscribers, this could take 3–5+ minutes. If Railway's HTTP timeout is less than this, the cron request is killed mid-batch and some subscribers are silently skipped with no retry.

> **⚠️ ISSUE FOUND — C2:** There is no deduplication / idempotency guard on weekly transits. If the cron is called twice in the same week (e.g., Railway retry on timeout), subscribers receive duplicate emails.

### 5.2 Generator + Sender
**File:** `server/api/generate-weekly-transit.post.ts`

- Auth: `x-job-secret`
- Computes current Monday–Sunday week window
- Fetches planetary transits for week start and end
- Fetches subscriber's most recent `compatibility` report from `reports` table
- If no report found → returns `{ success: false, reason: 'no_compatibility_reading' }` (caller counts as `skipped`)
- Calls Claude (`claude-sonnet-4-6`, max_tokens 1200) to generate: `connection`, `communication`, `tension`, `advice`, `weekTheme`
- Validates with Zod (`WeeklyTransitSchema`)
- Calls `/api/send-weekly-transit` with results

### 5.3 Email Sender
**File:** `server/api/send-weekly-transit.post.ts`

- Auth: `x-job-secret`
- Builds HTML email: CONNECTION, COMMUNICATION, TENSION, ADVICE sections
- Week range formatted as `"Apr 28 – May 4"` in header
- Footer: compatibility title, partner sun sign reference, unsubscribe link
- From: `reading@omenora.com`, Reply-To: `support@omenora.com`
- Subject: `"Your relationship weather for {weekLabel}"`

---

## 6. Subscriber Lifecycle

```
User enters email (capture-email)
        │
        └── Abandonment sequence starts (step 1 @ 10min)
                Steps 2, 3, 4 auto-schedule on success
                        │
                        ├── User purchases one-time report
                        │     └── suppress-abandon-sequence called? ⚠️ NOT from webhook
                        │
                        └── User subscribes (stripe checkout)
                              │
                              ├── webhook saves to `subscribers` table
                              ├── Welcome insight sent inline
                              └── User added to daily/weekly cron batches

Active subscriber
    ├── daily_horoscope plan → daily insight emails
    └── compatibility_plus plan → daily insight emails + weekly transit

Unsubscribe (GET /api/unsubscribe)
    ├── email_captures.sequence_completed = true
    ├── cancelEmailJobs() → email_jobs pending → done
    └── subscribers.active = false

Subscription cancelled / payment failed (Stripe webhook)
    └── subscribers.active = false (deactivated)
```

---

## 7. Authentication / Security

All job endpoints share a single secret: `NUXT_EMAIL_JOB_SECRET` (`config.emailJobSecret`).

| Header | Used By |
|---|---|
| `x-job-secret` | All cron endpoints + internal callers |
| `x-cron-secret` | `/api/cron/trigger` (manual cache trigger) |
| `x-health-secret` | `/api/health` authenticated diagnostics |

- Unsubscribe links use HMAC-SHA256 tokens (first 32 hex chars) — timing-safe comparison

---

## 8. Monitoring / Health

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | App-level health (Supabase, Stripe, Anthropic, Resend key checks) |
| `GET /api/cron/health` | Cache readiness — returns 503 if `daily_archetype_cache` or `daily_zodiac_cache` < 12 rows today |
| `POST /api/cron/trigger` | Manual force-run cache generation for `archetypes`, `zodiac`, or `both` |

`railway.json` sets `healthcheckPath = /api/health` with 300s timeout.

---

## 9. Issues Summary

| # | Severity | Pipeline | Issue |
|---|---|---|---|
| A | **HIGH** | Abandonment | Stripe webhook does not suppress abandonment emails after purchase — buyers continue to receive abandonment sequence |
| B1 | **MEDIUM** | Daily Insights | `sentToday` fetched with no row limit — full table scan as logs grow |
| B2 | **HIGH** | Daily Insights | Subscriber query uses `.limit(20)` without cursor pagination — only first 20 subscribers alphabetically ever receive emails |
| B3 | **LOW** | Daily Insights | `love`, `work`, `health` email sections all show the same text (no per-section cache columns) |
| B4 | **MEDIUM** | Daily Insights | Welcome insight generated synchronously in Stripe webhook via Claude — Stripe 30s timeout risk |
| C1 | **HIGH** | Weekly Transit | Sequential 2s-delay processing in a single HTTP request — will time out with even moderate subscriber counts |
| C2 | **MEDIUM** | Weekly Transit | No weekly deduplication guard — duplicate emails sent if cron fires twice |

---

## 10. Railway Cron Schedule Reference

| Endpoint | Schedule | Secret Header |
|---|---|---|
| `POST /api/generate-daily-horoscope` | `0 5 * * *` (5:00 AM UTC) | `x-job-secret` |
| `POST /api/generate-daily-cache` | `0 6 * * *` (6:00 AM UTC) | `x-job-secret` |
| `POST /api/process-daily-insights` | `*/5 * * * *` (every 5 min) | `x-job-secret` |
| `POST /api/email-sequence/process-jobs` | `*/2 * * * *` (every 2 min) | `x-job-secret` |
| `POST /api/cron/send-weekly-transits` | `0 8 * * 1` (Mon 8:00 AM UTC) | `x-job-secret` |

> **Note:** Cron schedules are configured via the Railway dashboard, not in `railway.json`.
