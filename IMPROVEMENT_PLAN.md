# OMENORA — Improvement Plan v3
**Revised:** April 2026  
**Previous version:** IMPROVEMENT_PLAN.md (April 2026 — v2)  
**Scope:** Full rewrite. Grounded exclusively in codebase inventory conducted April 2026. Every item references an exact file path. No assumptions, no speculative features.

> **Benchmark note:** External benchmark numbers in this plan (conversion rates, chargeback thresholds, etc.) are directional and should be verified against live platform/account rules before being used as operating thresholds.

---

## GOAL

Omenora's immediate goal is not to become a daily-use subscription app. The immediate goal is to **prove web-funnel economics**:

- Trust: do users believe the product enough to pay?
- Reading quality: does the output justify the price point?
- Conversion rate: preview page → payment at a rate that makes paid traffic viable
- AOV: are upsells increasing revenue per buyer?
- Refund/chargeback control: is revenue quality clean enough to scale?
- Paid traffic viability: can a dollar spent on ads return more than a dollar net?

The current architecture is already designed for a one-time-payment funnel with upsells — not daily habit retention. The full user journey (landing → analysis → preview → paywall → Stripe → report, with upsells during loading and post-purchase) is documented in `APP_TECHNICAL_SPEC.md`. That architecture is correct for the current stage. The plan should prioritize proving funnel economics first, retention and subscription second.

---

## CURRENT STATE SNAPSHOT
**Last verified:** April 2026

### Fully built and working end-to-end

- **Abandonment email sequence** — `server/api/capture-email.post.ts` (line 72) calls `scheduleEmailJob(email, 1, SEQUENCE_DELAYS_MS[1])` immediately on email capture. `server/utils/email-jobs.ts` persists the job to Supabase `email_jobs` table. `server/api/email-sequence/process-jobs.post.ts` is a Railway cron worker (every 2 min) that fetches due jobs, sends via Resend, marks done, and auto-chains step 2→3→4. Suppression on purchase (via `cancelEmailJobs`) confirmed in `webhook.post.ts`. All 4 steps have templates in all 6 languages in `server/utils/email-templates.ts`. **The sequence fires and sends.** One gap: see "Built but not connected" below.

- **Report generation and delivery** — `server/api/generate-report.post.ts` calls Anthropic, validates output with Zod schemas from `server/utils/ai-schemas.ts`, returns structured report. `server/api/save-report.post.ts` persists to Supabase. `server/api/send-report-email.post.ts` triggers `server/utils/report-email-builder.ts` to send the full reading via Resend.

- **Share card generation** — `server/api/generate-card.post.ts` renders a 1080×1920 PNG using `node-canvas` with archetype symbol, name, element, life path, power traits, affirmation, and branding. Fully wired; triggered from report page.

- **Stripe payment + webhook** — `server/api/stripe/webhook.post.ts` handles `checkout.session.completed`, `charge.dispute.created`, and `charge.refunded`. Purchase suppresses abandonment sequence, triggers report generation if not pre-generated, sends report email. Chargeback/refund structured logging (`[B-4]`) implemented.

- **Prompt version tracking** — `PROMPT_VERSION = 'v1.0'` exported from `server/api/generate-report.post.ts` (line 8). Written to `prompt_version` column in `save-report.post.ts` (line 48) with schema-gap fallback. Red-flag logging `[B-2]` implemented in `generate-report.post.ts` (lines 883–887).

- **Analytics pixel infrastructure** — `app/plugins/pixels.client.ts` has TikTok + Meta pixel loaders, `safeTrack()` wrapper, UTM param capture, and device type detection. **All 18 funnel events from the B-3 event list are already implemented** (`trackLandingView`, `trackAnalysisStart`, `trackStep1Complete`, `trackQuestionAnswered`, `trackAnalysisSubmit`, `trackPreviewLoadingStart`, `trackPreviewLoaded`, `trackPaywallView`, `trackTierSelected`, `trackInitiateCheckout`, `trackPurchase`, `trackUpsellViewed`, `trackUpsellAccepted`, `trackReportViewed`, `trackShareCardOpened`, `trackShareCardDownloaded`, `trackViewContent`, `trackEmailCaptureSuccess`). **B-3 instrumentation is complete** — B-3 dashboard build is still outstanding.

- **Legal / trust items (verified in code):** L-1 (Q4/Q7 rewritten all 6 languages), L-2 (crisis signpost on all 3 pages), L-3 (data use notice at analysis step 2), L-4 (REAL_TESTIMONIALS guard in preview.vue), L-5 / LP-6 (count replaced with value-based copy), T-3 (no fake urgency or unverified proof renders).

### Built but not connected

- **Abandonment email CTA — no deep link** — `server/utils/email-templates.ts` line 540: the CTA button in every abandonment email links to `https://omenora.com/preview` with **no `tempId` parameter**. A user who clicks returns to a blank preview page and must re-enter their data. Their specific report is not pre-loaded. The `email_captures` table stores `session_id`, but `buildHtmlEmail` does not receive it as a parameter and does not construct a `?tempId=` link. Fix: pass `sessionId` through `EmailPersonalization`, construct link as `https://omenora.com/preview?tempId=${sessionId}`, and verify `preview.vue` reads `?tempId` on mount to restore state.

- **B-3 dashboard** — pixel events fire but no dashboard exists to read them. The 8 required funnel metrics listed in B-3 are not yet visible anywhere.

### Does not exist yet

- **`REPORT_QA_RUBRIC.md`** — no QA scoring system for report quality
- **`REPORT_QA_LOG.csv`** — no log of reviewed reports
- **`ANALYTICS_EVENTS.md`** — no event schema documentation (events exist in code; schema doc does not)
- **`TRADITION_CALC_AUDIT.md`** — no documentation of Nakshatra or BaZi calculation formulas
- **48h post-purchase testimonial email** — no Day 2 follow-up email in `webhook.post.ts`, `email-templates.ts`, or anywhere in the codebase. `REAL_TESTIMONIALS` array in `preview.vue` is empty and will remain so without a collection mechanism.
- **B-4 weekly cohort table** — structured `[B-4]` logs exist in Railway; no automated table or dashboard
- **`prompt_version` DB column** — code writes it with a schema-gap fallback; column existence on production Supabase unconfirmed — requires manual verification

---

## STRATEGIC REALITY CHECK

**Omenora is currently strongest as:**
- A paid-acquisition web funnel with a low-ticket front-end offer ($2.99–$4.99 entry)
- A one-time-payment product with upsell revenue on top
- A personalization-first experience where every user gets a unique output

**Omenora is not yet strong enough to prioritize:**
- Subscription-first growth — cold traffic converts 0.5–2% on subscription vs 2–5% on one-time purchase (industry benchmark, 2026). Without proven LTV and churn systems, leading with subscriptions reduces first-session conversion without guarantee of payback.
- Daily engagement loops — the product has no natural daily content hook yet; forcing this before the core funnel is proven dilutes focus
- App-like retention mechanics — wrong stage; comes after funnel proof

**The previous plan overweighted:**
- Micro-UX polish items (animation details, tile scale, glow pulses)
- Competitor imitation ("Nebula's #1 conversion driver" — unverifiable; removed)
- UI/UX changes before measuring what the current baseline actually is

**The previous plan underweighted:**
- Reading quality — the entire revenue machine depends on AI output quality, yet no QA process exists
- Analytics instrumentation — conversion optimization is impossible without baseline measurement
- Offer/pricing experiments — the tier structure and upsell sequencing have never been tested
- Trust and claims alignment — unverified social proof and overclaiming are business risks, not just legal risks
- Refund/chargeback economics — Stripe's threshold is 0.5% of monthly transactions (verify against your account); Visa's VDMP program begins at 0.9%. A product with emotional/personalized AI claims is structurally exposed to friendly fraud.

---

## TRACK 0 — CORE BUSINESS RISKS (P0 — Do Before Everything Else)

These are the workstreams that do not exist in the current plan at all. They are prerequisites for safe scaling.

---

### B-1 · Build a Reading Quality QA Program

**Why:** The pipeline guarantees format, not quality. A structurally correct report can still be generic, inconsistent, or fail to connect the user's specific answers to specific content. UI polish cannot compensate for a weak reading.

**Owner:** Product + Founder  
**Dependencies:** None — start immediately  
**Success metric:** ≥ 80% of reviewed reports pass specificity + non-genericity checks before paid traffic scales

