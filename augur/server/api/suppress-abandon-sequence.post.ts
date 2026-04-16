import { cancelEmailJobs } from '~~/server/utils/email-jobs'

export default defineEventHandler(async (event) => {
  const body  = await readBody(event)
  const email = sanitizeString(body.email, 254)

  if (!isValidEmail(email)) {
    return { success: false }
  }

  const supabase = createSupabaseAdmin()

  await Promise.all([
    supabase
      .from('email_captures')
      .update({
        purchased:          true,
        sequence_completed: true,
        updated_at:         new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim()),

    cancelEmailJobs(email),
  ])

  return { success: true }
})
