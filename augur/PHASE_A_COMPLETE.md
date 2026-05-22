# Phase A Complete — Design System Migration

**Date:** 2026-05-22
**Branch:** feature/b1-pricing-alignment
**Final commit:** [fill in after commit — P2.3d]

## Summary

Phase A (atom-based design system migration) is complete
for all in-scope pages. Every page in the application that
was migrated now uses atom components (AppHeadline,
AppSubhead, AppBody, AppCaption, AppEyebrow, AppButton,
AppDivider) instead of legacy utility classes
(label-caps, annotation, font-serif, font-display,
font-display-italic, font-serif-italic).

## Pages migrated (8 prompts, P2.3c1 through P2.3c7 plus
P2.3d cleanup)

- P2.3c1 (small pages): error.vue, calendar.vue,
  subscription.vue, subscribe.vue, terms.vue, privacy.vue,
  refund-policy.vue
- P2.3c2: founding/index.vue, founding/thank-you.vue
- P2.3c3: analysis.vue, compatibility-quiz.vue
  (pre-rebuild), compatibility-quiz-v2.vue
- P2.3c4: account.vue, preview.vue
- P2.3c5: daily.vue
- P2.3c6: compatibility.vue
- P2.3c7: report.vue
- P2.3d: orphaned scoped CSS cleanup

## Pages NOT yet migrated (intentionally deferred)

- **index.vue** (homepage). Contains 5 active CTAButton
  references, 1 active EditorialRule reference, and 22
  legacy utility class references. Deferred to Phase 5
  (section rebuilds), where it will be migrated as part of
  the homepage visual refinement work.

## Legacy components preserved (intentionally)

These files are still present in the codebase because
index.vue depends on them. They will be deleted during
Phase 5 after index.vue migration completes.

- augur/app/components/CTAButton.vue
- augur/app/components/EditorialRule.vue

## Global utility class definitions preserved (intentionally)

These class definitions remain in editorial.css because
index.vue still uses them. They will be deleted during
Phase 5 after index.vue migration completes.

- editorial.css line ~154: .font-display
- editorial.css line ~163: .font-display-italic
- editorial.css line ~173: .font-serif
- editorial.css line ~192: .label-caps
- editorial.css line ~212: .annotation

## Cleanup completed in P2.3d

- report.vue: 5 orphaned scoped CSS class definitions
  deleted (the page-local copies of label-caps, annotation,
  font-serif, font-serif-italic, font-display-italic that
  were used during the migration and became dead after
  P2.3c7's template swaps).
- compatibility.vue: 1 orphaned scoped CSS rule deleted
  (.compat-canceled .annotation, which targeted the canceled
  state text that P2.3c6 swapped to AppCaption).

## Verification at Phase A close

- :root token count: 99 (unchanged throughout Phase A)
- Atom files: 7 total (AppHeadline, AppSubhead, AppBody,
  AppCaption, AppEyebrow, AppButton, AppDivider) — all
  present and unmodified since Phase 2
- TypeScript typecheck: zero errors
- Dev server: all migrated pages render cleanly
- All commits local; nothing pushed to remote main branch

## Next workstream

**Phase B** — Visual refinement research and execution
(custom SVG icons, molecule library, animation infrastructure,
typography rhythm, color depth). See session notes for the
Phase B research scope.

## Phase A commit chain (newest first)

- P2.3d (this commit)
- 7e7dca3 P2.3c7 report.vue
- b0c9234 P2.3c6 compatibility.vue
- 79ed647 P2.3c5 daily.vue
- 37b5cc0 P2.3c4 account/preview
- 3bf6dda P2.3c3 quiz/analysis pages
- ad2e3cd P2.3c2 founding pages
- 195401f P2.3c1 small pages
- 4997c74 P2.3c-audit
- 288f885 P2.3b EditorialRule swap (excluded index.vue)
- d3e9ab0 P2.3a-final CTAButton swap (excluded index.vue)
- 3e7b576 P2.3a-config nuxt.config update
