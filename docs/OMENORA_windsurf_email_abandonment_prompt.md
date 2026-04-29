# OMENORA — Windsurf Implementation Prompt
## Email Abandonment Sequence + Preview Page Email Capture Fix

---

## CONTEXT

You are working on OMENORA (`omenora.com`), an AI-powered destiny reading web app.
Tech stack: **Nuxt 3 (Vue 3) + Nitro server routes + Supabase + Resend + Stripe + Railway (Docker)**.

The user flow is:
1. `/` → landing page
2. `/analysis` → 2-step intake form (step 1: name, DOB, city, birth time, tradition, language / step 2: 7 behavioral questions)
3. `/preview` → AI archetype teaser + 3-tier paywall with email capture field
4. `/report` → full paid report

The problem to solve has **two parts**:

**Part 1 — Email capture fix on `/preview`**
The email input on the preview page must write to Supabase the moment the user enters their email (on `blur` or `input` event), NOT after Stripe payment. Currently if the user types their email and abandons without paying, we capture nothing. This must be fixed before any email sequence works.

**Part 2 — 4-email abandonment sequence via Resend**
After a user's email is captured on `/preview` but no purchase is made, send a precisely timed sequence of 4 emails. If the user purchases at any point, the sequence must be suppressed immediately using the Stripe webhook.

---

## PART 1 — SUPABASE SCHEMA

Create or verify this table exists in Supabase:

```sql
CREATE TABLE IF NOT EXISTS email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  archetype_name TEXT,
  archetype_emoji TEXT,
  archetype_element TEXT,
  life_path TEXT,
  archetype_traits JSONB,
  birth_city TEXT,
  reading_tradition TEXT,
  language TEXT DEFAULT 'EN',
  session_id TEXT,
  purchased BOOLEAN DEFAULT FALSE,
  abandoned_at TIMESTAMPTZ DEFAULT NOW(),
  sequence_step INTEGER DEFAULT 0,
  sequence_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_purchased ON email_captures(purchased);
CREATE INDEX IF NOT EXISTS idx_email_captures_sequence_step ON email_captures(sequence_step);
```

---

## PART 1 — FRONTEND FIX (`/preview` page)

In the preview page component (`pages/preview.vue` or equivalent), find the email input field.

**Current behavior (broken):** Email is only submitted as part of the Stripe checkout form on button click.

**Required behavior:** The moment the user enters their email (on `blur` event — when they click away from the field), call a new server route to save the email + all session data to Supabase.

### Implementation in `pages/preview.vue`:

```vue
<script setup>
// Existing session data should already be available in the preview page
// via composable, Pinia store, or route state. Use whatever pattern exists.
// The variables needed are:
// - email (from the email input)
// - firstName, archetypeName, archetypeEmoji, archetypeElement
// - lifePath, archetypeTraits, birthCity, readingTradition, language
// - sessionId (generate with crypto.randomUUID() if not already present)

const emailInput = ref('')
const captureSubmitted = ref(false)

async function onEmailBlur() {
  if (!emailInput.value || !emailInput.value.includes('@') || captureSubmitted.value) return
  captureSubmitted.value = true

  try {
    await $fetch('/api/capture-email', {
      method: 'POST',
      body: {
        email: emailInput.value,
        firstName: sessionData.firstName,          // from store/state
        archetypeName: sessionData.archetypeName,  // from store/state
        archetypeEmoji: sessionData.archetypeEmoji,
        archetypeElement: sessionData.archetypeElement,
        lifePath: sessionData.lifePath,
        archetypeTraits: sessionData.archetypeTraits,
        birthCity: sessionData.birthCity,
        readingTradition: sessionData.readingTradition,
        language: sessionData.language,
        sessionId: sessionData.sessionId || crypto.randomUUID(),
      }
    })
  } catch (e) {
    // Silent fail — never block the UI for this
    console.error('Email capture failed silently:', e)
  }
}
</script>

<template>
  <!-- Find the existing email input and add the blur handler -->
  <input
    v-model="emailInput"
    type="email"
    placeholder="your@email.com"
    @blur="onEmailBlur"
  />
</template>
```

