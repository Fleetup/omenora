# OMENORA AUDIT — 2026-05-05

**Project root:** `/Volumes/ESSD/Projects/Augur-V1/augur/`  
**Report generated:** 2026-05-05  
**Scope:** Factual data extraction only. No recommendations. No optimizations.

---

## Executive Summary

Omenora is a Nuxt 3 / Vue 3 AI-powered astrology and numerology SaaS deployed on Railway. The product operates two primary paid funnels: (1) a main report funnel (`/` → `/analysis` → `/preview` → `/report`) with three one-time payment tiers at $4.99, $9.99, and $24.99; and (2) a compatibility funnel (`/compatibility-quiz` → `/compatibility`) with two one-time tiers at $9.99 and $14.99. A third flow (`/subscribe`) sells a $6.99/month personal daily horoscope subscription. Post-purchase upsells on `/report` offer Birth Chart ($4.99), Lucky Timing Calendar ($4.99), and Tradition Switch ($2.99). The tracking stack combines TikTok Pixel, Meta Pixel, Google Analytics 4, Microsoft Clarity, PostHog, and SHA-256 email hashing for TikTok identity. An Inngest-powered 4-step abandonment email sequence (via Resend) fires within 10 minutes of paywall email capture. One confirmed code inconsistency exists: `apply-promo-discount.post.ts` contains stale `TIER_BASE_PRICES` that predate the Phase 3A repricing (May 2026), causing promo discount calculations to reference wrong base prices.

---

## Section 1: Product & Pricing Architecture

### 1.1 Main Report Funnel — Three Checkout Tiers

All three tiers are defined client-side in `preview.vue` and server-side in separate API endpoints.

| Tier Label | Display Price | Stripe `unit_amount` | Stripe Product Name | Server Endpoint | Metadata Flags |
|---|---|---|---|---|---|
| Basic Report | $4.99 | 499¢ | `OMENORA Destiny Report — Basic` | `server/api/create-payment.post.ts` | `type: 'report'` |
| Most Popular Bundle | $9.99 | 999¢ | `OMENORA Most Popular Bundle` | `server/api/create-bundle-payment.post.ts` | `type: 'report'`, `bundle: 'true'` |
| Full Oracle Bundle | $24.99 | 2499¢ | `OMENORA Full Oracle Bundle` | `server/api/create-oracle-payment.post.ts` | `type: 'report'`, `bundle: 'true'`, `oracle: 'true'` |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-payment.post.ts:44`, `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-bundle-payment.post.ts:44`, `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-oracle-payment.post.ts:44`

Display labels (UI strings in English):
- Basic: `'Get Basic Report — $4.99 →'` (translations.ts line 41)
- Popular: `'Unlock Most Popular Bundle — $9.99 →'` (translations.ts line 42)
- Oracle: `'Get Full Oracle — $24.99 →'` (translations.ts line 43)

**Stripe mode:** `payment` (one-time) for all three.  
**Stripe API version:** `2026-03-25.dahlia` (all endpoints).

#### Bundle Tier Inclusions (as described in Stripe product descriptions)
- **Basic:** `Complete destiny analysis — {archetype}`
- **Bundle:** `Destiny report + 2026 Calendar`
- **Oracle:** `Destiny report + 2026 Calendar + Birth Chart + unlimited cultural readings`

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-bundle-payment.post.ts:42`, `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-oracle-payment.post.ts:42`

#### Success / Cancel URL Patterns
- Basic: `{origin}/report?session_id={CHECKOUT_SESSION_ID}` / cancel: `/preview`
- Bundle: `{origin}/report?session_id={CHECKOUT_SESSION_ID}&bundle=true` / cancel: `/preview`
- Oracle: `{origin}/report?session_id={CHECKOUT_SESSION_ID}&oracle=true` / cancel: `/preview`

### 1.2 Report Page Upsells

| Product | Display Price | Stripe `unit_amount` | Stripe Product Name | Server Endpoint | `success_url` |
|---|---|---|---|---|---|
| Full Birth Chart | `$4.99` (hardcoded in report.vue line 206: `'$4.99 — Unlock'`) | 499¢ | `OMENORA Full Birth Chart` | `server/api/create-birth-chart-payment.post.ts` | `/report?session_id=...&birth_chart=true` |
| 2026 Lucky Timing Calendar | Not shown in code (UI translation key) | 499¢ | `OMENORA 2026 Lucky Timing Calendar` | `server/api/create-calendar-payment.post.ts` | `/calendar?session_id=...` |
| Tradition Switch | Not shown in code (UI translation key: `$2.99 each`) | 299¢ | `OMENORA {Tradition} Reading` (dynamic) | `server/api/create-tradition-payment.post.ts` | `/report?session_id=...&tradition_switch=true` |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-birth-chart-payment.post.ts:35`, `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-calendar-payment.post.ts:33`, `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-tradition-payment.post.ts:48`

**Tradition names** (from `create-tradition-payment.post.ts` lines 26–32):
```
india      → Vedic (Jyotish)
china      → BaZi (Four Pillars)
latam      → Spiritual Tarot
korea      → Personality Insight
middleeast → Destiny Path
```

### 1.3 Compatibility Funnel

Defined in `create-compatibility-payment.post.ts`:

```typescript
const TIER_PRICES: Record<Tier, number> = { single: 999, with_charts: 1499 }
```
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:5`

| Tier Key | Display Price (client, compatibility.vue:742) | Stripe `unit_amount` | Stripe Product Name |
|---|---|---|---|
| `single` | $9.99 | 999¢ | `OMENORA Compatibility Reading` |
| `with_charts` | $14.99 | 1499¢ | `OMENORA Compatibility Reading + Birth Charts` |

