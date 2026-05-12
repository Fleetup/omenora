# Sentry EAS Environment Variable Setup

**Status:** Miki-runnable — apply when ready before first TestFlight/production EAS Build.

---

## Context

This runbook documents the EAS environment variables that must be provisioned before
EAS Builds for `preview` and `production` profiles can:

1. Bundle `EXPO_PUBLIC_SENTRY_DSN` into the app so Sentry initialises at runtime.
2. Upload source maps to the Sentry project during the EAS Build for symbolication.

**Local dev builds** (`npx expo run:ios --device`) do NOT use these EAS env vars.
For local dev, add `EXPO_PUBLIC_SENTRY_DSN` directly to `mobile-app/.env` (gitignored).
`SENTRY_AUTH_TOKEN` is not needed for local dev — source map upload only runs during
EAS Builds.

Secret values are in Miki's password manager (provisioned during Sentry org setup,
2026-05-12):
- **Mobile DSN**: from `unc-development.sentry.io` → Projects → `omenora-mobile` → Client Keys
- **Org auth token**: token name `omenora-eas-sourcemaps` in Miki's password manager

---

## Commands

Run from `mobile-app/` directory (`cd mobile-app` first).

### EXPO_PUBLIC_SENTRY_DSN — production

```bash
eas env:create \
  --scope project \
  --environment production \
  --name EXPO_PUBLIC_SENTRY_DSN \
  --type string \
  --value '<paste mobile DSN from password manager>'
```

### EXPO_PUBLIC_SENTRY_DSN — preview

```bash
eas env:create \
  --scope project \
  --environment preview \
  --name EXPO_PUBLIC_SENTRY_DSN \
  --type string \
  --value '<paste mobile DSN from password manager>'
```

### SENTRY_AUTH_TOKEN — production

```bash
eas env:create \
  --scope project \
  --environment production \
  --name SENTRY_AUTH_TOKEN \
  --type string \
  --visibility sensitive \
  --value '<paste org auth token from password manager>'
```

### SENTRY_AUTH_TOKEN — preview

```bash
eas env:create \
  --scope project \
  --environment preview \
  --name SENTRY_AUTH_TOKEN \
  --type string \
  --visibility sensitive \
  --value '<paste org auth token from password manager>'
```

---

## Verification

After running all four commands, confirm both environments have both variables:

```bash
eas env:list --scope project --environment production
eas env:list --scope project --environment preview
```

Expected for each environment:
- `EXPO_PUBLIC_SENTRY_DSN` — visible (plaintext, public DSN)
- `SENTRY_AUTH_TOKEN` — masked as sensitive

---

## Timing

Run these commands any time before the first `eas build --profile preview` or
`eas build --profile production`. Not required for `npx expo run:ios --device`
local dev builds.

Recommended: run immediately after verifying the Sentry integration works on a local
dev build (throw a test error, confirm event appears in `omenora-mobile` Sentry project).

---

## Notes

- Both profiles in `eas.json` already reference these vars via the `"$VAR"` syntax
  in the `env` block. Once created in EAS, they will be injected automatically.
- The DSN is the same value for both `preview` and `production` — both profiles
  route to the single `omenora-mobile` Sentry project.
- `SENTRY_AUTH_TOKEN` is the same org-scoped token used by the backend
  (`augur/.env.example` → `SENTRY_AUTH_TOKEN`). One token, two services.
