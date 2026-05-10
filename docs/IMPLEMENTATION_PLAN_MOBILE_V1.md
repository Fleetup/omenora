# OMENORA Mobile App — v1 Implementation Plan

**Status:** ACTIVE | Created: May 6, 2026 | Owner: Miki Jokovic, UNC Development LLC
**Source of truth:** `/docs/STRATEGY_OMENORA_MOBILE_APP_DECISIONS.md`
**Codebase:** `/Volumes/ESSD/Projects/Augur-V1/mobile-app`

---

## Rules

1. Every step is verified against the actual codebase — no duplicate files or logic created
2. Every phase must be completed and TypeScript-clean before the next begins
3. No mock data, no TODO placeholders, no hardcoded values
4. All new code uses semantic design tokens from `src/design/tokens/`
5. All new screens use React Navigation type-safe navigation
6. Check `tsc --noEmit` after each phase before proceeding

---

## Git & Branch Strategy

### Branch Model (Solo Founder)

```
main          ← protected; only merged from develop via version tag
develop       ← integration branch; all feature branches merge here
feature/phase-0   ← one branch per phase (or major step within a phase)
feature/phase-ds
feature/phase-0.5
...
hotfix/[issue]    ← branches from main; merges to both main + develop
```

### Commit Convention

Format: `[phase] scope: description`

Examples:
```
[P0] stores: remove paymentComplete bundlePurchased oraclePurchased
[DS] tokens: add colors typography spacing radius motion
[0.5] auth: implement AuthProvider anonymous bootstrap
[1] rc: add PurchasesProvider + webhook handler
[7] app.json: remove unused location camera mic permissions
```

### Phase Merge Cadence

1. Complete all steps in a phase on `feature/phase-X`
2. Run `npx tsc --noEmit` — must be 0 errors
3. Run quality gate checklist for that phase
4. Squash-merge `feature/phase-X` → `develop`
5. After Phase 1 (RC) complete and tested on device: merge `develop` → `main`, tag `v0.1.0-alpha`
6. After all phases complete and hardening passed: merge `develop` → `main`, tag `v1.0.0`
7. Create EAS production build from `main` tag

### Release Tags

| Tag | Meaning |
|---|---|
| `v0.1.0-alpha` | Auth + RC complete; internal test build |
| `v0.5.0-beta` | All screens complete; TestFlight beta |
| `v1.0.0` | Production submission build |
| `v1.0.1`, `v1.0.2` | Hotfix OTA updates |

---

## Prerequisites — External Setup Required Before Any Code

These must be completed first. They are not code tasks.

| # | Task | Blocking |
|---|---|---|
| P1 | **Apple Developer**: Enable "Sign in with Apple" capability, create Service ID, lock Team ID | Phase 0.5 | ✅ Done |
| P2 | **Google Cloud**: Create project, OAuth consent screen, 3 Client IDs (Web, iOS, Android) | Phase 0.5 | ✅ Web + iOS done · Android deferred |
| P3 | **Supabase**: Enable Apple + Google + Email providers; configure Resend SMTP for magic links | Phase 0.5 | ✅ Done (Option B — no SMTP; reuses web endpoint) |
| P4 | **Resend**: Create SMTP credentials; add domain `omenora.com`; verify DNS | Phase 0.5 | ✅ Collapsed — Option B uses existing `/api/auth/request-magic-link` |
| P5 | **App Store Connect**: Create app record, create products: `omenora_monthly`, `omenora_annual`, `omenora_calendar_2026` | Phase 1 | ⏳ Waits for D-U-N-S + identity |
| P6 | **Google Play Console**: Create app record, complete identity verification (2-7 days), create matching products | Phase 1 | ⏳ Identity verified · Android device verification in progress |
| P7 | **RevenueCat**: Create project, connect App Store + Play Console, create entitlements, offerings, placements, paywalls, webhook | Phase 1 | ⏳ Depends on P5/P6 products |
| P8 | **EAS Project**: Run `eas init` in `/mobile-app`, replace `[YOUR_EAS_PROJECT_ID]` in `app.json` | Phase 0 | ✅ Done · projectId: `8f7dfec9-fd02-4ed9-85b9-8cdbeba7c6d3` |
| P9 | **Apple Small Business Program**: Enroll at appleid.apple.com (15% vs 30% commission — do not skip) | Before launch | ⏳ Anytime before launch |
| P10 | **Sentry**: Create project, get DSN for iOS + Android | Phase DS | ⏳ Blocks DS.0 — to be done before Phase 1 |
| P11 | **PostHog**: Create project, get API key | Phase DS | ⏳ Blocks DS.0 — to be done before Phase 1 |

---

## Parallel Tracks

Work that runs on calendar time independent of dev hours. Start these on day 1 — do not leave for Phase 7.

### Track A — Verifications & Accounts

Covered in Prerequisites P1–P11. Start immediately. Google Play identity verification (P6) takes 2–7 days — the single longest blocking item.

### Track B — Hosted Pages (omenora.com — web app)

Required before any build submission. App Review will test these URLs.

| Page | URL | Required by |
|---|---|---|
| Privacy Policy | `omenora.com/privacy` | P3 (Supabase), App Store Connect, App Review |
| Terms of Service | `omenora.com/terms` | App Store Connect |
| Support / FAQ | `omenora.com/support` | App Store Connect (Support URL field) |
| Account Deletion | `omenora.com/delete-account` | Apple Guideline 5.1.1(v) — must offer web deletion path in addition to in-app |
| Counsel Guidelines | `omenora.com/counsel-guidelines` | Referenced in `CounselDisclosureModal` |

### Track C — Marketing & Store Assets

Required before submission. Creation time: 2–4 days.

**iOS (App Store Connect):**
- App icon: 1024×1024 PNG (no transparency) — `assets/icon.png` ✅ already exists — verify
- 6.7" iPhone screenshots (required): 1290×2796px minimum — 6–8 screenshots covering onboarding, Today tab, Readings, Counsel, Paywall
- 6.5" fallback screenshots: 1242×2688px — same content, resized
- App preview video (optional but recommended): 15–30s, 1080×1920, H.264, no audio required
- App name: "OMENORA — Cosmic Insights" (max 30 chars)
- Subtitle: "Your natal chart, decoded" (max 30 chars)
- Keywords: 100 chars, comma-separated — research before submission
- Description (4000 chars) + Promotional text (170 chars — changeable without resubmission)
- `What's New` text for first release

**Android (Google Play Console):**
- Feature graphic: 1024×500px
- Phone screenshots: min 2, max 8, 16:9 or 9:16
- App icon: 512×512px PNG
- Short description (80 chars) + Full description (4000 chars)

### Track D — Web App Updates

Run in parallel with mobile dev. These are web-side (Nuxt 3/Railway) and do not block mobile code.

| Task | Blocking |
|---|---|
| Add App Store + Google Play download badges to `index.vue` landing page | Post-submission |
| Add TikTok App Install pixel (separate from web conversion pixel) | First paid mobile campaign |
| Add Meta App Events SDK (for iOS ATT-compliant attribution) | First paid mobile campaign |
| Update TikTok ad landing URLs to deep-link into app (`omenora://`) | First paid mobile campaign |

> **ATT note:** TikTok and Meta App Events SDKs require an ATT (App Tracking Transparency) prompt on iOS. Do NOT include these SDKs in the v1 App Review build — ATT implementation is a v1.1 task. See Future Phases section.

---

## Critical Gaps & Blockers

Issues found during codebase analysis that would cause failures if not addressed:

| # | Gap / Blocker | Location | Resolution |
|---|---|---|---|
| G1 | `analysisStore.ts` has `paymentComplete`, `bundlePurchased`, `oraclePurchased`, `email` — wrong model | `src/stores/analysisStore.ts` | Phase 0: rewrite store, strip payment booleans + email |
| G2 | Stripe deep-link handler in `App.tsx` hardcoded to `omenora://payment/success` — blocks new auth deep-link | `App.tsx` lines 63–86 | Phase 0: remove handler entirely |
| G3 | `endpoints.ts` contains Stripe checkout session methods and daily insights subscription endpoints — dead code that references removed APIs | `src/api/endpoints.ts` | Phase 0: strip Stripe/legacy endpoints |
| G4 | `api/client.ts` auth interceptor is commented out — all API calls are unauthenticated | `src/api/client.ts` lines 15–27 | Phase 0.5: wire Supabase JWT |
| G5 | `@supabase/supabase-js`, `react-native-url-polyfill`, `@react-native-google-signin/google-signin` not installed | `package.json` | Phase 0.5: install |
| G6 | `react-native-purchases`, `react-native-purchases-ui` not installed | `package.json` | Phase 1: install |
| G7 | `lucide-react-native`, `expo-blur`, `moti` not installed | `package.json` | Phase DS: install |
| G8 | `daily_zodiac_cache` table referenced by Today tab — existence in Supabase unverified | Backend/Supabase | Verify before Phase 3; create migration if missing |
| G9 | `transfer_anonymous_to_permanent(old_id, new_id)` RPC does not exist on backend | Railway backend | Phase 0.5: build on backend |
| G10 | New auth-gated backend endpoints (`/api/reports/archetype`, `/api/counsel/message`, etc.) do not exist | Railway backend | Phase 1: build on backend |
| G11 | `eas.json` submit config has `[YOUR_APPLE_APP_ID]` placeholders; EAS project not initialized | `eas.json`, `app.json` | ✅ Resolved — P8 complete; `eas.json` submit placeholders remain (Apple App ID, ASC key) — fill when P5 done |
| G12 | `app.json` `scheme: "omenora"` is currently wired to Stripe deep-link — must be preserved for Supabase auth callback on magic link | `app.json` | No change to scheme, but remove old Linking handler in `App.tsx` |
| G13 | 3 fonts (Cormorant Garamond, Playfair Display, Inter) loaded in `App.tsx` + defined in `fonts.ts` — wasteful bundle weight | `App.tsx`, `src/theme/fonts.ts`, `package.json` | Phase DS: remove |
| G14 | `OrbitalMark` component used in `HomeScreen.tsx` but NOT present in `src/components/ui/` listing — possible uncommitted or in wrong location | `src/screens/HomeScreen.tsx` | Phase 0: verify; create if missing |
| G15 | `app.json` notification icon references `./assets/notification-icon.png` — file does not exist in `/assets/` | `app.json` | Phase 7: create asset |
| G16 | Apple sign-in only on iOS — Android users must use Google only. `AuthGate` must conditionally render Apple button based on `Platform.OS` | `AuthGate` screen | Phase 0.5 |
| G17 | `RootStackParamList` has `Preview` and `Subscription` routes that must be removed — TypeScript will error on all screens that reference them | `src/navigation/types.ts` | Phase 0: remove routes cleanly |
| G18 | `react-native-webview` (`13.13.5`) in `package.json` — not referenced anywhere in either document; likely Stripe web checkout remnant | `package.json` | Phase 0: uninstall if confirmed unused |

---

## Risk Register

Predictive failure modes. Each addressed pre-launch is a rejection cycle avoided.

| # | Risk | Prob | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Apple App Review rejection: AI/astrology content flagged as "medical claims" | High | Critical | Counsel disclosure modal required; all strings reviewed (Step 7.7g); "entertainment only" in metadata (Step 7.3a) | Dev |
| R2 | Apple rejection: paywall pattern violates 3.1.1 (external payment link or non-IAP purchase) | Med | Critical | Stripe completely removed in Phase 0; RC-only IAP; Step 7.7 checklist item confirmed | Dev |
| R3 | Google Play verification delayed >7 days, blocking Android launch | High | High | Start Play Console identity verification on day 1 (P6); iOS launch first; Android follows | Founder |
| R4 | Apple full-name capture fails — `credential.fullName` is nil even on first sign-in | Med | Med | Capture immediately per Step 0.5.8; test on real device with fresh Apple ID (simulator always returns nil) | Dev |
| R5 | RC webhook delayed >60s — user purchases but app shows "free" state | Med | High | PurchasesProvider polls `refreshCustomerInfo()` on app foreground + after paywall dismiss; show "Verifying..." toast | Dev |
| R6 | Counsel responds to harmful input before crisis detection fires | Low | Critical | Crisis detection runs client-side BEFORE API call (Step 5.2); keyword list reviewed by non-technical person | Dev + Founder |
| R7 | Anonymous→permanent transfer fails partway — user loses chart data | Med | Critical | Backend RPC is transactional (verify with Supabase `BEGIN/COMMIT`); retry logic in `AuthProvider`; show error + retry | Dev |
| R8 | Sentry does not catch native crashes (JS bridge only) | Med | Med | `enableNativeCrashHandling: true` in Sentry config (Step DS.0); verify with Sentry test crash in dev build | Dev |
| R9 | Apple sign-in returns placeholder string (e.g., "Apple" as given name) | Low | Low | Validate `givenName !== 'Apple'` and `givenName.length > 1` before saving; fallback to empty | Dev |
| R10 | First production purchase fails — sandbox tester ≠ live user behavior | Med | High | Test with real StoreKit production purchase on TestFlight (not sandbox) before public launch; document in Step 1.14 | Dev |
| R11 | Existing web Stripe subscribers see "free" state on mobile — no cross-linking in v1 | High | Med | This is a locked decision — expected behavior. Add "Web subscribers: sign in at omenora.com" note to More tab | Dev + Founder |
| R12 | Hardcoded `api.omenora.com` fallback URL in `config.ts` slips to production with dev value | Med | Critical | Audit `config.ts` and `.env` before each EAS build; add to Step 7.11 verification checklist | Dev |

---

## Phase Overview

| Phase | Name | hrs | Blocking next |
|---|---|---|---|
| **0** | Cleanup & Dead Code Removal | 4 | All |
| **DS** | Design System Foundation | 24 | All UI work |
| **0.5** | Authentication (Supabase) | 25 | RevenueCat, all protected screens |
| **1** | RevenueCat & Monetization | 32 | All premium features |
| **2** | Onboarding Rewrite | 10 | First-run UX |
| **3** | Tab Structure & Navigation | 8 | All tab content |
| **4** | Feature Screens (Calendar, Compatibility, Profile, etc.) | 13 | More tab completion |
| **5** | Counsel Chat | 8 | Counsel tab |
| **6** | More Tab & Settings | 6 | Complete navigation |
| **7** | Production Prep (assets, push, EAS, submission) | 20 | Launch |
| **Total** | | **~150 hrs** | |

---

## Phase 0 — Cleanup & Dead Code Removal

**Status:** ✅ COMPLETE — merged to develop 2026-05-06 (`30d12c0`)
**Goal:** Remove all Stripe-era code, wrong payment model, dead routes. Leave codebase in a clean, TypeScript-valid state that compiles with zero errors.
**Duration:** ~4 hrs
**Verify:** `npx tsc --noEmit` passes with 0 errors after this phase.

---

### Step 0.1 — Remove dead screens

**Files to DELETE:**
- `src/screens/PreviewScreen.tsx` — 3-tier Stripe paywall, entirely wrong model
- `src/screens/SubscriptionScreen.tsx` — `oraclePurchased` daily insights, replaced by RC customer center

---

### Step 0.2 — Clean up RootNavigator

**File:** `src/navigation/RootNavigator.tsx`

Remove:
- Import of `PreviewScreen`
- Import of `SubscriptionScreen`
- `<Stack.Screen name="Preview" ...>`
- `<Stack.Screen name="Subscription" ...>`

---

### Step 0.3 — Clean up navigation types

**File:** `src/navigation/types.ts`

Remove from `RootStackParamList`:
- `Preview: { reportId?: string } | undefined`
- `Subscription: undefined`

Remove:
- `PreviewScreenProps` type export
- `SubscriptionScreenProps` type export

---

### Step 0.4 — Rewrite analysisStore

**File:** `src/stores/analysisStore.ts`

Remove fields:
- `email` — auth is via Supabase, no email stored in app store
- `paymentComplete` — replaced by RC `isPremium` entitlement
- `bundlePurchased` — same
- `oraclePurchased` — same

Remove actions:
- `setEmail`
- `setPaymentComplete`
- `setBundlePurchased`
- `setOraclePurchased`

Remove from `persist.partialize`:
- `email`, `paymentComplete`, `bundlePurchased`, `oraclePurchased`

Keep all birth data fields: `firstName`, `dateOfBirth`, `timeOfBirth`, `city`, `answers`, `lifePathNumber`, `archetype`, `reportId`, `report`, `tempId`, `regionOverride`, `languageOverride`.

Rename file to `src/stores/profileStore.ts` and export `useProfileStore`.

> **Note:** `tempId` maps to the anonymous Supabase user_id going forward — rename to `anonymousUserId` for clarity.

---

### Step 0.5 — Strip Stripe handler from App.tsx

**File:** `App.tsx`

Remove:
- `handleDeepLink` callback (lines 63–86)
- Both `Linking.addEventListener` + `Linking.getInitialURL` useEffect (lines 88–95)
- `api` import from `./src/api/endpoints`
- `store.setPaymentComplete`, `store.setBundlePurchased`, `store.setOraclePurchased` references

Update `initializeStore` call to use renamed `useProfileStore`.

---

### Step 0.6 — Strip Stripe endpoints from API layer

**File:** `src/api/endpoints.ts`

Remove entirely:
- `MobileProductType` type
- `CreateMobileCheckoutSessionRequest` interface
- `CreateMobileCheckoutSessionResponse` interface
- `VerifyMobileCheckoutSessionResponse` interface
- `createMobileCheckoutSession` function
- `verifyMobileCheckoutSession` function
- `verifyPayment` function
- `subscribeToDailyInsights` function
- `saveReport` function (no longer needed — reports tied to Supabase user_id, not session)

