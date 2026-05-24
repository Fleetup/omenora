# POLISHED SANDBOX AUDIT — B1.2.8
**Date:** May 24, 2026  
**HEAD:** 956a7bec49168400ffda35fa2b5ec2f0edcdbe00  
**Branch:** feature/b1-pricing-alignment

---

## §1. AUDIT METHODOLOGY

**Files read in full (line-by-line):**
- `augur/app/pages/sandbox/redesign-home.vue` — 2155 lines
- `augur/OMENORA_DESIGN_SYSTEM.md` — 755 lines

**HEAD SHA confirmed:** 956a7bec (B1.2.7 — docs: sandbox-review revisions to spec)

**Discipline:** Every claim in §4, §5, §6 cites a file:line range from the actual file contents read above. No claims from memory of prior audits or screenshots.

---

## §2. INVENTORY OF SANDBOX PATTERNS

### Layout patterns

| Pattern | Markup lines | CSS lines | What it does | Spec match |
|---|---|---|---|---|
| `band` | 45–57, 149–165, 196–210, etc. | 1444–1449 | Base section wrapper, top border + vertical padding | Yes — §5 section transitions |
| `band--page` | 49, 154, 253, 397, 496 | 1448 | Page-level background (`--omn-bg-page`) | Yes — §5 |
| `band--primary` | 200, 316, 464 | 1449 | Primary surface background (`--omn-bg-primary`) | Yes — §5 |
| `band--diag` | 49, 154, 200, 253, 316, 397, 496 | 1452–1570 | Opts a band into diagonal full-bleed atmospheric bg image system | **MISSING from spec** — §6 below |
| `container` | 59, 164, 210, 263, 326, 407, 467, 506, 544, 573 | 1176–1185 | Width-capped, edge-padded column wrapper | Partial — spec has `--width-*` tokens but not `.container` class rules |
| `container--narrow` | 407, 506 | 1184 | 880px max-width variant | Partial — matches `--width-content` (880px) conceptually |
| `container--prose` | 467 | 1185 | 720px max-width variant | Partial — spec `--width-prose` is 640px; sandbox uses **720px** (discrepancy) |
| `hero__content` | 59–145 | 1321–1335 | Flex column, vertically centred, max-width 640px for child elements | Yes — P-01 |
| `hero__cta-row` | 122–130 | 1377–1382 | Flex row wrapping primary + ghost CTA | Yes — P-01 optional secondary CTA |
| `lede` | 165, 211, 264, 327, 468 | 1659–1660 | Section intro block, max-width 720px | Yes — P-02 |
| `lede--narrow` | 264, 327 | 1660 | Variant — removes left margin offset | Partial — not explicitly named in spec |
| `text-block` | 178, 273, 290 | 1686–1691 | Flow text column below lede, max-width 640px | Partial — used in P-05 but `.text-block` class not named |
| `centered` | 408, 507 | 1934–1943 | Center-aligned statement container (P-04) | Yes — P-04 |
| `grid--3` | 222 | 1721–1723 | 3-col desktop / 2-col tablet / 1-col mobile card grid | Yes — P-03 |
| `traditions-spread` | 272 | 1694–1702 | 2-col grid for traditions text blocks | Partial — P-05 mentions 1fr\|1fr but `traditions-spread` not named |
| `proof-grid` | 336 | 1843–1856 | Asymmetric 7fr\|5fr quote grid | Yes — P-07 (1 hero + supporting) |
| `paywall` | 421 | 1946–1951 | Paywall card block | Yes — P-06 |
| `paywall__rows` / `paywall__row` / `paywall__k` / `paywall__v` | 422–438 | 1952–1966 | Receipt-style KV rows | Yes — P-06, AppKVTable atom |
| `paywall__price` / `paywall__price-k` / `paywall__price-v` | 441–444 | 1968–1989 | Price display row | Yes — P-06 |
| `mobile-cta` | 532–540 | 1126–1173 | Fixed bottom mobile CTA rail, auto-hides when paywall visible | Yes — §5 sticky bottom CTA |
| `footer__inner` / `footer__cols` / `footer__col` | 543–577 | 2037–2103 | Footer layout | Yes — P-10 |
| `counters` / `counter` | 365–378 | 1905–1931 | Counter value + label row | Yes — P-07 |

### Atom / micro-patterns

