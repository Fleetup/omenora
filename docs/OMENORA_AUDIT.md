# OMENORA_AUDIT.md
> Master reference for the full redesign sprint. Generated: 2026-04-27.

---

## 1. TECH STACK

- **Framework:** Nuxt 4 (package: `nuxt ^4.4.2`) / Vue 3 (`vue ^3.5.32`) / Vite (bundled with Nuxt)
- **Router setup:** File-based routing via `app/pages/` directory (Nuxt automatic page discovery). Additionally, four stub pages exist at the root `pages/` level (`analysis.vue`, `index.vue`, `preview.vue`, `report.vue`) — these are effectively empty redirectors (each is a single-line `<NuxtPage />` or similar stub), superseded by the `app/pages/` tree.
- **Tailwind version:** `@nuxtjs/tailwindcss ^6.14.0`. **No `tailwind.config.*` file exists** in the project root or `augur/` — Tailwind runs entirely on auto-detected defaults. No typography plugin, forms plugin, or other Tailwind plugins are installed.
- **UI component libraries:** None. No shadcn, Headless UI, Vuetify, Naive UI, or any other component library is installed. All UI is hand-rolled with scoped CSS.
- **Key dependencies from package.json relevant to UI:**
  - `@anthropic-ai/sdk ^0.86.1` — AI report generation (Anthropic Claude)
  - `@nuxtjs/sentry ^8.0.0` / `@sentry/vue ^8.0.0` / `@sentry/node ^8.0.0` — error tracking
  - `@nuxtjs/tailwindcss ^6.14.0` — Tailwind CSS integration
  - `@pinia/nuxt ^0.11.3` / `pinia ^3.0.4` — state management
  - `@supabase/supabase-js ^2.102.1` — auth + database client
  - `canvas ^3.2.3` — server-side canvas for card/PDF image generation
  - `html2canvas ^1.4.1` — client-side screenshot for share card
  - `jspdf ^4.2.1` — client-side PDF generation
  - `pdfkit ^0.18.0` — server-side PDF generation
  - `posthog-js ^1.369.3` — product analytics
  - `resend ^6.10.0` — transactional email
  - `stripe ^22.0.1` — payments
  - `sweph ^2.10.3-5` — Swiss Ephemeris (native Node addon, natal chart calculations)
  - `vue-router ^5.0.4` — router
  - `zod ^3.23.0` — runtime schema validation

---

## 2. PROJECT STRUCTURE

