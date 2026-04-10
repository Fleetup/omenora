<template>
  <div class="error-page">
    <!-- Atmospheric layers -->
    <div class="star-field" aria-hidden="true" />
    <div class="nebula-glow" aria-hidden="true" />

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

      <!-- Error content -->
      <div class="error-content">
        <p class="error-code">{{ error.statusCode || 500 }}</p>
        <h2 class="error-title">
          {{ error.statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong' }}
        </h2>
        <p class="error-message">
          {{ error.statusCode === 404 
            ? "The cosmic alignment you're looking for doesn't exist." 
            : "The stars are temporarily misaligned. Please try again." 
          }}
        </p>
      </div>

      <!-- CTA Button -->
      <button class="cta-button" @click="handleAction">
        <span class="cta-label">
          {{ error.statusCode === 404 ? 'Return Home' : 'Try Again' }}
        </span>
        <span class="cta-glyph" aria-hidden="true">✦</span>
      </button>

      <!-- Support link -->
      <p v-if="error.statusCode !== 404" class="support-text">
        If the problem persists, contact support@omenora.com
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleAction = () => {
  if (props.error.statusCode === 404) {
    navigateTo('/')
  } else {
    reloadNuxtApp()
  }
}

// Clear error when navigating away
const router = useRouter()
router.beforeEach(() => {
  clearError()
})
</script>

<style scoped>
/* ── Base ── */
.error-page {
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

/* ── Content ── */
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 28px;
  max-width: 520px;
  width: 100%;
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
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 300;
  color: rgba(255,255,255,0.93);
  letter-spacing: 0.14em;
  line-height: 1;
  margin-top: 10px;
  margin-bottom: 32px;
  text-shadow: 0 0 80px rgba(140,110,255,0.12);
}

/* ── Error Content ── */
.error-content {
  margin-bottom: 32px;
}

.error-code {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(72px, 12vw, 120px);
  font-weight: 300;
  color: rgba(201,168,76,0.4);
  margin: 0;
  line-height: 1;
}

.error-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 400;
  color: rgba(255,255,255,0.9);
  margin: 16px 0 12px;
  letter-spacing: 0.02em;
}

.error-message {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255,255,255,0.48);
  margin: 0;
  line-height: 1.6;
}

/* ── CTA Button ── */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

/* ── Support text ── */
.support-text {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  margin-top: 24px;
  letter-spacing: 0.02em;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .brand-name {
    font-size: clamp(36px, 12vw, 64px);
  }

  .cta-button {
    padding: 16px 32px;
    width: 100%;
  }

  .nebula-glow {
    width: 340px;
    height: 300px;
  }
}
</style>