| Pattern | Markup lines | CSS lines | What it does | Spec match |
|---|---|---|---|---|
| `vol` | 62–68 | 1244–1251 | Vol. 001 · MMXXVI notation, mono caps tertiary | Yes — P-01 pre-headline stack level 1 |
| `eyebrow` | 72–79, 166, 179, 212, etc. | 1253–1263 | Bronze mono caps eyebrow with rule prefix | Yes — P-01, P-02 |
| `eyebrow__rule` | 77, 166, etc. | 1266–1272 | 24px inline hairline rule in eyebrow | Yes |
| `eyebrow--quiet` | 179, 274, 291 | 1264 | Dimmed `--omn-accent-quiet` eyebrow variant | Not named in spec |
| `eyebrow--bracketed` | 409, 508 | 1265 | Variant for P-04 centered eyebrow (rules both sides) | **MISSING from spec** — §6 below |
| `display` / `display__line` / `display__line--quiet` | 81–108 | 1337–1366 | Hero headline system | Yes — P-01 |
| `display__em` / `display__em--lit` | 98, 1349–1366 | 1349–1366 | Variable-font weight pulse + bronze underline draw on mount | Yes — §7 motion moment 3 |
| `head` / `head--md` / `head--lg` / `head--xl` | 167–169, 180, 213, etc. | 1274–1286 | Section head with clamp-based fluid scale | Yes — P-02 heads |
| `head__em` | 168, 183, 213, etc. | 1286 | Weight-500 emphasis span inside head | Yes |
| `subhead` | 112–120 | 1368–1375 | Hero subhead 19px secondary | Yes — P-01 |
| `body` | 184–189, 278–282, 295–299 | 1288–1295 | Body paragraph 17px secondary | Yes |
| `lede__body` | 171–175, 216–219 | 1661–1668 | Lede paragraph with drop-cap first-letter CSS rule | Partial — drop cap is in spec (P-02 / AppDropCap) but implemented via CSS `::first-letter` not a component |
| `inline-link` | 190 | 1297–1307 | Underlined accent-colored inline text link | Not explicitly named in spec |
| `trust` / `trust__dot` / `trust__dot--sage` / `trust__sep` | 134–144, 448–454, 519–525 | 1384–1403 | Sage dot + mono label trust row | Yes — AppTrustTag (§4a) |
| `trust--centered` | 519 | 1395 | Centered variant of trust row | Not named in spec |
| `btn` / `btn--cta` / `btn--ghost` / `btn--full` / `btn--inline` | 128–129, 446, 518, 538 | 1409–1441 | Button system | Yes — P-06 CTA, P-01 ghost |
| `wordmark` / `wordmark--sm` | 32, 546 | 1210–1217 | OMENORA wordmark mono caps | Yes — P-10, P-01 nav |
| `card` / `card__watermark` / `card__num` / `card__label` / `card__title` / `card__body` / `card__foot` / `card__meta` / `card__tag` / `card__tag-dot` | 223–243 | 1725–1838 | Full card anatomy | Yes — P-03 |
| `card__sample` | 235 | 1764–1790 | Hover-reveal "Read a sample excerpt →" inline link per card | **MISSING from spec** — §6 below |
| `kvs` / `kvs li` | 283–287, 300–304 | 1703–1717 | Receipt-style KV list in traditions section | Partial — AppKVTable in spec; inline `<ul>` in sandbox |
| `quote` / `quote--hero` / `quote--secondary` | 337–362 | 1858–1899 | Testimonial quote cards | Yes — P-07 |
| `quote__glyph` / `quote__body` / `quote__body--hero` / `quote__rule` / `quote__cite` / `quote__name` / `quote__ctx` | 338–344, 354–360 | 1874–1903 | Quote anatomy | Yes — P-07 |
| `faq` / `faq__item` / `faq__q` / `faq__chev` / `faq__a` | 473–487 | 2003–2035 | FAQ disclosure system | Yes — P-08 |

### Edge / chrome patterns

| Pattern | Markup lines | CSS lines | What it does | Spec match |
|---|---|---|---|---|
| `nav` / `nav__inner` / `nav__links` / `nav__cta` | 30–41 | 1187–1241 | Sticky nav with glass backdrop | Yes — P-01, §8 exception |
| `section-rail` / `section-rail__no` / `section-rail__sep` / `section-rail__name` | 23–27 | 1010–1051 | Fixed left-edge page-level scroll indicator updating per section | **CONFLATED** — see §5 |
| `section-marker` | 163, 209, 262, 325, 406, 466, 505 | 964–988 | Per-section absolute-positioned § NN + name, animates on `is-revealed` | **CONFLATED** — see §5 |
| `section-marked` / `section-marked::before` | 154, 200, 253, 316, 397, 464, 496 | 965–1007 | Section wrapper class; `::before` draws bronze hairline across top on reveal | **MISSING from spec** — §6 below |

### Ambient / atmospheric patterns

| Pattern | Markup lines | CSS lines | What it does | Spec match |
|---|---|---|---|---|
| `grain` | 12 | 914–937 | Fixed full-viewport SVG fractal noise at 10% opacity, animated frame shuffle | **MISSING from spec** — §6 below |
| `scroll-progress` / `scroll-progress__bar` | 13–15 | 939–962 | Fixed right-edge 2px bronze hairline growing with scroll | **MISSING from spec** — §6 below |
| `cursor-dot` | 19 | 1053–1074 | Fixed bronze 16px dot trailing pointer with lerp | **MISSING from spec** — §6 below |
| `band__image` / `band__overlay` | 56–57, 161–162, etc. | 1463–1545 | Absolute background image + multi-stop overlay composited in `band--diag` | **MISSING from spec** — §6 below |

### Interactive patterns

