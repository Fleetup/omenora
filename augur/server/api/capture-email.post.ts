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

  const normalizedEmail = email.toLowerCase().trim()
  const now = new Date().toISOString()

  const sharedFields = {
    first_name:        firstName,
    archetype_name:    archetypeName,
    archetype_emoji:   archetypeEmoji,
    archetype_element: archetypeElement,
    life_path:         lifePath,
    archetype_traits:  archetypeTraits,
    birth_city:        birthCity,
    reading_tradition: readingTradition,
    language:          language.toUpperCase(),
    session_id:        sessionId,
    abandoned_at:      now,
    updated_at:        now,
  }

  // Try to insert as a new row first. sequence_completed and purchased are
  // only set on a fresh insert — never overwritten on existing rows so that
  // prior unsubscribes and purchase flags are preserved.
  const { error: insertError } = await supabase
    .from('email_captures')
    .insert({
      email:              normalizedEmail,
      ...sharedFields,
      sequence_step:      0,
      sequence_completed: false,
      purchased:          false,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      // Row already exists — update only data fields, never touch flags.
      const { error: updateError } = await supabase
        .from('email_captures')
        .update({ ...sharedFields, sequence_step: 0 })
        .eq('email', normalizedEmail)
        .eq('sequence_completed', false) // safety: never update if already unsubscribed
      if (updateError) {
        console.error('[capture-email] Update error:', updateError.code)
        return { success: false }
      }
    } else {
      console.error('[capture-email] Insert error:', insertError.code)
      return { success: false }
    }
  }

  const { inngest, abandonmentStarted } = await import('~~/inngest/client')
  inngest.send(
    abandonmentStarted.create({
      email:            normalizedEmail,
      sessionId:        sessionId || '',
      firstName:        firstName || '',
      archetypeName:    archetypeName || '',
      archetypeEmoji:   archetypeEmoji || '',
      archetypeElement: archetypeElement || '',
      lifePath:         lifePath || '',
      birthCity:        birthCity || '',
      readingTradition: readingTradition || 'Western',
      language:         (language || 'EN').toUpperCase(),
    }),
  ).catch((err: unknown) => {
    console.error('[capture-email] inngest.send abandonment/started failed (non-blocking):', err instanceof Error ? err.message : String(err))
  })

  return { success: true }
})
