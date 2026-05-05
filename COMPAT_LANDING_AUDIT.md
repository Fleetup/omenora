# COMPAT_LANDING_AUDIT.md

> Research-only audit. No code was modified. Prepared: May 2026.

---

## 1. Executive Summary

`/compatibility-quiz` is a Nuxt 4 file-based route rendered by a single SFC at `augur/app/pages/compatibility-quiz.vue` (1012 lines). It implements a 5-state flow: an optional UTM-gated landing screen (Step 0), three data-collection steps (1–3), and a loading/redirect state (Step 4). Hero copy on Step 0 is driven entirely by `utm_creative` keyword matching via a hardcoded English function — it is not in `translations.ts` and does not respond to `store.language`. Step 4 calls `POST /api/generate-compatibility` in preview mode, writes results to Pinia, and redirects to `/compatibility?preview=1`. No middleware guards the route. No social proof data source exists anywhere in the codebase.

---

## 2. Entry Component

**File:** `augur/app/pages/compatibility-quiz.vue`
**Total lines:** 1012 (`full_length="1012"` per read output)

### `<script setup>` imports (lines 246–258)

```
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { getSunSign, getLifePathNumber, type SunSign } from '~/utils/quick-signs-client'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useLanguage } from '~/composables/useLanguage'
import { useClarity } from '~/composables/useClarity'
```

Auto-imported Nuxt composables also used (not explicitly imported): `useSeoMeta`, `useRoute`, `useNuxtApp`, `navigateTo`.

### Pinia stores

- `useAnalysisStore` — imported and instantiated as `store` at line 254.

### Composables

- `useLanguage` (line 255) — provides `t(key)` function pulling from `UI_STRINGS` in `augur/app/utils/translations.ts` keyed on `store.language`.
- `useClarity` (line 258) — wraps `@microsoft/clarity` `Clarity.event()`.
- `useRoute` (Nuxt auto-import, line 256) — reads `route.query` for UTM params.
- `useNuxtApp` (Nuxt auto-import, line 257) — destructures `$trackCustomEvent` and `$trackCompatibilityQuizStart` from the pixels plugin.

### API endpoints called

- `POST /api/generate-compatibility` — called via `$fetch` in `runApiCall()` at line 489.

### Tracking events fired

All events go through a local `trackEvent()` wrapper (lines 260–263) that calls both `$trackCustomEvent` (→ TikTok, Meta Pixel, PostHog, GA4 via `safeTrack` in `pixels.client.ts`) and `clarityTrack` (→ Microsoft Clarity). Additionally, `$trackCompatibilityQuizStart()` fires directly.

| Event name | Platform(s) | Fired at |
|---|---|---|
| `compatibility_landing_viewed` | TikTok, Meta, PostHog, GA4, Clarity | `onMounted` when `utm_source` present (line 531) |
| `compatibility_quiz_started` | TikTok, Meta, PostHog, GA4, Clarity | `onMounted` when **no** `utm_source` (line 537); also in `startQuiz()` (line 425) |
| `compatibility_landing_cta_clicked` | TikTok, Meta, PostHog, GA4, Clarity | `startQuiz()` (line 426) — includes `utm_creative` prop |
| `compatibility_quiz_start` | TikTok `ViewContent`, Meta, PostHog, GA4 | `$trackCompatibilityQuizStart()` in `startQuiz()` (line 427) |
| `compatibility_quiz_step_1_complete` | TikTok, Meta, PostHog, GA4, Clarity | `advanceStep1()` (line 452) — includes `sun_sign`, `life_path` props |
| `compatibility_quiz_step_2_complete` | TikTok, Meta, PostHog, GA4, Clarity | `advanceStep2()` (line 464) — includes `their_sun_sign`, `their_life_path` props |
| `compatibility_quiz_step_3_complete` | TikTok, Meta, PostHog, GA4, Clarity | `advanceStep3()` (line 469) |
| `compatibility_preview_requested` | TikTok, Meta, PostHog, GA4, Clarity | `advanceStep3()` (line 470) |
| `compatibility_preview_loaded` | TikTok, Meta, PostHog, GA4, Clarity | `runApiCall()` on success (line 509) — includes `score`, `sun_sign` props |
| `compatibility_preview_failed` | TikTok, Meta, PostHog, GA4, Clarity | `runApiCall()` on catch (line 514) |

