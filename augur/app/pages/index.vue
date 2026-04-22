<template>
  <div class="lp-root">

    <!-- ── Ambient layers ──────────────────── -->
    <div class="bg-deep"    aria-hidden="true" />
    <div class="bg-nebula"  aria-hidden="true" />
    <canvas
      ref="starCanvas"
      class="bg-stars"
      aria-hidden="true"
    />

    <!-- ═══════════════════════════════════════
         HERO
    ═══════════════════════════════════════════ -->
    <section class="hero" aria-label="OMENORA hero">

      <!-- Orbital mark -->
      <div class="orbital-wrap a1">
        <OrbitalMark />
      </div>

      <!-- Brand -->
      <h1 class="brand a2">OMENORA</h1>

      <!-- Headline -->
      <p class="hero-headline a3">
        Your natal chart.<br>
        Your personality archetype.<br>
        Decoded across 4 ancient traditions.
      </p>

      <!-- Sub-headline -->
      <p class="hero-sub a4">
        Real Swiss Ephemeris calculations across
        4&nbsp;ancient traditions —
        Western, Vedic, BaZi &amp; Tarot.
      </p>

      <!-- Trust strip -->
      <div class="trust-strip a5" role="list"
           aria-label="Key features">
        <span role="listitem">Free</span>
        <span class="ts-dot" aria-hidden="true">·</span>
        <span role="listitem">No account required</span>
        <span class="ts-dot" aria-hidden="true">·</span>
        <span role="listitem">Results in 60 seconds</span>
      </div>

      <!-- Primary CTA -->
      <button
        class="cta-primary a6"
        @click="navigateTo('/analysis')"
        aria-label="Get your free astrology and personality reading"
      >
        Get My Free Reading
        <span class="cta-arr" aria-hidden="true">→</span>
      </button>

      <!-- Dimension label -->
      <p class="dim-label a7">
        Sun · Moon · Rising · Life Path · 2026 Forecast
      </p>

    </section>


    <!-- ═══════════════════════════════════════
         WHAT'S INSIDE
    ═══════════════════════════════════════════ -->
    <section class="inside-section"
             aria-label="What is inside your reading">

      <p class="sect-label">WHAT'S INSIDE YOUR READING</p>

      <div class="cards-grid">

        <article class="card"
                 aria-label="Love and Relationship Patterns">
          <div class="card-icon-bg">
            <img
              src="/symbols/Love & Relationship Patterns copy.svg"
              alt=""
              aria-hidden="true"
              class="card-icon"
            />
          </div>
          <p class="card-title">Love &amp; Relationships</p>
          <p class="card-body">
            Why you attract who you attract — and the recurring
            patterns in your connections that your Venus
            placement and archetype reveal.
          </p>
        </article>

        <article class="card" aria-label="Personality Archetype">
          <div class="card-icon-bg">
            <img
              src="/symbols/Destiny Archetype.svg"
              alt=""
              aria-hidden="true"
              class="card-icon"
            />
          </div>
          <p class="card-title">Personality Archetype</p>
          <p class="card-body">
            Your Sun, Moon &amp; Rising combined into
            1&nbsp;of&nbsp;12 archetypes — reveals your core
            behavioral patterns, hidden strengths, and
            relationship wiring.
          </p>
        </article>

        <article class="card" aria-label="Numerology Life Path">
          <div class="card-icon-bg">
            <img
              src="/symbols/Life Path Number copy.svg"
              alt=""
              aria-hidden="true"
              class="card-icon"
            />
          </div>
          <p class="card-title">Numerology Life Path</p>
          <p class="card-body">
            Calculated from your birth date — the single
            number that reveals the purpose and hidden
            pattern running through every major event
            in your life.
          </p>
        </article>

        <article class="card" aria-label="2026 Astrology Forecast">
          <div class="card-icon-bg">
            <img
              src="/symbols/Destiny Forecast copy.svg"
              alt=""
              aria-hidden="true"
              class="card-icon"
            />
          </div>
          <p class="card-title">2026 Astrology Forecast</p>
          <p class="card-body">
            Month-by-month energy windows mapped to your
            natal chart — when to move, when to wait, and
            where your biggest openings appear this year.
          </p>
        </article>

      </div>
    </section>


    <!-- ═══════════════════════════════════════
         WHY OMENORA
    ═══════════════════════════════════════════ -->
    <section class="why-section"
             aria-label="Why Omenora">

      <p class="sect-label">WHY OMENORA</p>

      <div class="why-row" role="list">

        <div class="why-item" role="listitem">
          <p class="why-item-title">No subscription traps</p>
          <p class="why-item-desc">One payment. Full report. Yours to keep.</p>
        </div>

        <div class="why-sep" aria-hidden="true" />

        <div class="why-item" role="listitem">
          <p class="why-item-title">4 ancient traditions</p>
          <p class="why-item-desc">One reading that covers all of them.</p>
        </div>

        <div class="why-sep" aria-hidden="true" />

        <div class="why-item" role="listitem">
          <p class="why-item-title">Built for every culture</p>
          <p class="why-item-desc">Not just Western astrology.</p>
        </div>

      </div>

    </section>


    <!-- ═══════════════════════════════════════
         6 TRADITIONS
    ═══════════════════════════════════════════ -->
    <section class="trad-section"
             aria-label="Six ancient astrology traditions">

      <p class="sect-label">THE TRADITION THAT SPEAKS YOUR LANGUAGE</p>

      <div class="trad-row" role="list">
        <div class="trad-item" role="listitem">
          <span class="trad-glyph" aria-hidden="true">☉</span>
          <span class="trad-name">Western</span>
        </div>
        <div class="trad-sep" aria-hidden="true" />
        <div class="trad-item" role="listitem">
          <span class="trad-glyph" aria-hidden="true">ॐ</span>
          <span class="trad-name">Vedic</span>
        </div>
        <div class="trad-sep" aria-hidden="true" />
        <div class="trad-item" role="listitem">
          <span class="trad-glyph" aria-hidden="true">八</span>
          <span class="trad-name">BaZi</span>
        </div>
        <div class="trad-sep" aria-hidden="true" />
        <div class="trad-item" role="listitem">
          <span class="trad-glyph" aria-hidden="true">☽</span>
          <span class="trad-name">Tarot</span>
        </div>
      </div>

      <p class="trad-footnote">
        We detect your region and start with the system most trusted in your culture. Switch between any of the 4 traditions at any time.
      </p>

    </section>


    <!-- ═══════════════════════════════════════
         HOW IT WORKS
    ═══════════════════════════════════════════ -->
    <section class="how-section"
             aria-label="How the reading works">

      <p class="sect-label">HOW IT WORKS</p>

      <div class="how-row">

        <div class="how-step">
          <span class="how-num" aria-hidden="true">01</span>
          <p class="how-title">Enter your birth data</p>
          <p class="how-desc">
            Name, birth date, time, and city.
            Takes about 30&nbsp;seconds.
          </p>
        </div>

        <div class="how-line" aria-hidden="true" />

        <div class="how-step">
          <span class="how-num" aria-hidden="true">02</span>
          <p class="how-title">Choose your tradition</p>
          <p class="how-desc">
            We geo-detect a default. Change it to
            any of the 4 traditions at any time.
          </p>
        </div>

        <div class="how-line" aria-hidden="true" />

        <div class="how-step">
          <span class="how-num" aria-hidden="true">03</span>
          <p class="how-title">Receive your reading</p>
          <p class="how-desc">
            Your full personality and astrology report,
            calculated across your chosen tradition and
            delivered in about 60&nbsp;seconds.
          </p>
        </div>

      </div>

    </section>


    <!-- ═══════════════════════════════════════
         BOTTOM CTA
    ═══════════════════════════════════════════ -->
    <section class="bottom-section"
             aria-label="Call to action">

      <p class="bottom-headline">
        The answer to why your life keeps following the same path is already written.
      </p>
      <p class="bottom-sub">Your birth chart has been waiting.</p>

      <button
        class="cta-primary"
        @click="navigateTo('/analysis')"
        aria-label="Get your free reading"
      >
        Get My Free Reading
        <span class="cta-arr" aria-hidden="true">→</span>
      </button>

      <p class="dim-label">
        No subscription · No account · One payment
      </p>

    </section>


    <!-- ═══════════════════════════════════════
         FOOTER
    ═══════════════════════════════════════════ -->
    <footer class="site-footer">

      <!-- Social icons -->
      <div class="footer-socials" aria-label="Follow OMENORA on social media">
        <a
          href="https://www.tiktok.com/@omenora.com"
          class="social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow OMENORA on TikTok"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/omenoraofficial"
          class="social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow OMENORA on Instagram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61572569892395"
          class="social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow OMENORA on Facebook"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      </div>

      <nav class="footer-nav" aria-label="Footer links">
        <NuxtLink to="/privacy" class="footer-link">
          Privacy
        </NuxtLink>
        <span class="footer-dot" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="footer-link">
          Terms
        </NuxtLink>
      </nav>
      <p class="footer-copy">© 2026 OMENORA</p>
      <p class="footer-disc">
        For entertainment and personal enrichment only.
        Not a substitute for professional advice.
      </p>
    </footer>

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'

