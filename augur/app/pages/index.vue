<template>
  <div class="page-wrapper">
    <!-- Atmospheric layers -->
    <div class="star-field" aria-hidden="true" />
    <div class="nebula-glow" aria-hidden="true" />
    <div class="nebula-glow-secondary" aria-hidden="true" />

    <!-- Content -->
    <div class="content">
      <!-- Orbital brand mark -->
      <div class="orbital-mark-wrap" aria-hidden="true">
        <OrbitalMark />
      </div>

      <!-- Brand name -->
      <h1 class="brand-name">OMENORA</h1>

      <!-- Tagline -->
      <p class="tagline">Your free AI astrology reading — ready in 60 seconds.</p>
      <p class="tagline-sub">Enter your birth date and city — we calculate your natal chart, map your personality archetype, numerology life path, and 2026 forecast using AI.</p>

      <!-- Threshold separator -->
      <div class="threshold">
        <div class="threshold-rule" aria-hidden="true" />
        <p class="social-proof">Free · No account required · Results in 60 seconds</p>
        <div class="threshold-rule" aria-hidden="true" />
      </div>

      <!-- CTA Button -->
      <button class="cta-button" @click="() => { $trackAnalysisStart(); navigateTo('/analysis') }">
        <span class="cta-label">Begin Your Analysis</span>
        <span class="cta-glyph" aria-hidden="true">❆</span>
      </button>

      <!-- Sub-label -->
      <p class="sub-label">No login required · Results in 10 seconds</p>

    </div>

    <!-- What You'll Discover section (LP-3) -->
    <section class="discover-section" aria-label="What's inside your reading">
      <p class="discover-label">WHAT'S INSIDE YOUR READING</p>
      <div class="discover-grid">
        <div class="discover-card">
          <img src="/symbols/Destiny Archetype.svg" class="discover-symbol" alt="" aria-hidden="true" />
          <p class="discover-name">Personality Archetype</p>
          <p class="discover-desc">Your Sun, Moon &amp; Rising signs combined into 1 of 12 archetypes — reveals your core identity, hidden strengths, relationship patterns, and career path</p>
        </div>
        <div class="discover-card">
          <img src="/symbols/Life Path Number copy.svg" class="discover-symbol" alt="" aria-hidden="true" />
          <p class="discover-name">Numerology Life Path</p>
          <p class="discover-desc">Your Life Path Number calculated from your birth date — the single most important number in numerology, revealing your purpose and natural strengths</p>
        </div>
        <div class="discover-card">
          <img src="/symbols/Destiny Forecast copy.svg" class="discover-symbol" alt="" aria-hidden="true" />
          <p class="discover-name">Birth Tradition Reading</p>
          <p class="discover-desc">Choose Western astrology, Vedic, Chinese BaZi, or Tarot — your natal chart interpreted through the ancient system that resonates most with you</p>
        </div>
        <div class="discover-card">
          <img src="/symbols/Love & Relationship Patterns copy.svg" class="discover-symbol" alt="" aria-hidden="true" />
          <p class="discover-name">2026 Astrology Forecast</p>
          <p class="discover-desc">Month-by-month energy windows mapped to your chart — when to move fast, when to wait, and where your biggest openings appear this year</p>
        </div>
      </div>
    </section>

    <!-- How It Works 3-step strip (LP-4) -->
    <section class="how-section" aria-label="How it works">
      <div class="how-steps">
        <div class="how-step">
          <span class="how-num">01</span>
          <p class="how-text">Enter your name, birth date, and city</p>
        </div>
        <div class="how-divider" aria-hidden="true" />
        <div class="how-step">
          <span class="how-num">02</span>
          <p class="how-text">Answer 3 quick questions to personalize your reading</p>
        </div>
        <div class="how-divider" aria-hidden="true" />
        <div class="how-step">
          <span class="how-num">03</span>
          <p class="how-text">Your AI reading is generated in seconds</p>
        </div>
      </div>
    </section>

    <!-- Bottom repeat CTA (LP-8) -->
    <div class="bottom-cta-block">
      <button class="cta-button bottom-cta" @click="() => { $trackAnalysisStart(); navigateTo('/analysis') }">
        <span class="cta-label">Begin Your Analysis</span>
        <span class="cta-glyph" aria-hidden="true">❆</span>
      </button>
      <p class="sub-label">Takes 60 seconds · No account required</p>
    </div>

    <!-- Site footer — internal linking for crawlability -->
    <footer class="site-footer" role="contentinfo">
      <nav aria-label="Legal">
        <NuxtLink to="/privacy" class="footer-link">Privacy Policy</NuxtLink>
        <span class="footer-sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link">Terms of Service</NuxtLink>
      </nav>
      <p class="footer-copy">&copy; 2026 OMENORA. All rights reserved.</p>
      <p class="footer-crisis">If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { public: { siteUrl: SITE_URL } } = useRuntimeConfig()