```
Augur-V1/
├── augur/                          ← main Nuxt 4 web app
│   ├── app/
│   │   ├── app.vue                 ← root Vue component (NuxtPage + global styles + region detection)
│   │   ├── assets/
│   │   │   ├── Logo-V1-Balck.svg
│   │   │   ├── Logo-V1-Black.ico
│   │   │   ├── Logo-V1-Black.png
│   │   │   ├── Logo-V1-White.png
│   │   │   └── fonts/              ← (empty — fonts served from /public/fonts/)
│   │   ├── components/
│   │   │   ├── ArchetypeSymbol.vue
│   │   │   ├── BackButton.vue
│   │   │   └── OrbitalMark.vue
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   └── useLanguage.ts
│   │   ├── error.vue               ← Nuxt error boundary page
│   │   ├── pages/
│   │   │   ├── account.vue
│   │   │   ├── analysis.vue
│   │   │   ├── calendar.vue
│   │   │   ├── compatibility-quiz.vue
│   │   │   ├── compatibility.vue
│   │   │   ├── daily.vue
│   │   │   ├── index.vue
│   │   │   ├── preview.vue
│   │   │   ├── privacy.vue
│   │   │   ├── report.vue
│   │   │   ├── subscribe.vue
│   │   │   ├── subscription.vue
│   │   │   └── terms.vue
│   │   ├── plugins/
│   │   │   ├── pixels.client.ts    ← TikTok pixel, Meta pixel, PostHog init
│   │   │   └── store-persist.client.ts ← localStorage persistence for analysisStore
│   │   ├── stores/
│   │   │   └── analysisStore.ts    ← primary Pinia store
│   │   └── utils/
│   │       ├── bazi.ts             ← BaZi (Chinese astrology) lookup tables
│   │       ├── lifePathNumber.ts   ← numerology calculation
│   │       ├── natalChart.ts       ← Swiss Ephemeris wrapper (sweph), archetype assignment
│   │       ├── quick-signs-client.ts ← client-side zodiac sign utils (mirror of server version)
│   │       ├── supabase.ts         ← Supabase anon client factory
│   │       ├── translations.ts     ← UI_STRINGS i18n map (all languages)
│   │       └── vedic.ts            ← Vedic astrology (Nakshatra) lookup tables
│   ├── components/                 ← legacy stub components (superseded by app/components/)
│   │   ├── AppHeader.vue           ← stub: renders <div>AppHeader</div>
│   │   └── DestinyCard.vue         ← stub: renders <div>DestinyCard</div>
│   ├── pages/                      ← legacy stub pages (superseded by app/pages/)
│   │   ├── analysis.vue
│   │   ├── index.vue
│   │   ├── preview.vue
│   │   └── report.vue
│   ├── public/
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── og-image.png
│   │   ├── site.webmanifest
│   │   ├── fonts/
│   │   │   ├── Inter-Italic.ttf / .woff2
│   │   │   ├── Inter-Light.ttf / .woff2
│   │   │   ├── Inter-Medium.ttf / .woff2
│   │   │   └── Inter-Regular.ttf / .woff2
│   │   └── symbols/                ← archetype SVG + PNG icons (see §5)
│   ├── server/
│   │   ├── api/                    ← 60+ Nitro API route handlers (see §7)
│   │   │   ├── auth/
│   │   │   ├── cron/
│   │   │   ├── email-sequence/
│   │   │   ├── me/
│   │   │   └── mobile/
│   │   ├── error-handler.ts
│   │   ├── middleware/
│   │   │   ├── 01.security.ts
│   │   │   └── 02.rate-limit.ts
│   │   ├── migrations/             ← 10 SQL migration files (Supabase)
│   │   ├── routes/
│   │   │   ├── robots.txt.ts
│   │   │   └── sitemap.xml.ts
│   │   └── utils/
│   │       ├── ai-retry.ts
│   │       ├── ai-schemas.ts       ← Zod schemas for all AI-generated report structures
│   │       ├── auth.ts             ← Supabase admin client + requireAuth()
│   │       ├── email-jobs.ts
│   │       ├── email-templates.ts
│   │       ├── geocode.ts          ← city → lat/lng lookup
│   │       ├── legal-copy.ts
│   │       ├── planetaryTransits.ts
│   │       ├── quick-signs.ts      ← server-side zodiac sign utils
│   │       ├── report-email-builder.ts
│   │       └── validate.ts
│   ├── stores/
│   │   └── analysisStore.ts        ← empty file (0 bytes); real store is in app/stores/
│   ├── tests/
│   ├── types/
│   ├── utils/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nuxt.config.ts
│   ├── package.json
│   ├── playwright.config.ts
│   ├── railway.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── mobile-app/                     ← separate React Native / Expo app
├── scripts/
├── docs/
├── QUERIES/
└── [various .md doc files]
```

---

## 3. PAGE INVENTORY

### `/` — `app/pages/index.vue`
- **Description:** Landing page / marketing homepage. Full-length scroll page with animated starfield canvas background, sticky header with hamburger mobile nav, hero section with OrbitalMark animation, social proof, feature breakdown (6 traditions), FAQ, and CTA sections. Includes a live reading-count ticker fetched from `/api/get-reading-count`. Contains all header/nav markup inline (no shared header component used).
- **URL params/query:** None.

### `/analysis` — `app/pages/analysis.vue`
- **Description:** Multi-step quiz funnel (8 screens: step 0–7). Step 0: "clarity focus" pre-qualification (what they want clarity on). Step 1: first name. Step 2: date of birth (custom scroll-wheel drum picker for day/month/year). Step 3: city of birth (text input with geocoding). Step 4: time of birth (optional, scroll-wheel picker). Steps 5–7: three behavioral multiple-choice questions (`p1`, `p2`, `p3`). On completion, calls `/api/calculate-chart` then navigates to `/preview`.
- **URL params/query:** None (state flows through Pinia `analysisStore`).

