# Phase 2.3c — Utility Class Replacement Audit

> Generated: 2026-05-22 | Branch: feature/b1-pricing-alignment | HEAD: 288f885  
> Scope: `augur/app/**/*.vue` excluding `augur/app/pages/index.vue` (P5 deferred)

---

## Summary

Total usages by class (pages + components, excludes index.vue):

| Class | Occurrences | Files |
|-------|-------------|-------|
| `.label-caps` | ~225 | 21 |
| `.font-display-italic` | 44 | 17 |
| `.font-serif` | 77 | 10 |
| `.font-serif-italic` | 13 | 3 |
| `.font-display` (non-italic) | 1 | 1 |
| `.annotation` | ~165 | 18 |
| `.pull-quote` | 7 | 1 |

> **Note on `.font-serif-italic`:** This class was discovered during the audit but is not listed in the six target classes. It maps to `AppSubhead variant="italic"`. See **Open Questions** section.

> **Note on `.font-display` (non-italic):** Only 1 occurrence in the entire codebase — a decorative separator `×` character in `compatibility-quiz.vue:180` — maps to `AppHeadline variant="upright"`.

---

## Per-File Inventory

### augur/app/components/AppHeader.vue

> **Disposition note:** AppHeader is a specialized navigation shell component. ALL `label-caps` usages here are navigation/UI-chrome context (pills, drawer labels, language buttons, close button). These are **keep inline** — they are not eyebrow typography, they are interactive UI elements with scoped styling. This component is NOT in scope for P2.3c atom replacement.

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `span` | `app-header__meta label-caps` | Header meta "Vol. I · YYYY" — decorative chrome | keep inline (nav chrome) |
| 20 | `NuxtLink` | `app-header__pill label-caps` | Nav pill "◑ Daily" | keep inline (nav pill) |
| 27 | `NuxtLink` | `app-header__pill label-caps` | Nav pill "My Account" | keep inline (nav pill) |
| 34 | `NuxtLink` | `app-header__pill app-header__pill--ghost label-caps` | Nav pill "Sign in" | keep inline (nav pill) |
| 80 | `span` | `nav-drawer__wordmark label-caps` | Drawer header "Menu" label | keep inline (nav chrome) |
| 82 | `button` | `nav-drawer__close label-caps` | Drawer "Close" button | keep inline (interactive button) |
| 110 | `p` | `label-caps nav-drawer__lang-label` | Language switcher section label | keep inline (nav chrome) |
| 115 | `button` | `lang-pill label-caps` | Language pill button | keep inline (interactive button) |
| 132 | `NuxtLink` | `label-caps nav-drawer__account` | Drawer footer "My Account →" link | keep inline (nav link) |
| 140 | `NuxtLink` | `label-caps nav-drawer__account` | Drawer footer "Sign in →" link | keep inline (nav link) |

---

### augur/app/components/AppShell.vue

> Footer links — all `annotation` usages are nav footer links or punctuation separators. Keep inline.

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 32 | `NuxtLink` | `annotation footer-link` | Footer link "About" | keep inline (footer nav link) |
| 33 | `span` | `annotation` | Separator dot · | keep inline (decorative punctuation) |
| 34 | `NuxtLink` | `annotation footer-link` | Footer link "Daily" | keep inline (footer nav link) |
| 35 | `span` | `annotation` | Separator dot · | keep inline (decorative punctuation) |
| 36 | `NuxtLink` | `annotation footer-link` | Footer link "Privacy" | keep inline (footer nav link) |
| 37 | `span` | `annotation` | Separator dot · | keep inline (decorative punctuation) |
| 38 | `NuxtLink` | `annotation footer-link` | Footer link "Terms" | keep inline (footer nav link) |
| 39 | `span` | `annotation` | Separator dot · | keep inline (decorative punctuation) |
| 40 | `NuxtLink` | `annotation footer-link` | Footer link "Refunds" | keep inline (footer nav link) |
| 43 | `span` | `annotation` | "All rights reserved" copyright line | AppCaption variant="default" |

---

### augur/app/components/BackButton.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| (1 match) | (button/link) | `label-caps` | Back navigation button | keep inline (interactive button) |

---

### augur/app/components/CTAButton.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| (1 match) | internal | `label-caps` | Button label inside CTAButton | keep inline (atom internals — do not touch) |

---

### augur/app/components/EditorialRule.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 4 | `span` | `e-rule__ornament annotation` | Ornament text between rule lines | keep inline (atom internals — do not touch) |

---

### augur/app/components/PlacesAutocomplete.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| (label-caps match) | (label) | `label-caps` | Form field label | keep inline (specialized widget) |
| 46 | `p` | `field-hint annotation` | Field hint text below input | keep inline (specialized widget) |

---

### augur/app/error.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| (label-caps) | `p` or `span` | `label-caps` | Error page eyebrow/status label | AppEyebrow |
| 10 | `h1` | `font-display-italic error-headline` | Page-level error headline | AppHeadline variant="italic" as="h1" |

---

### augur/app/pages/account.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 5 | `p` | `annotation` + inline style | "Loading your account…" loading state | AppCaption variant="default" |
| 12 | `p` | `label-caps auth-card__eyebrow` | "Sign in" eyebrow above headline | AppEyebrow |
| 13 | `h1` | `auth-card__headline font-display-italic` | "Complete your sign-in." auth screen headline | AppHeadline variant="italic" as="h1" |
| 16 | `button` | `auth-submit label-caps` | "Confirm magic link" submit button | keep inline (interactive button) |
| 34 | `p` | `label-caps auth-card__eyebrow` | "Account" eyebrow above sign-in headline | AppEyebrow |
| 35 | `h1` | `auth-card__headline font-display-italic` | "Sign in to your account." headline | AppHeadline variant="italic" as="h1" |
| 40 | `label` | `field-label label-caps` | Email address form field label | keep inline (form label) |
| 53 | `button` | `auth-submit label-caps` | Submit auth button | keep inline (interactive button) |
| 62 | `p` | `label-caps` + inline style | "✦ Check your email" confirmation message | AppEyebrow |
| 80 | `p` | `annotation account-sidebar__email` | User's email address in sidebar | AppCaption variant="default" |
| 89 | `button/NuxtLink` | `account-nav__item label-caps` | Account section nav tabs | keep inline (tab navigation) |
| 99 | `button` | `account-signout label-caps` | "Sign out" action button | keep inline (interactive button) |
| 107 | `h2` | `account-section__headline font-display-italic` | "Profile" section heading | AppHeadline variant="italic" as="h2" |
| 147 | `h2` | `account-section__headline font-display-italic` | "Your Plan" section heading | AppHeadline variant="italic" as="h2" |
| 171 | `p` | `label-caps plan-includes-block__label` | "What's included" sub-section eyebrow | AppEyebrow |
| 184 | `button` | `cancel-trigger annotation` | "Cancel subscription" trigger link-style | keep inline (interactive button) |
| 192 | `p` | `label-caps cancel-confirm__eyebrow` | "Before you go" modal eyebrow | AppEyebrow |
| 200 | `p` | `label-caps cancel-reason__label` | "Reason (optional)" form label | keep inline (form label) |
| 205 | `button` | `cancel-reason__option label-caps` | Cancel reason option button | keep inline (interactive button) |
| 217 | `button` | `cancel-confirm__confirm-btn label-caps` | "Confirm cancellation" button | keep inline (interactive button) |
| 231 | `p` | `label-caps` + inline style | "Cancellation initiated" status text | AppCaption variant="default" |
| 254 | `h2` | `account-section__headline font-display-italic` | "History" section heading | AppHeadline variant="italic" as="h2" |
| 260 | `p` | `label-caps` + inline style | "Natal Readings" subsection label | AppEyebrow |
| 270 | `button` | `reading-card__view label-caps` | "View" reading card action | keep inline (interactive button) |
| 276 | `p` | `label-caps` + inline style | "Recent Daily Readings" subsection label | AppEyebrow |
| 296 | `span` | `insight-row__toggle label-caps` | Insight row expand/collapse toggle | keep inline (interactive toggle) |
| 312–327 | `span` × 3 | `label-caps insight-section-label` | "Love / Work / Health" inline section labels | AppEyebrow |
| 327 | `span` | `label-caps insight-row__reflection-label` | "Today's reflection" label (×2, lines 327+336) | AppEyebrow |
| 347 | `p` | `label-caps` + inline style | "Compatibility Readings" subsection label | AppEyebrow |
| 359 | `button` | `reading-card__view label-caps` | "View" reading card action | keep inline (interactive button) |
| 366 | `p` | `annotation account-section__empty` | "No readings yet." empty state | AppCaption variant="default" |
| (font-serif ×10) | various | `font-serif` | Prices, sign names, report values in account cards — see below | |
| (account font-serif detail) | `span` | `price font-serif` or similar | Pricing display values (e.g. $6.99) | AppSubhead variant="default" |

