/**
 * Health check endpoint for monitoring and load balancers
 * Returns 200 OK when the application is healthy
 */
export default defineEventHandler(async (event) => {
  const start = Date.now()
  const config = useRuntimeConfig()

  // Check critical service connectivity
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; message?: string }> = {}

  // 1. Check Supabase connectivity
  try {
    const supabaseStart = Date.now()
    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('reports').select('id', { count: 'exact', head: true })
    checks.supabase = {
      status: error ? 'error' : 'ok',
      latency: Date.now() - supabaseStart,
      message: error ? error.message : undefined,
    }
  } catch (err: any) {
    checks.supabase = { status: 'error', message: err.message }
  }

  // 2. Check Stripe connectivity (lightweight check)
  try {
    const stripeStart = Date.now()
    // Just verify the key is valid format, don't make actual API call
    const stripeKey = config.stripeSecretKey as string
    checks.stripe = {
      status: stripeKey && stripeKey.startsWith('sk_') ? 'ok' : 'error',
      latency: Date.now() - stripeStart,
      message: !stripeKey ? 'Missing Stripe key' : undefined,
    }
  } catch (err: any) {
    checks.stripe = { status: 'error', message: err.message }
  }

  // 3. Check Anthropic API key (format validation only)
  try {
    const anthropicKey = config.anthropicApiKey as string
    checks.anthropic = {
      status: anthropicKey && anthropicKey.startsWith('sk-ant-') ? 'ok' : 'error',
      message: !anthropicKey ? 'Missing Anthropic API key' : undefined,
    }
  } catch (err: any) {
    checks.anthropic = { status: 'error', message: err.message }
  }

  const totalLatency = Date.now() - start
  const hasErrors = Object.values(checks).some((c) => c.status === 'error')

  // Always return 200 — the server is up. Service degradation is reported in body.
  event.node.res.statusCode = 200

  return {
    status: hasErrors ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    latency: totalLatency,
    checks,
  }
})