| Pattern | Markup lines | CSS lines | Script lines | What it does | Spec match |
|---|---|---|---|---|---|
| `ticker` / `ticker__track` / `ticker__item` / `ticker__dot` | 383–389 | 1076–1123 | 759–768 | Horizontal CSS marquee of proof-point strings, pauses on hover | **MISSING from spec** — §6 below |
| `faq__chev` rotation | 483 | 2025–2028 | — | Plus rotates 45° (= ×) on `[open]` | Yes — P-08 (B1.2.7) |

### Directives

| Directive | Registration lines | What it does | Spec match |
|---|---|---|---|
| `v-reveal` | 586–606 | IntersectionObserver adds `.is-revealed` class when element enters viewport | Yes — §7 motion moment 2 |
| `v-magnetic` | 610–642 | rAF-driven translate pull toward cursor on mousemove; resets on leave | **MISSING from spec** — §6 below |

### Script-driven behaviours

| Behaviour | Script lines | Spec match |
|---|---|---|
| `emLit` bronze pulse on mount | 653–654 | Yes — §7 motion moment 3 |
| `pageProgress` scroll progress bar driver | 657–675 | **MISSING from spec** |
| `hideMobileCta` IntersectionObserver hide on paywall visible | 678–688 | Yes — §5 sticky mobile CTA |
| Section rail active tracking (IntersectionObserver per `[data-section-no]`) | 692–714 | **CONFLATED** — see §5 |
| Cursor follower lerp | 716–757 | **MISSING from spec** — §6 |
| Counter rollup rAF on mount (simulated) | 770–787 | Yes — §7 motion moment 5 (scroll-triggered; sandbox fires on mount instead of viewport entry) |

---

## §3. SPEC PATTERNS INVENTORY

| Item | Section | Lines |
|---|---|---|
| P-01: Hero (Asymmetric) | §4 | 208–220 |
| P-02: Section Lede | §4 | 222–232 |
| P-03: Three-Card Grid | §4 | 234–245 |
| P-04: Centered Statement | §4 | 247–256 |
| P-05: Side-by-Side (Image \| Text) | §4 | 258–266 |
| P-06: Pricing/Paywall Card | §4 | 268–280 |
| P-07: Social Proof Cluster | §4 | 282–300 |
| P-08: FAQ Disclosure | §4 | 302–313 |
| P-09: Final CTA | §4 | 315–325 |
| P-10: Footer | §4 | 327–336 |
| P-11: Edge Markers | §4 | 338–348 |
| AppPlateFrame atom | §4a | 356–358 |
| AppKVTable atom | §4a | 360–362 |
| AppDropCap atom | §4a | 364–366 |
| AppTrustTag atom | §4a | 368–370 |
| §5 imagery placement | §5 | 433–442 |
| §7 motion stack (Lenis + GSAP) | §7 | 483–487 |
| §7 motion moment 1: hero parallax | §7 | 505–512 |
| §7 motion moment 2: section reveal | §7 | 514–521 |
| §7 motion moment 3: variable font | §7 | 523–527 |
| §7 motion moment 4: micro-interactions | §7 | 529–536 |
| §7 motion moment 5: counter animation | §7 | 538–540 |
| §8 visual anti-patterns (8 items) | §8 | 562–572 |
| §8 layout anti-patterns (8 items) | §8 | 574–583 |
| §8 motion anti-patterns (6 items) | §8 | 585–593 |
| §8 copy anti-patterns (5 items) | §8 | 595–601 |
| §12 lock status | §12 | 658–711 |

---

## §4. DELTA (A) — FABRICATED PATTERNS

Patterns documented in the spec that DO NOT exist in the sandbox file.

### A1. AppDropCap as a component

**Spec location:** §4a, lines 364–366; P-02, line 229  
**Spec claim verbatim:** "AppDropCap — first-letter drop cap rendered in --omn-accent at significantly larger size than the surrounding body."  
**Reality:** The sandbox implements drop cap via a CSS `::first-letter` pseudo-element rule on `.lede__body` (redesign-home.vue lines 1671–1680), not as a Vue component named `AppDropCap`. No `<AppDropCap>` usage anywhere in the template (grep: zero matches for `AppDropCap` in redesign-home.vue).  
**Verification:** `grep -n "AppDropCap" redesign-home.vue` → 0 matches.  
**Recommendation:** Keep in spec as a reserved atom name for B1.3. Add a note that the sandbox implements the same visual effect via CSS `::first-letter` on `.lede__body`, which B1.3 may either wrap in the component or document as the canonical implementation.

### A2. AppPlateFrame as a component (and P-01 right-column image)

**Spec location:** §4a lines 356–358; P-01 line 213 ("Right: anchor frame containing celestial imagery (Plate I notation, 4:5 aspect)")  
**Spec claim verbatim:** "AppPlateFrame — plate-framed image with corner brackets, Plate notation ('Plate I'), and caption."  
**Reality:** No `AppPlateFrame` component, no `plate-frame` class, no `Plate I` notation exists anywhere in redesign-home.vue. The sandbox explicitly retired the plate frame system (comment at line 1405–1406: "Plate frame system retired — image moved to section-diagonal backgrounds"). The P-01 hero is a single-column layout, not a two-column split with a right-side anchor frame.  
**Verification:** `grep -n "plate\|AppPlateFrame\|Plate I" redesign-home.vue` → 0 matches.  
**Recommendation:** Update P-01 spec to reflect the single-column hero with `band--diag` background image. Update §4a AppPlateFrame to note it is a reserved future atom; the sandbox hero uses `band--diag` + `band__image` + `band__overlay` instead.

