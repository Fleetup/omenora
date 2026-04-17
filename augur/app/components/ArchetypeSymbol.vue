<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${vb} ${vb}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="archetype-svg-symbol"
  >
    <!-- ● phoenix — filled circle -->
    <template v-if="symbol === '●'">
      <circle :cx="c" :cy="c" :r="c * 0.62" :fill="color" />
    </template>

    <!-- ◆ architect — filled diamond -->
    <template v-else-if="symbol === '◆'">
      <polygon
        :points="`${c},${c * 0.14} ${c * 1.62},${c} ${c},${c * 1.86} ${c * 0.38},${c}`"
        :fill="color"
      />
    </template>

    <!-- ▲ storm — filled upward equilateral triangle -->
    <template v-else-if="symbol === '▲'">
      <polygon
        :points="`${c},${c * 0.18} ${c * 1.78},${c * 1.74} ${c * 0.22},${c * 1.74}`"
        :fill="color"
      />
    </template>

    <!-- ◇ lighthouse — open diamond -->
    <template v-else-if="symbol === '◇'">
      <polygon
        :points="`${c},${c * 0.14} ${c * 1.62},${c} ${c},${c * 1.86} ${c * 0.38},${c}`"
        :stroke="color"
        :stroke-width="sw"
        stroke-linejoin="round"
      />
    </template>

    <!-- ○ wanderer — open circle -->
    <template v-else-if="symbol === '○'">
      <circle :cx="c" :cy="c" :r="c * 0.62" :stroke="color" :stroke-width="sw" />
    </template>

    <!-- ⬡ alchemist — open hexagon (pointy-top) -->
    <template v-else-if="symbol === '⬡'">
      <polygon
        :points="hexPoints"
        :stroke="color"
        :stroke-width="sw"
        stroke-linejoin="round"
      />
    </template>

    <!-- □ guardian — open square -->
    <template v-else-if="symbol === '□'">
      <rect
        :x="c * 0.3"
        :y="c * 0.3"
        :width="c * 1.4"
        :height="c * 1.4"
        :stroke="color"
        :stroke-width="sw"
        stroke-linejoin="round"
      />
    </template>

    <!-- ⬟ visionary — open rotated square (wide diamond) -->
    <template v-else-if="symbol === '⬟'">
      <polygon
        :points="`${c},${c * 0.22} ${c * 1.78},${c} ${c},${c * 1.78} ${c * 0.22},${c}`"
        :stroke="color"
        :stroke-width="sw"
        stroke-linejoin="round"
      />
    </template>

    <!-- ◉ mirror — filled inner circle + open outer ring -->
    <template v-else-if="symbol === '◉'">
      <circle :cx="c" :cy="c" :r="c * 0.28" :fill="color" />
      <circle :cx="c" :cy="c" :r="c * 0.62" :stroke="color" :stroke-width="sw" />
    </template>

    <!-- ✦ catalyst — 4-pointed star -->
    <template v-else-if="symbol === '✦'">
      <polygon
        :points="starPoints(4, c * 0.78, c * 0.26)"
        :fill="color"
      />
    </template>

    <!-- ▽ sage — open downward triangle -->
    <template v-else-if="symbol === '▽'">
      <polygon
        :points="`${c * 0.22},${c * 0.26} ${c * 1.78},${c * 0.26} ${c},${c * 1.82}`"
        :stroke="color"
        :stroke-width="sw"
        stroke-linejoin="round"
      />
    </template>

    <!-- ★ wildfire — 5-pointed filled star -->
    <template v-else-if="symbol === '★'">
      <polygon
        :points="starPoints(5, c * 0.78, c * 0.32)"
        :fill="color"
      />
    </template>

    <!-- fallback — filled circle -->
    <template v-else>
      <circle :cx="c" :cy="c" :r="c * 0.62" :fill="color" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  symbol: string
  size?: number
  color?: string
}>(), {
  size: 40,
  color: 'rgba(200, 180, 255, 0.65)',
})

const vb = 100
const c  = 50  // center of viewBox

const sw = computed(() => Math.max(3.5, props.size * 0.055))

const hexPoints = computed(() => {
  const r = c * 0.68
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`
  }).join(' ')
})

function starPoints(points: number, outerR: number, innerR: number): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (Math.PI / points) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`
  }).join(' ')
}
</script>

<style scoped>
.archetype-svg-symbol {
  display: block;
}
</style>
