import { serve } from 'inngest/nuxt'
import { inngest } from '~~/inngest/client'
import { setupVerification } from '~~/inngest/setup-verification'
import { welcomeInsight } from '~~/inngest/welcome-insight'
import { abandonmentSequence } from '~~/inngest/abandonment-sequence'

/**
 * POST/GET/PUT /api/inngest
 *
 * Inngest discovery and execution endpoint.
 * The Inngest Cloud (and local dev server) calls this route to:
 *   - Sync the function list (GET / PUT)
 *   - Execute individual functions (POST)
 *
 * In production set INNGEST_SIGNING_KEY and INNGEST_EVENT_KEY as env vars.
 * The SDK reads them automatically — no explicit option needed.
 * In local dev (keys absent), the Inngest dev server at http://localhost:8288
 * handles auth automatically.
 */
export default defineEventHandler(
  serve({
    client: inngest,
    functions: [setupVerification, welcomeInsight, abandonmentSequence],
  }),
)
