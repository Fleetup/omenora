# Personalization Audit — Compatibility Reading

**Date:** 2026-05-22  
**Branch:** feature/b1-pricing-alignment  
**HEAD:** 3bf6dda  
**Purpose:** Trace data flow from quiz inputs → store → API → generation prompt → output. Feed for compatibility quiz redesign.

---

## 1. Current Quiz Inputs

The current quiz is split across two files. `compatibility-quiz-v2.vue` is a **single-step landing page** that hands off to `compatibility-quiz.vue` at Step 2. `compatibility-quiz.vue` is the **3-step full quiz**.

### 1.1 compatibility-quiz-v2.vue (v2 landing — Step 1 only)

| Field | Element | Type | Validation | Store action |
|---|---|---|---|---|
| `myDob` | `<input type="date">` | Date | Length === 10 (YYYY-MM-DD) | `store.setPersonalInfo('', myDob, myCity)` on continue |
| `myCity` | `<PlacesAutocomplete>` | Autocomplete (Google Places) | Trimmed length ≥ 2 | `store.city` (direct) + `store.cityLat/Lng` |

On continue, v2 computes `mySunSign` and `myLifePath` client-side (quick-signs-client.ts), then navigates to `/compatibility-quiz?step=2&from=v2` — handing off to the full quiz at Step 2.

### 1.2 compatibility-quiz.vue (full quiz — 3 steps)

**Step 1 — Your birth details:**

| Field | Element | Type | Validation | Store action |
|---|---|---|---|---|
| `myDob` | `<input type="date">` | Date | `myDob.length === 10` | Used in `advanceStep1()` to compute sun sign + life path; then hydrated via `store.setPersonalInfo()` at submit |
| `myCity` | `<PlacesAutocomplete>` | Autocomplete | `myCity.trim().length >= 2` | `myCityLat/Lng` stored locally; passed to `store.cityLat/Lng` at submit |
| `myTime` | `<input type="time">` | Time (optional) | No validation — skippable | Not stored to Pinia during quiz; stored in Stripe metadata as `timeOfBirth` |

**Step 2 — Their birth details:**

| Field | Element | Type | Validation | Store action |
|---|---|---|---|---|
| `theirDob` | `<input type="date">` | Date | `theirDob.length === 10` | `store.setPartnerData({ name:'', dob, city })` at submit |
| `theirCity` | `<PlacesAutocomplete>` | Autocomplete | `theirCity.trim().length >= 2` | `store.partnerCityLat/Lng` at submit |
| `theirTime` | `<input type="time">` | Time (optional) | No validation — skippable | Not stored to Pinia during quiz; stored in Stripe metadata as `partnerTimeOfBirth` |

**Step 3 — Confirm & calculate (preview trigger):**  
No new fields. Confirms both reveal cards are visible. Triggers `advanceStep3()` → calls `/api/generate-compatibility` with `previewMode: true`.

**Summary: 6 fields collected (2 dates, 2 cities, 2 optional times). Names are NOT collected by the quiz — only by the paywall form on `/compatibility`.**

### 1.3 Fields collected by the paywall form on compatibility.vue (pre-payment)

| Field | Where | Notes |
|---|---|---|
| `firstName` (user) | Name input on paywall | Collected just before payment, stored to `store.firstName` |
| `partnerName` | Name input on paywall | Stored to `store.partnerName` |
| `email` | Email input on paywall | Stored to `store.email`, passed in Stripe metadata |

---

## 2. Store Schema (Compatibility-related)

**File:** `augur/app/stores/analysisStore.ts`

### 2.1 Fields relevant to compatibility flow