const { $trackLandingView, $trackAnalysisStart } = useNuxtApp() as any

onMounted(() => {
  $trackLandingView()
})

useSeoMeta({
  title: 'OMENORA — Free AI Personality & Astrology Reading',
  description:
    'Your free personality reading in 60 seconds. AI maps your archetype using astrology, numerology, and six ancient traditions. No account required.',
  ogTitle: 'OMENORA — Free AI Personality & Astrology Reading',
  ogDescription:
    'Your free personality reading in 60 seconds. AI maps your archetype using astrology, numerology, and six ancient traditions. No account required.',
  ogUrl: SITE_URL,
  twitterTitle: 'OMENORA — Free AI Personality & Astrology Reading',
  twitterDescription:
    'AI maps your personality archetype using astrology and numerology. Free reading in 60 seconds. No account required.',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
})

useHead({
  link: [{ rel: 'canonical', href: SITE_URL }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': `${SITE_URL}/#webapp`,
            name: 'OMENORA',
            url: SITE_URL,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript',
            inLanguage: 'en',
            publisher: { '@id': `${SITE_URL}/#organization` },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI personality and astrology reading',
            },
            description:
              'OMENORA is an AI-powered astrology and personality reading platform. Get your free personalized birth chart, life path number, love compatibility reading and 2026 cosmic forecast in seconds.',
            featureList: [
              'Free AI birth chart with Rising, Sun & Moon signs',
              'Numerology life path number analysis',
              'Love compatibility reading',
              '12-month cosmic calendar with energy forecasts',
              'Personalized 2026 astrology forecast',
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is the OMENORA astrology reading really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Your core AI personality and astrology reading is completely free with no account or login required. Optional upgrades include a full birth chart, love compatibility reading, and a 12-month cosmic calendar.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does AI astrology work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'OMENORA combines your birth date, birth time, and birth city with advanced AI to generate a deeply personalized personality and astrology reading. The system draws on natal chart calculations, numerological life path numbers, and six ancient traditions to produce readings users find highly accurate.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is a Life Path Number in numerology?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Your Life Path Number is calculated from your date of birth by reducing it to a single digit (1–9) or a master number (11, 22, 33). It is numerology's most significant number, revealing your core purpose, natural strengths, and life challenges.",
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is AI astrology?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'OMENORA uses advanced AI models combined with established astrological and numerological frameworks, consistently delivering personalized insights users describe as remarkably accurate.',
                },
              },
              {
                '@type': 'Question',
                name: 'How long does an AI astrology reading take?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Your AI personality and astrology reading is generated in approximately 60 seconds. No account creation required — just your name, date of birth, and city of birth.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is included in the free astrology report?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The free report includes your Personality Archetype, Life Path Number analysis, identity reading, astrology and numerology-based personality profile, 2026 forecast, love and relationship section, career and purpose insights, hidden gift reveal, and a personalized affirmation.'
                },
              },
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<style scoped>
/* ── Base ── */
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #050410;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ── Atmospheric layers ── */
.star-field {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 8% 12%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 15% 28%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(2px 2px at 22% 8%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 32% 55%, rgba(255,255,255,0.45) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 41% 18%, rgba(255,255,255,0.65) 0%, transparent 100%),
    radial-gradient(1px 1px at 52% 72%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 61% 5%, rgba(255,255,255,0.55) 0%, transparent 100%),
    radial-gradient(1px 1px at 68% 42%, rgba(255,255,255,0.45) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 75% 88%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 82% 22%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 65%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 93% 40%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 97% 78%, rgba(255,255,255,0.35) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 5% 90%, rgba(255,255,255,0.55) 0%, transparent 100%),
    radial-gradient(1px 1px at 18% 65%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 28% 82%, rgba(255,255,255,0.35) 0%, transparent 100%),
    radial-gradient(2px 2px at 45% 95%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 33%, rgba(201,168,76,0.5) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 65% 58%, rgba(255,255,255,0.45) 0%, transparent 100%),
    radial-gradient(1px 1px at 72% 13%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 79% 48%, rgba(200,180,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 85% 92%, rgba(255,255,255,0.55) 0%, transparent 100%),
    radial-gradient(1px 1px at 12% 42%, rgba(255,255,255,0.35) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 37% 30%, rgba(255,255,255,0.45) 0%, transparent 100%),
    radial-gradient(1px 1px at 48% 52%, rgba(201,168,76,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 58% 85%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 92% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 3% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 95% 55%, rgba(200,180,255,0.45) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 15%, rgba(255,255,255,0.5) 0%, transparent 100%);
}

.nebula-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  width: 640px;
  height: 520px;
  background: radial-gradient(ellipse at center, rgba(140,110,255,0.08) 0%, rgba(100,60,200,0.04) 40%, transparent 70%);
  pointer-events: none;
}

.nebula-glow-secondary {
  position: absolute;
  top: 42%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 380px;
  height: 280px;
  background: radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 65%);
  pointer-events: none;
}

