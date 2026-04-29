# Omenora Cron Schedule

Railway cron jobs are configured in the **Railway dashboard UI** (not in `railway.json`).

## Job Schedule

| Job | Endpoint | Schedule | Purpose |
|-----|----------|----------|---------|
| Daily Zodiac | `POST /api/generate-daily-horoscope` | `0 5 * * *` | Generate 12 zodiac signs at 5am UTC |
| Daily Archetypes | `POST /api/generate-daily-cache` | `0 6 * * *` | Generate 12 archetypes at 6am UTC |
| Send Insights | `POST /api/process-daily-insights` | `*/5 * * * *` | Send subscriber emails every 5 min |
| Weekly Transits | `POST /api/cron/send-weekly-transits` | `0 8 * * 1` | Monday 8am UTC compat emails |

All cron jobs require the header:
```
x-job-secret: <NUXT_EMAIL_JOB_SECRET value>
```

## Health Check

```
GET /api/cron/health
```

Returns `200` when both archetype and zodiac caches have all 12 rows for today.
Returns `503` when generation is still in progress or failed.

Monitor this endpoint with UptimeRobot, Better Uptime, or Railway's own healthcheck.

## Manual Trigger

Force-trigger generation without touching the Railway dashboard:

```bash
curl -X POST https://omenora.com/api/cron/trigger \
  -H "x-cron-secret: <CRON_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"target":"both"}'
```

| `target` value | Effect |
|---|---|
| `"both"` | Triggers archetypes + zodiac (default) |
| `"archetypes"` | Triggers only `/api/generate-daily-cache` |
| `"zodiac"` | Triggers only `/api/generate-daily-horoscope` |

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `NUXT_EMAIL_JOB_SECRET` | Shared secret for all Railway cron job headers |
| `NUXT_CRON_SECRET` | Separate secret for the manual trigger endpoint |

Generate `CRON_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Architecture Notes

- **Jobs are fully decoupled.** The archetype job (`generate-daily-cache`) does NOT
  call the zodiac job internally. Each runs independently on its own cron schedule.
- **`get-daily-cache` requires 12/12 rows** before serving today's data. If today is
  still being generated, it falls back to yesterday's complete cache automatically.
- **`process-daily-insights` reads from cache**, not live Claude calls. If a subscriber's
  archetype cache row is missing, they are skipped and picked up in the next 5-min cycle.