| Store field | Type | Set by | Used for |
|---|---|---|---|
| `firstName` | `string` | `setPersonalInfo()` / paywall form | Passed as `firstName` in generation body |
| `dateOfBirth` | `string` | `setPersonalInfo()` | Passed as `dateOfBirth` in generation body |
| `city` | `string` | `setPersonalInfo()` | Displayed on receipt; passed to birth chart endpoint |
| `cityLat` | `number \| null` | Direct assignment in quiz | Passed to birth chart endpoint |
| `cityLng` | `number \| null` | Direct assignment in quiz | Passed to birth chart endpoint |
| `partnerCityLat` | `number \| null` | Direct assignment in quiz | Passed to birth chart endpoint |
| `partnerCityLng` | `number \| null` | Direct assignment in quiz | Passed to birth chart endpoint |
| `partnerName` | `string` | `setPartnerData()` / paywall form | Passed as `partnerName` in generation body |
| `partnerDob` | `string` | `setPartnerData()` | Passed as `partnerDob` in generation body |
| `partnerCity` | `string` | `setPartnerData()` | Passed as `partnerCity` in generation body |
| `email` | `string` | `setEmail()` | Passed in Stripe metadata; used for save/email |
| `tempId` | `string` | `setTempId()` | Stripe metadata; used to look up session post-payment |
| `archetype` | `string` | Set from `/api/calculate-chart` response (natal report path) | Optionally passed to generation if user has a natal report |
| `lifePathNumber` | `number` | Set from `/api/calculate-chart` response | Optionally passed to generation |
| `timeOfBirth` | `string` | `skipBirthTime()` / birth time input on analysis.vue | Passed to birth chart endpoint; **NOT passed** to `/api/generate-compatibility` |
| `compatibilityData` | `any` | `setCompatibilityData()` | Holds preview result for display before payment |
| `compatibilityTier` | `string` | `setCompatibilityTier()` | `'single'` or `'with_charts'` |
| `userBirthChartData` | `any` | `setUserBirthChartData()` | T2 tier only |
| `partnerBirthChartData` | `any` | `setPartnerBirthChartData()` | T2 tier only |
| `language` | `string` | `setLanguage()` / `setLanguageOverride()` | Passed in generation body |
| `report` | `any` | Set from natal report flow | `report.element` and `report.powerTraits` optionally passed to generation |

### 2.2 Fields in store NOT collected by the quiz

| Store field | Source | Passed to generation? |
|---|---|---|
| `archetype` | Computed from natal report (`/api/calculate-chart`) — only if user completed natal flow first | Yes — if present, passed as `archetype` |
| `lifePathNumber` | Computed from natal report — only if user completed natal flow first | Yes — if present, passed as `lifePathNumber` |
| `report.element` | From natal report's full generation | Yes — if present, passed as `element` |
| `report.powerTraits` | From natal report's full generation (up to 5 trait strings) | Yes — if present, passed as `powerTraits` |
| `timeOfBirth` | Collected by analysis.vue (natal flow), not compatibility-quiz.vue | No — never sent to `/api/generate-compatibility` |
| `clarityFocus` | Set in analysis.vue (natal flow) | No |
| `answers` (p1/p2/p3) | Set in analysis.vue (natal flow) | No — only passed when purchasing natal report |

---

## 3. API Endpoints

### 3.1 Payment endpoint

**File:** `augur/server/api/create-compatibility-payment.post.ts`  
**Method:** POST  
**Body accepted:** `firstName`, `partnerName`, `email`, `tempId`, `language`, `origin`, `partnerCity`, `partnerDob`, `dateOfBirth`, `city`, `timeOfBirth`, `partnerTimeOfBirth`, `utmCreative`, `utmSource`, `utmCampaign`, `utmMedium`  
**What it does:** Creates a Stripe Checkout session for the compatibility reading ($4.99 single tier). Stores all submitted fields in Stripe session metadata so they can be recovered post-payment redirect. Returns `{ sessionId, url }`.

**Notable:** `timeOfBirth` and `partnerTimeOfBirth` are stored in Stripe metadata here but are **only used downstream for birth chart generation** (T2 tier) — never passed to the text generation prompt.

### 3.2 Generation endpoint — the one that calls Claude

**File:** `augur/server/api/generate-compatibility.post.ts`  
**Method:** POST  
**Body accepted:**

| Field | Required | Notes |
|---|---|---|
| `firstName` | Required (unless previewMode) | User's first name |
| `partnerName` | Required (unless previewMode) | Partner's first name |
| `partnerDob` | Always required | YYYY-MM-DD |
| `partnerCity` | Optional | Not validated — display only in prompt |
| `language` | Optional (default `'en'`) | Controls language instruction block |
| `previewMode` | Optional (default `false`) | `true` = preview path (challenge only) |
| `archetype` | Optional | If absent → `standaloneMode` = true, computed from `dateOfBirth` |
| `element` | Optional | If absent in standaloneMode → computed from `dateOfBirth` sun sign |
| `lifePathNumber` | Optional | If absent in standaloneMode → computed from `dateOfBirth` |
| `powerTraits` | Optional | Array of up to 5 trait strings |
| `dateOfBirth` | Required in standaloneMode | YYYY-MM-DD for Person 1 |

**Two operation modes:**
- **CASE 1 (archetype-reading path):** Caller supplies `archetype`, `element`, `lifePathNumber`, `powerTraits` from a completed natal report. Used when user has gone through the full natal analysis first.
- **CASE 2 (standalone mode):** `archetype` is absent or empty. Server derives all Person 1 values deterministically from `dateOfBirth` using Swiss Ephemeris + quick-signs.

