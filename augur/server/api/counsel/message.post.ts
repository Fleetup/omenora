/**
 * POST /api/counsel/message
 *
 * STUB endpoint. Validates premium entitlement + monthly cap (30/month) and
 * increments usage. Real Claude streaming chat deferred to Phase 4 when
 * the Counsel chat screen is built.
 */
export default defineEventHandler(async (event) => {
  const ctx = await requirePremiumWithUsage(event, 'counsel')
  await incrementUsage(ctx.userId, ctx.feature, ctx.period)

  return {
    ok: true,
    feature: ctx.feature,
    usage: { count: ctx.count + 1, cap: ctx.cap, period: ctx.period, resets_at: ctx.resetsAt },
    note: 'STUB — counsel chat deferred to Phase 4',
  }
})
