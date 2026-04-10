<template>
  <div class="page-wrapper">
    <!-- Star field -->
    <div class="star-field" aria-hidden="true" />

    <!-- Content -->
    <div class="content">
      <!-- Logo mark -->
      <div class="logo-mark">
        <div class="logo-ring">
          <div class="logo-dot" />
        </div>
      </div>

      <!-- Brand name -->
      <h1 class="brand-name">OMENORA</h1>

      <!-- Tagline -->
      <p class="tagline">AI decoded your destiny. Science explains why.</p>

      <!-- Social proof -->
      <p class="social-proof">3.9M analyses complete</p>

      <!-- Spacer -->
      <div class="spacer" />

      <!-- CTA Button -->
      <button class="cta-button" @click="navigateTo('/analysis')">
        Begin Your Analysis
      </button>

      <!-- Sub-label -->
      <p class="sub-label">No login required · Results in 10 seconds</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.star-field {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 15% 20%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 75% 15%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 85% 75%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 25% 85%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 60% 35%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 90% 50%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 10% 60%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 50% 10%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 30% 45%, rgba(255, 255, 255, 0.5), transparent);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 24px;
}

/* Logo mark */
.logo-mark {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(180, 150, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(200, 180, 255, 0.9);
}

/* Brand name */
.brand-name {
  font-size: 52px;
  color: white;
  letter-spacing: 0.12em;
  font-weight: 500;
  margin-top: 16px;
  margin-bottom: 0;
}

/* Tagline */
.tagline {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  margin-top: 12px;
  margin-bottom: 0;
}

/* Social proof */
.social-proof {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 8px;
  margin-bottom: 0;
}

/* Spacer */
.spacer {
  height: 24px;
}

/* CTA Button */
.cta-button {
  background: rgba(140, 110, 255, 0.2);
  border: 1px solid rgba(180, 150, 255, 0.4);
  border-radius: 28px;
  color: rgba(200, 180, 255, 0.95);
  padding: 16px 40px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.03em;
  font-family: inherit;
  transition: background 0.2s;
}

.cta-button:hover {
  background: rgba(140, 110, 255, 0.35);
}

/* Sub-label */
.sub-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 8px;
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .brand-name {
    font-size: 38px;
  }
}
</style>