**Two generation paths:**
- **Preview path (`previewMode: true`):** Calls Claude once for challenge section only. Score + title computed deterministically (no AI). Returns 6 locked sections + 1 real section.
- **Full path (`previewMode: false`):** Calls Claude once for all 7 sections + score + title.

### 3.3 Save endpoint

**File:** `augur/server/api/save-compatibility-reading.post.ts`  
**Method:** POST  
**Body accepted:** `sessionId`, `email`, `firstName`, `partnerName`, `partnerDob`, `language`, `tier`, `compatibilityData`, `userBirthChart`, `partnerBirthChart`, `userBirthChartNoonFallback`, `partnerBirthChartNoonFallback`  
**What it does:** Upserts a row in the `reports` table using the Stripe `session_id` as the dedup key. Fire-and-forget from client — never throws 500. Merges birth chart data for T2 tier.

### 3.4 Get endpoint (retrieval)

**File:** `augur/server/api/get-compatibility-reading.post.ts`  
**What it does:** Retrieves a saved reading by `sessionId` + `email` for re-access flows.

---

## 4. The Generation Prompt (Verbatim)

### 4.1 Preview prompt (previewMode: true)

```
${langInstruction}

You are OMENORA, an AI destiny analysis system. Write ONE section of a compatibility reading.
Be specific, poetic, and honest. Reference their archetypes, life paths, and elements.
Never be generic.

${personContext}

Generate ONLY the challenge section: the core friction between their elemental and archetypal energies.
Be honest, not softened. 2-3 sentences.

Return ONLY valid JSON, no markdown:
{
  "challenge": {
    "title": "The Tension You Must Navigate",
    "content": "[2-3 sentences: the core friction — honest, specific to this pairing]"
  }
}
```

Where `personContext` is:

```
Person 1 (the user):
- Archetype: ${archetype}
- Element: ${element}
- Life Path: ${lifePathNumber}

Person 2 (their person):
- Born: ${partnerSeason} season
- Element: ${partnerElement}
- Life Path: ${partnerLifePath}
- Sun sign: ${partnerSunSign.name}

ELEMENTAL SYNASTRY:
${elementNote}

NUMEROLOGY:
${lifePathNote}
```

**Preview system prompt:**
```
You are writing the tension section of a compatibility reading. Be grounded and precise. Every sentence must be specific to this exact pairing. Write at B2 English level. Short sentences. No cultural idioms.
```

---

### 4.2 Full prompt (previewMode: false)

```
${langInstruction}

You are OMENORA, an AI destiny analysis system. Generate a 7-section compatibility report between two people.
Be specific, poetic, and personal. Reference their actual names, archetypes, life paths, and elements throughout.
Never be generic. Write in second person to ${firstName || 'the user'}.

Person 1 (the user):
- Name: ${firstName || '(not provided — address as "you")'}
- Archetype: ${archetype}
- Element: ${element}
- Life Path: ${lifePathNumber}
- Traits: ${powerTraits?.join(', ') || 'not provided'}

Person 2 (their person):
- Name: ${partnerName || '(not provided — refer to as "your partner")'}
- Born: ${partnerSeason} season
- Element: ${partnerElement}
- Life Path: ${partnerLifePath}
- Sun sign: ${partnerSunSign.name}
- City: ${partnerCity}

ELEMENTAL SYNASTRY:
${elementNote}

NUMEROLOGY:
${lifePathNote}

CURRENT PLANETARY WINDOW (${todayDate} – ${forecastEndDate}):
- Sun: ${currentTransits.sun.sign} ${currentTransits.sun.degree}° → ${forecastTransits.sun.sign} ${forecastTransits.sun.degree}°
- Moon: ${currentTransits.moon.sign} ${currentTransits.moon.degree}° → ${forecastTransits.moon.sign} ${forecastTransits.moon.degree}° (${currentTransits.moonPhaseName})
- Mercury: ${currentTransits.mercury.sign} ${currentTransits.mercury.degree}° → ${forecastTransits.mercury.sign} ${forecastTransits.mercury.degree}°
- Venus: ${currentTransits.venus.sign} ${currentTransits.venus.degree}° → ${forecastTransits.venus.sign} ${forecastTransits.venus.degree}°
- Mars: ${currentTransits.mars.sign} ${currentTransits.mars.degree}° → ${forecastTransits.mars.sign} ${forecastTransits.mars.degree}°

Generate exactly 7 sections. Each section MUST be specific to this exact pairing — never a generic template.

Return ONLY valid JSON, no markdown:
{
  "compatibilityScore": 85,
  "compatibilityTitle": "The Alchemist meets The Storm — transformation through tension",
  "sections": {
    "bond": {
      "title": "The Bond That Holds You Together",
      "content": "[3-4 sentences: why these two connect at a fundamental level — specific to their archetypes and elements]"
    },
    "strength": {
      "title": "Your Greatest Strength Together",
      "content": "[2-3 sentences: the specific advantage this pairing creates that neither person has alone]"
    },
    "challenge": {
      "title": "The Tension You Must Navigate",
      "content": "[2-3 sentences: the core friction between their elemental and archetypal energies — honest, not softened]"
    },
    "communication": {
      "title": "The Communication Pattern",
      "content": "[3 sentences: how these two people talk, process conflict, and repair — what works, what breaks down, what heals it. Ground in Mercury position and their elements.]"
    },
    "powerDynamic": {
      "title": "The Power Dynamic",
      "content": "[3 sentences: who leads, who follows, where the balance tips and why — be precise, name the archetype that tends to dominate and in which situations]"
    },
    "forecast": {
      "title": "The Next 7 Days",
      "content": "[3 sentences: use the actual planetary window above to describe what this specific couple will feel in the coming week. Name the planets and signs explicitly. Be a real forecast, not generic.]"
    },
    "advice": {
      "title": "The One Move That Changes Everything",
      "content": "[1-2 sentences: one concrete, specific action rooted in both charts that shifts the dynamic more than any other single thing]"
    }
  }
}
```

