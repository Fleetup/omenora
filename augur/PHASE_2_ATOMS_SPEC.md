# Phase 2 — Atoms Specification

## 1. Foundation Context

Design system state entering Phase 2:
- 99 design tokens in `augur/app/assets/css/editorial.css` `:root`
- Single typeface: Geist, loaded via `@nuxt/fonts`, self-hosted at `/_fonts/`
- Dark cosmic palette: `--surface-base` (#0A0A0F) through `--surface-elevated` (#1C1C26)
- CTA pink (`--cta-primary` #D94668), gold accent (`--accent-gold` #C9A84C), near-white text (`--text-primary` #FAFAFA)
- No light-mode variants in Phase 2; dark-first is the only supported mode

---

## 2. Atom Directory Convention

All atoms live in `augur/app/components/atoms/`. Each is a Vue 3 SFC with `<script setup lang="ts">`, scoped `<style scoped>`, and a documentation comment block at the top of the file describing purpose, props, slots, and usage example. File names match component names exactly: `AppButton.vue`, `AppEyebrow.vue`, etc.

Naming: all atoms are prefixed `App` to avoid conflicts with native HTML elements and Nuxt reserved names, and to make them grep-distinguishable from page-level components.

Auto-import is enabled via Nuxt's component auto-discovery, so no explicit import statements are needed in templates.

---

## 3. Audit Findings Summary

### Audit A — Button Patterns

Three visually distinct button treatments exist in the codebase:

**Solid white (primary)** — `CTAButton.vue` variant `solid`: white background (`--text-primary`), dark text (`--surface-base`), 14px/28px padding, hover lifts 1px and dims to 88% opacity. Used as default CTA throughout.

**Outlined (secondary)** — `CTAButton.vue` variant `outline`: transparent background, `--text-primary` text, `border: 1px solid --border-strong`. Hover strengthens border to `--text-primary`. Used for secondary actions (e.g., "Try the free reading", "Find out which →" on homepage).

**Pink filled (conversion)** — `CTAButton.vue` variant `cta`: `--cta-primary` background, `--text-primary` text, 16px/30px padding (slightly larger), hover glow via `--shadow-glow-cta`, entrance pulse animation using `--accent-gold-glow`. Used for highest-conversion CTAs on the 14.5i hero.

**Ghost/text-link** — `AppHeader.vue` uses `NuxtLink` elements styled as pill-shaped text-only navigation actions (`app-header__pill`, `app-header__pill--ghost`). No background, no border. These are distinct from the three `CTAButton` variants and represent a fourth treatment used for non-CTA navigation actions.

**Plan toggle buttons** — `subscribe.vue` has unstyled `<button>` elements for plan selection (monthly/yearly toggle). This is a specialized interactive pattern not in scope for a general atom.

**Icon/utility buttons** — `<button>` elements used for carousel navigation, modal close, language toggle. These are icon-only or single-character, not appropriate for `AppButton`.

All `CTAButton` instances use the `label-caps` utility class for text (12px, uppercase, 0.16em tracking, medium weight). Arrow (`→`) is an optional slot rendered via the `arrow` prop. `CTAButton` renders as `NuxtLink` when `to` prop is provided, otherwise as `<button>`.

**Conflict noted**: The existing `solid` variant uses `--text-primary` (near-white) as background, making it a white button on dark background. The `cta` variant uses `--cta-primary` (pink). The AppButton spec must rationalize these: `primary` maps to the pink conversion CTA (aligns with the locked design direction of CTA pink as the main conversion color), `secondary` maps to outlined, `ghost` maps to text-only. The old `solid` white variant is retained as `white` for cases where a light fill is semantically needed (e.g., on dark hero imagery).

### Audit B — Typography Patterns

Eight utility classes exist in `editorial.css`:

- `.font-display` — Geist light (300), 56px, tight leading (1.1), tight tracking (-0.02em), `--text-primary`. Used for non-italic display headlines.
- `.font-display-italic` — same as above but `font-style: italic`. Most-used display class across subscribe, report, daily, index, preview. This is the primary headline style.
- `.font-serif` — Geist light italic, 18px (`--text-md`), relaxed leading (1.625), normal tracking (-0.01em), `--text-secondary`. Used for subheadings, FAQ questions, section headers. Despite the name, now renders in Geist (italic axis).
- `.font-sans` — Geist regular, 16px, normal leading (1.5), `--text-primary`. Base body text.
- `.label-caps` — Geist medium, 12px (`--text-xs`), uppercase, widest tracking (0.16em), `--text-secondary`. Used for eyebrows, section labels, button text, nav pills.
- `.pull-quote` — Geist light italic, 28px (`--text-2xl`), snug leading (1.25), tight tracking (-0.02em), `--text-primary`. Used for featured callout text on daily.vue, index.vue archetype slide.
- `.annotation` — Geist regular, 14px (`--text-sm`), normal leading (1.5), `--text-secondary`. Used for metadata, captions, secondary descriptive text throughout.
- `.font-serif-italic` — local class defined inside `report.vue` and `daily.vue` (not in editorial.css global): Geist italic weight 300, no size override (inherits). Used for affirmation blocks and thematic highlight text inside report sections.

**Key finding**: `.font-serif-italic` is a local duplicate of `.font-serif` without size — it should be consolidated. The AppHeadline italic variant and font-serif class cover the same semantic ground. The `.font-serif-italic` local definitions in report.vue and daily.vue will be replaceable by AppBody with `italic` prop.

### Audit C — Image Patterns

Zero `<NuxtImg>` usages found in the codebase. All images use plain `<img>` tags. Two categories:

**Symbol/archetype images** — Small PNG/SVG icons, typically 32–80px, used inline with `aria-hidden="true"` (decorative). Found in: `ZodiacSymbol.vue`, `HoroscopeSymbol.vue`, `ArchetypeSymbol.vue`, `daily.vue`, `report.vue`. These are icons, not content images. AppImage is not appropriate for these; they remain plain `<img>` or dedicated symbol components.

**Hero/editorial images** — Larger content images in `index.vue` (hero-bg AVIF, archetype-glow.webp, hero-celestial.webp). These use `loading="lazy"`, `decoding="async"`. The hero-bg AVIF is preloaded in `nuxt.config.ts` via `<link rel="preload">`.

**AppImage target**: content images (editorial photography, archetype card illustrations, reading result images) that benefit from `@nuxt/image`'s automatic WebP/AVIF conversion, responsive sizes, and lazy loading. The component wraps `<NuxtImg>` with sane defaults.

`@nuxt/image` is installed (`^2.0.0`) but has no explicit `image` config block in `nuxt.config.ts`. Defaults apply: auto format, auto sizes. AppImage should set `loading="lazy"` and `decoding="async"` by default, with an `eager` prop override for LCP images.

### Audit D — Divider Patterns

The `.editorial-rule` utility class (defined in `editorial.css`) is the universal divider pattern: a `<div>` with `width: 100%`, `height: 1px`, `background: --border-subtle`. It appears in every page and several components (AppShell, AppHeader, report, account, preview, calendar, subscribe, daily, terms, privacy, compatibility, refund-policy).

`calendar.vue` has two additional local dividers (`.cal-summary-divider`, `.save-divider`) styled differently. These are specialized UI elements not in scope for AppDivider.

`AppDivider` generalizes the `.editorial-rule` pattern into a component. The spec adds an optional centered label variant (text between two rule lines) — no existing codebase equivalent but derived from common editorial patterns used in premium SaaS (Linear, Vercel).

### Audit E — Stat / Social Proof Patterns

Two distinct social proof patterns found:

**Inline social count** — `index.vue` line 66–68: a `<p class="hero__social">` containing a `<span class="hero__social-count">` (displays live reading count, e.g., "47,392") followed by inline text "charts read · No subscription required · 60 seconds". The count is highlighted in gold (currently via legacy `--color-gold`, a P5 migration target). This is a single inline sentence, not a component-composable stat pair.

**Trust strip** — `index.vue` lines 119–140: a four-column grid of `.trust-item` elements, each containing a `<span class="annotation trust-item__num">` (labeled `[01]`–`[04]`) and a `.trust-item__label` span with the value text. Currently uses legacy tokens in styles (P5 migration target). This is the closest existing pattern to AppStat.

**AppStat** generalizes the trust-strip item: a number/label pair where the number is the prominent element and the label is the descriptor. The live reading count (`readingCount`) is a data-driven variant of the same pattern.

### Audit F — Tokens Consumed Collectively by Atoms

The following tokens from the 99-token allowlist are consumed across all 10 atoms:

**Spacing**: `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-6`, `--space-8`, `--space-10`, `--space-12`

**Typography sizes**: `--text-2xs`, `--text-xs`, `--text-sm`, `--text-base`, `--text-md`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, `--text-4xl`, `--text-5xl`

**Typography rhythm**: `--leading-none`, `--leading-tight`, `--leading-snug`, `--leading-normal`, `--leading-relaxed`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide`, `--tracking-widest`

**Font weight**: `--weight-light`, `--weight-regular`, `--weight-medium`, `--weight-semibold`, `--weight-bold`

**Font family**: `--font-sans`

**Color — surfaces**: `--surface-base`, `--surface-raised`, `--surface-elevated`

**Color — text**: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`, `--text-inverse`

**Color — accent**: `--accent-gold`, `--accent-gold-dim`, `--accent-gold-glow`

**Color — CTA**: `--cta-primary`, `--cta-hover`, `--cta-active`, `--cta-glow`, `--cta-disabled`

**Color — border**: `--border-faint`, `--border-subtle`, `--border-default`, `--border-strong`

**Motion**: `--duration-fast`, `--duration-base`, `--ease-out`

**Radius**: `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-full`

**Shadows**: `--shadow-sm`, `--shadow-glow-cta`, `--shadow-glow-gold`

---

## 4. Tokens Used by Atoms (Reference)

See Audit F above. Tokens NOT consumed by atoms (breakpoints, z-index, overlay surface, slow duration, ease-in-out, large radius, large shadows, state colors, `--text-inverse` for non-button use) remain available for molecules and sections.

---

## 5. Atom Specifications

---

## AppButton

### Purpose

Universal interactive element replacing `CTAButton.vue`. Covers all button and link-styled CTA patterns observed in the codebase. Renders as a `<button>` element by default, or as a `NuxtLink` when a `to` prop is provided, or as an `<a>` when an `href` prop is provided. Generalizes the three `CTAButton` variants plus adds a `ghost` variant for text-only navigation actions (currently handled ad-hoc in AppHeader).

### Variants

**primary** — Pink filled conversion CTA. Background `--cta-primary`, text `--text-primary`. This is the highest-visual-weight action on any screen. Corresponds to the existing `cta` variant in CTAButton. Used for: "Become a Founding Member", "Begin the reading", main conversion actions.

**secondary** — Outlined CTA. Transparent background, `--text-primary` text, 1px border at `--border-strong`. Hover strengthens border to `--text-primary` full opacity. Corresponds to the existing `outline` variant. Used for: "Try the free reading", secondary page actions.

**white** — Solid white fill. Background `--text-primary`, text `--text-inverse`. The existing `solid` variant. Used when a light-fill button is needed against dark imagery or dark sections for contrast variety. Less common than primary.

**ghost** — Text-only, no background or border. Text at `--text-secondary`. Hover brings text to `--text-primary`. Used for navigation pill links in AppHeader, inline text CTAs.

### Props

- `variant` (string enum, default `primary`): controls visual treatment. Allowed values: `primary`, `secondary`, `white`, `ghost`.
- `to` (string, optional): if set, renders the component as a `NuxtLink` with this value as the `to` attribute. Enables client-side routing.
- `href` (string, optional): if set and `to` is not set, renders as an `<a>` tag with this `href`. For external links.
- `type` (string enum, default `button`): only applies when rendering as `<button>`. Allowed values: `button`, `submit`. Used for form submission buttons.
- `arrow` (boolean, default `false`): when true, appends a `→` character after the label, sized slightly larger than the label text and offset 1px upward for optical alignment.
- `full` (boolean, default `false`): when true, sets `width: 100%` and centers the label. Used in mobile-first contexts where the button should span its container.
- `disabled` (boolean, default `false`): applies disabled styling (40% opacity, `cursor: not-allowed`, no pointer events). Only functional when rendering as `<button>`; has no effect on NuxtLink or anchor renders.
- `loading` (boolean, default `false`): applies the same visual treatment as `disabled` and replaces the label slot content with a loading indicator. Prevents double-submit on forms. Only functional when rendering as `<button>`.
- `size` (string enum, default `md`): controls padding and font size. Allowed values: `sm`, `md`, `lg`. See sizing details in Implementation Notes.

### Slots

- `default` (required): button label text. Rendered inside a `<span>` with `label-caps` typography treatment (12px `--text-xs`, uppercase, `--tracking-widest`, `--weight-medium`).

### States

- **Default**: as described per variant above.
- **Hover**: primary — background shifts to `--cta-hover`, adds `--shadow-glow-cta`, lifts 2px via `translateY(-2px)`; secondary — border color shifts to `--text-primary`; white — opacity 0.88, lifts 1px; ghost — text shifts to `--text-primary`.
- **Active/pressed**: all variants — `translateY(0)` returning to baseline.
- **Focus-visible**: 2px offset outline using `--cta-primary` for primary/white, `--text-primary` for secondary/ghost. Must be visible against `--surface-base`.
- **Disabled**: 40% opacity, `cursor: not-allowed`, `pointer-events: none`, no transform.
- **Loading**: same as disabled visually. Label slot replaced by animated loading dots or a spinner. `aria-busy="true"` on the element.
- **Reduced-motion**: entrance pulse animation (primary variant) must be suppressed via `@media (prefers-reduced-motion: reduce)`. Hover transforms reduced to opacity-only.

### Accessibility

Semantic element is `<button>` (default), `<a>` (when `href` set), or rendered by `NuxtLink` (when `to` set, which resolves to `<a>`). `disabled` attribute is set natively on `<button>`; for link variants, `aria-disabled="true"` is used instead. `loading` state sets `aria-busy="true"` and `aria-label` should be provided by the consumer if the visible label changes. Minimum touch target: 44×44px (iOS HIG). For `ghost` pill-style buttons in navigation, padding must ensure touch target size. `type="button"` default prevents accidental form submission.

### Tokens Consumed

- **Color**: `--cta-primary`, `--cta-hover`, `--cta-active`, `--cta-glow`, `--cta-disabled`, `--text-primary`, `--text-secondary`, `--text-inverse`, `--surface-base`, `--border-strong`
- **Typography**: `--text-xs` (label), `--text-base` (arrow), `--weight-medium`, `--tracking-widest`, `--leading-tight`
- **Spacing**: `--space-3` (sm vertical), `--space-4` (md vertical), `--space-5` (lg vertical), `--space-6` (sm horizontal), `--space-8` (md horizontal), `--space-10` (lg horizontal)
- **Motion**: `--duration-fast` (hover), `--duration-base` (entrance pulse), `--ease-out`
- **Shadows**: `--shadow-glow-cta`
- **Inline value**: gap between label and arrow is `10px` — no `--space-*` token maps to exactly 10px (scale jumps from `--space-2: 8px` to `--space-3: 12px`). Use `10px` inline. This gap is an optical constant of the existing CTAButton, not a general spacing unit; no token addition warranted in Phase 2.
- **Inline value**: `--accent-gold-glow` is referenced for the `ctaPulse` entrance animation. This is a vestigial token scheduled for P5 removal; use it here but do not add new references beyond AppButton.

### Will Replace / Affect

- `augur/app/components/CTAButton.vue` — replaced entirely. All callers updated in P2.3 integration.
- `augur/app/pages/index.vue` — `<CTAButton>` instances (lines 62, 159, 276) migrate to `<AppButton>`.
- `augur/app/pages/subscribe.vue` — submit button (line 241) and plan-toggle `<button>` elements remain as native `<button>` (specialized UI, not AppButton candidates).
- `augur/app/components/AppHeader.vue` — `app-header__pill` NuxtLinks (lines 18–37) migrate to `<AppButton variant="ghost">`.
- Other pages using `<CTAButton>`: `preview.vue`, `report.vue`, `daily.vue`, `compatibility.vue`.

### Implementation Notes

Renders as `NuxtLink` when `to` prop is present (import `NuxtLink` from `#components`), as `<a>` when `href` is present, otherwise as `<button>`. Use `<component :is="...">` pattern identical to existing `CTAButton`. The `disabled` prop only applies the native `disabled` attribute when rendering as `<button>`; for link variants use `aria-disabled` and `pointer-events: none` via CSS class.

Size `sm`: vertical padding `--space-3`, horizontal `--space-6`. Size `md` (default): vertical `--space-4`, horizontal `--space-8`. Size `lg`: vertical `--space-5`, horizontal `--space-10`.

The entrance pulse animation (`ctaPulse`) from CTAButton carries over to the `primary` variant only. Controlled by a CSS custom property `--cta-pulse-delay` that callers can set via inline style for staggered entrances. Must respect `prefers-reduced-motion`.

`$attrs` should be forwarded to the root element to allow consumers to add `data-*` attributes, `@click` handlers, and ARIA overrides.

---

## AppEyebrow

### Purpose

Small-caps label placed above a headline to establish section context. Generalizes the `.label-caps` utility class as used in eyebrow position — e.g., "Premium" above the subscribe headline, "Your Archetype" above the archetype slide, "Compatibility" above the compat teaser, "№ 001 · OMENORA" in the hero. Currently implemented everywhere as a raw `<p class="label-caps ...">` with no semantic role enforcement.

### Variants

**default** — `--text-secondary` color. Used in most section eyebrows.

**accent** — `--accent-gold` color. For eyebrows that carry special emphasis (e.g., a numbered issue marker, a premium badge label).

**muted** — `--text-tertiary` color. For eyebrows in lower-emphasis contexts.

### Props

- `variant` (string enum, default `default`): controls text color. Allowed values: `default`, `accent`, `muted`.
- `as` (string, default `p`): the HTML element to render. Allowed values: `p`, `span`, `div`. Defaults to `p` for block flow; use `span` when inline in a flex container.

### Slots

- `default` (required): the eyebrow text content.

### States

No interactive states. Static display element.

### Accessibility

Renders as `<p>` by default. No ARIA attributes required. Screen readers read it as preceding text before the headline. Semantic `<p>` is preferable to `<span>` for standalone eyebrows; use the `as` prop only when layout context demands it.

### Tokens Consumed

- **Color**: `--text-secondary` (default), `--accent-gold` (accent), `--text-tertiary` (muted)
- **Typography**: `--text-xs`, `--weight-medium`, `--tracking-widest`, `--leading-tight`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

All `<p class="label-caps ...">` eyebrow usages across pages, specifically:
- `subscribe.vue` line 8: `<p class="label-caps subscribe-masthead__eyebrow">Premium</p>`
- `index.vue` line 25: `<p class="label-caps hero__issue">№ 001 · OMENORA</p>`
- `index.vue` line 148: `<p class="label-caps compat-teaser__eyebrow">Compatibility</p>`
- `index.vue` line 229: `<p class="label-caps archetype-slide__eyebrow">Your Archetype</p>`
- `report.vue` line 74: `<p class="label-caps report-masthead__eyebrow">`

### Implementation Notes

No slots beyond default. No `v-bind="$attrs"` forwarding required — this is a pure display atom. The `text-transform: uppercase` is encoded in the component style, not relying on the caller to apply `.label-caps`. The component does not include margin — spacing between the eyebrow and headline below it is the responsibility of the parent layout.

---

## AppHeadline

### Purpose

Display headlines at section and page level. Generalizes `.font-display` and `.font-display-italic` utility classes, and the local `.font-display-italic` class found in `report.vue`. The italic axis is the primary headline style throughout the app (subscribe masthead, report masthead, compat teaser, final CTA, archetype slide name, daily sub-headline). Non-italic variant exists but is less used.

### Variants

**italic** (default) — Geist light italic, `--text-5xl` (56px mobile, 72px at 768px+ per desktop override), tight leading, tight tracking. Maps to `.font-display-italic`.

**upright** — Geist light (not italic), same size and rhythm. Maps to `.font-display`. Used when context calls for a more neutral register.

**display** — Geist light italic, `--text-display` (96px mobile, 128px+ at wide breakpoints). For hero-scale headlines. Larger than the standard section headline.

### Props

- `variant` (string enum, default `italic`): controls italic axis and size tier. Allowed values: `italic`, `upright`, `display`.
- `as` (string, default `h2`): the heading level HTML element. Allowed values: `h1`, `h2`, `h3`, `h4`. Consumers must set correct heading level for document outline. Default `h2` because most section headlines in the codebase are `<h2>`.
- `color` (string enum, default `primary`): text color. Allowed values: `primary` (`--text-primary`), `secondary` (`--text-secondary`), `accent` (`--accent-gold`).

### Slots

- `default` (required): headline text content.

### States

No interactive states. Static display element.

### Accessibility

Renders as the element specified by `as`. Consumers are responsible for correct heading hierarchy — the component does not enforce it. No ARIA attributes required when heading elements are used correctly.

### Tokens Consumed

- **Color**: `--text-primary`, `--text-secondary`, `--accent-gold`
- **Typography**: `--text-5xl` (italic/upright), `--text-display` (display), `--weight-light`, `--leading-tight`, `--tracking-tight`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

- All `.font-display-italic` heading usages: `subscribe.vue` line 9, `report.vue` line 78, `index.vue` lines 149, 235, 302, `daily.vue` line 346, `preview.vue` headline.
- All `.font-display` heading usages (less common).
- Local `.font-display-italic` class definitions in `report.vue` (lines 1490–1494) become dead code after migration and can be removed.

### Implementation Notes

Desktop size override (`.font-display` responsive ramp: `--text-5xl` → `--text-6xl` at 768px) should be handled inside the component via a `@media (min-width: 768px)` scoped style, not via external utility classes. This keeps the responsive behavior encapsulated. The `display` variant uses `--text-display` on mobile and a larger clamp or `--text-display` override on desktop — match the token scale as defined.

---

## AppSubhead

### Purpose

Subheading placed below a headline to add a sentence or two of context. Generalizes `.font-serif` utility class — which despite its name renders in Geist italic at body-adjacent size. Used for: FAQ question text (`index.vue` line 292), section intro sentences (`index.vue` line 190: "Ancient wisdom. Modern precision"), compat teaser body intro, report section headings (`report.vue` line 142).

### Variants

**default** — Geist light italic, `--text-md` (18px), relaxed leading (1.625), normal tracking (-0.01em), `--text-secondary`. Identical to `.font-serif`.

**strong** — same size and rhythm but `--weight-regular` and `--text-primary`. For subheads that need more presence, e.g., a section heading that doubles as a subhead.

### Props

- `variant` (string enum, default `default`): Allowed values: `default`, `strong`.
- `as` (string, default `p`): HTML element. Allowed values: `p`, `h2`, `h3`, `h4`. Most usage is `<p>` (decorative subhead below a headline), but report uses `<h2>` and `<h3>` for section headings that share this style.
- `color` (string enum, default inherited from variant): overrides text color independently of variant. Allowed values: `primary`, `secondary`, `tertiary`.

### Slots

- `default` (required): subhead text content.

### States

No interactive states.

### Accessibility

Renders as element specified by `as`. When used as a decorative subhead below a headline, `<p>` is correct. When used as a section heading, the correct heading level must be passed via `as`.

### Tokens Consumed

- **Color**: `--text-secondary` (default), `--text-primary` (strong), `--text-tertiary` (color override)
- **Typography**: `--text-md`, `--weight-light`, `--weight-regular`, `--leading-relaxed`, `--tracking-normal`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

- All `.font-serif` class usages: `index.vue` lines 106, 190, 198, 292; `report.vue` line 142; `subscribe.vue` price elements (`.plan-price.font-serif` — though those are specialized and may not migrate cleanly).

### Implementation Notes

The `.font-serif` class throughout the codebase applies `font-style: italic` and `--weight-light`. AppSubhead `default` variant replicates this exactly. The `strong` variant drops the italic axis and raises weight, suitable for cases where `.font-serif` was applied to a heading that needed more authority.

---

## AppBody

### Purpose

Standard body text for multi-sentence and multi-paragraph content. Generalizes `.font-sans` utility class and the local `.font-serif-italic` class (Geist light italic, no size override) used in report affirmation blocks and daily reading reflections. Two variants cover both treatments.

### Variants

**default** — Geist regular, `--text-base` (16px), normal leading (1.5), normal tracking (-0.01em), `--text-primary`. Matches `.font-sans`.

**italic** — Geist light italic, `--text-base`, relaxed leading (1.625), normal tracking. Matches `.font-serif-italic` as defined locally in `report.vue` and `daily.vue`. This variant replaces those local class definitions.

**large** — Geist regular, `--text-md` (18px), relaxed leading. For intro paragraphs or lede text that sits between a headline and the main body.

### Props

- `variant` (string enum, default `default`): Allowed values: `default`, `italic`, `large`.
- `as` (string, default `p`): HTML element. Allowed values: `p`, `div`, `span`. Use `div` only when the body content contains nested block elements.
- `color` (string enum, default `primary`): Allowed values: `primary`, `secondary`, `tertiary`.
- `balance` (boolean, default `false`): when true, applies `text-wrap: balance` for short multi-line paragraphs (headlines, pull quotes, captions). Not appropriate for long-form body copy.

### Slots

- `default` (required): body text content. Can contain inline HTML elements (`<strong>`, `<em>`, `<a>`, `<br>`).

### States

No interactive states on the component itself. Inline `<a>` tags within the slot are styled by the consumer or global link styles.

### Accessibility

Renders as the element specified by `as`. No ARIA attributes required for plain body text.

### Tokens Consumed

- **Color**: `--text-primary`, `--text-secondary`, `--text-tertiary`
- **Typography**: `--text-base`, `--text-md`, `--weight-regular`, `--weight-light`, `--leading-normal`, `--leading-relaxed`, `--tracking-normal`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

- All `.font-sans` paragraph usages and inline `<p>` text not covered by other atoms.
- Local `.font-serif-italic` class in `report.vue` (lines 1484–1488) and `daily.vue`: replaced by `<AppBody variant="italic">`.
- `compat-teaser__body` paragraph in `index.vue` line 153.

### Implementation Notes

The `balance` prop is a progressive enhancement — `text-wrap: balance` is ignored by browsers that don't support it, so no polyfill is needed. AppBody does not handle multi-paragraph rendering (no `v-for` over paragraphs) — each `<p>` is a separate AppBody instance in the consumer template.

---

## AppCaption

### Purpose

Small metadata and annotation text. Generalizes the `.annotation` utility class, which is the most heavily-used utility class in the codebase (report.vue uses it for planet labels, date/city metadata, section numbers; index.vue for trust strip numbers and hint text; AppHeader for meta label). Also covers the vestigial `--text-pricing-meta: 12px` usage from the P5-deferred index.vue hero.

### Variants

**default** — Geist regular, `--text-sm` (14px), normal leading, `--text-secondary`. Matches `.annotation`.

**fine** — Geist regular, `--text-xs` (12px), normal leading, `--text-tertiary`. For the smallest metadata: pricing meta, legal footnotes, version strings.

### Props

- `variant` (string enum, default `default`): Allowed values: `default`, `fine`.
- `as` (string, default `span`): HTML element. Allowed values: `span`, `p`, `figcaption`. Default `span` because `.annotation` is used inline in flex containers throughout the codebase.
- `color` (string enum, default inherited from variant): Allowed values: `primary`, `secondary`, `tertiary`.
- `muted` (boolean, default `false`): applies `opacity: 0.3` — matches the separators in `report.vue` (`<span class="annotation" style="opacity:0.3">·</span>`). Avoids requiring consumers to write inline styles for separator characters.

### Slots

- `default` (required): caption or annotation text.

### States

No interactive states.

### Accessibility

Renders as `span` by default for inline usage. Use `as="figcaption"` when captioning a figure. Use `as="p"` for block-level annotation text.

### Tokens Consumed

- **Color**: `--text-secondary`, `--text-tertiary`, `--text-primary`
- **Typography**: `--text-sm`, `--text-xs`, `--weight-regular`, `--leading-normal`, `--tracking-normal`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

- All `.annotation` class usages: `report.vue` (planet cell labels, section metadata, payment banner text); `index.vue` (trust strip `[01]`–`[04]` numbers, archetype cta-hint); `AppHeader.vue` (meta label); `daily.vue`, `preview.vue`.
- The `style="opacity:0.3"` inline style pattern on separator spans in `report.vue` (lines 104, 106, 108) is replaced by `<AppCaption :muted="true">`.

### Implementation Notes

The `muted` prop applies `opacity: 0.3` as a scoped CSS class, eliminating the inline style pattern. AppCaption does not render any surrounding element beyond what `as` specifies — no wrapping `<div>`.

---

## AppImage

### Purpose

Wrapper around `<NuxtImg>` from `@nuxt/image` with opinionated defaults for the Omenora content context. Provides: lazy loading by default, `decoding="async"`, aspect ratio enforcement via CSS, and graceful fallback when `@nuxt/image` is unavailable. Intended for editorial photography and archetype illustrations — not for icon/symbol images (those remain plain `<img>`).

### Variants

**default** — standard lazy-loaded content image, full-width within its container.

**card** — enforces a specific aspect ratio (4:3 or 1:1, set by `ratio` prop) with `object-fit: cover`. Used for archetype card thumbnails and reading result illustrations.

### Props

- `src` (string, required): image source path, relative to `public/` or absolute URL.
- `alt` (string, required): alternative text. Empty string `""` is valid and appropriate for purely decorative images; the prop is required to force the decision at the call site.
- `width` (number, optional): intrinsic width hint in pixels. Passed to NuxtImg for srcset generation.
- `height` (number, optional): intrinsic height hint in pixels.
- `ratio` (string, optional): CSS aspect-ratio value (e.g., `"4/3"`, `"1/1"`, `"16/9"`). When set, the image container enforces this ratio and the image uses `object-fit: cover`.
- `eager` (boolean, default `false`): when true, sets `loading="eager"` and `fetchpriority="high"`. Use only for above-the-fold LCP images. Only one `eager` image per page.
- `rounded` (string enum, optional): applies border-radius. Allowed values: `sm` (`--radius-sm`), `md` (`--radius-md`), `lg` (`--radius-lg`), `full` (`--radius-full`).
- `class` (passed through `$attrs`): allows consumers to apply layout-specific classes.

### Slots

None. AppImage is a leaf element.

### States

- **Loading**: a minimal placeholder background color (`--surface-raised`) shown while the image loads. Fades out on image load via CSS transition.
- **Error**: if the image fails to load, the container maintains its dimensions and shows nothing (no broken image icon). The consumer is responsible for providing meaningful `alt` text.

### Accessibility

Renders as `<NuxtImg>` which resolves to `<img>`. The `alt` prop is required at the component level. When `alt=""` is passed, the image is treated as decorative by screen readers. Width and height props should be set for known-size images to prevent CLS.

### Tokens Consumed

- **Color**: `--surface-raised` (loading placeholder background)
- **Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` (conditional on `rounded` prop)
- **Motion**: `--duration-base` (fade-in on load)
- **No inline values required.**

### Will Replace / Affect

- Not a direct replacement of existing `<img>` tags in the short term — migration happens per-section during P5/P6 rebuilds.
- Hero images in `index.vue` may migrate to AppImage with `eager` for the LCP image (currently handled via `nuxt.config.ts` preload link — both approaches can coexist).
- Symbol/icon `<img>` tags (ZodiacSymbol, HoroscopeSymbol, ArchetypeSymbol, report tradition symbols) stay as plain `<img>` — they are not AppImage candidates.

### Implementation Notes

`NuxtImg` must be imported from `#components` or used via auto-import. The component should use a wrapping `<div>` with `position: relative` and the aspect-ratio CSS when `ratio` prop is set; the `<NuxtImg>` inside is `position: absolute, inset: 0, width: 100%, height: 100%, object-fit: cover`. When `ratio` is not set, no wrapping div is needed — render `<NuxtImg>` directly. Forward `$attrs` to `<NuxtImg>` so that consumers can add layout classes.

---

## AppPullQuote

### Purpose

Large emphasized italic text block for featured callouts, archetype identity lines, and daily reading themes. Generalizes the `.pull-quote` utility class, which appears across `index.vue` (archetype slide identity text), `daily.vue` (reading theme text, CTA pull lines, empty state message), and as a candidate for report highlight passages.

### Variants

**default** — Geist light italic, `--text-2xl` (28px), snug leading (1.25), tight tracking (-0.02em), `--text-primary`. Matches `.pull-quote`.

**gold** — same as default but `--accent-gold` text color. For particularly emphasized pull quotes where gold accent is semantically meaningful (a "featured" or "headline insight" register).

### Props

- `variant` (string enum, default `default`): Allowed values: `default`, `gold`.
- `as` (string, default `p`): HTML element. Allowed values: `p`, `blockquote`. Use `blockquote` when the pull quote is a direct quotation. Use `p` (default) for editorial callout text that is not a literal quote.
- `balance` (boolean, default `true`): applies `text-wrap: balance` by default, since pull quotes are typically short multi-line text where balance improves appearance.

### Slots

- `default` (required): pull quote text content.

### States

No interactive states.

### Accessibility

Renders as `<p>` by default. When `as="blockquote"` is used, a `<cite>` element inside the slot is the consumer's responsibility. No ARIA attributes required for standard pull quotes.

### Tokens Consumed

- **Color**: `--text-primary`, `--accent-gold`
- **Typography**: `--text-2xl`, `--weight-light`, `--leading-snug`, `--tracking-tight`, `--font-sans`
- **No inline values required.**

### Will Replace / Affect

- `index.vue` line 238: `<p class="archetype-slide__identity pull-quote">` → `<AppPullQuote>`
- `daily.vue` lines 69, 101, 135, 227, 258, 274, 330: all `.pull-quote` usages.
- The `.pull-quote` class in `editorial.css` becomes a dead utility class after migration and is a candidate for removal in a future cleanup pass.

### Implementation Notes

No complex logic. Pure display component. The `balance` prop default is `true` (opposite of AppBody) because pull quotes are almost always short enough to benefit from balance.

---

## AppStat

### Purpose

A number/value and label pair for social proof and feature callouts. Generalizes the trust strip pattern from `index.vue` (four `.trust-item` elements with `[01]`–`[04]` annotation labels and text descriptions) and the live reading count display (`readingCount` + "charts read" inline). These are the two closest existing patterns to a Stat component; neither is currently componentized.

### Variants

**default** — Label above (in `--text-secondary`, annotation size), value below (in `--text-primary`, `--text-2xl`). Vertical stacked layout. Matches the trust strip item structure.

**inline** — Label and value on the same line: value (prominent, `--accent-gold`, `--weight-semibold`) followed by label text (regular weight, `--text-secondary`). Matches the "47,392 charts read · No subscription required" pattern.

### Props

- `variant` (string enum, default `default`): Allowed values: `default`, `inline`.
- `value` (string, required): the prominent number or short value string (e.g., `"47,392"`, `"60s"`, `"12"`).
- `label` (string, required): the descriptor text (e.g., `"charts read"`, `"No subscription required"`).
- `accent` (boolean, default `false`): when true, renders `value` in `--accent-gold` rather than `--text-primary`. Used for live counters and highlighted stats.

### Slots

No slots. Both value and label are passed as props since the layout relationship between them is controlled internally.

### States

No interactive states. If the `value` prop is reactive (e.g., a live count), Vue's reactivity updates the rendered text automatically.

### Accessibility

Rendered as a `<div>` containing two `<span>` elements. No implicit semantic meaning — if the stat is part of a list, the consumer should wrap multiple AppStat instances in a `<ul>` with `<li>` wrappers, or use `role="list"`. The value and label are both visible text, readable by screen readers in natural document order (value first, label second in `default` variant; same in `inline` variant).

### Tokens Consumed

- **Color**: `--text-primary`, `--text-secondary`, `--accent-gold`
- **Typography (value)**: `--text-2xl` (default), `--text-base` (inline), `--weight-semibold`, `--leading-tight`
- **Typography (label)**: `--text-sm`, `--weight-regular`, `--leading-normal`
- **Spacing**: `--space-1` (gap between value and label in default variant)
- **No inline values required.**

### Will Replace / Affect

- `index.vue` trust strip (lines 119–140): four `.trust-item` instances migrate to `<AppStat>` with `default` variant.
- `index.vue` lines 66–68: the hero social count line migrates to `<AppStat variant="inline" :accent="true">`.
- The `.trust-item` and `.trust-item__num` / `.trust-item__label` classes in `index.vue` styles become dead code after migration.

### Implementation Notes

The `value` prop accepts a string, not a number, so consumers can pre-format with locale-specific number separators (`toLocaleString('en-US')`) before passing. AppStat does not fetch or compute data — it is a pure display atom.

---

## AppDivider

### Purpose

Horizontal visual separator. Generalizes the `.editorial-rule` utility class, which is the most pervasively used divider pattern in the codebase (found in every page and in AppShell, AppHeader). Also introduces an optional labeled variant (text between two rule lines) for use in section transitions, not currently in the codebase but derived from the editorial design register and common in premium SaaS UIs.

### Variants

**rule** (default) — A single 1px horizontal line at `--border-subtle` opacity. Direct replacement for `.editorial-rule`.

**labeled** — Two rule lines with a centered text label between them (e.g., "or", a section title, a decorative glyph). The lines are equal-width flex children flanking the label.

### Props

- `variant` (string enum, default `rule`): Allowed values: `rule`, `labeled`.
- `color` (string enum, default `subtle`): controls line color. Allowed values: `subtle` (`--border-subtle`), `faint` (`--border-faint`), `default` (`--border-default`), `strong` (`--border-strong`).
- `label` (string, optional): text to display in the labeled variant. Only meaningful when `variant="labeled"`. If `variant="labeled"` but no `label` is provided, renders as a plain rule.
- `spacing` (string enum, default `none`): vertical margin around the divider. Allowed values: `none` (0), `sm` (`--space-2` top and bottom), `md` (`--space-4` top and bottom), `lg` (`--space-8` top and bottom). Spacing is implemented as padding on the component's root element, not margin, to avoid margin collapse issues.

### Slots

- `default` (optional): alternative to the `label` prop for richer label content (e.g., an icon or styled text). If the default slot has content, it overrides the `label` prop.

### States

No interactive states.

### Accessibility

Renders as `<hr>` when `variant="rule"` with no label — `<hr>` is the correct semantic element for a thematic break between content sections. When `variant="labeled"`, renders as a `<div role="separator">` containing the label text, because `<hr>` cannot contain child elements. The `label` text (or slot content) is visible to screen readers as part of the separator's accessible name.

### Tokens Consumed

- **Color**: `--border-faint`, `--border-subtle`, `--border-default`, `--border-strong`
- **Typography (labeled variant)**: `--text-xs`, `--weight-medium`, `--tracking-widest`, `--text-tertiary`
- **Spacing**: `--space-2`, `--space-4`, `--space-8` (spacing prop values)
- **No inline values required.**

### Will Replace / Affect

- Every `<div class="editorial-rule" />` instance across the codebase (AppShell, AppHeader, all pages). This is the highest-frequency replacement in the Phase 2 integration pass.
- The `.editorial-rule` class in `editorial.css` becomes a dead utility class after migration. Retained until P2.3 integration is complete, then removed in a cleanup commit.

### Implementation Notes

The semantic shift from `<div class="editorial-rule">` to `<hr>` is significant — `<hr>` is a void element and cannot have children. The `rule` variant with no label must render as `<hr>`. CSS reset must strip the default `<hr>` browser styling (border, margin). The `labeled` variant cannot use `<hr>` and must use `<div role="separator">` instead.

The `.editorial-rule` class is currently used both as a thin horizontal line and as a section separator between header/footer areas. Both usages map to `<AppDivider variant="rule">` with appropriate `spacing` prop.

---

## 6. Shared Conventions

### Color Prop Normalization

When atoms accept a `color` prop, the allowed values and their token mappings are:
- `primary` → `--text-primary` (#FAFAFA)
- `secondary` → `--text-secondary` (#A8A8B3)
- `tertiary` → `--text-tertiary` (#6B6B7A)
- `accent` → `--accent-gold` (#C9A84C)

The `color` prop never accepts raw hex values or CSS variable names — only the semantic level names above.

### Align Prop Normalization

No atoms in Phase 2 include an `align` prop. Text alignment is a layout concern handled by parent containers. If a future atom needs text alignment, the allowed values are `left`, `center`, `right`, matching CSS `text-align` values.

### Size Prop Normalization

Where a `size` prop exists (currently only AppButton), the allowed values are `sm`, `md`, `lg`. `md` is always the default. Size affects padding and occasionally font size, but never changes the visual variant.

### Spacing Rule

All spacing values in atom scoped styles must use `--space-*` tokens. Inline pixel values are only permitted when:
1. No token maps to the exact value needed (the gap is between two token steps), AND
2. The value is a pixel-perfect optical constant from an existing component (not a new decision), AND
3. The inline value is documented with a comment explaining why no token fits.

The only currently identified inline spacing value is `10px` for the AppButton label-arrow gap (between `--space-2: 8px` and `--space-3: 12px`).

### Motion Duration Choice

- `--duration-fast` (150ms): hover state color/opacity transitions, focus ring appearance.
- `--duration-base` (300ms): transforms (translateY), box-shadow transitions, image load fade-in.
- `--duration-slow` (600ms): not used by Phase 2 atoms. Reserved for page transitions and section entrances.

### Mobile-First Approach

Atom scoped styles are written mobile-first. Internal `@media` queries inside atoms are only permitted for typography scale overrides (e.g., `font-size` ramp from `--text-5xl` to `--text-6xl` at 768px for AppHeadline). Layout-specific responsive behavior (column count, flex direction changes) is the responsibility of the parent molecule or section, not the atom.

### Reduced-Motion Respect

All atoms with CSS animations or transitions must include a `@media (prefers-reduced-motion: reduce)` block that disables or simplifies the motion. AppButton's entrance pulse animation is disabled entirely. Hover transforms are reduced to opacity-only changes.

### Dark-Mode Default

All atoms are specified for the dark cosmic palette only. No `prefers-color-scheme: light` variants are included in Phase 2. Light-mode support is deferred to a future phase.

### Documentation Comment Block

Every atom `.vue` file in Phase 2 must begin with a documentation comment block in the following format:

```text
<!--
  AppComponentName
  ─────────────────
  Purpose: [one sentence]
  Props: [comma-separated list of prop names]
  Slots: [slot names or "none"]
  Usage: <AppComponentName prop="value">content</AppComponentName>
-->
```

This block is placed before `<template>`. It is the only documentation format — no JSDoc, no `defineOptions({ name })` unless needed for devtools.

---

## 7. Build Order for P2.2

Build atoms in this order, lowest dependency first:

1. **AppCaption** — No dependencies. Pure display, simplest typography atom. Establishes the scoped-style pattern all other atoms follow.

2. **AppEyebrow** — No dependencies. One variant, one slot, no states.

3. **AppBody** — No dependencies. Two variants, establishes the italic-axis pattern used in reports and daily.

4. **AppSubhead** — No dependencies. Extends the `.font-serif` pattern.

5. **AppHeadline** — No dependencies. Responsive font-size ramp makes it slightly more complex than the smaller typography atoms.

6. **AppPullQuote** — No dependencies. Single scoped-style class, `text-wrap: balance` default.

7. **AppStat** — No dependencies. Two variants, two props, no interactive states. First atom with internal layout (flex, gap).

8. **AppDivider** — No dependencies. Semantic `<hr>` vs `<div role="separator">` switch makes it slightly non-trivial despite visual simplicity.

9. **AppImage** — Depends on `@nuxt/image` being correctly configured. Must verify `<NuxtImg>` auto-import works before building. No atom dependencies.

10. **AppButton** — Highest complexity: four variants, seven props, five interactive states, animation, semantic element switching (`button`/`NuxtLink`/`a`), reduced-motion handling, and the largest token footprint. Build last so the simpler atoms' patterns are established.

After all 10 atoms are built, the integration pass (P2.3) replaces existing usages across pages.
