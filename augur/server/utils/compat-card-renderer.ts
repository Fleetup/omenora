import { createCanvas, registerFont, loadImage } from 'canvas'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

// ── Design tokens — exact match to current site brand ─────────────────────────
const BONE      = '#F2EBDD'
const INK       = '#1A1612'
const INK_MID   = '#3D3530'
const INK_FAINT = 'rgba(26,22,18,0.45)'
const INK_GHOST = 'rgba(26,22,18,0.15)'

// ── Score colours — mirrors compatibility.vue `scoreColor` computed exactly ───
// so the downloaded PNG always matches the on-screen preview card
function scoreColor(score: number): string {
  if (score >= 80) return 'rgba(107, 72, 224, 0.9)'
  if (score >= 60) return 'rgba(201, 168, 76, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
}

// ── Asset resolution ──────────────────────────────────────────────────────────
// Works in three contexts:
//   - Nuxt dev server        (process.cwd() = augur/)
//   - Production server      (import.meta.url → .output/server/utils/…)
//   - Standalone tsx script  (import.meta.url → augur/server/utils/…)
function resolvePublicAsset(...parts: string[]): string {
  const candidates = [
    // production: .output/server/utils/ → ../../ → .output/ → public/
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', ...parts),
    // dev / script: cwd is the augur/ project root
    join(process.cwd(), 'public', ...parts),
  ]
  const found = candidates.find(p => existsSync(p))
  if (!found) {
    throw new Error(`Asset not found: ${join(...parts)}. Tried:\n  ${candidates.join('\n  ')}`)
  }
  return found
}

let fontsRegistered = false

function ensureFonts(): void {
  if (fontsRegistered) return
  registerFont(resolvePublicAsset('fonts', 'Inter-Light.ttf'),           { family: 'Inter',     weight: '300', style: 'normal' })
  registerFont(resolvePublicAsset('fonts', 'Inter-Regular.ttf'),         { family: 'Inter',     weight: '400', style: 'normal' })
  registerFont(resolvePublicAsset('fonts', 'Inter-Medium.ttf'),          { family: 'Inter',     weight: '500', style: 'normal' })
  registerFont(resolvePublicAsset('fonts', 'Inter-Italic.ttf'),          { family: 'Inter',     weight: '400', style: 'italic' })
  registerFont(resolvePublicAsset('fonts', 'Cormorant-Light.ttf'),       { family: 'Cormorant', weight: '300', style: 'normal' })
  registerFont(resolvePublicAsset('fonts', 'Cormorant-LightItalic.ttf'), { family: 'Cormorant', weight: '300', style: 'italic' })
  registerFont(resolvePublicAsset('fonts', 'Fraunces-Light.ttf'),        { family: 'Fraunces',  weight: '300', style: 'normal' })
  registerFont(resolvePublicAsset('fonts', 'Fraunces-LightItalic.ttf'),  { family: 'Fraunces',  weight: '300', style: 'italic' })
  fontsRegistered = true
}

// Returns the bottom y of the last drawn line
function drawWrappedText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
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
  return currentY
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface CompatCardData {
  firstName: string
  partnerName: string
  compatibilityScore: number
  compatibilityTitle: string
  challengeContent: string
}

