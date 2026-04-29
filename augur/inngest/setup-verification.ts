import { inngest } from './client'

/**
 * Setup verification stub — safe to delete once real Inngest functions exist.
 *
 * Triggered by a cron schedule that effectively never runs (1 January at
 * midnight UTC). Its only purpose is to prove the Inngest integration is wired
 * up correctly: the dev server at http://localhost:8288 should list this
 * function after `npx inngest-cli@latest dev` is started alongside `npm run dev`.
 */
export const setupVerification = inngest.createFunction(
  {
    id: 'setup-verification',
    name: 'Setup Verification (stub — delete when real functions exist)',
    triggers: [{ cron: '0 0 1 1 *' }], // 1 Jan 00:00 UTC — essentially never
  },
  async () => {
    return { ok: true }
  },
)
