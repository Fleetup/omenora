# STEP 2.3 ANALYSIS — `verify-payment` endpoint audit for order bump pixel fix

**Date:** 2026-05-01 | **Scope:** Read-only inspection of `server/api/verify-payment.post.ts` and all callers

---

## 1. Endpoint location

**Exactly one file matches:**

`server/api/verify-payment.post.ts`  
Full path: `/Volumes/ESSD/Projects/Augur-V1/augur/server/api/verify-payment.post.ts`

No nested directory variant exists. One other file (`server/api/mobile/verify-checkout-session.post.ts`) also calls `stripe.checkout.sessions.retrieve` but it is a separate mobile endpoint — not the one called by `/compatibility`.

---

## 2. Full file verbatim

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/verify-payment.post.ts:1-42
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId = sanitizeString(body.sessionId, 200)
  assertInput(isValidSessionId(sessionId), 'Invalid session ID')

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid = session.payment_status === 'paid' || session.status === 'complete'

    // Return only the fields the client legitimately needs.
    // Internal promo fields (promo_code, code_id, discount_applied, tempId,
    // original_tier) are never forwarded to the browser.
    const raw = session.metadata ?? {}
    const metadata: Record<string, string> = {}
    const ALLOWED_META_KEYS = [
      'firstName', 'archetype', 'lifePathNumber', 'region', 'language',
      'dateOfBirth', 'bundle', 'oracle', 'birth_chart', 'type',
      'tradition_switch', 'newTradition', 'reportId', 'customerId',
      'email', 'partnerName', 'partnerDob', 'partnerCity', 'tier',
    ]
    for (const key of ALLOWED_META_KEYS) {
      if (raw[key] !== undefined) metadata[key] = raw[key]!
    }

    return {
      paid,
      customerEmail: session.customer_email,
      metadata: paid ? metadata : null,
    }
  } catch {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }
})
```

**Total lines: 42.**

---

## 3. Response object

**Lines 33–37:**

```typescript
return {
  paid,
  customerEmail: session.customer_email,
  metadata: paid ? metadata : null,
}
```

**Current keys in the response:**

| Key | Type | Source |
|---|---|---|
| `paid` | `boolean` | Derived: `session.payment_status === 'paid' \|\| session.status === 'complete'` |
| `customerEmail` | `string \| null` | `session.customer_email` |
| `metadata` | `Record<string, string> \| null` | Allowlist-filtered copy of `session.metadata`; `null` when not paid |

- **`amount_total` in response:** **No** — not present.
- **`amountTotal` in response:** **No** — not present.
- **`currency` in response:** **No** — not present.

---

## 4. Stripe session retrieval

**Line 15:**

```typescript
const session = await stripe.checkout.sessions.retrieve(sessionId)
```

- **Variable name:** `session`
- **`expand` parameter:** **Not passed.** The call is bare — `retrieve(sessionId)` with no second argument. No line items or other expansions are requested.
- **Consequence:** `session.amount_total` is available directly on the session object without expansion (it is a top-level scalar field, not an expandable sub-resource). `session.currency` is also a top-level scalar. No `expand` change is needed to read either field.

---

## 5. Call site in `app/pages/compatibility.vue`

**Line 829** — the `$fetch` call:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:825-832
      const paymentData = await $fetch<{
        paid: boolean
        customerEmail: string | null
        metadata: Record<string, string> | null
      }>('/api/verify-payment', {
        method: 'POST',
        body: { sessionId },
      })
```

- **Response variable name:** `paymentData`
- **TypeScript generic type annotation on the call:** `{ paid: boolean; customerEmail: string | null; metadata: Record<string, string> | null }` (lines 826–828)
- **Fields currently read from `paymentData`:**

| Field | Where used | Line(s) |
|---|---|---|
| `paymentData.paid` | Guard — redirects to `/report` if false | 834 |
| `paymentData.metadata` | Aliased to `const meta = paymentData.metadata \|\| {}` | 839 |
| `paymentData.customerEmail` | Fallback for `store.email` if `meta.email` absent | 842 |

