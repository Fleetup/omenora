/**
 * POST /api/reports/forecast
 *
 * STUB endpoint. Validates premium entitlement + monthly cap (4/mo) and
 * increments usage. Real report generation (Claude API call with chart context)
 * deferred to Phase 3/4 when the forecast reading screens are built.
 */
export default defineEventHandler(async (event) => {
  const ctx = await requirePremiumWithUsage(event, 'forecast')
  await incrementUsage(ctx.userId, ctx.feature, ctx.period)

  return {
    ok: true,
    feature: ctx.feature,
    usage: { count: ctx.count + 1, cap: ctx.cap, period: ctx.period, resets_at: ctx.resetsAt },
    note: 'STUB — report generation deferred to Phase 3/4',
  }
})
