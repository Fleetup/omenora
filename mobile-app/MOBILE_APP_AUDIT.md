# OMENORA Mobile App — Production-Readiness Audit (v2)

**Audit date:** 2026-05-01  
**Auditor:** Senior Mobile Engineer (Cascade)  
**Scope:** Static code inspection — web and mobile source trees examined. No builds, installs, or test runs executed.  
**New in v2:** Corrected tech stack, full UI redesign specification (§11), deeper analytics/payment analysis, README drift noted.

---

## STEP 1 — LOCATE & IDENTIFY

**Mobile app root:** `/Volumes/ESSD/Projects/Augur-V1/mobile-app`

> **README.md is stale.** It states "Expo SDK 51", "TypeScript 5.3", "React Navigation v6", and "Payments: Stripe React Native" — all four are wrong. The correct values come from `package.json` below.

### 1.1 Core Framework

| Property | Actual Value | Source |
|---|---|---|
| Framework | **Expo SDK ~53.0.0** (managed workflow + EAS Build + `expo-dev-client`) | `package.json` line 29 |
| React Native | **0.79.6** | `package.json` line 47 |
| React | **19.0.0** | `package.json` line 46 |
| Language | **TypeScript ~5.8.3** — strict mode, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals` | `tsconfig.json` lines 17-22 |
| Package manager | **npm** (package-lock.json present) | project root |
| Node requirement | >=22.0.0 | `package.json` line 69 |
| Min iOS deployment | **15.1** | `ios/Podfile` line 10 |
| New Architecture | **Enabled** on both platforms | `app.json` lines 93-97 via `expo-build-properties` |
| Bundle ID (iOS) | `com.omenora.app` | `app.json` line 20 |
| Package (Android) | `com.omenora.app` | `app.json` line 43 |
| EAS Project ID | **`[YOUR_EAS_PROJECT_ID]`** ← PLACEHOLDER | `app.json` lines 103, 108 |

### 1.2 Full Dependency Inventory (`package.json`)

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~53.0.0 | SDK + managed workflow runtime |
| `react-native` | 0.79.6 | Core mobile framework |
| `react` | 19.0.0 | UI library |
| `@react-navigation/native` | ^7.1.10 | Navigation container |
| `@react-navigation/native-stack` | ^7.3.10 | Native stack navigator |
| `@react-navigation/bottom-tabs` | ^7.3.0 | Bottom tab navigator (declared, **no bottom tab screen exists**) |
| `@expo-google-fonts/cormorant-garamond` | ^0.4.1 | Brand serif font (Cormorant Garamond 300/500) |
| `@expo-google-fonts/inter` | ^0.4.2 | Body UI font (Inter 300/400/500) |
| `@expo-google-fonts/playfair-display` | ^0.4.2 | Section heading serif (Playfair Display 400) |
| `@react-native-async-storage/async-storage` | 2.1.2 | Zustand persistence |
| `@react-native-community/datetimepicker` | 8.4.1 | Date/time input on Analysis screen |
| `@react-native-picker/picker` | 2.11.1 | Tradition/language pickers on Analysis screen |
| `axios` | ^1.9.0 | HTTP client |
| `zustand` | ^4.5.4 | State management |
| `expo-apple-authentication` | ~7.2.4 | Apple Sign In (**installed + plugin declared, never called in any screen**) |
| `expo-build-properties` | ~0.14.8 | New Architecture flag, bitcode, etc. |
| `expo-constants` | ~17.1.8 | App config access |
| `expo-dev-client` | ~5.2.4 | Development build client |
| `expo-device` | ~7.1.4 | Device info |
| `expo-font` | ~13.3.2 | Custom font loading in App.tsx |
| `expo-linear-gradient` | ~14.1.5 | Gradient backgrounds on all screens |
| `expo-linking` | ~7.1.7 | Deep link handling + `Linking.openURL()` for payments |
| `expo-localization` | ~16.1.6 | Locale detection |
| `expo-notifications` | ~0.31.5 | Push notifications (configured, **no notification scheduling code found in src/**) |
| `expo-splash-screen` | ~0.30.10 | Splash screen control in App.tsx |
| `expo-status-bar` | ~2.2.3 | Status bar styling |
| `expo-store-review` | ~8.1.5 | App store review prompt (**installed, never called**) |
| `expo-system-ui` | ~5.0.11 | System UI background color |
| `expo-updates` | ~0.28.18 | OTA updates (**URL contains placeholder project ID**) |
| `expo-web-browser` | ~14.2.0 | In-app browser (installed but `Linking.openURL` used instead — opens system browser, not in-app) |
| `react-native-gesture-handler` | ~2.24.0 | Navigation gesture support |
| `react-native-reanimated` | ~3.17.4 | Animation library (installed, **not used in any current screen**) |
| `react-native-safe-area-context` | 5.4.0 | SafeAreaView wrapper |
| `react-native-screens` | ~4.11.1 | Native screen optimization |
| `react-native-svg` | 15.11.2 | SVG rendering (**installed, no SVG files in `src/assets/`**) |
| `react-native-webview` | 13.13.5 | WebView (**installed, not used in any screen**) |

### 1.3 Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ~5.8.3 | Type checking |
| `eslint` | ^9.25.0 | Linting |
| `eslint-config-universe` | ^13.0.0 | Expo linting ruleset |
| `@typescript-eslint/eslint-plugin` | ^8.30.0 | TS-specific lint rules |
| `@typescript-eslint/parser` | ^8.30.0 | TS parser for ESLint |
| `jest` | ^29.7.0 | Test runner |
| `jest-expo` | ~53.0.14 | Expo-aware Jest preset |
| `@babel/core` | ^7.27.0 | JS transpiler |
| `@types/react` | ~19.0.10 | React type definitions |

### 1.4 Web App Tech Stack (for comparison)

| Property | Value |
|---|---|
| Framework | Nuxt 3 / Vue 3 (SSR, Railway deployment) |
| Styling | Tailwind CSS + custom `editorial.css` design system |
| Fonts | **Fraunces** (display), **Cormorant Garamond** (serif), **Hanken Grotesk** (sans) |
| Colors | Bone `#F2EBDD` background, Ink `#1A1612` text, Gold `#C9A961` accent — **light theme** |
| State | Pinia |
| Payments | Stripe Checkout (server-side session) + webhook |
| Auth | Supabase magic link |
| Analytics | Meta Pixel + TikTok Pixel + PostHog (client), Conversions API (server) |
| Error tracking | Sentry (optional, env-gated) |

**Key conclusion:** The web app uses a **warm light editorial theme** (bone/ink/gold). The mobile app uses a **dark cosmic theme** (near-black `#050410` / purple / gold). These are **entirely different visual identities**. The redesign work (§11) must bridge this gap.

---

## STEP 2 — BUILD & RUN STATUS (Static Inspection Only)

### What looks good
- `node_modules/` directory present — dependencies installed.
- `ios/Podfile.lock` present (82 KB) — Pods last resolved; native iOS layer is present.
- `ios/OMENORA.xcworkspace/` directory present — workspace created.
- `index.js` correctly calls `registerRootComponent(App)`.
- TypeScript strict mode is on; no `any` suppressions in source files (only in server Stripe API version cast — unrelated to mobile).
- No `throw new Error('not implemented')` or `TODO`/`FIXME` markers found in source files under `src/`.

### Blockers and risks

