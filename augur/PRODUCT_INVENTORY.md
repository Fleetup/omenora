# PRODUCT INVENTORY AUDIT
_Generated: 2026-05-02. Read-only audit — no code was modified._

---

## Table 1 — Product Inventory

| File | Product (`product_data.name` or Price ID) | Stripe Amount | Frequency | Delivery Endpoint / Page | Webhook `checkout.session.completed` Branch? |
|---|---|---|---|---|---|
| `create-payment.post.ts` | OMENORA Destiny Report — Basic | 299¢ ($2.99) | One-time | `/report?session_id=…` — report generated/saved to DB + emailed via `sendReportEmailViaWebhook` | **Yes** — falls through to report generation+save+email path (`meta.type = 'report'`) |
| `create-bundle-payment.post.ts` | OMENORA Most Popular Bundle | 499¢ ($4.99) | One-time | `/report?session_id=…&bundle=true` — report + calendar generated, both emailed | **Yes** — `isBundlePurchase = meta.bundle === 'true'` triggers calendar generation inside `sendReportEmailViaWebhook` |
| `create-oracle-payment.post.ts` | OMENORA Full Oracle Bundle | 1299¢ ($12.99) | One-time | `/report?session_id=…&oracle=true` — report + calendar + birth chart + all traditions emailed | **Yes** — `isOraclePurchase = meta.oracle === 'true'` triggers full suite (calendar, birth chart, vedic/bazi/tarot) inside `sendReportEmailViaWebhook` |
| `create-addon-payment.post.ts` | OMENORA Compatibility Add-on | 99¢ ($0.99) | One-time | `/compatibility?session_id=…&addon=true` — client-side page only | **No** — metadata lacks `archetype`/`dateOfBirth`; webhook returns `warning: 'incomplete_metadata'` |
| `create-compatibility-payment.post.ts` (tier=`legacy`) | OMENORA Compatibility Reading | 299¢ ($2.99) | One-time | `/compatibility?session_id=…` — client-side page only | **No** — no explicit branch for `type=compatibility, tier=legacy`; falls to report path which warns `incomplete_metadata` (no archetype in metadata) |
| `create-compatibility-payment.post.ts` (tier=`single`) | OMENORA Compatibility Reading | 1799¢ ($17.99) | One-time | `/compatibility?session_id=…&from=quiz` — client-side page only | **No** — no explicit branch for `type=compatibility, tier=single`; same fallthrough as legacy |
| `create-compatibility-payment.post.ts` (tier=`subscription`) | Stripe Price ID: `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` | env var (recurring) | Recurring / subscription | `/compatibility?session_id=…&from=quiz` — subscriber saved to `subscribers` table as `plan_type = 'compatibility_plus'`; Inngest welcome event fired | **Yes** — explicit branch at line 267: `meta.type === 'compatibility' && meta.tier === 'subscription'` |
| `create-subscription.post.ts` | Stripe Price ID: `NUXT_STRIPE_DAILY_PRICE_ID` | env var (recurring) | Recurring / subscription | `/subscription?session_id=…` — subscriber saved to `subscribers` table as `plan_type = 'daily_horoscope'`; Inngest welcome event fired | **Yes** — explicit branch at line 267: `meta.type === 'subscription'` |
| `create-calendar-payment.post.ts` | OMENORA 2026 Lucky Timing Calendar | 299¢ ($2.99) | One-time | `/calendar?session_id=…` — client-side page only | **No** — metadata lacks `archetype`/`dateOfBirth`; webhook returns `warning: 'incomplete_metadata'` |
| `create-birth-chart-payment.post.ts` | OMENORA Full Birth Chart | 299¢ ($2.99) | One-time | `/report?session_id=…&birth_chart=true` — client-side page only | **No** — metadata has `dateOfBirth` but lacks `archetype`; webhook returns `warning: 'incomplete_metadata'` |
| `create-tradition-payment.post.ts` | OMENORA `{Tradition}` Reading (dynamic: Vedic / BaZi / Spiritual Tarot / Personality Insight / Destiny Path) | 199¢ ($1.99) | One-time | `/report?session_id=…&tradition_switch=true` — client-side page only | **No** — metadata has `archetype` but lacks `dateOfBirth`; webhook returns `warning: 'incomplete_metadata'` |
| `mobile/confirm-payment.post.ts` | _(Not a payment creation endpoint — server-side PaymentIntent verification for React Native mobile app)_ | n/a | n/a | Returns `{ paid, metadata }` to mobile client for client-side rendering | n/a |

---

## Table 2 — Display Price vs Actual Charged Amount

| Page | Tier / Option | Displayed to User | Stripe `unit_amount` (cents) | Match? | Notes |
|---|---|---|---|---|---|
| `app/pages/preview.vue` | Basic Report | $2.99 | 299¢ | ✅ Match | `create-payment.post.ts` |
| `app/pages/preview.vue` | Most Popular Bundle | $4.99 | 499¢ | ✅ Match | `create-bundle-payment.post.ts` |
| `app/pages/preview.vue` | Full Oracle Bundle | $12.99 | 1299¢ | ✅ Match | `create-oracle-payment.post.ts` |
| `app/pages/compatibility.vue` | Single Reading | $17.99 | 1799¢ | ✅ Match | `create-compatibility-payment.post.ts` tier=`single`; inline `price_data` (env var `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` defined but **unused** in code) |
| `app/pages/compatibility.vue` | Compatibility Plus (subscription) | $9.99 / month | `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` (env var) | ⚠️ Unverifiable from code | Stripe Price ID delegated to env var — displayed $9.99 must match the price configured in Stripe Dashboard for that ID; no hardcoded amount to cross-check |
