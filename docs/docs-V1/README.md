# OMENORA — Master Documents

> Single source of truth for OMENORA's strategy, product catalog, design system, page architecture, and cleanup state.
> Every implementation decision must trace back to a document in this directory.
> If code and documents conflict, code is wrong.

---

## The documents

CONTEXT.md is the orientation entry point. The five master documents below cover strategic, product, design, page, and deprecation references.

| Document | Role | What it answers |
|---|---|---|
| [CONTEXT.md](./CONTEXT.md) | **Orientation (read first)** | Repo paths, tech stack, workflow discipline, current phase, known blockers. The operational context Claude needs to start work without asking clarifying questions. |
| [STRATEGY.md](./STRATEGY.md) | Strategic | **Why.** What OMENORA is, who it serves, how it makes money, what we are not selling. The locked strategic direction. |
| [PRODUCT_MAP.md](./PRODUCT_MAP.md) | Strategic | **What.** Every product, SKU, funnel surface, and price, with current status (LIVE / PRE-LAUNCH / DEPRECATED). |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Strategic | **How (visual).** Atoms, sections, composables, tokens, utilities. The visual operating system. |
| [PAGES_AND_SECTIONS.md](./PAGES_AND_SECTIONS.md) | Strategic | **Where.** Every page in the codebase with strategic role, redesign status, and section-by-section content lock. |
| [DEPRECATED.md](./DEPRECATED.md) | Strategic | **What to remove.** Consolidated cleanup list with file:line evidence and tier-ranked removal sequence. |

---

## Reading order

Read in this order the first time:

1. **CONTEXT.md** — orientation: repo paths, stack, workflow, current phase
2. **STRATEGY.md** — establishes the why
3. **PRODUCT_MAP.md** — instantiates the why as a product catalog
4. **DESIGN_SYSTEM.md** — establishes the visual primitives
5. **PAGES_AND_SECTIONS.md** — applies primitives to pages, with strategic role per page
6. **DEPRECATED.md** — what doesn't fit anymore

After the first read, jump directly to the document that answers your current question.

---

## How to use them together

### Starting a new task

Before any implementation work begins, the relevant master documents must be read. Specifically:

- **Repo / stack / workflow / blocker questions** ("where does the mobile app live?", "is RevenueCat configured?") → CONTEXT.md
- **Strategy questions** ("should we add a daily archetype to the free page?") → STRATEGY.md
- **Pricing or SKU questions** ("what does the $20 founding deposit get the buyer?") → PRODUCT_MAP.md
- **Component or token questions** ("which section molecule do I use for a testimonial block?") → DESIGN_SYSTEM.md
- **Page content questions** ("what should the hero headline say?") → PAGES_AND_SECTIONS.md §2
- **Cleanup questions** ("should I delete this file?") → DEPRECATED.md

If the answer is not in the documents, the answer is not yet locked. Do not invent it. Raise the question explicitly so it can be locked in the appropriate document before the work proceeds.

### Writing prompts for Windsurf

Two prompt types only:

1. **Audit prompts** — read-only research. Windsurf inventories the codebase against the locked documents and returns a factual report into chat. Audit prompts must explicitly forbid file creation or modification.
2. **Execution prompts** — built from audit findings plus locked decisions in the master documents. No new strategic content invented at execution time.

Prompts must not ask Windsurf strategy questions. Strategic questions are resolved before the prompt is written, by reading the master documents or by explicitly updating them.

### When documents conflict

The hierarchy is:

1. STRATEGY.md is supreme. When STRATEGY.md and any other document conflict, STRATEGY.md wins.
2. PRODUCT_MAP.md, DESIGN_SYSTEM.md, PAGES_AND_SECTIONS.md, and DEPRECATED.md must all be consistent with STRATEGY.md.
3. When two non-STRATEGY documents conflict, the conflict is itself a bug — flag it and resolve before further work.

### When documents and code conflict

Documents win. The code is brought into alignment with the documents, not the other way around. If the documents are wrong, they are updated first (by explicit decision), then the code is changed to match.

---

## What's NOT in this directory

The documents in `docs-V1/` are the canonical strategic, product, design, page, and deprecation references. They are not the only documentation in the repository.

Out of scope for `docs-V1/`:

- **Implementation plans** — phase-by-phase execution plans live alongside the code, not here
- **Architecture documents** — backend architecture, infrastructure, deployment topology
- **API documentation** — endpoint references, schema definitions
- **Onboarding documentation** — setup guides, dev environment instructions
- **Mobile-specific specs** — `mobile-app/docs/` holds mobile implementation specs (e.g. `MONETIZATION_SPEC_V4.md` which is referenced by `PRODUCT_MAP.md` here)
- **Audit reports** — point-in-time codebase audits used as input to these documents
- **Meeting notes, journals, conversation transcripts**

If it's not strategy, product catalog, design system, page architecture, or deprecation — it doesn't belong in `docs-V1/`.

---

## Updating these documents

These documents are not living style guides that drift. They are locked references. Each one ends with the line:

> *This document does not change without an explicit decision.*

That language is enforced. An update to any document in `docs-V1/` must be:

1. **Triggered by an explicit decision**, not by a passing thought
2. **Consistent across documents** — if STRATEGY changes, PRODUCT_MAP and PAGES_AND_SECTIONS must be updated to match in the same change
3. **Reflected in DEPRECATED.md** when an update creates new deprecations

When in doubt, write the proposed update, walk away for an hour, come back and decide. If the change is real, it survives the hour. If it doesn't, it wasn't a decision — it was noise.

---

*This document is the master index. It updates only when documents are added, removed, or restructured.*