### UTM parameter handling

`onMounted` reads `route.query.utm_source`, `utm_campaign`, `utm_creative`, `utm_medium`, `utm_content` (lines 519–525). If `utm_source` is present, all five values are written to `sessionStorage` under key `omenora_utms` (line 527). `resolveHeroVariant(utm_creative)` is called and its result stored in `heroVariant.ref` (line 528). `hadLandingStep.value` is set to `true` and `currentStep.value` is set to `0` (lines 529–530).

---

## 3. Full Step Structure

### Step 0 — UTM Landing / Pre-sell

- **Condition:** `currentStep === 0`. Only reached when `utm_source` is present in the URL on mount.
- **Purpose:** Ad landing page. Displays hero copy variant based on `utm_creative`, trust signals, TrustpilotWidget, and a single CTA.
- **Data collected:** None. No store writes.
- **Advance behavior:** Manual. User clicks `CTAButton` → `startQuiz()` → sets `currentStep = 1`.
- **Store fields written:** None at this step.

### Step 1 — Your birth details

- **Headline:** `t('quizStep1Headline')` → "Whose chart are we comparing?"
- **Fields and local refs:**
  - `myDob` (`ref('')`) — `<input type="date">` with `min="1924-01-01"` and `:max="todayMax"` (lines 89–97)
  - `myCity` (`ref('')`) — `PlacesAutocomplete` component (line 100–107); sets `myCityLat`, `myCityLng` via `onMyCitySelected`
  - `myTime` (`ref('')`) — `<input type="time">`, skippable via button (lines 113–118)
- **Validation:** `step1Valid = myDob.value.length === 10 && myCity.value.trim().length >= 2` (line 402). CTA disabled when `false`.
- **Auto-advance:** No. Manual: `advanceStep1()`.
- **Store fields written:** None at this step. Sun sign and life path are computed client-side in `advanceStep1()` (lines 446–447) into local refs `mySunSign`, `myLifePath`.

### Step 2 — Partner birth details

- **Headline:** `t('quizStep2Headline')` → "Now their birth details."
- **Fields and local refs:**
  - `theirDob` (`ref('')`) — `<input type="date">` (lines 136–145)
  - `theirCity` (`ref('')`) — `PlacesAutocomplete`; sets `theirCityLat`, `theirCityLng` via `onTheirCitySelected`
  - `theirTime` (`ref('')`) — `<input type="time">`, skippable
- **Display:** Shows user's sign reveal card (`.compat-reveal`) with `mySunSign.name` and `myLifePath` computed in Step 1.
- **Validation:** `step2Valid = theirDob.value.length === 10 && theirCity.value.trim().length >= 2` (line 403). CTA disabled when `false`.
- **Auto-advance:** No. Manual: `advanceStep2()`. Computes `theirSunSign`, `theirLifePath` into local refs (lines 458–459).
- **Store fields written:** None at this step.

### Step 3 — Confirm & calculate

- **Headline:** `t('quizStep3Headline')` → "Ready to see what your charts say?"
- **Purpose:** Confirmation screen showing dual reveal card (both sun signs + life paths side-by-side).
- **Data collected:** None. No new fields.
- **Validation:** None — CTA is always enabled at this step (no `:disabled` binding).
- **Advance behavior:** Manual. `CTAButton` labeled `t('quizCalculate')` → `advanceStep3()` (line 210–213).
- **Store fields written:** None directly. `advanceStep3()` sets `currentStep = 4` and immediately calls `runApiCall()`.