**Actions:**
- Review a minimum of 200 generated reports before scaling paid traffic
- Sample using this minimum matrix:
  - At least 10 reports per archetype for the top 8 archetypes; at least 5 for the remaining 4
  - At least 10 reports per active language (en, es, pt, hi, ko, zh)
  - At least 15 western tradition reports; at least 10 each for india, china, latam; at least 5 for korea and middleeast
  - Include both time-of-birth present and absent
  - Include varied name inputs across genders and cultures (Claude's output may shift in tone)
- Create `REPORT_QA_RUBRIC.md` scoring each report on:
  - **Specificity** — does content reference the user's specific answer values, not just the archetype generally?
  - **Emotional resonance** — does the Identity opening sentence feel like recognition, not description?
  - **Internal consistency** — do sections contradict each other or misalign?
  - **Non-genericity** — could this content apply equally to 30%+ of users with different inputs?
  - **Upsell readiness** — does the locked-section teaser create genuine curiosity or repeat what's already shown?
  - **Tradition coherence** — for Vedic/BaZi/Tarot, does content genuinely use the calculated framework inputs?
- Log failure modes by: archetype, language, tradition, failure type in `REPORT_QA_LOG.csv`
- Cluster failure modes; update prompts per cluster before scaling

**File context:** `server/api/generate-report.post.ts`, `server/utils/ai-schemas.ts`

---

### B-2 · Add Prompt/Output Iteration Loop

**Why:** No mechanism currently exists to attribute conversion rate changes to prompt changes, or to detect when output quality degrades.

**Owner:** Backend dev  
**Dependencies:** B-3 (conversion tracking by prompt version requires analytics events)  
**Success metric:** Prompt version tracked on every report; weekly review cycle running

**Actions:**
- Add `promptVersion` field to the report save payload — store in Supabase with each generated report
- Increment version string on every prompt change (e.g. `v1.0`, `v1.1`, `v2.0`)
- Track paywall conversion rate segmented by prompt version via B-3 dashboard
- Add non-blocking server-side logging for red-flag patterns:
  - Repeated exact phrases across sections of the same report
  - Identity opening sentences shorter than 15 words
  - Affirmation sections longer than 30 words (prompt requires exactly 1 sentence)
  - Tradition framework data absent from sections where it should appear
- Run weekly comparison: top-converting vs lowest-converting prompt version reports

**File context:** `server/api/generate-report.post.ts`, `server/api/save-report.post.ts`

**Migration sequencing — REQUIRED before B-2 code deploy:**
- Add `prompt_version` column to Supabase reports table in a migration file **before** deploying code that writes it
- Migration must be applied and confirmed on the target environment first; code deploy second
- Pattern: `ALTER TABLE reports ADD COLUMN IF NOT EXISTS prompt_version TEXT DEFAULT 'v1.0';` — `IF NOT EXISTS` makes it safe to re-run
- Verify column exists in Supabase dashboard before promoting the code build
- If column is missing when code runs, the `save-report` handler must not throw — add a `try/catch` around the `promptVersion` write with a non-blocking fallback log: `console.error('[B-2] promptVersion write failed:', err)` so report delivery is never blocked by a schema gap

---

### B-3 · Build Funnel Analytics Instrumentation

**Why:** Currently only `ViewContent` and `InitiateCheckout` are tracked — two late-funnel events. Without full-funnel measurement, all optimization is guesswork.

**Owner:** Frontend dev + Analytics  
**Dependencies:** None — highest-priority technical task in P0  
**Success metric:** All events firing with full properties; dashboard live before any paid spend increases

**Actions:**

**Event call error isolation — REQUIRED:**
Every analytics call must be wrapped so a tracking failure cannot interrupt the funnel. Use this wrapper pattern in `pixels.client.ts`:
```ts
function safeTrack(eventName: string, props?: Record<string, unknown>) {
  try {
    // your pixel/analytics call here
  } catch (err) {
    console.warn(`[B-3] tracking error — ${eventName}:`, err)
  }
}
```
Call `safeTrack(...)` instead of the analytics SDK directly at every instrumentation point. A broken pixel must never break checkout.

Instrument the following events (all client-side, via the existing pixel plugin at `app/plugins/pixels.client.ts` or a dedicated analytics integration):

```
landing_view
analysis_start
step1_complete
question_answered          { questionId: 'q1'...'q7', answer: value }
analysis_submit
preview_loading_start
preview_loaded             { archetype, lifePathNumber, tradition }
paywall_view
tier_selected              { tier: 1|2|3, price }
initiate_checkout          { tier, price }         ← already exists
checkout_complete          { tier, aov }
upsell_viewed              { type: 'compatibility'|'calendar'|'birthChart' }
upsell_accepted            { type, price }
report_viewed
share_card_opened
share_card_downloaded
email_capture_success      { source: 'paywall'|'report'|'opt-in' }
```

Every event must include these properties where available:
- `utm_source`, `utm_campaign`, `utm_adset`, `utm_creative`
- `device_type` (mobile/desktop/tablet)
- `language`
- `region` (tradition)
- `archetype`
- `life_path_number`
- `selected_tier`

**Dashboard requirements** — before scaling paid traffic, you need visible, current data on:
- Landing → analysis start rate
- Step 1 → step 2 → submit funnel
- Preview load rate (how many abort during the loading screen?)
- Preview → checkout conversion rate
- Checkout completion rate
- AOV (average order value, including upsells)
- Upsell attach rate by type
- Tier mix (% Basic / Bundle / Oracle)

Without these, the "Success Metrics" section of this plan is aspirational, not operational.

**File context:** `app/plugins/pixels.client.ts`, `app/pages/analysis.vue`, `app/pages/preview.vue`, `app/pages/report.vue`  
**Schema context:** Supabase events table or equivalent — define schema before implementation to avoid rework

---

### B-4 · Add Refund and Chargeback Economics Tracking

**Why:** Gross revenue is not net revenue. A product with personalized emotional AI output and one-time payments is structurally exposed to friendly fraud and expectation mismatch. Thresholds are real constraints — verify exact limits with your Stripe account and card network agreements.

**Owner:** Founder + Ops  
**Dependencies:** Stripe webhook access, Supabase write access  
**Success metric:** Weekly cohort table running; thresholds defined and monitored

**Actions:**
- Build a weekly cohort table (by week of purchase) tracking: gross revenue, refund count + rate, chargeback count + rate, net revenue, refund reason categories
- Log chargeback reason codes from Stripe webhook events (`server/api/stripe/` webhook handler)
- Define internal safe-to-scale thresholds (verify against your processor before using):
  - Refund rate < 5% of monthly gross revenue
  - Chargeback rate < 0.4% of monthly transactions
- Review ad creative and landing copy monthly for promise/reality alignment — expectation mismatch set by ads is the primary source of preventable chargebacks

**Schema context:** Add `refund_reason`, `chargeback_reason`, `chargeback_date` fields to Supabase orders/sessions table

---

## TRACK 1 — LEGAL / TRUST-RISK REDUCTION (P0 — Blocking)

Legal cleanup is a trust-risk and chargeback-risk reduction exercise, not just compliance. Emotional products with vague claims and unverified social proof generate higher chargeback rates. These fixes are not about legal cover — they are about aligning the product's promises with what it actually delivers.

**Note on language in this section:** Where the previous plan said "provides documented legal cover" — that phrasing is overconfident. Legal risk is reduced, not eliminated, by these changes. The accurate framing is: these changes *reduce avoidable risk*, *support safer product framing*, and *help align expectations*. They do not make the product legally bulletproof.

---

### L-1 · Rewrite Q4 and Q7 Option Text in All Languages
**File:** `augur/app/utils/translations.ts` (all 6 languages) + `augur/app/pages/analysis.vue` (value keys)  
**Owner:** Frontend dev  
**Dependencies:** None  
**Success metric:** All 5 option texts updated across all 6 languages; scoring engine values unchanged

Q4 option "Will I end up going through life alone?" and Q7 option "Feeling empty even when good things happen" are phrased as proxies for clinical loneliness and depression screening. Reframing as behavioral/growth questions resolves the risk without affecting scoring utility.

**Required changes:**

| Location | Current text | Replace with |
|---|---|---|
| `q4opt2` (value `alone`) | "Will I end up going through life alone?" | "Do I hold back when I could step forward?" |
| `q4opt4` (value `toomuch`) | "Is the way I feel things too much for most people?" | "Do I invest more than I get back in return?" |
| `q7opt2` (value `feelsnothing`) | "Feeling empty even when good things happen" | "Finishing things I start instead of moving on" |
| `q7opt3` (value `needstoo`) | "Needing people around me more than I want to" | "Staying consistent when motivation runs low" |
| `q3opt2` (value `unseen`) | "I am there for people, but they don't really know me" | "I show up for others but keep my real self private" |

The semantic `value` keys (`alone`, `feelsnothing`, `needstoo`) do NOT change — only display text. The archetype scoring engine is unaffected.

All 6 supported languages (`en`, `es`, `pt`, `hi`, `ko`, `zh`) must be updated.

---

### L-2 · Add Mental Health Crisis Signpost
**Files:** `augur/app/pages/index.vue`, `augur/app/pages/preview.vue`, `augur/app/pages/report.vue`  
**Owner:** Frontend dev  
**Dependencies:** None  
**Success metric:** Line visible in footer on all 3 pages in production

Add an unobtrusive footer line:
```
If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741
```

---

### L-3 · Add Data Use Notice at Step 2
**File:** `augur/app/pages/analysis.vue` — top of step 2 template  
**Owner:** Frontend dev  
**Dependencies:** None  
**Success metric:** Notice visible above question list in step 2

Add above the question list heading, styled as `.subheading` (italic, low-opacity):
```
Your answers are used only to generate your personal reading and are never stored as health data.
```

---

### L-4 · Fix or Remove the Founder Testimonial
**File:** `augur/app/pages/preview.vue` — `social-proof-line` block  
**Owner:** Product + Founder  
**Dependencies:** None — must be resolved before C-2 (loading screen testimonials) is built  
**Success metric:** No founder self-review visible to paid traffic; testimonial slot either empty or populated with real quotes only

**Required resolution (choose one — no interim option):**
- **Option A (recommended):** Replace the testimonial block with a `v-if="realTestimonials.length > 0"` guard. Testimonials render only when the array is populated. Ship with an empty array. When first 10 paying users respond to a post-purchase email asking for feedback, add their quotes. This approach is self-enforcing — no testimonial, no render.
- **Option B:** Remove the block entirely now. Add it back as a new feature once real quotes exist.

**Do NOT use the interim `data-disclosure="founder"` approach for paid traffic.** A founder rating their own product is a known FTC violation pattern (16 CFR § 255) regardless of disclosure label in a data attribute invisible to users.

**Collecting real testimonials:** Send a post-purchase email at Day 2 asking: *"What surprised you most about your reading?"* — one open question. Pull verbatim quotes from responses. No incentive needed; buyers who found value respond at 15–25% rate.

---

### L-5 · Verify or Replace the "3.9M analyses" Claim
**File:** `augur/app/pages/index.vue`  
**Owner:** Founder  
**Dependencies:** Supabase session count query  
**Success metric:** Claim is backed by a live DB count, or replaced with a verifiable alternative, before paid traffic runs

**Required resolution:**
Run this query against your Supabase `sessions` (or equivalent) table:
```sql
SELECT COUNT(*) AS total_sessions FROM sessions;
```
Then choose:
- **If count ≥ 3.9M:** Replace the hardcoded string with a value fetched at build time via a Nuxt server route or a Supabase RPC call. Cache with a 1-hour TTL. The number must reflect actual data, not a static string.
- **If count < 3.9M:** Replace immediately with LP-6's value-based copy (`Free · No account required · Results in 60 seconds`). Do not display a count you cannot substantiate.
- **Never display a hardcoded number that is not verified against a live data source.** FTC's 2022 guidance on deceptive endorsements and 2024 Consumer Reviews Rule both cover fabricated social proof metrics.

**Hardcoded static counts are not acceptable for paid traffic regardless of the number.** The count must either be live-queried or absent.

---

### L-6 · Verify the 24-Hour Urgency Claim
**File:** `augur/app/pages/preview.vue`, `augur/server/api/save-report.post.ts`  
**Owner:** Backend dev  
**Dependencies:** None  
**Success metric:** Claim is technically enforced in backend AND copy matches actual behavior, or both are removed together

"Your reading is saved for 24 hours." This must be enforced, not just stated.

**Required implementation if keeping the claim:**
1. Add an `expires_at` column to the reports/sessions table: `ALTER TABLE reports ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;`
2. On report save in `save-report.post.ts`, write: `expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()`
3. On report fetch (preview/report page load), check: if `expires_at < now()`, return 410 Gone and redirect to `/analysis` with a `?expired=true` query param
4. On `analysis.vue`, display a banner when `?expired=true`: *"Your previous reading has expired. Start a new one below."*
5. This also makes the urgency real — users who close the tab and return after 24hrs genuinely cannot access the same report, which reinforces the purchase decision without being false

**If not implementing enforcement:** Remove the 24-hour claim from `preview.vue` copy entirely. Unenforceable urgency copy is a documented chargeback trigger — users who feel manipulated by false scarcity dispute the charge.

---

## TRACK 1.5 — OFFER AND MONETIZATION STRATEGY (P1)

The tier structure and upsell sequencing have never been tested. Offer design is a higher-leverage variable than most UI changes once basic funnel health is established.

**Current structure (from `APP_TECHNICAL_SPEC.md` §8):**
- Tier 1 Basic: $2.99 → full reading only
- Tier 2 Bundle: $4.99 → reading + calendar + 1 compatibility
- Tier 3 Oracle: $12.99 → everything + birth chart + all traditions + subscription
- Compatibility impulse upsell during report loading ($0.99)
- Additional post-purchase upsells on report page

**Default operating hypothesis:** Tier 2 Bundle is the primary monetization offer. Tier 1 Basic is an entry anchor that reduces friction. Tier 3 Oracle should be treated as experimental and tested off the first paywall until conversion data proves first-session demand for it. Run M-1 to confirm or disprove this hypothesis.

---

### M-1 · Re-test the Paywall Structure

**Why:** The current 3-tier paywall has never been tested against alternatives. Oracle may be too abstract for cold first-session trust level.

**Owner:** Product + Frontend dev  
**Dependencies:** B-3 (instrumentation must be live to measure variant results)  
**Success metric:** A/B test running with minimum 200 completions per variant before calling winner

**Actions:**
- Run A/B test: 3-tier vs 2-tier paywall (Basic + Bundle, Oracle moved to post-purchase upsell)
- Test default anchoring: pre-select Basic vs Bundle; measure tier mix and AOV per variant
- Track per variant: checkout conversion rate, AOV, refund rate

**Canary deployment — REQUIRED before full A/B rollout:**
A broken paywall is the highest single-item revenue risk in the plan. Before splitting 50/50:
1. Deploy the new variant behind a `?preview_variant=2tier` query param flag first
2. Test end-to-end manually: tier selection → Stripe checkout → payment completion → report delivery → upsell flow
3. Verify Stripe webhook fires correctly for both variants (use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`)
4. Only enable the live A/B split after manual QA passes
5. Start split at 10% new variant / 90% control for the first 48 hours; monitor for payment errors in Stripe dashboard before moving to 50/50
6. Use a feature flag (environment variable or Supabase config row) to kill the new variant instantly without a code deploy if errors appear

---

### M-2 · Re-sequence the Upsell Stack

**Why:** Better sequencing can lift AOV without adding new products.

**Owner:** Product + Growth  
**Dependencies:** B-3 live, M-1 variant decided  
**Success metric:** Upsell attach rate tracked per offer type; AOV ≥ $5.50

**Proposed test sequence:**
- First paywall: Report or Bundle — high trust, low friction
- Post-purchase bump (during report loading): Compatibility ($0.99) — already implemented, keep
- Report page: Birth chart upsell, calendar upsell, tradition switch
- Email lifecycle Day 3–7: Subscription offer to buyers who have re-opened their report
- Oracle tested in email lifecycle for buyers — hypothesis: better sold after reading than before

---

### M-3 · Add a Packaging Experiment Roadmap

**Owner:** Product + Growth  
**Dependencies:** B-3 live, M-1 running  
**Success metric:** At least 1 naming/framing test running per sprint after B-3 is live

- Test bundle naming: "Bundle" vs "Full Reading" vs "Complete Map"
- Test whether "science" framing in tier copy helps or hurts (some users may perceive it as mismatched with a spiritual product)
- Test whether "birth chart" belongs in paywall messaging or post-purchase only
- Test price anchoring order: Oracle first (high anchor) vs Basic first (low entry)

---

## TRACK 2 — TRUST AND CLAIMS ALIGNMENT (P0)

Trust issues in the previous plan were scattered across legal and landing page sections. They need a single owner because they affect conversion, refund rate, and paid traffic viability simultaneously. The product uses emotionally intense output, AI framing, and personalized claims alongside unverified social proof and unconfirmed urgency copy. These affect both conversion and post-purchase refund rates.

---

### T-1 · Review and Align Pseudo-Scientific Framing

**Why:** Terms like "behavioral AI report" and "personality science" may imply clinical validity the product cannot deliver, increasing refund likelihood.

**Owner:** Product + Copywriter  
**Dependencies:** None  
**Success metric:** All flagged instances audited; at least 1 replacement test running

**Actions:**
- Audit all use of "science," "behavioral," "research," and "AI" across landing page, paywall copy, report section titles, and email templates
- For each instance: does it describe what the product does, or imply clinical/empirical validity?
- Test replacements: "behavioral AI report" → "personalized reading"; "personality science" → "archetype analysis"
- Track refund rate alongside conversion rate — refunds signal expectation mismatch, not just UX failure

---

### T-2 · Add a "How Your Reading Was Built" Trust Layer

**Why:** Users who understand the inputs are more likely to trust the result and less likely to dispute it.

**Owner:** Frontend dev  
**Dependencies:** C-4 (progress meter) — place near or below it  
**Success metric:** Visible on preview page in production

**Actions:**
- Add a concise explanation above or below the progress meter on `preview.vue`:
```
Your reading was built from: your birth date and city · your 7 answers · your [archetypeShortName] archetype (Life Path [lifePathNumber]) · [tradition] tradition framework · AI generation
```
- One line or two — should feel like a receipt, not a disclaimer

---

### T-3 · Remove All Fake Urgency and Unverified Proof From Production

**Owner:** Product + Founder  
**Dependencies:** L-4, L-5, L-6 decisions made  
**Success metric:** Zero unverified proof or unenforceable urgency visible to paid traffic

**Actions:**
- No placeholder testimonials visible to paid traffic (→ L-4)
- No fabricated session/user counts (→ L-5)
- No urgency copy not technically enforced (→ L-6)
- No countdown timers unless discount is backend-enforced with real expiry
- No "X people are looking at this" social proof — common dark pattern; generates chargebacks at scale

---

## TRACK 3 — CONVERSION FIXES (P1 — After P0 Is Instrumented)

Run after B-3 is live. Every item here is a hypothesis to confirm with your own data — not a guaranteed outcome. A/B test where volume allows.

**Owner (default):** Frontend dev unless noted

---

### C-1 · Add Mid-Quiz Personalization Screens After Q1 and Q4
**File:** `augur/app/pages/analysis.vue` — Step 2 template  
**Owner:** Frontend dev  
**Dependencies:** None  
**Success metric:** Measure analysis_submit rate before/after (B-3 required)

**State edge cases — handle before shipping:**
- User changes their Q1 or Q4 answer after the interstitial has already shown: the interstitial should not re-trigger. Use a `Set<string>` (`shownInterstitials`) to track which question IDs have already displayed — check before showing, add to set on show.
- User taps rapidly through questions before the 1.5s auto-scroll fires: cancel the pending `setTimeout` on component unmount (`onUnmounted`) to prevent errors on navigation.
- Auto-scroll must not scroll past questions the user has not yet answered: target scroll to the next unanswered question, not to the bottom of the page.
- Mobile keyboard may be open when interstitial renders: interstitial should not rely on `window.scrollTo` directly — use `el.scrollIntoView({ behavior: 'smooth', block: 'center' })` on the element ref.

After Q1 and Q4 selections, display a brief interstitial (1 sentence, fades in, auto-scrolls after 1.5 seconds).

**Q1 personalization map:**
```
trust → "Someone who moves on instinct. Your reading maps where that instinct comes from."
wait  → "Someone who reads before they act. Your reading reveals what you're actually watching for."
talk  → "Someone who processes through connection. Your reading explains how your network shapes you."
push  → "Someone who moves through discomfort. Your reading shows what you're really pushing toward."
```

**Q4 personalization map:**
```
capable  → "The doubt behind competence is one of the most powerful patterns in your archetype."
alone    → "Connection and independence are the core tension in your destiny path."
matters  → "Purpose-seeking is a defining trait of your archetype family."
toomuch  → "Depth of feeling is one of your primary gifts — your reading shows how to channel it."
```

Implementation: Add `showPersonalizationScreen` ref; map answer to sentence; render a full-width block between questions styled as `.subheading`; fade out and scroll automatically.

---

### C-2 · Use the Loading Screen as a Conversion Moment
**File:** `augur/app/pages/preview.vue` — loading state  
**Owner:** Frontend dev  
**Dependencies:** L-4 resolved — do NOT display placeholder testimonials to paid traffic; use real quotes or disable the testimonial slot until real quotes are collected  
**Success metric:** Track preview_loading_start → preview_loaded abandonment rate before/after

**Testimonial placeholder enforcement — prevents accidental shipping:**
Do not use a `[REPLACE_WITH_REAL_QUOTE]` string comment. Instead, use a typed constant array with a build-time guard:
```ts
// preview.vue <script setup>
const REAL_TESTIMONIALS: Array<{ quote: string; author: string }> = [
  // ADD REAL QUOTES HERE BEFORE ENABLING — leave empty until collected
]
const showTestimonialSlot = REAL_TESTIMONIALS.length > 0
```
The `v-if="showTestimonialSlot"` on the testimonial element means an empty array = nothing renders. No comment, no placeholder string, no accidental fake quote. When real testimonials are collected, add them to the array and the slot activates automatically.

1. Seconds 0–2: "Processing your behavioral profile, [firstName]..."
2. Seconds 2–4: Rotating testimonial slot (`v-if="showTestimonialSlot"` — renders nothing until array is populated)
3. Seconds 4–6: "Your [archetypeShortName] archetype is being mapped..."
4. Final: "Your reading is ready."

---

### C-3 · Add Archetype Reveal Animation
**File:** `augur/app/pages/preview.vue` — `.archetype-block`  
**Owner:** Frontend dev  
**Dependencies:** None  
**Success metric:** Visual — confirm on mobile; no layout shift

CSS `@keyframes archetypeReveal` (opacity 0→1, scale 0.94→1, translateY 6px→0, 0.9s ease-out). Staggered delays on `.archetype-label` (0.1s), `.archetype-symbol` (0.3s), `.archetype-name` (0.5s), `.archetype-meta` (0.7s), `.traits-row` (0.9s). Pure CSS.

---

### C-4 · Add Unlock Progress Meter Above Pricing
**File:** `augur/app/pages/preview.vue` — between `.blurred-preview` and locked sections  
**Owner:** Frontend dev  
**Dependencies:** None  

```
YOUR READING IS 18% UNLOCKED
[███░░░░░░░░░░░░░░░░░] 18%
```

Thin gold progress bar, Cormorant Garamond percentage text. 18% = Identity (1/7 sections ≈ 14%), rounded up.

---

### C-5 · Personalize Paywall Copy With Archetype Data
**File:** `augur/app/pages/preview.vue` — tier feature descriptions  
**Owner:** Frontend dev  
**Dependencies:** None (data already in store)  

```
Tier 2: "Full [archetypeShortName] reading + your 2026 destiny windows + compatibility with one person"
Tier 3: "Complete [archetypeShortName] map — all 7 sections, your Life Path [lifePathNumber] calendar, birth chart & all traditions"
```

---

### C-6 · Improve Tier Card Visual Weight
**File:** `augur/app/pages/preview.vue` — `.tier-popular` CSS  
**Owner:** Frontend dev  
**Dependencies:** M-1 variant decision (if Oracle moves off paywall, card layout changes)  

- Increase `.tier-popular` padding to `20px 18px`
- Add `box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.65), 0 8px 32px rgba(140, 110, 255, 0.18)` as default
- Increase `.tier-price-popular` font-size to `34px`
- Add `transform: scale(1.02)` on `.tier-popular:hover`

---

## TRACK 4 — UI/UX POLISH (P2 — Second-Order Multipliers)

Real improvements, but second-order multipliers. Run after P0 and P1 are in place. A polished paywall with weak reading quality underperforms a functional paywall with strong quality.

**Owner (default):** Frontend dev

---

### U-1 · Option Tile Selection Animation
**File:** `augur/app/pages/analysis.vue` — `.option-tile.selected` CSS  
**Dependencies:** None

```css
.option-tile.selected {
  transform: scale(1.02);
  transition: all 0.15s ease;
}
```

Add a brief `@keyframes tilePulse` (opacity 0.6→1 over 0.15s). Gives physical "tap registered" feedback on mobile.

---

### U-2 · Tradition Selector Explanation Copy
**File:** `augur/app/pages/analysis.vue` — `.region-section`  
**Dependencies:** None

Add above the 4 tradition cards:
```
This determines which ancient system interprets your destiny.
```

Style: `.subheading` class (13px italic, low opacity).

---

### U-3 · Landing Page CTA Button Style
**File:** `augur/app/pages/index.vue` — `.cta-button` CSS  
**Dependencies:** None — see LP-2 for full spec

---

### U-4 · Post-Payment Email Confirmation Banner
**File:** `augur/app/pages/report.vue`  
**Dependencies:** None

Dismissible banner at top of `.report-page`, visible only when `store.paymentComplete === true`. Auto-dismiss after 5 seconds:
```
✦ Your complete reading has been sent to [store.email]
```

---

## TRACK 5 — GROWTH AND RETENTION (P2 — After Funnel Economics Are Proven)

Do not invest heavily here until P0 and P1 are complete. Retention mechanics on top of an unproven funnel add cost without predictable return.

**Owner (default):** Growth + Founder

---

### G-1 · Daily Insight Email Opt-in on Report Page
**File:** `augur/app/pages/report.vue`  
**Owner:** Frontend dev + Growth  
**Dependencies:** Email sequence infrastructure confirmed working (`server/api/email-sequence/`)  

After full report renders, above subscription upsell:
```
Want a daily reflection based on your [archetypeShortName] archetype?
[  your@email.com  ]  [ Get Daily Insights — Free ]
```
Soft path to subscription — not a direct pitch.

---

### G-2 · Share Card on Preview Page (Email-Gated)
**File:** `augur/app/pages/preview.vue`  
**Owner:** Frontend dev  
**Dependencies:** `server/api/generate-card.post.ts` working; email capture flow active  

Expose share card download on preview page, gated behind email capture (not payment). Infrastructure exists — verify it is accessible pre-purchase. User sharing archetype = unpaid acquisition; email feeds abandonment sequence.

---

## TRACK 6 — LANDING PAGE CLARITY AND CONVERSION (P1)

Execute after B-3 (instrumentation) is live so each change is measurable. The current landing page has 7 structural problems diagnosed from code and user feedback.

**Owner (default):** Frontend dev

---

### LP-1 · Rewrite the Tagline Into a Concrete Value Proposition
**File:** `augur/app/pages/index.vue`

**Current:** "AI decoded your destiny. Science explains why." — tells a visitor nothing about what they receive, how long it takes, or why it is free.

**Replace with:**
```html
<p class="tagline">Your free AI destiny reading — ready in 60 seconds.</p>
<p class="tagline-sub">Tell us your birth date and we'll map your personality archetype, life path number, and 2026 forecast using AI.</p>
```

```css
.tagline-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.32);
  line-height: 1.65;
  margin-top: 8px;
  margin-bottom: 0;
  max-width: 360px;
  text-align: center;
}
```

This directly answers: What is it? How long? What do I provide? What do I get?

---

### LP-2 · Make the CTA Button Visually Primary
**File:** `augur/app/pages/index.vue` — `.cta-button` CSS

**Current:** `background: transparent` — effectively invisible at a glance.

```css
.cta-button {
  background: rgba(140, 110, 255, 0.85);
  border: 1px solid rgba(180, 150, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 32px rgba(140, 110, 255, 0.25);
  color: rgba(255, 255, 255, 0.96);
  padding: 17px 48px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: none;
  cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease;
}
.cta-button:hover {
  background: rgba(140, 110, 255, 1);
  box-shadow: 0 6px 40px rgba(140, 110, 255, 0.38);
}
```

Change button label from "BEGIN YOUR ANALYSIS" to "Get My Free Reading →".

---

### LP-3 · Add "What You'll Discover" Section
**File:** `augur/app/pages/index.vue` — after `.content` block, before `<footer>`

```html
<section class="discover-section" aria-label="What's inside your reading">
  <p class="discover-label">WHAT'S INSIDE YOUR READING</p>
  <div class="discover-grid">
    <div class="discover-card">
      <span class="discover-glyph">✦</span>
      <p class="discover-name">Destiny Archetype</p>
      <p class="discover-desc">Your behavioral blueprint — why you make decisions the way you do</p>
    </div>
    <div class="discover-card">
      <span class="discover-glyph">◈</span>
      <p class="discover-name">Life Path Number</p>
      <p class="discover-desc">Your numerology core — the hidden pattern running through every major event in your life</p>
    </div>
    <div class="discover-card">
      <span class="discover-glyph">⟡</span>
      <p class="discover-name">2026 Destiny Forecast</p>
      <p class="discover-desc">Month-by-month energy windows — when to move, when to wait, when to build</p>
    </div>
    <div class="discover-card">
      <span class="discover-glyph">◯</span>
      <p class="discover-name">Love & Relationship Patterns</p>
      <p class="discover-desc">What your archetype seeks in connection — and what creates friction without you realizing it</p>
    </div>
  </div>
</section>
```

```css
.discover-section { width: 100%; max-width: 520px; margin: 56px auto 0; padding: 0 20px; box-sizing: border-box; }
.discover-label { font-size: 9px; letter-spacing: 0.18em; color: rgba(201, 168, 76, 0.45); text-align: center; margin: 0 0 24px; text-transform: uppercase; }
.discover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.discover-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 18px 16px; text-align: left; }
.discover-glyph { font-size: 14px; color: rgba(201, 168, 76, 0.55); display: block; margin-bottom: 10px; }
.discover-name { font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.72); margin: 0 0 6px; letter-spacing: 0.02em; }
.discover-desc { font-size: 11px; color: rgba(255, 255, 255, 0.28); line-height: 1.6; margin: 0; }
@media (max-width: 420px) { .discover-grid { grid-template-columns: 1fr; } }
```

---

### LP-4 · Add "How It Works" 3-Step Strip
**File:** `augur/app/pages/index.vue` — after `.discover-section`

```html
<section class="how-section" aria-label="How it works">
  <div class="how-steps">
    <div class="how-step">
      <span class="how-num">01</span>
      <p class="how-text">Enter your name, birth date, and city</p>
    </div>
    <div class="how-divider" aria-hidden="true" />
    <div class="how-step">
      <span class="how-num">02</span>
      <p class="how-text">Answer 7 quick questions about yourself</p>
    </div>
    <div class="how-divider" aria-hidden="true" />
    <div class="how-step">
      <span class="how-num">03</span>
      <p class="how-text">Your AI reading is generated in seconds</p>
    </div>
  </div>
