# OMENORA — Application Technical Specification
**Version:** 1.0  
**Date:** April 2026  
**Purpose:** Planning team reference document. To be read alongside `IMPROVEMENT_PLAN.md`.

---

## 1. WHAT OMENORA IS

OMENORA is a **web-based AI astrology and numerology SaaS** that generates a fully personalized destiny report for each user in real time. The product is a **one-time-payment funnel** with optional upsells — not a subscription by default. Revenue is generated at a paywall shown immediately after the free report preview is generated.

**Core value proposition:** A user enters their birth information and answers 7 behavioral questions. In ~10 seconds, the app calculates their Destiny Archetype and Life Path Number locally (no AI needed), then sends that profile to Claude AI which generates a ~2,000-word personalized report structured into 7 sections. The user sees a preview (2 sections visible, 5 locked) and is asked to pay to unlock the full reading.

**Technology stack:**
- **Framework:** Nuxt 3 (Vue 3, SSR-capable, deployed on Railway)
- **State management:** Pinia (`analysisStore`)
- **AI model:** Anthropic Claude (`claude-sonnet-4-5`) via `@anthropic-ai/sdk`
- **Payments:** Stripe (Checkout Sessions)
- **Database:** Supabase (report persistence, email records)
- **Email delivery:** Custom email builder (`report-email-builder.ts`, `email-templates.ts`)
- **Analytics / pixels:** Meta Pixel, custom pixel plugin (`plugins/pixels.client.ts`)
- **Languages supported:** English, Spanish, Portuguese, Hindi, Korean, Simplified Chinese
- **Deployment:** Railway (via `railway.json`, `nixpacks.toml`)

---

## 2. USER JOURNEY — END TO END

```
Landing Page (/)
    ↓  Click "Begin Your Analysis"
Analysis Page (/analysis)
    Step 1: Birth info (name, date of birth, city, optional time of birth)
    Step 2: 7 behavioral questions + region/tradition selector
    ↓  Submit
Preview Page (/preview)   ← AI report generated here
    Loading screen (~8–10 seconds while Claude generates)
    Report preview (2 of 7 sections visible)
    Paywall — 3 pricing tiers
    Email capture (required before payment)
    ↓  Pay via Stripe
    ↓  Stripe webhook fires → full report generated + saved + email sent
Report Page (/report)     ← Full 7-section reading
    Impulse upsell: Compatibility reading ($0.99) shown during loading
    Full report rendered
    Optional upsells: Calendar, Birth Chart, Tradition Switch
```

**Additional pages:**
- `/calendar` — 12-month destiny calendar (upsell)
- `/compatibility` — Partner compatibility reading (upsell)
- `/subscription` — Monthly subscription management
- `/terms`, `/privacy` — Legal pages

---

## 3. STEP 1 — DATA COLLECTION (analysis.vue, Step 1)

The user enters:

| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | text | Yes | Max 50 chars, stored in Pinia |
| `dateOfBirth` | date | Yes | Format: `YYYY-MM-DD`, entered via scroll-wheel drums |
| `city` | text | Yes | City of birth, max 100 chars |
| `timeOfBirth` | time | No | Format: `HH:MM AM/PM`, optional — influences AI prompt |

**Date input mechanism:** Apple-style scroll-wheel drums with GPU-accelerated `translateY` animation. Built from scratch — no library. Uses `requestAnimationFrame` momentum physics (deceleration constant `0.998/ms`, matching Apple UIScrollView). Supports pointer drag, momentum throw, click-to-select, and trackpad/mouse wheel. Three separate drums for day / month / year; three more for hour / minute / AM-PM.

**Region auto-detection:** On step 1 load, the app calls `/api/detect-region` which geo-locates the user's IP via `ipapi.co` (with `ip-api.com` fallback) and sets a default tradition (`western`, `india`, `china`, `latam`, `korea`, `middleeast`) and UI language. The user can override both manually.

---

## 4. STEP 2 — BEHAVIORAL QUESTIONNAIRE (analysis.vue, Step 2)

7 multiple-choice questions with 4 options each. All questions are framed as introspective / self-knowledge prompts — no question references medical conditions or diagnoses. Answers are stored in `store.answers` as semantic value strings (not display labels).

