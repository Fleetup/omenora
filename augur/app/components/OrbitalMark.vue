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
  // S = scale factor relative to original 96px design.
  // 160px canvas gives ~26px padding for glow/particle overflow on each side.
  const S    = 1.67
  const SIZE = Math.round(96 * S)   // 160
  const DPR  = window.devicePixelRatio || 1

  canvas.width  = SIZE * DPR
  canvas.height = SIZE * DPR
  ctx.scale(DPR, DPR)

  const cx = SIZE / 2
  const cy = SIZE / 2

  // ── Orbit parameters ────────────────────────────────────────────────────────
  // Main orbit
  const RX  = Math.round(32 * S)          // ~53px horizontal radius
  const RY  = RX * 0.32                   // vertical radius → 70° tilt perspective

  // Micro-satellite inner orbit
  const RX2 = Math.round(18 * S)          // ~30px
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
    return (1.0 + depth * 1.5) * S
  }

  // ── Dark Planet (Option B) ───────────────────────────────────────────────────
  // Near-black sphere with a gold crescent light catching the right edge,
  // a faint surface sigil, and a soft ambient glow that breathes.
  function drawDarkPlanet(): void {
    const PLANET_R = 7.5 * S

    // ── Ambient outer glow — breathes slowly ──────────────────────────────────
    const glowPulse = 0.08 + Math.sin(pulse * 0.6) * 0.04
    const ambientGlow = ctx!.createRadialGradient(cx, cy, PLANET_R, cx, cy, PLANET_R * 2.4)
    ambientGlow.addColorStop(0,   `rgba(180, 140, 40, ${glowPulse.toFixed(3)})`)
    ambientGlow.addColorStop(0.5, `rgba(130,  90, 20, ${(glowPulse * 0.4).toFixed(3)})`)
    ambientGlow.addColorStop(1,   'rgba(100,  60, 10, 0)')
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R * 2.4, 0, Math.PI * 2)
    ctx!.fillStyle = ambientGlow
    ctx!.fill()

    // ── Sphere base — deep near-black with slight warm tint ───────────────────
    const sphere = ctx!.createRadialGradient(
      cx + PLANET_R * 0.25, cy + PLANET_R * 0.2, PLANET_R * 0.05,
      cx, cy, PLANET_R
    )
    sphere.addColorStop(0,   '#1c1608')
    sphere.addColorStop(0.45, '#0d0b04')
    sphere.addColorStop(1,   '#050401')
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.fillStyle = sphere
    ctx!.fill()

    // ── Crescent — gold light catching the right limb ─────────────────────────
    // Clip to planet circle, then paint a horizontal gradient that only
    // brightens the right 25% of the sphere, fading toward the terminator.
    ctx!.save()
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.clip()

    const crescentPulse = 0.25 + Math.sin(pulse * 0.7) * 0.06
    const crescent = ctx!.createLinearGradient(cx - PLANET_R, cy, cx + PLANET_R, cy)
    crescent.addColorStop(0,    'rgba(212, 167,  58, 0)')
    crescent.addColorStop(0.52, 'rgba(212, 167,  58, 0)')
    crescent.addColorStop(0.72, `rgba(195, 148,  42, ${(crescentPulse * 0.55).toFixed(3)})`)
    crescent.addColorStop(0.88, `rgba(220, 175,  60, ${crescentPulse.toFixed(3)})`)
    crescent.addColorStop(1,    `rgba(245, 205,  80, ${(crescentPulse * 0.65).toFixed(3)})`)
    ctx!.fillStyle = crescent
    ctx!.fillRect(cx - PLANET_R, cy - PLANET_R, PLANET_R * 2, PLANET_R * 2)

    // ── Surface sigil — 4 spokes + inner ring, engraved on the dark face ──────
    // Drawn inside the clip so it never bleeds outside the sphere edge.
    const sigilAlpha = 0.11 + Math.sin(pulse * 0.5) * 0.04
    ctx!.globalAlpha = sigilAlpha
    // 4 spokes from center
    for (let i = 0; i < 4; i++) {
      const a = sigilAngle + i * (Math.PI * 2 / 4)
      ctx!.beginPath()
      ctx!.moveTo(cx, cy)
      ctx!.lineTo(cx + Math.cos(a) * PLANET_R * 0.78, cy + Math.sin(a) * PLANET_R * 0.78)
      ctx!.strokeStyle = 'rgba(212, 167, 58, 1)'
      ctx!.lineWidth   = 0.45
      ctx!.stroke()
    }
    // Inner sigil ring
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R * 0.38, 0, Math.PI * 2)
    ctx!.strokeStyle = 'rgba(212, 167, 58, 1)'
    ctx!.lineWidth   = 0.45
    ctx!.stroke()
    ctx!.globalAlpha = 1

    ctx!.restore()

    // ── Limb — hairline gold ring traces the sphere edge ─────────────────────
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.strokeStyle = `rgba(180, 130, 30, ${(0.22 + Math.sin(pulse * 0.6) * 0.08).toFixed(3)})`
    ctx!.lineWidth   = 0.5
    ctx!.stroke()
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
      drawDarkPlanet()
    } else if (front1 && front2) {
      drawDarkPlanet()
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
    } else if (!front1 && front2) {
      drawTrail(trail1, TRAIL_1)
      drawDot(x1, y1, d1, true)
      drawDarkPlanet()
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
    } else {
      drawTrail(trail2, TRAIL_2)
      drawDot(x2, y2, d2, false)
      drawDarkPlanet()
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
  width: 160px;
  height: 160px;
  display: block;
  pointer-events: none;
  /* ~26px canvas padding built in — compensate so it aligns with the title */
  margin: -26px;
}
</style>