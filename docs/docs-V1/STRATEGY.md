# OMENORA — Master Strategy

> Single source of truth for strategic direction.
> All product, design, and engineering decisions trace back to this document.
> When this document and any other document conflict, this document wins.

---

## 1. What OMENORA is

OMENORA is a multi-tradition AI astrology platform.

It produces personalized natal-chart-based readings calculated from real planetary positions (Swiss Ephemeris), interpreted across four interpretive traditions (Western, Vedic, BaZi, Tarot), and delivered through a mobile-first product surface.

It is not a horoscope app. Horoscopes are written for one-in-twelve people who share a sun sign. OMENORA computes each reading from the exact birth chart of the individual user.

---

## 2. The product

### OMENORA is a mobile-first product.

The mobile app is the product. Subscription, premium features, retention, lifetime value, Counsel chat, daily personalized content, and all four product surfaces (Today / Readings / Counsel / Tradition switching) live inside the mobile app.

### The web exists to acquire users into the mobile app.

The web is the top-of-funnel acquisition mechanism. It does not exist to monetize standalone. Web pages either drive users into the mobile subscription, or they support brand and trust.

### Web and mobile are parallel workstreams, not sequential.

Both must complete before paid acquisition scales. Web cleanup does not precede mobile launch; they ship together. Mobile is the destination, web is the path — and both paths must be built.

### Platform placement — per-SKU manifest

This document states the *principle* of the web/mobile boundary. The *manifest* — which specific products and surfaces live on which platform, pre-launch and post-launch — lives in `PLATFORM_BOUNDARY.md`. When this document and `PLATFORM_BOUNDARY.md` conflict on where a product or surface lives, `PLATFORM_BOUNDARY.md` wins.

### Web has two phases.

**Phase 1 — Acquisition mechanism.**
Web runs quiz funnels under multiple curiosity hooks. Each funnel drives the same paywall conversion event. Paid traffic from TikTok and Meta lands on these funnels. After conversion, users install and activate the mobile app.

**Phase 2 — Informational marketing site.**
Once the mobile app has reached operational maturity and App Store acquisition becomes the dominant conversion surface, web is redesigned into a pure informational marketing site. SEO content, brand presence, trust signals, support documentation. The web no longer hosts conversion funnels; it directs visitors to download the app. App Store and Google Play download buttons become primary CTAs on the homepage.

---

## 3. Who OMENORA serves

Primary demographic: women aged 25–45, spiritually-curious, smartphone-native, comfortable with subscription apps in self-knowledge and wellness categories. Familiar reference points: Co-Star, Sanctuary, CHANI, Pattern, Calm, BetterMe.

Psychological frame: identity-based curiosity, pattern recognition about self and relationships, decision support during major life transitions, intelligent self-knowledge tooling without the woo-woo register.

---

## 4. The Founding Members mechanism

Founding Members is the starting mechanism that makes the entire strategy executable.

### Why Founding Members exists

The mobile app — where OMENORA monetizes through subscription — requires capital and time to launch at production quality. Before the App Store launch, OMENORA needs three things simultaneously: operational runway, validation that users will pay, and a traction signal for fundraising conversations with angels and accelerators.

Founding Members solves all three at once. A $20 deposit at `/founding`:

- Generates pre-launch capital to fund the mobile app build and the paid acquisition that launches it
- Validates willingness-to-pay at a non-trivial price point (a $20 deposit on the promise of a future product is a stronger signal than 10,000 free email signups)
- Produces the traction data point that angel investors and accelerators require ("real customer growth, retention, revenue")
- Converts directly into Day-1 paid subscribers when Premium launches: Founding Members lock in 50% off Premium for life, converting from $20 deposit to recurring subscription at launch

### How Founding Members fits the funnel architecture

In Phase 1 (current), all acquisition funnels can drive to either Founding Member deposit or future Premium subscription paywall depending on launch state:

- Before mobile app launch: funnels drive to `/founding` deposit ($20 one-time)
- At and after mobile app launch: funnels drive to subscription paywall — hard paywall, no trial ($5.99/week, $14.99/month, or $99.99/year)

Founding Members is therefore not a parallel side-channel. It is the active acquisition target during the pre-launch phase and the conversion seed for subscription at launch.

### When Founding Members closes

The Founding Members offer is time-bounded. It closes when Premium launches to the App Store at scale. After close, the same web funnels redirect to standard subscription paywalls.

---

## 5. Acquisition model — the Nebula playbook

OMENORA follows the Nebula (OBRIO/Genesis) web-to-app acquisition playbook.

### Architecture

