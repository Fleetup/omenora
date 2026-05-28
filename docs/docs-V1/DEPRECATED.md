# OMENORA — Deprecated

> Consolidated cleanup list. Everything that exists in the codebase but no longer matches locked strategy.
> Single source of truth for what gets removed before OMENORA ships enterprise-grade.
> This document IS the removal decision. Items listed here are decided, not under consideration.
> When this document and code conflict, code must be brought into alignment by removal.

---

## Status legend

- **REMOVE** — Delete the file, code, product, or string entirely. No legacy customer impact.
- **RETIRE AFTER MIGRATION** — Cannot be removed until dependent code is migrated to canonical replacement. Tracked here as the post-migration removal target.
- **PRESERVE — FULFILLMENT ONLY** — Stays operational to honor past purchases. Do not extend, do not redesign, do not delete while legacy customers may still need access.

---

## 0. Completed

The following items have been verified resolved in code. Full context (what was deprecated and why) remains in each section below.

| Item | Resolved | Commit | Note |
|---|---|---|---|
| §1.1 /index-legacy.vue deleted | ✅ | e5497f5 | Was untracked; removed in deprecation sweep |
| §1.3 /compatibility-quiz noindex | ✅ | 1333dc3 | Added in compatibility-quiz Tier 1 |
| §2.1 /subscribe deleted | ✅ | e5497f5 | Inbound links (account, daily) redirected to /founding |
| §2.2 /subscription deleted | ✅ | e5497f5 | Zero inbound refs |
| §2.3 /report secondary /subscribe upsell link removed | ✅ | e5497f5 | Fulfillment navigateTo paths preserved |
| §6.1 CTAButton.vue deleted | ✅ | e5497f5 | Blocker (analysis.vue migration) resolved earlier in ba66d62 |
| §6.2 EditorialRule.vue deleted | ✅ | e5497f5 | Only consumer was index-legacy.vue |
| §8.1 Homepage hero copy replaced | ✅ | fe8e666 | FM-aligned natal positioning |
| §8.2 Homepage Section 4 copy rewritten | ✅ | fe8e666 | FM intro replaces PDF/no-subscription framing |
| §8.3 Fabricated social proof removed | ✅ | fe8e666 | Testimonials deferred until real FM data |
| §8.5 Homepage SEO meta replaced | ✅ | fe8e666 | FM title; no "Free Daily Horoscope" |
| §9.1 /preview secondary CTA to /subscribe removed | ✅ | b8911c3 | Single-CTA paywall |
| §9.3 /compatibility upsell → /founding | ✅ | a8db836 | Routes to Founding Member |

---

## 1. Tier 1 — Urgent removals (active liability)

These items are actively harming SEO, leaking deprecated content to search engines, or exposing publicly-accessible routes that contradict locked strategy. Remove first.

### 1.1 `/index-legacy.vue` — ✅ DONE (e5497f5)

- **File:** `app/pages/index-legacy.vue` (~1265 lines)
- **Route served:** `/index-legacy` (actively crawlable)
- **Issue:** Contains JSON-LD `offers` array advertising deprecated SKUs ($4.99 Basic Reading, $9.99 Popular Bundle, $24.99 Full Oracle) to Google. Uses `CTAButton` (DEPRECATED) and legacy token aliases throughout. Previously listed in `.git/info/exclude` (untracked) but still exists on disk and Nuxt routes it.
- **Action:** Delete the file. Verify no internal page links reference `/index-legacy`. Search engines indexing this route will 404 after deletion — correct behavior.

### 1.2 `/sandbox/redesign-home.vue` — REMOVE FROM `pages/`

- **File:** `app/pages/sandbox/redesign-home.vue` (2156 lines)
- **Route served:** `/sandbox/redesign-home` (noindex but publicly accessible)
- **Issue:** Was the sandbox design source for the homepage redesign. That work is complete (homepage is REDESIGNED per PAGES_AND_SECTIONS.md). The file no longer belongs under `app/pages/` because Nuxt routes everything in that directory.
- **Action:** Move the file to `docs/design-references/` or delete it. Either action removes the live route. If retained as reference, ensure it lives outside any Nuxt-routed directory.

### 1.3 `/compatibility-quiz` missing noindex — ✅ DONE (1333dc3)

