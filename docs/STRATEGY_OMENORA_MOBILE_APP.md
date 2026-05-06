# OMENORA Mobile App — Monetization Strategy (Locked v2)

**Status:** LOCKED
**Date locked:** May 6, 2026
**Owner:** Miki Jokovic, UNC Development LLC
**Supersedes:** v1 (May 6, 2026 morning) and v3 sprint doc (May 5, 2026)

---

## 1. The Locked Model

| Element | Decision | Reasoning Anchor |
|---|---|---|
| **Monthly subscription** | **$14.99 / month** | Matches Co-Star ($14.99) and The Pattern ($14.99), the #2 and #4 highest-grossing Western astrology apps. Above CHANI (#1, $11.99) by $3 — defensive premium positioning. $9.99 reads as budget in a category where users associate price with quality. |
| **Annual subscription** | **$99.99 / year** | 44% effective discount vs monthly ($179.88 retail). More aggressive than CHANI's 25% off. Under the $100 psychological anchor. Drives annual selection at first checkout, where 30-50% of new subs typically choose annual. |
| **Trial** | **NONE — hard paywall** | RevenueCat 2026 data: hard paywall has 5x trial-to-paid conversion (10.7% vs 2.1%) and 8x revenue per install ($3.09 vs $0.38) at day 60 vs freemium with trial, with statistically identical year-1 retention (27% vs 28%). Social & Lifestyle is the only App Store category where no-trial is the dominant strategy (43.6% of apps). 84% of 3-day trial cancellations happen day 0-1 — short trials in 2026 are auto-cancelled by users out of habit before they even engage with the product. |
| **Free tier** | Sun-sign daily horoscope; big-three reveal (sun/moon/rising); archetype name only (no full reading); basic compatibility (sun-sign-only) | Mirrors the free tier of every top-grossing competitor. Drives install volume from TikTok ads. Does not cannibalize premium because the actual depth (full archetype reading, full natal chart, deep compatibility, Counsel) sits behind the paywall. |
| **One-time IAP** | 2026 Lucky Timing Calendar — $4.99 one-time purchase | Time-bound content (2026-specific, expires Dec 31, 2026). Doesn't fit subscription model. Industry trend: 39.4% of Social & Lifestyle apps now mix subscription + consumables. Single SKU only — no fragmentation of core readings. |
| **Counsel (AI chat) positioning** | Included in subscription, NOT headlined as differentiator | No data shows AI chat drives subscription revenue at scale in this category. Co-Star's "The Void" exists but isn't their primary value prop. AstroTalk's $145M is human astrologers, not AI. Lead marketing with personalized readings (proven value); list Counsel as a sub-feature ("+ unlimited AI guidance"). |
| **Web pricing** | Unchanged | Existing $6.99/mo Daily Horoscope subscriber and $4.99/$9.99/$24.99 one-time web buyers continue uninterrupted via Stripe. Mobile is the new growth surface; web is preserved revenue. |

---

## 2. Why This Model — The Reasoning Chain

This section documents the logic so any decision can be defended or challenged later with the same data we used.

### 2.1 Why $14.99 monthly, not $9.99 or $11.99

**Top-revenue Western astrology apps cluster at $11.99-14.99/mo:**

| App | Rank | Monthly | Annual | Annual Discount |
|---|---|---|---|---|
| CHANI | #1 | $11.99 | $107.99 | 25% off |
| Co-Star | #2 | $14.99 | $179.88 | n/a (annual is full price) |
| Nebula | #3 | $24.99 | $29.99/3-month | (different model) |
| The Pattern | #4 | $14.99 | varies | varies |

Industry data:
- Adapty 2026: Lifestyle apps lean into premium monthly plans, averaging $18
- RevenueCat 2026: Higher-priced subscriptions have higher trial conversion rates than mid- and lower-priced
- US monthly subscription median across all categories: $15.20

Pricing at $9.99 would put OMENORA below every top-revenue Western competitor. In a category where users associate price with quality and accuracy, this signals budget tier.

**Why not $11.99 to match CHANI:** CHANI has years of audience-building (hundreds of thousands of newsletter subscribers, books, established astrologer brand) before the app launched. They can price at floor and still command attention. New entrants without brand recognition need to price slightly above floor to signal seriousness, not at floor.

**Why not $14.99 with an even higher annual:** $14.99/mo is the matching price. Going to $19.99 would put us above the top earners with no brand justification.

### 2.2 Why $99.99 annual (44% discount), not $107.99 or $119.99