useSeoMeta({
  title: 'OMENORA — Personality & Astrology Reading',
  description:
    'Discover your personality archetype through real natal chart calculations across ' +
    '4 ancient traditions — Western, Vedic, BaZi & Tarot. ' +
    'Personalized astrology and numerology reading. No account required.',
  ogTitle: 'OMENORA — Personality & Astrology Reading',
  ogDescription:
    'Personalized astrology readings using real natal chart calculations across 4 ancient traditions.',
  ogImage: 'https://omenora.com/og-image.png',
  ogUrl: 'https://omenora.com',
  twitterCard: 'summary_large_image',
  twitterTitle: 'OMENORA — Personality & Astrology Reading',
  twitterDescription:
    'Personality archetype + natal chart + 2026 forecast. ' +
    'Real Swiss Ephemeris calculations. No account. 60 seconds.',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://omenora.com' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': 'https://omenora.com/#webapp',
        name: 'OMENORA',
        url: 'https://omenora.com',
        description: 'Personalized astrology and numerology reading based on real natal chart calculations across 4 ancient traditions.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        offers: [
          {
            '@type': 'Offer',
            name: 'Free Personality Preview',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free personality archetype preview — identity section unlocked immediately'
          },
          {
            '@type': 'Offer',
            name: 'Basic Reading',
            price: '2.99',
            priceCurrency: 'USD',
            description: 'Full 7-section personality reading'
          },
          {
            '@type': 'Offer',
            name: 'Popular Bundle',
            price: '4.99',
            priceCurrency: 'USD',
            description: 'Full reading + 2026 destiny forecast + compatibility'
          },
          {
            '@type': 'Offer',
            name: 'Full Oracle',
            price: '12.99',
            priceCurrency: 'USD',
            description: 'Complete reading — all 7 sections, life path calendar, birth chart & all traditions'
          },
        ],
        featureList: [
          'Natal chart calculation via Swiss Ephemeris',
          'Personality archetype from Sun, Moon and Rising signs',
          'Numerology Life Path calculation',
          '2026 astrology forecast',
          'Western, Vedic, BaZi and Tarot traditions'
        ]
      })
    }
  ]
})