- **File:** `app/pages/compatibility-quiz.vue` (402 lines)
- **Issue:** All other funnel pages set `robots: 'noindex, nofollow'`. This one does not. It is currently crawlable.
- **Action:** Add `useSeoMeta` or `useHead` block setting `robots: 'noindex, nofollow'`. Cheap fix.

---

## 2. Pages to remove

### 2.1 `/subscribe` — ✅ DONE (e5497f5)

- **File:** `app/pages/subscribe.vue` (1172 lines)
- **Why:** Sells the deprecated Daily Horoscope Subscription at $6.99/mo (PRODUCT_MAP.md §6.2). Locked subscription model is mobile-only at $14.99/mo via RevenueCat per STRATEGY.md §6. Per PRODUCT_MAP.md §7, Premium subscription env vars are not configured — the page returns 503 on any attempted checkout.
- **Pre-removal verification:** Confirm zero active legacy `daily_horoscope` subscriptions. If any exist, refund or migrate before deletion.
- **Post-removal:** Update inbound links — `/preview` and `/daily` currently reference `/subscribe`. Both link removals are tracked separately (sections 9.2 and 9.3 below).

### 2.2 `/subscription` — ✅ DONE (e5497f5)

- **File:** `app/pages/subscription.vue` (255 lines)
- **Why:** Post-purchase confirmation for the deprecated `/subscribe` flow. Tracks `$6.99` purchase pixel. No purpose without `/subscribe`.
- **Action:** Delete after `/subscribe` is removed.

### 2.3 `/report` — PRESERVE — FULFILLMENT ONLY

- **File:** `app/pages/report.vue` (3120 lines)
- **Why preserved, not removed:** Customers who purchased the legacy destiny report (and bundles) must retain access to their purchase. This page renders that fulfillment.
- **Disposition during cleanup:**
  - Remove upstream sale paths (already tracked in section 9 — `/preview` bundle/oracle promo code branches)
  - Do not link to this page from any redesigned surface
  - Leave operational until all legacy purchases age out and zero customers depend on it
  - Eventual deletion in a future cleanup pass, after sufficient time has passed and analytics confirm no traffic
- **Pricing string to update:** `report.vue:515` displays `$6.99/mo` — must be removed even if the page is preserved, since the link target (`/subscribe`) is being removed.

**Partial status:**
- ✅ Secondary `/subscribe` upsell link removed (`e5497f5`)
- 🔲 PENDING: `$6.99/mo` price string at `report.vue:512` still present
- ✅ Fulfillment `navigateTo('/subscribe')` paths (lines ~1296, ~1398) PRESERVED intentionally (legacy purchaser access)

---

## 3. Stripe products and endpoints to remove

All items below are LIVE in the codebase but DEPRECATED per PRODUCT_MAP.md §6. Each has a checkout endpoint and (typically) a webhook branch. Remove both.

### 3.1 Destiny Report — Basic ($4.99) — REMOVE

- **Endpoint:** `POST /api/create-payment` (`augur/server/api/create-payment.post.ts`)
- **Metadata type:** `report`
- **Stripe handling:** Inline `price_data`, $4.99 (499 cents)
- **Webhook branch:** Default path in `augur/server/api/stripe/webhook.post.ts` (line ~981+) handles the `report` type via the destiny-report generation and email
- **Removal:**
  1. Delete `augur/server/api/create-payment.post.ts`
  2. Remove the default `report`-type branch from the webhook (keep email fulfillment for past purchases only if `/report` page is preserved per section 2.3)
- **Cross-references:** `augur/server/api/apply-promo-discount.post.ts:3-7` defines `basic` (499). Remove `basic` from the promo discount tier list.

### 3.2 Most Popular Bundle ($9.99) — REMOVE

- **Endpoint:** `POST /api/create-bundle-payment` (`augur/server/api/create-bundle-payment.post.ts`)
- **Metadata type:** `bundle`
- **Stripe handling:** Inline `price_data`, $9.99 (999 cents)
- **Webhook branch:** `isBundlePurchase` flag in the default path triggers bundle-specific email (calendar + birth chart included)
- **Removal:**
  1. Delete `augur/server/api/create-bundle-payment.post.ts`
  2. Remove `isBundlePurchase` flag and bundle email branch from webhook