**Full path system prompt:**
```
You are writing a personal relationship compatibility reading between two specific people. Your analysis is grounded, honest, and precise. You name real dynamics — not flattering generalities. Every sentence must be specific to these two people's actual combination. Write at B2 English level. Short sentences. No cultural idioms. Make the reader feel their relationship has just been seen clearly for the first time.
```

---

## 5. Prompt Input Consumption

### 5.1 Variables injected into the prompt

| Variable | Source in endpoint | How used in prompt | Appears in output |
|---|---|---|---|
| `langInstruction` | `language` field → `languageInstructions` lookup | First line — controls output language | Implicit (all text) |
| `firstName` | `body.firstName` (sanitized, 50 chars) | "Write in second person to `${firstName}`"; "Name: `${firstName}`" | Yes — Claude references by name throughout sections |
| `partnerName` | `body.partnerName` (sanitized, 50 chars) | "Name: `${partnerName}`" | Yes — Claude references partner by name |
| `archetype` | `body.archetype` (CASE 1) or computed from `dateOfBirth` (CASE 2) via `assignArchetypeFromChart()` | "Archetype: `${archetype}`"; also in `compatibilityTitle` example | Yes — used extensively in bond, strength, challenge, powerDynamic |
| `element` | `body.element` (CASE 1) or `getSunSign(dateOfBirth).element` (CASE 2) | "Element: `${element}`"; in `elementNote` | Yes — referenced in most sections |
| `lifePathNumber` | `body.lifePathNumber` (CASE 1) or `getLifePathNumber(dateOfBirth).number` (CASE 2) | "Life Path: `${lifePathNumber}`"; in `lifePathNote` | Yes — referenced in numerology context |
| `powerTraits` | `body.powerTraits` (optional array, CASE 1 only) | "Traits: `${powerTraits.join(', ')}`" | Sometimes — Claude may reference if populated |
| `partnerSeason` | Computed server-side from `partnerDob` month → `'spring'\|'summer'\|'autumn'\|'winter'` | "Born: `${partnerSeason}` season" | Sometimes — Claude may reference seasonal framing |
| `partnerElement` | Computed server-side: `getSunSign(partnerDob).element` | "Element: `${partnerElement}`"; in `elementNote` | Yes — core to most sections |
| `partnerLifePath` | Computed server-side: `getLifePathNumber(partnerDob).number` | "Life Path: `${partnerLifePath}`"; in `lifePathNote` | Yes — referenced in numerology context |
| `partnerSunSign.name` | Computed server-side: `getSunSign(partnerDob).name` | "Sun sign: `${partnerSunSign.name}`" | Sometimes |
| `partnerCity` | `body.partnerCity` (sanitized, 100 chars) | "City: `${partnerCity}`" | Rarely — no explicit instruction to use it |
| `elementNote` | Computed server-side: `ELEMENT_PAIRS[p1Element][p2Element]` | Full ELEMENTAL SYNASTRY block | Yes — seeded into challenge/bond/strength |
| `lifePathNote` | Computed server-side: diff-based text from life path numbers | Full NUMEROLOGY block | Yes — seeded into communication/advice |
| `todayDate` | `new Date().toISOString().split('T')[0]` | Planetary window header | Yes — forecast section |
| `forecastEndDate` | Today + 7 days | Planetary window header | Yes — forecast section |
| `currentTransits.*` | `getPlanetaryTransits(todayDate)`: Sun, Moon, Mercury, Venus, Mars sign/degree + `moonPhaseName` | CURRENT PLANETARY WINDOW block (5 planets, today values) | Yes — forecast section |
| `forecastTransits.*` | `getPlanetaryTransits(forecastEndDate)`: same planets at +7 days | CURRENT PLANETARY WINDOW block (5 planets, forecast values) | Yes — forecast section |

