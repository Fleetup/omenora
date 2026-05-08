



Now let me read the top of each screen file and run the grep searches simultaneously:

Let me re-run the per-screen scan:

The top-of-file scan was truncated. Let me get the missing screens:













Now I have everything needed. Let me do one final check to verify auth/RC context files:



Interesting — context and lib already have files. Let me check their state:



I now have all the data needed. Here's the full audit report:

---

# Mobile App Screens Audit — Read-Only Report

## Step A — Screen Inventory (11 files)

```
src/screens/AnalysisScreen.tsx
src/screens/CalendarScreen.tsx
src/screens/CompatibilityScreen.tsx
src/screens/dev/ComponentsScreen.tsx
src/screens/ExploreScreen.tsx
src/screens/HomeScreen.tsx
src/screens/MoreScreen.tsx
src/screens/PrivacyScreen.tsx
src/screens/ReadingScreen.tsx
src/screens/ReportScreen.tsx
src/screens/TermsScreen.tsx
```

No `onboarding/`, `tabs/`, `counsel/`, or `settings/` subdirectories exist yet.

---

## Step B — Token Import Audit

| Screen | Imports `../theme/colors` + `../theme/fonts` (old) | Imports `../design/tokens` (new) |
|---|---|---|
| `AnalysisScreen.tsx` | ✅ lines 17–18 | ✗ |
| `CalendarScreen.tsx` | ✅ lines 12–13 | ✗ |
| `CompatibilityScreen.tsx` | ✅ lines 12–13 | ✗ |
| `ExploreScreen.tsx` | ✅ lines 11–12 | ✗ |
| `HomeScreen.tsx` | ✅ lines 11–12 | ✗ |
| `MoreScreen.tsx` | ✅ lines 14–15 | ✗ |
| `PrivacyScreen.tsx` | ✅ lines 5–6 | ✗ |
| `ReadingScreen.tsx` | ✅ lines 12–13 | ✗ |
| `ReportScreen.tsx` | ✅ lines 14–15 | ✗ |
| `TermsScreen.tsx` | ✅ lines 5–6 | ✗ |
| `dev/ComponentsScreen.tsx` | ✗ | ✅ line 47 (`space`, `layout`) |

**Every production screen uses old token paths.** Only the dev-only `ComponentsScreen` uses `design/tokens`.

---

## Step C — Navigation State

