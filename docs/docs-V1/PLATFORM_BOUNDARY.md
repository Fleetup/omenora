# OMENORA — Platform Boundary

> **STATUS: PROPOSED — not yet locked.** This document defines the single thing the strategy was missing: an explicit, per-product, per-surface statement of **what lives on web and what lives on mobile**, across both lifecycle phases. It is the answer to "why do the docs keep contradicting each other" — they improvised the boundary case-by-case and the improvisations diverged. This manifest replaces improvisation with one table.
>
> **Authority:** On approval, this becomes supreme over PRODUCT_MAP.md for all platform/placement questions, second only to STRATEGY.md. PRODUCT_MAP.md is then rewritten to *instantiate* this boundary rather than restate it. Where any document conflicts with this one on where a product lives, this document wins.
>
> **One decision is open** (§5, web compatibility). It is pre-filled with the recommended position and flagged. Everything else is confirmation of already-locked strategy.

---

## 1. The principle, stated once

**Mobile is where OMENORA sells the product. Web is where OMENORA acquires the buyer and raises pre-launch capital.**

This already exists as a principle in STRATEGY §2 and §9. What was missing — and what caused every contradiction — is the *per-SKU manifest* that turns the principle into a rule. A principle says "mobile is the product." A manifest says "the calendar is sold on mobile and nowhere else." The contradictions lived in the gap between those two sentences. §3 closes the gap.

**Boundary rule of thumb:** if it *charges a card for the OMENORA product experience*, it is mobile (post-launch) — except the two pre-launch web capital/tripwire mechanisms named below. If it *persuades, previews, or builds trust*, it is web.

---

## 2. A distinction that must not be confused

**Where code runs ≠ where a product is sold.** Several report-generation endpoints physically execute on the web/Nuxt server; the mobile app calls them over the network. That does not make them web products. This manifest assigns products and surfaces by **where the user buys and uses them**, never by where the code happens to execute. "The compatibility generator runs on web infra" is an architecture fact, not a placement fact.

---

## 3. The manifest — every product and surface, by platform and phase

### 3.1 Products (anything that charges a card)

| Product | Price | Web? | Mobile? | Phase | Status |
|---|---|---|---|---|---|
| Founding Member deposit | $20 one-time | **YES — web only** | No | Pre-launch only; closes at launch | LIVE |
| Single Compatibility Reading | $4.99 one-time | **YES — web** (see §5) | YES — IAP | Web: now. Mobile: at launch | Web LIVE / Mobile PRE-LAUNCH |
| Annual Lucky Timing Calendar | $4.99 one-time | **NO — never on web** | YES — IAP | At launch | Web DELETED / Mobile PRE-LAUNCH |
| Premium subscription (weekly $5.99 / monthly $14.99 / annual $99.99) | recurring | **NO — never on web** | YES — RevenueCat | At launch | Web N/A / Mobile PRE-LAUNCH |
| Counsel Boost Packs ($1.99 / $4.99 / $9.99) | one-time credits | **NO — never on web** | YES — IAP | At launch | Web N/A / Mobile PRE-LAUNCH |

### 3.2 Product surfaces (what the user experiences)

| Surface | Web? | Mobile? | Notes |
|---|---|---|---|
| Today — daily **zodiac** horoscope | **YES — free** (`/daily`) | YES — inside Premium | Free generic-by-sign version on web is the trust/SEO surface. No email capture, no paywall, no CTA. |
| Today — daily **archetype** insight | **NO — Premium only** | YES — inside Premium | Must NOT appear on web `/daily`. This is the one surface item actively mis-placed in current web code. |
| Readings (Archetype, Natal, Forecast, Compatibility) | **Preview only** | YES — full, inside Premium | Web shows blurred/partial previews via funnels; full readings are mobile Premium. |
| Counsel (AI chat) | **NO — may market, never host** | YES — mobile only (v1) | Web may name Counsel as a mobile feature; web must never host chat UI or imply web access. (STRATEGY §7/§8.) |
| Tradition switching | **NO** | YES — inside Premium | Standalone web tradition-switch product is deprecated/deleted. |

### 3.3 Web-only surfaces (no SKU — acquisition, trust, legal)

| Surface | Role | Status |
|---|---|---|
| `/` homepage | Marketing / acquisition entry | LIVE |
| `/compatibility-quiz` → `/compatibility` | Compatibility funnel → $4.99 paywall → Founding upsell | LIVE |
| `/analysis` → `/preview` | Legacy archetype funnel → Founding | LIVE |
| `/discover` | Planned 25-q archetype funnel → Founding | PRE-LAUNCH |
| `/daily` | Free daily zodiac, trust + SEO | LIVE |
| `/founding`, `/founding/thank-you` | Founding checkout + fulfillment | LIVE |
| `/privacy`, `/terms`, `/refund-policy` | Legal | LIVE |

---

## 4. The two documents this resolves

Reading §3 against the three master docs, every prior contradiction is now mechanically answerable:

1. **Web subscriptions (the §7-vs-§1 mess):** §3.1 says subscriptions are mobile/RevenueCat, never web. Therefore PRODUCT_MAP §7's "create web Stripe Premium price IDs" task is **off-strategy and struck**, and `/api/create-subscription` is **retired**, not wired. Resolved.
2. **Calendar (three stories):** §3.1 says calendar is mobile IAP only, never web. Web standalone calendar **deleted**. Web order-bump **parked as post-launch** (STRATEGY §11). Resolved.
3. **Daily archetype:** §3.2 says daily archetype is Premium/mobile only; web `/daily` carries free zodiac only. The archetype tab on web `/daily` is **removed**. Resolved.
4. **Web compatibility:** §5 below — the one decision.

---

## 5. The single open decision — web Single Compatibility ($4.99)

This is the only genuinely-open question in the entire boundary, and it is the source of the STRATEGY §6-vs-§5/§9 ambiguity. The $4.99 web compatibility reading is live and taking money today, but STRATEGY's acquisition architecture (§5/§10) names only Founding (pre-launch) and subscription (post-launch) as web conversion events — leaving this product strategically unplaced.

Three coherent positions:

- **(A) Retire it.** Web sells *only* the $20 Founding deposit pre-launch. Cleanest message (every web action drives Founding per §9), but the compatibility funnel — your one live TikTok funnel — loses its conversion event until the app ships.
- **(B) Keep it standalone.** Web sells Founding + $4.99 compatibility as independent products. Preserves funnel revenue, but a $4.99 side-sale competes with the $20 Founding ask for the same warm visitor, fragmenting the pre-launch message.
- **(C) Keep it, but route its upsell into Founding.** ⭐ **RECOMMENDED.** Web keeps $4.99 compatibility as the compatibility funnel's paywall, but the post-purchase upsell routes hard into Founding ($20). The tripwire *feeds* the capital mechanism instead of competing with it. This preserves funnel revenue, keeps funnel logic intact, and satisfies STRATEGY §9 (the action ultimately drives Founding). PRODUCT_MAP §4.2 already gestures at this ("Founding Member link replaces the Premium upsell slot").

**Pre-filled position: (C).** Ratify or override. Whichever is chosen, STRATEGY §6 must be amended to name web compatibility's platform and role explicitly, so it stops floating.

---

## 6. Phase transition — what the boundary looks like at launch

The boundary is phase-dependent. This table makes the transition explicit so "post-launch" work is never improvised either.

| Element | Pre-launch (now) | At/after App Store launch |
|---|---|---|
| Web primary CTA | Founding $20 | Download app (App Store badge) — Founding remains until it closes "at scale" (STRATEGY §4) |
| Founding deposit | LIVE on web | Closes at scale; web funnels redirect to subscription paywall |
| Subscriptions | Not sold anywhere live | LIVE on mobile (RevenueCat) |
| Calendar / Counsel packs | Not sold | LIVE on mobile (IAP) |
| Web compatibility $4.99 | Per §5 decision | Continues on web as tripwire OR retires in favor of mobile IAP — **decide at launch, track in STRATEGY §11** |
| Web role | Acquisition funnel + capital | Eventually → informational marketing site (STRATEGY §2 Phase 2) |

**Transition-window nuance:** there is a period where the **app is live AND Founding is still open** (Founding closes at scale, not at first availability). During that window web carries *both* a download CTA and a still-primary Founding CTA. The store badge is additive; it does not replace Founding until Founding formally closes.

---

## 7. How the other documents change once this locks

1. **STRATEGY.md** — add a one-line pointer in §2: "Per-SKU platform placement is defined in PLATFORM_BOUNDARY.md." Amend §6 to name web compatibility's platform/role per §5 decision. Add the founding-close + web-compatibility-at-launch items to §11 open questions.
2. **PRODUCT_MAP.md** — rewritten to instantiate this manifest: strike §7 web Premium price-ID task; remove the stale "Counsel 30/day" correction box in §5 (code is already 30/month); align §4.2 web compatibility to the §5 decision; confirm §6.1 calendar as mobile-only.
3. **PAGES_AND_SECTIONS.md** — correct §1 inventory (remove deleted `/subscribe`, `/subscription` rows); update §2 (Section 7 testimonials already removed in code).

These are **factual corrections to match this manifest plus verified code**, not new decisions — once §5 is ratified.

---

## 8. What this manifest deliberately does not touch

- Pricing, the no-trial lock, the Founding mechanism, Counsel-mobile-only — all unchanged.
- Mobile's product list (§3.1/§3.2 mobile column) — already clean in PRODUCT_MAP §1–3; this manifest confirms, does not alter it.
- The confusion was always on the **web side of the line**. This document draws the line; it does not move any mobile decision.

---

*This is a proposed manifest. On approval it becomes the supreme per-SKU/surface platform reference, and §7 lists the exact downstream document corrections. It does not change without an explicit decision.*