> **account.vue font-serif detail** (10 occurrences — exact lines need reading): These are used for prices and sign/archetype names in account history cards. They should map to `AppSubhead variant="default"` unless they function as section headings.

---

### augur/app/pages/analysis.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `span` | `label-caps analysis-header__step` | Step counter "Step 1 of 6" in header | AppEyebrow |
| 22 | `p` | `label-caps analysis-step__label` | Step label above headline | AppEyebrow |
| 26 | `h1` | `analysis-step__headline font-display-italic` | Step headline (e.g. "What's your name?") | AppHeadline variant="italic" as="h1" |
| 44 | `span` | `quiz-option__letter label-caps` | Quiz option letter "A / B / C" (×3, lines 44, 125, 147, 169) | keep inline (quiz UI chrome) |
| 54 | `label` | `field-label label-caps` | "Your first name" form field label | keep inline (form label) |
| 69 | `label` | `field-label label-caps` | "Date of birth" form field label | keep inline (form label) |
| 80 | `p` | `field-hint annotation` | "Used only to calculate…" hint text | AppCaption variant="default" |
| 97 | `p` | `field-hint annotation` + inline style | "Birth time improves…" hint text | AppCaption variant="default" |
| 99 | `label` | `field-label label-caps` | "Birth time" form field label | keep inline (form label) |
| 100 | `button` | `skip-time-btn label-caps` | "Skip" time-entry button | keep inline (interactive button) |
| 108 | `p` | `field-hint annotation` | "Leave blank if unknown…" hint text | AppCaption variant="default" |
| 114 | `span` | `quiz-question__num annotation` | "01" question number (×3, lines 114, 136, 158) | AppCaption variant="default" |
| 115 | `p` | `quiz-question__text font-serif` | Quiz question body text (×3, lines 115, 137, 159) | AppSubhead variant="default" |
| 175 | `p` | `step-error annotation` | Validation/submit error text | AppCaption variant="default" |
| 184 | `button` | `back-link label-caps` | "← Back" navigation button | keep inline (interactive button) |
| 223 | `p` | `trust-footer annotation` | "🔒 Your birth data…" trust footer | AppCaption variant="default" |

---

### augur/app/pages/calendar.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 26 | `span` | `cal-page-label label-caps` | Header slot label "Lucky Timing Calendar" | keep inline (header action slot chrome) |
| 32 | `p` | `label-caps cal-hero__eyebrow` | "Destiny Calendar" eyebrow above page title | AppEyebrow |
| 33 | `h1` | `cal-hero__title font-display-italic` | "{Name}'s Year of Becoming" — page primary headline | AppHeadline variant="italic" as="h1" |

---

### augur/app/pages/compatibility-quiz.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `span` | `label-caps compat-landing__badge` | "Free Preview" landing badge | AppEyebrow |
| 11 | `p` | `label-caps compat-landing__eyebrow` | "Compatibility Reading" eyebrow above headline | AppEyebrow |
| 12 | `h1` | `compat-landing__headline font-display-italic` + `v-html` | Landing page primary headline | AppHeadline variant="italic" as="h1" |
| 17–21 | `span` ×3 | `annotation compat-landing__trust-item` | Trust items "Free preview / No account / 60 seconds" | AppCaption variant="default" |
| 25 | `p` | `annotation compat-landing__tp-label` | "Rated Excellent by our readers" trust label | AppCaption variant="default" |
| 33 | `p` | `annotation compat-landing__privacy` | Privacy disclaimer | AppCaption variant="default" |
| 41 | `p` | `label-caps compat-loading__brand` | "Omenora" brand label during loading | AppEyebrow |
| 42 | `p` | `compat-loading__msg font-display-italic` | Loading state animated message | AppHeadline variant="italic" as="h2" |
| 48 | `p` | `compat-loading__error annotation` | API error message text | AppCaption variant="default" |
| 60 | `span` | `label-caps analysis-header__step` | "Step X" counter | AppEyebrow |
| 76 | `p` | `label-caps analysis-step__label` | "Step N" label | AppEyebrow |
| 78 | `h1` | `analysis-step__headline font-display-italic` | Step headline | AppHeadline variant="italic" as="h1" |
| 88 | `label` | `field-label label-caps` | "Your birth date" form label (×2, lines 88, 135) | keep inline (form label) |
| 110 | `label` | `field-label label-caps` | "Birth time" form label (×2, lines 110, 157) | keep inline (form label) |
| 111 | `button` | `compat-skip-time label-caps` | "Skip" time button (×2, lines 111, 158) | keep inline (interactive button) |
| 119 | `p` | `field-hint annotation` | Birth time hint (×2, lines 119, 166) | AppCaption variant="default" |
| 127 | `p` | `label-caps compat-reveal__label` | "You" label in reveal summary (×3, lines 127, 173, 182) | AppEyebrow |
| 132 | `p` | `compat-reveal__path annotation` | Life path number display (×2, lines 132, 178) | AppCaption variant="default" |
| 180 | `div` | `compat-dual-reveal__sep font-display` | "×" separator between two reveal cards | keep inline (decorative glyph separator, not a heading) |
| 187 | `p` | `compat-reveal__path annotation` | Partner life path number | AppCaption variant="default" |
| 191 | `p` | `field-hint annotation` + inline style | Synastry hint text | AppCaption variant="default" |
| 200 | `button` | `back-link label-caps` | "← Back" button | keep inline (interactive button) |
| 243 | `p` | `trust-footer annotation` | Trust footer | AppCaption variant="default" |
| (font-serif ×3) | `p` | `quiz-question__text font-serif` (lines ~similar to analysis.vue) | Quiz question body text | AppSubhead variant="default" |