### A3. P-01 two-column split (1.3fr | 1fr)

**Spec location:** §4, P-01, line 211: "Two-column split: 1.3fr | 1fr (asymmetric, weighting left)"  
**Reality:** The sandbox hero (`hero.band--diag`) is a single-column layout. `.hero__content` is a flex column capped at 640px children (line 1331). No two-column grid. No right-side image panel.  
**Verification:** No `grid-template-columns` in `.hero__content` (lines 1321–1335 contain no such declaration).  
**Recommendation:** Revise P-01 composition to describe the single-column left-weighted text layout with `band--diag` atmospheric background, removing the two-column split.

### A4. P-05: Side-by-Side (Image | Text) — not used as described

**Spec location:** §4, P-05, lines 258–266: "Two-column split: 1fr | 1fr… Image side: plate frame…"  
**Reality:** The traditions section (section 05, lines 247–308) uses a `traditions-spread` 2-col grid with two `text-block` elements — no plate-frame image. There is no P-05 implementation with a plate-framed image on any section.  
**Verification:** `grep -n "traditions-spread" redesign-home.vue` shows lines 272, 1694. No `plate` class adjacent.  
**Recommendation:** The sandbox replaces P-05 image|text with a `traditions-spread` text|text layout. Spec should either add a text-only variant of P-05 or document `traditions-spread` as a P-05 variant.

### A5. Hero parallax (§7 motion moment 1)

**Spec location:** §7, lines 505–512: "Three depth layers: Background (0.6x), Anchor frame (0.85x), Type and CTA (1.0x)"  
**Reality:** No Lenis, no GSAP, no parallax implementation anywhere in redesign-home.vue. The sandbox uses `motion-v` for entrance animations only (lines 60–144). The `band__image` has a CSS `scale(1.02)→scale(1)` transition on `.is-revealed` (lines 1499–1501) — a single subtle entrance zoom, not a scroll-driven parallax.  
**Verification:** `grep -n "ScrollTrigger\|Lenis\|parallax" redesign-home.vue` → 0 matches.  
**Recommendation:** This is expected for a sandbox. Flag for B3 motion phase. §7 motion moment 1 cannot be validated from the sandbox file.

### A6. AppKVTable as a component

**Spec location:** §4a, lines 360–362: "AppKVTable — receipt-style key/value rows…"  
**Reality:** The paywall uses `.paywall__row` / `.paywall__k` / `.paywall__v` classes (lines 422–438, CSS 1952–1966). The traditions section uses `.kvs` `<ul>` (lines 283–304, CSS 1703–1717). Both are inline implementations; no `AppKVTable` component exists.  
**Verification:** `grep -n "AppKVTable" redesign-home.vue` → 0 matches.  
**Recommendation:** Reserved for B1.3 atom build. Note that the sandbox has two distinct KV implementations (`.kvs` for traditions, `.paywall__rows` for paywall) — these may need to share the same atom or remain distinct.

---

## §5. DELTA (B) — CONFLATED PATTERNS

### B1. P-11 "Edge Markers" conflates two distinct patterns with different mechanics

**Spec claim (single pattern):** §4, P-11, lines 338–348:  
> "A rotated mono-caps text element in the left page margin showing the section number and short label (e.g., '01 / ASTROLOGY, COMPUTED'). Renders at small size (--text-xs) in --omn-text-tertiary, rotated 90deg counter-clockwise, positioned absolute-left outside the content column. Hidden below 768px."

**Sandbox reality — two distinct patterns:**

**Pattern 1: `section-marker`** (per-section, absolute-positioned inside each `section-marked` band)  
- Markup: lines 163, 209, 262, 325, 406, 466, 505  
- CSS: lines 964–988  
- Mechanics: `position: absolute`, `top: clamp(24px, 4vw, 56px)`, `left: clamp(20px, 5vw, 64px)`. Renders `§ NN` and section name in two stacked `<span>` elements. Animates in with opacity + translateY when its parent `.section-marked` gains `.is-revealed`. Number span is `--omn-accent` (bronze), name is `--omn-text-tertiary`. NOT rotated. Inside the section, not in the page margin.

**Pattern 2: `section-rail`** (page-level, fixed, scroll-driven)  
- Markup: lines 23–27  
- CSS: lines 1010–1051  
- Script: lines 692–714  
- Mechanics: `position: fixed`, `top: 50%`, `left: clamp(20px, 2.4vw, 36px)`, displayed only `@media (min-width: 1024px)`. Shows the currently active section. Contains three sub-elements: `section-rail__no` (bronze number, font-weight 500), `section-rail__sep` (vertical gradient hairline, `height: clamp(40px, 8vh, 88px)`), `section-rail__name` (rotated `writing-mode: vertical-rl` section name). Updated via IntersectionObserver tracking `[data-section-no]` attributes.