**[TabParamList](cci:2://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:5:0-10:2) current keys** (`@/src/navigation/types.ts:6-11`):
```
HomeTab    →  label "Today"    (icon: Sun)
ReadingTab →  label "Readings" (icon: BookOpen)
ExploreTab →  label "Counsel"  (icon: MessageCircle)
MoreTab    →  label "More"     (icon: MoreHorizontal)
```
Labels and icons were updated in DS.17. **Key names are still old** (`HomeTab/ReadingTab/ExploreTab`) — Phase 3 Step 3.1 renames them to `TodayTab/ReadingsTab/CounselTab`.

**[RootStackParamList](cci:2://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:13:0-22:2) current routes** (`@/src/navigation/types.ts:14-23`):
```
MainTabs, Analysis, Report, Calendar, Compatibility, Privacy, Terms, Components
```
Missing: all Phase 2 onboarding routes, `AuthGate` route, Phase 4–6 settings/counsel routes.

---

## Step D — Old Design Blockers

| Grep target | Result |
|---|---|
| `bundlePurchased\|paymentComplete\|oraclePurchased` | **0 results** ✅ Phase 0 done |
| `HomeTab\|ReadingTab\|ExploreTab` in `src/navigation/` | **6 hits** — [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0) lines 7–9, 27, 31, 35; [TabNavigator.tsx](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/TabNavigator.tsx:0:0-0:0) lines 15–17, 39–41 |
| `@/api/stripe\|stripeClient` | **0 results** ✅ |

---

## Step E — New Design System Usage in Screens

| Component/token | Used in production screens? |
|---|---|
| `from '*/design/tokens'` | **No production screens** — only `dev/ComponentsScreen.tsx` |
| `OnboardingStep` | Not used in any screen |
| `LockedCard` | `dev/ComponentsScreen.tsx` only |
| `DailyCard` | `dev/ComponentsScreen.tsx` only |
| `ScreenWrapper` | `dev/ComponentsScreen.tsx` only |

The new atom/molecule/organism/template layer (`src/components/atoms/`, `organisms/`, etc.) exists and is complete (Phase DS done), but **no production screen consumes it yet**.

---

## Step F — Final Status Table

### Existing screens

| Screen file | Status | Phase plan |
|---|---|---|
| `AnalysisScreen.tsx` | exists, old — old token imports, old quiz flow | Phase 2 Step 2.11 → **DELETE**; replaced by 8 `onboarding/` screens |
| `CalendarScreen.tsx` | exists, old — old tokens; `ScreenHeader`/`GhostBadge` from `ui/`; hardcoded lock UI | Phase 4 Step 4.1 → **Rewire** RC entitlements, replace `LOCKED_FADE` with `LockedCard` |
| `CompatibilityScreen.tsx` | exists, old — old tokens; `ScreenHeader`/`GhostBadge` from `ui/`; hardcoded lock UI | Phase 4 Step 4.2 → **Rewire** RC entitlements, replace with `LockedCard` |
| `dev/ComponentsScreen.tsx` | exists, partially new — imports `design/tokens`; uses `LockedCard`/`DailyCard`/`ScreenWrapper` | Phase DS.18 ✅ **COMPLETE**. Dev-only, `__DEV__` gated |
| `ExploreScreen.tsx` | exists, old — old tokens, static pitch content | Phase 3 Step 3.5 → **DELETE**; replaced by `tabs/CounselScreen.tsx` |
| `HomeScreen.tsx` | exists, old — old tokens, web-site style layout | Phase 3 Step 3.3 → **DELETE**; replaced by `tabs/TodayScreen.tsx` |
| `MoreScreen.tsx` | exists, old — old tokens, old menu structure | Phase 3 Step 3.6 → **DELETE**; replaced by `tabs/MoreScreen.tsx` |
| `PrivacyScreen.tsx` | exists, old — old tokens | Implicitly deprecated — Phase 3 More tab links to `omenora.com/privacy` (no explicit deletion step in plan) |
| `ReadingScreen.tsx` | exists, old — old tokens, old report check logic | Phase 3 Step 3.4 → **DELETE**; merged into `tabs/ReadingsScreen.tsx` |
| `ReportScreen.tsx` | exists, old — old tokens, `ScreenHeader`/`GhostBadge`/`TraitPill`/`SectionBlock` from `ui/` | Phase 3 Step 3.4 → **DELETE**; merged into `tabs/ReadingsScreen.tsx` |
| `TermsScreen.tsx` | exists, old — old tokens | Implicitly deprecated — Phase 3 More tab links to `omenora.com/terms` (no explicit deletion step) |

### Missing screens (called for by plan)

| Screen file | Status | Phase |
|---|---|---|
| `src/screens/AuthGateScreen.tsx` | **Note:** Plan called for a screen; instead `AuthGate` was built as `src/components/organisms/AuthGate.tsx` (bottom sheet organism). No route in [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0). | Phase 0.5 Step 0.5.11 — architecture diverged |
| `src/screens/onboarding/SplashScreen.tsx` | **missing** | Phase 2 Step 2.3 |
| `src/screens/onboarding/WelcomeScreen.tsx` | **missing** | Phase 2 Step 2.4 |
| `src/screens/onboarding/BirthInfoScreen.tsx` | **missing** | Phase 2 Step 2.5 |
| `src/screens/onboarding/BirthTimeLocationScreen.tsx` | **missing** | Phase 2 Step 2.6 |
| `src/screens/onboarding/CalculatingScreen.tsx` | **missing** | Phase 2 Step 2.7 |
| `src/screens/onboarding/BigThreeRevealScreen.tsx` | **missing** | Phase 2 Step 2.8 |
| `src/screens/onboarding/OptionalQuestionsScreen.tsx` | **missing** | Phase 2 Step 2.9 |
| `src/screens/onboarding/PremiumTeaserScreen.tsx` | **missing** | Phase 2 Step 2.10 |
| `src/screens/tabs/TodayScreen.tsx` | **missing** | Phase 3 Step 3.3 |
| `src/screens/tabs/ReadingsScreen.tsx` | **missing** | Phase 3 Step 3.4 |
| `src/screens/tabs/CounselScreen.tsx` | **missing** | Phase 3 Step 3.5 |
| `src/screens/tabs/MoreScreen.tsx` | **missing** | Phase 3 Step 3.6 |
| `src/screens/settings/TraditionSwitcherScreen.tsx` | **missing** | Phase 4 Step 4.4 |
| `src/screens/counsel/CounselDisclosureModal.tsx` | **missing** | Phase 5 Step 5.1 |
| `src/screens/counsel/CounselChatScreen.tsx` | **missing** | Phase 5 Step 5.2 |
| `src/screens/settings/CrisisResourcesScreen.tsx` | **missing** | Phase 5 Step 5.3 |
| `src/screens/settings/ProfileScreen.tsx` | **missing** | Phase 6 Step 6.1 |
| `src/screens/settings/NotificationsScreen.tsx` | **missing** | Phase 6 Step 6.3 |
| `src/screens/settings/DeleteAccountScreen.tsx` | **missing** | Phase 6 Step 6.4 |

---

## Phase Progress Summary

| Phase | Status | Evidence |
|---|---|---|
| **Phase 0** — Cleanup | ✅ COMPLETE | `PreviewScreen`/`SubscriptionScreen` deleted; 0 payment flag hits; `profileStore.ts` exists |
| **Phase DS** — Design System | ✅ COMPLETE | All token files, atoms, molecules, organisms, templates present; `ComponentsScreen` renders them |
| **Phase 0.5** — Auth (Supabase) | ⚠️ INFRASTRUCTURE DONE | `AuthProvider.tsx`, `PurchasesProvider.tsx`, `supabase.ts` exist and wired in `App.tsx`; `AuthGate` built as organism; onboarding routes/screens not yet added |
| **Phase 1** — RevenueCat | ⚠️ INFRASTRUCTURE DONE | `PurchasesProvider.tsx` imports `react-native-purchases`; wired in `App.tsx`; no RC-specific screen routes yet |
| **Phase 2** — Onboarding Rewrite | ❌ NOT STARTED | No `onboarding/` directory; no routes in [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0); `AnalysisScreen` still exists |
| **Phase 3** — Tab Structure | ❌ NOT STARTED | No `tabs/` directory; old `HomeTab/ReadingTab/ExploreTab` keys still in [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0) |
| **Phase 4** — Feature Screens | ❌ NOT STARTED | No `TraditionSwitcherScreen`; `CalendarScreen`/`CompatibilityScreen` still have old lock logic |
| **Phase 5** — Counsel Chat | ❌ NOT STARTED | No `counsel/` directory |
| **Phase 6** — More/Settings | ❌ NOT STARTED | No `settings/` directory |

---

## Key Findings

1. **Phases 2–6 are 0% started** — 19 screen files yet to be created across 4 new subdirectories.
2. **All 10 production screens use `../theme/colors` + `../theme/fonts`** — the new `design/tokens` system is only referenced in the dev preview screen. Every old screen that gets replaced/rewritten must switch to the new token path.
3. **Phase 0.5/1 infrastructure exists** (`AuthProvider`, `PurchasesProvider`, `supabase.ts`, `AuthGate` organism) but screens diverged from plan — `AuthGate` is an organism, not a route. The [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0) has no auth or onboarding routes yet. This needs to be reconciled before Phase 2 begins.
4. **Tab key names are stale** — `HomeTab/ReadingTab/ExploreTab` still live in [types.ts](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/types.ts:0:0-0:0) and [TabNavigator.tsx](cci:7://file:///Volumes/ESSD/Projects/Augur-V1/mobile-app/src/navigation/TabNavigator.tsx:0:0-0:0). Phase 3 Step 3.1 must rename them before new tab screens can be wired.