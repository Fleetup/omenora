<template>
  <img
    :src="symbolSrc"
    :width="size"
    :height="size"
    :alt="archetypeId"
    class="archetype-svg-symbol"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const SYMBOL_TO_ID: Record<string, string> = {
  '●': 'phoenix',
  '◆': 'architect',
  '▲': 'storm',
  '◇': 'lighthouse',
  '○': 'wanderer',
  '⬡': 'alchemist',
  '□': 'guardian',
  '⬟': 'visionary',
  '◉': 'mirror',
  '✦': 'catalyst',
  '▽': 'sage',
  '★': 'wildfire',
}

const props = withDefaults(defineProps<{
  symbol: string
  size?: number
}>(), {
  size: 40,
})

const archetypeId = computed(() => SYMBOL_TO_ID[props.symbol] ?? 'phoenix')
const symbolSrc   = computed(() => `/symbols/${archetypeId.value}.svg`)
</script>

<style scoped>
.archetype-svg-symbol {
  display: block;
}
</style>
