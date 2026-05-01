# STEP 1 ANALYSIS — OMENORA Compatibility Price Raise & Visual Reorganization
**Generated:** 2026-05-01 | **Analyst:** Read-only audit of codebase at `/Volumes/ESSD/Projects/Augur-V1/augur`  
**Scope:** $7.99 → $17.99 single reading price change + visual hierarchy swap on `/compatibility` paywall

---

## SECTION 1 — Where the $7.99 Price Lives

### 1.1 — Literal string `"7.99"` / `"$7.99"` in source (non-node_modules)

#### `app/utils/translations.ts` — **Display copy (6 occurrences across 4 locales)**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/utils/translations.ts:259
compatSinglePrice: '$7.99',
```
- **Lines 259–260** (`en` locale): `compatSinglePrice: '$7.99'` and on line 264: `compatSingleCta: 'Get this forecast — $7.99'`
- **Lines 523–528** (`es` locale): `compatSinglePrice: '$7.99'` (line 523) and `compatSingleCta: 'Obtener este pronóstico — $7.99'` (line 528)
- **Lines 787–792** (`pt` locale): `compatSinglePrice: '$7.99'` (line 787) and `compatSingleCta: 'Obter este pronóstico — $7.99'` (line 792)
- **Lines 1243** (`ko` locale): `compatSingleCta: '이 포레스트 얻기 — $7.99'` — **NOTE: `compatSinglePrice` key is absent from the `ko` locale block** (lines 1226–1251); the price key falls through to the `en` fallback via `lang[key] ?? en[key] ?? key` in the `t()` function at line 1517.
- **Lines 1504** (`zh` locale): `compatSingleCta: '获得此预测 — $7.99'` — **NOTE: `compatSinglePrice` key is also absent from the `zh` locale block** (lines 1499–1512); same fallback applies.

**Role:** Pure display strings rendered in the paywall template at `compatibility.vue` lines 323 and 337.

---

#### `app/pages/compatibility.vue` — **Pixel event values (3 occurrences)**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:690
value: tier === 'subscription' ? 9.99 : 7.99,
```

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:697
value: tier === 'subscription' ? 9.99 : 7.99,
```
- **Lines 688–698**: Inside `handleCheckout()`. Two uses of `7.99` — one passed to `$trackInitiateCheckout` (line 690) and one passed to `trackEvent('initiate_checkout', ...)` (line 697).
- **Role:** These are the `InitiateCheckout` pixel event values for Meta Pixel, TikTok Pixel, PostHog, and GA4. If not updated, they will report wrong ROAS when price is $17.99.

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:904
const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 7.99 : 2.99)
```
- **Line 904**: Inside `onMounted()` post-payment branch. The `purchaseValue` for the `$trackPurchase` pixel event. If `meta.tier === 'single'`, this fires `7.99`.
- **Role:** `Purchase` event value sent to Meta Pixel, TikTok Pixel (`CompletePayment`), PostHog (`checkout_complete`), and GA4. **SILENT BREAK if missed.**

---

#### `app/plugins/pixels.client.ts` — **Hardcoded AddToCart pixel value (1 occurrence)**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:341
value: 7.99,
```
- **Lines 334–344**: Inside `trackCompatibilityPaywallView()`. This fires a TikTok `AddToCart` event with `value: 7.99` hardcoded — not a variable, not derived from tier.
- **Role:** TikTok `AddToCart` pixel event fired when the compatibility paywall renders (called at `compatibility.vue` line 811). **SILENT BREAK if missed.**

---

### 1.2 — Integer `799` (Stripe cents)

#### `server/api/create-compatibility-payment.post.ts` — **The Stripe checkout `unit_amount` (1 occurrence)**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:93
unit_amount: 799,
```
- **Lines 86–102**: Inside the `tier === 'single'` branch. Uses inline `price_data` with `unit_amount: 799` (cents). **This is what Stripe actually charges.** It is NOT using a pre-created Price ID for the single tier.
- **Role:** The actual charge amount. **HARD BREAK if missed** — Stripe will still charge $7.99 regardless of any UI or pixel change.

---

### 1.3 — Stripe Price ID environment variable