### 5.2 Fields sent to the endpoint that are NOT used in the prompt

| Field | Accepted by endpoint | Used in prompt? | Actual use |
|---|---|---|---|
| `dateOfBirth` (Person 1) | Yes | No — only used server-side to compute `archetype`, `element`, `lifePathNumber` in standaloneMode | Computation input only |
| `language` | Yes | Indirectly — resolves to `langInstruction` string | Not interpolated directly |
| `previewMode` | Yes | No | Routing flag only |
| `partnerDob` (raw date) | Yes | No — only used server-side to compute `partnerElement`, `partnerLifePath`, `partnerSunSign`, `partnerSeason` | Computation input only |

---

## 6. Output Schema

### 6.1 Full path (previewMode: false)

The full generation returns a Zod-validated `CompatibilityType` object. Score and title in full path are generated by Claude.

| Field | Type | Source | Notes |
|---|---|---|---|
| `compatibilityScore` | `integer 0–100` | Claude (full path) | Prompt example: `85` |
| `compatibilityTitle` | `string` | Claude (full path) | Prompt example: `"The Alchemist meets The Storm — transformation through tension"` |
| `sections.bond.title` | `string` | Claude | Fixed label: `"The Bond That Holds You Together"` |
| `sections.bond.content` | `string` | Claude | 3-4 sentences: why these two connect at a fundamental level |
| `sections.strength.title` | `string` | Claude | Fixed label: `"Your Greatest Strength Together"` |
| `sections.strength.content` | `string` | Claude | 2-3 sentences: specific advantage this pairing creates |
| `sections.challenge.title` | `string` | Claude | Fixed label: `"The Tension You Must Navigate"` |
| `sections.challenge.content` | `string` | Claude | 2-3 sentences: core friction — explicit instruction "not softened" |
| `sections.communication.title` | `string` | Claude | Fixed label: `"The Communication Pattern"` |
| `sections.communication.content` | `string` | Claude | 3 sentences: talk/fight/repair, grounded in Mercury and elements |
| `sections.powerDynamic.title` | `string` | Claude | Fixed label: `"The Power Dynamic"` |
| `sections.powerDynamic.content` | `string` | Claude | 3 sentences: who leads/follows, archetype-specific |
| `sections.forecast.title` | `string` | Claude | Fixed label: `"The Next 7 Days"` |
| `sections.forecast.content` | `string` | Claude | 3 sentences: uses actual planetary window — explicit instruction to name planets/signs |
| `sections.advice.title` | `string` | Claude | Fixed label: `"The One Move That Changes Everything"` |
| `sections.advice.content` | `string` | Claude | 1-2 sentences: one concrete action rooted in both charts |
| `calculationReceipt` | `object` | Assembled server-side | See §6.3 |

### 6.2 Preview path (previewMode: true)

| Field | Type | Source | Notes |
|---|---|---|---|
| `compatibilityScore` | `integer` | `computeCompatibilityScore()` — deterministic, no AI | Formula: `elementScore × 0.55 + lifePathScore × 0.45`, clamped 28–99 |
| `compatibilityTitle` | `string` | `computeCompatibilityTitle()` — deterministic, no AI | Template: `${archetypeA} & ${partnerSunSign.name} — ${ELEMENT_PHRASE}` |
| `sections.challenge` | `{ title, content }` | Claude | Only real section; others return `'[locked]'` as content |
| `sections.bond/strength/communication/powerDynamic/forecast/advice` | `{ title, '[locked]' }` | Hard-coded | Static locked placeholders |
| `previewMode` | `true` | Hard-coded | Flag for client to render paywall |

### 6.3 Calculation receipt (appended server-side, full path only)

| Field | Content |
|---|---|
| `person1.name` | `firstName` |
| `person1.dateOfBirth` | `person1Dob` |
| `person1.sunSign` | Derived from `person1Dob` via `getSunSign()` |
| `person1.element` | From `element` variable |
| `person1.lifePathNumber` | `lifePathNumber` |
| `person1.archetype` | `archetype` |
| `person2.name` | `partnerName` |
| `person2.dateOfBirth` | `partnerDob` |
| `person2.sunSign` | `partnerSunSign.name` |
| `person2.element` | `partnerElement` |
| `person2.lifePathNumber` | `partnerLifePath` |
| `synastryNotes` | `[elementNote, lifePathNote]` — 2 deterministic strings |
| `tradition` | `'Western (Tropical)'` (literal) |
| `calculationSource` | `'Swiss Ephemeris'` (literal) |