---

### augur/app/pages/compatibility-quiz-v2.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 7 | `span` | `v2-activity__text label-caps` | "N readings right now" live count badge | AppEyebrow |
| 11 | `h1` | `v2-headline font-display-italic` + `v-html` | Page primary headline | AppHeadline variant="italic" as="h1" |
| 19 | `span` | `v2-stars__label annotation` | "30,847 readings · 4.9 rating" social proof | AppCaption variant="default" |
| 25 | `span` | `label-caps v2-card__step` | "Step 1 of 4" step indicator | AppEyebrow |
| 26 | `span` | `annotation v2-card__pct` | "25% complete" progress label | AppCaption variant="default" |
| 34 | `label` | `v2-field-label label-caps` | "Your date of birth" field label | keep inline (form label) |
| 69 | `span` | `v2-strip__title label-caps` | Trust strip title "Free preview" (×3, lines 69, 74, 79) | AppEyebrow |
| 70 | `span` | `v2-strip__sub annotation` | Trust strip subtitle "No payment yet" (×3, lines 70, 75, 80) | AppCaption variant="default" |

---

### augur/app/pages/compatibility.vue

> Large file — 37 `label-caps`, 10 `font-display-italic`, 15 `font-serif`, 34 `annotation` occurrences.

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 41 | `h1` | `compat-masthead__names font-display-italic` | Partner names headline "Alice & Bob" | AppHeadline variant="italic" as="h1" |
| 48 | `p` | `compat-masthead__title font-display-italic` | Compatibility title (e.g. "The Mirror Souls") | AppHeadline variant="italic" as="h2" |
| 63 | `h2` | `report-section__heading font-display-italic` | Section heading (narrative section) | AppHeadline variant="italic" as="h2" |
| 82 | `h2` | `report-section__heading font-display-italic` | User birth chart section heading | AppHeadline variant="italic" as="h2" |
| 83 | `p` | `label-caps compat-bc-section__person` | "Alice's Birth Chart" person label | AppEyebrow |
| 85–101 | `p` ×5 | `label-caps bc-sign-cell__label` | "Rising / Sun / Moon / Dominant / Power House" cell labels | AppEyebrow |
| 89–102 | `p` ×5 | `bc-sign-cell__value font-serif` | Sign/planet value text (e.g. "Aries") | AppSubhead variant="default" |
| 107 | `p` | `label-caps bc-forecast-box__label` | "2026 Planetary Forecast" box label | AppEyebrow |
| 115 | `span` | `report-section__num label-caps` | "❖" section ornament | keep inline (decorative glyph) |
| 119 | `h2` | `report-section__heading font-display-italic` | Partner birth chart section heading | AppHeadline variant="italic" as="h2" |
| 118 | `p` | `label-caps compat-bc-section__person` | "Bob's Birth Chart" person label | AppEyebrow |
| 122–138 | `p` ×5 | `label-caps bc-sign-cell__label` | Cell labels (partner) | AppEyebrow |
| 123–139 | `p` ×5 | `bc-sign-cell__value font-serif` | Partner sign values | AppSubhead variant="default" |
| 144 | `p` | `label-caps bc-forecast-box__label` | Partner "2026 Planetary Forecast" label | AppEyebrow |
| 154 | `p` | `label-caps calc-receipt__header` | "How calculated" receipt header | AppEyebrow |
| 190 | `h2` | `compat-share__heading font-display-italic` | "Share your reading" section heading | AppHeadline variant="italic" as="h2" |
| 196 | `p` | `label-caps compat-share-card__kicker` | Share card kicker text | AppEyebrow |
| 197 | `p` | `compat-share-card__names font-serif` | Share card "You & Them" names | AppSubhead variant="default" |
| 198 | `p` | `compat-share-card__score font-serif` + `:style` | Share card score number | AppSubhead variant="default" |
| 202 | `p` | `label-caps compat-share-card__domain` | "omenora.com" domain label on share card | AppEyebrow |
| 231 | `span` | `label-caps compat-preview__badge` | "Free" preview badge | AppEyebrow |
| 242 | `p` | `label-caps compat-masthead__kicker` | "Destiny" kicker/eyebrow above preview names | AppEyebrow |
| 243 | `h1` | `compat-masthead__names font-display-italic` | Preview names headline | AppHeadline variant="italic" as="h1" |
| 246 | `p` | `compat-masthead__score font-serif` + `:style` | Preview score number | AppSubhead variant="default" |
| 250 | `p` | `compat-masthead__title font-display-italic` | Preview compat title | AppHeadline variant="italic" as="h2" |
| 256 | `p` | `label-caps report-section__kicker` | "The Challenge" kicker/eyebrow | AppEyebrow |
| 258 | `span` | `report-section__num label-caps` | "01" section number | keep inline (decorative) |
| 261 | `h2` | `report-section__heading font-display-italic` | Narrative section heading | AppHeadline variant="italic" as="h2" |
| 271 | `span` | `label-caps locked-strip__label` | "Locked" strip label | AppEyebrow |
| 288 | `p` | `label-caps calc-receipt__header` | "How calculated" (second instance) | AppEyebrow |
| 328 | `button` | `compat-promo__apply label-caps` | "Apply" promo code button | keep inline (interactive button) |
| 348 | `label` | `label-caps capture-block__label` | "Email address" form label | keep inline (form label) |
| 375 | `h2` | `paywall__heading font-display-italic` | Paywall section heading | AppHeadline variant="italic" as="h2" |
| 383 | `p` | `pay-card__price font-serif` | Price display "$9.99" | AppSubhead variant="default" |
| 411 | `label` | `label-caps capture-block__label` | "Your name" form label | keep inline (form label) |
| 422 | `label` | `label-caps capture-block__label capture-block__label--spaced` | "Their name" form label | keep inline (form label) |
| 433 | `label` | `label-caps capture-block__label capture-block__label--spaced` | "Email" form label | keep inline (form label) |
| 452 | `p` | `label-caps compat-trust-secure` | "Secure payment" trust note | AppEyebrow |
| (annotation ×34) | various | `annotation *` | Metadata, scores, descriptions — all `AppCaption variant="default"` except fine-print | AppCaption variant="default" |

---

