# OMENORA Mobile App — Monetization Decisions

**Status:** LOCKED v2 | May 6, 2026 | Owner: Miki Jokovic, UNC Development LLC

---

## Pricing Model

| SKU | Price |
|---|---|
| Monthly subscription | $14.99/month |
| Annual subscription | $99.99/year |
| Trial | NONE — hard paywall |
| 2026 Lucky Timing Calendar IAP | $4.99 one-time |

---

## Free Tier (Mobile)

- Sun-sign daily horoscope
- Big-three reveal (sun / moon / rising)
- Archetype name only (no full reading)
- Basic compatibility (sun-sign only)

---

## Premium Tier (Subscription Required)

- Full archetype reading
- Full natal chart
- Deep compatibility
- Transits & forecasts
- Counsel (AI chat) — listed as sub-feature, NOT headline

---

## IAP Rules

- **Allowed:** 2026 Lucky Timing Calendar ($4.99, time-bound, expires Dec 31 2026)
- **Not allowed:** Core readings (archetype, natal chart, compatibility) as one-time SKUs
- **Not allowed:** Multi-tier subscriptions, lifetime purchase, per-minute Counsel

---

## Web App — Unchanged

| SKU | Price | Type |
|---|---|---|
| Basic Report | $4.99 | One-time |
| Popular Bundle (Report + Calendar) | $9.99 | One-time |
| Oracle Bundle (everything) | $24.99 | One-time |
| Compatibility Single | $9.99 | One-time |
| Compatibility + Charts | $14.99 | One-time |
| Calendar (upsell) | $4.99 | One-time |
| Birth Chart (upsell) | $4.99 | One-time |
| Tradition Switch | $2.99 ea | One-time |
| Daily Horoscope | $6.99/month | Recurring (Stripe) |

Web flows: Stripe. Mobile flows: Apple/Google IAP via RevenueCat. No cross-linking allowed inside app.

---

## Rejected — Do Not Re-Propose

| Idea | Status |
|---|---|
| Multi-tier subscription | Rejected |
| $4.99 / $6.99 / $9.99 monthly | Rejected |
| 3-day or 7-day trial | Rejected |
| Daily Horoscope as separate mobile subscription | Rejected |
| Core readings as one-time IAP on mobile | Rejected |
| Counsel as headline differentiator | Rejected |
| Per-minute / pay-per-message Counsel | Rejected |
| Lifetime purchase | Rejected |

---

## A/B Tests — v1.2 (6-8 Weeks Post-Launch)

| Test | Control | Variants |
|---|---|---|
| Trial vs No Trial | Hard paywall | A: 3-day trial · B: 7-day trial |
| Annual Pricing | $99.99/yr | A: $107.99/yr · B: $119.99/yr |
| Free Tier Scope | Sun-sign + big-three + archetype name | Full archetype reading in free tier |
| Counsel Positioning | Supporting feature | Headline differentiator |

**Metric for all tests:** 30-day net revenue per install.

---

## Next Phase — Mechanism Decisions (Step 4)

- [ ] Paywall placement (which screens, at which point in user journey)
- [ ] Onboarding flow (3 required + 4 optional progressive disclosure)
- [ ] RevenueCat product configuration (App Store Connect + Google Play Console)
- [ ] Remove existing Stripe-in-Safari mobile flow (Apple guideline 3.1.1 violation)
- [ ] Compliance flows (Counsel disclosures, crisis resources, entertainment disclaimers)
- [ ] App Store Connect listing assets (screenshots, metadata, preview video)
- [ ] Apple Small Business Program enrollment (15% commission)
- [ ] Google Play Console ID verification (start in parallel — 2-7 days)


# RevenueCat — Locked Decisions (v1)

**Status:** LOCKED | May 6, 2026

---

## Core Decisions

| Element | Decision |
|---|---|
| Subscription manager | RevenueCat Pro plan from day 1 |
| Paywall rendering | RevenueCat Paywalls (server-driven, dashboard-editable) |
| Paywall variants at launch | 3: `paywall_onboarding`, `paywall_feature_gate`, `paywall_counsel` |
| Placements at launch | 7: `onboarding_end` + 6 feature gates |
| Targeting Rules at launch | 1 — `default` rule only |
| Custom attributes (launch) | `primary_goal`, `archetype`, `sun_sign`, `is_returning_user` |
| Backend entitlement gating | Webhook-driven Supabase cache (NOT RC REST API per request) |
| Report regeneration | Per-feature monthly caps (allow regen within cap) |
| Counsel daily cap | 30 messages/day |
| Calendar for subscribers | Free (included in `premium` entitlement) |
| Calendar for non-subscribers | $4.99 one-time IAP (`calendar_2026` entitlement) |
| Web ↔ mobile entitlement sharing | NO — separate products in v1 |
| Mid-session cancellation | Soft enforcement — finish current request, notify on next entry |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          OMENORA Mobile App                         │
│                       (Expo / React Native)                         │
│                                                                     │
│  ┌─────────────────────┐    ┌────────────────────────────────────┐  │
│  │  RevenueCat SDK     │    │  PurchasesProvider (React context) │  │
│  │  (purchases +       │◄──►│  - currentOffering                 │  │
│  │   purchases-ui)     │    │  - customerInfo                    │  │
│  └─────────────────────┘    │  - isPremium                       │  │
│           ▲                 │  - presentPaywall()                │  │
│           │                 └────────────────────────────────────┘  │
│           │                            ▲                            │
└───────────┼────────────────────────────┼────────────────────────────┘
            │                            │
            │ purchase                   │ HTTP w/ Supabase JWT
            │                            │
            ▼                            ▼
┌─────────────────────────┐  ┌──────────────────────────────────────┐
│  RevenueCat Backend     │  │   Railway Backend (Nuxt 3 API)       │
│  (source of truth)      │  │                                      │
│                         │  │  /api/reports/compatibility          │
│  ┌──────────────────┐   │  │  /api/reports/archetype              │
│  │ Paywalls         │   │  │  /api/counsel/message                │
│  │ (server-driven)  │   │  │  /api/revenuecat/webhook  ◄──── webhook
│  └──────────────────┘   │  │                                      │
│  ┌──────────────────┐   │  │  Each handler:                       │
│  │ Targeting Rules  │   │  │   1. Verify Supabase JWT             │
│  │ (custom attrs)   │   │  │   2. Read users.is_premium (Supabase)│
│  │                  │   │  │   3. Check feature_usage cap         │
│  │ Custom Variables │   │  │   4. Call Claude API                 │
│  │ Placements       │   │  │   5. Increment usage counter         │
│  └──────────────────┘   │  │   6. Return report                   │
│  ┌──────────────────┐   │  │                                      │
│  │ Webhooks         │───┼──┼──►                                   │
│  └──────────────────┘   │  └──────────────────┬───────────────────┘
└─────────────────────────┘                     │
                                                ▼
                                       ┌──────────────────┐
                                       │ Supabase         │
                                       │ - users          │
                                       │ - feature_usage  │
                                       │ - revenuecat_    │
                                       │   events         │
                                       └──────────────────┘
