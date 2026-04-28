import { createCanvas, registerFont, loadImage } from 'canvas'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

// ── Design tokens ────────────────────────────────────────────────────────────
const BONE      = '#F2EBDD'
const INK       = '#1A1612'
const INK_MID   = '#3D3530'
const INK_FAINT = 'rgba(26,22,18,0.45)'
const INK_GHOST = 'rgba(26,22,18,0.15)'
const GOLD      = '#C9A961'

// ── Archetype identity lines ─────────────────────────────────────────────────
const IDENTITY_LINES: Record<string, string> = {
  alchemist:  'The one who turns crisis into invention.',
  architect:  'The one who builds what others only imagine.',
  catalyst:   'The one who changes every room they enter.',
  guardian:   'The one who protects without being asked.',
  lighthouse: 'The one others navigate toward in the dark.',
  mirror:     'The one who reflects truth back to the world.',
  phoenix:    'The one who rises stronger from every ending.',
  sage:       'The one who knows before being told.',
  storm:      'The one who moves through chaos with calm.',
  visionary:  'The one who lives ten years ahead.',
  wanderer:   'The one who finds home everywhere and nowhere.',
  wildfire:   'The one who loves without a safety net.',
}

const SYMBOL_TO_ID: Record<string, string> = {
  '●': 'phoenix',
  '◆': 'architect',
  '▲': 'storm',
  '◇': 'lighthouse',
  '○': 'wanderer',
  '⬡': 'alchemist',
  '□': 'guardian',
  '⬟': 'visionary',
  '◉': 'mirror',
  '✦': 'catalyst',
  '▽': 'sage',
  '★': 'wildfire',
}

function resolveSymbolPath(archetypeId: string): string {
  const filename = `${archetypeId}@2x.png`
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'symbols', filename),
    join(process.cwd(), 'public', 'symbols', filename),
  ]
  const found = candidates.find(p => existsSync(p))
  if (!found) throw new Error(`Symbol PNG not found: ${filename}`)
  return found
}

// Resolve the fonts directory across environments:
//   dev  → <project-root>/public/fonts/
//   prod → .output/public/fonts/  (sibling of .output/server/ where this bundle runs)
function resolveFontPath(filename: string): string {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fonts', filename),
    join(process.cwd(), 'public', 'fonts', filename),
  ]
  const found = candidates.find(p => existsSync(p))
  if (!found) throw new Error(`Font file not found: ${filename}. Candidates: ${candidates.join(', ')}`)
  return found
}

let fontsRegistered = false

function ensureFonts() {
  if (fontsRegistered) return
  registerFont(resolveFontPath('Inter-Light.ttf'),            { family: 'Inter',     weight: '300', style: 'normal' })
  registerFont(resolveFontPath('Inter-Regular.ttf'),          { family: 'Inter',     weight: '400', style: 'normal' })
  registerFont(resolveFontPath('Inter-Medium.ttf'),           { family: 'Inter',     weight: '500', style: 'normal' })
  registerFont(resolveFontPath('Inter-Italic.ttf'),           { family: 'Inter',     weight: '400', style: 'italic' })
  registerFont(resolveFontPath('Fraunces-Light.ttf'),         { family: 'Fraunces',  weight: '300', style: 'normal' })
  registerFont(resolveFontPath('Fraunces-LightItalic.ttf'),   { family: 'Fraunces',  weight: '300', style: 'italic' })
  registerFont(resolveFontPath('Cormorant-Light.ttf'),        { family: 'Cormorant', weight: '300', style: 'normal' })
  registerFont(resolveFontPath('Cormorant-LightItalic.ttf'),  { family: 'Cormorant', weight: '300', style: 'italic' })
  fontsRegistered = true
}

function drawWrappedText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line + word + ' '
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, currentY)
      line = word + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, currentY)
}