---

## 7. Gap Analysis: New Quiz Fields vs Current Prompt

The 18 new fields from the locked quiz spec are listed below. For each: what it should influence in generation, whether the current prompt has any hook for it, and what the prompt would need to accept it.

| # | New field | Values (count) | Intended generation influence | Hook in current prompt? | What prompt needs to change |
|---|---|---|---|---|---|
| 1 | `q1_intent` | 4 options — what brought you here | Framing of the `bond` and `advice` sections; why this person is seeking a reading | **None** | New input variable injected into prompt context; `bond` and `advice` instructions updated to reference intent |
| 2 | `q2_feeling` | 5 options — first feeling about this person | Emotional register of `bond` section opening | **None** | New variable; `bond` instruction updated to incorporate first-feeling framing |
| 3 | `q3_duration` | 4 options — how long thinking about them | Urgency/depth framing across all sections | **None** | New variable; general instruction updated to weight recency vs. duration |
| 4 | `q4_approach` | 4 options — how you fall for someone | `powerDynamic` and `strength` section framing | **None** | New variable; `powerDynamic` instruction updated to reference attachment approach |
| 5 | `q5_communication` | 4 options — how you express what matters | `communication` section — Person 1 side specifically | **None** | New variable; `communication` instruction updated to ground in self-described communication style |
| 6 | `q6_closeness` | 4 options — connection need | `bond` and `challenge` — the closeness gap | **None** | New variable; `challenge` instruction updated to include closeness tension if applicable |
| 7 | `q7_conflict` | 4 options — approach to tension | `communication` section repair mechanism | **None** | New variable; `communication` instruction updated to reference conflict approach |
| 8 | `q8_intimacy` | 4 options — known vs understood | `bond` and `advice` — deepest relational need | **None** | New variable; `advice` instruction updated to root recommendation in intimacy need |
| 9 | `q9_value` | 5 options — what matters most | `strength` and `advice` sections | **None** | New variable; `strength` and `advice` instructions updated to align with stated value |
| 10 | `q14_descriptor` | 8 options — one-word for connection | `challenge` section opening line; title framing | **None** | New variable; `challenge` instruction updated to open with or contrast against descriptor |
| 11 | `q15_chapter` | 5 options — chapter of the connection | `bond` section narrative arc | **None** | New variable; `bond` instruction updated to place reading within stated chapter |
| 12 | `q16_season` | 4 options — symbolic season | Tonal/metaphorical register across all sections | **None** | New variable; general instruction updated to weight season symbolism |
| 13 | `q17_pattern` | 5 options — pattern that shows up | `challenge` and `powerDynamic` sections | **None** | New variable; `challenge` and `powerDynamic` instructions updated to name the stated pattern |
| 14 | `q18_trust_texture` | 4 options — symbolic trust texture | `communication` and `bond` sections | **None** | New variable; `bond` and `communication` instructions updated to incorporate trust texture |
| 15 | `q19_curiosity` | 4 options — what they want to understand | Entire reading tone; `advice` section specifically | **None** | New variable; `advice` instruction updated to answer the stated curiosity directly |
| 16 | `q23_time_of_day` | 4 options — symbolic time of day | Tonal register; `forecast` section framing | **None** | New variable; optional enrichment of `forecast` section |
| 17 | `q24_helpfulness` | 4 options — what would help most | `advice` section — grounds recommendation in stated need | **None** | New variable; `advice` instruction updated as primary driver of recommendation |
| 18 | `q25_agency` | 4 options — agency frame | `advice` section framing — how directive vs. reflective | **None** | New variable; `advice` instruction updated to match agency preference |

**Summary: 0 of 18 new fields have any hook in the current generation prompt.**

All 18 are unknown to the prompt. The prompt context block currently contains: `archetype`, `element`, `lifePathNumber`, `powerTraits` (Person 1); `partnerSeason`, `partnerElement`, `partnerLifePath`, `partnerSunSign.name`, `partnerCity` (Person 2); plus `elementNote`, `lifePathNote`, and the planetary window. No psychological, relational, or behavioral signals are present.

---

## 8. Computable Rarity Metrics

### 8.1 What natalChart.ts produces today

`calculateNatalChart()` (Swiss Ephemeris, `sweph` bindings) returns a `NatalChart` object with:

| Output | Type | Notes |
|---|---|---|
| `sun` | `PlanetPosition { sign, degree, signIndex }` | Computed from `dateOfBirth` + `timeOfBirth` + lat/lon |
| `moon` | `PlanetPosition` | Computed from same; significant sensitivity to birth time |
| `mercury` | `PlanetPosition` | — |
| `venus` | `PlanetPosition` | — |
| `mars` | `PlanetPosition` | — |
| `jupiter` | `PlanetPosition` | — |
| `saturn` | `PlanetPosition` | — |
| `uranus` | `PlanetPosition` | — |
| `neptune` | `PlanetPosition` | — |
| `pluto` | `PlanetPosition` | — |
| `ascendant` | `PlanetPosition \| null` | `null` if no birth time or lat/lon supplied; `null` when coordinates are 0/0 |
| `lifePathNumber` | `null` | Always null — not computed here; `getLifePathNumber()` in quick-signs.ts is used instead |

**Element groupings used internally:**
- Fire: Aries (0), Leo (4), Sagittarius (8)
- Earth: Taurus (1), Virgo (5), Capricorn (9)
- Air: Gemini (2), Libra (6), Aquarius (10)
- Water: Cancer (3), Scorpio (7), Pisces (11)

**Archetype derivation (`assignArchetypeFromChart`):** Sun element + Moon element → 16-cell lookup → base archetype; Ascendant element used as tiebreaker if available. 12 archetypes total.

**What `generate-compatibility.post.ts` uses from this pipeline:**
- In **standalone mode** only: calls `calculateNatalChart()` with `lat=0, lon=0, timeOfBirth=null` to derive `archetype` for Person 1. This means Moon is computed from date only (noon UTC assumed), ascendant is always null.
- In **CASE 1 mode** (natal report path): uses caller-supplied `archetype`, `element`, `lifePathNumber` — `natalChart.ts` is not called.

### 8.2 Rarity metrics computable from current data (without new math)

| Metric | Computable? | How | Lookup table needed? |
|---|---|---|---|
| Element pairing frequency (e.g., "Fire + Water appears in X% of pairings") | **Yes** — distribution is uniform across 16 combinations (4 elements × 4 elements) | Each element covers 3 of 12 signs = 25% frequency. Cross-pairing probability = 25% × 25% = 6.25% for any given pair (same for all 16) | No lookup needed — derivable from first principles. Each of the 16 element pairings is equally likely (6.25%). |
| Same element pairing ("Fire + Fire") | **Yes** | Same calculation: 4 pairings are same-element (Fire/Fire, Earth/Earth, Air/Air, Water/Water), each at 6.25% | No lookup needed |
| Life path number match ("same life path") | **Yes** | Life paths 1–9 each ~11.1% frequency. Same life path probability ≈ 11.1% | No lookup needed — formula-derivable |
| Life path harmony tier | **Yes** | Current code already classifies into 4 tiers by `diff = |lpA - lpB|`: same/close/moderate/contrast | No lookup needed — current `lifePathNote` computation already does this |
| Archetype pairing frequency | **Yes** — 144 possible pairings (12 × 12), but distribution is non-uniform because archetypes are determined by Sun+Moon element combinations | Requires knowing the frequency of each Sun sign (uniform = ~8.3%) and each Moon sign (uniform = ~8.3%) to compute archetype frequency. Some archetypes map to multiple Sun+Moon combinations (e.g., `mirror` = air+air AND water+air; `lighthouse` = earth+water AND water+earth). Not trivially uniform. | **Yes — lookup table needed.** Must precompute archetype frequency from the 16 Sun+Moon element combinations, then compute pairing probability for all 144 archetype pairs. |
| Sun sign specific pair (e.g., "Scorpio + Capricorn") | **Yes** — both sun signs are available | Each of the 144 sun-sign pairings has ~0.69% theoretical frequency (1/12 × 1/12) | No lookup needed for equal-distribution assumption |
| Venus sign of Person 1 | **Yes** — `natalChart.ts` computes Venus position | Venus sign available if birth chart computed | No lookup needed — derivable |
| Sun-Moon cross-aspect between two charts | **Partially** — `signIndex` is available for all planets on both charts, degree is available | A rough aspect could be computed from degree difference (conjunction = 0°±10°, opposition = 180°±10°, trine = 120°±10°, square = 90°±10°, sextile = 60°±10°). No aspect calculation function exists today. | **Yes — would need orb logic added.** Not available as a utility function today. |

### 8.3 What would require new math

