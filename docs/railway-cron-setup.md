# Railway Cron Job Setup

Railway cron jobs must be configured via the Railway dashboard.
They cannot be defined in `railway.json` (which only supports build/deploy config).

---

## Existing Cron Jobs

### Daily Insight Processor
Sends personalised daily horoscope emails to all active subscribers.

| Field    | Value |
|----------|-------|
| Schedule | `*/5 * * * *` (every 5 minutes) |
| Method   | `POST` |
| URL      | `https://omenora.com/api/process-daily-insights` |
| Header   | `x-job-secret: <NUXT_EMAIL_JOB_SECRET>` |

---

## New Cron Job: Weekly Relationship Weather

Sends weekly relationship weather emails to all active **Compatibility Plus** subscribers every Monday morning.

### Setup Steps

1. Go to [Railway Dashboard](https://railway.app) → your project → **New Service** → **Cron**
2. Configure as follows:

| Field    | Value |
|----------|-------|
| Schedule | `0 8 * * 1` |
| Method   | `POST` |
| URL      | `https://omenora.com/api/cron/send-weekly-transits` |
| Header   | `x-job-secret: <NUXT_EMAIL_JOB_SECRET>` |

### Schedule Explanation

`0 8 * * 1` = At 08:00 UTC every Monday.

### Header

The `x-job-secret` value must match the `NUXT_EMAIL_JOB_SECRET` environment variable set in your Railway service.

### Expected Response

```json
{ "processed": 12, "failed": 0, "skipped": 3 }
```

- **processed** — transit generated and email sent successfully
- **failed** — unhandled error (logged in Railway service logs)
- **skipped** — subscriber has no compatibility reading on file yet (email withheld until they complete one)

### Notes

- Subscribers are processed **sequentially** with a 2-second delay between each to respect Anthropic and Resend rate limits.
- If a subscriber fails, the error is logged and processing continues for the remaining subscribers.
- Only subscribers with `active = true` AND `plan_type = 'compatibility_plus'` are included.
