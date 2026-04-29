<template>
  <header class="app-header">
    <div class="app-header__inner">

      <!-- Left: meta (desktop only) -->
      <span class="app-header__meta label-caps">
        Vol. I · {{ currentYear }}
      </span>

      <!-- Center: wordmark -->
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__wordmark">
          Omenora
        </span>
      </NuxtLink>

      <!-- Right: desktop pills + mobile burger -->
      <div class="app-header__right">
        <slot name="action">
          <NuxtLink
            to="/daily"
            class="app-header__pill label-caps app-header__desktop-only"
          >
            ◑ Daily
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/account"
            class="app-header__pill label-caps app-header__desktop-only"
          >
            My Account
          </NuxtLink>
          <NuxtLink
            v-else
            to="/account"
            class="app-header__pill app-header__pill--ghost label-caps app-header__desktop-only"
          >
            Sign in
          </NuxtLink>
        </slot>

        <!-- Language switcher — desktop only -->
        <div class="app-header__lang-strip app-header__desktop-only">
          <button
            v-for="lang in LANGUAGES"
            :key="lang.code"
            class="app-header__lang-btn label-caps"
            :class="{ 'app-header__lang-btn--active': currentLang === lang.code }"
            :aria-label="lang.name"
            @click="selectLanguage(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>

        <!-- Burger — mobile only -->
        <button
          class="app-header__burger app-header__mobile-only"
          aria-label="Open menu"
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

    <!-- Mobile nav overlay -->
    <Transition name="menu-fade">
      <div
        v-if="menuOpen"
        class="app-header__mobile-nav"
        @click.self="menuOpen = false"
      >
        <nav class="app-header__mobile-nav-inner">

          <button
            class="app-header__mobile-nav-close label-caps"
            aria-label="Close menu"
            @click="menuOpen = false"
          >
            Close
          </button>

          <div class="app-header__mobile-nav-links">
            <NuxtLink
              to="/"
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/daily"
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Daily Horoscope
            </NuxtLink>
            <NuxtLink
              to="/compatibility-quiz"
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Compatibility
            </NuxtLink>
            <NuxtLink
              to="/analysis"
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Begin Reading
            </NuxtLink>
          </div>

          <!-- Language switcher — mobile -->
          <div class="mobile-nav-lang">
            <p class="label-caps mobile-nav-lang__label">Language</p>
            <div class="mobile-nav-lang__pills">
              <button
                v-for="lang in LANGUAGES"
                :key="lang.code"
                class="mobile-nav-lang__pill label-caps"
                :class="{ 'mobile-nav-lang__pill--active': currentLang === lang.code }"
                :aria-label="lang.name"
                @click="selectLanguage(lang.code)"
              >
                <span class="mobile-nav-lang__flag">{{ lang.flag }}</span>
                {{ lang.label }}
              </button>
            </div>
          </div>

          <div class="app-header__mobile-nav-footer">
            <div class="editorial-rule" />
            <NuxtLink
              v-if="isAuthenticated"
              to="/account"
              class="label-caps mobile-nav-account"
              @click="menuOpen = false"
            >
              My Account →
            </NuxtLink>
            <NuxtLink
              v-else
              to="/account"
              class="label-caps mobile-nav-account"
              @click="menuOpen = false"
            >
              Sign in →
            </NuxtLink>
          </div>

        </nav>
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

.app-header__logo:hover {
  opacity: 0.65;
}

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

/* Pills */
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

/* Show/hide helpers */
.app-header__desktop-only {
  display: inline-flex;
}

.app-header__mobile-only {
  display: none;
}

@media (max-width: 640px) {
  .app-header__desktop-only {
    display: none !important;
  }
  .app-header__mobile-only {
    display: flex;
  }
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
}

/* ── Burger button ── */
.app-header__burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  align-items: flex-end;
}

.app-header__burger-bar {
  display: block;
  height: 1px;
  background: var(--color-ink);
  transition: all 0.25s ease;
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

/* ── Mobile nav overlay ── */
.app-header__mobile-nav {
  position: fixed;
  inset: 52px 0 0 0;
  background: var(--color-bone);
  z-index: 199;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.app-header__mobile-nav-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 40px 24px calc(48px + env(safe-area-inset-bottom, 0px));
}

.app-header__mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-nav-link {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px, 8vw, 48px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-ink);
  text-decoration: none;
  line-height: 1.3;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-ink-ghost);
  transition: opacity 0.2s;
}

.mobile-nav-link:first-child {
  border-top: 1px solid var(--color-ink-ghost);
}

.mobile-nav-link:hover {
  opacity: 0.6;
}

.app-header__mobile-nav-close {
  align-self: flex-end;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  padding: 0;
  margin-bottom: 24px;
  transition: color 0.2s;
}

.app-header__mobile-nav-close:hover {
  color: var(--color-ink);
}

.app-header__mobile-nav-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 40px;
}

.mobile-nav-account {
  color: var(--color-ink-faint);
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 0.3em;
  transition: color 0.2s;
}

.mobile-nav-account:hover {
  color: var(--color-ink);
}

/* ── Desktop language strip ── */
.app-header__lang-strip {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
  padding-left: 12px;
  border-left: 1px solid var(--color-ink-ghost);
}

.app-header__lang-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-ink-faint);
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.app-header__lang-btn:hover {
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.05);
}

.app-header__lang-btn--active {
  color: var(--color-ink);
  font-weight: 600;
}

/* ── Mobile language switcher ── */
.mobile-nav-lang {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink-ghost);
}

.mobile-nav-lang__label {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: var(--color-ink-faint);
  margin-bottom: 16px;
}

.mobile-nav-lang__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-nav-lang__pill {
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

.mobile-nav-lang__pill:hover {
  border-color: var(--color-ink-mid);
  color: var(--color-ink);
}

.mobile-nav-lang__pill--active {
  border-color: var(--color-ink);
  color: var(--color-ink);
  background: rgba(26, 22, 18, 0.04);
}

.mobile-nav-lang__flag {
  font-size: 14px;
  line-height: 1;
}

/* ── Transition ── */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
