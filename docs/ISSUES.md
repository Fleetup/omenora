# OMENORA — Product Inventory & Issues Document

---

## SECTION A — COMPLETE PRODUCT INVENTORY

### SUBSCRIPTIONS (recurring)

Sorted smallest → highest price.

---

#### SUB-1 · Personal Daily Horoscope · $4.99/mo

**Stripe:** recurring subscription via `stripeDailyPriceId` (env var)
**Sold on:** `/subscribe` page
**What is included:**
- Daily personalized horoscope email every morning
- Based on user's exact birth chart (archetype + life path + element + region)
- Last 7 days of insights accessible in account (`/api/me/daily-insights`)

**Delivery:** email via `send-daily-insight.post.ts`; archive on `/account`

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-subscription.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` (line 221, `meta.type === 'subscription'`) |
| Subscriber save | `server/api/save-subscriber.post.ts` |
| Daily generation | `server/api/generate-daily-insight.post.ts` |
| Email send | `server/api/send-daily-insight.post.ts` |
| API: status check | `server/api/me/subscription.get.ts` |
| API: archive | `server/api/me/daily-insights.get.ts` |
| Web page (signup) | `app/pages/subscribe.vue` |
| Web page (post-payment) | `app/pages/subscription.vue` |
| Web page (archive) | `app/pages/account.vue` (section: Daily Horoscope) |
| Web page (upsell) | `app/pages/daily.vue` (subscription CTA block) |

**Reports / Downloads:**
- ✅ Email: daily insight delivered via `send-daily-insight.post.ts`
- ❌ PDF: none
- ❌ Web page report: none (archive only, not a full report page)
- ✅ PNG Download: `account.vue` — canvas-based insight card download (client-side)

---

#### SUB-2 · Compatibility Plus · $9.99/mo

**Stripe:** recurring subscription via `stripeCompatPlusPriceId` (env var)
**Sold on:** `/compatibility` preview paywall
**What is included (as shown in `compatibility.vue` paywall):**
- Unlimited compatibility readings (any pairing)
- Weekly relationship transit forecasts
- Daily personalized horoscope
- Save up to 10 people for ongoing tracking

**Delivery:** same daily insight pipeline as SUB-1; compatibility readings on demand

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-compatibility-payment.post.ts` (tier: 'subscription') |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` (line 221, `meta.type === 'compatibility' && meta.tier === 'subscription'`) |
| Subscriber save | `server/api/save-subscriber.post.ts` |
| Daily generation | `server/api/generate-daily-insight.post.ts` |
| Email send | `server/api/send-daily-insight.post.ts` |
| API: status check | `server/api/me/subscription.get.ts` |
| API: archive | `server/api/me/daily-insights.get.ts` |
| Web page (paywall) | `app/pages/compatibility.vue` (preview paywall, Compatibility Plus card) |
| Web page (archive) | `app/pages/account.vue` — **CURRENTLY NOT HANDLED** (see Issue 1) |

**Reports / Downloads:**
- ✅ Email: daily insight via `send-daily-insight.post.ts`
- ❌ PDF: none
- ❌ Web page report: compatibility report is separate (one-time per reading, see OTP-3/4 below)
- ❌ PNG Download: none for subscription itself

**⚠️ KNOWN ISSUE:** `save-subscriber.post.ts` and `subscribers` table have no `plan_type` column. Both SUB-1 and SUB-2 are saved identically as `active: true`. `account.vue` always shows "Personal Daily Horoscope" regardless of which plan the user is on. See **Issue 1** below.

---

### ONE-TIME PAYMENTS

Sorted smallest → highest price.

---

#### OTP-1 · Compatibility Reading (Legacy) · $2.99

**Stripe:** one-time payment, hardcoded `unit_amount: 299`
**Sold on:** `/compatibility` preview paywall (legacy tier, no longer primary)
**What is included:** Full 5-section compatibility analysis for one pairing

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-compatibility-payment.post.ts` (tier: 'legacy') |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Compatibility generation | `server/api/generate-compatibility.post.ts` |
| Email send | `server/api/send-compatibility-email.post.ts` |
| Web page (report) | `app/pages/compatibility.vue` |

**Reports / Downloads:**
- ✅ Email: `send-compatibility-email.post.ts`
- ❌ PDF: none
- ✅ Web page: `app/pages/compatibility.vue` (full report view)
- ✅ PNG Download: `app/pages/compatibility.vue` → `server/api/generate-compatibility-card.post.ts`