The `.env` file at `/Volumes/ESSD/Projects/Augur-V1/augur/.env` contains:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/.env:11
NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID=price_1TQRzVDebD8pElyXeIeVem6b
```

- **`NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID`** maps to runtime config key `stripeCompatSinglePriceId` (declared at `nuxt.config.ts` line 44).
- **CRITICAL FINDING: This env var exists and is populated, but is NEVER READ by `create-compatibility-payment.post.ts`**. The `single` branch at lines 86–102 uses inline `price_data` / `unit_amount: 799` instead. The `stripeCompatSinglePriceId` runtime config key is declared in `nuxt.config.ts` (line 44) but is not referenced anywhere in server-side API code. It is dead config.
- The `subscription` tier correctly uses `config.stripeCompatPlusPriceId` (a pre-created Stripe Price ID) at line 79.

---

### 1.4 — `apply-promo-discount.post.ts` — Compatibility single NOT in TIER_BASE_PRICES

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/apply-promo-discount.post.ts:3-7
const TIER_BASE_PRICES: Record<string, { cents: number; name: string }> = {
  basic:  { cents: 299,  name: 'OMENORA Destiny Report — Basic' },
  bundle: { cents: 499,  name: 'OMENORA Destiny Report + Bundle' },
  oracle: { cents: 1299, name: 'OMENORA Full Oracle Bundle' },
}
```

- **Confirmed:** `apply-promo-discount.post.ts` handles only `basic`, `bundle`, and `oracle` tiers. The compatibility single reading is **not in this map**. The `assertInput(tier in TIER_BASE_PRICES, 'Invalid tier')` guard at line 30 would reject any promo discount attempt for the `single` compatibility tier. No change needed here.

---

### 1.5 — Type / metadata reference `type === 'compatibility'` / `tier === 'single'`

- `create-compatibility-payment.post.ts` line 57: `type: 'compatibility'` set in Stripe session metadata — this is a label, not a price calculation. No change needed.
- `create-compatibility-payment.post.ts` line 58: `tier` echoed into metadata from the request body.
- `compatibility.vue` line 904: `meta.tier === 'single'` is used to select `purchaseValue = 7.99` — this is the pixel event branch already cited above.

---

## SECTION 2 — The Stripe Price ID Question

**Endpoint:** `server/api/create-compatibility-payment.post.ts`

**Finding: The single reading uses inline `price_data` with `unit_amount` — NOT a pre-created Price ID.**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:86-102
} else if (tier === 'single') {
    sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'OMENORA Compatibility Reading', description: 'Destiny Compatibility Analysis' },
          unit_amount: 799,
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

**Implication:** Changing the price requires a **code change** to `unit_amount` (799 → 1799) in this file. There is no Stripe dashboard price object to update for the single tier. The env var `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` (`price_1TQRzVDebD8pElyXeIeVem6b`) exists but is not used by this endpoint — it is dead configuration.

---

## SECTION 3 — The Paywall Page Structure

**File confirmed at:** `/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue`  
**Total file length:** 1687 lines (1–420 template, 422–925 script, 928–1686 styles)

### 3.1 — Paywall card line ranges

The paywall is inside the `v-else-if="isPreviewMode && previewData"` block starting at line 154. The paywall cards are inside `<div v-if="!compatAppliedPromo" class="paywall">` starting at line 307.

**Single reading card (primary — Option 1):**
```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:319-339
<!-- Option 1: Single (dominant) -->
<div class="pay-card pay-card--primary">
  <p class="label-caps pay-card__badge">{{ t('compatSubBadge') }}</p>
  <p class="pay-card__name">{{ t('compatSingleName') }}</p>
  <p class="pay-card__price font-serif">{{ t('compatSinglePrice') }}<span class="pay-card__freq annotation"> {{ t('compatSingleFreq') }}</span></p>
  <ul class="pay-card__bullets annotation">
    <li>{{ t('compatSingleBullet1') }}</li>
    <li>{{ t('compatSingleBullet2') }}</li>
    <li>{{ t('compatSingleBullet3') }}</li>
  </ul>
  <CTAButton ... @click="handleCheckout('single')">
    ...{{ t('compatSingleCta') }}...
  </CTAButton>
</div>
```
- **Lines 319–339**

**Subscription card (secondary — Option 2):**
```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:341-364
<!-- Option 2: Subscription (secondary) -->
<div class="pay-card pay-card--secondary">
  ...
</div>
```
- **Lines 341–364**

