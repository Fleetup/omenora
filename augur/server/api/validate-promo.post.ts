export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const rawCode  = sanitizeString(body.code, 50).toUpperCase()
  const rawEmail = sanitizeString(body.email ?? '', 254).toLowerCase()

  assertInput(rawCode.length > 0, 'code is required')

  const supabase = createSupabaseAdmin()

  let record: any
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', rawCode)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[validate-promo] DB error:', error.code)
      throw createError({ statusCode: 500, message: 'Unable to validate code. Please try again.' })
    }

    record = data
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[validate-promo] Unexpected error:', err?.message)
    throw createError({ statusCode: 500, message: 'Unable to validate code. Please try again.' })
  }

  if (!record) {
    return { valid: false, message: 'This code is not valid' }
  }

  if (!record.active) {
    return { valid: false, message: 'This code is no longer active' }
  }

  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return { valid: false, message: 'This code has expired' }
  }

  if (record.current_uses >= record.max_uses) {
    return { valid: false, message: 'This code has reached its usage limit' }
  }

  if (
    record.code_subtype === 'personal' &&
    record.locked_to_email !== null &&
    record.locked_to_email !== undefined &&
    rawEmail.length > 0 &&
    rawEmail !== record.locked_to_email.toLowerCase()
  ) {
    return { valid: false, message: 'This code is already linked to another account' }
  }

  return {
    valid: true,
    codeId: record.id,
    codeType: record.code_type,
    codeSubtype: record.code_subtype,
    discountValue: record.discount_value ?? 0,
    message: record.code_type === 'full_access'
      ? 'Full access unlocked'
      : `${record.discount_value ?? 0}% discount applied`,
  }
})
