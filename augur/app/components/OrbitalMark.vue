<template>
  <canvas
    ref="orbitalCanvas"
    class="orbital-canvas"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const orbitalCanvas = ref<HTMLCanvasElement | null>(null)
let animId = 0

onMounted(() => {
  const canvas = orbitalCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // ── Dimensions ──────────────────────────────────────────────────────────────
  // The outer ring was 64px diameter (rx = 32px). We add 12px padding each side
  // for glow and trail overflow → 88 × 88px canvas.
  const SIZE = 88
  const DPR  = window.devicePixelRatio || 1

  canvas.width  = SIZE * DPR
  canvas.height = SIZE * DPR
  ctx.scale(DPR, DPR)

  // Centre of canvas in CSS pixels
  const cx = SIZE / 2   // 44
  const cy = SIZE / 2   // 44

  // ── Orbit parameters ────────────────────────────────────────────────────────
  const RX = 32          // horizontal radius — matches original 64px diameter ring
  const RY = RX * 0.32   // ~10.24px vertical radius → 70° perspective tilt
  const ANGLE_STEP = 0.003  // radians per frame (~8.5 s / full orbit at 60fps)

  // ── Trail ───────────────────────────────────────────────────────────────────
  const TRAIL_LENGTH = 32
  type TrailPoint = { x: number; y: number; depth: number }
  const trail: TrailPoint[] = []

  // ── State ────────────────────────────────────────────────────────────────────
  let angle = -Math.PI / 2   // start at top of ellipse

  // ── Helpers ─────────────────────────────────────────────────────────────────
  // depth ranges 0 (far, back) → 1 (near, front) based on sin of angle
  function getDepth(a: number): number {
    return (Math.sin(a) + 1) / 2
  }

  // Dot radius: 2.5px near → 1.0px far
  function getDotRadius(depth: number): number {
    return 1.0 + depth * 1.5
  }

  function drawCenterDot(): void {
    const centerGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 6)
    centerGrad.addColorStop(0,   'rgba(220, 200, 255, 0.95)')
    centerGrad.addColorStop(0.4, 'rgba(180, 150, 255, 0.70)')
    centerGrad.addColorStop(1,   'rgba(140, 110, 255, 0)')
    ctx!.beginPath()
    ctx!.arc(cx, cy, 3.5, 0, Math.PI * 2)
    ctx!.fillStyle = centerGrad
    ctx!.fill()
  }

  // ── Draw comet trail ─────────────────────────────────────────────────────────
  function drawTrail(): void {
    for (let i = 0; i < trail.length; i++) {
      const pt = trail[i]
      if (!pt) continue

      const progress = i / TRAIL_LENGTH   // 0 at tail, 1 at head
      const depth    = pt.depth

      // Points in the back half are very faint
      const backFade = depth < 0.45 ? (depth / 0.45) * 0.3 : 1.0
      const alpha    = progress * depth * 0.65 * backFade
      const radius   = progress * getDotRadius(depth) * 0.75

      if (radius < 0.1) continue

      ctx!.beginPath()
      ctx!.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(212, 167, 58, ${alpha})`
      ctx!.fill()
    }
  }

  // ── Draw the main dot with glow halo ─────────────────────────────────────────
  function drawDot(x: number, y: number, depth: number): void {
    const coreRadius = getDotRadius(depth)
    const haloRadius = coreRadius * 4
    const depthAlpha = 0.35 + depth * 0.65   // 0.35 far → 1.0 near

    // Glow halo
    const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloRadius)
    halo.addColorStop(0,   `rgba(255, 220, 100, ${(0.85 * depthAlpha).toFixed(3)})`)
    halo.addColorStop(0.4, `rgba(232, 184,  75, ${(0.45 * depthAlpha).toFixed(3)})`)
    halo.addColorStop(1,   'rgba(180, 100, 20, 0)')

    ctx!.beginPath()
    ctx!.arc(x, y, haloRadius, 0, Math.PI * 2)
    ctx!.fillStyle = halo
    ctx!.fill()

    // Core dot with bright highlight
    const core = ctx!.createRadialGradient(x, y, 0, x, y, coreRadius)
    core.addColorStop(0,   `rgba(255, 248, 224, ${depthAlpha.toFixed(3)})`)
    core.addColorStop(0.5, `rgba(232, 184,  75, ${depthAlpha.toFixed(3)})`)
    core.addColorStop(1,   `rgba(201, 168,  76, ${(0.7 * depthAlpha).toFixed(3)})`)

    ctx!.beginPath()
    ctx!.arc(x, y, coreRadius, 0, Math.PI * 2)
    ctx!.fillStyle = core
    ctx!.fill()
  }

  // ── Main animation frame ─────────────────────────────────────────────────────
  function frame(): void {
    ctx!.clearRect(0, 0, SIZE, SIZE)

    // Parametric ellipse position
    const dotX  = cx + RX * Math.cos(angle)
    const dotY  = cy + RY * Math.sin(angle)
    const depth = getDepth(angle)

    // Advance trail buffer
    trail.push({ x: dotX, y: dotY, depth })
    if (trail.length > TRAIL_LENGTH) trail.shift()

    // Draw orbit ring + inner ring. Centre dot placement depends on depth order.
    // Orbit path ellipse guide
    ctx!.beginPath()
    ctx!.ellipse(cx, cy, RX, RY, 0, 0, Math.PI * 2)
    ctx!.strokeStyle = 'rgba(180, 130, 30, 0.12)'
    ctx!.lineWidth   = 0.5
    ctx!.stroke()

    // Inner ring
    ctx!.beginPath()
    ctx!.arc(cx, cy, 16, 0, Math.PI * 2)
    ctx!.strokeStyle = 'rgba(140, 110, 255, 0.22)'
    ctx!.lineWidth   = 1
    ctx!.stroke()

    // Depth-based render order:
    //   depth >= 0.5 → dot is in front → draw trail+dot AFTER centre
    //   depth < 0.5  → dot is behind  → draw trail+dot BEFORE centre (centre redrawn on top)
    if (depth >= 0.5) {
      drawCenterDot()
      drawTrail()
      drawDot(dotX, dotY, depth)
    } else {
      drawTrail()
      drawDot(dotX, dotY, depth)
      drawCenterDot()   // redraw centre on top to occlude the orbiting dot
    }

    // Advance angle
    angle += ANGLE_STEP
    if (angle > Math.PI * 2) angle -= Math.PI * 2

    animId = requestAnimationFrame(frame)
  }

  animId = requestAnimationFrame(frame)
})

onUnmounted(() => {
  if (animId) {
    cancelAnimationFrame(animId)
    animId = 0
  }
})
</script>

<style scoped>
.orbital-canvas {
  width: 88px;
  height: 88px;
  display: block;
  pointer-events: none;
  /* Compensate for the 12px padding built into the canvas so it visually
     aligns identically to the old 64px .orbital-mark container */
  margin: -12px;
}
</style>
