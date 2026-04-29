/// <reference types="node" />
import { Inngest, eventType, staticSchema } from 'inngest'

/**
 * Inngest client for OMENORA.
 *
 * eventKey is read from the environment variable at module load time.
 * In local development with the Inngest dev server, it may be absent —
 * the dev server does not require signed requests.
 *
 * Production env var:  INNGEST_EVENT_KEY  (read natively by the Inngest SDK)
 * Signing key:          INNGEST_SIGNING_KEY (read natively by the serve handler)
 */
export const inngest = new Inngest({
  id: 'omenora',
  eventKey: process.env.INNGEST_EVENT_KEY || undefined,
})

// ── Typed event definitions ──────────────────────────────────────────────────

/**
 * Fired after a subscriber checkout completes.
 * Triggers the welcome insight generation + send flow.
 *
 * Data fields:
 *   email           — subscriber email address
 *   firstName       — subscriber first name (from Stripe metadata)
 *   archetype       — one of the 12 valid archetype IDs (e.g. "phoenix")
 *   lifePathNumber  — numerology life path number (0 if unavailable)
 *   element         — elemental affinity (e.g. "Earth")
 *   region          — regional style variant (e.g. "western")
 *   planType        — subscription tier: "daily_horoscope" | "compatibility_plus"
 *   sessionId       — Stripe checkout session ID — used as the Inngest idempotency key
 */
export const subscriberWelcomeSend = eventType(
  'subscriber/welcome.send',
  {
    schema: staticSchema<{
      email:          string
      firstName:      string
      archetype:      string
      lifePathNumber: number
      element:        string
      region:         string
      planType:       'daily_horoscope' | 'compatibility_plus'
      sessionId:      string
    }>(),
  },
)

/**
 * Fired when an unauthenticated user submits their email at the paywall.
 * Triggers the abandonment email sequence (Phase 5).
 *
 * NOT fired from anywhere yet — sender wiring is Phase 5 work.
 *
 * Data fields:
 *   email     — the captured email address
 *   sessionId — the browser/quiz session ID at capture time
 */
export const abandonmentStarted = eventType(
  'abandonment/started',
  {
    schema: staticSchema<{
      email:     string
      sessionId: string
    }>(),
  },
)

/**
 * Fired when a Stripe checkout completes successfully.
 * Used as a cancelOn trigger for the abandonment sequence (Phase 5).
 *
 * NOT fired from anywhere yet — sender wiring is Phase 5 work.
 *
 * Data fields:
 *   email      — the purchaser's email address
 *   sessionId  — the Stripe checkout session ID
 *   customerId — the Stripe customer ID
 */
export const stripeCheckoutCompleted = eventType(
  'stripe/checkout.completed',
  {
    schema: staticSchema<{
      email:      string
      sessionId:  string
      customerId: string
    }>(),
  },
)

/**
 * Fired when a user clicks the unsubscribe link in any OMENORA email.
 * Used as a cancelOn trigger for the abandonment sequence (Phase 5).
 *
 * NOT fired from anywhere yet — sender wiring is Phase 5 work.
 *
 * Data fields:
 *   email — the unsubscribed email address
 */
export const userUnsubscribed = eventType(
  'user/unsubscribed',
  {
    schema: staticSchema<{
      email: string
    }>(),
  },
)
