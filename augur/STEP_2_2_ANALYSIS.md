# STEP 2.2 ANALYSIS — Insertion point audit for `optional_items` in `create-compatibility-payment.post.ts`

**Date:** 2026-05-01 | **Scope:** Read-only inspection of `server/api/create-compatibility-payment.post.ts`

---

## 1. Total line count

**142 lines.**

---

## 2. Lines 80–110 verbatim

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:80-110
      mode: 'subscription',
      success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`,
      cancel_url:  `${base}/compatibility?canceled=1`,
      customer_email: isValidEmail(email) ? email : undefined,
      metadata,
    }
  } else if (tier === 'single') {
    sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'OMENORA Compatibility Reading', description: 'Destiny Compatibility Analysis' },
          unit_amount: 1799,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`,
      cancel_url:  `${base}/compatibility?canceled=1`,
      customer_email: isValidEmail(email) ? email : undefined,
      metadata,
    }
  } else {
    // tier === 'legacy' — identical to the original implementation
    sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'OMENORA Compatibility Reading', description: 'Destiny Compatibility Analysis' },
```

---

## 3. Exact line numbers for key landmarks

| Landmark | Line |
|---|---|
| `} else if (tier === 'single') {` | **86** |
| Opening of `sessionParams = {` in single branch | **87** |
| Closing brace of `sessionParams` object (`    }`) | **102** |
| Closing brace of the `else if` block (`  }`) — shared with `} else {` opener | **103** (the `} else {` line closes the single branch and opens the legacy branch) |

For precision: the `else if` block body spans lines 87–102. Line 103 is `  } else {` — this is the first character of the legacy branch, which simultaneously closes the single branch.

---

## 4. `useRuntimeConfig` — location and access pattern

**Called at line 7:**

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:7-12
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // ── Raw field extraction ──────────────────────────────────────────────────

  const firstName   = sanitizeString(body.firstName, 50)
```

**Answers:**
- The variable name is `config`.
- Config values are **NOT** destructured into local consts. They are referenced **inline as `config.someKey`** at the point of use. Evidence: line 44 uses `config.stripeCompatPlusPriceId` inline in the `assertInput`, and line 79 uses `config.stripeCompatPlusPriceId as string` inline inside the `line_items` array. No `const stripeCompatPlusPriceId = config.stripeCompatPlusPriceId` pattern exists anywhere in the file.

---

## 5. The `tier === 'subscription'` branch — full quote

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:76-85
  if (tier === 'subscription') {
    sessionParams = {
      payment_method_types: ['card'],
      line_items: [{ price: config.stripeCompatPlusPriceId as string, quantity: 1 }],
      mode: 'subscription',
      success_url: `${base}/compatibility?session_id={CHECKOUT_SESSION_ID}&from=quiz`,
      cancel_url:  `${base}/compatibility?canceled=1`,
      customer_email: isValidEmail(email) ? email : undefined,
      metadata,
    }
  }
```

**How `config.stripeCompatPlusPriceId` is referenced:**
- **Line 44** (guard): `assertInput(!!config.stripeCompatPlusPriceId, 'Subscription price not configured')`
- **Line 79** (in `line_items`): `{ price: config.stripeCompatPlusPriceId as string, quantity: 1 }`

**Pattern to mirror for `stripeCompatCalendarBumpPriceId`:**
- Inline reference: `config.stripeCompatCalendarBumpPriceId as string`
- Cast: `as string` (same cast used on all other Stripe price ID config values)
- Guard: the subscription branch has a guard `assertInput(!!config.stripeCompatPlusPriceId, ...)` at line 44. The `optional_items` bump price is not a blocking guard (the single reading can proceed without the bump if the env var is absent) — so **no equivalent `assertInput` guard is needed** for the bump price. An absent bump price should simply omit the `optional_items` array from `sessionParams`, not throw.

---

## 6. Top-level keys in the single-tier `sessionParams` object literal

In order of appearance (lines 87–102):

1. `payment_method_types` — line 88
2. `line_items` — line 89
3. `mode` — line 97
4. `success_url` — line 98
5. `cancel_url` — line 99
6. `customer_email` — line 100
7. `metadata` — line 101

**Total: 7 keys.** `optional_items` will become the 8th key, to be inserted after `metadata` (line 101) as the last key before the closing brace on line 102 — or after `mode` and before `success_url`, depending on preferred Stripe param ordering. The Stripe API accepts any key order; by convention, optional/additive params come last. Recommended position: **after `metadata`, as the last key before the closing brace.**

---

## 7. Indentation style

- **Style:** 2-space indentation for the `sessionParams` object body (all lines 88–101 start with 6 spaces: 2 for handler body + 2 for the `else if` block + 2 for the object body).
- Evidence: lines 88–101 all use exactly 6 leading spaces.
- Top-level handler body: 2-space indent (lines 7–141).
- `if`/`else if` block body: 4-space indent (lines 77–121).
- `sessionParams` object keys: 6-space indent (lines 88–101).
- Nested structures (e.g., `price_data` block, lines 90–94): 8 spaces.
- **No tabs anywhere.** Matches surrounding code exactly.

---

## 8. Zero-hit confirmation for new identifiers

- `optional_items` — **0 matches** in the file.
- `stripeCompatCalendarBumpPriceId` — **0 matches** in the file.

Both confirmed clean. The insertion is additive only.

---

## 9. TypeScript type annotation on `sessionParams`

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/create-compatibility-payment.post.ts:74
  let sessionParams: Stripe.Checkout.SessionCreateParams
```

**Line 74.** The variable is declared with the explicit type `Stripe.Checkout.SessionCreateParams`. The `optional_items` key is part of `Stripe.Checkout.SessionCreateParams` in the installed SDK (`stripe@22.0.1`). No type cast will be needed as long as the SDK type definitions include `optional_items` for this API version. If the TypeScript compiler rejects it (SDK types lagging the API version), the same `as any` cast used elsewhere (e.g., lines 71, in other endpoints) can be applied locally to `optional_items`.

---

## 10. Conditional guards and early returns before the single-tier branch

In order of execution (lines 7–85), the following guards can prevent reaching the `tier === 'single'` branch:

| Line | Condition | Action if triggered |
|---|---|---|
| 34 | `!firstName` | Throws `400 assertInput` error |
| 35 | `!partnerName` | Throws `400 assertInput` error |
| 36 | `!isValidRedirectOrigin(originRaw)` | Throws `400 assertInput` error |
| 38–40 | `partnerDob` present but invalid date format | Throws `400 assertInput` error |
| 43–45 | `tier === 'subscription'` + `!config.stripeCompatPlusPriceId` | Throws `400 assertInput` — **only fires when `tier === 'subscription'`**, not `'single'` |

**Conclusion for the `tier === 'single'` path:** The only guards that fire before reaching line 86 are the four input validation assertions (lines 34–40). The subscription price guard (lines 43–45) is scoped to `tier === 'subscription'` and does not run for `tier === 'single'`. No early return between lines 7 and 86 is gated on the new `stripeCompatCalendarBumpPriceId` env var — because it does not exist yet. At runtime, if `NUXT_STRIPE_COMPAT_CALENDAR_BUMP_PRICE_ID` is absent from the environment, `config.stripeCompatCalendarBumpPriceId` will be an empty string `''` (per the `nuxt.config.ts` default set in STEP 2.1). The `optional_items` array must therefore be conditionally included (only when the value is non-empty) to avoid passing an invalid empty price ID to Stripe.

---

## QUESTIONS FOR HUMAN

1. **`optional_items` key position:** Should the new `optional_items` key be inserted as the **last key** in the single-tier `sessionParams` object (after `metadata`, before the closing brace on line 102), or is a different position preferred?

2. **Guard for missing bump price ID:** When `config.stripeCompatCalendarBumpPriceId` is an empty string (env var not yet set in Railway), should the session be created **without the bump** (silent omit — best for staged rollout) or should it **throw** to block session creation? The analysis recommends silent omit. Confirm?

3. **TypeScript `as string` cast:** The subscription branch uses `config.stripeCompatPlusPriceId as string`. The `optional_items` price reference should use the same `as string` cast. Confirm?

4. **`optional_items` Stripe TypeScript types:** SDK version 22.0.1 with API `2026-03-25.dahlia` — should we verify at edit time that `Stripe.Checkout.SessionCreateParams.optional_items` type exists, or proceed with `as any` if the compiler rejects it?
