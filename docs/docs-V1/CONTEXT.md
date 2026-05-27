# OMENORA — Working Context

> Operational entry point for any Claude conversation working on OMENORA.
> Read FIRST, before the five strategic master documents.
> This document does not contain strategy — only the working assumptions Claude needs to operate without asking clarifying questions.

---

## 1. Repository structure

| Path | What it contains |
|---|---|
| `/Volumes/ESSD/Projects/Augur-V1/` | Repo root |
| `/Volumes/ESSD/Projects/Augur-V1/augur/` | Web application (Nuxt 3) |
| `/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/` | Vue page components |
| `/Volumes/ESSD/Projects/Augur-V1/augur/app/components/` | Vue components (atoms, sections) |
| `/Volumes/ESSD/Projects/Augur-V1/augur/server/api/` | Nuxt server endpoints |
| `/Volumes/ESSD/Projects/Augur-V1/augur/app/assets/css/editorial.css` | Design system tokens, section utilities |
| `/Volumes/ESSD/Projects/Augur-V1/mobile-app/` | Mobile application (React Native + Expo) |
| `/Volumes/ESSD/Projects/Augur-V1/mobile-app/src/screens/` | Mobile screen components |
| `/Volumes/ESSD/Projects/Augur-V1/mobile-app/docs/` | Mobile-specific specs (e.g. `MONETIZATION_SPEC_V4.md`) |
| `/Volumes/ESSD/Projects/Augur-V1/docs/docs-V1/` | Master documents (this directory) |

### Git discipline

- Working branch: `feature/b1-pricing-alignment` 
- Discipline pattern: audit-before-commit, diff-review-before-push, hold-locally-before-push, verify-in-incognito-on-web-and-mobile-before-declaring-done
- Never push without diff review

---

## 2. Technology stack

### Web (omenora.com)

- Nuxt 3, Vue 3, TypeScript
- Supabase (PostgreSQL)
- Stripe (live mode)
- Resend (transactional email)
- Railway (hosting)
- Swiss Ephemeris (astronomical calculations)
- OpenAI API (report generation)

### Mobile (OMENORA iOS app)

- React Native + Expo
- TypeScript
- RevenueCat (subscriptions and IAPs)
- Supabase
- iOS only in current build (Android disabled)

### External services

- Apple App Store Connect (App ID `6768273672`, Bundle `com.omenora.app`, Team ID `FADWJ952AY`)
- RevenueCat project `3f9c1cd9` 
- TikTok Pixel `D7FTU6BC77U7IUI4896G` 
- Meta Pixel

---

## 3. Working model — Claude, Windsurf, founder

### Roles

- **Claude:** strategic PM and prompt architect. Writes audit and execution prompts for Windsurf. Does NOT write code directly.
- **Windsurf:** code executor. Reads files, applies surgical edits, runs builds, commits.
- **Founder-operator (Miki):** reviews prompts before sending, reviews diffs before pushing, makes strategic decisions.

### Two prompt types only

1. **Audit prompts** — read-only research. Windsurf inventories the codebase against the master documents and returns a factual report. Must explicitly forbid file creation, modification, or git operations.
2. **Execution prompts** — built from audit findings PLUS locked decisions in the master documents. No new strategic content invented at execution time.

### Strict discipline rules

- One prompt at a time. Wait for Windsurf to report back before generating the next.
- Diff review BEFORE push.
- Hold locally before push.
- Verify in incognito on web AND mobile before declaring done.
- Documents win over code. If code conflicts with master documents, code is wrong.

### Failures Claude must avoid

- Writing raw code instead of a Windsurf prompt
- Inventing strategy not in master documents
- Restating decisions just made instead of acting on them
- Asking yes/no questions when an audit prompt would resolve it
- "Let me research" theater followed by generic non-cited answers
- Generic playbooks instead of consulting conversation history
- Padding refusals or pushback with excessive apologizing

