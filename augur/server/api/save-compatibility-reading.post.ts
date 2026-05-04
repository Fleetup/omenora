/**
 * POST /api/save-compatibility-reading
 *
 * Persists a compatibility reading to the reports table after purchase.
 * Uses type = 'compatibility' to distinguish from archetype reports.
 *
 * This endpoint is fire-and-forget from the client — it NEVER throws 500
 * so a failed save cannot affect the reading page render.
 *
 * Required columns (added by server/migrations/add_compatibility_columns.sql):
 *   type, compatibility_data, partner_name, partner_dob
 *
 * compatibility_data JSONB shape:
 *   T1 'single': the raw CompatibilityType object (compatibilityScore, compatibilityTitle, sections, calculationReceipt)
 *   T2 'with_charts': CompatibilityType fields + {
 *     tier: 'with_charts',
 *     userBirthChart: BirthChartType,
 *     partnerBirthChart: BirthChartType,
 *     userBirthChartNoonFallback: boolean,
 *     partnerBirthChartNoonFallback: boolean,
 *   }
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const sessionId                     = sanitizeString(body.sessionId ?? '', 200)
  const email                         = sanitizeString(body.email ?? '', 254)
  const firstName                     = sanitizeString(body.firstName ?? '', 50)
  const partnerName                   = sanitizeString(body.partnerName ?? '', 50)
  const partnerDob                    = sanitizeString(body.partnerDob ?? '', 20)
  const language                      = sanitizeString(body.language ?? 'en', 5)
  const tier                          = sanitizeString(body.tier ?? 'single', 20)
  const compatibilityData             = body.compatibilityData ?? null
  const userBirthChart                = body.userBirthChart                ?? null
  const partnerBirthChart             = body.partnerBirthChart             ?? null
  const userBirthChartNoonFallback    = Boolean(body.userBirthChartNoonFallback)
  const partnerBirthChartNoonFallback = Boolean(body.partnerBirthChartNoonFallback)

  // T2: merge birth chart data into the JSONB alongside the compat reading fields.
  // T1: save compatibilityData as-is — no structural change to existing records.
  const mergedCompatibilityData = tier === 'with_charts'
    ? {
        ...(compatibilityData && typeof compatibilityData === 'object' ? compatibilityData : {}),
        tier,
        userBirthChart,
        partnerBirthChart,
        userBirthChartNoonFallback,
        partnerBirthChartNoonFallback,
      }
    : compatibilityData

  // Hard validation — both required for a meaningful record
  assertInput(isValidSessionId(sessionId), 'Valid sessionId is required')
  assertInput(isValidEmail(email), 'Valid email is required')

  const supabase = createSupabaseAdmin()

  const { error } = await supabase
    .from('reports')
    .upsert(
      {
        session_id:         sessionId,
        type:               'compatibility',
        email,
        first_name:         firstName,
        partner_name:       partnerName,
        partner_dob:        partnerDob,
        compatibility_data: mergedCompatibilityData,
        language,
        email_sent:         true,
        created_at:         new Date().toISOString(),
      },
      { onConflict: 'session_id' },
    )

  if (error) {
    console.error('[save-compatibility-reading] Upsert error:', error.code, error.message)
  }

  // Always return success — client uses fire-and-forget, never reads this response
  return { success: true }
})
