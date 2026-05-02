# OMENORA_AUDIT.md
> Master reference document. Last updated: 2026-05-02.

---

## 1. TECH STACK

- **Framework:** Nuxt 4 (`nuxt ^4.4.2`) / Vue 3 (`vue ^3.5.32`) / Vite (bundled with Nuxt). `compatibilityDate: '2025-07-15'`.
- **Router setup:** File-based routing via `app/pages/` directory. Four legacy stub pages at root `pages/` level (`analysis.vue`, `index.vue`, `preview.vue`, `report.vue`) — empty shells, superseded by `app/pages/`.
- **Tailwind:** `@nuxtjs/tailwindcss ^6.14.0`. **`tailwind.config.ts` NOW EXISTS** at `augur/tailwind.config.ts` with custom tokens: colors `bone #F2EBDD`, `ink #1A1612`, `inkMid #3D3530`, `inkFaint rgba(26,22,18,0.45)`, `gold #C9A961`, `goldDim`; font families `display: Fraunces`, `serif: Cormorant Garamond`, `sans: Hanken Grotesk`, `mono: JetBrains Mono`; letter-spacing `widest2: 0.3em`, `widest3: 0.4em`. Content glob: `./app/**/*.{vue,js,ts}`.
- **UI component libraries:** None. All UI is hand-rolled with scoped CSS and the in-house `editorial.css` design-token system.
- **Nuxt modules registered:** `@nuxtjs/tailwindcss`, `@pinia/nuxt`, `@nuxtjs/sentry` (conditional on `SENTRY_DSN`).
- **Key dependencies (`package.json`):**
  - `@anthropic-ai/sdk ^0.86.1` — AI report generation (Anthropic Claude)
  - `@googlemaps/js-api-loader ^2.0.2` — Google Places Autocomplete for city input _(new)_
  - `@nuxtjs/sentry ^8.0.0` / `@sentry/vue ^8.0.0` / `@sentry/node ^8.0.0` — error tracking
  - `@nuxtjs/tailwindcss ^6.14.0` — Tailwind CSS
  - `@pinia/nuxt ^0.11.3` / `pinia ^3.0.4` — state management
  - `@supabase/supabase-js ^2.102.1` — auth + database
  - `canvas ^3.2.3` — server-side canvas for card/PDF
  - `html2canvas ^1.4.1` — client-side screenshot for share card
  - `inngest ^4.2.5` — event-driven background job orchestration _(new)_
  - `jspdf ^4.2.1` — client-side PDF generation
  - `nuxt-gtag ^4.1.0` — in `dependencies` but **not registered as a Nuxt module**; GA4 is loaded via inline `<script>` tags in `nuxt.config.ts` head (production only, GA ID `G-62M5LR63FH`)
  - `pdfkit ^0.18.0` — server-side PDF generation
  - `posthog-js ^1.369.3` — product analytics
  - `resend ^6.10.0` — transactional email
  - `stripe ^22.0.1` — payments
  - `sweph ^2.10.3-5` — Swiss Ephemeris (native Node addon)
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
│   │   │   ├── Logo-V1-Balck.svg   ← (filename typo; black wordmark SVG)
│   │   │   ├── Logo-V1-Black.ico
│   │   │   ├── Logo-V1-Black.png
│   │   │   ├── Logo-V1-White.png
│   │   │   ├── fonts/              ← (empty — fonts served from /public/fonts/)
│   │   │   └── css/
│   │   │       └── editorial.css   ← CSS custom properties + global utility classes
│   │   ├── components/             ← 11 active components (see §4)
│   │   │   ├── AppHeader.vue       ← full editorial header (sticky, drawer, lang switcher, auth-aware)
│   │   │   ├── AppShell.vue        ← page layout wrapper: AppHeader + <main> + footer
│   │   │   ├── ArchetypeSymbol.vue
│   │   │   ├── BackButton.vue
│   │   │   ├── CTAButton.vue       ← primary CTA: solid/outline variants, NuxtLink or <button>
│   │   │   ├── EditorialRule.vue   ← horizontal rule with optional ornament glyph
│   │   │   ├── HoroscopeSymbol.vue ← renders love/health/work SVG icons
│   │   │   ├── OrbitalMark.vue
│   │   │   ├── PhoenixLoader.vue   ← animated SVG stroke-draw phoenix loader
│   │   │   ├── PlacesAutocomplete.vue ← Google Places (New) city autocomplete
│   │   │   └── ZodiacSymbol.vue    ← renders zodiac sign SVGs from /symbols/
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   └── useLanguage.ts
│   │   ├── error.vue               ← Nuxt error boundary page
│   │   ├── pages/                  ← 13 pages (see §3)
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
│   │   │   ├── pixels.client.ts        ← TikTok pixel, Meta pixel, PostHog init
│   │   │   ├── store-persist.client.ts ← localStorage persistence for analysisStore
│   │   │   └── trustpilot.client.ts    ← Trustpilot widget bootstrap (new)
│   │   ├── stores/
│   │   │   └── analysisStore.ts    ← primary Pinia store (defineStore 'analysis')
│   │   └── utils/
│   │       ├── bazi.ts
│   │       ├── lifePathNumber.ts
│   │       ├── natalChart.ts       ← sweph wrapper + assignArchetypeFromChart
│   │       ├── quick-signs-client.ts
│   │       ├── supabase.ts         ← Supabase anon client factory
│   │       ├── translations.ts     ← UI_STRINGS i18n map (all languages)
│   │       └── vedic.ts
│   ├── components/                 ← legacy stub components (superseded by app/components/)
│   │   ├── AppHeader.vue           ← stub: renders <div>AppHeader</div>
│   │   └── DestinyCard.vue         ← stub: renders <div>DestinyCard</div>
│   ├── inngest/                    ← Inngest background job functions (new — see §8)
│   │   ├── client.ts               ← Inngest client + 10 typed event definitions
│   │   ├── abandonment-sequence.ts ← 4-step email abandonment funnel
│   │   ├── archetype-cache.ts      ← daily archetype insight cache generation
│   │   ├── daily-insight-delivery.ts ← per-subscriber daily email orchestrator
│   │   ├── resend-handlers.ts      ← bounce + spam-complaint suppression
│   │   ├── weekly-transit-delivery.ts ← per-subscriber weekly transit email
│   │   ├── welcome-insight.ts      ← post-subscription welcome email
│   │   └── zodiac-cache.ts         ← daily zodiac horoscope cache generation
│   ├── pages/                      ← legacy stub pages (superseded by app/pages/)
│   │   ├── analysis.vue / index.vue / preview.vue / report.vue
│   ├── public/
│   │   ├── android-chrome-192x192.png / android-chrome-512x512.png
│   │   ├── apple-touch-icon.png / favicon.ico / og-image.png
│   │   ├── site.webmanifest        ← PWA manifest (theme color #F2EBDD)
│   │   ├── fonts/                  ← Inter (4 weights), Cormorant (Light + LightItalic),
│   │   │                              Fraunces (Light + LightItalic) — see §5
│   │   └── symbols/                ← archetype + zodiac + section icons — see §5
│   ├── server/
│   │   ├── api/                    ← 70+ Nitro route handlers (see §7)
│   │   │   ├── auth/               ← provision-user.post, request-magic-link.post
│   │   │   ├── cron/               ← health.get, send-weekly-transits.post, trigger.post
│   │   │   ├── me/                 ← compatibility-readings.get, daily-insights.get,
│   │   │   │                          reports.get, subscription.get
│   │   │   ├── mobile/             ← confirm-payment.post, create-checkout-session.post,
│   │   │   │                          create-payment-intent.post,
│   │   │   │                          create-subscription-intent.post,
│   │   │   │                          verify-checkout-session.post
│   │   │   ├── resend/             ← webhook.post (bounce/complaint → Inngest)
│   │   │   ├── stripe/             ← webhook.post (Stripe events → Inngest + DB)
│   │   │   └── inngest.ts          ← Inngest serve handler endpoint
│   │   ├── error-handler.ts
│   │   ├── middleware/
│   │   │   ├── 01.security.ts      ← CSP, HSTS, Permissions-Policy, body limit, CORS
│   │   │   └── 02.rate-limit.ts    ← Redis sliding-window rate limiter (ioredis)
│   │   ├── migrations/             ← 13 SQL migration files (Supabase)
│   │   ├── plugins/
│   │   │   └── daily-cache-warmup.ts ← warms zodiac/archetype cache on server start
│   │   ├── routes/
│   │   │   ├── robots.txt.ts
│   │   │   └── sitemap.xml.ts
│   │   └── utils/
│   │       ├── ai-retry.ts / ai-schemas.ts / auth.ts / email-templates.ts
│   │       ├── geocode.ts / legal-copy.ts / planetaryTransits.ts
│   │       ├── quick-signs.ts / report-email-builder.ts / validate.ts
│   │       └── [email-jobs.ts REMOVED — replaced by Inngest]
│   ├── stores/
│   │   └── analysisStore.ts        ← empty file (0 bytes); real store is in app/stores/
│   ├── tests/ / types/ / utils/
│   ├── .env.example / Dockerfile / nuxt.config.ts / package.json
│   ├── playwright.config.ts / railway.json / tailwind.config.ts
│   ├── tsconfig.json / vitest.config.ts
├── mobile-app/                     ← separate React Native / Expo app
├── scripts/ / docs/ / QUERIES/
└── [various .md doc files]
```

---

## 3. PAGE INVENTORY

### `/` — `app/pages/index.vue`
- **Description:** Landing page / marketing homepage. Uses `AppShell` layout. Hero section with `OrbitalMark` animation, social proof, feature breakdown (6 traditions), FAQ, CTA sections. Live reading-count ticker via `/api/get-reading-count`.
- **URL params/query:** None.

### `/analysis` — `app/pages/analysis.vue`
- **Description:** Multi-step quiz funnel (8 steps: 0–7). Uses `AppHeader` component with step counter in action slot + progress bar. Step 0: "clarity focus" pre-qualification (tap-to-select, auto-advances). Step 1: first name (`<input type="text">`). Step 2: date of birth (`<input type="date">`, native picker). Step 3: city of birth via `PlacesAutocomplete` component (Google Places New API, emits `place-selected` with `{ name, lat, lng, placeId }`; also passes `cityLat`/`cityLng` to the chart calculation). Step 4: birth time (`<input type="time">`, skippable). Steps 5–7: three behavioral multiple-choice questions (`p1` focus area, `p2` insight style, `p3` reason for visit). On step 7 submit, POSTs to `/api/calculate-chart` then navigates to `/preview`.
- **URL params/query:** None (state via Pinia `analysisStore`).

### `/preview` — `app/pages/preview.vue`
- **Description:** AI report loading screen → free preview paywall. Loading uses `PhoenixLoader` with staged messages while calling `/api/generate-report`. Once loaded: archetype reveal, one free section (`identity`), blurred content hook, "unlock progress" meter at 14%, Stripe payment form. Promo code entry via `/api/validate-promo` and `/api/apply-promo-discount` (or `/api/apply-promo-access` for full-access promo codes).
- **URL params/query:** None (relies on `analysisStore`).

### `/report` — `app/pages/report.vue`
- **Description:** Full paid destiny report page. States: loading (with impulse upsell for compatibility add-on), error, no-report fallback, and full report. Full report renders all AI-generated sections, archetype symbol, tradition selector (Western/Vedic/BaZi/Tarot/Korean/Middle Eastern via `/api/switch-tradition`), daily oracle, share card (`html2canvas`), PDF download (`jspdf`), upsell panels (compatibility, calendar, daily subscription).
- **URL params/query:** `?session_id=` (Stripe Checkout session ID for payment verification + user provisioning); `?tempId=` (temp report recovery).

### `/account` — `app/pages/account.vue`
- **Description:** User account dashboard. States: loading, magic-link pending (requires explicit click — anti-prefetch-scanner design), unauthenticated (magic link sign-in form), authenticated (past reports, subscription status, compatibility readings, account settings).
- **URL params/query:** `?token_hash=` (Supabase OTP token from magic link email).

### `/daily` — `app/pages/daily.vue`
- **Description:** Daily horoscope page. Sign selector (all 12 zodiac signs using `ZodiacSymbol`), generic daily horoscope preview, personalized daily horoscope upsell. Uses `AppShell` layout.
- **URL params/query:** None.

### `/compatibility-quiz` — `app/pages/compatibility-quiz.vue`
- **Description:** Compatibility quiz funnel. Step 1: user's own DOB and city (via `PlacesAutocomplete`). Step 2: partner's name, DOB, city. Step 3: reading type selection. Loading state calls `/api/generate-compatibility`, then navigates to `/compatibility`. Progress bar `n of 3`.
- **URL params/query:** None (state via `analysisStore`).

### `/compatibility` — `app/pages/compatibility.vue`
- **Description:** Compatibility reading result. Two modes: `isPreviewMode` (free, blurred) and full post-payment report. Shows compatibility score (color-coded), title, 5 sections (attraction, communication, challenges, longterm, advice). PDF download for paid users.
- **URL params/query:** `?session_id=` (post-payment); `?preview=true` (free preview mode).

### `/calendar` — `app/pages/calendar.vue`
- **Description:** "Lucky Timing Calendar" — month-by-month destiny calendar. States: loading, error, no-calendar (purchase prompt), full calendar (overall theme, peak/caution months, per-month cards). PDF download available.
- **URL params/query:** `?session_id=` (post-payment calendar unlock).

### `/subscribe` — `app/pages/subscribe.vue`
- **Description:** Subscription signup for "Personal Daily Horoscope". Collects first name, email, DOB, city via `PlacesAutocomplete`; initiates Stripe subscription via `/api/create-subscription`.
- **URL params/query:** None.

### `/subscription` — `app/pages/subscription.vue`
- **Description:** Post-subscription confirmation. Success / error / loading states. Confirms delivery email.
- **URL params/query:** `?session_id=` (Stripe subscription checkout session).

### `/privacy` — `app/pages/privacy.vue`
- **Description:** Full Privacy Policy. 14 numbered sections — GDPR, CCPA/CPRA, data collection, sub-processors, international transfers, retention, security, user rights. Last updated April 20, 2026.
- **URL params/query:** None.

### `/terms` — `app/pages/terms.vue`
- **Description:** Full Terms of Service. Includes binding arbitration clause + class action waiver (Section 14). Last updated April 20, 2026.
- **URL params/query:** None.

---

## 4. COMPONENT INVENTORY

### `app/components/AppHeader.vue`
- **Props:** `dark?: boolean`
- **Renders:** Sticky editorial header (52 px height). Three-column grid: left meta label ("Vol. I · {year}"), center wordmark "Omenora" (Cormorant Garamond, 18px, 0.12em tracking), right action slot + hamburger. Default slot shows pill links for "◑ Daily" + "My Account"/"Sign in" (auth-aware via `useAuth`). Hamburger opens a right-side drawer (`min(420px, 100vw)`) with nav links (Home, Daily Horoscope, Compatibility, Begin Reading), language switcher pills (reads/sets `analysisStore.language`), and account footer link. Closes on route change. Locks body scroll while open. On mobile (≤640px): left meta hidden, pills hidden — only wordmark + burger visible.

### `app/components/AppShell.vue`
- **Props:** `dark?: boolean` (forwarded to `AppHeader`)
- **Renders:** Page layout wrapper. Renders `<AppHeader>` (with optional `#headerAction` slot passthrough), `<main class="app-shell__main">` (flex:1), and a sticky editorial footer (copyright, My Account/Sign in, Daily, Privacy, Terms links). Background `var(--color-bone)`. Full `min-height: 100vh` flex column layout.

### `app/components/ArchetypeSymbol.vue`
- **Props:** `symbol: string` (required), `size?: number` (default: `40`)
- **Renders:** `<img>` pointing to `/symbols/<archetypeId>.svg`. `SYMBOL_TO_ID` lookup maps 12 Unicode chars to archetype IDs: `●`→phoenix, `◆`→architect, `▲`→storm, `◇`→lighthouse, `○`→wanderer, `⬡`→alchemist, `□`→guardian, `⬟`→visionary, `◉`→mirror, `✦`→catalyst, `▽`→sage, `★`→wildfire.

### `app/components/BackButton.vue`
- **Props:** `to?: string` (default `'/'`), `label?: string` (default `'Go back'`), `text?: string` (default `''`)
- **Renders:** Pill-shaped back button with left-chevron SVG, optional text label, hover state. Uses `navigateTo(props.to)` or `window.history.back()`.

### `app/components/CTAButton.vue`
- **Props:** `variant?: 'solid' | 'outline'` (default: `'solid'`), `to?: string`, `type?: 'button' | 'submit'`, `arrow?: boolean`, `full?: boolean`, `disabled?: boolean`
- **Renders:** Polymorphic — renders as `<NuxtLink>` if `to` is provided, otherwise `<button>`. Solid variant: `background: var(--color-ink)`, `color: var(--color-bone)`. Outline variant: transparent + 1px ink border. Optional `→` arrow in Cormorant Garamond 16px. Full-width mode (`full`). `label-caps` typography (Hanken Grotesk, 11px, 0.3em tracking, uppercase).

### `app/components/EditorialRule.vue`
- **Props:** `ornament?: string` (e.g. `'◇'`, `'✦'`, any character)
- **Renders:** Full-width horizontal rule. Without `ornament`: single `1px solid var(--color-ink-ghost)` line. With `ornament`: two lines flanking a centered span in `--color-gold` at 12px. Applies `var(--space-block)` top/bottom margin.

### `app/components/HoroscopeSymbol.vue`
- **Props:** `type: 'love' | 'health' | 'work'`, `size?: number` (default: `16`)
- **Renders:** `<img>` pointing to `/symbols/Love-Symbol.svg`, `/symbols/Health-Symbol.svg`, or `/symbols/Work-Symbol.svg`.

### `app/components/OrbitalMark.vue`
- **Props:** `size?: number` (default: `160`), `pad?: number` (default: `26`), `accent?: string` (default: `'#d4a73a'`), `starfield?: boolean` (default: `true`)
- **Renders:** Animated `<canvas>` — planetary orbital system with central dark sphere (lit crescent), two orbiting bodies (comet trails + particle effects), Kepler's-second-law speed, perigee flare, atmospheric rim lighting. Pauses on `prefers-reduced-motion`, page visibility change, and IntersectionObserver off-screen. DPR-aware.

### `app/components/PhoenixLoader.vue`
- **Props:** `size?: number | string` (default: `80`), `color?: string` (default: `'#c9a84c'`), `strokeWidth?: number` (default: `1.5`), `duration?: number` (default: `3.6`), `ariaLabel?: string` (default: `'Loading'`)
- **Renders:** SVG stroke-draw animated phoenix (7 paths, `pathLength="1"` for uniform draw completion). CSS `@keyframes phoenix-draw`: stroke-dashoffset 1→0 (draw), fill-opacity 0→1 (fill), then fade out. Honors `prefers-reduced-motion` (static gold fill). Pure CSS, no JS rAF.

### `app/components/PlacesAutocomplete.vue`
- **Props:** `modelValue: string` (required), `label?: string`, `placeholder?: string`, `hint?: string`
- **Emits:** `update:modelValue`, `place-selected: { name, lat, lng, placeId }`
- **Renders:** Editorial-styled city input (Cormorant Garamond 24px, bottom-border underline style) with debounced (300ms) Google Places New API (`AutocompleteSuggestion`) suggestions dropdown. Keyboard navigation (↑↓ Enter Esc). Fetches lat/lng via `place.fetchFields({ fields: ['location'] })`. Creates a new `AutocompleteSessionToken` after each selection. Requires `NUXT_PUBLIC_GOOGLE_PLACES_KEY` env var.

### `app/components/ZodiacSymbol.vue`
- **Props:** `sign: string` (required), `size?: number` (default: `24`)
- **Renders:** `<img>` pointing to `/symbols/{sign}.svg` (e.g. `/symbols/Aries.svg`).

### `components/AppHeader.vue` _(legacy root-level stub)_
- **Renders:** `<div>AppHeader</div>` — empty stub, not used by any active page.

### `components/DestinyCard.vue` _(legacy root-level stub)_
- **Renders:** `<div>DestinyCard</div>` — empty stub, not used by any active page.

---

## 5. ASSET INVENTORY

### `/public/symbols/` — Symbol Icons (32 files total)

**Archetype SVGs + 2× PNGs (12 archetypes):**
- `alchemist.svg` / `alchemist@2x.png`
- `architect.svg` / `architect@2x.png`
- `catalyst.svg` / `catalyst@2x.png`
- `guardian.svg` / `guardian@2x.png`
- `lighthouse.svg` / `lighthouse@2x.png`
- `mirror.svg` / `mirror@2x.png`
- `phoenix.svg` / `phoenix@2x.png`
- `sage.svg` / `sage@2x.png`
- `storm.svg` / `storm@2x.png`
- `visionary.svg` / `visionary@2x.png`
- `wanderer.svg` / `wanderer@2x.png`
- `wildfire.svg` / `wildfire@2x.png`

**Zodiac sign SVGs + PNGs (12 signs — new):**
- `Aries.svg` / `Aries.png`, `Taurus.svg` / `Taurus.png`, `Gemini.svg` / `Gemini.png`
- `Cancer.svg` / `Cancer.png`, `Leo.svg` / `Leo.png`, `Virgo.svg` / `Virgo.png`
- `Libra.svg` / `Libra.png`, `Scorpio.svg` / `Scorpio.png`, `Sagittarius.svg` / `Sagittarius.png`
- `Capricorn.svg` / `Capricorn.png`, `Aquarius.svg` / `Aquarius.png`, `Pisces.svg` / `Pisces.png`
- Note: `Tauru.svg` also present (likely a duplicate/typo artifact)

**Report section label icons (SVGs + PNGs):**
- `Destiny Archetype.svg` / `Destiny Archetype.png`
- `Destiny Forecast copy.svg` / `Destiny Forecast.png`
- `Life Path Number copy.svg` / `Life Path Number.png`
- `Love & Relationship Patterns copy.svg` / `Love & Relationship Patterns.png`

**Horoscope category icons (SVGs + PNGs — new):**
- `Love-Symbol.svg` / `Love-Symbol.png` — used by `HoroscopeSymbol.vue`
- `Health-Symbol.svg` / `Health-Symbol.png` — used by `HoroscopeSymbol.vue`
- `Work-Symbol.svg` / `Work-Symbol.png` — used by `HoroscopeSymbol.vue`

### `/public/` — Root Public Assets

- `android-chrome-192x192.png` → App icon 192×192
- `android-chrome-512x512.png` → App icon 512×512
- `apple-touch-icon.png` → iOS Safari 180×180
- `og-image.png` → Open Graph / social 1200×630
- `favicon.ico` → Browser tab favicon
- `site.webmanifest` → PWA manifest (theme color `#F2EBDD`)

### `/public/fonts/` — Self-hosted Fonts

| File | Weight | Style | Status |
|---|---|---|---|
| `Inter-Regular.ttf` / `.woff2` | 400 | normal | Present (legacy — no longer primary font) |
| `Inter-Medium.ttf` / `.woff2` | 500 | normal | Present (legacy) |
| `Inter-Light.ttf` / `.woff2` | 300 | normal | Present (legacy) |
| `Inter-Italic.ttf` / `.woff2` | 400 | italic | Present (legacy) |
| `Cormorant-Light.ttf` | 300 | normal | Active (new) |
| `Cormorant-LightItalic.ttf` | 300 | italic | Active (new) |
| `Fraunces-Light.ttf` | 300 | normal | Active (new) |
| `Fraunces-LightItalic.ttf` | 300 | italic | Active (new) |

> **Note:** Inter files remain on disk but the active design system now loads Fraunces, Cormorant Garamond, Hanken Grotesk, and JetBrains Mono from Google Fonts via `<link>` in `nuxt.config.ts`. The self-hosted Cormorant/Fraunces `.ttf` files serve as fallback/offline copies.

### `/app/assets/` — Build-time Assets

- `Logo-V1-Balck.svg` → OMENORA wordmark logo, black (note: filename typo "Balck")
- `Logo-V1-Black.png` → OMENORA logo, black variant (~508 KB)
- `Logo-V1-White.png` → OMENORA logo, white variant (~520 KB)
- `Logo-V1-Black.ico` → OMENORA logo as `.ico`
- `css/editorial.css` → Global CSS custom properties + utility classes (see §6)

---

## 6. CURRENT DESIGN SYSTEM

The app has undergone a **complete design system migration** from a dark space-themed aesthetic to a light "Editorial" aesthetic. The previous dark palette (`#050410` background, white text, purple accents) is fully replaced.

### Design Token File — `app/assets/css/editorial.css`

Loaded globally via `nuxt.config.ts` (`css: ['~/assets/css/editorial.css']`). Defines `:root` CSS custom properties:

**Color tokens:**
| Variable | Value | Usage |
|---|---|---|
| `--color-bone` | `#F2EBDD` | Page background (replaces dark `#050410`) |
| `--color-bone-dim` | `#EAE2CF` | Slightly darker bone for hover states |
| `--color-ink` | `#1A1612` | Primary text + solid button fill |
| `--color-ink-mid` | `#3D3530` | Secondary text, heading |
| `--color-ink-faint` | `rgba(26,22,18,0.45)` | Placeholder, labels, muted text |
| `--color-ink-ghost` | `rgba(26,22,18,0.18)` | Borders, dividers, rules |
| `--color-gold` | `#C9A961` | Accent — ornaments, editorial-rule glyph |
| `--color-gold-dim` | `rgba(201,169,97,0.55)` | Muted gold |

**Typography scale tokens:**
| Variable | Value |
|---|---|
| `--text-display` | `clamp(64px, 16vw, 160px)` |
| `--text-headline` | `clamp(36px, 8vw, 72px)` |
| `--text-title` | `clamp(24px, 5vw, 40px)` |
| `--text-pull` | `clamp(20px, 4vw, 28px)` |
| `--text-body` | `17px` |
| `--text-caption` | `13px` |
| `--text-label` | `11px` |

**Spacing tokens:**
- `--space-section`: `clamp(64px, 10vw, 120px)`
- `--space-block`: `clamp(32px, 5vw, 56px)`

**Border tokens:**
- `--rule-ink`: `1px solid rgba(26,22,18,0.2)`
- `--rule-gold`: `1px solid rgba(201,169,97,0.5)`

**Global utility classes defined in `editorial.css`:**
- `.font-display` — Fraunces, weight 300
- `.font-display-italic` — Fraunces, weight 300, italic
- `.font-serif` — Cormorant Garamond
- `.font-sans` — Hanken Grotesk
- `.label-caps` — Hanken Grotesk, `var(--text-label)`, weight 600, `letter-spacing: 0.3em`, uppercase
- `.pull-quote` — Cormorant Garamond, `var(--text-pull)`, italic, weight 300
- `.annotation` — Hanken Grotesk, `var(--text-label)`, `letter-spacing: 0.2em`, uppercase, `color: var(--color-ink-faint)`
- `.editorial-rule` — `width: 100%; height: 1px; background: var(--color-ink-ghost)`
- `.symbol-editorial` — `filter: brightness(0) saturate(100%); opacity: 0.85` (renders color SVGs as ink on bone)
- `.symbol-editorial-gold` — preserves gold fill (used on both light and dark backgrounds)
- `.page-wrapper` — `max-width: 1400px; margin: 0 auto; padding: 0 clamp(20px,5vw,80px)`
- `.page-col` — `max-width: 860px` text column
- `.section-inner` — `max-width: 1400px; margin: 0 auto`
- Global autofill override: forces `#F2EBDD` background + `#1A1612` text on all `<input>` autofill states (webkit)

### Tailwind Config — `augur/tailwind.config.ts`

Custom tokens available as Tailwind utility classes (e.g. `bg-bone`, `text-ink`, `font-display`):
- Colors: `bone`, `ink`, `inkMid`, `inkFaint`, `gold`, `goldDim`
- Font families: `font-display` (Fraunces), `font-serif` (Cormorant Garamond), `font-sans` (Hanken Grotesk), `font-mono` (JetBrains Mono)
- Letter spacing: `tracking-widest2` (0.3em), `tracking-widest3` (0.4em)

### Global Styles — `app/app.vue` `<style>` (unscoped)

- Universal `box-sizing: border-box` reset
- `html, body`: `background: var(--color-bone)`, `color: var(--color-ink)`, `font-family: 'Hanken Grotesk', sans-serif`, `font-size: 16px`, `line-height: 1.6`, `-webkit-font-smoothing: antialiased`
- `body::before` — fixed noise texture overlay at **2.5% opacity** (inline SVG feTurbulence, subtle on bone bg)
- `.omenora-heading` — `font-family: 'Fraunces', serif`, weight 300, `letter-spacing: -0.02em`, `line-height: 1.1`
- `.omenora-display` — `font-family: 'Fraunces', serif`, weight 300, italic, `letter-spacing: -0.03em`, `line-height: 0.9`

### Google Fonts (loaded in `nuxt.config.ts` head `<link>`)

Single combined URL loads all four typefaces:
- **Fraunces** — optical-size axis 9–144, weight 200–900, italic/roman (display + heading)
- **Cormorant Garamond** — weight 300–700, italic/roman (serif pull-quotes, nav wordmark)
- **Hanken Grotesk** — weight 300–800 (body, labels, UI caps)
- **JetBrains Mono** — weight 300–700 (mono utility)

### Schema.org / SEO

`nuxt.config.ts` injects JSON-LD in `<head>`:
- `WebSite` schema with `SearchAction`
- `Organization` schema: legal name "United Northwest Carriers Inc.", founding date 2025, address Addison IL, social links (TikTok, Instagram, Facebook)

### Meta / OG / Theme

- `theme-color`: `#F2EBDD` (bone — was `#07070D`)
- `og:image`: `https://omenora.com/og-image.png` (1200×630)
- PWA manifest `theme_color`: `#F2EBDD`

---

## 7. DATA & API LAYER

### Chart Calculation Flow

1. `analysis.vue` collects birth data. City input uses `PlacesAutocomplete` — coordinates (`cityLat`/`cityLng`) from Google Places are stored in `analysisStore` and sent to `/api/calculate-chart`.
2. `/api/calculate-chart` prefers client-provided `cityLat`/`cityLng`; falls back to server-side `geocodeCity()` if absent. Calls `calculateNatalChart()`, `assignArchetypeFromChart()`, `calculateLifePathNumber()`. Returns `{ archetype, lifePathNumber, chart, geocodeFailed }`.
3. `preview.vue` POSTs to `/api/generate-report` with chart + user data → full AI-generated report JSON.
4. Report generation (`server/api/generate-report.post.ts`, ~60 KB): Anthropic Claude, `withAiRetry()`, Zod `ReportSchema` validation. Prompt includes inline Nakshatra, BaZi stems/branches, Western positions computed server-side.
5. Additional tradition sections: `/api/generate-vedic-section`, `/api/generate-bazi-section`, `/api/generate-tarot-section`. On-demand via `/api/switch-tradition`.
6. Daily cache: `/api/generate-daily-cache` pre-generates zodiac/archetype rows. `/api/get-daily-cache` / `/api/get-daily-cache.post` retrieves them. `/api/process-daily-insights` runs batch insight processing.
7. Compatibility: `/api/generate-compatibility` (Anthropic, scored + sectioned reading).
8. Calendar: `/api/generate-calendar` (Anthropic). PDF: `/api/generate-calendar-pdf`.

### Full API Route List (70+ handlers)

**Top-level handlers:**
`apply-promo-access.post`, `apply-promo-discount.post`, `calculate-chart.post`, `capture-email.post`, `check-report-exists.post`, `create-addon-payment.post`, `create-birth-chart-payment.post`, `create-bundle-payment.post`, `create-calendar-payment.post`, `create-compatibility-payment.post`, `create-oracle-payment.post`, `create-payment.post`, `create-portal-session.post`, `create-subscription.post`, `create-tradition-payment.post`, `detect-region.get`, `generate-bazi-section.post`, `generate-birth-chart.post`, `generate-calendar-card.post`, `generate-calendar-pdf.post`, `generate-calendar.post`, `generate-card.post`, `generate-compatibility-card.post`, `generate-compatibility.post`, `generate-daily-cache.post`, `generate-daily-horoscope.post`, `generate-daily-insight.post`, `generate-report-pdf.post`, `generate-report.post`, `generate-tarot-section.post`, `generate-vedic-section.post`, `generate-weekly-transit.post`, `get-calendar.post`, `get-compatibility-reading.post`, `get-daily-cache.post`, `get-reading-count.get`, `get-report.post`, `health.get`, `inngest` (Inngest serve handler), `mark-email-sent.post`, `process-daily-insights.post`, `save-calendar.post`, `save-compatibility-reading.post`, `save-report.post`, `save-subscriber.post`, `send-calendar-email.post`, `send-compatibility-email.post`, `send-daily-insight.post`, `send-report-email.post`, `send-weekly-transit.post`, `suppress-abandon-sequence.post`, `switch-tradition.post`, `unsubscribe.get`, `validate-promo.post`, `verify-payment.post`

**Namespaced handlers:**
- `auth/`: `provision-user.post`, `request-magic-link.post`
- `cron/`: `health.get`, `send-weekly-transits.post`, `trigger.post`
- `me/`: `compatibility-readings.get`, `daily-insights.get`, `reports.get`, `subscription.get`
- `mobile/`: `confirm-payment.post`, `create-checkout-session.post`, `create-payment-intent.post`, `create-subscription-intent.post`, `verify-checkout-session.post`
- `resend/`: `webhook.post`
- `stripe/`: `webhook.post`

### Pinia Store — `app/stores/analysisStore.ts`

`defineStore('analysis')`. Persisted to localStorage via `plugins/store-persist.client.ts` (key: `omenora_store_v2`, cache version: `v3-archetype-fix`).

**State fields:**
- `firstName`, `dateOfBirth`, `city`, `timeOfBirth` — birth info
- `cityLat: number | null`, `cityLng: number | null`, `cityPlaceId: string` — Google Places coordinates _(new)_
- `partnerCityLat: number | null`, `partnerCityLng: number | null` — partner city coords _(new)_
- `answers: { p1: string, p2: string, p3: string }` — quiz answers (`p1` = focus area, `p2` = insight style, `p3` = reason for visit)
- `clarityFocus: string` — pre-qualification answer (step 0)
- `natalChart: NatalChart | null` — computed chart positions
- `archetype: string`, `lifePathNumber: number`
- `reportContent: string`, `report: any`
- `paymentComplete: boolean`, `email: string`, `tempId: string`, `reportSessionId: string`
- `partnerName`, `partnerDob`, `partnerCity`
- `calendarData: any`, `calendarPurchased: boolean`
- `region: string`, `country: string`, `regionManualOverride: boolean`
- `vedicData`, `baziData`, `tarotData`
- `subscriptionActive`, `bundlePurchased`, `oraclePurchased`, `addonPurchased`, `birthChartPurchased`
- `birthChartData: any`, `compatibilityData: any`
- `language: string`, `languageManualOverride: boolean`

**LocalStorage persistence** (`store-persist.client.ts`): persists only non-sensitive fields (firstName, email, archetype, lifePathNumber, dateOfBirth, timeOfBirth, city, region, country, language, tempId, reportSessionId, natalChart). **Purchase flags are explicitly NOT persisted** — they are re-verified from Stripe on each page load. Cache version migration: on version mismatch, clears assignment fields while preserving user preferences.

### Swiss Ephemeris Integration

- **Package:** `sweph ^2.10.3-5` (native Node.js addon, `node-gyp`)
- **Location:** `app/utils/natalChart.ts` — imports `{ julday, calc_ut, houses_ex2, close, constants }` from `sweph`. Calculates Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Ascendant positions.
- **Nitro config:** `sweph` and `node-gyp-build` in `nitro.externals.external` — resolved from `node_modules` at runtime, not bundled.
- **Coordinate source:** `/api/calculate-chart` now prefers `cityLat`/`cityLng` from Google Places (client-provided) over server-side geocoding.

### Server Infrastructure

**`server/middleware/01.security.ts`:** CSP (includes Google Maps/Places, Trustpilot, Google Analytics/GTM, TikTok, Meta, PostHog, Stripe, Supabase), HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin headers. Body size limit: 512 KB general, 2 MB for `/api/send-report-email`. CORS enforcement on all `/api/` routes (origin whitelist).

**`server/middleware/02.rate-limit.ts`:** Redis-backed (`ioredis`) sliding-window rate limiter with in-memory fallback. Rules:
- `generate-*` / `send-*`: 5 req / 10 min
- `create-*`: 10 req / 15 min
- `calculate-chart`: 10 req / 1 min
- `save/get/check/mark/verify-*`: 30 req / 1 min
- `stripe/webhook`: 200 req / 1 min
- All other API routes: 60 req / 1 min
- Stripe webhook and internal `x-job-secret` authenticated calls are exempt.

**`server/plugins/daily-cache-warmup.ts`:** Runs on Nitro server start; warms the daily zodiac and archetype insight cache.

**`server/migrations/`** — 13 SQL migrations (Supabase):
`add_compatibility_access_tier`, `add_compatibility_columns`, `add_daily_insight_full_text`, `add_daily_insight_logs`, `add_inngest_infrastructure`, `add_oracle_purchased_and_subscriber_lifecycle`, `add_promo_access_tier`, `add_promo_codes`, `add_promo_security`, `add_prompt_version`, `add_subscriber_plan_type`, `add_tradition_columns`, `drop_email_jobs`

### Environment Variables

Runtime config keys (from `nuxt.config.ts`). Railway env var names may differ from the NUXT_ convention — the config keys are read by Nitro from `process.env` at runtime.

**Private (server-only):**
- `anthropicApiKey` ← `ANTHROPIC_API_KEY` (or `NUXT_ANTHROPIC_API_KEY`)
- `stripeSecretKey` ← `STRIPE_SECRET_KEY`
- `resendApiKey` ← `RESEND_API_KEY`
- `supabaseUrl` ← `SUPABASE_URL`
- `supabaseServiceKey` ← `SUPABASE_SERVICE_KEY`
- `stripeDailyPriceId` ← `STRIPE_DAILY_PRICE_ID`
- `stripeCompatPlusPriceId` ← `STRIPE_COMPAT_PLUS_PRICE_ID`
- `stripeCompatSinglePriceId` ← `STRIPE_COMPAT_SINGLE_PRICE_ID`
- `emailJobSecret` ← `EMAIL_JOB_SECRET`
- `cronSecret` ← `CRON_SECRET` _(new)_
- `inngestEventKey` ← `INNGEST_EVENT_KEY` _(new)_
- `inngestSigningKey` ← `INNGEST_SIGNING_KEY` _(new)_
- `stripeWebhookSecret` ← `STRIPE_WEBHOOK_SECRET`
- `resendWebhookSecret` ← `RESEND_WEBHOOK_SECRET` _(new)_
- `redisUrl` ← `NUXT_REDIS_URL`

**Public (client + server):**
- `public.stripePublishableKey` ← `STRIPE_PUBLISHABLE_KEY`
- `public.supabaseUrl` ← `SUPABASE_URL`
- `public.supabaseAnonKey` ← `SUPABASE_ANON_KEY`
- `public.siteUrl` ← default `'https://omenora.com'`
- `public.sentryDsn` ← `SENTRY_DSN` _(now public, used by @sentry/vue client)_
- `public.tiktokPixelId` ← `NUXT_PUBLIC_TIKTOK_PIXEL_ID`
- `public.metaPixelId` ← `NUXT_PUBLIC_META_PIXEL_ID`
- `public.posthogKey` ← `NUXT_PUBLIC_POSTHOG_KEY`
- `public.googlePlacesKey` ← `NUXT_PUBLIC_GOOGLE_PLACES_KEY` _(new — Google Places API)_

**Sentry (build-time, not Nuxt-prefixed):**
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`

---

## 8. INNGEST EVENT-DRIVEN SYSTEM

Inngest (`inngest ^4.2.5`) handles all background jobs, email sequences, and async orchestration. Replaces the former `server/utils/email-jobs.ts` system (dropped — see migration `drop_email_jobs.sql`).

**Serve endpoint:** `server/api/inngest.ts` — the Inngest serve handler registered at `/api/inngest`.

### Typed Events (`inngest/client.ts`)

| Event name | Trigger | Purpose |
|---|---|---|
| `subscriber/welcome.send` | Post-subscription Stripe webhook | Welcome insight email + onboarding |
| `abandonment/started` | `capture-email.post` | 4-step email abandonment sequence |
| `stripe/checkout.completed` | Stripe `checkout.session.completed` webhook | Cancel abandonment sequence |
| `user/unsubscribed` | Unsubscribe link click | Cancel abandonment sequence |
| `transit/weekly.send` | Weekly transit orchestrator | Per-subscriber weekly relationship transit email |
| `insight/daily-insight.send` | Daily insight orchestrator | Per-subscriber daily insight email |
| `cache/zodiac.generate` | Zodiac cache orchestrator | Generate + upsert one daily zodiac cache row |
| `cache/archetype.generate` | Archetype cache orchestrator | Generate + upsert one daily archetype cache row |
| `resend/email.bounced` | Resend bounce webhook | Suppress hard bounces, deactivate subscriber |
| `resend/email.complained` | Resend complaint webhook | Suppress spam complaints, deactivate subscriber |

### Inngest Functions (`inngest/`)

- **`abandonment-sequence.ts`** — 4-step timed email sequence (delays between steps), cancelOn `stripe/checkout.completed` or `user/unsubscribed`; idempotency key = email + sessionId.
- **`archetype-cache.ts`** — Generates love/work/health/reflection content for one archetype per day, upserts `daily_archetype_cache` row.
- **`daily-insight-delivery.ts`** — Per-subscriber orchestrator: dedup check → cache fetch → email send → dual-write log.
- **`resend-handlers.ts`** — Handles `resend/email.bounced` (permanent/hard bounces only) and `resend/email.complained` — writes to `email_suppression`, deactivates subscriber row.
- **`weekly-transit-delivery.ts`** — Per-subscriber weekly relationship weather email (Anthropic, compatibility_plus plan).
- **`welcome-insight.ts`** — Generates + sends welcome insight email after subscription checkout completes.
- **`zodiac-cache.ts`** — Generates one daily zodiac cache row per sign per day, upserts `daily_zodiac_cache`.

---

## 9. OPEN QUESTIONS

_(Leave blank — filled in manually)_
