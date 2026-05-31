<template>
  <div class="reward-screen">
    <div class="reward-screen__inner">
      <AppHeadline variant="lg" as="h2" class="reward-screen__headline">
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
  animation: rewardEnter var(--omn-duration-slow) var(--omn-ease) both;
}

.reward-screen__inner {
  max-width: 32rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.reward-screen__headline {
  margin: 0;
}

.reward-screen__body {
  margin: 0;
  color: var(--omn-text-secondary);
  max-width: 26rem;
}

.reward-screen__cta {
  margin-top: var(--space-4);
}

@keyframes rewardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .reward-screen {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
