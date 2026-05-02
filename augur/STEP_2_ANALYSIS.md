# STEP 2 ANALYSIS — Stripe Order Bump on Compatibility Single Flow

**Date:** 2026-05-01  
**Analyst:** Read-only audit of `/Volumes/ESSD/Projects/Augur-V1/augur`  
**Scope:** Stripe `optional_items` feasibility, delivery infrastructure, webhook risk, pixel impact, recommended bump product.

---

## SECTION 1 — Stripe API version and `optional_items` support

### Stripe client initialization locations

There is no shared `server/utils/stripe.ts` file. The Stripe client is instantiated inline inside each endpoint. Relevant files:

| File | Line | API version string |
|---|---|---|
| `server/api/create-compatibility-payment.post.ts` | 70–72 | `'2026-03-25.dahlia'` |
| `server/api/stripe/webhook.post.ts` | 61–65 | `'2026-03-25.dahlia' as any` |
| `server/api/create-portal-session.post.ts` | 49–51 | `'2026-03-25.dahlia' as any` |
| `server/api/create-subscription.post.ts` | 23–25 | `'2026-03-25.dahlia' as any` |
| All other `create-*-payment` endpoints | various | `'2026-03-25.dahlia' as any` |

### Stripe npm package version

From `node_modules/stripe/esm/stripe.esm.node.js` line 538:
```
Stripe.PACKAGE_VERSION = '22.0.1';
```

From `node_modules/stripe/esm/apiVersion.d.ts` line 1:
```
export declare const ApiVersion = "2026-03-25.dahlia";
```

### `optional_items` support verdict

**CONFIRMED SUPPORTED — NO BLOCKER.**

The pinned API version `2026-03-25.dahlia` is a 2026 pre-release ("dahlia") version, far exceeding the minimum required `2024-06-20` threshold for `optional_items` on `checkout.sessions.create`. The `as any` cast on the `apiVersion` parameter in most files is a developer workaround for the SDK's TypeScript types not yet recognising this pre-release version string — it does not affect runtime behaviour. The `optional_items` parameter is available.

---

## SECTION 2 — The compatibility single checkout endpoint

**File:** `server/api/create-compatibility-payment.post.ts`  
**Full path:** `/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts`

### `tier === 'single'` branch — full `sessionParams` structure

Lines 86–102:

```typescript
sessionParams = {
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'OMENORA Compatibility Reading',
        description: 'Destiny Compatibility Analysis'
      },
      unit_amount: 1799,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`,
  cancel_url:  `${base}/compatibility?canceled=1`,
  customer_email: isValidEmail(email) ? email : undefined,
  metadata,
}
```

### Metadata fields set on the session

Defined at lines 51–66, applied to all tiers including `single`:

| Field | Source | Notes |
|---|---|---|
| `firstName` | request body | sanitized, max 50 chars |
| `partnerName` | request body | sanitized, max 50 chars |
| `email` | request body | set only if `isValidEmail()` passes, else `''` |
| `tempId` | request body | sanitized, max 100 chars |
| `language` | request body | defaults to `'en'`, max 5 chars |
| `type` | hardcoded | `'compatibility'` |
| `tier` | request body | `'single'` for this flow |
| `partnerDob` | request body | conditional — only if truthy |
| `partnerCity` | request body | conditional — only if truthy |
| `dateOfBirth` | request body | conditional — only if truthy |
| `utm_creative` | request body | conditional — only if truthy |
| `utm_source` | request body | conditional — only if truthy |
| `utm_campaign` | request body | conditional — only if truthy |
| `utm_medium` | request body | conditional — only if truthy |

### Other session parameters

- **`success_url`:** `{base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`
- **`cancel_url`:** `{base}/compatibility?canceled=1`
- **`customer_email`:** Set to the buyer's email if valid, otherwise `undefined` (anonymous session)
- **Stripe Customer object:** Not created. The session is anonymous (`customer_email` only, no `customer:` field). Contrast with `create-subscription.post.ts` which explicitly creates/looks up a Customer object (lines 28–52).
- **`payment_intent_data`:** Not set.
- **`automatic_tax`:** Not set.
- **`billing_address_collection`:** Not set.
- **`phone_number_collection`:** Not set.
- **`mode`:** `'payment'` (one-time, correct for `optional_items` — `optional_items` is only supported in `mode: 'payment'`).

### Integration surface for `optional_items`

The `sessionParams` object is a plain TypeScript object literal assigned to `let sessionParams: Stripe.Checkout.SessionCreateParams` at line 74. Adding `optional_items` requires one additional top-level key on this object in the `tier === 'single'` branch (lines 87–102). The referenced Stripe Product for the bump must be a pre-created Stripe Product+Price (not inline `price_data`) because `optional_items` requires a pre-existing `price` ID, not an inline `price_data` block.

---

## SECTION 3 — Existing daily horoscope infrastructure

### 3.1 Where is the daily horoscope content generated?

**Two separate daily content pipelines exist:**

**Pipeline A — Archetype-based daily insights (subscriber email delivery)**  
- Generator: `server/api/generate-daily-insight.post.ts` — generates a personalized insight for one subscriber (archetype + life path + element + real planetary transits via Swiss Ephemeris). Called per-subscriber by `POST /api/process-daily-insights`.
- Cache generator: `server/api/generate-daily-cache.post.ts` — pre-generates archetype-level daily content into `daily_archetype_cache` table, used as a fallback/source for the insight dispatcher.

**Pipeline B — Zodiac sign daily horoscope (public `/daily` page)**  
- Generator: `server/api/generate-daily-horoscope.post.ts` lines 1–261. Generates content for all 12 zodiac signs using real planetary positions (`getPlanetaryTransits`), stores in `daily_zodiac_cache` table. Sign-based broadcast, not per-user.

**Cron configuration** (`CRON_SCHEDULE.md` lines 9–11, `server/api/cron/trigger.post.ts`):  
Crons are defined in the **Railway dashboard UI**, not in `railway.json`. The `railway.json` file (lines 1–14) contains only build/deploy config, no cron entries.

| Job | Endpoint | Schedule |
|---|---|---|
| Daily Zodiac | `POST /api/generate-daily-horoscope` | `0 5 * * *` (5am UTC) |
| Daily Archetypes | `POST /api/generate-daily-cache` | `0 6 * * *` (6am UTC) |
| Send Insights | `POST /api/process-daily-insights` | `*/5 * * * *` (every 5 min) |
| Weekly Transits | `POST /api/cron/send-weekly-transits` | `0 8 * * 1` (Monday 8am UTC) |

**Output type:** Pipeline A is per-subscriber (personalized). Pipeline B is sign-based broadcast (same content for all Scorpios, etc.).

### 3.2 Where is the daily horoscope delivered?

**Email delivery — subscriber archetype insights (Pipeline A):**  
- Dispatcher endpoint: `server/api/generate-daily-insight.post.ts` lines 264–279. After generating, logs to `daily_insight_logs` table (`subscriber_email`, `sent_date`, `theme_used`, `insight_preview`, `insight_full`, `reflection_question`).
- Delivery is gated by active subscriber status in the `subscribers` table (`active: true`). The `process-daily-insights` cron reads `subscribers` for active rows.

**Web delivery — public zodiac horoscope:**  
- Endpoint: `server/api/get-daily-cache.post.ts` lines 76–166. Public (no auth). Returns all 12 archetype and zodiac rows for a given date and language.
- The public `/daily` page consumes this endpoint.

**Subscription tier gating:**  
- `server/api/create-subscription.post.ts` line 57: uses `config.stripeDailyPriceId` (env var `NUXT_STRIPE_STRIPE_DAILY_PRICE_ID`) — this is the $4.99/mo recurring subscription.
- Webhook at `webhook.post.ts` lines 267–379: `meta.type === 'subscription'` path calls `save-subscriber` which writes to `subscribers` table with `plan_type: 'daily_horoscope'`.
- Only subscribers with `active: true` and `plan_type: 'daily_horoscope'` receive daily insight emails.

### 3.3 Free vs paid daily content

**Free `/daily` page:** Receives zodiac sign-level content (same for all users of a sign): `love`, `job`, `health`, `theme`, `moon_phase`, `sun_sign`, `moon_sign`, `planetary_weather`. Source: `daily_zodiac_cache`. No personalization beyond sun sign.

**Paid subscriber ($4.99/mo):** Receives a *personalized* daily insight by email: content is generated to the subscriber's specific `archetype`, `life_path_number`, and `element` using `generate-daily-insight.post.ts`. The prompt explicitly requires non-generic output grounded in archetype/life-path/element. The insight also includes a `reflection_question` and subject line rotation (15 rotating subjects). This is materially different from the public zodiac page.

**Key differentiator:** The paid subscriber gets an email with archetype-personalized content (e.g., specifically for "The Phoenix, Life Path 7, Fire element"). The free page gets a broadcast zodiac-sign-level horoscope with no archetype personalization.

### 3.4 Can the existing system deliver for exactly 30 days without new code?

**Answer: (B) — The existing system relies on Stripe subscription `active` status only. No `valid_until` or `expires_at` field exists.**

Evidence:

- `server/api/save-subscriber.post.ts` lines 27–43: The `subscribers` table upsert writes these fields: `stripe_customer_id`, `stripe_subscription_id`, `email`, `first_name`, `archetype`, `life_path_number`, `element`, `region`, `active`, `plan_type`. **No `valid_until`, `expires_at`, or `plan_end_date` field is present.**
- `webhook.post.ts` lines 97–130: Access is revoked by setting `active: false` on `invoice.payment_failed` or `customer.subscription.deleted` events — both are Stripe subscription lifecycle events. There is no date-based expiry logic anywhere in the codebase.
- A search for `valid_until`, `expires_at`, `expiry`, and `plan_end` across all server files returned zero results.

**Conclusion:** Selling a "30-day one-time pass" for daily insights as the order bump **requires building a new tracking mechanism**: a `valid_until` date column on `subscribers` (or a separate `one_time_access` table), a check in the `process-daily-insights` dispatcher to honour it, and webhook logic to write the row on purchase. This is new infrastructure, not a configuration change.

---

## SECTION 4 — Alternative bump products already implemented

### Product 1: Compat Add-on $0.99 — `create-addon-payment.post.ts`

- **What it delivers:** `server/api/create-addon-payment.post.ts` lines 28–31: product name `'OMENORA Compatibility Add-on'`, description `'Add compatibility reading to your order — one-time offer'`. `success_url` redirects to `/compatibility?session_id=...&addon=true` (line 37). The `metadata.type` is `'addon'` (line 44).
- **Webhook handling:** Searching `webhook.post.ts` for `meta.type === 'addon'` — **zero matches**. The webhook has no delivery branch for `type: 'addon'`. The `addon=true` query parameter on the success URL implies the compatibility page itself handles this, but there is no corresponding server-side delivery action. This product has a checkout endpoint but **no webhook delivery branch** — delivery is undefined/incomplete from the server side.
- **Contextual fit:** The name "Compatibility Add-on" is contextually relevant for a compatibility buyer. Price ($0.99) is below the $3.99–$5.99 sweet spot.
- **Infrastructure status:** Checkout endpoint exists. Webhook delivery: **not implemented**.

### Product 2: Tradition Switch $1.99 — `create-tradition-payment.post.ts`

- **What it delivers:** `server/api/create-tradition-payment.post.ts` lines 26–33, 40–49: Regenerates the natal destiny report through a different cultural tradition (Vedic, BaZi, Tarot, etc.). `metadata.type` is `'tradition_switch'` (line 64). `success_url` redirects to `/report?session_id=...&tradition_switch=true` (line 53).
- **Webhook handling:** No `type === 'tradition_switch'` branch in `webhook.post.ts`. The `tradition_switch=true` param on success URL implies client-side handling. Server-side delivery: **not confirmed implemented in webhook**.
- **Contextual fit:** Poor. This product is for natal report buyers (redirects to `/report`). A compatibility buyer has no natal report context. Contextually irrelevant.
- **Infrastructure status:** Checkout endpoint exists. Webhook delivery: not in `webhook.post.ts`.

### Product 3: Full Birth Chart $2.99 — `create-birth-chart-payment.post.ts`

- **What it delivers:** `server/api/create-birth-chart-payment.post.ts` lines 28–33: `'OMENORA Full Birth Chart'` — rising sign, moon sign, houses, planetary positions, 2026 forecast. Requires `dateOfBirth`. `metadata.type` is `'birth_chart'` (line 51). `success_url` redirects to `/report?session_id=...&birth_chart=true` (line 40).
- **Webhook handling:** `webhook.post.ts` lines 858–889: `isOraclePurchase` flag triggers birth chart generation (`meta.oracle === 'true'`, line 405). There is no `meta.type === 'birth_chart'` branch. A standalone birth chart purchase through `create-birth-chart-payment.post.ts` has **no independent webhook delivery branch**.
- **Contextual fit:** Poor. Redirects to `/report` (natal page). Requires natal birth data that the compatibility buyer may not have submitted. Contextually weak for a compatibility reading buyer.
- **Infrastructure status:** Checkout endpoint exists. Webhook delivery: not independently implemented.

### Product 4: 2026 Lucky Calendar $2.99 — `create-calendar-payment.post.ts`

- **What it delivers:** `server/api/create-calendar-payment.post.ts` lines 27–32: `'OMENORA 2026 Lucky Timing Calendar'` — month-by-month destiny forecast. `metadata.type` is `'calendar'` (line 46). `success_url` redirects to `/calendar?session_id=...` (line 38).
- **Webhook handling:** No `type === 'calendar'` branch in `webhook.post.ts`. The calendar page (`/calendar`) handles it client-side via `session_id`.
- **Contextual fit:** Moderate. The calendar is natal-personal (generated from the buyer's own archetype, element, life path). A compatibility buyer has a natal profile from the quiz. However, the calendar is about *personal destiny timing*, not about *the relationship* — the contextual fit for a compatibility reading buyer is moderate, not strong.
- **Price:** $2.99 — below the $3.99–$5.99 sweet spot.
- **Infrastructure status:** Checkout endpoint exists. Client-side delivery via `/calendar` page. Generation endpoint `server/api/generate-calendar.post.ts` and PDF endpoint exist. **This is the most complete delivery pipeline of all four alternatives.**

### Summary table

| Product | Type | Price | Webhook delivery | Contextual fit for compat buyer | Sweet spot price? |
|---|---|---|---|---|---|
| Compat Add-on | Impulse | $0.99 | **Not implemented** | High (compatibility-specific name) | No — too low |
| Tradition Switch | Report regen | $1.99 | Not in webhook | Very low (natal-only) | No — too low |
| Full Birth Chart | Natal report | $2.99 | Not standalone | Low (natal-only, needs birth data) | No — too low |
| 2026 Lucky Calendar | Personal calendar | $2.99 | Client-side only | Moderate | No — too low |
| Daily 30-day pass | Subscription-like | $4.99 | **Requires new infra** | Moderate | Yes |

**Key finding:** None of the existing alternative products hits the $3.99–$5.99 sweet spot at their current prices. All four are priced at or below $2.99. Three have incomplete or absent webhook delivery. The calendar has the most complete delivery infrastructure but costs $2.99.

---

## SECTION 5 — The Stripe webhook branching

**File:** `server/api/stripe/webhook.post.ts`  
**Full path:** `/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts`

### Full set of metadata-based branching conditions

The webhook routes on `stripeEvent.type` first, then on `meta.type` and `meta.tier`:

| Event type | Branch condition | Action |
|---|---|---|
| `invoice.payment_failed` | — | Deactivate subscriber (`active: false`) by `stripe_customer_id` |
| `customer.subscription.deleted` | — | Deactivate subscriber (`active: false`) by `stripe_customer_id` |
| `charge.dispute.created` | — | Structured logging only (B-4) |
| `charge.refunded` | — | Structured logging only (B-4) |
| `checkout.session.completed` | `meta.type === 'subscription'` OR (`meta.type === 'compatibility'` AND `meta.tier === 'subscription'`) | Save subscriber + fire `subscriber/welcome.send` Inngest event |
| `checkout.session.completed` | Any other `meta.type` (falls through) | Save/generate natal report + send report email |
| Any other event type | — | Return `{ received: true }` silently (line 228–230) |

Lines 404–405 decode two additional boolean flags from metadata:
```typescript
const isBundlePurchase = meta.bundle === 'true'   // line 404
const isOraclePurchase = meta.oracle === 'true'   // line 405
```
These alter the email content (calendar + birth chart included) but do not create a separate delivery branch.

### How the webhook detects which delivery action to take

The primary discriminator is `meta.type` (lines 267, and implicitly the fall-through path). For `checkout.session.completed`:

1. **Subscription path** (line 267): catches `meta.type === 'subscription'` (natal subscription from `create-subscription.post.ts`) and `meta.type === 'compatibility' && meta.tier === 'subscription'` (compat plus from `create-compatibility-payment.post.ts`). Action: `save-subscriber` + Inngest welcome event.

2. **Everything else** (lines 382–611): treats the session as a natal report purchase. Loads/generates report, saves to `reports` table, sends report email via `sendReportEmailViaWebhook`. This path checks `isBundlePurchase` / `isOraclePurchase` for extras but its core assumption is: **this is a natal archetype report**.

**Critical observation:** There is no `meta.type === 'compatibility' && meta.tier === 'single'` branch. A compatibility single payment (`type: 'compatibility'`, `tier: 'single'`) falls through to the "everything else" path (lines 382+), which then looks for `firstName`, `dateOfBirth`, `archetype` (line 494) to generate a natal report. Since these fields may be empty or partial in a compatibility single session, the webhook logs `'incomplete_metadata'` warning (line 496) and returns without doing anything for the compatibility delivery. **The compatibility single delivery is handled entirely client-side** (the `/compatibility` page `onMounted` detects `session_id`, calls `/api/verify-payment`, then `/api/generate-compatibility`).

### Multi-line-item session risk analysis

**This is the highest-risk area.** When `optional_items` is used and the buyer checks the bump, a single `checkout.session.completed` event fires for the entire session — one event, two line items. The current webhook does not inspect line items at all. It branches exclusively on `meta.type` and `meta.tier`.

**Current behaviour for a single `meta.type === 'compatibility'` + `meta.tier === 'single'` session:**
- Subscription branch (line 267): skipped — `tier` is `'single'`, not `'subscription'`.
- Fall-through path (line 382+): looks for natal report metadata (`archetype`, `dateOfBirth`). If present, attempts to generate a natal report (incorrect for a compatibility buyer). If absent, logs `'incomplete_metadata'` and returns `{ received: true }`.
- **In neither case does the webhook deliver the bump product.** The bump delivery must be explicitly added.

**What needs to change in the webhook to support the bump:**
A new branch must be added before the fall-through, matching `meta.type === 'compatibility' && meta.tier === 'single'`. Within that branch, if `meta.bump` (or equivalent flag) is `'true'`, the bump product delivery logic must execute. Without this, a buyer who pays $22.98 receives: compatibility reading (delivered client-side) + bump product (never delivered).

---

## SECTION 6 — Pixel and analytics value reporting

**File:** `app/pages/compatibility.vue`  
**Purchase pixel block:** Lines 905–917

```typescript
const pixelKey = `omenora_purchase_tracked_${sessionId}`
if (!sessionStorage.getItem(pixelKey)) {
  sessionStorage.setItem(pixelKey, '1')
  const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)  // line 910
  $trackPurchase?.({
    value: purchaseValue,
    currency: 'USD',
    content_name: meta.tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
  })
}
```

**`value` computation (line 910):** Hardcoded by tier. The value is NOT derived from the actual Stripe session amount. It is a ternary based on `meta.tier`.

**Problem with the bump scenario:** If the buyer adds the bump and pays $22.98:
- `meta.tier` is still `'single'` (metadata is set before Stripe Checkout renders).
- The pixel fires `value: 17.99` — missing the $4.99 bump contribution.
- ROAS is understated by $4.99 per order-bump conversion.

**Options (analysis only, no recommendation on implementation):**
- **Option A:** Read the actual `amount_total` from the Stripe session via `/api/verify-payment` (which already calls `stripe.checkout.sessions.retrieve`) and pass it as `value`. This would give `value: 22.98` automatically. Requires `/api/verify-payment` to return `amountTotal` and `compatibility.vue` to use it.
- **Option B:** Add a separate bump metadata flag (e.g., `meta.bump_purchased === 'true'`) and conditionally add $4.99 to the hardcoded value. More brittle — hardcodes bump price in the client.
- **Option C:** Fire two separate purchase events — one at 17.99, one at 4.99 with bump-specific `content_name`. Cleanest for attribution, but inflates conversion count.

The `/api/verify-payment` endpoint would need to be checked for whether it already returns `amount_total` — this was not read in this audit and should be read before implementing Option A.

---

## SECTION 7 — UI surface for the bump

**File:** `app/pages/compatibility.vue`, `handleCheckout` function, lines 685–750

The checkout flow is:

1. User clicks "Get this forecast — $17.99" on `/compatibility` → `handleCheckout('single')` fires (line 685).
2. Client calls `POST /api/create-compatibility-payment` (line 722) with `tier: 'single'`.
3. Server returns `{ sessionId, url }` (line 140 of `create-compatibility-payment.post.ts`).
4. Client redirects: `window.location.href = url` (line 744 of `compatibility.vue`).

`url` is `session.url` — the Stripe-hosted Checkout URL. **This is Stripe-hosted Checkout, not an embedded Payment Element or a custom payment form.**

**Verdict for `optional_items`:** Because the flow uses Stripe-hosted Checkout (`mode: 'payment'`, `window.location.href = url`), the `optional_items` bump checkbox is rendered entirely by Stripe on their hosted page. **No UI changes to `/compatibility` are required for the bump to render.** The bump appears as a checkbox on the Stripe Checkout page itself, below the main line item.

Note: `optional_items` is **not** supported in Stripe's embedded Payment Element or Payment Links — only on hosted Checkout sessions with `mode: 'payment'`. This codebase uses hosted Checkout for the single tier, so compatibility is confirmed.

---

## SECTION 8 — Refunds and edge cases

### Refund endpoint

A search for `refund` across all `.vue` and `.ts` source files (excluding `node_modules`) found:
- **No refund API endpoint exists.** There is no `server/api/refund.post.ts` or equivalent.
- `server/api/stripe/webhook.post.ts` lines 184–226: handles `charge.refunded` webhook events with structured **logging only** (`console.warn`). No access revocation, no DB update, no notification.

### Refund guarantee in paywall copy

A search for `guarantee` and `refund` in `app/pages/compatibility.vue` and `app/utils/translations.ts` returned **zero results**. There is no money-back guarantee copy in the compatibility paywall. No refund promise was found in the code.

### Partial refund capability for a $22.98 bump purchase

- Stripe itself supports partial refunds (the `stripe.refunds.create` API). The codebase does not expose this functionality.
- All refunds today are **manual** — issued directly through the Stripe Dashboard by a human operator.
- A $22.98 session (single + bump) can be refunded partially (e.g., $4.99 for the bump only, or $17.99 for the main reading only) via the Stripe Dashboard, but there is no automated or API-driven mechanism for this in the codebase.
- The `charge.refunded` webhook handler logs the `amount_refunded` in cents (line 209) but takes no automated action on partial refunds.

---

## SECTION 9 — Out-of-scope confirmations

### Files confirmed untouched by Step 2

| Product / Flow | Key file | Confirmation |
|---|---|---|
| `/preview` natal paywall | `app/pages/preview.vue` | No checkout changes needed; different endpoint (`create-payment.post.ts`) |
| Calendar checkout | `server/api/create-calendar-payment.post.ts` | Separate endpoint, separate `meta.type: 'calendar'` |
| Daily horoscope $4.99/mo subscription | `server/api/create-subscription.post.ts` | Separate endpoint, separate `meta.type: 'subscription'` |
| Oracle payment | `server/api/create-oracle-payment.post.ts` | Separate endpoint, `meta.oracle: 'true'` flag |
| Bundle payment | `server/api/create-bundle-payment.post.ts` | Separate endpoint, `meta.bundle: 'true'` flag |
| Compat addon $0.99 | `server/api/create-addon-payment.post.ts` | Separate endpoint, `meta.type: 'addon'` |
| Tradition switch | `server/api/create-tradition-payment.post.ts` | Separate endpoint, `meta.type: 'tradition_switch'` |
| Birth chart | `server/api/create-birth-chart-payment.post.ts` | Separate endpoint, `meta.type: 'birth_chart'` |
| Compat plus subscription | `create-compatibility-payment.post.ts` tier=subscription branch | Separate branch, `meta.tier: 'subscription'` |
| Mobile app | `mobile-app/` directory | Not touched by Step 2 |

### Shared surfaces that must not be broken

Two shared surfaces are used by multiple flows and will require careful handling:

1. **`server/api/stripe/webhook.post.ts`** — handles ALL paid checkout events. Step 2 adds a new branch here. The new branch must be inserted **before** the fall-through "generate natal report" path (line 382) and must be tightly scoped to `meta.type === 'compatibility' && meta.tier === 'single'` so it does not intercept any other flow. The existing subscription branch at line 267 is unaffected as long as the new branch only matches `tier === 'single'`.

2. **`server/api/create-compatibility-payment.post.ts`** — only the `tier === 'single'` branch (lines 86–102) is modified. The `tier === 'subscription'` branch (lines 76–85) and `tier === 'legacy'` branch (lines 103–121) must remain untouched.

---

## SECTION 10 — Recommended bump product decision

### Decision

**Recommended bump product: 2026 Lucky Timing Calendar, repriced to $4.99 for the bump context.**

### Rationale

**Daily 30-day pass is disqualified** for Step 2 because it requires new infrastructure: a `valid_until` column on `subscribers`, a date-expiry check in the `process-daily-insights` dispatcher, and a new webhook delivery branch. This is 3+ new backend components. Wrong scope for an order bump step.

**The 2026 Lucky Calendar at $4.99 is the correct choice** for the following reasons:

1. **Contextual fit — acceptable.** The compatibility buyer has just submitted their birth date. The calendar is generated from their natal archetype + life path — data the compatibility flow already collects (both DOBs are present). The pitch writes itself: *"Add your personal 2026 Timing Calendar — see your peak months, love windows, and caution periods."* It shifts focus from the couple to the individual, which is a natural upsell pivot after a compatibility result.

2. **Infrastructure is the most complete of any candidate.** `server/api/generate-calendar.post.ts` and `server/api/generate-calendar-pdf.post.ts` exist. The `/calendar` page (`app/pages/calendar.vue` — confirmed by `create-calendar-payment.post.ts` line 38 `success_url`) already handles post-payment delivery client-side via `session_id`. The calendar generation in `webhook.post.ts` is triggered for bundle/oracle purchases (lines 816–855), confirming the generation pipeline is production-tested.

3. **`optional_items` requires a pre-existing Stripe Price ID.** A new Stripe Product + Price of $4.99 must be created in the Stripe Dashboard and its ID stored in an env var (e.g., `NUXT_STRIPE_COMPAT_CALENDAR_BUMP_PRICE_ID`). This is a one-time setup step, not code.

4. **Price.** The calendar is currently sold standalone at $2.99. As an order bump on a $17.99 purchase, $4.99 is reasonable — it represents a premium for the frictionless add-on context and hits the $3.99–$5.99 sweet spot.

### Buyer-facing label (Stripe Checkout bump checkbox)

```
Add my 2026 Lucky Timing Calendar — $4.99
```
*(Stripe renders this as the bump checkbox label on the hosted Checkout page)*

### Price in cents

`499`

### Exact files requiring changes

| File | Change type |
|---|---|
| `server/api/create-compatibility-payment.post.ts` | Add `optional_items` block + new env var reference in `tier === 'single'` branch |
| `server/api/stripe/webhook.post.ts` | Add `meta.type === 'compatibility' && meta.tier === 'single'` branch; detect bump purchase via line items or metadata flag; trigger calendar delivery |
| `app/pages/compatibility.vue` | Update `purchaseValue` at line 910 to account for bump (read actual session amount or add bump flag) |
| `nuxt.config.ts` | Add new env var `stripeCompatCalendarBumpPriceId` to `runtimeConfig` |
| `.env.example` | Add `NUXT_STRIPE_COMPAT_CALENDAR_BUMP_PRICE_ID=` |

**Estimated total edits: 5 files, approximately 15–25 line changes.**

---

## SECTION 11 — Recommended execution order for Step 2

1. **Stripe Dashboard setup (no code):** Create a new Stripe Product "OMENORA 2026 Timing Calendar Add-on" with a one-time price of $4.99 (499 cents). Copy the Price ID (format `price_...`). Set env var `NUXT_STRIPE_COMPAT_CALENDAR_BUMP_PRICE_ID` in Railway.

2. **`nuxt.config.ts` + `.env.example`:** Add `stripeCompatCalendarBumpPriceId: ''` to `runtimeConfig` server block. Add the env var key to `.env.example`. *(Prerequisite for the endpoint change.)*

3. **`server/api/create-compatibility-payment.post.ts`:** In the `tier === 'single'` branch (lines 86–102), add `optional_items: [{ price: config.stripeCompatCalendarBumpPriceId, quantity: 1 }]` to `sessionParams`. Also add a `metadata` bump indicator (e.g., `bump_product: 'calendar'`) so the webhook can identify what was purchased without inspecting line items. *(Core Stripe integration change.)*

4. **`server/api/stripe/webhook.post.ts`:** Add a new branch before line 382 (the fall-through natal-report path) matching `meta.type === 'compatibility' && meta.tier === 'single'`. Within this branch: (a) retrieve session line items to detect whether the calendar bump was purchased, OR check a metadata flag set in step 3; (b) if bump purchased, trigger calendar generation and delivery to buyer's email. *(Highest-risk change — test carefully for regression against other webhook branches.)*

5. **`app/pages/compatibility.vue` line 910:** Update `purchaseValue` to reflect actual amount paid. Either pass `amountTotal` from `/api/verify-payment` response, or add bump-flag check. *(Pixel accuracy fix.)*

6. **Verification steps:**
   - Use Stripe test mode to complete a checkout with `optional_items` bump checked and unchecked.
   - Verify webhook receives `checkout.session.completed` with correct line items in both cases.
   - Verify calendar delivery fires only when bump is checked.
   - Verify pixel fires correct value in both cases.
   - Verify existing compat subscription flow, natal paywall flow, and calendar standalone flow are unaffected.

---

## QUESTIONS FOR HUMAN

1. **Bump price confirmation:** The analysis recommends repricing the calendar bump at **$4.99** (vs. its standalone $2.99). Do you confirm $4.99 as the bump price, or would you prefer a different price in the $3.99–$5.99 range?

2. **Bump detection mechanism in webhook:** `optional_items` on the Stripe session means the buyer may or may not have checked the bump. The webhook must determine whether the bump was purchased. Two options:
   - **(A) Inspect session line items:** Call `stripe.checkout.sessions.listLineItems(sessionId)` inside the webhook and check if the calendar Price ID appears. Clean but requires one extra Stripe API call per webhook event.
   - **(B) Metadata flag:** Set `bump_product: 'calendar'` unconditionally in the session metadata, then check `session.total_details` or `amount_total` to infer whether it was purchased (comparing `amount_total` to 1799 vs 2298). Less clean but avoids extra API call.
   Which approach do you prefer?

3. **Calendar delivery for bump buyers:** The standalone calendar flow delivers via the `/calendar` page (client-side, requires the buyer to navigate there). For a bump buyer returning to `/compatibility` after payment, there is no automatic calendar delivery. Two options:
   - **(A) Email delivery only:** Webhook generates calendar and emails it (PDF or inline) to the buyer. No new page needed.
   - **(B) Surface on `/compatibility` post-payment page:** The compatibility success page shows a "Your calendar is ready" section if bump was purchased, linking to `/calendar?session_id=...`. Requires a UI change to `compatibility.vue`.
   Which delivery method for bump buyers?

4. **Daily insights bump — deferred or permanently dropped?** The 30-day daily insight pass was rejected for Step 2 due to infrastructure requirements. Should it be added to the backlog as Step 4 / a future bump option, or is it permanently dropped in favour of the calendar?

5. **Pixel reporting for bump purchases:** Three options were identified (Section 6). Which do you prefer: (A) single event at actual session `amount_total` (e.g., $22.98), (B) hardcoded ternary with bump flag, or (C) two separate purchase events ($17.99 + $4.99)?
