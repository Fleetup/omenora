<template>
  <header class="app-header">
    <div class="app-header__inner">

      <!-- Left: meta -->
      <span class="app-header__meta label-caps">
        Vol. I · {{ currentYear }}
      </span>

      <!-- Center: wordmark -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__wordmark">Omenora</span>
      </NuxtLink>

      <!-- Right: action slot + burger -->
      <div class="app-header__right">
        <slot name="action">
          <NuxtLink
            to="/daily"
            class="app-header__pill label-caps"
          >
            ◑ Daily
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/account"
            class="app-header__pill label-caps"
          >
            My Account
          </NuxtLink>
          <NuxtLink
            v-else
            to="/account"
            class="app-header__pill app-header__pill--ghost label-caps"
          >
            Sign in
          </NuxtLink>
        </slot>

        <!-- Burger — always visible -->
        <button
          class="app-header__burger"
          :class="{ 'app-header__burger--open': menuOpen }"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="app-header__burger-bar" />
          <span class="app-header__burger-bar" />
          <span class="app-header__burger-bar" />
        </button>
      </div>

    </div>

    <!-- Running rule -->
    <div class="editorial-rule" />

    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="menuOpen"
        class="nav-backdrop"
        aria-hidden="true"
        @click="menuOpen = false"
      />
    </Transition>

    <!-- Right-side drawer -->
    <Transition name="drawer-slide">
      <div
        v-if="menuOpen"
        class="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <!-- Drawer header -->
        <div class="nav-drawer__head">
          <span class="nav-drawer__wordmark label-caps">Menu</span>
          <button
            class="nav-drawer__close label-caps"
            aria-label="Close menu"
            @click="menuOpen = false"
          >
            Close
          </button>
        </div>

        <div class="nav-drawer__rule" />

        <!-- Nav links -->
        <nav class="nav-drawer__links">
          <NuxtLink to="/" class="drawer-link" @click="menuOpen = false">
            Home
          </NuxtLink>
          <NuxtLink to="/daily" class="drawer-link" @click="menuOpen = false">
            Daily Horoscope
          </NuxtLink>
          <NuxtLink to="/compatibility-quiz" class="drawer-link" @click="menuOpen = false">
            Compatibility
          </NuxtLink>
          <NuxtLink to="/analysis" class="drawer-link" @click="menuOpen = false">
            Begin Reading
          </NuxtLink>
        </nav>

        <!-- Language switcher -->
        <div class="nav-drawer__lang">
          <p class="label-caps nav-drawer__lang-label">Language</p>
          <div class="nav-drawer__lang-pills">
            <button
              v-for="lang in LANGUAGES"
              :key="lang.code"
              class="lang-pill label-caps"
              :class="{ 'lang-pill--active': currentLang === lang.code }"
              :aria-label="lang.name"
              @click="selectLanguage(lang.code)"
            >
              <span class="lang-pill__flag">{{ lang.flag }}</span>
              {{ lang.label }}
            </button>
          </div>
        </div>

        <!-- Drawer footer -->
        <div class="nav-drawer__footer">
          <div class="nav-drawer__rule" />
          <NuxtLink
            v-if="isAuthenticated"
            to="/account"
            class="label-caps nav-drawer__account"
            @click="menuOpen = false"
          >
            My Account →
          </NuxtLink>
          <NuxtLink
            v-else
            to="/account"
            class="label-caps nav-drawer__account"
            @click="menuOpen = false"
          >
            Sign in →
          </NuxtLink>
        </div>
      </div>
    </Transition>

  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAnalysisStore } from '~/stores/analysisStore'
import { LANGUAGES } from '~/utils/translations'

defineProps<{
  dark?: boolean
}>()

const currentYear = new Date().getFullYear()
const { isAuthenticated } = useAuth()
const store = useAnalysisStore()

const currentLang = computed(() => store.language)

function selectLanguage(code: string) {
  store.setLanguageOverride(code)
}

const menuOpen = ref(false)

const route = useRoute()
watch(() => route.path, () => {
  menuOpen.value = false
})