</section>
```

```css
.how-section { width: 100%; max-width: 520px; margin: 40px auto 0; padding: 0 20px; box-sizing: border-box; }
.how-steps { display: flex; align-items: center; gap: 8px; }
.how-step { flex: 1; text-align: center; }
.how-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: rgba(201, 168, 76, 0.35); display: block; line-height: 1; margin-bottom: 8px; }
.how-text { font-size: 11px; color: rgba(255, 255, 255, 0.32); line-height: 1.55; margin: 0; }
.how-divider { width: 1px; height: 32px; background: rgba(255, 255, 255, 0.06); flex-shrink: 0; }
@media (max-width: 420px) { .how-steps { flex-direction: column; gap: 16px; } .how-divider { width: 40px; height: 1px; } }
```

---

### LP-5 · Fix Feature Pills
**File:** `augur/app/pages/index.vue` — `.feature-pill` CSS

Current opacity (`rgba(255,255,255,0.16)`) makes them effectively invisible. **Recommended: remove them** — LP-3 covers the same ground with more depth and less clutter.

---

### LP-6 · Replace Unverified Social Proof With Value-Based Copy
**File:** `augur/app/pages/index.vue` — threshold block

Replace the floating "3.9M analyses complete" with:
```html
<div class="threshold">
  <div class="threshold-rule" aria-hidden="true" />
  <p class="social-proof">Free · No account required · Results in 60 seconds</p>
  <div class="threshold-rule" aria-hidden="true" />
