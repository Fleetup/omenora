/// <reference types="node" />
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEmailTemplate } from '../server/utils/email-templates'
import { inngest, abandonmentStarted, stripeCheckoutCompleted, userUnsubscribed } from './client'

/**
 * Abandonment sequence Inngest function — Phase 5 full implementation.
 *
 * Sends a 4-step email sequence to visitors who captured their email at the
 * paywall but did not purchase. Replaces the email_jobs / Railway cron approach.
 *
 * cancelOn:
 *   stripe/checkout.completed — purchase (any product) stops the sequence
 *   user/unsubscribed         — unsubscribe link click stops the sequence
 *
 * Delays match SEQUENCE_DELAYS_MS exactly:
 *   step 1: 10 minutes after abandonment/started
 *   step 2: 3 hours after step 1
 *   step 3: 24 hours after step 2
 *   step 4: 47 hours after step 3 (total: ~74h from capture)
 *
 * Strategy A for email send: getEmailTemplate is a pure TS function with no
 * Nuxt/H3 auto-imports — safe to call directly in Inngest steps. Resend is
 * instantiated directly with process.env credentials (same pattern used across
 * all other Inngest functions in this codebase).
 *
 * Defense-in-depth suppression check at entry: queries email_captures for
 * purchased=true or sequence_completed=true before the first sleep. This
 * catches the race where a purchase event fires between the capture-email
 * insert and the Inngest function starting.
 *
 * Step 4 cleanup: deletes the unredeemed report row from reports by session_id
 * and sets sequence_completed=true on email_captures — matching process-jobs
 * behavior exactly.
 */
