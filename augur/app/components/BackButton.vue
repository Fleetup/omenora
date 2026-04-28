<template>
  <button class="back-btn label-caps" @click="$emit('click')">
    ← {{ label || 'Back' }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
defineEmits(['click'])
</script>

<style scoped>
.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-faint);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-ink);
}
</style>
