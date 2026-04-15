export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw   = query.email as string | undefined

  if (!raw) {
    return sendRedirect(event, '/?unsubscribed=true')
  }

  const email = sanitizeString(decodeURIComponent(raw), 254)

  if (!isValidEmail(email)) {
    return sendRedirect(event, '/?unsubscribed=true')
  }

  const supabase = createSupabaseAdmin()

  await supabase
    .from('email_captures')
    .update({
      sequence_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim())

  return sendRedirect(event, '/?unsubscribed=true')
})
