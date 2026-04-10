import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const stripeCustomerId     = sanitizeString(body.stripeCustomerId, 100)
  const stripeSubscriptionId = sanitizeString(body.stripeSubscriptionId, 100)
  const email                = sanitizeString(body.email, 254)
  const firstName            = sanitizeString(body.firstName, 50)
  const archetype            = sanitizeString(body.archetype, 30)
  const lifePathNumber       = body.lifePathNumber !== undefined ? Number(body.lifePathNumber) : null
  const element              = sanitizeString(body.element, 20)
  const region               = isValidRegion(body.region) ? body.region : 'western'

  assertInput(!!stripeCustomerId, 'stripeCustomerId is required')
  assertInput(!!stripeSubscriptionId, 'stripeSubscriptionId is required')
  assertInput(isValidEmail(email), 'Valid email is required')

  const supabase = createClient(
    config.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { error } = await supabase
    .from('subscribers')
    .upsert({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      email,
      first_name: firstName,
      archetype,
      life_path_number: lifePathNumber,
      element,
      region,
      active: true,
    })

  if (error) {
    console.error('Subscriber save error:', error.code)
    throw createError({ statusCode: 500, message: 'Failed to save subscriber' })
  }

  return { success: true }
})
