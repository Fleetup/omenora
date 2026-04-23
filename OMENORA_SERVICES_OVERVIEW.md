# OMENORA — Services, Logic & Monetization Overview

**Version:** 1.0  
**Date:** April 2026  
**Purpose:** Non-technical reference describing what OMENORA sells, how each service is generated, and how it is priced.

---

## 1. WHAT OMENORA IS

OMENORA is an AI-powered astrology and numerology SaaS delivered as a web application. Users enter their birth information, answer a short behavioral questionnaire, and receive a fully personalized destiny report generated in real time by Claude AI. Revenue is generated at a paywall immediately after the free report preview — all purchases are one-time payments except the optional Daily Insights subscription.

**Core funnel:**
```
Landing Page → Quiz (2 steps) → Report Preview (free) → Paywall → Full Report
```

---

## 2. THE QUIZ — HOW USER DATA IS COLLECTED

Before any service is generated, the user completes a 2-step analysis form at `/analysis`.

### Step 1 — Birth & Location Data

| Field | Required | Notes |
|---|---|---|
| First name | Yes | Personalizes all generated content |
| Date of birth | Yes | Drives numerology, tradition frameworks, archetype scoring |
| City of birth | Yes | Used for tradition detection, birth chart |
| Time of birth | No | Optional; unlocks Rising Sign in birth chart if provided |

The user also selects:
- **Tradition** — which ancient system interprets their data (4 options: Western, Vedic, BaZi/Chinese, Tarot)
- **Language** — 6 languages supported: English, Spanish, Portuguese, Hindi, Korean, Simplified Chinese

Region and language are auto-detected via IP geolocation on page load; the user can override both manually.

### Step 2 — Behavioral Questionnaire (3 Questions)

Three multiple-choice questions, each with 4 answer options. The answers are used to compute the user's **Destiny Archetype** and to personalize the AI prompts for every service.

| Question | Theme | Answer options |
|---|---|---|
| Q1 (p1) | Primary focus area for life | Connection / Purpose / Growth / Creativity |
| Q2 (p2) | Preferred communication style | Direct / Gentle / Detailed / Intuitive |
| Q3 (p3) | Reason for seeking this reading | Self-understanding / Current situation / Curiosity / Recommended |

These 3 answers directly shape the tone, depth, and emphasis of the generated calendar and report.

---

## 3. LOCAL COMPUTATION — ARCHETYPE & LIFE PATH NUMBER

Two calculations run entirely in the browser before any AI is called.

### 3.1 Life Path Number

Standard numerology reduction of the birth date:
1. Extract all digits from `YYYY-MM-DD`
2. Sum all digits
3. Reduce by repeated digit-sum until a single digit is reached
4. **Exception:** 11, 22, 33 are preserved as Master Numbers and never reduced further

**Example:** `1990-06-15` → `1+9+9+0+0+6+1+5 = 31` → `3+1 = 4` → Life Path **4**

### 3.2 Destiny Archetype

A weighted scoring matrix maps the 3 answers to one of **12 archetypes**:

| Archetype | Symbol | Element |
|---|---|---|
| The Phoenix | ● | Fire |
| The Silent Architect | ◆ | Earth |
| The Storm Caller | ▲ | Air |
| The Lighthouse | ◇ | Water |
| The Wanderer | ○ | Air |
| The Alchemist | ⬡ | Fire |
| The Guardian | □ | Earth |
| The Visionary | ⬟ | Fire |
| The Mirror | ◉ | Water |
| The Catalyst | ✦ | Air |
| The Sage | ▽ | Earth |
| The Wildfire | ★ | Fire |

**Scoring:** Each answer adds weighted points to up to 3 archetypes (primary = 3pts, secondary = 2pts, tertiary = 1pt). The highest-scoring archetype wins. Ties are broken by the Q2 answer. Fallback default is `Wildfire`.

---

## 4. SERVICES PROVIDED

### 4.1 Core Destiny Report — *Included in all paid tiers*

**What it is:** A ~2,000-word personalized destiny report structured into 7 sections. This is the primary product.

