<template>
  <canvas
    ref="orbitalCanvas"
    class="orbital-canvas"
    :style="canvasStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  /** Visible square size in CSS pixels. Canvas is rendered larger to allow glow overflow. */
  size?: number
  /** Extra canvas padding for glow/particle bleed beyond the visible square. */
  pad?: number
  /** Hex accent color for orbiting bodies. Default is refined gold. */
  accent?: string
  /** Toggle background starfield. */
  starfield?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  size: 160,
  pad: 26,
  accent: '#d4a73a',
  starfield: true,
})

const orbitalCanvas = ref<HTMLCanvasElement | null>(null)

const canvasStyle = computed(() => ({
  width:  `${props.size}px`,
  height: `${props.size}px`,
  margin: `${-props.pad}px`,
}))

// ── Lifecycle handles ─────────────────────────────────────────────────────────
let animId = 0
let cleanup: (() => void) | null = null

onMounted(() => { cleanup = init() })
onUnmounted(() => { cleanup?.() })

// ─────────────────────────────────────────────────────────────────────────────
function init(): () => void {
  const canvasEl = orbitalCanvas.value
  if (!canvasEl) return () => {}
  const canvas: HTMLCanvasElement = canvasEl
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  // ── Color helpers ───────────────────────────────────────────────────────────
  // Parse the accent hex once, derive related shades. All runtime color writes
  // use template literals against these RGB tuples — avoids per-frame string
  // parsing and lets the user re-theme via the `accent` prop.
  const A     = hexToRgb(props.accent)              // primary accent (warm gold default)
  const A_LO  = mix(A, { r: 130, g: 90,  b: 20  }, 0.2) // shaded for outer glow
  const A_HI  = mix(A, { r: 255, g: 248, b: 224 }, 0.5) // brightened for cores
  const COOL  = { r: 90, g: 130, b: 175 }           // atmospheric rim contrast
  const STAR  = { r: 230, g: 220, b: 200 }          // faint warm white

  // ── Reduced motion ──────────────────────────────────────────────────────────
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = motionQuery.matches
  const onMotionChange = () => {
    reducedMotion = motionQuery.matches
    if (reducedMotion) { stop(); drawStaticFrame() }
    else if (running()) start()
  }
  motionQuery.addEventListener('change', onMotionChange)

  // ── Visibility / on-screen pausing ──────────────────────────────────────────
  let pageVisible = !document.hidden
  let onScreen    = true
  const running   = () => pageVisible && onScreen && !reducedMotion

  const onVisChange = () => {
    pageVisible = !document.hidden
    if (running()) start(); else stop()
  }
  document.addEventListener('visibilitychange', onVisChange)

  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true
    if (running()) start(); else stop()
  }, { rootMargin: '64px' })
  io.observe(canvas)

  // ── Sizing / DPR ────────────────────────────────────────────────────────────
  // SIZE is the *canvas* size in CSS px (visible size + 2× pad for overflow).
  // Re-applied on resize so DPR changes (e.g. dragging to a different-DPI
  // monitor) don't blur the render.
  const SIZE = props.size + props.pad * 2
  const cx   = SIZE / 2
  const cy   = SIZE / 2

  function resize(): void {
    const dpr = window.devicePixelRatio || 1
    canvas.width  = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width  = `${SIZE}px`
    canvas.style.height = `${SIZE}px`
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  window.addEventListener('resize', resize)

  // ── Orbit geometry ──────────────────────────────────────────────────────────
  // Radii are scaled to maintain the original 96px design at any size.
  const S   = props.size / 96
  const RX  = 32 * S          // main orbit horizontal radius
  const RY  = RX * 0.32       // ~70° tilt perspective
  const RX2 = 18 * S          // micro-satellite inner orbit
  const RY2 = RX2 * 0.32
  const PLANET_R = 7.5 * S

  // ── Speed ───────────────────────────────────────────────────────────────────
  // Kepler's 2nd law: faster at perigee (front-bottom), slower at apogee (top-back).
  // Returns *radians per 60fps frame*; delta-time scaling is applied at call site.
  function keplerStep(a: number): number {
    return 0.0025 + 0.002 * ((Math.sin(a + Math.PI / 2) + 1) / 2)
  }
  const ANGLE_STEP_2 = 0.007 // micro-satellite, constant rate

  // ── Trail buffers ───────────────────────────────────────────────────────────
  const TRAIL_1 = 40
  const TRAIL_2 = 20
  type TrailPoint = { x: number; y: number; depth: number }
  const trail1: TrailPoint[] = []
  const trail2: TrailPoint[] = []

  // ── Particles ───────────────────────────────────────────────────────────────
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
      sz: (0.4 + Math.random() * 0.8) * depth,
    })
  }

  // ── Starfield ───────────────────────────────────────────────────────────────
  // Pre-computed once. `tw` > 0 marks twinklers (a small subset). Static stars
  // render as static, twinklers modulate alpha against the global pulse.
  type Star = { x: number; y: number; a: number; tw: number }
  const stars: Star[] = []
  if (props.starfield) {
    const count = 32
    for (let i = 0; i < count; i++) {
      stars.push({
        x:  Math.random() * SIZE,
        y:  Math.random() * SIZE,
        a:  0.10 + Math.random() * 0.25,
        tw: i % 6 === 0 ? Math.random() * Math.PI * 2 : 0,
      })
    }
  }

  // ── State clocks ────────────────────────────────────────────────────────────
  let angle1     = -Math.PI / 2     // main orbiter — start at top (apogee)
  let angle2     =  Math.PI         // micro-satellite — start at left
  let pulse      = 0                // breathing for ambient glows
  let perigeeFlare = 0              // 0..1 spark intensity at perigee crossing
  let prevAngle1 = angle1

  let lastTime = performance.now()

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getDepth     = (a: number) => (Math.sin(a) + 1) / 2 // 0 = back, 1 = front
  const getDotRadius = (d: number) => (1.0 + d * 1.5) * S
  const rgba         = (c: { r: number; g: number; b: number }, a: number) =>
    `rgba(${c.r}, ${c.g}, ${c.b}, ${a.toFixed(3)})`

  // ── Background starfield ───────────────────────────────────────────────────
  // Drawn first, source-over. Twinklers modulate via the global pulse so we
  // don't need extra per-star clocks.
  function drawStarfield(): void {
    if (!stars.length) return
    for (const s of stars) {
      const tw = s.tw === 0 ? 1 : 0.55 + 0.45 * (Math.sin(pulse * 0.4 + s.tw) * 0.5 + 0.5)
      ctx!.beginPath()
      ctx!.arc(s.x, s.y, 0.5, 0, Math.PI * 2)
      ctx!.fillStyle = rgba(STAR, s.a * tw)
      ctx!.fill()
    }
  }

  // ── Orbit ring half-arcs ───────────────────────────────────────────────────
  // Back half (top of ellipse, sin(a) < 0) drawn behind the planet, dimmer.
  // Front half (bottom) drawn after, brighter, additive — feels "lit".
  function drawOrbitArc(rx: number, ry: number, back: boolean, baseAlpha: number): void {
    const start = back ? Math.PI : 0
    const end   = back ? Math.PI * 2 : Math.PI
    const alpha = baseAlpha * (back ? 0.55 : 1.0) + Math.sin(pulse * 0.5) * 0.04
    ctx!.beginPath()
    ctx!.ellipse(cx, cy, rx, ry, 0, start, end)
    ctx!.strokeStyle = rgba(A_LO, Math.max(0.02, alpha))
    ctx!.lineWidth   = 0.5
    ctx!.stroke()
  }

  // ── Dark planet, lit by the orbiting body ─────────────────────────────────
  // The conceptual centerpiece: dot1 is the light source. The crescent's
  // direction is the unit vector from planet → dot1 in screen space (with the
  // ellipse's vertical compression preserved so the lit side reads correctly
  // against the orbit's perspective). Brightness scales with depth1 — when the
  // orbiter is in front, we see the lit face; when behind, the visible face is
  // backlit, near-dark (a soft eclipse).
  function drawPlanet(lightAngle: number, lightDepth: number): void {
    // Light direction in screen space, matching orbit perspective.
    const lx = Math.cos(lightAngle)
    const ly = Math.sin(lightAngle) * (RY / RX)
    const lLen = Math.hypot(lx, ly) || 1
    const ux = lx / lLen
    const uy = ly / lLen

    // ── Ambient outer glow — additive, breathes ──────────────────────────────
    ctx!.globalCompositeOperation = 'lighter'
    const glowPulse = 0.07 + Math.sin(pulse * 0.6) * 0.035
    const ambient = ctx!.createRadialGradient(cx, cy, PLANET_R, cx, cy, PLANET_R * 2.6)
    ambient.addColorStop(0,   rgba(A,    glowPulse))
    ambient.addColorStop(0.5, rgba(A_LO, glowPulse * 0.4))
    ambient.addColorStop(1,   rgba(A_LO, 0))
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R * 2.6, 0, Math.PI * 2)
    ctx!.fillStyle = ambient
    ctx!.fill()
    ctx!.globalCompositeOperation = 'source-over'

    // ── Sphere base — deep near-black with subtle warm core ──────────────────
    const sphere = ctx!.createRadialGradient(
      cx + PLANET_R * 0.25, cy + PLANET_R * 0.2, PLANET_R * 0.05,
      cx, cy, PLANET_R,
    )
    sphere.addColorStop(0,    '#1c1608')
    sphere.addColorStop(0.45, '#0d0b04')
    sphere.addColorStop(1,    '#050401')
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.fillStyle = sphere
    ctx!.fill()

    // ── Lit crescent — clipped to sphere, additive against the dark base ─────
    ctx!.save()
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.clip()
    ctx!.globalCompositeOperation = 'lighter'

    // Strength tracks lightDepth: front-facing → fully lit, back → near-eclipse.
    // Squared curve keeps the back almost dark and lights up sharply as the
    // orbiter swings to the front, mirroring real lunar phase brightness.
    const litStrength = 0.15 + lightDepth * lightDepth * 1.05
    const cresPulse   = (0.22 + Math.sin(pulse * 0.7) * 0.05) * litStrength

    // Linear gradient along the light axis; bright stops on the +light side.
    const x0 = cx - ux * PLANET_R, y0 = cy - uy * PLANET_R
    const x1 = cx + ux * PLANET_R, y1 = cy + uy * PLANET_R
    const cres = ctx!.createLinearGradient(x0, y0, x1, y1)
    cres.addColorStop(0.00, rgba(A_LO, 0))
    cres.addColorStop(0.52, rgba(A_LO, 0))
    cres.addColorStop(0.72, rgba(A,    cresPulse * 0.55))
    cres.addColorStop(0.88, rgba(A,    cresPulse))
    cres.addColorStop(1.00, rgba(A_HI, cresPulse * 0.7))
    ctx!.fillStyle = cres
    ctx!.fillRect(cx - PLANET_R, cy - PLANET_R, PLANET_R * 2, PLANET_R * 2)

    // Faint surface ring sigil — engraved feel, drifts in alpha
    const sigilAlpha = (0.04 + Math.sin(pulse * 0.5) * 0.012) * (0.5 + lightDepth * 0.5)
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R * 0.38, 0, Math.PI * 2)
    ctx!.strokeStyle = rgba(A, sigilAlpha)
    ctx!.lineWidth   = 0.45
    ctx!.stroke()

    ctx!.restore()
    ctx!.globalCompositeOperation = 'source-over'

    // ── Atmospheric rim — cool sliver inside the limb on the lit side ────────
    // The warm/cool contrast is what reads as "premium space UI" rather than
    // monochrome. Only visible on the lit hemisphere; fades with light depth.
    if (lightDepth > 0.15) {
      ctx!.save()
      ctx!.beginPath()
      ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
      ctx!.clip()
      ctx!.globalCompositeOperation = 'lighter'
      const rimAlpha = 0.18 * lightDepth
      const rim = ctx!.createRadialGradient(
        cx + ux * PLANET_R * 0.7, cy + uy * PLANET_R * 0.7, PLANET_R * 0.6,
        cx + ux * PLANET_R * 0.7, cy + uy * PLANET_R * 0.7, PLANET_R * 1.1,
      )
      rim.addColorStop(0, rgba(COOL, 0))
      rim.addColorStop(1, rgba(COOL, rimAlpha))
      ctx!.fillStyle = rim
      ctx!.fillRect(cx - PLANET_R, cy - PLANET_R, PLANET_R * 2, PLANET_R * 2)
      ctx!.restore()
      ctx!.globalCompositeOperation = 'source-over'
    }

    // ── Hairline gold limb ───────────────────────────────────────────────────
    ctx!.beginPath()
    ctx!.arc(cx, cy, PLANET_R, 0, Math.PI * 2)
    ctx!.strokeStyle = rgba(A_LO, 0.22 + Math.sin(pulse * 0.6) * 0.06)
    ctx!.lineWidth   = 0.5
    ctx!.stroke()
  }

  // ── Comet trail ────────────────────────────────────────────────────────────
  // Per-point circles with additive blending. Tried single-stroke continuous
  // path here — it looked CSS-stroke flat, lost the "particles condensing"
  // texture. Discrete additive points read like actual luminous matter.
  function drawTrail(trail: TrailPoint[], length: number): void {
    ctx!.globalCompositeOperation = 'lighter'
    for (let i = 0; i < trail.length; i++) {
      const pt = trail[i]
      if (!pt) continue
      const progress = i / length
      const depth    = pt.depth
      const backFade = depth < 0.45 ? (depth / 0.45) * 0.3 : 1.0
      const alpha    = progress * depth * 0.55 * backFade
      const radius   = progress * getDotRadius(depth) * 0.75
      if (radius < 0.1) continue
      ctx!.beginPath()
      ctx!.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
      ctx!.fillStyle = rgba(A, alpha)
      ctx!.fill()
    }
    ctx!.globalCompositeOperation = 'source-over'
  }

  // ── Orbital body (dot + halo) ──────────────────────────────────────────────
  function drawDot(x: number, y: number, depth: number, main: boolean): void {
    const scale      = main ? 1.0 : 0.55
    const coreRadius = getDotRadius(depth) * scale
    const haloMult   = main ? 4.0 : 2.8
    const haloRadius = coreRadius * haloMult
    const depthAlpha = 0.12 + depth * depth * 0.83
    const haloPeak   = main ? 0.82 : 0.52

    ctx!.globalCompositeOperation = 'lighter'

    const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloRadius)
    halo.addColorStop(0,   rgba(A_HI, haloPeak * depthAlpha))
    halo.addColorStop(0.4, rgba(A,    haloPeak * 0.45 * depthAlpha))
    halo.addColorStop(1,   rgba(A_LO, 0))
    ctx!.beginPath()
    ctx!.arc(x, y, haloRadius, 0, Math.PI * 2)
    ctx!.fillStyle = halo
    ctx!.fill()

    const core = ctx!.createRadialGradient(x, y, 0, x, y, coreRadius)
    core.addColorStop(0,   rgba(A_HI, depthAlpha))
    core.addColorStop(0.5, rgba(A,    depthAlpha))
    core.addColorStop(1,   rgba(A_LO, 0.7 * depthAlpha))
    ctx!.beginPath()
    ctx!.arc(x, y, coreRadius, 0, Math.PI * 2)
    ctx!.fillStyle = core
    ctx!.fill()

    ctx!.globalCompositeOperation = 'source-over'
  }

  // ── Perigee flare ──────────────────────────────────────────────────────────
  // Brief radial spark when angle1 crosses Math.PI/2 (front-bottom, fastest
  // point). Detected by sign change in (angle - π/2) across a frame.
  function drawPerigeeFlare(x: number, y: number): void {
    if (perigeeFlare <= 0.02) return
    ctx!.globalCompositeOperation = 'lighter'
    const r = getDotRadius(1) * 6 * perigeeFlare
    const flare = ctx!.createRadialGradient(x, y, 0, x, y, r)
    flare.addColorStop(0,   rgba(A_HI, 0.55 * perigeeFlare))
    flare.addColorStop(0.4, rgba(A,    0.25 * perigeeFlare))
    flare.addColorStop(1,   rgba(A_LO, 0))
    ctx!.beginPath()
    ctx!.arc(x, y, r, 0, Math.PI * 2)
    ctx!.fillStyle = flare
    ctx!.fill()
    ctx!.globalCompositeOperation = 'source-over'
  }

  // ── Static frame (reduced motion) ──────────────────────────────────────────
  function drawStaticFrame(): void {
    ctx!.clearRect(0, 0, SIZE, SIZE)
    drawStarfield()
    drawOrbitArc(RX, RY, true,  0.10)
    drawOrbitArc(RX2, RY2, true, 0.08)

    const a1 = -Math.PI / 3, a2 = Math.PI * 0.6
    const x1 = cx + RX  * Math.cos(a1), y1 = cy + RY  * Math.sin(a1), d1 = getDepth(a1)
    const x2 = cx + RX2 * Math.cos(a2), y2 = cy + RY2 * Math.sin(a2), d2 = getDepth(a2)

    drawPlanet(a1, d1)
    drawOrbitArc(RX, RY, false, 0.10)
    drawOrbitArc(RX2, RY2, false, 0.08)
    drawDot(x1, y1, d1, true)
    drawDot(x2, y2, d2, false)
  }

  // ── Frame ──────────────────────────────────────────────────────────────────
  function frame(now: number): void {
    // dt: 1.0 = one 60fps frame. Clamped to avoid huge jumps after a tab
    // unfreeze (e.g. user returns from another tab).
    const dt = Math.min((now - lastTime) / 16.667, 4)
    lastTime = now

    ctx!.clearRect(0, 0, SIZE, SIZE)

    pulse += 0.022 * dt

    // Positions
    const x1 = cx + RX  * Math.cos(angle1)
    const y1 = cy + RY  * Math.sin(angle1)
    const d1 = getDepth(angle1)
    const x2 = cx + RX2 * Math.cos(angle2)
    const y2 = cy + RY2 * Math.sin(angle2)
    const d2 = getDepth(angle2)

    // Trails
    trail1.push({ x: x1, y: y1, depth: d1 })
    if (trail1.length > TRAIL_1) trail1.shift()
    trail2.push({ x: x2, y: y2, depth: d2 })
    if (trail2.length > TRAIL_2) trail2.shift()

    // Particles emitted from both bodies
    if (Math.random() < dt) emitParticle(x1, y1, d1)
    if (Math.random() < dt) emitParticle(x2, y2, d2)

    // Perigee crossing detection — angle just passed π/2 (front-bottom).
    // Trigger a fresh flare; otherwise decay the existing one.
    const wasBefore = prevAngle1 < Math.PI / 2 && prevAngle1 > -Math.PI / 2
    const isAfter   = angle1     > Math.PI / 2 || angle1     < -Math.PI / 2
    if (wasBefore && isAfter && angle1 - prevAngle1 < Math.PI) perigeeFlare = 1
    else perigeeFlare = Math.max(0, perigeeFlare - 0.04 * dt)
    prevAngle1 = angle1

    // ── Render order ────────────────────────────────────────────────────────
    // Background → back arcs → back-side bodies → planet → front arcs →
    // front-side bodies → particles (always on top, additive).
    drawStarfield()
    drawOrbitArc(RX,  RY,  true, 0.10)
    drawOrbitArc(RX2, RY2, true, 0.08)

    if (d1 < 0.5) { drawTrail(trail1, TRAIL_1); drawDot(x1, y1, d1, true)  }
    if (d2 < 0.5) { drawTrail(trail2, TRAIL_2); drawDot(x2, y2, d2, false) }

    drawPlanet(angle1, d1)

    drawOrbitArc(RX,  RY,  false, 0.10)
    drawOrbitArc(RX2, RY2, false, 0.08)

    if (d1 >= 0.5) { drawTrail(trail1, TRAIL_1); drawDot(x1, y1, d1, true)  }
    if (d2 >= 0.5) { drawTrail(trail2, TRAIL_2); drawDot(x2, y2, d2, false) }

    drawPerigeeFlare(x1, y1)

    // Particles — additive on top
    ctx!.globalCompositeOperation = 'lighter'
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      if (!p) continue
      p.x   += p.vx * dt
      p.y   += p.vy * dt
      p.life -= 0.028 * dt
      if (p.life <= 0) { particles.splice(i, 1); continue }
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.sz * p.life, 0, Math.PI * 2)
      ctx!.fillStyle = rgba(A, p.life * 0.55)
      ctx!.fill()
    }
    ctx!.globalCompositeOperation = 'source-over'

    // Advance angles (delta-time scaled)
    angle1 = (angle1 + keplerStep(angle1) * dt) % (Math.PI * 2)
    angle2 = (angle2 + ANGLE_STEP_2     * dt) % (Math.PI * 2)

    animId = requestAnimationFrame(frame)
  }

  // ── Loop control ───────────────────────────────────────────────────────────
  function start(): void {
    if (animId || reducedMotion) return
    lastTime = performance.now()
    animId = requestAnimationFrame(frame)
  }
  function stop(): void {
    if (animId) { cancelAnimationFrame(animId); animId = 0 }
  }

  // Boot
  if (reducedMotion) drawStaticFrame()
  else start()

  // ── Cleanup ────────────────────────────────────────────────────────────────
  return () => {
    stop()
    motionQuery.removeEventListener('change', onMotionChange)
    document.removeEventListener('visibilitychange', onVisChange)
    window.removeEventListener('resize', resize)
    io.disconnect()
    ro.disconnect()
  }
}

// ── Color utilities ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return { r: 212, g: 167, b: 58 }
  return {
    r: parseInt(m[0]!, 16),
    g: parseInt(m[1]!, 16),
    b: parseInt(m[2]!, 16),
  }
}
function mix(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): { r: number; g: number; b: number } {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}
</script>

<style scoped>
.orbital-canvas {
  display: block;
  pointer-events: none;
  /* Negative margin compensates for canvas pad so the visible disc aligns
     with surrounding layout. Set inline via :style based on `pad` prop. */
}
</style>