**Important:** Do not show any UI change, spinner, or error to the user when this fires. It must be completely invisible. Silent fail on error — never block the user from proceeding to checkout.

---

## PART 1 — SERVER ROUTE: `/api/capture-email`

Create file: `server/api/capture-email.post.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    email, firstName, archetypeName, archetypeEmoji, archetypeElement,
    lifePath, archetypeTraits, birthCity, readingTradition, language, sessionId
  } = body

  if (!email || !email.includes('@')) {
    return { success: false }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use service role — not anon key
  )

  // Upsert on email — if same email re-enters flow, update rather than duplicate
  const { error } = await supabase
    .from('email_captures')
    .upsert({
      email: email.toLowerCase().trim(),
      first_name: firstName,
      archetype_name: archetypeName,
      archetype_emoji: archetypeEmoji,
      archetype_element: archetypeElement,
      life_path: lifePath,
      archetype_traits: archetypeTraits,
      birth_city: birthCity,
      reading_tradition: readingTradition,
      language: language || 'EN',
      session_id: sessionId,
      purchased: false,
      abandoned_at: new Date().toISOString(),
      sequence_step: 0,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'email',
      ignoreDuplicates: false // Always update with fresh session data
    })

  if (error) {
    console.error('Email capture Supabase error:', error)
    return { success: false }
  }

  // Trigger Email 1 immediately (10-minute delay handled inside the email route)
  // We schedule this via a non-blocking call
  $fetch('/api/email-sequence/trigger', {
    method: 'POST',
    body: { email: email.toLowerCase().trim(), step: 1 }
  }).catch(() => {}) // Fire and forget

  return { success: true }
})
```

---

## PART 2 — EMAIL SEQUENCE ENGINE

### Step A: Resend email templates

Create file: `server/utils/email-templates.ts`

This file contains all 4 email templates for all 6 languages with full personalization.