```

**Entitlement flow:**
1. RevenueCat = source of truth for billing
2. Supabase = source of truth for runtime decisions (~5ms reads)
3. Webhook = bridge (RC → Supabase sync on every event)
4. SDK `customerInfo` = client-side UX cache

---

## Placements

**v1 placements:**

| Placement ID | When triggered | Initial paywall assigned |
|---|---|---|
| `onboarding_end` | Onboarding complete, before first reading shown | `paywall_onboarding` |
| `feature_archetype` | User taps "Read full archetype" | `paywall_feature_gate` |
| `feature_compatibility` | User taps "Check compatibility" | `paywall_feature_gate` |
| `feature_counsel` | User taps Counsel chat tab/button | `paywall_counsel` |
| `feature_calendar` | User taps Lucky Timing Calendar | `paywall_calendar` |
| `feature_natal_chart` | User taps "Full natal chart" | `paywall_feature_gate` |
| `feature_forecast` | User taps "90-day forecast" | `paywall_feature_gate` |

```javascript
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

const result = await RevenueCatUI.presentPaywallIfNeeded({
  requiredEntitlementIdentifier: 'premium',
})
if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
  // proceed
}
```

---

## Custom Attributes

**Sent from app to RevenueCat:**

| Attribute | Values |
|---|---|
| `primary_goal` | `LOVE_RELATIONSHIP` / `COUNSEL_SEEKER` / `FUTURE_CURIOUS` / `SELF_DISCOVERY` / `GENERAL` |
| `archetype` | e.g. `the_seeker` |
| `sun_sign` | e.g. `scorpio` |
| `is_returning_user` | `'true'` / `'false'` (string) |

```javascript
await Purchases.setAttributes({
  primary_goal: 'LOVE_RELATIONSHIP',
  archetype: 'the_seeker',
  sun_sign: 'scorpio',
  is_returning_user: 'false',
})
```

**Targeting Rules — v1:** `default` only

**Targeting Rules — v1.1:**
- `country_tier_2` — IN, BR, MX, ID, PH → PPP pricing (~$7.99/mo)
- `goal_love` — `primary_goal=LOVE_RELATIONSHIP` → compatibility-emphasis paywall
- `goal_counsel` — `primary_goal=COUNSEL_SEEKER` → Counsel-headlined paywall
- `winback` — `is_returning_user=true` → 50% off first month
- `legacy_app_version` — fallback paywall for older app versions

---

## Custom Paywall Variables

| Variable | Example | Paywall usage |
|---|---|---|
| `user_archetype` | `"The Seeker"` | Headline: `{user_archetype}` |
| `user_first_name` | `"Sarah"` | Greeting: `{user_first_name}` |
| `trigger_feature` | `"compatibility"` | Subhead: `{trigger_feature}` |
| `gate_context` | `"deep_reading"` | Show/hide feature blocks |

```javascript
const result = await RevenueCatUI.presentPaywall({
  customVariables: {
    user_archetype: CustomVariableValue.string('The Seeker'),
    user_first_name: CustomVariableValue.string(user.firstName),
    trigger_feature: CustomVariableValue.string('compatibility'),
  },
})
```

**Dashboard paywall rules (no code change to update):**
- `customer.first_seen < 24h` → show "First-day welcome offer" block
- `!has_active_entitlement('premium') && has_purchased` → show win-back copy
- `package.intro_offer != null` → show intro offer CTA

---

## Paywall Variants (v1)

| Paywall | Placement(s) | Style | Headline | Plans |
|---|---|---|---|---|
| `paywall_onboarding` | `onboarding_end` | Full-screen | "Your archetype is **{user_archetype}**" | Annual (Best Value) + Monthly |
| `paywall_feature_gate` | `feature_archetype`, `feature_compatibility`, `feature_natal_chart`, `feature_forecast` | Modal/sheet | "Unlock {trigger_feature}" | Annual + Monthly |
| `paywall_counsel` | `feature_counsel` | Modal | "Ask Counsel anything about your chart" | Annual + Monthly |
| `paywall_calendar` | `feature_calendar` (non-subscribers only) | Modal | "Your 2026 Lucky Timing Calendar" | $4.99 IAP + Premium sub |

---

## Report Generation Flow

```
1. App: check customerInfo locally → isPremium === true
2. App: POST /api/reports/<feature> with Supabase JWT
3. Backend: verify JWT → get user_id
4. Backend: SELECT is_premium, premium_expires_at FROM users WHERE id = user_id
5. Backend: SELECT count FROM feature_usage WHERE user_id = ? AND feature = ? AND period = 'YYYY-MM'
6. is_premium AND count < cap  → call Claude API → save report → increment usage → return report
   !is_premium                 → 403 subscription_required
   cap exceeded                → 429 monthly_limit_reached + reset date
```

---

## Webhook Handler

**Endpoint:** `POST https://api.omenora.com/api/revenuecat/webhook`
**Auth:** `Authorization: Bearer <secret>`
**Rule:** Respond 200 OK within 2-3s — queue emails/analytics async

| Event | Action |
|---|---|
| `INITIAL_PURCHASE` | `is_premium = true`, set `premium_expires_at`, `premium_source`, `premium_product_id`, `revenuecat_user_id` |
| `RENEWAL` | Update `premium_expires_at` |
| `CANCELLATION` | Keep `is_premium = true` until `expires_at` |
| `EXPIRATION` | `is_premium = false` |
| `BILLING_ISSUE` | Keep `is_premium = true` (grace period) |
| `REFUND` / `PRODUCT_CHANGE` | Re-fetch from RC REST API, full state sync |

Idempotency: check `revenuecat_events.event_id` before processing.

---

## Supabase Schema

```sql
-- Existing users table additions
ALTER TABLE users ADD COLUMN IF NOT EXISTS revenuecat_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_source TEXT;
  -- one of: 'revenuecat_ios' | 'revenuecat_android' | 'stripe_web' | 'admin_grant'
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_product_id TEXT;
  -- e.g., 'omenora_monthly' | 'omenora_annual'
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_revenuecat_user_id ON users(revenuecat_user_id);
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium) WHERE is_premium = TRUE;

-- Feature usage tracking (for monthly caps)
CREATE TABLE IF NOT EXISTS feature_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
    -- one of: 'compatibility' | 'archetype' | 'counsel' | 'forecast' | 'natal_chart' | 'calendar'
  period TEXT NOT NULL,
    -- format: 'YYYY-MM' for monthly windows
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, feature, period)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_period ON feature_usage(user_id, period);

-- Webhook event log (for idempotency)
CREATE TABLE IF NOT EXISTS revenuecat_events (
  event_id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_revenuecat_events_app_user_id ON revenuecat_events(app_user_id);
CREATE INDEX IF NOT EXISTS idx_revenuecat_events_received_at ON revenuecat_events(received_at);
```

---

## Feature Usage Caps (v1)

| Feature | Cap | Cost/call | Worst-case/sub/month |
|---|---|---|---|
| Counsel | 30 messages/day | $0.05 | ~$45 |
| Compatibility | 10/month | $1.00 | $10 |
| 90-day forecast | 4/month | $1.50 | $6 |
| Archetype | 1/month | $1.50 | $1.50 |
| Natal chart | 1/month | $2.00 | $2 |