### augur/app/pages/daily.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 31 | `h1` | `daily-header__headline font-display-italic` | "Daily Horoscope" tab page title | AppHeadline variant="italic" as="h1" |
| (label-caps — sign tile names) | `span` | `label-caps sign-tile__name` | Sign name below symbol in selector grid | AppEyebrow |
| (label-caps — today formatted) | `p` | `label-caps reading-empty__label` | Date label above empty state | AppEyebrow |
| (label-caps — "Today's theme/focus") | `span` | `label-caps reading-content__theme-label` | Theme section label | AppEyebrow |
| (label-caps — archetype mini-card) | `span` | `label-caps archetype-mini-card__name` | Archetype name below symbol | AppEyebrow |
| (label-caps — "All signs" / "All archetypes") | `p` | `label-caps others-section__label` | Section header label | AppEyebrow |
| 59 / 90 / 217 / 247 | `h2` | `font-serif reading-sign-name` | Sign/archetype display name heading (inside reading view) | AppSubhead variant="strong" as="h2" |
| 101 | `p` | `pull-quote reading-content__theme-text` | Today's theme text | AppPullQuote variant="default" |
| 135 | `p` | `pull-quote reading-cta__pull` | CTA pull text "This is your sun sign forecast…" | AppPullQuote variant="default" |
| 155 | `p` | `annotation sign-mini-card__theme` | Sign theme preview text | AppCaption variant="default" |
| 156 | `p` | `annotation sign-mini-card__preview` | First sentence of reading | AppCaption variant="default" |
| 166 | `p` | `annotation sign-selector__prompt` | "Select your sun sign" prompt | AppCaption variant="default" |
| 176 | `span` | `annotation sign-tile__dates` | Sign date range (e.g. "Mar 21 – Apr 19") | AppCaption variant="default" |
| 189 | `h1` | `daily-header__headline font-display-italic` | "Archetype Reading" tab page title | AppHeadline variant="italic" as="h1" |
| 196 | `p` | `annotation` (plain) | "Loading today's readings…" | AppCaption variant="default" |
| 201 | `p` | `annotation` (plain) | "Today's archetype readings being prepared" | AppCaption variant="default" |
| 218 / 248 | `span` | `annotation` (plain) | "Archetype Reading" subtitle in reading header | AppCaption variant="default" |
| 227 / (empty state sub) | `p` | `annotation reading-empty__sub` | "Archetype readings generated each morning…" | AppCaption variant="default" |
| 258 | `p` | `pull-quote reading-content__theme-text` | Today's archetype focus text | AppPullQuote variant="default" |
| 269 | `p` | `reading-reflection__text font-serif-italic` | Reflection italic text | AppSubhead variant="italic" |
| 274 | `p` | `pull-quote reading-cta__pull` | "Don't know your archetype yet?" CTA text | AppPullQuote variant="default" |
| 296 | `p` | `annotation archetype-mini-card__theme` | Archetype theme preview | AppCaption variant="default" |
| 305 | `p` | `annotation archetype-selector__prompt` | "Select your archetype" prompt | AppCaption variant="default" |
| 318 | `span` | `label-caps archetype-tile__name` | Archetype name in selector tile | AppEyebrow |
| 330 | `p` | `pull-quote daily-cta-strip__pull` | Bottom CTA strip pull quote | AppPullQuote variant="default" |
| 343 | `span` | `label-caps daily-sub-badge` | "Personal" subscription badge | AppEyebrow |
| 344 | `span` | `daily-sub-price font-serif` | "$6.99" subscription price display | AppSubhead variant="default" |
| 346 | `h2` | `font-serif-italic daily-sub-headline` | "Get YOUR personal horoscope every morning" | AppSubhead variant="italic" as="h2" |
| 347 | `p` | `annotation daily-sub-copy` | Subscription description body | AppCaption variant="default" |
| 348 | `NuxtLink` | `daily-sub-btn label-caps` | "Start Personal Horoscope →" nav link button | keep inline (interactive link-button) |
| 349 | `p` | `annotation daily-sub-note` | "Cancel anytime · No commitment" | AppCaption variant="fine" |

---

### augur/app/pages/founding/index.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 10 | `p` | `label-caps founding-hero__status` | Status badge eyebrow (e.g. "Accepting founding members") | AppEyebrow |
| 15 | `h1` | `founding-hero__headline font-display-italic` | "Founding Membership" hero headline | AppHeadline variant="italic" as="h1" |
| 33 | `span` | `founding-benefit__icon label-caps` | "✦" benefit icon glyph | keep inline (decorative icon-glyph) |
| 45 | `span` | `label-caps founding-price__type` | "One-time · Not a subscription" price type label | AppEyebrow |
| 65 | `p` | `founding-trust annotation` | Trust statement below CTA | AppCaption variant="default" |
| 85 | `p` | `label-caps founding-section__eyebrow` | "What this is" section eyebrow | AppEyebrow |
| 86 | `h2` | `founding-section__headline font-display-italic` | "A real reading platform…" section heading | AppHeadline variant="italic" as="h2" |
| 112 | `p` | `label-caps founding-section__eyebrow` | "Why founding members exist" section eyebrow | AppEyebrow |
| 113 | `h2` | `founding-section__headline font-display-italic` | "Built for the long run" section heading | AppHeadline variant="italic" as="h2" |
| 137 | `p` | `label-caps founding-live__eyebrow` | "Already live" section eyebrow | AppEyebrow |
| 138 | `h2` | `founding-live__headline font-display-italic` | "The reading engine is live." heading | AppHeadline variant="italic" as="h2" |
| 170 | `p` | `label-caps founding-section__eyebrow` | "Questions" FAQ section eyebrow | AppEyebrow |
| 171 | `h2` | `founding-faq__headline font-display-italic` | "Frequently asked." FAQ heading | AppHeadline variant="italic" as="h2" |
| 182 | `button` | `founding-faq__question label-caps` | FAQ accordion toggle button | keep inline (interactive button) |
| 215 | `p` | `label-caps founding-final-cta__eyebrow` | "Founding membership" final CTA eyebrow | AppEyebrow |
| 218 | `span` | `label-caps founding-price__type` | "One-time · Not a subscription" (second instance) | AppEyebrow |
| 235 | `p` | `founding-trust annotation` | Trust statement below final CTA | AppCaption variant="default" |
| (font-serif ×1) | `span` | `founding-price__amount font-serif` | "$20" price amount | AppSubhead variant="default" |
| (font-serif ×2 more) | `span` | (price amounts) | Additional price displays | AppSubhead variant="default" |

---

### augur/app/pages/founding/thank-you.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 11 | `p` | `annotation ty-loading__label` | "Confirming your purchase…" loading label | AppCaption variant="default" |
| 24 | `p` | `annotation ty-pending__sub` | "This usually takes a few seconds." | AppCaption variant="default" |
| 33 | `p` | `label-caps ty-status` | "Payment processing" status badge | AppEyebrow |
| 34 | `h1` | `ty-headline font-display-italic` | "Your payment is being processed." headline | AppHeadline variant="italic" as="h1" |
| 50 | `p` | `label-caps ty-status` | "Something went wrong" status badge | AppEyebrow |
| 51 | `h1` | `ty-headline font-display-italic` | "We couldn't verify this purchase." headline | AppHeadline variant="italic" as="h1" |
| 73 | `p` | `label-caps ty-status` | "You're in." success status badge | AppEyebrow |
| 75 | `h1` | `ty-headline ty-headline--hero font-display-italic` | "Welcome, Founding Member." hero headline | AppHeadline variant="italic" as="h1" |
| 82 | `span` | `annotation ty-confirm__label` | "Confirmation sent to" label (×2, lines 82, 86) | AppCaption variant="default" |
| 112 | `p` | `label-caps founding-section__eyebrow` | "What's next" section eyebrow | AppEyebrow |
| 113 | `h2` | `ty-subheadline font-display-italic` | "Three things to know." section heading | AppHeadline variant="italic" as="h2" |
| 118 / 129 / 142 | `span` | `ty-next__num annotation` | "[01] / [02] / [03]" step numbers | AppCaption variant="default" |
| 136 | `NuxtLink` | `label-caps ty-next__link` | "Read today's horoscope →" content link | keep inline (content nav link) |
| 159 | `p` | `annotation` | Refund policy note "14 days, no questions asked…" | AppCaption variant="default" |
| (font-serif ×2) | `span` | `ty-confirm__value font-serif` or similar | Email/date confirmation values | AppSubhead variant="default" |