### Step 4 — Loading / API call

- **Condition:** `currentStep === 4` (line 38).
- **Behavior:** Cycles loading messages (`quizLoadingMsg1/2/3`) every 1200ms. Progress fill animates 0→95% over 8 seconds (`fillProgress` keyframe, lines 856–864).
- **API call:** `POST /api/generate-compatibility` — see body fields below.
- **On success (lines 501–510):**
  - `store.setPersonalInfo('', myDob.value, myCity.value)` → writes `store.firstName = ''`, `store.dateOfBirth`, `store.city`
  - `store.cityLat = myCityLat.value` (direct state mutation, no action)
  - `store.cityLng = myCityLng.value` (direct state mutation, no action)
  - `store.setPartnerData({ name: '', dob: theirDob.value, city: theirCity.value })` → writes `store.partnerName = ''`, `store.partnerDob`, `store.partnerCity`
  - `store.partnerCityLat = theirCityLat.value` (direct state mutation)
  - `store.partnerCityLng = theirCityLng.value` (direct state mutation)
  - `store.setCompatibilityData(result.compatibility)` → writes `store.compatibilityData`
  - `navigateTo('/compatibility?preview=1')`
- **On error:** Sets `apiError.value = true`, shows retry button (lines 511–515).
- **API request body fields:**
  - `firstName: ''` (hardcoded empty)
  - `dateOfBirth: myDob.value`
  - `partnerName: ''` (hardcoded empty)
  - `partnerDob: theirDob.value`
  - `partnerCity: theirCity.value`
  - `language: 'en'` (hardcoded, not from `store.language`)
  - `previewMode: true`

---

## 4. UTM Hook Variant Logic (Step 0)

Function: `resolveHeroVariant(utmCreative: string): HeroVariant` — lines 319–386.

Input `utmCreative` is lowercased before matching (line 320). Matching is done with `.includes()` in priority order.

### Variant mapping table

| Priority | Trigger keywords (any match) | Headline | Body first sentence | CTA label |
|---|---|---|---|---|
| 1 | `ignoring`, `left_on_read`, `read`, `seen` | "Why do they go cold after showing so much interest?" | "Your synastry chart shows whether the pull between you is real…" | "See What's Really Happening" |
| 2 | `weather`, `storm`, `rough`, `survive`, `work_out` | "Can this relationship actually survive this?" | "Your birth charts reveal whether two people have the structural bond…" | "Check Our Bond" |
| 3 | `antiscam`, `scam`, `real`, `genuine`, `redflag`, `red_flag` | "Is what they feel for you actually real?" | "Your synastry chart shows whether someone's feelings have a genuine astrological foundation…" | "Find Out If It's Real" |
| 4 | `disappear`, `alone`, `end_up` | "Why do people who matter always disappear?" | "Your Venus placement and life-path number reveal the pattern…" | "See My Pattern" |
| 5 | `wrong`, `attract`, `trust` | "You don't attract the wrong people by accident." | "Your chart carries a specific relational pattern…" | "Reveal the Pattern" |
| 6 | `feeling`, `empty`, `connection` | "Something feels off even when things are good." | "Your synastry chart shows whether the connection between two people has a genuine structural match…" | "Check the Connection" |
| 7 | `score`, `percent`, `match` | "What's the real compatibility score between you two?" | "Not a sun-sign quiz…" | "Calculate Our Score" |
| DEFAULT | no match / utm_source absent | "Are you and this person actually compatible?" | "Your birth charts reveal patterns most people never see…" | "Check Our Compatibility" |

`DEFAULT_HERO` is also used when `utm_source` is absent (no UTM in URL) — `resolveHeroVariant` is never called and `heroVariant` starts as `{ ...DEFAULT_HERO }`.

### Translations for hero variants