Keep:
- `generateReport` — still used during onboarding (Swiss Ephemeris computation)
- `generateBirthChart`
- `generateCompatibility`
- `generateCalendar`, `getCalendar`
- `generateDailyInsight`
- `checkReportExists`
- `getReport`
- `healthCheck`
- `detectRegion`

> **Note:** After Phase 0.5, the client interceptor will inject Supabase JWT into all remaining endpoints.

**Uninstall orphaned native module (G18):**
```bash
npm uninstall react-native-webview
```
`react-native-webview` was a Stripe web checkout remnant; no longer referenced in any code. Removing reduces native binary size and attack surface.

---

### Step 0.7 — Verify OrbitalMark component

**Check:** `grep -r "OrbitalMark" src/screens/HomeScreen.tsx`

If `OrbitalMark` is imported but does not exist in `src/components/ui/`:
- Create `src/components/ui/OrbitalMark.tsx` — animated orbital ring (SVG circle + Reanimated rotation)
- Export from `src/components/ui/index.ts`

---

### Step 0.8 — Remove legacy gradients from colors.ts

**File:** `src/theme/colors.ts`

Remove from `colors.gradients`:
- `primary: ['rgba(140, 110, 255, 0.88)', 'rgba(140, 110, 255, 1)']` — marked in code as "legacy — remove on PreviewScreen redesign"
- `goldPurple: ['rgba(140, 110, 255, 0.55)', 'rgba(201, 168, 76, 0.55)']` — marked "legacy — remove on screen redesign"

Keep `cosmic` gradient.

---

### Step 0.9 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Resolve all resulting type errors from removed routes, stores, and imports. Do NOT proceed to Phase DS until output is zero errors.

---

### Phase 0 — Quality Gate

Definition of done. All items must pass before starting Phase DS.

- [x] `npx tsc --noEmit` → 0 errors
- [x] `grep -r "paymentComplete\|bundlePurchased\|oraclePurchased" src/` → 0 results
- [x] `grep -r "PreviewScreen\|SubscriptionScreen" src/` → 0 results
- [x] `grep -r "verifyMobileCheckoutSession\|createMobileCheckoutSession" src/` → 0 results
- [x] `grep -r "omenora://payment" src/` → 0 results
- [x] `src/stores/profileStore.ts` exists; `src/stores/analysisStore.ts` deleted
- [x] `react-native-webview` removed from `package.json` (G18)
- [x] `npm ls react-native-webview` → "(empty)"
- [x] App boots in Expo Go or dev build without runtime errors

---

## Phase DS — Design System Foundation

**Status:** ✅ COMPLETE — 15 commits, merged to develop 2026-05-07
**Goal:** Establish complete semantic token system, refactor ThemeProvider, reorganize and complete component library. All subsequent screen work consumes tokens and components from this system.
**Duration:** ~24 hrs (actual: ~6 hrs across one session for DS.1-DS.18)
**Verify:** `npx tsc --noEmit` passes; run dev preview screen on simulator to visually confirm all atoms/organisms render correctly.

---

### Step DS.0 — Install observability stack

**Status:** ⏸ DEFERRED — blocked by P10 (Sentry project) and P11 (PostHog project). To be completed before Phase 1.

Install before any feature code — errors must be catchable from first commit.

```bash
npx expo install @sentry/react-native posthog-react-native
```

**Sentry init** — add to `App.tsx`, before any other imports:
```typescript
import * as Sentry from '@sentry/react-native'
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.2,
  enableNativeCrashHandling: true,
})
```

**PostHog init** — wrap `App.tsx` root with `PostHogProvider`:
```typescript
import PostHog, { PostHogProvider } from 'posthog-react-native'
const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: 'https://app.posthog.com',
  captureMode: 'form',
})
// Wrap NavigationContainer with <PostHogProvider client={posthog}>
```

**Mobile event taxonomy** — create new file `src/lib/analytics.ts` with typed event helpers. 19 events to wire across phases:
- Phase 2 (Onboarding): `onboarding_started`, `birth_info_submitted`, `big_three_revealed`, `optional_questions_completed`, `optional_questions_skipped`
- Phase 0.5 (Auth): `auth_gate_shown`, `auth_completed` (+ `method`), `auth_skipped`
- Phase 1 (RC): `paywall_shown` (+ `placement`), `paywall_dismissed`, `purchase_completed`, `purchase_failed`, `restore_attempted`
- Phase 5 (Counsel): `counsel_chat_started`, `counsel_message_sent`, `daily_limit_hit`
- Phases 4 + 6: `feature_locked_tapped` (+ `feature`), `account_deleted`, `subscription_cancelled`

> Note: Event wiring happens in each phase as the screens are built. The taxonomy file is created here so import paths exist from day one.

---

### Step DS.1 — Install new packages

**Status:** ✅ DONE — commit `5603f9d` (2026-05-07)

```bash
npx expo install lucide-react-native expo-blur moti expo-haptics
```

> `react-native-reanimated` already installed (`~3.17.4`) — Moti depends on it. ✅
> `react-native-svg` already installed (`15.11.2`) — Lucide React Native depends on it. ✅
> `expo-haptics` — required for `Button` atom press feedback and `LockedCard` unlock confirmation per Design System locked decisions ("use expo-haptics").

---

### Step DS.2 — Remove dead font packages

**Status:** ⏸ DEFERRED to Phase 7

> **[DECISION 2026-05-07]** Initial attempt revealed token-namespace coupling: `src/theme/fonts.ts` defines `fonts.cormorant`, `fonts.playfair`, `fonts.inter` — these names are referenced by 17 legacy screen/component files that are not migrated until their owning phases (2-6). Removing the packages now while consumers still reference the tokens breaks 71 tsc errors. Defer cleanup to Phase 7 production prep, after all screens have been rebuilt onto new typography tokens. Deferred packages remain in `package.json`: `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/playfair-display`, `@expo-google-fonts/inter`.

**File:** `package.json`

Remove from `dependencies`:
- `@expo-google-fonts/cormorant-garamond`
- `@expo-google-fonts/playfair-display`
- `@expo-google-fonts/inter`

```bash
npm uninstall @expo-google-fonts/cormorant-garamond @expo-google-fonts/playfair-display @expo-google-fonts/inter
```

---

### Step DS.3 — Clean App.tsx font loading

**Status:** ⏸ DEFERRED to Phase 7 (paired with DS.2)

**File:** `App.tsx`

Remove imports and `useFonts` entries for:
- `CormorantGaramond_300Light`, `CormorantGaramond_300Light_Italic`, `CormorantGaramond_500Medium`
- `PlayfairDisplay_400Regular`, `PlayfairDisplay_400Regular_Italic`
- `Inter_300Light`, `Inter_400Regular`, `Inter_500Medium`

Keep:
- All `Fraunces_*` variants
- All `HankenGrotesk_*` variants

---

### Step DS.4 — Create design token directory structure

**Status:** ✅ DONE — commit `e9012f3` (2026-05-07, bundled DS.4-DS.10)

Create the following new files (directory `src/design/` does not exist yet):

```
src/design/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── motion.ts
│   └── index.ts
├── theme/
│   ├── ThemeProvider.tsx
│   └── useTheme.ts
└── illustrations/     (empty dir, for future SVG assets)
```

---

### Step DS.5 — Create src/design/tokens/colors.ts

**Status:** ✅ DONE — commit `e9012f3`

Semantic token values per locked decisions:

```typescript
export const surface = {
  base:    '#050410',
  raised:  '#0B0A1F',
  overlay: '#13122A',
  floating:'#1B1A35',
  inverse: '#EDEDED',
} as const

export const text = {
  primary:   'rgba(255,255,255,0.93)',
  secondary:  'rgba(255,255,255,0.68)',
  tertiary:   'rgba(255,255,255,0.45)',
  disabled:   'rgba(255,255,255,0.30)',
  inverse:    '#050410',
  accent:     '#C9A961',
} as const

export const accent = {
  primary:  '#C9A961',
  emphasis: '#E0C078',
  subtle:   'rgba(201,169,97,0.10)',
  muted:    'rgba(201,169,97,0.04)',
} as const

export const border = {
  subtle:  'rgba(255,255,255,0.06)',
  default: 'rgba(255,255,255,0.10)',
  strong:  'rgba(255,255,255,0.18)',
  accent:  'rgba(201,169,97,0.40)',
} as const

export const state = {
  success: '#5EBE8A',
  warning: '#D9A24A',
  danger:  '#E07D7D',
  info:    '#7AA0E0',
} as const

export const specialty = {
  lockScrim:   'rgba(5,4,16,0.65)',
  lockBlur:    40,
  chatUser:    '#13122A',
  chatCounsel: 'rgba(201,169,97,0.10)',
} as const

export const tokens = { surface, text, accent, border, state, specialty } as const
export type DesignTokens = typeof tokens
```

> **Migration note:** `src/theme/colors.ts` keeps existing exports untouched during this phase — screens still reference old tokens. Migration of existing screens happens per-phase as each screen is rebuilt. Do NOT refactor old screens in bulk here.

---

### Step DS.6 — Create src/design/tokens/typography.ts

**Status:** ✅ DONE — commit `e9012f3`

```typescript
export const fontFamily = {
  display: 'Fraunces_300Light',
  displayItalic: 'Fraunces_300Light_Italic',
  displayMedium: 'Fraunces_500Medium',
  ui: 'HankenGrotesk_400Regular',
  uiMedium: 'HankenGrotesk_500Medium',
  uiSemiBold: 'HankenGrotesk_600SemiBold',
} as const

export const typeScale = {
  display1: { fontFamily: fontFamily.display,    fontSize: 40, lineHeight: 48, letterSpacing: -0.5 },
  display2: { fontFamily: fontFamily.display,    fontSize: 32, lineHeight: 40, letterSpacing: -0.4 },
  heading1: { fontFamily: fontFamily.displayMedium, fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  heading2: { fontFamily: fontFamily.uiSemiBold, fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  bodyLarge:{ fontFamily: fontFamily.ui,         fontSize: 17, lineHeight: 26, letterSpacing: 0 },
  body:     { fontFamily: fontFamily.ui,         fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  label:    { fontFamily: fontFamily.uiMedium,   fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  caption:  { fontFamily: fontFamily.ui,         fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  micro:    { fontFamily: fontFamily.uiSemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' as const },
} as const
```

---

### Step DS.7 — Create src/design/tokens/spacing.ts

**Status:** ✅ DONE — commit `e9012f3`

```typescript
export const space = {
  '0.5': 2,  '1': 4,   '1.5': 6,
  '2': 8,    '3': 12,  '4': 16,
  '5': 20,   '6': 24,  '8': 32,
  '10': 40,  '12': 48, '16': 64,
  '20': 80,  '24': 96,
} as const

export const layout = {
  screenPadding: 20,
  cardPaddingCompact: 16,
  cardPaddingDefault: 20,
  cardPaddingPremium: 24,
  cardGap: 12,
  sectionGap: 32,
  tapTarget: 44,
} as const
```

---

### Step DS.8 — Create src/design/tokens/radius.ts

**Status:** ✅ DONE — commit `e9012f3`

```typescript
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 32,
  pill: 999,
} as const
```

---

### Step DS.9 — Create src/design/tokens/motion.ts

**Status:** ✅ DONE — commit `e9012f3`

```typescript
export const duration = {
  micro:      150,
  fast:       200,
  default:    250,
  transition: 300,
  hero:       500,
} as const

export const easing = {
  enter:      'easeOut',
  exit:       'easeIn',
  transition: 'easeInOut',
} as const

export const stagger = {
  child: 60,
  maxVisible: 4,
} as const
```

---

### Step DS.10 — Create src/design/tokens/index.ts

**Status:** ✅ DONE — commit `e9012f3`

```typescript
export * from './colors'
export * from './typography'
export * from './spacing'
export * from './radius'
export * from './motion'
```

---

### Step DS.11 — Refactor ThemeProvider + create useTheme hook

**Status:** ✅ DONE — commit `792db1c` (2026-05-07, boot-tested)

**File:** `src/design/theme/ThemeProvider.tsx`

Replace the current `src/theme/ThemeProvider.tsx` which only wraps a LinearGradient. New version:
- Creates a React context that provides `tokens` (all design tokens)
- Wraps children in the same `LinearGradient` background (`#050410` → `#050410`)
- Detects and exposes `reduceMotion` via `AccessibilityInfo.isReduceMotionEnabled()`

**File:** `src/design/theme/useTheme.ts`

```typescript
import { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'
export const useTheme = () => useContext(ThemeContext)
```

**Migration:** Update `App.tsx` to import `ThemeProvider` from `src/design/theme/ThemeProvider` instead of `src/theme/ThemeProvider`. Keep old file in place — it is still imported by any existing screens that haven't been migrated yet.

---

### Step DS.12 — Reorganize components directory

**Status:** ✅ DONE — commit `e67d7a1` (2026-05-07)

Create new directories:
```
src/components/atoms/
src/components/molecules/
src/components/organisms/
src/components/templates/
```

**Do NOT move existing `src/components/ui/` files yet** — existing screens import from `src/components/ui/`. Moving them now breaks all existing screens. New components go into the new hierarchy. Existing components migrate one-by-one as their consuming screens are rebuilt.

---

### Step DS.13 — Build atom components

**Status:** ✅ DONE — commit `38d0782` (2026-05-07, 8 atoms + barrel, 621 lines)

Create in `src/components/atoms/`:

| File | Maps to existing? | Notes |
|---|---|---|
| `Text.tsx` | No | Wraps RN `<Text>`, applies `typeScale` token by `variant` prop |
| `Icon.tsx` | No | Wraps Lucide icon; `size` default 20, `color` default `text.secondary` |
| `Button.tsx` | `CTAButton.tsx` exists | New version uses design tokens; variants: `primary`/`secondary`/`tertiary`/`danger` |
| `Chip.tsx` | `TraitPill.tsx` + `QuizOptionCard.tsx` exist | Selection + label variants |
| `Badge.tsx` | `GhostBadge.tsx` exists | Variants: `pro`/`new`/`count` |
| `Divider.tsx` | `EditorialRule.tsx` + `ShortRule.tsx` exist | Variants: `default`/`gold` |
| `Skeleton.tsx` | No | Animated shimmer placeholder |
| `TextInput.tsx` | `EditorialInput.tsx` exists | Token-driven, with error state |

> Existing `src/components/ui/` files are NOT deleted. They co-exist until their screens are rebuilt.

---

### Step DS.14 — Build molecule components

**Status:** ✅ DONE — split into 2 commits: `20cc6a2` (1/2: 5 simple molecules) + `08dfdef` (2/2: 3 form fields + Nominatim helper)

> **[DECISION 2026-05-07]** Split into 2 commits because of complexity asymmetry: TextField/ListItem/ChipGroup/ProgressDots/Toast are pure atom composition; DateField/TimeField/CityField involve platform-specific pickers (`@react-native-community/datetimepicker` with Android imperative API + iOS modal pattern) and Nominatim API integration (debounce + abort + rate-limit). Splitting kept commit 1/2 verifiable independently before tackling the higher-risk form fields.

Create in `src/components/molecules/`:

| File | Notes |
|---|---|
| `TextField.tsx` | `Label` + `TextInput` atom + helper/error text |
| `DateField.tsx` | `Label` + date picker trigger (uses `@react-native-community/datetimepicker` — already installed ✅) |
| `TimeField.tsx` | `Label` + time picker + "I don't know my birth time" toggle |
| `CityField.tsx` | `Label` + autocomplete `TextInput` + results dropdown (Nominatim API, rate-limit: 1 req/sec debounce) |
| `ListItem.tsx` | Icon + label + meta + optional chevron |
| `ChipGroup.tsx` | Multiple `Chip` atoms with single/multi selection state |
| `ProgressDots.tsx` | Carousel position indicator |
| `Toast.tsx` | Auto-dismissing notification (success/warning/danger/info variants) |

> `ProgressBar` already exists in `src/components/ui/ProgressBar.tsx` — do NOT recreate. Reference existing.

---

### Step DS.15 — Build critical organism components

**Status:** ✅ DONE — split into 2 commits: `c56a43d` (1/2: 6 generic organisms + GestureHandlerRootView) + `436e06d` (2/2: LockedCard + 3 content cards)

> **[DECISION 2026-05-07]** Split into 2 commits because LockedCard is the conversion-critical paywall surface and warrants careful execution with fresh attention. DS.15a bundled the 6 generic organisms (Card, SectionHeader, Header, Modal, BottomSheet, ChatBubble) plus the `GestureHandlerRootView` wiring fix in App.tsx (audit caught it was missing — silent runtime failure for any gesture-based component). DS.15b followed with the conversion-domain cards. Boot-tested after DS.15a confirmed gradient + tab navigation still rendered.

Create in `src/components/organisms/`:

| File | Notes |
|---|---|
| `Card.tsx` | Variants: `default` (`surface.raised`), `raised` (`surface.overlay`), `premium` (`surface.raised` + `border.accent`) |
| `LockedCard.tsx` | **Conversion-critical.** Wraps any content: shows top portion, then blur (using `expo-blur <BlurView>`) + `lock.scrim` overlay + gold lock icon + "Unlock" CTA. Accepts `placement` prop → triggers `presentPaywallIfNeeded`. |
| `DailyCard.tsx` | Today tab daily content card (date, moon phase, horoscope text) |
| `ReadingCard.tsx` | Readings tab card (archetype / natal / forecast pattern) |
| `TransitCard.tsx` | Single transit (planet icon + interpretation text) |
| `ChatBubble.tsx` | Variants: `user` (right-aligned, `surface.overlay`), `counsel` (left-aligned, `accent.subtle`), `system` (centered, `text.tertiary`) |
| `SectionHeader.tsx` | Title + optional CTA + optional gold hairline rule |
| `BottomSheet.tsx` | Modal bottom sheet using `react-native-gesture-handler` pan gesture + `react-native-reanimated`; `surface.floating` background |
| `Header.tsx` | Back button + centered title + optional right action; uses `Icon` atom for back arrow |
| `Modal.tsx` | Full-screen modal wrapper with close button |