- **Cross-references:** `augur/server/api/apply-promo-discount.post.ts:3-7` defines `bundle` (999). Remove `bundle` from the promo discount tier list.

### 3.3 Full Oracle Bundle ($24.99) — REMOVE

- **Endpoint:** `POST /api/create-oracle-payment` (`augur/server/api/create-oracle-payment.post.ts`)
- **Metadata type:** `oracle`
- **Stripe handling:** Inline `price_data`, $24.99 (2499 cents)
- **Webhook branch:** `isOraclePurchase` flag in the default path triggers oracle-specific email (calendar + birth chart + unlimited traditions)
- **Removal:**
  1. Delete `augur/server/api/create-oracle-payment.post.ts`
  2. Remove `isOraclePurchase` flag and oracle email branch from webhook
- **Cross-references:** `augur/server/api/apply-promo-discount.post.ts:3-7` defines `oracle` (2499). Remove `oracle` from the promo discount tier list.

### 3.4 Standalone Birth Chart ($4.99) — REMOVE

- **Endpoint:** `POST /api/create-birth-chart-payment` (`augur/server/api/create-birth-chart-payment.post.ts`)
- **Metadata type:** `birth_chart`
- **Stripe handling:** Inline `price_data`, $4.99 (499 cents)
- **Webhook branch:** No dedicated branch — falls through to default report path. Birth chart generation is invoked client-side on `/report`.
- **Removal:**
  1. Delete `augur/server/api/create-birth-chart-payment.post.ts`
  2. Remove birth-chart purchase CTAs from any consuming page (currently `/report`)
- **Strategic context:** Birth chart is a Premium-included feature, not a standalone product (STRATEGY.md §8, PRODUCT_MAP.md §6.1).

### 3.5 Standalone Calendar — Web ($4.99) — REMOVE FROM WEB

- **Endpoint:** `POST /api/create-calendar-payment` (`augur/server/api/create-calendar-payment.post.ts`)
- **Metadata type:** `calendar_2026`
- **Stripe handling:** Inline `price_data`, $4.99 (499 cents)
- **Webhook branch:** Dedicated branch in webhook (line ~706) upserts `subscriptions` row with `entitlement_id='calendar_2026'`
- **Removal:**
  1. Delete `augur/server/api/create-calendar-payment.post.ts` — remove the purchase path
  2. **Keep the webhook branch and `/calendar` page operational** — legacy customers may still access purchased calendars (PRESERVE per PAGES_AND_SECTIONS.md §11)
- **Strategic context:** Calendar moves to mobile IAP only (PRODUCT_MAP.md §2 — `omenora_calendar_2026`). Web no longer sells new calendars but honors past purchases.

### 3.6 Tradition Switch ($2.99) — REMOVE

- **Endpoint:** `POST /api/create-tradition-payment` (`augur/server/api/create-tradition-payment.post.ts`)
- **Metadata type:** `tradition_switch`
- **Stripe handling:** Inline `price_data`, $2.99 (299 cents)
- **Webhook branch:** None — falls through to default report path (which would generate a wrong output if reached). Orphaned endpoint; UI on `/report` redirects to `/subscribe` instead of invoking this.
- **Removal:**
  1. Delete `augur/server/api/create-tradition-payment.post.ts`
  2. Remove the `tradition-switcher` UI block from `report.vue:347–378`
- **Strategic context:** Tradition switching is unlimited within Premium subscription (STRATEGY.md §6, §7). No standalone IAP.

---

## 4. Stripe Price IDs and environment variables to retire

### 4.1 `NUXT_STRIPE_DAILY_PRICE_ID` — RETIRE

- **Value:** `price_1TKON6Du5bXWvSPjjieU5bEj`
- **Product:** Daily Horoscope Subscription ($6.99/mo) — superseded by `omenora_monthly` $14.99/mo (mobile)
- **References:**
  - `augur/.env:9`
  - `augur/.env.example`
  - `augur/nuxt.config.ts:53` — explicit comment: "DEPRECATED — keep for backward compat until B1b cleanup"