**Generation logic:**
1. The server receives the archetype, life path number, birth date, city, tradition, language, and 3 behavioral answers.
2. **Tradition-specific data is computed server-side** before calling AI:
   - **Vedic (India):** Nakshatra (lunar mansion from day-of-year), Ruling Planet (from Life Path), Vimshottari Dasha period (120-year cycle from birth date), Rahu/Ketu karmic axis
   - **BaZi / Four Pillars (China):** Year, Month, Day Heavenly Stems and Earthly Branches; Day Master element; dominant element balance across 3 pillars
   - **Tarot (Latam):** Soul Card (Major Arcana mapped to archetype), 2026 Personal Year Card (from birth date + year digits)
   - **Korean:** Personality/behavioral psychology framing (no calculation)
   - **Middle East:** Destiny/fate language framing (no calculation)
   - **Western (default):** Jungian psychology + behavioral science framing (no calculation)
3. A structured prompt is assembled containing: language instruction, voice directive, user profile, tradition framework data, writing rules, forbidden phrases, per-section instructions, and JSON output schema.
4. Claude (`claude-sonnet-4-5`, max 4,096 tokens) generates the report via structured JSON output.
5. The result is Zod-validated against `ReportSchema` before being returned.

**7 report sections:**

| Section | Title | Content description |
|---|---|---|
| `identity` | Who You Are | Core archetype nature, how the tradition frames their fundamental identity |
| `science` | The Science Behind You | Behavioral psychology / planetary / elemental explanation of their patterns |
| `forecast` | Your 2026 Destiny | Year-ahead timing forecast through the tradition's lens |
| `love` | Love & Connection | Romantic patterns, karmic or elemental relationship dynamics |
| `purpose` | Career & Purpose | Vocation, mission, what the archetype is built for |
| `gift` | Your Hidden Gift | Shadow-integrated strength or past-life talent |
| `affirmation` | Your Power Statement | A declaration grounding the user in their archetype identity |

**Free preview:** `identity` and `science` sections are visible before payment. Sections 3–7 are locked.

---

### 4.2 Destiny Calendar — *Included in Most Popular Bundle & Full Oracle*

**What it is:** A 12-month month-by-month lucky timing forecast for 2026. Each month includes energy level (0–100), theme, love/money/career guidance, caution notes, lucky days, and a color.

**Generation logic:**
1. Inputs: archetype, element, life path number, date of birth (for birth season), language, and the 3 behavioral answers (p1 focus area, p2 style, p3 reason).
2. A Claude prompt requests all 12 months in structured JSON, personalized to the archetype + element + life path. Real 2026 astrological events are used as anchors (Mercury retrogrades, eclipses, Jupiter/Saturn transits).
3. The p1 answer (focus area) doubles the depth of the 2–3 months most relevant to that theme. The p2 answer (style) controls sentence tone (declarative / gentle / explanatory / open). The p3 answer (reason) determines whether entries are action-oriented, introspective, possibility-focused, or trust-building.
4. Output validated via `CalendarSchema` (12 month objects, required fields enforced).

**Output shape per month:** `month`, `energyLevel`, `theme`, `love`, `money`, `career`, `warning`, `luckyDays[]`, `color`

---

### 4.3 Compatibility Reading — *Included in Most Popular Bundle & Full Oracle*

**What it is:** A 5-section relationship analysis between the user and one partner.

**Generation logic:**
1. Inputs: user's archetype, element, life path, 3 power traits + partner's name, date of birth (for Life Path and season), and city.
2. Partner's life path is calculated server-side from their date of birth using the same digit-reduction logic.
3. Claude generates a compatibility report with a numeric score (0–100) and a compatibility title.
4. Output validated via `CompatibilitySchema`.

**5 sections:**

| Section | Content |
|---|---|
| The Bond Between You | Core dynamic between their archetypes |
| Your Greatest Strength Together | What makes the pairing powerful |
| The Tension You Must Navigate | Honest friction point |
| What 2026 Holds For You Both | Year-ahead relationship forecast |
| The One Thing That Changes Everything | Single most important insight |

---

### 4.4 Birth Chart — *Included in Full Oracle only*

