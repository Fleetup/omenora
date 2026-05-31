import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseScrollSequenceOptions {
  sectionRef: Ref<HTMLElement | null>
  canvasRef: Ref<HTMLCanvasElement | null>
  desktopBase: string
  mobileBase: string
  desktopFrames: number
  mobileFrames: number
  breakpoint?: number
}

export function useScrollSequence(opts: UseScrollSequenceOptions) {
  const progress = ref(0)
  const frameIndex = ref(0)
  const firstFrameReady = ref(false)
  const totalFrames = ref(0)

  let images: HTMLImageElement[] = []
  let loaded: boolean[] = []
  let scrollRaf: number | null = null
  let loadRaf: number | null = null
  let scrollHandler: (() => void) | null = null
  let resizeHandler: (() => void) | null = null
  let prefersReducedMotion = false
  let dpr = 1

  function frameUrl(base: string, i: number) {
    return `${base}omenora_${String(i + 1).padStart(4, '0')}.jpg`
  }

  function pickSet() {
    const isMobile = window.innerWidth < (opts.breakpoint ?? 768)
    const count = isMobile ? opts.mobileFrames : opts.desktopFrames
    const base = isMobile ? opts.mobileBase : opts.desktopBase
    totalFrames.value = count
    return { count, base }
  }

  function loadFrame(i: number, count: number, base: string, priority: 'high' | 'auto' | 'low') {
    if (images[i]) return
    const img = new Image()
    if ('fetchPriority' in img) (img as unknown as { fetchPriority: string }).fetchPriority = priority
    img.decoding = 'async'
    img.onload = () => {
      loaded[i] = true
      if (i === frameIndex.value || i === 0) {
        if (i === 0 && !firstFrameReady.value) firstFrameReady.value = true
        draw()
      }
    }
    img.src = frameUrl(base, i)
    images[i] = img
  }

  function preloadFrames(count: number, base: string) {
    images = new Array(count)
    loaded = new Array(count).fill(false)

    // 1. Frame 0 immediately, high priority — this is the LCP candidate
    loadFrame(0, count, base, 'high')

    // 2. Quartile anchors so any scroll position has a nearby frame within ~25 frames
    const anchors = [
      Math.floor(count * 0.25),
      Math.floor(count * 0.5),
      Math.floor(count * 0.75),
      count - 1,
    ]
    for (const a of anchors) loadFrame(a, count, base, 'auto')

    // 3. Fill remaining frames, ordered by distance from nearest anchor (gaps first)
    const queue: number[] = []
    for (let i = 1; i < count; i++) {
      if (!anchors.includes(i)) queue.push(i)
    }
    queue.sort((a, b) => {
      const da = Math.min(a, ...anchors.map(an => Math.abs(an - a)))
      const db = Math.min(b, ...anchors.map(an => Math.abs(an - b)))
      return da - db
    })

    const loadNext = () => {
      const i = queue.shift()
      if (i === undefined) {
        loadRaf = null
        return
      }
      loadFrame(i, count, base, 'low')
      loadRaf = requestAnimationFrame(loadNext)
    }
    loadRaf = requestAnimationFrame(loadNext)
  }

  function nearestLoaded(target: number): number {
    if (loaded[target]) return target
    for (let d = 1; d < images.length; d++) {
      if (target - d >= 0 && loaded[target - d]) return target - d
      if (target + d < images.length && loaded[target + d]) return target + d
    }
    return -1
  }

  function sizeCanvas() {
    const canvas = opts.canvasRef.value
    if (!canvas) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }

  function draw() {
    const canvas = opts.canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const i = nearestLoaded(frameIndex.value)
    if (i < 0) return
    const img = images[i]
    if (!img) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (!iw || !ih) return

    // object-fit: cover math — same ratio frames (16:9 desktop, 16:9 mobile) so cropping is minimal
    const scale = Math.max(cw / iw, ch / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  function update() {
    scrollRaf = null
    const section = opts.sectionRef.value
    if (!section) return

    const rect = section.getBoundingClientRect()
    const vh = window.innerHeight
    const totalScroll = rect.height - vh
    if (totalScroll <= 0) return
    const scrolled = -rect.top
    const p = Math.min(1, Math.max(0, scrolled / totalScroll))
    progress.value = p

    const newIndex = Math.min(totalFrames.value - 1, Math.round(p * (totalFrames.value - 1)))
    if (newIndex !== frameIndex.value) {
      frameIndex.value = newIndex
      draw()
    }
  }

  function onScroll() {
    if (scrollRaf == null) scrollRaf = requestAnimationFrame(update)
  }

  onMounted(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const { count, base } = pickSet()
    sizeCanvas()
    preloadFrames(count, base)

    if (prefersReducedMotion) {
      // Static first-frame render; no scroll listener.
      progress.value = 0
      frameIndex.value = 0
      return
    }

    scrollHandler = onScroll
    window.addEventListener('scroll', scrollHandler, { passive: true })

    resizeHandler = () => {
      sizeCanvas()
      draw()
    }
    window.addEventListener('resize', resizeHandler, { passive: true })

    update()
  })

  onUnmounted(() => {
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    if (scrollRaf != null) cancelAnimationFrame(scrollRaf)
    if (loadRaf != null) cancelAnimationFrame(loadRaf)
    for (const img of images) {
      if (img) {
        img.onload = null
        img.src = ''
      }
    }
    images = []
    loaded = []
  })

  return { progress, frameIndex, firstFrameReady, totalFrames }
}