// ── Star canvas ───────────────────────────────
const starCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = starCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    drawStars(ctx, canvas.width, canvas.height)
  }

  const drawStars = (
    c: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    c.clearRect(0, 0, w, h)

    // Three tiers: bright / medium / dim
    const tiers = [
      { count: 30,  minR: 0.9, maxR: 1.4, minA: 0.6, maxA: 0.95 },
      { count: 80,  minR: 0.5, maxR: 0.9, minA: 0.3, maxA: 0.65 },
      { count: 160, minR: 0.25,maxR: 0.55,minA: 0.12,maxA: 0.32 },
    ]

    tiers.forEach(({ count, minR, maxR, minA, maxA }) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w
        const y = Math.random() * h
        const r = minR + Math.random() * (maxR - minR)
        const a = minA + Math.random() * (maxA - minA)
        c.beginPath()
        c.arc(x, y, r, 0, Math.PI * 2)
        c.fillStyle = `rgba(255,255,255,${a.toFixed(2)})` 
        c.fill()
      }
    })
  }

  resize()
  window.addEventListener('resize', resize)
})
</script>


<style scoped>


/* ─────────────────────────────────────────────
   ROOT & BACKGROUND
───────────────────────────────────────────── */
.lp-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--white-94);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Deep base gradient */
.bg-deep {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 55% at 50% 0%,
      rgba(75,45,155,0.22) 0%,
      transparent 68%
    ),
    radial-gradient(
      ellipse 55% 45% at 15% 55%,
      rgba(50,25,110,0.12) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 45% 40% at 88% 75%,
      rgba(30,15,85,0.10) 0%,
      transparent 58%
    );
  pointer-events: none;
  z-index: 0;
}

