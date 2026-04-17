import { createCanvas, registerFont, loadImage } from 'canvas'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

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

/**
 * Draws each archetype symbol as native canvas paths.
 * Maps the archetype's Unicode symbol to its corresponding geometric shape.
 * This is font-independent — identical on dev, Railway Linux, and any OS.
 *
 * @param ctx   Canvas 2D context
 * @param symbol The archetype symbol character (from ARCHETYPES array)
 * @param cx    Center X
 * @param cy    Center Y
 * @param r     Radius / size reference
 */
function drawArchetypeSymbol(
  ctx: any,
  symbol: string,
  cx: number,
  cy: number,
  r: number,
): void {
  const color = 'rgba(200, 180, 255, 0.55)'
  const strokeW = r * 0.055

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = strokeW
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (symbol) {
    // ● phoenix — filled circle
    case '●': {
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    // ◆ architect — filled diamond
    case '◆': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.7, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r * 0.7, cy)
      ctx.closePath()
      ctx.fill()
      break
    }
    // ▲ storm — filled upward triangle
    case '▲': {
      const h = r * 1.1
      ctx.beginPath()
      ctx.moveTo(cx, cy - h * 0.72)
      ctx.lineTo(cx + h * 0.84, cy + h * 0.48)
      ctx.lineTo(cx - h * 0.84, cy + h * 0.48)
      ctx.closePath()
      ctx.fill()
      break
    }
    // ◇ lighthouse — open diamond
    case '◇': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.7, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r * 0.7, cy)
      ctx.closePath()
      ctx.stroke()
      break
    }
    // ○ wanderer — open circle
    case '○': {
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    // ⬡ alchemist — hexagon (flat-top)
    case '⬡': {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const px = cx + r * 0.9 * Math.cos(angle)
        const py = cy + r * 0.9 * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
      break
    }
    // □ guardian — open square
    case '□': {
      const s = r * 1.1
      ctx.beginPath()
      ctx.rect(cx - s * 0.5, cy - s * 0.5, s, s)
      ctx.stroke()
      break
    }
    // ⬟ visionary — rotated square (diamond-like but wider)
    case '⬟': {
      const s = r * 0.88
      ctx.beginPath()
      ctx.moveTo(cx, cy - s)
      ctx.lineTo(cx + s, cy)
      ctx.lineTo(cx, cy + s)
      ctx.lineTo(cx - s, cy)
      ctx.closePath()
      ctx.stroke()
      break
    }
    // ◉ mirror — filled circle with outer ring
    case '◉': {
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    // ✦ catalyst — 4-pointed star
    case '✦': {
      const pts = 4
      const outer = r * 0.9
      const inner = r * 0.3
      ctx.beginPath()
      for (let i = 0; i < pts * 2; i++) {
        const angle = (Math.PI / pts) * i - Math.PI / 2
        const rad = i % 2 === 0 ? outer : inner
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    // ▽ sage — open downward triangle
    case '▽': {
      const h = r * 1.1
      ctx.beginPath()
      ctx.moveTo(cx - h * 0.84, cy - h * 0.48)
      ctx.lineTo(cx + h * 0.84, cy - h * 0.48)
      ctx.lineTo(cx, cy + h * 0.72)
      ctx.closePath()
      ctx.stroke()
      break
    }
    // ★ wildfire — 5-pointed filled star
    case '★': {
      const pts = 5
      const outer = r * 0.9
      const inner = r * 0.38
      ctx.beginPath()
      for (let i = 0; i < pts * 2; i++) {
        const angle = (Math.PI / pts) * i - Math.PI / 2
        const rad = i % 2 === 0 ? outer : inner
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    // fallback — filled circle
    default: {
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }

  ctx.restore()
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

  // --- SYMBOL (gold medallion PNG) ---
  const archetypeId = SYMBOL_TO_ID[archetypeSymbol] ?? 'phoenix'
  const symbolImg = await loadImage(resolveSymbolPath(archetypeId))
  const symbolSize = 260
  ctx.drawImage(symbolImg, width / 2 - symbolSize / 2, 390 - symbolSize / 2, symbolSize, symbolSize)

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
