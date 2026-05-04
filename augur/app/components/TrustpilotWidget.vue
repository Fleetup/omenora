<template>
  <div
    ref="widgetRef"
    class="trustpilot-widget"
    data-locale="en-US"
    data-template-id="5419b6a8b0d04a076446a9ad"
    data-businessunit-id="69f37a2519d955d321733cd4"
    data-style-height="24px"
    data-style-width="100%"
    data-theme="light"
  >
    <a
      href="https://www.trustpilot.com/review/omenora.com"
      target="_blank"
      rel="noopener noreferrer"
    >Leave a Review</a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const widgetRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const el = widgetRef.value
  if (!el) return
  const tp = (window as any).Trustpilot
  if (tp?.loadFromElement) {
    tp.loadFromElement(el, true)
  }
})
</script>
