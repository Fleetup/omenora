/**
 * Email job queue utility — Supabase-backed, crash-safe.
 *
 * Replaces the previous setTimeout-based approach that was killed by HTTP
 * timeouts on Railway (and every other cloud platform). Jobs are persisted in
 * the `email_jobs` table and processed by the /api/process-email-jobs worker,
 * which is called on a schedule (Railway cron or self-scheduling via the
 * health-check ping endpoint).
 *
 * Table DDL (run once in Supabase SQL editor):
 * ─────────────────────────────────────────────
 * create table if not exists email_jobs (
 *   id            uuid primary key default gen_random_uuid(),
 *   email         text not null,
 *   step          smallint not null check (step between 1 and 4),
 *   run_at        timestamptz not null,
 *   status        text not null default 'pending'
 *                   check (status in ('pending','processing','done','failed')),
 *   attempts      smallint not null default 0,
 *   last_error    text,
 *   created_at    timestamptz not null default now(),
 *   updated_at    timestamptz not null default now()
 * );
 * create index if not exists email_jobs_run_at_status_idx
 *   on email_jobs (run_at, status);
 * ─────────────────────────────────────────────
 */

/** Delay (ms) before each sequence step fires. */
export const SEQUENCE_DELAYS_MS: Record<number, number> = {
  1: 10 * 60 * 1000,       // 10 minutes
  2: 3 * 60 * 60 * 1000,   // 3 hours
  3: 24 * 60 * 60 * 1000,  // 24 hours
  4: 47 * 60 * 60 * 1000,  // 47 hours
}

/**
 * Insert a single email job into the queue.
 * Idempotent: if a pending/processing job for the same (email, step) already
 * exists, we skip the insert to avoid duplicate sends.
 */
export async function scheduleEmailJob(
  email: string,
  step: number,
  delayMs: number,
): Promise<void> {
  const supabase = createSupabaseAdmin()
  const runAt = new Date(Date.now() + delayMs).toISOString()

  // Check for an existing pending/processing job for this (email, step) pair.
  const { data: existing } = await supabase
    .from('email_jobs')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('step', step)
    .in('status', ['pending', 'processing'])
    .maybeSingle()

  if (existing) return // already queued — skip

  const { error } = await supabase.from('email_jobs').insert({
    email: email.toLowerCase().trim(),
    step,
    run_at: runAt,
    status: 'pending',
    attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error(`[email-jobs] Failed to schedule step ${step} for ${email}:`, error.code)
  }
}

/**
 * Cancel all pending jobs for a given email (called on purchase / unsubscribe).
 */
export async function cancelEmailJobs(email: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  await supabase
    .from('email_jobs')
    .update({ status: 'done', updated_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'pending')
}
