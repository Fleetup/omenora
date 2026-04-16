import { cancelEmailJobs } from '~~/server/utils/email-jobs'

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

  await Promise.all([
    supabase
      .from('email_captures')
      .update({
        sequence_completed: true,
        updated_at:         new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim()),

    cancelEmailJobs(email),
  ])

  return sendRedirect(event, '/?unsubscribed=true')
})