**BLOCKER — `.env` contains a local LAN IP, not a production URL.**  
`/Volumes/ESSD/Projects/Augur-V1/mobile-app/.env` line 1:
```
EXPO_PUBLIC_API_BASE_URL=http://10.1.10.181:3000
```
`/Volumes/ESSD/Projects/Augur-V1/mobile-app/src/constants/config.ts` line 7-8 reads:
```ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.omenora.com';
```
The `??` fallback to `https://api.omenora.com` is only used when the variable is absent. Because it **is** present in `.env`, EAS Build will embed `http://10.1.10.181:3000` into the production binary. Every API call will fail for every user.

**BLOCKER — EAS Project ID is a placeholder.**  
`app.json` lines 101-104:
```json
"extra": { "eas": { "projectId": "[YOUR_EAS_PROJECT_ID]" } }
```
`app.json` lines 107-111:
```json
"updates": { "url": "https://u.expo.dev/[YOUR_EAS_PROJECT_ID]", ... }
```
Without a real EAS project ID, `eas build` will fail and OTA updates cannot be delivered.

**BLOCKER — App Store submission credentials are placeholders.**  
`eas.json` lines 44-47:
```json
"ascAppId": "[YOUR_APPLE_APP_ID]",
"ascApiKeyPath": "path-to-asc-api-key.p8",
"ascApiKeyIssuerId": "[YOUR_ISSUER_ID]",
"ascApiKeyId": "[YOUR_KEY_ID]"
```
Android service account key path is also a placeholder: `"path-to-service-account-key.json"` (line 40). Neither automated submission nor manual upload path is configured.

**BLOCKER — App Store URL contains placeholder Apple ID.**  
`app.json` line 37:
```json
"appStoreUrl": "https://apps.apple.com/app/omenora/id[YOUR_APPLE_ID]"
```

**WARNING — `ios/OMENORA/` and `ios/Pods/` directories are empty (0 items listed).**  
The workspace exists but the native Xcode project folder and Pods folder show 0 items. This likely means they are present on disk but gitignored. Cannot confirm native project files exist without running `pod install`. If a fresh CI machine tries to build from this repo without running `pod install` first, the build will fail.

**WARNING — `expo-apple-authentication` is installed (`package.json` line 30) and declared as an Expo plugin (`app.json` line 81) but is never imported or called anywhere in `src/`.**  
`src/constants/config.ts` line 18 declares `APPLE_SIGN_IN: true` but no screen or hook references it. The entitlement will be baked into the binary, prompting Apple review questions, but the feature doesn't exist. This is a review risk.

**WARNING — `FEATURES.GOOGLE_PAY: true` and `FEATURES.APPLE_PAY: true` in `src/constants/config.ts` lines 19-20.**  
Neither is wired to any UI or payment flow. These are dead constants, but they indicate incomplete planned features.

**WARNING — `SubscriptionScreen` navigation bug.**  
`src/screens/SubscriptionScreen.tsx` line 103:
```tsx
navigation.navigate('Report')
```
`RootNavigator.tsx` line 34 defines `Report` as requiring `{ reportId: string } | undefined`. Navigating without params will cause a TypeScript type error if strict navigation typing is enforced, and may produce a runtime crash if `ReportScreen` expects `reportId` from params. (TypeScript `skipLibCheck: true` in tsconfig may mask this.)

**WARNING — `README.md` line 14 states "Payments: Stripe React Native"** — this is inaccurate. The actual implementation uses browser-redirect Stripe Checkout. The README's technical spec is stale and will confuse any developer onboarding.

---

## STEP 3 — FEATURE PARITY VS WEB

Web features audited from `augur/server/api/` directory and `augur/app/` pages.

| Web Feature | Mobile Status | Evidence |
|---|---|---|
| Natal analysis (2-step quiz: birth info + 7 Qs) | **IMPLEMENTED** | `AnalysisScreen.tsx` — full 2-step flow, all 7 questions, date/time/city/tradition/language inputs |
| Natal preview + paywall (3 tiers) | **IMPLEMENTED** | `PreviewScreen.tsx` — tiers $1.99 / $4.99 / $12.99, email capture, Stripe Checkout redirect |
| 2026 Lucky Calendar | **PARTIAL** | `CalendarScreen.tsx` — UI scaffold with mock bar chart; calls `api.generateCalendar()` after purchase but the "purchased" path only shows static text and instructs user to check email. No in-app calendar rendering. |
| Compatibility reading | **PARTIAL** | `CompatibilityScreen.tsx` — UI scaffold with mock data only. No partner name/DOB input form. No call to `api.generateCompatibility()`. Purchased state shows email-delivery message. |
| Daily horoscope (sign + archetype) — public `/daily` page | **MISSING** | No `DailyScreen` or daily horoscope route exists in `RootNavigator.tsx` or `src/screens/`. |
| Daily horoscope subscription ($4.99/mo) | **MISSING** | `SubscriptionScreen.tsx` exists but is positioned as an upsell to the Oracle bundle ($12.99 one-time). The actual `/api/create-subscription` recurring-payment endpoint is defined in `endpoints.ts` line 139-142 but never called from any screen. |
| Compatibility quiz (web-specific 3-step UTM flow) | **MISSING** | No separate compatibility quiz flow. Web has a dedicated compatibility funnel; mobile treats it as a post-purchase add-on only. |
| Compatibility preview + paywall (web) | **MISSING** | See above — no entry-point compatibility funnel on mobile. |
| Magic-link auth (Supabase) | **MISSING** | No auth screen, no Supabase client, no session management. `expo-apple-authentication` installed but not wired. |
| Account / reading history | **MISSING** | No account screen, no `me/` endpoint calls (web has `server/api/me/` with 4 endpoints). |
| Privacy screen | **IMPLEMENTED** | `PrivacyScreen.tsx` — inline static content, accessible from `HomeScreen` footer. |
| Terms screen | **IMPLEMENTED** | `TermsScreen.tsx` — inline static content, accessible from `HomeScreen` footer. |

---

## STEP 4 — PAYMENTS (CRITICAL)

### Payment Architecture

The app uses **Stripe-hosted Checkout via browser redirect** (not native IAP). The flow:

1. `PreviewScreen.handlePayment()` (`PreviewScreen.tsx` lines 144-185) calls `api.createMobileCheckoutSession()`.
2. Server creates a Stripe Checkout Session with `success_url: 'omenora://payment/success?session_id=...'` (`server/api/mobile/create-checkout-session.post.ts` lines 74-75).
3. App opens the URL via `Linking.openURL(session.url)` (`PreviewScreen.tsx` line 179) — this opens Safari/Chrome.
4. On return, `App.tsx` lines 47-70 catch the `omenora://payment/success` deep link, call `/api/mobile/verify-checkout-session`, and update store state.

### Apple App Store Compliance — Guideline 3.1.1

**The core question: Is this a violation of App Store guideline 3.1.1 (mandatory IAP for digital goods)?**

The comment in `create-checkout-session.post.ts` lines 3-10 asserts: *"avoids Apple/Google IAP fees, and is fully compliant with App Store rules for US/EU storefronts (2025)."*

**This assertion is incorrect as stated and represents CRITICAL risk.**

- **Guideline 3.1.1** requires that apps use Apple IAP for digital content delivered within the app. Destiny reports, calendars, and compatibility readings are digital goods consumed within the app.
- The **"reader app" exemption (3.1.3(a))** allows apps whose primary function is to provide previously-purchased content access (e.g., Kindle, Netflix) to link out to a web purchase — but only under very specific conditions: the content must have been purchased outside the app before the user installs it, and there must be no "buy" button inside the app that triggers external purchase.
- **What this app does**: It presents a "buy" button inside the app (`PreviewScreen.tsx` lines 344-381), collects the user's email, and launches an external checkout. **This is the exact pattern Apple rejected apps for throughout 2021-2024.** The 2024 US court ruling (Epic v Apple) opened a narrow window for US App Store apps to link externally — but only with an Apple-approved entitlement, a specific disclosure string, and Apple's required fee structure. **This entitlement is not requested anywhere in `app.json` or `eas.json`.**
- For Google Play, billing guideline applies similarly — in-app purchases of digital content must use Google Play Billing.

