<template>
  <button
    class="back-btn"
    :aria-label="label"
    @click="handleClick"
  >
    <svg class="back-btn-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 13L5 8L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span v-if="text" class="back-btn-text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  to?: string
  label?: string
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '/',
  label: 'Go back',
  text: '',
})

function handleClick() {
  if (props.to) navigateTo(props.to)
  else window.history.back()
}
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 7px 14px 7px 10px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-family: inherit;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  line-height: 1;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.80);
  border-color: rgba(255, 255, 255, 0.16);
}

.back-btn:active {
  transform: scale(0.97);
}

.back-btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.back-btn-text {
  white-space: nowrap;
}
</style>
