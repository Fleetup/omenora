<template>
  <div class="e-rule">
    <div class="e-rule__line" />
    <span v-if="ornament" class="e-rule__ornament annotation">
      {{ ornament }}
    </span>
    <div v-if="ornament" class="e-rule__line" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ornament?: string   // e.g. '◇' or '✦' or custom text
}>()
</script>

<style scoped>
.e-rule {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin: var(--space-12) 0;
}

.e-rule__line {
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.e-rule__ornament {
  flex-shrink: 0;
  color: var(--accent-gold);
  font-size: 12px;
}
</style>