---

### augur/app/pages/preview.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 11 | `p` | `loading-status label-caps` | "Crafting your reading…" loading status | AppEyebrow |
| 22 | `p` | `loading-subtext annotation` | "Computing across four traditions" loading subtext | AppCaption variant="default" |
| 29 | `p` | `label-caps` + inline style | "Something went wrong" error label | AppEyebrow |
| 30 | `h2` | `font-display-italic preview-error__msg` | "We couldn't generate your reading." error heading | AppHeadline variant="italic" as="h2" |
| 43 | `span` | `label-caps preview-header__meta` | "Your Reading" header meta label | AppEyebrow |
| 49 | `p` | `label-caps report-header__eyebrow` | "Natal Reading · {Name}" eyebrow | AppEyebrow |
| 50 | `h1` | `report-header__title font-display-italic` | Archetype name as page title | AppHeadline variant="italic" as="h1" |
| 60–65 | `span` ×3 | `annotation` | "☉ Sun in X · ☽ Moon in X · ↑ Rising X" planetary data | AppCaption variant="default" |
| 61 / 64 | `span` | `annotation report-header__sep` | "·" separator | keep inline (punctuation) |
| 68 | `p` | `annotation report-header__element` | Element description line | AppCaption variant="default" |
| 72 | `span` | `report-trait label-caps` | Power trait chip (×N, v-for) | AppEyebrow |
| 87 | `p` | `label-caps unlock-meter__label` | "Your reading is 14% revealed" meter label | AppEyebrow |
| 94 | `p` | `annotation report-receipt` | Receipt/meta description text | AppCaption variant="default" |
| 101 | `p` | `annotation report-urgency` | "Your chart is calculated against today's…" urgency note | AppCaption variant="default" |
| 107 | `span` | `label-caps locked-sections__label` | "Still locked in your X reading" locked label | AppEyebrow |
| 110–115 | `li` ×6 | `annotation locked-sections__item` | Locked section names ("Your 2026 Destiny Forecast"…) | AppCaption variant="default" |
| 121 | `p` | `annotation preview-tp-label` | "Rated Excellent by our readers" | AppCaption variant="default" |
| 131 | `p` | `annotation paywall__sub` | Paywall subtitle | AppCaption variant="default" |
| 138 | `button` | `paywall__promo-toggle annotation` | "Have a promo code?" toggle | keep inline (interactive toggle) |
| 159 | `button` | `paywall__promo-apply label-caps` | "Apply" promo code button | keep inline (interactive button) |
| 166 / 169 | `p` | `paywall__promo-msg paywall__promo-msg--error annotation` | Promo validation error/success messages | AppCaption variant="default" |
| 177 | `label` | `label-caps paywall__email-label` | "Where should we send…" email label | keep inline (form label) |
| 213 | `div` | `paywall__guarantee annotation` | Guarantee badge/text | AppCaption variant="default" |
| 217–218 | `p` ×2 | `annotation paywall__trust-*` | "One-time / Secured by Stripe" trust notes | AppCaption variant="fine" |
| 225 | `label` | `label-caps paywall__email-label` | Email label (second paywall section) | keep inline (form label) |
| 246 | `p` | `paywall__promo-msg paywall__promo-msg--error annotation` | Promo error (promo section) | AppCaption variant="default" |
| 252 / 254 | `NuxtLink` ×2 | `preview-footer__link annotation` | "Privacy Policy / Terms of Service" footer links | keep inline (footer nav links) |
| 253 | `span` | `annotation preview-footer__sep` | "·" separator | keep inline (punctuation) |
| 256 | `p` | `preview-footer__crisis annotation` | Crisis line footer | AppCaption variant="fine" |

---

### augur/app/pages/privacy.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `p` | `label-caps legal-masthead__eyebrow` | "Omenora" brand eyebrow on legal page | AppEyebrow |
| 7 | `h1` | `legal-masthead__headline font-display-italic` | "Privacy Policy" page title | AppHeadline variant="italic" as="h1" |
| 8 | `p` | `annotation legal-masthead__date` | "Last Updated: April 20, 2026…" date line | AppCaption variant="fine" |
| 14 | `p` | `label-caps toc-label` | "Contents" table of contents label | AppEyebrow |
| 513 | `NuxtLink` | `footer-legal-link label-caps` | "Terms of Service" footer link | keep inline (footer nav link) |
| 515 | `NuxtLink` | `footer-legal-link label-caps` | "← Return to Home" footer link | keep inline (footer nav link) |

---

### augur/app/pages/refund-policy.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `p` | `label-caps legal-masthead__eyebrow` | "Omenora" brand eyebrow | AppEyebrow |
| 7 | `h1` | `legal-masthead__headline font-display-italic` | "Refund Policy" page title | AppHeadline variant="italic" as="h1" |
| 8 | `p` | `annotation legal-masthead__date` | "Last Updated: May 19, 2026" date line | AppCaption variant="fine" |
| 14 | `p` | `label-caps toc-label` | "Contents" table of contents label | AppEyebrow |
| 77 | `NuxtLink` | `footer-legal-link label-caps` | "Terms of Service" footer link | keep inline (footer nav link) |
| 79 | `NuxtLink` | `footer-legal-link label-caps` | "Privacy Policy" footer link | keep inline (footer nav link) |
| 81 | `NuxtLink` | `footer-legal-link label-caps` | "← Return to Home" footer link | keep inline (footer nav link) |

---

### augur/app/pages/report.vue

