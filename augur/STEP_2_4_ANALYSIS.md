# STEP 2.4 ANALYSIS — Pixel block audit in `compatibility.vue` for `amountTotal` wiring

**Date:** 2026-05-02 | **Scope:** Read-only inspection of `app/pages/compatibility.vue`

---

## 1. Lines 820–920 verbatim

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:820-920

  // CASE A — post-payment (only reachable when preview/canceled are both absent)
  if (!isPreview && !isCanceled && sessionId) {
    isLoading.value = true
    try {
      const paymentData = await $fetch<{
        paid: boolean
        customerEmail: string | null
        metadata: Record<string, string> | null
      }>('/api/verify-payment', {
        method: 'POST',
        body: { sessionId },
      })

      if (!paymentData.paid) {
        await navigateTo('/report')
        return
      }

      const meta = paymentData.metadata || {}
      if (!store.firstName)    store.setPersonalInfo(meta.firstName || '', meta.dateOfBirth || store.dateOfBirth, store.city)
      if (!store.dateOfBirth && meta.dateOfBirth) store.setPersonalInfo(store.firstName, meta.dateOfBirth, store.city)
      if (!store.email)        store.setEmail(meta.email || paymentData.customerEmail || '')
      if (!store.partnerName)  store.setPartnerData({ name: meta.partnerName || '', dob: meta.partnerDob || store.partnerDob, city: meta.partnerCity || store.partnerCity })
      if (!store.partnerDob && meta.partnerDob)   store.setPartnerData({ name: store.partnerName, dob: meta.partnerDob, city: meta.partnerCity || store.partnerCity })
      if (!store.tempId)       store.setTempId(meta.tempId || '')
      if (!store.languageManualOverride && meta.language) store.setLanguage(meta.language)

      const { compatibility: data } = await $fetch<{
        success: boolean
        compatibility: any
      }>('/api/generate-compatibility', {
        method: 'POST',
        body: {
          firstName:      store.firstName,
          dateOfBirth:    store.dateOfBirth || meta.dateOfBirth || '',
          archetype:      store.archetype   || undefined,
          element:        store.report?.element        || undefined,
          lifePathNumber: store.lifePathNumber          || undefined,
          powerTraits:    store.report?.powerTraits     || undefined,
          partnerName:    store.partnerName,
          partnerDob:     store.partnerDob,
          partnerCity:    store.partnerCity,
          language:       store.language,
          previewMode:    false,
        },
      })

      compatibility.value = data

      if (store.email) {
        try {
          await $fetch('/api/send-compatibility-email', {
            method: 'POST',
            body: {
              email:       store.email,
              firstName:   store.firstName,
              partnerName: store.partnerName,
              compatibility: data,
              language:    store.language,
              tier:        meta.tier || '',
            },
          })
        } catch {
          console.error('Compatibility email failed')
        }
      }

      // Silently provision Supabase Auth account (non-blocking)
      provisionUser({ sessionId }).catch(() => {})

      // Persist reading to DB so it appears in account history (fire-and-forget, never blocks render)
      $fetch('/api/save-compatibility-reading', {
        method: 'POST',
        body: {
          sessionId,
          email:             store.email || paymentData.customerEmail || '',
          firstName:         store.firstName || '',
          partnerName:       store.partnerName || '',
          partnerDob:        store.partnerDob || '',
          compatibilityData: compatibility.value,
          language:          store.language || 'en',
        },
      }).catch(() => {}) // fire-and-forget, never blocks reading render

      // Fire purchase pixel events (dedup guard prevents double-firing on re-mount)
      try {
        const pixelKey = `omenora_purchase_tracked_${sessionId}`
        if (!sessionStorage.getItem(pixelKey)) {
          sessionStorage.setItem(pixelKey, '1')
          const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)
          $trackPurchase?.({
            value: purchaseValue,
            currency: 'USD',
            content_name: meta.tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
          })
        }
      } catch { /* never block UI */ }

      isLoading.value = false
    } catch {
```

---

## 2. `$fetch` generic declaration

**Lines 825–832:**

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

The generic type is an inline anonymous object type on lines 825–828. It has **3 fields**: `paid`, `customerEmail`, `metadata`. **`amountTotal` and `currency` are absent** — this is the type that must be updated to receive the new fields.

---

## 3. All uses of `paymentData` in scope

`paymentData` is declared with **`const`** at line 825, inside the `try` block that starts at line 824, inside the `if (!isPreview && !isCanceled && sessionId)` block at line 822, inside `onMounted`.

| Line | Use | Field accessed |
|---|---|---|
| 825 | Declaration | — |
| 834 | `if (!paymentData.paid)` | `.paid` |
| 839 | `const meta = paymentData.metadata \|\| {}` | `.metadata` → aliased to `meta` |
| 842 | `store.setEmail(meta.email \|\| paymentData.customerEmail \|\| '')` | `.customerEmail` |
| 896 | `email: store.email \|\| paymentData.customerEmail \|\| ''` | `.customerEmail` |

**`paymentData` is still in scope at line 910** (the pixel block). The `try` block containing `paymentData` does not close until line 920 (`} catch {`). The pixel block (lines 905–917) is inside the same `try` scope. Both `paymentData` and `meta` are accessible at line 910.

**Summary of where each field is read:**

- `paymentData.paid` — line 834 (guard)
- `paymentData.metadata` — line 839 (aliased to `meta`)
- `paymentData.customerEmail` — lines 842 and 896

**`paymentData` is NOT referenced anywhere after line 896.** Specifically, it is not referenced at or near the pixel block (lines 905–917). The pixel block uses only `meta` (the alias).

---

## 4. Full pixel block with context (lines 903–919)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:903-919
      }).catch(() => {}) // fire-and-forget, never blocks reading render

      // Fire purchase pixel events (dedup guard prevents double-firing on re-mount)
      try {
        const pixelKey = `omenora_purchase_tracked_${sessionId}`
        if (!sessionStorage.getItem(pixelKey)) {
          sessionStorage.setItem(pixelKey, '1')
          const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)
          $trackPurchase?.({
            value: purchaseValue,
            currency: 'USD',
            content_name: meta.tier === 'subscription' ? 'Compatibility Plus Subscription' : 'Compatibility Reading',
          })
        }
      } catch { /* never block UI */ }

      isLoading.value = false
    } catch {
```

---

## 5. Exact value at line 910 — confirmed

```
@/Volumes/ESSD/Projects/Augur-V1/augur/app/pages/compatibility.vue:910
          const purchaseValue = meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)
```

**Matches exactly.** No drift from the Step 1 analysis.

---

## 6. Scope analysis

- **`paymentData` declared as:** `const` (line 825)
- **Scoped to:** the `try` block opened at line 824, inside `if (!isPreview && !isCanceled && sessionId)` at line 822, inside `onMounted`
- **`try` block closes at:** line 920 (`} catch {`)
- **`meta` declared at:** line 839 (`const meta = paymentData.metadata || {}`) — `const`, same `try` scope
- **Is `meta` accessible at line 910?** **Yes.** `meta` is declared at line 839 and the pixel block is at lines 905–917, both within the same `try` scope.
- **Is `paymentData` accessible at line 910?** **Yes.** `paymentData` is also in scope at line 910 — same `try` block, declared before any `return` that could have exited. The early return at line 835–836 only fires if `!paymentData.paid`, so reaching line 910 guarantees `paymentData` is still in scope and `.paid` is `true`.

**Conclusion:** Both `paymentData.amountTotal` (once the generic is updated) and `meta` are fully accessible at line 910. Either can be used in the new `purchaseValue` expression.

---

## 7. Existing uses of `amountTotal` / `amount_total` in `compatibility.vue`

- **`amountTotal`:** **0 hits.**
- **`amount_total`:** **0 hits.**

Clean — no prior reference exists. The field is new and will be wired for the first time.

---

## 8. All `$trackPurchase` / `trackPurchase` / `Purchase` hits

| Line | Content |
|---|---|
| 440 | `const { $trackCustomEvent, $trackInitiateCheckout, $trackPurchase, $identifyUser, $trackCompatibilityPaywallView } = useNuxtApp() as any` — plugin destructuring |
| 910 | `const purchaseValue = meta.tier === 'subscription' ? 9.99 : ...` — `purchaseValue` assignment inside pixel block |
| 911 | `$trackPurchase?.({` — the actual pixel fire |

**Only one `$trackPurchase` call exists in the file** (line 911). No second purchase pixel event exists for the bump specifically. No `trackPurchase` (non-`$` prefix) hit exists.

---

## 9. All hardcoded numeric price values in the file

| Line | Expression | Context |
|---|---|---|
| 696 | `value: tier === 'subscription' ? 9.99 : 17.99` | `$trackInitiateCheckout` — fires at checkout button click, **before** payment |
| 703 | `value: tier === 'subscription' ? 9.99 : 17.99` | `trackEvent('initiate_checkout', ...)` — fires at checkout button click |
| 910 | `meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99)` | `purchaseValue` — the post-payment pixel value to be updated |

**Lines 696 and 703** are in `handleCheckout` (the function that fires when the user clicks the pay button, before Stripe Checkout redirects). These are **pre-payment intent signals** — they fire before any actual money changes hands. They are intentionally hardcoded and are **out of scope for this step** — they cannot know the actual paid amount since payment hasn't happened yet.

**Line 910** is the only post-payment purchase value and is the correct target for this step.

---

## QUESTIONS FOR HUMAN

1. **Defensive fallback wording:** The new `purchaseValue` expression should prefer `paymentData.amountTotal` when available, falling back to the hardcoded ternary. The recommended expression is:
   ```typescript
   const purchaseValue = paymentData.amountTotal ?? (meta.tier === 'subscription' ? 9.99 : (meta.tier === 'single' ? 17.99 : 2.99))
   ```
   `paymentData.amountTotal` is `null` when Stripe returns `null` for `amount_total` (e.g., in some subscription session states). The `??` (nullish coalescing) operator correctly falls back to the hardcoded ternary for both `null` and `undefined`. Confirm this expression, or prefer a different fallback strategy?

2. **`currency` field on the pixel call:** The current `$trackPurchase` call hardcodes `currency: 'USD'` (line 913). The endpoint now returns `paymentData.currency` (e.g., `'usd'`). Pixel platforms (Meta, TikTok) typically expect uppercase. Should we:
   - **(A)** Leave `currency: 'USD'` hardcoded (simplest, correct for all current transactions)
   - **(B)** Use `currency: (paymentData.currency ?? 'usd').toUpperCase()` to dynamically use the session currency
   Which?

3. **`$fetch` generic update:** The inline generic type at lines 825–828 must be updated to add `amountTotal: number | null` (and optionally `currency: string | null`). The generic update is required for TypeScript to accept `paymentData.amountTotal` without a type error. Confirm the field name `amountTotal: number | null` and whether `currency: string | null` should also be added to the generic.

4. **`content_name` for bump purchases:** When the buyer adds the calendar bump, `meta.tier` is still `'single'` and `content_name` fires as `'Compatibility Reading'`. Should the `content_name` also be updated (e.g., `'Compatibility Reading + Calendar'` when the actual amount is $22.98 vs $17.99)? Or leave `content_name` as-is for this step?