**Verdict: HIGH probability of App Store rejection on first submission (guideline 3.1.1). The current flow is not compliant for a new app without the External Purchase Link entitlement.**

### IAP / RevenueCat / StoreKit Inventory

| SDK | Present? |
|---|---|
| `react-native-iap` | NO |
| `expo-in-app-purchases` | NO |
| RevenueCat | NO |
| Native StoreKit | NO |
| Google Play Billing | NO |
| Stripe React Native | NO |

No native billing SDK is integrated whatsoever.

### SKU Mapping

No StoreKit/Google Play SKUs exist. The product definitions live entirely server-side in `create-checkout-session.post.ts` lines 22-30:

| Mobile type | Amount | Web equivalent |
|---|---|---|
| `report` | $1.99 | (not on web — web Basic is $2.99) |
| `bundle` | $4.99 | $4.99 bundle |
| `oracle` | $12.99 | $12.99 Oracle |
| `calendar` | $2.99 | $2.99 calendar |
| `compatibility` | $2.99 | $2.99 compatibility |
| `addon` | $0.99 | $0.99 add-on |
| `birth_chart` | $2.99 | $2.99 birth chart |

**Price mismatch:** Web sells Basic report at $2.99; mobile `report` type is $1.99. No subscription SKUs exist on mobile ($9.99/mo Compatibility Plus, $4.99/mo Daily Horoscope — both missing).

### Server-Side Receipt Validation

Server-side Stripe session verification is correctly implemented: `verify-checkout-session.post.ts` line 29 calls `stripe.checkout.sessions.retrieve(sessionId)` server-side. Payment status is validated server-side before `paid` is returned. This is correct — the client URL alone is not trusted.

However, **the verification result is only stored in Zustand (in-memory + AsyncStorage)** — it is never written to Supabase. If the user reinstalls the app or clears storage, purchase access is lost. There is no `me/` account system or server-side entitlement record on mobile.

### "Reader App" / Web Fallback Assessment

The app does not qualify as a reader app under 3.1.3(a) because:
1. Content is generated fresh during the in-app session (not previously purchased outside the app).
2. The purchase CTA is inside the app with a specific price displayed.
3. No External Purchase Link entitlement is requested in `app.json`.

---

## STEP 5 — DEEP LINKING & ATTRIBUTION

### Universal Links / App Links

**iOS Universal Links:** `app.json` lines 38-40 declare:
```json
"associatedDomains": ["applinks:omenora.com"]
```
This will add the Associated Domains entitlement to the iOS binary. **However, the AASA file does not exist on the web server.** Searched entire `augur/public/` directory — no `.well-known/` folder, no `apple-app-site-association` file. Universal Links will silently fail at runtime; iOS will not hand off HTTP links to the app.

**Android App Links:** `app.json` lines 59-74 declare an `intentFilter` for `https://omenora.com/*`. **No `assetlinks.json` file found** in `augur/public/.well-known/`. Android App Links will also fail.

### AASA File — Web Project Verification

Searched `/Volumes/ESSD/Projects/Augur-V1/augur/public/` — no `.well-known/` directory, no `apple-app-site-association`, no `assetlinks.json`. Both Universal Links and Android App Links are non-functional.

### TikTok Deep Link Params (`?sign=`, `?archetype=`)

No URL parameter parsing for `?sign=` or `?archetype=` exists in any mobile screen or in `App.tsx`. The `handleDeepLink` function in `App.tsx` lines 47-70 only handles `omenora://payment/success`. There is no routing to a `/daily/[sign]` or `/daily/[archetype]` equivalent because no Daily screen exists.

### UTM Parameters

**Not captured at all on mobile.** No UTM reading logic exists in any mobile source file. On web, `augur/app/plugins/pixels.client.ts` lines 123-155 captures UTMs into `sessionStorage`. The mobile app has no equivalent. Attribution data from TikTok/Meta ads will be completely dark.

---

## STEP 6 — ANALYTICS / PIXELS

### Meta Pixel (ID: 1561728965952344)

**Status: NOT WIRED on mobile.**  
The Meta Pixel is implemented only on web via `augur/app/plugins/pixels.client.ts` (client-side browser script). No `react-native-fbsdk-next`, no Meta SDK, no Conversions API call exists in the mobile app. No analytics events fire from any mobile screen.

### TikTok Pixel (ID: D7FTU6BC77U7IUI4896G)

**Status: NOT WIRED on mobile.**  
Same as Meta — TikTok Pixel is web-only. No TikTok SDK in mobile.

### Conversions API / Server-Side Events

No mobile-specific Conversions API events are sent from the server-side endpoints. The web's `pixels.client.ts` client-side tracking does not fire when purchases originate from the mobile app's Stripe Checkout session (the Stripe-hosted page opens in an external browser, outside the app context).

### ATT (App Tracking Transparency) Prompt

**Status: MISSING.**  
`expo-tracking-transparency` is not in `package.json`. `NSUserTrackingUsageDescription` is not in `app.json`'s `infoPlist` block. Without ATT:
- On iOS 14.5+, the app cannot request tracking permission.
- If any analytics/ads SDK is added later, the first submission will require a re-review with the ATT prompt.
- Apple may ask about tracking even if no SDK is present, since `expo-apple-authentication` is declared.

`app.json` lines 22-32 contain `infoPlist` entries — `NSUserTrackingUsageDescription` is absent.

---

## STEP 7 — ASSETS & STORE LISTING READINESS

### App Icons

| Asset | File | Size (bytes) | Status |
|---|---|---|---|
| iOS icon | `assets/icon.png` | 5,337 | **SUSPECT** — 5 KB is extremely small for a 1024×1024 PNG; standard is 100–500 KB. Likely a placeholder or heavily compressed image that will fail App Store Connect validation. |
| Android adaptive foreground | `assets/adaptive-icon.png` | 5,337 | Same concern — same byte size as icon.png. |
| Android adaptive background | (defined as color `#050410` in `app.json` line 47) | N/A | Acceptable. |
| Notification icon | `assets/notification-icon.png` | 220 bytes | Confirmed placeholder — 220 bytes cannot encode a real icon. |
| Favicon | `assets/favicon.png` | 124 bytes | Placeholder — irrelevant for native store but indicates asset pipeline is incomplete. |

### Splash Screen

`assets/splash.png` — 16,229 bytes. This is plausible for a dark-background splash but on the low end. Acceptable if the image is intentionally minimal.

### Bundle ID / Application ID

- iOS: `com.omenora.app` (`app.json` line 20) — not a default placeholder. ✓
- Android: `com.omenora.app` (`app.json` line 43) — not a default placeholder. ✓

### Display Name, Version, Build Number

- Name: `"OMENORA"` (`app.json` line 3) ✓
- Version: `"1.0.0"` (`app.json` line 5) ✓
- iOS buildNumber: `"1.0.0"` (`app.json` line 21) — **should be an integer string (e.g., `"1"`) not a semver string for App Store Connect compatibility**
- Android versionCode: `1` (`app.json` line 44) ✓

### iOS Info.plist Privacy Strings (`app.json` lines 22-32)