---

### Step DS.16 — Build template wrappers

**Status:** ✅ DONE — commit `32b4b9a` (2026-05-07, 5 templates)

Create in `src/components/templates/`:

| File | Notes |
|---|---|
| `ScreenWrapper.tsx` | `SafeAreaView` + `ScrollView` (optional) + `surface.base` background + `layout.screenPadding` horizontal padding |
| `OnboardingStep.tsx` | `ProgressBar` at top + heading slot + content slot + bottom CTA slot |
| `PaywallShell.tsx` | Hero + feature list + plan selector + primary CTA + legal footer; used as base when building RC paywall template |
| `EmptyState.tsx` | Sacred geometry SVG + heading + body + optional CTA |
| `ErrorState.tsx` | Same shape as `EmptyState`, `state.danger` themed |

---

### Step DS.17 — Update TabNavigator to use Lucide icons

**Status:** ✅ DONE — commit `fa1ea88` (2026-05-07, boot-tested)

> **[DECISION 2026-05-07]** Scope expanded beyond plan as written. Plan said "replace Ionicons with Lucide" but TabNavigator + RootNavigator both used legacy `colors.*` and `fonts.*` token imports. Since we were already editing the file and navigation infrastructure sits between phases (no Phase X explicitly rebuilds it), migrated those tokens to the new design system in the same commit. Tab bar background changed visually from `colors.bone` (off-white) to `tokens.surface.base` (cosmic dark) — significant visual upgrade, blends seamlessly with the gradient. `strokeWidth: 2` for focused tabs, `1.5` for unfocused — Lucide's standard active/inactive pattern.

**File:** `src/navigation/TabNavigator.tsx`

Replace Ionicons imports with Lucide:
- `HomeTab` → `Sun` icon (today/daily)
- `ReadingsTab` → `BookOpen` icon
- `CounselTab` → `MessageCircle` icon
- `MoreTab` → `MoreHorizontal` icon

Update tab labels: `Home → Today`, `Reading → Readings`, `Explore → Counsel`.
Update `TAB_CONFIG` keys to match renamed `TabParamList` (done in Phase 3).

> Icon switch only in this step — tab content screens are rebuilt in Phase 3. Keep existing screen components assigned temporarily.

---

### Step DS.18 — Dev preview screen

**Status:** ✅ DONE — commit `8d173ac` (2026-05-07, all 31 components rendered on device after local rebuild)

> **[DECISION 2026-05-07]** Used `__DEV__` JSX-gate pattern (always-import the screen file, conditionally render `<Stack.Screen>` with `{__DEV__ && ...}`). Metro tree-shakes the dev-only branch from production bundles automatically. Discovery via dev-only `ListItem` in MoreScreen (conditional spread into existing `menuItems` array). MoreScreen's legacy theme tokens NOT migrated — out of scope (Phase 6). LockedCard's BlurView initially failed to render with stale dev client; resolved with `npx expo prebuild --platform ios --clean` + `npx expo run:ios --device` to rebuild dev client with new native modules (`expo-blur`, `expo-haptics`, `react-native-gesture-handler`).

Create `src/screens/dev/ComponentsScreen.tsx`:
- Renders all atoms, molecules, organisms in one scrollable screen
- Accessed via a hidden route in `RootNavigator` (dev builds only, guarded by `__DEV__`)
- Used for visual QA on simulator before each phase

---

### Step DS.19 — TypeScript clean pass

**Status:** ✅ DONE — verified at merge (2026-05-07)

```bash
npx tsc --noEmit
```

Zero errors required before Phase 0.5.

---

### Phase DS — Quality Gate

Definition of done. All items must pass before starting Phase 0.5.

- [x] `npx tsc --noEmit` → 0 errors
- [x] Dev preview screen (`ComponentsScreen`) renders all atoms, molecules, organisms without crash on iOS device (verified 2026-05-07 after local rebuild)
- [x] All token files present: `src/design/tokens/{colors,typography,spacing,radius,motion,index}.ts`
- [ ] `grep -r "CormorantGaramond\|PlayfairDisplay\|Inter_" src/` → 0 results — **DEFERRED to Phase 7 (DS.2/DS.3)**
- [x] `grep -r "Ionicons" src/navigation/TabNavigator.tsx` → 0 results (Lucide replaced)
- [x] `lucide-react-native`, `expo-blur`, `moti`, `expo-haptics` present in `package.json`
- [ ] `@sentry/react-native`, `posthog-react-native` present in `package.json` (Step DS.0) — **DEFERRED — blocked by P10/P11**
- [ ] Sentry test crash captured in dev build → visible in Sentry dashboard within 60s — **DEFERRED**
- [ ] PostHog test event fired → visible in PostHog Live Events within 60s — **DEFERRED**
- [ ] `src/lib/analytics.ts` exists with all 19 typed event helpers — **DEFERRED to Phase 0.5 (file creation)**

---

## Phase 0.5 — Authentication (Supabase)

**Goal:** Implement anonymous-first auth with Apple, Google, and email magic link. Anonymous bootstrap on launch. AuthGate modal before paywall. Manual anon→permanent transfer via backend RPC.
**Duration:** ~25 hrs
**Prerequisites:** P1 (Apple Developer), P2 (Google Cloud), P3 (Supabase providers), P4 (Resend SMTP) must be complete.
**Verify:** Real device test — all 3 sign-in providers work; anon→permanent transfer preserves birth data; sign out clears session; restore on reinstall.

---

### Step 0.5.1 — Install auth packages

```bash
npx expo install @supabase/supabase-js react-native-url-polyfill
npm install @react-native-google-signin/google-signin
```

> `@react-native-async-storage/async-storage` already installed (`2.1.2`) ✅
> `expo-web-browser` already installed (`~14.2.0`) ✅ — used for magic link email redirect

---

### Step 0.5.2 — Add environment variables

**File:** `.env` (create if not present; add to `.gitignore`)

```
EXPO_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

> `EXPO_PUBLIC_` prefix makes these accessible in app code via `process.env`.

---

### Step 0.5.3 — Create Supabase client

**File:** `src/lib/supabase.ts` (new file — `src/lib/` directory does not yet exist)

```typescript
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

### Step 0.5.4 — Run Supabase schema migrations

Run on Supabase SQL editor (from locked decisions doc):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_from_anonymous_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_anonymous_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id) WHERE apple_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_user_id ON users(google_user_id) WHERE google_user_id IS NOT NULL;
```

> Verify `users` table exists before running. If not, create it first with `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

---

### Step 0.5.5 — Build AuthProvider context

**File:** `src/context/AuthProvider.tsx` (new file — `src/context/` does not yet exist)

Provides:
- `session: Session | null`
- `user: User | null`
- `isAnonymous: boolean`
- `isLoading: boolean`
- `signInWithApple: () => Promise<void>`
- `signInWithGoogle: () => Promise<void>`
- `signInWithMagicLink: (email: string) => Promise<void>`
- `signOut: () => Promise<void>`
- `deleteAccount: () => Promise<void>`

On mount:
1. Subscribe to `supabase.auth.onAuthStateChange`
2. If no session → call `supabase.auth.signInAnonymously()`
3. Set `isAnonymous` from `session.user.is_anonymous`

---

### Step 0.5.6 — Wrap App.tsx with AuthProvider

**File:** `App.tsx`

Add `AuthProvider` wrapping inside `ThemeProvider`, outside `NavigationContainer`:

```tsx
<ThemeProvider>
  <AuthProvider>
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  </AuthProvider>
</ThemeProvider>
```

---

### Step 0.5.7 — Wire Supabase JWT into API client

**File:** `src/api/client.ts`

Replace the commented-out interceptor with:

```typescript
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

Import `supabase` from `../lib/supabase`.

---

### Step 0.5.8 — Implement Sign in with Apple

**In `AuthProvider.signInWithApple`:**

```typescript
import * as AppleAuthentication from 'expo-apple-authentication'

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
})

const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'apple',
  token: credential.identityToken!,
})

// One-shot: capture full name on first sign-in only
if (credential.fullName?.givenName) {
  await supabase.auth.updateUser({
    data: {
      first_name: credential.fullName.givenName,
      last_name: credential.fullName.familyName ?? '',
    },
  })
}
```

> Apple never returns `fullName` again after first sign-in. Save immediately or it is lost permanently.
> `expo-apple-authentication` already installed (`~7.2.4`) ✅
> Plugin already in `app.json` ✅

---

### Step 0.5.9 — Implement Sign in with Google

**In `AuthProvider.signInWithGoogle`:**

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin'

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
})

await GoogleSignin.hasPlayServices()
const userInfo = await GoogleSignin.signIn()
const { idToken } = await GoogleSignin.getTokens()

await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: idToken!,
})
```

Add to `.env`:
```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=[FROM_GOOGLE_CLOUD]
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=[FROM_GOOGLE_CLOUD]
```

Add `@react-native-google-signin/google-signin` plugin to `app.json` plugins array.

---

### Step 0.5.10 — Implement magic link email flow

**In `AuthProvider.signInWithMagicLink`:**

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: 'omenora://auth/callback',
    shouldCreateUser: true,
  },
})
```

> The `omenora://` scheme already exists in `app.json` ✅
> Add `omenora://auth/callback` to Supabase allowed redirect URLs in dashboard.
> Handle the deep-link callback in `App.tsx` using `Linking.addEventListener` — extract token from URL, call `supabase.auth.exchangeCodeForSession`.

---

### Step 0.5.11 — Build AuthGate screen

**File:** `src/screens/AuthGateScreen.tsx` (new)

Presented as a `BottomSheet` organism (not full-screen push).

Content:
- Headline: "Save your chart and continue"
- `[Sign in with Apple]` — only on `Platform.OS === 'ios'`
- `[Sign in with Google]`
- `[Continue with email]` (opens magic link sub-flow)
- Privacy footnote with link to `omenora.com/privacy`
- On success: calls `transferAnonymousToPermanent` then dismisses

Add to `RootStackParamList`:
```typescript
AuthGate: undefined
```

Present as modal: `presentation: 'transparentModal'` in `RootNavigator`.

---

### Step 0.5.12 — Build backend RPC: transfer_anonymous_to_permanent

**On Railway backend (Nuxt 3):**

New endpoint: `POST /api/auth/transfer-anonymous`

```
Headers: Authorization: Bearer <supabase_jwt>
Body: { old_anonymous_id: string }

Steps:
1. Verify JWT → get new permanent user_id
2. SELECT * FROM users WHERE id = old_anonymous_id AND is_anonymous = TRUE
3. Copy: dateOfBirth, timeOfBirth, city, archetype, sun_sign, life_path_number, natal_chart
   INTO permanent user row
4. UPDATE old_anonymous row: set previous_anonymous_user_id ref, orphan
5. UPDATE new permanent row: converted_from_anonymous_at = NOW(), is_anonymous = FALSE
6. Return 200 OK
```

Add to `src/api/endpoints.ts`:

```typescript
transferAnonymousToPermanent: async (oldAnonymousId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post('/api/auth/transfer-anonymous', { old_anonymous_id: oldAnonymousId })
  return response.data
},
```

---

### Step 0.5.13 — Anonymous bootstrap on app launch

**In `AuthProvider` mount logic:**

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    const { data } = await supabase.auth.signInAnonymously()
    setSession(data.session)
    setUser(data.session?.user ?? null)
    setIsAnonymous(true)
  } else {
    setSession(session)
    setUser(session.user)
    setIsAnonymous(session.user.is_anonymous ?? false)
  }
})
```

---

### Step 0.5.14 — Sign out flow with anonymous-loss warning

**In `AuthProvider.signOut`:**

```typescript
if (isAnonymous) {
  // Show warning dialog before proceeding
  // "Your chart and readings cannot be recovered. Continue?"
  // Confirmation required
}
await supabase.auth.signOut()
// RC logout handled in Phase 1 — add Purchases.logOut() call here after Phase 1 is complete
await AsyncStorage.clear()
```

---

### Step 0.5.15 — Account deletion flow (Apple-required)

**File:** `src/screens/DeleteAccountScreen.tsx` (new — built in Phase 6)

Backend endpoint: `DELETE /api/auth/account`
```
1. Verify JWT
2. Soft-delete or hard-delete user row (per privacy policy)
3. Revoke Supabase auth
4. Cancel active RC subscriptions via RC REST API
5. Return 200 OK
```

> Full implementation in Phase 6 — placeholder step here for Phase 0.5 planning.

---

### Step 0.5.16 — Update profileStore with anonymousUserId

**File:** `src/stores/profileStore.ts`

Add field: `anonymousUserId: string` (replaces old `tempId`)
Add action: `setAnonymousUserId: (id: string) => void`

Persist: yes.

Set this from `AuthProvider` after anonymous bootstrap completes.

---

### Step 0.5.17 — Test checklist (real device required)

- [ ] Fresh install → anonymous session created automatically
- [ ] Sign in with Apple → full name captured on first sign-in
- [ ] Sign in with Apple (second time) → no name returned (expected)
- [ ] Sign in with Google (iOS + Android)
- [ ] Magic link email received via Resend → deep-link opens app → session established
- [ ] Anon→permanent transfer: birth data preserved on new permanent user
- [ ] Sign out (anonymous) → warning shown → session cleared
- [ ] Sign out (permanent) → session cleared, RC logout (after Phase 1)
- [ ] Reinstall → sign in restores existing permanent account
- [ ] Android: Apple sign-in button not shown

---

## Phase 1 — RevenueCat & Monetization

**Goal:** Install RC SDK, build PurchasesProvider, wire all 7 paywall placements, implement webhook handler, build backend report gating, run Supabase schema migrations.
**Duration:** ~32 hrs
**Prerequisites:** Phase 0.5 complete. P5 (App Store Connect products), P6 (Google Play products), P7 (RevenueCat dashboard) must be complete.
**Verify:** Sandbox purchase on real device (EAS dev build). Webhook fires → Supabase `is_premium` updates. Premium content unlocks after purchase. Calendar IAP works independently.

---

### Step 1.1 — RevenueCat dashboard setup

Complete all items from locked decisions checklist (external, non-code):

- Create project, connect stores
- Products: `omenora_monthly`, `omenora_annual`, `omenora_calendar_2026`
- Entitlements: `premium`, `calendar_2026`
- Offerings: `default`, `calendar_only`
- 7 Placements: `onboarding_end`, `feature_archetype`, `feature_compatibility`, `feature_counsel`, `feature_calendar`, `feature_natal_chart`, `feature_forecast`
- 4 Paywalls in Paywall Editor
- Webhook: `https://api.omenora.com/api/revenuecat/webhook`, all events enabled

---

### Step 1.2 — Install RC SDK

```bash
npx expo install react-native-purchases react-native-purchases-ui expo-dev-client
```

> `expo-dev-client` already installed (`~5.2.4`) ✅ — confirm version is compatible with RC SDK.
> **Cannot test RevenueCat in Expo Go** — EAS dev build required for all RC testing.

---

### Step 1.3 — Add RC environment variables

```
EXPO_PUBLIC_RC_APPLE_KEY=[FROM_REVENUECAT_DASHBOARD]
EXPO_PUBLIC_RC_GOOGLE_KEY=[FROM_REVENUECAT_DASHBOARD]
RC_WEBHOOK_SECRET=[FROM_REVENUECAT_DASHBOARD]   ← backend only, NOT EXPO_PUBLIC_
```

---

### Step 1.4 — Initialize RC SDK in App.tsx

**File:** `App.tsx`

Add inside `useEffect` on mount, after fonts + store init:

```typescript
import { Platform } from 'react-native'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE)
if (Platform.OS === 'ios') {
  Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_APPLE_KEY! })
} else if (Platform.OS === 'android') {
  Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY! })
}
```

---

### Step 1.5 — Build PurchasesProvider context

**File:** `src/context/PurchasesProvider.tsx` (new)

Provides:
- `customerInfo: CustomerInfo | null`
- `isPremium: boolean` — derived from `entitlements.active['premium']`
- `hasCalendar: boolean` — derived from `entitlements.active['calendar_2026']`
- `currentOffering: PurchasesOffering | null`
- `presentPaywall: (placement: string, customVariables?: object) => Promise<PAYWALL_RESULT>`
- `refreshCustomerInfo: () => Promise<void>`

Subscribe to RC updates: `Purchases.addCustomerInfoUpdateListener`.

**File:** `src/context/index.ts` — export both `AuthProvider` and `PurchasesProvider`.

---

### Step 1.6 — Wrap App.tsx with PurchasesProvider

`PurchasesProvider` must be inside `AuthProvider` (needs auth context for `Purchases.logIn`):

```tsx
<AuthProvider>
  <PurchasesProvider>
    <NavigationContainer ref={navigationRef}>
      ...
    </NavigationContainer>
  </PurchasesProvider>
</AuthProvider>
```

---

### Step 1.7 — Wire RC logIn to auth state changes

**In `AuthProvider`** — after any successful sign-in:

```typescript
import Purchases from 'react-native-purchases'

// After anonymous bootstrap:
await Purchases.logIn(anonymousUserId)

// After permanent sign-in + transfer:
await Purchases.logIn(permanentUserId)  // RC aliases anonymous → permanent

// After sign out:
await Purchases.logOut()
```

---

