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
  if (!found) throw new Error(`Font file not found: ${filename}`)
  return found
}

let calendarFontsRegistered = false
function ensureCalendarFonts() {
  if (calendarFontsRegistered) return
  registerFont(resolveFontPath('Inter-Light.ttf'),   { family: 'Inter', weight: '300', style: 'normal' })
  registerFont(resolveFontPath('Inter-Regular.ttf'), { family: 'Inter', weight: '400', style: 'normal' })
  registerFont(resolveFontPath('Inter-Medium.ttf'),  { family: 'Inter', weight: '500', style: 'normal' })
  registerFont(resolveFontPath('Inter-Italic.ttf'),  { family: 'Inter', weight: '400', style: 'italic' })
  calendarFontsRegistered = true
}

export default defineEventHandler(async (event) => {
  ensureCalendarFonts()

  const body = await readBody(event)
  const { firstName, calendar } = body

  const width = 1080
  const height = 1920
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#0d0b1e')
  bg.addColorStop(0.5, '#0a0a0f')
  bg.addColorStop(1, '#0d0b1e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const stars = [
    { x: 0.12, y: 0.04 }, { x: 0.78, y: 0.08 }, { x: 0.35, y: 0.06 },
    { x: 0.90, y: 0.15 }, { x: 0.20, y: 0.18 }, { x: 0.55, y: 0.40 },
    { x: 0.92, y: 0.50 }, { x: 0.18, y: 0.60 }, { x: 0.70, y: 0.65 },
    { x: 0.40, y: 0.75 }, { x: 0.88, y: 0.80 }, { x: 0.25, y: 0.88 },
  ]
  stars.forEach(s => {
    ctx.beginPath()
    ctx.arc(s.x * width, s.y * height, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()
  })

  ctx.font = '400 28px Inter'
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.textAlign = 'center'
  ctx.fillText('OMENORA', width / 2, 70)

  ctx.font = '500 52px Inter'
  ctx.fillStyle = 'rgba(230,220,255,0.95)'
  ctx.fillText(`${firstName}'s`, width / 2, 155)

  ctx.font = '500 40px Inter'
  ctx.fillStyle = 'rgba(200,180,255,0.8)'
  ctx.fillText('2026 Lucky Timing', width / 2, 210)

  ctx.font = 'italic 400 26px Inter'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  const theme = (calendar.overallTheme || '').slice(0, 60)
  ctx.fillText(theme, width / 2, 265)

  const months = calendar.months || []
  const barStartY = 310
  const rowH = 96
  const barLeft = 80
  const labelW = 140
  const barMaxW = width - barLeft - labelW - 60

  months.forEach((month: any, i: number) => {
    const y = barStartY + i * rowH
    const energy = month.energyLevel || 60
    const fillW = (energy / 100) * barMaxW
    const color = energy >= 75
      ? 'rgba(140,110,255,0.8)'
      : energy >= 55
        ? 'rgba(200,180,100,0.7)'
        : 'rgba(180,100,100,0.7)'

    ctx.font = '400 22px Inter'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'left'
    ctx.fillText(
      (month.month || '').slice(0, 3).toUpperCase(),
      barLeft, y + 28
    )

    ctx.beginPath()
    ctx.roundRect(barLeft + labelW, y + 12, barMaxW, 18, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fill()

    ctx.beginPath()
    ctx.roundRect(barLeft + labelW, y + 12, fillW, 18, 4)
    ctx.fillStyle = color
    ctx.fill()

    ctx.font = '500 20px Inter'
    ctx.fillStyle = color
    ctx.textAlign = 'right'
    ctx.fillText(String(energy), width - 60, y + 28)

    ctx.font = '400 17px Inter'
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.textAlign = 'left'
    ctx.fillText(
      (month.theme || '').slice(0, 40),
      barLeft + labelW, y + 50
    )

    ctx.beginPath()
    ctx.moveTo(barLeft, y + rowH - 4)
    ctx.lineTo(width - barLeft, y + rowH - 4)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  })

  const footerY = barStartY + 12 * rowH + 30
  ctx.font = '400 24px Inter'
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.textAlign = 'center'
  ctx.fillText('omenora.com', width / 2, footerY)

  const buffer = canvas.toBuffer('image/png')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-calendar-${firstName || 'report'}.png"`
  )
  return buffer
})