**Why they must be split in the spec:**
- `section-marker` is static, inside each section, absolute, always visible when section is revealed, shows `§ NN` format, **NOT rotated**, hidden on mobile via being inside section padding.
- `section-rail` is dynamic, page-global, fixed, shows only the currently active section, has a vertical hairline separator element, section name IS rotated (`writing-mode: vertical-rl`), hidden below **1024px** (not 768px as spec states).
- The spec's P-11 description partially matches `section-rail` (rotated text, fixed left margin, desktop-only) but states 768px breakpoint (sandbox uses 1024px) and describes it as "applied via BaseSection wrapper" (sandbox applies `section-marker` via BaseSection but `section-rail` is a single global `<aside>`).

**Recommendation:** Split P-11 into two named patterns:  
- **P-11a: SectionRail** — fixed page-level scroll indicator (currently described in §4 P-11)  
- **P-11b: SectionMarker** — per-section absolute `§ NN` + name, drawn on reveal via `.section-marked::before` bronze hairline  

Also correct the breakpoint from 768px to 1024px for the rail.

---

## §6. DELTA (C) — MISSING PATTERNS

Patterns the sandbox uses that the spec does not document.

### C1. `band--diag` — diagonal atmospheric background image system

**Sandbox:** Lines 1452–1570 (CSS), 49/154/200/253/316/397/496 (markup)  
**Description:** Sections opt in with `.band--diag` and per-section CSS custom properties `--section-img` and `--section-img-pos` / `--section-img-pos-mobile`. `.band__image` (absolute fill) renders the image clipped via a 168° diagonal `mask-image` gradient. `.band__overlay` (z-index 1) composites vertical + diagonal gradients for text legibility and bronze-tint warmth. `.band--diag::after` (z-index 2) adds a screen-blend bronze glow along the diagonal seam. The system is used on 7 of 8 non-footer sections.  
**Anti-pattern check:** §8 line 567 permits hero background image under scrim/vignette constraints; the sandbox applies `band--diag` to all content sections, not just the hero. This is a **borderline** compliance issue — see §8 audit below.  
**Suggested spec placement:** §5 (Homepage Layout) as a new sub-section "Diagonal Background System" or absorbed into §4 as a new `band--diag` infrastructure pattern.

### C2. `grain` — film grain overlay

**Sandbox:** Lines 912–937 (CSS), line 12 (markup)  
**Description:** Fixed full-viewport `position: fixed` div, `z-index: 200`, `opacity: 0.10`, `mix-blend-mode: overlay`. SVG `feTurbulence` fractalNoise background-image. Animated with `grain-shift` keyframes (8 translate steps over 7s) for living texture. Hidden on `prefers-reduced-motion` via the global `animation: none !important` block (line 2145).  
**Anti-pattern check:** None directly — does not conflict with any §8 item.  
**Suggested spec placement:** §7 Motion Choreography or a new §8-adjacent "Ambient Layers" note.

### C3. `scroll-progress` / `scroll-progress__bar` — right-edge progress hairline

**Sandbox:** Lines 939–962 (CSS), lines 13–15 (markup), lines 657–675 (script)  
**Description:** Fixed 2px-wide bronze gradient hairline on viewport right edge. `scaleY` driven by `pageProgress` ref (0→1 as page scrolls). Transition: `80ms linear`. Background: gradient from `--omn-accent-quiet` to `--omn-accent`.  
**Anti-pattern check:** None.  
**Suggested spec placement:** §7 as a sixth motion moment, or as an ambient infrastructure item.

### C4. `cursor-dot` — bronze lerp cursor follower

**Sandbox:** Lines 1053–1074 (CSS), line 19 (markup), lines 716–757 (script)  
**Description:** Fixed 16px bronze circle, `mix-blend-mode: difference`, trails pointer at lerp factor 0.18. Hidden on `(hover: none)` and `(prefers-reduced-motion: reduce)`. Opacity 0 until mouseenter on document.  
**Anti-pattern check:** §8 Motion line 593: "No cursor-following effects unless they directly serve interaction." The cursor-dot is purely atmospheric — it does not change on interactive elements, does not signal clickability, and does not change state on hover. This is a **borderline violation** of §8.  
**Suggested spec placement:** §8 — either upgrade the exception (document the bronze cursor-dot as permitted ambient chrome) or call it a violation to remove.

### C5. `ticker` — horizontal proof-point marquee

**Sandbox:** Lines 1076–1123 (CSS), lines 382–389 (markup), lines 759–768 (script data)  
**Description:** CSS `animation: ticker-scroll 48s linear infinite` on `.ticker__track`. Masked with left/right fade gradients. `animation-play-state: paused` on hover. Content: 7 proof strings doubled for seamless loop. Placed between Social Proof and Paywall sections (between lines 380 and 391 in template).  
**Anti-pattern check:** None directly. Not a carousel (static content, not interactive). Not autoplay video. Not scroll-jacking.  
**Suggested spec placement:** §4 as a new pattern (P-12: Proof Ticker) or in §5 Homepage Layout sequence as a transitional element.