**Success URL (both tiers):** `{origin}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`  
**Cancel URL:** `{origin}/compatibility?canceled=1`

### 1.4 Daily Horoscope Subscription

| Product | Display Price | Price Source | Server Endpoint | Stripe Mode |
|---|---|---|---|---|
| Personal Daily Horoscope | `$6.99/month` | `config.stripeDailyPriceId` (env: `NUXT_STRIPE_DAILY_PRICE_ID`) | `server/api/create-subscription.post.ts` | `subscription` |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-subscription.post.ts:57`, `@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/subscribe.vue:16`  
**Actual price ID:** unable to determine from codebase — stored in Railway env var only.  
**Success URL:** `{origin}/subscription?session_id=...`, Cancel URL: `/report`

### 1.5 Promo Code System

**Server endpoints:** `server/api/validate-promo.post.ts`, `server/api/apply-promo-discount.post.ts`, `server/api/apply-promo-access.post.ts`  
**Storage:** Supabase `promo_codes` table  
**Schema visible from validate-promo.post.ts line 14:**
```
id, code_type, code_subtype, discount_value, max_uses, current_uses,
expires_at, active, locked_to_email, access_tier
```

**`code_type` values observed:** `full_access` (grants free access); percentage discount (implied by `discount_value` field)  
**`code_subtype` values observed:** `personal` (locked to email), other subtypes unspecified in code  
**`access_tier` values observed:** `oracle`, `compatibility`

Promo UI appears on `preview.vue` (main funnel) and `compatibility.vue` (compat funnel).

### 1.6 INCONSISTENCY — Stale Prices in `apply-promo-discount.post.ts`

`@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/apply-promo-discount.post.ts:3-7`:
```typescript
const TIER_BASE_PRICES: Record<string, { cents: number; name: string }> = {
  basic:  { cents: 299,  name: 'OMENORA Destiny Report — Basic' },
  bundle: { cents: 499,  name: 'OMENORA Destiny Report + Bundle' },
  oracle: { cents: 1299, name: 'OMENORA Full Oracle Bundle' },
}
```
**INCONSISTENCY:** Phase 3A (commit `ad32859`) repriced Basic to $4.99 (499¢), Phase 3B (commit `0ebddf0`) repriced Bundle to $9.99 (999¢) and Oracle to $24.99 (2499¢). `apply-promo-discount.post.ts` was not updated; discount calculations use pre-Phase-3A prices.

### 1.7 Deprecated / Removed SKUs

| SKU | Commit Removed | Notes |
|---|---|---|
| Compatibility Add-on ($0.99) | `22367ad` | `create-addon-payment.post.ts` may still exist |
| Compatibility Plus subscription | `705c263` | `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` env var commented out in `.env.example` line 18 |
| Compatibility Legacy tier ($2.99) | `7fa12b9` | `tier='legacy'` path removed |

### 1.8 A/B Tests (Query-Parameter Canaries)

| Param | Value | Effect | Source |
|---|---|---|---|
| `preview_variant` | `2tier` | Hides Oracle tier (T3); only Basic + Popular shown | `preview.vue:661-662` |
| `price_test` | `deprioritize1` | Adds `tier--deprioritized` CSS class to Basic tier; shows debug label | `preview.vue:665` |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:660-665`

---

## Section 2: Funnel Architecture

### 2.1 Main Report Funnel

#### Step 1 — Landing (`/`)
- **Component:** `app/pages/index.vue`
- **Entry points:** Direct, organic search, paid social (UTM params)
- **Two CTAs:** `CTAButton to="/analysis"` ("Begin the reading"), `CTAButton to="/compatibility-quiz" variant="outline"` ("Check compatibility")
- **Tracking:** `$trackLandingView` fires (TikTok, Meta, PostHog, GA4) — trigger location: `index.vue` onMounted (implied by plugin structure)
- **No auth gate.** No account required.

#### Step 2 — Analysis Quiz (`/analysis`)
- **Component:** `app/pages/analysis.vue`
- **SEO:** `robots: 'noindex, nofollow'` (line 234)
- **Steps (8 total):**

| Step Index | Content | Input Type |
|---|---|---|
| 0 | "What are you seeking?" (clarity focus) | 4 options: love/career/identity/path — auto-advances |
| 1 | "What shall we call you?" (first name) | Text input |
| 2 | "When were you born?" (date of birth) | Date input, min 1924-01-01 |
| 3 | "Where were you born?" (city) | Google Places Autocomplete |
| 4 | "Do you know your birth time?" (optional) | Time input, skippable |
| 5 | Quiz Q1: "Which area of life feels most alive for you right now?" | 4 options: connection/purpose/growth/creativity — auto-advances |
| 6 | Quiz Q2: "How do you prefer to receive insight?" | 4 options: direct/gentle/detailed/intuitive — auto-advances |
| 7 | Quiz Q3: "What brought you here today?" | 4 options: self/situation/curiosity/recommended — manual submit |

- **API call on submit:** `POST /api/calculate-chart` with firstName, dateOfBirth, timeOfBirth, city, cityLat, cityLng, utcOffsetMinutes
- **On success:** stores `archetype`, `lifePathNumber`, `natalChart` in Pinia `analysisStore`, navigates to `/preview`
- **Tracking events:** `$trackStep1Complete` (after city step), `$trackQuestionAnswered` (per answer watch), `$trackAnalysisSubmit` (on submit)
- **Language selector:** 6 languages (EN/ES/PT/HI/KO/ZH), stored in `analysisStore`
- **Region selector:** western/india/china/latam (4 traditions), stored in `analysisStore`