**None.** All 7 variant copies and `DEFAULT_HERO` are hardcoded English strings inside `resolveHeroVariant()` (lines 311–385). `translations.ts` does not contain any keys for Step 0 hero copy. The compatibility quiz keys in `translations.ts` start at line 193 and cover only Steps 1–4 labels (`quizStep1Headline` through `quizTrustFooter`). These keys exist in all 6 language objects: `en`, `es`, `pt`, `hi`, `ko`, `zh`.

---

## 5. Existing Styling System

### CSS approach

- **Global tokens:** `augur/app/assets/css/editorial.css` — loaded via `nuxt.config.ts` line 6 (`css: ['~/assets/css/editorial.css']`). Defines all CSS custom properties.
- **Component styles:** `<style scoped>` inside `compatibility-quiz.vue` lines 547–1011. No Tailwind utility classes appear in the template or scoped styles of this component.
- **Tailwind:** `@nuxtjs/tailwindcss` is installed (`package.json` line 23) but is not used within `compatibility-quiz.vue`.

### Brand color palette

Defined in `augur/app/assets/css/editorial.css` `:root` (lines 1–28):

| Token | Value |
|---|---|
| `--color-bone` | `#F2EBDD` |
| `--color-bone-dim` | `#EAE2CF` |
| `--color-ink` | `#1A1612` |
| `--color-ink-mid` | `#3D3530` |
| `--color-ink-faint` | `rgba(26, 22, 18, 0.45)` |
| `--color-ink-ghost` | `rgba(26, 22, 18, 0.18)` |
| `--color-gold` | `#C9A961` |
| `--color-gold-dim` | `rgba(201, 169, 97, 0.55)` |

### Font stack

Loaded from Google Fonts in `nuxt.config.ts` (line 163):

| Font | Classification | Used for |
|---|---|---|
| `Fraunces` | Variable serif (optical size 9–144, weight 200–900) | Display headlines — `.font-display`, `.font-display-italic` |
| `Cormorant Garamond` | Serif (italic, weight 300–700) | Secondary serif — `.font-serif`, `.pull-quote` |
| `Hanken Grotesk` | Sans-serif (weight 300–800) | Labels, UI text — `.label-caps`, `.annotation`, `.font-sans` |
| `JetBrains Mono` | Monospace (weight 300–700) | Loaded but no utility class defined in `editorial.css` |

### Mobile-first vs. desktop-first

The component uses `clamp()` for fluid type sizing and padding — no explicit `min-width` media queries within the component itself. Responsive overrides use `max-width` queries (mobile-corrective pattern):

- `@media (max-width: 480px)` — headline size reduction, dual-reveal grid switches to single column (lines 996–999)
- `@media (prefers-reduced-motion: reduce)` — transition override (lines 1001–1010)
- `@media (min-width: 1280px)` in `editorial.css` line 113 — adds `--section-h-pad: 80px`

Max container width is `1400px` (`.analysis-steps` and `.compat-landing__inner`).

---

## 6. Social Proof Data Source

**No existing data source for social proof — would need to be built.**

A grep across all server routes and Supabase usages found zero queries or API endpoints related to recent compatibility purchases, purchase counts, anonymized buyer names, or live activity data. The Supabase client is configured in `nuxt.config.ts` (`supabaseUrl`, `supabaseServiceKey`, `supabaseAnonKey`) but no server route under `augur/server/api/` queries any compatibility purchase table or view for display purposes.

---

## 7. Ad Destination URLs

**Ad destination URLs not determinable from codebase.**

A search of all documentation files under `docs/`, all source files, and all comments found no references to `V1_Disappear`, `V4_Weather`, `V6_compatibility`, `V7_Animated_Compatibility`, or any specific TikTok ad creative URL. The `utm_creative` keyword logic in `resolveHeroVariant` provides indirect evidence of the creative naming conventions (`ignoring`/`left_on_read` for one creative, `weather`/`storm` for another, etc.) but does not confirm destination URLs.

