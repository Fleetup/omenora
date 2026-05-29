<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  /** Stage messages to cycle through while active. */
  messages: string[]
  /** Show/hide the bar. Cycling starts when true, stops when false. */
  active: boolean
  /**
   * Determinate progress 0–100. When null (default) the bar runs an
   * indeterminate scanning animation. When a number is provided the bar
   * fills to that percentage and the scan animation is suppressed.
   */
  progress?: number | null
  /** Milliseconds between message advances. Default 1600. */
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: null,
  interval: 1600,
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

const currentMessage = computed(() =>
  props.messages[msgIdx.value % props.messages.length] ?? '',
)

const isDeterminate = computed(() => typeof props.progress === 'number')

const fillStyle = computed(() =>
  isDeterminate.value
    ? { width: `${Math.min(100, Math.max(0, props.progress as number))}%` }
    : {},
)
</script>

<template>
  <div
    v-if="active"
    class="loader-bar"
    role="status"
    aria-live="polite"
    :aria-label="currentMessage || 'Loading'"
  >
    <div class="loader-bar__track">
      <div
        class="loader-bar__fill"
        :class="{ 'loader-bar__fill--determinate': isDeterminate }"
        :style="fillStyle"
      />
    </div>

    <AppCaption
      v-if="currentMessage"
      as="p"
      class="loader-bar__label"
    >
      {{ currentMessage }}
    </AppCaption>
  </div>
</template>

<style scoped>
.loader-bar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
}

/* ── Track ── */
.loader-bar__track {
  width: 160px;
  height: 1px;
  background: var(--omn-border-subtle);
  overflow: hidden;
}

/* ── Fill — indeterminate scanning sweep (default) ── */
.loader-bar__fill {
  height: 100%;
  width: 40%;
  background: var(--omn-accent);
  animation: loader-bar-scan var(--omn-duration-slow, 600ms) ease-in-out infinite;
  /* Override duration to match design intent for a loader (longer than motion token) */
  animation-duration: 1.6s;
}

@keyframes loader-bar-scan {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}

/* ── Fill — determinate (progress prop provided) ── */
.loader-bar__fill--determinate {
  width: 0%;
  animation: none;
  transition: width var(--omn-duration-base) var(--omn-ease);
}

/* ── Label ── */
.loader-bar__label {
  color: var(--omn-text-tertiary);
}

/* ── Reduced motion: freeze animation, keep visual bar ── */
@media (prefers-reduced-motion: reduce) {
  .loader-bar__fill {
    animation: none;
    width: 60%;
    transform: none;
  }

  .loader-bar__fill--determinate {
    transition: none;
  }
}
</style>