```typescript
export interface EmailPersonalization {
  email: string
  firstName: string
  archetypeName: string
  archetypeEmoji: string
  archetypeElement: string
  lifePath: string
  readingTradition: string
  language: string
  birthCity: string
}

type Lang = 'EN' | 'ES' | 'PT' | 'HI' | 'KO' | 'ZH'

export function getEmailTemplate(step: 1 | 2 | 3 | 4, data: EmailPersonalization) {
  const lang = (data.language?.toUpperCase() as Lang) || 'EN'
  const templates: Record<Lang, Record<number, { subject: string; preview: string; html: string }>> = {
    EN: {
      1: {
        subject: `${data.firstName}, your ${data.archetypeName} reading is still here`,
        preview: `We held it for you. It won't be here forever.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}, your reading is still here.`,
          body: `
            <p>You got close.</p>
            <p>Your <strong>${data.archetypeName}</strong> reading is still here — the full analysis, everything that was locked behind that blur. It was generated specifically for you and it exists only once.</p>
            <p>You saw the beginning. The part about how you move through the world in a way most people admire but rarely understand.</p>
            <p>That's the surface. What's locked is the part that actually explains <em>why</em> — the shadow patterns, the relationship wiring, the reason certain things drain you in a way that's hard to articulate.</p>
            <p>Your reading expires in 47 hours.</p>
          `,
          ctaText: `Unlock your full ${data.archetypeName} reading — $4.99`,
          footerNote: 'Secured by Stripe. Apple Pay and Google Pay accepted.',
        })
      },
      2: {
        subject: `What the ${data.archetypeName} never finds out about themselves`,
        preview: `This is in your locked sections.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `What's locked in your reading.`,
          body: `
            <p>${data.firstName},</p>
            <p>Most people who get the <strong>${data.archetypeName}</strong> archetype read the teaser and think they understand what it means.</p>
            <p>They don't. Not yet.</p>
            <p>What's locked in your full reading:</p>
            <ul>
              <li><strong>Your shadow self.</strong> The version of you that shows up when you're protecting something. What you do that you're not fully conscious of.</li>
              <li><strong>Your relationship pattern.</strong> Why the same dynamic keeps appearing with different people. What you're actually looking for versus what you keep choosing.</li>
              <li><strong>Your 2026 forecast.</strong> The specific windows this year where your ${data.archetypeElement} energy peaks — and the months where pushing harder will cost you more than it earns.</li>
            </ul>
            <p>None of this is generic. It was built from your birth data, your answers to those seven questions, and the ${data.readingTradition} tradition you selected.</p>
            <p>$4.99. One time.</p>
          `,
          ctaText: `Read the full ${data.archetypeName} analysis`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName} — your reading expires tomorrow`,
        preview: `After that, your analysis is deleted.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Your reading expires in 23 hours.`,
          body: `
            <p>${data.firstName}.</p>
            <p>Your <strong>${data.archetypeName}</strong> reading expires in 23 hours.</p>
            <p>After that, the analysis we ran — the one that used your birth data, your birth location, and your answers to build something specifically for you — gets deleted. We don't store unredeemed readings.</p>
            <p>The <strong>${data.archetypeName}</strong> is one of the rarest archetypes we generate. Most people who receive it don't fully understand what it means until they read the locked sections. The teaser you saw is the neutral version. What's inside is the honest version.</p>
            <p>If you've been wondering whether it's worth it — the answer is yes, and $4.99 is the reason you don't need to think about it.</p>
          `,
          ctaText: `Unlock now — $4.99 — expires in 23 hours`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `Last chance. Your ${data.archetypeName} reading deletes tonight.`,
        preview: `This is the last email we'll send.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `This is the last email.`,
          body: `
            <p>${data.firstName},</p>
            <p>Your <strong>${data.archetypeName}</strong> reading — Life Path ${data.lifePath}, ${data.archetypeElement}, the full 7-section analysis — expires tonight.</p>
            <p>We built it for you once. We won't rebuild it.</p>
          `,
          ctaText: `Unlock before it's gone — $4.99`,
          footerNote: `This is the last email we will send about your reading.`,
          urgent: true,
        })
      }
    },
    ES: {
      1: {
        subject: `${data.firstName}, tu lectura de ${data.archetypeName} sigue aquí`,
        preview: `La guardamos para ti. No estará aquí para siempre.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}, tu lectura sigue aquí.`,
          body: `
            <p>Estuviste a punto.</p>
            <p>Tu lectura de <strong>${data.archetypeName}</strong> sigue aquí — el análisis completo, todo lo que estaba bloqueado. Fue generada específicamente para ti y existe solo una vez.</p>
            <p>Viste el comienzo. La parte que habla de cómo te mueves por el mundo de una manera que otros admiran pero rara vez comprenden.</p>
            <p>Eso es la superficie. Lo que está bloqueado es la parte que explica el <em>por qué</em> — los patrones de sombra, el cableado relacional, la razón por la que ciertas cosas te drenan de una manera difícil de articular.</p>
            <p>Tu lectura expira en 47 horas.</p>
          `,
          ctaText: `Desbloquea tu lectura completa de ${data.archetypeName} — $4.99`,
          footerNote: 'Protegido por Stripe. Se acepta Apple Pay y Google Pay.',
        })
      },
      2: {
        subject: `Lo que el ${data.archetypeName} nunca descubre sobre sí mismo`,
        preview: `Esto está en tus secciones bloqueadas.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Lo que hay en tu lectura bloqueada.`,
          body: `
            <p>${data.firstName},</p>
            <p>La mayoría de las personas que obtienen el arquetipo <strong>${data.archetypeName}</strong> leen el adelanto y creen que lo entienden.</p>
            <p>No es así. Todavía no.</p>
            <ul>
              <li><strong>Tu sombra.</strong> La versión de ti que aparece cuando estás protegiéndote. Lo que haces sin ser completamente consciente de ello.</li>
              <li><strong>Tu patrón relacional.</strong> Por qué la misma dinámica sigue apareciendo con personas diferentes.</li>
              <li><strong>Tu pronóstico 2026.</strong> Las ventanas específicas de este año donde tu energía ${data.archetypeElement} alcanza su pico.</li>
            </ul>
            <p>$4.99. Una sola vez.</p>
          `,
          ctaText: `Lee el análisis completo de ${data.archetypeName}`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName} — tu lectura expira mañana`,
        preview: `Después de eso, tu análisis se elimina.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Tu lectura expira en 23 horas.`,
          body: `
            <p>${data.firstName}.</p>
            <p>Tu lectura de <strong>${data.archetypeName}</strong> expira en 23 horas. Después, el análisis se elimina.</p>
            <p>Si te has preguntado si vale la pena — la respuesta es sí, y $4.99 es la razón por la que no necesitas pensarlo.</p>
          `,
          ctaText: `Desbloquear ahora — $4.99 — expira en 23 horas`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `Última oportunidad. Tu lectura de ${data.archetypeName} se elimina esta noche.`,
        preview: `Este es el último correo que enviaremos.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Este es el último correo.`,
          body: `
            <p>${data.firstName},</p>
            <p>Tu lectura de <strong>${data.archetypeName}</strong> expira esta noche. La creamos una vez. No la recrearemos.</p>
          `,
          ctaText: `Desbloquear antes de que desaparezca — $4.99`,
          footerNote: 'Este es el último correo que enviaremos sobre tu lectura.',
          urgent: true,
        })
      }
    },
    PT: {
      1: {
        subject: `${data.firstName}, sua leitura de ${data.archetypeName} ainda está aqui`,
        preview: `Guardamos para você. Não vai durar para sempre.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}, sua leitura ainda está aqui.`,
          body: `
            <p>Você chegou perto.</p>
            <p>Sua leitura de <strong>${data.archetypeName}</strong> ainda está aqui — a análise completa, tudo que estava bloqueado. Foi gerada especificamente para você e existe apenas uma vez.</p>
            <p>Você viu o começo. A parte sobre como você se move pelo mundo de uma forma que os outros admiram, mas raramente entendem.</p>
            <p>Isso é a superfície. O que está bloqueado é a parte que explica o <em>porquê</em>.</p>
            <p>Sua leitura expira em 47 horas.</p>
          `,
          ctaText: `Desbloqueie sua leitura completa de ${data.archetypeName} — $4.99`,
          footerNote: 'Protegido pelo Stripe. Apple Pay e Google Pay aceitos.',
        })
      },
      2: {
        subject: `O que o ${data.archetypeName} nunca descobre sobre si mesmo`,
        preview: `Isso está nas suas seções bloqueadas.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `O que está na sua leitura bloqueada.`,
          body: `
            <p>${data.firstName},</p>
            <ul>
              <li><strong>Sua sombra.</strong> A versão de você que aparece quando está se protegendo.</li>
              <li><strong>Seu padrão de relacionamento.</strong> Por que a mesma dinâmica continua aparecendo com pessoas diferentes.</li>
              <li><strong>Sua previsão 2026.</strong> As janelas específicas onde sua energia ${data.archetypeElement} atinge o pico.</li>
            </ul>
            <p>$4.99. Uma vez só.</p>
          `,
          ctaText: `Leia a análise completa de ${data.archetypeName}`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName} — sua leitura expira amanhã`,
        preview: `Depois disso, sua análise é deletada.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Sua leitura expira em 23 horas.`,
          body: `
            <p>${data.firstName}. Sua leitura de <strong>${data.archetypeName}</strong> expira em 23 horas. Depois, a análise é deletada.</p>
            <p>$4.99 é a razão pela qual você não precisa pensar muito nisso.</p>
          `,
          ctaText: `Desbloquear agora — $4.99 — expira em 23 horas`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `Última chance. Sua leitura de ${data.archetypeName} é deletada hoje à noite.`,
        preview: `Este é o último e-mail que enviaremos.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `Este é o último e-mail.`,
          body: `<p>${data.firstName}, sua leitura expira hoje à noite. A criamos uma vez. Não vamos recriar.</p>`,
          ctaText: `Desbloquear antes que desapareça — $4.99`,
          footerNote: 'Este é o último e-mail que enviaremos sobre sua leitura.',
          urgent: true,
        })
      }
    },
    KO: {
      1: {
        subject: `${data.firstName}님, 당신의 ${data.archetypeName} 리딩이 아직 여기 있습니다`,
        preview: `저희가 보관하고 있습니다. 영원히 있지는 않습니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}님, 리딩이 아직 여기 있습니다.`,
          body: `
            <p>거의 다 오셨습니다.</p>
            <p><strong>${data.archetypeName}</strong> 리딩이 아직 여기 있습니다 — 잠긴 내용을 포함한 전체 분석입니다. 오직 당신만을 위해 생성되었으며 단 한 번만 존재합니다.</p>
            <p>리딩은 47시간 후에 만료됩니다.</p>
          `,
          ctaText: `${data.archetypeName} 전체 리딩 잠금 해제 — $4.99`,
          footerNote: 'Stripe 보안. Apple Pay 및 Google Pay 사용 가능.',
        })
      },
      2: {
        subject: `${data.archetypeName}이 자신에 대해 결코 알지 못하는 것`,
        preview: `이것은 잠긴 섹션에 있습니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `잠긴 리딩에 있는 내용.`,
          body: `
            <p>${data.firstName}님,</p>
            <ul>
              <li><strong>그림자 자아.</strong> 자신을 보호할 때 나타나는 당신의 모습.</li>
              <li><strong>관계 패턴.</strong> 다른 사람들과 같은 역학이 계속 나타나는 이유.</li>
              <li><strong>2026년 예측.</strong> ${data.archetypeElement} 에너지가 정점에 달하는 특정 시기.</li>
            </ul>
            <p>$4.99. 단 한 번.</p>
          `,
          ctaText: `${data.archetypeName} 전체 분석 읽기`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName}님 — 리딩이 내일 만료됩니다`,
        preview: `이후에는 분석이 삭제됩니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `리딩이 23시간 후에 만료됩니다.`,
          body: `<p>${data.firstName}님. <strong>${data.archetypeName}</strong> 리딩이 23시간 후에 만료됩니다. 이후 분석은 삭제됩니다. $4.99로 지금 바로 잠금을 해제하세요.</p>`,
          ctaText: `지금 잠금 해제 — $4.99 — 23시간 후 만료`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `마지막 기회. ${data.archetypeName} 리딩이 오늘 밤 삭제됩니다.`,
        preview: `이것이 마지막 이메일입니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `이것이 마지막 이메일입니다.`,
          body: `<p>${data.firstName}님, 리딩이 오늘 밤 만료됩니다. 한 번만 생성되었습니다. 다시 생성되지 않습니다.</p>`,
          ctaText: `사라지기 전에 잠금 해제 — $4.99`,
          footerNote: '이것이 리딩에 관한 마지막 이메일입니다.',
          urgent: true,
        })
      }
    },
    ZH: {
      1: {
        subject: `${data.firstName}，您的${data.archetypeName}解读仍在这里`,
        preview: `我们为您保留了它，但不会永远保留。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}，您的解读仍在这里。`,
          body: `
            <p>您几乎就要完成了。</p>
            <p>您的<strong>${data.archetypeName}</strong>解读仍在这里——包含所有锁定内容的完整分析，专为您生成，且只存在一次。</p>
            <p>您的解读将在47小时后过期。</p>
          `,
          ctaText: `解锁您的完整${data.archetypeName}解读 — $4.99`,
          footerNote: 'Stripe安全支付。接受Apple Pay和Google Pay。',
        })
      },
      2: {
        subject: `${data.archetypeName}从未发现的关于自己的事`,
        preview: `这在您的锁定部分中。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `您锁定解读中的内容。`,
          body: `
            <p>${data.firstName}，</p>
            <ul>
              <li><strong>您的阴影自我。</strong>当您在保护某些东西时出现的那个您。</li>
              <li><strong>您的关系模式。</strong>为什么同样的动态不断出现在不同的人身上。</li>
              <li><strong>2026年预测。</strong>您的${data.archetypeElement}能量今年达到峰值的特定窗口期。</li>
            </ul>
            <p>$4.99。一次性付款。</p>
          `,
          ctaText: `阅读完整的${data.archetypeName}分析`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName}——您的解读明天过期`,
        preview: `之后，您的分析将被删除。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `您的解读将在23小时后过期。`,
          body: `<p>${data.firstName}。您的<strong>${data.archetypeName}</strong>解读将在23小时后过期。之后，分析将被删除。$4.99，现在就解锁。</p>`,
          ctaText: `立即解锁 — $4.99 — 23小时后过期`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `最后机会。您的${data.archetypeName}解读今晚删除。`,
        preview: `这是我们发送的最后一封邮件。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `这是最后一封邮件。`,
          body: `<p>${data.firstName}，您的解读今晚过期。我们只生成了一次。不会再次生成。</p>`,
          ctaText: `在消失之前解锁 — $4.99`,
          footerNote: '这是我们关于您解读的最后一封邮件。',
          urgent: true,
        })
      }
    },
    HI: {
      1: {
        subject: `${data.firstName}, आपकी ${data.archetypeName} रीडिंग अभी भी यहाँ है`,
        preview: `हमने इसे आपके लिए रखा है। यह हमेशा नहीं रहेगी।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `${data.firstName}, आपकी रीडिंग अभी भी यहाँ है।`,
          body: `
            <p>आप लगभग पहुँच ही गए थे।</p>
            <p>आपकी <strong>${data.archetypeName}</strong> रीडिंग अभी भी यहाँ है — पूरा विश्लेषण, सब कुछ जो बंद था। यह विशेष रूप से आपके लिए बनाई गई थी।</p>
            <p>आपकी रीडिंग 47 घंटों में समाप्त हो जाएगी।</p>
          `,
          ctaText: `अपनी पूरी ${data.archetypeName} रीडिंग अनलॉक करें — $4.99`,
          footerNote: 'Stripe द्वारा सुरक्षित। Apple Pay और Google Pay स्वीकार किए जाते हैं।',
        })
      },
      2: {
        subject: `वह जो ${data.archetypeName} खुद के बारे में कभी नहीं जान पाता`,
        preview: `यह आपके बंद अनुभागों में है।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `आपकी बंद रीडिंग में क्या है।`,
          body: `
            <p>${data.firstName},</p>
            <ul>
              <li><strong>आपका छाया स्वरूप।</strong> वह संस्करण जो तब प्रकट होता है जब आप कुछ की रक्षा कर रहे होते हैं।</li>
              <li><strong>आपका संबंध पैटर्न।</strong> क्यों वही गतिशीलता अलग-अलग लोगों के साथ दोहराती रहती है।</li>
              <li><strong>2026 का पूर्वानुमान।</strong> इस साल की विशिष्ट खिड़कियाँ जहाँ आपकी ${data.archetypeElement} ऊर्जा चरम पर होगी।</li>
            </ul>
            <p>$4.99। एक बार।</p>
          `,
          ctaText: `पूरा ${data.archetypeName} विश्लेषण पढ़ें`,
          footerNote: '',
        })
      },
      3: {
        subject: `${data.firstName} — आपकी रीडिंग कल समाप्त होती है`,
        preview: `उसके बाद, आपका विश्लेषण हटा दिया जाएगा।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `आपकी रीडिंग 23 घंटों में समाप्त होती है।`,
          body: `<p>${data.firstName}। आपकी <strong>${data.archetypeName}</strong> रीडिंग 23 घंटों में समाप्त होती है। उसके बाद विश्लेषण हटा दिया जाएगा। $4.99 — अभी अनलॉक करें।</p>`,
          ctaText: `अभी अनलॉक करें — $4.99 — 23 घंटों में समाप्त`,
          footerNote: '',
          urgent: true,
        })
      },
      4: {
        subject: `अंतिम मौका। आपकी ${data.archetypeName} रीडिंग आज रात हटा दी जाएगी।`,
        preview: `यह अंतिम ईमेल है जो हम भेजेंगे।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          title: `यह अंतिम ईमेल है।`,
          body: `<p>${data.firstName}, आपकी रीडिंग आज रात समाप्त होती है। हमने इसे एक बार बनाया। फिर नहीं बनाएंगे।</p>`,
          ctaText: `गायब होने से पहले अनलॉक करें — $4.99`,
          footerNote: 'यह आपकी रीडिंग के बारे में अंतिम ईमेल है।',
          urgent: true,
        })
      }
    }
  }

  return templates[lang]?.[step] || templates['EN'][step]
}