---

## 4. Master documents — reading order

For any task, read CONTEXT.md first (this file), then the relevant master document(s):

1. **STRATEGY.md** — why
2. **PRODUCT_MAP.md** — what
3. **DESIGN_SYSTEM.md** — how (visual)
4. **PAGES_AND_SECTIONS.md** — where
5. **DEPRECATED.md** — what to remove

If the answer to a question is not in CONTEXT.md or the master documents, the answer is not yet locked. Do not invent it. Raise it explicitly as an open question and lock it in the appropriate document before proceeding.

---

## 5. Current phase

OMENORA is a mobile-first product. Web and mobile are TWO PARALLEL WORKSTREAMS, not sequential. Both must complete before paid ads at scale. Mobile is the destination; web is the acquisition mechanism that drives users to it.

### Web workstream (parallel)

**W1 — Pricing alignment + cleanup (CURRENT)**
Documents locked. Page-by-page implementation pending. Reference DEPRECATED.md §13 for tier-ranked execution plan. Originally tracked as Prompt 15 (small pages cleanup — `/daily`, `/account`, `/subscription`, JSON-LD price updates) and Prompt 16 (retired translation key deletion sweep) from May 23 B1 session — work now reorganized under DEPRECATED.md tiers.

**W2 — `/discover` funnel build (PENDING)**
25-question Nebula-pattern archetype quiz funnel at `/discover`. Status: PRE-LAUNCH, not yet built.

**W3 — Homepage post-launch update (PENDING)**
Once mobile app ships to App Store, add App Store / Google Play download buttons to homepage. Tracked in PAGES_AND_SECTIONS.md as future content lock.

### Mobile workstream (parallel)

**M1 — Mobile codebase audit (NEXT)**
Three read-only Windsurf audits: codebase inventory, design system extraction, infrastructure inventory. Outputs feed into M2.

**M2 — MOBILE_DESIGN_SYSTEM.md and MOBILE_SCREENS.md creation (PENDING)**
Lock mobile design system, screen architecture, and content into master documents.

**M3 — Mobile polish + submission readiness (PENDING)**
Visual and technical polish to reach submission-ready state per audit findings. Mobile app is FEATURE-COMPLETE; remaining work is polish.

### Convergence — Manual platform work (PENDING)

Triggered when mobile reaches submission-ready state. Requires founder participation:
- Apple Developer Organization conversion (Individual → UNCC Inc.)
- Paid Apps Agreement signing
- W-9 resubmission under UNCC Inc.
- App Store Connect product creation (3 subscriptions + 2 IAPs + 3 Counsel Boost Packs)
- RevenueCat dashboard product configuration
- Stripe Dashboard work for Premium price IDs (3 plans)
- Railway env var population for Premium price IDs
- Supabase migrations (if any remain)
- TestFlight build + internal verification
- App Store submission

### D — Paid ads at scale (POST-LAUNCH)

Aggressive TikTok and Meta paid acquisition. Gated on web cleanup complete + mobile app live in App Store + verified end-to-end conversion flow.

---

## 6. Active parallel workstreams (outside core development)

These run alongside OMENORA development. They do NOT belong in the strategic master documents because they don't affect product or code decisions — but Claude should know about them.

### Funding

- **Path A — Solo Founders Program** ($100K / 2.5% uncapped MFN SAFE, Julian Weisser, <1% acceptance). Application drafting in progress.
- **Path B — Cold angel outreach** ($4M post-money SAFE cap, $1K minimum, ~500 contact list).
- **Path C — Founding Member deposits** ($20 each at `omenora.com/founding`, currently LIVE).

### Freelance income (parallel)

- `uncdevelopment.com` (live, full CI/CD via Vercel)
- LinkedIn outreach as solo full-stack engineer
- Locked niche: solo full-stack engineer who ships consumer mobile apps with AI integration for indie founders in 4–6 weeks

