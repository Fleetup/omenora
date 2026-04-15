import { Resend } from 'resend'
import { getEmailTemplate } from '~~/server/utils/email-templates'

const SEQUENCE_DELAYS_MS: Record<number, number> = {
  1: 10 * 60 * 1000,       // 10 minutes
  2: 3 * 60 * 60 * 1000,   // 3 hours
  3: 24 * 60 * 60 * 1000,  // 24 hours
  4: 47 * 60 * 60 * 1000,  // 47 hours
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = sanitizeString(body.email, 254)
  const step  = Number(body.step)

  if (!isValidEmail(email) || ![1, 2, 3, 4].includes(step)) {
    return { success: false }
  }

  const config   = useRuntimeConfig()
  const delay    = SEQUENCE_DELAYS_MS[step]

  if (!delay) return { success: false }

  await new Promise<void>((resolve) => setTimeout(resolve, delay))

  const supabase = createSupabaseAdmin()
  const resend   = new Resend(config.resendApiKey as string)

  const { data: capture } = await supabase
    .from('email_captures')
    .select('*')
    .eq('email', email)
    .single()

  if (!capture)                    return { success: false }
  if (capture.purchased)           return { success: true, suppressed: true }
  if (capture.sequence_completed)  return { success: true, suppressed: true }

  const template = getEmailTemplate(step as 1 | 2 | 3 | 4, {
    email:             capture.email,
    firstName:         capture.first_name        || 'there',
    archetypeName:     capture.archetype_name     || 'your archetype',
    archetypeEmoji:    capture.archetype_emoji    || '✨',
    archetypeElement:  capture.archetype_element  || '',
    lifePath:          capture.life_path           || '',
    birthCity:         capture.birth_city          || '',
    readingTradition:  capture.reading_tradition   || 'Western',
    language:          capture.language            || 'EN',
  })

  try {
    await resend.emails.send({
      from: 'OMENORA <reading@omenora.com>',
      to:      capture.email,
      subject: template.subject,
      html:    template.html,
      headers: {
        'X-Entity-Ref-ID': `omenora-abandon-${step}-${capture.id}`,
      },
      tags: [
        { name: 'sequence_step', value: String(step) },
        { name: 'archetype',     value: capture.archetype_name || 'unknown' },
        { name: 'language',      value: capture.language       || 'EN' },
      ],
    })
  } catch (err) {
    console.error(`Email sequence step ${step} send failed for ${email}:`, err)
    return { success: false }
  }

  await supabase
    .from('email_captures')
    .update({
      sequence_step:      step,
      sequence_completed: step === 4,
      updated_at:         new Date().toISOString(),
    })
    .eq('email', email)

  if (step < 4) {
    $fetch('/api/email-sequence/trigger', {
      method: 'POST',
      body: { email, step: step + 1 },
    }).catch(() => {})
  }

  return { success: true }
})