/* Soft nebula glow */
.bg-nebula {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 40% 30% at 50% 20%,
      rgba(100,65,200,0.07) 0%,
      transparent 55%
    );
  pointer-events: none;
  z-index: 0;
}

/* Star canvas */
.bg-stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}


/* ─────────────────────────────────────────────
   ENTRY ANIMATIONS
   Apple HIG: ease-out, 340–500ms, purposeful
───────────────────────────────────────────── */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.a1 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0ms;  }
.a2 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 80ms; }
.a3 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 170ms;}
.a4 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 240ms;}
.a5 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 310ms;}
.a6 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 390ms;}
.a7 { animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 460ms;}


/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 96px 24px 80px;
  max-width: 600px;
  margin: 0 auto;
}

/* Orbital mark */
.orbital-wrap {
  margin-bottom: 28px;
}

/* Brand name */
.brand {
  font-family: var(--serif);
  font-size: 68px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--white-94);
  margin: 0 0 32px;
  line-height: 1;
}

/* Hero headline */
.hero-headline {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--white-94);
  margin: 0 0 20px;
  letter-spacing: 0.01em;
}

/* Sub-headline */
.hero-sub {
  font-size: 15px;
  line-height: 1.7;
  color: var(--white-55);
  margin: 0 0 28px;
  max-width: 420px;
}

/* Trust strip */
.trust-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.75;
  margin-bottom: 32px;
}

.ts-dot {
  color: var(--white-22);
  font-size: 14px;
}


/* ─────────────────────────────────────────────
   PRIMARY CTA — SOLID, HIGH CONTRAST
   Apple HIG: minimum 44pt touch target
───────────────────────────────────────────── */
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--purple);
  border: none;
  border-radius: 14px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--sans);
  letter-spacing: 0.01em;
  padding: 17px 40px;
  min-height: 54px;
  cursor: pointer;
  transition:
    background  0.18s ease,
    box-shadow  0.18s ease,
    transform   0.12s ease;
  box-shadow:
    0 0 0 1px rgba(107,72,224,0.55),
    0 8px 32px rgba(107,72,224,0.32),
    0 2px 8px  rgba(0,0,0,0.35);
  -webkit-tap-highlight-color: transparent;
}

.cta-primary:hover {
  background: var(--purple-hi);
  box-shadow:
    0 0 0 1px rgba(123,90,242,0.65),
    0 12px 44px rgba(107,72,224,0.48),
    0 4px 12px rgba(0,0,0,0.40);
  transform: translateY(-1px);
}