- **Removal:**
  1. Remove env var from `.env`, `.env.example`, and Railway production
  2. Remove `nuxt.config.ts:53` reference
  3. Archive the Stripe Price object manually in Stripe Dashboard
- **Pre-removal verification:** Confirm zero active subscriptions on this Price ID. Cancel any remaining before archiving.

### 4.2 `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` — RETIRE

- **Value:** `price_1TQRxoDebD8pElyXxRkkK7E1`
- **Product:** Compatibility Plus Subscription (deprecated Phase 2)
- **References:**
  - `augur/.env:10`
  - `augur/.env.example:17-18` — explicit comment: "DEPRECATED (Compatibility Plus subscription removed — Phase 2)"
- **Removal:**
  1. Remove env var from `.env`, `.env.example`, and Railway production
  2. Archive the Stripe Price object manually in Stripe Dashboard
  3. Remove `compatibility_plus` plan type references from `augur/server/api/save-subscriber.post.ts:16` and `augur/server/api/send-weekly-transits.post.ts:41`
- **Pre-removal verification:** Confirm zero active Compatibility Plus subscribers.

### 4.3 `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` — RETIRE

- **Value:** `price_1TQRzVDebD8pElyXeIeVem6b`
- **Product:** Compatibility Single (Stripe Price object) — superseded by inline `price_data` in `create-compatibility-payment.post.ts`
- **References:**
  - `augur/.env:11`
- **Removal:**
  1. Remove env var from `.env`, `.env.example`, and Railway production
  2. Archive the Stripe Price object manually in Stripe Dashboard
- **No active subscriptions** — this is a one-time price object, unused since inline `price_data` migration.

---

## 5. Stripe webhook branches to remove

File: `augur/server/api/stripe/webhook.post.ts`

After the endpoints in section 3 are deleted, remove the corresponding webhook branches:

| Webhook branch | Trigger | Removal |
|---|---|---|
| `metadata.type === 'report'` (default path) | Destiny Report fulfillment | Remove after `/report` page is no longer needed for legacy customers |
| `isBundlePurchase` flag | Bundle email and fulfillment | Remove |
| `isOraclePurchase` flag | Oracle email and fulfillment | Remove |
| Default-path birth-chart fallback | Birth chart generation | Remove |
| `metadata.type === 'calendar_2026'` (line ~706) | Calendar entitlement grant | **KEEP** — preserves legacy customer access |
| `metadata.type === 'tradition_switch'` (no dedicated branch) | Default report path catches this — bug | Remove the underlying endpoint (section 3.6); no webhook change needed |

---

## 6. Components to delete

### 6.1 `CTAButton.vue` — ✅ DONE (e5497f5)

- **File:** `app/components/CTAButton.vue` (121 lines)
- **Why:** Superseded by `AppButton` (DESIGN_SYSTEM.md §1). Three legacy variants (solid/outline/cta) using legacy token aliases. `AppButton` covers all use cases with canonical `--omn-*` tokens.
- **Removal sequence:**
  1. Audit all consuming files — search for `CTAButton` import statements
  2. Migrate each call site to `AppButton` with the equivalent variant
  3. Delete `app/components/CTAButton.vue`