#### Step 3 — Preview / Paywall (`/preview`)
- **Component:** `app/pages/preview.vue`
- **Conditional logic:**
  - If `store.archetype` is missing → navigates away (no direct link access)
  - `isTwoTierVariant` (query `?preview_variant=2tier`) → Oracle tier hidden
  - `isPriceTest` (query `?price_test=deprioritize1`) → Basic tier deprioritized
- **Email capture:** Input on paywall; on submit calls `POST /api/capture-email`, fires `$trackEmailCaptureSuccess`, triggers Inngest abandonment sequence
- **Promo code UI:** Calls `POST /api/validate-promo`; on `full_access` code applies free access via `POST /api/apply-promo-access`; on discount code applies discount via `POST /api/apply-promo-discount`
- **Tracking events:** `$trackViewContent`, `$trackInitiateCheckout`, `$trackPreviewLoadingStart`, `$trackPreviewLoaded`, `$trackPaywallView`, `$trackTierSelected`, `$trackEmailCaptureSuccess`
- **Checkout routing:**
  - Tier 1 → `POST /api/create-payment` → Stripe → `/report?session_id=...`
  - Tier 2 → `POST /api/create-bundle-payment` → Stripe → `/report?session_id=...&bundle=true`
  - Tier 3 → `POST /api/create-oracle-payment` → Stripe → `/report?session_id=...&oracle=true`

#### Step 4 — Report (`/report`)
- **Component:** `app/pages/report.vue`
- **Route conditions on mount:** `?session_id=` (post-payment), `?bundle=true`, `?oracle=true`, `?birth_chart=true`, `?tradition_switch=true`
- **Content:** 7-section report, Birth Chart (if oracle/purchased), Regional sections (Vedic/BaZi based on `store.region`), 2026 Calendar (if bundle/oracle)
- **Inline upsells:** Birth Chart ($4.99), Calendar (separate page), Tradition Switch ($2.99)
- **PDF export:** available via jsPDF / pdfkit (button: "↓ Save PDF")
- **Share card:** PNG download ("Share Card")
- **Account link:** header link → `/account`
- **Tracking:** `$trackReportViewed`, `$trackUpsellViewed`, `$trackUpsellAccepted`, `$trackShareCardOpened`, `$trackShareCardDownloaded`

### 2.2 Compatibility Funnel

#### Step 1 — Compatibility Quiz (`/compatibility-quiz`)
- **Component:** `app/pages/compatibility-quiz.vue`
- **Steps:** Step 0 (landing/pre-sell with hero variant copy), Steps 1–3 (data collection: names, dates, partner city), Step 4 (loading/API call)
- **API call:** `POST /api/generate-compatibility` (implied by loading state)
- **On success:** stores compatibility score in `analysisStore`, navigates to `/compatibility?preview=1`
- **Tracking:** `$trackCompatibilityQuizStart`

#### Step 2 — Compatibility Paywall (`/compatibility?preview=1`)
- **Component:** `app/pages/compatibility.vue` (CASE B: `isPreview === true`)
- **Shows:** Partial compatibility score, two purchase tiers
- **Email capture:** `onEmailBlur()` calls `POST /api/capture-email` (partial data — empty archetype/traits)
- **Promo code:** validates and applies via `/api/validate-promo` + `/api/apply-promo-access`
- **Checkout:** `handleCheckout('single' | 'with_charts')` → `POST /api/create-compatibility-payment`
- **Tracking:** `$trackCompatibilityPaywallView` (TikTok AddToCart + custom), `clarityTrack('compatibility_paywall_view')`

#### Step 3 — Compatibility Report (`/compatibility?session_id=...&from=quiz`)
- **Component:** `app/pages/compatibility.vue` (CASE A: post-payment)
- **Refresh guard:** `sessionStorage` cache keyed by `omenora_compat_result_{sessionId}` prevents re-generation on F5
- **History view:** `?from=history&session_id=` (CASE H) — requires Bearer token from Supabase auth
- **Promo access:** `?promo=1` (CASE P) — renders from Pinia store data set before navigation

### 2.3 Daily Horoscope Funnel

#### Subscribe Page (`/subscribe`)
- **Component:** `app/pages/subscribe.vue`
- **Collects:** firstName, email, dateOfBirth, timeOfBirth (optional), city
- **API sequence:** `POST /api/calculate-chart` → `POST /api/create-subscription` → Stripe → `/subscription?session_id=...`
- **Price displayed:** `$6.99/month`

#### Daily Page (`/daily`)
- **Component:** `app/pages/daily.vue`
- **Two tabs:** "Daily" (12 zodiac horoscopes) and "Archetype" (personalized archetype reading)
- **Deep link:** `?sign={zodiacSign}` renders specific sign reading

### 2.4 Free Preview vs. Paywall Logic

| Page | Free Content | Gated Content |
|---|---|---|
| `/preview` | Archetype name, personality preview text | Full 7-section report |
| `/compatibility?preview=1` | Compatibility score | 7-section compatibility analysis |
| `/daily` | 12 zodiac horoscopes (no gate apparent) | Archetype tab may require subscription (unable to determine without running app) |

### 2.5 Auth / Account Gates

- **No auth required** for main funnel, compatibility funnel, or subscribe page
- **Account page** (`/account`) linked from report header — details unable to determine without reading `account.vue`
- **Compatibility history view** requires Supabase Bearer token (`restoreSession()` called in compatibility.vue:835)

---

