# OMENORA — Project Context for Claude Code

## Product

OMENORA is a premium astrology and destiny-reading mobile app built with Expo SDK 53, React Native 0.79.6, React 19.0.0, TypeScript 5.8.3, Zustand, Supabase, RevenueCat (`react-native-purchases`). The app is fully native (iOS + Android), no web target. Subscription product at $4.99/month with a $2.99 one-time destiny report upsell. Acquisition channel: TikTok ads targeting women 25–45.

## Audience

Women 25–45. Acquired through warm, UGC-style TikTok creative. They open OMENORA expecting **warmth, intimacy, and self-recognition**. They are not Co-Star's audience (skeptical millennials wanting biting truths) and not a luxury watch buyer (austere prestige). They want to feel **received, seen, and gently understood** — the emotional register of high-end wellness brands, not the emotional register of private banking.

## Aesthetic Direction (commit to this — do not drift)

**Editorial wellness, not SaaS. Not Co-Star austerity. Not Nebula generic mystical.**

Reference brands for emotional register and visual taste — treat these as cultural anchors, not visual copies:
- Aesop packaging (warm earth tones, restrained typography, generous space, atmospheric depth)
- Maude wellness branding (modern feminine warmth without pink kitsch)
- Cereal magazine (editorial layout, serif gravitas, soft photography)
- Spotify Wrapped premium card aesthetics (rich gradients with atmospheric depth, not flat color)
- The Pattern app's intimate second-person tone (not its visual style)

What this means concretely — every screen should feel like opening a beautiful piece of physical mail addressed to one specific woman, not like opening another wellness SaaS app.

## Typography (locked — these are the actual token values)

**Font families configured in `src/design/tokens/typography.ts`:**

- **Display / hero:** `fontFamily.display` → `Fraunces_300Light` — weight 300, optical size large. Use for headlines, hero moments, screen titles.
- **Display italic:** `fontFamily.displayItalic` → `Fraunces_300Light_Italic` — luxury emphasis only. Single words or short phrases, never entire paragraphs.
- **Display medium:** `fontFamily.displayMedium` → `Fraunces_500Medium` — for heading1 weight contrast moments.
- **Reading body / serif:** `fontFamily.readingSerif` → `CormorantGaramond_300Light` — for any text the user reads as content: readings, archetypes, descriptions, counsel responses.
- **UI / labels / micro:** `fontFamily.ui` → `HankenGrotesk_400Regular`, `fontFamily.uiMedium` → `HankenGrotesk_500Medium`, `fontFamily.uiSemiBold` → `HankenGrotesk_600SemiBold` — for button labels, tab labels, captions, legal text, system-level UI.

> Note: `Inter` is installed as a package (`@expo-google-fonts/inter`) and `Playfair Display` (`@expo-google-fonts/playfair-display`) are both available but are **not wired into the token system**. Use Hanken Grotesk for all UI roles. Do not introduce Inter or Playfair as new token values without explicit approval.

**Type scale available in `typeScale`:**

| Token | Font | Size | Usage |
|---|---|---|---|
| `typeScale.hero` | Fraunces 300 | 56px / lh 64 | Largest display — once per screen max |
| `typeScale.display1` | Fraunces 300 | 40px / lh 48 | Section heroes |
| `typeScale.display2` | Fraunces 300 | 32px / lh 40 | Screen headlines |
| `typeScale.displayItalic` | Fraunces 300 Italic | 32px / lh 40 | Emphasis moments |
| `typeScale.heading1` | Fraunces 500 | 24px / lh 32 | Sub-headers |
| `typeScale.heading2` | HankenGrotesk 600 | 20px / lh 28 | Card titles |
| `typeScale.bodyLarge` | HankenGrotesk 400 | 17px / lh 26 | Primary readable body |
| `typeScale.body` | HankenGrotesk 400 | 15px / lh 22 | Default body |
| `typeScale.readingBody` | CormorantGaramond 300 | 18px / lh 30 | Long-form reading content |
| `typeScale.label` | HankenGrotesk 500 | 13px / lh 18 | Labels, inputs |
| `typeScale.caption` | HankenGrotesk 400 | 12px / lh 16 | Captions, metadata |
| `typeScale.micro` | HankenGrotesk 600 | 11px / lh 14 | Uppercase micro labels |