| Question ID | Semantic theme | Answer values |
|---|---|---|
| q1 | Decision instinct — how user responds to something being wrong | `trust`, `wait`, `talk`, `push` |
| q2 | Hidden self — what people don't see about the user | `softer`, `sharper`, `ambitious`, `lost` |
| q3 | Deepest relationship wound | `leaving`, `unseen`, `giving`, `burden` |
| q4 | Recurring shadow thought | `capable`, `alone`, `matters`, `toomuch` |
| q5 | Complicated label others apply | `strong`, `reliable`, `intense`, `independent` |
| q6 | Response to receiving good things | `enjoy`, `wonder`, `share`, `next` |
| q7 | Most feared version of self | `givesup`, `feelsnothing`, `needstoo`, `pushesaway` |

**Translations:** All question text and option labels are defined in `app/utils/translations.ts` in all 6 supported languages. The display text is looked up via the `t()` function from `useLanguage` composable. The semantic answer values (above) are language-independent and are what get stored and sent to the API.

---

## 5. LOCAL COMPUTATION — ARCHETYPE & LIFE PATH (client-side, before any API call)

After the user submits the questionnaire, two calculations run **entirely in the browser** — no server call needed:

### 5.1 Life Path Number (`app/utils/lifePathNumber.ts`)

Standard numerology reduction of the birth date:
```
1. Concatenate all digits of YYYY-MM-DD
2. Sum all digits
3. Reduce to single digit by repeated digit-sum
4. EXCEPTION: preserve 11, 22, 33 as master numbers (not reduced further)
```
Example: `1990-06-15` → `1+9+9+0+0+6+1+5 = 31` → `3+1 = 4` → Life Path **4**

### 5.2 Destiny Archetype (`app/utils/archetypes.ts`)

A weighted scoring engine maps the 7 answers to 1 of 12 archetypes:

**12 Archetypes:**

| ID | Display name | Symbol | Element |
|---|---|---|---|
| `phoenix` | The Phoenix | ● | Fire |
| `architect` | The Silent Architect | ◆ | Earth |
| `storm` | The Storm Caller | ▲ | Air |
| `lighthouse` | The Lighthouse | ◇ | Water |
| `wanderer` | The Wanderer | ○ | Air |
| `alchemist` | The Alchemist | ⬡ | Fire |
| `guardian` | The Guardian | □ | Earth |
| `visionary` | The Visionary | ⬟ | Fire |
| `mirror` | The Mirror | ◉ | Water |
| `catalyst` | The Catalyst | ✦ | Air |
| `sage` | The Sage | ▽ | Earth |
| `wildfire` | The Wildfire | ★ | Fire |

**Scoring mechanism:**
- A 7×4 scoring matrix (`MATRIX` in `archetypes.ts`) maps each `[questionId][answerValue]` to a set of archetypes with point weights: 3 = primary match, 2 = secondary, 1 = tertiary
- All 12 archetype scores are initialized to 0
- Each answer adds its weights to the running totals
- The archetype with the highest total score wins
- **Tiebreaker:** If two archetypes tie, `q5` answer determines the winner via a fixed `TIEBREAKER` map (`strong→guardian`, `reliable→lighthouse`, `intense→phoenix`, `independent→visionary`)
- **Default fallback:** `wildfire` (if all scores are 0)
- All 12 archetypes are reachable. Distribution verified via simulation (verified answer sets documented in `archetypes.ts` comment header)

Both values are stored in Pinia: `store.archetype` (string ID) and `store.lifePathNumber` (integer). The user is then navigated to `/preview`.

---

## 6. AI REPORT GENERATION — SERVER PIPELINE (`/api/generate-report`)

### 6.1 Inputs validated on the server

| Input | Validation |
|---|---|
| `firstName` | String, max 50 chars |
| `dateOfBirth` | String `YYYY-MM-DD`, valid date |
| `city` | String, max 100 chars |
| `archetype` | Must be one of 12 valid IDs |
| `lifePathNumber` | Must be in `{1-9, 11, 22, 33}` |
| `answers` | Each question whitelisted against valid enum values |
| `region` | Must be one of 6 valid tradition IDs |
| `language` | String, max 5 chars |