### `/preview` — `app/pages/preview.vue`
- **Description:** AI report loading screen → free preview paywall. Shows `OrbitalMark` loading animation with staged messages while calling `/api/generate-report`. Once loaded, shows archetype reveal (name, symbol, element, life path number, trait pills), one free section (`identity`), a blurred content hook, an "unlock progress" meter at 14%, and the paywall pricing section with Stripe payment form. Handles promo code entry and discount application.
- **URL params/query:** None (relies on `analysisStore`).

### `/report` — `app/pages/report.vue`
- **Description:** Full paid destiny report page. States: loading (with impulse upsell for compatibility add-on during load), error, no-report fallback, and full report. Full report renders all AI-generated sections, archetype symbol, tradition selector (switch between Western/Vedic/BaZi/Tarot/Korean/Middle Eastern), daily oracle, share card generation (`html2canvas`), PDF download (`jspdf`), and multiple upsell panels (compatibility, calendar, daily subscription). Also shows a payment confirmation banner.
- **URL params/query:** `?session_id=` (Stripe Checkout session ID for payment verification + user provisioning); `?tempId=` (temp report lookup for session recovery).

### `/account` — `app/pages/account.vue`
- **Description:** User account dashboard. States: loading, magic-link pending (requires explicit user click to confirm token — anti-prefetch-scanner design), unauthenticated (magic link sign-in form), authenticated (shows list of past reports, subscription status, compatibility readings, account settings). Reads `?token_hash=` from URL for magic link confirmation flow.
- **URL params/query:** `?token_hash=` (Supabase OTP token from magic link email).

### `/daily` — `app/pages/daily.vue`
- **Description:** Daily horoscope page with public marketing wrapper. Shows the current daily horoscope sign selector (all 12 zodiac signs), previews a generic daily horoscope for the selected sign, and upsells personalized daily horoscope subscription. Shares the same site header/nav markup as `index.vue` (duplicated inline).
- **URL params/query:** None.

### `/compatibility-quiz` — `app/pages/compatibility-quiz.vue`
- **Description:** 3-step compatibility quiz funnel. Step 1: user's own DOB and city. Step 2: partner's name, DOB, and city. Step 3: select reading type (free preview or paid). Step 4 (loading state): calls `/api/generate-compatibility`, then navigates to `/compatibility`. Progress bar shows `n of 3`.
- **URL params/query:** None (state stored in `analysisStore`).

### `/compatibility` — `app/pages/compatibility.vue`
- **Description:** Compatibility reading result page. Two modes: `isPreviewMode` (free, blurred sections) and full post-payment report. Full report shows compatibility score (with color coding), title, and 5 named sections (attraction, communication, challenges, longterm, advice). Preview mode shows score + first section + paywall for the rest. PDF download available for paid users.
- **URL params/query:** `?session_id=` (Stripe session, post-payment); `?preview=true` (free preview mode from quiz flow).

### `/calendar` — `app/pages/calendar.vue`
- **Description:** "Lucky Timing Calendar" page showing a month-by-month destiny calendar for the year. States: loading, error, no-calendar (purchase prompt), full calendar. Calendar shows overall theme, peak months, caution months, and per-month guidance cards. PDF download available.
- **URL params/query:** `?session_id=` (post-payment calendar unlock).

### `/subscribe` — `app/pages/subscribe.vue`
- **Description:** Subscription signup page for "Personal Daily Horoscope" at $4.99/month. Collects first name, email, DOB, and city, then initiates a Stripe subscription via `/api/create-subscription`. Links to `/compatibility` for the "Compatibility Plus" upsell.
- **URL params/query:** None.

### `/subscription` — `app/pages/subscription.vue`
- **Description:** Post-subscription confirmation page. Shows success state (subscription activated), error state, or loading state. Confirms the email address the horoscope will be delivered to.
- **URL params/query:** `?session_id=` (Stripe subscription checkout session for verification).