/* ── Content ── */
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(64px, 12vh, 96px) 24px 0;
  max-width: 520px;
  width: 100%;
  box-sizing: border-box;
}

/* ── Orbital brand mark ── */
.orbital-mark-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

/* ── Brand name ── */
.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(52px, 13vw, 148px);
  font-weight: 300;
  color: rgba(255,255,255,0.93);
  letter-spacing: 0.14em;
  line-height: 1;
  margin-top: 12px;
  margin-bottom: 4px;
  text-shadow: 0 0 80px rgba(140,110,255,0.12);
}

/* ── Tagline ── */
.tagline {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255,255,255,0.48);
  letter-spacing: 0.01em;
  line-height: 1.5;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 0;
}

.tagline-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.32);
  line-height: 1.7;
  margin-top: 10px;
  margin-bottom: 0;
  max-width: 400px;
  text-align: center;
}

/* ── Threshold separator ── */
.threshold {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  width: 100%;
  max-width: 340px;
}

.threshold-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.22), transparent);
}

.social-proof {
  font-size: 10px;
  color: rgba(201,168,76,0.62);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  margin: 0;
}

/* ── CTA Button ── */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  border: 1px solid rgba(201, 168, 76, 0.32);
  border-radius: 3px;
  padding: 0 48px;
  min-height: 52px;
  width: 100%;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 32px;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(140,110,255,0.04));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button:hover {
  border-color: rgba(201, 168, 76, 0.58);
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.08);
}

.cta-label {
  position: relative;
  z-index: 1;
}

.cta-glyph {
  font-size: 10px;
  color: rgba(201, 168, 76, 0.65);
  transition: color 0.35s ease;
  position: relative;
  z-index: 1;
}

.cta-button:hover .cta-glyph {
  color: rgba(201, 168, 76, 0.95);
}

/* ── Sub-label ── */
.sub-label {
  font-size: 11px;
  color: rgba(255,255,255,0.18);
  margin-top: 12px;
  margin-bottom: 0;
  letter-spacing: 0.03em;
}