| Key | Value | Assessment |
|---|---|---|
| `NSUserNotificationUsageDescription` | "OMENORA sends daily cosmic insights..." | ✓ Reasonable |
| `NSCameraUsageDescription` | "This app does not require camera access." | ⚠ Apple will reject this — if the app genuinely doesn't use camera, the key should be **omitted**, not set to a disclaimer string. Declaring it signals you request the permission. |
| `NSMicrophoneUsageDescription` | "This app does not require microphone access." | ⚠ Same issue — omit if not used. |
| `NSPhotoLibraryUsageDescription` | "This app does not require photo library access." | ⚠ Same issue — omit if not used. |
| `NSLocationWhenInUseUsageDescription` | Birth city astrological calc justification | ✓ Plausible justification |
| `NSLocationAlwaysUsageDescription` | Birth city astrological calc justification | ⚠ "Always" location is extremely hard to justify for an astrology app and will prompt Apple to require a detailed explanation. No screen in the app actually requests location at all — no `expo-location` in `package.json`. Remove unless location is actually used. |
| `NSUserTrackingUsageDescription` | **MISSING** | Required if any tracking SDK is added. |
| `ITSAppUsesNonExemptEncryption` | `false` | ✓ Correct — avoids French encryption export review. |

### Android Permissions (`app.json` lines 49-57)

| Permission | Justification | Assessment |
|---|---|---|
| `INTERNET` | API calls | ✓ Required |
| `ACCESS_NETWORK_STATE` | Connectivity check | ✓ Reasonable |
| `RECEIVE_BOOT_COMPLETED` | Push notifications scheduling | ⚠ Justify in Data Safety form |
| `SCHEDULE_EXACT_ALARM` | Daily notification timing | ⚠ Android 12+ requires user grant; creates a Play Store data safety disclosure requirement |
| `POST_NOTIFICATIONS` | Push notifications | ✓ Required |
| `ACCESS_COARSE_LOCATION` | Birth city | ⚠ No `expo-location` installed — this permission will be declared but never requested, which Play Store reviewers may question |
| `ACCESS_FINE_LOCATION` | Birth city | ⚠ Same — fine location is not used by any screen |

### Privacy / Terms URLs

- `PrivacyScreen.tsx` is accessible from `HomeScreen.tsx` footer (lines 120-122). ✓
- `TermsScreen.tsx` is accessible from `HomeScreen.tsx` footer (lines 123-126). ✓
- Both show inline static text. Privacy policy references `privacy@omenora.com` and states data deletion within 30 days. ✓
- **However, the privacy policy does not mention Zustand/AsyncStorage local data persistence, purchase state stored locally, or the fact that no account system exists (purchase history is device-local only).** This is a disclosure gap.

---

## STEP 8 — STORE SUBMISSION CHECKLIST

| Item | Status |
|---|---|
| **App Store Connect** | App record not confirmed (no App ID, just placeholder `[YOUR_APPLE_ID]` in `app.json` line 37) |
| **TestFlight build pushed** | No — EAS project ID is a placeholder; no build has been submitted |
| **Google Play Console record** | Not confirmed — `playStoreUrl` in `app.json` line 58 references `com.omenora.app` but Play Console record creation cannot be verified |
| **Google Play Internal track** | No |
| **Privacy nutrition labels (App Store)** | Not drafted — no evidence of Data Types disclosure for: Name, DOB, Email, Purchase history, Diagnostics |
| **Google Data Safety form** | Not drafted |
| **Age rating questionnaire** | Not completed — README mentions "17+" but astrology apps typically qualify for 4+ or 9+; the mental-health-adjacent Q4/Q7 questions could affect rating |
| **Screenshots** | No screenshots found — `assets/` contains only icon, splash, and favicon |
| **App description / keywords / "What's New"** | README has placeholder copy ("AI-powered astrology readings") — no finalized store description |
| **6.7" iPhone screenshots** | Missing |
| **6.5" iPhone screenshots** | Missing |
| **Phone + tablet Android screenshots** | Missing |
| **Feature graphic (Android 1024×500)** | Missing |

---

## STEP 9 — RISK ASSESSMENT

### RISK 1 — CRITICAL: In-App Stripe Checkout Without IAP Entitlement

**Severity:** CRITICAL — **will result in App Store rejection on first review.**

**What it is:** `PreviewScreen.tsx` lines 344-381 display a "buy" button with explicit prices ($1.99 / $4.99 / $12.99) that opens an external Stripe Checkout page via `Linking.openURL()`. This is digital content sold through an in-app purchase button redirecting to an external payment processor, which violates App Store guideline 3.1.1. The External Purchase Link entitlement (required post-Epic ruling for US store) is not configured in `app.json` or `eas.json`.

**File:** `PreviewScreen.tsx` lines 144-185; `create-checkout-session.post.ts` lines 59-101.

**What fixing it requires:**
- **Option A (fastest):** Integrate `react-native-iap` or `expo-in-app-purchases`, create Apple/Google SKUs matching the product catalog, implement server-side receipt validation writing entitlements to Supabase. Estimate: 5-8 days of engineering work.
- **Option B (compliant shortcut):** Apply for Apple's External Purchase Link entitlement (US only, requires Apple approval, 27% fee applies), add the mandatory disclosure string, and remove in-app price display. Not available for Google Play.
- **Option C:** Implement a "reader app" model where no purchase button exists inside the app — users must visit `omenora.com` on their own. Removes the funnel entirely.

---

### RISK 2 — CRITICAL: `.env` Hardcodes Local Development IP

**Severity:** CRITICAL — **will cause 100% API failure in production builds if not fixed before `eas build`.**

**What it is:** `.env` line 1 sets `EXPO_PUBLIC_API_BASE_URL=http://10.1.10.181:3000` — a LAN IP address. EAS Build will embed this value. Every API call (report generation, checkout session, verification) will time out for all users.

**File:** `/Volumes/ESSD/Projects/Augur-V1/mobile-app/.env` line 1.

**What fixing it requires:** Set `EXPO_PUBLIC_API_BASE_URL=https://api.omenora.com` in EAS Build environment variables (via EAS dashboard or `eas.json` `env` block). Do NOT commit the production URL in `.env` if the file is gitignored — use EAS secrets instead. Single-line fix but requires EAS account setup.

---

### RISK 3 — HIGH: No AASA File → Universal Links Non-Functional

**Severity:** HIGH — breaks payment return deep link on iOS in production.

**What it is:** `app.json` declares `associatedDomains: ["applinks:omenora.com"]` but no `apple-app-site-association` file exists anywhere in the web project (`augur/public/` has no `.well-known/` directory). On iOS, when Stripe redirects to `omenora://payment/success?session_id=...`, the deep link will only work via the custom URL scheme (`omenora://`), not Universal Links. The custom scheme fallback is present in `App.tsx` lines 72-78 and should work — but without AASA, Universal Links routing is dead, and any future `https://omenora.com/...` links shared to the app will not open it.

**File:** `app.json` lines 38-40; absence of `augur/public/.well-known/apple-app-site-association`.

**What fixing it requires:** Create `augur/public/.well-known/apple-app-site-association` JSON file with the correct bundle ID and paths, ensure the web server serves it with `Content-Type: application/json` at `https://omenora.com/.well-known/apple-app-site-association`. Also create `assetlinks.json` for Android.

---

### RISK 4 — HIGH: Zero Mobile Analytics / Attribution

**Severity:** HIGH — marketing spend is unattributable; ROAS measurement impossible.