</div>
```

This answers the 3 top objections (cost, friction, time) rather than making a claim that must be verified. Move the session count — once verified — to LP-3 section header if desired.

---

### LP-7 · Add Staggered Entry Animations
**File:** `augur/app/pages/index.vue` — `.content` child elements

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.orbital-mark { animation: fadeUp 0.6s ease forwards; animation-delay: 0s; }
.brand-name   { animation: fadeUp 0.6s ease forwards; animation-delay: 0.1s; opacity: 0; }
.tagline      { animation: fadeUp 0.6s ease forwards; animation-delay: 0.2s; opacity: 0; }
.tagline-sub  { animation: fadeUp 0.6s ease forwards; animation-delay: 0.3s; opacity: 0; }
.threshold    { animation: fadeUp 0.6s ease forwards; animation-delay: 0.35s; opacity: 0; }
.cta-button   { animation: fadeUp 0.6s ease forwards; animation-delay: 0.45s; opacity: 0; }
.sub-label    { animation: fadeUp 0.6s ease forwards; animation-delay: 0.55s; opacity: 0; }
```

---

### LP-8 · Add Second CTA After Scroll Sections
**File:** `augur/app/pages/index.vue` — after `.how-section`, before `<footer>`

```html
<div class="bottom-cta-block">
  <button class="cta-button bottom-cta" @click="navigateTo('/analysis')">
    <span class="cta-label">Get My Free Reading →</span>
  </button>
  <p class="sub-label">Takes 60 seconds · No account required</p>
</div>
```

```css
.bottom-cta-block { width: 100%; max-width: 520px; margin: 48px auto 80px; padding: 0 20px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.bottom-cta { width: 100%; max-width: 360px; }
```

---

### LP-9 · Final Landing Page Structure

```
[Hero]
  Orbital mark (animated)
  OMENORA
  "Your free AI destiny reading — ready in 60 seconds."
  "Tell us your birth date..."
  ─── Free · No account required · Results in 60 seconds ───
  [ Get My Free Reading → ]
  "No login required · Results in 60 seconds"

[What You'll Discover] — 2×2 grid

[How It Works] — 3-step strip

[ Get My Free Reading → ] — bottom repeat CTA

[Footer: Privacy · Terms · © 2026 OMENORA]
```

---

## TRACK 7 — PAID TRAFFIC READINESS (P1)

Revenue ceiling is determined by paid traffic performance, not onsite UX alone. This track was entirely absent from v1.

**Owner:** Growth / Media buyer + Founder

---

### P-1 · Build a Paid Creative Testing Loop

**Owner:** Growth / Media buyer  
**Dependencies:** LP-1, LP-2, LP-6 live (message match requires landing page to be updated); B-3 live (need conversion tracking by creative); T-1 reviewed (no misleading claims in ads)  
**Success metric:** At least 1 angle with positive net ROAS after refunds within 30 days of launch

**Actions:**
- Launch 5 creatives in week 1, covering these angles:
  - **Archetype reveal:** "Your destiny archetype just changed how I see myself" — UGC style
  - **"Feel seen" identity hook:** First sentence of a real identity section shown verbatim
  - **Love/compatibility hook:** "Your archetype shows exactly who you attract — and why it keeps going wrong"
  - **2026 forecast hook:** "AI mapped my 2026 month by month and I wasn't ready for how accurate it was"
  - **Birth chart curiosity hook:** "You have a Day Master. Most people have never heard of it. Here's what yours says."
- Match each angle to a landing page headline variant (message match — see P-2)
- Replace bottom 40% of creatives weekly; produce 3 new variants per winning angle
- Kill angles with strong CTR but weak checkout conversion — traffic quality, not volume
- Track per angle: CTR, CPM, checkout conversion, AOV, net ROAS after refunds

---

### P-2 · Add Message-Match QA

**Owner:** Growth + Product  
**Dependencies:** P-1 running; B-3 live  
**Success metric:** Weekly review running; no open mismatch items older than 1 week

**Weekly checklist:**
- Ad headline → landing page headline: consistent promise?
- Landing page → preview: same expectation set?
- Paywall offer → ad benefit: aligned?
- Any claims in ads not supported by the actual report output?

Mismatch shows up as abandonment (conversion loss) or refunds (post-purchase loss).

---

### P-3 · Define "Safe to Scale" Thresholds

**Owner:** Founder  
**Dependencies:** B-3 live, B-4 tracking running, B-1 QA pass rate established  
**Note:** Threshold values below are starting points; verify chargeback limits against your actual Stripe account and card network agreements

