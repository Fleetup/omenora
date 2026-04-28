<template>
  <img
    :src="symbolSrc"
    :width="size"
    :height="size"
    :alt="type"
    class="horoscope-symbol"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const FILE_MAP: Record<string, string> = {
  love:   'Love-Symbol.svg',
  health: 'Health-Symbol.svg',
  work:   'Work-Symbol.svg',
}

const props = withDefaults(defineProps<{
  type: 'love' | 'health' | 'work'
  size?: number
}>(), {
  size: 16,
})

const symbolSrc = computed(() => `/symbols/${FILE_MAP[props.type]}`)
</script>

<style scoped>
.horoscope-symbol {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