- **Known consumers (verified Phase 0 audit 2026-05-27):**
  - `app/pages/index-legacy.vue` (already slated for removal in section 1.1)
  - `app/pages/analysis.vue` (active PRE-REDESIGN page — must be migrated to `AppButton` during the per-page redesign workstream before `CTAButton.vue` can be deleted)
  - `app/components/atoms/AppButton.vue` (likely internal reference; verify whether it's a true consumer or an internal import during migration audit)

**✅ RESOLVED & DONE.** `analysis.vue` migration to `AppButton` completed in `ba66d62`. `CTAButton.vue` deleted in `e5497f5` (its only remaining consumer, `index-legacy.vue`, was deleted in the same sweep).

### 6.2 `EditorialRule.vue` — ✅ DONE (e5497f5)

- **File:** `app/components/EditorialRule.vue` (38 lines)
- **Why:** Single-purpose component. Superseded by `AppDivider` (`variant="labeled"` covers the ornamented case).
- **Removal sequence:**
  1. Audit all consuming files — search for `EditorialRule` import statements
  2. Migrate each call site to `AppDivider`
  3. Delete `app/components/EditorialRule.vue`

---

## 7. Token aliases to remove

Location: `app/assets/css/editorial.css` lines 168–210 (SD6 alias layer) and lines 239–242 (vestigial tokens).

These cannot be removed until all consuming components are migrated to canonical `--omn-*` tokens. Tracked here as the post-migration removal target.

### 7.1 SD6 alias layer — RETIRE AFTER MIGRATION

Full list per DESIGN_SYSTEM.md §7.2. Aliases include `--surface-*`, `--text-*`, `--border-*`, `--color-*`, `--accent-gold*`, `--font-sans`, `--cta-*`, `--duration-*`, `--ease-out`, `--radius-*`, and others.

**Migration dependencies (per DESIGN_SYSTEM.md §7.4):**
- `AppHeader.vue` — must migrate to `--omn-*`
- `AppShell.vue` — must migrate to `--omn-*`
- `CTAButton.vue` — DEPRECATED entirely (section 6.1); removed instead of migrated
- `BackButton.vue` — must migrate to `--omn-*`
- `EditorialRule.vue` — DEPRECATED entirely (section 6.2); removed instead of migrated
- `PlacesAutocomplete.vue` — must migrate to `--omn-*`
- Quiz components in `app/components/quiz/` — must migrate to `--omn-*`
- All PRE-REDESIGN pages (per PAGES_AND_SECTIONS.md table) — must migrate to `--omn-*`

**Removal sequence:**
1. Migrate all consumers to canonical tokens
2. Verify zero references to any SD6 alias remain (codebase-wide search)
3. Remove lines 168–210 from `editorial.css`

### 7.2 Vestigial tokens — REMOVE

- `--text-hero-headline` — `clamp(34px, 9vw, 52px)` — unused
- `--text-subhead` — `clamp(19px, 4.5vw, 24px)` — unused
- `--text-pricing-meta` — `12px` — unused
- `--ease-out-expo` — alias of `--omn-ease` — unused

**Removal:** Verify zero references in codebase, then delete lines 239–242 from `editorial.css`. Can be removed independently of SD6 alias migration since these tokens are unused.

---

## 8. Page content corrections — homepage drift

Location: `app/pages/index.vue`

The homepage is REDESIGNED in structure but has content drift from the sandbox source. Per PAGES_AND_SECTIONS.md §2:

### 8.1 Hero section — ✅ DONE (fe8e666)

- Replace display lines `"Astrology that / feels / not generic."` with strategy-aligned headline
- Replace subhead containing "daily cosmic patterns" with locked product description
- Remove hardcoded `readingCount = ref('47,392')` fallback (line ~312) — let live API value render, or use a real fallback

### 8.2 Section 4 (Three Card Grid) — ✅ DONE (fe8e666)

- Remove intro body line "Delivered as a continuous PDF and a web report. Yours forever, no subscription, no account." — contradicts STRATEGY.md §2
- Rewrite card content to describe Founding Member deliverable, not legacy destiny report

### 8.3 Section 7 (Social Proof) — ✅ DONE (fe8e666)

- **Remove** counter stat `value: 12400` "Charts written to date" — conflicts with hero `readingCount`. Unify on live API value.
- **Remove** counter stats `'96'` (% would recommend) and `'4.8'` (rating out of 5) — no source, fabricated. Either back with real data or remove entirely.
- **Remove** three fabricated testimonials (Amara K., Daniel R., Priya S.) at lines ~389–393. The Priya S. testimonial references "$24" which corresponds only to the deprecated Full Oracle Bundle.
- **Action:** Section can be either backed by real Trustpilot/testimonial data OR removed from the homepage entirely until real social proof exists.

### 8.4 JSON-LD offers — ✅ COMPLETE (verified 2026-05-27)

Previously: `index.vue:447–451` contained deprecated SKUs ($4.99 Basic Reading, $9.99 Popular Bundle, $24.99 Full Oracle). Phase 0 verification audit (2026-05-27) confirmed these are no longer present in `index.vue`. The deprecated JSON-LD offers array has been removed during a prior homepage rebuild commit. No further action required.

### 8.5 SEO meta — ✅ DONE (fe8e666)

- Title and description currently include "Free Daily Horoscope" — off-strategy positioning
- Replace with locked product positioning (natal reading, Founding Member, etc.)

### 8.6 Final CTA image — RENAME (PARTIAL)

- Filename `ChatGPT Image May 23, 2026, 10_02_49 AM.png` — replace with semantic filename (e.g. `final-cta-cosmic.webp`)
- Convert to WebP if not already

**Partial status:**
- ✅ Code uses semantic `/images/hero/final-cta-cosmic.webp` (`fe8e666`)
- 🔲 PENDING: original `ChatGPT Image May 23, 2026, 10_02_49 AM.png` file still on disk (untracked) — delete or git-rm

---

## 9. Page content corrections — funnel and trust surfaces

### 9.1 `/preview` — REMOVE DEPRECATED REFERENCES (PARTIAL)

- Remove bundle/oracle promo-code branches (`preview.vue:541–548`)
- Remove `$9.99` pixel-tracking value (`preview.vue:405`)
- Remove or repurpose secondary CTA to `/subscribe` (`preview.vue:669`) — `/subscribe` is being removed (section 2.1)

**Partial status:**
- ✅ Secondary CTA to `/subscribe` removed (`b8911c3`) — single-CTA paywall
- 🔲 PENDING: bundle/oracle promo-code branches (`preview.vue:~541–548`) still present
- 🔲 PENDING: `$9.99` pixel-tracking value (`preview.vue:405`) still present

### 9.2 `/daily` — REMOVE OFF-STRATEGY CTAs (PARTIAL)

- Remove `$6.99` subscription upsell card (`daily.vue:341–350`)
- Remove daily archetype tab — Premium-only feature per STRATEGY.md §8
- Verify no remaining links to `/subscribe`

**Partial status:**
- ✅ `/subscribe` link redirected to `/founding` (`e5497f5`)
- 🔲 PENDING: `$6.99` upsell card HTML + price display still present (`daily.vue:344`)
- 🔲 PENDING: daily archetype tab still present

### 9.3 `/compatibility` — ✅ DONE (a8db836)

- Replace Premium subscription upsell with Founding Member CTA → `/founding`
- Verify $4.99 single compatibility primary CTA remains unchanged

### 9.4 Mobile `$12.99` orphan label — REMOVE

- `mobile-app/src/screens/CalendarScreen.tsx:75`
- `mobile-app/src/screens/CompatibilityScreen.tsx:88`
- Both display "Also included in Full Oracle · $12.99" — no product at this price exists anywhere. Full Oracle is deprecated.
- Remove these label strings entirely.

### 9.5 Counsel-on-web cleanup — NARROWED SCOPE

Per STRATEGY.md §7 and §8 (revised), web pages MAY name Counsel as a Founding Member benefit and as a named feature of the OMENORA mobile app. This is correct app-landing-page marketing per 2026 conversion research (specificity beats vagueness; named features convert better than generic "premium experience" copy). Web pages must NOT host Counsel chat UI and must NOT imply Counsel access is available through web subscription.

**Counsel references on `/` (homepage) and `/founding/*.vue`:** KEEP. These name Counsel as a Founding Member benefit / future mobile feature and are conversion-positive. No action.

**Cleanup targets (only these):**

- `augur/app/pages/subscribe.vue` — "Full Counsel access" listed in `subscribeInclude` translation keys (1–5). Subscribe page is DEPRECATED entirely (section 2.1) — page deletion handles this. No standalone fix needed.
- `augur/app/pages/report.vue` — Premium upsell uses `reportPremiumSubtitle` translation key that mentions Counsel. The fix here is NOT to rewrite the Counsel word; it is to **remove the Premium upsell section entirely from `/report`**. `/report` is PRESERVED-for-legacy-fulfillment-only (section 2.3) and should not host new Premium marketing at all. Removing the entire upsell block resolves the Counsel issue as a side effect.
- `augur/app/utils/translations.ts` — `reportPremiumSubtitle` key (lines 314, 624, 934, 1236, 1544, 1852 across en/es/pt/hi/ko/zh) becomes orphaned after the report.vue upsell is removed. Delete the unused translation key across all six language variants in the same cleanup.

**Action sequence:**

1. Remove the Premium upsell section from `report.vue` (entire block, not just Counsel wording)
2. Delete the orphaned `reportPremiumSubtitle` key across all six language variants in `translations.ts` 
3. Verify Counsel references on `/` and `/founding/*.vue` are kept (these are correct marketing)
4. No Windsurf rule needed forbidding Counsel marketing on web — that was based on the over-corrected scope

---

## 10. Legal page content corrections

### 10.1 `/refund-policy` — REWRITE PRICING REFERENCES

- Remove "Destiny Reading Reports ($2.99 one-time)" at `refund-policy.vue:43` — no product at this price exists
- Remove "Subscriptions ($4.99/month)" at `refund-policy.vue:57` — off-strategy
- Add Founding Member deposit refund language (Stripe-standard 14-day window or per terms)
- Add post-launch subscription refund language (App Store / RevenueCat policies)

### 10.2 `/terms` — REMOVE DEPRECATED PRODUCT DESCRIPTIONS

- Remove references to deprecated product descriptions at `terms.vue:58` and elsewhere
- Update with Founding Member and Premium subscription language

---

## 11. Database / Supabase cleanup

### 11.1 `compatibility_plus` plan type references — REMOVE

- `augur/server/api/save-subscriber.post.ts:16` — references `compatibility_plus` plan type
- `augur/server/api/send-weekly-transits.post.ts:41` — references `compatibility_plus`
- After Compatibility Plus Subscription Price ID is retired (section 4.2), remove these code references
- No schema migration needed if the `plan_type` column accepts arbitrary string values; do not delete existing rows with this plan_type (legacy data retention)

### 11.2 `subscribers` and `subscriptions` tables — AUDIT BEFORE TOUCH

- Tables hold legacy customer records for deprecated subscriptions
- Do not drop tables or columns during cleanup
- Confirm legacy subscribers are either migrated, refunded, or end-of-life'd before any data removal
- Schema cleanup is out of scope for this redesign workstream

---

## 12. Files known to be untracked

Per the design system audit:

- `augur/app/composables/useScrollSequence.ts` — decide whether to commit (canonical use case for homepage hero animation) or remove
- `augur/P1.3b-report.md` — audit document; move to `docs/` or delete
- `augur/PHASE_B_AUDIT.md` — audit document; move to `docs/` or delete
- `augur/PHASE_B_EXECUTION_PLAN.md` — execution plan; move to `docs/` or delete
- `augur/SANDBOX_REDESIGN_AUDIT.md` — audit document; move to `docs/` or delete
- `augur/public/images/hero/Architectural-cosmic.webp` — hero image candidate; commit or remove
- `augur/public/images/hero/ChatGPT Image May 23, 2026, 10_02_49 AM.png` — rename and commit, or remove (section 8.6). Phase 0 audit found `final-cta-cosmic.webp` already exists alongside — likely the renamed version. Verify and remove the original.
- `augur/public/images/hero/Cosmic-gold-ascension.webp` — active LCP hero image; commit
- `augur/public/images/hero/Distant-horizon-emergence.webp` — hero image candidate; commit or remove
- `augur/public/images/hero/final-cta-cosmic.webp` — Final CTA section hero image; commit
- `augur/public/images/hero/Nebula-void.webp` — hero image candidate; commit or remove
- `augur/public/images/hero/Threshold-moment.webp` — hero image candidate; commit or remove

**Critical:** The currently-active hero images on the LIVE homepage are untracked. A fresh-clone deploy will break. These must be committed before any production deployment.

---

## 13. Removal sequence (ordered execution plan)

Higher tiers must complete before lower tiers. Items within a tier can run in parallel.

### Tier 1 — Live route removals (urgent SEO/strategy alignment)

1. Delete `app/pages/index-legacy.vue` (section 1.1)
2. Move or delete `app/pages/sandbox/redesign-home.vue` (section 1.2)
3. Add noindex to `app/pages/compatibility-quiz.vue` (section 1.3)
4. Commit untracked hero images to prevent fresh-clone deploy failure (section 12)

### Tier 2 — Homepage content corrections (already-redesigned page, content drift)

5. Hero copy replacement (section 8.1)
6. Section 4 intro and cards rewrite (section 8.2)
7. Section 7 fabricated content removal (section 8.3)
8. JSON-LD offers replacement (section 8.4)
9. SEO meta replacement (section 8.5)
10. Final CTA image rename (section 8.6)

### Tier 3 — Funnel and trust surface cleanups

11. `/preview` deprecated reference removal (section 9.1)
12. `/daily` off-strategy CTA removal (section 9.2)
13. `/compatibility` upsell target replacement (section 9.3)
14. Mobile $12.99 orphan label removal (section 9.4)
15. Counsel-on-web marketing copy removal across `/report` and `translations.ts` (section 9.5)

### Tier 4 — Stripe product removals (after Tier 3 verifies no inbound sale paths)

15. Delete Destiny Report endpoint and webhook branch (section 3.1)
16. Delete Most Popular Bundle endpoint and webhook branch (section 3.2)
17. Delete Full Oracle Bundle endpoint and webhook branch (section 3.3)
18. Delete Standalone Birth Chart endpoint (section 3.4)
19. Delete Standalone Calendar web endpoint (section 3.5) — keep webhook branch for legacy fulfillment
20. Delete Tradition Switch endpoint and UI block (section 3.6)
21. Remove deprecated tiers from `apply-promo-discount.post.ts`

### Tier 5 — Stripe Price ID and env var retirement

22. Retire `NUXT_STRIPE_DAILY_PRICE_ID` after verifying zero active subscriptions (section 4.1)
23. Retire `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` after verifying zero active subscriptions (section 4.2)
24. Retire `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` (section 4.3)
25. Remove `compatibility_plus` plan type code references (section 11.1)

### Tier 6 — Deprecated page removals

26. ✅ DONE (e5497f5) — Delete `/subscribe` and `/subscription` (sections 2.1, 2.2)

### Tier 7 — Legal copy updates

27. `/refund-policy` rewrite (section 10.1)
28. `/terms` rewrite (section 10.2)

### Tier 8 — Component removals (after consumer migration)

29. ✅ DONE (e5497f5) — Audit and migrate all `CTAButton` consumers to `AppButton`, then delete (section 6.1)
30. ✅ DONE (e5497f5) — Audit and migrate all `EditorialRule` consumers to `AppDivider`, then delete (section 6.2)

### Tier 9 — Token alias removal (after consumer migration)

31. Migrate `AppHeader`, `AppShell`, `BackButton`, `PlacesAutocomplete`, quiz components, and all PRE-REDESIGN pages to `--omn-*` tokens
32. Verify zero references to SD6 aliases remain
33. Remove SD6 alias layer from `editorial.css` (section 7.1)
34. Remove vestigial tokens from `editorial.css` (section 7.2) — can run before Tier 9 since vestigial tokens have zero consumers

### Tier 10 — Long-term legacy customer fulfillment

35. Monitor `/report` and `/calendar` traffic. After legacy customer base ages out, schedule final removal in a future cleanup pass.

---

## 14. Out of scope for this cleanup

The following items are NOT in this document because they are not deprecated — they require new work or are tracked elsewhere:

- **Premium subscription Price ID configuration** — missing from `.env`. This is configuration gap, not deprecation (PRODUCT_MAP.md §7). Required before launch, but creation work, not removal work.
- **Mobile `purchasePackage()` implementation** — RevenueCat purchase flow not yet wired. Tracked as PRE-LAUNCH in PRODUCT_MAP.md, not deprecated.
- **Counsel Boost Pack purchase endpoints (web)** — webhook plumbing exists, no purchase endpoints. Strategy lists these as mobile-only (PRODUCT_MAP.md §3); no removal needed on web since they were never built.
- **Counsel cap correction (30/day → 30/month)** — backend bug, not deprecation. Tracked in PRODUCT_MAP.md §5.
- **`/discover` funnel** — does not exist yet (PRE-LAUNCH). Tracked in STRATEGY.md §5 as Phase B2 work.
- **`AppHeader` and `AppShell` token migration** — required work to unblock SD6 alias removal. Tracked in DESIGN_SYSTEM.md §9 as open items.

---

*This document is the master deprecation list. Items here are decided removals. New deprecation decisions arrive here via documented updates to STRATEGY.md, PRODUCT_MAP.md, DESIGN_SYSTEM.md, or PAGES_AND_SECTIONS.md.*
