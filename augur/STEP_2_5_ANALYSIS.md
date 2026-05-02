# STEP 2.5 ANALYSIS — Webhook branch insertion audit for compatibility bump delivery

**Date:** 2026-05-02 | **Scope:** Read-only inspection of `server/api/stripe/webhook.post.ts`

---

## Section A — Webhook file overview

### A.1 Total line count

**1089 lines.**

### A.2 Import block (lines 1–12)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:1-12
import Stripe from 'stripe'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema'
import { sendReportEmail } from '~~/server/utils/report-email-builder'
import { buildTestimonialRequestEmail } from '~~/server/utils/email-templates'
import { ReportSchema, CalendarSchema, type ReportType, type CalendarType } from '~~/server/utils/ai-schemas'
import { withAiRetry } from '~~/server/utils/ai-retry'
import { inngest, subscriberWelcomeSend, stripeCheckoutCompleted } from '~~/inngest/client'
import type { createSupabaseAdmin as _createSupabaseAdmin } from '~~/server/utils/auth'
```

**Key imports for our task:**
- `Stripe` (line 1) — needed for `stripe.checkout.sessions.listLineItems`
- `createSupabaseAdmin` type (line 10) — needed for calendar dedup check
- `CalendarSchema` and `CalendarType` (line 7) — used by `generateCalendar`
- `sendReportEmail` (line 5) — the final email function that accepts `calendarData`

### A.3 Stripe initialization (lines 61–65)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:61-65
  const stripe = new Stripe(config.stripeSecretKey as string, {
    // Stripe SDK type does not yet include this pre-release API version string.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2026-03-25.dahlia' as any,
  })
```

The `stripe` constant is available throughout the handler. No changes needed.

### A.4 Event-type dispatcher (lines 97–230)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:97-230
  if (stripeEvent.type === 'invoice.payment_failed') {
    // ... deactivate subscriber
    return { received: true }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    // ... deactivate subscriber
    return { received: true }
  }

  // ── B-4: Chargeback logging ────────────────────────────────────────────────
  if (stripeEvent.type === 'charge.dispute.created') {
    // ... structured logging
    return { received: true }
  }

  // ── B-4: Refund logging ──────────────────────────────────────────────────────
  if (stripeEvent.type === 'charge.refunded') {
    // ... structured logging
    return { received: true }
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { received: true }
  }
```

All event handlers return `{ received: true }` and exit. The `checkout.session.completed` handler continues after line 230.

---

## Section B — The `checkout.session.completed` handler structure

### B.1 Handler entry point (line 228)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:228-236
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { received: true }
  }

  const session = stripeEvent.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return { received: true }
  }
```

The handler begins at line 232 after the early-return guards.

### B.2 Metadata access (line 238)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:238-240
  const meta = session.metadata ?? {}
  const sessionId = session.id
```

`meta` is the metadata object we will match against.

### B.3 Subscription branch (lines 267–379)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:267-279
  // ── Handle subscription checkout — save subscriber + send welcome insight ──
  // Covers both the archetype subscription flow (meta.type === 'subscription')
  // and the compatibility subscription flow (meta.type === 'compatibility' && meta.tier === 'subscription').
  if (meta.type === 'subscription' || (meta.type === 'compatibility' && meta.tier === 'subscription')) {
    const subEmail     = session.customer_details?.email || meta.email || ''
    const subFirstName = sanitizeString(meta.firstName || '', 50)
    const subArchetype = sanitizeString(meta.archetype || '', 30)
    const subLPN       = Number.parseInt(meta.lifePathNumber || '0', 10) || 0
    const subCustomer  = session.customer as string
    const subId        = session.subscription as string

    const planType = (meta.type === 'compatibility' && meta.tier === 'subscription')
      ? 'compatibility_plus'
      : 'daily_horoscope'
```

