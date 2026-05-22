<!--
  AppImage
  ─────────────────
  Purpose: Wrapper around <NuxtImg> with opinionated defaults for editorial/hero content images.
  Props: src, alt, width, height, ratio, eager, rounded
  Slots: none
  Usage: <AppImage src="/images/hero/cosmic-gold.webp" alt="Cosmic gold ascension" :eager="true" />
         <AppImage src="/images/archetype.webp" alt="The Guardian archetype" ratio="4/3" rounded="md" />
-->

<script setup lang="ts">
withDefaults(defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  ratio?: string
  eager?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}>(), {
  eager: false,
  rounded: undefined,
})
</script>

<template>
  <!-- With ratio: wrapping div enforces aspect-ratio; NuxtImg fills it absolutely -->
  <div
    v-if="ratio"
    class="app-image-wrap"
    :class="rounded ? `app-image--rounded-${rounded}` : ''"
    :style="{ aspectRatio: ratio }"
  >
    <NuxtImg
      class="app-image app-image--cover"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
    />
  </div>

  <!-- Without ratio: NuxtImg renders directly as the root element -->
  <NuxtImg
    v-else
    class="app-image"
    :class="rounded ? `app-image--rounded-${rounded}` : ''"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
  />
</template>

<style scoped>
/* ── Wrapper: enforces aspect-ratio when ratio prop is set ── */
/* Background-color is the loading placeholder — visible until NuxtImg renders on top */
.app-image-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--surface-raised);
}

/* ── NuxtImg inside ratio wrapper: fills wrapper absolutely ── */
.app-image--cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Fade in once the image loads — NuxtImg adds .nuxt-image--loaded class when ready */
  transition: opacity var(--duration-base);
}

/* ── Base image styles (applies to both ratio and non-ratio variants) ── */
.app-image {
  display: block;
  max-width: 100%;
}

/* ── Rounded variants ── */
/* When ratio is set: rounded applied to wrapper + overflow:hidden already clips inner image */
/* When ratio not set: rounded applied directly to NuxtImg element */
.app-image--rounded-sm   { border-radius: var(--radius-sm); }
.app-image--rounded-md   { border-radius: var(--radius-md); }
.app-image--rounded-lg   { border-radius: var(--radius-lg); }
.app-image--rounded-full { border-radius: var(--radius-full); }
</style>
