/**
 * Health check endpoint for monitoring and load balancers.
 *
 * Public callers (Railway TCP health check, uptime monitors) receive a
 * minimal { status, timestamp } response — no internal details.
 *
 * Authenticated callers (internal monitoring, Railway cron) include the
 * header  x-health-secret: <NUXT_EMAIL_JOB_SECRET>  and receive the full
 * diagnostic breakdown including service latencies and error messages.
 */
export default defineEventHandler(async (event) => {
  const start  = Date.now()
  const config = useRuntimeConfig()

  // ── Always return 200 so Railway/load-balancers consider the app up ─────────
  event.node.res.statusCode = 200

  // ── Authenticated path — full diagnostics ───────────────────────────────────
  const incomingSecret = getHeader(event, 'x-health-secret') ?? ''
  const expectedSecret = (config.emailJobSecret as string | undefined) ?? ''
  const isAuthorized   = expectedSecret && incomingSecret === expectedSecret

  if (!isAuthorized) {
    // Unauthenticated: minimal safe response only
    return {
      status:    'ok',
      timestamp: new Date().toISOString(),
    }
  }

  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; message?: string }> = {}

  // 1. Supabase connectivity
  try {
    const t0 = Date.now()
    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('reports').select('id', { count: 'exact', head: true })
    checks.supabase = {
      status:  error ? 'error' : 'ok',
      latency: Date.now() - t0,
      message: error ? error.code : undefined,
    }
  } catch (err: any) {
    checks.supabase = { status: 'error', message: err.message }
  }

  // 2. Stripe key format
  try {
    const t0        = Date.now()
    const stripeKey = config.stripeSecretKey as string
    checks.stripe = {
      status:  stripeKey?.startsWith('sk_') ? 'ok' : 'error',
      latency: Date.now() - t0,
      message: stripeKey?.startsWith('sk_') ? undefined : 'key missing or invalid format',
    }
  } catch (err: any) {
    checks.stripe = { status: 'error', message: err.message }
  }

  // 3. Anthropic key format
  try {
    const anthropicKey = config.anthropicApiKey as string
    checks.anthropic = {
      status:  anthropicKey?.startsWith('sk-ant-') ? 'ok' : 'error',
      message: anthropicKey?.startsWith('sk-ant-') ? undefined : 'key missing or invalid format',
    }
  } catch (err: any) {
    checks.anthropic = { status: 'error', message: err.message }
  }

  // 4. Resend key presence
  try {
    const resendKey = config.resendApiKey as string
    checks.resend = {
      status:  resendKey ? 'ok' : 'error',
      message: resendKey ? undefined : 'key missing',
    }
  } catch (err: any) {
    checks.resend = { status: 'error', message: err.message }
  }

  const hasErrors = Object.values(checks).some((c) => c.status === 'error')

  return {
    status:      hasErrors ? 'degraded' : 'healthy',
    timestamp:   new Date().toISOString(),
    version:     process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    latency:     Date.now() - start,
    checks,
  }
})