### Apple Developer Organization conversion

- Currently Individual; conversion to Organization under UNCC Inc. is a deliberate hold (see §7 Deliberate holds table)
- D-U-N-S Number received
- Paid Apps Agreement signing deferred until mobile app reaches submission-ready state
- W-9 cancelled during Individual enrollment due to entity mismatch; resubmit under UNCC Inc. after Org conversion

---

## 7. Known blockers and pre-launch wiring gaps

These prevent specific work from shipping until resolved. Cross-reference with PRODUCT_MAP.md §7.

| Blocker | Affects | Notes |
|---|---|---|
| Premium env vars missing | All Stripe Premium subscription checkouts | `NUXT_STRIPE_PREMIUM_WEEKLY_PRICE_ID`, `_MONTHLY_PRICE_ID`, `_YEARLY_PRICE_ID` not configured |
| Mobile `purchasePackage()` not implemented | All mobile subscription purchases | RevenueCat SDK initialized but purchase invocation missing |
| RevenueCat products not yet created | Mobile launch | 5 IAPs and 3 subscriptions need RevenueCat dashboard configuration |
| Counsel cap enforced as 30/day not 30/month | Counsel monetization launch | Bug in `entitlements.ts`, must fix before Counsel ships |
| Hero images untracked in git | Fresh-clone deploy will break | DEPRECATED.md Tier 1 item 4 |
| `index-legacy.vue` actively routed and crawlable | SEO, brand strategy | DEPRECATED.md Tier 1 item 1 |
| `sandbox/redesign-home.vue` publicly accessible | Brand control | DEPRECATED.md Tier 1 item 2 |
| `/compatibility-quiz` lacks noindex | SEO | DEPRECATED.md Tier 1 item 3 |

### Deliberate holds (not blockers — paused by founder decision until mobile ready)

| Hold | Why deferred | When to resume |
|---|---|---|
| Apple Developer Organization conversion | D-U-N-S received; founder choice to convert from Individual → Organization (UNCC Inc.) together with founder when mobile app is 100% ready to ship | When mobile reaches submission-ready state |
| Paid Apps Agreement signing | Tied to Apple Org conversion above | Same trigger |
| W-9 / Apple tax forms resubmission | Cancelled during Individual enrollment due to entity mismatch; resubmit under UNCC Inc. after Org conversion | Same trigger |

---

## 8. What's deliberately NOT in the master documents

The following live elsewhere or in conversation. They must NOT drift into `docs-V1/`:

- Fundraising specifics — pitches, decks, investor lists, financial models
- Ad campaign creatives — TikTok and Meta creative briefs, ad copy, CPM data
- Audit reports — point-in-time codebase scans (inputs to documents, not documents)
- Implementation execution plans — phase-by-phase work breakdowns
- Architecture diagrams, infrastructure topology
- Onboarding documentation, dev environment setup guides
- Meeting notes, journals, conversation transcripts
- Personal context, financial planning, tax decisions

If asked to put one of these in `docs-V1/`, redirect to a more appropriate location.

---

## 9. Communication norms

- Direct, business-focused tone. No padding.
- When the founder provides a screenshot, USE it. Do not ask yes/no questions about state the screenshot already resolves.
- When the founder says "let's create a prompt for Windsurf to do X," the response is a prompt, not a question about what X should look like.
- Pull weight in strategic conversations. Do not be a yes-machine.
- When pushing back, be direct. Excessive apologizing is itself a communication failure.
- When the founder pushes back on a Claude position, the pushback is signal — re-examine, do not capitulate reflexively.

---

*This document is the operational entry point. It updates when working assumptions change (repo paths, stack, workflow rules, blockers). It does NOT update when strategy or product decisions change — those go in STRATEGY.md, PRODUCT_MAP.md, DESIGN_SYSTEM.md, PAGES_AND_SECTIONS.md, or DEPRECATED.md.*