### `/privacy` — `app/pages/privacy.vue`
- **Description:** Full Privacy Policy legal page. 14 numbered sections covering GDPR, CCPA/CPRA, data collection, sub-processors, international transfers, retention, security, user rights. Last updated April 20, 2026.
- **URL params/query:** None.

### `/terms` — `app/pages/terms.vue`
- **Description:** Full Terms of Service legal page. Includes binding arbitration clause and class action waiver notice (Section 14). Last updated April 20, 2026.
- **URL params/query:** None.

---

## 4. COMPONENT INVENTORY

### `app/components/ArchetypeSymbol.vue`
- **Props:**
  - `symbol: string` (required) — Unicode symbol character (e.g. `'●'`, `'◆'`, `'▲'`) mapped to archetype ID
  - `size?: number` (default: `40`) — rendered width/height in pixels
- **Renders:** An `<img>` tag pointing to `/symbols/<archetypeId>.svg`. Maps 12 Unicode symbols to archetype IDs via `SYMBOL_TO_ID` lookup: `●`→phoenix, `◆`→architect, `▲`→storm, `◇`→lighthouse, `○`→wanderer, `⬡`→alchemist, `□`→guardian, `⬟`→visionary, `◉`→mirror, `✦`→catalyst, `▽`→sage, `★`→wildfire.

### `app/components/BackButton.vue`
- **Props:**
  - `to?: string` (default: `'/'`) — target route for `navigateTo()`
  - `label?: string` (default: `'Go back'`) — `aria-label`
  - `text?: string` (default: `''`) — optional visible text label beside the arrow
- **Renders:** A pill-shaped back button with a left chevron SVG icon, optional text, dark glass background (`rgba(255,255,255,0.04)`), hover state. Uses `navigateTo(props.to)` or `window.history.back()`.

### `app/components/OrbitalMark.vue`
- **Props:**
  - `size?: number` (default: `160`) — visible canvas size in CSS pixels
  - `pad?: number` (default: `26`) — extra canvas padding for glow/particle overflow
  - `accent?: string` (default: `'#d4a73a'`) — hex accent color for all orbital elements
  - `starfield?: boolean` (default: `true`) — toggles background starfield rendering
- **Renders:** An animated `<canvas>` showing a planetary orbital system: central dark sphere with lit crescent, two orbiting bodies with comet trails and particle effects, Kepler's-second-law speed variation, perigee flare, atmospheric rim lighting. Pauses on `prefers-reduced-motion`, page visibility change, and IntersectionObserver off-screen detection. DPR-aware (`devicePixelRatio`).

### `components/AppHeader.vue` _(legacy stub)_
- **Props:** None
- **Renders:** `<div>AppHeader</div>` — empty stub, not used by any active page.

### `components/DestinyCard.vue` _(legacy stub)_
- **Props:** None
- **Renders:** `<div>DestinyCard</div>` — empty stub, not used by any active page.

---

## 5. ASSET INVENTORY

### `/public/symbols/` — Archetype Symbol Icons

**SVG files:**
- `alchemist.svg` → Alchemist archetype glyph
- `architect.svg` → Architect archetype glyph
- `catalyst.svg` → Catalyst archetype glyph
- `guardian.svg` → Guardian archetype glyph
- `lighthouse.svg` → Lighthouse archetype glyph
- `mirror.svg` → Mirror archetype glyph
- `phoenix.svg` → Phoenix archetype glyph
- `sage.svg` → Sage archetype glyph
- `storm.svg` → Storm archetype glyph
- `visionary.svg` → Visionary archetype glyph
- `wanderer.svg` → Wanderer archetype glyph
- `wildfire.svg` → Wildfire archetype glyph
- `Destiny Archetype.svg` → "Destiny Archetype" report section label icon
- `Destiny Forecast copy.svg` → "Destiny Forecast" report section label icon (copy variant)
- `Life Path Number copy.svg` → "Life Path Number" report section label icon (copy variant)
- `Love & Relationship Patterns copy.svg` → "Love & Relationship Patterns" section label icon (copy variant)