- **Aspect calculation** (conjunction, trine, square, opposition, sextile between any two chart points) — requires new function computing angular distance and applying orb thresholds. Not present in any current util.
- **House placements** (which house a planet falls in for a given person) — ascendant is computed by `natalChart.ts` only when lat/lon and birth time are available. House cusps beyond Ascendant not computed.
- **Synastry cross-aspects** (e.g., Person 1's Venus conjunct Person 2's Mars) — requires both full natal charts AND an aspect calculation function. Neither is wired up in the compatibility generation flow today.

### 8.4 Rarity statement constraints

The only rarity statement that is currently **fully self-contained** (no lookup table, no new math, no assumptions) is element pairing frequency: any element pairing is one of 16 equally probable combinations, each representing approximately 6.25% of all pairings. The statement "This elemental combination appears in roughly 1 in 16 pairings" is mathematically exact under uniform sign distribution.

All other rarity statements (archetype pairing frequency, aspect rarity, life path match probability beyond simple diff) would require either a lookup table or new computation to be non-fabricated.

---

## 9. Summary

### Quick-read findings

| Question | Answer |
|---|---|
| How many of the 18 new fields does the current prompt consume as-is? | **0** — none of the 18 new behavioral/psychological fields have any injection point in the current prompt |
| How many would need explicit prompt updates to consume? | **18** — all of them. Each requires: (a) a new input variable added to the `personContext` block or a dedicated new block, and (b) at least one section instruction updated to reference the new signal |
| Does any computable rarity exist from current chart data? | **Yes — one statement is fully derivable without lookup:** element pairing = 1 in 16 (~6.25%). Life path diff tier is also computable. Archetype pairing frequency requires a lookup table. Aspect-based rarity requires new math. |
| The single most important gap to address? | The prompt has **no psychological context about Person 1**. It knows archetype, element, life path, and optionally 5 trait strings. It has zero behavioral, relational, or emotional signal from the quiz. All 7 sections are generated from chart data alone. The `advice` section in particular is structurally blind to what the user actually needs help with. |

### Notable architecture observations

1. **Two operation modes create inconsistent depth.** In CASE 1 (natal report path), the prompt receives `archetype`, `element`, `lifePathNumber`, and up to 5 `powerTraits` from the full natal analysis. In CASE 2 (standalone mode — the default for most compatibility quiz users), `powerTraits` is always empty, `archetype` is derived from Sun+Moon only (noon birth time, 0/0 coordinates), and the prompt gets significantly less Person 1 context. Most quiz users land in CASE 2.

2. **Birth times are collected but not used in generation.** `timeOfBirth` and `partnerTimeOfBirth` are stored in Stripe metadata and used for T2 birth chart generation only. They are never passed to `/api/generate-compatibility`. The generation prompt has no awareness that birth time data exists.

3. **Partner's birth time is metadata-only.** `partnerTimeOfBirth` exists in Stripe session metadata but has no corresponding store field. It is only used for T2 partner birth chart generation. Not available in the store for quiz flows.

4. **`partnerCity` is in the prompt but not instructed.** The full prompt includes `- City: ${partnerCity}` but no section instruction tells Claude to use the city. It is present as a data point with no explicit consumption instruction.

5. **`partnerSeason` is a month-based approximation.** The partner season is derived from birth month alone (meteorological seasons: Mar-May spring, Jun-Aug summer, Sep-Nov autumn, Dec-Feb winter). It is not astrological. Claude receives "Born: autumn season" rather than a sun sign or birth date.

6. **Preview and full paths have different score/title sourcing.** Preview: score + title are fully deterministic (no AI). Full: score + title are Claude-generated. This means a user who pays will see a different score/title than the preview showed them.

7. **`powerTraits` is only populated from the natal report.** If a user enters the compatibility quiz directly (no prior natal reading), `powerTraits` will always be an empty array → the prompt receives `"Traits: not provided"`. This is the majority of compatibility quiz users.

---

## 10. Out of Scope (for awareness)

- **The actual prompt rewrite** (adding all 18 new fields to the prompt context and updating section instructions) is a separate downstream prompt.
- **The new quiz build** (implementing the 18 new question steps, storing answers, passing them to the API body) is a separate sequence of build prompts.
- **Store schema changes** (adding 18 new fields for quiz answers) are not assessed here — this audit only documents what exists today.
- **The `send-compatibility-email.post.ts` email template** is not audited here — it consumes the compatibility output but does not affect generation.
- **Mobile app compatibility flow** (`/mobile-app/`) is a separate repo and not in scope.
- **The T2 "with_charts" tier** birth chart prompts (`generate-birth-chart.post.ts`) are separate generation calls with their own prompts — not audited here.
- This audit is purely diagnostic. No file was modified.
