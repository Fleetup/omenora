import PDFDocument from 'pdfkit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const firstName = sanitizeString(body.firstName, 50)
  const language  = sanitizeString(body.language || 'en', 5)
  const calendar  = body.calendar && typeof body.calendar === 'object' ? body.calendar : null

  assertInput(!!firstName, 'firstName is required')
  assertInput(calendar !== null, 'calendar is required')

  const calPdfLabels: Record<string, Record<string, string>> = {
    en: { peak: 'PEAK', caution: 'CAUTION', luckyDays: 'Lucky days:' },
    es: { peak: 'PICO', caution: 'PRECAUCIÓN', luckyDays: 'Días de suerte:' },
    pt: { peak: 'PICO', caution: 'PRECAUÇÃO', luckyDays: 'Dias de sorte:' },
    hi: { peak: 'शिखर', caution: 'सावधानी', luckyDays: 'भाग्यशाली दिन:' },
    ko: { peak: '최성기', caution: '주의', luckyDays: '행운의 날:' },
    zh: { peak: '高峰', caution: '警示', luckyDays: '吉日:' },
  }
  const CL = calPdfLabels[language as string] ?? calPdfLabels['en']!

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `OMENORA — ${firstName}'s 2026 Destiny Calendar`,
      Author: 'OMENORA AI',
    },
  })

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const W = 595
  const H = 842
  const ML = 56
  const MR = 56
  const CW = W - ML - MR

  // Color palette
  const BG       = '#050410'
  const AMBER    = '#c9a84c'
  const AMBER_DIM = '#7a6530'
  const PURPLE   = '#8c6eff'
  const RED_MUTED = '#8a4444'
  const TEXT_HI  = '#ede8ff'
  const TEXT_MID = '#6b6880'
  const TEXT_DIM = '#2e2c3a'
  const RULE     = '#131220'

  const energyHue = (e: number) => e >= 75 ? AMBER : e >= 55 ? PURPLE : RED_MUTED

  doc.on('pageAdded', () => {
    doc.rect(0, 0, W, H).fill(BG)
    doc.font('Helvetica').fontSize(7).fillColor(TEXT_DIM)
      .text('OMENORA  ·  AI DESTINY ANALYSIS', ML, 18, { width: CW, align: 'center' })
  })

  doc.rect(0, 0, W, H).fill(BG)

  let y = 52

  // ── Wordmark ──
  doc.font('Helvetica').fontSize(7).fillColor(TEXT_DIM)
    .text('OMENORA  ·  AI DESTINY ANALYSIS', ML, y, { width: CW, align: 'center' })
  y += 20

  // ── Hero title ──
  const calTitle = `${firstName}'s 2026 Destiny Calendar`
  doc.font('Helvetica-Bold').fontSize(26).fillColor(TEXT_HI)
    .text(calTitle, ML, y, { width: CW, align: 'center' })
  y += doc.heightOfString(calTitle, { width: CW }) + 10

  // ── Overall theme ──
  const theme = calendar.overallTheme || ''
  doc.font('Helvetica-Oblique').fontSize(10).fillColor(TEXT_MID)
    .text(theme, ML, y, { width: CW, align: 'center' })
  y += doc.heightOfString(theme, { width: CW }) + 20

  // ── Peak / Caution line ──
  doc.font('Helvetica').fontSize(9).fillColor(AMBER_DIM)
    .text((CL['peak'] || 'PEAK') + '  ' + (calendar.peakMonths || []).join('  ·  '), ML, y, { width: CW * 0.5 })
  doc.font('Helvetica').fontSize(9).fillColor(RED_MUTED)
    .text((CL['caution'] || 'CAUTION') + '  ' + (calendar.cautionMonths || []).join('  ·  '), ML + CW * 0.5, y, { width: CW * 0.5, align: 'right' })
  y += 18

  // ── Divider ──
  doc.moveTo(ML, y).lineTo(W - MR, y).strokeColor(RULE).lineWidth(0.5).stroke()
  y += 22

  const months = calendar.months || []
  months.forEach((month: any) => {
    const energy = month.energyLevel || 60
    const eColor = energyHue(energy)

    doc.font('Helvetica-Oblique').fontSize(9)
    const themeH = doc.heightOfString(month.theme || '', { width: CW })
    doc.font('Helvetica').fontSize(10)
    const loveH = doc.heightOfString(month.love || '', { width: CW - 60 })
    const moneyH = doc.heightOfString(month.money || '', { width: CW - 60 })
    const careerH = doc.heightOfString(month.career || '', { width: CW - 60 })
    doc.font('Helvetica-Oblique').fontSize(8)
    const warnH = month.warning ? doc.heightOfString(month.warning, { width: CW }) + 8 : 0
    const luckyH = 14
    const blockH = 20 + (themeH + 4) + 3 + (loveH + 3) + (moneyH + 3) + (careerH + 10) + warnH + luckyH + 18

    if (y + blockH > H - 30) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 44
    }

    // Month name + energy score on same baseline
    doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT_HI)
      .text(month.month || '', ML, y)
    doc.font('Helvetica').fontSize(11).fillColor(eColor)
      .text(`${energy}`, ML, y, { width: CW, align: 'right' })
    y += 20

    // Theme
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(TEXT_MID)
      .text(month.theme || '', ML, y)
    y += themeH + 4

    // Energy bar (slim, 2px)
    doc.rect(ML, y, CW, 1).fillColor(RULE).fill()
    doc.rect(ML, y, (energy / 100) * CW, 1).fillColor(eColor).fill()
    y += 11

    // Insights
    doc.font('Helvetica').fontSize(10).fillColor('#5a5868')
    doc.text('Love:', ML, y).fillColor(TEXT_MID).text(month.love || '', ML + 40, y, { width: CW - 40 })
    y += loveH + 3
    doc.fillColor('#5a5868').text('Money:', ML, y).fillColor(TEXT_MID).text(month.money || '', ML + 46, y, { width: CW - 46 })
    y += moneyH + 3
    doc.fillColor('#5a5868').text('Career:', ML, y).fillColor(TEXT_MID).text(month.career || '', ML + 46, y, { width: CW - 46 })
    y += careerH + 10

    if (month.warning) {
      doc.font('Helvetica-Oblique').fontSize(8).fillColor(RED_MUTED)
        .text(`! ${month.warning}`, ML, y, { width: CW })
      y += warnH
    }

    // Lucky days in amber
    doc.font('Helvetica').fontSize(8).fillColor(AMBER_DIM)
      .text(`${CL['luckyDays'] || 'Lucky days:'} ${(month.luckyDays || []).join(', ')}`, ML, y)
    y += luckyH

    doc.moveTo(ML, y).lineTo(W - MR, y).strokeColor(RULE).lineWidth(0.5).stroke()
    y += 18
  })

  // Footer
  if (y + 20 < H - 10) {
    doc.font('Helvetica').fontSize(7).fillColor(TEXT_DIM)
      .text('omenora.com', ML, y + 8, { width: CW, align: 'center' })
  }

  doc.end()
  await new Promise<void>((resolve) => doc.on('end', resolve))

  const buffer = Buffer.concat(chunks)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-calendar-${firstName || 'report'}.pdf"`
  )

  return buffer
})