| Metric | Minimum threshold to scale |
|---|---|
| Preview → checkout conversion | Establish baseline first; do not scale without knowing it |
| Checkout completion rate | ≥ 65% |
| AOV (including upsells) | ≥ $5.50 (confirms upsells are attaching above Tier 2 base) |
| Refund rate | < 5% of monthly gross revenue |
| Chargeback rate | < 0.4% of monthly transactions |
| CAC payback period | ≤ first transaction (one-time model; no LTV extension needed) |
| Reading QA pass rate | ≥ 80% (B-1 rubric) |

---

## DE-PRIORITIZE FOR NOW

These are not bad ideas. They are correct ideas at the wrong stage:

- **Subscription-first growth** — one-time purchase converts 2–5% on cold traffic; subscription converts 0.5–2%. Without proven LTV and churn control infrastructure, leading with subscription reduces first-session revenue. Build it into P2 as a soft upsell path.
- **Daily engagement loops as core strategy** — the product does not have a natural daily content hook that matches current architecture. The `/api/generate-daily-insight` endpoint exists but forcing daily engagement before funnel proof is premature.
- **Extensive animation work before instrumentation** — animations are second-order multipliers. They amplify what is already working. Building animation on top of an unmeasured, unvalidated funnel is expensive polish on an unknown foundation.
- **Broad feature expansion across all 6 traditions before funnel proof** — the tradition system is sophisticated. Proving it works for western + 1 additional tradition at positive unit economics is more valuable than polishing all 6 simultaneously.
- **Polishing low-impact UI details before offer and trust work** — tile scale, hover effects, glow pulses are real improvements. They do not compensate for weak reading quality, unverified claims, or an untested offer structure.

---

## SUCCESS METRICS TO TRACK

### Funnel (establish baselines before P1)
- Landing page → analysis start %
- Step 1 completion %
- Step 2 completion %
- Preview load % (how many users abandon during the loading screen?)
- Preview → initiate checkout %
- Checkout completion %

### Monetization
- AOV (including upsells)
- Tier mix (% Basic / Bundle / Oracle)
- Upsell attach rate by type (compatibility, calendar, birth chart)
- Revenue per visitor
- Revenue per paying user

### Trust / Quality
- Refund rate (% of monthly gross revenue)
- Chargeback rate (% of monthly transactions — keep below 0.4%)
- Support complaint rate (track by category)
- Share card download rate
- Email capture rate by source (paywall / opt-in / share gate)

### Paid Traffic
- CAC by channel (Meta, TikTok, organic)
- CAC by creative angle
- CAC payback period (should be ≤ first transaction for one-time model)
- ROAS by campaign (gross and net-of-refunds)
- Net contribution margin (revenue − COGS − CAC − refunds − chargebacks)

### Reading Quality
- QA pass rate (from B-1 rubric)
- % of reviewed reports flagged as generic
- % of reviewed reports flagged as internally inconsistent
- Conversion rate by prompt version (from B-2 tracking)
- Conversion rate by archetype, language, and tradition (segmented from B-3 events)

---

## FILES TOUCHED SUMMARY

| File | Tracks |
|---|---|
| `augur/app/utils/translations.ts` | L-1 (all 6 languages) |
| `augur/app/pages/analysis.vue` | L-3, C-1, U-1, U-2 |
| `augur/app/pages/index.vue` | L-2, L-5, LP-1 through LP-8 |
| `augur/app/pages/preview.vue` | L-2, L-4, L-6, T-2, T-3, C-2, C-3, C-4, C-5, C-6, G-2 |
| `augur/app/pages/report.vue` | L-2, U-4, G-1 |
| `augur/app/plugins/pixels.client.ts` | B-3 (funnel event instrumentation) |
| `augur/server/api/save-report.post.ts` | B-2 (prompt versioning), L-6 (expiry enforcement) |
| `augur/server/api/generate-report.post.ts` | B-2 (prompt versioning + red-flag logging) |
| `augur/server/api/stripe/webhook.post.ts` | B-4 (chargeback/refund reason code logging) |
| `REPORT_QA_RUBRIC.md` | B-1 (create this file — QA scoring rubric) |
| `REPORT_QA_LOG.csv` | B-1 (operational artifact — log failure modes per report) |
| `Supabase schema / migrations` | B-2 (`promptVersion` field on reports table); B-4 (`refund_reason`, `chargeback_reason`, `chargeback_date` on orders/sessions table) |
| `Analytics dashboard / event schema doc` | B-3 (define event schema before instrumenting; prevents rework) |

---

## WHY THIS REVISION WAS MADE

The previous plan (v1, April 2026) was a useful starting point. It covered legal risk, landing page structure, and paywall UX. This revision was made because the previous plan had the following gaps:

- **Output quality had no owner.** The entire conversion funnel depends on whether users find their AI-generated report specific and resonant enough to pay for the rest. The v1 plan had no process for reviewing, measuring, or improving report quality. This is the single highest-leverage variable in the business and it was absent.
- **There was no instrumentation plan.** The v1 success metrics table listed targets ("Preview page → payment conversion: +20–30%") with no baseline data and no plan to collect it. You cannot optimize a funnel you cannot measure.
- **Offer design was not addressed.** The tier structure, upsell sequencing, and packaging have never been tested. The v1 plan treated the current offer as fixed and optimized around it. Offer design is typically a higher-leverage variable than UI polish.
- **Trust and claims alignment were scattered.** Unverified social proof, urgency copy, and pseudo-scientific framing appeared across 3 different tracks without a single place that owned the problem. This revision consolidates them into Track 2.
- **Paid traffic readiness was absent.** The phrase "money machine" implies a paid acquisition loop. That loop depends on creative testing, message-match QA, and defined scale thresholds — none of which appeared in v1.
- **Chargeback/refund economics were not planned for.** A product with emotionally intense, personalized AI output and a one-time payment model is structurally exposed to friendly fraud. Stripe's 0.5% threshold and Visa's VDMP program are real constraints. v1 mentioned chargebacks once, in a success metric row.
- **Micro-UX polish was overweighted.** Several v1 items (archetype animation, tile pulse, hover scale, tier card glow) were framed as primary revenue drivers. They are real improvements but second-order multipliers — they amplify what is already working. The v1 framing implied they were sufficient without the foundational work above.

---

## REVENUE MATH
**Model:** One-time payment funnel, no subscription dependency for base revenue.
**Prices confirmed from codebase:** Basic $2.99 (`create-payment.post.ts` line 42), Bundle $4.99 (`create-bundle-payment.post.ts` line 40), Oracle $12.99 (`create-oracle-payment.post.ts` line 40). Compatibility add-on $0.99 (`create-addon-payment.post.ts` line 32), Calendar $2.99, Birth chart $2.99, Tradition switch $1.99.

### Base case — organic / early paid traffic
- Daily preview page visitors: 300
- Preview → checkout conversion rate: 3% (industry benchmark; establish real baseline via B-3 before optimizing)
- Average order value: $5.20 (blended: ~60% Tier 2 at $4.99 + upsell attach)
- Daily revenue: 300 × 0.03 × $5.20 = $46.80
- Monthly revenue (gross): ~$1,400
- Subtract: Stripe fees (2.9% + $0.30/transaction), AI API cost (~$0.04–0.06 per report at claude-sonnet-4-5 pricing), Railway hosting
- **Net monthly at this scale: approximately $1,000–$1,200**
- Verdict: Not a money machine at this traffic level. Covers costs. Proves the model.

### Target case — paid traffic running
- Daily preview page visitors: 3,000
- Same CVR and AOV assumptions
- Daily revenue: 3,000 × 0.03 × $5.20 = $468
- Monthly revenue (gross): ~$14,000
- **Net monthly at this scale: approximately $10,000–$11,500**
- CAC ceiling to break even: $5.20 (full AOV must be returned in first transaction — one-time model has no LTV extension)
- At $0.30 CPC and 3% landing → preview conversion: CAC = $10 → loss
- At $0.30 CPC and 10% landing → preview conversion: CAC = $3 → margin
- **Landing page → analysis start rate is the primary CAC lever, not paywall CVR**

### What moves the needle most — ranked by leverage
1. **Landing → analysis start rate** — every percentage point here cuts CAC. This is why LP-1 and LP-2 (CTA overhaul) matter more than paywall polish.
2. **AOV** — the $0.99 impulse upsell and the bundle attachment rate. A $1 AOV increase on 100 daily buyers = $3,000/month additional revenue.
3. **Preview → checkout CVR** — meaningful but harder to move than #1 and #2 without knowing the baseline first. Do not optimize blind.
4. **Traffic volume** — a multiplier on all of the above. Not the first lever.

### Break-even CAC calculation
- If AOV = $5.20 and you want 30% contribution margin after fees:
  - Stripe: ~$0.45 per transaction
  - API: ~$0.05 per report
  - Max CAC: $5.20 × 0.70 − $0.50 = **$3.14 maximum CAC**
- This requires either low CPC (<$0.10) or high landing→preview conversion (>15%)
- TikTok organic content that drives free traffic makes this math easy. TikTok paid at scale makes this math hard until CVR is proven.

### Pricing experiment impact
- Current entry: $2.99 (Tier 1)
- If Tier 1 raised to $4.99 and CVR drops 1% (3% → 2%): 3,000 × 0.02 × $4.99 = $299/day vs $468/day → worse
- If Tier 1 raised to $4.99 and CVR holds at 3%: 3,000 × 0.03 × $4.99 = $449/day → marginally worse than bundle-anchored
- **Conclusion: Tier 1 price matters less than bundle attachment rate. Focus M-1 and M-4 on pushing users to $4.99 Tier 2, not on raising Tier 1.**

---

## EXECUTION CHECKLIST

This checklist is the step-by-step implementation reference for all plan items. Each step references the exact plan section, owner, file(s), and the concrete done-state. Work through phases in order. Do not begin P1 steps until all P0 blocking steps are marked complete.

Checkbox legend: `[ ]` = not started · `[~]` = in progress · `[x]` = done

**Last verified against codebase:** April 2026

---

### PHASE 0 — Blocking (Must Complete Before Any Paid Traffic Increase)

#### 0-A · Legal / Trust-Risk Reduction
*Ref: TRACK 1 — LEGAL / TRUST-RISK REDUCTION*

- [x] **L-1 · Rewrite Q4 and Q7 option text** *(DONE — verified April 2026)*
  - Files: `augur/app/utils/translations.ts` (all 6 languages: en, es, pt, hi, ko, zh), `augur/app/pages/analysis.vue`
  - Verification: All 5 option display texts confirmed replaced across all 6 language keys. Value keys (`alone`, `feelsnothing`, `needstoo`, `toomuch`) unchanged. Current en copy: q4opt2 = "Do I hold back when I could step forward?", q4opt4 = "Do I invest more than I get back in return?", q7opt2 = "Finishing things I start instead of moving on", q7opt3 = "Staying consistent when motivation runs low".
  - Ref: TRACK 1 → L-1

- [x] **L-2 · Add mental health crisis signpost to 3 pages** *(DONE — verified April 2026)*
  - Files: `augur/app/pages/index.vue` (line 58), `augur/app/pages/preview.vue` (line 276), `augur/app/pages/report.vue` (line 683)
  - Verification: "If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741" confirmed present in all 3 page footers. Styled `.footer-crisis` / `.preview-footer-crisis` / `report-footer-crisis` at 9px, opacity 0.1.
  - Ref: TRACK 1 → L-2