### 6.2 Tradition framework computation (server-side)

Before calling Claude, the server computes tradition-specific data from the birth date:

**Vedic (`india`):**
- Nakshatra (lunar mansion) — derived from birth day-of-year: `dayOfYear / 13.5 % 27`
- Ruling planet — mapped from Life Path Number via `VEDIC_PLANETS`
- Current Vimshottari Dasha period — 120-year cycle calculation from birth date to today
- Rahu/Ketu axis — karmic direction mapped from Life Path Number

**BaZi / Four Pillars (`china`):**
- Year, Month, Day Heavenly Stem and Earthly Branch — derived from birth date arithmetic
- Day Master (core identity element)
- Dominant element balance across the 3 calculated pillars
- Current Luck Pillar phase referenced in the forecast

**Tarot (`latam`):**
- Soul Card — fixed mapping from archetype ID to Major Arcana card
- 2026 Personal Year Card — calculated: `(birth day + birth month + 2+0+2+6)`, reduced to 0–21

**Korean (`korea`):** Pure personality/behavioral psychology framing — no calculated data

**Middle East (`middleeast`):** Destiny/fate language framing — no calculated data

**Western (default):** Jungian psychology + behavioral science framing — no calculated data

If any tradition calculation fails, the server silently falls back to western framing and sets `traditionFallback: true` in the response.

### 6.3 Answer interpretation

Each of the 7 answers is translated into a natural language descriptor for the prompt:

| Answer dimension | Used in prompt as |
|---|---|
| q1 | `decisionPattern` — e.g. "acts on gut instinct" |
| q2 | `hiddenSelf` — e.g. "softer than perceived" |
| q3 | `relationshipWound` — e.g. "giving more than received" |
| q4 | `coreThought` — e.g. "fear of ending up alone" |
| q5 | Used verbatim as the label others apply |
| q6 | `successResponse` — e.g. "always looking toward the next horizon" |
| q7 | `shadowFear` — e.g. "achieving everything and feeling nothing" |

### 6.4 The prompt structure

The Claude prompt is assembled in this order:

1. **Language instruction** — tells Claude which language to respond in
2. **Voice directive** — "precise, not warm. Direct, not harsh. The goal is to make the user feel seen, not feel good."
3. **User profile block** — all computed inputs (archetype description, life path, birth context, 7 interpreted answers)
4. **Tradition framework block** — the tradition-specific data and section-by-section instructions
5. **Writing rules** — 10 rules covering sentence length (≤20 words), name placement, contrast sentence structure, wound reframing, etc.
6. **Forbidden phrases list** — ~20 specific banned phrases and constructions
7. **Section instructions** — detailed per-section guidance for all 7 sections
8. **JSON output schema** — exact structure Claude must return

### 6.5 Claude API call

- **Model:** `claude-sonnet-4-5`
- **Max tokens:** 4,096
- **Output format:** Structured JSON via `jsonSchemaOutputFormat` (Anthropic structured outputs SDK)
- **Retry policy:** `withAiRetry` — 3 attempts max, exponential backoff (1s → 3s), retries only on 5xx / network errors; never retries on 401, 403, 400, 429
- **Schema validation:** After structured output returns, Zod validates the full response against `ReportSchema`

### 6.6 Output structure (the report object)

```json
{
  "archetypeName": "The [Name]",
  "archetypeSymbol": "[single char]",
  "element": "Fire | Earth | Air | Water",
  "powerTraits": ["verb phrase 1", "verb phrase 2", "verb phrase 3"],
  "sections": {
    "identity":    { "title": "Who You Are",           "content": "..." },
    "science":     { "title": "The Science Behind You","content": "..." },
    "forecast":    { "title": "Your 2026 Destiny",     "content": "..." },
    "love":        { "title": "Love & Connection",     "content": "..." },
    "purpose":     { "title": "Career & Purpose",      "content": "..." },
    "gift":        { "title": "Your Hidden Gift",      "content": "..." },
    "affirmation": { "title": "Your Power Statement",  "content": "..." }
  }
}
```

