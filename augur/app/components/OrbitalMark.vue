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
  // 96px canvas gives 16px padding for glow/particle overflow on each side.
  const SIZE = 96
  const DPR  = window.devicePixelRatio || 1

  canvas.width  = SIZE * DPR
  canvas.height = SIZE * DPR
  ctx.scale(DPR, DPR)

  const cx = SIZE / 2   // 48
  const cy = SIZE / 2   // 48

  // ── Orbit parameters ────────────────────────────────────────────────────────
  // Main orbit
  const RX  = 32          // horizontal radius
  const RY  = RX * 0.32   // ~10.24px vertical radius → 70° tilt perspective

  // Micro-satellite inner orbit
  const RX2 = 18
  const RY2 = RX2 * 0.32

  // ── Kepler-style variable speed ──────────────────────────────────────────────
  // Dot accelerates at the bottom of the orbit (perigee) and slows at the top
  // (apogee), mimicking Kepler's second law. Range: ~0.0025–0.0045 rad/frame.
  function keplerStep(a: number): number {
    return 0.0025 + 0.002 * ((Math.sin(a + Math.PI / 2) + 1) / 2)
  }

  // Micro-satellite runs at a fixed faster rate
  const ANGLE_STEP_2 = 0.007

  // ── Trail buffers ────────────────────────────────────────────────────────────
  const TRAIL_1 = 40
  const TRAIL_2 = 20
  type TrailPoint = { x: number; y: number; depth: number }
  const trail1: TrailPoint[] = []
  const trail2: TrailPoint[] = []

  // ── Particle system ──────────────────────────────────────────────────────────
  const MAX_PARTICLES = 14
  type Particle = { x: number; y: number; vx: number; vy: number; life: number; sz: number }
  const particles: Particle[] = []

  function emitParticle(x: number, y: number, depth: number): void {
    if (Math.random() > 0.15 || particles.length >= MAX_PARTICLES) return
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      life: 1,
      sz: (0.4 + Math.random() * 0.8) * depth
    })
  }

  // ── State ────────────────────────────────────────────────────────────────────
  let angle1    = -Math.PI / 2   // main dot — start at top
  let angle2    = Math.PI        // micro-satellite — start at bottom
  let pulse     = 0              // drives center glyph breathing (0 → TAU loop)
  let sigilAngle = 0             // slow sigil rotation

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function getDepth(a: number): number {
    return (Math.sin(a) + 1) / 2   // 0 = far/back, 1 = near/front
  }

  function getDotRadius(depth: number): number {
    return 1.0 + depth * 1.5
  }

  // ── Center glyph ─────────────────────────────────────────────────────────────
  // All gold — no purple. Breathing rings + slow-rotating sigil spokes.
  function drawCenterGlyph(): void {
    // 4 sigil spokes — extremely faint, rotate once every ~350s
    for (let i = 0; i < 4; i++) {
      const a = sigilAngle + i * (Math.PI * 2 / 4)
      ctx!.beginPath()
      ctx!.moveTo(cx, cy)
      ctx!.lineTo(
        cx + Math.cos(a) * RX * 0.75,
        cy + Math.sin(a) * RX * 0.75 * 0.38
      )
      ctx!.strokeStyle = 'rgba(180, 130, 30, 0.05)'
      ctx!.lineWidth   = 0.5
      ctx!.stroke()
    }

    // Outer breathing ring
    ctx!.beginPath()
    ctx!.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx!.strokeStyle = `rgba(180, 140, 40, ${(0.06 + Math.sin(pulse) * 0.08).toFixed(3)})`
    ctx!.lineWidth   = 0.5
    ctx!.stroke()

    // Inner breathing ring (offset phase so they breathe independently)
    ctx!.beginPath()
    ctx!.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx!.strokeStyle = `rgba(212, 180, 60, ${(0.10 + Math.sin(pulse + 1.0) * 0.10).toFixed(3)})`
    ctx!.lineWidth   = 0.5
    ctx!.stroke()

    // Pulsing core glow
    const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 4)
    const glowAlpha = (0.5 + Math.sin(pulse + 2.0) * 0.2).toFixed(3)
    glow.addColorStop(0,   `rgba(255, 230, 130, ${glowAlpha})`)
    glow.addColorStop(0.5, 'rgba(212, 167,  58, 0.30)')
    glow.addColorStop(1,   'rgba(180, 100,  20, 0)')
    ctx!.beginPath()
    ctx!.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx!.fillStyle = glow
    ctx!.fill()

    // Bright center point
    ctx!.beginPath()
    ctx!.arc(cx, cy, 1.5, 0, Math.PI * 2)
    ctx!.fillStyle = `rgba(255, 240, 180, ${(0.6 + Math.sin(pulse) * 0.3).toFixed(3)})`
    ctx!.fill()
  }

  // ── Draw comet trail ─────────────────────────────────────────────────────────
  function drawTrail(trail: TrailPoint[], length: number): void {
    for (let i = 0; i < trail.length; i++) {
      const pt = trail[i]
      if (!pt) continue

      const progress = i / length
      const depth    = pt.depth
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

  // ── Draw orbital body (main or micro) ────────────────────────────────────────
  function drawDot(x: number, y: number, depth: number, main: boolean): void {
    const scale      = main ? 1.0 : 0.6
    const coreRadius = getDotRadius(depth) * scale
    const haloRadius = coreRadius * 4
    const depthAlpha = 0.35 + depth * 0.65

    const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloRadius)
    halo.addColorStop(0,   `rgba(255, 220, 100, ${(0.85 * depthAlpha).toFixed(3)})`)
    halo.addColorStop(0.4, `rgba(232, 184,  75, ${(0.45 * depthAlpha).toFixed(3)})`)
    halo.addColorStop(1,   'rgba(180, 100, 20, 0)')
    ctx!.beginPath()
    ctx!.arc(x, y, haloRadius, 0, Math.PI * 2)
    ctx!.fillStyle = halo
    ctx!.fill()

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

    // Advance phase clocks
    pulse       += 0.022
    sigilAngle  += 0.0003

    // Parametric positions
    const x1 = cx + RX  * Math.cos(angle1)
    const y1 = cy + RY  * Math.sin(angle1)
    const d1 = getDepth(angle1)

    const x2 = cx + RX2 * Math.cos(angle2)
    const y2 = cy + RY2 * Math.sin(angle2)
    const d2 = getDepth(angle2)

    // Update trail buffers
    trail1.push({ x: x1, y: y1, depth: d1 })
    if (trail1.length > TRAIL_1) trail1.shift()

    trail2.push({ x: x2, y: y2, depth: d2 })
    if (trail2.length > TRAIL_2) trail2.shift()

    // Particle emission from main dot only
    emitParticle(x1, y1, d1)

    // ── Draw orbit path rings ────────────────────────────────────────────────
    ctx!.beginPath()
    ctx!.ellipse(cx, cy, RX, RY, 0, 0, Math.PI * 2)
    ctx!.strokeStyle = `rgba(180, 130, 30, ${(0.08 + Math.sin(pulse * 0.5) * 0.06).toFixed(3)})`
    ctx!.lineWidth   = 0.5
    ctx!.stroke()

    ctx!.beginPath()
    ctx!.ellipse(cx, cy, RX2, RY2, 0, 0, Math.PI * 2)
    ctx!.strokeStyle = `rgba(200, 170, 80, ${(0.06 + Math.sin(pulse * 0.5 + 1) * 0.04).toFixed(3)})`
    ctx!.lineWidth   = 0.5
    ctx!.stroke()

    // ── Tick and draw particles ──────────────────────────────────────────────
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      if (!p) continue
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.028
      if (p.life <= 0) { particles.splice(i, 1); continue }
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.sz * p.life, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(212, 167, 58, ${(p.life * 0.55).toFixed(3)})`
      ctx!.fill()
    }

    // ── Depth-ordered rendering ──────────────────────────────────────────────
    // Rules:
    //   Both behind  → trails + dots → glyph on top
    //   Both in front → glyph first → trails + dots on top
    //   Mixed        → back body → glyph → front body
    const front1 = d1 >= 0.5
    const front2 = d2 >= 0.5

    if (!front1 && !front2) {
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
      drawCenterGlyph()
    } else if (front1 && front2) {
      drawCenterGlyph()
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
    } else if (!front1 && front2) {
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
      drawCenterGlyph()
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
    } else {
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
      drawCenterGlyph()
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
    }

    // ── Advance angles ───────────────────────────────────────────────────────
    angle1 = (angle1 + keplerStep(angle1)) % (Math.PI * 2)
    angle2 = (angle2 + ANGLE_STEP_2) % (Math.PI * 2)

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
  width: 96px;
  height: 96px;
  display: block;
  pointer-events: none;
  /* 16px canvas padding built in — compensate so it aligns with the title */
  margin: -16px;
}
</style>