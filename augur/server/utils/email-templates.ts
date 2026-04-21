import { unsubscribeToken } from '~~/server/api/unsubscribe.get'

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
  sessionId?: string
}

type Lang = 'EN' | 'ES' | 'PT' | 'HI' | 'KO' | 'ZH'

export function getEmailTemplate(step: 1 | 2 | 3 | 4, data: EmailPersonalization, secret = '') {
  const lang = (data.language?.toUpperCase() as Lang) || 'EN'
  const ctaUrl = data.sessionId
    ? `https://omenora.com/preview?tempId=${encodeURIComponent(data.sessionId)}`
    : 'https://omenora.com/preview'
  const templates: Record<Lang, Record<number, { subject: string; preview: string; html: string }>> = {
    EN: {
      1: {
        subject: `${data.firstName}, your ${data.archetypeName} reading is still here`,
        preview: `We held it for you. It won't be here forever.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `${data.firstName}, your reading is still here.`,
          body: `
            <p>You got close.</p>
            <p>Your <strong>${data.archetypeName}</strong> reading is still here — the full analysis, everything that was locked behind that blur. It was generated specifically for you and it exists only once.</p>
            <p>You saw the beginning. The part about how you move through the world in a way most people admire but rarely understand.</p>
            <p>That's the surface. What's locked is the part that actually explains <em>why</em> — the behavioral patterns this archetype carries, the relationship tendencies, the reason certain situations feel disproportionately draining for someone wired this way.</p>
            <p>Your reading expires in 47 hours.</p>
          `,
          ctaText: `View your full ${data.archetypeName} reading — $4.99`,
          footerNote: 'Secured by Stripe. Apple Pay and Google Pay accepted.',
          email: data.email,
        }),
      },
      2: {
        subject: `What the ${data.archetypeName} never finds out about themselves`,
        preview: `This is in your locked sections.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `What's locked in your reading.`,
          body: `
            <p>${data.firstName},</p>
            <p>Most people who get the <strong>${data.archetypeName}</strong> archetype read the teaser and think they understand what it means.</p>
            <p>They don't. Not yet.</p>
            <p>What's locked in your full reading:</p>
            <ul>
              <li><strong>Your shadow self.</strong> The version of you that shows up when you're protecting something. What you do that you're not fully conscious of.</li>
              <li><strong>Your relationship pattern.</strong> Why the same dynamic keeps appearing with different people. What this archetype pattern tends to seek versus what it tends to gravitate toward.</li>
              <li><strong>Your 2026 forecast.</strong> The specific windows this year where your ${data.archetypeElement} energy peaks — and the months where pushing harder will cost you more than it earns.</li>
            </ul>
            <p>None of this is generic. It was generated from your birth data, your answers to those seven questions, and the ${data.readingTradition} tradition you selected — interpreted through established astrological and numerological frameworks for self-reflection purposes.</p>
            <p>$4.99. One time.</p>
          `,
          ctaText: `Read the full ${data.archetypeName} analysis`,
          footerNote: '',
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName} — your reading expires tomorrow`,
        preview: `After that, your analysis is deleted.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `Your reading expires in 23 hours.`,
          body: `
            <p>${data.firstName}.</p>
            <p>Your <strong>${data.archetypeName}</strong> reading expires in 23 hours.</p>
            <p>After that, the reading we generated — using your birth data, your birth location, and your answers — gets deleted. We don’t store unredeemed readings.</p>
            <p>The <strong>${data.archetypeName}</strong> is one of the rarest archetypes we generate. Most people who receive it don't fully understand what it means until they read the locked sections. The teaser you saw is the preview. What's inside is the complete picture.</p>
            <p>If you've been wondering whether it's worth it — the answer is yes, and $4.99 is the reason you don't need to think about it.</p>
          `,
          ctaText: `Unlock now — $4.99 — expires in 23 hours`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `Last chance. Your ${data.archetypeName} reading deletes tonight.`,
        preview: `This is the last email we'll send.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `This is the last email.`,
          body: `
            <p>${data.firstName},</p>
            <p>Your <strong>${data.archetypeName}</strong> reading — Life Path ${data.lifePath}, ${data.archetypeElement}, the full 7-section analysis — expires tonight.</p>
            <p>We built it for you once. We won't rebuild it.</p>
          `,
          ctaText: `Unlock before it's gone — $4.99`,
          footerNote: `This is the last email we will send about your reading.`,
          urgent: true,
          email: data.email,
        }),
      },
    },
    ES: {
      1: {
        subject: `${data.firstName}, tu lectura de ${data.archetypeName} sigue aquí`,
        preview: `La guardamos para ti. No estará aquí para siempre.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      2: {
        subject: `Lo que el ${data.archetypeName} nunca descubre sobre sí mismo`,
        preview: `Esto está en tus secciones bloqueadas.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName} — tu lectura expira mañana`,
        preview: `Después de eso, tu análisis se elimina.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `Tu lectura expira en 23 horas.`,
          body: `
            <p>${data.firstName}.</p>
            <p>Tu lectura de <strong>${data.archetypeName}</strong> expira en 23 horas. Después, el análisis se elimina.</p>
            <p>Si te has preguntado si vale la pena — la respuesta es sí, y $4.99 es la razón por la que no necesitas pensarlo.</p>
          `,
          ctaText: `Desbloquear ahora — $4.99 — expira en 23 horas`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `Última oportunidad. Tu lectura de ${data.archetypeName} se elimina esta noche.`,
        preview: `Este es el último correo que enviaremos.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `Este es el último correo.`,
          body: `
            <p>${data.firstName},</p>
            <p>Tu lectura de <strong>${data.archetypeName}</strong> expira esta noche. La creamos una vez. No la recrearemos.</p>
          `,
          ctaText: `Desbloquear antes de que desaparezca — $4.99`,
          footerNote: 'Este es el último correo que enviaremos sobre tu lectura.',
          urgent: true,
          email: data.email,
        }),
      },
    },
    PT: {
      1: {
        subject: `${data.firstName}, sua leitura de ${data.archetypeName} ainda está aqui`,
        preview: `Guardamos para você. Não vai durar para sempre.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      2: {
        subject: `O que o ${data.archetypeName} nunca descobre sobre si mesmo`,
        preview: `Isso está nas suas seções bloqueadas.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName} — sua leitura expira amanhã`,
        preview: `Depois disso, sua análise é deletada.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `Sua leitura expira em 23 horas.`,
          body: `
            <p>${data.firstName}. Sua leitura de <strong>${data.archetypeName}</strong> expira em 23 horas. Depois, a análise é deletada.</p>
            <p>$4.99 é a razão pela qual você não precisa pensar muito nisso.</p>
          `,
          ctaText: `Desbloquear agora — $4.99 — expira em 23 horas`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `Última chance. Sua leitura de ${data.archetypeName} é deletada hoje à noite.`,
        preview: `Este é o último e-mail que enviaremos.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `Este é o último e-mail.`,
          body: `<p>${data.firstName}, sua leitura expira hoje à noite. A criamos uma vez. Não vamos recriar.</p>`,
          ctaText: `Desbloquear antes que desapareça — $4.99`,
          footerNote: 'Este é o último e-mail que enviaremos sobre sua leitura.',
          urgent: true,
          email: data.email,
        }),
      },
    },
    KO: {
      1: {
        subject: `${data.firstName}님, 당신의 ${data.archetypeName} 리딩이 아직 여기 있습니다`,
        preview: `저희가 보관하고 있습니다. 영원히 있지는 않습니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `${data.firstName}님, 리딩이 아직 여기 있습니다.`,
          body: `
            <p>거의 다 오셨습니다.</p>
            <p><strong>${data.archetypeName}</strong> 리딩이 아직 여기 있습니다 — 잠긴 내용을 포함한 전체 분석입니다. 오직 당신만을 위해 생성되었으며 단 한 번만 존재합니다.</p>
            <p>리딩은 47시간 후에 만료됩니다.</p>
          `,
          ctaText: `${data.archetypeName} 전체 리딩 잠금 해제 — $4.99`,
          footerNote: 'Stripe 보안. Apple Pay 및 Google Pay 사용 가능.',
          email: data.email,
        }),
      },
      2: {
        subject: `${data.archetypeName}이 자신에 대해 결코 알지 못하는 것`,
        preview: `이것은 잠긴 섹션에 있습니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName}님 — 리딩이 내일 만료됩니다`,
        preview: `이후에는 분석이 삭제됩니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `리딩이 23시간 후에 만료됩니다.`,
          body: `<p>${data.firstName}님. <strong>${data.archetypeName}</strong> 리딩이 23시간 후에 만료됩니다. 이후 분석은 삭제됩니다. $4.99로 지금 바로 잠금을 해제하세요.</p>`,
          ctaText: `지금 잠금 해제 — $4.99 — 23시간 후 만료`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `마지막 기회. ${data.archetypeName} 리딩이 오늘 밤 삭제됩니다.`,
        preview: `이것이 마지막 이메일입니다.`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `이것이 마지막 이메일입니다.`,
          body: `<p>${data.firstName}님, 리딩이 오늘 밤 만료됩니다. 한 번만 생성되었습니다. 다시 생성되지 않습니다.</p>`,
          ctaText: `사라지기 전에 잠금 해제 — $4.99`,
          footerNote: '이것이 리딩에 관한 마지막 이메일입니다.',
          urgent: true,
          email: data.email,
        }),
      },
    },
    ZH: {
      1: {
        subject: `${data.firstName}，您的${data.archetypeName}解读仍在这里`,
        preview: `我们为您保留了它，但不会永远保留。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `${data.firstName}，您的解读仍在这里。`,
          body: `
            <p>您几乎就要完成了。</p>
            <p>您的<strong>${data.archetypeName}</strong>解读仍在这里——包含所有锁定内容的完整分析，专为您生成，且只存在一次。</p>
            <p>您的解读将在47小时后过期。</p>
          `,
          ctaText: `解锁您的完整${data.archetypeName}解读 — $4.99`,
          footerNote: 'Stripe安全支付。接受Apple Pay和Google Pay。',
          email: data.email,
        }),
      },
      2: {
        subject: `${data.archetypeName}从未发现的关于自己的事`,
        preview: `这在您的锁定部分中。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName}——您的解读明天过期`,
        preview: `之后，您的分析将被删除。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `您的解读将在23小时后过期。`,
          body: `<p>${data.firstName}。您的<strong>${data.archetypeName}</strong>解读将在23小时后过期。之后，分析将被删除。$4.99，现在就解锁。</p>`,
          ctaText: `立即解锁 — $4.99 — 23小时后过期`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `最后机会。您的${data.archetypeName}解读今晚删除。`,
        preview: `这是我们发送的最后一封邮件。`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `这是最后一封邮件。`,
          body: `<p>${data.firstName}，您的解读今晚过期。我们只生成了一次。不会再次生成。</p>`,
          ctaText: `在消失之前解锁 — $4.99`,
          footerNote: '这是我们关于您解读的最后一封邮件。',
          urgent: true,
          email: data.email,
        }),
      },
    },
    HI: {
      1: {
        subject: `${data.firstName}, आपकी ${data.archetypeName} रीडिंग अभी भी यहाँ है`,
        preview: `हमने इसे आपके लिए रखा है। यह हमेशा नहीं रहेगी।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `${data.firstName}, आपकी रीडिंग अभी भी यहाँ है।`,
          body: `
            <p>आप लगभग पहुँच ही गए थे।</p>
            <p>आपकी <strong>${data.archetypeName}</strong> रीडिंग अभी भी यहाँ है — पूरा विश्लेषण, सब कुछ जो बंद था। यह विशेष रूप से आपके लिए बनाई गई थी।</p>
            <p>आपकी रीडिंग 47 घंटों में समाप्त हो जाएगी।</p>
          `,
          ctaText: `अपनी पूरी ${data.archetypeName} रीडिंग अनलॉक करें — $4.99`,
          footerNote: 'Stripe द्वारा सुरक्षित। Apple Pay और Google Pay स्वीकार किए जाते हैं।',
          email: data.email,
        }),
      },
      2: {
        subject: `वह जो ${data.archetypeName} खुद के बारे में कभी नहीं जान पाता`,
        preview: `यह आपके बंद अनुभागों में है।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
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
          email: data.email,
        }),
      },
      3: {
        subject: `${data.firstName} — आपकी रीडिंग कल समाप्त होती है`,
        preview: `उसके बाद, आपका विश्लेषण हटा दिया जाएगा।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `आपकी रीडिंग 23 घंटों में समाप्त होती है।`,
          body: `<p>${data.firstName}। आपकी <strong>${data.archetypeName}</strong> रीडिंग 23 घंटों में समाप्त होती है। उसके बाद विश्लेषण हटा दिया जाएगा। $4.99 — अभी अनलॉक करें।</p>`,
          ctaText: `अभी अनलॉक करें — $4.99 — 23 घंटों में समाप्त`,
          footerNote: '',
          urgent: true,
          email: data.email,
        }),
      },
      4: {
        subject: `अंतिम मौका। आपकी ${data.archetypeName} रीडिंग आज रात हटा दी जाएगी।`,
        preview: `यह अंतिम ईमेल है जो हम भेजेंगे।`,
        html: buildHtmlEmail({
          emoji: data.archetypeEmoji,
          secret,
          ctaUrl,
          title: `यह अंतिम ईमेल है।`,
          body: `<p>${data.firstName}, आपकी रीडिंग आज रात समाप्त होती है। हमने इसे एक बार बनाया। फिर नहीं बनाएंगे।</p>`,
          ctaText: `गायब होने से पहले अनलॉक करें — $4.99`,
          footerNote: 'यह आपकी रीडिंग के बारे में अंतिम ईमेल है।',
          urgent: true,
          email: data.email,
        }),
      },
    },
  }

  return templates[lang]?.[step] ?? templates['EN'][step]!
}

export function buildTestimonialRequestEmail(personalization: {
  firstName: string
  archetypeName: string
  language: string
}): { subject: string; html: string } {
  const lang = (personalization.language?.toUpperCase() || 'EN') as
    | 'EN' | 'ES' | 'PT' | 'HI' | 'KO' | 'ZH'

  const subjects: Record<typeof lang, string> = {
    EN: `${personalization.firstName}, quick question about your reading`,
    ES: `${personalization.firstName}, una pregunta rápida sobre tu lectura`,
    PT: `${personalization.firstName}, uma pergunta rápida sobre sua leitura`,
    HI: `${personalization.firstName}, आपकी रीडिंग के बारे में एक त्वरित प्रश्न`,
    KO: `${personalization.firstName}, 리딩에 대한 빠른 질문`,
    ZH: `${personalization.firstName}，关于您的解读的一个简短问题`,
  }

  const bodies: Record<typeof lang, string> = {
    EN: `Your ${personalization.archetypeName} reading was delivered.\n\nOne question — what surprised you most about it?\n\nReply to this email. We read every response.`,
    ES: `Tu lectura de ${personalization.archetypeName} fue entregada.\n\nUna pregunta — ¿qué fue lo que más te sorprendió?\n\nResponde a este correo. Leemos cada respuesta.`,
    PT: `Sua leitura de ${personalization.archetypeName} foi entregue.\n\nUma pergunta — o que mais te surpreendeu?\n\nResponda a este e-mail. Lemos cada resposta.`,
    HI: `आपकी ${personalization.archetypeName} रीडिंग डिलीवर हो गई।\n\nएक प्रश्न — इसमें आपको सबसे अधिक क्या आश्चर्यजनक लगा?\n\nइस ईमेल का जवाब दें। हम हर जवाब पढ़ते हैं।`,
    KO: `${personalization.archetypeName} 리딩이 전달되었습니다.\n\n한 가지 질문 — 가장 놀라웠던 것은 무엇이었나요?\n\n이 이메일에 답장해 주세요. 모든 답변을 읽습니다.`,
    ZH: `您的${personalization.archetypeName}解读已送达。\n\n一个问题——您最惊讶的是什么？\n\n回复这封邮件。我们阅读每一条回复。`,
  }

  const subject = subjects[lang] ?? subjects['EN']
  const bodyText = bodies[lang] ?? bodies['EN']

  // Plain-text styled as minimal HTML — no branded header, no buttons, no links
  // Intentionally looks like a personal email to maximise reply rate
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:40px 20px;background:#ffffff;font-family:Georgia,serif;font-size:16px;color:#333;line-height:1.7;">
${bodyText.split('\n\n').map(p => `<p style="margin:0 0 16px 0;">${p.replace(/\n/g, '<br>')}</p>`).join('\n')}
<p style="margin:24px 0 0 0;font-size:12px;color:#aaa;">OMENORA</p>
</body>
</html>`

  return { subject, html }
}