**What it is:** A full natal chart reading including planetary placements, a 220–260 word reading, and a 2026 planetary forecast.

**Generation logic:**
1. Inputs: name, date of birth, time of birth (optional, improves Rising Sign accuracy), city, archetype, life path, language.
2. The Claude prompt instructs the AI to calculate placements using deterministic rules:
   - **Rising Sign (Ascendant):** Estimated from birth hour using a 2-hour lookup table (12 rising sign slots × 2 hours each), adjusted for extreme latitudes.
   - **Sun Sign:** Derived from birth month and day using standard zodiac cusp dates.
   - **Moon Sign:** Estimated from birth date position in the lunar cycle, adjusted by birth time.
   - **Dominant Planet:** Chosen based on the archetype + Sun/Moon/Rising combination.
   - **Power House:** Most activated house based on archetype and dominant planet.
3. The reading is written in continuous prose (no headers) across 5 structural elements: Rising Mask → Core Tension → Dominant Planet & Power House → Life Path Integration → The Crucible.
4. The 2026 forecast references actual Saturn, Neptune, and Uranus transits relevant to the Rising Sign.
5. The chart title must not contain any archetype name (validated post-generation; automatically corrected if violated).
6. Output validated via `BirthChartSchema`.

---

### 4.5 Tradition-Specific Deep Sections — *Available via Tradition Switch on report page*

Three additional AI-generated sections that go deeper into a specific tradition. Triggered when the user switches tradition on the report page.

#### Vedic Section
- **Inputs:** Birth date (for Nakshatra calculation), life path, archetype, language.
- **Output fields:** `nakshatraName`, `rulingPlanet`, `vedicTitle`, `reading`, `karmicMission`, `remedy`, `auspiciousColors[]`, `auspiciousDays[]`

#### BaZi Section
- **Inputs:** Birth date (for pillar calculation), archetype, language.
- **Output fields:** `dayMaster`, `dominantElement`, `baziTitle`, `reading`, `wealthLuck2026`, `luckyDirections[]`, `luckyColors[]`, `luckyNumbers[]`

#### Tarot Section
- **Inputs:** Birth date (for Personal Year Card), archetype, language.
- **Output fields:** `soulCard`, `soulCardMeaning`, `reading`, `loveMessage`, `transformativePeriod`, `blessing`, `spiritColors[]`, `luckyCharm`

All three use Claude (`claude-sonnet-4-5`) with structured output and Zod validation.

---

### 4.6 Daily Insights — *Included in Full Oracle / available as Subscription*

**What it is:** A daily personalized AI insight delivered by email. Each insight is tied to a specific theme, the user's archetype, element, life path, and the current moon phase.

**Generation logic:**
1. Triggered by an internal worker job (`process-jobs`) that calls `/api/generate-daily-insight` with an `x-job-secret` header (not accessible publicly).
2. Inputs: archetype, life path, element, region, email, target date, language.
3. A rotating pool of **30 themes** is cycled by day-of-year (e.g. "self-trust and inner knowing", "career clarity and purpose", "emotional processing and release", etc.).
4. The last 7 themes sent to that subscriber are fetched from Supabase and injected into the prompt as a deduplication guard — Claude is instructed never to repeat a recent theme.
5. The current **moon phase** is calculated algorithmically (based on a known New Moon reference date + 29.53-day cycle) and included in the prompt as atmosphere context.
6. A **rotating subject line** (15 templates) is selected by day-of-year for inbox variety.
7. Strict safety constraints are enforced in the prompt: no directive language, no health/financial/legal/relationship decision guidance, no anxiety-inducing framing, no dependency-building language, every insight must end with an empowering reframe.
8. Output validated via `DailyInsightSchema` (`insight`, `reflection_question`, `theme`).

---

## 5. PRICING TIERS & WHAT IS SOLD

All prices are USD, one-time payments via Stripe Checkout unless noted.

### 5.1 Tier 1 — Basic Report

| | |
|---|---|
| **Price** | $2.99 |
| **Stripe endpoint** | `/api/create-payment` |
| **Stripe product name** | OMENORA Destiny Report — Basic |
| **Includes** | Full 7-section Destiny Report only |
| **Default selected** | No |

