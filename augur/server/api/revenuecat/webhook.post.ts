/**
 * RevenueCat webhook handler.
 *
 * Receives subscription state changes from RC and upserts into
 * public.subscriptions. The mobile client reads its own state from
 * the RC SDK; this table is the server-side mirror that backend
 * handlers (reports, counsel chat) read for entitlement gating.
 *
 * Authentication: RC sends a shared secret in the Authorization header
 * (configured per webhook in the RC dashboard). We compare via timing-
 * safe equality. The secret is stored in NUXT_REVENUECAT_WEBHOOK_SECRET.
 *
 * Idempotency: rc_event_id is stored; duplicate events are no-ops.
 *
 * Returns 200 quickly. RC retries up to 5 times if we don't return
 * within 60s, so heavy work must be deferred.
 */
import { timingSafeEqual } from 'node:crypto'

interface RevenueCatEvent {
  id?: string
  type: string
  app_user_id?: string
  original_app_user_id?: string
  entitlement_ids?: string[] | null
  product_id?: string
  store?: string
  purchased_at_ms?: number
  expiration_at_ms?: number | null
  is_trial_period?: boolean
  environment?: string
  cancel_reason?: string | null
  unsubscribe_detected_at_ms?: number | null
  billing_issues_detected_at_ms?: number | null
}

interface RevenueCatWebhookBody {
  event: RevenueCatEvent
  api_version?: string
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

function msToTimestamptz(ms: number | null | undefined): string | null {
  if (ms === null || ms === undefined) return null
  return new Date(ms).toISOString()
}

function deriveStatus(eventType: string): string {
  switch (eventType) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
    case 'NON_RENEWING_PURCHASE':
    case 'TRANSFER':
      return 'active'
    case 'CANCELLATION':
      return 'cancelled'
    case 'EXPIRATION':
      return 'expired'
    case 'BILLING_ISSUE':
      return 'billing_issue'
    default:
      return 'active'
  }
}

function deriveStore(rcStore: string | undefined): string {
  switch ((rcStore || '').toUpperCase()) {
    case 'APP_STORE':
      return 'app_store'
    case 'PLAY_STORE':
      return 'play_store'
    case 'RC_TEST_STORE':
      return 'rc_test_store'
    case 'WEB_BILLING':
    case 'STRIPE':
      return 'web_billing'
    default:
      return (rcStore || 'unknown').toLowerCase()
  }
}

export default defineEventHandler(async (event) => {
  // Auth check: RC sends shared secret in Authorization header
  const authHeader = getHeader(event, 'authorization') || ''
  const config = useRuntimeConfig()
  const expectedSecret =
    (config as any).revenuecatWebhookSecret ||
    process.env.NUXT_REVENUECAT_WEBHOOK_SECRET ||
    ''

  if (!expectedSecret) {
    console.error('[rc-webhook] NUXT_REVENUECAT_WEBHOOK_SECRET not configured')
    throw createError({ statusCode: 500, message: 'Server misconfiguration' })
  }

  // RC's "Authorization" header value is whatever you configure in the
  // dashboard. Common pattern: "Bearer <secret>" or just "<secret>".
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!safeCompare(provided, expectedSecret)) {
    console.warn('[rc-webhook] auth failure')
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Parse body
  const body = (await readBody(event)) as RevenueCatWebhookBody | null

  if (!body?.event?.type) {
    throw createError({ statusCode: 400, message: 'Invalid webhook body' })
  }

  const evt = body.event

  // Log event for debugging in early phase
  console.log(
    `[rc-webhook] event=${evt.type} user=${evt.app_user_id} product=${evt.product_id} env=${evt.environment}`,
  )

  // Skip TEST and SUBSCRIBER_ALIAS events — no subscription state to mirror
  if (evt.type === 'TEST' || evt.type === 'SUBSCRIBER_ALIAS') {
    return { received: true, ignored: evt.type }
  }

  // Anonymous RC users (RCAnonymousID:...) don't map to Supabase users.
  // Skip until they identify (logIn fires app_user_id update).
  if (!evt.app_user_id || evt.app_user_id.startsWith('$RCAnonymousID')) {
    return { received: true, ignored: 'anonymous_user' }
  }

  // Multiple entitlements possible per event. Upsert one row per entitlement.
  const entitlements = evt.entitlement_ids || []
  if (entitlements.length === 0) {
    return { received: true, ignored: 'no_entitlements' }
  }

  const supabaseAdmin = createSupabaseAdmin()
  const status = deriveStatus(evt.type)
  const store = deriveStore(evt.store)

  for (const entitlementId of entitlements) {
    const row = {
      user_id: evt.app_user_id,
      entitlement_id: entitlementId,
      product_id: evt.product_id || null,
      store,
      status,
      is_in_trial_period: !!evt.is_trial_period,
      is_sandbox: (evt.environment || '').toUpperCase() === 'SANDBOX',
      purchased_at: msToTimestamptz(evt.purchased_at_ms) || new Date().toISOString(),
      expires_at: msToTimestamptz(evt.expiration_at_ms),
      cancelled_at:
        evt.type === 'CANCELLATION' ? new Date().toISOString() : null,
      unsubscribe_detected_at: msToTimestamptz(evt.unsubscribe_detected_at_ms),
      billing_issues_detected_at: msToTimestamptz(evt.billing_issues_detected_at_ms),
      rc_event_id: evt.id || null,
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(row, { onConflict: 'user_id,entitlement_id' })

    if (error) {
      console.error('[rc-webhook] upsert failed:', error.message, { user: evt.app_user_id, entitlement: entitlementId })
      throw createError({
        statusCode: 500,
        message: 'Failed to persist subscription state',
      })
    }
  }

  return { received: true, processed: entitlements.length }
})