### Step 1.8 — Wire RC custom attributes

After permanent sign-in and profile data available:

```typescript
await Purchases.setAttributes({
  primary_goal: profile.primaryGoal ?? 'GENERAL',
  archetype:    profile.archetype?.toLowerCase().replace(/\s+/g, '_') ?? '',
  sun_sign:     profile.sunSign ?? '',
  is_returning_user: hasChurned ? 'true' : 'false',
})
```

---

### Step 1.9 — Implement presentPaywall helper

**In `PurchasesProvider.presentPaywall`:**

```typescript
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

const result = await RevenueCatUI.presentPaywallIfNeeded({
  requiredEntitlementIdentifier: 'premium',
  // placement is configured on RC dashboard — pass via offering identifier
})
return result
```

For Calendar paywall (dual-entitlement):
```typescript
const hasPremium = customerInfo.entitlements.active['premium'] != null
const hasCalendar = customerInfo.entitlements.active['calendar_2026'] != null
if (!hasPremium && !hasCalendar) {
  await RevenueCatUI.presentPaywall({ /* calendar_only offering */ })
}
```

---

### Step 1.10 — Run Supabase schema migrations (RC tables)

> **[DECISION 2026-05-08 — supersedes original Step 1.10 spec]** users.is_premium columns NOT added. Replaced with public.subscriptions table as source of truth: RLS-enabled, status enum, indexed on user_id/expires_at/status. Webhook upserts on (user_id, entitlement_id) with rc_event_id for idempotency. Cleaner architecture: history-friendly, no cross-table sync logic, RLS-aware. The revenuecat_events log table from original plan also skipped — webhook idempotency via rc_event_id makes it redundant. Migration: 20260508174952_subscriptions_table.sql.

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS revenuecat_user_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_source TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_product_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_revenuecat_user_id ON users(revenuecat_user_id);
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium) WHERE is_premium = TRUE;

CREATE TABLE IF NOT EXISTS feature_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  period TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, feature, period)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_period ON feature_usage(user_id, period);

CREATE TABLE IF NOT EXISTS revenuecat_events (
  event_id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

---

### Step 1.11 — Build webhook handler on Railway backend

**Endpoint:** `POST /api/revenuecat/webhook`

```
Auth: verify Authorization header = `Bearer ${RC_WEBHOOK_SECRET}`
Idempotency: check revenuecat_events.event_id before processing
Respond 200 OK within 3s — queue slow operations async

Event handling:
INITIAL_PURCHASE  → is_premium=true, set premium_expires_at, source, product_id, rc_user_id
RENEWAL           → update premium_expires_at
CANCELLATION      → keep is_premium=true (user keeps access until expires_at)
EXPIRATION        → is_premium=false
BILLING_ISSUE     → keep is_premium=true (grace period, Apple = 16 days)
REFUND            → re-fetch from RC REST API, full sync
PRODUCT_CHANGE    → re-fetch from RC REST API, full sync
```

---

### Step 1.12 — Build backend report handlers (all 5 features)

**New endpoints on Railway backend** (Nuxt 3 API routes, all require Supabase JWT):

| Endpoint | Feature | Cap |
|---|---|---|
| `POST /api/reports/archetype` | Full archetype reading | 1/month |
| `POST /api/reports/natal-chart` | Natal chart | 1/month |
| `POST /api/reports/forecast` | 90-day forecast | 4/month |
| `POST /api/reports/compatibility` | Compatibility | 10/month |
| `POST /api/counsel/message` | Counsel AI chat | 30/day |

**Each handler pattern:**
```
1. Verify Supabase JWT → get user_id
2. SELECT is_premium, premium_expires_at FROM users WHERE id = user_id
3. !is_premium → 403 { error: 'subscription_required' }
4. SELECT count FROM feature_usage WHERE user_id=? AND feature=? AND period=?
5. count >= cap → 429 { error: 'monthly_limit_reached', resets_at: '...' }
6. Call Claude API with user context
7. INSERT/UPDATE feature_usage (increment count)
8. Return report
```

---

### Step 1.13 — Remove legacy payment flags from profileStore

**File:** `src/stores/profileStore.ts`

Confirm `paymentComplete`, `bundlePurchased`, `oraclePurchased` are fully removed (done in Phase 0 — double-check here). All payment state now comes from `PurchasesProvider.isPremium`.

---

### Step 1.14 — EAS dev build + sandbox test

```bash
eas build --profile development --platform ios
```

Test on real device:
- [ ] RC SDK initializes without crash
- [ ] `presentPaywallIfNeeded` shows RC paywall
- [ ] Sandbox purchase completes
- [ ] `isPremium` becomes `true` after purchase
- [ ] Webhook fires → check Supabase `users.is_premium = true`
- [ ] `calendar_2026` IAP purchase grants `hasCalendar = true`
- [ ] Sandbox restore works
- [ ] Custom attributes set correctly in RC dashboard

---

## Phase 2 — Onboarding Rewrite

**Goal:** Replace `AnalysisScreen.tsx` (7-question old flow) with 8 new screens covering the complete onboarding funnel: birth data capture → chart computation → big-three reveal → optional profiling → premium teaser.
**Duration:** ~10 hrs
**Prerequisites:** Phase DS complete (tokens + atoms available). Phase 0.5 complete (anonymous user_id available from AuthProvider).
**Verify:** Full onboarding flow on simulator — birth data saves to Supabase anonymous user; big-three reveals correctly; skip path works; premium teaser → AuthGate → paywall fires correctly.

---

### Step 2.1 — Add onboarding routes to navigation

**File:** `src/navigation/types.ts`

Add to `RootStackParamList`:
```typescript
Onboarding:         undefined          // entry point, resets to Splash
Splash:             undefined
Welcome:            undefined
BirthInfo:          undefined
BirthTimeLocation:  undefined
Calculating:        undefined
BigThreeReveal:     { sunSign: string; moonSign: string; risingSign: string; archetypeName: string }
OptionalQuestions:  undefined
PremiumTeaser:      undefined
```

> `AnalysisScreen` route stays in `RootStackParamList` temporarily until it's deleted. Remove in Step 2.9.

---

### Step 2.2 — Add onboarding stack to RootNavigator

**File:** `src/navigation/RootNavigator.tsx`

Add new screens with `animation: 'slide_from_right'`:
```typescript
<Stack.Screen name="Splash"            component={SplashScreen}          options={{ animation: 'fade' }} />
<Stack.Screen name="Welcome"           component={WelcomeScreen} />
<Stack.Screen name="BirthInfo"         component={BirthInfoScreen} />
<Stack.Screen name="BirthTimeLocation" component={BirthTimeLocationScreen} options={{ presentation: 'modal' }} />
<Stack.Screen name="Calculating"       component={CalculatingScreen}     options={{ animation: 'fade' }} />
<Stack.Screen name="BigThreeReveal"    component={BigThreeRevealScreen}  options={{ animation: 'fade' }} />
<Stack.Screen name="OptionalQuestions" component={OptionalQuestionsScreen} />
<Stack.Screen name="PremiumTeaser"     component={PremiumTeaserScreen} />
<Stack.Screen name="AuthGate"          component={AuthGateScreen}        options={{ presentation: 'transparentModal' }} />
```

> **[DECISION 2026-05-08 — supersedes original Step 2.2 spec]** AuthGate is NOT a screen route. Built as a BottomSheet organism at src/components/organisms/AuthGate.tsx, mounted inside AuthProvider, controlled via authGateState. Triggered by `showAuthGate({ title?, body? })` exposed via useAuth() hook. PremiumTeaser does NOT call navigation.navigate('AuthGate') — it calls showAuthGate() then watches isAnonymous transition via useEffect to fire presentPaywall on success. Better UX: no full-screen route transition, dismissable bottom sheet, no nav stack pollution.

Set initial route:
- First install (no session data + no profile) → `Splash`
- Has profile data (returning user, already did onboarding) → `MainTabs`

Detection logic in `RootNavigator`:
```typescript
const { data: profile } = useProfileStore()
const initialRoute = profile.dateOfBirth ? 'MainTabs' : 'Splash'
```

---

### Step 2.3 — SplashScreen

**File:** `src/screens/onboarding/SplashScreen.tsx` (new)

- Full-screen `surface.base` background
- OMENORA wordmark centered (Fraunces `display.2`)
- Faint star field (`rgba(255,255,255,0.03)` dots — CSS via `react-native-svg`)
- `useEffect`: 1.5s delay → navigate to `Welcome`
- Uses `expo-splash-screen.hideAsync()` at start of 1.5s (replaces the asset splash)

---

### Step 2.4 — WelcomeScreen

**File:** `src/screens/onboarding/WelcomeScreen.tsx` (new)

- Uses `OnboardingStep` template
- No progress bar (step 0)
- Headline: "Discover your archetype in 60 seconds" (Fraunces `display.2`)
- Sub: "Your birth data unlocks a reading built only for you"
- `[Begin]` primary Button → navigate to `BirthInfo`

---

### Step 2.5 — BirthInfoScreen

**File:** `src/screens/onboarding/BirthInfoScreen.tsx` (new)

- Uses `OnboardingStep` template with `ProgressBar` step 1/7
- Fields (all required before proceeding):
  - `TextField` — First name
  - `DateField` — Birth date (uses `@react-native-community/datetimepicker` — already installed ✅)
- "Set birth time & location" row → opens `BirthTimeLocation` modal
- Displays selected time + city below the row once set
- `[Continue]` enabled only when name + date + location set → navigate to `Calculating`
- Saves to `profileStore`: `firstName`, `dateOfBirth`, and after modal: `timeOfBirth`, `city`

> Birth time is recommended but not blocking. Show "I don't know my birth time" toggle in the modal.

---

### Step 2.6 — BirthTimeLocation modal

**File:** `src/screens/onboarding/BirthTimeLocationScreen.tsx` (new)

Presented as `presentation: 'modal'` from `BirthInfoScreen`.

- `TimeField` with "I don't know my birth time" toggle (sets `timeOfBirth: ''`)
- `CityField` with Nominatim autocomplete (debounce 400ms, max 1 req/sec)
- `[Confirm]` → saves time + city to `profileStore` → dismiss modal back to `BirthInfoScreen`

---

### Step 2.7 — CalculatingScreen

**File:** `src/screens/onboarding/CalculatingScreen.tsx` (new)

- Full-screen with `surface.base`
- Centered `PhoenixLoader` (already exists in `src/components/ui/PhoenixLoader.tsx` ✅)
- Text: "Reading your chart..." (Fraunces `display.2` italic)
- On mount:
  1. `POST /api/generate-birth-chart` with birth data (JWT attached via interceptor)
  2. Backend: Swiss Ephemeris → compute sun/moon/rising + archetype + life path
  3. Save result to `profileStore`: `archetype`, `lifePathNumber`, and new fields: `sunSign`, `moonSign`, `risingSign`
  4. Navigate to `BigThreeReveal` with computed values
- Error state: `ErrorState` template with retry button

---

### Step 2.8 — BigThreeRevealScreen

**File:** `src/screens/onboarding/BigThreeRevealScreen.tsx` (new)

- Full-screen, no tab bar
- Uses Moti `MotiView` for animations
- Gold radial glow backdrop behind hero area
- 3 cards fade-up sequentially with 60ms stagger:
  - `☉ Sun in [sign]`
  - `☽ Moon in [sign]`
  - `↑ Rising in [sign]`
- Then archetype name fades in: "You are **The Seeker**" (Fraunces `display.1`)
- `[Continue to deeper reading]` → navigate to `OptionalQuestions`

---

### Step 2.9 — OptionalQuestionsScreen

**File:** `src/screens/onboarding/OptionalQuestionsScreen.tsx` (new)

- Uses `OnboardingStep` template with `ProgressDots` (4 dots)
- 4 questions, one at a time, swipe or tap to advance:
  1. Life focus (multi-select `ChipGroup`): Love & relationships / Career & purpose / Inner growth / Spiritual exploration / General curiosity
  2. Current season (multi-select): Feeling stuck / In transition / On a high / Seeking clarity
  3. Tone preference (single-select): Gentle / Direct / Mystical
  4. Astrology familiarity (single-select): New to this / Some knowledge / Quite familiar
- `[Skip for now]` on every step → jumps to `PremiumTeaser`
- `[Continue]` after last question → saves answers to `profileStore` → navigate to `PremiumTeaser`
- Saved to `profileStore.answers` using question IDs: `life_focus`, `current_season`, `tone_pref`, `astro_familiarity`

> These 4 questions replace the old `questions.ts` 7-question psychological flow. The old `questions.ts` file can remain for reference but is not used.

---

### Step 2.10 — PremiumTeaserScreen

**File:** `src/screens/onboarding/PremiumTeaserScreen.tsx` (new)

- Full-screen `surface.base`
- Hero: gold radial glow behind archetype name (from `profileStore.archetype`)
- Headline: "Your full reading awaits" (Fraunces `display.2`)
- 4 benefit bullets using `FeatureListItem`:
  - Full archetype deep reading
  - Complete natal chart
  - 90-day personal forecast
  - Counsel — AI chat with your chart
- `[Unlock Premium]` (primary Button, gold gradient):
  1. If `isAnonymous` → navigate to `AuthGate`
  2. AuthGate succeeds → `presentPaywall({ placement: 'onboarding_end' })`

> **[DECISION 2026-05-09 — Phase 7 amendment]** PurchasesProvider.presentPaywall is currently zero-arg (no placement parameter). Live implementation calls bare presentPaywall(). Phase 7 restoration item: extend PurchasesContext to accept { offering, displayCloseButton, fontFamily } per RC v10, pass placement-derived offering for analytics differentiation across paywall trigger points (onboarding_end vs feature_gate vs settings_upsell). Single-offering ships fine for v1.0; analytics blind spot is acceptable launch debt.
  3. On purchase → navigate to `MainTabs` (Today tab)
  4. On dismiss → navigate to `MainTabs` (free tier, Today tab)
- `[Maybe later]` (tertiary Button) → navigate to `MainTabs` (free tier)

---

### Step 2.11 — Delete AnalysisScreen

**File:** `src/screens/AnalysisScreen.tsx` — DELETE

Remove from `RootNavigator.tsx`:
- Import
- `<Stack.Screen name="Analysis" ...>`

Remove from `types.ts`:
- `Analysis: { step?: number } | undefined`
- `AnalysisScreenProps` export

> **[CORRECTION 2026-05-09]** Deletion is NOT just file removal. AnalysisScreen had 7 references across 4 files (types.ts, RootNavigator.tsx, HomeScreen.tsx, ReadingScreen.tsx ×3). All 4 files require updates: types.ts removes Analysis route + AnalysisScreenProps export; RootNavigator removes import + Stack.Screen; HomeScreen + ReadingScreen redirect navigate('Analysis') → navigate('BirthInfo') as Phase 2 bridge until Phase 3 deletes the host screens entirely. Bridges marked with inline comments referencing Phase 3 cleanup.

---

### Step 2.12 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Zero errors before Phase 3.

---

### Phase 2 — Quality Gate

Definition of done. All items must pass before starting Phase 3.

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `src/screens/AnalysisScreen.tsx` deleted
- [ ] `Analysis` route removed from `src/navigation/types.ts`
- [ ] Full happy path runs on simulator: Splash → Welcome → BirthInfo → Calculating → BigThreeReveal → OptionalQuestions → PremiumTeaser
- [ ] Skip path runs: BirthInfo → Calculating → BigThreeReveal → OptionalQuestions (skip button) → PremiumTeaser
- [ ] `profileStore.dateOfBirth` populated after BirthInfo submit
- [ ] `profileStore.archetype` populated after Calculating completes
- [ ] Returning user (has `dateOfBirth` in store) navigates directly to `MainTabs` on app launch (skips Splash + onboarding)
- [ ] Analytics events fired: `onboarding_started`, `birth_info_submitted`, `big_three_revealed`, `optional_questions_completed` OR `optional_questions_skipped`
- ~~All 8 onboarding screens use `<OnboardingStep>` template~~ — **[CORRECTION 2026-05-09]** Only 4 of 8 onboarding screens use OnboardingStep template (BirthInfo, BirthTimeLocation, OptionalQuestions, plus WelcomeScreen). Splash, Calculating, BigThreeReveal, PremiumTeaser are NOT step screens by design — they are transitional, reveal, or teaser screens with bespoke layouts. Original spec was incorrect.

---

## Phase 3 — Tab Structure & Navigation

**Goal:** Rename and rewire the 4 tabs (Today, Readings, Counsel, More). Refactor `HomeScreen` → Today tab. Refactor `ReadingScreen` + `ReportScreen` → Readings tab. Refactor `ExploreScreen` → Counsel tab (pitch state). Reorganize `MoreScreen`.
**Duration:** ~8 hrs
**Prerequisites:** Phase DS complete. Phase 0.5 complete (auth context available). Phase 1 complete (`isPremium` entitlement available from `PurchasesProvider`).
**Verify:** All 4 tabs navigate correctly; premium gates show `LockedCard` for free users and full content for premium users on simulator.

---

### Step 3.1 — Rename TabParamList

**File:** `src/navigation/types.ts`

```typescript
export type TabParamList = {
  TodayTab:    undefined;
  ReadingsTab: undefined;
  CounselTab:  undefined;
  MoreTab:     undefined;
}

// Update composite screen props:
export type TodayScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'TodayTab'>,
  NativeStackScreenProps<RootStackParamList>
>
// ... ReadingsScreenProps, CounselScreenProps, MoreScreenProps
```

Remove old `HomeTab`, `ReadingTab`, `ExploreTab` type props.

---

### Step 3.2 — Rebuild TabNavigator

**File:** `src/navigation/TabNavigator.tsx`

Replace tab entries with:
```typescript
<Tab.Screen name="TodayTab"    component={TodayScreen} />
<Tab.Screen name="ReadingsTab" component={ReadingsScreen} />
<Tab.Screen name="CounselTab"  component={CounselScreen} />
<Tab.Screen name="MoreTab"     component={MoreScreen} />
```

Tab config with Lucide icons (Step DS.17 partially complete — finalize here):
- `TodayTab` → `<Sun>` icon, label "Today"
- `ReadingsTab` → `<BookOpen>` icon, label "Readings"
- `CounselTab` → `<MessageCircle>` icon, label "Counsel"
- `MoreTab` → `<MoreHorizontal>` icon, label "More"

Tab bar style: `surface.floating` background + `expo-blur` backdrop.

---

### Step 3.3 — Build Today tab (refactor HomeScreen)

**File:** `src/screens/tabs/TodayScreen.tsx` (new — replaces `HomeScreen.tsx`)

**Free content (all users):**
- Greeting header: "Good [morning/afternoon/evening], [firstName]" using `heading.2`
- Today's date + moon phase (from backend or static calculation)
- Daily horoscope `DailyCard` — sun-sign text from `daily_zodiac_cache`
  > ⚠️ **Gap G8**: Verify `daily_zodiac_cache` exists in Supabase. If not: create table + seed with horoscope content before this step.
- Today's transits `TransitCard` list

**Premium content (locked for free users):**
- Personalized insight `DailyCard` wrapped in `<LockedCard placement="feature_archetype">` for free users
- Archetype focus `Card` wrapped in `<LockedCard>` for free users

**Quick CTAs (premium only):**
- "Ask Counsel about today" → navigate to `CounselTab`
- "What's coming next" → navigate to `ReadingsTab`

Delete `src/screens/HomeScreen.tsx` after migration complete.

---

### Step 3.4 — Build Readings tab (merge ReportScreen + ReadingScreen)

**File:** `src/screens/tabs/ReadingsScreen.tsx` (new — replaces `ReadingScreen.tsx` as tab root)

**Free content:**
- Big-three `Card` (sun/moon/rising from `profileStore`)
- Archetype name + 1-paragraph teaser from `profileStore.report`
- `[Read full archetype]` → `<LockedCard placement="feature_archetype">` for free users

**Premium content (gated individually):**
- Full archetype reading section (fetched from `POST /api/reports/archetype`)
- Full natal chart section (fetched from `POST /api/reports/natal-chart`) — `<LockedCard placement="feature_natal_chart">` for free
- 90-day forecast section (fetched from `POST /api/reports/forecast`) — `<LockedCard placement="feature_forecast">` for free
- Daily insight history (last 30 days, scrollable list of `DailyCard`)
- Transit timeline

Delete `src/screens/ReadingScreen.tsx` and `src/screens/ReportScreen.tsx` after migration complete.
Remove `Report` route from `RootStackParamList` and `RootNavigator`.

---

### Step 3.5 — Build Counsel tab (refactor ExploreScreen)

**File:** `src/screens/tabs/CounselScreen.tsx` (new — replaces `ExploreScreen.tsx`)

**Free state (not premium):**
- Hero illustration (sacred geometry SVG from `src/design/illustrations/`)
- Headline: "Ask Counsel anything about your chart"
- 4 hardcoded sample question chips
- `[Start chatting]` primary Button → `<LockedCard>` → `presentPaywall({ placement: 'feature_counsel' })`

**Premium state:**
- Rendered inline in `CounselScreen` if no active chat, OR
- Push navigate to `CounselChatScreen` (Phase 5)
- On first use: show `CounselDisclosureModal` before chat (Phase 5)

Delete `src/screens/ExploreScreen.tsx` after migration.

---

### Step 3.6 — Rebuild More tab (refactor MoreScreen)

**File:** `src/screens/tabs/MoreScreen.tsx` (new — replaces existing `MoreScreen.tsx`)

Organized sections using `ListItem` molecules:

**Premium Features:**
- Compatibility → navigate to `CompatibilityScreen` (Phase 4)
- Lucky Timing Calendar → Calendar gating logic (Phase 4)
- Tradition switcher → navigate to `TraditionSwitcherScreen` (Phase 4)

**Account & Settings:**
- Profile → navigate to `ProfileScreen` (Phase 6)
- Subscription → `RevenueCatUI.presentCustomerCenter()` (Phase 6)
- Notifications → navigate to `NotificationsScreen` (Phase 6)
- Language

> **[INTERIM 2026-05-10 — Subscription row]** Phase 6 wires `RevenueCatUI.presentCustomerCenter()` for full customer center (refunds, downgrades, history). Until then, Phase 3 ships a working interim: Subscription row uses `Linking.openURL('https://apps.apple.com/account/subscriptions')` to open Apple's subscription management page. This is the iOS-canonical place users expect subscription controls. Working pattern available immediately. Phase 6 swaps to `presentCustomerCenter()` for richer functionality.

**Trust & Compliance:**
- Privacy & Data → `Linking.openURL('https://omenora.com/privacy')`
- Terms of Service → `Linking.openURL('https://omenora.com/terms')`
- Counsel guidelines → navigate to `PrivacyScreen` (existing)
- Crisis resources → navigate to `CrisisResourcesScreen` (Phase 5)
- Account deletion → navigate to `DeleteAccountScreen` (Phase 6)
- Sign out → calls `AuthProvider.signOut()` with confirmation

> **[DECISION 2026-05-10 — signOut double-Alert prevention]** AuthProvider.signOut() has its own internal confirmation Alert ("You'll be signed back in anonymously…"). Calling signOut() bare from a parent Alert handler produces TWO confirmation dialogs (parent's Alert.alert + signOut's internal Alert). Always call `signOut({ skipWarning: true })` when invoking from a parent screen's own Alert handler (e.g., MoreScreen). The internal Alert remains useful for direct/standalone invocation contexts.

**Support:**
- Help / FAQ → `Linking.openURL('https://omenora.com/faq')`
- Contact support → `Linking.openURL('mailto:support@omenora.com')`
- About OMENORA / version from `Constants.expoConfig.version`

Delete old `src/screens/MoreScreen.tsx` after migration.

> **[CORRECTION 2026-05-10 — plan badge wiring]** Legacy MoreScreen had plan badge hardcoded to "Free". Phase 3 rebuild correctly wires the badge to `isPremium` from `usePurchases()` — renders "Free" when `isPremium === false`, "Premium" when true. This was a latent display bug surfaced during recon. Apply the same pattern in any future screen that displays subscription status (Profile screen in Phase 6, etc).

> **[DECISION 2026-05-10 — disabled-row pattern]** ListItem rows whose target route is not yet built (Phase 4-6 work) render with `disabled: true` + `meta: 'Coming soon'` rather than being hidden from the menu. Preview-value over hidden-value: visible-but-disabled rows tell users what the app will offer, hidden rows obscure the upgrade path. Applies to MoreScreen and any future settings screens. Pattern: `<ListItem label="..." icon={X} disabled meta="Coming soon" />`. When the corresponding phase ships the route, swap to `onPress={() => navigation.navigate('...')}` and remove `disabled` + `meta`.

---

### Step 3.7 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Zero errors before Phase 4.

---

### Phase 3 — Quality Gate

Definition of done. All items must pass before starting Phase 4.

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] All 4 tabs render: Today, Readings, Counsel, More
- [ ] `TabParamList` uses `TodayTab`, `ReadingsTab`, `CounselTab`, `MoreTab` — old names (`Home`, `Reading`, `Explore`) → 0 grep results in `src/navigation/`
- [ ] `HomeScreen.tsx`, `ReadingScreen.tsx`, `ReportScreen.tsx`, `ExploreScreen.tsx` all deleted
- [ ] Free user: premium content sections in TodayScreen and ReadingsScreen show `<LockedCard>` with blur + "Unlock" CTA
- [ ] Premium user (sandbox entitlement granted): `<LockedCard>` is NOT shown anywhere; full content renders
- [ ] Tab bar backdrop blur renders on both iOS and Android
- [ ] Tab bar active state shows gold underline + glow on selected tab
- [ ] All tab icons use Lucide (no Ionicons remaining)