### 3.2 — CSS classes on each card

**Single / primary card:**
- Container: `pay-card pay-card--primary` (lines 320, 1421–1425)
- Badge: `label-caps pay-card__badge` — positioned absolutely via `position: absolute; top: -1px; left: 24px;` (lines 1431–1441)
- Name: `pay-card__name` (line 322, lines 1443–1450)
- Price: `pay-card__price font-serif` (line 323, lines 1457–1464)
- Freq: `pay-card__freq annotation` (line 323, lines 1471–1474)
- Bullets: `pay-card__bullets annotation` (lines 324–328, lines 1476–1499)
- CTA: `pay-card__btn` via `<CTAButton>` (line 332–338, lines 1501–1509)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:1421-1425
.pay-card--primary {
  border: 1px solid var(--color-ink-mid);
  border-left: 2px solid var(--color-ink);
  padding-top: 36px;
}
```

**Subscription / secondary card:**
- Container: `pay-card pay-card--secondary` (lines 342, 1427–1429)
- Name: `pay-card__name` with override at `.pay-card--secondary .pay-card__name` (lines 1452–1455)
- Price: `pay-card__price font-serif` with override at `.pay-card--secondary .pay-card__price` (lines 1466–1469)
- CTA: `pay-card__btn pay-card__btn--secondary` — native `<button>` (NOT a `<CTAButton>`) (line 352–360, lines 1511–1528)
- Footnotes: `annotation pay-card__footnote` and `.pay-card__footnote--muted` (lines 361–363, lines 1540–1548)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:1427-1429
.pay-card--secondary {
  border: 1px solid var(--color-ink-ghost);
}
```

### 3.3 — Card wrapper relationship

The two cards are **sibling elements** both inside the shared `<div v-if="!compatAppliedPromo" class="paywall">` wrapper (lines 307–410). They are not nested inside a separate sub-container — they sit directly inside `.paywall`.

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:307
<div v-if="!compatAppliedPromo" class="paywall">
  ...
  <div class="pay-card pay-card--primary">   ← lines 320–339
  <div class="pay-card pay-card--secondary"> ← lines 342–364
  ...
</div>
```

### 3.4 — Flag-based variants (`?preview_variant=2tier` / `?price_test=deprioritize1`)

**These query-param canary variants do NOT exist in `compatibility.vue`.** A search across the entire source confirms they are only present in `app/pages/preview.vue` (lines 660–665):

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:661-665
const previewVariant = computed(() => route.query.preview_variant as string | undefined)
const isTwoTierVariant = computed(() => previewVariant.value === '2tier')

// ── B6-3: Tier 1 de-emphasis canary (?price_test=deprioritize1) ─────
const isPriceTest = computed(() => route.query.price_test === 'deprioritize1')
```

**Confirmed:** `compatibility.vue` has no query-param variant toggle mechanism. The prior funnel map referenced `/preview` variants, not the compatibility paywall. The compatibility paywall renders deterministically with no A/B flag gates.

### 3.5 — Exact location of notable elements

- **Badge** (`t('compatSubBadge')` = "Recommended"): Line 321, inside `.pay-card--primary`, rendered via `<p class="label-caps pay-card__badge">`. Styled absolutely at `.pay-card__badge` (lines 1431–1441).
- **Price display**: Line 323 — `{{ t('compatSinglePrice') }}` renders `$7.99`.
- **CTA button**: Lines 329–338 — `<CTAButton @click="handleCheckout('single')">` with text `{{ t('compatSingleCta') }}` = "Get this forecast — $7.99".
- **Feature bullets**: Lines 324–328.
- **Email capture block**: Lines 366–401 — `.capture-block` is **outside** both card divs, directly inside `.paywall`.
- **Promo code block**: Lines 239–276 — `.compat-promo` is **outside** `.paywall` entirely (above it in the template).
- **Guarantee block**: Lines 403–408 — `.guarantee` is **inside** `.paywall` but below both cards.
- **"Secure payment" line**: Line 409 — `.compat-trust-secure` is **inside** `.paywall` but below guarantee.

---

## SECTION 4 — Pixel Tracking on the Paywall

### 4.1 — ViewContent / AddToCart on paywall render