> Largest file: 43 `label-caps`, 4 `font-display-italic`, 31 `font-serif`, 13 `font-serif-italic`, 53 `annotation`.

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 5 | `p` | `rload-eyebrow label-caps` | "Omenora" loading eyebrow | AppEyebrow |
| 6 | `p` | `rload-msg font-serif-italic` | "Crafting your destiny reading…" loading message | AppSubhead variant="italic" |
| 17 | `p` | `label-caps report-state__eyebrow` | "Something went wrong" error state eyebrow | AppEyebrow |
| 18 | `h2` | `report-state__heading font-display-italic` | Error state heading | AppHeadline variant="italic" as="h2" |
| 34 | `p` | `label-caps report-state__eyebrow` | "Forecast complete" ready state eyebrow | AppEyebrow |
| 35 | `h2` | `report-state__heading font-display-italic` | "Your destiny reading is ready." heading | AppHeadline variant="italic" as="h2" |
| 57 | `NuxtLink` | `report-account-link label-caps` | "My Account" nav link in report header | keep inline (nav link) |
| 60 | `button` | `label-caps report-export-btn` | "Export" action button | keep inline (interactive button) |
| 74 | `p` | `label-caps report-masthead__eyebrow` | "Natal Reading · {Archetype}" masthead eyebrow | AppEyebrow |
| 78 | `h1` | `report-masthead__name font-display-italic` | User name as report headline | AppHeadline variant="italic" as="h1" |
| 126 | `p` | `label-caps unlock-notice__title` | "Unlock your full reading" upsell title | AppEyebrow |
| 141 | `p` | `label-caps report-section__tradition` | "Full Birth Chart" tradition section label | AppEyebrow |
| 142 | `h2` | `report-section__heading font-serif` | Birth chart section heading | AppSubhead variant="strong" as="h2" |
| 149–165 | `p` ×5 | `label-caps bc-sign-cell__label` | "Rising / Sun / Moon / Planet / Power House" labels | AppEyebrow |
| 150–166 | `p` ×5 | `bc-sign-cell__value font-serif` | Sign/planet values | AppSubhead variant="default" |
| 171 | `p` | `label-caps bc-forecast-box__label` | "Planetary Forecast" box label | AppEyebrow |
| 172 | `p` | `bc-forecast-box__text font-serif-italic` | Forecast summary italic text | AppSubhead variant="italic" |
| 180 | `p` | `label-caps upsell-inline__title` | "✦ Birth chart included / unlocked" upsell notice | AppEyebrow |
| 199 | `p` | `label-caps report-section__tradition` | Section tradition label (archetype section) | AppEyebrow |
| 202 | `h2` | `report-section__heading font-serif` | Archetype section heading | AppSubhead variant="strong" as="h2" |
| 210 | `p` | `affirmation-block__text font-serif-italic` | Archetype affirmation quote | AppSubhead variant="italic" |
| 225 | `p` | `label-caps upsell-section__eyebrow` | "What's next" upsell section eyebrow | AppEyebrow |
| 226 | `h3` | `upsell-section__heading font-serif-italic` | Upsell section h3 heading | AppSubhead variant="italic" as="h3" |
| 249 | `p` | `label-caps report-section__tradition` | "Vedic Reading" tradition label | AppEyebrow |
| 250 | `h2` | `report-section__heading font-serif` | Vedic section heading | AppSubhead variant="strong" as="h2" |
| 257–261 | `p` ×2 | `label-caps regional-pill__label` | "Nakshatra / Ruling Planet" pill labels | AppEyebrow |
| 258–262 | `p` ×2 | `regional-pill__value font-serif` | Pill value text | AppSubhead variant="default" |
| 267 | `p` | `label-caps regional-highlight__label` | "Karmic Mission" highlight label | AppEyebrow |
| 268 | `p` | `regional-highlight__text font-serif-italic` | Karmic mission italic text | AppSubhead variant="italic" |
| 282 | `p` | `label-caps report-section__tradition` | "Bazi Reading" tradition label | AppEyebrow |
| 283 | `h2` | `report-section__heading font-serif` | Bazi section heading | AppSubhead variant="strong" as="h2" |
| 290–294 | `p` ×2 | `label-caps regional-pill__label` | "Day Master / Dominant Element" labels | AppEyebrow |
| 291–295 | `p` ×2 | `regional-pill__value font-serif` | Pill values | AppSubhead variant="default" |
| 300 | `p` | `label-caps regional-highlight__label` | "Wealth & Luck 2026" label | AppEyebrow |
| 301 | `p` | `regional-highlight__text font-serif-italic` | Wealth luck italic text | AppSubhead variant="italic" |
| 315 | `p` | `label-caps report-section__tradition` | "Tarot Reading" tradition label | AppEyebrow |
| 316 | `h2` | `report-section__heading font-serif` | Tarot section heading (Soul Card name) | AppSubhead variant="strong" as="h2" |
| 322–331 | `p` ×4 | `regional-highlight__text font-serif-italic` | Tarot italic highlight texts | AppSubhead variant="italic" |
| 326 | `p` | `label-caps regional-highlight__label` | "Love Destiny" label | AppEyebrow |
| 330 | `p` | `label-caps regional-highlight__label` | "Blessing" label | AppEyebrow |
| 350 | `p` | `label-caps tradition-switcher__label` | "Change tradition" switcher label | AppEyebrow |
| 351 | `p` | `annotation tradition-switcher__sub` | Switcher subtitle | AppCaption variant="default" |
| 367 | `span` | `tradition-opt-num annotation` | Tradition option number | AppCaption variant="default" |
| 370 | `span` | `tradition-opt-name font-serif` | Tradition name text | AppSubhead variant="default" |
| 371 | `span` | `annotation tradition-opt-sub` | Tradition option subtitle | AppCaption variant="default" |
| 373–375 | `span` ×3 | `tradition-opt-tag * label-caps` | "Current / Free" option tags | keep inline (tag badge — specialized) |
| 383 | `p` | `annotation tradition-loading__text` | "Generating…" loading text | AppCaption variant="default" |
| 389 | `p` | `label-caps tradition-success__text` | "Tradition unlocked" success text | AppEyebrow |
| 395 | `span` | `annotation report-section__num` | "◈" section ornament | keep inline (decorative glyph) |
| 397 | `p` | `label-caps report-section__tradition` | "YOUR 2026 DESTINY CALENDAR" section label | AppEyebrow |
| 398 | `h2` | `report-section__heading font-serif` | Calendar section heading (overallTheme) | AppSubhead variant="strong" as="h2" |
| 404–405 | `span` × N | `cal-peak-chip label-caps` / `cal-caution-chip label-caps` | Month chip labels (v-for) | keep inline (chip badges) |
| 417 | `p` | `annotation month-card__theme` | Month theme text | AppCaption variant="default" |
| 420 | `span` | `annotation month-card__energy-label` | "Energy" label | AppCaption variant="default" |
| 427–430 | `p` ×4 | `month-card__insight annotation` | Monthly insight lines | AppCaption variant="default" |
| 432 | `p` | `annotation month-card__lucky` | "Lucky days: …" line | AppCaption variant="default" |
| 440 | `p` | `annotation regional-loading__text` | Calendar generating loading text | AppCaption variant="default" |
| 446 | `span` | `annotation report-section__num` | "◎" section ornament | keep inline (decorative glyph) |
| 448 | `p` | `label-caps report-section__tradition` | "Compatibility Reading" section label | AppEyebrow |
| 449 | `h2` | `report-section__heading font-serif` | Compat section heading | AppSubhead variant="strong" as="h2" |
| 454 | `p` | `annotation report-section__para` | "Enter details…" description | AppCaption variant="default" |
| 459 | `p` | `label-caps compat-result__score-label` | "Compatibility Score" label | AppEyebrow |
| 460 | `p` | `compat-result__score font-serif` | Score number "87%" | AppSubhead variant="default" |
| 461 | `p` | `annotation compat-result__title` | Compat title text | AppCaption variant="default" |
| 464 | `p` | `label-caps compat-result__section-title` | Section title within compat result | AppEyebrow |
| 489 | `p` | `label-caps upsell-section__eyebrow` | "Premium" upsell eyebrow | AppEyebrow |
| 490 | `h3` | `upsell-section__heading font-serif-italic` | Upsell heading | AppSubhead variant="italic" as="h3" |
| 491 | `p` | `annotation upsell-section__sub` | Upsell subtitle | AppCaption variant="default" |
| 495 | `p` | `annotation upsell-section__founding-sub` | Founding upsell subtitle | AppCaption variant="default" |
| 509 | `p` | `label-caps upsell-section__eyebrow` | "Daily forecast" upsell eyebrow | AppEyebrow |
| 510 | `h3` | `upsell-section__heading font-serif-italic` | Daily upsell heading | AppSubhead variant="italic" as="h3" |
| 511 | `p` | `annotation upsell-section__sub` | Daily upsell subtitle | AppCaption variant="default" |
| 514 | `p` | `annotation upsell-section__trial-label` | "Free 7 days, then" label | AppCaption variant="fine" |
| 515 | `span` | `upsell-section__price font-serif` | "$6.99/mo" price | AppSubhead variant="default" |
| 519–521 | `p` ×3 | `annotation upsell-feature` | Feature bullet lines "✦ Tailored to…" | AppCaption variant="default" |
| 526 | `p` | `annotation upsell-section__note` | "Cancel anytime · No charge…" fine print | AppCaption variant="fine" |
| 535 | `span` | `annotation report-section__num` | "◇" section ornament | keep inline (decorative glyph) |
| 537 | `p` | `label-caps report-section__tradition` | "Export" section label | AppEyebrow |
| 538 | `h2` | `report-section__heading font-serif` | Share/export section heading | AppSubhead variant="strong" as="h2" |
| 543 | `p` | `annotation report-section__para` | "Share your destiny reading…" description | AppCaption variant="default" |
| 547 | `p` | `label-caps share-card__archetype` | Archetype name on share card | AppEyebrow |
| 549 | `span` | `share-card__trait annotation` | Power trait chips on share card (v-for) | AppCaption variant="default" |
| 551 | `p` | `annotation share-card__domain` | "omenora.com" domain on share card | AppCaption variant="fine" |
| 562 | `p` | `share-error annotation` | Card download error message | AppCaption variant="default" |
| 582 | `h2` | `font-display-italic report-footer-cta__headline` | Footer CTA headline | AppHeadline variant="italic" as="h2" |
| 607 | `p` | `report-footer-crisis annotation` | Crisis line footer | AppCaption variant="fine" |

