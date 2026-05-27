<!--
  AppHeader
  ─────────
  Sticky editorial header — sandbox §01 visual pattern, dark translucent
  background with backdrop blur. Three-column grid:

    [wordmark]   [primary nav links (≥900px)]   [CTA pill + burger]

  Burger opens a right-side slide-in drawer with the full nav list +
  language switcher + account link. The drawer is the mobile menu;
  on desktop the inline nav covers the same routes so the burger is
  still useful (account, language) but the page is navigable without it.

  Public API (preserved from the pre-redesign version):
    - default slot `action` — overrides the right-side action area
    - prop `dark?: boolean` — currently informational (theme already dark)
-->

<template>
  <header class="app-header">
    <div class="app-header__inner">

      <!-- Left: wordmark -->
      <NuxtLink to="/" class="app-header__wordmark" aria-label="OMENORA home">
        OMENORA
      </NuxtLink>

      <!-- Center: primary nav links — desktop only -->
      <nav class="app-header__links" aria-label="Primary">
        <NuxtLink to="/#method"     class="app-header__link">Method</NuxtLink>
        <NuxtLink to="/#traditions" class="app-header__link">Traditions</NuxtLink>
        <NuxtLink to="/#paywall"    class="app-header__link">Pricing</NuxtLink>
        <NuxtLink to="/daily"       class="app-header__link">Daily</NuxtLink>
      </nav>

      <!-- Right: action slot + burger -->
      <div class="app-header__right">
        <slot name="action">
          <NuxtLink to="/founding" class="app-header__cta">
            Begin Reading
          </NuxtLink>
        </slot>

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

    <!-- Backdrop + drawer teleported to body to escape sticky+backdrop-filter stacking context -->
    <Teleport to="body">

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
        <!-- Drawer head -->
        <div class="nav-drawer__head">
          <span class="nav-drawer__eyebrow">Menu</span>
          <button
            class="nav-drawer__close"
            aria-label="Close menu"
            @click="menuOpen = false"
          >
            Close
          </button>
        </div>

        <div class="nav-drawer__rule" />

        <!-- Nav links -->
        <nav class="nav-drawer__links" aria-label="Drawer navigation">
          <NuxtLink to="/"                    class="drawer-link" @click="menuOpen = false">Home</NuxtLink>
          <NuxtLink to="/#method"             class="drawer-link" @click="menuOpen = false">Method</NuxtLink>
          <NuxtLink to="/#traditions"         class="drawer-link" @click="menuOpen = false">Traditions</NuxtLink>
          <NuxtLink to="/#paywall"            class="drawer-link" @click="menuOpen = false">Pricing</NuxtLink>
          <NuxtLink to="/daily"               class="drawer-link" @click="menuOpen = false">Daily Horoscope</NuxtLink>
          <NuxtLink to="/compatibility-quiz"  class="drawer-link" @click="menuOpen = false">Compatibility</NuxtLink>
          <NuxtLink to="/analysis"            class="drawer-link" @click="menuOpen = false">Begin a Reading</NuxtLink>
          <NuxtLink to="/founding"            class="drawer-link drawer-link--accent" @click="menuOpen = false">
            Founding Member · $20
          </NuxtLink>
        </nav>

        <!-- Language switcher -->
        <div class="nav-drawer__lang">
          <p class="nav-drawer__lang-label">Language</p>
          <div class="nav-drawer__lang-pills">
            <button
              v-for="lang in LANGUAGES"
              :key="lang.code"
              class="lang-pill"
              :class="{ 'lang-pill--active': currentLang === lang.code }"
              :aria-label="lang.name"
              @click="selectLanguage(lang.code)"
            >
              <span class="lang-pill__flag">{{ lang.flag }}</span>
              {{ lang.label }}
            </button>
          </div>
        </div>

        <!-- Drawer foot -->
        <div class="nav-drawer__foot">
          <div class="nav-drawer__rule" />
          <NuxtLink
            v-if="isAuthenticated"
            to="/account"
            class="nav-drawer__account"
            @click="menuOpen = false"
          >
            My Account →
          </NuxtLink>
          <NuxtLink
            v-else
            to="/account"
            class="nav-drawer__account"
            @click="menuOpen = false"
          >
            Sign in →
          </NuxtLink>
          <p class="nav-drawer__meta">Vol. 001 · MMXXVI</p>
        </div>
      </div>
    </Transition>

    </Teleport>

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

// Lock body scroll when drawer open. SSR-safe via import.meta.client guard.
watch(menuOpen, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

// Esc-to-close
if (import.meta.client) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menuOpen.value) menuOpen.value = false
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
}

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* ── Header shell ──
   Translucent dark bg + backdrop blur — sandbox §01.
   Sticky; z-index sits above all page content but below grain (200)
   and scroll-progress (100), and well below the drawer (300+). */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(18, 18, 20, 0.78);
  backdrop-filter: saturate(140%) blur(14px);
  -webkit-backdrop-filter: saturate(140%) blur(14px);
  border-bottom: 1px solid var(--omn-border-subtle);
}

.app-header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-8);
  height: 64px;
  max-width: var(--width-bleed);
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
}

/* Mobile — tighten gap + padding so wordmark + CTA + burger fit on
   narrow viewports. Without this the empty 1fr center column makes the
   header look hollow at phone widths. */
@media (max-width: 899px) {
  .app-header__inner {
    gap: var(--space-3);
    padding: 0 16px;
    height: 56px;
  }
}

/* ── Wordmark ── */
.app-header__wordmark {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wordmark);   /* 0.34em — sandbox exact */
  color: var(--omn-text-primary);
  text-decoration: none;
  transition: opacity var(--omn-duration-micro) var(--omn-ease);
}
.app-header__wordmark:hover { opacity: 0.7; }

