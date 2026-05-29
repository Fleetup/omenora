# OMENORA — Conversion Surface Addendum (Group B)

> **STATUS: PROPOSED — not yet locked.** This is the concrete target spec for the homepage, navigation, paywall, and store-badge fixes (Group B). It exists so those fix prompts derive from a written target instead of execution-time invention. Nothing here re-decides locked strategy: no change to no-trial, the $20 Founding mechanism, mobile-only subscription, or the mobile-only calendar decision. It instantiates the existing conversion-discoverability direction (STRATEGY §5, §9, §10) into specific, buildable specifications.
>
> Once reviewed and approved, this folds into PAGES_AND_SECTIONS.md §2 (homepage) and a small STRATEGY §11 note. Until then it is a draft.
>
> **Provenance:** Built from STRATEGY.md / PRODUCT_MAP.md / PAGES_AND_SECTIONS.md (locked strategy), Audits 1–4 (current code reality), and 2026 conversion research (web-to-app funnels, trust-signal placement, deposit conversion, paywall psychology). Research findings are cited inline as [R].

---

## 0. The single principle this addendum applies

The homepage's actual audience is **warm/organic/branded traffic**, because paid traffic lands directly on quiz funnels, not the homepage (STRATEGY §5, §10). The 2026 data is consistent: warm visitors still require value demonstration and exploration paths before the ask, and trust signals must sit *at* the conversion decision, not in the footer [R]. The current homepage (Audit 1) is built as a single-CTA funnel to `/founding` — optimized for someone already sold, not for a visitor deciding. Every change below resolves that, **without weakening the Founding conversion**, by making free experiences the on-ramps that feed Founding (engage → preview → reserve), which is the Nebula sequence OMENORA already follows.

This does not contradict STRATEGY §9 ("every page drives the Founding conversion"). Exploration paths *serve* that conversion; they do not compete with it. The §9 language should be updated to say so explicitly so it is not later read as forbidding discovery paths.

---

## 1. Homepage CTA architecture

### Problem (Audit 1)
Of ~12 body CTAs, nearly all route to `/founding`, including three **identical** "Reserve your reading" cards in §04. The only free-experience body links are two ghost links to `/analysis`. Three discovery opportunities (§04 cards) are spent on one destination.

### Locked target — CTA map by section

| Section | Primary CTA | Secondary CTA | Rationale |
|---|---|---|---|
| §01 Hero | "Reserve at $20 — Founding Member" → `/founding` | "Preview your archetype" → `/analysis` | Keep. Money moment + free on-ramp. Already correct. |
| §02 Founding Members | "Claim founding membership — $20" → `/founding` | "Try the quiz first" → `/analysis` | Keep. Correct. |
| §03 The method | "See your own chart →" → `/analysis` | — | **CHANGE** from `/founding` to `/analysis`. This section argues differentiation; the matching action is to *experience* it, not to pay. Converts a redundant Founding CTA into an exploration on-ramp. |
| §04 What you receive (3 cards) | Card 1 → `/analysis`; Card 2 → `/compatibility-quiz`; Card 3 → `/daily` | — | **CHANGE** — the highest-impact edit. Three identical `/founding` CTAs become three distinct discovery paths (archetype / compatibility / daily). Card copy aligns to the destination experience. |
| §06b Paywall band | "Reserve your reading" → `/founding` | — | Keep. This is the conversion event. |
| §08 Closing | "Become a founding member" → `/founding` | "Review the offer" → `#paywall` | Keep. Correct. |
| §10 Final CTA | "Begin your reading" → `/founding` | — | Keep. Money moment. |

### Net effect
Founding remains the sole primary CTA at the three money moments (hero, paywall band, final CTA). The body sections (§03, §04) become exploration on-ramps. Result: an organic visitor has a clear "experience it first" path through the page instead of seven repetitions of the same paywall.

### Derives
Fix prompt: **Homepage CTA reorganization** (`index.vue` — CTA targets and §04 card copy only; no structural/section changes).

---

## 2. Paywall band — trust and proof

### Problem (Audit 1)
The paywall band carries refund/Stripe microcopy but **zero proof** — no rating, count, or testimonial. For an unknown brand this is the single largest conversion gap: 67% of consumers will not buy without trust, and proof placed at the conversion decision is the strongest lever [R]. The Trustpilot widget already exists in the codebase (on the compat page) but is absent from both the homepage paywall band and `/founding`.

### Locked target — proof elements at the paywall band (and mirrored on `/founding`)

Build the band to carry these, in priority order:

1. **Live reading count** from `/api/get-reading-count` — real data, no fabricated fallback. (Audit confirmed the fake `47,392`/`12,400` values are already removed; do not reintroduce a hardcoded fallback.)
2. **Trustpilot widget** — the existing `TrustpilotWidget` component, wired into a slot. **Conditional:** renders only once the Trustpilot Business Unit ID is configured and real reviews exist. Until then the slot stays empty rather than showing a placeholder.
3. **Founder credibility line** — see §3.
4. **Security + risk-reversal** — see §3.

### Honest constraint
Real testimonials do not exist yet (the fabricated ones were correctly removed). Proof will be **thin until Founding Members generate real reviews**. The architecture is built now to *receive* proof; it populates as reviews arrive. Do not fabricate — a perfect 5.0 or invented testimonial reads as fake and reverses the trust gain [R].

### Derives
Fix prompt: **Paywall proof architecture** (`index.vue` paywall band + `founding/index.vue` — add reading-count display, Trustpilot slot, founder line, reframed trust copy). Plus a separate non-code task: configure Trustpilot Business Unit ID + collect first reviews.

---

## 3. Risk-reversal framing and founder presence