**`$trackCompatibilityPaywallView`** is called at `compatibility.vue` line 811, inside the `onMounted` CASE B/C branch (preview mode). It is implemented in `pixels.client.ts` at lines 334–351:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/plugins/pixels.client.ts:334-351
trackCompatibilityPaywallView: (params: { score?: number }) => {
  try {
    if (tiktokPixelId && (window as any).ttq) {
      ;(window as any).ttq.track('AddToCart', {
        content_type: 'product',
        content_name: 'Compatibility Reading',
        content_id: 'compatibility_reading',
        value: 7.99,        // ← HARDCODED
        currency: 'USD',
      })
    }
  } ...
  safeTrack('compatibility_paywall_view', { score: params.score, ... })
},
```

- **TikTok `AddToCart`**: Fires with `value: 7.99` hardcoded at **pixels.client.ts line 341**. **SILENT BREAK if missed.**
- **Meta Pixel**: No `ViewContent` or `AddToCart` is fired by this function for Meta — only TikTok gets the value here.
- **`safeTrack('compatibility_paywall_view', ...)`**: Does not include a value field — not a revenue event.

### 4.2 — InitiateCheckout on buy button click

Called inside `handleCheckout()` at `compatibility.vue` lines 688–698:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:689-697
$trackInitiateCheckout?.({
  value: tier === 'subscription' ? 9.99 : 7.99,   // ← line 690
  currency: 'USD',
  content_name: tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
})
...
trackEvent('initiate_checkout', {
  tier,
  value: tier === 'subscription' ? 9.99 : 7.99,   // ← line 697
})
```

- **`$trackInitiateCheckout` (line 690)**: Fires Meta `InitiateCheckout` and TikTok `InitiateCheckout` with the value. Defined at `pixels.client.ts` lines 237–266. Both platforms receive `value: 7.99` for single tier. **SILENT BREAK if missed.**
- **`trackEvent('initiate_checkout')` (line 697)**: Fires PostHog and GA4 via `safeTrack`. Also uses `7.99`. **SILENT BREAK if missed.**

### 4.3 — Purchase after success redirect

Called inside `onMounted()` CASE A (post-payment) at `compatibility.vue` lines 900–911:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:904-910
const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 7.99 : 2.99)
$trackPurchase?.({
  value: purchaseValue,
  currency: 'USD',
  content_name: meta.tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
})
```

- `$trackPurchase` is defined at `pixels.client.ts` lines 268–307. It fires:
  - TikTok `CompletePayment` with `value: purchaseValue`
  - Meta `Purchase` with `value: purchaseValue`
  - `safeTrack('checkout_complete', ...)` → PostHog + GA4

When `meta.tier === 'single'`, `purchaseValue = 7.99`. **SILENT BREAK if missed.**

### 4.4 — Summary: occurrences of `7.99` tied to pixel revenue values

| Location | File | Line | Platform | Event |
|---|---|---|---|---|
| `AddToCart` on paywall render | `pixels.client.ts` | 341 | TikTok | Hardcoded `value: 7.99` |
| `InitiateCheckout` on click | `compatibility.vue` | 690 | Meta + TikTok | `value: 7.99` |
| `initiate_checkout` custom event | `compatibility.vue` | 697 | PostHog + GA4 | `value: 7.99` |
| `Purchase` after success | `compatibility.vue` | 904 | Meta + TikTok + PostHog + GA4 | `purchaseValue = 7.99` |

---

## SECTION 5 — Email and Post-Purchase Touchpoints

### 5.1 — Compatibility transactional email (`send-compatibility-email.post.ts`)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/send-compatibility-email.post.ts:1-218
```

**Full file reviewed.** No reference to `$7.99`, `7.99`, or any price string anywhere in the email HTML template or plain-text body. The email delivers the reading content (score, sections, title) and subscription management links. **No findings** for price strings.

### 5.2 — Inngest abandonment sequences

Files in `/Volumes/ESSD/Projects/Augur-V1/augur/inngest/`:
- `abandonment-sequence.ts` — not yet read but the grep for `7.99` across all `.ts` and `.vue` files returned zero hits from this file. **No findings.**

### 5.3 — Other email files

`server/api/` email endpoints (`send-report-email.post.ts`, `send-calendar-email.post.ts`, etc.) were covered in the grep for `7.99` across all `.ts` files — none returned matches. **No findings.**