### C6. `section-marked::before` — bronze top-edge hairline draw

**Sandbox:** Lines 990–1007 (CSS)  
**Description:** `content: ''`, `position: absolute`, `top: 0`, `height: 1px`, full-width bronze gradient (`--omn-accent-quiet → --omn-accent → --omn-accent-quiet → transparent`). `transform: scaleX(0)` at rest; `scaleX(1)` on `.is-revealed`. Transition: `1100ms var(--omn-ease) 100ms`. Applied to all `.section-marked` bands.  
**Anti-pattern check:** None.  
**Suggested spec placement:** Document alongside P-11b `SectionMarker` (see §5 B1 recommendation).

### C7. `card__sample` — hover-reveal excerpt link per card

**Sandbox:** Lines 1764–1790 (CSS), line 235 (markup)  
**Description:** Per-card inline link "Read a sample excerpt →" in `--omn-accent` with `--omn-accent-quiet` underline. `opacity: 0; transform: translateY(6px)` at rest, transitions in on `.card:hover` or `.card:focus-within`. Always visible on `(hover: none)` devices.  
**Anti-pattern check:** None. Not a "Learn More" button — it's a contextual in-card link.  
**Suggested spec placement:** §4 P-03 composition bullet, as an optional card element.

### C8. `v-magnetic` — magnetic CTA pull directive

**Sandbox:** Lines 610–642 (script), lines 128–129 (markup — applied to primary + ghost CTAs in hero only)  
**Description:** Vue directive. On `mousemove`, translates the element toward the cursor at `strength: 0.18` (max ~6px displacement). rAF-driven. Resets on `mouseleave`. Skipped on `(prefers-reduced-motion: reduce)` and `(hover: none)`.  
**Anti-pattern check:** §8 Motion line 593: "No cursor-following effects unless they directly serve interaction." v-magnetic directly serves interaction (applied only to CTA buttons; the pull draws the eye and hand toward the conversion action). This is **clean** — within the spec's stated exception.  
**Suggested spec placement:** §7 Motion Choreography §4 Micro-interactions, or as a named directive in §13.

### C9. `eyebrow--bracketed` variant

**Sandbox:** Lines 409, 508 (markup), line 1265 (CSS: `display: inline-flex` — same as base, no additional rule)  
**Description:** Eyebrow with `<eyebrow__rule />` on both sides (rule prefix AND rule suffix), used in P-04 centered sections. CSS adds nothing beyond `display: inline-flex` (identical to base eyebrow).  
**Anti-pattern check:** None.  
**Suggested spec placement:** §4 P-04 composition or §4a eyebrow atom variants.

### C10. `display__em` variable-font weight pulse

**Sandbox:** Lines 1349–1366 (CSS), line 98 (markup), lines 653–654 (script)  
**Description:** `.display__em` starts at `font-variation-settings: 'wght' 100`. `emLit` ref set to `true` after 900ms timeout on mount (script line 654). `.display__em--lit` transitions to `'wght' 500` over 800ms + draws bronze underline via `::after scaleX(0)→scaleX(1)` over 700ms.  
**Anti-pattern check:** Clean — matches §7 motion moment 3 exactly.  
**Suggested spec placement:** Already partially covered in §7. The bronze underline draw sub-effect is not mentioned in the spec — worth adding as a detail.

### C11. `mobile-cta` hide-when-paywall-visible behaviour

**Sandbox:** Lines 678–688 (script), lines 1126–1173 (CSS)  
**Description:** IntersectionObserver on `#paywall` element. When paywall is intersecting (rootMargin `-30% 0px -10% 0px`), `hideMobileCta` ref sets to true, `.mobile-cta--hidden` class applied (`translateY(110%); opacity: 0`).  
**Anti-pattern check:** None — this is the §5 sticky mobile CTA behaviour already specced.  
**Suggested spec placement:** Already in §5; just the specific `IntersectionObserver` hide mechanic is not described. Document in §5.

### C12. `band--diag::after` bronze seam glow

**Sandbox:** Lines 1549–1570 (CSS)  
**Description:** `::after` pseudo-element on `.band--diag`. 168° linear-gradient, `mix-blend-mode: screen`, `opacity: 0` → `1` on `.is-revealed`. Produces a warm bronze glow band along the diagonal feather seam of the background image.  
**Anti-pattern check:** None.  
**Suggested spec placement:** Document alongside `band--diag` in C1 above.

### C13. `counters` / `.counter` wrapper (distinct from spec's "counter row")

**Sandbox:** Lines 365–378 (markup), lines 1905–1931 (CSS)  
**Description:** Grid layout container (`.counters`) wrapping individual `.counter` blocks with `.counter__value`, `.counter__label`, `.counter__unit`. Grid: 1-col mobile → 3-col ≥768px. `margin-top: 64px`, `border-top` separator above.  
**Anti-pattern check:** None.  
**Suggested spec placement:** §4 P-07 composition detail.

---

