import { createClient } from '@supabase/supabase-js'
import { ReportSchema } from '~~/server/utils/ai-schemas'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId      = sanitizeString(body.sessionId, 200)
  const firstName      = sanitizeString(body.firstName, 50)
  const archetype      = sanitizeString(body.archetype, 30)
  const lifePathNumber = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : null
  const city           = sanitizeString(body.city, 100)
  const dateOfBirth    = sanitizeString(body.dateOfBirth, 10)
  const email          = sanitizeString(body.email, 254)
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const promptVersion  = sanitizeString(body.promptVersion ?? '', 20) || null

  assertInput(isValidReportId(sessionId), 'Invalid session ID')
  assertInput(!!firstName, 'firstName is required')
  assertInput(
    body.report !== null && typeof body.report === 'object',
    'Invalid report payload',
  )

  const reportParseResult = ReportSchema.safeParse(body.report)
  if (!reportParseResult.success) {
    console.warn('[save-report] Schema validation failed:', reportParseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '))
    throw createError({ statusCode: 422, message: 'Report payload does not match expected schema' })
  }
  const validatedReport = reportParseResult.data

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const reportRow = {
    session_id:       sessionId,
    first_name:       firstName,
    archetype,
    life_path_number: lifePathNumber,
    report_data:      validatedReport,
    answers:          body.answers ?? {},
    city,
    date_of_birth:    dateOfBirth,
    email:            isValidEmail(email) ? email : '',
    region,
    prompt_version:   promptVersion,
    created_at:       new Date().toISOString(),
  }

  let { error } = await supabase
    .from('reports')
    .upsert(reportRow, { onConflict: 'session_id' })

  if (error) {
    // If the column doesn't exist yet (schema gap), retry without prompt_version
    // so report delivery is never blocked by a missing migration.
    if (error.code === '42703' || error.message?.includes('prompt_version')) {
      console.error('[B-2] promptVersion write failed (column missing — run migration):', error.message)
      const { prompt_version: _pv, ...rowWithoutVersion } = reportRow
      const retryResult = await supabase
        .from('reports')
        .upsert(rowWithoutVersion, { onConflict: 'session_id' })
      if (retryResult.error) {
        console.error('[save-report] Upsert error after fallback:', retryResult.error.code)
        throw createError({ statusCode: 500, message: 'Failed to save report' })
      }
    } else {
      console.error('[save-report] Upsert error:', error.code)
      throw createError({ statusCode: 500, message: 'Failed to save report' })
    }
  }

  return { success: true }
})