/* ── Discover section (LP-3) ── */
.discover-section { width: 100%; max-width: 520px; margin: 64px auto 0; padding: 0 24px; box-sizing: border-box; position: relative; z-index: 1; }
.discover-label { font-size: 9px; letter-spacing: 0.2em; color: rgba(201, 168, 76, 0.42); text-align: center; margin: 0 0 28px; text-transform: uppercase; }
.discover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.discover-card { background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 12px; padding: 22px 18px 20px; text-align: left; transition: border-color 0.25s; }
.discover-card:hover { border-color: rgba(255, 255, 255, 0.12); }
.discover-symbol { width: 44px; height: 44px; object-fit: contain; display: block; margin-bottom: 16px; opacity: 0.78; }
.discover-name { font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.78); margin: 0 0 7px; letter-spacing: 0.03em; }
.discover-desc { font-size: 11px; color: rgba(255, 255, 255, 0.3); line-height: 1.65; margin: 0; }
@media (max-width: 440px) { .discover-grid { grid-template-columns: 1fr; gap: 10px; } }

/* ── How It Works strip (LP-4) ── */
.how-section { width: 100%; max-width: 520px; margin: 48px auto 0; padding: 0 24px; box-sizing: border-box; position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 40px; }
.how-steps { display: flex; align-items: flex-start; gap: 0; }
.how-step { flex: 1; text-align: center; padding: 0 8px; }
.how-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: rgba(201, 168, 76, 0.32); display: block; line-height: 1; margin-bottom: 10px; }
.how-text { font-size: 12px; color: rgba(255, 255, 255, 0.35); line-height: 1.6; margin: 0; }
.how-divider { width: 1px; height: 40px; background: rgba(255, 255, 255, 0.08); flex-shrink: 0; align-self: center; }
@media (max-width: 440px) { .how-steps { flex-direction: column; gap: 20px; align-items: center; } .how-divider { width: 32px; height: 1px; } .how-step { padding: 0; max-width: 240px; } }

/* ── Bottom CTA block (LP-8) ── */
.bottom-cta-block { width: 100%; max-width: 520px; margin: 56px auto 0; padding: 0 24px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 10px; position: relative; z-index: 1; }
.bottom-cta { width: 100%; max-width: 380px; margin-top: 0; }

/* ── Entry animations (LP-7) ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.orbital-mark-wrap { animation: fadeUp 0.6s ease forwards; animation-delay: 0s; }
.brand-name   { animation: fadeUp 0.6s ease forwards; animation-delay: 0.1s; opacity: 0; }
.tagline      { animation: fadeUp 0.6s ease forwards; animation-delay: 0.2s; opacity: 0; }
.tagline-sub  { animation: fadeUp 0.6s ease forwards; animation-delay: 0.3s; opacity: 0; }
.threshold    { animation: fadeUp 0.6s ease forwards; animation-delay: 0.35s; opacity: 0; }
.cta-button   { animation: fadeUp 0.6s ease forwards; animation-delay: 0.45s; opacity: 0; }
.sub-label    { animation: fadeUp 0.6s ease forwards; animation-delay: 0.55s; opacity: 0; }

/* ── Footer ── */
.footer-crisis {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.1);
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.5;
  max-width: 320px;
}

.site-footer {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 24px 32px;
  z-index: 1;
}

.site-footer nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-link {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.22);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color 0.25s ease;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.5);
}

.footer-sep {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.12);
}

.footer-copy {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.12);
  margin: 0;
  letter-spacing: 0.04em;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .brand-name {
    font-size: clamp(44px, 14vw, 80px);
    letter-spacing: 0.1em;
  }

  .tagline {
    font-size: 16px;
  }

  .tagline-sub {
    font-size: 13px;
    max-width: 320px;
  }

  .nebula-glow {
    width: 340px;
    height: 300px;
  }
}

@media (max-width: 390px) {
  .content {
    padding: clamp(48px, 10vh, 72px) 20px 0;
  }

  .brand-name {
    font-size: clamp(38px, 12vw, 56px);
    letter-spacing: 0.08em;
  }

  .tagline {
    font-size: 15px;
    margin-top: 16px;
  }

  .discover-section,
  .how-section,
  .bottom-cta-block {
    padding-left: 20px;
    padding-right: 20px;
  }

  .cta-button {
    padding: 0 24px;
  }
}

@media (max-width: 320px) {
  .brand-name {
    font-size: 36px;
    letter-spacing: 0.06em;
  }

  .discover-section,
  .how-section,
  .bottom-cta-block {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
