import { sendReportEmail } from '~~/server/utils/report-email-builder'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const codeId        = sanitizeString(body.codeId, 100)
  const rawCode       = sanitizeString(body.code, 50).toUpperCase()
  const email         = sanitizeString(body.email, 254)
  const firstName     = sanitizeString(body.firstName, 50)
  const dateOfBirth   = sanitizeString(body.dateOfBirth, 10)
  const city          = sanitizeString(body.city, 100)
  const archetype     = sanitizeString(body.archetype, 30)
  const lifePathNumber = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : 0
  const region        = isValidRegion(body.region) ? body.region : 'western'
  const language      = sanitizeString(body.language || 'en', 5)
  const answers       = body.answers && typeof body.answers === 'object' ? body.answers : {}

  assertInput(codeId.length > 0, 'codeId is required')
  assertInput(rawCode.length > 0, 'code is required')
  assertInput(isValidEmail(email), 'Valid email is required')
  assertInput(!!firstName, 'firstName is required')
  assertInput(isValidDateOfBirth(dateOfBirth), 'Valid dateOfBirth is required')
  assertInput(isValidArchetype(archetype), 'Invalid archetype')

  const normalizedEmail = email.toLowerCase().trim()
  const supabase = createSupabaseAdmin()

  // ── Step 1: Re-validate code from scratch ──────────────────────────────────
  let codeRecord: any
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', codeId)
      .eq('code', rawCode)
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    codeRecord = data
  } catch (err: any) {
    console.error('[apply-promo-access] Code lookup error:', err?.message)
    throw createError({ statusCode: 500, message: 'Unable to validate code. Please try again.' })
  }

  if (!codeRecord) throw createError({ statusCode: 400, message: 'This code is not valid' })
  if (!codeRecord.active) throw createError({ statusCode: 400, message: 'This code is no longer active' })
  if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
    throw createError({ statusCode: 400, message: 'This code has expired' })
  }
  if (codeRecord.current_uses >= codeRecord.max_uses) {
    throw createError({ statusCode: 400, message: 'This code has reached its usage limit' })
  }
  if (codeRecord.code_type !== 'full_access') {
    throw createError({ statusCode: 400, message: 'This code does not grant free access' })
  }
  if (
    codeRecord.code_subtype === 'personal' &&
    codeRecord.locked_to_email !== null &&
    codeRecord.locked_to_email !== undefined &&
    codeRecord.locked_to_email.toLowerCase() !== normalizedEmail
  ) {
    throw createError({ statusCode: 400, message: 'This code is already linked to another account' })
  }

  // ── Step 2: Check email hasn't already used this code ─────────────────────
  try {
    const { data: existingUse } = await supabase
      .from('promo_code_uses')
      .select('id')
      .eq('code_id', codeId)
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (existingUse) {
      throw createError({ statusCode: 400, message: 'This code has already been used with this email address' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    // Table may not exist yet — log and continue
    console.warn('[apply-promo-access] promo_code_uses query error (table may not exist yet):', err?.message)
  }

  // ── Step 3: Generate report via Anthropic ─────────────────────────────────
  let reportData: any
  try {
    const generated = await $fetch<{ success: boolean; report: any }>('/api/generate-report', {
      method: 'POST',
      body: {
        firstName,
        dateOfBirth,
        city,
        archetype,
        lifePathNumber,
        region,
        language,
        answers,
        timeOfBirth: sanitizeString(body.timeOfBirth ?? '', 10),
      },
    })
    reportData = generated.report
  } catch (err: any) {
    console.error('[apply-promo-access] Report generation failed:', err?.message)
    throw createError({ statusCode: 500, message: 'Failed to generate your reading. Please try again.' })
  }

  // ── Step 4: Save report to Supabase ───────────────────────────────────────
  const promoSessionId = `promo_${Date.now()}_${firstName.replace(/\s+/g, '')}`
  let savedReportId: string | null = null

  try {
    const { data: savedReport, error: saveErr } = await supabase
      .from('reports')
      .insert({
        session_id:      promoSessionId,
        first_name:      firstName,
        archetype,
        life_path_number: lifePathNumber,
        report_data:     reportData,
        answers,
        city,
        date_of_birth:   dateOfBirth,
        email:           normalizedEmail,
        region,
        email_sent:      false,
        created_at:      new Date().toISOString(),
      })
      .select('id')
      .single()

    if (saveErr) {
      console.error('[apply-promo-access] Failed to save report:', saveErr.code)
    } else {
      savedReportId = savedReport?.id ?? null
    }
  } catch (err: any) {
    console.error('[apply-promo-access] Save error:', err?.message)
  }

  // ── Step 5: Send report email ─────────────────────────────────────────────
  const resendKey = config.resendApiKey as string | undefined
  let emailSent = false

  if (resendKey && isValidEmail(email)) {
    try {
      await sendReportEmail(resendKey, {
        email,
        firstName,
        report: reportData,
        archetype,
        lifePathNumber,
        element: reportData.element,
        region,
        vedicData: null,
        baziData: null,
        tarotData: null,
        calendarData: null,
        birthChartData: null,
        language,
      })
      emailSent = true
    } catch (err: any) {
      console.error('[apply-promo-access] Email failed (non-blocking):', err?.message)
    }
  }

  // ── Step 6: Mark email sent in reports table ──────────────────────────────
  if (emailSent && savedReportId) {
    const { error: markErr } = await supabase
      .from('reports')
      .update({ email_sent: true })
      .eq('id', savedReportId)
    if (markErr) console.error('[apply-promo-access] Failed to mark email sent:', markErr.code)
  }

  // ── Step 7: Lock personal code to email ──────────────────────────────────
  if (codeRecord.code_subtype === 'personal' && !codeRecord.locked_to_email) {
    const { error: lockErr } = await supabase
      .from('promo_codes')
      .update({ locked_to_email: normalizedEmail })
      .eq('id', codeId)
    if (lockErr) console.error('[apply-promo-access] Lock email failed:', lockErr.code)
  }

  // ── Step 8: Increment usage count ────────────────────────────────────────
  const { error: incErr } = await supabase
    .from('promo_codes')
    .update({ current_uses: codeRecord.current_uses + 1 })
    .eq('id', codeId)
  if (incErr) console.error('[apply-promo-access] Increment uses failed:', incErr.code)

  // ── Step 9: Log usage in promo_code_uses ─────────────────────────────────
  const { error: useErr } = await supabase
    .from('promo_code_uses')
    .insert({
      code_id:   codeId,
      email:     normalizedEmail,
      used_at:   new Date().toISOString(),
      report_id: savedReportId,
    })
  if (useErr) console.error('[apply-promo-access] Usage log failed:', useErr.code)

  // ── Step 10: Return ───────────────────────────────────────────────────────
  return {
    success: true,
    reportId: savedReportId,
    report: reportData,
    sessionId: promoSessionId,
    message: 'Your complete reading has been sent to your email',
  }
})
