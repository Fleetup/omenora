import { serve } from 'inngest/nuxt'
import { inngest } from '~~/inngest/client'
import { welcomeInsight } from '~~/inngest/welcome-insight'
import { abandonmentSequence } from '~~/inngest/abandonment-sequence'
import { resendBouncedHandler, resendComplainedHandler } from '~~/inngest/resend-handlers'
import { zodiacCacheOrchestrator, zodiacCacheWorker } from '~~/inngest/zodiac-cache'
import { archetypeCacheOrchestrator, archetypeCacheWorker } from '~~/inngest/archetype-cache'
import { dailyInsightOrchestrator, dailyInsightWorker } from '~~/inngest/daily-insight-delivery'
import { weeklyTransitOrchestrator, weeklyTransitWorker } from '~~/inngest/weekly-transit-delivery'

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
    functions: [
      welcomeInsight,
      abandonmentSequence,
      resendBouncedHandler,
      resendComplainedHandler,
      zodiacCacheOrchestrator,
      zodiacCacheWorker,
      archetypeCacheOrchestrator,
      archetypeCacheWorker,
      dailyInsightOrchestrator,
      dailyInsightWorker,
      weeklyTransitOrchestrator,
      weeklyTransitWorker,
    ],
  }),
)