**PNG files:**
- `alchemist@2x.png` → Alchemist archetype symbol, 2× retina
- `architect@2x.png` → Architect archetype symbol, 2× retina
- `catalyst@2x.png` → Catalyst archetype symbol, 2× retina
- `guardian@2x.png` → Guardian archetype symbol, 2× retina
- `lighthouse@2x.png` → Lighthouse archetype symbol, 2× retina
- `mirror@2x.png` → Mirror archetype symbol, 2× retina
- `phoenix@2x.png` → Phoenix archetype symbol, 2× retina
- `sage@2x.png` → Sage archetype symbol, 2× retina
- `storm@2x.png` → Storm archetype symbol, 2× retina
- `visionary@2x.png` → Visionary archetype symbol, 2× retina
- `wanderer@2x.png` → Wanderer archetype symbol, 2× retina
- `wildfire@2x.png` → Wildfire archetype symbol, 2× retina
- `Destiny Archetype.png` → "Destiny Archetype" section icon, full color
- `Destiny Forecast.png` → "Destiny Forecast" section icon, full color
- `Life Path Number.png` → "Life Path Number" section icon, full color
- `Love & Relationship Patterns.png` → "Love & Relationship Patterns" section icon, full color

### `/public/` — Root Public Assets

**PNG files:**
- `android-chrome-192x192.png` → App icon, 192×192, Android Chrome
- `android-chrome-512x512.png` → App icon, 512×512, Android Chrome
- `apple-touch-icon.png` → App icon, 180×180, iOS Safari
- `og-image.png` → Open Graph / social share image, 1200×630

**Other:**
- `favicon.ico` → Browser tab favicon
- `site.webmanifest` → PWA manifest (app name, icons, theme color `#07070D`)

### `/public/fonts/` — Self-hosted Fonts

| File | Weight | Style |
|---|---|---|
| `Inter-Regular.ttf` / `Inter-Regular.woff2` | 400 | normal |
| `Inter-Medium.ttf` / `Inter-Medium.woff2` | 500 | normal |
| `Inter-Light.ttf` / `Inter-Light.woff2` | 300 | normal |
| `Inter-Italic.ttf` / `Inter-Italic.woff2` | 400 | italic |

### `/app/assets/` — Build-time Assets

**SVG files:**
- `Logo-V1-Balck.svg` → OMENORA wordmark logo, black variant (note: filename typo "Balck")

**PNG files:**
- `Logo-V1-Black.png` → OMENORA logo, black variant (~508 KB)
- `Logo-V1-White.png` → OMENORA logo, white variant (~520 KB)

**Other:**
- `Logo-V1-Black.ico` → OMENORA logo as .ico

---

## 6. CURRENT DESIGN SYSTEM

### CSS Variables / Token Files
**None exist.** There are no CSS custom property files, no design token JSON files, and no centralized token system. All color values, spacing values, and typographic values are written as hardcoded literals directly inside `<style>` blocks of each `.vue` file.

### Tailwind Config Customizations
**No `tailwind.config.*` file exists.** Tailwind runs on pure defaults via `@nuxtjs/tailwindcss`. No custom colors, fonts, spacing, screens, or plugins are configured. Tailwind utility classes are used sparingly in the codebase — the primary styling approach is scoped `<style>` blocks with hand-rolled CSS class names.

### Global Stylesheets

**`app/app.vue` `<style>` (global, unscoped)** — The primary global stylesheet. Defines:
- `@font-face` declarations for all 4 Inter weights/styles, pointing to `/fonts/*.woff2`
- Universal `box-sizing: border-box` reset
- `html, body` base: `margin: 0`, `padding: 0`, background `#050410`, font-family `'Inter', system-ui, -apple-system, sans-serif`, `min-height: 100vh`
- `body::before` — fixed full-screen noise texture overlay at 4% opacity (inline SVG data URI using `feTurbulence` fractalNoise filter)
- `.omenora-heading` utility class — `font-family: 'Playfair Display', serif`, weight 400, `letter-spacing: -0.02em`, `line-height: 1.15`
- `.omenora-display` utility class — `font-family: 'Cormorant Garamond', serif`, weight 300, `letter-spacing: -0.01em`, `line-height: 1.05`

