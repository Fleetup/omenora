# OMENORA — Design System & Layout Principles

**Status:** LOCKED — Phase B foundation, May 23, 2026  
**Replaces:** Nothing (new consolidated document)  
**Supersedes:** Any prior visual/layout decisions in conversation history  
**Source of truth for:** Colors · typography · grid · type scale · section patterns · homepage layout · paywall layout · motion · anti-patterns · performance budget

This is the single authoritative document for OMENORA's visual and layout system. When Windsurf or Claude make decisions, they reference this document. When a decision is not covered here, that's a gap to fill — not a license to invent.

---

## 0. Decision Framework

Every decision in this document is filtered through one question:

> Does this help a skeptical TikTok-arrived user decide to spend $30 on an unknown brand?

Premium perception is the **mechanism**, not the goal. Conversion is the goal. For our specific context (cold paid traffic, unknown brand, first-time $30 purchase), premium-feeling design IS the conversion infrastructure.

**Three research-backed bedrock facts:**

1. **94% of first impressions are design-related**, formed in 50ms (Stanford Web Credibility / Nielsen Norman, replicated)
2. **Median e-commerce landing page converts at 4.2%**, top 75th percentile at 11.4%+ — the gap is almost entirely design execution (Unbounce 2024 Conversion Benchmark, 41,000 pages / 464M visitors)
3. **Cold paid-social traffic converts 0.5-1.2% on average vs 3-5% for warm traffic** — design quality is the primary closer for cold traffic with no brand recognition

---

## 1. Color System

### Surfaces

```
--omn-bg-page         #121214    ← page foundation, deepest tone
--omn-bg-primary      #252528    ← dominant atmosphere, most sections
--omn-bg-elevated     #2F2F33    ← cards, paywall block, modals
--omn-bg-interactive  #3A3A3F    ← hover, selected, drop-downs
```

The page-to-primary jump (`#121214` → `#252528`, ~19 luminance units) is intentional — it creates clear visual chapters as the user scrolls between sections. Cards at `#2F2F33` lift visibly off the primary surface. Interactive at `#3A3A3F` provides the third elevation step for hovers and focus states.

### Borders

```
--omn-border-subtle     #2F2F33    ← table rows, secondary dividers (same as elevated surface)
--omn-border-primary    #3A3A3F    ← cards, buttons, primary dividers
--omn-border-emphasis   #4A4A50    ← focused inputs, selected states
```

Border tokens deliberately match adjacent surface tokens — this means a `border-primary` on a `bg-primary` surface reads as edge-lit elevation rather than a contrasting outline. Premium dark mode lives or dies on this convention.

### Text

```
--omn-text-primary    #F2EDE5    ← warm cream, headlines and body
--omn-text-secondary  #A8A19A    ← subheads, lede paragraphs
--omn-text-tertiary   #6B655E    ← captions, mono labels, metadata
```

Warm-tinted text against neutral-cool charcoal surfaces creates "just enough" warmth to feel hand-made rather than corporate. Contrast against `#252528` primary: primary text 11.2:1 (AAA), secondary 5.8:1 (AAA at large, AA at body), tertiary 3.4:1 (AA at large text only — use sparingly, only for labels/captions where it functions as metadata not body content).

### Accent

```
--omn-accent          #A87D4E    ← aged bronze, brand moments
--omn-accent-quiet    #6E5536    ← hover state, subtle bronze borders
```

Bronze used sparingly: eyebrows (mono caps), decorative rules, section marks, card numerals, plate notations. Never used as background fill. Never used at large display sizes (loses sophistication, reads "gold cliche"). Rule of thumb: if removing the bronze entirely would break the design, you've used too much.

### CTA

```
--omn-cta             #E8763A    ← warm burnt orange, primary purchase actions
--omn-cta-hover       #FF8856    ← brightened ~10% for hover
--omn-cta-text        #121214    ← page-color for maximum contrast on button
```

CTA color is reserved exclusively for primary purchase actions: "Begin your reading" buttons, "Complete checkout" buttons, anything that directly leads to money changing hands. Not used for secondary actions (sign in, learn more, expand FAQ — these get outlined or text-link treatments). The exclusivity is what makes the orange register as "act here."

### Functional

```
--omn-success         #7B9472    ← sage trust marks, secure payment, completion
--omn-error           #D14B3D    ← validation only, never decorative
```

Sage success color used for trust microcopy dots ("Secure checkout · 7-day refund · Stripe protected"), checkmarks on completed states, "Computed/Written" tags on content cards. Error color used for form validation failures only — never as a decorative color.

