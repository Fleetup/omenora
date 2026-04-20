<template>
  <div class="page-wrapper">
    <!-- Atmospheric layers -->
    <div class="star-field" aria-hidden="true" />
    <div class="nebula-glow" aria-hidden="true" />
    <div class="nebula-glow-secondary" aria-hidden="true" />

    <!-- Content -->
    <div class="content">
      <!-- Orbital brand mark -->
      <div class="orbital-mark" aria-hidden="true">
        <div class="orbit-outer">
          <div class="orbit-planet" />
        </div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>

      <!-- Brand name -->
      <h1 class="brand-name">OMENORA</h1>

      <!-- Tagline -->
      <p class="tagline">AI decoded your destiny. Science explains why.</p>

      <!-- Threshold separator -->
      <div class="threshold">
        <div class="threshold-rule" aria-hidden="true" />
        <p class="social-proof">Free · No account required · Results in 60 seconds</p>
        <div class="threshold-rule" aria-hidden="true" />
      </div>

      <!-- CTA Button -->
      <button class="cta-button" @click="navigateTo('/analysis')">
        <span class="cta-label">Begin Your Analysis</span>
        <span class="cta-glyph" aria-hidden="true">✦</span>
      </button>

      <!-- Sub-label -->
      <p class="sub-label">No login required · Results in 10 seconds</p>

      <!-- Feature keyword pills -->
      <div class="feature-pills" role="list" aria-label="What you get">
        <span role="listitem" class="feature-pill">AI Birth Chart</span>
        <span role="listitem" class="feature-pill">Life Path Number</span>
        <span role="listitem" class="feature-pill">Love Compatibility</span>
        <span role="listitem" class="feature-pill">2026 Forecast</span>
      </div>
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

useSeoMeta({
  title: 'Free AI Astrology Reading & Destiny Report',
  description:
    "Discover your destiny in 60 seconds with OMENORA's AI astrology analysis. Free birth chart, life path number, love compatibility & 2026 forecast. No signup required.",
  ogTitle: 'Free AI Astrology Reading — OMENORA',
  ogDescription:
    'Your personalized destiny report powered by AI. Free birth chart, life path number, love compatibility & 2026 forecast. No account needed, instant results.',
  ogUrl: SITE_URL,
  twitterTitle: 'Free AI Astrology Reading — OMENORA',
  twitterDescription:
    'AI-powered birth chart, life path number & 2026 cosmic forecast. Free, instant, no login required.',
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
              description: 'Free AI destiny analysis and personalized astrology report',
            },
            description:
              'OMENORA is an AI-powered astrology and destiny analysis platform. Get your free personalized birth chart, life path number, love compatibility reading and 2026 cosmic forecast in seconds.',
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
                  text: 'Yes. Your core AI destiny analysis and astrology report is completely free with no account or login required. Optional upgrades include a full birth chart, love compatibility reading, and a 12-month cosmic calendar.',
                },
              },
              {
                '@type': 'Question',
                name: 'How does AI astrology work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'OMENORA combines your birth date, birth time, and personal responses with advanced AI to generate a deeply personalized destiny report. The system draws on numerological life path calculations, astrological archetypes, and behavioral psychology to produce readings that users find highly accurate.',
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
                  text: 'Your AI destiny analysis is generated in approximately 10 seconds. No account creation, no lengthy questionnaires — just your name, date of birth, and city of birth.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is included in the free astrology report?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The free report includes your Destiny Archetype, Life Path Number analysis, identity reading, science-backed behavioral profile, 2026 forecast, love and relationship section, career and purpose insights, hidden gift reveal, and a personalized affirmation.',
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
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  padding: 0 20px;
  max-width: 520px;
  width: 100%;
  box-sizing: border-box;
}

/* ── Orbital brand mark ── */
.orbital-mark {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.orbit-outer {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(201,168,76,0.3);
  animation: orbit-spin 18s linear infinite;
}

.orbit-planet {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(201,168,76,0.85);
  box-shadow: 0 0 6px rgba(201,168,76,0.5);
}

.orbit-inner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(140,110,255,0.22);
}

.orbit-center {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(200,180,255,0.9);
  box-shadow: 0 0 8px rgba(180,150,255,0.6);
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Brand name ── */
.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(52px, 13vw, 148px);
  font-weight: 300;
  color: rgba(255,255,255,0.93);
  letter-spacing: 0.14em;
  line-height: 1;
  margin-top: 10px;
  margin-bottom: 0;
  text-shadow: 0 0 80px rgba(140,110,255,0.12);
}

/* ── Tagline ── */
.tagline {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 17px;
  font-weight: 300;
  color: rgba(255,255,255,0.48);
  letter-spacing: 0.01em;
  line-height: 1.55;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 0;
}

/* ── Threshold separator ── */
.threshold {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
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
  margin-top: 28px;
  background: transparent;
  border: 1px solid rgba(201,168,76,0.32);
  border-radius: 3px;
  color: rgba(255,255,255,0.78);
  padding: 16px 44px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  transition: border-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(140,110,255,0.04) 100%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button:hover {
  border-color: rgba(201,168,76,0.58);
  color: rgba(255,255,255,0.95);
  box-shadow: 0 0 28px rgba(201,168,76,0.1);
}

.cta-glyph {
  font-size: 10px;
  color: rgba(201,168,76,0.65);
  transition: color 0.35s ease;
}

.cta-button:hover .cta-glyph {
  color: rgba(201,168,76,0.95);
}

/* ── Sub-label ── */
.sub-label {
  font-size: 11px;
  color: rgba(255,255,255,0.18);
  margin-top: 14px;
  margin-bottom: 0;
  letter-spacing: 0.02em;
}

/* ── Feature keyword pills ── */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  max-width: 380px;
}

.feature-pill {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.16);
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  text-transform: uppercase;
  cursor: default;
  user-select: none;
}

/* ── Footer ── */
.footer-crisis {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.1);
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.5;
}

.site-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
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
    font-size: clamp(44px, 14vw, 72px);
    letter-spacing: 0.1em;
  }

  .tagline {
    font-size: 15px;
  }

  .cta-button {
    padding: 14px 24px;
    width: 100%;
  }

  .nebula-glow {
    width: 340px;
    height: 300px;
  }
}

@media (max-width: 390px) {
  .brand-name {
    font-size: clamp(38px, 12vw, 56px);
    letter-spacing: 0.08em;
  }

  .tagline {
    font-size: 14px;
  }

  .content {
    padding: 0 16px;
  }
}
</style>
