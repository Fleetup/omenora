import { createCanvas, registerFont } from 'canvas'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

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
  registerFont(resolveFontPath('Inter-Light.ttf'),   { family: 'Inter', weight: '300', style: 'normal' })
  registerFont(resolveFontPath('Inter-Regular.ttf'), { family: 'Inter', weight: '400', style: 'normal' })
  registerFont(resolveFontPath('Inter-Medium.ttf'),  { family: 'Inter', weight: '500', style: 'normal' })
  registerFont(resolveFontPath('Inter-Italic.ttf'),  { family: 'Inter', weight: '400', style: 'italic' })
  fontsRegistered = true
}

function scoreColor(score: number): string {
  if (score >= 80) return 'rgba(140, 110, 255, 0.9)'
  if (score >= 60) return 'rgba(201, 168, 76, 0.9)'
  return 'rgba(180, 80, 80, 0.9)'
}

function wrapText(
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
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[n] + ' '
      currentY += lineHeight
    }
    else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), x, currentY)
  return currentY
}

export default defineEventHandler(async (event) => {
  ensureFonts()

  const body = await readBody(event)

  const firstName          = sanitizeString(body.firstName          ?? '', 50)
  const partnerName        = sanitizeString(body.partnerName        ?? '', 50)
  const compatibilityScore = Number(body.compatibilityScore)         || 0
  const compatibilityTitle = sanitizeString(body.compatibilityTitle ?? '', 120)
  const challengeContent   = sanitizeString(body.challengeContent   ?? '', 500)

  assertInput(
    Number.isInteger(compatibilityScore) && compatibilityScore >= 0 && compatibilityScore <= 100,
    'compatibilityScore must be 0–100',
  )

  const width  = 1080
  const height = 1920
  const canvas = createCanvas(width, height)
  const ctx    = canvas.getContext('2d')

  // ── BACKGROUND ──────────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#0d0b1e')
  bgGrad.addColorStop(0.5, '#0a0a0f')
  bgGrad.addColorStop(1, '#0d0b1e')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // ── STAR FIELD ───────────────────────────────────────────────────────────────
  const stars = [
    { x: 0.12, y: 0.06, s: 2 }, { x: 0.78, y: 0.04, s: 1.5 },
    { x: 0.38, y: 0.10, s: 2.5 }, { x: 0.88, y: 0.17, s: 1.5 },
    { x: 0.22, y: 0.21, s: 2 }, { x: 0.62, y: 0.14, s: 1 },
    { x: 0.92, y: 0.29, s: 2 }, { x: 0.08, y: 0.34, s: 1.5 },
    { x: 0.50, y: 0.07, s: 1 }, { x: 0.72, y: 0.24, s: 2.5 },
    { x: 0.28, y: 0.42, s: 1 }, { x: 0.85, y: 0.58, s: 1.5 },
    { x: 0.14, y: 0.66, s: 2 }, { x: 0.55, y: 0.74, s: 1 },
    { x: 0.82, y: 0.82, s: 1.5 }, { x: 0.18, y: 0.88, s: 2 },
    { x: 0.66, y: 0.92, s: 1 }, { x: 0.42, y: 0.96, s: 1.5 },
  ]
  stars.forEach(star => {
    ctx.beginPath()
    ctx.arc(star.x * width, star.y * height, star.s, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + Math.random() * 0.35})`
    ctx.fill()
  })

  // ── TOP GLOW ─────────────────────────────────────────────────────────────────
  const topGlow = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, 620)
  topGlow.addColorStop(0, 'rgba(140, 110, 255, 0.14)')
  topGlow.addColorStop(1, 'rgba(140, 110, 255, 0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, width, height)

  // ── BRAND ────────────────────────────────────────────────────────────────────
  ctx.font = '500 32px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.textAlign = 'center'
  ctx.fillText('OMENORA', width / 2, 90)

  ctx.beginPath()
  ctx.moveTo(width / 2 - 60, 110)
  ctx.lineTo(width / 2 + 60, 110)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.2)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // ── SECTION LABEL ────────────────────────────────────────────────────────────
  ctx.font = '400 26px Inter'
  ctx.fillStyle = 'rgba(140, 110, 255, 0.6)'
  ctx.textAlign = 'center'
  ctx.fillText('DESTINY COMPATIBILITY', width / 2, 200)

  // ── NAMES ────────────────────────────────────────────────────────────────────
  const name1 = firstName   || 'You'
  const name2 = partnerName || 'Them'
  const namesText = `${name1} & ${name2}`

  ctx.font = '500 72px Inter'
  ctx.fillStyle = 'rgba(230, 220, 255, 0.95)'
  ctx.textAlign = 'center'

  // Scale font down if names are long
  const nameMetrics = ctx.measureText(namesText)
  if (nameMetrics.width > 900) {
    ctx.font = '500 52px Inter'
  }
  ctx.fillText(namesText, width / 2, 320)

  // ── SCORE CIRCLE ─────────────────────────────────────────────────────────────
  const cx = width / 2
  const cy = 570
  const r  = 180

  // Outer ring glow
  const circleGlow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.5)
  circleGlow.addColorStop(0, 'rgba(140, 110, 255, 0.08)')
  circleGlow.addColorStop(1, 'rgba(140, 110, 255, 0)')
  ctx.fillStyle = circleGlow
  ctx.beginPath()
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Outer decorative ring
  ctx.beginPath()
  ctx.arc(cx, cy, r + 20, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Main circle border
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Circle fill
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(140, 110, 255, 0.05)'
  ctx.fill()

  // Score number
  ctx.font = '500 120px Inter'
  ctx.fillStyle = scoreColor(compatibilityScore)
  ctx.textAlign = 'center'
  ctx.fillText(`${compatibilityScore}%`, cx, cy + 42)

  // ── COMPATIBILITY TITLE ───────────────────────────────────────────────────────
  ctx.font = 'italic 400 42px Inter'
  ctx.fillStyle = 'rgba(200, 180, 255, 0.85)'
  ctx.textAlign = 'center'
  const titleY = cy + r + 80
  wrapText(ctx, `"${compatibilityTitle}"`, width / 2, titleY, 880, 56)

  // ── DIVIDER ───────────────────────────────────────────────────────────────────
  const divY = titleY + 100
  ctx.beginPath()
  ctx.moveTo(width / 2 - 80, divY)
  ctx.lineTo(width / 2 + 80, divY)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  ctx.stroke()

  // ── CHALLENGE SECTION (the hook — always revealed in preview) ─────────────────
  if (challengeContent) {
    const boxX = 80
    const boxW = width - 160
    const boxY = divY + 40
    const boxH = 380
    const boxR = 24

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
    ctx.fillStyle = 'rgba(140, 110, 255, 0.06)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(140, 110, 255, 0.18)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = '500 22px Inter'
    ctx.fillStyle = 'rgba(140, 110, 255, 0.6)'
    ctx.textAlign = 'center'
    ctx.fillText('THE TENSION YOU MUST NAVIGATE', width / 2, boxY + 44)

    ctx.font = '400 32px Inter'
    ctx.fillStyle = 'rgba(200, 180, 255, 0.80)'
    ctx.textAlign = 'center'
    wrapText(ctx, challengeContent, width / 2, boxY + 100, 860, 50)
  }

  // ── BOTTOM SECTION ────────────────────────────────────────────────────────────
  ctx.font = '400 28px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.textAlign = 'center'
  ctx.fillText('2026 DESTINY COMPATIBILITY', width / 2, 1500)

  const bottomGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, 500)
  bottomGlow.addColorStop(0, 'rgba(140, 110, 255, 0.10)')
  bottomGlow.addColorStop(1, 'rgba(140, 110, 255, 0)')
  ctx.fillStyle = bottomGlow
  ctx.fillRect(0, height - 500, width, 500)

  ctx.beginPath()
  ctx.moveTo(width / 2 - 40, 1780)
  ctx.lineTo(width / 2 + 40, 1780)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.15)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  ctx.font = '400 28px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.textAlign = 'center'
  ctx.fillText('omenora.com', width / 2, 1840)

  ctx.font = '400 22px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillText('Discover yours', width / 2, 1878)

  // ── RETURN IMAGE ──────────────────────────────────────────────────────────────
  const buffer = canvas.toBuffer('image/png')

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-compatibility-${firstName || 'reading'}.png"`,
  )

  return buffer
})