---

## 2. Typography

### Fonts

```
--omn-font-display    'Onest', system-ui, -apple-system, sans-serif
--omn-font-body       'Onest', system-ui, -apple-system, sans-serif
--omn-font-mono       'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace
```

**Onest** for both display and body. Free, open-source, variable axis (weight 100-900). Designed as a hybrid of geometric and humanist grotesques. Closest free alternative to Aeonik. Reads modern-honest, screen-optimized.

**Geist Mono** for technical voice: prices, version markers (Vol. 01), Plate notations (Plate I, fig. i), eyebrows (mono caps), timestamps, anywhere we want monospace receipt-style. Free, by Vercel, variable axis (weight 300-500).

Loading via Nuxt font loading with `font-display: swap`. Both subset to Latin extended for our launch markets. Both preloaded for above-the-fold use.

### Weight system

```
--weight-light       300    Onest light — hero display, large heads
--weight-regular     400    Onest regular — body, default
--weight-medium      500    Onest medium — UI emphasis, CTAs, nav links
--weight-semibold    600    Onest semibold — rare emphasis only
```

**Hierarchy through weight contrast, not italics.** Italics in headlines read "tasteful magazine" — outdated. Modern premium uses weight contrast within the same family. Display moments use light (300) for size ≥60px, regular (400) for sizes 24-48px, with one phrase in medium (500) for emphasis.

### Type scale

Major Third ratio (1.25) with custom adjustments at the extremes:

```
--text-xs       11px    --leading-xs    1.4     Geist Mono caps / labels
--text-sm       13px    --leading-sm    1.5     Onest UI / nav / small copy
--text-base     15px    --leading-base  1.6     Onest body (UI surfaces)
--text-md       17px    --leading-md    1.6     Onest body (content surfaces)
--text-lg       19px    --leading-lg    1.55    Onest lede / subhead
--text-xl       24px    --leading-xl    1.4     Onest card titles / small heads
--text-2xl      30px    --leading-2xl   1.25    Onest section subheads
--text-3xl      38px    --leading-3xl   1.15    Onest section heads
--text-4xl      48px    --leading-4xl   1.08    Onest medium display
--text-5xl      60px    --leading-5xl   1.05    Onest large display
--text-6xl      76px    --leading-6xl   1.0     Onest hero display
--text-7xl      96px    --leading-7xl   0.96    Onest mega display (rare)
```

1.25 chosen over 1.333 because Onest has enough character that it doesn't need extreme hierarchy. 1.333+ would produce headlines so large they break the premium cinematic register. 1.25 reads "premium product"; higher ratios read "marketing landing page."

### Letter spacing (tracking)

```
--tracking-tight        -0.035em    text-5xl through text-7xl
--tracking-snug         -0.025em    text-3xl through text-4xl
--tracking-normal       -0.012em    text-xl through text-2xl
--tracking-body         -0.005em    text-base through text-lg
--tracking-mono          0.02em     Geist Mono body
--tracking-caps          0.18em     Geist Mono caps (eyebrows, labels)
--tracking-wordmark      0.34em     OMENORA wordmark only
```

Tighter tracking at larger sizes is the modern premium convention. Onest specifically benefits from negative tracking at display sizes — its default tracking is set for body legibility.

### Mobile type scaling