---

### 5.2 Tier 2 — Most Popular Bundle *(default selected)*

| | |
|---|---|
| **Price** | $4.99 |
| **Stripe endpoint** | `/api/create-bundle-payment` |
| **Stripe product name** | OMENORA Most Popular Bundle |
| **Includes** | Full 7-section Destiny Report + 2026 Destiny Calendar + 1 Compatibility Reading |
| **Default selected** | Yes |

---

### 5.3 Tier 3 — Full Oracle Bundle

| | |
|---|---|
| **Price** | $12.99 |
| **Stripe endpoint** | `/api/create-oracle-payment` |
| **Stripe product name** | OMENORA Full Oracle Bundle |
| **Includes** | Full 7-section Destiny Report + 2026 Calendar + Compatibility Reading + Western Birth Chart + Tradition Deep Sections (Vedic / BaZi / Tarot) + 30 Daily Insights |
| **Note** | Labeled "save $8" vs. buying components separately |
| **Default selected** | No |

---

### 5.4 Daily Insights Subscription

| | |
|---|---|
| **Type** | Recurring subscription (monthly) |
| **Stripe endpoint** | `/api/create-subscription` |
| **Price ID** | Configured via `STRIPE_DAILY_PRICE_ID` environment variable |
| **Includes** | Personalized daily destiny insight delivered by email every day |
| **Managed at** | `/subscription` page |
| **Included free in** | Full Oracle Bundle (30 days) |

---

### 5.5 Compatibility Impulse Upsell

| | |
|---|---|
| **Price** | $0.99 (limited-time) |
| **Trigger** | Shown during the post-payment report loading screen only |
| **Normally** | $2.99 as a standalone purchase |
| **Includes** | One additional partner compatibility reading |

---

## 6. PROMO CODE SYSTEM

Two types of promo codes are supported:

| Type | Behavior |
|---|---|
| `discount_percent` | Reduces price by a percentage — routes through `/api/apply-promo-discount` which creates a discounted Stripe Checkout Session |
| `full_access` | Bypasses Stripe entirely — triggers `/api/apply-promo-access` which grants a specific tier (basic, bundle, or oracle) for free |

Codes can be `personal` (locked to one email after first use) or `shared` (limited by a use counter). Validation is handled via `/api/validate-promo`. Usage is logged atomically via a Supabase RPC (`claim_promo_use`) to prevent race conditions.

---

## 7. POST-PURCHASE — EMAIL DELIVERY

Every purchase triggers an automated email:

| Event | Email content |
|---|---|
| Purchase (any tier) | Full HTML report email with all purchased content |
| Bundle purchase | Includes calendar content in email |
| Oracle purchase | Includes birth chart + tradition sections in email |
| Daily Insights subscription | Daily insight email each day |
| Email entered (no purchase) | Abandonment re-engagement sequence |
| Compatibility purchased separately | Compatibility reading email |

---

## 8. SUPPORTED LANGUAGES

| Code | Language |
|---|---|
| `en` | English |
| `es` | Spanish |
| `pt` | Portuguese (Brazilian) |
| `hi` | Hindi |
| `ko` | Korean |
| `zh` | Simplified Chinese |

All AI generation endpoints accept a `language` parameter and instruct Claude to respond in the specified language with culturally appropriate tone.

---

## 9. SUPPORTED TRADITIONS

| ID | Name | Primary framework |
|---|---|---|
| `western` | Western Astrology | Jungian psychology + Western astrological cycles + behavioral science |
| `india` | Vedic | Nakshatra, Dasha period, Rahu/Ketu axis |
| `china` | BaZi / Four Pillars | Heavenly Stems, Earthly Branches, Day Master, Five Element balance |
| `latam` | Tarot | Soul Card (Major Arcana), 2026 Personal Year Card |
| `korea` | Korean | Personality-type psychology (MBTI-style depth) |
| `middleeast` | Middle East | Fate/destiny language, sacred purpose framing |

The user selects a tradition at the start of the funnel. The same tradition is used as the primary lens for every generated service.