---

## 8. Routing Setup

### Route type

File-based routing via Nuxt 4. `augur/app/pages/compatibility-quiz.vue` produces the `/compatibility-quiz` route automatically. No manual router configuration required or present.

### Middleware / guards

No `definePageMeta` call exists in `compatibility-quiz.vue`. No route-level middleware is applied. The only SEO constraint is `useSeoMeta({ title: '...', robots: 'noindex, nofollow' })` at line 252.

### Post-quiz navigation flow

```
Step 0 (UTM) → CTA click → Step 1
Step 1 → advanceStep1() → Step 2
Step 2 → advanceStep2() → Step 3
Step 3 → advanceStep3() → Step 4 (loading) → navigateTo('/compatibility?preview=1')
```

Back navigation:
- Step > 1: decrements `currentStep`
- Step 1 + `hadLandingStep === true`: returns to Step 0
- Step 1 + `hadLandingStep === false`: `navigateTo('/')`

### Adding `/compatibility-quiz-v2`

A parallel route can be added by creating `augur/app/pages/compatibility-quiz-v2.vue`. No router configuration changes, no middleware changes, and no changes to `nuxt.config.ts` are required. The existing `/compatibility-quiz` route and all its store dependencies, API endpoints, and tracking functions remain entirely unaffected.

---

## 9. Build / Test / Deploy Workflow

### Commands (defined in `augur/package.json`)

| Purpose | Command |
|---|---|
| Build | `npm run build` → `nuxt build` |
| Type check | `npm run typecheck` → `npx tsc --noEmit` |
| Lint | `npm run lint` → `ESLINT_USE_FLAT_CONFIG=true eslint .` |
| Unit tests | `npm run test` → `vitest` |
| E2E tests | `npm run test:e2e` → `playwright test` |

### Test files relevant to compatibility flow

- `augur/tests/unit/utils/validate.test.ts` — tests `isValidEmail`, `isValidSessionId`, `isValidDateOfBirth`, `isValidArchetype`, `sanitizeString`. No compatibility quiz logic tested.
- `augur/tests/e2e/home.spec.ts` — Playwright tests for homepage CTA, meta tags, responsive layout, `/analysis` navigation, `/privacy`, `/terms`. No `/compatibility-quiz` tests exist.

**There are zero test files covering the compatibility quiz flow.** A new variant route would require no test updates (no tests to break).

### Railway deployment

`railway.json` at repo root specifies Docker build from `augur/Dockerfile` and `node .output/server/index.mjs` as the start command. The GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, and E2E tests on pushes to `main` and `develop`. The build job runs only on `main` and uploads `.output/` as a CI artifact. **The CI workflow contains no step that pushes or triggers a Railway deployment.** Whether Railway auto-deploys from the GitHub repository via its own GitHub integration is external configuration not visible in the codebase.

---

## 10. Data Gaps

1. **Railway deployment trigger mechanism** — Not determinable from codebase. The CI pipeline produces a build artifact but contains no Railway CLI step or deploy hook. The actual production deploy trigger is external Railway configuration.
2. **Ad destination URLs** — V1_Disappear, V4_Weather, V6_compatibility, V7_Animated_Compatibility creative-to-URL mapping not documented anywhere in the repo.
3. **`augur/Dockerfile` contents** — Not read during this audit. Specific Docker build steps, Node version, and build arguments are undocumented here.
4. **`augur/app/utils/quick-signs-client.ts`** — Not read. The exact type signatures of the client-side `getSunSign` and `getLifePathNumber` used in the quiz are not documented here (the server-side equivalents in `server/utils/quick-signs.ts` are the same logic per import names but were not verified identical).
5. **Supabase schema** — No database migration files or schema definitions were found in the repo. The structure of any `compatibility_*` tables is unknown.
6. **`TrustpilotWidget` component implementation** — File exists at `augur/app/components/TrustpilotWidget.vue` (1276 bytes) but was not read. Whether it uses a static embed or makes a live Trustpilot API call is undocumented here.