**Google Fonts (loaded via `<link>` in `nuxt.config.ts`):**
- `Cormorant Garamond`: weights 300, 400, 500; italic 300, 400
- `Playfair Display`: weights 400, 500; italic 400

**Color palette (inferred from usage across pages — no central definition):**
- Page background: `#050410` / `#07070D`
- Deep navy background variant: `#050410` / `#030210`
- Accent gold: `#d4a73a` (OrbitalMark default), various gold/amber tones
- Accent purple: `rgba(140, 110, 255, *)` — used for CTA buttons, highlights
- Text primary: `rgba(255, 255, 255, 0.9)` or `#f0eee8`
- Text secondary: `rgba(255, 255, 255, 0.55)` — `rgba(255, 255, 255, 0.4)`
- Text tertiary: `rgba(255, 255, 255, 0.25)`
- Border/divider: `rgba(255, 255, 255, 0.08)` — `rgba(255, 255, 255, 0.12)`

**All other styles** are scoped per-component/per-page `<style scoped>` blocks with no shared stylesheet.

---

## 7. DATA & API LAYER

### How planetary/horoscope data is fetched

**Client → Server flow:**
1. `app/pages/analysis.vue` collects birth data from the user and POSTs to `/api/calculate-chart`.
2. `/api/calculate-chart` calls `geocodeCity()` (server/utils/geocode.ts → external geocoding API), then calls `calculateNatalChart()` and `assignArchetypeFromChart()` from `app/utils/natalChart.ts`, plus `calculateLifePathNumber()` from `app/utils/lifePathNumber.ts`. Returns chart, archetype, life path number.
3. `app/pages/preview.vue` POSTs to `/api/generate-report` with the chart + user data. The response is the full AI-generated report JSON.
4. Report generation (`server/api/generate-report.post.ts`) uses Anthropic Claude via `@anthropic-ai/sdk`, calls `withAiRetry()` wrapper, validates output against `ReportSchema` (Zod schema in `server/utils/ai-schemas.ts`). The prompt includes inline Nakshatra data, BaZi stems/branches, and Western chart positions all computed server-side.
5. Additional tradition sections (Vedic, BaZi, Tarot) are generated by separate API endpoints: `/api/generate-vedic-section`, `/api/generate-bazi-section`, `/api/generate-tarot-section`.
6. Daily horoscope: `/api/generate-daily-horoscope` and `/api/generate-daily-insight` for personalized daily content; `/api/get-daily-cache` for cached horoscopes.
7. Compatibility: `/api/generate-compatibility` calls Anthropic to produce a scored, sectioned compatibility reading.

**Client-side utilities:**
- `app/utils/natalChart.ts` — directly imports and calls `sweph` (Swiss Ephemeris): `julday`, `calc_ut`, `houses_ex2`, `close`, `constants`. Calculates Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto positions + Ascendant. Also contains `assignArchetypeFromChart()` which maps planetary configurations to one of 12 archetypes.
- `app/utils/quick-signs-client.ts` — pure client-side zodiac sign calculation (duplicate of server version, no sweph dependency).
- `app/utils/bazi.ts` — static lookup tables for BaZi Heavenly Stems and Earthly Branches.
- `app/utils/vedic.ts` — static lookup tables for 27 Nakshatras.
- `app/utils/lifePathNumber.ts` — pure numerology calculation.
- `app/utils/translations.ts` — `UI_STRINGS` map for all UI i18n strings.

### Existing Store (Pinia)

**`app/stores/analysisStore.ts`** — Single primary Pinia store (`defineStore('analysis')`). Persisted to localStorage via `plugins/store-persist.client.ts` (key: `omenora_store_v2`, cache version: `v3-archetype-fix`).