1. Paid traffic (TikTok primary, Meta secondary) lands on a web quiz funnel.
2. The funnel is built around a curiosity hook (archetype, compatibility/love path, additional hooks as added).
3. The quiz collects birth data and identity signals across approximately 25 questions in psychological phases.
4. A result preview is shown blurred, gating reveal behind a paywall.
5. The paywall presents the current conversion offer:
   - During Founding Members phase: $20 founding deposit
   - After Founding Members closes: hard-paywall subscription ($5.99/week, $14.99/month, or $99.99/year — no trial)
6. One-time IAPs (single compatibility, calendar) are layered as immediate post-paywall upsells.
7. After payment, the user is directed into the mobile app for activation.

### Multiple parallel funnels under different hooks

The acquisition system runs multiple quiz funnels in parallel, each tuned to a distinct curiosity vector. All funnels drive to the same paywall conversion event.

Active and planned funnels:

- **Archetype funnel (`/discover`)** — identity hook. 25-question Nebula-pattern sequence with blurred archetype result reveal. Planned.
- **Compatibility / Love Path funnel (`/compatibility-quiz`)** — relationship hook. Same product positioned through the compatibility lens. Live.

Each funnel has its own ad creative, landing page hook, and quiz sequence. New funnels may be added under additional hooks as needed; they are not core to the strategy until validated.

### Trust-building free surface

The free daily horoscope page (`/daily`) exists as a free, unpaywalled trust-builder. It is not a funnel — it is brand presence and SEO. It serves users who arrive through organic search and provides recurring value that builds long-term trust without cannibalizing subscription revenue. The daily horoscope page does not collect email or run paywalls.

---

## 6. Monetization model

OMENORA monetizes through four mechanisms across the product lifecycle:

### Founding Member deposit (pre-launch capital)

$20 one-time founding deposit at `/founding`. Active during pre-launch phase. Founding Members lock in 50% off Premium subscription for life — applicable to any plan: Weekly at $2.99/wk (vs $5.99), Monthly at $7.50/mo (vs $14.99), or Annual at $49.99/yr (vs $99.99). Founder picks their plan at launch and may switch between plans while founding status persists. Closes at App Store launch at scale.

### Subscription (primary post-launch revenue)

Three subscription products, all hard-paywall, no free trial:

- `omenora_weekly` — $5.99 / week
- `omenora_monthly` — $14.99 / month
- `omenora_annual` — $99.99 / year

The subscription includes the full product: all reading types, multi-tradition switching, unlimited daily content, capped Counsel chat conversations, and unlimited core access.

**Why no trial:** Adapty State of In-App Subscriptions 2026 shows trial users in Lifestyle apps generate 21.2% lower LTV than direct buyers — the only category in the report where this pattern appears. 43.6% of Social & Lifestyle apps run no-trial (largest no-trial category share). Hard paywalls produce 21% higher LTV than soft paywalls; the selection effect runs stronger in Lifestyle.

**Why weekly entry tier:** Weekly plans generate 55.5% of all 2026 app revenue (Adapty SOIS 2026, up from 43.3% in 2023). Weekly outperforms monthly at every price tier, converting 1.7–7.4x better than annual across all tiers (Adapty SOIS 2026). The market leader (Nebula) uses weekly as primary entry. Current weekly price is $5.99; the 2025 global weekly median is $7.48 — weekly price is an open question (see §11).

### One-Time Purchases (tripwire and upsell revenue)

Two one-time products:

- Single Compatibility Reading — $4.99. Sold on **web** as the compatibility funnel's paywall (LIVE today) AND as a **mobile IAP** at launch (free users only on mobile; Premium includes 10/mo). On web, the post-purchase upsell routes into Founding ($20) — the tripwire feeds Founding, it does not compete with it.
- Annual Lucky Timing Calendar — $4.99. **Mobile IAP only.** Web does not sell calendar standalone. A web-side post-purchase order-bump on the compatibility checkout is parked as a post-launch consideration (see §11).

One-time products serve as immediate post-paywall upsells (the Layer 3 of the Nebula model) and as accessible entry points for users not ready for subscription commitment.

Per-platform placement of these and all other SKUs is authoritative in `PLATFORM_BOUNDARY.md`.

### Counsel Boost Packs (credit-based expansion revenue)

Three credit packs for the Counsel AI chat product, available to both Free and Premium users:

- Spark — $1.99 for 5 conversations
- Insight — $4.99 for 15 conversations
- Ascend — $9.99 for 35 conversations

Credits do not expire. Premium users' monthly base allowance burns first, boost credits second.

---

## 7. The product surfaces

OMENORA delivers four core product surfaces, all available inside the Premium subscription:

### Today

Daily personalized horoscope (zodiac-based) and daily archetype insight. Recurring engagement layer.

### Readings

On-demand generation of full reading types: Archetype, Natal Chart, 90-Day Forecast, Compatibility. Each capped per month inside Premium scope to protect unit economics.

### Counsel