## Section 3: Tracking & Analytics Implementation

### 3.1 Platform Inventory

| Platform | Integration Method | ID / Config Key | Env Var | Init File |
|---|---|---|---|---|
| **TikTok Pixel** | Client-side JS snippet (self-loaded) | `tiktokPixelId` | `NUXT_PUBLIC_TIKTOK_PIXEL_ID` | `app/plugins/pixels.client.ts:34-71` |
| **Meta (Facebook) Pixel** | Client-side JS snippet (self-loaded) | `metaPixelId` | `NUXT_PUBLIC_META_PIXEL_ID` | `app/plugins/pixels.client.ts:74-95` |
| **Google Analytics 4** | Hardcoded `gtag.js` script injection | `G-62M5LR63FH` | None (hardcoded in `nuxt.config.ts:176,180`) | `nuxt.config.ts:173-181` — production only (`NODE_ENV=production`) |
| **Microsoft Clarity** | `@microsoft/clarity` npm package | `clarityProjectId` | `NUXT_PUBLIC_CLARITY_PROJECT_ID` | `app/plugins/clarity.client.ts:1-49` |
| **PostHog** | `posthog-js` npm package | `posthogKey` | `NUXT_PUBLIC_POSTHOG_KEY` | `app/plugins/pixels.client.ts:22-30` |
| **Sentry** | `@nuxtjs/sentry` + `@sentry/vue` | `sentryDsn` | `NUXT_PUBLIC_SENTRY_DSN` | `nuxt.config.ts` (module) |

**Clarity test exclusion:** `?test=1` query param or `localStorage.getItem('omenora_internal_test') === 'true'` skips Clarity init.  
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/clarity.client.ts:13-23`

### 3.2 Auto PageView Tracking

All three pixel platforms fire a page view on every SPA route change:

```typescript
router.afterEach((to) => {
  // TikTok: ttq.page()
  // Meta: fbq('track', 'PageView')
  // GA4: safeGtag('event', 'page_view', { page_path, page_title })
})
```
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:99-111`

### 3.3 Custom Event Master Table

All custom events route through `safeTrack()` which fires TikTok + Meta (as `trackCustom`) + PostHog + GA4 simultaneously. Standard pixel events (ViewContent, InitiateCheckout, etc.) have their own direct calls.

| Event Name | TikTok | Meta | PostHog | GA4 | Trigger Component/Function | Funnel Step |
|---|---|---|---|---|---|---|
| `PageView` (standard) | `ttq.page()` ✓ | `fbq('track','PageView')` ✓ | — | `page_view` ✓ | `router.afterEach` | All pages |
| `ViewContent` | `ttq.track('ViewContent')` ✓ | `fbq('track','ViewContent')` ✓ | — | — | `$trackViewContent` | Preview paywall, compat quiz start |
| `InitiateCheckout` | `ttq.track('InitiateCheckout')` ✓ | `fbq('track','InitiateCheckout')` ✓ | — | — | `$trackInitiateCheckout` | Checkout button click |
| `CompletePayment` / `Purchase` | `ttq.track('CompletePayment')` ✓ | `fbq('track','Purchase')` ✓ | ✓ | ✓ | `$trackPurchase` | Post-payment page load |
| `AddToCart` | `ttq.track('AddToCart')` ✓ | — | — | — | `$trackCompatibilityPaywallView` | Compat paywall view |
| `landing_view` | — | — | ✓ | ✓ | `$trackLandingView` | Landing page |
| `compatibility_quiz_start` | ViewContent ✓ | — | ✓ | ✓ | `$trackCompatibilityQuizStart` | Compat quiz start |
| `compatibility_paywall_view` | AddToCart ✓ | — | ✓ | ✓ | `$trackCompatibilityPaywallView` | Compat paywall |
| `analysis_start` | — | — | ✓ | ✓ | `$trackAnalysisStart` | /analysis mount |
| `step1_complete` | — | — | ✓ | ✓ | `$trackStep1Complete` | After city step (step 3→4 advance) |
| `question_answered` | — | — | ✓ | ✓ | `$trackQuestionAnswered` | Per quiz question watch |
| `analysis_submit` | — | — | ✓ | ✓ | `$trackAnalysisSubmit` | Quiz final submit |
| `preview_loading_start` | — | — | ✓ | ✓ | `$trackPreviewLoadingStart` | /preview load start |
| `preview_loaded` | — | — | ✓ | ✓ | `$trackPreviewLoaded` | /preview render complete |
| `paywall_view` | — | — | ✓ | ✓ | `$trackPaywallView` | Paywall section visible |
| `tier_selected` | — | — | ✓ | ✓ | `$trackTierSelected` | Tier card click |
| `upsell_viewed` | — | — | ✓ | ✓ | `$trackUpsellViewed` | Report upsell section |
| `upsell_accepted` | — | — | ✓ | ✓ | `$trackUpsellAccepted` | Upsell CTA click |
| `report_viewed` | — | — | ✓ | ✓ | `$trackReportViewed` | /report mount |
| `share_card_opened` | — | — | ✓ | ✓ | `$trackShareCardOpened` | Share card modal |
| `share_card_downloaded` | — | — | ✓ | ✓ | `$trackShareCardDownloaded` | PNG download |
| `email_capture_success` | — | — | ✓ | ✓ | `$trackEmailCaptureSuccess` | Email form submit |
| `checkout_complete` | — | — | ✓ | ✓ | `$trackPurchase` (via safeTrack) | Post-payment |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:197-476`

### 3.4 Microsoft Clarity Events

Fired via `useClarity()` composable (`app/composables/useClarity.ts`):

| Event / Tag | Trigger | Source |
|---|---|---|
| `Clarity.event('compatibility_paywall_view')` | `compatibility.vue` CASE B/C (preview mode) | `compatibility.vue` |
| `Clarity.setTag('utm_source')` | On init if present in route query | `clarity.client.ts:43` |
| `Clarity.setTag('utm_medium')` | On init if present | `clarity.client.ts:43` |
| `Clarity.setTag('utm_campaign')` | On init if present | `clarity.client.ts:43` |
| `Clarity.setTag('utm_content')` | On init if present | `clarity.client.ts:43` |
| `Clarity.setTag('utm_term')` | On init if present | `clarity.client.ts:43` |
| `Clarity.setTag('sign')` | On init if present in route query | `clarity.client.ts:43` |
| `Clarity.setTag('archetype')` | On init if present in route query | `clarity.client.ts:43` |

### 3.5 UTM Persistence

- **Session key:** `omenora_utms` (sessionStorage)
- **Tracked params:** `utm_source`, `utm_campaign`, `utm_adset`, `utm_creative`, `utm_medium`, `utm_content`
- **Behavior:** Seeded from URL query params on plugin init; stored in sessionStorage; re-read by every tracking event and attached as event properties
- **Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:141-173`