/* ── Primary nav links — center column, desktop only ── */
.app-header__links {
  display: none;
  gap: 28px;
  justify-content: center;
  font-size: 14px;
  letter-spacing: var(--tracking-body);
}
@media (min-width: 900px) {
  .app-header__links { display: flex; }
}
.app-header__link {
  color: var(--omn-text-secondary);
  text-decoration: none;
  transition: color var(--omn-duration-micro) var(--omn-ease);
  white-space: nowrap;
}
.app-header__link:hover,
.app-header__link.router-link-active { color: var(--omn-text-primary); }

/* ── Right column ── */
.app-header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* ── CTA pill — sandbox .nav__cta ── */
.app-header__cta {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  padding: 10px 18px;
  border: 1px solid var(--omn-border-primary);
  color: var(--omn-text-primary);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background var(--omn-duration-micro) var(--omn-ease),
    border-color var(--omn-duration-micro) var(--omn-ease);
}
.app-header__cta:hover {
  background: var(--omn-bg-interactive);
  border-color: var(--omn-border-emphasis);
}
/* Mobile — compact CTA pill so it sits comfortably next to the burger
   on phones. Keeps the call-to-action visible at virtually all viewports;
   the drawer still mirrors it. */
@media (max-width: 899px) {
  .app-header__cta {
    padding: 8px 12px;
    font-size: 12px;
    letter-spacing: 0;
  }
}
/* On very narrow widths (small Androids, ≤360px) drop the pill to keep
   the wordmark and burger from cramping. */
@media (max-width: 360px) {
  .app-header__cta { display: none; }
}

/* ── Burger ── */
.app-header__burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
}
.app-header__burger-bar {
  display: block;
  height: 1px;
  background: var(--omn-text-primary);
  transition:
    width var(--omn-duration-card) var(--omn-ease),
    transform var(--omn-duration-card) var(--omn-ease),
    opacity var(--omn-duration-card) var(--omn-ease);
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

/* ── Reduced motion (header-scoped part) ── */
@media (prefers-reduced-motion: reduce) {
  .app-header__burger-bar { transition: none; }
}
</style>

<!-- Drawer + backdrop are Teleported to <body>; scoped styles don't follow.
     This second unscoped block is intentional and necessary. -->
<style>
/* ── Backdrop ── */
.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 299;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* ── Drawer ── */
.nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
  width: min(440px, 100vw);
  background: var(--omn-bg-primary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 clamp(24px, 6vw, 48px) calc(48px + env(safe-area-inset-bottom, 0px));
  border-left: 1px solid var(--omn-border-primary);
  box-shadow: -24px 0 64px rgba(0, 0, 0, 0.4);
}

/* Drawer head — match header bar height for visual continuity */
.nav-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  flex-shrink: 0;
}
.nav-drawer__eyebrow,
.nav-drawer__close {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}
.nav-drawer__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color var(--omn-duration-micro) var(--omn-ease);
}
.nav-drawer__close:hover { color: var(--omn-text-primary); }

.nav-drawer__rule {
  height: 1px;
  background: var(--omn-border-subtle);
  flex-shrink: 0;
}

/* ── Drawer nav links ── */
.nav-drawer__links {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-10);
  flex: 1;
}
.drawer-link {
  font-family: var(--omn-font-display);
  font-size: clamp(24px, 5.5vw, 38px);
  font-weight: var(--weight-light);
  color: var(--omn-text-primary);
  text-decoration: none;
  line-height: 1.2;
  letter-spacing: -0.02em;
  padding: 14px 0;
  border-bottom: 1px solid var(--omn-border-subtle);
  transition: color var(--omn-duration-micro) var(--omn-ease);
}
.drawer-link:first-child {
  border-top: 1px solid var(--omn-border-subtle);
}
.drawer-link:hover { color: var(--omn-accent); }
.drawer-link--accent { color: var(--omn-accent); }
.drawer-link--accent:hover { color: var(--omn-cta-hover); }

/* ── Language switcher ── */
.nav-drawer__lang {
  margin-top: var(--space-10);
  padding-top: var(--space-7);
  border-top: 1px solid var(--omn-border-subtle);
}
.nav-drawer__lang-label {
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  margin: 0 0 var(--space-4);
}
.nav-drawer__lang-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.lang-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: 1px solid var(--omn-border-primary);
  cursor: pointer;
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
  padding: 7px 14px;
  transition:
    border-color var(--omn-duration-micro) var(--omn-ease),
    color var(--omn-duration-micro) var(--omn-ease),
    background var(--omn-duration-micro) var(--omn-ease);
}
.lang-pill:hover {
  border-color: var(--omn-border-emphasis);
  color: var(--omn-text-primary);
}
.lang-pill--active {
  border-color: var(--omn-accent);
  color: var(--omn-text-primary);
  background: var(--omn-bg-interactive);
}
.lang-pill__flag {
  font-size: 14px;
  line-height: 1;
}

/* ── Drawer foot ── */
.nav-drawer__foot {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding-top: var(--space-8);
}
.nav-drawer__account {
  font-family: var(--omn-font-display);
  font-weight: var(--weight-medium);
  color: var(--omn-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-body);
  transition: color var(--omn-duration-micro) var(--omn-ease);
}
.nav-drawer__account:hover { color: var(--omn-text-primary); }
.nav-drawer__meta {
  margin: 0;
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--omn-text-tertiary);
}

/* ── Transitions ── */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s var(--omn-ease);
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to { opacity: 0; }

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to { transform: translateX(100%); }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .backdrop-fade-enter-active,
  .backdrop-fade-leave-active,
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: none;
  }
}
</style>