**Weight and scale discipline:**
- Use weight extremes: 300 light against 600/700 semibold — never 400 vs 500.
- Minimum 3× size jump between hierarchy levels (14 → 42, not 14 → 18 → 24). The existing scale supports this — `micro` (11) to `hero` (56) is already 5×.
- Italic Fraunces is a luxury moment. Never for entire paragraphs.

## Color (single dominant warm family + dark base)

**All colors defined in `src/design/tokens/colors.ts`:**

- **Base surface:** `surface.base` = `#120D08` — default screen canvas. `surface.deep` = `#0A0604` — deepest background for full-bleed hero moments. (Phase 2 warm-shift applied; see colors.ts)
- **Surface elevation stack:** `surface.deep` < `surface.base` < `surface.raised` < `surface.overlay` < `surface.floating` — use in order, never skip levels.
- **Single dominant accent:** `accent.primary` = `#C9A961` (warm amber/honey gold). This is the ONE warm color carrying the brand. `accent.emphasis` = `#E0C078` for hover/pressed states. `accent.subtle` / `accent.muted` for backgrounds.
- **Text:** `text.primary` = `rgba(255,255,255,0.93)`, `text.secondary` = `rgba(255,255,255,0.68)`, `text.tertiary` = `rgba(255,255,255,0.45)`. No pure white `#FFFFFF` — always softened.
- **Borders:** `border.subtle` / `border.default` / `border.strong` / `border.accent` — standard hierarchy. `border.hairline` = `rgba(255,255,255,0.04)` for near-invisible separation. `border.gold` = `rgba(201,169,97,0.22)` for premium card edges. (Cluster 8 added hairline + gold.)

**Atmospheric depth rule:** Every full-screen surface must use a layered gradient stack: solid surface base + radial gradient(s) in the warm amber family + subtle film grain noise overlay at 3–6% opacity. **Never use a flat solid color as a screen background** — that reads cold and clinical.

**Gradient stack reference:** The Nixtio Dribbble shot (dribbble.com/shots/26849581) shows the target gradient atmosphere. Reference saved at `mobile-app/docs/design-references/luxury-editorial/nixtio-reference.png` once added.

## Forbidden — these will ship as bugs