---

## 11. Risk Flags

1. **Step 0 hero copy is English-only.** All 7 `resolveHeroVariant` responses and `DEFAULT_HERO` (lines 311–385) are hardcoded English strings — not in `translations.ts`, not accessed via `t()`. Non-English users whose `store.language` is `es`, `pt`, `hi`, `ko`, or `zh` will see an English Step 0 landing page and then a translated quiz from Step 1 onward. This is an inconsistency in the existing implementation.

2. **`utm_source` presence gates Step 0 display.** Line 526: `if (utmParams.utm_source)`. Direct traffic to `/compatibility-quiz` (no UTMs) bypasses Step 0 entirely and fires `compatibility_quiz_started` on mount instead of `compatibility_landing_viewed`. A new variant landing page that needs to show Step 0 for organic/direct traffic must either modify this condition or accept that Step 0 is ad-traffic-only.

3. **UTM keyword matching uses substring `.includes()`.** The keyword `real` in the antiscam group (line 341) will match any `utm_creative` value containing the string `real` — e.g., `real_score`, `reality_check`, `really_works`. The keyword `read` in the ignoring group (line 323) conflicts with any creative containing "read" including non-ignoring-themed names. Keyword priority order (ignoring > weather > antiscam > disappear > wrong > feeling > score) determines the winner when multiple groups match, but this behavior is not documented as intentional.

4. **`language: 'en'` is hardcoded in the API call.** Line 498 of the component passes `language: 'en'` explicitly regardless of `store.language`. The `generate-compatibility` API server supports `es`, `pt`, `hi`, `ko`, `zh` (lines 193–199 of the API file). Non-English users receive an English preview analysis. This is a separate bug from the Step 0 copy issue.

5. **Direct state mutations bypass store action pattern.** Lines 502–503 and 506–507: `store.cityLat = myCityLat.value`, `store.cityLng = myCityLng.value`, `store.partnerCityLat = theirCityLat.value`, `store.partnerCityLng = theirCityLng.value` directly mutate Pinia state. The `analysisStore.ts` has no `setCityLat`/`setCityLng` actions. All other store writes in the component use the existing `set*` action pattern. This is inconsistent with the store architecture.

6. **`focusedField` ref declared but never used.** Line 283: `const focusedField = ref<string | null>(null)`. No template binding, no internal reference. Dead code.

7. **Loading progress animation stops at 95% permanently.** The `fillProgress` CSS keyframe (lines 856–864) animates from `0%` to `95%` over 8 seconds with `forwards` fill. If the API takes longer than 8 seconds, the bar freezes at 95% with no visual feedback. There is no mechanism to complete to 100% on API success.

8. **No CI step prevents Railway deployment on test failure.** The `ci.yml` build job depends on `lint-and-typecheck` and `test` (line 81) but `e2e-test` is a separate parallel job with no dependency chain connecting it to deployment. If the CI build job passes while E2E tests are still running or have failed, Railway (if configured to auto-deploy on push) would deploy from the same commit.

9. **`compatibility_quiz_started` fires twice on UTM path.** When `utm_source` is present: `compatibility_landing_viewed` fires on mount (line 531), and then `compatibility_quiz_started` fires again in `startQuiz()` (line 425) when the CTA is clicked. When `utm_source` is absent: `compatibility_quiz_started` fires on mount (line 537) AND is fired again by any code path that calls `startQuiz()` — but `startQuiz()` is only called from the Step 0 CTA, which is not shown on non-UTM paths. So on the UTM path, `compatibility_quiz_started` fires once at CTA click; on the non-UTM path it fires once on mount. The naming is semantically correct per path but the event fires at different lifecycle moments depending on entry path.

---

*End of audit.*
