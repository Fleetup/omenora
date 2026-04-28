# OMENORA — Windsurf Implementation Prompt
## Microsoft Clarity + Dev-Mode Test Traffic Filter

---

## PART 1 — Manual setup BEFORE running Windsurf

### Step 1.1 — Create Microsoft Clarity project

1. Go to **https://clarity.microsoft.com**
2. Sign in (Microsoft / Google / Facebook account works)
3. Click **+ New Project**
4. **Name:** `OMENORA`
5. **Website URL:** `https://omenora.com`
6. **Category:** `Lifestyle`
7. After creation → click **Settings → Setup**
8. Copy the **Project ID** (looks like `qhx9kz3p2m` — 10 chars)

### Step 1.2 — Add to Railway

1. Open Railway → `omenora` service → **Variables** tab
2. Click **+ New Variable**
3. **Name:** `NUXT_PUBLIC_CLARITY_PROJECT_ID`
4. **Value:** paste the project ID from Step 1.1
5. **DO NOT redeploy yet** — wait until Windsurf has pushed the code changes, then Railway will auto-deploy on push.

---

## PART 2 — Windsurf prompt

Copy everything between the lines below into Windsurf as a single prompt.

---

```
CONTEXT:
App: OMENORA (omenora.com)
Stack: Nuxt 3 + Vue 3 + Pinia + Supabase + Stripe + Resend
Deployment: GitHub → Railway auto-deploy on push to main
Existing files (DO NOT BREAK):
- plugins/pixels.client.ts (TikTok + Meta pixels — already firing correctly in production)
- server/api/capture-email.post.ts (or equivalent — writes to Supabase email_captures table)
- Supabase email_captures table (live, capturing real users)

GOAL:
Install Microsoft Clarity for session recording AND add a developer-mode toggle that:
1. Excludes the developer's own browsing from Clarity, TikTok Pixel, and Meta Pixel
2. Marks any Supabase writes from the developer as test data (is_test = true) instead of polluting production analytics
3. Persists across browser sessions via localStorage on the dev's machine
4. Is toggleable via URL params: ?test=1 enables, ?test=0 disables
5. Shows a small banner in the corner when active so the dev visually knows they're excluded

All analytics code remains client-side only. No SSR execution.

NUXT_PUBLIC_CLARITY_PROJECT_ID is already set as a Railway environment variable. Do NOT hardcode it. Read from runtimeConfig.

---

STEP 1 — Update nuxt.config.ts

Add clarityProjectId to runtimeConfig.public:

runtimeConfig: {
  public: {
    // ... keep all existing public keys
    clarityProjectId: '',  // populated from NUXT_PUBLIC_CLARITY_PROJECT_ID at runtime
  }
}

Do not add any script tags to app.head. Plugins handle injection.

---

STEP 2 — Create dev-mode composable

Create file: composables/useDevMode.ts

import { ref } from 'vue'

export const useDevMode = () => {
  const isDevMode = ref(false)

  const checkDevMode = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('omenora_dev_mode') === 'true'
  }

  const setDevMode = () => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('omenora_dev_mode', 'true')
    isDevMode.value = true
  }

  const clearDevMode = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem('omenora_dev_mode')
    isDevMode.value = false
  }

  if (process.client) {
    isDevMode.value = checkDevMode()
  }

  return { isDevMode, setDevMode, clearDevMode, checkDevMode }
}

---

STEP 3 — Create dev-mode initialization plugin (loads FIRST)

Create file: plugins/00-dev-mode.client.ts

The "00-" prefix is critical. Nuxt loads plugins in alphabetical order. This must run BEFORE clarity.client.ts and pixels.client.ts so they can read the flag.

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const testParam = url.searchParams.get('test')

  if (testParam === '1') {
    window.localStorage.setItem('omenora_dev_mode', 'true')
  } else if (testParam === '0') {
    window.localStorage.removeItem('omenora_dev_mode')
  }

  // Synchronous global flag for other plugins to read
  ;(window as any).__OMENORA_DEV_MODE =
    window.localStorage.getItem('omenora_dev_mode') === 'true'

  if ((window as any).__OMENORA_DEV_MODE) {
    console.log(
      '%c[OMENORA DEV MODE ACTIVE]',
      'background:#8c6eff;color:white;padding:4px 8px;border-radius:4px;font-weight:bold'
    )
    console.log('Pixels, Clarity, and prod-data writes are disabled on this browser.')
    console.log('To disable, visit any OMENORA page with ?test=0')
  }
})

---

STEP 4 — Update plugins/pixels.client.ts

Open the existing file. At the very top of the function returned by defineNuxtPlugin, BEFORE any other code runs, add this guard:

if (typeof window !== 'undefined' && (window as any).__OMENORA_DEV_MODE) {
  console.log('[OMENORA] Pixels skipped — dev mode active')
  return
}

This must be the FIRST executable line inside defineNuxtPlugin. Do not modify any other pixel logic. Both TikTok and Meta pixels will be skipped together.

---

STEP 5 — Create Microsoft Clarity plugin

Create file: plugins/clarity.client.ts

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  if ((window as any).__OMENORA_DEV_MODE) {
    console.log('[OMENORA] Clarity skipped — dev mode active')
    return
  }

  const config = useRuntimeConfig()
  const projectId = config.public.clarityProjectId

  if (!projectId) {
    console.warn('[Clarity] No project ID configured')
    return
  }

  // Microsoft Clarity base snippet (TypeScript-safe)
  ;(function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] =
      c[a] ||
      function () {
        ;(c[a].q = c[a].q || []).push(arguments)
      }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src = 'https://www.clarity.ms/tag/' + i
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script', projectId)

  console.log('[OMENORA] Clarity initialized')
})

---

STEP 6 — Create dev-mode banner component

Create file: components/DevModeBanner.vue

<template>
  <ClientOnly>
    <div v-if="isDevMode" class="dev-mode-banner">
      <span>🛠 DEV MODE — analytics disabled</span>
      <button @click="disableDevMode">disable</button>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { isDevMode, clearDevMode } = useDevMode()

const disableDevMode = () => {
  clearDevMode()
  if (typeof window !== 'undefined') window.location.reload()
}
</script>

<style scoped>
.dev-mode-banner {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: rgba(140, 110, 255, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  font-family: system-ui, -apple-system, sans-serif;
  pointer-events: auto;
}
.dev-mode-banner button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
}
.dev-mode-banner button:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

Mount this in the global layout. Open layouts/default.vue (or app.vue if no default layout exists) and add <DevModeBanner /> just before the closing </template> tag (or anywhere inside the root template — its position is fixed).

---

STEP 7 — Add is_test column to Supabase

Run this SQL in the Supabase SQL Editor:

ALTER TABLE email_captures
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_email_captures_is_test
  ON email_captures(is_test);

If there are other tables that store funnel events from real users (e.g. analyses, paywall_events, tier_selections), apply the same ALTER TABLE to each. Priority is email_captures.

---

STEP 8 — Update Supabase write logic to send is_test

Locate every place in the codebase that writes to email_captures. Likely:
- server/api/capture-email.post.ts
- pages/preview.vue (if writing client-side anywhere)
- Any composable that handles email capture

CLIENT SIDE — wherever the API is called, read the dev-mode flag and pass it:

const isTest =
  typeof window !== 'undefined' &&
  (window as any).__OMENORA_DEV_MODE === true

await $fetch('/api/capture-email', {
  method: 'POST',
  body: {
    email: emailValue,
    archetype: archetypeValue,
    // ... existing fields
    is_test: isTest,
  },
})

SERVER SIDE — in server/api/capture-email.post.ts (or equivalent), accept the field and persist it with explicit boolean coercion:

const body = await readBody(event)

const { data, error } = await supabase
  .from('email_captures')
  .insert({
    email: body.email,
    archetype: body.archetype,
    // ... other existing fields
    is_test: body.is_test === true,
  })

Apply the same pattern to any OTHER Supabase write paths from the funnel (tier selection, analysis submission, etc.) if those tables also have the is_test column added.

---

STEP 9 — Add TypeScript declarations

Create file (or merge if it already exists): types/global.d.ts

declare global {
  interface Window {
    __OMENORA_DEV_MODE?: boolean
    clarity?: any
    ttq?: any
    fbq?: any
  }
}

export {}

If types/global.d.ts already exists, MERGE the Window interface — do not duplicate the file.

Ensure tsconfig.json includes types/**/*.d.ts in its "include" array. If not present, add it.

---

VERIFICATION CHECKLIST (run after Railway redeploys):

1. Open omenora.com in INCOGNITO (clean browser, no localStorage flag)
   → Console should log "[OMENORA] Clarity initialized"
   → TikTok Pixel Helper should show PageView firing
   → Within 2 minutes, the session should appear in clarity.microsoft.com dashboard

2. Open omenora.com?test=1 in your normal dev browser
   → Console logs purple "[OMENORA DEV MODE ACTIVE]" banner
   → Console logs "[OMENORA] Pixels skipped — dev mode active"
   → Console logs "[OMENORA] Clarity skipped — dev mode active"
   → Purple "🛠 DEV MODE" banner appears bottom-right corner of every page
   → TikTok Pixel Helper shows ZERO events firing
   → No new session appears in Clarity dashboard

3. While in dev mode, complete the funnel and submit a test email
   → Open Supabase → email_captures table
   → Newest row has is_test = TRUE

4. Visit omenora.com?test=0 on the dev browser
   → Banner disappears, pixels resume firing
   → Visit again normally → no banner, normal tracking restored

If all 4 verifications pass, the system is correct.

DO NOT redeploy manually — Railway auto-deploys on push to main. Only push when all 9 steps are complete.
```

---

## PART 3 — After Windsurf finishes

1. **Confirm Windsurf pushed to GitHub** — check the omenora repo on github.com for a new commit.
2. **Railway auto-deploys** — watch the Deployments tab. Wait ~2 minutes for `Active`.
3. **Run the 4 verification checks** in the prompt above. Don't skip any.
4. **On every device/browser you use to test OMENORA**, visit `https://omenora.com?test=1` once. The flag persists in localStorage so each browser only needs the flag set once.
   - Your laptop → set once
   - Your phone (if you test on mobile) → set once
   - Any other browser → set once
5. **Tell me when verification passes.** Then we wait 24 hours for clean real-user data and watch Clarity recordings to see exactly where users bail in the form.

---

## What this does NOT do (and what's still on your action list)

This prompt sets up clean instrumentation. It does NOT:

- Test that Stripe checkout actually works end-to-end (you still need to do this manually with the dev-mode flag ON, then check Stripe dashboard for the test charge — refund yourself after).
- Resolve the "1 issue" diagnostic warning on the Purchase event in TikTok Events Manager (still need to click into that and report what it says).
- Verify the abandonment email sequence is firing for captured emails (check Resend logs).

Do those three things while Clarity collects 24 hours of real user data. Then we reconvene with evidence.