**Conclusion:** The $7.99 price does not appear in any email template or abandonment sequence. Email is safe.

---

## SECTION 6 — Structured Data / SEO / Meta Tags

### 6.1 — JSON-LD in `nuxt.config.ts`

```
@/Volumes/ESSD/Projects/Augur-V1/augur/nuxt.config.ts:192-267
```

The global JSON-LD `@graph` in `nuxt.config.ts` contains only `WebSite` and `Organization` schema types. No `Product` schema, no `Offer` schema, no pricing data of any kind. **No findings.**

### 6.2 — Page-level `useSeoMeta` in `compatibility.vue`

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:428
useSeoMeta({ title: 'Your Love Compatibility Reading', robots: 'noindex, nofollow' })
```

The compatibility page is `noindex, nofollow`. No `og:price`, no structured data, no price in meta tags. **No findings.**

### 6.3 — Open Graph / Twitter cards

Global OG tags in `nuxt.config.ts` (lines 139–170) contain no pricing. **No findings.**

### 6.4 — `SEO_AUDIT.md`

```
@/Volumes/ESSD/Projects/Augur-V1/augur/SEO_AUDIT.md
```

This file was present in the directory listing. A grep for `7.99` across `*.md` files returned no matches in project source markdown files (only a false positive in `node_modules/fraction.js`). **No findings.**

**Conclusion:** No SEO/structured data changes are required for this price change.

---

## SECTION 7 — Risk Assessment for the Price Change ($7.99 → $17.99)

### HARD BREAK — Stripe charges wrong amount if missed

| # | File | Line | Current value | Required change |
|---|---|---|---|---|
| **H-1** | `server/api/create-compatibility-payment.post.ts` | 93 | `unit_amount: 799` | Change to `unit_amount: 1799` |

This is the only thing that actually controls what Stripe charges. Everything else is display or analytics.

---

### SILENT BREAK — Pixel reports wrong ROAS / revenue if missed

| # | File | Line | Current value | Required change |
|---|---|---|---|---|
| **S-1** | `app/plugins/pixels.client.ts` | 341 | `value: 7.99` (TikTok AddToCart on paywall view) | Change to `value: 17.99` |
| **S-2** | `app/pages/compatibility.vue` | 690 | `value: tier === 'subscription' ? 9.99 : 7.99` | Change `7.99` → `17.99` |
| **S-3** | `app/pages/compatibility.vue` | 697 | `value: tier === 'subscription' ? 9.99 : 7.99` | Change `7.99` → `17.99` |
| **S-4** | `app/pages/compatibility.vue` | 904 | `meta.tier === 'single' ? 7.99 : 2.99` | Change `7.99` → `17.99` |

---

### COSMETIC — User-visible wrong price if missed (no financial impact)

| # | File | Line(s) | Current value | Required change |
|---|---|---|---|---|
| **C-1** | `app/utils/translations.ts` | 259 | `compatSinglePrice: '$7.99'` (en) | `'$17.99'` |
| **C-2** | `app/utils/translations.ts` | 264 | `compatSingleCta: 'Get this forecast — $7.99'` (en) | `'Get this forecast — $17.99'` |
| **C-3** | `app/utils/translations.ts` | 523 | `compatSinglePrice: '$7.99'` (es) | `'$17.99'` |
| **C-4** | `app/utils/translations.ts` | 528 | `compatSingleCta: 'Obtener este pronóstico — $7.99'` (es) | `'Obtener este pronóstico — $17.99'` |
| **C-5** | `app/utils/translations.ts` | 787 | `compatSinglePrice: '$7.99'` (pt) | `'$17.99'` |
| **C-6** | `app/utils/translations.ts` | 792 | `compatSingleCta: 'Obter este pronóstico — $7.99'` (pt) | `'Obter este pronóstico — $17.99'` |
| **C-7** | `app/utils/translations.ts` | 1243 | `compatSingleCta: '이 포레스트 얻기 — $7.99'` (ko) | `'이 포레스트 얻기 — $17.99'` |
| **C-8** | `app/utils/translations.ts` | 1504 | `compatSingleCta: '获得此预测 — $7.99'` (zh) | `'获得此预测 — $17.99'` |

> **Note:** `compatSinglePrice` key is missing from the `ko` (line ~1226–1251) and `zh` (lines 1499–1512) locale blocks. Those locales fall through to the `en` fallback at runtime. Updating the `en` value (C-1) covers the display price for all 6 locales. The CTA strings for `ko` and `zh` contain the literal price, so they must each be updated independently (C-7, C-8).

---

## SECTION 8 — Risk Assessment for the Visual Reorganization

### 8.1 — Current visual weight of each card

**Single card (`.pay-card--primary`)** currently has the dominant weight:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:1421-1425
.pay-card--primary {
  border: 1px solid var(--color-ink-mid);   /* medium ink border */
  border-left: 2px solid var(--color-ink);  /* strong left accent */
  padding-top: 36px;                        /* extra top pad for badge */
}
```