### 3.6 User Identification

- **TikTok:** SHA-256 hashed email sent via `ttq.identify({ email: hashedEmail, phone_number: '' })`. Fires on email input change in `compatibility.vue` (`$identifyUser`) and at email capture on `preview.vue`
- **No server-side Conversions API (CAPI)** implementation found for TikTok or Meta
- **Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:478-489`

### 3.7 Stripe Webhooks (Server-Side)

**Endpoint:** `POST /api/stripe/webhook` (`server/api/stripe/webhook.post.ts`)  
**Registered Stripe events:**
- `checkout.session.completed` — primary fulfillment path
- `invoice.payment_failed` — deactivates subscriber
- `customer.subscription.deleted` — deactivates subscriber
- `charge.dispute.created` — structured chargeback log
- `charge.refunded` — structured refund log

**Idempotency:** Supabase `stripe_webhook_events` table; unique constraint on `event_id`; Postgres code `23505` = duplicate → 200 immediate return.  
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:25-41`

---

## Section 4: Retargeting & Audience Infrastructure

### 4.1 Abandonment Email Sequence

**Inngest function ID:** `abandonment-sequence`  
**Trigger event:** `abandonmentStarted` (fired from `capture-email.post.ts` after paywall email save)  
**Cancel triggers:**
- `stripeCheckoutCompleted` — any purchase by matching email
- `userUnsubscribed` — unsubscribe link click by matching email

**Sequence timing:**

| Step | Delay | Email Template | Cleanup Action |
|---|---|---|---|
| Step 1 | 10 minutes after trigger | `getEmailTemplate(1, ...)` | Updates `email_captures.sequence_step = 1` |
| Step 2 | 3 hours after step 1 | `getEmailTemplate(2, ...)` | Updates `email_captures.sequence_step = 2` |
| Step 3 | 24 hours after step 2 | `getEmailTemplate(3, ...)` | Updates `email_captures.sequence_step = 3` |
| Step 4 | 47 hours after step 3 (~74h total) | `getEmailTemplate(4, ...)` | Deletes `reports` row by `session_id`; sets `sequence_completed = true` |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/inngest/abandonment-sequence.ts:115-340`

**From address:** `reading@omenora.com`  
**Reply-to:** `support@omenora.com`  
**Resend tags per send:** `sequence_step`, `archetype`, `language`  
**Dedup header:** `X-Entity-Ref-ID: omenora-abandon-{step}-{email}`

**Defense-in-depth:** On each step, re-queries `email_captures` for `purchased` or `sequence_completed` before sending. If either is true, skips send.

### 4.2 Suppression Logic (Purchase Event)

On `checkout.session.completed` webhook: sets `email_captures.purchased = true` AND `sequence_completed = true` for the customer email. Also fires `stripeCheckoutCompleted` Inngest event to cancel any in-flight abandonment sequence via `cancelOn` matcher.  
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:241-262`

### 4.3 Email Capture Points

| Location | Component | API Endpoint | Data Captured |
|---|---|---|---|
| Paywall | `app/pages/preview.vue` | `POST /api/capture-email` | Full: email, firstName, archetypeName, archetypeEmoji, archetypeElement, lifePath, archetypeTraits, birthCity, readingTradition, language, sessionId |
| Compatibility Paywall | `app/pages/compatibility.vue` (`onEmailBlur`) | `POST /api/capture-email` | Partial: email, firstName, empty archetype/traits/lifePath, birthCity, `readingTradition: 'western'` |

### 4.4 Subscriber Welcome (Subscription Purchase)