The subscription branch:
- **Match condition:** `meta.type === 'subscription' || (meta.type === 'compatibility' && meta.tier === 'subscription')`
- **Actions:** Saves subscriber via `/api/save-subscriber`, fires `subscriberWelcomeSend` Inngest event
- **Return:** `return { received: true }` at line 379

### B.4 Bundle and Oracle branches (lines 404–405, 816–855)

**Match flags (lines 404–405):**
```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:404-405
  const isBundlePurchase  = meta.bundle === 'true'
  const isOraclePurchase  = meta.oracle === 'true'
```

**Calendar delivery code (inside `sendReportEmailViaWebhook`, lines 816–855):**
```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:816-855
  // ── Generate calendar for bundle/oracle purchases ────────────────────────
  let calendarData: unknown = null
  if ((opts.isBundlePurchase || opts.isOraclePurchase) && opts.dateOfBirth && opts.firstName) {
    try {
      // Check if already saved to calendars table first
      const { data: existingCal } = await supabase
        .from('calendars')
        .select('calendar_data')
        .eq('session_id', sessionId)
        .maybeSingle()

      if (existingCal?.calendar_data) {
        calendarData = existingCal.calendar_data
      } else {
        calendarData = await generateCalendar({
          config: opts.config,
          firstName: opts.firstName,
          archetype: opts.archetype,
          element: reportToSend.element,
          lifePathNumber: opts.lifePathNumber,
          answers: opts.answers || {},
          dateOfBirth: opts.dateOfBirth,
          language: opts.language,
        })
        if (calendarData) {
          const { error: calSaveErr } = await supabase.from('calendars').upsert({
            session_id: sessionId,
            first_name: opts.firstName,
            calendar_data: calendarData,
            created_at: new Date().toISOString(),
          }, { onConflict: 'session_id' })
          if (calSaveErr && calSaveErr.code !== '23505' && calSaveErr.code !== 'PGRST204') {
            console.error('[stripe-webhook] Calendar save error:', calSaveErr.code)
          }
        }
      }
    } catch (calErr: unknown) {
      console.error('[stripe-webhook] Calendar generation failed (non-blocking):', calErr instanceof Error ? calErr.message : String(calErr))
    }
  }
```

**Key observations:**
- Bundle and oracle **share the same calendar generation path** — the condition `opts.isBundlePurchase || opts.isOraclePurchase` triggers it
- The calendar is **generated via `generateCalendar`** (inline function, lines 936–1088)
- Calendar data is **saved to `calendars` table** with `session_id` as the primary key
- **Deduplication**: First checks `calendars` table for existing `calendar_data` by `session_id`
- **Error handling**: Non-blocking `try/catch` with console.error; does not prevent email delivery

### B.5 Fall-through natal report path (starts at line 382)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:382-392
  // ── Check idempotency: skip if report already saved & email sent ───────────
  const supabase = createSupabaseAdmin()
  const { data: existing } = await supabase
    .from('reports')
    .select('id, email_sent')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (existing?.email_sent) {
    return { received: true, skipped: 'already_processed' }
  }
```

The fall-through path starts at line 382 with the idempotency check. This is **after** the subscription branch and **before** any natal report processing. Our new compatibility-bump branch must be inserted **before line 382** to avoid falling into the natal report logic.

---

## Section C — Calendar delivery infrastructure

### C.1 The `generateCalendar` function (lines 936–1088)

The function is **inline in webhook.post.ts** (not imported). Full signature:

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:936-945
async function generateCalendar(opts: {
  config: WebhookRuntimeConfig
  firstName: string
  archetype: string
  element: string
  lifePathNumber: number
  answers: Record<string, string>
  dateOfBirth: string
  language: string
}): Promise<CalendarType>
```

### C.2 Required input parameters

