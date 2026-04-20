import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const sessionId    = sanitizeString(body.sessionId, 200)
  const reportId     = sanitizeString(body.reportId, 200)
  const newTradition = isValidRegion(body.newTradition) ? (body.newTradition as string) : null
  const freeSwitch   = body.freeSwitch === true

  assertInput(isValidReportId(reportId), 'Invalid reportId')
  assertInput(newTradition !== null, 'newTradition must be a valid region')

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  // ── 1. Pull existing report from Supabase first (needed for both paths) ──
  const { data: reportRow, error: fetchError } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', reportId)
    .single()

  if (fetchError || !reportRow) {
    throw createError({ statusCode: 404, message: 'Report not found' })
  }

  // ── 2. Verify payment or assert Oracle ownership server-side ─────────────
  if (!freeSwitch) {
    assertInput(isValidSessionId(sessionId), 'Invalid Stripe session ID')

    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2026-03-25.dahlia' as any,
    })

    let stripeSession
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      throw createError({ statusCode: 404, message: 'Stripe session not found' })
    }

    const paid = stripeSession.payment_status === 'paid' || stripeSession.status === 'complete'
    if (!paid) {
      throw createError({ statusCode: 402, message: 'Payment not completed' })
    }

    const meta = stripeSession.metadata ?? {}
    if (meta.type !== 'tradition_switch') {
      throw createError({ statusCode: 400, message: 'Invalid session type for tradition switch' })
    }
    if (meta.newTradition !== newTradition) {
      throw createError({ statusCode: 400, message: 'Tradition mismatch between session and request' })
    }
  } else {
    // Free switch — only valid for Oracle purchasers.
    // Authorisation is enforced SERVER-SIDE by inspecting the report row:
    // the webhook sets oracle_purchased = true on the reports table when an
    // oracle-tier payment completes. We never trust the client flag alone.
    const isOraclePurchaser =
      reportRow.oracle_purchased === true ||
      (Array.isArray(reportRow.traditions_unlocked) && reportRow.traditions_unlocked.length > 1)

    if (!isOraclePurchaser) {
      throw createError({
        statusCode: 403,
        message: 'Free tradition switch is only available to Oracle bundle purchasers',
      })
    }
  }

  // ── 3. Check if this tradition was already generated and cached ──────────
  const cachedColumnMap: Record<string, string> = {
    india: 'report_data_vedic',
    china: 'report_data_bazi',
    latam: 'report_data_latam',
    tarot: 'report_data_latam',
  }
  const cacheColumn = cachedColumnMap[newTradition]
  if (cacheColumn && reportRow[cacheColumn]) {
    return {
      success:    true,
      report:     reportRow[cacheColumn],
      fromCache:  true,
      tradition:  newTradition,
    }
  }

  // ── 4. Re-generate report with new tradition ─────────────────────────────
  const generateBody = {
    firstName:      reportRow.first_name,
    dateOfBirth:    reportRow.date_of_birth,
    city:           reportRow.city,
    archetype:      reportRow.archetype,
    lifePathNumber: reportRow.life_path_number,
    answers:        reportRow.answers ?? {},
    region:         newTradition,
    timeOfBirth:    reportRow.time_of_birth ?? '',
    language:       reportRow.language ?? 'en',
  }

  let newReportData: any
  try {
    const result = await $fetch<{ success: boolean; report: any }>('/api/generate-report', {
      method:  'POST',
      headers: { 'x-job-secret': (config.emailJobSecret as string | undefined) ?? '' },
      body:    generateBody,
    })
    newReportData = result.report
  } catch (err: any) {
    console.error('[switch-tradition] generate-report failed:', err?.message)
    throw createError({
      statusCode: 503,
      message:    'Report generation failed. Please try again.',
    })
  }

  // ── 5. Save new tradition report to Supabase ─────────────────────────────
  const updatePayload: Record<string, any> = {}

  // Store in the tradition-specific cache column
  if (cacheColumn) {
    updatePayload[cacheColumn] = newReportData
  }

  // Append to traditions_unlocked array (read-modify-write)
  const currentUnlocked: string[] = Array.isArray(reportRow.traditions_unlocked)
    ? reportRow.traditions_unlocked
    : ['western']
  if (!currentUnlocked.includes(newTradition)) {
    updatePayload.traditions_unlocked = [...currentUnlocked, newTradition]
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabase
      .from('reports')
      .update(updatePayload)
      .eq('session_id', reportId)
    if (updateError) {
      console.warn('[switch-tradition] Failed to cache tradition report:', updateError.code)
    }
  }

  return {
    success:   true,
    report:    newReportData,
    fromCache: false,
    tradition: newTradition,
  }
})