**What it is:** No analytics SDK exists in the mobile app. Meta Pixel (1561728965952344) and TikTok Pixel (D7FTU6BC77U7IUI4896G) fire only in the web browser context. When a user comes from a TikTok ad, opens the app, and pays — the Purchase event never fires. No UTM parameters are captured. No PostHog events are sent. The entire mobile funnel is invisible to ad platforms.

**Files:** All `src/screens/*.tsx` — no analytics calls anywhere. `package.json` — no analytics SDK.

**What fixing it requires:** Add a mobile analytics layer. Minimum viable: PostHog React Native SDK (or a custom thin wrapper calling the web backend's analytics relay). For Meta/TikTok attribution: implement Conversions API calls server-side when `verify-checkout-session` returns `paid: true`, using the `email` from the session metadata. ATT prompt must be added first.

---

### RISK 5 — MEDIUM: Purchase State is Device-Local Only (No Entitlement Persistence)

**Severity:** MEDIUM — users will lose access to purchased content after reinstalling or switching devices.

**What it is:** `analysisStore.ts` lines 149-168 persist purchase flags (`paymentComplete`, `bundlePurchased`, `oraclePurchased`) to AsyncStorage only. When the verification in `App.tsx` lines 54-60 updates these flags, there is no write to Supabase or any server-side record. The web server endpoints `me/` (4 files in `server/api/me/`) are never called from mobile. If a user reinstalls the app, deletes it, or gets a new phone, they lose all purchased access with no recovery path.

**Files:** `src/stores/analysisStore.ts` lines 143-167; `App.tsx` lines 54-60.

**What fixing it requires:** After successful payment verification, call a server-side endpoint to associate the `email` + purchased `type` with a persistent record in Supabase. On app launch, check the server for existing entitlements by email. This also requires building an email-based account lookup flow.

---

## STEP 10 — TIME-TO-PRODUCTION ESTIMATE

### Best Case to TestFlight Build

**Estimate: 8–12 hours** — assuming:
- EAS account already exists and project ID just needs to be registered (30 min)
- `.env` is fixed and EAS Build secrets are configured (15 min)
- Apple Developer account exists with `com.omenora.app` bundle ID created (1 hr)
- App Store Connect record created (30 min)
- iOS distribution certificate and provisioning profile generated (1 hr via EAS Credentials)
- Icons replaced with real 1024×1024 assets (1-2 hrs design)
- Placeholder `infoPlist` strings cleaned up (30 min)
- `eas build --profile production --platform ios` run and uploaded (2-3 hrs build time on EAS)

**This assumes the IAP issue is deferred** (submitted as-is; Apple rejection is near-certain but the build itself can reach TestFlight for internal testing only — internal TestFlight does not go through App Review).

### Realistic Case (First Submission to Public TestFlight / App Review)

**Estimate: 3–5 days** to clear App Review, accounting for:
- 1 day: IAP compliance decision made and minimum viable payment path implemented (or External Purchase Link entitlement applied for — itself a 7-day Apple process)
- 1 day: Icons, screenshots (all required sizes), store description, age rating questionnaire, Data Safety/Privacy nutrition labels
- 1 day: EAS build, TestFlight upload, internal review pass
- 1-2 days: Apple review turnaround (can be 24-48 hrs for entertainment category apps)
- High probability of one rejection round for 3.1.1 (payment) or privacy strings — adds 2-5 days.

**Realistic total to passing App Review: 5–10 days.**

### What MUST ship for TestFlight v1.0

1. Fix `.env` / EAS Build environment variable (production API URL)
2. Register EAS project ID
3. Replace icon/splash assets with real production-quality images
4. Remove camera/microphone/photo library `infoPlist` entries (not used)
5. Remove location permission strings (no `expo-location` installed)
6. Fix iOS `buildNumber` to integer string
7. Replace all placeholder EAS credentials with real App Store Connect keys
8. Resolve payment compliance (IAP or entitlement) — **required for App Review pass**
9. Add ATT prompt if any tracking SDK is added

### What Can Wait for v1.1

- Full analytics integration (PostHog + Conversions API)
- AASA / `assetlinks.json` for Universal Links
- Account system / Supabase entitlement persistence
- Daily horoscope screen
- Partner-input form in CompatibilityScreen
- Apple Sign In wired to auth flow
- UTM parameter capture
- In-app calendar rendering (vs. email delivery)

---

## RECOMMENDED NEXT 8 HOURS

Ordered to maximize probability of a TestFlight internal build by morning (no App Review pass — that requires the payment compliance decision first).

1. **Create EAS project** via `eas.com` dashboard (or `eas init` if EAS CLI is installed). Copy the real project ID into `app.json` lines 103 and 108. Without this, nothing else works.

2. **Fix the production API URL.** In EAS dashboard, add a Build Secret: `EXPO_PUBLIC_API_BASE_URL=https://api.omenora.com`. In `.env`, change line 1 to `EXPO_PUBLIC_API_BASE_URL=https://api.omenora.com` for local dev (or remove it and rely on the default fallback in `config.ts`). **Do not commit the production URL in .env if the file is not gitignored.**

3. **Create App Store Connect record.** Log in to App Store Connect → My Apps → + New App. Bundle ID: `com.omenora.app`. SKU: `omenora-001`. Get the numeric Apple App ID and replace `[YOUR_APPLE_ID]` in `app.json` line 37 and `eas.json` line 44.

4. **Run `eas credentials` for iOS.** Let EAS generate the distribution certificate and provisioning profile automatically. This requires an active Apple Developer Program membership ($99/yr).

5. **Replace icon and splash assets.** `assets/icon.png` is 5 KB — export a real 1024×1024 PNG from your design tool at full quality. `assets/adaptive-icon.png` same (1024×1024). `assets/notification-icon.png` at 96×96 white-on-transparent PNG. `assets/splash.png` at 1242×2688 minimum.

6. **Clean up `app.json` `infoPlist`.** Remove `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`, and `NSLocationAlwaysUsageDescription` — none of these capabilities are used. Remove `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` from Android permissions unless location is genuinely implemented.

7. **Fix iOS `buildNumber`.** Change `app.json` line 21 from `"1.0.0"` to `"1"` to match App Store Connect integer requirement.

8. **Decide on payment strategy and document it.** This is the single most important decision before App Review. Convene a 30-minute call: choose IAP (react-native-iap, ~5 days work), External Purchase Link entitlement (7-day Apple approval process, US only, 27% fee), or web-only payment with no in-app buy button. Do not submit to App Review until this decision is implemented — rejection wastes a review slot and 1-3 days of turnaround time.

---

## STEP 11 — UI REDESIGN: MATCHING THE WEB DESIGN SYSTEM

This is a **new audit section** added in v2. The current mobile screens share the same color token names as the web but implement a completely different visual theme. This section defines exactly what must change to bring mobile into parity with the web editorial identity.

---

### 11.1 Design System Gap Analysis

#### Color System — Current Mobile vs Web

| Token | Web value | Mobile value | Gap |
|---|---|---|---|
| Background | `#F2EBDD` (bone/warm cream) | `#050410` (near-black) | **Completely opposite** |
| Primary text | `#1A1612` (dark ink) | `rgba(255,255,255,0.93)` (white) | **Inverted** |
| Secondary text | `rgba(26,22,18,0.45)` (ink-faint) | `rgba(255,255,255,0.48)` (white-faint) | **Inverted** |
| Gold accent | `#C9A961` (warm gold) | `rgba(201,168,76,0.62)` (same hue, different opacity) | Hue match, opacity differs |
| Borders/rules | `rgba(26,22,18,0.18)` (ink-ghost, light) | `rgba(255,255,255,0.08)` (white-ghost, dark) | **Inverted** |
| CTA button | `#1A1612` bg, `#F2EBDD` text (solid dark) | `rgba(140,110,255,0.88)` purple bg | **Completely different** — web uses ink, mobile uses purple |
| Outline button | transparent + `rgba(26,22,18,0.4)` border | transparent + `rgba(201,168,76,0.22)` gold border | Different border color |
| Card background | does not exist (web is flat) | `rgba(255,255,255,0.03)` | Mobile-specific pattern |

**Decision required before implementation:** Choose one of two paths:

- **Path A — Full Light Theme Match:** Port the web's `#F2EBDD` bone background, `#1A1612` ink text system to mobile. This is the highest-fidelity match but requires replacing every `colors.ts` token and re-testing all gradients.
- **Path B — Dark Theme Refinement:** Keep the dark background but adopt web typography, spacing rhythm, component language (buttons, rules, labels), and layout patterns. This preserves the "cosmic" mobile identity while unifying brand voice. **Recommended** — dark themes perform better in mobile contexts and Apple's Human Interface Guidelines favor it for immersive apps.

> The remainder of this section specifies **Path B** (dark theme with web component language), as the existing dark palette is defensible for a native app and the visual gap is primarily in typography, component shapes, and layout rhythm — not background hue.

---

#### Typography — Current Mobile vs Web

| Role | Web font | Web size | Mobile font | Mobile size | Gap |
|---|---|---|---|---|---|
| Display / hero title | **Fraunces** 300 italic | clamp(64–160px) | **CormorantGaramond_300Light** | 36–40px | **Wrong font family** — Fraunces is the web display face; mobile uses Cormorant everywhere including display |
| Serif body/section | Cormorant Garamond 400 | 18–28px | CormorantGaramond_300Light | 15–38px | Weight mismatch (web uses 400, mobile uses 300 everywhere) |
| Sans-serif UI | **Hanken Grotesk** 600 uppercase | 11px, 0.3em tracking | **Inter_300Light** | 9–11px, 1–3px tracking | **Wrong font family** — web uses Hanken Grotesk for all labels/buttons/annotations |
| Section heading | Fraunces 300 italic | clamp(36–72px) | PlayfairDisplay_400Regular | 18–22px | Wrong font for hero-level headings |
| Button label | Hanken Grotesk 600 uppercase 11px | — | Inter_300Light 12px 1.5–2px tracking | — | Wrong weight, wrong family |

**Font families needed but not yet installed:**
- `Fraunces` — the primary display face on web. Not in `package.json`. Must add `@expo-google-fonts/fraunces`.
- `Hanken Grotesk` — the label/sans face on web. Not in `package.json`. Must add `@expo-google-fonts/hanken-grotesk`.

---

#### Component Language — Current Mobile vs Web

| Component | Web pattern | Mobile current | Required change |
|---|---|---|---|
| **Primary CTA button** | `background: #1A1612` (ink), `color: #F2EBDD`, no border radius, 14px 28px padding, Hanken Grotesk 600 uppercase 11px + `→` arrow | Purple gradient `rgba(140,110,255)`, 16px border radius, Inter 300 | Replace with ink-colored rect button (or on dark bg: bone/off-white fill), square corners, Fraunces/Hanken label, `→` arrow |
| **Outline button** | transparent, `border: 1px solid rgba(26,22,18,0.4)`, same label style | transparent, `border: 1px solid rgba(201,168,76,0.22)` gold | Use white/bone border `rgba(255,255,255,0.35)` on dark bg |
| **Editorial rule** | `1px solid rgba(26,22,18,0.18)` horizontal line, full width | Not used as a structural element — screens use `borderBottomWidth` on individual items | Add explicit `<View style={styles.editorialRule} />` divider component mirroring web's `<div class="editorial-rule">` |
| **Label / eyebrow caps** | Hanken Grotesk 600, 11px, 0.3em letter-spacing, uppercase, `color: ink-faint` | Inter 300, 9–11px, 2–3px letter-spacing, uppercase, various gold/white colors | Unify to single `labelCaps` style: Hanken Grotesk (once installed) or Inter_500Medium as interim, 11px, `letterSpacing: 3`, uppercase, opacity 0.45 white |
| **Quiz option cards** | `border: 1px solid rgba(26,22,18,0.18)`, transparent bg, hover→ `rgba(26,22,18,0.06)`, Cormorant Garamond 18px option text, Hanken annotation letter prefix | `borderWidth: 1, borderColor: rgba(255,255,255,0.12)`, TouchableOpacity, Inter 300 body | Port the letter-prefix pattern (A / B / C / D annotation in gold dim), Cormorant 18px option text, clean border card |
| **Step headline** | Fraunces 300 italic, clamp(36–64px), `letter-spacing: -0.03em`, `color: var(--color-ink)` | Cormorant 300, 22–36px, no negative tracking | Use Fraunces (or Cormorant as fallback) at larger size, add `letterSpacing: -0.5` |
| **Step progress bar** | `1px solid rgba(26,22,18,0.12)` track, `background: #1A1612` fill, animated | `height: 4, borderRadius: 2` colored bar | Replace with `height: 1` hairline track, white fill, step-based width animation |
| **Editorial annotation** | Hanken Grotesk 11px, 0.2em tracking, uppercase, `color: ink-faint` | Various sizes, gold/white variants | Unify: single `annotation` style mirroring web |
| **Section divider / decorative rule** | `width: 48px; height: 1px; background: ink-mid; margin-bottom: 36px` short rule under headline | No short decorative rules exist | Add 48px short rule below every major section headline |
| **Paywall tier cards** | Flat bordered cards, no border-radius, Cormorant display price, Hanken label | Rounded cards, purple borders, gradient buttons | Square-corner cards, white/bone border, Cormorant italic price display, ink-style CTA |
| **Report section headers** | `label-caps` eyebrow + Cormorant 300 italic heading + editorial rule + body text | Symbol glyph + Inter 11px uppercase title + body | Add Cormorant italic heading above body text for each section |
| **Loading state** | `PhoenixLoader` SVG animation, Hanken Grotesk label-caps status, 200px 1px progress track | No loader animation — screens show direct content or fallback text | Implement animated archetype symbol loader (SVG or Reanimated spin) + hairline 1px progress track |

---

### 11.2 Per-Screen Redesign Specification

#### HomeScreen (`src/screens/HomeScreen.tsx`)

**Current:** Dark gradient background, centered OMENORA wordmark, feature list as vertical text rows, two CTA buttons with purple/gold styling.

**Required changes:**
1. Remove `LinearGradient` as primary background wrapper — replace with flat `backgroundColor: '#050410'` (keep dark, but flat).
2. **Wordmark:** Change from small caps `fontFamily: fonts.inter, letterSpacing: 3` to Cormorant Garamond italic for the brand name display, matching web's `<span class="hero__display-italic">Omen</span>ora` split treatment. The `Omen` part italic, `ora` non-italic.
3. **Issue/volume label:** Add a sub-header annotation `"№ 001 · Six Traditions"` in `labelCaps` style above the wordmark — mirrors web `hero__issue` element.
4. **Editorial rule:** Add a 48px short horizontal rule below the wordmark, `height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: 48, marginVertical: 20`.
5. **Feature list:** Replace current vertical list with a trust-strip pattern — 4 items in a grid: `[01] No subscription`, `[02] No account`, `[03] Results in 60s`, `[04] Full report optional` — annotation number + label text, separated by hairline rule above and below.
6. **Primary CTA button:** Replace purple gradient button with flat dark-on-light button: `backgroundColor: 'rgba(255,255,255,0.95)'`, `color: '#050410'`, no border-radius (or `borderRadius: 1`), Cormorant/Inter label, `→` arrow. On dark bg the web's solid ink button reads as a near-white button.
7. **Outline/secondary CTA:** `borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)'`, white text, same label style.
8. **Footer links (Privacy/Terms):** Change from `fontSize: 11` with gold color to annotation style: `fontFamily: fonts.inter, fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.25)'`.

---

#### AnalysisScreen (`src/screens/AnalysisScreen.tsx`)

**Current:** Two-phase (birth info + 7 questions) with a purple progress bar, Inter body inputs, and option buttons with circular selected state.

**Required changes:**
1. **Progress bar:** Change from `height: 4, borderRadius: 2, backgroundColor: purple` to `height: 1` hairline, `backgroundColor: 'rgba(255,255,255,0.9)'`, no border radius. Track: `backgroundColor: 'rgba(255,255,255,0.08)'`. Match web's `loading-progress` pattern.
2. **Step label:** Change from `fontSize: 9, letterSpacing: 2` in gold to `fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)'` — mirrors web `.analysis-step__label`.
3. **Step headline:** Increase from 28px to `fontSize: 36, fontFamily: fonts.cormorant, letterSpacing: -0.5, lineHeight: 42` — mirrors web `.analysis-step__headline` (clamp 36–64px). When Fraunces is added, switch to Fraunces italic.
4. **Short decorative rule:** Add `View { width: 48, height: 1, backgroundColor: 'rgba(255,255,255,0.35)', marginBottom: 32 }` below each headline.
5. **Text inputs:** Change from `backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1` to bottom-border-only input: `borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.25)', borderRadius: 0, backgroundColor: 'transparent', fontFamily: fonts.cormorant, fontSize: 24, paddingVertical: 14` — mirrors web `.editorial-input` exactly.
6. **Field label:** `fontFamily: fonts.inter, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12`.
7. **Field hint:** `fontFamily: fonts.inter, fontSize: 11, letterSpacing: 0.5, color: 'rgba(255,255,255,0.28)', marginTop: 10` — mirrors web `.field-hint annotation`.
8. **Quiz option cards:** Add letter prefix `A`, `B`, `C`, `D` in annotation style (gold dim, 10px, letterSpacing 1) to left of each option. Remove current circular selection indicator. Selected state: `borderColor: 'rgba(255,255,255,0.7)'`, slight `backgroundColor: 'rgba(255,255,255,0.05)'`. Option text: `fontFamily: fonts.cormorant, fontSize: 18, fontWeight: '400'`.
9. **Quiz question number:** Add `annotation` style number (`01`, `02`, etc.) above each question text — matches web `.quiz-question__num annotation`.
10. **"Next" / "Continue" button:** Apply new primary CTA button style (flat, near-white fill, ink text, `→` arrow, no border-radius).

---

#### PreviewScreen (`src/screens/PreviewScreen.tsx`)

**Current:** Report preview with purple gradient header, tier cards with rounded corners and purple borders, gold CTA.

**Required changes:**
1. **Loading state:** Add full-screen loading state with animated archetype symbol (use `react-native-reanimated` Animated.loop rotation on an SVG symbol or Unicode character). Add status label in `labelCaps` style. Add 200px hairline 1px progress bar animating over ~8 seconds. Mirrors web's `preview-loading` state with `PhoenixLoader`.
2. **Archetype hero section:** Port web's report header pattern — `label-caps` eyebrow (`"Natal Reading · ${firstName}"`), Fraunces/Cormorant italic archetype name at `fontSize: 48+`, editorial rule below, annotation meta row (element · life path), power trait pills.
3. **"14% revealed" meter:** Add a `View` with label `"YOUR READING IS 14% REVEALED"` in labelCaps, then a hairline track with 14% fill — matches web `.unlock-meter` pattern.
4. **Locked sections list:** Port web's `locked-sections__list` — annotation items with `◆` prefix listing what's locked. Replace current card-based tier selector stub with a flat annotated list.
5. **Tier cards:** Square corners (`borderRadius: 0` or `borderRadius: 2`). Border: `1px solid rgba(255,255,255,0.15)`. Selected: `borderColor: rgba(255,255,255,0.7)`. Remove purple gradient. Price: Cormorant italic large. Tier name: `labelCaps`. Add "Most Popular" badge as annotation row, not a bubble.
6. **Pay CTA button:** Apply new primary CTA style. Add `→` arrow. Label in labelCaps.
7. **Email input:** Bottom-border-only style, matching AnalysisScreen.

---

#### ReportScreen (`src/screens/ReportScreen.tsx`)

**Current:** Scrollable report with section icons (◉◆▲♥), Inter body text, border-left hero, trait pills.

**Required changes:**
1. **Masthead:** Port web's `report-masthead` pattern — `labelCaps` eyebrow (`"Complete Natal Forecast · ${firstName}"`), Fraunces/Cormorant archetype name at `fontSize: 48, letterSpacing: -0.5`, SVG archetype symbol image (requires adding SVG assets from web's `/public/symbols/` to mobile `src/assets/`), editorial rule, annotation meta strip (`DOB · City · Life Path N · Element`), power trait pills.
2. **Planet cells row:** Port web's planet cells — small zodiac symbol SVG + annotation sign label + annotation planet label. Requires archetype/zodiac SVG assets. If SVGs are not available immediately, use Unicode glyphs as placeholder (☉ ☽ ↑).
3. **Section headers:** Remove symbol glyph + Inter uppercase pattern. Replace with: annotation `tradition` label (e.g., "Western Tradition") + Cormorant italic section heading (18–22px) + editorial rule. Matches web `.report-section__header`.
4. **Section body text:** Increase from `fontSize: 15` to `fontSize: 16`, `lineHeight: 30`, `fontFamily: fonts.cormorant` (not Inter) — web uses Cormorant 400 for report body narrative.
5. **Affirmation box:** Change from purple-border card to borderless section with Cormorant italic 20px centered text, no background. Or: very subtle `rgba(255,255,255,0.03)` with `borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.15)'`.
6. **Share button:** Apply outline CTA style (white border, white text, `→` arrow, no border-radius).
7. **Upsell banners (Calendar/Compatibility):** Replace purple card with flat editorial inline upsell — annotation label + Cormorant italic heading + `labelCaps` price + outline CTA button. Mirrors web's `upsell-inline` pattern.