## §7. PRICE AUDIT

| Location | Value | Context |
|---|---|---|
| redesign-home.vue line 443 | `$24.99` | `.paywall__price-v` inside paywall card |
| redesign-home.vue line 536 | `$24.99` | `.mobile-cta__price-v` inside mobile sticky CTA |
| redesign-home.vue line 764 | `$24.99` | Ticker item string: "No subscription — one-time $24.99" |
| redesign-home.vue line 822 | `$24` | Testimonial body copy: "I've been doing the same thing for ten years and it took ninety seconds to name it. I paid $24 for the recurring thread part." — **truncated, not $24.99** |

**All three explicit price displays agree at $24.99.** One testimonial quote (line 822) references "$24" colloquially in body copy — this is not a price display but a customer quote; the rounding is natural speech. No action required unless final copy polish demands verbatim accuracy.

---

## §8. ANTI-PATTERN COMPLIANCE

| Anti-pattern (spec §8) | Spec line | Sandbox status | Evidence |
|---|---|---|---|
| No glassmorphism — exception: sticky nav only | 564 | **CLEAN** | Nav uses `backdrop-filter: saturate(140%) blur(14px)` (line 1193). No glassmorphism on cards, paywall, or modals. |
| No 3D floating objects in hero | 565 | CLEAN | No 3D transforms on hero elements. |
| No nebula backgrounds, gradient washes, starfield atmospheres | 566 | CLEAN | Images are warm bronze/charcoal atmospheric photography, not nebula/starfield. |
| No background bleeds on content sections — hero only exception | 567 | **BORDERLINE** | `band--diag` applies a full-bleed atmospheric background image to ALL sections (7 of 8), not hero only. The spec exception (line 567) permits hero only. Sandbox extends this to every section. The scrim/vignette requirement is satisfied by `band__overlay`. The image register (warm bronze/charcoal) is on-brand. The "hero only" constraint is technically violated. |
| No AI purple gradients (violet/indigo/blue) | 568–569 | CLEAN | No purple/violet/blue in any image path or CSS color. |
| No emoji in body copy | 570 | CLEAN | No emoji in any text content. |
| No drop shadows on cards | 571 | CLEAN | Cards use `border: 1px solid var(--omn-border-primary)` only. |
| No rounded corners >4px | 572 | CLEAN | No `border-radius` on cards or paywall. `cursor-dot` uses `border-radius: 50%` (line 1063) — functional, not decorative. `trust__dot` and `card__tag-dot` use `border-radius: 50%` — functional dots, not corner rounding. |
| No testimonial carousels | 576 | CLEAN | Static grid (`.proof-grid`). |
| No "as seen on" press logo strips | 577 | CLEAN | None present. |
| No countdown timers / fake scarcity | 578 | CLEAN | None present. |
| No popups | 579 | CLEAN | None present. |
| No newsletter signup as primary CTA | 580 | CLEAN | No newsletter elements. |
| No "Learn More" buttons to nothing | 581 | CLEAN | Ghost CTA links to `#traditions` (line 129) — a real section. |
| No icon + bullet feature lists | 582 | CLEAN | Features are presented as P-03 cards and P-05-style text blocks. |
| No iPhone-frame product screenshots | 583 | CLEAN | None present. |
| No scroll-jacking | 587 | CLEAN | Native scroll; no `overflow: hidden` on body or forced scroll. |
| No bounce/spring easing | 588 | CLEAN | All transitions use `var(--omn-ease)` = `cubic-bezier(0.2, 0, 0, 1)`. |
| No autoplay video | 589 | CLEAN | No video elements. |
| No plate-framed video | 590 | CLEAN | No video elements. |
| No parallax on text content | 591 | CLEAN | Motion on text is opacity + translateY entrance only (motion-v). |
| No background video loops | 592 | CLEAN | None. |
| No cursor-following effects unless serving interaction | 593 | **BORDERLINE** | `cursor-dot` (line 1053–1074) is purely atmospheric — bronze dot trails all pointer movement regardless of what is under it. Does not change on interactive elements. Borderline: serves brand atmosphere, not direct interaction. `v-magnetic` on CTAs (lines 128–129) is clean — directly serves the conversion action. |
| No "AI-powered" copy | 597 | CLEAN | Not used anywhere in template. |
| No "personalized" misuse | 598 | CLEAN | Not present. |
| No astrology clichés | 599 | CLEAN | No "ancient wisdom" / "mystical" copy. |
| No exclamation marks | 600 | CLEAN | None in body copy or headings. |
| No "Discover/Unlock/Reveal" verbs | 601 | CLEAN | CTAs use "Begin your reading" / "Start your reading" / "Explore compatibility". |

**Summary:** 2 clean violations and 2 borderlines.  
- **Violation (borderline):** `band--diag` on all content sections extends the hero-only background image exception.  
- **Borderline:** `cursor-dot` does not directly serve interaction as required by §8.

---

## §9. TOKEN COMPLIANCE

### Inline `.omn-sandbox` token declarations (lines 844–879)