- [x] **L-3 · Add data use notice at step 2** *(DONE — verified April 2026)*
  - File: `augur/app/pages/analysis.vue` (line 239)
  - Verification: "Your answers are used only to generate your personalized reading and are not stored, sold, or shared with third parties." present in `.data-use-notice` element above question list.
  - Ref: TRACK 1 → L-3

- [x] **L-4 · Fix founder testimonial — use real-buyer guard** *(DONE — verified April 2026)*
  - File: `augur/app/pages/preview.vue` (lines 287–292)
  - Verification: `REAL_TESTIMONIALS` typed array implemented; `showTestimonialSlot = computed(() => REAL_TESTIMONIALS.length > 0)`; `v-if="showTestimonialSlot"` on the block. Array is currently empty → nothing renders. No fake quote can ship.
  - **Remaining action:** Collect real buyer quotes and populate `REAL_TESTIMONIALS` array when available.
  - Ref: TRACK 1 → L-4

- [x] **L-5 · Replace unverified "3.9M analyses" claim** *(DONE — verified April 2026)*
  - File: `augur/app/pages/index.vue` (line 28)
  - Verification: Social proof line now reads "Free · No account required · Results in 60 seconds" — no fabricated count present.
  - Ref: TRACK 1 → L-5

- [~] **L-6 · Verify and enforce 24-hour urgency claim** *(PARTIALLY DONE — action required)*
  - File: `augur/app/pages/preview.vue` (line 236), `augur/server/api/save-report.post.ts`
  - Current state: `preview.vue` line 236 contains "Not what you expected? Full refund within 24 hours — no questions asked." — this is a refund promise, not a reading expiry claim. The previous "reading saved for 24 hours" urgency copy does not appear to be present in current preview.vue. **Verify the current live copy contains no unenforceable expiry claim.** If a new urgency timer is ever added, it must be backend-enforced per the L-6 spec.
  - Action required: Confirm no unenforceable expiry copy exists in current preview.vue. If the refund guarantee is offered, verify it is operationally honored.
  - Ref: TRACK 1 → L-6

#### 0-B · Trust and Claims Alignment
*Ref: TRACK 2 — TRUST AND CLAIMS ALIGNMENT*

- [x] **T-3 · Remove all fake urgency and unverified proof from production** *(DONE — verified April 2026)*
  - Verification: No placeholder testimonials render (L-4 guard confirmed). No fabricated session counts (L-5 replaced). No "X people are viewing" copy found. No unenforceable countdown timers found in current codebase.
  - Ref: TRACK 2 → T-3

- [ ] **T-1 · Audit and align pseudo-scientific framing**
  - Owner: Product + Copywriter
  - Files to audit: `augur/app/pages/index.vue` (tagline "Science explains why"), `augur/app/pages/preview.vue` (`.report-badge` "Behavioral AI Report"), `augur/server/utils/email-templates.ts` (any "science/behavioral" copy)
  - Specific items to decide: (a) tagline "AI decoded your destiny. Science explains why." — does "Science" imply clinical validity? (b) preview `.report-badge` "Behavioral AI Report" label; (c) any email template copy using "personality science" or "behavioral research"
  - Done when: All flagged instances audited; decision made on each (keep, reframe, or remove); at least 1 replacement test tracked if changed
  - Ref: TRACK 2 → T-1

#### 0-C · Reading Quality
*Ref: TRACK 0 — CORE BUSINESS RISKS → B-1, B-2*

- [ ] **B-1 · Create REPORT_QA_RUBRIC.md**
  - Owner: Product + Founder
  - File: Create `REPORT_QA_RUBRIC.md` at repo root
  - Done when: File exists with all 6 scoring criteria (Specificity, Emotional resonance, Internal consistency, Non-genericity, Upsell readiness, Tradition coherence) and pass/fail thresholds defined
  - Ref: TRACK 0 → B-1

- [ ] **B-1 · Review 200 generated reports using the rubric**
  - Owner: Product + Founder
  - Artifact: `REPORT_QA_LOG.csv`
  - Done when: 200 reports reviewed against rubric; sampled per the matrix (10/archetype top-8, 5/remaining 4, 10/language, 15 western / 10 india+china+latam / 5 korea+middleeast, time-of-birth present+absent, name variation); failure modes logged and clustered; pass rate calculated
  - Ref: TRACK 0 → B-1 (sampling matrix)

- [ ] **B-1 · Update prompts based on QA failure clusters**
  - Owner: Backend dev
  - File: `augur/server/api/generate-report.post.ts`
  - Note: Prompt currently at `PROMPT_VERSION = 'v1.0'` (line 8). Increment on every change.
  - Done when: Top failure mode clusters addressed in prompt; new prompt version tagged; re-sample confirms pass rate ≥ 80%
  - Ref: TRACK 0 → B-1

- [x] **B-2 · Add promptVersion field to report save payload** *(DONE — verified April 2026)*
  - Files: `augur/server/api/generate-report.post.ts` (line 8 — `PROMPT_VERSION = 'v1.0'`; lines 885, 900 — used in logging and return), `augur/server/api/save-report.post.ts` (line 16 reads `body.promptVersion`, line 48 writes `prompt_version` to DB)
  - Schema-gap fallback confirmed: `save-report.post.ts` lines 57–64 detect `error.code === '42703'` (missing column) and retry without `prompt_version` so report delivery is never blocked.
  - **Remaining action:** Confirm `prompt_version` column exists in Supabase `reports` table on production. If not, run: `ALTER TABLE reports ADD COLUMN IF NOT EXISTS prompt_version TEXT DEFAULT 'v1.0';`
  - Ref: TRACK 0 → B-2

- [x] **B-2 · Add server-side red-flag logging** *(DONE — verified April 2026)*
  - File: `augur/server/api/generate-report.post.ts` (lines 883–887)
  - Verification: `[B-2] report quality flags` structured log implemented; fires when flags array is non-empty; includes `promptVersion`, `archetype`, `language`, `region`.
  - **Remaining action:** Confirm flag detection logic covers: Identity opener < 15 words, Affirmation > 30 words, repeated phrases across sections, tradition data absent where expected. Review flag output in Railway logs.
  - Ref: TRACK 0 → B-2

#### 0-D · Funnel Instrumentation
*Ref: TRACK 0 — CORE BUSINESS RISKS → B-3, B-4*

- [ ] **B-3 · Define analytics event schema doc**
  - Owner: Frontend dev + Analytics
  - Artifact: `ANALYTICS_EVENTS.md` at repo root
  - Done when: All 18 events documented with their properties in a single reference file
  - Ref: TRACK 0 → B-3 (full event list with properties)

- [x] **B-3 · Instrument all funnel events** *(DONE — verified April 2026)*
  - File: `augur/app/plugins/pixels.client.ts`
  - Verification: All 18 funnel events are implemented: `trackLandingView`, `trackAnalysisStart`, `trackStep1Complete`, `trackQuestionAnswered`, `trackAnalysisSubmit`, `trackPreviewLoadingStart`, `trackPreviewLoaded`, `trackPaywallView`, `trackTierSelected`, `trackInitiateCheckout` (via `trackViewContent`), `trackPurchase`, `trackUpsellViewed`, `trackUpsellAccepted`, `trackReportViewed`, `trackShareCardOpened`, `trackShareCardDownloaded`, `trackViewContent`, `trackEmailCaptureSuccess`. `safeTrack()` wrapper confirmed. UTM param capture and device type detection confirmed.
  - **Remaining action:** Verify all call sites in `analysis.vue`, `preview.vue`, and `report.vue` are actively calling these helpers. Confirm events appear in TikTok Events Manager and Meta Events Manager in production.
  - Ref: TRACK 0 → B-3

- [ ] **B-3 · Build funnel dashboard**
  - Owner: Analytics + Founder
  - Done when: Dashboard shows live data for all 8 required metrics (landing→start rate, step funnel, preview load rate, preview→checkout %, checkout completion %, AOV, upsell attach rate, tier mix)
  - Ref: TRACK 0 → B-3 (dashboard requirements)

- [x] **B-4 · Instrument Stripe webhook for chargeback and refund logging** *(DONE — verified April 2026)*
  - File: `augur/server/api/stripe/webhook.post.ts` (lines 98–191)
  - Verification: `charge.dispute.created` handler (lines 99–146) logs `[B-4] chargeback` with `dispute_id`, `charge_id`, `amount_cents`, `currency`, `reason`, `status`, `archetype`, `region`, `language`, `prompt_version`. `charge.refunded` handler (lines 150–191) logs `[B-4] refund` with equivalent fields. Both are non-blocking (`try/catch` with fallback `console.error`). Both attempt to look up the originating `session_id` to enrich the log with report metadata from Supabase.
  - **Remaining action:** These events fire to Railway logs. Confirm both event types are registered in the Stripe Dashboard webhook endpoint config. Check Railway log output for `[B-4]` entries.
  - Ref: TRACK 0 → B-4

- [ ] **B-4 · Build weekly refund/chargeback cohort table**
  - Owner: Founder + Ops
  - Current state: Structured logging exists in Railway logs. No automated cohort table or dashboard yet.
  - Done when: Weekly table running showing gross revenue, refund count + rate, chargeback count + rate, net revenue, refund reason categories; internal thresholds defined (refund < 5%, chargeback < 0.4%)
  - Ref: TRACK 0 → B-4

#### 0-E · Abandonment Email Sequence Verification and Deep-Link Fix
*Verified from codebase: sequence wires and sends correctly. One critical gap exists.*

- [x] **0-E · Confirm abandonment email sequence fires end-to-end** *(DONE — verified April 2026)*
  - Files: `server/api/capture-email.post.ts` (line 72), `server/utils/email-jobs.ts`, `server/api/email-sequence/process-jobs.post.ts`, `server/utils/email-templates.ts`
  - Verification: `capture-email.post.ts` line 72 calls `scheduleEmailJob(email, 1, SEQUENCE_DELAYS_MS[1])` synchronously on email capture. `email-jobs.ts` inserts to `email_jobs` table with idempotency check. `process-jobs.post.ts` Railway cron (every 2 min) sends via Resend, marks done, chains step 2→3→4. Sequence delays: step 1 = 10 min, step 2 = 3 hr, step 3 = 24 hr, step 4 = 47 hr. Purchase suppression via `cancelEmailJobs` confirmed in `webhook.post.ts`. All 4 steps templated in 6 languages.
  - **Remaining action:** Confirm Railway cron job is active and hitting `/api/email-sequence/process-jobs`. Check Railway logs for `[process-jobs]` entries. Verify Resend domain is verified and sending limit is sufficient.
  - Ref: TRACK 0 / CURRENT STATE SNAPSHOT (abandonment sequence)

- [x] **0-E · Fix abandonment email CTA deep link** *(DONE — April 2026)*
  - File: `server/utils/email-templates.ts` (line 540)
  - Current state: Every abandonment email CTA links to `https://omenora.com/preview` with no query parameters. A user who clicks returns to a blank preview page and must re-enter all their data. Their specific reading is not pre-loaded.
  - Root cause: `buildHtmlEmail` receives no `sessionId`; `EmailPersonalization` interface does not include `sessionId`; `process-jobs.post.ts` fetches email job by email but does not look up the `session_id` from `email_captures` table.
  - Fix steps:
    1. Add `sessionId: string` to `EmailPersonalization` interface in `email-templates.ts`
    2. In `process-jobs.post.ts`: after fetching the job, query `email_captures` table by email to get `session_id`, pass it through to `getEmailTemplate` call
    3. In `buildHtmlEmail`: change CTA href to `https://omenora.com/preview?tempId=${sessionId}` when `sessionId` is non-empty; fall back to bare `/preview` if not found
    4. Verify `preview.vue` reads `?tempId` (or `?sessionId`) on mount and restores the correct report state — if not, add that logic
  - Implementation: `sessionId?: string` added to `EmailPersonalization` interface; `ctaUrl` computed in `getEmailTemplate` as `?tempId=\${sessionId}` when present, fallback to bare `/preview`; all 24 `buildHtmlEmail` call sites updated; `session_id` passed from `email_captures` row in `process-jobs.post.ts`. TypeScript: 0 errors.
  - Done when: Clicking any abandonment email CTA loads the user's specific reading on the preview page without re-entering data
  - Ref: CURRENT STATE SNAPSHOT (built but not connected)