---

#### CalendarScreen (`src/screens/CalendarScreen.tsx`)

**Current:** Bar chart preview with lock/access badge, upgrade/purchased states.

**Required changes:**
1. **Header badge:** Replace `🔒 LOCKED` emoji badge with annotation text only: `"LOCKED"` in letterSpacing style, no emoji. `"✦ INCLUDED"` → replace with `"UNLOCKED"` annotation. Matches web's minimal label style.
2. **Eyebrow / heading:** Apply step-headline pattern: annotation eyebrow + Fraunces/Cormorant large italic heading + short decorative rule.
3. **Calendar bars:** Change bar `height` from 4px to 2px. Remove `borderRadius`. This matches web's hairline aesthetic.
4. **Upgrade box:** Replace current card with flat section: Cormorant italic headline, annotation body, editorial rule, feature list with `◆` annotation prefix (not `◉`), primary CTA button.
5. **"Also included in"** note: `fontFamily: fonts.inter, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)'`.

---

#### CompatibilityScreen (`src/screens/CompatibilityScreen.tsx`)

**Current:** Hardcoded 4 mock pairs bar chart preview, upgrade/purchased states.

**Required changes:**
1. Apply same heading/eyebrow redesign as CalendarScreen.
2. **Partner input form (MISSING):** Add a complete partner birth info form matching the web's compatibility quiz — partner name, DOB, optional city. This input must be captured before calling `api.generateCompatibility()`. Currently no form exists and the screen is a pure display stub.
3. **Match bars:** Change to 2px height, no border-radius, `backgroundColor: 'rgba(255,255,255,0.7)'`.
4. **Upgrade section:** Same flat editorial pattern as CalendarScreen.

