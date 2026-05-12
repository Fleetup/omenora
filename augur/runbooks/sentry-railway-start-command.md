# Runbook: Sentry Railway Start Command

**Status:** Deferred — apply at one-shot promotion (after Phase 6.6 + 4D–4G + Phase 7 prep)

---

## Why

`@sentry/nuxt` server-side initialisation requires the Node.js `--import` flag to load
`sentry.server.config.mjs` before any application code runs. Without this flag the
server SDK is never initialised and backend errors are not captured in Sentry.

The built file is emitted by `nuxt build` at:
`.output/server/sentry.server.config.mjs`

---

## Action Required

In the Railway dashboard for the **omenora** backend service:

1. Navigate to **Service Settings → Deploy → Custom Start Command**.
2. Replace the current start command (or set it if absent) with:

```
node --import ./.output/server/sentry.server.config.mjs .output/server/index.mjs
```

3. Save and redeploy.

---

## Verification

After the service redeploys with the new start command:

1. Trigger a deliberate 5xx error (e.g. call an API endpoint with an invalid payload
   that causes an unhandled server error, or temporarily misconfigure an env var).
2. Confirm the error appears in the **omenora-backend** Sentry project within 30 seconds.
3. Confirm the error event has the correct `environment` tag (`production`).

---

## Timing

Apply this change at the same deployment window as the one-shot promotion of:
- Phase 6.6 clusters (6.6.1a + 6.6.1b + 6.6.2 through 6.6.7)
- Phase 4D–4G hardening
- Phase 7 production preparation

Do NOT apply in isolation before all clusters are on `main`. The Sentry SDK is
inactive until `SENTRY_DSN` is set in Railway environment variables regardless of
start command — but the start command must be updated before production DSN is set.