The canonical archetype symbol is **always overridden** after Claude's response to ensure the symbol matches the character set supported by the card renderer.

---

## 7. REPORT PERSISTENCE (`/api/save-report`)

Immediately after the AI report is generated, the preview page calls `/api/save-report` with:
- A `tempId` (`temp_{timestamp}_{firstName}`)
- The full report object
- User metadata (name, archetype, life path, answers, city, DOB, region, email if captured)

This is a **fire-and-forget** save — failure is silently caught and does not block the UI. The report is used later by the Stripe webhook to retrieve the session and generate the final paid report.

---

## 8. PAYWALL — PRICING & TIERS (`preview.vue`)

The paywall is displayed after the report preview renders. Three tiers are offered:

| Tier | Label | Price | API endpoint | Includes |
|---|---|---|---|---|
| 1 | Basic | $2.99 | `/api/create-payment` | Full reading only |
| 2 | Most Popular | $4.99 | `/api/create-bundle-payment` | Full reading + 2026 calendar + 1 compatibility |
| 3 | Full Oracle | $12.99 | `/api/create-oracle-payment` | Everything + birth chart + all traditions + subscription |

**Default selected tier:** Tier 2 (`selectedTier = ref(2)`)

**Payment flow:**
1. User enters email (required) — on blur, email is silently captured to `/api/capture-email` for abandonment sequences
2. User selects tier and clicks unlock
3. `handlePayment()` calls the appropriate Stripe endpoint
4. Server creates a Stripe Checkout Session with the user's metadata in `metadata` fields
5. User is redirected to Stripe's hosted checkout page
6. On success, Stripe webhook fires `checkout.session.completed`
7. Webhook: retrieves saved report, generates full paid content (calendar if bundle, birth chart if oracle), sends report email, marks payment complete
8. User is redirected to `/report`

**Promo code system:**
- `/api/validate-promo` — validates code, returns `codeType`, `codeSubtype`, `discountValue`, `accessTier`
- Two code types: `discount_percent` (routes through `/api/apply-promo-discount` → discounted Stripe session) and free access (routes through `/api/apply-promo-access` → bypasses Stripe entirely)
- Applied promo stored in `appliedPromo` ref, shown as UI confirmation

**Pixel tracking:**
- `ViewContent` fires when the preview report renders
- `InitiateCheckout` fires when the user clicks unlock

---

## 9. FULL REPORT PAGE (`report.vue`)

**Loading state:** While the report is being retrieved from Supabase after Stripe redirect, a loading screen with the orbital animation is shown. An **impulse upsell** is displayed during this loading window — a compatibility reading for $0.99 (normally $2.99), available "only while loading." The user can enter a partner's name and date of birth to add it.

**Report display:** After load, the full 7-section report renders sequentially. Each section has a title and multi-paragraph content block.

**Report header:**
- Destiny Archetype name + symbol
- Element + Life Path Number
- 3 power traits (verb phrases, not adjectives)

**Visible sections in the free preview (preview.vue):**
- Identity ("Who You Are") — always visible
- Science ("The Science Behind You") — always visible
- Sections 3–7 are locked behind the paywall

---

## 10. EMAIL SYSTEM

Multiple email triggers exist:

| Trigger | Handler | Content |
|---|---|---|
| Email entered on paywall (no purchase) | `capture-email.post.ts` | Stored; triggers abandonment sequence |
| Purchase completed (Stripe webhook) | `send-report-email.post.ts` | Full HTML report email |
| Calendar purchased | `send-calendar-email.post.ts` | Calendar PDF attachment |
| Compatibility purchased | `send-compatibility-email.post.ts` | Compatibility reading |
| Daily insight (subscription) | `send-daily-insight.post.ts` | Daily archetype insight |
| Abandonment sequence | `email-sequence/` | Timed re-engagement emails |

Email HTML is assembled by `report-email-builder.ts` using templates from `email-templates.ts`.

---

## 11. ADDITIONAL AI GENERATION ENDPOINTS

Beyond the core report, the following secondary AI generation endpoints exist:

| Endpoint | Trigger | Output |
|---|---|---|
| `/api/generate-calendar` | Bundle purchase | 12-month destiny calendar with monthly themes, energy levels, lucky days |
| `/api/generate-compatibility` | Compatibility purchase | Partner compatibility reading |
| `/api/generate-birth-chart` | Oracle purchase | Western astrological birth chart interpretation |
| `/api/generate-vedic-section` | Tradition switch (india) | Vedic-specific additional section |
| `/api/generate-bazi-section` | Tradition switch (china) | BaZi-specific additional section |
| `/api/generate-tarot-section` | Tradition switch (latam) | Tarot-specific additional section |
| `/api/generate-daily-insight` | Subscription / daily job | Personalized daily insight for subscribed users |
| `/api/generate-card` | Share card request | Visual archetype card for social sharing |

All secondary generation endpoints follow the same pattern: Anthropic Claude call → Zod schema validation → Supabase persistence.

---

## 12. PINIA STATE — FULL STATE SHAPE

All user session data lives in `useAnalysisStore` (Pinia), persisted to `localStorage` via `store-persist.client.ts`:

| State field | Type | Description |
|---|---|---|
| `firstName` | string | User's first name |
| `dateOfBirth` | string | `YYYY-MM-DD` |
| `city` | string | City of birth |
| `timeOfBirth` | string | `HH:MM AM/PM` (optional) |
| `answers` | object | `{q1..q7}` semantic values |
| `archetype` | string | Archetype ID (e.g. `phoenix`) |
| `lifePathNumber` | number | 1–9, 11, 22, or 33 |
| `report` | object | Full Claude report object |
| `tempId` | string | Temp session ID for report retrieval |
| `email` | string | User's email |
| `paymentComplete` | boolean | True after Stripe success |
| `reportSessionId` | string | Supabase session ID post-payment |
| `region` | string | Tradition (`western`, `india`, etc.) |
| `country` | string | ISO country code from geo-detection |
| `language` | string | UI language code |
| `regionManualOverride` | boolean | True if user selected region manually |
| `languageManualOverride` | boolean | True if user selected language manually |
| `calendarPurchased` | boolean | |
| `bundlePurchased` | boolean | |
| `oraclePurchased` | boolean | |
| `birthChartPurchased` | boolean | |
| `subscriptionActive` | boolean | |
| `calendarData` | object | Calendar AI output |
| `vedicData` | object | Vedic section AI output |
| `baziData` | object | BaZi section AI output |
| `tarotData` | object | Tarot section AI output |
| `birthChartData` | object | Birth chart AI output |
| `partnerName/Dob/City` | string | Compatibility input |

---

## 13. LEGAL FRAMEWORK (current state)

| Item | Current implementation |
|---|---|
| Disclaimer | Terms page states: "intended exclusively for entertainment, personal enrichment, and inspirational purposes. Not medical, financial, legal, or psychological advice." |
| Age restriction | Terms: 18 years or older |
| Payment | Stripe; auto-renew disclosure for subscriptions |
| Arbitration | Binding arbitration clause and class action waiver in Terms |
| Content label | AI-generated content |
| Privacy | Privacy Policy page exists |

**Known gaps** (documented in full in `IMPROVEMENT_PLAN.md` as L-1 through L-6):
- Q4 and Q7 answer option phrasing touches mental health/emotional vulnerability territory
- Social proof claim ("3.9M analyses complete") is unverified
- Urgency claim on preview page may not be accurate
- No crisis line / crisis resource anywhere in the app
- No explicit data use consent notice at the point of data collection (Step 2)

---

## 14. FILE MAP — ALL KEY FILES