---

#### PrivacyScreen & TermsScreen

**Current:** Inline static content in cards. Functionally correct but stylistically misaligned.

**Required changes:**
1. **Page heading pattern:** `annotation` eyebrow (`"LEGAL"`) + Cormorant 300 italic heading (`"Privacy Policy"`) + Cormorant italic date + full-width editorial rule. Matches current code closely — mainly needs font sizing increased and short decorative rule added.
2. **Section titles:** Already `textTransform: 'uppercase', letterSpacing: 1.5` — correct. Change font to `Inter_500Medium` (not 300) to match web's `.sectionTitle` weight.
3. **Body text:** Increase from current size to `fontSize: 15, lineHeight: 26, color: 'rgba(255,255,255,0.55)'`.

---

### 11.3 New Shared Components to Build

These components do not exist in mobile but are foundational to the web design language:

| Component | Description | Used in |
|---|---|---|
| `<EditorialRule />` | `View { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }` — full-width horizontal rule | All screens as section separator |
| `<ShortRule />` | `View { width: 48, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }` — 48px decorative underline for headlines | Below every major headline |
| `<LabelCaps />` | `Text { fontFamily: Inter_500Medium, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }` | Eyebrows, step labels, field labels, annotations |
| `<CTAButton />` | Solid (bone fill `rgba(255,255,255,0.95)` + dark text) and Outline (white border + white text) variants, no border-radius, `→` arrow support, `labelCaps` label | All screens |
| `<ArchetypeLoader />` | Animated archetype symbol (Reanimated opacity pulse or rotate), hairline 1px progress track | PreviewScreen loading state |
| `<AnnotationText />` | `Text { fontFamily: Inter_400Regular, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }` | Step numbers on quiz, meta lines, hints |
| `<EditorialInput />` | `TextInput { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.25)', borderRadius: 0, backgroundColor: 'transparent', fontFamily: cormorant, fontSize: 24, paddingVertical: 14 }` + label + hint | AnalysisScreen, PreviewScreen email |
| `<QuizOptionCard />` | Letter prefix (A/B/C/D) + Cormorant 18px option text + selection state (border opacity change) | AnalysisScreen questions |