export const abandonmentSequence = inngest.createFunction(
  {
    id:   'abandonment-sequence',
    name: 'Abandonment Sequence — 4-step email re-engagement',
    triggers: [{ event: abandonmentStarted }],
    retries: 4,
    cancelOn: [
      {
        event: stripeCheckoutCompleted,
        match: 'data.email',
      },
      {
        event: userUnsubscribed,
        match: 'data.email',
      },
    ],
  },
  async ({ event, step }) => {
    const {
      email,
      sessionId,
      firstName,
      archetypeName,
      archetypeEmoji,
      archetypeElement,
      lifePath,
      birthCity,
      readingTradition,
      language,
    } = event.data

    // ── Defense-in-depth suppression check ───────────────────────────────────
    // cancelOn is the primary cancellation mechanism. This catches the narrow
    // race where a purchase or unsubscribe lands between the email_captures
    // insert in capture-email.post.ts and this function starting.
    const alreadySuppressed = await step.run('suppression-check', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data, error } = await supabase
        .from('email_captures')
        .select('purchased, sequence_completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (error) {
        console.error('[abandonment-sequence] suppression-check error:', error.code, error.message)
        // Fail open — do not throw; if we can't check we proceed. cancelOn is
        // still active and each send step checks before firing.
        return false
      }

      return !!(data?.purchased || data?.sequence_completed)
    })

    if (alreadySuppressed) {
      console.info(`[abandonment-sequence] Suppressed at entry for ${email} — returning early`)
      return { suppressed: true, email }
    }

    const jobSecret = process.env.NUXT_EMAIL_JOB_SECRET ?? ''

    const personalization = {
      email,
      firstName:        firstName        || 'there',
      archetypeName:    archetypeName    || 'your archetype',
      archetypeEmoji:   archetypeEmoji   || '✨',
      archetypeElement: archetypeElement || '',
      lifePath:         lifePath         || '',
      birthCity:        birthCity        || '',
      readingTradition: readingTradition || 'Western',
      language:         language         || 'EN',
      sessionId,
    }

    // ── Step 1 — Sleep 10 minutes, then send abandonment email 1 ─────────────
    await step.sleep('wait-before-step-1', '10m')

    await step.run('send-step-1', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data: capture } = await supabase
        .from('email_captures')
        .select('purchased, sequence_completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (capture?.purchased || capture?.sequence_completed) {
        console.info(`[abandonment-sequence] step 1 suppressed for ${email}`)
        return { skipped: true }
      }

      const template = getEmailTemplate(1, personalization, jobSecret)
      const resend   = new Resend(process.env.NUXT_RESEND_API_KEY ?? '')

      const { error } = await resend.emails.send({
        from:    'OMENORA <reading@omenora.com>',
        replyTo: 'support@omenora.com',
        to:      email,
        subject: template.subject,
        html:    template.html,
        text:    template.text,
        headers: { 'X-Entity-Ref-ID': `omenora-abandon-1-${email}` },
        tags: [
          { name: 'sequence_step', value: '1' },
          { name: 'archetype',     value: archetypeName || 'unknown' },
          { name: 'language',      value: language      || 'EN' },
        ],
      })

      if (error) {
        throw new Error(`Resend failed for step 1 / ${email}: ${error.message}`)
      }

      await supabase
        .from('email_captures')
        .update({ sequence_step: 1, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase().trim())

      console.info(`[abandonment-sequence] step 1 sent for ${email}`)
      return { sent: true }
    })

    // ── Step 2 — Sleep 3 hours, then send abandonment email 2 ────────────────
    await step.sleep('wait-before-step-2', '3h')

    await step.run('send-step-2', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data: capture } = await supabase
        .from('email_captures')
        .select('purchased, sequence_completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (capture?.purchased || capture?.sequence_completed) {
        console.info(`[abandonment-sequence] step 2 suppressed for ${email}`)
        return { skipped: true }
      }

      const template = getEmailTemplate(2, personalization, jobSecret)
      const resend   = new Resend(process.env.NUXT_RESEND_API_KEY ?? '')

      const { error } = await resend.emails.send({
        from:    'OMENORA <reading@omenora.com>',
        replyTo: 'support@omenora.com',
        to:      email,
        subject: template.subject,
        html:    template.html,
        text:    template.text,
        headers: { 'X-Entity-Ref-ID': `omenora-abandon-2-${email}` },
        tags: [
          { name: 'sequence_step', value: '2' },
          { name: 'archetype',     value: archetypeName || 'unknown' },
          { name: 'language',      value: language      || 'EN' },
        ],
      })

      if (error) {
        throw new Error(`Resend failed for step 2 / ${email}: ${error.message}`)
      }

      await supabase
        .from('email_captures')
        .update({ sequence_step: 2, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase().trim())

      console.info(`[abandonment-sequence] step 2 sent for ${email}`)
      return { sent: true }
    })

    // ── Step 3 — Sleep 24 hours, then send abandonment email 3 ───────────────
    await step.sleep('wait-before-step-3', '24h')

    await step.run('send-step-3', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data: capture } = await supabase
        .from('email_captures')
        .select('purchased, sequence_completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (capture?.purchased || capture?.sequence_completed) {
        console.info(`[abandonment-sequence] step 3 suppressed for ${email}`)
        return { skipped: true }
      }

      const template = getEmailTemplate(3, personalization, jobSecret)
      const resend   = new Resend(process.env.NUXT_RESEND_API_KEY ?? '')

      const { error } = await resend.emails.send({
        from:    'OMENORA <reading@omenora.com>',
        replyTo: 'support@omenora.com',
        to:      email,
        subject: template.subject,
        html:    template.html,
        text:    template.text,
        headers: { 'X-Entity-Ref-ID': `omenora-abandon-3-${email}` },
        tags: [
          { name: 'sequence_step', value: '3' },
          { name: 'archetype',     value: archetypeName || 'unknown' },
          { name: 'language',      value: language      || 'EN' },
        ],
      })

      if (error) {
        throw new Error(`Resend failed for step 3 / ${email}: ${error.message}`)
      }

      await supabase
        .from('email_captures')
        .update({ sequence_step: 3, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase().trim())

      console.info(`[abandonment-sequence] step 3 sent for ${email}`)
      return { sent: true }
    })

    // ── Step 4 — Sleep 47 hours, then send final email + cleanup ─────────────
    await step.sleep('wait-before-step-4', '47h')

    await step.run('send-step-4', async () => {
      const supabase = createClient(
        process.env.NUXT_SUPABASE_URL         ?? '',
        process.env.NUXT_SUPABASE_SERVICE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )

      const { data: capture } = await supabase
        .from('email_captures')
        .select('purchased, sequence_completed')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (capture?.purchased || capture?.sequence_completed) {
        console.info(`[abandonment-sequence] step 4 suppressed for ${email}`)
        return { skipped: true }
      }

      const template = getEmailTemplate(4, personalization, jobSecret)
      const resend   = new Resend(process.env.NUXT_RESEND_API_KEY ?? '')

      const { error } = await resend.emails.send({
        from:    'OMENORA <reading@omenora.com>',
        replyTo: 'support@omenora.com',
        to:      email,
        subject: template.subject,
        html:    template.html,
        text:    template.text,
        headers: { 'X-Entity-Ref-ID': `omenora-abandon-4-${email}` },
        tags: [
          { name: 'sequence_step', value: '4' },
          { name: 'archetype',     value: archetypeName || 'unknown' },
          { name: 'language',      value: language      || 'EN' },
        ],
      })

      if (error) {
        throw new Error(`Resend failed for step 4 / ${email}: ${error.message}`)
      }

      // ── Delete unredeemed report data (mirrors process-jobs step 4) ─────────
      if (sessionId) {
        const { error: deleteErr } = await supabase
          .from('reports')
          .delete()
          .eq('session_id', sessionId)

        if (deleteErr) {
          console.error('[abandonment-sequence] Failed to delete report for session:', sessionId, deleteErr.code)
        } else {
          console.info('[abandonment-sequence] Report data deleted for session', sessionId)
        }
      }

      // ── Mark sequence complete on email_captures ─────────────────────────────
      await supabase
        .from('email_captures')
        .update({
          sequence_step:      4,
          sequence_completed: true,
          updated_at:         new Date().toISOString(),
        })
        .eq('email', email.toLowerCase().trim())

      console.info(`[abandonment-sequence] step 4 sent and sequence completed for ${email}`)
      return { sent: true, sequenceComplete: true }
    })

    return { ok: true, email, sessionId }
  },
)