---

### augur/app/pages/subscribe.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 8 | `p` | `label-caps subscribe-masthead__eyebrow` | "Premium" eyebrow above headline | AppEyebrow |
| 9 | `h1` | `subscribe-masthead__headline font-display-italic` | Subscribe page headline | AppHeadline variant="italic" as="h1" |
| 16 | `span` | `trial-badge__text label-caps` | "7-day free trial" badge label | AppEyebrow |
| 27 | `span` | `plan-price font-serif` | Monthly price "$6.99" | AppSubhead variant="default" |
| 36 | `span` | `plan-price font-serif` | Yearly price "$49.99" | AppSubhead variant="default" |
| 38 | `span` | `plan-savings label-caps` | "Save 40%" savings badge | AppEyebrow |
| 44 | `p` | `includes-heading label-caps` | "What's included" section label | AppEyebrow |

---

### augur/app/pages/subscription.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 5 | `p` | `annotation sub-center-page__text` | "Activating your daily insights…" loading | AppCaption variant="default" |
| 10 | `p` | `label-caps sub-center-page__text` + inline style | "Something went wrong." error label | AppEyebrow |
| 12 | `button` | `sub-return-btn label-caps` | "Return to report" error action button | keep inline (interactive button) |
| 22 | `p` | `label-caps sub-success__eyebrow` | "Subscription confirmed" success eyebrow | AppEyebrow |
| 23 | `h1` | `sub-success__headline font-display-italic` | "You're subscribed." success headline | AppHeadline variant="italic" as="h1" |
| 28 | `p` | `label-caps sub-expect-box__label` | "What happens next" box label | AppEyebrow |

---

### augur/app/pages/terms.vue

| Line | Element | Classes (composed) | Context | Disposition |
|------|---------|---------------------|---------|-------------|
| 6 | `p` | `label-caps legal-masthead__eyebrow` | "Omenora" brand eyebrow | AppEyebrow |
| 7 | `h1` | `legal-masthead__headline font-display-italic` | "Terms of Service" page title | AppHeadline variant="italic" as="h1" |
| 8 | `p` | `annotation legal-masthead__date` | "Last Updated: April 20, 2026…" date | AppCaption variant="fine" |
| 18 | `p` | `label-caps toc-label` | "Contents" table of contents label | AppEyebrow |
| 338 | `NuxtLink` | `footer-legal-link label-caps` | "Privacy Policy" footer link | keep inline (footer nav link) |
| 340 | `NuxtLink` | `footer-legal-link label-caps` | "← Return to Home" footer link | keep inline (footer nav link) |

---

## Files by Complexity (for P2.3c Sub-Prompt Batching)

Counts include ALL utility classes: `label-caps`, `font-display-italic`, `font-display`, `font-serif`, `font-serif-italic`, `annotation`, `pull-quote`.  
Columns show only the six primary target classes (font-serif-italic tracked separately as a discovered class).

| File | label-caps | font-disp-italic | font-serif | font-serif-italic | annotation | pull-quote | **Total** |
|------|:----------:|:----------------:|:----------:|:-----------------:|:----------:|:----------:|:---------:|
| `report.vue` | 43 | 4 | 31 | 13 | 53 | 0 | **144** |
| `compatibility.vue` | 37 | 10 | 15 | 0 | 34 | 0 | **96** |
| `preview.vue` | 10 | 2 | 1 | 0 | 29 | 0 | **42** |
| `daily.vue` | 26 | 2 | 7 | 2 | 20 | 7 | **64** |
| `account.vue` | 25 | 5 | 10 | 0 | 4 | 0 | **44** |
| `compatibility-quiz.vue` | 15 | 3 | 3 | 0 | 13 | 0 | **34** |
| `analysis.vue` | 11 | 1 | 3 | 0 | 8 | 0 | **23** |
| `founding/index.vue` | 10 | 5 | 3 | 0 | 2 | 0 | **20** |
| `compatibility-quiz-v2.vue` | 6 | 1 | 0 | 0 | 5 | 0 | **12** |
| `founding/thank-you.vue` | 5 | 4 | 2 | 0 | 8 | 0 | **19** |
| `subscribe.vue` | 4 | 1 | 2 | 0 | 0 | 0 | **7** |
| `subscription.vue` | 4 | 1 | 0 | 0 | 1 | 0 | **6** |
| `terms.vue` | 4 | 1 | 0 | 0 | 1 | 0 | **6** |
| `refund-policy.vue` | 5 | 1 | 0 | 0 | 1 | 0 | **7** |
| `privacy.vue` | 4 | 1 | 0 | 0 | 1 | 0 | **6** |
| `calendar.vue` | 2 | 1 | 0 | 0 | 0 | 0 | **3** |
| `error.vue` | 1 | 1 | 0 | 0 | 0 | 0 | **2** |
| `AppHeader.vue` | 10 | 0 | 0 | 0 | 0 | 0 | **10** (keep inline) |
| `AppShell.vue` | 0 | 0 | 0 | 0 | 12 | 0 | **12** (mostly keep inline) |
| `BackButton.vue` | 1 | 0 | 0 | 0 | 0 | 0 | **1** (keep inline) |
| `PlacesAutocomplete.vue` | 1 | 0 | 0 | 0 | 1 | 0 | **2** (keep inline) |