---

#### OTP-2 · Destiny Report — Basic · $2.99

**Stripe:** one-time payment, hardcoded `unit_amount: 299`
**Sold on:** `/preview` paywall (Tier 1 — Basic)
**What is included:** Full 7-section archetype destiny report

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Report generation | `server/api/generate-report.post.ts` |
| Email send | `server/api/send-report-email.post.ts` / `server/utils/report-email-builder.ts` |
| Web page (report) | `app/pages/report.vue` |

**Reports / Downloads:**
- ✅ Email: `send-report-email.post.ts`
- ✅ PDF: `app/pages/report.vue` → `server/api/generate-report-pdf.post.ts`
- ✅ Web page: `app/pages/report.vue`
- ✅ PNG Download: `app/pages/report.vue` → `server/api/generate-card.post.ts`

---

#### OTP-3 · 2026 Lucky Timing Calendar · $2.99

**Stripe:** one-time payment, hardcoded `unit_amount: 299`
**Sold on:** upsell from `/report` page
**What is included:** Month-by-month destiny forecast for 2026

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-calendar-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Calendar generation | `server/api/generate-calendar.post.ts` |
| Email send | `server/api/send-calendar-email.post.ts` |
| Web page (report) | `app/pages/calendar.vue` |

**Reports / Downloads:**
- ✅ Email: `send-calendar-email.post.ts`
- ✅ PDF: `app/pages/calendar.vue` → `server/api/generate-calendar-pdf.post.ts`
- ✅ Web page: `app/pages/calendar.vue`
- ✅ PNG Download: `app/pages/calendar.vue` → `server/api/generate-calendar-card.post.ts`

---

#### OTP-4 · Full Birth Chart · $2.99

**Stripe:** one-time payment, hardcoded `unit_amount: 299`
**Sold on:** upsell from `/report` page
**What is included:** Rising sign · Moon sign · Houses · Planetary positions · 2026 forecast

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-birth-chart-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Birth chart generation | `server/api/generate-birth-chart.post.ts` |
| Web page (report) | `app/pages/report.vue` (rendered inline in report) |

**Reports / Downloads:**
- ❌ Email: no separate email (included in oracle bundle email if oracle)
- ❌ PDF: no separate PDF
- ✅ Web page: displayed inline in `app/pages/report.vue`
- ❌ PNG Download: none

---

#### OTP-5 · Tradition Switch Reading · $1.99

**Stripe:** one-time payment, hardcoded `unit_amount: 199`
**Sold on:** upsell from `/report` page (re-generate report through a different tradition)
**Traditions available:** Vedic (Jyotish) · BaZi (Four Pillars) · Spiritual Tarot · Personality Insight · Destiny Path
**What is included:** Full destiny report re-generated through chosen tradition

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-tradition-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Tradition generation | `server/api/generate-vedic-section.post.ts` / `generate-bazi-section.post.ts` / `generate-tarot-section.post.ts` |
| Web page (report) | `app/pages/report.vue` (tradition section rendered inline) |

**Reports / Downloads:**
- ❌ Email: none (separate, not a new full email)
- ❌ PDF: not separate
- ✅ Web page: rendered inline in `app/pages/report.vue`
- ❌ PNG Download: none

---

#### OTP-6 · Most Popular Bundle · $4.99

**Stripe:** one-time payment, hardcoded `unit_amount: 499`
**Sold on:** `/preview` paywall (Tier 2 — Most Popular)
**What is included:** Full destiny report + 2026 Calendar + Compatibility Reading (one person)

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-bundle-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Report generation | `server/api/generate-report.post.ts` |
| Calendar generation | `server/api/generate-calendar.post.ts` |
| Compatibility generation | `server/api/generate-compatibility.post.ts` |
| Email send | `server/utils/report-email-builder.ts` (bundle path, `isBundlePurchase: true`) |
| Web pages | `app/pages/report.vue` + `app/pages/calendar.vue` + `app/pages/compatibility.vue` |

