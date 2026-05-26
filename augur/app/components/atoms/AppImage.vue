<!--
  AppImage
  ─────────────────
  Purpose: Wrapper around <NuxtImg> with opinionated defaults for
  editorial/hero content images. No shadows, no decorative borders per §8.

  Props:
    src      string (required)
    alt      string (required — accessibility)
    width    number (optional — passed to NuxtImg optimizer)
    height   number (optional — passed to NuxtImg optimizer)
    ratio    string (optional) — enforces aspect-ratio on wrapper
             e.g. "16/9", "4/5", "1/1". Uses modern aspect-ratio CSS.
    eager    boolean — loading="eager" + fetchpriority="high" for LCP images
             default: false (lazy + auto)
    rounded  'none' | 'sm' | 'full'   default: 'none'
             none → border-radius: 0 (content images, §8 compliant)
             sm   → --radius-sm (4px max, §8 compliant for editorial frames)
             full → --radius-full (9999px, avatars / circles only)
             Note: 'md' (8px) and 'lg' (12px) removed per §8 — content images
             must not have rounded corners >4px. API-break reported below.
    caption  string (optional) — renders <figcaption> below image

  Slots: none

  §8 compliance:
    – No box-shadow, drop-shadow, text-shadow
    – No border-radius >4px on content images (full=9999px allowed for avatars)
    – No decorative borders on images

  Out of scope:
    – Section background-image (band--diag) — molecule scoped CSS, not <img>
    – Inline SVG ornaments — not <img>

  Usage:
    <AppImage src="/images/hero.webp" alt="Cosmic ascension" :eager="true" />
    <AppImage src="/img/archetype.webp" alt="The Guardian" ratio="4/5" />
    <AppImage src="/img/avatar.webp" alt="User" ratio="1/1" rounded="full" />
    <AppImage src="/img/chart.webp" alt="Chart" caption="Natal chart · 2026" />
-->

<script setup lang="ts">
withDefaults(defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  ratio?: string
  eager?: boolean
  rounded?: 'none' | 'sm' | 'full'
  caption?: string
}>(), {
  eager: false,
  rounded: 'none',
  caption: undefined,
})
</script>

<template>
  <figure class="app-image-figure">
    <!-- Ratio wrapper: enforces aspect-ratio; NuxtImg fills it absolutely -->
    <div
      v-if="ratio"
      class="app-image-wrap"
      :class="rounded !== 'none' ? `app-image--rounded-${rounded}` : ''"
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

    <!-- No ratio: NuxtImg renders as block-level image -->
    <NuxtImg
      v-else
      class="app-image"
      :class="rounded !== 'none' ? `app-image--rounded-${rounded}` : ''"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
    />

    <!-- Caption: rendered only when caption prop provided -->
    <figcaption v-if="caption" class="app-image-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
/* ── Figure wrapper: reset browser default figure margin ── */
.app-image-figure {
  margin: 0;
  padding: 0;
}

/* ── Ratio wrapper: enforces aspect-ratio, holds loading placeholder color ──
   background-color = --omn-bg-elevated — visible until NuxtImg loads on top.
   No box-shadow, no border per §8. */
.app-image-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--omn-bg-elevated);
}

/* ── NuxtImg inside ratio wrapper: fills wrapper absolutely ── */
/* transition uses --omn-duration-base (300ms); opacity fade on load */
.app-image--cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity var(--omn-duration-base);
}

/* ── Base image styles (ratio and non-ratio) ── */
.app-image {
  display: block;
  max-width: 100%;
}

/* ── Rounded variants (§8 compliant) ──
   sm  → --radius-sm (4px) — editorial framing, §8 maximum for content images
   full → --radius-full (9999px) — avatars / circle crops only */
.app-image--rounded-sm   { border-radius: var(--radius-sm); }
.app-image--rounded-full { border-radius: var(--radius-full); }

/* ── Caption ──
   Editorial mono style matching AppCaption mono variant pattern:
   --omn-font-mono, --text-xs (11px), --tracking-prose (0.04em),
   --omn-text-tertiary. Margin-top from --space-2 (8px). */
.app-image-caption {
  display: block;
  margin-top: var(--space-2);
  font-family: var(--omn-font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-prose);
  color: var(--omn-text-tertiary);
}
</style>