---

## Calendar IAP Logic

```javascript
async function openCalendar() {
  const customerInfo = await Purchases.getCustomerInfo()
  const hasPremium = customerInfo.entitlements.active['premium'] != null
  const hasCalendar = customerInfo.entitlements.active['calendar_2026'] != null

  if (hasPremium || hasCalendar) {
    navigation.navigate('Calendar')
  } else {
    await RevenueCatUI.presentPaywall({ /* paywall_calendar */ })
  }
}
```

**Entitlements:**
- `premium` — `omenora_monthly` + `omenora_annual` (includes Calendar)
- `calendar_2026` — `omenora_calendar_2026` IAP only

---

## RevenueCat Dashboard Checklist

**Project setup:**
- [ ] Create OMENORA project
- [ ] Connect Apple App Store (App Store Connect API key)
- [ ] Connect Google Play Console (service account key)
- [ ] Generate API keys for iOS and Android (these go in app `.env`)
- [ ] Generate Secret API key for backend (REST API access)
- [ ] Set up webhook integration with Authorization header secret

**Products (must match App Store Connect / Google Play Console product IDs exactly):**
- [ ] `omenora_monthly` — $14.99/month auto-renewable subscription
- [ ] `omenora_annual` — $99.99/year auto-renewable subscription
- [ ] `omenora_calendar_2026` — $4.99 non-consumable IAP

**Entitlements:**
- [ ] `premium` — granted by `omenora_monthly` and `omenora_annual`
- [ ] `calendar_2026` — granted by `omenora_calendar_2026` only

**Offerings:**
- [ ] `default` — contains `omenora_monthly` and `omenora_annual` packages
- [ ] `calendar_only` — contains `omenora_calendar_2026` package only

**Placements (custom IDs, defined in dashboard):**
- [ ] `onboarding_end`
- [ ] `feature_archetype`
- [ ] `feature_compatibility`
- [ ] `feature_counsel`
- [ ] `feature_calendar`
- [ ] `feature_natal_chart`
- [ ] `feature_forecast`

**Paywalls (built in Paywall Editor):**
- [ ] `paywall_onboarding` → assigned to `onboarding_end`
- [ ] `paywall_feature_gate` → assigned to `feature_archetype`, `feature_compatibility`, `feature_natal_chart`, `feature_forecast`
- [ ] `paywall_counsel` → assigned to `feature_counsel`
- [ ] `paywall_calendar` → assigned to `feature_calendar`

**Targeting Rules:**
- [ ] `default` rule serves default Offering and paywalls listed above

**Webhook:**
- [ ] Endpoint: `https://api.omenora.com/api/revenuecat/webhook`
- [ ] Authorization header: `Bearer <secret>` (matches Railway env var)
- [ ] Environment: Sandbox + Production
- [ ] Event types enabled: ALL (we filter in handler)

---

## Expo Setup

**Cannot test in Expo Go — EAS dev build required.**

**Packages:**
```bash
npx expo install expo-dev-client react-native-purchases react-native-purchases-ui
```

**SDK init (`app/_layout.tsx`):**
```javascript
import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

useEffect(() => {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE) // dev only
  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_APPLE_KEY })
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY })
  }
}, [])
```

**After Supabase auth:**
```javascript
const { data: { user } } = await supabase.auth.getUser()
await Purchases.logIn(user.id)
await Purchases.setAttributes({
  primary_goal: userProfile.primary_goal,
  archetype: userProfile.archetype,
  sun_sign: userProfile.sun_sign,
  is_returning_user: userProfile.has_churned ? 'true' : 'false',
})
```

**PurchasesProvider context (`context/PurchasesProvider.tsx`):**
```javascript
const PurchasesContext = createContext({
  customerInfo: null,
  isPremium: false,
  hasCalendar: false,
  currentOffering: null,
  presentPaywall: async () => {},
  refreshCustomerInfo: async () => {},
})
Purchases.addCustomerInfoUpdateListener((info) => setCustomerInfo(info))
```

---

## Implementation Phases (~32 hrs total)

| Phase | Deliverable | hrs |
|---|---|---|
| 1.1 | RC dashboard: project, products, entitlements, offerings, placements, paywalls, webhook | 2 |
| 1.2 | Install SDK, configure API keys, init in app entry, EAS dev build | 3 |
| 1.3 | PurchasesProvider context | 2 |
| 1.4 | Wire `presentPaywallIfNeeded` to all 7 gates; remove legacy `paymentComplete`/`bundlePurchased`/`oraclePurchased` flags | 4 |
| 1.5 | Webhook endpoint: auth, idempotency, Supabase sync, all event types | 4 |
| 1.6 | Backend report handlers: entitlement check + cap check + Claude call + usage increment (all 5 features) | 6 |
| 1.7 | Supabase migrations: users additions, feature_usage, revenuecat_events | 1 |
| 1.8 | Test Store testing on EAS dev build | 3 |
| 1.9 | Sandbox testing on real iOS + Android | 3 |
| 1.10 | Custom attributes wiring | 1 |
| 1.11 | Custom variables wiring | 1 |
| 1.12 | Calendar IAP edge case + two-entitlement check | 2 |

---

## RevenueCat Cost

| MTR | Monthly cost |
|---|---|
| $0 – $2,500 | $0 |
| $2,500 – $10,000 | 1% |
| $10,000 – $50,000 | 1% |
| $50,000+ | Negotiate Enterprise |

MTR = gross revenue before app store commissions. Projected Year 1: ~$500-1,200 total RC fees.

---

## Roadmap

### v1.1 — 2-3 Weeks Post-Launch

**New Targeting Rules:**
- `country_tier_2` — IN, BR, MX, ID, PH → PPP pricing (~$7.99/mo)
- `goal_love` — `primary_goal=LOVE_RELATIONSHIP` → compatibility-emphasis paywall
- `goal_counsel` — `primary_goal=COUNSEL_SEEKER` → Counsel-headlined paywall
- `winback` — `is_returning_user=true` → 50% off first month

**New Paywalls:** `paywall_winback`, `paywall_love`, `paywall_counsel_v2`

### v1.2 — 6-8 Weeks Post-Launch (A/B Tests)

| Test | Control | Variants | Metric |
|---|---|---|---|
| Trial vs No-Trial | Hard paywall | A: 3-day · B: 7-day | 30-day net revenue per install |
| Annual price | $99.99/yr | A: $107.99 · B: $119.99 | 30-day total revenue |
| Counsel positioning | Supporting feature | Headline differentiator | 7-day conversion + Counsel usage |

---

## Rejected — Do Not Re-Propose

| Approach | Status |
|---|---|
| Custom paywall code (no RC Paywalls) | Rejected |
| Trust client-side `isPremium` (skip backend gate) | Rejected |
| RC REST API verification on every request | Rejected |
| Single per-user monthly token budget | Rejected |
| 7 paywall variants at launch (one per feature) | Rejected |
| Webhook-only sync (no REST API failsafe) | Rejected |
| Adapty or Qonversion instead of RC | Rejected |
| Pure REST API integration (no SDK) | Rejected |