function buildHtmlEmail({
  emoji,
  title,
  body,
  ctaText,
  ctaUrl,
  footerNote,
  urgent = false,
  email,
  secret = '',
}: {
  emoji: string
  title: string
  body: string
  ctaText: string
  ctaUrl: string
  footerNote: string
  urgent?: boolean
  email: string
  secret?: string
}) {
  const ctaColor = urgent ? '#8B0000' : '#4B3F8C'
  const token    = secret ? unsubscribeToken(email, secret) : ''
  const unsubUrl = token
    ? `https://omenora.com/api/unsubscribe?token=${token}&e=${encodeURIComponent(email)}`
    : `https://omenora.com/api/unsubscribe?token=invalid&e=${encodeURIComponent(email)}`
  return `<!DOCTYPE html>
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
              <a href="${ctaUrl}"
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

          <!-- Disclaimer -->
          <tr>
            <td style="text-align:center;padding:16px 0 8px;">
              <p style="margin:0;font-size:10px;color:#3a3a3a;font-family:sans-serif;line-height:1.5;">
                For entertainment and self-reflection purposes only. Not a substitute for professional advice of any kind.
              </p>
            </td>
          </tr>

          <!-- Unsubscribe -->
          <tr>
            <td style="text-align:center;padding-top:16px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#444;font-family:sans-serif;">
                OMENORA · <a href="${unsubUrl}" style="color:#555;">Unsubscribe</a>
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