| Parameter | Type | Source for compatibility-single session |
|---|---|---|
| `config` | `WebhookRuntimeConfig` | Available as `config` (line 45) |
| `firstName` | `string` | `meta.firstName` (line 395) |
| `archetype` | `string` | `meta.archetype` (line 396) |
| `element` | `string` | `reportToSend.element` (from natal report) — **not available in compatibility-single** |
| `lifePathNumber` | `number` | `meta.lifePathNumber` (line 401) |
| `answers` | `Record<string, string>` | Empty object `{}` for compatibility (no quiz answers) |
| `dateOfBirth` | `string` | `meta.dateOfBirth` (line 400) |
| `language` | `string` | `meta.language` (line 403) |

**Critical gap:** `element` is required but compatibility-single sessions do not have `element` in metadata. Bundle/oracle sessions have `element` because they are natal report purchases. Compatibility sessions are compatibility-focused, not natal-focused.

### C.3 Implementation type

**Inline function in webhook.post.ts** (not imported, not HTTP fetch). The function calls Anthropic Claude directly using the imported `Anthropic` SDK (line 946).

### C.4 Side effects

- **Database write:** Saves to `calendars` table (lines 841–846)
- **Third-party service:** Calls Anthropic Claude API (line 1047)
- **No email sending:** Email sending happens later in `sendReportEmail` (line 910) which receives `calendarData` as a parameter

### C.5 Deduplication guard

Lines 821–828 check `calendars` table for existing `calendar_data` by `session_id`. If present, it reuses the existing data instead of regenerating.

### C.6 Error handling

Non-blocking `try/catch` (lines 852–854). Errors are logged but do not prevent the webhook from returning 200.

---

## Section D — Stripe line items inspection

### D.1 Existing usage of `listLineItems`

**Zero hits.** The current webhook never calls `stripe.checkout.sessions.listLineItems`. This will be a new addition.

### D.2 Config access pattern (line 45)

```
@/Volumes/ESSD/Projects/Augur-V1/augur/server/api/stripe/webhook.post.ts:45
  const config = useRuntimeConfig()
```

`config` is available throughout the handler. `config.stripeCompatCalendarBumpPriceId` will be available at runtime after Step 2.1.

---

## Section E — Compatibility data in session metadata

### E.1 Reliability of key fields in compatibility-single sessions

From `create-compatibility-payment.post.ts` lines 18–20:
```
const partnerCity  = body.partnerCity  != null ? sanitizeString(body.partnerCity, 100)  : ''
const partnerDob   = body.partnerDob   != null ? sanitizeString(body.partnerDob, 10)   : ''
const dateOfBirth  = body.dateOfBirth  != null ? sanitizeString(body.dateOfBirth, 10)  : ''
```