---

# Auth Strategy — Locked Decisions (Phase 0.5)

**Status:** LOCKED | May 6, 2026

---

## Core Decisions

| Element | Decision |
|---|---|
| Auth strategy | Anonymous-first; require permanent auth before paywall |
| Providers (in order) | Sign in with Apple → Sign in with Google → Email magic link |
| NOT supported | Email/password, Facebook, Twitter, GitHub |
| iOS Apple auth method | Native `expo-apple-authentication` → `signInWithIdToken` |
| Apple on Android | NOT supported — Android users use Google only |
| Google auth method | Native `@react-native-google-signin/google-signin` → `signInWithIdToken` |
| Anonymous→permanent conversion | Manual transfer via backend RPC (NOT `linkIdentity`) |
| Apple full name capture | Yes — first sign-in only; save via `updateUser()` immediately |
| Session storage | AsyncStorage — `autoRefreshToken: true`, `persistSession: true` |
| RevenueCat user_id | = Supabase user_id (anonymous bootstrap → alias to permanent via `Purchases.logIn`) |
| Web/mobile cross-linking | NO in v1 — separate user rows, different products |
| Sign out for anonymous users | Allowed with hard warning: "data will be lost" |
| Account deletion in-app | Required (Apple App Store rule since 2022) — Settings → delete via backend RPC |
| Magic link email delivery | Resend SMTP (NOT Supabase default — better deliverability) |
| Apple Team ID | Lock at project start, NEVER change (all existing Apple sign-ins break if changed) |

---

## Auth Flows

### App Launch (Anonymous Bootstrap)

```
1. Check AsyncStorage for existing Supabase session
2. Session exists + valid → restore
3. Session expired → autoRefreshToken handles silently
4. No session → supabase.auth.signInAnonymously()
5. Capture anonymous user_id
6. Purchases.logIn(anonymous_user_id)
7. App ready — user is anonymous but authenticated
```

### Onboarding (Still Anonymous)

```
1. User enters birth date/time/location
2. Backend computes natal chart (Swiss Ephemeris)
3. Save chart to users WHERE id = anonymous_user_id
4. User selects primary_goal
5. Compute + save archetype
6. Show free tier reveal
7. Purchases.setAttributes({ primary_goal, archetype, sun_sign })
```

### Auth Gate (Anonymous → Permanent)

```
1. User taps premium feature OR onboarding paywall fires
2. Check supabase.auth.getUser():
   - is_anonymous = true  → show AuthGate screen
   - is_anonymous = false → skip to paywall
3. AuthGate: "Save your chart and continue"
   [Sign in with Apple]    ← primary, top
   [Sign in with Google]   ← secondary
   [Continue with email]   ← tertiary (magic link)
4. Sign in with Apple:
   a. AppleAuthentication.signInAsync({ scopes: [FULL_NAME, EMAIL] })
   b. supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken })
   c. If credential.fullName exists → supabase.auth.updateUser({ data: { first_name, last_name } })
      (one-shot — Apple never returns full name again)
5. backend RPC: transfer_anonymous_to_permanent(old_anon_id, new_perm_id)
   - Copies natal chart, primary_goal, archetype, sun_sign
   - Orphans old anonymous row
6. Purchases.logIn(new_perm_id)  ← RC aliases anonymous → permanent
7. Show paywall
```

### Returning User (Reinstall / Device Switch)

```
1. No session in AsyncStorage
2. Show: [Sign in with Apple] [Sign in with Google] [Start new]
3. Sign in with Apple → signInWithIdToken → existing permanent user_id returned
4. Purchases.logIn(perm_user_id) → RC restores entitlement
5. App fully restored
```

### Sign Out

```
1. Anonymous users: warn "Your chart and readings cannot be recovered. Continue?"
2. Permanent users: "You can sign back in anytime to restore."
3. On confirm:
   supabase.auth.signOut()
   Purchases.logOut()
   Clear AsyncStorage
   Navigate to splash/auth screen
```

---

## Supabase Client Config

```javascript
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## Supabase Schema Additions

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT;
  -- 'apple' | 'google' | 'email' | 'anonymous'
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_from_anonymous_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_anonymous_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id) WHERE apple_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_user_id ON users(google_user_id) WHERE google_user_id IS NOT NULL;
```

---

## Google OAuth Setup (3 Client IDs Required)

| Client | Where used | Note |
|---|---|---|
| Web Client ID | Supabase dashboard (server-side) | Never goes in app code |
| iOS Client ID | `GoogleSignin.configure({ iosClientId })` in app | |
| Android Client ID | Supabase dashboard — NOT in app code | Requires SHA-1 fingerprint from Play App Signing |

