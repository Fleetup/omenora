import { createCanvas, registerFont } from 'canvas'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

// Resolve the fonts directory across environments:
//   dev  → <project-root>/public/fonts/
//   prod → .output/public/fonts/  (sibling of .output/server/ where this bundle runs)
function resolveFontPath(filename: string): string {
  const candidates = [
    // Production: font is at .output/public/fonts/ — one level up from .output/server/
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fonts', filename),
    // Dev fallback: project root public/fonts/
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

export default defineEventHandler(async (event) => {
  ensureFonts()

  const body = await readBody(event)
  const {
    archetypeName,
    archetypeSymbol,
    element,
    lifePathNumber,
    powerTraits,
    affirmation,
    firstName
  } = body

  const width = 1080
  const height = 1920
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // --- BACKGROUND ---
  const bgGradient = ctx.createLinearGradient(0, 0, width, height)
  bgGradient.addColorStop(0, '#0d0b1e')
  bgGradient.addColorStop(0.5, '#0a0a0f')
  bgGradient.addColorStop(1, '#0d0b1e')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // --- STAR FIELD ---
  const stars = [
    { x: 0.15, y: 0.08, size: 2 },
    { x: 0.75, y: 0.05, size: 1.5 },
    { x: 0.40, y: 0.12, size: 2.5 },
    { x: 0.85, y: 0.18, size: 1.5 },
    { x: 0.25, y: 0.22, size: 2 },
    { x: 0.60, y: 0.15, size: 1 },
    { x: 0.90, y: 0.30, size: 2 },
    { x: 0.10, y: 0.35, size: 1.5 },
    { x: 0.50, y: 0.08, size: 1 },
    { x: 0.70, y: 0.25, size: 2.5 },
    { x: 0.30, y: 0.40, size: 1 },
    { x: 0.88, y: 0.55, size: 1.5 },
    { x: 0.15, y: 0.65, size: 2 },
    { x: 0.55, y: 0.72, size: 1 },
    { x: 0.80, y: 0.80, size: 1.5 },
    { x: 0.20, y: 0.85, size: 2 },
    { x: 0.65, y: 0.90, size: 1 },
    { x: 0.40, y: 0.95, size: 1.5 },
  ]

  stars.forEach(star => {
    ctx.beginPath()
    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`
    ctx.fill()
  })

  // --- TOP SUBTLE GLOW ---
  const topGlow = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, 600)
  topGlow.addColorStop(0, 'rgba(140, 110, 255, 0.12)')
  topGlow.addColorStop(1, 'rgba(140, 110, 255, 0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, width, height)

  // --- BRAND NAME TOP ---
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

  // --- ARCHETYPE LABEL ---
  ctx.font = '400 26px Inter'
  ctx.fillStyle = 'rgba(140, 110, 255, 0.6)'
  ctx.textAlign = 'center'
  ctx.fillText('YOUR DESTINY ARCHETYPE', width / 2, 220)

  // --- SYMBOL ---
  ctx.font = '500 120px Inter'
  ctx.fillStyle = 'rgba(200, 180, 255, 0.5)'
  ctx.textAlign = 'center'
  ctx.fillText(archetypeSymbol || '◆', width / 2, 440)

  ctx.beginPath()
  ctx.arc(width / 2, 390, 130, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(width / 2, 390, 150, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.08)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // --- ARCHETYPE NAME ---
  const nameParts = (archetypeName || 'The Alchemist').replace('The ', '')

  ctx.font = '400 48px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.textAlign = 'center'
  ctx.fillText('The', width / 2, 580)

  ctx.font = '500 88px Inter'
  ctx.fillStyle = 'rgba(230, 220, 255, 0.95)'
  ctx.textAlign = 'center'
  ctx.fillText(nameParts, width / 2, 670)

  // --- ELEMENT & LIFE PATH ---
  ctx.font = '400 32px Inter'
  ctx.fillStyle = 'rgba(140, 110, 255, 0.55)'
  ctx.textAlign = 'center'
  ctx.fillText(`${element || 'Earth'} · Life Path ${lifePathNumber || 7}`, width / 2, 730)

  // --- DIVIDER ---
  ctx.beginPath()
  ctx.moveTo(width / 2 - 80, 775)
  ctx.lineTo(width / 2 + 80, 775)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  ctx.stroke()

  // --- POWER TRAITS ---
  const traits: string[] = powerTraits || ['Analytical', 'Driven', 'Strategic']
  const traitY = 870

  ctx.font = '400 28px Inter'
  const traitPadding = 32
  const traitGap = 24
  const traitWidths = traits.map((t: string) => ctx.measureText(t).width + traitPadding * 2)
  const totalTraitWidth = traitWidths.reduce((a: number, b: number) => a + b, 0)
    + traitGap * (traits.length - 1)

  let traitX = (width - totalTraitWidth) / 2

  traits.forEach((trait: string, i: number) => {
    const tw = traitWidths[i] ?? 0
    const th = 56
    const ty = traitY - th / 2
    const r = 28

    ctx.beginPath()
    ctx.moveTo(traitX + r, ty)
    ctx.lineTo(traitX + tw - r, ty)
    ctx.quadraticCurveTo(traitX + tw, ty, traitX + tw, ty + r)
    ctx.lineTo(traitX + tw, ty + th - r)
    ctx.quadraticCurveTo(traitX + tw, ty + th, traitX + tw - r, ty + th)
    ctx.lineTo(traitX + r, ty + th)
    ctx.quadraticCurveTo(traitX, ty + th, traitX, ty + th - r)
    ctx.lineTo(traitX, ty + r)
    ctx.quadraticCurveTo(traitX, ty, traitX + r, ty)
    ctx.closePath()
    ctx.fillStyle = 'rgba(140, 110, 255, 0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(140, 110, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = '400 28px Inter'
    ctx.fillStyle = 'rgba(200, 180, 255, 0.75)'
    ctx.textAlign = 'left'
    ctx.fillText(trait, traitX + traitPadding, traitY + 10)

    traitX += tw + traitGap
  })

  // --- AFFIRMATION SECTION ---
  const affirmY = 1050
  const boxX = 80
  const boxW = width - 160
  const boxH = 300
  const boxR = 24

  ctx.beginPath()
  ctx.moveTo(boxX + boxR, affirmY - 20)
  ctx.lineTo(boxX + boxW - boxR, affirmY - 20)
  ctx.quadraticCurveTo(boxX + boxW, affirmY - 20, boxX + boxW, affirmY - 20 + boxR)
  ctx.lineTo(boxX + boxW, affirmY - 20 + boxH - boxR)
  ctx.quadraticCurveTo(boxX + boxW, affirmY - 20 + boxH, boxX + boxW - boxR, affirmY - 20 + boxH)
  ctx.lineTo(boxX + boxR, affirmY - 20 + boxH)
  ctx.quadraticCurveTo(boxX, affirmY - 20 + boxH, boxX, affirmY - 20 + boxH - boxR)
  ctx.lineTo(boxX, affirmY - 20 + boxR)
  ctx.quadraticCurveTo(boxX, affirmY - 20, boxX + boxR, affirmY - 20)
  ctx.closePath()
  ctx.fillStyle = 'rgba(140, 110, 255, 0.06)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(140, 110, 255, 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.font = '400 24px Inter'
  ctx.fillStyle = 'rgba(140, 110, 255, 0.5)'
  ctx.textAlign = 'center'
  ctx.fillText('YOUR POWER STATEMENT', width / 2, affirmY + 30)

  ctx.font = 'italic 400 36px Inter'
  ctx.fillStyle = 'rgba(200, 180, 255, 0.85)'
  ctx.textAlign = 'center'

  function wrapText(
    context: any,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = context.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY)
        line = words[n] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    context.fillText(line.trim(), x, currentY)
  }

  const affirmText = affirmation || 'I transform pressure into precision.'
  wrapText(ctx, `"${affirmText}"`, width / 2, affirmY + 100, 880, 52)

  // --- BOTTOM SECTION ---
  ctx.font = '400 28px Inter'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.textAlign = 'center'
  ctx.fillText('2026 DESTINY REVEALED', width / 2, 1500)

  const bottomGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, 500)
  bottomGlow.addColorStop(0, 'rgba(140, 110, 255, 0.1)')
  bottomGlow.addColorStop(1, 'rgba(140, 110, 255, 0)')
  ctx.fillStyle = bottomGlow
  ctx.fillRect(0, height - 500, width, 500)

  // --- BOTTOM BRANDING ---
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

  // --- RETURN IMAGE ---
  const buffer = canvas.toBuffer('image/png')

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-destiny-${firstName || 'report'}.png"`
  )

  return buffer
})