export async function renderCompatibilityCard(data: CompatCardData): Promise<Buffer> {
  ensureFonts()

  const { firstName, partnerName, compatibilityScore, compatibilityTitle, challengeContent } = data

  const width  = 1080
  const height = 1920
  const canvas = createCanvas(width, height)
  const ctx    = canvas.getContext('2d')
  const cx     = width / 2  // 540

  // ── 1. BACKGROUND — parchment bone ─────────────────────────────────────────
  ctx.fillStyle = BONE
  ctx.fillRect(0, 0, width, height)

  // Deterministic paper grain — no Math.random so every render is identical
  ctx.fillStyle = 'rgba(26,22,18,0.03)'
  for (let i = 0; i < 800; i++) {
    const gx = (i * 137.508) % width
    const gy = (i * 97.632 + i * i * 0.00031) % height
    const gr = (i % 3 === 0) ? 1.5 : (i % 3 === 1 ? 1.0 : 0.6)
    ctx.beginPath()
    ctx.arc(gx, gy, gr, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 2. WORDMARK ─────────────────────────────────────────────────────────────
  ctx.font      = '500 28px Inter'
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.fillText('O M E N O R A', cx, 90)

  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth   = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - 100, 112)
  ctx.lineTo(cx + 100, 112)
  ctx.stroke()

  // ── 3. EYEBROW LABEL ────────────────────────────────────────────────────────
  ctx.font      = '400 22px Inter'
  ctx.fillStyle = INK_FAINT
  ctx.textAlign = 'center'
  ctx.fillText('DESTINY COMPATIBILITY', cx, 168)

  // ── 4. SYMBOL — Love & Relationship Patterns (tinted to ink) ────────────────
  const symbolSize = 240
  const symbolX    = cx - symbolSize / 2
  const symbolY    = 220

  const symbolImg = await loadImage(resolvePublicAsset('symbols', 'Love & Relationship Patterns.png'))

  const offCanvas = createCanvas(symbolSize, symbolSize)
  const offCtx    = offCanvas.getContext('2d')
  offCtx.clearRect(0, 0, symbolSize, symbolSize)
  offCtx.drawImage(symbolImg, 0, 0, symbolSize, symbolSize)
  offCtx.globalCompositeOperation = 'source-in'
  offCtx.fillStyle = INK_MID
  offCtx.fillRect(0, 0, symbolSize, symbolSize)

  ctx.drawImage(offCanvas, symbolX, symbolY)

  // ── 5. NAMES ─────────────────────────────────────────────────────────────────
  const name1     = firstName   || 'You'
  const name2     = partnerName || 'Them'
  const namesText = `${name1} & ${name2}`

  ctx.font      = 'italic 300 76px Fraunces'
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  if (ctx.measureText(namesText).width > 920) {
    ctx.font = 'italic 300 54px Fraunces'
  }
  ctx.fillText(namesText, cx, 540)

  // ── 6. THIN RULE ─────────────────────────────────────────────────────────────
  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth   = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - 180, 590)
  ctx.lineTo(cx + 180, 590)
  ctx.stroke()

  // ── 7. SCORE ─────────────────────────────────────────────────────────────────
  ctx.font      = 'italic 300 130px Cormorant'
  ctx.fillStyle = scoreColor(compatibilityScore)
  ctx.textAlign = 'center'
  ctx.fillText(`${compatibilityScore}%`, cx, 730)

  // ── 8. COMPATIBILITY TITLE ───────────────────────────────────────────────────
  ctx.font      = 'italic 300 38px Fraunces'
  ctx.fillStyle = INK_MID
  ctx.textAlign = 'center'
  const titleBottom = drawWrappedText(ctx, compatibilityTitle, cx, 820, 840, 52)

  // ── 9. DIVIDER ───────────────────────────────────────────────────────────────
  const divY = titleBottom + 60
  ctx.strokeStyle = INK_GHOST
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(cx - 80, divY)
  ctx.lineTo(cx + 80, divY)
  ctx.stroke()

  // ── 10. CHALLENGE BOX (optional — always present for real readings) ──────────
  if (challengeContent) {
    const boxX = 80
    const boxW = width - 160  // 920
    const boxY = divY + 40
    const boxH = 360
    const boxR = 20

    ctx.beginPath()
    ctx.moveTo(boxX + boxR, boxY)
    ctx.lineTo(boxX + boxW - boxR, boxY)
    ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + boxR)
    ctx.lineTo(boxX + boxW, boxY + boxH - boxR)
    ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - boxR, boxY + boxH)
    ctx.lineTo(boxX + boxR, boxY + boxH)
    ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - boxR)
    ctx.lineTo(boxX, boxY + boxR)
    ctx.quadraticCurveTo(boxX, boxY, boxX + boxR, boxY)
    ctx.closePath()
    ctx.fillStyle = 'rgba(26,22,18,0.03)'
    ctx.fill()
    ctx.strokeStyle = INK_GHOST
    ctx.lineWidth   = 1
    ctx.stroke()

    ctx.font      = '500 20px Inter'
    ctx.fillStyle = INK_FAINT
    ctx.textAlign = 'center'
    ctx.fillText('THE TENSION YOU MUST NAVIGATE', cx, boxY + 46)

    ctx.strokeStyle = INK_GHOST
    ctx.lineWidth   = 0.5
    ctx.beginPath()
    ctx.moveTo(cx - 60, boxY + 62)
    ctx.lineTo(cx + 60, boxY + 62)
    ctx.stroke()

    ctx.font      = 'italic 300 34px Cormorant'
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    drawWrappedText(ctx, `"${challengeContent}"`, cx, boxY + 112, 860, 50)
  }

  // ── 11. YEAR TAG (subtle, mid-card anchor) ────────────────────────────────
  ctx.font      = '400 24px Inter'
  ctx.fillStyle = 'rgba(26,22,18,0.18)'
  ctx.textAlign = 'center'
  ctx.fillText('2026 DESTINY COMPATIBILITY', cx, 1500)

  // ── 12. FOOTER ──────────────────────────────────────────────────────────────
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
  ctx.fillStyle = 'rgba(26,22,18,0.30)'
  ctx.fillText('omenora.com', cx, 1860)

  ctx.font      = '400 18px Inter'
  ctx.fillStyle = 'rgba(26,22,18,0.15)'
  ctx.fillText('Discover yours', cx, 1896)

  return canvas.toBuffer('image/png') as Buffer
}
