<template>
  <img
    :src="`/symbols/${sign}.svg`"
    :width="size"
    :height="size"
    :alt="sign"
    class="zodiac-symbol"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  sign: string
  size?: number
}>(), {
  size: 24,
})
</script>

<style scoped>
.zodiac-symbol {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
