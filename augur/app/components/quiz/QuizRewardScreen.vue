<template>
  <div class="reward-screen">
    <div class="reward-screen__inner">
      <div class="reward-screen__emoji">{{ emoji }}</div>
      <AppHeadline variant="italic" as="h2" class="reward-screen__headline">
        {{ headline }}
      </AppHeadline>
      <AppBody as="p" class="reward-screen__body">
        {{ body }}
      </AppBody>
      <AppButton
        variant="primary"
        class="reward-screen__cta"
        @click="onContinue"
      >
        {{ continueLabel }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

interface Props {
  emoji: string
  headline: string
  body: string
  continueLabel?: string
  autoAdvanceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  continueLabel: 'Continue',
  autoAdvanceMs: 0,
})

const emit = defineEmits<{
  continue: []
}>()

const advanced = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function onContinue() {
  if (advanced.value) return
  advanced.value = true
  if (timer) clearTimeout(timer)
  emit('continue')
}

onMounted(() => {
  if (props.autoAdvanceMs > 0) {
    timer = setTimeout(() => onContinue(), props.autoAdvanceMs)
  }
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.reward-screen {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  animation: rewardEnter 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.reward-screen__inner {
  max-width: 32rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.reward-screen__emoji {
  font-size: 3rem;
  line-height: 1;
  opacity: 0;
  animation: emojiFade 800ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
}

.reward-screen__headline {
  margin: 0;
}

.reward-screen__body {
  margin: 0;
  color: var(--text-secondary);
  max-width: 26rem;
}

.reward-screen__cta {
  margin-top: var(--space-4);
}

@keyframes rewardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes emojiFade {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .reward-screen,
  .reward-screen__emoji {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