It carries:
- Heavier border (`var(--color-ink-mid)` vs `var(--color-ink-ghost)` on secondary)
- Strong left accent (`border-left: 2px solid var(--color-ink)`)
- Badge label: "Recommended" (from `t('compatSubBadge')`) rendered via absolutely-positioned `.pay-card__badge`
- Larger price font: `.pay-card__price` is `clamp(32px, 6vw, 44px)` vs `.pay-card--secondary .pay-card__price` override at `clamp(26px, 5vw, 36px)` (lines 1466–1469)
- Full `<CTAButton>` component (solid primary button style)
- `.pay-card__name` at `font-weight: 600` (line 1449)

**Subscription card (`.pay-card--secondary`)** is visually lighter:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:1427-1429
.pay-card--secondary {
  border: 1px solid var(--color-ink-ghost);  /* faint border */
}
```

It has:
- Faint border
- Smaller price font (override at lines 1466–1469)
- Muted name color (`.pay-card--secondary .pay-card__name` at line 1452–1455: `color: var(--color-ink-mid); font-weight: 500`)
- Native `<button>` with `.pay-card__btn--secondary` (transparent background, ghost border, `color: var(--color-ink-mid)`)
- 3 footnote lines

### 8.2 — JS conditional rendering of each card

There is **no JS conditional** that hides either card. Both `<div class="pay-card pay-card--primary">` (line 320) and `<div class="pay-card pay-card--secondary">` (line 342) are always rendered when `!compatAppliedPromo` is true. Neither card has `v-if` / `v-show`.

### 8.3 — Pixel event binding: mount vs click

- **Paywall-render pixel event** (`$trackCompatibilityPaywallView`): Fired in `onMounted` at line 811, **not on card mount**. It fires once for the paywall as a whole — not bound to either card's lifecycle independently. Changing render order or visual prominence does **not** affect when this fires.
- **Checkout pixel events** (`$trackInitiateCheckout`, `trackEvent('initiate_checkout')`): Bound to the `handleCheckout('single')` click handler at line 334 and `handleCheckout('subscription')` at line 356. Click-bound — not lifecycle-bound.

**Conclusion on reorganization approach:** The visual swap can be done with **CSS-only changes** plus a class rename swap. Specifically:
- Move the "Recommended" badge from `.pay-card--primary` → either remove it from single or add equivalent weight to single as dominant.
- Swap the CSS between `.pay-card--primary` and `.pay-card--secondary` modifier classes OR reorder the two `<div>` blocks in the template (lines 320–364) and reassign the `pay-card--primary` / `pay-card--secondary` class names.
- The CTA buttons use different elements (`<CTAButton>` vs `<button>`) — a DOM reorder without class swap would require keeping this difference in mind.
- No pixel event risks from reordering — all events are click-bound or page-mount-bound (not card-mount-bound).

---

## SECTION 9 — Out-of-Scope Confirmations

### 9.1 — `/preview` natal paywall (`app/pages/preview.vue`)

Confirmed at lines 155, 171, 190: the three price points displayed are `$2.99`, `$4.99`, and `$12.99`.

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:155
<p class="tier__price font-serif">$2.99</p>
```
```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:171
<p class="tier__price tier__price--popular font-serif">$4.99</p>
```
```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/preview.vue:190
<p class="tier__price tier__price--oracle font-serif">$12.99</p>
```

The price verification comment at lines 201–204 of `preview.vue` confirms these are static display strings mapped to Stripe `unit_amount` values in separate payment endpoints (`create-payment.post.ts` for basic, `create-bundle-payment.post.ts`, `create-oracle-payment.post.ts`). None of these endpoints were touched by our search findings. **Not affected by the compatibility price change.**

