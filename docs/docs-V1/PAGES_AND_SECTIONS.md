# OMENORA — Pages and Sections

> Catalog of every page in `augur/app/pages/` with current state, strategic role, redesign status, and section composition.
> Single source of truth for what each page is, what it does, and what work it needs.
> When this document and code conflict, code must be brought into alignment with this document.
> Strategic decisions trace back to STRATEGY.md. Product decisions trace back to PRODUCT_MAP.md. Design system decisions trace back to DESIGN_SYSTEM.md.

---

## Status legend

- **REDESIGNED** — Uses canonical design system (Section molecules, `--omn-*` tokens), aligned with locked strategy
- **REDESIGN IN PROGRESS** — Partially migrated, mixed canonical and legacy patterns
- **PRE-REDESIGN** — Still uses legacy components and tokens, redesign work pending
- **PRESERVED** — Operational for fulfillment of past purchases; not redesigning, not deleting
- **DEPRECATED — DO NOT REDESIGN** — Sells or references deprecated products per PRODUCT_MAP.md, slated for removal

---

## 1. Master page inventory

16 pages plus 2 special files (index-legacy.vue, sandbox/redesign-home.vue).

| # | Route | File | Strategic role | Status |
|---|---|---|---|---|
| 1 | `/` | `app/pages/index.vue` | Acquisition / marketing homepage | **REDESIGNED** |
| 2 | `/founding` | `app/pages/founding/index.vue` | Paywall conversion event (Founding Member $20) | **REDESIGN IN PROGRESS** |
| 3 | `/founding/thank-you` | `app/pages/founding/thank-you.vue` | Post-purchase fulfillment (founding) | **REDESIGN IN PROGRESS** |
| 4 | `/compatibility-quiz` | `app/pages/compatibility-quiz.vue` | Acquisition funnel (love path) | **PRE-REDESIGN** |
| 5 | `/compatibility` | `app/pages/compatibility.vue` | Paywall + report ($4.99 single compat) | **PRE-REDESIGN** |
| 6 | `/analysis` | `app/pages/analysis.vue` | Acquisition funnel (legacy archetype) | **PRE-REDESIGN** |
| 7 | `/preview` | `app/pages/preview.vue` | Paywall conversion event (post-analysis) | **PRE-REDESIGN** |
| 8 | `/report` | `app/pages/report.vue` | Post-purchase report renderer | **DEPRECATED — DO NOT REDESIGN** |
| 9 | `/daily` | `app/pages/daily.vue` | Free trust surface (daily zodiac) | **PRE-REDESIGN** |
| 10 | `/account` | `app/pages/account.vue` | Authenticated app surface | **PRE-REDESIGN** |
| 11 | `/subscribe` | `app/pages/subscribe.vue` | Paywall (deprecated $6.99 daily sub) | **DEPRECATED — DO NOT REDESIGN** |
| 12 | `/subscription` | `app/pages/subscription.vue` | Post-purchase (deprecated $6.99 daily sub) | **DEPRECATED — DO NOT REDESIGN** |
| 13 | `/calendar` | `app/pages/calendar.vue` | Post-purchase calendar fulfillment | **PRESERVED** |
| 14 | `/privacy` | `app/pages/privacy.vue` | Legal | **PRE-REDESIGN** |
| 15 | `/terms` | `app/pages/terms.vue` | Legal | **PRE-REDESIGN** |
| 16 | `/refund-policy` | `app/pages/refund-policy.vue` | Legal | **PRE-REDESIGN** |
| — | `/index-legacy` | `app/pages/index-legacy.vue` | Pre-redesign homepage backup, actively routed | **DEPRECATED — REMOVE** |
| — | `/sandbox/redesign-home` | `app/pages/sandbox/redesign-home.vue` | Sandbox design source, actively routed | **DEPRECATED — REMOVE FROM `pages/`** |

---

## 2. Homepage — section-by-section content lock

Route: `/`
File: `app/pages/index.vue`
Status: **REDESIGNED** with content drift requiring correction.
Composition: All 10 Section molecules (P-01 through P-10), plus inline `SectionPaywallCard` and atmospheric layers (`.page-grain`, `.page-scroll-progress`).

### Locked section sequence