AI chat conversations grounded in the user's natal chart and prior reading history. Capped at 30 conversations per month in Premium scope; expandable via Boost Pack credits.

**Counsel is hosted only in the mobile app for v1.** Web pages MAY name Counsel as a Founding Member benefit and as a named feature of the OMENORA mobile app — this is correct app-landing-page marketing per 2026 conversion research (specificity beats vagueness; specific feature names convert 23% better than generic "premium experience" copy). Web pages MUST NOT host Counsel chat UI and MUST NOT imply Counsel access is available via web subscription. See Section 11 open question on cross-platform Counsel for post-launch.

### Tradition switching

Free movement between four interpretive traditions (Western, Vedic, BaZi, Tarot) on any reading. Unlimited inside Premium.

---

## 8. What OMENORA is not selling

The following have been explicitly eliminated from the product roadmap. They exist as features inside the subscription scope, not as standalone purchases:

- Standalone Birth Chart product
- Standalone Destiny Report
- Bundle products (multi-product one-time SKUs)
- Tradition switching as a separate IAP
- Per-tradition one-time reports (BaZi report standalone, Vedic report standalone, etc.)
- Multi-tier subscription (Standard / Premium / Premium+ — single tier model only)
- Daily archetype on the free `/daily` page (Premium feature only)
- Counsel chat UI hosted on web (chat widget, message input, conversation interface) — Counsel is mobile-only in v1. Web markets Counsel as a mobile feature (permitted and conversion-positive per 2026 specificity research) but does not host the chat experience itself. Strategic reasoning: Counsel is the retention/value anchor for Premium subscription; gating the actual usage behind mobile install drives users where OMENORA monetizes. Web checkout → mobile download → mobile Counsel access is the entire architecture. Cross-platform Counsel for v1.1/v1.2 is tracked as an open question in Section 11.

---

## 9. Strategic principles

### Founding Members is the bridge.

Without Founding Members capital and traction, the mobile launch does not happen. Every product, design, and engineering decision during the pre-launch phase prioritizes the Founding Members conversion. The mobile launch is the destination; Founding Members is the path.

### The mobile app is the product.

Every web page, every funnel, every ad campaign exists to acquire users into the mobile app. The web is not the product. The web is a billboard with a payment widget.

### Subscription is the primary post-launch revenue mechanism.

One-time purchases exist to layer on subscription, not to substitute for it. Boost packs exist to expand subscription value, not to fragment it. The center of gravity of all post-launch monetization decisions is subscription LTV.

### Multiple parallel funnels, single backend product.

Acquisition diversifies by hook. Product does not fragment by hook. All funnels drive the same paywall, the same subscription, the same mobile app.

### Hard-paywall direct purchase (post-launch).

Subscription products run hard paywall with no free trial. This is the data-backed configuration for Lifestyle category: trial users in Lifestyle apps generate 21.2% lower LTV than direct buyers (Adapty SOIS 2026). Direct buyers are pre-committed and retain better. CAC and LTV are calculated against direct download-to-paid conversion rate.

### Trust before paywall.

Free `/daily` page builds brand trust without cannibalizing revenue. Educational content, SEO presence, and unpaywalled value coexist with aggressive paid acquisition funnels.

### Margin protection above feature generosity.

Backend caps on every premium feature (1/mo archetype, 1/mo natal, 4/mo forecast, 10/mo compatibility, 30/mo Counsel) exist to protect unit economics against power-user abuse. The product feels generous to typical users while remaining margin-positive against worst-case usage.

---

## 10. The strategic architecture

The acquisition flow, paywall conversion event, and product surfaces map as follows.

**Acquisition layer (web).**
Paid traffic from TikTok and Meta lands on parallel quiz funnels:

- `/discover` — archetype / identity hook
- `/compatibility-quiz` — compatibility / love-path hook
- Additional curiosity-hook funnels as added

All funnels converge on a single paywall conversion event.

**Paywall conversion event (web).**
The conversion offer is determined by lifecycle phase:

- **Pre-launch phase:** $20 Founding Member deposit at `/founding`. Locks in 50% off Premium for life. Seeds the Day-1 subscriber base for App Store launch.
- **Post-launch phase:** Hard-paywall subscription — $5.99/week, $14.99/month, or $99.99/year, no trial on any plan. Immediate post-paywall IAP upsell offers $4.99 single compatibility reading or $4.99 annual calendar.

**Activation layer (mobile).**
After payment, the user installs and activates the mobile app. Inside the app, the four product surfaces deliver value:

- Today (daily horoscope + archetype)
- Readings (Archetype, Natal Chart, 90-Day Forecast, Compatibility)
- Counsel (AI chat, capped per month)
- Tradition switching (Western / Vedic / BaZi / Tarot)