watch(menuOpen, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* ── Header shell ── */
.app-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--color-bone);
  padding: 0 clamp(16px, 4vw, 48px);
}

.app-header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 52px;
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
  text-decoration: none;
  transition: opacity 0.15s;
}

.app-header__logo:hover { opacity: 0.65; }

.app-header__wordmark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--color-ink);
}

.app-header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* ── Pills ── */
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
  white-space: nowrap;
}

.app-header__pill:hover {
  border-color: var(--color-ink-mid);
  background: rgba(26, 22, 18, 0.04);
}

.app-header__pill--ghost {
  border-color: var(--color-ink-ghost);
  color: var(--color-ink-faint);
}

.app-header__pill--ghost:hover {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

/* ── Burger — always visible ── */
.app-header__burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  flex-shrink: 0;
}

.app-header__burger-bar {
  display: block;
  height: 1px;
  background: var(--color-ink);
  transition: width 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
}

.app-header__burger-bar:nth-child(1) { width: 22px; }
.app-header__burger-bar:nth-child(2) { width: 16px; }
.app-header__burger-bar:nth-child(3) { width: 22px; }

.app-header__burger--open .app-header__burger-bar:nth-child(1) {
  width: 20px;
  transform: translateY(6px) rotate(45deg);
}
.app-header__burger--open .app-header__burger-bar:nth-child(2) {
  opacity: 0;
  width: 0;
}
.app-header__burger--open .app-header__burger-bar:nth-child(3) {
  width: 20px;
  transform: translateY(-6px) rotate(-45deg);
}

/* ── Backdrop ── */
.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 299;
  background: rgba(26, 22, 18, 0.35);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* ── Drawer ── */
.nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
  width: min(420px, 100vw);
  background: var(--color-bone);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 clamp(24px, 6vw, 48px) calc(48px + env(safe-area-inset-bottom, 0px));
  box-shadow: -1px 0 0 rgba(26, 22, 18, 0.08), -24px 0 80px rgba(26, 22, 18, 0.12);
}

/* ── Drawer head ── */
.nav-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  flex-shrink: 0;
}

.nav-drawer__wordmark {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--color-ink-faint);
}

.nav-drawer__close {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  padding: 0;
  transition: color 0.2s;
}

.nav-drawer__close:hover {
  color: var(--color-ink);
}

.nav-drawer__rule {
  height: 1px;
  background: var(--color-ink-ghost);
  flex-shrink: 0;
}

/* ── Nav links ── */
.nav-drawer__links {
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  flex: 1;
}

.drawer-link {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(28px, 6vw, 44px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-ink);
  text-decoration: none;
  line-height: 1.25;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
  transition: opacity 0.2s;
}

.drawer-link:first-child {
  border-top: 1px solid var(--color-ink-ghost);
}

.drawer-link:hover {
  opacity: 0.55;
}

/* ── Language switcher ── */
.nav-drawer__lang {
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid var(--color-ink-ghost);
}

.nav-drawer__lang-label {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.nav-drawer__lang-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lang-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--color-ink-ghost);
  border-radius: 999px;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-ink-faint);
  padding: 7px 14px;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.lang-pill:hover {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

.lang-pill--active {
  border-color: var(--color-ink);
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.lang-pill__flag {
  font-size: 14px;
  line-height: 1;
}

/* ── Drawer footer ── */
.nav-drawer__footer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 32px;
}

.nav-drawer__account {
  color: var(--color-ink-faint);
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 0.3em;
  transition: color 0.2s;
}

.nav-drawer__account:hover {
  color: var(--color-ink);
}

/* ── Mobile adjustments ── */
@media (max-width: 640px) {
  .app-header__meta {
    display: none;
  }
  .app-header__inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .app-header__logo {
    justify-content: flex-start;
  }
  .app-header__right {
    flex-shrink: 0;
  }
  /* Hide default slot pills on mobile — burger opens drawer with all links */
  .app-header__pill {
    display: none;
  }
}

/* ── Backdrop transition ── */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* ── Drawer slide transition ── */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