- `HankenGrotesk` / `Inter` / `Roboto` / `SF Pro` / `Helvetica` for anything other than UI/micro labels
- `CormorantGaramond` for UI chrome, buttons, or navigation labels (it's for reading content only)
- Purple-pink "mystical" gradient palette
- Neon colors, holographic gradients, rainbow effects
- Constellation patterns, scattered star backgrounds, zodiac wheel decorations
- Generic astrology iconography (Saturn rings, crystal balls, tarot card stacks as ornament)
- Phoenix illustrations, bird imagery (legacy element — being removed from all screens)
- AI-slop tells: three-card feature grids, hero with oversized headline + thin subhead + single button center, purple-to-blue gradients on any surface, uniform `12` border radius across all elements
- Flat solid backgrounds — every screen surface needs layered atmospheric depth
- Multiple competing accent colors — one warm family only (`accent.*`)
- Emojis in production UI
- "AI" or "AI-powered" language anywhere user-facing
- Pixel-perfect symmetry — composition should breathe asymmetrically where appropriate
- Importing from `src/theme/*` in new or redesigned screens — it is deprecated

## Motion philosophy

- **One orchestrated entrance moment per screen, not micro-interactions everywhere.** Staggered reveal on mount using motion tokens.
- **Slow and considered.** Default entrance duration 600–900ms. No springs that overshoot. No bouncy easings.
- **Soft breathing motion** on hero elements is acceptable — very slow (4–6 second cycles), subtle scale or opacity drift only.
- **Never animate the gradient background.** Background atmosphere is static; motion lives in foreground elements.
- **Use Moti or Reanimated for new screens.** The existing `Animated` (react-native core) on legacy screens is being replaced cluster by cluster.

## Spatial composition

- Generous breathing room is a luxury signal. Default screen edge padding is `layout.screenPadding` = 20px. For hero moments requiring more breathing room, override inline with `space['6']` (24) or `space['8']` (32). Never hard-code padding values.
- 4px spacing grid — consume from `space` tokens only. No hard-coded margin/padding values.
- Asymmetric composition is acceptable and often better — do not center everything by default.
- Hairline rules (`border.hairline`, `border.gold`) for separation, not solid heavy borders.
- Card elevation via `elevation.cardShadow` / `elevation.cardShadowPremium`, never default iOS shadow style. For true premium depth on iOS, use `cardShadowPremiumLayers` (array of 3 nested shadow Views — see elevation.ts).

## Existing design system (USE THESE — do not create parallel tokens)

Canonical source: `mobile-app/src/design/tokens/`. All new code must import from here.

```ts
import { surface, text, accent, border, state, specialty } from '@/design/tokens'
import { typeScale, fontFamily } from '@/design/tokens'
import { space, layout } from '@/design/tokens'
import { radius } from '@/design/tokens'
import { duration, easing, stagger } from '@/design/tokens'
import { elevation } from '@/design/tokens'
```

The `@/design/*` path alias is now configured in `tsconfig.json`. Both relative imports (`../../design/tokens`) and alias imports (`@/design/tokens`) resolve correctly.

The legacy `mobile-app/src/theme/` system still exists but is **deprecated**. Do not import from it in new or redesigned code.

## Motion easing curves

Use cubic-bezier curves from the `easing` token, never raw strings.

- `easing.enter` — Apple signature out; default for entrance animations (`Moti transition.easing`, Reanimated `withTiming({ easing: Easing.bezier(...easing.enter) })`)
- `easing.exit` — accelerated; for dismiss / exit
- `easing.transition` — standard ease-in-out
- `easing.heroEntrance` — expo out for prestige reveal moments only (use sparingly)
- `easing.softSettle` — soft overshoot for emotional settles (no bounciness)

Each value is a `[x1, y1, x2, y2]` cubic-bezier tuple. For Reanimated's `withTiming`, spread into `Easing.bezier`: `Easing.bezier(...easing.enter)`. `easingLegacy` exports the old string values for backward compatibility only — do not use in new code.

## Elevation tokens

Defined in `src/design/tokens/elevation.ts`. Import via `import { elevation, cardShadowPremiumLayers, warmGlow } from '@/design/tokens'`.

Single-layer (apply directly to a View's style):
- `elevation.cardSubtle` — resting list items, inactive cards
- `elevation.cardShadow` — default card shadow
- `elevation.cardShadowPremium` — single-layer premium fallback
- `elevation.floating` — modals, bottom sheets

Multi-layer (true premium iOS depth):
- `cardShadowPremiumLayers` — array of 3 shadow definitions. Wrap card content in 3 nested Views, each applying one layer. Android uses the innermost `elevation: 12`.

Warm glow:
- `warmGlow` — accent-tinted (`#C9A961`) shadow at 0 offset for premium CTAs and high-value surfaces.

## Implementation rules

Before redesigning any screen:
1. Read the existing screen file in `src/screens/`
2. Read `src/design/tokens/index.ts` to confirm what tokens are available
3. Identify which existing functionality / state / navigation must be preserved
4. Propose the redesign as a written plan first — wait for confirmation before writing code
5. Implement against tokens only — no hard-coded colors, fonts, or spacing values
6. Run `npx tsc --noEmit` after each screen to confirm no new errors vs the 4-error baseline
7. Never modify `src/theme/*`, `src/navigation/types.ts`, `app.json`, `eas.json`, `package.json` without explicit approval

When redesigning a screen, the work is:
- Visual refresh aligned with this brief
- Preserve every existing prop, navigation target, state interaction, and business logic
- Improve hierarchy, atmospheric depth, typography, and spacing
- Add `testID` props for Maestro selectors — convention: `<screen>-<element>-<variant>` (e.g. `welcome-cta-primary`, `paywall-plan-annual`)

## Testing / QA context

Visual regression testing uses **Maestro CLI** (not Playwright). Flows live in `mobile-app/.maestro/`. Screen registry at `mobile-app/tests/screen-registry.json`. Tooling doc at `mobile-app/docs/tooling/MAESTRO_SETUP.md`.

P0 screens (Welcome, PremiumTeaser, TodayTab) block PR merge on golden failure. P1 screens warn. P2 screens are informational.

## Audience reminder for every prompt

If you are about to ship something austere, cold, masculine, or clinical — stop. The user is a woman opening an app at 11pm after a TikTok ad. She needs to feel **welcomed, warmed, and gently invited inward**. Premium ≠ severe. Premium ≠ minimal-at-all-costs. Premium for OMENORA = warm, considered, generous, and unmistakably curated.
