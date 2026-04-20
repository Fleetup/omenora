export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email            = sanitizeString(body.email, 254)
  const firstName        = sanitizeString(body.firstName, 50)
  const archetypeName    = sanitizeString(body.archetypeName, 100)
  const archetypeEmoji   = sanitizeString(body.archetypeEmoji, 10)
  const archetypeElement = sanitizeString(body.archetypeElement, 50)
  const lifePath         = sanitizeString(String(body.lifePath ?? ''), 5)
  const birthCity        = sanitizeString(body.birthCity, 100)
  const readingTradition = sanitizeString(body.readingTradition, 50)
  const language         = sanitizeString(body.language || 'en', 5)
  const sessionId        = sanitizeString(body.sessionId, 100)
  const archetypeTraits  = Array.isArray(body.archetypeTraits) ? body.archetypeTraits : []

  if (!isValidEmail(email)) {
    return { success: false }
  }

  const supabase = createSupabaseAdmin()

  const { error } = await supabase
    .from('email_captures')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        first_name: firstName,
        archetype_name: archetypeName,
        archetype_emoji: archetypeEmoji,
        archetype_element: archetypeElement,
        life_path: lifePath,
        archetype_traits: archetypeTraits,
        birth_city: birthCity,
        reading_tradition: readingTradition,
        language: language.toUpperCase(),
        session_id: sessionId,
        abandoned_at: new Date().toISOString(),
        sequence_step: 0,
        sequence_completed: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false },
    )

  if (error) {
    console.error('Email capture error:', error.code)
    return { success: false }
  }

  const { scheduleEmailJob, SEQUENCE_DELAYS_MS } = await import('~~/server/utils/email-jobs')
  scheduleEmailJob(email.toLowerCase().trim(), 1, SEQUENCE_DELAYS_MS[1]!).catch(() => {})

  return { success: true }
})