| # | Section | Role |
|---|---|---|
| 1 | `SectionHero` (P-01) | Hero band |
| 2 | `SectionSideBySide` (P-05) | Founding Members |
| 3 | `SectionLede` (P-02) | The method |
| 4 | `SectionThreeCardGrid` (P-03) | What you receive |
| 5 | `SectionSideBySide` (P-05) | The traditions |
| 6 | `SectionCenteredStatement` (P-04) + inline `SectionPaywallCard` (P-06) | Paywall band |
| 7 | `SectionSocialProof` (P-07) | Testimonials and stats |
| 8 | `SectionCenteredStatement` (P-04) | Closing statement |
| 9 | `SectionFAQ` (P-08) | Common questions |
| 10 | `SectionFinalCTA` (P-09) | Final conversion |
| 11 | `SectionFooter` (P-10) | Footer |

### Section 1 — Hero (P-01)

- **Display lines:** "Astrology that / feels / not generic." — needs replacement. Current copy is sandbox-decorative and does not match locked positioning. Replacement headline should derive from the locked positioning: "Your chart, computed. Not selected from a database." or equivalent strategy-aligned line.
- **Eyebrow:** "The complete natal reading"
- **Subhead:** Current copy mentions "daily cosmic patterns" — needs replacement. Subhead should describe the product per STRATEGY.md: a complete reading computed across four traditions.
- **Image:** `/images/hero/Cosmic-gold-ascension.webp` — LIVE asset.
- **CTAs:** UTM-variant-driven primary CTA. Default: "Begin your reading" → `/founding` during pre-launch phase.
- **Trust strip:** Live reading count from `/api/get-reading-count` (no hardcoded fallback that contradicts the counter stat).
- **Section marker:** None (hero typically unmarked).

### Section 2 — Founding Members (P-05, SectionSideBySide)

