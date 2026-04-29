/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'
import { inngest, resendEmailBounced, resendEmailComplained } from './client'

/**
 * Inngest handlers for Resend email suppression events.
 *
 * Both handlers write to the email_suppression table and deactivate
 * the matching subscriber row. All DB work is idempotent:
 *   - email_suppression upsert uses ON CONFLICT DO NOTHING (ignoreDuplicates)
 *   - subscribers update is safe even when no row exists (update-only, no error)
 *
 * Idempotency key for each function is event.data.email_id — Inngest deduplicates
 * any replayed event with the same email_id within the dedup window.
 */

// ── Bounce handler ──────────────────────────────────────────────────────────

export const resendBouncedHandler = inngest.createFunction(
  {
    id:      'resend-email-bounced',
    name:    'Resend — suppress hard bounce',
    triggers: [{ event: resendEmailBounced }],
    retries: 4,
  },
  async ({ event, step }) => {
    const { email_id, to, bounceType, subType } = event.data

    // Only act on permanent/hard bounces.
    // Transient (soft) bounces are delivery delays; no suppression needed.
    // Resend uses "Permanent" for hard bounces and "Transient" for soft.
    if (bounceType !== 'Permanent') {
      console.info('[resend-bounced] Soft/transient bounce — no suppression action:', { email_id, to, bounceType, subType })
      return { suppressed: false, reason: 'transient_bounce', email_id }
    }

    // ── Step 1: Upsert into email_suppression ───────────────────────────────
    await step.run('suppress-email', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL          ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY  ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('email_suppression')
        .upsert(
          {
            email:          to.toLowerCase().trim(),
            reason:         'bounce_permanent',
            suppressed_at:  new Date().toISOString(),
          },
          { onConflict: 'email', ignoreDuplicates: true },
        )

      if (error) {
        console.error('[resend-bounced] email_suppression upsert error:', error.code, error.message)
        throw new Error(`email_suppression upsert failed: ${error.message}`)
      }

      console.info('[resend-bounced] Suppressed:', to, 'reason: bounce_permanent', { email_id, subType })
      return { suppressed: true }
    })

    // ── Step 2: Deactivate subscriber row ───────────────────────────────────
    await step.run('deactivate-subscriber', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL          ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY  ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('subscribers')
        .update({ active: false })
        .eq('email', to.toLowerCase().trim())

      if (error) {
        console.error('[resend-bounced] subscribers deactivate error:', error.code, error.message)
        throw new Error(`subscribers update failed: ${error.message}`)
      }

      console.info('[resend-bounced] Subscriber deactivated (if existed):', to)
      return { deactivated: true }
    })

    return { suppressed: true, reason: 'bounce_permanent', email_id, to }
  },
)

// ── Complaint handler ────────────────────────────────────────────────────────

export const resendComplainedHandler = inngest.createFunction(
  {
    id:      'resend-email-complained',
    name:    'Resend — suppress spam complaint',
    triggers: [{ event: resendEmailComplained }],
    retries: 4,
  },
  async ({ event, step }) => {
    const { email_id, to } = event.data

    // ── Step 1: Upsert into email_suppression ───────────────────────────────
    await step.run('suppress-email', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL          ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY  ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('email_suppression')
        .upsert(
          {
            email:          to.toLowerCase().trim(),
            reason:         'complaint',
            suppressed_at:  new Date().toISOString(),
          },
          { onConflict: 'email', ignoreDuplicates: true },
        )

      if (error) {
        console.error('[resend-complained] email_suppression upsert error:', error.code, error.message)
        throw new Error(`email_suppression upsert failed: ${error.message}`)
      }

      console.info('[resend-complained] Suppressed:', to, 'reason: complaint', { email_id })
      return { suppressed: true }
    })

    // ── Step 2: Deactivate subscriber row ───────────────────────────────────
    await step.run('deactivate-subscriber', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL          ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY  ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { error } = await supabase
        .from('subscribers')
        .update({ active: false })
        .eq('email', to.toLowerCase().trim())

      if (error) {
        console.error('[resend-complained] subscribers deactivate error:', error.code, error.message)
        throw new Error(`subscribers update failed: ${error.message}`)
      }

      console.info('[resend-complained] Subscriber deactivated (if existed):', to)
      return { deactivated: true }
    })

    return { suppressed: true, reason: 'complaint', email_id, to }
  },
)