> **Note:** `CTAButton.vue` and `EditorialRule.vue` have internal usages — these are atom internals and are explicitly excluded from replacement scope.

---

## Recommended P2.3c Sub-Prompt Grouping

Grouping strategy: keep each sub-prompt under ~50 total swaps. Smallest/simpler files first to build momentum; largest files last with full context.

### P2.3c1 — Legal + Small Pages (trivial, ~30 swaps total)
Files: `error.vue`, `calendar.vue`, `subscription.vue`, `subscribe.vue`, `terms.vue`, `privacy.vue`, `refund-policy.vue`  
Total target swaps: ~37 | Complexity: LOW  
Rationale: These files have 1–7 utility class usages each, mostly straightforward eyebrow+headline pairs. Fast wins, establish the swap pattern.

### P2.3c2 — Founding Pages (medium, ~39 swaps)
Files: `founding/index.vue`, `founding/thank-you.vue`  
Total target swaps: ~39 | Complexity: MEDIUM  
Rationale: Clean eyebrow/headline/caption patterns, already touched in P2.3b. Familiar files.

### P2.3c3 — Quiz Pair + Analysis (medium, ~69 swaps)
Files: `analysis.vue`, `compatibility-quiz.vue`, `compatibility-quiz-v2.vue`  
Total target swaps: ~69 | Complexity: MEDIUM  
Rationale: Quiz flows with step labels, form labels (keep inline), and annotation hints. Form label `keep inline` decisions are clear.

### P2.3c4 — Account + Preview (medium-high, ~86 swaps)
Files: `account.vue`, `preview.vue`  
Total target swaps: ~86 | Complexity: MEDIUM-HIGH  
Rationale: Both have complex interactive UI elements; careful keep-inline discipline required for buttons/toggles.

### P2.3c5 — Daily (high, ~64 swaps)
Files: `daily.vue`  
Total target swaps: ~64 | Complexity: HIGH  
Rationale: Dual-tab structure (sign + archetype), repeated patterns, `font-serif-italic` occurrences. Isolated to one file.

### P2.3c6 — Compatibility (very high, ~96 swaps)
Files: `compatibility.vue`  
Total target swaps: ~96 | Complexity: VERY HIGH  
Rationale: Largest non-report file. Multiple view states. Handle alone.

### P2.3c7 — Report (critical, ~144 swaps)
Files: `report.vue`  
Total target swaps: ~144 | Complexity: CRITICAL  
Rationale: Largest file in codebase. Multiple tradition sections, upsell blocks, share card, calendar section. Must be executed with extreme care.

---

## Open Questions / Ambiguous Cases

These require human reviewer decision before P2.3c1 begins:

### OQ-1: `.font-serif-italic` — Undocumented Class
**Status: REQUIRES DECISION**  
The class `.font-serif-italic` appears 13 times across `report.vue` (11×), `daily.vue` (2×). It is NOT listed in the six target utility classes in the spec. Usages include:
- Affirmation/reflection italicized quotes (body-level italic text)
- Loading messages (`rload-msg`)
- `h3`/`h2` headings styled italic

**Proposed mapping:** `AppSubhead variant="italic"` — but this needs confirmation.  
**Alternative:** Treat as out-of-scope for P2.3c (only the six listed classes), address in a follow-up P2.3d pass.

### OQ-2: `.font-display` (non-italic, 1 occurrence)
**File:** `compatibility-quiz.vue:180`  
**Usage:** `<div class="compat-dual-reveal__sep font-display">×</div>`  
This is a decorative "×" glyph separator between two revealed birth dates — not a heading. Using `AppHeadline` here would be semantically wrong. It uses the display font purely for the large decorative glyph.  
**Proposed disposition:** `keep inline` — this is a stylistic/decorative div, not a semantic heading.

### OQ-3: `font-serif reading-sign-name` on `<h2>` (daily.vue lines 59, 90, 217, 247)
These are `<h2>` elements using `font-serif` for sign/archetype display names (e.g. "Aries", "The Phoenix"). They function as section-level headings within a reading view, not as subheads below another headline.  
**Proposed disposition:** `AppSubhead variant="strong" as="h2"` — but reviewer should confirm whether these deserve `AppHeadline variant="upright" as="h2"` instead.

### OQ-4: `compat-loading__msg font-display-italic` (compatibility-quiz.vue:42)
This is a `<p>` element (not an `h*` tag) containing an animated loading message. Semantically it's a paragraph, but styled with the display italic font.  
**Proposed disposition:** `AppHeadline variant="italic" as="h2"` — OR keep as `<p>` with `variant` only and no `as` prop if AppHeadline renders as a `<p>` by default. Needs clarification on AppHeadline's default tag.

### OQ-5: `label-caps` on `<span>` decorative ornament glyphs
Multiple instances across files: `<span class="report-section__num label-caps">◈</span>` (report.vue), `<span class="label-caps">❖</span>` (compatibility.vue:115). These are decorative Unicode glyphs using label-caps for font sizing/tracking.  
**Proposed disposition:** `keep inline` — these are decorative, not semantic labels.

### OQ-6: AppShell.vue copyright line (line 43)
`<span class="annotation">All rights reserved</span>` — this is in a specialized shell component. Though it could be `AppCaption`, it might be cleaner to leave it inline given the surrounding footer link text uses `keep inline`.  
**Proposed disposition:** Could go either way. Noted for reviewer.

### OQ-7: `account.vue` font-serif exact lines
The 10 `font-serif` occurrences in `account.vue` were counted but not all exact lines were captured in the grep output. The P2.3c4 executor must grep those specifically before editing.  
**Action needed:** P2.3c4 prompt should include an explicit grep pass on account.vue font-serif before editing.

---

## Out of Scope (for awareness)

- **`augur/app/pages/index.vue`** — All utility class usages deferred to P5 rebuild
- **Server-side renderers** — `compat-card-renderer.ts`, `generate-report-pdf.post.ts`, `generate-card.post.ts` use hardcoded font styles, separate phase
- **`augur/app/components/AppHeader.vue`** — Specialized navigation shell, all `label-caps` are nav chrome, keep inline
- **`augur/app/components/AppShell.vue`** — Footer nav links keep inline; copyright `annotation` is borderline (OQ-6)
- **`augur/app/components/BackButton.vue`** — Interactive button, keep inline
- **`augur/app/components/CTAButton.vue`** — Atom internals, do not touch
- **`augur/app/components/EditorialRule.vue`** — Atom internals, do not touch
- **`augur/app/components/PlacesAutocomplete.vue`** — Specialized widget, keep inline
- **`editorial.css` `:root`** — Do not modify