On mobile (≤767px), display sizes scale down ~25% via media query (not fluid clamp):
- Hero `--text-6xl` 76px → 48px
- Section head `--text-3xl` 38px → 28px
- Body remains 15-17px (mobile reading distance is closer; body doesn't shrink)

---

## 3. Grid System

### Breakpoints

- **Desktop (≥1280px):** 12 columns, 24px gutter, 1320px max content width, 64px outer padding
- **Tablet (768–1279px):** 8 columns, 20px gutter, fluid container, 32px outer padding
- **Mobile (320–767px):** 4 columns, 16px gutter, fluid container, 20px outer padding

12-column desktop divides cleanly into halves (6+6), thirds (4+4+4), quarters (3+3+3+3), sixths (2×6). Every premium consumer reference uses this convention. At 1320px max with 64px outer padding, content width is 1192px — 12 columns of ~76px with 24px gutters.

### Spacing scale (4px base unit)

All padding, margin, and gap values use multiples of 4px:

```
--space-1     4px     hairline spacing
--space-2     8px     tight pairs
--space-3    12px     compact gap
--space-4    16px     default body gap
--space-6    24px     section internal spacing
--space-8    32px     between content blocks
--space-12   48px     sub-section breaks
--space-16   64px     section internal large
--space-24   96px     between sections (compact)
--space-32  128px     between sections (standard)
--space-40  160px     between sections (generous, hero-adjacent only)
```

### Container widths

```
--width-prose       640px    long-form reading (natal reading body)
--width-content     880px    headlines, hero copy, paywall
--width-section    1192px    standard content sections (12 col)
--width-bleed      1320px    hero, full-width imagery
--width-edge        100vw    page-bleed atmospheric sections (rare)
```

640px prose width produces ~70-80 characters per line — the optimal reading width established by typography research (Bringhurst, Lupton). Used on the natal reading display page where users read 4,800 words.

---

## 4. Section Pattern Library

10 reusable composition patterns. Every section on the homepage uses one of these.

### P-01: Hero (Single-Column)

**Composition:**
- Single-column left-weighted text layout with band--diag full-bleed atmospheric background
- Three-level pre-headline stack — (1) vol/issue notation line (mono caps, optional), (2) eyebrow with bronze rule prefix (mono caps), (3) display headline (76px Onest 300 with one phrase at 500 weight) — followed by subhead (19px Onest 400), CTA row, trust line at bottom
- Content capped at 640px max-width, left-aligned within the column
- Atmospheric imagery is a full-bleed background rendered via band--diag section class with CSS mask gradient overlay — not a separate column or plate frame
- Sticky-top nav: wordmark left, links right, single outlined sign-in button

**Why this works for cold TikTok traffic:** Vol/issue notation establishes "this is a publication, not a startup" in the first 50ms. Massive light-weight headline with one phrase boldened creates the "considered declaration" register. Trust line shows three different reasons to trust (12,400 readings / 4 traditions / 7-day refund) before the user scrolls.

**Optional secondary CTA:** P-01 supports a ghost CTA alongside the primary in the hero CTA row, but only when it links to a meaningfully different product entry point (e.g., "Explore compatibility" leading to the compatibility flow). Never use a ghost CTA that leads to the same destination as the primary, and never use "Learn more" as ghost copy. The two-button row is a primary purchase action paired with an alternative path — not competing paths to the same outcome.

**When to use:** Homepage hero only.

### P-02: Section Lede

**Composition:**
- Single column, content within 880px max-width, left-aligned
- Mono caps eyebrow with bronze rule prefix
- Section headline 48-60px Onest 300 with one phrase boldened
- Lede paragraph 19px Onest 400, max 620px wide
- Optional drop cap on the first letter of the lede paragraph: rendered via CSS `::first-letter` pseudo-element in --omn-accent at significantly larger size than the lede body. Used sparingly — at most once per page, on the section that introduces the product's core value proposition. No Vue component — applied as a CSS class on the lede paragraph element.
- 80-120px space below before next content block

**When to use:** Introducing every major content section.

### P-03: Three-Card Grid

**Composition:**
- 3-column desktop (3 × 4 col), 2-column tablet, 1-column mobile
- 16-24px gap between cards (NOT touching — gap creates premium register)
- Each card: bronze mono caps numeral (01/02/03) + small label, 24-28px Onest 400 title, 14-15px body, footer with mono caps category + sage trust tag
- Cards lift 2px on hover with subtle border emphasis
- **Background numeral variant:** a large faded numeral (01/02/03) may be rendered in the background of each card at significantly larger size than the card title, in --omn-accent at low opacity. This variant replaces the requirement for card-level imagery and is the default for Phase B homepage — the three-card grid carries visual weight without external assets. The imagery variant remains available for other surfaces.

**Why this works:** Cold-traffic users skim before committing. Three-card grids are the universally-understood "here are three things" pattern. Numerals establish discrete-and-countable, reducing cognitive load.

**When to use:** "What you receive" sections, tradition explanations, feature highlights.

### P-04: Centered Statement

**Composition:**
- Single column, content within 880px max-width, center-aligned
- Bronze mono caps eyebrow with rules on both sides (decorative bracket)
- 48-60px Onest 300 headline with one phrase boldened
- Lede paragraph 18px Onest 400, max 620px wide
- 96-128px space above and below

**When to use:** Paywall headline, closing CTA section, founders pledge.

### P-05: Side-by-Side (Text | Text)

**Composition:**
- Two-column split: 1fr | 1fr at desktop, stack at tablet/mobile
- Left column: bronze mono caps eyebrow, 38-48px Onest 300 head with one phrase boldened, 15-17px body, optional KV list
- Right column: same structure — eyebrow, head, body, optional KV list
- Columns are parallel text blocks presenting two related subjects (e.g., Western/Vedic vs BaZi/Tarot/Numerology, or two aspects of a method)
- 80-100px gutter between columns

**When to use:** Traditions section (comparative editorial moments where two disciplines are presented side by side). No imagery column — visual weight comes from typography and atmospheric section background.

### P-06: Pricing/Paywall Card

**Composition:**
- Centered card, 680px max-width
- Internal padding 44-48px
- Mono caps row of labels: Reading / Length / Delivery (left), values (right), hairline borders
- Price row at bottom, emphasized hairline above: mono caps "One-time" label, 38px Onest 400 price value
- 32px space below card, full-width orange CTA button (15-16px Onest 500, 22px vertical padding)
- 24px space, then sage trust microcopy row (Secure checkout · 7-day refund · Stripe protected)

**Why this works:** Mono labels + display price reads "receipt" — the most trustworthy register for money exchange. Full-width orange CTA forces visual dominance. Sage trust dots address three skeptic objections (security, regret, legitimacy) without badge-style trust icons (which read low-rent).

**When to use:** Paywall page, every conversion moment.

### P-07: Social Proof Cluster

**Composition:**
- Single section, content within 1192px
- Bronze mono caps eyebrow
- 3-4 testimonials in card format (NOT carousel)
- Each card: bronze pull quote glyph, 17-19px Onest 400 quote (max 30 words), divider, attribution (15px Onest 500 name + 13px Onest 400 mono context "Sun in Aquarius, Vedic dominant")
- Below cards: counter row at 30-38px Onest 400 with mono caps labels

**Why this works (2026 conversion research):**
- Named-customer counts with specificity lift +22%
- Single testimonial cards lift +14%
- Logo strips lift +8% (but we have no logos)
- Generic "trusted by thousands" lifts ~0%
- Carousels hide content — static beats carousel

We anchor with specific counters (12,400 readings written, 96% would recommend) AND attribute each testimonial to a chart context — astrology's equivalent of "VP of Engineering at $Company."

**When to use:** Once on homepage, mid-page (after "what you receive," before second CTA push).

### P-08: FAQ Disclosure

**Composition:**
- Single column, content within 880px max-width
- Bronze mono caps eyebrow + section head (P-02 style)
- 6-8 questions in expandable list format (closed by default)
- Uses native `<details>`/`<summary>` elements — no JavaScript accordion. Multiple items can be open simultaneously; do not auto-collapse siblings.
- Each item: 17-19px Onest 500 question with a plus (+) indicator that rotates to × when the item is open, expanded answer 15-17px Onest 400, hairline divider between items

**Why this works:** FAQ absorbs objections so users don't bounce on unspoken questions. Closed-by-default keeps section visually quiet. Multiple-open behavior respects user agency.

**When to use:** Late in homepage, before final CTA. Single FAQ per page maximum.

### P-09: Final CTA (Closing Statement)

**Composition:**
- Centered, content within 880px max-width
- Bronze mono caps eyebrow with decorative rules on both sides
- 48-60px Onest 300 declarative statement, 1-2 lines max
- 18px Onest 400 secondary sentence
- Single primary CTA button (NOT a row of two)
- Sage trust microcopy row below

**When to use:** Last content section before footer.

### P-10: Footer

**Composition:**
- Page-bleed dark surface
- Wordmark + tagline left, columns of links right (Product / Company / Legal)
- Bottom row: established 2026, vol notation, copyright, social icons (if any)
- All type 13-14px Onest 400, mono caps for column heads
- Internal padding 80-120px top, 32-48px bottom

**Why this works:** Footers are conversion infrastructure — users check them to verify legitimacy ("does this have real legal name and ToS?"). Premium footers signal "real publication, not landing page scam."

### P-11: Edge Markers (Left-margin section numerals)

**Composition:**
- Ambient infrastructure on section wrappers — not a standalone section
- A rotated mono-caps text element in the left page margin showing the section number and short label (e.g., "01 / ASTROLOGY, COMPUTED")
- Renders at small size (--text-xs) in --omn-text-tertiary, rotated 90deg counter-clockwise, positioned absolute-left outside the content column
- Hidden below 768px (mobile)

**Why this works:** Provides a navigational reference layer for desktop users who scan vertically before committing to read. Reinforces publication register without adding visual noise to the content columns.

**When to use:** Every major homepage section consistently. Applied via the BaseSection wrapper, not hand-coded per section.

---

## 4a. Shared Atoms

Atoms that are built in B1.3 and consumed across section patterns. Each atom is a single-purpose Vue component accepting props for content and minor variants. No atom encodes layout — that is the molecule's job.

### AppKVTable

Receipt-style key/value rows with hairline dividers. Keys in --omn-font-mono, mono caps, --omn-text-tertiary. Values right-aligned in --omn-text-primary. Used in P-06 paywall card for the Reading / Length / Delivery rows.

### AppTrustTag

Small mono-caps text with a sage (--omn-success) circular dot prefix. Used inside card footers and trust microcopy rows. Examples: "● COMPUTED", "● SECURE CHECKOUT", "● 7-DAY REFUND". Replaces badge-style trust icons. See also P-06 and P-03 for usage context.

---

## 5. Homepage Layout (LOCKED)

### Section sequence

```
1.  NAV                        [sticky-top]
2.  HERO                       [P-01]
3.  WHAT IS OMENORA            [P-02 lede + P-05 side-by-side]
4.  WHAT YOU RECEIVE           [P-02 lede + P-03 three-card grid]
5.  THE FOUR TRADITIONS        [P-05 side-by-side × 2 alternating]
6.  SOCIAL PROOF               [P-07]
7.  PAYWALL PREVIEW + CTA      [P-04 centered statement + P-06 paywall card]
8.  FAQ                        [P-08]
9.  FINAL CTA                  [P-09]
10. FOOTER                     [P-10]
```

### Vertical lengths (approximate)

- Hero: ~100vh
- What is OMENORA: ~70vh
- What you receive: ~80vh
- Four traditions (× 2): ~140vh total
- Social proof: ~70vh
- Paywall preview + CTA: ~90vh
- FAQ: ~60vh
- Final CTA: ~60vh
- Footer: ~50vh

**Total: ~7-8 viewport heights.** Medium length — long enough to build trust for a $30 first-time purchase, short enough to convert TikTok attention.

### Conversion architecture

Three CTA moments, all with identical copy ("Begin your reading") leading to the same destination (validated quiz funnel):
1. Above the fold in hero (P-01)
2. Mid-page in paywall preview (§7) — with price disclosed
3. Final at the bottom (P-09)

Three CTAs with identical copy reinforce a single decision. Multiple CTAs with different copy fragment intent.

**Sticky bottom CTA on mobile only.** Lifts +11% per conversion research. Desktop doesn't get sticky — desktop users don't have the scroll-attention problem, and sticky desktop CTAs read pushy.

### Section transitions

Alternating background rhythm produces visual chapters without explicit dividers:

| Section | Background |
|---|---|
| Hero | primary |
| What is OMENORA | page |
| What you receive | primary |
| Four traditions 1 | page |
| Four traditions 2 | primary |
| Social proof | page |
| Paywall | primary |
| FAQ | page |
| Final CTA | primary |
| Footer | page |

### Imagery placement

Imagery on the homepage is rendered exclusively as full-bleed atmospheric backgrounds via the band--diag section class with CSS mask gradient overlays. No plate frames, no column-side image panels. The atmospheric image recedes behind text and is never the focal point — it adds depth and warmth without competing with the headline.

No background bleeds on content sections. No decorative scattered elements. More imagery = more decoration = less premium.

---

## 6. Paywall Page Layout

The paywall is a dedicated page, not a homepage section. Users arrive after completing the quiz and viewing preview.

### Section sequence

```
1. NAV (compact)              [reduced height, no nav links]
2. HEADER + PREVIEW           [P-04 + thumbnail of preview]
3. PAYWALL CARD               [P-06]
4. WHAT'S INCLUDED            [P-03 simplified]
5. SECURITY + TRUST           [restated trust at scale]
6. FAQ (paywall-specific)     [P-08, 4-5 questions]
7. FINAL CTA                  [P-09]
8. FOOTER                     [P-10]
```

### Conversion architecture

Three identical primary CTAs:
1. Inside paywall card (§3)
2. After "What's included" (§4)
3. Final CTA section (§7)

No alternative CTAs. No "save for later." No newsletter signup. The paywall has ONE job — convert.

### What we DON'T do on paywall

- No countdown timers (manipulation, kills premium register)
- No "X people viewed this in last hour" (scammy)
- No "limited spots" copy (we sell unlimited readings — fake scarcity = lying)
- No testimonial carousels (static beats carousel)

---

## 7. Motion Choreography

### Stack

- **Lenis** for smooth scroll
- **GSAP ScrollTrigger** for scroll-bound animations
- **No alternative animation libraries**

### Principles

**Animate transform and opacity only.** Never layout properties. Mandatory for 60fps on mobile.

**Respect `prefers-reduced-motion`** throughout. When the user has reduced motion preferences: all parallax disabled, reveals replaced with instant appearance, hover scale effects replaced with subtle border/color changes.

**Motion serves conversion, not decoration.** Every motion moment must justify itself by:
- Drawing the eye to a CTA, or
- Reducing perceived load time during scroll, or
- Building trust through craft signaling, or
- Revealing information progressively to reduce cognitive load

If a motion moment doesn't do one of these four things, it's decoration. Cut it.

### Specific motion moments

**1. Hero parallax (moderate intensity)**

Three depth layers:
- Background (0.6x scroll speed): subtle atmospheric layer, low opacity
- Atmospheric background layer (0.85x): full-bleed band--diag background image
- Type and CTA (1.0x): normal scroll speed

Total parallax depth: bottom of hero sees ~40px offset from foreground. Subtle, not dramatic. Reference: Apple product pages.

**2. Section reveal on scroll**

When a section enters the viewport:
- Eyebrow fades in (0ms delay, 400ms)
- Headline fades in + translates up 12px (100ms delay, 500ms)
- Body/lede fades in (200ms delay, 500ms)

Easing: `cubic-bezier(0.2, 0.0, 0.0, 1.0)`. Never bounce, never overshoot.

**3. Variable font animation on hero (signature moment)**

Hero headline uses Onest's weight axis. On page load, the headline animates from weight 100 (ultralight, near-invisible) to final state (300 light + 500 medium phrase). Duration 800ms with ease-out.

Happens once per page load, homepage only. Signature motion moment.

**4. Micro-interactions**

- Buttons: 200ms ease-out on background, 150ms on transform (1px lift on hover)
- Cards: 250ms ease-out on background, border, transform (2px lift on hover)
- Nav links: 200ms color transition
- Form inputs: 200ms border-color and background on focus

Consistency across micro-interactions is what registers as "considered, premium product."

**5. Scroll-triggered counter animation**

When social proof counters enter viewport (12,400 readings written, etc.), animate from 0 to final value over 1200ms with ease-out. Used because it directly serves conversion (specific numbers + motion = "real, growing platform").

### Motion intensity by section

| Section | Parallax | Reveal | Special |
|---|---|---|---|
| Hero | 3 layers | Yes | Variable font weight animation |
| What is OMENORA | No | Yes | — |
| What you receive | No | Yes (cards stagger 100ms) | — |
| Four traditions | Light (image only) | Yes | — |
| Social proof | No | Yes | Counter number animation |
| Paywall preview | No | Yes | — |
| FAQ | No | Yes (light) | Expand/collapse |
| Final CTA | No | Yes | — |
| Footer | No | Yes | — |

Motion intensity decreases as user scrolls. Hero is loudest (must grab attention). Footer is silent. Mirrors user's cognitive journey.

---

## 8. Anti-patterns (Explicitly NOT doing)

### Visual

- No glassmorphism (dated, reads 2020-2022) — **exception:** the sticky nav bar MAY use a glass/blur backdrop as a functional legibility tool when the hero has a full-bleed background. Glassmorphism is forbidden on cards, paywall, modals, and all content surfaces without exception.
- No 3D floating objects in hero (AI-built site tell in 2026)
- No nebula backgrounds, gradient washes, starfield atmospheres
- No background bleeds on content sections — **hero only exception:** the hero section MAY use a full-bleed atmospheric background image when paired with a horizontal scrim and vertical vignette stack for text legibility. The image must register in warm bronze/charcoal tones only. Explicitly forbidden: purple, violet, indigo, or blue washes (AI category cliché).
- No "Sparkles, Stars, Wand" icons (astrology cliche)
- No AI purple gradients (violet/indigo/blue washes — dated AI category color)
- No emoji in body copy
- No drop shadows on cards (use hairline borders — shadows read Material Design 2018)
- No rounded corners >4px

### Layout

- No testimonial carousels (static beats carousel)
- No "as seen on" press logo strips (we have no press — fake logos kill trust)
- No countdown timers, fake scarcity, "X people viewing"
- No multi-step popups, exit-intent popups, "wait! before you go" modals
- No newsletter signup as primary CTA path (we sell readings; daily horoscope is separate)
- No "Learn More" buttons that lead to nothing actionable
- No icon + bullet feature lists (use P-05 or P-03 instead)
- No iPhone-frame product screenshots (use atmospheric band--diag backgrounds or card-based imagery)

### Motion

- No scroll-jacking (forcing scroll speed, fixed sections that won't release)
- No bounce/spring easing on text reveals (reads consumer app)
- No autoplay video heroes (-7% conversion average, kills LCP)
- No video on the homepage for Phase B. Any video treatment is deferred to Phase B+1 or later.
- No parallax on text content (only images and atmospheric layers)
- No background video loops on hero (same as autoplay)
- No cursor-following effects unless they directly serve interaction

### Copy

- No "AI-powered" anywhere user-facing
- No "personalized" used to mean "selected from database" (must mean computed-from-chart)
- No "ancient wisdom" / "mystical insights" / "discover your true self" (astrology cliche)
- No exclamation marks in body copy
- No "Discover" / "Unlock" / "Reveal" verbs (overused conversion vocabulary)

---

## 9. Performance Budget

Core Web Vitals tie directly to conversion (2026 research: pages hitting all three "Good" thresholds convert +35% above industry average; pages failing thresholds bounce +23% higher).

```
LCP (Largest Contentful Paint)      < 2.0s on 4G mobile
CLS (Cumulative Layout Shift)        < 0.05 (stricter than Google threshold)
INP (Interaction to Next Paint)     < 150ms on 4G mobile
Total JS bundle (homepage)           < 200KB compressed
Total page weight (homepage)         < 1.5MB on first load
```

### How layout decisions affect performance

- Band--diag background images use fixed `aspect-ratio` on the containing section — prevents CLS
- Variable font animation uses `font-variation-settings` on single font file — cheaper than multiple weight files
- Onest and Geist Mono subset to Latin extended only, WOFF2 format, preloaded for hero
- All imagery AVIF with WebP fallback; hero band--diag image loads eager (above-fold), section backgrounds lazy (below-fold)
- Lenis and GSAP loaded async after Critical CSS paints — scroll works native before motion enhances

---

## 10. Implementation Order

Production sequence when moving from this document to code:

1. **Token migration.** Codify visual system into `editorial.css`. Install Onest + Geist Mono via Nuxt font loading. Verify nothing breaks.
2. **Atom expansion.** Augment existing 7 atoms (AppHeadline, AppSubhead, AppBody, AppCaption, AppEyebrow, AppButton, AppDivider) to support new type scale + tracking variables. Build missing atoms identified during build (likely: AppCard).
3. **Section pattern molecules.** Build each P-01 through P-10 as reusable Vue component. Test in isolation. No content yet.
4. **Homepage assembly.** Compose homepage from molecules. Add real copy (placeholder if final copy isn't written). No motion yet.
5. **Motion layer.** Add Lenis + GSAP. Implement choreography from §7. Test with `prefers-reduced-motion`.
6. **Paywall page.** Same pattern: assemble from molecules, layer motion.
7. **Edge case testing.** Verify mobile breakpoints, accessibility (keyboard nav, screen readers, focus states), performance budget.
8. **Production cutover.** Single merge of `feature/b1-pricing-alignment` → `main`.

Each step is its own Windsurf prompt with audit-before-commit discipline. No motion before structure. No content before composition. No production cutover until edge cases pass.

---

## 11. Out of Scope (For This Document)

Handled separately, later:

- **Compatibility page layout** — applies these patterns, has unique two-person input flow needing its own micro-design
- **Daily horoscope page** (`/daily`) — exists; may or may not need re-design depending on Phase B findings
- **Natal reading display page** — long-form 4,800-word content; uses `--width-prose` (640px) as core measure; needs typography-heavy design distinct from homepage marketing
- **Mobile app layout** — separate codebase, React Native, native iOS conventions
- **Email templates** — different design conventions, separate document
- **Imagery commissioning** — what specific atmospheric images go in hero and section backgrounds; handled in Phase B4
- **Final hero copy** — current text is placeholder; real copy workshopped separately

---

## 12. Lock Status

### LOCKED (no further iteration without explicit decision)

**Visual system:**
- 12 surface/text/accent/CTA/functional color tokens
- Onest + Geist Mono typography stack
- Weight system (300/400/500/600)
- 12-step type scale with line-heights
- Letter spacing scale
- Mobile type scaling rules

**Layout system:**
- 12-column grid with 24/20/16px gutters across breakpoints
- 1320px desktop max, 1192px content width
- 4px base spacing unit with full enumerated scale
- 5 container widths from 640px prose to 100vw bleed
- 10 section pattern definitions (P-01 through P-10)

**Page layouts:**
- Homepage section sequence (10 sections including footer)
- Paywall page section sequence (8 sections)
- Three-CTA architecture with identical copy
- Section background rhythm
- Imagery placement (atmospheric band--diag backgrounds; no plate frames on homepage)

**Motion + technical:**
- Lenis + GSAP stack
- Transform/opacity only animation
- `prefers-reduced-motion` respect
- 5 specific motion moments with timing
- Performance budget (Core Web Vitals targets)

**Discipline:**
- Anti-pattern list (24 explicit "do not do" items), with narrow exceptions for sticky nav glassmorphism and hero background image (see §8)
- Implementation order (8 sequential steps)

**New locked patterns (B1.2.7):**
- P-11: Edge markers (left-margin section numerals, desktop only)
- AppTrustTag: sage dot + mono caps trust label atom (§4a)
- AppKVTable: named atom defined in §4a
- Background numeral variant for P-03 three-card grid (default for Phase B)
- Drop cap on P-02 ledes via CSS ::first-letter on lede paragraph (at most once per page)
- Ghost secondary CTA in P-01 hero (with constraints; see §4 P-01)
- Hero background image permitted under scrim/vignette constraints (see §8)

### Open for refinement during implementation

- Specific easing curves (current `cubic-bezier(0.2, 0.0, 0.0, 1.0)` may adjust)
- Exact motion durations (current spec is starting point)
- Card hover lift distance (2px is starting point)
- Section transition timing (placeholder for fine-tuning)
- Specific FAQ questions (TBD when writing real copy)
- Specific testimonial content (TBD — depends on early customer outreach)

---

## 13. Build Toolchain & Authoring Workflow

The toolchain that authors components for this design system. Reference these tools by name in every redesign prompt so the model picks them up consistently.

### Animation: `motion-v`

- **Package:** `motion-v` (Vue 3 port of Motion / Framer Motion)
- **Nuxt module:** `motion-v/nuxt` (registered in `nuxt.config.ts` → `modules`)
- **Usage:** `<Motion>`, `<AnimatePresence>`, and friends are auto-imported across `~/components` and `~/pages`. No per-file import needed.
- **Scope:** primary library for component-level reveals, hero variable-font animation, micro-interactions, and any `prefers-reduced-motion`-aware entrance/exit transitions.
- **Coexistence with §7 stack:** Lenis remains the smooth-scroll engine. GSAP/ScrollTrigger stays available for complex scroll-pinned choreography only — default to motion-v's `useScroll` / `whileInView` first and reach for GSAP only when motion-v can't express the moment.

### Component scaffolding: 21st.dev (Magic MCP)

- **MCP server:** `@21st-dev/magic` — configured via `claude mcp add`, scoped to the user.
- **Usage:** invoke from inside a redesign prompt by asking for a component pattern (e.g. "Magic, give me three pricing-card layouts in the OMENORA aesthetic"). The MCP returns ready-to-paste Vue/Tailwind blocks pulled from the 21st.dev community registry.
- **Discipline:** **Magic output is a starting skeleton, never a drop-in.** Every component fetched from Magic must be reshaped to OMENORA tokens (§1–§3), atom primitives, and the anti-patterns list (§8) before merge. Treat Magic the way you'd treat a stock-photo reference — for structure, not for taste.

### Design authorship: `frontend-design` skill

- **Skill:** `frontend-design:frontend-design` (Claude Code skill, no install required)
- **When to invoke:** any prompt that builds or restructures a Vue component, a `pages/*` file, or a section pattern from §4. Invoke at the **top** of the prompt before any tool calls so the skill's design priors steer the entire turn.
- **Why mandatory here:** the skill is tuned to avoid generic AI aesthetics — exactly the failure mode §8 anti-patterns are written to prevent.

### Prompt template for redesign work

Every Phase B section-build prompt should open with:

```
Use the frontend-design skill.
Reference OMENORA_DESIGN_SYSTEM.md §<n>.
Animation via motion-v (Nuxt auto-import).
If you need a starting structure, ask Magic (21st.dev MCP) — then reshape to our tokens and atoms.
Do not introduce any pattern in §8.
```

This four-line preamble is the load-bearing convention. If a prompt omits it, the redesign drifts toward generic SaaS aesthetics within one or two iterations.

---

*End of design system + layout principles. Next concrete action: Windsurf token migration prompt to codify this document into `editorial.css` and install fonts via Nuxt.*