| Token | Sandbox value | editorial.css value (post-B1.2.5) | Match? |
|---|---|---|---|
| `--omn-bg-page` | `#121214` | `#121214` | ✅ |
| `--omn-bg-primary` | `#252528` | `#252528` | ✅ |
| `--omn-bg-elevated` | `#2F2F33` | `#2F2F33` | ✅ |
| `--omn-bg-interactive` | `#3A3A3F` | `#3A3A3F` | ✅ |
| `--omn-border-subtle` | `#2F2F33` | `#2F2F33` | ✅ |
| `--omn-border-primary` | `#3A3A3F` | `#3A3A3F` | ✅ |
| `--omn-border-emphasis` | `#4A4A50` | `#4A4A50` | ✅ |
| `--omn-text-primary` | `#F2EDE5` | `#F2EDE5` | ✅ |
| `--omn-text-secondary` | `#A8A19A` | `#A8A19A` | ✅ |
| `--omn-text-tertiary` | `#6B655E` | `#6B655E` | ✅ |
| `--omn-accent` | `#A87D4E` | `#A87D4E` | ✅ |
| `--omn-accent-quiet` | `#6E5536` | `#6E5536` | ✅ |
| `--omn-cta` | `#E8763A` | `#E8763A` | ✅ |
| `--omn-cta-hover` | `#FF8856` | `#FF8856` | ✅ |
| `--omn-cta-text` | `#121214` | `#121214` | ✅ |
| `--omn-success` | `#7B9472` | `#7B9472` | ✅ |
| `--omn-font-display` | `'Onest', system-ui, -apple-system, sans-serif` | `'Onest', system-ui, -apple-system, sans-serif` | ✅ |
| `--omn-font-body` | `'Onest', system-ui, -apple-system, sans-serif` | `'Onest', system-ui, -apple-system, sans-serif` | ✅ |
| `--omn-font-mono` | `'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace` | `'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace` | ✅ |
| `--omn-ease` | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(0.2, 0, 0, 1)` | ✅ |

**Tokens in global editorial.css NOT re-declared inline (i.e. sandbox relies on global):**
- `--omn-error` — not declared in sandbox scope; not used in sandbox CSS either ✅
- `--omn-duration-fast`, `--omn-duration-base`, `--omn-duration-slow` — not declared inline; not used in sandbox CSS (sandbox uses hardcoded ms values — see hardcoded values below) ⚠️

**Custom spacing tokens declared inline only (not in editorial.css):**

| Token | Sandbox value (line) | In editorial.css? |
|---|---|---|
| `--space-section` | `clamp(96px, 12vw, 192px)` (875) | **NO — sandbox-only** |
| `--space-block` | `clamp(56px, 7vw, 96px)` (876) | **NO — sandbox-only** |
| `--space-content` | `clamp(32px, 4vw, 56px)` (877) | **NO — sandbox-only** |
| `--space-gap` | `clamp(20px, 2.4vw, 32px)` (878) | **NO — sandbox-only** |
| `--space-edge` | `clamp(20px, 5vw, 64px)` (879) | **NO — sandbox-only** |

These 5 fluid spacing tokens are the sandbox's own abstraction layer — editorial.css has a fixed `--space-*` scale (4px multiples) but no fluid clamp tokens. **These tokens are a gap: if B1.3 atoms use these values, they need to be promoted to editorial.css.**

### Hardcoded values that should be tokens

| Location (line) | Value | Should be |
|---|---|---|
| 887 | `font-size: 16px` | `var(--text-base)` (15px in spec — also a 1px discrepancy) |
| 923 | `opacity: 0.10` (grain) | Acceptable as ambient infrastructure constant |
| 961 | `transition: transform 80ms linear` | `var(--omn-duration-fast)` is 150ms; 80ms is intentional for scroll progress responsiveness — document as exception |
| 1192 | `background: rgba(18, 18, 20, 0.78)` | `--omn-bg-page` at 78% opacity — no alpha token exists |
| 1283–1285 | `clamp(28px, 3.4vw, 48px)` etc. on `head--*` | Should reference `--text-*` scale but uses fluid clamp instead — different system than spec's fixed px scale |
| 1340 | `clamp(48px, 7.2vw, 112px)` on `.display` | Beyond `--text-7xl` (96px) at 112px max — exceeds spec type scale |
| 1354 | `transition: font-variation-settings 800ms` | `var(--omn-duration-slow)` is 600ms; 800ms is intentional — document as exception |
| 1523, 1561 | `rgba(168, 125, 78, …)` | `--omn-accent` in rgba — no alpha variant token exists |
| 1871 | `rgba(168, 125, 78, 0.08)` | Same — `--omn-accent` alpha derivative not tokenized |

**Most significant gap:** The sandbox uses 5 fluid clamp spacing tokens (`--space-section` etc.) not in editorial.css, and replaces the spec's fixed `--text-*` scale with fluid `clamp()` values for headlines. These are architectural divergences that must be resolved before B1.3 atom builds.

---

*End of audit. Files read: redesign-home.vue (2155 lines), OMENORA_DESIGN_SYSTEM.md (755 lines). No source files modified.*