.cta-primary:active {
  transform: translateY(0px) scale(0.985);
  background: #5B38D0;
  box-shadow:
    0 0 0 1px rgba(107,72,224,0.45),
    0 4px 16px rgba(107,72,224,0.25);
}

.cta-arr {
  font-size: 18px;
  transition: transform 0.15s ease;
}

.cta-primary:hover .cta-arr {
  transform: translateX(3px);
}


/* Dimension label */
.dim-label {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--white-38);
  margin-top: 16px;
  margin-bottom: 0;
}


/* ─────────────────────────────────────────────
   SECTION LABEL  (shared)
───────────────────────────────────────────── */
.sect-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(201,168,76,0.45);
  text-transform: uppercase;
  text-align: center;
  margin: 0 0 32px;
}


/* ─────────────────────────────────────────────
   WHAT'S INSIDE — CARDS
───────────────────────────────────────────── */
.inside-section {
  position: relative;
  z-index: 1;
  padding: 0 20px 80px;
  max-width: 680px;
  margin: 0 auto;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.card {
  background: var(--white-05);
  border: 1px solid var(--white-09);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: left;
  transition:
    background  0.18s ease,
    border-color 0.18s ease,
    transform   0.18s ease;
}

.card:hover {
  background: rgba(255,255,255,0.075);
  border-color: rgba(255,255,255,0.13);
  transform: translateY(-2px);
}

/* Card icon */
.card-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.card-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--white-94);
  margin: 0 0 8px;
  letter-spacing: 0.01em;
}

.card-body {
  font-size: 12px;
  line-height: 1.65;
  color: var(--white-55);
  margin: 0;
}


/* ─────────────────────────────────────────────
   WHY OMENORA — STATS
───────────────────────────────────────────── */
.why-section {
  position: relative;
  z-index: 1;
  padding: 0 20px 80px;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

.why-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
}

.why-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  flex: 1;
  max-width: 200px;
}

.why-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--white-94);
  margin: 0;
  letter-spacing: 0.01em;
}

.why-item-desc {
  font-size: 11px;
  line-height: 1.55;
  color: var(--white-38);
  margin: 0;
}

.why-sep {
  width: 1px;
  height: 32px;
  background: var(--white-09);
  flex-shrink: 0;
}


/* ─────────────────────────────────────────────
   6 TRADITIONS
───────────────────────────────────────────── */
.trad-section {
  position: relative;
  z-index: 1;
  padding: 0 20px 80px;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

/* Horizontal scroll container */
.trad-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 20px;
}

.trad-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
}

.trad-glyph {
  font-size: 18px;
  color: var(--gold);
  opacity: 0.70;
  line-height: 1;
}

.trad-name {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--white-55);
}

.trad-sep {
  width: 1px;
  height: 28px;
  background: var(--white-09);
  flex-shrink: 0;
}

.trad-footnote {
  font-size: 11px;
  color: var(--white-38);
  letter-spacing: 0.02em;
  margin: 0;
}


/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
.how-section {
  position: relative;
  z-index: 1;
  padding: 0 20px 80px;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}

.how-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
}

.how-step {
  flex: 1;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.how-num {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 300;
  color: rgba(201,168,76,0.40);
  line-height: 1;
  display: block;
  margin-bottom: 12px;
}

.how-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--white-70);
  margin: 0 0 6px;
  letter-spacing: 0.01em;
}

.how-desc {
  font-size: 11px;
  line-height: 1.60;
  color: var(--white-38);
  margin: 0;
  padding: 0 4px;
}

/* Connector line between steps */
.how-line {
  flex-shrink: 0;
  width: 48px;
  height: 1px;
  background: var(--white-09);
  margin-top: 16px;
}


/* Section dividers */
.why-section,
.trad-section,
.how-section,
.bottom-section {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 72px;
}


/* ─────────────────────────────────────────────
   BOTTOM CTA
───────────────────────────────────────────── */
.bottom-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px 96px;
  max-width: 520px;
  margin: 0 auto;
}

