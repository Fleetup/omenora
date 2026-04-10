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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #050410;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0.04;
  pointer-events: none;
  z-index: 1000;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.omenora-heading {
  font-family: 'Playfair Display', serif;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.omenora-display {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 1.05;
}
</style>
