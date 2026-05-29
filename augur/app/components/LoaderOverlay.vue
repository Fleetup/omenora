<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  /** Message array to cycle through while active. */
  messages: string[]
  /** Show/hide the overlay. Cycling starts when true, stops when false. */
  active: boolean
  /** Milliseconds between message advances. Default 1200. */
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  interval: 1200,
})

const msgIdx = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startCycle() {
  msgIdx.value = 0
  timer = setInterval(() => { msgIdx.value++ }, props.interval)
}

function stopCycle() {
  if (timer) { clearInterval(timer); timer = null }
}

watch(() => props.active, (val) => {
  if (val) startCycle()
  else stopCycle()
}, { immediate: true })

onUnmounted(stopCycle)
</script>

<template>
  <Transition name="loader-overlay">
    <div
      v-if="active"
      class="loader-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <AppHeadline
        variant="lg"
        as="p"
        class="loader-overlay__msg"
      >
        {{ messages[msgIdx % messages.length] }}
      </AppHeadline>
    </div>
  </Transition>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 18, 20, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 100;
}

.loader-overlay__msg {
  text-align: center;
  padding: var(--space-6);
  color: var(--omn-text-primary);
}

/* ── Enter / leave transitions ── */
.loader-overlay-enter-active,
.loader-overlay-leave-active {
  transition: opacity var(--omn-duration-base) var(--omn-ease);
}

.loader-overlay-enter-from,
.loader-overlay-leave-to {
  opacity: 0;
}

/* ── Reduced motion: no transition, no backdrop animation ── */
@media (prefers-reduced-motion: reduce) {
  .loader-overlay-enter-active,
  .loader-overlay-leave-active {
    transition: none;
  }
}
</style>