### Problem (Audit 1)
Refund copy exists only as policy-style microcopy ("14-day full refund"). There is **no founder presence anywhere** on the site.

### Locked target

**Risk-reversal reframe.** Change refund copy at every CTA from policy-statement to benefit-framing, placed at the button:
- From: "14-day full refund"
- To (example): "Reserve risk-free — full refund anytime before launch. No form, no questions."

Benefit-framed risk reversal at the decision point measurably lifts conversion versus a flat policy statement [R]. This costs almost nothing: the founding refund pipeline is already built and verified (`charge.refunded` → `status: refunded`), and refund rates on small deposits run ~3–5%, negligible against the validation kept from the rest [R].

**Founder credibility.** Add a compact founder element near the conversion surface (homepage and/or `/founding`). For an unknown brand the founder is the trust — personal narrative is a top 2026 trust accelerator, and people trust people more than logos [R]. Minimum viable form: a short "Built by [founder], solo" byline with a real photo and one credibility line (e.g. a one-sentence engineering-background statement). A real photo outperforms stock [R].

### Honest constraint (content dependency)
The founder element requires copy and a real photo from the founder — these are inputs, not code. The fix prompt builds the slot; the content populates it.

### Derives
Fix prompt: folded into the §2 paywall proof prompt (same files, same surfaces). Content task: founder copy + photo.

---

## 4. Navigation — desktop/mobile parity

### Problem (Audit 2)
Desktop nav exposes Method / Traditions / Pricing / Daily + "Begin Reading." The mobile drawer *additionally* exposes Compatibility and the free-reading path (`/analysis`). So the funnels are discoverable on mobile but **hidden on desktop** — backwards, given mobile is the primary audience, and it means desktop visitors cannot reach the compatibility funnel from navigation at all. Separately: `AppShell` is dead code (zero pages use it); the live header is `AppHeader.vue` with the drawer inline in the same file.

### Locked target

1. **Expose discovery on desktop.** Add the free-experience/funnel entries the mobile drawer already has so both audiences can find them. Keep it minimal — clear, predictable navigation beats a crowded menu [R]. Add at most a compact "Readings" or "Compatibility" entry plus the free-reading on-ramp; do not build a mega-menu.
2. **"Pricing" label.** It anchors to `#paywall` (the $20 Founding band), not subscription tiers. Defensible (the $20 is the only price today), but to reduce confusion consider relabeling to "Founding" or "Reserve." Lock one; do not leave it ambiguous.
3. **Scope guard.** Edit `AppHeader.vue` directly — it is the live component every page renders. **Do not** fold this into an `AppShell` migration; that is separate optional cleanup, not part of this fix.

### Derives
Fix prompt: **Nav parity** (`AppHeader.vue` only — desktop nav items + label). `AppShell` deletion tracked separately as optional hygiene.

---

## 5. App Store badges (hero)

### Context
Per the merge-at-launch model: this branch reaches `main` only when the app is live in the store, so building the badge now (behind the unpushed branch) is correct sequencing, not premature. PAGES §2 already holds a future-content-lock for this; this section makes it concrete.

### Locked target

1. **Apple badge** — official Apple-supplied "Download on the App Store" SVG, compliant with Apple's badge brand guidelines (do not build a custom button). Placed in the hero.
2. **Android** — **omit for v1.** Android is disabled (no Play app exists); a Google Play badge would link to nothing on launch day, which is a trust-killer. Revisit when Android ships.
3. **Destination URL** — the App Store product page URL does not exist until the app is live. Build the badge with the URL as a **config/env value**, populated at launch. Do not hardcode a guessed URL.
4. **Transition-window nuance.** PAGES §2's future-lock implies that when the app goes live, hero copy shifts to download-primary and Founding becomes a closed offer. But Founding closes "at App Store launch *at scale*" (STRATEGY §4), not at first availability — so there is a window where the **app is live AND Founding is still open.** During that window the hero must carry **both**: the download badge *and* a still-primary Founding CTA. The badge is additive; it does not replace the Founding CTA until Founding formally closes.

### Derives
Fix prompt: **Hero store badge** (`index.vue` hero + config value for the store URL). Lower priority — it has no effect until launch.

---

## 6. What this addendum deliberately does NOT touch

- No-trial subscription lock (STRATEGY §6, §11) — unchanged.
- The $20 Founding mechanism, pricing, or close criteria — unchanged.
- Mobile-only subscription (RevenueCat) — unchanged.
- Mobile-only calendar decision — unchanged; web order-bump remains parked as a post-launch open question.
- Page structure, section sequence, or design tokens — unchanged. Group B is CTA targeting, trust elements, nav items, and one hero badge. It is reorganization and addition, not redesign.

---

## 7. Open inputs (non-code dependencies that gate full effect)

These do not block the fix prompts (which build the slots), but the surfaces stay partially empty until provided:

1. **Trustpilot Business Unit ID + first real reviews** — gates the proof widget.
2. **Founder copy + real photo** — gates the founder credibility element.
3. **App Store product page URL** — exists only at launch; gates the badge link.

---

## 8. Fix-prompt derivation summary

| Fix prompt | Source section | Files | Blocked on |
|---|---|---|---|
| Homepage CTA reorganization | §1 | `index.vue` | Nothing |
| Paywall proof + founder + risk-reversal | §2, §3 | `index.vue`, `founding/index.vue` | Slots build now; content populates later |
| Nav parity | §4 | `AppHeader.vue` | Nothing |
| Hero store badge | §5 | `index.vue` + config | Effective only at launch |

---

*This is a proposed addendum. It does not become a locked target until approved. On approval, §1–§5 fold into PAGES_AND_SECTIONS.md §2 and a STRATEGY §9/§11 note, and the fix prompts derive from it with zero execution-time invention.*