**Inngest event:** `subscriberWelcomeSend` — fired from webhook on `meta.type === 'subscription'`  
**Dedup ID:** Stripe session ID (24h dedup at Inngest layer)  
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:300-321`

### 4.5 Pixel Retargeting Audiences (Client-Side Only)

| Platform | Audience Signal | Event Used |
|---|---|---|
| TikTok | Reached paywall | `ViewContent` on preview.vue |
| TikTok | Added to cart (compat) | `AddToCart` on compatibility paywall |
| TikTok | Initiated checkout | `InitiateCheckout` on checkout click |
| TikTok | Purchased | `CompletePayment` |
| Meta | Reached paywall | `ViewContent` on preview.vue |
| Meta | Initiated checkout | `InitiateCheckout` on checkout click |
| Meta | Purchased | `Purchase` |

No server-side CAPI (Conversions API) implementation found in codebase for either TikTok or Meta.

---

## Section 5: Content & Organic Asset Inventory

### 5.1 Archetypes

- **Count:** 12 archetypes (referenced in `CRON_SCHEDULE.md`: "Generate 12 archetypes at 6am UTC")
- **Symbol files:** Served from `/public/symbols/` directory as SVG files
- **Grid display:** `index.vue` shows all 12 in an interactive grid (`archetypeSymbols` array — exact names not visible from code without reading the array initialization)
- **Determination logic:** Server-side via `POST /api/calculate-chart` — returns `archetype` string

### 5.2 Daily Horoscope Content

| Content Type | Count | Generation Schedule | Endpoint | AI Model |
|---|---|---|---|---|
| Zodiac sign horoscopes | 12 (one per sign) | Daily 5am UTC (`0 5 * * *`) | `POST /api/generate-daily-horoscope` | Claude (Anthropic) |
| Archetype daily readings | 12 (one per archetype) | Daily 6am UTC (`0 6 * * *`) | `POST /api/generate-daily-cache` | Claude (Anthropic) |

**Delivery:** `POST /api/process-daily-insights` runs every 5 minutes, reads from cache, sends to active subscribers  
**Fallback:** If today's cache is incomplete, falls back to yesterday's complete cache  
**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/CRON_SCHEDULE.md:9-11`

### 5.3 Weekly Transit Emails (Subscribers)

- **Schedule:** `0 8 * * 1` (Monday 8am UTC)
- **Endpoint:** `POST /api/cron/send-weekly-transits`
- **Purpose:** Compatibility-related subscriber emails

### 5.4 Report Content Structure

The main report (`store.report`) contains:

- `archetypeName` — display name
- `element` — elemental association
- `powerTraits` — array of trait strings
- `sections` — object keyed by section name with `{ title, content }` per section (`SECTION_ORDER` array defines order — 7 sections)

Regional sections (one per reading tradition):
- Vedic: `vedicTitle`, `nakshatraName`, `rulingPlanet`, `reading`, `karmicMission`, `remedy`
- BaZi: `baziTitle`, `dayMaster`, `dominantElement`, `reading`

### 5.5 Compatibility Report Content Structure

- `compatibilityScore` — number (0–100)
- `compatibilityTitle` — string
- `sections` — 7 sections with `{ title, content }` per section (`SECTION_ORDER`)
- T2 tier adds: `userBirthChart`, `partnerBirthChart` (Rising, Sun, Moon, Dominant planet, Power house, reading, forecast2026)

### 5.6 Languages

6 languages defined in `translations.ts`:

| Code | Name | Script |
|---|---|---|
| `en` | English | Latin |
| `es` | Español | Latin |
| `pt` | Português | Latin |
| `hi` | हिंदी | Devanagari |
| `ko` | 한국어 | Hangul |
| `zh` | 中文 | Simplified Chinese |

**Note from commit `ad32859`:** "hi/ko/zh machine-assisted, native review pending market expansion"

### 5.7 Reading Traditions / Regions

| Region Code | Tradition Name |
|---|---|
| `western` | Western (default) |
| `india` | Vedic (Jyotish) |
| `china` | BaZi (Four Pillars) |
| `latam` | Spiritual Tarot |
| `korea` | Personality Insight |
| `middleeast` | Destiny Path |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-tradition-payment.post.ts:26-32`

---

## Section 6: Stripe Revenue & Customer Data Extraction Template

The following SQL queries target the Supabase/PostgreSQL database inferred from webhook and Inngest code.  
**Known tables (from webhook.post.ts and abandonment-sequence.ts):** `reports`, `subscribers`, `email_captures`, `stripe_webhook_events`, `promo_codes`, `promo_code_uses`

```sql
-- ── Total one-time purchase revenue (estimated from reports table) ──────────
-- NOTE: actual amount is not stored in reports table per webhook code visible;
-- must be queried from Stripe API directly.

-- One-time purchase count by product type (from Stripe metadata stored in reports)
SELECT
  type,
  COUNT(*) AS purchase_count
FROM reports
GROUP BY type
ORDER BY purchase_count DESC;

-- Active subscriber count
SELECT
  plan_type,
  COUNT(*) FILTER (WHERE active = true) AS active_count,
  COUNT(*) AS total_count
FROM subscribers
GROUP BY plan_type;

-- Abandonment funnel metrics
SELECT
  COUNT(*) AS total_captures,
  COUNT(*) FILTER (WHERE purchased = true) AS converted,
  COUNT(*) FILTER (WHERE sequence_completed = true AND purchased = false) AS sequence_finished_no_purchase,
  COUNT(*) FILTER (WHERE sequence_step = 1 AND purchased = false) AS stuck_at_step_1
FROM email_captures;

-- Promo code usage
SELECT
  pc.code_type,
  pc.code_subtype,
  pc.max_uses,
  pc.current_uses,
  pc.active,
  pc.expires_at
FROM promo_codes pc
ORDER BY pc.current_uses DESC;

-- ── Stripe API export (run via Stripe CLI or dashboard) ──────────────────────
-- stripe payment_intents list --limit=100 --created[gte]=1714953600
-- stripe subscriptions list --limit=100 --status=active
-- stripe customers list --limit=100

-- ── For reconciliation: webhook events volume ─────────────────────────────
SELECT
  event_type,
  COUNT(*) AS count,
  DATE_TRUNC('day', created_at) AS day