### 9.2 — `/calendar` payment ($2.99)

`server/api/create-calendar-payment.post.ts` exists. The grep for `7.99` / `799` returned no matches in this file. **Not affected.**

### 9.3 — Daily horoscope subscription ($4.99/mo)

`server/api/create-subscription.post.ts` uses `config.stripeDailyPriceId` (env var `NUXT_STRIPE_DAILY_PRICE_ID` = `price_1TKON6Du5bXWvSPjjieU5bEj`). No `7.99` reference. **Not affected.**

### 9.4 — Add-on / Tradition Switch / Birth Chart

`server/api/create-addon-payment.post.ts`, `create-tradition-payment.post.ts`, `create-birth-chart-payment.post.ts` — no `7.99` / `799` in grep results. **Not affected.**

### 9.5 — Mobile app

`/Volumes/ESSD/Projects/Augur-V1/mobile-app/` directory. Not searched and not touched by this analysis. **Not affected.**

### 9.6 — Shared components and API endpoints

**Shared components between `/compatibility` and `/preview`:**
- `AppHeader.vue` — both pages use this. It renders the header bar only; no pricing logic.
- `CTAButton` — used in both pages as a generic button. No pricing logic.
- `PhoenixLoader.vue` — used in both for loading state. No pricing logic.
- `pixels.client.ts` — **THIS IS SHARED.** However, the `$trackCompatibilityPaywallView` function (containing the hardcoded `7.99`) is only called from `compatibility.vue` (line 811). The `$trackViewContent` function called from `preview.vue` (line 476) uses a separate passed-in `value: 4.99` parameter. The functions are separate; changing the compatibility value in `trackCompatibilityPaywallView` does not affect the preview page pixel events.
- `app/utils/translations.ts` — **THIS IS SHARED.** The compatibility-specific keys (`compatSinglePrice`, `compatSingleCta`, etc.) are namespaced with the `compat` prefix and only rendered by `compatibility.vue`. Updating them does not affect `preview.vue`.

**No shared API endpoints between `/compatibility` and `/preview` paywall flows.** `create-compatibility-payment.post.ts` is used exclusively by the compatibility flow; `create-payment.post.ts` / `create-bundle-payment.post.ts` / `create-oracle-payment.post.ts` are used exclusively by the preview/natal flow.

---

## SECTION 10 — Recommended Execution Order

> **DO NOT EXECUTE. Analysis only.**

### Step 1 — Code change: server (Stripe charge amount)

**File:** `server/api/create-compatibility-payment.post.ts`, **line 93**  
**Change:** `unit_amount: 799` → `unit_amount: 1799`  
**Why first:** This is the only change that has a financial effect. Deploy this before any UI changes go live so the displayed price and the charged price are in sync from the moment users can see the new price.

### Step 2 — Code change: display copy (translations)

**File:** `app/utils/translations.ts`  
**Changes (in order of locale):**
1. Line 259: `'$7.99'` → `'$17.99'` (en `compatSinglePrice`)
2. Line 264: `'Get this forecast — $7.99'` → `'Get this forecast — $17.99'` (en `compatSingleCta`)
3. Line 523: `'$7.99'` → `'$17.99'` (es `compatSinglePrice`)
4. Line 528: `'Obtener este pronóstico — $7.99'` → `'Obtener este pronóstico — $17.99'` (es `compatSingleCta`)
5. Line 787: `'$7.99'` → `'$17.99'` (pt `compatSinglePrice`)
6. Line 792: `'Obter este pronóstico — $7.99'` → `'Obter este pronóstico — $17.99'` (pt `compatSingleCta`)
7. Line 1243: `'이 포레스트 얻기 — $7.99'` → `'이 포레스트 얻기 — $17.99'` (ko `compatSingleCta`)
8. Line 1504: `'获得此预测 — $7.99'` → `'获得此预测 — $17.99'` (zh `compatSingleCta`)

### Step 3 — Code change: pixel values

**File A:** `app/plugins/pixels.client.ts`, **line 341**  
**Change:** `value: 7.99` → `value: 17.99`

**File B:** `app/pages/compatibility.vue`, **line 690**  
**Change:** `tier === 'subscription' ? 9.99 : 7.99` → `tier === 'subscription' ? 9.99 : 17.99`

