<template>
  <header class="app-header">
    <div class="app-header__inner">

      <!-- Left: volume/issue annotation -->
      <span class="app-header__meta label-caps">
        Vol. I · {{ currentYear }}
      </span>

      <!-- Center: wordmark (links to /) -->
      <NuxtLink to="/" class="app-header__logo">
        Omenora
      </NuxtLink>

      <!-- Right: slot for page-specific action or nav -->
      <div class="app-header__action">
        <slot name="action">
          <!-- Default: Daily Horoscope pill -->
          <NuxtLink to="/daily" class="app-header__pill label-caps">
            ◑ Daily
          </NuxtLink>
        </slot>
      </div>

    </div>
    <!-- Running rule beneath header -->
    <div class="editorial-rule" />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  dark?: boolean
}>()
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-bone);
  padding: 0 clamp(20px, 5vw, 80px);
}

.app-header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 56px;
  max-width: 1400px;
  margin: 0 auto;
}

.app-header__meta {
  color: var(--color-ink-faint);
  font-size: 10px;
}

.app-header__logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--color-ink);
  text-decoration: none;
  transition: opacity 0.15s;
}

.app-header__logo:hover {
  opacity: 0.65;
}

.app-header__action {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.app-header__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-ink-ghost);
  border-radius: 999px;
  color: var(--color-ink);
  text-decoration: none;
  font-size: 10px;
  letter-spacing: 0.25em;
  transition: border-color 0.2s, background 0.2s;
}

.app-header__pill:hover {
  border-color: var(--color-ink-mid);
  background: rgba(26, 22, 18, 0.05);
}

@media (max-width: 520px) {
  .app-header__meta {
    display: none;
  }
}
</style>