function buildHtmlEmail({
  emoji, title, body, ctaText, footerNote, urgent = false
}: {
  emoji: string
  title: string
  body: string
  ctaText: string
  footerNote: string
  urgent?: boolean
}) {
  const ctaColor = urgent ? '#8B0000' : '#4B3F8C'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#666;text-transform:uppercase;">OMENORA</p>
            </td>
          </tr>

          <!-- Emoji -->
          <tr>
            <td style="padding-bottom:16px;text-align:center;">
              <span style="font-size:40px;">${emoji}</span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:400;color:#f0ece4;font-family:Georgia,serif;line-height:1.4;">${title}</h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:28px;">
              <hr style="border:none;border-top:1px solid #222;margin:0;">
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="color:#a09880;font-size:16px;line-height:1.8;font-family:Georgia,serif;padding-bottom:32px;">
              ${body}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="https://omenora.com/preview" 
                 style="display:inline-block;background-color:${ctaColor};color:#f0ece4;font-family:Georgia,serif;font-size:15px;padding:16px 32px;text-decoration:none;border-radius:2px;letter-spacing:0.05em;">
                ${ctaText}
              </a>
            </td>
          </tr>

          ${footerNote ? `
          <!-- Footer note -->
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <p style="margin:0;font-size:12px;color:#555;font-family:Georgia,serif;">${footerNote}</p>
            </td>
          </tr>` : ''}

          <!-- Unsubscribe -->
          <tr>
            <td style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#444;font-family:sans-serif;">
                OMENORA · <a href="https://omenora.com/unsubscribe?email={{email}}" style="color:#555;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
```

---

### Step B: Sequence trigger route

Create file: `server/api/email-sequence/trigger.post.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getEmailTemplate } from '~/server/utils/email-templates'