.bottom-headline {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--white-70);
  margin: 0 0 10px;
  letter-spacing: 0.01em;
}

.bottom-sub {
  font-family: var(--serif);
  font-size: 18px;
  font-style: italic;
  color: var(--white-55);
  margin: 0 0 36px;
}


/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
.footer-socials {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 18px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white-38);
  text-decoration: none;
  transition: color 0.15s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.social-icon:hover {
  color: var(--white-70);
  transform: translateY(-1px);
}

.site-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--white-09);
  padding: 28px 24px 40px;
  text-align: center;
}

.footer-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.footer-link {
  font-size: 12px;
  color: var(--white-38);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-link:hover { color: var(--white-70); }

.footer-dot {
  color: var(--white-22);
  font-size: 12px;
}

.footer-copy {
  font-size: 11px;
  color: var(--white-22);
  margin: 0 0 8px;
}

.footer-disc {
  font-size: 10px;
  color: var(--white-22);
  margin: 0;
  letter-spacing: 0.01em;
}


/* ─────────────────────────────────────────────
   RESPONSIVE — MOBILE FIRST
   Apple HIG: 44pt minimum touch targets
───────────────────────────────────────────── */

/* Tablet and up */
@media (min-width: 600px) {
  .brand         { font-size: 80px; }
  .hero-headline { font-size: 30px; }
}

/* Large desktop */
@media (min-width: 900px) {
  .brand         { font-size: 96px; }
  .hero-headline { font-size: 34px; }
  .hero          { padding-top: 120px; }
}

/* Mobile — single column cards */
@media (max-width: 480px) {
  .brand         { font-size: 52px; }
  .hero-headline { font-size: 22px; }
  .hero          { padding-top: 72px; padding-bottom: 56px; }
  .hero-sub      { font-size: 14px; }

  /* Full-width CTA on mobile (Apple HIG 44pt target) */
  .cta-primary {
    width: 100%;
    max-width: 340px;
    justify-content: center;
    padding: 17px 24px;
  }

  /* Single column cards */
  .cards-grid {
    grid-template-columns: 1fr;
  }

  /* Wrap traditions on mobile */
  .trad-row {
    gap: 0;
  }
  .trad-sep { display: none; }
  .trad-item {
    flex-direction: row;
    gap: 8px;
    padding: 8px 14px;
  }
  .trad-glyph { font-size: 14px; }

  /* Stack how-it-works vertically on mobile */
  .how-row {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .how-line {
    width: 1px;
    height: 24px;
    margin: 0;
  }
  .how-step { max-width: 260px; }

  .bottom-headline { font-size: 19px; }
  .bottom-sub      { font-size: 16px; }
}

/* Reduced motion — respect user preference */
@media (prefers-reduced-motion: reduce) {
  .a1, .a2, .a3, .a4,
  .a5, .a6, .a7 {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .cta-primary:hover { transform: none; }
  .card:hover        { transform: none; }
}

</style>

<style>
/* ─────────────────────────────────────────────
   DESIGN TOKENS — non-scoped so :root resolves
───────────────────────────────────────────── */
:root {
  --bg:        #07070D;
  --gold:      #C9A84C;
  --purple:    #6B48E0;
  --purple-hi: #7B5AF2;
  --purple-lo: rgba(107,72,224,0.18);
  --white-94:  rgba(255,255,255,0.94);
  --white-70:  rgba(255,255,255,0.70);
  --white-55:  rgba(255,255,255,0.55);
  --white-38:  rgba(255,255,255,0.38);
  --white-22:  rgba(255,255,255,0.22);
  --white-09:  rgba(255,255,255,0.09);
  --white-05:  rgba(255,255,255,0.05);
  --serif:     'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
  --sans:      -apple-system, BlinkMacSystemFont,
               'SF Pro Text', 'Helvetica Neue',
               sans-serif;
}
</style>