---

## Phase 4 — Feature Screens

> **[ARCHITECTURAL DECISIONS 2026-05-10 — Phase 4 recon]**
> 
> Five decisions captured during Phase 4 pre-flight recon. Apply throughout Phase 4 cluster work.
> 
> **Decision 1 — Compatibility endpoint strategy.** Mobile keeps calling
> `/api/generate-compatibility` (live, full LLM). Backend hotfix adds
> `requirePremiumWithUsage(event, 'compatibility')` server-side guard to that
> endpoint. The stub at `/api/reports/compatibility` becomes vestigial and is
> deleted in Phase 5 when LLM consolidation happens. Plan Step 4.3 (which said
> to move mobile call to the stub) is REMOVED — see Edit 2.
> 
> **Decision 2 — Calendar buy CTA deferred to Phase 6.** Phase 4 implements
> entitlement gating and `hasCalendar` helper only. The standalone $4.99
> `omenora_calendar_2026` IAP purchase flow is Phase 6 scope (with full RC
> customer center). For Phase 4: free users tap Calendar → presentPaywall() →
> subscription unlocks. Phase 6 wires the IAP path; the OR-clause in
> `hasCalendar` (`isPremium || hasNonSubCalendar`) is plumbing for Phase 6
> but evaluates false until then.
> 
> **Decision 3 — TraditionSwitcher local-only.** No backend call from mobile
> Phase 4. User picks tradition → save to `profileStore.regionOverride` →
> next content fetch sends new tradition. The existing
> `augur/server/api/switch-tradition.post.ts` is OMENORA-web-only (Stripe
> session ID auth). The "regenerate existing reading under new tradition"
> feature is v1.1 enhancement, not v1 launch.
> 
> **Decision 4 — Compatibility ephemeral.** No `compatibilityHistory` in
> profileStore for Phase 4. CompatibilityScreen renders reading from API
> response in component state, shows it, doesn't persist. Server-side
> `requirePremiumWithUsage` cap from Decision 1 bounds API cost regardless
> of caching. v1.1 can add history if data shows demand.
> 
> **Decision 5 — Analytics moved to Phase 7.** QG item 7 (`feature_locked_tapped`
> analytics) removed from Phase 4 Quality Gate. No analytics infrastructure
> exists in mobile codebase. Sentry/PostHog SDK integration + event taxonomy +
> dashboard config belongs in Phase 7 production-readiness scope. See Edit 6
> for QG item removal.

**Goal:** Rewire `CalendarScreen` and `CompatibilityScreen` to use RC entitlements. Build `TraditionSwitcherScreen`. Add all new routes to navigation.
**Duration:** ~13 hrs
**Prerequisites:** Phase 1 complete (`isPremium`, `hasCalendar` available from `PurchasesProvider`). Phase 3 complete (MoreTab wired).
**Verify:** Calendar screen accessible to `isPremium` and `hasCalendar` users only. Non-entitlement users see Calendar paywall. Compatibility screen gated to `isPremium` users only.

---

### Step 4.1 — Rewire CalendarScreen entitlement check

**File:** `src/screens/CalendarScreen.tsx`

Replace all `store.bundlePurchased` / `store.paymentComplete` checks with:

```typescript
const { isPremium, hasCalendar, presentPaywall } = usePurchases()

// In MoreScreen (Phase 3, Step 3.6) — openCalendar:
async function openCalendar() {
  if (isPremium || hasCalendar) {
    navigation.navigate('Calendar')
  } else {
    await presentPaywall('feature_calendar')
  }
}
```

Remove all old `UPGRADE_BTN_BORDER`, `LOCKED_FADE` logic that showed upgrade prompts — `LockedCard` organism handles gating from now on.

Update route in `RootStackParamList` — keep `Calendar: { calendarId?: string } | undefined` ✅ (no change needed).

> **[CORRECTION 2026-05-10 — bundlePurchased/paymentComplete grep]** Plan
> implies CalendarScreen has existing `bundlePurchased`/`paymentComplete`
> checks to remove. Recon confirms neither field exists — the legacy screen
> never had any entitlement check. The QG grep for these will trivially pass
> but not because they were removed. This QG item is informational, not
> behavioral.

---

### Step 4.2 — Rewire CompatibilityScreen entitlement check

**File:** `src/screens/CompatibilityScreen.tsx`

Replace old payment checks with:

```typescript
const { isPremium, presentPaywall } = usePurchases()
```

Free users: show sun-sign only compatibility (no API call required).
Premium users: show full compatibility (`POST /api/reports/compatibility`).

Gate the full-compatibility section with `<LockedCard placement="feature_compatibility">` for free users.

Remove all old `UPGRADE_BTN_BORDER`, `LOCKED_FADE`, `MATCH_BAR_COLOR` hardcoded logic — replace with tokens and `LockedCard`.

---

### Step 4.3 — ~~Update CompatibilityScreen API call~~ [DEPRECATED]