**File B:** `app/pages/compatibility.vue`, **line 697**  
**Change:** `tier === 'subscription' ? 9.99 : 7.99` → `tier === 'subscription' ? 9.99 : 17.99`

**File B:** `app/pages/compatibility.vue`, **line 904**  
**Change:** `meta.tier === 'single' ? 7.99 : 2.99` → `meta.tier === 'single' ? 17.99 : 2.99`

### Step 4 — Code change: visual reorganization

**File:** `app/pages/compatibility.vue`  
**Approach (CSS-only, no template restructuring required):**

Option A (CSS swap — simplest, no DOM change):
- In the `<style scoped>` section (lines 928–1686): swap the CSS rules for `.pay-card--primary` (lines 1421–1425) and `.pay-card--secondary` (lines 1427–1429), and swap `.pay-card--secondary .pay-card__price` (lines 1466–1469) and `.pay-card--secondary .pay-card__name` (lines 1452–1455) logic to instead apply to `--primary`.
- Move the `<p class="label-caps pay-card__badge">` (badge) from the single card to the subscription card, or remove it from single and add a different badge/label to the subscription card if desired.

Option B (template reorder — cleaner if DOM order matters for accessibility or tab order):
- Swap the two `<div>` blocks so the subscription card appears first (lines 342–364) and the single card second (lines 320–339).
- Swap the CSS class suffixes: subscription card gets `pay-card--primary`, single card gets `pay-card--secondary`.
- No pixel event risk — all events are click-bound.

### Step 5 — Deployment

- Deploy to Railway using existing deployment script (`bash deploy-all-services.sh` per global rules).
- Single deploy covers all changes (one Nuxt 3 app).

### Step 6 — Verification checklist (manual, after deploy)

1. Open `/compatibility?preview=1` → confirm price card shows `$17.99` in all 6 languages.
2. Click "Get this forecast" CTA → confirm Stripe Checkout shows `$17.99` (not `$7.99`).
3. Complete a test purchase with Stripe test card → confirm Stripe dashboard shows `$17.99` charge.
4. Confirm Meta Pixel Helper browser extension shows `InitiateCheckout` with `value: 17.99` on click.
5. Confirm TikTok Pixel Helper shows `AddToCart` with `value: 17.99` on paywall load.
6. Confirm TikTok `CompletePayment` / Meta `Purchase` with `value: 17.99` on success return.
7. Confirm `/preview` (natal paywall) still shows `$2.99`, `$4.99`, `$12.99` — unchanged.

---

## QUESTIONS FOR HUMAN

1. **`NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID`** (`price_1TQRzVDebD8pElyXeIeVem6b`) exists in `.env` and `nuxt.config.ts` but is **never used** — the `single` tier uses inline `price_data`/`unit_amount`. Is this Stripe Price ID a legacy artifact from a prior implementation, or is there an intention to switch the `single` tier to a pre-created Price ID before raising the price? If yes, the checkout endpoint needs to be updated to reference it (like `subscription` does), and the price in the Stripe dashboard for that Price object would also need updating.

2. **`ko` and `zh` locale `compatSinglePrice` key is missing.** Currently those locales fall through to the English `$7.99` display via the `t()` fallback. Should `compatSinglePrice: '$17.99'` be explicitly added to the `ko` and `zh` locale blocks (currently absent), or is relying on the en fallback acceptable?

3. **Visual reorganization — badge disposition.** The "Recommended" badge (`t('compatSubBadge')`) currently sits on the single card (`.pay-card--primary`, line 321). After the swap, should: (a) the badge move to the subscription card, (b) the badge be removed entirely, or (c) the single card retain the badge but the subscription card become visually dominant anyway? The translation string is `compatSubBadge: 'Recommended'` across all locales — it was originally named for the subscription, which suggests (a) is the semantic intent.

4. **Promo codes for compatibility single tier.** The `apply-promo-discount.post.ts` TIER_BASE_PRICES map does not include the compatibility single tier. Is there a separate promo code path for `single` compatibility readings, or is promo discounting intentionally not supported for this tier? (Confirming no change needed here.)

5. **Railway env vars.** Is `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` set in the Railway dashboard in addition to the local `.env`? If so, should it be removed to avoid confusion (since it is not read by any code)?