- $99.99 sits under the $100 psychological anchor — proven to outperform $100+ pricing
- 44% discount vs monthly ($179.88 if billed monthly × 12) is more aggressive than CHANI's 25% but within industry norms (most apps run 30-50% annual discount)
- Drives annual selection at first checkout, which generates the highest LTV cohort
- Easy to test alternatives in v1.2 via RevenueCat Experiments ($107.99, $119.99)

### 2.3 Why hard paywall, not 3-day or 7-day trial

This is the highest-leverage decision in the whole monetization model. The data:

**RevenueCat 2026 State of Subscription Apps (115,000+ apps, $16B revenue):**
- Hard paywall median Day-35 trial-to-paid conversion: 10.7%
- Freemium with trial: 2.1%
- Hard paywall is 5x more efficient at converting installs to paid
- Hard paywall RPI at day 60: $3.09 vs $0.38 for freemium → 8x higher revenue per install
- Year-1 retention: 27% (hard paywall) vs 28% (freemium) — statistically identical

**Trial cancellation timing in 2026:**
- 3-day trial: 55% cancel almost immediately (day 0-1)
- 84% of all 3-day trial cancellations happen day 0-1
- 64% of all 7-day trial cancellations happen day 0-1
- Short trials in 2026 trigger auto-cancellation behavior in users who've been burned by subscription traps

**Social & Lifestyle category specifically:**
- 43.6% of apps use no-trial strategy — the highest of any App Store category
- The only category where no-trial exceeds mixed-trial strategy
- This is the category OMENORA falls into

**Translated to plain English:** if we ship a 3-day trial, more than half of trial users cancel within an hour of signing up out of habit, before they engage with the product. The 8x revenue per install advantage of hard paywall comes from filtering for users who have actual purchase intent at install time.