> **Step 4.3 — DEPRECATED.** Per [DECISION 2026-05-10 #1], mobile keeps
> calling `/api/generate-compatibility`. Server-side `requirePremiumWithUsage`
> guard added to that endpoint as Cluster 0 backend hotfix. No mobile URL
> change. The stub at `/api/reports/compatibility` is vestigial; deleted in
> Phase 5.

---

### Step 4.4 — Build TraditionSwitcherScreen

**File:** `src/screens/settings/TraditionSwitcherScreen.tsx` (new)

- `Header` organism with back button
- 4 `Chip` options (single-select): Western / Vedic / Chinese / Tarot
- Currently selected highlighted with `border.accent` + `accent.subtle` background
- `[Save]` → saves to `profileStore.regionOverride` → navigates back
- Premium gate: `<LockedCard>` wrapping the selection if `!isPremium`

> `regionOverride` field already exists in `profileStore` ✅ — no schema changes needed.

Add to `RootStackParamList`:
```typescript
TraditionSwitcher: undefined
```

---

### Step 4.5 — Add feature screen routes to RootNavigator

**File:** `src/navigation/RootNavigator.tsx`

Add:
```typescript
<Stack.Screen name="Compatibility"       component={CompatibilityScreen} />
<Stack.Screen name="Calendar"            component={CalendarScreen} />
<Stack.Screen name="TraditionSwitcher"   component={TraditionSwitcherScreen} />
```

> `Compatibility` and `Calendar` routes already exist in `RootStackParamList` ✅ — verify names match exactly.

> **Verified by recon:** `Compatibility` and `Calendar` routes already exist in
> both `RootStackParamList` and `RootNavigator`. Only `TraditionSwitcher` is
> missing. Step 4.5 scope is therefore narrow: add `TraditionSwitcher: undefined`
> to `RootStackParamList` + `<Stack.Screen name="TraditionSwitcher" ...>` to
> RootNavigator. Then enable the disabled MoreScreen row.

---

### Step 4.6 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Zero errors before Phase 5.

---

> **Cluster 0 — Phase 4 prerequisite (NEW, ~2hr)**
> 
> Pre-screen-build prerequisite work. Must complete before Clusters 1-3 can
> proceed. No screen work in this cluster.
> 
> 0.1 — Add `hasCalendar` to `PurchasesContext` and `PurchasesProvider`:
>   `hasCalendar: boolean` derived from
>   `isPremium === true || customerInfo?.nonSubscriptionTransactions?.some(t => t.productIdentifier === 'omenora_calendar_2026')`
>   For Phase 4, the second OR-clause evaluates false (no IAP yet). Phase 6
>   activates it.
> 
> 0.2 — Add `CalendarData` interface to mobile (mirror of backend `CalendarType`):
>   `interface CalendarData { overallTheme, peakMonths, cautionMonths, months[12] }`
>   Place in `src/types/calendar.ts` or inline in `endpoints.ts`. Each month:
>   `{ month, number, energyLevel, theme, love, money, career, warning, luckyDays[], color }`.
> 
> 0.3 — Add `calendarData` + `setCalendarData` to `profileStore`:
>   `calendarData: CalendarData | null` (default null), persisted in partialize.
>   Caches generated calendar to avoid re-calling LLM on every CalendarScreen open.
> 
> 0.4 — Fix `endpoints.ts` request shape mismatches:
>   - `generateCalendar` request must be `{ firstName, archetype, element, lifePathNumber, dateOfBirth, language, answers }` — currently sends `{ firstName, dateOfBirth, year }`. The `year` field doesn't exist in backend.
>   - `getCalendar` request body uses `sessionId` not `calendarId`.
>   These are pre-existing bugs predating Phase 4; fix now since CalendarScreen
>   build depends on them.
> 
> 0.5 — Backend hotfix on `augur/server/api/generate-compatibility.post.ts`:
>   Add `requirePremiumWithUsage(event, 'compatibility')` server-side guard.
>   Per Decision 1. Single edit, no other backend changes.
>   Backend hotfix lands as a separate commit on develop after Cluster 0 mobile
>   commit; pattern matches Phase 2 backend hotfix flow.
> 
> Cluster 0 ships before any screen rewrite. Quality Gate addition:
> `hasCalendar` helper exists, `calendarData` profileStore field exists,
> `endpoints.ts generateCalendar/getCalendar` request shapes match backend.

### Phase 4 — Quality Gate

Definition of done. All items must pass before starting Phase 5.

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] CalendarScreen: user with `isPremium === true` OR `hasCalendar === true` opens directly; free user sees Calendar paywall (placement: `feature_calendar`)
- [ ] CompatibilityScreen: `isPremium` user sees full compatibility synastry; free user sees `<LockedCard>` triggering `feature_compatibility` placement
- [ ] `grep -r "bundlePurchased\|paymentComplete" src/screens/CalendarScreen.tsx src/screens/CompatibilityScreen.tsx` → 0 results
- [ ] TraditionSwitcherScreen: selection persists to `profileStore.regionOverride` after save
- [ ] Premium user: tradition switcher available; free user: switcher locked or hidden per locked decision
- [ ] ~~`feature_locked_tapped` analytics fires on every LockedCard tap~~ — **MOVED to Phase 7** per [DECISION 2026-05-10 #5]. No analytics infrastructure in mobile codebase. SDK integration belongs in Phase 7 production prep.
- [ ] Cluster 0 prerequisites verified: `hasCalendar` exposed by `PurchasesContext`, `CalendarData` type defined, `calendarData` field in `profileStore`, `endpoints.ts` request shapes match backend, `/api/generate-compatibility` has server-side `requirePremiumWithUsage` guard.

---

## Phase 5 — Counsel Chat

> **[SCOPE EXPANSION 2026-05-10]** Phase 5 was originally scoped as "Counsel chat" only. Phase 3 build revealed `/api/reports/*` endpoints (archetype, natal-chart, forecast) currently return STUB responses with no content. Phase 5 backend track now also includes wiring real LLM-generated content for these three endpoints. ReadingsScreen premium sections currently render placeholder text "Your full reading is being prepared" — this becomes real LLM responses in Phase 5. Scope estimate adjusted accordingly: original Phase 5 ~12 hours (Counsel chat only), revised estimate ~16-18 hours (Counsel chat + 3 LLM endpoint wiring + content prompt engineering). The 3 endpoint stubs in `augur/server/api/reports/` already have the entitlement gates wired (Phase 1 Cluster C); Phase 5 only needs to add content generation.

**Goal:** Build the full Counsel chat experience — compliance disclosure modal, chat UI, message counter, crisis detection, crisis resources screen.
**Duration:** ~16-18 hrs (per SCOPE EXPANSION 2026-05-10 amendment — original ~8 hrs Counsel-only, +3 LLM endpoint wiring + prompt engineering)
**Prerequisites:** Phase 1 complete (`isPremium` from RC). Phase 3 complete (`CounselTab` premium state wired).
**Verify:** Compliance modal shows on first premium session. Chat sends/receives messages via `/api/counsel/message`. Message counter decrements correctly. Crisis keywords show resources instead of forwarding to Claude.

---

> **[ARCHITECTURAL DECISIONS 2026-05-10 — Phase 5 recon]**
> 
> Six decisions and three drift corrections captured during Phase 5 pre-flight
> recon. Apply throughout Phase 5 cluster work.
> 
> **Decision 1 — Counsel daily cap.** Accept the existing
> `FEATURE_CAPS.counsel = { cap: 30, period: 'daily' }` (already wired in
> `augur/server/utils/entitlements.ts`). No change required. 30 conversations/day
> at Sonnet 4.6 pricing bounds power-user API cost at ~$2/day worst-case —
> well within the $10.49/sub/mo net revenue envelope.
> 
> **Decision 2 — Conversation retention: stateless per-request.** Mobile client
> maintains conversation history in local state. Each turn ships full
> `{ message, conversation_history }` to `/api/counsel/message`. No server-side
> storage. No new Supabase tables for v1. Trade-off: history lost on
> app uninstall — acceptable for v1. v1.1 can add server persistence if data
> shows demand for cross-device sync or longer history retention.
> 
> **Decision 3 — CounselDisclosureModal uses `Modal` organism, NOT BottomSheet.**
> Recon surfaced contradiction: plan Step 5.1 says BottomSheet, plan QG says
> "cannot be dismissed without accepting." Current BottomSheet has pan-dismiss
> and backdrop-tap dismiss with no `preventClose` prop. Decision: use Modal
> organism which natively supports blocking-modal semantics. BottomSheet
> preserves its dismissible product semantic for non-blocking use cases.
> 
> **Decision 4 — answers keys remapping: Solution A (frontend remap).** Mobile
> maps `{ life_focus → p1, tone_pref → p2, astro_familiarity → p3 }` at send
> sites (`CalendarScreen` and any future caller). Backend keys (`p1`, `p2`,
> `p3`) unchanged. `current_season` answer remains unused on backend (v1.1
> cleanup). Solution B (backend rename) rejected — `generate-report.post.ts`
> is also used by the Nuxt web funnel where backend fallbacks already work;
> zero-reward change.
> 
> **Decision 5 — Counsel response: plain JSON, not streaming.** Zero streaming
> infrastructure exists across the 7 current LLM endpoints. Counsel responses
> are typically 100-400 tokens (~2-5 seconds at Sonnet speeds) — acceptable
> with a "thinking" loading indicator. v1.1 can add SSE streaming if user
> testing shows perceived latency hurts engagement.
> 
> **Decision 6 — Disclosure modal copy: two-screen pattern locked.**
> Screen 1 (Introduction): legal/safety framing — substitute language for
> medical/legal/financial/crisis support, crisis resources backstop.
> Screen 2 (Consent): AI-specific consent — AI is not human, may be wrong,
> data sent to Anthropic and not stored after session/never used to train.
> Footer: "You can revisit these guidelines anytime under More → Counsel
> guidelines." Active-voice consent button: "I understand — Start chatting".
> Full copy captured in CounselDisclosureModal implementation spec.
> 
> **Drift correction 1 — Counsel endpoint NOT greenfield.**
> `augur/server/api/counsel/message.post.ts` stub already exists. Auth,
> usage tracking, and 30/day cap all wired. Phase 5 only adds real Claude
> call + conversation_history context. ~1hr work, not the ~3hr originally
> estimated. Plan Cluster 0 prerequisite for "build Counsel endpoint" is
> REMOVED.
> 
> **Drift correction 2 — Analytics moved to Phase 7 (already decided).**
> Phase 5 Quality Gate item listing `counsel_chat_started`,
> `counsel_message_sent`, `daily_limit_hit` analytics events conflicts with
> Phase 4 Decision 5 (analytics infrastructure deferred to Phase 7). Phase 5
> QG analytics item REMOVED. Replaced by Cluster 0 verification item per
> Phase 4 amendment pattern.
> 
> **Drift correction 3 — Phase 5 duration: ~16-18 hrs, not ~8 hrs.** Plan
> header for Phase 5 says ~8 hrs (Counsel-only original scope). The SCOPE
> EXPANSION 2026-05-10 amendment already revised to ~16-18 hrs to include
> the 3 report endpoint LLM wiring. Header amended for consistency with the
> expansion amendment.

> **Cluster 0 — Phase 5 prerequisite (~1.5hr)**
> 
> Pre-screen-build prerequisite work. Must complete before Clusters 1-4 can
> proceed.
> 
> 0.1 — Add `hasAcceptedCounselDisclosure: boolean` to `profileStore`.
>   Default false. Persisted in partialize.
> 
> 0.2 — Add `CounselChat: undefined` and `CrisisResources: undefined` to
>   `RootStackParamList`. Add composite screen prop exports
>   (`CounselChatScreenProps`, `CrisisResourcesScreenProps`).
> 
> 0.3 — Add new Zod schemas to `augur/server/utils/ai-schemas.ts` for the
>   3 in-app reading endpoints:
>     - `ArchetypeReadingSchema` — full archetype reading response shape
>     - `NatalChartReadingSchema` — full natal chart response shape
>     - `ForecastReadingSchema` — 90-day forecast response shape
>   Reuse `ReportSchema` subsections where applicable. Mobile-side types
>   in `endpoints.ts` mirror these schemas.
> 
> 0.4 — answers keys remapping helper in mobile (per Decision 4):
>   Add `remapAnswersForBackend(answers)` utility OR inline `{ p1:
>   answers.life_focus, p2: answers.tone_pref, p3: answers.astro_familiarity }`
>   at send sites. Apply in `CalendarScreen.tsx` (currently sends raw
>   `profileStore.answers` per Phase 4 Cluster 3 TODO comment).
> 
> 0.5 — Update `endpoints.ts` types for the 3 report endpoints:
>   - `GetArchetypeReadingRequest`, `GetArchetypeReadingResponse`
>   - `GetNatalChartReadingRequest`, `GetNatalChartReadingResponse`
>   - `GetForecastReadingRequest`, `GetForecastReadingResponse`
>   All currently typed as returning `ReportStubResponse` — replace with
>   real types matching Cluster 0.3 schemas.
> 
> Cluster 0 ships before any screen rewrite or backend LLM wiring. Quality
> Gate addition: all 5 prerequisite items verified.

> **Plan-vs-reality verified by recon 2026-05-10:**
> - Counsel endpoint stub already exists (`augur/server/api/counsel/message.post.ts`) — auth + cap + usage all wired. Phase 5 only adds real Claude call.
> - `counsel: {cap: 30, daily}` already in `FEATURE_CAPS` — no change needed.
> - Zero Supabase migrations required for v1 stateless model.
> - `ChatBubble` organism ready (user/counsel/system variants, all token-clean).
> - `Modal` organism ready (supports blocking-modal semantic for CounselDisclosureModal).
> - MoreScreen "Counsel guidelines" + "Crisis resources" rows already in place as `disabled` — Phase 5 enables them.

---

### Step 5.1 — Build CounselDisclosureModal

**File:** `src/screens/counsel/CounselDisclosureModal.tsx` (new)

Uses `Modal` organism (NOT BottomSheet, per [DECISION 2026-05-10 #3]). Two-screen pattern (introduction → consent) per [DECISION 2026-05-10 #6]. Shown once on first premium Counsel access; `hasAcceptedCounselDisclosure` persisted in `profileStore`. Cannot be dismissed without accepting (Modal organism supports this natively — no swipe-to-dismiss, no backdrop-tap close on the disclosure flow).

---

### Step 5.2 — Build CounselChatScreen

**File:** `src/screens/counsel/CounselChatScreen.tsx` (new)

Add to `RootStackParamList`:
```typescript
CounselChat: undefined
```

Layout:
- `Header` with title "Counsel" + message counter badge: "X / 30 today"
- `FlatList` of `ChatBubble` organisms (`user` / `counsel` / `system` variants)
- "AI-generated based on your chart" `Badge` above input (required for App Review)
- `TextField` + send `Icon` button at bottom
- `KeyboardAvoidingView` (use RN built-in — do NOT build custom)
- "For self-reflection only — not medical or legal advice" footer text (`caption` style, `text.tertiary`)

Message sending:
```typescript
// 1. Append user message to local state immediately
// 2. POST /api/counsel/message { message, conversation_history }
// 3. On response: append counsel reply to local state
// 4. On 429 (cap exceeded): show system bubble "You've reached today's limit. Resets at midnight."
// 5. On 403 (subscription_required): dismiss + presentPaywall
```

Crisis detection — BEFORE sending to API:
```typescript
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'self-harm', 'harm myself', 'want to die']
const hasCrisisContent = CRISIS_KEYWORDS.some(kw => message.toLowerCase().includes(kw))
if (hasCrisisContent) {
  // Do NOT send to Claude API
  // Show system bubble with crisis resources link
  // Navigate user to CrisisResourcesScreen
  return
}
```

Suggested question chips (hardcoded for v1):
- "What does my chart say about love?"
- "What's my biggest strength right now?"
- "What should I focus on this month?"
- "Why do I keep repeating this pattern?"

---

### Step 5.3 — Build CrisisResourcesScreen

**File:** `src/screens/settings/CrisisResourcesScreen.tsx` (new)

Add to `RootStackParamList`:
```typescript
CrisisResources: undefined
```

Content:
- Headline: "You're not alone" (Fraunces `display.2`)
- Subhead: "These resources are available 24/7"
- Resource cards using `Card` organism:
  - 988 Suicide & Crisis Lifeline: call/text 988 → `Linking.openURL('tel:988')`
  - Crisis Text Line: text HOME to 741741 → share copy text
  - International Association for Suicide Prevention: `Linking.openURL('https://www.iasp.info/resources/Crisis_Centres/')`
- Footnote: "If you are in immediate danger, call 911 or your local emergency services"

Accessible from:
- More tab → Trust & Compliance section (Phase 3, Step 3.6)
- Counsel chat crisis detection trigger (Step 5.2)

---

### Step 5.4 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Zero errors before Phase 6.

---

> **Vestigial endpoint cleanup (Phase 5 backend track):**
> `augur/server/api/reports/compatibility.post.ts` (stub) is DELETED in
> Phase 5. Recon confirmed zero callers — `endpoints.ts` calls
> `/api/generate-compatibility` (live LLM endpoint, guarded by
> requirePremiumWithUsage per Phase 4 backend hotfix 6addcfc). The stub
> deletion is a single file removal in `augur/server/api/reports/`.
> Per [DECISION 1 in Phase 4 amendments]. Captured here as a Phase 5
> backend deliverable.

---

### Phase 5 — Quality Gate

Definition of done. All items must pass before starting Phase 6.

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `CounselDisclosureModal` shows exactly once on first premium session; `profileStore.hasAcceptedCounselDisclosure = true` after accept
- [ ] Modal cannot be dismissed without accepting (no swipe-to-dismiss)
- [ ] Message sends successfully → response received via `/api/counsel/message`
- [ ] Counter badge updates: "29 / 30 today" after first message of the day
- [ ] 30-message daily cap: 31st message attempt shows system bubble "Daily limit reached", makes NO API call
- [ ] Crisis keyword detection: typing "suicide", "kill myself", or similar → makes NO API call → system bubble shows 988 link → tapping link navigates to `CrisisResourcesScreen`
- [ ] Free user tapping "Start chatting" CTA → `<LockedCard>` blocks access → paywall presented (placement: `feature_counsel`)
- [ ] Compliance text visible at all times in chat footer: "AI-generated based on your chart" + "For self-reflection only — not medical or legal advice"
- [ ] **Analytics events:** ~~counsel_chat_started, counsel_message_sent, daily_limit_hit~~ — **MOVED to Phase 7** per [DECISION 2026-05-10 #5 in Phase 4 amendments]. No analytics infrastructure in mobile codebase.
- [ ] Cluster 0 prerequisites verified:
  - `hasAcceptedCounselDisclosure` field in `profileStore` with persistence
  - `CounselChat` + `CrisisResources` routes in `RootStackParamList`
  - 3 new Zod schemas in `ai-schemas.ts` (ArchetypeReading, NatalChartReading, ForecastReading)
  - answers remapping applied at all mobile send sites (currently `CalendarScreen`; expand if Phase 5 introduces new callers)
  - `endpoints.ts` types updated for 3 report endpoints (no longer `ReportStubResponse`)

---

## Phase 6 — More Tab & Settings

**Goal:** Build all settings screens wired from More tab. Complete account deletion. Wire subscription management via RC customer center.
**Duration:** ~6 hrs
**Prerequisites:** Phase 3 complete (MoreScreen built). Phase 0.5 complete (auth context for sign out and deletion).
**Verify:** Profile screen shows correct user data. Subscription screen opens RC customer center. Account deletion completes end-to-end. Sign out clears all state.

---

### Step 6.1 — Build ProfileScreen

**File:** `src/screens/settings/ProfileScreen.tsx` (new)

Add to `RootStackParamList`:
```typescript
Profile: undefined
```

Content:
- `Header` with back button + title "Profile"
- Display: `firstName` from `supabase.auth.getUser()` user metadata
- Display: birth date, time, city from `profileStore`
- `[Edit birth info]` → navigate to a `BirthInfoEditScreen` (re-uses `BirthInfoScreen` logic in edit mode)
- Display: archetype name + sun/moon/rising (read-only from `profileStore`)
- Display: sign-in method (Apple / Google / Email)

---

### Step 6.2 — Wire Subscription management

**In MoreScreen (Step 3.6 already shells this):**

```typescript
import RevenueCatUI from 'react-native-purchases-ui'

// In Subscription list item onPress:
await RevenueCatUI.presentCustomerCenter()
```

> RC customer center handles: upgrade, downgrade, cancellation, restore. No custom screen needed.

---

### Step 6.3 — Build NotificationsScreen

**File:** `src/screens/settings/NotificationsScreen.tsx` (new)

Add to `RootStackParamList`:
```typescript
Notifications: undefined
```

Content:
- `Header` + title "Notifications"
- Toggle: Daily cosmic insight (7am default) — request `expo-notifications` permission on enable
- Time picker for notification time (uses `@react-native-community/datetimepicker` ✅)
- Toggle: New transit alerts

Notification scheduling uses `expo-notifications` (already installed `~0.31.5`) ✅.

---

### Step 6.3a — Analytics opt-out toggle

> **v1 scope:** Analytics opt-out toggle ONLY. NO ATT prompt in v1.
> ATT (App Tracking Transparency) becomes a v1.1 task when TikTok/Meta App Events SDKs are added per Track D. Do NOT install `expo-tracking-transparency`, do NOT add `NSUserTrackingUsageDescription` to `app.json` in v1.

**`profileStore` addition:**
```typescript
// In src/stores/profileStore.ts, add field:
analyticsEnabled: boolean  // default: true
setAnalyticsEnabled: (enabled: boolean) => void
```

**PostHog + Sentry runtime opt-out** — apply on profile load and on toggle change:
```typescript
import * as Sentry from '@sentry/react-native'
import { usePostHog } from 'posthog-react-native'

// On profile change:
if (!profile.analyticsEnabled) {
  posthog.optOut()
  Sentry.getCurrentHub().getClient()?.getOptions().enabled = false
} else {
  posthog.optIn()
  Sentry.getCurrentHub().getClient()?.getOptions().enabled = true
}
```

**UI** — add to `MoreScreen` "Trust & Compliance" section:
- New `ListItem`: "Privacy & Data" → opens new `PrivacySettingsScreen` (or inline section)
- Toggle: "Share anonymous usage data" (on by default)
- Helper text: "We use anonymous data to improve OMENORA. No personal information is shared or sold."

Required for GDPR (EU users) and CCPA (California users) compliance.

---

### Step 6.4 — Build DeleteAccountScreen

**File:** `src/screens/settings/DeleteAccountScreen.tsx` (new)

Add to `RootStackParamList`:
```typescript
DeleteAccount: undefined
```

Content:
- `Header` + title "Delete Account"
- Warning body: "This will permanently delete your chart, readings, and account. This cannot be undone."
- List of what is deleted: chart data, reading history, active subscription (cancelled immediately)
- `[Delete my account]` (danger Button variant):
  1. Confirm dialog: "Are you sure? This is permanent."
  2. `DELETE /api/auth/account` (built in Phase 0.5.15)
  3. `supabase.auth.signOut()`
  4. `Purchases.logOut()`
  5. `AsyncStorage.clear()`
  6. Navigate to `Splash` (reset stack)
- `[Cancel]` → navigate back

> Apple App Store requires in-app account deletion since June 2022. This screen must be reachable without contacting support.

---

### Step 6.5 — TypeScript clean pass

```bash
npx tsc --noEmit
```

Zero errors before Phase 7.

---

### Phase 6 — Quality Gate

Definition of done. All items must pass before starting Phase 7.

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] ProfileScreen: firstName, birth date, city, archetype, sign-in method all displayed correctly
- [ ] Subscription row → RevenueCat customer center modal opens
- [ ] NotificationsScreen: enabling daily insight → permission prompt → notification scheduled at user-specified time
- [ ] Analytics opt-out toggle (Step 6.3a): off state → `posthog.optOut()` called, Sentry disabled
- [ ] DeleteAccountScreen: full flow completes → backend RPC succeeds → session cleared → app navigates to Splash → new anonymous session created on next launch
- [ ] Sign out (anonymous user): warning dialog "data will be lost" shown; on confirm: session cleared, app navigates to Splash
- [ ] Sign out (permanent user): no warning dialog; session cleared, app navigates to Splash
- [ ] CrisisResourcesScreen accessible from More tab without authentication required
- [ ] Privacy & Data row links to `omenora.com/privacy` in external browser
- [ ] Terms of Service row links to `omenora.com/terms` in external browser
- [ ] Analytics event fired: `account_deleted` on successful deletion

---

## Phase 7 — Production Preparation

**Goal:** Finalize all assets, configure push notifications, set up EAS production build, complete App Store + Google Play submission config. Validate all compliance requirements.
**Duration:** ~20 hrs
**Prerequisites:** All Phases 0–6 complete. Zero TypeScript errors. Real device tests passed.

---

> **[ARCHITECTURAL DECISION 2026-05-09 — RC ↔ Supabase identity]** PurchasesProvider intentionally skips Purchases.logIn for anonymous Supabase users (PurchasesProvider.tsx lines 99-103). RC manages its own anonymous identity ($RCAnonymousID:xxx) until permanent sign-in fires logIn(permanentSupabaseId), at which point RC aliases the anonymous purchases to the permanent ID. This is RC's documented best practice for anonymous-first auth flows. Avoids polluting RC dashboard with short-lived Supabase anonymous UUIDs (30-day expiry). Any future "anonymous purchase" feature must rely on RC's automatic aliasing, NOT pre-identifying with the Supabase anonymous UUID — pre-identifying would orphan purchases at the 30-day boundary.

> **[METHODOLOGY 2026-05-10 — no-op Quality Gates]** When all prior clusters in a phase have left zero technical debt (clean barrels, no orphaned components, no stale references, all bridge aliases removed inline as each cluster lands), the closing Quality Gate cluster may produce zero commits. This is a SUCCESS pattern — better than a Quality Gate that finds debt the prior clusters should have caught. Phase 3 Cluster 5 produced no commit because Clusters 1-4 cleaned up incrementally. When this happens, document the no-op outcome in the phase's squash commit message rather than treating it as missed work.

---

### Step 7.1 — Finalize app assets

Required files (check existence, create if missing):

| File | Size | Notes |
|---|---|---|
| `assets/icon.png` | 1024×1024 | Already exists ✅ — verify no transparency |
| `assets/adaptive-icon.png` | 1024×1024 | Already exists ✅ |
| `assets/splash.png` | 1284×2778 | Already exists ✅ — verify `#050410` background |
| `assets/notification-icon.png` | 96×96 | **Missing** ❌ — white icon on transparent background |
| `assets/favicon.png` | 32×32 | Already exists ✅ |

> `app.json` references `notification-icon.png` at `notification.icon` — build will warn if missing.

---

### Step 7.2 — EAS project initialization

If not done in Prerequisite P8:

```bash
eas init
```

Replace placeholders in `app.json`:
- `"projectId": "[YOUR_EAS_PROJECT_ID]"` → real EAS project ID
- `updates.url` → real EAS update URL
- `ios.appStoreUrl` → real App Store URL after app record created
- `android.playStoreUrl` → real Play Store URL after app record created

---

### Step 7.3 — EAS submit config

**File:** `eas.json`

Fill placeholders:
```json
"ios": {
  "ascAppId": "[REAL_APPLE_APP_ID]",
  "ascApiKeyPath": "path-to-asc-api-key.p8",
  "ascApiKeyIssuerId": "[REAL_ISSUER_ID]",
  "ascApiKeyId": "[REAL_KEY_ID]"
},
"android": {
  "serviceAccountKeyPath": "path-to-service-account-key.json",
  "track": "internal"
}
```

> Use `track: "internal"` for first submission; promote to `production` manually after review.

---

### Step 7.3a — App Store Connect submission metadata

**Age Rating:** 4+
> Flag: Verify with App Review team — "Counsel" AI feature may push to 12+ due to infrequent/mild mature themes. Set 12+ if uncertain; more permissive ratings are rejectable.

**App Store Connect review notes** — paste verbatim into the "Notes for Reviewer" field:

```
This app is for entertainment and self-reflection purposes only.

Test credentials (permanent premium user):
  Email: reviewer@omenora-test.com
  Password: [CREATE A TEST ACCOUNT — use magic link to create, then grant premium in RC dashboard]

Premium access: The test account has premium entitlement pre-granted via RevenueCat dashboard.
No purchase is required during review.

All in-app purchases use StoreKit Sandbox — real charges cannot occur during review.

"Counsel" is an AI chat feature powered by Claude. It includes:
- A mandatory disclosure modal on first use
- A "for self-reflection only, not medical advice" disclaimer in the chat
- Crisis detection that shows 988 Lifeline instead of AI responses

Account deletion is available at More → Delete Account.
Restore Purchases is available at More → Subscription.

App contains no external payment links. All purchases are via Apple IAP.
```

**Steps to create reviewer demo account:**
1. Create `reviewer@omenora-test.com` via magic link sign-in in a dev build
2. In RevenueCat Dashboard → Users → find by Supabase `user_id` → manually grant `premium` entitlement (no expiry)
3. Store credentials securely — do NOT hardcode in app

**App Privacy Questionnaire** (complete in App Store Connect before submission):
- Data collected: Email address (optional — magic link only), name (optional — Apple only), usage data (PostHog, anonymous), crash data (Sentry, pseudonymous)
- Data linked to identity: email (if provided), name (if provided)
- Data used for tracking: none (no TikTok/Meta App Events SDK in v1 build)
- "Does this app use third-party advertising or tracking": NO — for v1 submission only

**Google Play Data Safety form** (complete in Google Play Console → App content → Data safety):
Mirror the same answers from the Apple privacy questionnaire above.

---

### Step 7.4 — Remove location permissions

**File:** `app.json`

Remove from `ios.infoPlist` (location is not used in v1):
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysUsageDescription`

Remove from `android.permissions`:
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`

> City entry uses Nominatim text search — no device location permission required. Keeping unused location permissions risks App Review rejection.

---

### Step 7.5 — Remove camera + microphone + photo permissions

**File:** `app.json`

Remove from `ios.infoPlist` (not used in v1):
- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`
- `NSPhotoLibraryUsageDescription`

> These were likely added speculatively. Unused permission strings cause App Review rejections.

---

### Step 7.6 — Push notifications setup

**File:** `App.tsx` — add notification permission request

```typescript
import * as Notifications from 'expo-notifications'

// On app start, after auth:
const { status } = await Notifications.requestPermissionsAsync()
// Only request when user enables daily insights in NotificationsScreen
// NOT on app launch — this causes opt-out
```

> Do NOT request notification permission on launch. Request only when user explicitly enables in `NotificationsScreen` (Phase 6.3). Premature permission requests cause high opt-out rates.

Configure `expo-notifications` handler:
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})
```

---

### Step 7.7 — Compliance audit checklist

Before submission, verify each item:

**Counsel compliance (App Review critical):**
- [ ] "AI-generated based on your chart" badge visible near chat input
- [ ] "For self-reflection only — not medical or legal advice" visible in chat
- [ ] Crisis resources accessible from More tab without authentication
- [ ] Crisis keyword detection prevents forwarding to Claude
- [ ] `CounselDisclosureModal` shown on first premium session
- [ ] `CrisisResourcesScreen` includes 988 Lifeline + Crisis Text Line

**IAP compliance (Apple guideline 3.1.1):**
- [ ] No Stripe or external payment links inside the app
- [ ] All purchases go through Apple/Google IAP via RC
- [ ] No mention of pricing available outside the app
- [ ] Restore purchases accessible (RC customer center handles this)

**Account deletion (Apple requirement since June 2022):**
- [ ] `DeleteAccountScreen` reachable without contacting support
- [ ] Deletion is complete — not just deactivation

**Privacy:**
- [ ] Privacy policy link in `AuthGate` before sign-in
- [ ] Privacy & Data in More tab links to `omenora.com/privacy`

**Entertainment disclaimer:**
- [ ] App Store metadata: "For entertainment purposes only"

**Apple Guideline 4.8 (Sign in with Apple equivalence):**
- [ ] Google sign-in is offered → Apple sign-in MUST also be offered on iOS (already true per Phase 0.5)
- [ ] Apple sign-in button appears ABOVE Google sign-in button in `AuthGateScreen` per HIG

**Apple Guideline 5.1.1 (App Store Connect record fields):**
- [ ] App Store Connect → App Information → Privacy Policy URL: `https://omenora.com/privacy`
- [ ] App Store Connect → App Information → Support URL: `https://omenora.com/support`
- [ ] App Store Connect → App Review Information → contact email + phone populated

**Apple Guideline 5.1.2 (Privacy nutrition label accuracy):**
- [ ] App Privacy questionnaire answers in App Store Connect match actual data collected
- [ ] PostHog: declared as "Analytics / Usage Data, not linked to identity"
- [ ] Sentry: declared as "Crash Data, not linked to identity"
- [ ] Supabase: declared as "User Content / Email Address, linked to identity (optional)"

**Google Play Data Safety:**
- [ ] Google Play Console → App content → Data safety form completed
- [ ] Answers mirror the Apple privacy questionnaire from Step 7.3a

**GDPR / CCPA / COPPA:**
> **Flag for user review:** The following items require legal assessment, not just implementation decisions.
- [ ] GDPR: Privacy policy at `omenora.com/privacy` covers right to access, right to erasure (in-app deletion exists ✅), data processing basis
- [ ] CCPA: Privacy policy includes "California residents" section; assess whether "Do Not Sell" applies (PostHog analytics = likely no; TikTok/Meta attribution = likely yes once added in v1.1)
- [ ] COPPA: App is rated 12+; no special COPPA compliance needed for 13+ age gate — verify age rating matches Step 7.3a
- [ ] Privacy Manifest: `PrivacyInfo.xcprivacy` created per Step 7.7h

---

### Step 7.7a — Device matrix testing

Test on minimum 4 real devices before submission:

| Device | Purpose |
|---|---|
| iPhone SE 3rd gen | Smallest supported screen (375pt) — baseline |
| iPhone 15 Pro | Current flagship, Dynamic Island |
| iPad | Tablet layout — `supportsTablet: true` in `app.json` |
| Android mid-range (e.g., Samsung Galaxy A54) | Android baseline |

All 27 screens must render without layout overflow, truncation, or broken safe area.

---

### Step 7.7b — VoiceOver / TalkBack audit

Navigate all 27 screens with VoiceOver (iOS) enabled. Verify:
- [ ] All interactive elements have `accessibilityLabel`
- [ ] `LockedCard` announces "Locked — double tap to unlock"
- [ ] `CounselChatScreen` input announces "Message input field"
- [ ] Tab bar labels announced correctly ("Today", "Readings", "Counsel", "More")
- [ ] `AuthGateScreen` provider buttons labeled ("Sign in with Apple", "Sign in with Google")

---

### Step 7.7c — Slow-network testing

Enable Network Link Conditioner (iOS) at "3G" profile. Verify:
- [ ] `CalculatingScreen` loader shows during chart computation (no blank screen)
- [ ] `ReadingsScreen` premium content shows skeleton while fetching
- [ ] `CounselChatScreen` send button disables during request
- [ ] All loading states use `<Skeleton>` component (not blank white)

---

### Step 7.7d — Offline behavior verification

Disable network entirely. Verify:
- [ ] App launches without crash (cached profile loads from `AsyncStorage`)
- [ ] `TodayScreen` shows cached horoscope or graceful `<EmptyState>`
- [ ] `CounselChatScreen` shows "No connection" `<Toast>` — does not submit to API
- [ ] `AuthGateScreen` shows "No connection" and disables sign-in buttons

---

### Step 7.7e — Edge case scenarios

- [ ] Account deletion mid-active-subscription: subscription cancelled at RC, row deleted, session cleared
- [ ] Subscription expiry while app is open: `PurchasesProvider` listener fires → `LockedCard` appears without restart
- [ ] Anonymous user reinstalls: new anonymous session created, old data not recoverable (expected)
- [ ] Apple sign-in revoked from iOS Settings → app session cleared on next launch

---

### Step 7.7f — Performance pass

Cold start target: <2s from launch to interactive Today tab.

- [ ] Cold start <2s on iPhone SE 3rd gen (baseline device) — measure with Xcode Instruments → Time Profiler
- [ ] Tab switch transitions <16ms frame drops (60fps)
- [ ] `BigThreeRevealScreen` Moti animation completes in <500ms
- [ ] Font load does not block splash (verify `expo-splash-screen` hides only after fonts ready)

---

### Step 7.7g — Copy review

Review all user-facing strings for:
- [ ] Astrology/numerology claims: no predictions framed as fact ("you WILL meet someone" → "your chart suggests...")
- [ ] Counsel copy: no therapeutic framing
- [ ] Paywall copy: no "limited time" urgency without a real end date (dark pattern risk)
- [ ] Delete account warning: plain language, no guilt-tripping

---

### Step 7.7h — Privacy Manifest (PrivacyInfo.xcprivacy — iOS required)

Apple requires a `PrivacyInfo.xcprivacy` file declaring all third-party SDK data collection (required since Spring 2024).

Create `ios/omenora/PrivacyInfo.xcprivacy` declaring:
- `NSPrivacyAccessedAPITypes`: none currently required (no `UserDefaults`, `FileTimestamp`, `Disk space`, `System boot time` API usage)
- `NSPrivacyCollectedDataTypes`: declare all data collected by Sentry, PostHog, RevenueCat, and Google Sign-In

> **Flag for user review:** Exact `PrivacyInfo.xcprivacy` entries depend on SDK versions. Verify required keys against each SDK's published privacy manifest before submission.

---

### Step 7.8 — OTA updates configuration

**File:** `app.json` — already configured ✅:
```json
"updates": {
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 0
}
```

`expo-updates` already installed (`~0.28.18`) ✅.
`runtimeVersion.policy: "appVersion"` ✅ — OTA updates only within same app version.

---

### Step 7.9 — Production EAS build

```bash
# iOS production build
eas build --profile production --platform ios

# Android production build
eas build --profile production --platform android
```

---

### Step 7.10 — Submit to stores

```bash
# After builds complete:
eas submit --platform ios
eas submit --platform android
```

> Android submission requires Play Console identity verification to be complete (Prerequisite P6 — can take 2-7 days).

---

### Step 7.11 — Final TypeScript + build verification

```bash
npx tsc --noEmit
```

Zero errors. No warnings in EAS build output. All asset files present.

---

> **[DECISION 2026-05-09 — Onboarding visual polish deferral]** Phase 2 ships functional onboarding without S-tier visual elevation. Deferred to dedicated post-Phase-7 polish pass (~6-10hr, self-contained against existing tokens). Reasoning: maintaining phase momentum > visual perfection mid-build. Polish targets: WelcomeScreen orbital phoenix + star field animation, BirthInfoScreen constellation-themed inputs, BigThreeRevealScreen constellation backdrop + foil shimmer on archetype, PremiumTeaserScreen gold gradient buttons + animated benefit reveals + social proof line. No architectural changes — exercises existing design tokens.

> **[DECISION 2026-05-09 — Today tab post-onboarding state]** Today tab currently shows generic "Begin the reading" / "Check Compatibility" CTAs aimed at users who haven't done a reading. After Phase 2, returning users land on Today with a completed reading already in profileStore. Phase 3 must redesign Today tab content for the "user has reading" state: show their archetype, their big three, their next forecast — not re-pitch them to start a reading they already completed.

> **[BUILD STATE TROUBLESHOOTING 2026-05-09]** Stale DerivedData + stale ios/build/ can cause RC native module load failures (e.g. `Cannot read property 'setLogLevel' of null`) even when CocoaPods state is consistent. CocoaPods path-pods (`:path => '../node_modules/...'` for autolinked RN modules) compile in-place from node_modules and never appear in ios/Pods/ — their absence is correct, NOT corruption. Full reset sequence when native module load fails:
> 1. `rm -rf ios/Pods ios/Podfile.lock ios/build`
> 2. `rm -rf ~/Library/Developer/Xcode/DerivedData/OMENORA-*`
> 3. `cd ios && pod install --repo-update`
> 4. `cd .. && npx expo run:ios --device`
>
> Time cost: ~10 minutes including cold rebuild. Recommended after any native module install/upgrade or when JS sees a "property of null" error from a native module.

---

## Environment Variables Master List

### Convention

- `EXPO_PUBLIC_*` — client-accessible in React Native app code. Safe for non-secret values.
- Non-`EXPO_PUBLIC_` — server-side only (Railway backend). Never goes in the app.
- **EAS Secrets** — encrypted; set via `eas secret:create`. Use for production secrets in CI builds.
- **`.env` file** — gitignored local file. Use for dev values only. Never commit.

### Mobile App Variables

| Variable | Local Dev (`.env`) | EAS Production (Secret) | Notes |
|---|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:3000` | `https://api.omenora.com` | Already exists in codebase ✅ |
| `EXPO_PUBLIC_SUPABASE_URL` | Dev Supabase project URL | Production Supabase URL | Phase 0.5 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Dev anon key | Production anon key (EAS Secret) | Phase 0.5 |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Same for dev + prod | EAS Secret | Phase 0.5 |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same for dev + prod | EAS Secret | Phase 0.5 |
| `EXPO_PUBLIC_RC_APPLE_KEY` | Sandbox RC key | Production RC key (EAS Secret) | Phase 1 |
| `EXPO_PUBLIC_RC_GOOGLE_KEY` | Sandbox RC key | Production RC key (EAS Secret) | Phase 1 |
| `EXPO_PUBLIC_SENTRY_DSN` | Dev project DSN | Production DSN (EAS Secret) | Phase DS — Gap A |
| `EXPO_PUBLIC_POSTHOG_KEY` | Dev project key | Production key (EAS Secret) | Phase DS — Gap A |

### Railway Backend Variables

| Variable | Dev Railway Instance | Production Railway Instance | Notes |
|---|---|---|---|
| `SUPABASE_URL` | Dev Supabase URL | Production Supabase URL | Phase 0.5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key | Production service role key | Phase 0.5 — NEVER in app |
| `RC_WEBHOOK_SECRET` | Test webhook secret | Production webhook secret | Phase 1 |
| `RC_SECRET_API_KEY` | Test RC API key | Production RC API key | Phase 1 |
| `RESEND_API_KEY` | Test Resend key | Production Resend key | Phase 0.5 |

### EAS Build Profile Env Injection

Add to `eas.json` under `build.production.env`:
```json
{
  "EXPO_PUBLIC_API_BASE_URL": "https://api.omenora.com"
}
```

> All other production secrets use `eas secret:create --name VAR_NAME --value VALUE` — stored encrypted in EAS, not in `eas.json`.
> `SUPABASE_SERVICE_ROLE_KEY` goes on Railway backend only — NEVER in the mobile app or EAS.

---

## New Files Summary

All new files created across all phases (does not include modified existing files):

### `src/lib/`
- `supabase.ts`

### `src/context/`
- `AuthProvider.tsx`
- `PurchasesProvider.tsx`
- `index.ts`

### `src/stores/`
- `profileStore.ts` (renamed from `analysisStore.ts`)

### `src/design/tokens/`
- `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `motion.ts`, `index.ts`

### `src/design/theme/`
- `ThemeProvider.tsx`, `useTheme.ts`

### `src/components/atoms/`
- `Text.tsx`, `Icon.tsx`, `Button.tsx`, `TextInput.tsx`, `Chip.tsx`, `Avatar.tsx`, `Badge.tsx`, `Divider.tsx`, `Skeleton.tsx`

### `src/components/molecules/`
- `TextField.tsx`, `DateField.tsx`, `TimeField.tsx`, `CityField.tsx`, `ListItem.tsx`, `ChipGroup.tsx`, `ProgressDots.tsx`, `Toast.tsx`

### `src/components/organisms/`
- `Card.tsx`, `LockedCard.tsx`, `DailyCard.tsx`, `ReadingCard.tsx`, `TransitCard.tsx`, `ChatBubble.tsx`, `SectionHeader.tsx`, `BottomSheet.tsx`, `Header.tsx`, `Modal.tsx`

### `src/components/templates/`
- `ScreenWrapper.tsx`, `OnboardingStep.tsx`, `PaywallShell.tsx`, `EmptyState.tsx`, `ErrorState.tsx`

### `src/screens/onboarding/`
- `SplashScreen.tsx`, `WelcomeScreen.tsx`, `BirthInfoScreen.tsx`, `BirthTimeLocationScreen.tsx`, `CalculatingScreen.tsx`, `BigThreeRevealScreen.tsx`, `OptionalQuestionsScreen.tsx`, `PremiumTeaserScreen.tsx`

### `src/screens/tabs/`
- `TodayScreen.tsx`, `ReadingsScreen.tsx`, `CounselScreen.tsx`, `MoreScreen.tsx`

### `src/screens/counsel/`
- `CounselChatScreen.tsx`, `CounselDisclosureModal.tsx`

### `src/screens/settings/`
- `ProfileScreen.tsx`, `NotificationsScreen.tsx`, `DeleteAccountScreen.tsx`, `CrisisResourcesScreen.tsx`, `TraditionSwitcherScreen.tsx`

### `src/screens/`
- `AuthGateScreen.tsx`

### `src/screens/dev/`
- `ComponentsScreen.tsx` (dev only)

---

## Files Deleted Across All Phases

| File | Phase |
|---|---|
| `src/screens/PreviewScreen.tsx` | 0 |
| `src/screens/SubscriptionScreen.tsx` | 0 |
| `src/screens/AnalysisScreen.tsx` | 2 |
| `src/screens/HomeScreen.tsx` | 3 |
| `src/screens/ReadingScreen.tsx` | 3 |
| `src/screens/ReportScreen.tsx` | 3 |
| `src/screens/ExploreScreen.tsx` | 3 |
| `src/screens/MoreScreen.tsx` | 3 (replaced by `src/screens/tabs/MoreScreen.tsx`) |

---

## Total Estimate

| Phase | Name | hrs |
|---|---|---|
| 0 | Cleanup & Dead Code Removal | 4 |
| DS | Design System Foundation | 24 |
| 0.5 | Authentication (Supabase) | 25 |
| 1 | RevenueCat & Monetization | 32 |
| 2 | Onboarding Rewrite | 10 |
| 3 | Tab Structure & Navigation | 8 |
| 4 | Feature Screens | 13 |
| 5 | Counsel Chat | 8 |
| 6 | More Tab & Settings | 6 |
| 7 | Production Preparation | 20 |
| **Total** | | **~150 hrs** |

> External setup (Prerequisites P1–P11) adds approximately 8–15 hrs of non-code platform configuration and is not included above.

---

## Rollback & Hotfix Strategy

### EAS Update Channels

Configure 3 update channels in `eas.json`:
```json
"production": {
  "channel": "production"
},
"preview": {
  "channel": "preview"
},
"development": {
  "developmentClient": true,
  "channel": "development"
}
```

### Hotfix Decision Tree

```
Is the bug JS-only (no native module changes)?
├── YES → OTA hotfix via `eas update --channel production --message "hotfix: ..."` → live in ~5 min
└── NO  → Full EAS build required → submit to App Store → 1-24 hr review
         (Request expedited review at https://developer.apple.com/contact/app-store/?topic=expedite)
```

### Rollback Procedure

```bash
# List recent updates on production channel
eas update:list --channel production

# Roll back to a previous update
eas update --channel production --republish --group [PREVIOUS_UPDATE_GROUP_ID]
```

### Feature Flag Instant Disable

Use RevenueCat Offering visibility to instantly disable a broken premium feature without a code push:
- RevenueCat Dashboard → Offerings → hide the relevant offering
- `PurchasesProvider` returns no offering → `LockedCard` shows for all users → feature effectively disabled
- Re-enable by making offering visible again — no deploy required

> This is the fastest mitigation for a broken Counsel endpoint or a paywall rendering crash.

---

## Future Phases — v1.1 and v1.2

These are post-launch phases. No implementation steps defined here. For full decisions, see `STRATEGY_OMENORA_MOBILE_APP_DECISIONS.md` Roadmap section.

### v1.1 — 2–3 Weeks Post-Launch (~8 hrs)

**RevenueCat targeting expansion:**
- `country_tier_2` targeting rule (IN, BR, MX, ID, PH → ~$7.99/mo PPP pricing)
- `goal_love` rule → compatibility-emphasis paywall variant
- `goal_counsel` rule → Counsel-headlined paywall variant
- `winback` rule → 50% off first month for churned users
- 3 new RC paywalls: `paywall_winback`, `paywall_love`, `paywall_counsel_v2`

**Mobile feature additions:**
- Persistent Counsel chat history (v1 is session-only)
- Per-screen tradition switcher (v1 is global setting only)
- Dynamic Counsel suggested questions (v1 is hardcoded)

**Attribution infrastructure:**
- TikTok App Install pixel + Meta App Events SDK
- ATT (App Tracking Transparency) prompt on iOS
- `expo-tracking-transparency` install
- `NSUserTrackingUsageDescription` in `app.json`
- Analytics opt-out toggle wired to TikTok/Meta SDK (extends Step 6.3a)

### v1.2 — 6–8 Weeks Post-Launch (~16 hrs)

3 A/B tests via RevenueCat Paywall Editor (no app code changes required):

| Test | Control | Variants | Metric |
|---|---|---|---|
| Trial vs No-Trial | Hard paywall | A: 3-day trial · B: 7-day trial | 30-day net revenue/install |
| Annual price | $99.99/yr | A: $107.99 · B: $119.99 | 30-day total revenue |
| Counsel positioning | Supporting feature | Headline differentiator | 7-day conversion + Counsel usage |

> Prerequisite: Sentry + PostHog event data from minimum 500 users required for A/B statistical significance.

---

## Session Log

### Session — 2026-05-06

#### P3 — Step 4: Redirect URL allowlist

`omenora://**` added to Supabase Auth → URL Configuration → Redirect URLs. Total URLs: 3 ✓. Toast confirmed "Successfully added 1 URL."

#### P3 — Step 5: Final Sanity Check

| Item | Required value | Status |
|---|---|---|
| Allow anonymous sign-ins | ON | ✅ |
| Apple provider | Enabled | ✅ |
| Apple Client IDs | `com.omenora.app,com.omenora.app.signin` | ✅ |
| Apple Secret Key | empty (native-only) | ✅ |
| Google provider | Enabled | ✅ |
| Google Client IDs | Web ID + iOS ID | ✅ |
| Google Client Secret | Web Secret | ✅ |
| Email provider | Enabled (existing, untouched) | ✅ |
| Site URL | `https://omenora.com` | ✅ |
| Redirect URLs | `omenora://**` added | ✅ |

**P3 complete.**

#### Prerequisites — final state after this session

| | Task | Status |
|---|---|---|
| **P8** | EAS init | ✅ projectId `8f7dfec9-fd02-4ed9-85b9-8cdbeba7c6d3` set in `app.json`; CLI constraint bumped to `>=18.0.0` |
| **P1** | Apple Developer | ✅ Team ID, Bundle ID, Services ID, Sign-In Key all configured |
| **P2** | Google Cloud OAuth | ✅ Web + iOS clients done · Android deferred |
| **P4** | Resend SMTP | ✅ Collapsed — Option B uses existing web endpoint; no mobile-specific SMTP needed |
| **P3** | Supabase Auth providers | ✅ Anonymous on, Apple + Google providers configured, redirect URL allowlist updated |
| **P5** | App Store Connect | ⏳ Waits for D-U-N-S decision + identity |
| **P6** | Google Play Console | ⏳ Identity verified · Android device verification still pending |
| **P7** | RevenueCat | ⏳ Depends on P5/P6 products |
| **P9** | Apple Small Business Program | ⏳ Anytime before launch |

#### What we did this session

- Cleared **P8**: `eas init` — bumped CLI constraint to `>=18.0.0`, linked project `8f7dfec9`, set `projectId` + `updates.url` in `app.json`
- Cleared **P1**: Apple Developer — Team ID, Bundle ID, Services ID (`com.omenora.app.signin`), Sign-In Key
- Cleared **P2**: Google Cloud — Web Client ID + iOS Client ID created; Android deferred
- Identified **Option B** for magic link: mobile reuses web's `/api/auth/request-magic-link` — no Resend SMTP setup needed (P4 collapsed)
- Cleared **P3**: anonymous sign-in on; Apple + Google providers configured; `omenora://**` added to redirect allowlist
- Confirmed parallel work in progress: Google Play identity verification (P6), D-U-N-S (blocks P5)

**Unblocked phases:** Phase 0 → DS → 0.5 → 2 → 3 → 4 → 6. P5 / P7 / P9 wait until closer to launch.

---

### Session — 2026-05-07

**Branches:** `feature/phase-ds` (created from develop) → 13 commits → ready to merge after DS.19. Side commit on develop: `4c6d06c` (admin self-payment bypass).

#### What we did this session

- Phase DS commits 1-18 landed (DS.0 deferred, DS.2/DS.3 deferred). 13 commits total on `feature/phase-ds`:
  - `5603f9d` packages: lucide-react-native, expo-blur, moti, expo-haptics
  - `e9012f3` tokens: src/design/tokens (colors, typography, spacing, radius, motion + barrel)
  - `792db1c` theme: new ThemeProvider with token context + reduceMotion accessibility
  - `e67d7a1` components: scaffold atoms/molecules/organisms/templates dirs
  - `38d0782` atoms: 8 components + 9 type exports
  - `20cc6a2` molecules (1/2): TextField, ListItem, ChipGroup, ProgressDots, Toast
  - `08dfdef` molecules (2/2): DateField, TimeField, CityField + Nominatim helper at src/api/nominatim.ts
  - `c56a43d` organisms (1/2): Card, SectionHeader, Header, Modal, BottomSheet, ChatBubble + GestureHandlerRootView wired in App.tsx
  - `436e06d` organisms (2/2): LockedCard, DailyCard, ReadingCard, TransitCard
  - `32b4b9a` templates: ScreenWrapper, OnboardingStep, PaywallShell, EmptyState, ErrorState
  - `fa1ea88` navigation: TabNavigator Lucide icons + design token migration, RootNavigator surface.base
  - `8d173ac` dev preview: ComponentsScreen + hidden __DEV__ route + MoreScreen entry
  - `6c505c1` eas: suppress push notification setup prompt
- Side commit on `develop`: `4c6d06c` (`feat(stripe): admin self-payment bypass + adminSecret runtime config`) — web app work that was sitting modified in working tree from prior session, committed cleanly to its proper branch
- Local iOS dev client rebuilt with `npx expo prebuild --platform ios --clean` + `npx expo run:ios --device` after adding native modules (expo-blur, expo-haptics, gesture-handler). EAS cloud build attempted but failed during Install dependencies phase — diagnosed as likely peer-deps mismatch in CI; deferred since local builds are sufficient for dev iteration. EAS resolution required before Phase 1 TestFlight.

#### Lessons learned

- **Token-namespace audits must grep for `<namespace>\.` patterns** (e.g., `fonts\.cormorant`), not just underlying string values. The font cleanup detour came from this gap — searching for `CormorantGaramond` missed indirect references through `fonts.cormorant` token export. Recovered cleanly; logged for all future token-removal work.
- **Smoke tests on JSX-importing files** generate `--jsx not set` errors under standalone tsc. Either pass `-p tsconfig.json` or skip the smoke test for files that pull JSX. Project tsc step is the real check.
- **Don't `require()` RN packages from Node** to verify symbols. RN packages use Flow types and JSX. tsc catches missing imports at the project check step — that's the real verification.
- **`git add` with explicit paths**, never `-A`, when working in a monorepo. Augur/ web files in the parent dir would otherwise get swept up.
- **Sibling component imports use `./X` not via barrel** — established in CityField → TextField. Avoids circular dependency risk when barrel re-exports the component you're importing from.
- **`GestureHandlerRootView` must wrap the app root** — installed-but-unwired is a silent runtime failure. Caught in DS.15a audit, wired in DS.15a commit.
- **`__DEV__` JSX-gate pattern** is the right approach for dev-only routes. Always-import the screen file (Metro tree-shakes from prod), gate only the `<Stack.Screen>` JSX render with `{__DEV__ && ...}`. Avoids conditional-import gymnastics that TypeScript chokes on.
- **CocoaPods will sunset Dec 2, 2026** (read-only trunk). Migration target is Swift Package Manager. Not blocking us yet — RN 0.79.6 with current Expo SDK is fine. Future concern for Phase 7+.
- **Local `npx expo run:ios --device` is the correct workflow for dev iteration** post-2025 deprecation. Faster than EAS, no credentials/queue dance, full native module bridging. EAS reserved for distribution.

#### Outstanding work

- **DS.19** (final tsc clean check) and **Phase DS merge to develop** — to be done at end of this session.
- **DS.0 (Sentry/PostHog observability)** — deferred until P10/P11 prerequisites complete.
- **DS.2/DS.3 (font cleanup)** — deferred to Phase 7 production prep.
- **EAS cloud build failure** — diagnosis deferred until Phase 1 (TestFlight needs).
- **Web asset migration** — flagged for Phase 2: existing PNG/SVG brand assets at `augur/public/` should be reused on mobile rather than recreated. EmptyState's geometric SVG is placeholder.