---

### 11.4 Font Installation Required

Add two packages to `package.json` before redesign work begins:

```bash
npx expo install @expo-google-fonts/fraunces @expo-google-fonts/hanken-grotesk
```

Update `src/theme/fonts.ts` to add:
```ts
fraunces:        'Fraunces_300Light',
frauncesItalic:  'Fraunces_300Light_Italic',
hanken:          'HankenGrotesk_400Regular',
hankenMedium:    'HankenGrotesk_500Medium',
hankenSemiBold:  'HankenGrotesk_600SemiBold',
```

Update `App.tsx` font loading array to include all new font variants.

---

### 11.5 SVG Archetype Symbol Assets

The web app stores archetype SVG symbols in `augur/public/symbols/` (32 items visible from directory listing). These are used in the report masthead, preview header, home screen archetype grid, and compatibility screen. Mobile has `react-native-svg` installed but no SVG assets in `src/assets/`.

**Action required:** Copy the archetype SVG files from `augur/public/symbols/` to `mobile-app/src/assets/symbols/`. Use `react-native-svg` to render them via `<SvgUri>` or convert them to React Native `<Svg>` components. The `filter: brightness(0)` CSS used on web (dark mode `symbol-editorial`) translates to `fill="rgba(255,255,255,0.85)"` in React Native SVG.

---

### 11.6 Redesign Implementation Priority Order

| Priority | Screen / Component | Estimated effort |
|---|---|---|
| 1 | Build shared component library: `CTAButton`, `EditorialRule`, `ShortRule`, `LabelCaps`, `EditorialInput`, `QuizOptionCard` | 4 hrs |
| 2 | Update `src/theme/fonts.ts` + install Fraunces + Hanken Grotesk + update `App.tsx` font loading | 1 hr |
| 3 | Update `src/theme/colors.ts` — keep dark bg, refine text opacities to match web's layered system | 1 hr |
| 4 | **AnalysisScreen** — highest funnel impact; input styling and quiz options affect conversion | 4 hrs |
| 5 | **PreviewScreen** — paywall redesign; tier cards, email input, loading state | 5 hrs |
| 6 | **HomeScreen** — hero layout, trust strip, wordmark treatment | 3 hrs |
| 7 | **ReportScreen** — masthead, section headers, body typography | 4 hrs |
| 8 | Add archetype SVG assets + integrate into ReportScreen + PreviewScreen | 3 hrs |
| 9 | **CalendarScreen** + **CompatibilityScreen** + add partner input form to Compatibility | 4 hrs |
| 10 | **PrivacyScreen** + **TermsScreen** — minor typography polish | 1 hr |

**Total estimated redesign effort: ~30 hours of focused engineering work.**

---

## UPDATED RECOMMENDED NEXT 8 HOURS (v2)

Supersedes the previous "Recommended Next 8 Hours" section. Prioritized for both production-readiness AND beginning the redesign.

**Hour 1 — Blockers only**
- Register EAS project ID; replace placeholder in `app.json` lines 103 and 108
- Fix `.env` line 1 to production URL (or set EAS Build secret)
- Fix `app.json` iOS `buildNumber` from `"1.0.0"` → `"1"`

**Hour 2 — App Store compliance**
- Remove unused `infoPlist` entries: camera, microphone, photo library, always-location
- Remove unused Android permissions: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`
- Create App Store Connect record; replace `[YOUR_APPLE_ID]` placeholder

**Hour 3 — Payment strategy decision**
- Convene call: IAP vs External Purchase Link vs web-only
- Document chosen path in a `PAYMENT_STRATEGY.md` file in mobile-app root
- Do not begin implementation until chosen — but do not start TestFlight run without the decision documented

**Hours 4–5 — Design system foundation**
- `npm install @expo-google-fonts/fraunces @expo-google-fonts/hanken-grotesk`
- Update `src/theme/fonts.ts` with Fraunces + Hanken entries
- Update `App.tsx` font loading with new variants
- Create `src/components/ui/` directory and build: `CTAButton.tsx`, `EditorialRule.tsx`, `LabelCaps.tsx`, `EditorialInput.tsx`

**Hours 6–7 — AnalysisScreen redesign**
- Apply new `EditorialInput`, `LabelCaps`, `QuizOptionCard`, `ShortRule` components
- Update progress bar to hairline 1px
- Update step headline to Fraunces italic / Cormorant at larger size with negative letter-spacing

**Hour 8 — Assets + EAS credentials**
- Replace `assets/icon.png` with real 1024×1024 production PNG
- Replace `assets/adaptive-icon.png` (same)
- Replace `assets/notification-icon.png` with 96×96 white-on-transparent
- Run `eas credentials` to generate iOS provisioning profile

---

*End of audit v2. All findings based on static code inspection of `/Volumes/ESSD/Projects/Augur-V1/mobile-app` and `/Volumes/ESSD/Projects/Augur-V1/augur` source trees. No commands were executed.*