| File | Role |
|---|---|
| `app/pages/index.vue` | Landing page |
| `app/pages/analysis.vue` | 2-step questionnaire (birth info + behavioral questions) |
| `app/pages/preview.vue` | Report preview + paywall |
| `app/pages/report.vue` | Full paid report display |
| `app/pages/calendar.vue` | Calendar upsell display |
| `app/pages/compatibility.vue` | Compatibility reading display |
| `app/pages/subscription.vue` | Subscription management |
| `app/pages/terms.vue` | Terms of Service |
| `app/pages/privacy.vue` | Privacy Policy |
| `app/stores/analysisStore.ts` | All user session state (Pinia) |
| `app/utils/archetypes.ts` | 12 archetypes, scoring matrix, `assignArchetype()` |
| `app/utils/lifePathNumber.ts` | `calculateLifePathNumber()` |
| `app/utils/translations.ts` | All UI strings in 6 languages |
| `app/utils/vedic.ts` | Nakshatra data (client-side reference) |
| `app/utils/bazi.ts` | BaZi stem/branch data (client-side reference) |
| `app/composables/useLanguage.ts` | `t()` translation function |
| `app/plugins/pixels.client.ts` | Meta Pixel tracking |
| `app/plugins/store-persist.client.ts` | localStorage persistence for Pinia |
| `server/api/generate-report.post.ts` | Main AI report generation (Claude) |
| `server/api/detect-region.get.ts` | IP geo-detection → tradition + language |
| `server/api/save-report.post.ts` | Supabase report persistence |
| `server/api/capture-email.post.ts` | Abandonment email capture |
| `server/api/validate-promo.post.ts` | Promo code validation |
| `server/api/apply-promo-access.post.ts` | Free access promo redemption |
| `server/api/apply-promo-discount.post.ts` | Discounted Stripe session creation |
| `server/api/create-payment.post.ts` | Stripe basic tier ($2.99) |
| `server/api/create-bundle-payment.post.ts` | Stripe bundle tier ($4.99) |
| `server/api/create-oracle-payment.post.ts` | Stripe oracle tier ($12.99) |
| `server/api/stripe/` | Stripe webhook handler |
| `server/api/generate-calendar.post.ts` | Calendar AI generation |
| `server/api/generate-compatibility.post.ts` | Compatibility AI generation |
| `server/api/generate-birth-chart.post.ts` | Birth chart AI generation |
| `server/api/generate-card.post.ts` | Share card image generation |
| `server/api/generate-daily-insight.post.ts` | Daily insight AI generation |
| `server/api/send-report-email.post.ts` | Report delivery email |
| `server/utils/ai-schemas.ts` | Zod schemas for all AI outputs |
| `server/utils/ai-retry.ts` | Anthropic retry utility (3 attempts, exponential backoff) |
| `server/utils/email-templates.ts` | HTML email templates |
| `server/utils/report-email-builder.ts` | Email assembly logic |
| `server/utils/legal-copy.ts` | Legal disclaimers injected into emails |

---

## 15. DOCUMENT RELATIONSHIP: THIS SPEC ↔ IMPROVEMENT_PLAN.md

This document describes **what exists today**. `IMPROVEMENT_PLAN.md` describes **what needs to change and why**.

| Area | This document (current state) | IMPROVEMENT_PLAN.md (proposed change) |
|---|---|---|
| Q4/Q7 question options | Phrasing touches mental health territory | L-1: Rewrite 5 specific option texts in all 6 languages |
| Crisis resources | None anywhere in app | L-2: Add crisis line to 3 pages |
| Data consent | No consent notice at data collection | L-3: Add notice to analysis step 2 |
| Social proof | "3.9M analyses complete" (unverified) | L-5 / LP-6: Verify or replace with value-based copy |
| Landing page tagline | Abstract ("AI decoded your destiny") | LP-1: Rewrite as concrete value proposition |
| CTA button | Transparent/ghost button style | LP-2: Solid filled primary button |
| Landing page scroll | One viewport, no secondary content | LP-3/LP-4: Add "What You'll Discover" + "How It Works" sections |
| Loading screen | Rotating text messages (generic) | C-2: Add social proof testimonials to loading screen |
| Archetype reveal | Static render | C-3: CSS entry animation on archetype name |
| Paywall copy | Generic tier descriptions | C-5: Insert archetype name + life path number into tier copy |
| Tier card design | Equal visual weight on all 3 tiers | C-7: Visual weight overhaul to push Tier 2 |
| Share card | Exists in report.vue only | G-2: Expose on preview page, gate behind email (not payment) |
| Email opt-in | Abandonment sequence only | G-1: Add daily insight opt-in on report page |