FROM stripe_webhook_events
GROUP BY event_type, day
ORDER BY day DESC, count DESC;
```

---

## Section 7: Hosting & Cost Structure

### 7.1 Deployment

| Layer | Provider | Config |
|---|---|---|
| Hosting / Compute | Railway | `railway.json` — single service |
| Build | Docker (`augur/Dockerfile`) | `builder: DOCKERFILE` |
| Start command | `node .output/server/index.mjs` | Nuxt SSR output |
| Healthcheck | `GET /api/health`, timeout 300s | On failure: restart up to 3 times |
| Cron jobs | Railway dashboard (not in `railway.json`) | 4 jobs (see CRON_SCHEDULE.md) |
| Redis | Railway add-on | `NUXT_REDIS_URL` — multi-instance rate limiting |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/railway.json:1-14`, `@/Volumes/ESSD/Projects/Augur-V1/augur/CRON_SCHEDULE.md:1-5`

### 7.2 Third-Party Services

| Service | Purpose | Env Var(s) | Notes |
|---|---|---|---|
| **Supabase** | Database + Auth | `NUXT_SUPABASE_URL`, `NUXT_SUPABASE_SERVICE_KEY`, `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Two URLs: service role (server) + anon role (client) |
| **Stripe** | Payments + Webhooks | `NUXT_STRIPE_SECRET_KEY`, `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NUXT_STRIPE_WEBHOOK_SECRET`, `NUXT_STRIPE_DAILY_PRICE_ID` | API version `2026-03-25.dahlia`; webhook URL `https://omenora.com/api/stripe/webhook` |
| **Anthropic (Claude)** | AI report generation | `NUXT_ANTHROPIC_API_KEY` | All reports, compatibility readings, daily horoscopes |
| **Resend** | Transactional email | `NUXT_RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | From domain `omenora.com`; webhook for bounce/delivery events |
| **Inngest** | Background jobs / event queues | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Abandonment sequence, subscriber welcome, weekly transits |
| **Google Places** | City autocomplete | `NUXT_PUBLIC_GOOGLE_PLACES_KEY` | Used on analysis step 3 and subscribe page |
| **Microsoft Clarity** | Session recordings + heatmaps | `NUXT_PUBLIC_CLARITY_PROJECT_ID` | `@microsoft/clarity@^1.0.2` |
| **TikTok Pixel** | Paid social tracking | `NUXT_PUBLIC_TIKTOK_PIXEL_ID` | Client-side only |
| **Meta Pixel** | Paid social tracking | `NUXT_PUBLIC_META_PIXEL_ID` | Client-side only |
| **PostHog** | Product analytics | `NUXT_PUBLIC_POSTHOG_KEY` | `posthog-js@^1.369.3`, host `app.posthog.com` |
| **Sentry** | Error monitoring | `NUXT_PUBLIC_SENTRY_DSN` | `@nuxtjs/sentry@^8.0.0` + `@sentry/vue@^8.0.0` |
| **Trustpilot** | Social proof widget | None (public widget) | `trustpilot.client.ts` plugin |

### 7.3 Key npm Dependencies (production)

| Package | Version | Purpose |
|---|---|---|
| `nuxt` | `^4.4.2` | Framework |
| `stripe` | `^22.0.1` | Payment processing |
| `@anthropic-ai/sdk` | `^0.86.1` | AI report generation |
| `@supabase/supabase-js` | `^2.102.1` | Database |
| `resend` | `^6.10.0` | Email |
| `inngest` | `^4.2.5` | Background jobs |
| `sweph` | `^2.10.3-5` | Swiss Ephemeris (planetary calculation) |
| `posthog-js` | `^1.369.3` | Analytics |
| `@microsoft/clarity` | `^1.0.2` | Session recording |
| `canvas` | `^3.2.3` | Share card image generation |
| `pdfkit` | `^0.18.0` | PDF report generation |
| `jspdf` | `^4.2.1` | Client-side PDF |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/package.json:18-42`

---

## Section 8: Current Active Experiments / Open Issues

### 8.1 Active A/B Tests

| Mechanism | Param | Value | Behavior | Status |
|---|---|---|---|---|
| URL query (canary) | `preview_variant` | `2tier` | Removes Oracle tier from paywall — only Basic + Popular shown (`isTwoTierVariant`) | Active (no expiry in code) |
| URL query (canary) | `price_test` | `deprioritize1` | Applies `tier--deprioritized` class to Basic tier; shows debug label `variant: deprioritize-1` | Active (no expiry in code) |

**Source:** `@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:660-665`

### 8.2 Recent Significant Commits (April–May 2026)

| Commit | Summary | Impact |
|---|---|---|
| `ad32859` | Phase 3A: Repriced all one-time products (Basic $2.99→$4.99, Calendar $2.99→$4.99, Birth Chart $2.99→$4.99, Compatibility $17.99→$9.99, Tradition $1.99→$2.99) | All payment endpoints |
| `0ebddf0` | Phase 3B: Bundle $4.99→$9.99, Oracle $12.99→$24.99; removed misleading line items from bundle descriptions | preview.vue, payment endpoints |
| `a2f5ae7` | Phase 3C: Daily Horoscope display page + pixel/copy corrections | daily.vue |
| `72d53b0` | Phase 3D: Stripe Checkout description corrections (removed undelivered claims) | create-bundle-payment.post.ts, create-oracle-payment.post.ts |
| `b342b0b` | T2 with_charts tier — paywall, birth charts, delivery flow, i18n | compatibility.vue, create-compatibility-payment.post.ts |
| `c8ed529` | Microsoft Clarity: UTM tagging, test exclusion, funnel event tracking | clarity.client.ts, useClarity.ts |
| `8e15082` | Initial Microsoft Clarity integration | clarity.client.ts |
| `76b527b` | Fix compatibility re-generation on refresh (sessionStorage guard) | compatibility.vue |
| `7fa12b9` | Removed Compatibility legacy tier and /report compatibility upsell | compatibility.vue |
| `705c263` | Removed Compatibility Plus subscription SKU | create-subscription logic |
| `22367ad` | Removed Compatibility Add-on SKU | create-addon-payment.post.ts |
| `e9b4ab7` | Mobile: AnalysisScreen redesign | mobile-app (separate from web) |

