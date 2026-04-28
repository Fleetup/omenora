<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'

const analysisStore = useAnalysisStore()

onMounted(async () => {
  if (!analysisStore.regionManualOverride) {
    try {
      const data = await $fetch<{ region: string; country: string; language: string }>('/api/detect-region')
      analysisStore.setRegion(data.region, data.country)
      if (!analysisStore.languageManualOverride) {
        analysisStore.setLanguage(data.language || 'en')
      }
    } catch {
      analysisStore.setRegion('western', 'US')
    }
  }
})
</script>

<style>
/* Editorial base reset */
*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bone);
  color: var(--color-ink);
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* Keep noise texture — subtle on bone background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
}

/* Keep existing utility classes, update to Editorial */
.omenora-heading {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.omenora-display {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-style: italic;
  letter-spacing: -0.03em;
  line-height: 0.9;
}
</style>
