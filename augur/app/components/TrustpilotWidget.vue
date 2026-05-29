<template>
  <div
    ref="widgetRef"
    class="trustpilot-widget"
    data-locale="en-US"
    data-template-id="5419b6a8b0d04a076446a9ad"
    data-businessunit-id="69f37a2519d955d321733cd4"
    data-style-height="28px"
    data-style-width="100%"
    data-theme="dark"
    data-stars="4,5"
  >
    <a
      href="https://www.trustpilot.com/review/omenora.com"
      target="_blank"
      rel="noopener noreferrer"
    >Leave a Review</a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const widgetRef = ref<HTMLElement | null>(null)

function initWidget () {
  const el = widgetRef.value
  if (!el) return
  const tp = (window as any).Trustpilot
  if (tp?.loadFromElement) {
    tp.loadFromElement(el, true)
  }
}

function scheduleInit () {
  // nextTick ensures Vue has flushed DOM updates, then rAF ensures
  // the browser has painted — critical for SPA navigation where the
  // element enters the DOM after the Trustpilot script already loaded.
  nextTick(() => {
    requestAnimationFrame(() => {
      initWidget()
    })
  })
}

onMounted(() => {
  if ((window as any).Trustpilot?.loadFromElement) {
    // Script already loaded (SPA navigation after first load)
    scheduleInit()
  } else {
    // Script still loading — attach a one-time load listener
    const scriptEl = document.querySelector<HTMLScriptElement>('#trustpilot-bootstrap')
    if (scriptEl) {
      scriptEl.addEventListener('load', initWidget, { once: true })
    }
    // Belt-and-suspenders: retry in case the load event already fired
    setTimeout(initWidget, 500)
  }
})
</script>
