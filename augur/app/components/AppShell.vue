<template>
  <div class="app-shell">
    <AppHeader :dark="dark">
      <template v-if="$slots.headerAction" #action>
        <slot name="headerAction" />
      </template>
    </AppHeader>

    <main class="app-shell__main">
      <slot />
    </main>

    <footer class="app-shell__footer">
      <div class="editorial-rule" />
      <div class="app-shell__footer-inner">
        <span class="annotation">© {{ year }} Omenora</span>
        <nav class="app-shell__footer-nav">
          <NuxtLink to="/privacy" class="annotation footer-link">Privacy</NuxtLink>
          <span class="annotation" style="opacity:0.3">·</span>
          <NuxtLink to="/terms" class="annotation footer-link">Terms</NuxtLink>
        </nav>
        <span class="annotation">All rights reserved</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dark?: boolean
}>()

const year = new Date().getFullYear()
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bone);
}

.app-shell__main {
  flex: 1;
}

.app-shell__footer {
  padding: 0 clamp(20px, 5vw, 80px);
  padding-bottom: 32px;
}

.app-shell__footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 1400px;
  margin: 0 auto;
}

.app-shell__footer-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-link {
  text-decoration: none;
  color: var(--color-ink-faint);
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-ink);
}
</style>
