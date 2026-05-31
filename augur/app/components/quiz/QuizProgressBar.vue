<template>
  <div class="progress-bar" role="progressbar" :aria-valuenow="current" :aria-valuemin="1" :aria-valuemax="total">
    <div class="progress-bar__fill" :style="{ width: pct + '%' }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  current: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  total: 30,
})

const pct = computed(() => Math.min(100, Math.max(0, (props.current / props.total) * 100)))
</script>

<style scoped>
.progress-bar {
  width: 100%;
  height: 2px;
  background: var(--omn-border-subtle);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  /* Bronze fill so progress reads as the same accent system the rest of
     the page uses (section markers, hairlines, scroll-progress). */
  background: linear-gradient(90deg, var(--omn-accent-quiet), var(--omn-accent));
  transition: width var(--omn-duration-base) var(--omn-ease);
}
</style>
