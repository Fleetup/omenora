export default defineEventHandler(async (event) => {
  const body  = await readBody(event)
  const email = sanitizeString(body.email, 254)

  if (!isValidEmail(email)) {
    return { success: false }
  }

  const supabase = createSupabaseAdmin()

  await supabase
    .from('email_captures')
    .update({
      sequence_completed: true,
      updated_at:         new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim())

  return { success: true }
})