const SEQUENCE_DELAYS_MS = {
  1: 10 * 60 * 1000,        // 10 minutes
  2: 3 * 60 * 60 * 1000,    // 3 hours
  3: 24 * 60 * 60 * 1000,   // 24 hours
  4: 47 * 60 * 60 * 1000,   // 47 hours
}

export default defineEventHandler(async (event) => {
  const { email, step } = await readBody(event)

  if (!email || !step) return { success: false }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const delay = SEQUENCE_DELAYS_MS[step as keyof typeof SEQUENCE_DELAYS_MS]
  if (!delay) return { success: false }

  // Wait for the required delay
  await new Promise(resolve => setTimeout(resolve, delay))

  // After delay: check if user has purchased — if yes, abort
  const { data: capture } = await supabase
    .from('email_captures')
    .select('*')
    .eq('email', email)
    .single()

  if (!capture) return { success: false }
  if (capture.purchased) return { success: true, suppressed: true }
  if (capture.sequence_completed) return { success: true, suppressed: true }

  // Build and send the email
  const template = getEmailTemplate(step as 1|2|3|4, {
    email: capture.email,
    firstName: capture.first_name || 'there',
    archetypeName: capture.archetype_name || 'your archetype',
    archetypeEmoji: capture.archetype_emoji || '✨',
    archetypeElement: capture.archetype_element || '',
    lifePath: capture.life_path || '',
    archetypeTraits: capture.archetype_traits || [],
    birthCity: capture.birth_city || '',
    readingTradition: capture.reading_tradition || 'Western',
    language: capture.language || 'EN',
  })

  await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    to: capture.email,
    subject: template.subject,
    html: template.html,
    headers: {
      'X-Entity-Ref-ID': `omenora-abandon-${step}-${capture.id}`,
    },
    tags: [
      { name: 'sequence_step', value: String(step) },
      { name: 'archetype', value: capture.archetype_name || 'unknown' },
      { name: 'language', value: capture.language || 'EN' },
    ]
  })

  // Update sequence step in Supabase
  await supabase
    .from('email_captures')
    .update({
      sequence_step: step,
      sequence_completed: step === 4,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)

  // Schedule next step if not final
  if (step < 4) {
    $fetch('/api/email-sequence/trigger', {
      method: 'POST',
      body: { email, step: step + 1 }
    }).catch(() => {})
  }

  return { success: true }
})
```

**NOTE FOR WINDSURF:** The `setTimeout`-based delay above works on Railway with a persistent Node server but will NOT work on serverless/edge functions. Verify that Railway is running as a persistent Node server (not serverless). If the deployment uses serverless functions, replace the `setTimeout` approach with a Supabase cron job or a background queue using `pg_cron` or a separate Railway worker service. The architecture decision depends on how the Nuxt server is deployed.

---

### Step C: Stripe webhook — suppress sequence on purchase

Find the existing Stripe webhook handler (likely `server/api/stripe/webhook.post.ts`).

Add this logic inside the `checkout.session.completed` event handler, after the existing purchase fulfillment logic:

```typescript
// Inside the checkout.session.completed case:
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session
  const customerEmail = session.customer_details?.email || session.customer_email

  if (customerEmail) {
    // Mark as purchased — suppresses any pending email sequence steps
    await supabase
      .from('email_captures')
      .update({
        purchased: true,
        sequence_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('email', customerEmail.toLowerCase().trim())
  }

  // ... rest of existing purchase fulfillment logic
  break
}
```

---

## ENVIRONMENT VARIABLES REQUIRED

Verify these exist in Railway environment:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # NOT the anon key
RESEND_API_KEY=your_resend_api_key
```

In Resend, verify the sending domain `omenora.com` has:
- SPF record configured
- DKIM record configured
- The sender address `reading@omenora.com` is verified

---

## UNSUBSCRIBE ROUTE

Create file: `server/api/unsubscribe.get.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = query.email as string

  if (!email) return sendRedirect(event, '/?unsubscribed=true')

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase
    .from('email_captures')
    .update({
      sequence_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase().trim())

  return sendRedirect(event, '/?unsubscribed=true')
})
```

---

## QA CHECKLIST FOR WINDSURF

After implementing, verify each of these manually:

- [ ] Email field on `/preview` writes to Supabase on `blur` (not on button click)
- [ ] Upsert works — entering the same email twice does not create duplicate rows
- [ ] Email 1 arrives approximately 10 minutes after email entry
- [ ] Email 2 arrives approximately 3 hours after email entry
- [ ] Email 3 arrives approximately 24 hours after email entry
- [ ] Email 4 arrives approximately 47 hours after email entry
- [ ] Purchasing after Email 1 suppresses Emails 2, 3, and 4
- [ ] Language selection on the analysis form (ES/PT/KO/ZH/HI) results in the correct language email being sent
- [ ] Unsubscribe link in the email marks `sequence_completed = true` and stops further sends
- [ ] Email HTML renders correctly in Gmail, Apple Mail, and mobile (dark background, white text)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is used — not the anon key — for all server-side Supabase writes

---

## WHAT NOT TO TOUCH

Do not modify:
- The Stripe Checkout session creation logic
- The existing `/api/report` generation route
- The existing AI Claude prompt generation
- The Pinia store structure (only read from it, do not restructure)
- Any existing Supabase tables other than adding `email_captures`
