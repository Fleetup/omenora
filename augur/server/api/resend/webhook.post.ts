import { Resend } from 'resend'
import { inngest, resendEmailBounced, resendEmailComplained } from '~~/inngest/client'

/**
 * POST /api/resend/webhook
 *
 * Receives Resend webhook events, verifies the Svix signature using
 * RESEND_WEBHOOK_SECRET, then fires the appropriate Inngest event.
 *
 * Handled event types:
 *   email.bounced    → resend/email.bounced   (Inngest handler suppresses hard bounces)
 *   email.complained → resend/email.complained (Inngest handler always suppresses)
 *
 * All other event types are accepted (200) but ignored — Resend may send
 * events we do not yet handle and must not receive 4xx retries for them.
 *
 * Setup in Resend Dashboard → Webhooks:
 *   Endpoint URL: https://omenora.com/api/resend/webhook
 *   Events:       email.bounced, email.complained
 *   Signing secret: copy to RESEND_WEBHOOK_SECRET env var
 */

export default defineEventHandler(async (event) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET is not set')
    throw createError({ statusCode: 500, message: 'Webhook secret not configured' })
  }

  // ── Read raw body — signature verification requires the original bytes ──────
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, message: 'Empty body' })
  }

  // ── Verify Svix signature via resend.webhooks.verify ─────────────────────
  // resend.webhooks.verify() wraps the Svix Webhook class and throws on
  // any signature or timestamp failure. We pass an empty string for the
  // API key because we are only using the .webhooks namespace here.
  const resend = new Resend('')
  let payload: ReturnType<typeof resend.webhooks.verify>
  try {
    payload = resend.webhooks.verify({
      payload: rawBody,
      headers: {
        id:        getHeader(event, 'svix-id')        ?? '',
        timestamp: getHeader(event, 'svix-timestamp') ?? '',
        signature: getHeader(event, 'svix-signature') ?? '',
      },
      webhookSecret,
    })
  } catch (err: unknown) {
    console.error('[resend-webhook] Signature verification failed:', err instanceof Error ? err.message : String(err))
    throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
  }

  // ── Route by event type ────────────────────────────────────────────────────
  if (payload.type === 'email.bounced') {
    const data = payload.data
    // data.to is string[] — take the first entry (transactional sends always have one recipient)
    const toAddress = Array.isArray(data.to) ? (data.to[0] ?? '') : String(data.to)

    try {
      await inngest.send(
        resendEmailBounced.create({
          email_id:   data.email_id,
          to:         toAddress,
          bounceType: data.bounce.type,
          subType:    data.bounce.subType,
        }),
      )
      console.info('[resend-webhook] resend/email.bounced fired:', data.email_id, toAddress, data.bounce.type)
    } catch (inngestErr: unknown) {
      // Best-effort: Resend retries on non-2xx. Log loudly but return 200 to
      // avoid an infinite retry loop caused by an Inngest connectivity issue.
      console.error('[resend-webhook] inngest.send failed for email.bounced (non-blocking):', data.email_id, inngestErr instanceof Error ? inngestErr.message : String(inngestErr))
    }

    return { received: true }
  }

  if (payload.type === 'email.complained') {
    const data = payload.data
    const toAddress = Array.isArray(data.to) ? (data.to[0] ?? '') : String(data.to)

    try {
      await inngest.send(
        resendEmailComplained.create({
          email_id: data.email_id,
          to:       toAddress,
        }),
      )
      console.info('[resend-webhook] resend/email.complained fired:', data.email_id, toAddress)
    } catch (inngestErr: unknown) {
      console.error('[resend-webhook] inngest.send failed for email.complained (non-blocking):', data.email_id, inngestErr instanceof Error ? inngestErr.message : String(inngestErr))
    }

    return { received: true }
  }

  // ── Unhandled event type — accept silently ────────────────────────────────
  console.info('[resend-webhook] Unhandled event type (no-op):', payload.type)
  return { received: true }
})