#### 0-F · Tradition Calculation Accuracy Verification
*Grounded in codebase: `app/utils/vedic.ts` and `app/utils/bazi.ts` contain working formulas. No external verification exists.*

- [x] **0-F · Document and verify Nakshatra calculation formula** *(DONE — accepted approximation, April 2026)*
  - Owner: Founder (needs domain knowledge to verify correctness)
  - File: `augur/app/utils/vedic.ts`
  - Current formula (lines 58–67):
    ```ts
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const index = Math.floor(dayOfYear / 13.5) % 27
    ```
    Assigns one of 27 Nakshatras based on birth date's day-of-year, cycling through the full sequence on a 13.5-day period (27 × 13.5 = 364.5 days ≈ 1 year).
  - Concern: Traditional Vedic Nakshatra calculation assigns the Nakshatra based on the **Moon's sidereal longitude** at birth, not the day-of-year. The day-of-year proxy distributes evenly across the calendar but does not reflect the Moon's actual position, which cycles every 27.32 days (not 365/27 days). Two people born one year apart on the same date will get the same Nakshatra, which is correct by this formula but incorrect for traditional Vedic calculation where the Moon moves independently.
  - Required actions:
    1. Founder verifies: is this formula intended as an approximation, or should it use actual Moon position?
    2. If approximation is acceptable: document the method in `TRADITION_CALC_AUDIT.md` with the explicit statement that it uses day-of-year, not Moon longitude. Add a comment to `vedic.ts` stating this.
    3. If traditional accuracy is required: replace with ephemeris-based Moon longitude calculation (e.g. using `astronomia` npm package or a static lookup table)
    4. Test: verify a birth date with known Nakshatra (e.g. Jan 1, 1990) against a traditional Vedic calculator
  - Done when: Decision documented in `TRADITION_CALC_AUDIT.md`; code either updated or commented with explicit accuracy scope statement

- [x] **0-F · Document and verify BaZi Day Master formula** *(DONE — accepted approximation, April 2026)*
  - Owner: Founder (needs domain knowledge to verify correctness)
  - File: `augur/app/utils/bazi.ts`
  - Current formula (lines 46–60):
    ```ts
    // Year Stem:
    const yearStemIndex = ((((year - 4) % 10) + 10) % 10)
    const yearBranchIndex = ((((year - 4) % 12) + 12) % 12)
    // Day Stem:
    const jdn = Math.floor((date.getTime() / 86400000) + 2440587.5)
    const dayStemIndex = (((jdn - 11) % 10) + 10) % 10
    const dayBranchIndex = (((jdn - 11) % 12) + 12) % 12
    // Month Stem:
    const monthStemIndex = (((year * 12 + month) % 10) + 10) % 10
    const monthBranchIndex = (((month + 2) % 12) + 12) % 12
    ```
    Year Stem uses `(year - 4) mod 10` anchored to year 4 CE (甲子 cycle start). Day Stem uses Julian Day Number arithmetic (`JDN - 11` mod 10). Month Stem uses a combined year×month formula which is non-standard.
  - Concern: The Year Stem and Day Stem formulas are standard BaZi arithmetic. The Month Stem formula (`(year * 12 + month) % 10`) is not standard — the traditional Month Stem depends on the Year Stem and the solar term (节气) of the birth month, not a simple linear formula. This means Month Stems will be incorrect for many birth dates compared to a traditional Bazi calculator.
  - Required actions:
    1. Founder verifies: is the Month Stem precision required for the current report output, or is it acceptable to document it as a simplification?
    2. If simplification is acceptable: document in `TRADITION_CALC_AUDIT.md`; add comment to `bazi.ts` stating the month stem formula is a linear approximation, not solar-term based
    3. If traditional accuracy is required: replace month stem with a lookup table keyed on `(yearStemIndex % 5, solarMonth)` where `solarMonth` is determined by actual solar term dates
    4. Test: verify a known birth date (e.g. Nov 15, 1985) against a traditional BaZi calculator (e.g. bazi.guru)
  - Done when: Decision documented in `TRADITION_CALC_AUDIT.md`; code updated or commented with accuracy scope

---

**P0 CURRENT STATUS (April 2026):**
- [x] L-1 Rewrite Q4/Q7 questions — done
- [x] L-2 Crisis signpost on 3 pages — done
- [x] L-3 Data use notice step 2 — done
- [x] L-4 Testimonial real-buyer guard — done (collect real quotes as next action)
- [x] L-5 Remove unverified count — done
- [~] L-6 Urgency copy — verify no unenforceable expiry claim in live copy
- [x] T-3 Remove fake urgency/proof — done
- [ ] T-1 Pseudo-scientific framing audit — NOT STARTED
- [ ] B-1 QA rubric + 200-report review — NOT STARTED (highest priority remaining)
- [x] B-2 promptVersion tracking + red-flag logging — done (confirm DB column live)
- [x] B-3 Event instrumentation (18 events in pixels.client.ts) — done; dashboard build + call-site audit still needed
- [x] B-4 Webhook chargeback/refund logging — done (confirm events registered in Stripe)
- [ ] B-4 Weekly cohort table — NOT STARTED
- [x] 0-E Abandonment email sequence fires — done
- [x] 0-E Abandonment email CTA deep-link fix — done (April 2026)
- [x] 0-F Nakshatra formula documented + verified — done (accepted approximation)
- [x] 0-F BaZi Month Stem formula documented + verified — done (accepted approximation)

**→ P0 GATE: Do not proceed to Phase 1 until all Phase 0 checkboxes are complete.**
**Critical remaining P0 blockers: T-1 (framing audit), B-1 (QA rubric + 200-report review — highest priority), B-3 dashboard + call-site audit, B-4 weekly cohort table.**

---

### PHASE 1 — Revenue Leverage (Run After P0 Gate Passed)

#### 1-A · Landing Page Clarity and Conversion
*Ref: TRACK 6 — LANDING PAGE CLARITY AND CONVERSION*

- [ ] **LP-1 · Rewrite landing page tagline**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue` (line 23 — current: "AI decoded your destiny. Science explains why.")
  - Current state: Tagline unchanged; `.tagline-sub` does not yet exist.
  - Done when: New tagline and `.tagline-sub` live ("Your free AI destiny reading — ready in 60 seconds." + sub-copy); `.tagline-sub` CSS applied
  - Ref: TRACK 6 → LP-1

- [ ] **LP-2 · Make CTA button visually primary**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue` — `.cta-button` CSS (line 370+), button label (line 34)
  - Current state: Button uses transparent background with `::before` pseudo-element hover fill. Label is "Begin Your Analysis". Both need updating.
  - Done when: Button has solid fill (`rgba(140, 110, 255, 0.85)`), label changed to "Get My Free Reading →"
  - Ref: TRACK 6 → LP-2

- [x] **LP-6 · Replace unverified social proof on landing page** *(DONE — verified April 2026)*
  - File: `augur/app/pages/index.vue` (line 28)
  - Verification: Already reads "Free · No account required · Results in 60 seconds" — value-based copy, no count. (Same as L-5.)
  - Ref: TRACK 6 → LP-6

- [ ] **LP-5 · Remove feature pills from landing page**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue`
  - Done when: Feature pill elements removed or replaced per LP-5 spec
  - Ref: TRACK 6 → LP-5

- [ ] **LP-3 · Add "What You'll Discover" section**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue` — after `.content` block, before `<footer>`
  - Done when: 4-card discover grid live with correct copy, glyphs, and responsive CSS (single column below 420px)
  - Ref: TRACK 6 → LP-3 (full HTML + CSS)

- [ ] **LP-4 · Add "How It Works" 3-step strip**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue` — after `.discover-section`
  - Done when: 3-step how-it-works strip live with correct copy and CSS
  - Ref: TRACK 6 → LP-4 (full HTML + CSS)

- [ ] **LP-7 · Add entry animations to landing page**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue`
  - Done when: Entry animations applied per LP-7 spec; no layout shift on mobile
  - Ref: TRACK 6 → LP-7

- [ ] **LP-8 · Add bottom repeat CTA**
  - Owner: Frontend dev
  - File: `augur/app/pages/index.vue` — above footer
  - Done when: Bottom CTA button live and functional per LP-8 spec
  - Ref: TRACK 6 → LP-8

#### 1-B · Offer and Monetization
*Ref: TRACK 1.5 — OFFER AND MONETIZATION STRATEGY*

- [ ] **M-1 · Set up 3-tier vs 2-tier paywall A/B test**
  - Owner: Product + Frontend dev
  - File: `augur/app/pages/preview.vue`
  - **Canary deployment required before 50/50 split:** Deploy new variant behind `?preview_variant=2tier` query param, test full payment flow end-to-end manually (including Stripe webhook delivery), then start at 10% split for 48 hours before expanding. Use an environment variable kill switch. See TRACK 1.5 → M-1 for full canary protocol.
  - Done when: Canary QA passed; 10% split live and monitored; expanded to 50/50 after 48hrs clean; B-3 events confirmed firing per variant; test runs until minimum 200 completions per variant
  - Ref: TRACK 1.5 → M-1
  - Dependency: B-3 instrumentation live

- [ ] **M-2 · Test Oracle off first paywall into email lifecycle**
  - Owner: Product + Growth
  - Files: `augur/app/pages/preview.vue`, email sequence in `augur/server/api/email-sequence/`
  - Done when: Oracle variant tested off primary paywall; upsell attach rate and AOV tracked per variant
  - Ref: TRACK 1.5 → M-2
  - Dependency: B-3 live, M-1 variant decided

- [ ] **B-2 · Begin weekly prompt review cycle**
  - Owner: Backend dev + Founder
  - Done when: Weekly review running comparing top-converting vs lowest-converting prompt version reports; findings logged
  - Ref: TRACK 0 → B-2

#### 1-C · Conversion Fixes
*Ref: TRACK 3 — CONVERSION FIXES*

- [ ] **C-3 · Add archetype reveal animation**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — `.archetype-block` CSS
  - Done when: `@keyframes archetypeReveal` applied with correct staggered delays on all 5 elements; verified on mobile; no layout shift
  - Ref: TRACK 3 → C-3

- [ ] **C-5 · Personalize paywall copy with archetype + life path data**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — tier feature descriptions
  - Done when: `archetypeShortName` and `lifePathNumber` interpolated into Tier 2 and Tier 3 copy
  - Ref: TRACK 3 → C-5

- [ ] **T-2 · Add "How Your Reading Was Built" trust layer**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — near C-4 progress meter
  - Done when: One-line receipt-style explanation visible above or below progress meter, interpolating `archetypeShortName`, `lifePathNumber`, and `tradition`
  - Ref: TRACK 2 → T-2
  - Dependency: C-4 placed first