**Supabase Google provider config:**
- Paste all 3 client IDs as "Authorized Client IDs"
- Paste Web client secret
- Enable "Skip nonce checks" (native flow doesn't include nonce)
- Copy Supabase callback URL → add to Google Cloud Console Web client redirect URIs

---

## Apple-Specific Rules

- Use `sub` claim (Apple stable user ID) as identifier — NOT email (relay email is unreliable)
- Full name from Apple: capture on first sign-in via `credential.fullName`, save immediately — never returned again
- Apple on Android: skip entirely (Apple has no Android SDK; OAuth web flow requires secret rotation every 6 months)
- Apple Team ID: lock now, never change (all existing Apple sign-ins break on Team ID change)

---

## Implementation Phases (~25 hrs total)

| Phase | Deliverable | hrs |
|---|---|---|
| 0.5.1 | Apple Developer: Sign in with Apple capability, Service ID, Team ID locked | 1 |
| 0.5.2 | Google Cloud: project, OAuth consent screen, 3 Client IDs | 2 |
| 0.5.3 | Supabase Auth providers: Apple, Google, email (magic link via Resend SMTP) | 1 |
| 0.5.4 | Install: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `@react-native-google-signin/google-signin` | 0.5 |
| 0.5.5 | `supabase.ts` client with AsyncStorage config | 1 |
| 0.5.6 | AuthProvider context (session state, user state, auth methods) | 2 |
| 0.5.7 | AuthGate screen (Apple + Google + magic link buttons) | 3 |
| 0.5.8 | Sign in with Apple flow + name capture | 2 |
| 0.5.9 | Sign in with Google flow | 2 |
| 0.5.10 | Magic link email flow | 1.5 |
| 0.5.11 | Schema migrations | 0.5 |
| 0.5.12 | Backend RPC: `transfer_anonymous_to_permanent(old_id, new_id)` | 2 |
| 0.5.13 | Anonymous bootstrap on app launch | 1 |
| 0.5.14 | Sign out flow with anonymous-loss warning | 1 |
| 0.5.15 | Account deletion flow in Settings (Apple requirement) | 2 |
| 0.5.16 | RC integration: `Purchases.logIn` on auth state changes | 1 |
| 0.5.17 | Testing: real device, all 3 providers, anon→permanent transfer, sign out, restore | 4 |

---

## Rejected — Do Not Re-Propose

| Approach | Status |
|---|---|
| Email/password auth | Rejected |
| Force auth at install (before free tier) | Rejected |
| Anonymous all the way through purchase | Rejected |
| `linkIdentity()` for anon→permanent conversion | Rejected (known bugs 2026) |
| Sign in with Apple via OAuth web flow | Rejected (secret rotation every 6 months) |
| Cross-platform web/mobile entitlement sharing in v1 | Rejected |
| Supabase default email provider for magic links | Rejected (use Resend SMTP) |
| Apple email as unique identifier | Rejected (relay emails are unreliable) |

---

# Mobile App Structure — Locked Decisions (v1)

**Status:** LOCKED | May 6, 2026

---

## Core Decisions

| Element | Decision |
|---|---|
| Tab count | 4 |
| Tabs (in order) | Today, Readings, Counsel, More |
| Counsel placement | Own tab (behavioral frequency) — not headlined in marketing |
| Compatibility placement | Under More tab (occasional use) |
| Calendar placement | Under More tab (seasonal use) |
| Onboarding screens | 8: Splash → Welcome → BirthInfo → BirthTimeLocation modal → Calculating → BigThreeReveal → OptionalQuestions → PremiumTeaser |
| Auth gate timing | Modal triggered on paywall tap only — NOT blocking onboarding |
| Paywall pattern | RevenueCat-presented at 7 placements per RevenueCat v1 locked doc |
| Settings location | Under More tab |
| Routing library | React Navigation (already integrated — do not switch) |
| Tab icons | Lucide (custom archetype icons reserved for illustrations only) |
| Free locked content | Show blurred with "Unlock" CTA — do NOT hide entirely |
| Onboarding optional questions | Hardcoded for v1 — 4 questions (life focus, season, tone, familiarity) |
| Tradition switcher scope | Global setting under More for v1 (per-screen is v1.1) |
| Old screens disposition | 9 refactored, 2 deleted (PreviewScreen, SubscriptionScreen) |
| New screens count | ~18 |
| Total v1 screen count | ~27 |

---

## Tab Structure

### Today Tab

**Free:**
- Greeting card with archetype name
- Today's date + moon phase
- Daily horoscope (sun-sign, from `daily_zodiac_cache`)
- Today's transits (list + friendly explanations)

**Premium (additional):**
- Today's personalized insight (Claude-generated, replaces sun-sign generic)
- Archetype focus card
- Quick CTA: "Ask Counsel about today"
- Quick CTA: "What's coming next" → forecast

**Free users:** personalized insight and archetype focus cards shown blurred with "Unlock Premium" CTA

---

### Readings Tab

**Free:**
- Big-three card (sun/moon/rising reveal)
- Archetype name + 1-paragraph teaser
- "Read full archetype" → paywall (`feature_archetype`)

**Premium:**
- Full archetype reading
- Full natal chart (all planetary placements)
- 90-day forecast
- Daily insight history (last 30 days)
- Transit timeline (past + future)

---

### Counsel Tab

**Free (pitch state):**
- Hero illustration + value prop
- "Ask Counsel anything about your chart"
- Sample hardcoded questions (tapping triggers paywall at `feature_counsel`)

**Premium:**
- First-use compliance disclosure modal (required — see compliance rules below)
- Chat interface with chart context
- Message counter: "23 messages today / 30 daily limit"
- Suggested question chips
- Session chat history (persistent history is v1.1)

**Compliance UI (required for App Review):**
- "AI-generated based on your chart" badge near input
- "For self-reflection only — not medical or legal advice" footer
- Crisis resource link in More tab → Settings
- Self-harm/distress detection → show crisis resources, do NOT forward to Claude

---

### More Tab

**Premium Features:**
- Compatibility → screen (free: sun-sign only; paywall: `feature_compatibility`)
- Lucky Timing Calendar → screen (sub: free; non-sub: $4.99 IAP, paywall: `feature_calendar`)
- Tradition switcher (Western / Vedic / Chinese / Tarot — premium, global setting)

**Account & Settings:**
- Profile (name, birth info, edit)
- Subscription (RevenueCat customer center modal)
- Notifications (push permissions + daily reminder time)
- Language

**Trust & Compliance:**
- Privacy & Data (links out to omenora.com/privacy)
- Terms of Service (links out to omenora.com/terms)
- Counsel guidelines & disclaimer
- Crisis resources
- Account deletion (Apple-required)
- Sign out

**Support:**
- Help / FAQ (web link)
- Contact support (email)
- About OMENORA / version

---

## Onboarding Flow

```
1. Splash           — logo + animation (1.5s)
2. Welcome          — value prop + [Begin]
3. BirthInfo        — first name, birth date (required)
4. BirthTimeLocation modal — time picker + city autocomplete (Nominatim)
5. Calculating      — loading animation (3-8s), Swiss Ephemeris chart compute, save to anonymous user_id
6. BigThreeReveal   — animated sun/moon/rising + archetype name reveal
7. OptionalQuestions — 4 optional: life focus, current season, tone, astrology familiarity + [Skip]
8. PremiumTeaser    — benefit bullets + [Unlock Premium] → tap fires AuthGate → then paywall (onboarding_end)
   [Dismiss]        — enter app at Today tab as free user (no auth required)
```

---

## Auth Gate Flow (triggered by paywall tap, not blocking onboarding)

```
1. AuthGate modal slides up
2. "Save your chart and continue"
3. [Sign in with Apple] / [Sign in with Google] / [Continue with email]
4. Privacy footnote → Privacy Policy link
5. On success:
   a. signInWithIdToken({ provider, token })
   b. backend RPC: transfer_anonymous_to_permanent(old_id, new_id)
   c. Purchases.logIn(new_perm_id)
   d. Modal dismisses → paywall presented
```

---

## Screen Disposition

| Screen | Action | Notes |
|---|---|---|
| HomeScreen | Refactor → Today tab | Remove quiz CTA; add daily content |
| AnalysisScreen | Rewrite → Onboarding flow | 3 required + 4 optional progressive (4-5 separate screens) |
| PreviewScreen | **DELETE** | 3-tier Stripe model is gone; paywall is RevenueCat |
| ReportScreen | Refactor → Readings tab | Archetype + natal chart + forecast content area |
| ReadingScreen | Refactor → Readings tab content | Folds into Readings tab structure |
| CalendarScreen | Refactor → More → Calendar | Rewire to `isPremium` OR `calendar_2026` |
| CompatibilityScreen | Refactor → More → Compatibility | Rewire to single `isPremium` check |
| SubscriptionScreen | **DELETE** | Daily insights now in Today tab; sub mgmt via RC customer center |
| MoreScreen | Refactor → More tab | Reorganize per new sections |
| PrivacyScreen | Keep | Also linked from Settings |
| TermsScreen | Keep | Also linked from Settings |

---

## New Screens to Build

| Screen | Phase |
|---|---|
| Splash | 0.4 |
| Welcome | 2 |
| BirthInfo | 2 |
| BirthTimeLocation modal | 2 |
| Calculating loader | 2 |
| BigThreeReveal | 2 |
| OptionalQuestions | 2 |
| PremiumTeaser | 2 |
| AuthGate modal | 0.5 (locked) |
| Magic link entry | 0.5 (locked) |
| Counsel chat | 5 |
| Counsel disclosure modal | 5 |
| Profile screen | 6 |
| Subscription management screen | 6 |
| Notifications screen | 7 |
| Account deletion flow | 6 |
| Crisis resources screen | 5 |
| Tradition switcher screen | 4 |

---

## Implementation Phases

| Phase | Deliverable | hrs |
|---|---|---|
| 0.4 | Splash + theme provider + 4-tab shell scaffolding | 2 |
| 0.5 | Auth (locked separately) | 25 |
| 1 | RevenueCat (locked separately) | 32 |
| 2.1 | Onboarding flow rewrite (8 screens replacing AnalysisScreen) | 8 |
| 2.2 | Onboarding paywall placement integration | 2 |
| 3.1 | Delete PreviewScreen, SubscriptionScreen | 0.5 |
| 3.2 | Rewire CalendarScreen + CompatibilityScreen entitlement checks | 2 |
| 3.3 | Today tab build (HomeScreen refactor + daily insight slot) | 4 |
| 4.1 | Readings tab (ReportScreen + ReadingScreen consolidation + tradition switcher) | 6 |
| 4.2 | Calendar screen + IAP-or-sub gating | 2 |
| 4.3 | Compatibility screen + paywall placement | 3 |
| 5.1 | Counsel chat + Claude API integration | 6 |
| 5.2 | Counsel compliance UI + crisis detection | 2 |
| 6.1 | More tab reorganization | 2 |
| 6.2 | Profile + Subscription management screens | 2 |
| 6.3 | Account deletion flow | 2 |
| 6.4 | Notifications screen + push permission flow | 2 |

**Phases 2–6 structural build: ~44 hrs. Total with Auth + RevenueCat: ~101 hrs.**

---

## Foundational Components (Build Before Tabs)

**Layout:**
- `<Screen>` — safe area wrapper + theme
- `<TabBar>` — bottom tab navigation (Expo Router)
- `<Header>` — title + back + action buttons

**Premium Gating:**
- `<PremiumGate>` — wraps content; blur + paywall trigger if not premium
- `<PremiumBadge>` — "PRO" label
- `<UnlockButton>` — opens RC paywall for given placement

**Cards:**
- `<DailyCard>`, `<ReadingCard>`, `<TransitCard>`, `<ChatBubble>`, `<EmptyState>`

**Auth:**
- `<AuthProvider>` — Supabase session context
- `<PurchasesProvider>` — RC entitlement context
- `<AuthGate>` — modal with sign-in buttons

**Onboarding:**
- `<OnboardingProgress>`, `<BirthDatePicker>`, `<BirthTimePicker>`, `<CityAutocomplete>`

---

## Rejected — Do Not Re-Propose

| Approach | Status |
|---|---|
| 5-tab structure | Rejected (cluttered UX; Compatibility + Calendar are occasional use) |
| Counsel under More tab | Rejected (behavioral frequency warrants own tab) |
| Delete PreviewScreen via refactor | Rejected — DELETE outright (3-tier model is gone) |
| Keep SubscriptionScreen | Rejected — DELETE (RC customer center replaces it) |
| Force AuthGate before onboarding completes | Rejected (kills free-tier funnel) |
| Expo Router instead of React Navigation | Rejected (React Navigation already integrated, no reason to switch) |
| Hide locked content from free users | Rejected (visible-but-locked drives conversion) |
| Per-screen tradition switcher in v1 | Rejected (global setting for v1, per-screen is v1.1) |
| Dynamic Counsel suggested questions in v1 | Rejected (hardcoded for v1; dynamic is v1.1) |

---

# Design System — Locked Decisions (v1)

**Status:** LOCKED | May 6, 2026

---

## Core Decisions

| Element | Decision |
|---|---|
| Theme | Dark-only for v1 — no light mode |
| Color token naming | Semantic (role-based), NOT descriptive — enables future light mode via value swap only |
| Elevation model | Luminance-based (4 surface levels), NOT shadow-based |
| Glassmorphism | Surgical use only — tab bar, overlays, sheets. NEVER on cards or content |
| Font stack | Fraunces (display serif) + Hanken Grotesk (UI sans) — drop Cormorant, Playfair, Inter |
| Icon set | Lucide (functional UI). Custom sacred-geometry SVGs for archetype illustrations only |
| Layout system | StyleSheet + design tokens — NOT NativeWind/Tamagui/gluestack |
| Spacing base | 4px |
| Motion philosophy | Functional only — every animation answers "what happened?" — never decorative |
| Accessibility baseline | WCAG 2.2 AA minimum; AAA where possible. VoiceOver navigable before submission |
| Locked content pattern | Blur (40px) + scrim + lock icon + "Unlock" text — NEVER hidden entirely |
| Conversion CTA | Single dominant gold gradient button per paywall — no decision paralysis |
| Dark patterns | None in v1 — no hidden close buttons, no fake urgency, no exit-catch discounts |
| Light mode | Rejected for v1 — all brand assets built against dark; token structure supports it later |

---

## Color Tokens

### Surface (4 elevation levels — luminance ladder)

| Token | Hex | Use |
|---|---|---|
| `surface.base` | `#050410` | App background, root container |
| `surface.raised` | `#0B0A1F` | Cards, panels, sections |
| `surface.overlay` | `#13122A` | Nested cards, active states |
| `surface.floating` | `#1B1A35` | Modals, bottom sheets, dropdowns |
| `surface.inverse` | `#EDEDED` | Rare light moments (e.g., receipt screen) |

### Text

| Token | Value | Contrast on base | Use |
|---|---|---|---|
| `text.primary` | `rgba(255,255,255,0.93)` | ~17:1 AAA | Default body, headlines |
| `text.secondary` | `rgba(255,255,255,0.68)` | ~8.5:1 AAA | Labels, supporting copy |
| `text.tertiary` | `rgba(255,255,255,0.45)` | ~4.5:1 AA | Captions, metadata, hints |
| `text.disabled` | `rgba(255,255,255,0.30)` | ~3:1 (large only) | Disabled states |
| `text.inverse` | `#050410` | n/a | Text on gold buttons |
| `text.accent` | `#C9A961` | ~9:1 AAA | Premium labels, archetype names, links |

### Accent (gold)

| Token | Value | Use |
|---|---|---|
| `accent.primary` | `#C9A961` | Brand gold — premium CTAs, archetype highlights |
| `accent.emphasis` | `#E0C078` | Hover/pressed on gold elements |
| `accent.subtle` | `rgba(201,169,97,0.10)` | Premium chip backgrounds, focus rings |
| `accent.muted` | `rgba(201,169,97,0.04)` | Faint gold haze, radial glow backdrops |

### Border

| Token | Value | Use |
|---|---|---|
| `border.subtle` | `rgba(255,255,255,0.06)` | Default card edge, divider |
| `border.default` | `rgba(255,255,255,0.10)` | Visible separator |
| `border.strong` | `rgba(255,255,255,0.18)` | Input borders, focus rings |
| `border.accent` | `rgba(201,169,97,0.40)` | Premium card edges, active gold elements |

### State (desaturated for dark UI)

| Token | Hex | Use |
|---|---|---|
| `state.success` | `#5EBE8A` | Success toasts, confirmations |
| `state.warning` | `#D9A24A` | Warnings, expiring notices |
| `state.danger` | `#E07D7D` | Errors, destructive actions |
| `state.info` | `#7AA0E0` | Info banners, transit alerts |

### Specialty

| Token | Value | Use |
|---|---|---|
| `lock.scrim` | `rgba(5,4,16,0.65)` | Backdrop on locked content |
| `lock.blur` | `40px` | Blur radius on locked content |
| `glow.gold` | radial: `#C9A961` 0% → transparent 70% | Paywall hero, big-three reveal background |
| `chat.user` | `surface.overlay` | Counsel user message bubble |
| `chat.counsel` | `accent.subtle` + `border.accent` | Counsel response bubble |

---

## Typography

**Keep:** Fraunces (variable serif), Hanken Grotesk (variable sans)
**Remove:** Cormorant Garamond, Playfair Display, Inter

Italic Fraunces: editorial emphasis only (archetype subtitles, planet names) — NOT general UI.

| Token | Family | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display.1` | Fraunces | 40 / 48 | 300 | -0.5 | Big-three reveal, archetype name |
| `display.2` | Fraunces | 32 / 40 | 300 | -0.4 | Screen titles, paywall hero |
| `heading.1` | Fraunces | 24 / 32 | 400 | -0.3 | Section headers, reading titles |
| `heading.2` | Hanken Grotesk | 20 / 28 | 600 | -0.2 | Card titles, today greeting |
| `body.large` | Hanken Grotesk | 17 / 26 | 400 | 0 | Premium reading copy |
| `body` | Hanken Grotesk | 15 / 22 | 400 | 0 | Default body |
| `label` | Hanken Grotesk | 13 / 18 | 500 | 0.1 | Form labels, list items |
| `caption` | Hanken Grotesk | 12 / 16 | 400 | 0.1 | Metadata, helper text |
| `micro` | Hanken Grotesk | 11 / 14 | 600 | 0.5 uppercase | Tags, badges, "PRO" labels |

Dynamic Type: all sizes scale up to xxLarge, then cap.

---

## Spacing (4px base)

```
2=0.5  4=1  6=1.5  8=2  12=3  16=4  20=5  24=6  32=8  40=10  48=12  64=16  80=20  96=24
```

| Pattern | Value |
|---|---|
| Screen edge padding | 20px (5) |
| Card internal padding | 16px compact / 20px default / 24px premium |
| Card stack gap | 12px (3) |
| Section spacing | 32px (8) |
| Tap target minimum | 44 × 44pt |

---

## Radius Tokens

| Token | Value | Use |
|---|---|---|
| `radius.xs` | 4 | Pills, small badges |
| `radius.sm` | 8 | Inputs, small buttons |
| `radius.md` | 12 | Default buttons |
| `radius.lg` | 16 | Cards (default) |
| `radius.xl` | 24 | Premium cards, paywall hero |
| `radius.2xl` | 32 | Modals, bottom sheets |
| `radius.pill` | 999 | Chips, segmented controls |

---

## Motion Tokens

| Type | Easing | Duration |
|---|---|---|
| Entrance (mount) | easeOut | 250ms |
| Exit (unmount) | easeIn | 200ms |
| Transition (state change) | easeInOut | 300ms |
| Hero reveal (big-three, paywall) | custom slow-out | 500ms |
| Microinteraction (press, toggle) | easeOut | 150ms |
| Child stagger | — | 60ms per child (max 4) |

**Reduced motion:** replace fade-up with fade, skip stagger and scale pulses, keep haptics.

**Haptics:**
- Button press: `light`
- Tab switch: `light`
- Toggle/chip select: `medium`
- Successful action: `success`
- Error: `error`

---

## Premium Signature Elements

1. **Gold radial glow** — `#C9A961` 8% center → transparent 70%. Use: paywall hero, big-three reveal, archetype hero. NEVER on standard cards.
2. **Sacred geometry accents** — `#C9A84C` 1.5pt stroke SVGs. Use: section dividers, empty states, onboarding decorations.
3. **Star field** — `rgba(255,255,255,0.03)` dots 1–3px. Use: splash + archetype reveal only. NEVER on functional screens.
4. **Gold gradient CTA** — `linear-gradient(135deg, #C9A961, #D9BD7E, #C9A961)`. Use: primary "Subscribe / Unlock Premium" button ONLY. Flat gold for all other CTAs.
5. **Hairline gold rules** — 1px, 40% opacity, 24pt length. Use: section headers in premium reading content only.

---

## Component Inventory

### Atoms
`<Text>` · `<Icon>` (Lucide, 1.5pt stroke, default 20pt) · `<Button>` (primary/secondary/tertiary/danger, sm/md/lg) · `<TextInput>` · `<Chip>` (default/selected/locked) · `<Avatar>` · `<Badge>` (PRO/NEW/count) · `<Divider>` (default/gold) · `<Skeleton>`

### Molecules
`<TextField>` · `<DateField>` · `<TimeField>` (with "I don't know my birth time" toggle) · `<CityField>` (Nominatim autocomplete) · `<ListItem>` · `<ChipGroup>` · `<ProgressBar>` · `<ProgressDots>` · `<Toast>`

### Organisms
`<Card>` (default/raised/premium gold-border) · **`<LockedCard>`** (blur + scrim + Unlock CTA — conversion critical) · `<DailyCard>` · `<ReadingCard>` · `<TransitCard>` · `<ChatBubble>` (user/counsel/system) · `<SectionHeader>` · `<TabBar>` · `<Header>` · `<BottomSheet>` · `<Modal>`

### Templates
`<ScreenWrapper>` · `<OnboardingStep>` · `<PaywallShell>` · `<EmptyState>` · `<ErrorState>`

**Do NOT build custom:** video player, date/time picker, keyboard avoiding, haptics, blur, gradient — use Expo libs.

---

## File Structure

```
src/
├── design/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   ├── motion.ts
│   │   └── index.ts
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   └── useTheme.ts
│   └── illustrations/
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   │   └── LockedCard.tsx   ← conversion-critical, build first
│   └── templates/
│
└── screens/
```

---

## Implementation Phases

| Phase | Deliverable | hrs |
|---|---|---|
| DS.1 | Token files (colors, typography, spacing, radius, motion) | 2 |
| DS.2 | Remove Cormorant, Playfair, Inter — verify Fraunces + Hanken variable builds | 1 |
| DS.3 | ThemeProvider refactor + `useTheme` hook | 1 |
| DS.4 | Atom components (Text, Icon, Button, TextInput, Chip, Badge, Divider, Skeleton) | 4 |
| DS.5 | Molecule components (TextField, DateField, TimeField, CityField, ListItem, ChipGroup, ProgressBar, Toast) | 4 |
| DS.6 | Critical organisms (Card, LockedCard, ChatBubble, BottomSheet, Modal, TabBar, Header) | 6 |
| DS.7 | Template wrappers (ScreenWrapper, OnboardingStep, PaywallShell, EmptyState) | 2 |
| DS.8 | Dev preview screen (`/dev/components`) for visual QA | 2 |

**Total: ~22 hrs. Runs between Phase 0.5 (Auth) and Phase 1 (RevenueCat) in the broader sprint.**

---

## Rejected — Do Not Re-Propose

| Approach | Status |
|---|---|
| Light mode in v1 | Rejected — all brand assets built against dark |
| NativeWind / Tamagui / gluestack wholesale adoption | Rejected — StyleSheet + tokens preferred; one less dep |
| Shadow-based elevation | Rejected — shadows don't read on dark surfaces; luminance ladder instead |
| Glassmorphism on cards or primary content | Rejected — surgical use only (tab bar, overlays, sheets) |
| Oversaturated state colors (e.g., `#FF5252` red) | Rejected — desaturated versions only for dark UI |
| Custom blur/gradient/haptics implementation | Rejected — use `expo-blur`, `expo-linear-gradient`, `expo-haptics` |
| Cormorant Garamond, Playfair Display, Inter | Rejected — 3 fonts dropped; Fraunces + Hanken only |
| Custom date/time picker | Rejected — use native `DateTimePickerAndroid`/iOS modal |
| Decorative-only animations | Rejected — all motion must be functional |
| Per-screen token definitions (inline colors) | Rejected — all colors from semantic tokens only |

---

# Codebase Alignment Status

> **Living section — update after each strategy is added or implementation phase completes.**
> Last updated: May 6, 2026

---

## Already Aligned ✅

**Infrastructure:**
- `API_BASE_URL` — env var with `api.omenora.com` fallback (not hardcoded)
- `AsyncStorage` — installed and used in `analysisStore.ts`; Supabase client can reuse it
- `expo-apple-authentication` — `APPLE_SIGN_IN: true` flag in `config.ts`
- `SafeAreaProvider` + `NavigationContainer` — correctly structured in `App.tsx`
- Zustand + AsyncStorage persist — state persistence pattern working
- `expo-linear-gradient` — already available (used in `ThemeProvider`) ✅. `expo-blur` — NOT installed; install in Phase DS per G7.
- 4-tab structure — `TabNavigator.tsx` has 4 tabs (wrong names, correct count)

**Design system:**
- `#050410` base background — matches `surface.base` ✅
- `#C9A961` gold — identical to `accent.primary` ✅
- `text.primary` value `rgba(255,255,255,0.93)` — already in `colors.ts` as `ink` ✅
- `text.tertiary` value `rgba(255,255,255,0.45)` — already in `colors.ts` as `inkFaint` ✅
- `accent.subtle` ≈ `goldSubtle rgba(201,169,97,0.07)` — close enough to migrate ✅
- Dark-only theme — `ThemeProvider` correctly uses `#050410` gradient ✅
- Fraunces + Hanken Grotesk — loaded in `App.tsx` ✅
- `LockedPreview` component exists — maps directly to `<LockedCard>` (conversion-critical) ✅
- `ProgressBar`, `ScreenHeader`, `CTAButton`, `GhostBadge`, `TraitPill`, `SectionBlock`, `InfoBanner`, `FeatureListItem`, `LabelCaps` — all exist, map to atomic components ✅
- Inline color elimination — completed across all screens (no raw hex in components) ✅

---

## Needs To Be Done ❌

### Immediate Blockers (Architecture)
- **`analysisStore.ts`** — replace `paymentComplete`, `bundlePurchased`, `oraclePurchased` with `isPremium` from RC
- **`App.tsx`** — remove Stripe deep-link handler (`omenora://payment/success`, `verifyMobileCheckoutSession`)

### Design System — Token Migration
- **Color token rename** — `colors.ts` uses descriptive names (`ink`, `bone`); migrate to semantic (`text.primary`, `surface.base`)
- **4 surface levels** — only `surface: rgba(255,255,255,0.03)` exists; need `surface.raised`, `surface.overlay`, `surface.floating`, `surface.inverse`
- **Border tokens** — none exist; add `border.subtle/default/strong/accent`
- **State tokens** — only `error: '#FF5252'` (oversaturated); replace with desaturated `state.success/warning/danger/info`
- **Specialty tokens** — `lock.scrim`, `lock.blur`, `glow.gold`, `chat.user`, `chat.counsel` — none exist
- **Legacy gradients** — `colors.gradients.primary` + `goldPurple` flagged for removal in code; delete them
- **No spacing, radius, motion token files** — `src/design/tokens/` directory doesn't exist yet
- **No `useTheme` hook** — `ThemeProvider` provides no context; components import `colors`/`fonts` directly
- **Type scale tokens** — no `display.1`, `heading.1`, `body` etc; everything is ad-hoc sizing

### Design System — Font Stack
- **Remove from `fonts.ts` + `App.tsx`:** Cormorant Garamond, Playfair Display, Inter (3 fonts, 60% bundle reduction)

### Design System — File Structure
- **Reorganize:** `src/theme/` → `src/design/tokens/` + `src/design/theme/`
- **Reorganize:** `src/components/ui/` → `src/components/atoms/`, `molecules/`, `organisms/`, `templates/`

### Design System — Missing Components
- **Atoms:** `<Text>` wrapper, `<Icon>` (Lucide), `<Chip>`, `<Avatar>`, `<Badge>`, `<Divider>`, `<Skeleton>`
- **Molecules:** `<TextField>`, `<DateField>`, `<TimeField>`, `<CityField>`, `<ListItem>`, `<ChipGroup>`, `<ProgressDots>`, `<Toast>`
- **Organisms:** `<Card>`, `<LockedCard>` (refactor from `LockedPreview`), `<DailyCard>`, `<ReadingCard>`, `<TransitCard>`, `<ChatBubble>`, `<BottomSheet>`, `<Modal>`
- **Templates:** `<ScreenWrapper>`, `<OnboardingStep>`, `<PaywallShell>`, `<EmptyState>`, `<ErrorState>`

### Screens — Delete
- `PreviewScreen.tsx` (3-tier Stripe paywall — gone)
- `SubscriptionScreen.tsx` (old `oraclePurchased` — gone)

### Screens — Refactor
- Tab labels: Home→Today, Reading→Readings, Explore→Counsel
- `ExploreScreen.tsx` → Counsel tab
- `HomeScreen.tsx` → Today tab
- `AnalysisScreen.tsx` → full rewrite (8-screen onboarding)
- `CalendarScreen.tsx` → rewire to `isPremium` OR `calendar_2026`
- `CompatibilityScreen.tsx` → rewire to single `isPremium`
- Tab icons: Ionicons → Lucide

### Not Built Yet
- Supabase client (`src/lib/supabase.ts`)
- `AuthProvider` + `AuthGate` modal
- `PurchasesProvider` (RevenueCat)
- 8 onboarding screens (Splash, Welcome, BirthInfo, BirthTimeLocation, Calculating, BigThreeReveal, OptionalQuestions, PremiumTeaser)
- Counsel chat + compliance modal
- Profile, Subscription management, Notifications, Account deletion, Crisis resources screens
- API client auth interceptor (commented out — needs Supabase JWT)