export default defineEventHandler(async (event) => {
  ensureFonts()

  const body = await readBody(event)

  const archetypeName   = sanitizeString(body.archetypeName, 30)
  const archetypeSymbol = sanitizeString(body.archetypeSymbol, 5)
  const element         = sanitizeString(body.element, 20)
  const lifePathNumber  = Number(body.lifePathNumber)
  const affirmation     = sanitizeString(body.affirmation, 200)
  const firstName       = sanitizeString(body.firstName, 50)
  const powerTraits     = Array.isArray(body.powerTraits)
    ? (body.powerTraits as unknown[]).slice(0, 5).map((t) => sanitizeString(String(t ?? ''), 80))
    : []

  assertInput(!!firstName, 'firstName is required')
  assertInput(!!archetypeName, 'archetypeName is required')

  const archetypeId = SYMBOL_TO_ID[archetypeSymbol] ?? 'phoenix'

  const width  = 1080
  const height = 1920
  const canvas = createCanvas(width, height)
  const ctx    = canvas.getContext('2d')
  const cx     = width / 2

  // ── 1. BACKGROUND ─────────────────────────────────────────────────────────
  ctx.fillStyle = BONE
  ctx.fillRect(0, 0, width, height)

  // Paper grain — deterministic dot pattern (avoid Math.random for reproducibility)
  ctx.fillStyle = 'rgba(26,22,18,0.03)'
  for (let i = 0; i < 800; i++) {
    const gx = ((i * 137.508) % width)
    const gy = ((i * 97.632 + i * i * 0.00031) % height)
    const gr = (i % 3 === 0) ? 1.5 : (i % 3 === 1 ? 1.0 : 0.6)
    ctx.beginPath()
    ctx.arc(gx, gy, gr, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 2. WORDMARK ────────────────────────────────────────────────────────────
  ctx.font = '500 28px Inter'
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.fillText('O M E N O R A', cx, 90)

  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - 100, 112)
  ctx.lineTo(cx + 100, 112)
  ctx.stroke()

  // ── 3. EYEBROW LABEL ───────────────────────────────────────────────────────
  ctx.font = '400 22px Inter'
  ctx.fillStyle = INK_FAINT
  ctx.fillText('YOUR ARCHETYPE', cx, 168)

  // ── 4. ARCHETYPE SYMBOL ───────────────────────────────────────────────────
  const symbolSize = 320
  const symbolX    = cx - symbolSize / 2
  const symbolY    = 210

  const symbolImg = await loadImage(resolveSymbolPath(archetypeId))

  // Draw symbol on offscreen canvas for multiply blend
  const offCanvas = createCanvas(symbolSize, symbolSize)
  const offCtx    = offCanvas.getContext('2d')
  offCtx.drawImage(symbolImg, 0, 0, symbolSize, symbolSize)
  // Multiply blend: overlay ink-mid to tint the gold symbol toward ink tones on bone
  offCtx.globalCompositeOperation = 'multiply'
  offCtx.fillStyle = INK_MID
  offCtx.fillRect(0, 0, symbolSize, symbolSize)

  ctx.drawImage(offCanvas, symbolX, symbolY)

  // ── 5. ARCHETYPE NAME ─────────────────────────────────────────────────────
  const nameWithout = (archetypeName || 'The Phoenix').replace(/^The\s+/i, '')
  const nameFontSize = nameWithout.length > 10 ? 88 : 112

  ctx.font = 'italic 300 52px Fraunces'
  ctx.fillStyle = 'rgba(26,22,18,0.5)'
  ctx.fillText('The', cx, 592)

  ctx.font = `italic 300 ${nameFontSize}px Fraunces`
  ctx.fillStyle = INK
  ctx.fillText(nameWithout, cx, 712)

  // ── 6. THIN RULE ──────────────────────────────────────────────────────────
  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - 200, 752)
  ctx.lineTo(cx + 200, 752)
  ctx.stroke()

  // ── 7. IDENTITY LINE ──────────────────────────────────────────────────────
  const identityLine = IDENTITY_LINES[archetypeId] || ''
  ctx.font = 'italic 300 38px Cormorant'
  ctx.fillStyle = INK_MID
  drawWrappedText(ctx, identityLine, cx, 820, 720, 52)

  // ── 8. META ROW ───────────────────────────────────────────────────────────
  ctx.font = '400 24px Inter'
  ctx.fillStyle = INK_FAINT
  ctx.fillText(`${element || 'Fire'}  ·  Life Path ${lifePathNumber || 7}`, cx, 1010)

  // ── 9. POWER TRAITS (editorial annotation style) ─────────────────────────
  const displayTraits = (powerTraits.length ? powerTraits : ['Resilient', 'Visionary', 'Grounded'])
    .slice(0, 3)
    .map((t: string) => t.length > 48 ? t.slice(0, 47).trimEnd() + '…' : t)

  let traitY = 1090
  displayTraits.forEach((trait: string, i: number) => {
    const numLabel = `[0${i + 1}]`
    ctx.font = '400 20px Inter'
    ctx.textAlign = 'left'
    ctx.fillStyle = GOLD
    ctx.fillText(numLabel, cx - 340, traitY)
    ctx.fillStyle = 'rgba(26,22,18,0.70)'
    ctx.fillText(trait, cx - 280, traitY)
    ctx.textAlign = 'center'
    traitY += 56
  })

  // ── 10. AFFIRMATION BOX ───────────────────────────────────────────────────
  const boxTop = 1340
  const boxH   = 200

  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth   = 0.5
  ctx.strokeRect(180, boxTop, 720, boxH)

  ctx.font      = '400 18px Inter'
  ctx.fillStyle = INK_FAINT
  ctx.textAlign = 'center'
  ctx.fillText('YOUR POWER STATEMENT', cx, boxTop + 38)

  // Thin rule inside box
  ctx.beginPath()
  ctx.moveTo(cx - 60, boxTop + 52)
  ctx.lineTo(cx + 60, boxTop + 52)
  ctx.stroke()

  const affirmText = affirmation || 'I transform pressure into precision.'
  ctx.font      = 'italic 300 32px Cormorant'
  ctx.fillStyle = INK
  drawWrappedText(ctx, `"${affirmText}"`, cx, boxTop + 98, 640, 44)

  // ── 11. FOOTER ────────────────────────────────────────────────────────────
  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth   = 0.5
  ctx.beginPath()
  ctx.moveTo(100, 1782)
  ctx.lineTo(980, 1782)
  ctx.stroke()

  ctx.font      = '500 20px Inter'
  ctx.fillStyle = INK_FAINT
  ctx.textAlign = 'center'
  ctx.fillText('O M E N O R A', cx, 1822)

  ctx.font      = '400 18px Inter'
  ctx.fillStyle = 'rgba(26,22,18,0.3)'
  ctx.fillText('omenora.com', cx, 1860)

  // ── RETURN IMAGE ──────────────────────────────────────────────────────────
  const buffer = canvas.toBuffer('image/png')

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-destiny-${firstName || 'report'}.png"`,
  )

  return buffer
})