**Analysis:**
- `dateOfBirth` (buyer's DOB): **Conditional** — only set if `body.dateOfBirth` is provided. The compatibility quiz collects buyer DOB, so it should be present in normal flow, but it's not guaranteed.
- `firstName`: **Required** (line 34 `assertInput(!!firstName, 'firstName is required')`)
- `email`: **Conditional** — set to `isValidEmail(email) ? email : ''` in metadata (line 54). Fallback available via `session.customer_email` (line 242)

### E.2 Bundle/Oracle metadata comparison

**Bundle sessions** (`create-bundle-payment.post.ts` lines 48–61):
- Include `dateOfBirth` (line 54) — **required** (line 20)
- Include `archetype` (line 50) — **required** (line 19)
- Include `element` — **NOT present** in bundle metadata (element comes from the generated natal report, not metadata)

**Oracle sessions** (`create-oracle-payment.post.ts` lines 48–62):
- Same as bundle — `dateOfBirth` and `archetype` required, `element` not in metadata

**Key insight:** Even bundle/oracle sessions do not have `element` in metadata. The `element` field comes from the **generated natal report** (`reportToSend.element` at line 834). Compatibility-single sessions do not generate a natal report, so `element` is unavailable.

---

## Section F — Out-of-scope confirmations

### F.1 Branches that will not be touched

- **Subscription branch** (lines 267–379) — unchanged
- **Fall-through natal report path** (lines 382+) — unchanged (our branch inserts before it)
- **Other event handlers** (invoice.payment_failed, customer.subscription.deleted, charge.dispute.created, charge.refunded) — unchanged
- **Bundle/oracle delivery code** — reused as-is, not modified

### F.2 Complete webhook branch inventory

| Branch | Condition | Action |
|---|---|---|
| `invoice.payment_failed` | `stripeEvent.type === 'invoice.payment_failed'` | Deactivate subscriber |
| `customer.subscription.deleted` | `stripeEvent.type === 'customer.subscription.deleted'` | Deactivate subscriber |
| `charge.dispute.created` | `stripeEvent.type === 'charge.dispute.created'` | Structured logging (B-4) |
| `charge.refunded` | `stripeEvent.type === 'charge.refunded'` | Structured logging (B-4) |
| `checkout.session.completed` → subscription | `meta.type === 'subscription' || (meta.type === 'compatibility' && meta.tier === 'subscription')` | Save subscriber + welcome email |
| `checkout.session.completed` → **NEW** | `meta.type === 'compatibility' && meta.tier === 'single'` | **(to be added) Calendar bump delivery** |
| `checkout.session.completed` → natal report | Fall-through after line 382 | Generate/save natal report + email |

Our new branch will be inserted **after the subscription branch (line 379) and before the idempotency check (line 382)**.

---

## Section G — Failure modes and observability

### G.1 Bundle/Oracle error handling pattern

From lines 852–854:
```typescript
} catch (calErr: unknown) {
  console.error('[stripe-webhook] Calendar generation failed (non-blocking):', calErr instanceof Error ? calErr.message : String(calErr))
}
```

**Pattern:** Log the error with `[stripe-webhook]` prefix and continue. The webhook still returns 200, preventing Stripe retries.

### G.2 Logging style

The webhook uses:
- `console.info` for successful operations
- `console.warn` for non-critical issues (B-4 events)
- `console.error` for failures (with structured objects)

All logs include the `[stripe-webhook]` prefix for easy filtering.

---

## QUESTIONS FOR HUMAN

1. **Missing `element` field:** The `generateCalendar` function requires `element` (from the natal report), but compatibility-single sessions do not have a natal report and thus no `element`. Options:
   - **(A)** Derive `element` from archetype (create a mapping: phoenix→Fire, storm→Air, etc.)
   - **(B)** Default `element` to 'Earth' for all compatibility calendar bumps
   - **(C)** Skip calendar generation if `element` is missing
   Which approach?

2. **Conditional `dateOfBirth` guard:** `dateOfBirth` is conditional in compatibility sessions. Should the new branch:
   - **(A)** Skip calendar generation if `dateOfBirth` is missing/empty
   - **(B)** Attempt generation anyway (Anthropic will likely fail gracefully)
   - **(C)** Log a warning and continue without calendar

3. **Calendar delivery method:** Bundle/oracle emails include the calendar as an attachment in the main report email (`sendReportEmail` receives `calendarData`). For compatibility bump buyers, should we:
   - **(A)** Include the calendar in the compatibility report email (requires modifying the compatibility email template)
   - **(B)** Send a separate calendar-only email (reuse existing calendar email logic)
   - **(C)** Do not email, only save to `calendars` table for later access on `/calendar` page

4. **Idempotency table:** Bundle/oracle calendar deduplication uses the `calendars` table with `session_id`. Should the compatibility bump branch:
   - **(A)** Use the same `calendars` table (potential conflict if same `session_id` appears with and without bump)
   - **(B)** Use a separate `calendar_bumps` table
   - **(C)** Add a `source` column to `calendars` to distinguish 'bundle' vs 'bump' vs 'oracle'

5. **Error handling severity:** Should calendar generation failure in the bump branch:
   - **(A)** Follow bundle/oracle pattern (log error, continue, return 200)
   - **(B)** Return non-200 to trigger Stripe retry (more aggressive recovery)
   - **(C)** Log error and return 200 but add a `calendar_failed: true` flag to the response for monitoring
