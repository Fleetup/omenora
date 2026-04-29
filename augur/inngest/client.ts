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
 * Fired when a visitor enters their email at the paywall and abandons.
 * Triggers the 4-step abandonment email sequence (Phase 5).
 *
 * Fired from: server/api/capture-email.post.ts
 *
 * Data fields:
 *   email             — the captured email address
 *   sessionId         — the browser/quiz session ID at capture time
 *   firstName         — visitor's first name (for personalisation)
 *   archetypeName     — archetype display name (e.g. "The Phoenix")
 *   archetypeEmoji    — emoji for the archetype (e.g. "🔥")
 *   archetypeElement  — element name (e.g. "Fire")
 *   lifePath          — life path number as string (e.g. "7")
 *   birthCity         — city of birth (for personalisation)
 *   readingTradition  — reading tradition selected (e.g. "Western")
 *   language          — ISO language code uppercased (e.g. "EN")
 */
export const abandonmentStarted = eventType(
  'abandonment/started',
  {
    schema: staticSchema<{
      email:            string
      sessionId:        string
      firstName:        string
      archetypeName:    string
      archetypeEmoji:   string
      archetypeElement: string
      lifePath:         string
      birthCity:        string
      readingTradition: string
      language:         string
    }>(),
  },
)

/**
 * Fired when a Stripe checkout completes successfully.
 * Used as a cancelOn trigger for the abandonment sequence (Phase 5).
 *
 * Fired from: server/api/stripe/webhook.post.ts (checkout.session.completed)
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

/**
 * Fired by the weekly transit orchestrator once per compatibility_plus
 * subscriber on Monday morning. The worker fetches the compatibility report,
 * calls Claude for the weekly relationship weather, sends the email, and logs.
 *
 *   email          — subscriber email address
 *   firstName      — subscriber first name (or 'Friend')
 *   archetype      — subscriber archetype ID (e.g. "phoenix")
 *   lifePathNumber — subscriber life path number
 *   element        — subscriber element (e.g. "Fire")
 *   region         — subscriber region (e.g. "western")
 *   weekStart      — YYYY-MM-DD (Monday date derived from orchestrator event.ts)
 */
export const transitWeeklySend = eventType(
  'transit/weekly.send',
  {
    schema: staticSchema<{
      email:          string
      firstName:      string
      archetype:      string
      lifePathNumber: number
      element:        string
      region:         string
      weekStart:      string
    }>(),
  },
)

/**
 * Fired by the daily insight orchestrator once per active subscriber per day.
 * The worker handles the full send pipeline for one subscriber:
 * dedup check → cache fetch → email send → dual-write log.
 *
 *   email      — subscriber email address
 *   firstName  — subscriber first name (or 'Friend')
 *   archetype  — subscriber archetype ID (e.g. "phoenix")
 *   targetDate — YYYY-MM-DD derived from orchestrator event timestamp
 */
export const insightDailyInsightSend = eventType(
  'insight/daily-insight.send',
  {
    schema: staticSchema<{
      email:      string
      firstName:  string
      archetype:  string
      targetDate: string
    }>(),
  },
)

/**
 * Fired by the zodiac cache orchestrator once per zodiac sign per day.
 * The worker generates and upserts one daily_zodiac_cache row.
 *
 *   sign       — zodiac sign name (e.g. "Aries")
 *   targetDate — YYYY-MM-DD derived from the orchestrator event timestamp
 *   language   — ISO language code (default "en")
 */
export const cacheZodiacGenerate = eventType(
  'cache/zodiac.generate',
  {
    schema: staticSchema<{
      sign:       string
      targetDate: string
      language:   string
    }>(),
  },
)

/**
 * Fired by the archetype cache orchestrator once per archetype per day.
 * The worker generates love/work/health/reflection and upserts one
 * daily_archetype_cache row.
 *
 *   archetype  — archetype ID (e.g. "phoenix")
 *   targetDate — YYYY-MM-DD derived from the orchestrator event timestamp
 *   language   — ISO language code (default "en")
 */
export const cacheArchetypeGenerate = eventType(
  'cache/archetype.generate',
  {
    schema: staticSchema<{
      archetype:  string
      targetDate: string
      language:   string
    }>(),
  },
)

/**
 * Fired when Resend delivers an email.bounced webhook event.
 * The handler suppresses permanent/hard bounces in email_suppression
 * and deactivates the matching subscriber row.
 *
 * Field names match Resend's actual EmailBouncedEvent payload exactly:
 *   email_id   — data.email_id   (Resend's internal send UUID)
 *   to         — data.to[0]      (recipient address; to is string[] but always one entry for transactional)
 *   bounceType — data.bounce.type    (e.g. "Permanent" or "Transient")
 *   subType    — data.bounce.subType (e.g. "Suppressed", "General", "NoEmail")
 */
export const resendEmailBounced = eventType(
  'resend/email.bounced',
  {
    schema: staticSchema<{
      email_id:   string
      to:         string
      bounceType: string
      subType:    string
    }>(),
  },
)

/**
 * Fired when Resend delivers an email.complained webhook event.
 * The handler always suppresses the address and deactivates the
 * matching subscriber row.
 *
 * Field names match Resend's actual EmailComplainedEvent payload exactly:
 *   email_id — data.email_id (Resend's internal send UUID)
 *   to       — data.to[0]   (recipient address)
 */
export const resendEmailComplained = eventType(
  'resend/email.complained',
  {
    schema: staticSchema<{
      email_id: string
      to:       string
    }>(),
  },
)