**Expansion layer (mobile).**
Counsel Boost Packs ($1.99 / $4.99 / $9.99) extend monthly conversation caps via perpetual credits.

**Parallel free surface (no funnel).**
`/daily` — free daily zodiac horoscope. Brand trust and SEO presence. Does not paywall, does not capture email, does not cannibalize subscription revenue.

---

## 11. Open strategic questions

These are tracked here so they cannot be re-litigated in tactical conversations:

- Felt-personalization vs actual-personalization: does the 25-question quiz data flow into the generation prompt, or is some portion of it psychological theater?
- Mobile App Store launch timing and the corresponding Phase 2 web informational redesign trigger criteria.
- Founding Members close criteria: target deposit count, target deposit revenue, or App Store launch date.
- **Web compatibility at launch.** The $4.99 web compatibility tripwire (per §6) overlaps the mobile compatibility IAP at launch. Decide at launch whether to continue running web compatibility as a tripwire (web-side acquisition revenue) or retire it in favor of routing compatibility-quiz traffic into the mobile IAP. Trigger to revisit: at App Store launch, when funnel attribution data shows web→mobile conversion rate.
- **Web compatibility order-bump (calendar).** A one-click calendar add-on at the $4.99 compatibility checkout was set up at Stripe/Railway level on 2026-05-04 but code wiring was never completed. Deliberately deferred — adding net-new code to the compatibility payment path during pre-launch fragments attention from Founding (§9 principle). Trigger to revisit: post-launch, once mobile is shipping and compat $4.99 is no longer the dominant near-term revenue lever.
- **Cross-platform Counsel (post-launch decision).** Market leader Nebula offers Counsel chat on both web and mobile and explicitly markets cross-platform chat as a feature. 2026 data shows AI features benefit from a "60-second aha moment" effect that triples willingness-to-pay when users experience AI value before committing; cross-device sync is a key retention driver. v1 locks Counsel as mobile-only. Decision to add limited web Counsel (try-before-download conversion accelerator) deferred until after mobile launches and we have baseline LTV/CAC data. Trigger to revisit: when mobile MAU stabilizes and unit economics are measured, evaluate web Counsel against mobile-only retention metrics.

- **One-time purchase weighting (post-launch).** Adapty SOIS 2026: one-time purchases now account for 26.3% of Lifestyle category revenue, up from 5.9% in 2023 — Lifestyle users increasingly buy specific items rather than subscribe. STRATEGY §9 currently frames one-time products (compatibility $4.99, calendar $4.99, Counsel packs) as upsell layers on subscription, not as a primary line. Subscription-primary remains correct (top 10% of Lifestyle apps capture 97.9% of category revenue; subscription LTV is still the center of gravity), but one-time revenue should be tracked as a real pillar, not a footnote. Trigger to revisit: at launch, with funnel attribution showing one-time vs subscription mix.

- **Weekly subscription price (pre-Stripe-creation decision).** Current weekly is $5.99. The 2025 global weekly median is $7.48 (Adapty SOIS 2026) and market leader Nebula charges $7.99/wk. The data shows headroom: higher-tier weekly plans generate 5.2x more revenue per install than lower-tier ones, and higher price does not depress conversion. Since weekly is the volume/LTV driver, raising it (~$6.99–$7.99) is the highest-leverage pricing move available. Annual ($99.99) runs above market (Nebula $49.99) but is defensible as a deliberate anchor. Decision deferred but MUST be made before Stripe Premium price objects and RevenueCat products are created (currently uncreated), to avoid rework. Trigger to revisit: immediately before RevenueCat/Stripe Premium product configuration.

- **No-trial divergence from market leader (recorded, not open).** Nebula (the benchmark leader) uses a 3-day free trial; OMENORA does not. The no-trial call is data-backed for pure-Lifestyle (the 21.2% finding below); Nebula is a hybrid psychic-reading/token model whose trial economics differ, so the pure-Lifestyle finding applies more cleanly to OMENORA. This divergence is deliberate and eyes-open — recorded here so it is not re-litigated as an oversight (it already flip-flopped v2→v3→v4).

### Decision history — trial policy

The trial decision has been re-locked based on 2026 data:

- v2 monetization spec (May 6, 2026): locked NO trial. Reasoning: RevenueCat 2026 data showed trial economics underperformed direct purchase in this category.
- v3 (May 14, 2026): 7-day trial added without documented reasoning.
- v4 final lock (May 26, 2026): re-locked NO trial. Reasoning: Adapty State of In-App Subscriptions 2026 confirms Lifestyle trial users generate 21.2% lower LTV than direct buyers — the only category in the report where trials reduce LTV; 43.6% of Social & Lifestyle apps run no-trial.

---

*This document is the master strategy. It does not change without an explicit strategic decision.*