**Reports / Downloads:**
- ✅ Email: bundle email via `report-email-builder.ts`
- ✅ PDF (report): `server/api/generate-report-pdf.post.ts`
- ✅ PDF (calendar): `server/api/generate-calendar-pdf.post.ts`
- ✅ Web page: `report.vue` · `calendar.vue` · `compatibility.vue`
- ✅ PNG (report card): `server/api/generate-card.post.ts`
- ✅ PNG (calendar card): `server/api/generate-calendar-card.post.ts`
- ✅ PNG (compatibility card): `server/api/generate-compatibility-card.post.ts`

---

#### OTP-7 · Compatibility Add-on · $0.99 *(post-report upsell)*

**Stripe:** one-time payment, hardcoded `unit_amount: 99`
**Sold on:** upsell step after `/preview` paywall (shown after Basic report purchase)
**What is included:** One compatibility reading added to existing order

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-addon-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Compatibility generation | `server/api/generate-compatibility.post.ts` |
| Email send | `server/api/send-compatibility-email.post.ts` |
| Web page (report) | `app/pages/compatibility.vue` |

**Reports / Downloads:**
- ✅ Email: `send-compatibility-email.post.ts`
- ❌ PDF: none
- ✅ Web page: `app/pages/compatibility.vue`
- ✅ PNG Download: `server/api/generate-compatibility-card.post.ts`

---

#### OTP-8 · Compatibility Reading (Single) · $7.99

**Stripe:** one-time payment, hardcoded `unit_amount: 799`
**Sold on:** `/compatibility` preview paywall (primary single-reading option)
**What is included:** Full 5-section compatibility analysis for one pairing

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-compatibility-payment.post.ts` (tier: 'single') |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Compatibility generation | `server/api/generate-compatibility.post.ts` |
| Email send | `server/api/send-compatibility-email.post.ts` |
| Web page (report) | `app/pages/compatibility.vue` |

**Reports / Downloads:**
- ✅ Email: `send-compatibility-email.post.ts`
- ❌ PDF: none
- ✅ Web page: `app/pages/compatibility.vue`
- ✅ PNG Download: `server/api/generate-compatibility-card.post.ts`

---

#### OTP-9 · Full Oracle Bundle · $12.99

**Stripe:** one-time payment, hardcoded `unit_amount: 1299`
**Sold on:** `/preview` paywall (Tier 3 — Full Oracle, anchor price)
**What is included:** Report + Calendar + Compatibility + Full Birth Chart + 30 Daily Insights

**Files:**
| Role | File |
|---|---|
| Payment session | `server/api/create-oracle-payment.post.ts` |
| Webhook fulfillment | `server/api/stripe/webhook.post.ts` |
| Report generation | `server/api/generate-report.post.ts` |
| Calendar generation | `server/api/generate-calendar.post.ts` |
| Compatibility generation | `server/api/generate-compatibility.post.ts` |
| Birth chart generation | `server/api/generate-birth-chart.post.ts` |
| Daily insight generation | `server/api/generate-daily-insight.post.ts` |
| Email send | `server/utils/report-email-builder.ts` (oracle path, `isOraclePurchase: true`) |
| Web pages | `app/pages/report.vue` · `app/pages/calendar.vue` · `app/pages/compatibility.vue` |

**Reports / Downloads:**
- ✅ Email: full oracle email via `report-email-builder.ts`
- ✅ PDF (report): `server/api/generate-report-pdf.post.ts`
- ✅ PDF (calendar): `server/api/generate-calendar-pdf.post.ts`
- ✅ Web page: `report.vue` · `calendar.vue` · `compatibility.vue`
- ✅ PNG (report card): `server/api/generate-card.post.ts`
- ✅ PNG (calendar card): `server/api/generate-calendar-card.post.ts`
- ✅ PNG (compatibility card): `server/api/generate-compatibility-card.post.ts`

---

## SECTION B — ISSUES

### ISSUE 1 — Compatibility Plus (SUB-2) not recognized in account.vue

**Status:** TO ANALYZE

---

### ISSUE 2 — Personal Daily Horoscope missing Love / Work / Health sections

**Status:** TO ANALYZE

---

### ISSUE 3 — Daily Horoscope cards in account.vue use wrong design (not matching daily.vue)

**Status:** TO ANALYZE

---

### ISSUE 4 — Header on daily.vue missing "My Account" link

**Status:** TO ANALYZE

---

### ISSUE 5 — Prices on paywall incorrectly named / displayed

**Status:** TO ANALYZE

---

## SECTION C — CONCLUSION

*Will be written after all issues are analyzed and resolved.*