State fields:
- `firstName`, `dateOfBirth`, `city`, `timeOfBirth` — birth info
- `answers: { p1, p2, p3 }` — 3 behavioral quiz answers
- `natalChart: NatalChart | null` — computed chart positions
- `archetype: string`, `lifePathNumber: number` — assigned archetype + numerology
- `reportContent: string`, `report: any` — raw report data
- `paymentComplete: boolean`, `email: string`, `tempId: string`, `reportSessionId: string`
- `partnerName`, `partnerDob`, `partnerCity` — compatibility partner data
- `calendarData: any`, `calendarPurchased: boolean`
- `region: string`, `country: string`, `regionManualOverride: boolean`
- `vedicData`, `baziData`, `tarotData` — tradition-specific data blobs
- `subscriptionActive`, `bundlePurchased`, `oraclePurchased`, `addonPurchased`, `birthChartPurchased` — purchase state flags
- `birthChartData: any`, `compatibilityData: any`
- `language: string`, `languageManualOverride: boolean`
- `clarityFocus: string` — pre-qualification answer from step 0

### Swiss Ephemeris Integration

- **Package:** `sweph ^2.10.3-5` (native Node.js addon, built with `node-gyp`)
- **Location:** `app/utils/natalChart.ts` — imports `{ julday, calc_ut, houses_ex2, close, constants }` from `sweph` directly. Used to calculate Julian Day Number and planetary positions.
- **Nitro config:** `sweph` and `node-gyp-build` are marked as `externals.external` in `nuxt.config.ts` so Nitro does not bundle them — they are resolved from `node_modules` at runtime via native `require()`.
- **Server-side usage:** `server/api/calculate-chart.post.ts` imports `calculateNatalChart` and `assignArchetypeFromChart` from `app/utils/natalChart.ts`. Also used indirectly in several `generate-*.post.ts` handlers that call the chart calculation pipeline.

### Environment Variables Referenced in Code

All variables follow Nuxt 3 NUXT_ prefix convention. From `.env.example` and `nuxt.config.ts`:

**Private (server-only):**
- `NUXT_ANTHROPIC_API_KEY` → `runtimeConfig.anthropicApiKey`
- `NUXT_STRIPE_SECRET_KEY` → `runtimeConfig.stripeSecretKey`
- `NUXT_RESEND_API_KEY` → `runtimeConfig.resendApiKey`
- `NUXT_SUPABASE_URL` → `runtimeConfig.supabaseUrl`
- `NUXT_SUPABASE_SERVICE_KEY` → `runtimeConfig.supabaseServiceKey`
- `NUXT_STRIPE_DAILY_PRICE_ID` → `runtimeConfig.stripeDailyPriceId`
- `NUXT_STRIPE_COMPAT_PLUS_PRICE_ID` → `runtimeConfig.stripeCompatPlusPriceId`
- `NUXT_STRIPE_COMPAT_SINGLE_PRICE_ID` → `runtimeConfig.stripeCompatSinglePriceId`
- `NUXT_EMAIL_JOB_SECRET` → `runtimeConfig.emailJobSecret`
- `NUXT_STRIPE_WEBHOOK_SECRET` → `runtimeConfig.stripeWebhookSecret`
- `NUXT_REDIS_URL` → `runtimeConfig.redisUrl`

**Public (client + server):**
- `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `runtimeConfig.public.stripePublishableKey`
- `NUXT_PUBLIC_SUPABASE_URL` → `runtimeConfig.public.supabaseUrl`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY` → `runtimeConfig.public.supabaseAnonKey`
- `NUXT_PUBLIC_SITE_URL` → `runtimeConfig.public.siteUrl`
- `NUXT_PUBLIC_TIKTOK_PIXEL_ID` → `runtimeConfig.public.tiktokPixelId`
- `NUXT_PUBLIC_META_PIXEL_ID` → `runtimeConfig.public.metaPixelId`
- `NUXT_PUBLIC_POSTHOG_KEY` → `runtimeConfig.public.posthogKey`

**Sentry (build-time, not NUXT_ prefixed):**
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

---

## 8. OPEN QUESTIONS

_(Leave blank — filled in manually)_