### 8.3 Known Inconsistency (Code Bug)

**File:** `server/api/apply-promo-discount.post.ts:3-7`  
**Issue:** `TIER_BASE_PRICES` not updated after Phase 3A/3B repricing. Promo percentage discount calculations use stale base prices:
- `basic: 299¢` (actual: 499¢)
- `bundle: 499¢` (actual: 999¢)
- `oracle: 1299¢` (actual: 2499¢)

A 50% promo on Oracle would calculate as `1299 * 0.50 = 649¢` instead of `2499 * 0.50 = 1249¢`.

### 8.4 Deprecated Config Still Present

| Item | File | Status |
|---|---|---|
| `stripeCompatSinglePriceId` | `nuxt.config.ts:25`, `.env.example:19` | Config key present; env var defined; not used in create-compatibility-payment.post.ts (uses inline `price_data`) |
| `// NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` | `.env.example:18` | Commented out; archive note says "archive the Stripe Price object manually in Stripe Dashboard before deleting" |
| `nuxt-gtag` package | `package.json:33` | Present (`^4.1.0`); commit `d01b307` replaced it with standard gtag.js snippet — may be unused dead dependency |

---

## Data Gaps

The following data points could not be determined from the codebase alone:

1. **Stripe Price ID actual values** — `NUXT_STRIPE_DAILY_PRICE_ID` and `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` are stored only in Railway env vars; not committed to code. The `stripeCompatSinglePriceId` env var exists but appears unused in the current compatibility payment code.

2. **TikTok Pixel ID, Meta Pixel ID, Clarity Project ID, PostHog Key** — All stored in Railway env vars only. Exception: GA4 ID `G-62M5LR63FH` is hardcoded in `nuxt.config.ts:176,180`.

3. **Exact archetype names and symbol file mapping** — The `archetypeSymbols` array in `index.vue` was not read in full; archetype names and their SVG filenames are not confirmed.

4. **Supabase table schemas** — Column types, indexes, and constraints are not determinable from application code alone.

5. **Resend audience/list management** — No audience segmentation or list IDs found; all emails are individual sends.

6. **Revenue figures** — Requires Stripe Dashboard export or Supabase SQL query against the `stripe_webhook_events` or external Stripe data.

7. **Railway resource tier/costs** — Service tier, RAM, CPU, and pricing not determinable from `railway.json`.

8. **Trustpilot account ID and rating** — Widget injected client-side but account credentials and live review data not in codebase.

9. **`account.vue` page content** — Not read; auth gating details and user data display for the account page are unknown.

10. **`apply-promo-access.post.ts` full behavior** — File referenced but not read; exact free-access grant logic unconfirmed.

---

## Verification Commands

Run these from `/Volumes/ESSD/Projects/Augur-V1/augur/` to spot-check this report:

```bash
# 1. Confirm all Stripe unit_amount values (prices)
grep -rn "unit_amount" server/api/ --include="*.ts"

# 2. Confirm A/B test query params
grep -n "preview_variant\|price_test\|isTwoTierVariant\|isPriceTest" app/pages/preview.vue

# 3. Confirm abandonment sequence step delays
grep -n "step.sleep" inngest/abandonment-sequence.ts

# 4. Confirm all custom tracking event names
grep -n "safeTrack\|$trackCustomEvent\|posthog.capture" app/plugins/pixels.client.ts

# 5. Confirm stale TIER_BASE_PRICES in promo discount endpoint
grep -n -A 5 "TIER_BASE_PRICES" server/api/apply-promo-discount.post.ts
```

---

## Files Referenced in This Report

```
augur/app/pages/index.vue
augur/app/pages/analysis.vue
augur/app/pages/preview.vue
augur/app/pages/report.vue
augur/app/pages/compatibility.vue
augur/app/pages/compatibility-quiz.vue
augur/app/pages/subscribe.vue
augur/app/pages/daily.vue
augur/app/plugins/pixels.client.ts
augur/app/plugins/clarity.client.ts
augur/app/plugins/trustpilot.client.ts
augur/app/composables/useLanguage.ts
augur/app/composables/useClarity.ts
augur/app/utils/translations.ts
augur/server/api/create-payment.post.ts
augur/server/api/create-bundle-payment.post.ts
augur/server/api/create-oracle-payment.post.ts
augur/server/api/create-birth-chart-payment.post.ts
augur/server/api/create-calendar-payment.post.ts
augur/server/api/create-tradition-payment.post.ts
augur/server/api/create-compatibility-payment.post.ts
augur/server/api/create-subscription.post.ts
augur/server/api/validate-promo.post.ts
augur/server/api/apply-promo-discount.post.ts
augur/server/api/stripe/webhook.post.ts
augur/inngest/abandonment-sequence.ts
augur/inngest/client.ts
augur/nuxt.config.ts
augur/package.json
augur/.env.example
augur/CRON_SCHEDULE.md
augur/PRODUCT_INVENTORY.md
railway.json
```