- **Eyebrow:** "Founding members"
- **Heading:** "Make Omenora exist."
- **Body:** Founding Members narrative per STRATEGY.md §4: $20 deposit, 50% off Premium for life, closes at App Store launch.
- **Marker:** `§ 02`
- **Image:** `/images/hero/Threshold-moment.webp`
- **CTAs (#outro slot):** Primary "Claim founding membership — $20" → `/founding`. Secondary "Try the free reading first" → `/analysis`.

### Section 3 — The method (P-02, SectionLede)

- **Eyebrow:** "The method"
- **Heading:** "Your chart, computed — not selected from a database."
- **Body:** Differentiation copy. Swiss Ephemeris, four traditions, computed per individual birth chart vs horoscope-app commodity. Aligned with STRATEGY.md §1.
- **Marker:** `§ 03`
- **Image:** `/images/hero/Architectural-cosmic.webp`
- **CTA (#actions slot):** "Read what your chart says →" → `/founding`

### Section 4 — What you receive (P-03, SectionThreeCardGrid)

- **Eyebrow:** "What you receive"
- **Heading:** Current "Three documents. One reading." — needs review. The "three documents" framing was inherited from the legacy destiny-report product. The Founding Member deposit reserves access to the full reading at launch; the deliverable format and document count are not yet locked.
- **Intro body:** Current copy "Delivered as a continuous PDF and a web report. Yours forever, no subscription, no account." — **OFF-STRATEGY.** Contradicts STRATEGY.md §2 (mobile app is the product, subscription is primary). Needs rewrite to describe what the Founding Member deposit reserves: complete natal reading at launch, with 50%-off Premium subscription locked in.
- **Marker:** `§ 04`
- **Image:** `/images/hero/Cosmic-gold-ascension.webp`
- **Cards:** Card content needs rewrite to match the launch product, not the legacy report.

### Section 5 — The traditions (P-05, SectionSideBySide)

- **Eyebrow:** "The traditions"
- **Heading:** "Read across four traditions — because no single one tells the whole chart."
- **Columns:** Western, Vedic, BaZi, Tarot — the four locked traditions per STRATEGY.md §1.
- **Marker:** `§ 05`
- **Image:** `/images/hero/Distant-horizon-emergence.webp`
- **No CTA.**

### Section 6 — Paywall band (P-04 + P-06)

Composite section wrapped in `<div id="paywall" class="paywall-band">`. Two molecules composed:

- **`SectionCenteredStatement` (P-04):**
  - Eyebrow: "Begin"
  - Heading: "One reading. One price. Yours for keeps."
  - Marker: `§ 06`
  - Image: `/images/hero/Threshold-moment.webp`
- **`SectionPaywallCard` (P-06):**
  - Price label: "Founding member deposit"
  - Price value: `$20`
  - CTA label: "Reserve your reading" → `/founding`
  - Items: Founding Member benefits per STRATEGY.md §4
  - Trust items: Stripe-secured, no recurring charge, 50% off Premium for life

### Section 7 — Testimonials and stats (P-07, SectionSocialProof)

- **Eyebrow:** "Testimonials"
- **Heading:** "From a few of the {{ readingCount }} charts read so far."
- **Marker:** `§ 07`
- **Image:** `/images/hero/Nebula-void.webp`
- **Counters:**
  - Current state: `12,400` "Charts written to date" — **conflicts** with `readingCount` fallback (`47,392`) in the hero trust strip.
  - **Lock:** Counter must use the same live value from `/api/get-reading-count` as the hero trust strip. Hardcoded `12,400` must be removed.
  - `'96'` (% would recommend) and `'4.8'` (rating out of 5) — **fabricated, no source.** These must be removed unless backed by real data (Trustpilot reviews, NPS data, etc.).
- **Testimonials:**
  - Current state: Three named testimonials (Amara K., Daniel R., Priya S.). Source unverified. The Priya S. testimonial references "$24 for the recurring thread part" — `$24` corresponds only to the deprecated Full Oracle Bundle (PRODUCT_MAP.md §6.1).
  - **Lock:** Section must be either backed by real testimonials and reviews, or removed from the homepage. Fabricated content cannot ship. Trustpilot widget exists in codebase and can be integrated once reviews are collected.

### Section 8 — Closing statement (P-04, SectionCenteredStatement)

- **Eyebrow:** "One more thing"
- **Heading:** "The chart doesn't move. You do."
- **Body:** Closing argument before FAQ.
- **Marker:** `§ 08`
- **CTAs (#actions slot):** "Become a founding member" → `/founding`, "Review the offer" → `#paywall`
- **No image.**

### Section 9 — FAQ (P-08, SectionFAQ)

- **Eyebrow:** "Common questions"
- **Heading:** "Ten things people ask before they buy."
- **Marker:** `§ 09`
- **Items:** FAQ pairs must align with Founding Member offer and locked strategy. Any FAQ referencing deprecated products (bundles, $4.99 destiny report, $24.99 Oracle) must be removed.

### Section 10 — Final CTA (P-09, SectionFinalCTA)

- **Eyebrow:** "Final"
- **Heading:** "The reading already exists. You just haven't read it yet."
- **Marker:** `§ 10`
- **Image:** `/images/hero/Image-Landing-1.webp` — **filename needs cleanup** (was previously a ChatGPT-named file).
- **CTA:** "Begin your reading" → `/founding`

### Section 11 — Footer (P-10, SectionFooter)

- **Columns:** 3 columns of links (Product, Company, Legal).
- **Brand:** OMENORA
- **Legal links:** `/privacy`, `/terms`, `/refund-policy`
- **Copyright:** Current year, UNCC Inc. dba UNC Development.

### Other homepage corrections required

- **JSON-LD `offers` array (`index.vue:447–451`):** Currently contains deprecated SKUs ($4.99 Basic Reading, $9.99 Popular Bundle, $24.99 Full Oracle). Must be replaced with the Founding Member offer ($20) or removed entirely.
- **`readingCount` hardcoded fallback (`index.vue:312`):** Value `'47,392'` has no documented basis. Either set to a known-real fallback or remove the fallback so the value renders blank until the API returns.
- **SEO meta:** Title and description must not include "Free Daily Horoscope" (off-strategy positioning); must describe the locked product (natal reading, Founding Member, etc.).
- **AppHeader on homepage:** Currently used. Token migration pending (DESIGN_SYSTEM.md §6).

---

## 3. `/founding` — Founding Member checkout

File: `app/pages/founding/index.vue` (711 lines)
Strategic role: Paywall conversion event (active pre-launch conversion target)
Status: **REDESIGN IN PROGRESS**

### What's correct

- Uses canonical atoms (`AppEyebrow`, `AppHeadline`, `AppSubhead`, `AppCaption`, `AppButton`, `AppDivider`)
- Wired to Stripe Product `prod_UY0Gy2qVuKJA4S` / Price `price_1TYuFlDebD8pElyX90pX4jbc`
- Live and accepting deposits

### What needs work

- `AppShell` wrapper consumes legacy tokens — pending migration with `AppShell` itself
- Scoped CSS uses legacy alias tokens (`--accent-gold`, `--text-primary`, `--surface-raised`, `--font-sans`, `--border-subtle`) — migrate to `--omn-*`
- Page does not currently use Section molecules. Decision required: keep as atom-composed page (consistent with checkout simplicity) or rebuild using `SectionPaywallCard` + `SectionFinalCTA`.

### Recommended approach

Keep as atom-composed. Checkout pages benefit from simpler structure than marketing pages. Token migration is the only required work.

---

## 4. `/founding/thank-you` — Post-purchase confirmation

File: `app/pages/founding/thank-you.vue` (596 lines)
Strategic role: Post-purchase fulfillment
Status: **REDESIGN IN PROGRESS**

Same profile as `/founding`. Token migration is the only required work. Polls Stripe session via `?session_id=cs_…` parameter until payment confirms.

---

## 5. `/compatibility-quiz` — Compatibility funnel

File: `app/pages/compatibility-quiz.vue` (402 lines)
Strategic role: Acquisition funnel (love path)
Status: **PRE-REDESIGN**

### What's correct

- Live, taking TikTok ad traffic
- Uses canonical Quiz components (`QuizSingleSelect`, `QuizDateInput`, `QuizTimeInput`, `QuizCityInput`, `QuizTextInput`, `QuizRewardScreen`, `QuizProgressBar`)

### What needs work

- **No `noindex` meta** — currently crawlable. Must add `robots: 'noindex, nofollow'` to match all other funnel pages.
- Quiz components themselves still consume legacy alias tokens (tracked in DESIGN_SYSTEM.md §7.4). Migration is shared with all quiz pages, not specific to this page.
- Paywall destination at end of quiz routes to `/compatibility` ($4.99 single compat) — verified consistent with locked strategy.
- Upsell on `/compatibility` paywall must route to `/founding` (Founding Member), not `/subscribe` (deprecated). Confirm in next page.

---

## 6. `/compatibility` — Compatibility paywall and report

File: `app/pages/compatibility.vue` (~1891 lines)
Strategic role: Paywall conversion event ($4.99 single compat) + post-payment report renderer
Status: **PRE-REDESIGN**

### What's correct

- Live, $4.99 paywall functional
- noindex meta set

### What needs work

- Page is monolithic; decompose paywall portion into `SectionPaywallCard` + report portion into purpose-built layout
- Migrate scoped CSS from legacy aliases to `--omn-*`
- Upsell slot must link to `/founding` (Founding Member), not Premium subscription
- The post-purchase report renderer can be decomposed in a later phase; the paywall portion is the immediate priority

---

## 7. `/analysis` — Legacy archetype funnel

File: `app/pages/analysis.vue` (790 lines)
Strategic role: Acquisition funnel (legacy archetype)
Status: **PRE-REDESIGN**

### Strategic context

Per STRATEGY.md §5, the archetype funnel will be rebuilt at `/discover` as a 25-question Nebula-pattern quiz. `/analysis` is the legacy 3-question version that exists today. It converts and runs ads; it does not get deleted until `/discover` ships.

### What needs work

- Migrate `editorial-input` and `quiz-option` CSS to canonical patterns
- Migrate legacy tokens to `--omn-*`
- noindex meta is already set

### When `/discover` ships (Phase B2)

`/analysis` becomes either a redirect to `/discover` or a deprecated route to remove. Decision deferred to Phase B2 implementation.

---

## 8. `/preview` — Post-analysis paywall

File: `app/pages/preview.vue` (1265 lines)
Strategic role: Paywall conversion event (post-analysis funnel)
Status: **PRE-REDESIGN**

### What's correct

- Primary CTA already routes to `/founding`
- noindex meta set

### What needs work

- **Remove deprecated bundle/oracle promo-code branches** (`preview.vue:541–548`) — bundles eliminated per STRATEGY.md §8
- **Remove `$9.99` pixel-tracking value** (`preview.vue:405`) — corresponds to deprecated Most Popular Bundle
- **Remove secondary CTA to `/subscribe`** (`preview.vue:669`) — `/subscribe` is DEPRECATED. Secondary CTA should route to `/compatibility-quiz` or be removed.
- Migrate legacy token CSS to `--omn-*`

---

## 9. `/daily` — Free trust surface

File: `app/pages/daily.vue` (1271 lines)
Strategic role: Trust surface (free daily zodiac)
Status: **PRE-REDESIGN**

### Strategic context

Per STRATEGY.md §5, `/daily` is the free unpaywalled trust-builder. No funnel, no email capture, no paywall. Daily zodiac horoscope only — daily archetype is removed from this page (Premium-only feature).

### What needs work

- **Remove `$6.99` subscription upsell card** (`daily.vue:341–350`) — links to deprecated `/subscribe` flow. Per STRATEGY.md §5, this page does not paywall or push subscription.
- **Remove daily archetype tab** — daily archetype is a Premium-only feature per STRATEGY.md §8 ("Daily archetype on the free `/daily` page — Premium feature only").
- Migrate legacy token CSS to `--omn-*`
- Consider whether to decompose into Section molecules or keep current structure. Recommendation: keep current structure (page is content-dense and recurring, Section molecules optimized for marketing pages).

---

## 10. `/account` — Authenticated app surface

File: `app/pages/account.vue` (1487 lines)
Strategic role: Authenticated app surface
Status: **PRE-REDESIGN**

### What needs work

- Magic-link auth flow is functional; no behavioral change needed
- Migrate scoped CSS from legacy aliases to `--omn-*`
- No Section molecules needed (authenticated dashboards are not marketing pages)

---

## 11. `/calendar` — Preserved fulfillment

File: `app/pages/calendar.vue` (800 lines)
Strategic role: Post-purchase fulfillment (preserved for legacy purchasers)
Status: **PRESERVED**

### Strategic context

Per PRODUCT_MAP.md §6.1, the standalone web Calendar product is deprecated on web (moved to mobile IAP). However, customers who purchased the 2026 calendar before deprecation must retain access to their purchase. This page renders the calendar for those users.

### What needs work

- **Do not sell new calendar purchases from this page.** Remove any `Buy now` CTAs if present.
- Page stays operational as long as any active calendar purchases exist.
- Migrate token CSS to `--omn-*` only if/when convenient. Not a priority.
- Stripe webhook + DB row continue working unchanged.

---

## 12. Legal pages

### `/privacy` — Privacy policy

File: `app/pages/privacy.vue` (788 lines)
Status: **PRE-REDESIGN**

- Content is GDPR/CCPA compliant
- No strategic urgency; cosmetic redesign only
- Migrate token CSS to `--omn-*`

### `/terms` — Terms of service

File: `app/pages/terms.vue` (604 lines)
Status: **PRE-REDESIGN**

- **Content update required:** Remove references to deprecated products (`terms.vue:58` references deprecated product descriptions)
- Migrate token CSS to `--omn-*`

### `/refund-policy` — Refund policy

File: `app/pages/refund-policy.vue` (270 lines)
Status: **PRE-REDESIGN**

- **Content update required:**
  - Remove "$2.99 Destiny Reading Reports" reference (`refund-policy.vue:43`) — no product at this price
  - Remove "$4.99/month Subscriptions" reference (`refund-policy.vue:57`) — superseded by $14.99/mo per PRODUCT_MAP.md §6.2
  - Add Founding Member deposit refund language (Stripe-standard 14-day window or per terms)
  - Add post-launch subscription refund language (App Store / RevenueCat policies)
- Migrate token CSS to `--omn-*`

---

## 13. Deprecated pages — to remove

### `/report` — Legacy destiny report renderer

File: `app/pages/report.vue` (3120 lines)
Status: **DEPRECATED — DO NOT REDESIGN**

### Why deprecated

- Sells deprecated bundle/oracle/tradition-switcher products (PRODUCT_MAP.md §6.1)
- Displays `$6.99/mo` subscription upsell — off-strategy per PRODUCT_MAP.md §6.3
- Renders the legacy destiny-report deliverable, which is no longer the OMENORA product
- 3120 lines of code dependent on deprecated SKUs

### Disposition

This page exists today because `/preview` users who purchased the destiny report ended up here. After cleanup:

- Stop creating new report purchases (already handled by removing bundle/oracle CTAs from `/preview`)
- Existing report purchases continue to render via this page until ALL active purchases age out
- Final removal occurs after the cleanup pass deletes the bundle/oracle/destiny-report endpoints

### `/subscribe` — Deprecated subscription signup

File: `app/pages/subscribe.vue` (1172 lines)
Status: **DEPRECATED — DO NOT REDESIGN**

### Why deprecated

- Sells the deprecated Daily Horoscope Subscription at the legacy `$6.99/mo` price (PRODUCT_MAP.md §6.2)
- The locked subscription model is mobile-only ($14.99/mo via RevenueCat per STRATEGY.md §6)
- Per PRODUCT_MAP.md §7, Premium subscription env vars are not configured — `/subscribe` returns 503 on any attempted checkout

### Disposition

Page can be removed safely. No legacy customer harm — recurring subscribers were migrated or refunded per earlier cleanup. Confirm zero active legacy subscriptions before deletion.

### `/subscription` — Deprecated subscription confirmation

File: `app/pages/subscription.vue` (255 lines)
Status: **DEPRECATED — DO NOT REDESIGN**

Post-purchase confirmation for the deprecated `/subscribe` flow. Removed alongside `/subscribe`.

### `/index-legacy` — Pre-redesign homepage

File: `app/pages/index-legacy.vue` (~1265 lines)
Status: **DEPRECATED — REMOVE**

### Why this is urgent

- Sits under `app/pages/` and is therefore actively routed by Nuxt at `/index-legacy`
- Was previously listed in `.git/info/exclude` (untracked) but still exists on disk and routes
- Contains JSON-LD offers for all three deprecated SKUs ($4.99, $9.99, $24.99) — actively served to Google
- Uses `CTAButton` (DEPRECATED per DESIGN_SYSTEM.md §7.1) and legacy tokens throughout

### Disposition

Delete the file. No referencing pages link to it. Search engines indexing `/index-legacy` will 404 after deletion, which is the correct behavior.

### `/sandbox/redesign-home` — Sandbox design source

File: `app/pages/sandbox/redesign-home.vue` (2156 lines)
Status: **DEPRECATED — REMOVE FROM `pages/`**

### Why this is urgent

- Sits under `app/pages/sandbox/` and is therefore actively routed by Nuxt at `/sandbox/redesign-home`
- Has `noindex, nofollow` meta but is still publicly accessible at the route
- Contains 2156 lines of sandbox-only content that contradicts locked strategy
- Was the visual reference used to rebuild `index.vue` — that work is now complete

### Disposition

Move the file out of `app/pages/` to a non-routed location (e.g. `docs/design-references/`) or delete it. Either action removes the live route.

---

## 14. Page work priority

When the redesign workstream resumes, work in this order. Higher items unblock or invalidate lower items.

### Tier 1 — Urgent removals (security/SEO/strategy alignment)

1. **Delete `/index-legacy.vue`** — actively serving deprecated JSON-LD to Google
2. **Move or delete `/sandbox/redesign-home.vue`** — live publicly-accessible route
3. **Add `noindex` to `/compatibility-quiz`** — currently crawlable

### Tier 2 — Homepage content corrections (already redesigned, content drift)

4. **Homepage section content lock** — apply the section-by-section locks in Part 2 of this document:
   - Hero headline and subhead (replace sandbox-decorative copy)
   - Section 4 intro body and cards (remove off-strategy "PDF + web report" framing)
   - Section 7 testimonials and stats (remove fabricated; integrate real or remove section)
   - JSON-LD offers (replace deprecated SKUs)
   - SEO meta (remove "Free Daily Horoscope" positioning)
   - Reconcile `readingCount` between hero and counter stat

### Tier 3 — Funnel cleanups (in-funnel deprecated references)

5. **`/preview`** — remove bundle/oracle promo-code branches, remove `$9.99` pixel value, remove `/subscribe` CTA
6. **`/daily`** — remove `$6.99` subscription card, remove daily archetype tab
7. **`/compatibility`** — replace Premium upsell slot with Founding Member CTA

### Tier 4 — Page deletions (after Tier 3 verifies no inbound links)

8. **Delete `/subscribe`** and **`/subscription`** — after `/preview` and `/daily` no longer link to them
9. **`/report`** — leave operational for legacy purchases; remove the upstream sale paths in cleanup pass

### Tier 5 — Legal copy updates

10. **`/refund-policy`** — remove deprecated pricing, add Founding Member and post-launch subscription language
11. **`/terms`** — remove deprecated product descriptions

### Tier 6 — Token migrations (cosmetic, can interleave)

12. **`/founding` and `/founding/thank-you`** — migrate scoped CSS to `--omn-*`
13. **`AppHeader` and `AppShell`** — design system priority (DESIGN_SYSTEM.md §6); unblocks all consuming pages
14. **Quiz components** — design system priority (DESIGN_SYSTEM.md §7.4); unblocks `/compatibility-quiz` and `/analysis`
15. **`/analysis`, `/account`, `/privacy`, `/terms`, `/refund-policy`** — token migration as convenient

### Tier 7 — Phase B2

16. **Build `/discover`** — the 25-question Nebula-pattern archetype funnel (STRATEGY.md §5)
17. **Retire or redirect `/analysis`** — once `/discover` is converting

---

*This document is the master pages reference. It does not change without an explicit strategic, product, or design decision documented in STRATEGY.md, PRODUCT_MAP.md, or DESIGN_SYSTEM.md.*