**Why this contradicts CHANI (#1) using 14-day trial:** CHANI has a queer/feminist brand and audience moat that converts trials at much higher rates than baseline. They can absorb the LTV penalty because their trials don't cancel like average trials. New entrants without that brand cushion get the average outcome (84% day-0-1 cancellation), not CHANI's outcome.

### 2.4 Why Counsel is a feature, not the headline

The v3 sprint doc positioned Counsel (AI chat) as THE differentiator based on AstroTalk's $145M revenue. Step 1 research disproved this:

- AstroTalk's revenue is from per-minute human astrologer consultations, not AI chat
- Co-Star has "The Void" (their AI Q&A) but it's a side feature, not their primary value prop
- No top-grossing Western astrology app leads with AI chat in their App Store listing or marketing
- Pattern's Connect+ tier is a dating marketplace, not an AI chat product

We don't have evidence that AI chat drives subscription revenue at scale in this category. Until we have post-launch usage data showing Counsel is a primary engagement driver, marketing should lead with personalized readings, transits, and forecasts (proven value) — and list Counsel as a sub-feature.

### 2.5 Why we allow one-time IAP for Calendar but not for other content

Adapty 2026 data: 39.4% of Social & Lifestyle apps mix subscriptions with consumables or lifetime purchases. The trend is toward mixed models, not subscription-only.

The 2026 Lucky Timing Calendar fits one-time because it's:
- Time-bound by definition (specific to 2026)
- A discrete content unit, not an ongoing service
- An impulse purchase ($4.99 entry point)

We do NOT split core readings (archetype, natal chart, compatibility) into separate one-time SKUs because:
- Fragmentation hurts subscription perceived value
- No top-grossing competitor does this (they're all subscription-led with at most one consumable)
- Web's existing $4.99/$9.99/$24.99 one-time SKUs are preserved on web only — not migrated to mobile

---

## 3. LTV Math (Honest Projections)

This is what the locked model is expected to produce. Numbers are estimates with documented assumptions; actual performance will differ.

**Inputs:**
- TikTok App Install CPI assumption: $4 (industry estimate for astrology category in NA — needs verification with actual campaign data)
- Lifestyle install-to-paid (direct purchase, no trial): 25% midpoint (Adapty 2026 reports 18-38% range)
- Annual mix at first checkout: 40% (industry norm for side-by-side monthly/annual paywalls)
- Monthly subscriber retention: 43% at day 90, 17% at year 1 (RevenueCat 2026 Lifestyle benchmarks) → ~4.5 month average lifetime
- Annual renewal at year 1: 60% (conservative; industry shows 60-85% range)
- Apple/Google commission: 15% via Small Business Program (under $1M annual revenue threshold)

**Per $4,000 ad spend (~1,000 installs):**

| Step | Number | Logic |
|---|---|---|
| Installs | 1,000 | $4 CPI × $4,000 spend |
| Convert to paid | 250 | 25% direct conversion (Lifestyle midpoint) |
| Annual buyers | 100 | 40% of paid buyers |
| Monthly buyers | 150 | 60% of paid buyers |
| Annual revenue (year 1) | $9,999 | 100 × $99.99 |
| Monthly revenue (year 1) | ~$8,769 | 150 × $14.99 × 4.5 months avg |
| **Year 1 gross revenue** | **~$18,768** | |
| Apple/Google 15% cut | -$2,815 | Small Business Program rate |
| **Year 1 net revenue** | **~$15,953** | |
| **Year 1 ROAS** | **~4.0x** | $15,953 / $4,000 |

**What kills these numbers:**
- Higher actual CPI (e.g., $6) → ROAS drops to 2.7x but still profitable
- Lower actual conversion (e.g., 18%) → ROAS drops to 2.9x
- Both worst-case → ROAS drops to ~2.0x — still positive, but margin gets thin

**What helps these numbers:**
- Lower CPI (organic traffic from TikTok content) → ROAS scales linearly
- Higher annual mix (50%+) → year 1 revenue jumps because annual is paid upfront
- Annual renewals at year 2 are pure margin

---

## 4. Confidence Levels

| Decision | Confidence | Why |
|---|---|---|
| Hard paywall, no trial | HIGH | RevenueCat 2026 + Adapty 2026 + Social & Lifestyle category data all align. 8x revenue per install gap is the strongest signal in the entire dataset. |
| $14.99 monthly | HIGH | Three of four top-revenue Western apps land $11.99-14.99. Co-Star and Pattern both at $14.99 specifically. |
| $99.99 annual at 44% discount | MEDIUM | CHANI uses 25% off. We're more aggressive. Could test $107.99 or $119.99 alternatives in v1.2. |
| Counsel as supporting feature, not headline | MEDIUM | No direct usage data to verify, but the AstroTalk-was-actually-humans logic is solid. Will revisit after launch with engagement data. |
| Free tier scope | MEDIUM | Mirrors industry standard but specific feature mix (big-three reveal vs. archetype name vs. daily horoscope) could be tuned. |
| 40% annual mix assumption | LOW | Industry norm is 30-50%. Actual could be 25% or 60% depending on paywall design and copy. Will know within 2 weeks of launch. |
| $4 TikTok CPI assumption | LOW | Industry estimate for astrology in NA. Could be $2 or $6 in practice. Will know within first ad campaign. |

---

## 5. A/B Test Plan for v1.2 (6-8 Weeks Post-Launch)

Once we have baseline data from the locked v1 model, the following tests challenge the assumptions:

### Test 1 — Trial vs. No Trial (highest priority)
- Control: Hard paywall (locked model)
- Variant A: 3-day free trial
- Variant B: 7-day free trial (for "Free Trial Available" ASO tag visibility)
- Metric: 30-day net revenue per install (NOT trial-start rate or initial conversion)
- Hypothesis: Hard paywall wins on net revenue; trial may win on App Store search visibility

### Test 2 — Annual Pricing
- Control: $99.99/yr (44% discount)
- Variant A: $107.99/yr (matching CHANI's 25% discount exactly)
- Variant B: $119.99/yr (33% discount)
- Metric: 30-day total revenue (annual mix × annual price + monthly mix × monthly LTV)
- Hypothesis: $99.99 wins on volume; need to verify it wins on revenue

### Test 3 — Free Tier Scope
- Control: Sun-sign daily + big-three reveal + archetype name
- Variant: Add full archetype reading to free tier (paywall everything else)
- Hypothesis: TBD — we don't have a strong prior; need data

### Test 4 — Counsel Positioning
- Control: Counsel listed as one of several premium features
- Variant: Counsel headlined as primary value prop in App Store screenshots and onboarding
- Hypothesis: TBD — depends on actual Counsel usage data from v1

---

## 6. What Got Rejected and Why

For posterity, these were considered and rejected. Documented so they don't get re-proposed without new data.

| Rejected Idea | Why |
|---|---|
| Multi-tier subscription (Free, Plus, Premium) | No top-grossing astrology app uses this. Pattern has two subs but they're structurally different categories (content + dating marketplace), which we don't have. |
| $4.99 or $6.99 monthly | Below every top-revenue competitor. Signals budget tier in a quality-sensitive category. RevenueCat 2026 data: higher prices have higher conversion in this category. |
| Splitting Daily Horoscope into separate $6.99/mo subscription on mobile | Web has it as separate sub for legacy reasons. On mobile, fragmenting the subscription creates decision fatigue and reduces perceived value of the main subscription. |
| Birth Chart, Calendar, Compatibility as one-time SKUs | Web does this. On mobile, this fragments core value behind a subscription that's supposed to be all-inclusive. Only Calendar (time-bound) stays as one-time IAP. |
| 7-day free trial (v3 doc default) | RevenueCat 2026 data: 64% of 7-day trial cancellations happen day 0-1. 5x worse trial-to-paid conversion than hard paywall. 8x worse revenue per install. |
| Counsel as headline differentiator | No data showing AI chat drives subscription revenue at scale. AstroTalk's success is human astrologers, not AI. Reposition as supporting feature until v1 data proves otherwise. |
| Per-minute or pay-per-message Counsel | Only AstroTalk does this and they have human astrologers. AI per-minute pricing has no precedent in this category. |
| Lifetime purchase option | No top astrology app offers this. Caps LTV at the lifetime price. Hurts ongoing engagement. |

---

## 7. Web App — No Changes

Web pricing and structure stay exactly as-is to preserve existing revenue:

| SKU | Price | Type | Notes |
|---|---|---|---|
| Basic Report | $4.99 | One-time | Existing buyer cohort — preserve |
| Popular Bundle (Report + Calendar) | $9.99 | One-time | Existing buyer cohort — preserve |
| Oracle Bundle (everything) | $24.99 | One-time | Existing buyer cohort — preserve |
| Compatibility Single | $9.99 | One-time | Existing |
| Compatibility + Charts | $14.99 | One-time | Existing |
| Calendar (upsell) | $4.99 | One-time | Existing |
| Birth Chart (upsell) | $4.99 | One-time | Existing |
| Tradition Switch | $2.99 ea | One-time | Existing |
| Daily Horoscope subscription | $6.99/month | Recurring (Stripe) | Existing 1-2 subscribers — preserve |

**Mobile and web prices intentionally differ.** This is allowed under both Apple and Google guidelines as long as we don't link from inside the app to web checkout for the same content. Web flows continue via Stripe. Mobile flows go through Apple/Google IAP via RevenueCat.

---

## 8. Decision Log

| Date | Decision | By |
|---|---|---|
| May 5, 2026 | v3 sprint doc proposed $9.99/mo + 7-day trial | Previous session |
| May 6, 2026 (morning) | v1 locked: $12.99/mo + 3-day trial proposed | This session, Step 3 |
| May 6, 2026 (afternoon) | v2 locked: $14.99/mo + no trial after additional 2026 trial data research | This session, this document |

**This v2 supersedes all prior versions.** Any monetization decisions must reference this document or formally update it.

---

## 9. Next Phase — Mechanisms (Step 4)

With monetization locked, the next phase is HOW it works. Not WHAT it costs, but the mechanisms that deliver it.

Pending mechanism decisions (Step 4):
- Paywall placement (which screens trigger paywall, when in user journey)
- Onboarding flow (3 required + 4 optional progressive disclosure)
- RevenueCat product configuration in App Store Connect + Google Play Console
- Rip out existing Stripe-in-Safari mobile flow (Apple guideline 3.1.1 violation — will be rejected)
- Compliance flows (Counsel disclosures, crisis resources, "for entertainment" disclaimers)
- App Store Connect listing assets (screenshots, metadata, preview video)
- Apple Small Business Program enrollment (15% commission vs 30%)
- Google Play Console verification (2-7 days for ID verification — start in parallel)

These do NOT change any of the pricing or trial decisions in this document. They define how the locked decisions get implemented.

---

## 10. Sources

Primary data sources used in this strategy:

1. RevenueCat State of Subscription Apps 2026 (115,000+ apps, $16B revenue analyzed)
   - https://www.revenuecat.com/state-of-subscription-apps/
2. Adapty State of in-app subscriptions 2026 (16,000+ apps, $3B revenue)
   - https://adapty.io/blog/lifestyle-app-subscription-benchmarks/
3. Business of Apps Subscription Trial Benchmarks 2026
   - https://www.businessofapps.com/data/app-subscription-trial-benchmarks/
4. Subscription Insider analysis of RevenueCat 2026 data
   - https://www.subscriptioninsider.com/article-type/news/revenuecat-data-shows-subscription-app-growth-concentrating-at-the-top
5. RevenueCat blog — trial length analysis
   - https://www.revenuecat.com/blog/growth/7-day-trial-subscription-app/
6. Top competitor App Store / Google Play listings (CHANI, Co-Star, Nebula, The Pattern)
7. Direct competitor pricing pages (CHANI, Co-Star astrology)

---

**End of locked strategy v2.**