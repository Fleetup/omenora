import PDFDocument from 'pdfkit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { firstName, report, lifePathNumber, region, vedicData, baziData, tarotData, calendarData, bundlePurchased, language } = body

  const pdfLabels: Record<string, Record<string, string>> = {
    en: { vedic: 'VEDIC DESTINY READING', karmicMission: 'KARMIC MISSION', practice: '2026 Practice:', bazi: 'BAZI FOUR PILLARS READING', wealthLuck: '2026 WEALTH LUCK', luckyDirections: 'Lucky directions:', spiritual: 'SPIRITUAL DESTINY READING', loveDestiny: 'LOVE DESTINY', blessing: 'A BLESSING FOR YOU', protectiveCharm: 'Protective charm:', calendarLabel: 'YOUR 2026 DESTINY CALENDAR', luckyDays: 'Lucky days:' },
    es: { vedic: 'LECTURA VÉDICA DE DESTINO', karmicMission: 'MISIÓN KÁRMICA', practice: 'Práctica 2026:', bazi: 'LECTURA BAZI DE CUATRO PILARES', wealthLuck: 'SUERTE FINANCIERA 2026', luckyDirections: 'Direcciones favorables:', spiritual: 'LECTURA ESPIRITUAL DE DESTINO', loveDestiny: 'DESTINO AMOROSO', blessing: 'UNA BENDICIÓN PARA TI', protectiveCharm: 'Amuleto protector:', calendarLabel: 'TU CALENDARIO DE DESTINO 2026', luckyDays: 'Días de suerte:' },
    pt: { vedic: 'LEITURA VÉDICA DE DESTINO', karmicMission: 'MISSÃO KÁRMICA', practice: 'Prática 2026:', bazi: 'LEITURA BAZI DOS QUATRO PILARES', wealthLuck: 'SORTE FINANCEIRA 2026', luckyDirections: 'Direções favoráveis:', spiritual: 'LEITURA ESPIRITUAL DE DESTINO', loveDestiny: 'DESTINO AMOROSO', blessing: 'UMA BÊNÇÃO PARA VOCÊ', protectiveCharm: 'Amuleto protetor:', calendarLabel: 'SEU CALENDÁRIO DE DESTINO 2026', luckyDays: 'Dias de sorte:' },
    hi: { vedic: 'वैदिक नियति रीडिंग', karmicMission: 'कार्मिक मिशन', practice: '2026 अभ्यास:', bazi: 'बाड़ी चार स्तंभ रीडिंग', wealthLuck: '2026 धन भाग्य', luckyDirections: 'भाग्यशाली दिशाएं:', spiritual: 'आध्यात्मिक नियति रीडिंग', loveDestiny: 'प्रेम नियति', blessing: 'आपके लिए आशीर्वाद', protectiveCharm: 'रक्षात्मक तायऺत:', calendarLabel: 'आपका 2026 नियति कैलेंडर', luckyDays: 'भाग्यशाली दिन:' },
    ko: { vedic: '베다 운명 리딩', karmicMission: '카르마 사명', practice: '2026 수련:', bazi: '리 BaZi 사주 리딩', wealthLuck: '2026 재물 운', luckyDirections: '행운의 방향:', spiritual: '영적 운명 리딩', loveDestiny: '사랑의 운명', blessing: '당신을 위한 축복', protectiveCharm: '보호 부적:', calendarLabel: '당신의 2026 운명 캘린더', luckyDays: '행운의 날:' },
    zh: { vedic: '厄波奇命运解读', karmicMission: '因果使命', practice: '2026年练习:', bazi: '八字四柱解读', wealthLuck: '2026财运', luckyDirections: '吉利方位:', spiritual: '灵性命运解读', loveDestiny: '爱情命运', blessing: '给你的祝福', protectiveCharm: '护身符:', calendarLabel: '你的2026年命运日历', luckyDays: '吉日:' },
  }
  const L = pdfLabels[language as string] ?? pdfLabels['en']!

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `OMENORA Destiny Report — ${firstName}`,
      Author: 'OMENORA AI',
    },
  })

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const W = 595
  const H = 842

  doc.on('pageAdded', () => {
    doc.rect(0, 0, W, H).fill('#0a0a0f')
  })

  doc.rect(0, 0, W, H).fill('#0a0a0f')

  let y = 60
  const ML = 60
  const CW = 475
  const drawDivider = (yPos: number) => {
    doc.moveTo(ML, yPos).lineTo(ML + CW, yPos).strokeColor('#1a1a2e').lineWidth(1).stroke()
  }

  doc.font('Helvetica')
    .fontSize(9)
    .fillColor('#333355')
    .text('OMENORA — AI DESTINY ANALYSIS', 60, y, { width: 475, align: 'center' })
  y += 22

  const archetypeName = report.archetypeName || ''
  doc.font('Helvetica-Bold')
    .fontSize(28)
    .fillColor('#e6dcff')
    .text(archetypeName, 60, y, { width: 475, align: 'center' })
  y += doc.heightOfString(archetypeName, { width: 475 }) + 14

  doc.font('Helvetica')
    .fontSize(14)
    .fillColor('#8c6eff')
    .text(
      `${report.archetypeSymbol || ''} ${report.element || ''} · Life Path ${lifePathNumber || ''}`,
      60, y, { width: 475, align: 'center' }
    )
  y += 25

  const traits = (report.powerTraits || []).join('  ·  ')
  doc.font('Helvetica')
    .fontSize(11)
    .fillColor('#7a6aaa')
    .text(traits, 60, y, { width: 475, align: 'center' })
  y += 40

  doc.moveTo(60, y).lineTo(535, y).strokeColor('#1a1a2e').lineWidth(1).stroke()
  y += 40

  const sectionOrder = [
    'identity', 'science', 'forecast',
    'love', 'purpose', 'gift', 'affirmation',
  ]

  const sections = report.sections || {}

  sectionOrder.forEach((key) => {
    const section = sections[key]
    if (!section) return

    if (y > 720) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 60
    }

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#8c6eff')
      .text(section.title?.toUpperCase() || '', 60, y)
    y += 18

    const isAffirmation = key === 'affirmation'

    if (isAffirmation) {
      const textHeight = doc.heightOfString(`"${section.content}"`, {
        width: 415,
        align: 'center',
      })
      doc.rect(60, y - 8, 475, textHeight + 24).fillAndStroke('#0f0d24', '#2a1f4a')

      doc.font('Helvetica-Oblique')
        .fontSize(13)
        .fillColor('#c8b4ff')
        .text(`"${section.content}"`, 80, y, { width: 435, align: 'center' })
      y += textHeight + 32
    } else {
      doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#a0a0b0')
        .text(section.content || '', 60, y, { width: 475, align: 'left', lineGap: 4 })
      y += doc.heightOfString(section.content || '', { width: 475 }) + 32
    }

    if (y < 760) {
      doc.moveTo(60, y - 16).lineTo(535, y - 16).strokeColor('#151520').lineWidth(0.5).stroke()
    }
  })

  if (region === 'india' && vedicData) {
    if (y > H - 250) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 60
    }
    drawDivider(y)
    y += 16
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#c87820')
       .text(L['vedic'] || 'VEDIC DESTINY READING', ML, y)
    y += 14
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#e6dcff')
       .text(vedicData.vedicTitle || '', ML, y)
    y += 20
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#c87820')
       .text(
         `Nakshatra: ${vedicData.nakshatraName || ''}  ·  Ruling Planet: ${vedicData.rulingPlanet || ''}`,
         ML, y
       )
    y += 18
    doc.font('Helvetica').fontSize(11).fillColor('#8888a0')
    const vReadingH = doc.heightOfString(vedicData.reading || '', { width: CW })
    doc.text(vedicData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += vReadingH + 12
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#c87820')
       .text(L['karmicMission'] || 'KARMIC MISSION', ML, y)
    y += 12
    doc.font('Helvetica-Oblique').fontSize(11).fillColor('#c8a060')
       .text(vedicData.karmicMission || '', ML, y, { width: CW })
    y += doc.heightOfString(vedicData.karmicMission || '', { width: CW }) + 12
    doc.font('Helvetica').fontSize(10).fillColor('#806040')
       .text(`${L['practice'] || '2026 Practice:'} ${vedicData.remedy || ''}`, ML, y, { width: CW })
    y += 24

  } else if (region === 'china' && baziData) {
    if (y > H - 250) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 60
    }
    drawDivider(y)
    y += 16
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#c84040')
       .text(L['bazi'] || 'BAZI FOUR PILLARS READING', ML, y)
    y += 14
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#e6dcff')
       .text(baziData.baziTitle || '', ML, y)
    y += 20
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#c84040')
       .text(
         `Day Master: ${baziData.dayMaster || ''}  ·  Dominant Element: ${baziData.dominantElement || ''}`,
         ML, y
       )
    y += 18
    doc.font('Helvetica').fontSize(11).fillColor('#8888a0')
    const bReadingH = doc.heightOfString(baziData.reading || '', { width: CW })
    doc.text(baziData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += bReadingH + 12
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#c84040')
       .text(L['wealthLuck'] || '2026 WEALTH LUCK', ML, y)
    y += 12
    doc.font('Helvetica-Oblique').fontSize(11).fillColor('#c06050')
       .text(baziData.wealthLuck2026 || '', ML, y, { width: CW })
    y += doc.heightOfString(baziData.wealthLuck2026 || '', { width: CW }) + 12
    doc.font('Helvetica').fontSize(10).fillColor('#804040')
       .text(
         `${L['luckyDirections'] || 'Lucky directions:'} ${(baziData.luckyDirections || []).join(', ')}`,
         ML, y
       )
    y += 24

  } else if ((region === 'latam' || region === 'tarot') && tarotData) {
    if (y > H - 250) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 60
    }
    drawDivider(y)
    y += 16
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9060c0')
       .text(L['spiritual'] || 'SPIRITUAL DESTINY READING', ML, y)
    y += 14
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#e6dcff')
       .text(tarotData.soulCard || '', ML, y)
    y += 16
    doc.font('Helvetica-Oblique').fontSize(11).fillColor('#9060c0')
    doc.text(tarotData.soulCardMeaning || '', ML, y, { width: CW, align: 'center' })
    y += doc.heightOfString(tarotData.soulCardMeaning || '', { width: CW }) + 16
    doc.font('Helvetica').fontSize(11).fillColor('#8888a0')
    const tReadingH = doc.heightOfString(tarotData.reading || '', { width: CW })
    doc.text(tarotData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += tReadingH + 12
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#9060c0')
       .text(L['loveDestiny'] || 'LOVE DESTINY', ML, y)
    y += 12
    doc.font('Helvetica-Oblique').fontSize(11).fillColor('#a080d0')
       .text(tarotData.loveMessage || '', ML, y, { width: CW })
    y += doc.heightOfString(tarotData.loveMessage || '', { width: CW }) + 12
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#9060c0')
       .text(L['blessing'] || 'A BLESSING FOR YOU', ML, y)
    y += 12
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#806080')
       .text(tarotData.blessing || '', ML, y, { width: CW })
    y += doc.heightOfString(tarotData.blessing || '', { width: CW }) + 12
    doc.font('Helvetica').fontSize(10).fillColor('#604060')
       .text(`${L['protectiveCharm'] || 'Protective charm:'} ${tarotData.luckyCharm || ''}`, ML, y)
    y += 24
  }

  if (calendarData && bundlePurchased) {
    doc.addPage({ size: 'A4', margin: 0 })
    doc.rect(0, 0, W, H).fill('#070510')
    let cy = 60

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#c9a84c')
       .text(L['calendarLabel'] || 'YOUR 2026 DESTINY CALENDAR', ML, cy, { width: CW, align: 'center' })
    cy += 20

    if (calendarData.overallTheme) {
      doc.font('Helvetica').fontSize(11).fillColor('#888899')
         .text(calendarData.overallTheme, ML, cy, { width: CW, align: 'center', lineGap: 2 })
      cy += doc.heightOfString(calendarData.overallTheme, { width: CW }) + 20
    }

    doc.moveTo(ML, cy).lineTo(ML + CW, cy).strokeColor('#1a1a2e').lineWidth(0.5).stroke()
    cy += 16

    const months: any[] = calendarData.months || []
    for (const m of months) {
      if (cy > H - 120) {
        doc.addPage({ size: 'A4', margin: 0 })
        doc.rect(0, 0, W, H).fill('#070510')
        cy = 60
      }
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#c0b8e0')
         .text(`${m.month}  —  ${m.theme || ''}`, ML, cy)
      cy += 14
      doc.font('Helvetica').fontSize(9).fillColor('#666677')
         .text(`♥ ${m.love || ''}`, ML, cy, { width: CW, lineGap: 1 })
      cy += doc.heightOfString(m.love || '', { width: CW }) + 3
      doc.text(`$ ${m.money || ''}`, ML, cy, { width: CW, lineGap: 1 })
      cy += doc.heightOfString(m.money || '', { width: CW }) + 3
      doc.text(`⚡ ${m.career || ''}`, ML, cy, { width: CW, lineGap: 1 })
      cy += doc.heightOfString(m.career || '', { width: CW }) + 3
      if (m.warning) {
        doc.font('Helvetica').fontSize(8).fillColor('#884433')
           .text(`⚠ ${m.warning}`, ML, cy, { width: CW })
        cy += doc.heightOfString(m.warning, { width: CW }) + 3
      }
      doc.font('Helvetica').fontSize(8).fillColor('#444455')
         .text(`${L['luckyDays'] || 'Lucky days:'} ${(m.luckyDays || []).join(', ')}`, ML, cy)
      cy += 14
      doc.moveTo(ML, cy).lineTo(ML + CW, cy).strokeColor('#151520').lineWidth(0.3).stroke()
      cy += 12
    }
  }

  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#222233')
     .text('omenora.com — AI Destiny Analysis', ML, H - 30, { width: CW, align: 'center' })

  doc.end()

  await new Promise<void>((resolve) => doc.on('end', resolve))

  const buffer = Buffer.concat(chunks)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-report-${firstName || 'destiny'}.pdf"`
  )

  return buffer
})
