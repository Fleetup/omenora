import { inngest, abandonmentStarted, stripeCheckoutCompleted, userUnsubscribed } from './client'

/**
 * Abandonment sequence Inngest function — Phase 0+1 stub.
 *
 * This function is registered now so that:
 *   1. The cancelOn matchers for stripe/checkout.completed and user/unsubscribed
 *      are live in Inngest's control plane as soon as Phase 5 starts firing
 *      abandonment/started events.
 *   2. The function appears in the Inngest dashboard for Phase 5 planning.
 *
 * The body deliberately throws so any accidental trigger is unmistakable
 * in the dashboard. Full implementation lands in Phase 5.
 *
 * Phase 5 will:
 *   - Wire capture-email.post.ts to fire abandonment/started
 *   - Wire stripe/webhook.post.ts to fire stripe/checkout.completed
 *   - Wire unsubscribe.get.ts to fire user/unsubscribed
 *   - Replace this stub body with the 4-step abandonment email sequence
 *   - Retire the email_jobs polling worker
 */
export const abandonmentSequence = inngest.createFunction(
  {
    id: 'abandonment-sequence',
    name: 'Abandonment Sequence (stub — full implementation in Phase 5)',
    triggers: [{ event: abandonmentStarted }],
    retries: 4,
    cancelOn: [
      {
        event: stripeCheckoutCompleted,
        match: 'data.email',
      },
      {
        event: userUnsubscribed,
        match: 'data.email',
      },
    ],
  },
  async ({ step }) => {
    await step.run('stub-guard', async () => {
      throw new Error(
        'abandonment-sequence is a stub registered in Phase 0+1; full implementation lands in Phase 5',
      )
    })
  },
)