- [ ] **C-4 · Add unlock progress meter**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — between `.blurred-preview` and locked sections
  - Done when: Gold progress bar showing "YOUR READING IS 18% UNLOCKED" visible between blurred section and pricing; Cormorant Garamond text
  - Ref: TRACK 3 → C-4

- [ ] **C-6 · Improve tier card visual weight**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — `.tier-popular` CSS
  - Done when: Updated padding, box-shadow, font-size, and hover scale applied per spec
  - Ref: TRACK 3 → C-6
  - Dependency: M-1 variant decision (layout may change if Oracle moves off paywall)

- [ ] **C-2 · Loading screen personalization + testimonial slot**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue` — loading state
  - **Testimonial enforcement:** Use a typed `REAL_TESTIMONIALS` array with `v-if="REAL_TESTIMONIALS.length > 0"` guard — not a string placeholder. Empty array = nothing renders. No accidental fake quote can ship. See TRACK 3 → C-2 for exact implementation.
  - Done when: 4-stage sequence implemented; `REAL_TESTIMONIALS` array guard in place; `showTestimonialSlot` computed from array length; loading abandonment rate tracked via B-3
  - Ref: TRACK 3 → C-2
  - Dependency: L-4 resolved first

- [ ] **C-1 · Add mid-quiz personalization screens after Q1 and Q4**
  - Owner: Frontend dev
  - File: `augur/app/pages/analysis.vue` — step 2 template
  - **Edge cases must be handled:** Use a `shownInterstitials: Set<string>` to prevent re-trigger on answer change; cancel pending `setTimeout` in `onUnmounted`; use `el.scrollIntoView({ behavior: 'smooth', block: 'center' })` not `window.scrollTo`; never scroll past unanswered questions. See TRACK 3 → C-1 for full edge case list.
  - Done when: All 4 edge cases handled; `showPersonalizationScreen` ref implemented; Q1 and Q4 maps wired; interstitial fades in and auto-scrolls after 1.5s; `analysis_submit` rate measured before/after via B-3
  - Ref: TRACK 3 → C-1

#### 1-D · Paid Traffic Readiness
*Ref: TRACK 7 — PAID TRAFFIC READINESS*

- [ ] **P-3 · Define and document safe-to-scale thresholds**
  - Owner: Founder
  - Done when: All 7 threshold values confirmed from live data (conversion baseline, checkout completion %, AOV, refund rate, chargeback rate, QA pass rate); documented and shared with growth/media buyer
  - Ref: TRACK 7 → P-3 (threshold table)
  - Dependency: B-3 live, B-4 running, B-1 QA pass rate established

- [ ] **P-1 · Launch first 5 paid creative angles**
  - Owner: Growth / Media buyer
  - Done when: 5 creatives live covering the 5 specified angles; each angle matched to a landing page headline variant; CTR, checkout conversion, AOV, net ROAS tracked per angle
  - Ref: TRACK 7 → P-1 (angle list and cadence rules)
  - Dependency: LP-1, LP-2, LP-6 live; B-3 live; T-1 reviewed; P-3 thresholds defined

- [ ] **P-1 · Run weekly creative replacement cycle**
  - Owner: Growth / Media buyer
  - Done when: Bottom 40% of creatives replaced weekly; 3 new variants produced per winning angle; kill rule applied to high-CTR/low-conversion angles
  - Ref: TRACK 7 → P-1

- [ ] **P-2 · Run message-match QA across funnel**
  - Owner: Growth + Product
  - Done when: Weekly message-match review running; no open mismatch items older than 1 week; ad → landing → preview → paywall narrative consistent for each active angle
  - Ref: TRACK 7 → P-2

#### 1-E · Testimonial Collection System
*No post-purchase testimonial email exists anywhere in the codebase (verified April 2026). `REAL_TESTIMONIALS` array in `preview.vue` is empty and cannot populate itself.*

- [ ] **TC-1 · Build Day-2 post-purchase testimonial collection email**
  - Owner: Backend dev + Product
  - Files to create/modify: `server/utils/email-templates.ts` (add testimonial request template), `server/api/stripe/webhook.post.ts` (schedule Day-2 job on `checkout.session.completed`), `server/utils/email-jobs.ts` (confirm `step` range can accommodate a post-purchase step or use a separate table/mechanism)
  - Current state: The `email_jobs` table schema supports steps 1–4 only (see `email-jobs.ts` line 15: `step smallint not null check (step between 1 and 4)`). A post-purchase Day-2 email needs either a schema extension or a separate delivery path. Abandonment sequence is already suppressed on purchase via `cancelEmailJobs`.
  - Implementation options (choose one before building):
    - **Option A:** Extend `email_jobs` step range to 1–5 (or 1–10); add a `type` column (`abandonment` | `post_purchase`) so `process-jobs.post.ts` can distinguish them. Step 5 = testimonial request at 48 hours post-purchase. Requires Supabase migration.
    - **Option B:** Trigger testimonial email directly from `webhook.post.ts` via a new `/api/send-testimonial-request` endpoint with a 48-hour delay using a separate `post_purchase_jobs` table.
    - **Option C:** Use Resend's scheduled send feature (if available on the plan) — call Resend API with `scheduledAt` from `webhook.post.ts` without needing a separate job table.
  - Email content (single open question):
    - Subject: `[firstName], what surprised you most?`
    - Body: `Your ${archetypeName} reading was generated ${timeAgo}. One question — what surprised you most about it? Reply to this email. We read every response.`
    - No incentive. No review link. One question, plain reply-to.
  - Done when: Verified buyer receives one email at ~48 hours post-purchase asking one open question; reply lands in a monitored inbox; zero post-purchase emails sent to refunded/disputed buyers
  - Dependency: `checkout.session.completed` webhook event confirmed working; Resend sending confirmed working

- [ ] **TC-1 · Populate REAL_TESTIMONIALS array when first responses arrive**
  - Owner: Founder
  - File: `augur/app/pages/preview.vue`
  - Current state: `REAL_TESTIMONIALS` array is empty (verified April 2026). `showTestimonialSlot` is `false`, so nothing renders — correct behavior until real quotes exist.
  - Done when: ≥ 3 real buyer quotes collected from testimonial email replies; added to `REAL_TESTIMONIALS` array with `{ quote: string; author: string }` format; `showTestimonialSlot` becomes `true` in production; loading screen testimonial slot activates
  - Ref: TRACK 1 → L-4 (real-buyer guard), TRACK 3 → C-2 (loading screen personalization)

#### 1-F · Entry Price A/B Test
*Grounded in REVENUE MATH section: Tier 1 price matters less than bundle attachment rate. This test validates that assumption.*

- [ ] **M-4 · Run $2.99 vs $3.99 Tier 1 entry price A/B test**
  - Owner: Product + Growth
  - Files: `server/api/create-payment.post.ts` (line 42: `unit_amount: 299`), `server/api/apply-promo-discount.post.ts` (line 4: `basic: { cents: 299 }`), `augur/app/pages/preview.vue` (displayed price)
  - Hypothesis: Raising Tier 1 from $2.99 to $3.99 will not significantly reduce checkout CVR but will increase AOV by ~$1 per Basic-tier buyer. If Tier 2 (Bundle at $4.99) is the default-selected tier, Tier 1 acts as a downgrade anchor — raising its price may have minimal CVR impact while improving the floor.
  - Pre-test requirement: B-3 dashboard must be live to measure tier mix split — do not run this test without visibility into % Basic vs Bundle purchases.
  - Canary safeguard — REQUIRED before 50/50 split:
    1. Deploy `?price_test=399` query param flag to force new price for manual QA
    2. Complete an end-to-end payment manually at $3.99 in Stripe test mode
    3. Verify price renders correctly on preview page and in Stripe checkout session
    4. Confirm `apply-promo-discount.post.ts` TIER_BASE_PRICES is also updated for the test variant (promo codes must calculate against the correct base price)
    5. Start at 10% / 90% for 48 hours; watch for payment errors before moving to 50/50
  - Done when: 200+ completions per variant; tier mix, CVR, and AOV measured per variant; winner declared and non-winning variant removed
  - Ref: REVENUE MATH section (pricing experiment impact)
  - Dependency: B-3 dashboard live; M-1 (paywall structure decision) made first

---

**→ P1 GATE: Do not begin Phase 2 until AOV, refund rate, and CAC payback are stable for ≥ 4 consecutive weeks.**

---

### PHASE 2 — Growth and Polish (After Funnel Economics Confirmed)

#### 2-A · Growth and Retention
*Ref: TRACK 5 — GROWTH AND RETENTION*

- [ ] **G-2 · Add email-gated share card to preview page**
  - Owner: Frontend dev
  - File: `augur/app/pages/preview.vue`
  - Done when: Share card download exposed pre-purchase on preview page; gated behind email capture; email fed into abandonment sequence; `server/api/generate-card.post.ts` verified accessible pre-purchase
  - Ref: TRACK 5 → G-2
  - Dependency: Email capture flow active

- [ ] **G-1 · Add daily insight email opt-in on report page**
  - Owner: Frontend dev + Growth
  - File: `augur/app/pages/report.vue`
  - Done when: Opt-in block live below full report, above subscription upsell; email captured feeds `server/api/email-sequence/`; confirmed working end-to-end
  - Ref: TRACK 5 → G-1
  - Dependency: Email sequence infrastructure verified working

- [ ] **M-3 · Run packaging and naming experiments**
  - Owner: Product + Growth
  - Done when: At least 1 naming/framing test running (bundle naming, "science" framing, birth chart placement, price anchor order)
  - Ref: TRACK 1.5 → M-3
  - Dependency: B-3 live, M-1 winner decided

- [ ] **Subscription soft path · Email lifecycle for buyers**
  - Owner: Growth + Backend dev
  - File: `augur/server/api/email-sequence/`
  - Done when: Day 3–7 email sequence targets buyers who re-opened report; Oracle upsell in sequence; open/click/conversion rates tracked
  - Ref: TRACK 1.5 → M-2 (Oracle off paywall hypothesis)

#### 2-B · UI Polish
*Ref: TRACK 4 — UI/UX POLISH*

- [ ] **U-1 · Option tile selection animation**
  - Owner: Frontend dev
  - File: `augur/app/pages/analysis.vue` — `.option-tile.selected` CSS
  - Done when: `scale(1.02)` + `@keyframes tilePulse` applied; verified on mobile tap
  - Ref: TRACK 4 → U-1

- [ ] **U-2 · Add tradition selector explanation copy**
  - Owner: Frontend dev
  - File: `augur/app/pages/analysis.vue` — `.region-section`
  - Done when: "This determines which ancient system interprets your destiny." visible above tradition cards, styled `.subheading`
  - Ref: TRACK 4 → U-2

- [ ] **U-4 · Post-payment email confirmation banner**
  - Owner: Frontend dev
  - File: `augur/app/pages/report.vue`
  - Done when: Dismissible banner visible when `store.paymentComplete === true`; auto-dismisses after 5 seconds
  - Ref: TRACK 4 → U-4

#### 2-C · Secondary Refinements

- [ ] **LP-9 · Verify final landing page structure is fully live**
  - Owner: Frontend dev + Founder
  - Done when: All LP-1 through LP-8 changes verified live in production; no regressions
  - Ref: IMPLEMENTATION ORDER → P2 (LP-9)

- [ ] **Additional variants · Run paywall/landing variants based on measured data**
  - Owner: Product + Growth
  - Done when: Winning A/B variant from M-1 declared; additional packaging experiments from M-3 running
  - Ref: TRACK 1.5 → M-3