- **`paymentData.amountTotal` / `paymentData.amount_total`:** Neither read anywhere in `compatibility.vue`. The pixel value is computed entirely from the hardcoded ternary at line 910 (`meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)`) — `paymentData` is not referenced at the pixel block.

---

## 6. All callers of `/api/verify-payment` across the codebase

**6 call sites found** (excluding `node_modules`, `plugins` comment):

| File | Line(s) | TypeScript generic used |
|---|---|---|
| `app/pages/compatibility.vue` | 829 | `{ paid, customerEmail, metadata }` |
| `app/pages/report.vue` | 1099, 1149, 1190 | `{ paid, customerEmail, metadata }` (all three calls identical type) |
| `app/pages/report.vue` | 1738 | `{ paid, metadata }` (no `customerEmail`) |
| `app/pages/calendar.vue` | 189 | `{ paid, customerEmail, metadata }` |
| `app/pages/subscription.vue` | 91 | `{ paid, customerEmail, metadata }` |

**`plugins/store-persist.client.ts` line 129** — this is a code comment referencing the endpoint name, not a call. Does not count as a caller.

**Conclusion:** `/api/verify-payment` has **6 live call sites** across 4 page files. Adding `amountTotal` to the response is a **backwards-compatible additive change** — existing callers ignore unknown response keys. No existing caller needs to be updated unless they want to use the new field.

---

## 7. TypeScript type annotations

**Endpoint (`verify-payment.post.ts`):**
- No explicit return type annotation on the handler function. The response shape is inferred by TypeScript from the `return { paid, customerEmail, metadata }` literal at line 33.
- No shared interface or type alias is defined in this file or imported for the response shape.
- **Adding `amountTotal` and `currency` to the `return` statement requires no update to any shared type definition** — there is none. The inferred return type widens automatically.

**Callers:**
- Each call site supplies its own inline `$fetch<{ ... }>` generic type annotation (e.g., `compatibility.vue` lines 825–828). These are **local inline types**, not imported from a shared file.
- Adding fields to the server response does **not** break any caller — TypeScript generics on `$fetch` are permissive toward extra server-returned fields. The `paymentData` variable will have type `{ paid: boolean; customerEmail: string | null; metadata: Record<string, string> | null }` until the call-site generic is updated. The new fields are available at runtime on `paymentData` but not visible to TypeScript until the caller's generic is updated.
- **To use `amountTotal` in the pixel block in `compatibility.vue`, the inline type at lines 825–828 must be updated to add `amountTotal: number | null`.**

---

## 8. Strings `amount_total`, `amountTotal`, `currency` in `verify-payment.post.ts`

- **`amount_total`:** **0 hits.**
- **`amountTotal`:** **0 hits.**
- **`currency`:** **0 hits.**

All three strings are absent from the file. The retrieved `session` object carries these fields from Stripe (they are top-level scalars on `Stripe.Checkout.Session`), but none are currently read or returned.

---

## QUESTIONS FOR HUMAN

1. **Naming convention for the new response field:** The existing response uses camelCase (`customerEmail`, not `customer_email`). For consistency, the new field should be `amountTotal` (camelCase) mapping from `session.amount_total`. Confirm `amountTotal: number | null` as the field name, or prefer the Stripe snake_case `amount_total`?

2. **`currency` field — include or exclude?** `session.currency` (e.g., `'usd'`) is available at no extra cost. The pixel `$trackPurchase` call already hardcodes `currency: 'USD'`. Is there value in passing `currency` through to the client, or should only `amountTotal` be added?

3. **Callers that do NOT need `amountTotal`:** `report.vue` (3 call sites), `calendar.vue`, and `subscription.vue` all call the same endpoint. Their inline `$fetch` generics do not need updating — they will simply ignore the new field at the TypeScript level. Confirm: only `compatibility.vue` line 825–828 generic needs updating to consume `amountTotal`?

4. **`amount_total` is in cents:** `session.amount_total` returns `2298` for a $22.98 purchase (Stripe integer cents). The pixel call expects a decimal dollar value (`value: 22.98`). The conversion `(session.amount_total ?? 0) / 100` must happen either server-side (return `amountTotal` as a float) or client-side (receive integer, divide by 100 before passing to pixel). Which side should perform the conversion?
