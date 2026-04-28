import PDFDocument from 'pdfkit'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

// ── Design tokens ────────────────────────────────────────────────────────────
const BONE       = '#F2EBDD'
const INK        = '#1A1612'
const INK_MID    = '#3D3530'
const INK_FAINT  = '#7A6E66'   // PDFKit needs hex, not rgba
const INK_GHOST  = '#DDD5C8'   // light rule color on bone
const GOLD       = '#C9A961'

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

function resolveFontPath(filename: string): string {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fonts', filename),
    join(process.cwd(), 'public', 'fonts', filename),
  ]
  return candidates.find(p => existsSync(p)) ?? (() => { throw new Error(`Font not found: ${filename}`) })()
}

function resolveSymbolPath(symbol: string): string | null {
  const id = SYMBOL_TO_ID[symbol] ?? 'phoenix'
  const filename = `${id}@2x.png`
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'symbols', filename),
    join(process.cwd(), 'public', 'symbols', filename),
  ]
  return candidates.find(p => existsSync(p)) ?? null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const firstName      = sanitizeString(body.firstName, 50)
  const language       = sanitizeString(body.language || 'en', 5)
  const lifePathNumber = Number(body.lifePathNumber)
  const region         = isValidRegion(body.region) ? body.region : 'western'
  const report         = body.report && typeof body.report === 'object' ? body.report : null
  const { vedicData, baziData, tarotData, calendarData, compatibilityData, partnerName, bundlePurchased, birthChartData } = body

  assertInput(!!firstName, 'firstName is required')
  assertInput(report !== null, 'report is required')

  const pdfLabels: Record<string, Record<string, string>> = {
    en: { vedic: 'VEDIC DESTINY READING', karmicMission: 'KARMIC MISSION', practice: '2026 Practice:', bazi: 'BAZI FOUR PILLARS READING', wealthLuck: '2026 WEALTH LUCK', luckyDirections: 'Lucky directions:', spiritual: 'SPIRITUAL DESTINY READING', loveDestiny: 'LOVE DESTINY', blessing: 'A BLESSING FOR YOU', protectiveCharm: 'Protective charm:', calendarLabel: 'YOUR 2026 DESTINY CALENDAR', luckyDays: 'Lucky days:', compatLabel: 'COMPATIBILITY READING', compatScore: 'Compatibility Score', compatWith: 'with' },
    es: { vedic: 'LECTURA VÉDICA DE DESTINO', karmicMission: 'MISIÓN KÁRMICA', practice: 'Práctica 2026:', bazi: 'LECTURA BAZI DE CUATRO PILARES', wealthLuck: 'SUERTE FINANCIERA 2026', luckyDirections: 'Direcciones favorables:', spiritual: 'LECTURA ESPIRITUAL DE DESTINO', loveDestiny: 'DESTINO AMOROSO', blessing: 'UNA BENDICIÓN PARA TI', protectiveCharm: 'Amuleto protector:', calendarLabel: 'TU CALENDARIO DE DESTINO 2026', luckyDays: 'Días de suerte:', compatLabel: 'LECTURA DE COMPATIBILIDAD', compatScore: 'Puntuación de Compatibilidad', compatWith: 'con' },
    pt: { vedic: 'LEITURA VÉDICA DE DESTINO', karmicMission: 'MISSÃO KÁRMICA', practice: 'Prática 2026:', bazi: 'LEITURA BAZI DOS QUATRO PILARES', wealthLuck: 'SORTE FINANCEIRA 2026', luckyDirections: 'Direções favoráveis:', spiritual: 'LEITURA ESPIRITUAL DE DESTINO', loveDestiny: 'DESTINO AMOROSO', blessing: 'UMA BÊNÇÃO PARA VOCÊ', protectiveCharm: 'Amuleto protetor:', calendarLabel: 'SEU CALENDÁRIO DE DESTINO 2026', luckyDays: 'Dias de sorte:', compatLabel: 'LEITURA DE COMPATIBILIDADE', compatScore: 'Pontuação de Compatibilidade', compatWith: 'com' },
    hi: { vedic: 'वैदिक नियति रीडिंग', karmicMission: 'कार्मिक मिशन', practice: '2026 अभ्यास:', bazi: 'बाड़ी चार स्तंभ रीडिंग', wealthLuck: '2026 धन भाग्य', luckyDirections: 'भाग्यशाली दिशाएं:', spiritual: 'आध्यात्मिक नियति रीडिंग', loveDestiny: 'प्रेम नियति', blessing: 'आपके लिए आशीर्वाद', protectiveCharm: 'रक्षात्मक तायऺत:', calendarLabel: 'आपका 2026 नियति कैलेंडर', luckyDays: 'भाग्यशाली दिन:', compatLabel: 'अनुकूलता रीडिंग', compatScore: 'अनुकूलता स्कोर', compatWith: 'के साथ' },
    ko: { vedic: '베다 운명 리딩', karmicMission: '카르마 사명', practice: '2026 수련:', bazi: '리 BaZi 사주 리딩', wealthLuck: '2026 재물 운', luckyDirections: '행운의 방향:', spiritual: '영적 운명 리딩', loveDestiny: '사랑의 운명', blessing: '당신을 위한 축복', protectiveCharm: '보호 부적:', calendarLabel: '당신의 2026 운명 캘린더', luckyDays: '행운의 날:', compatLabel: '궁합 리딩', compatScore: '궁합 점수', compatWith: '와' },
    zh: { vedic: '厄波奇命运解读', karmicMission: '因果使命', practice: '2026年练习:', bazi: '八字四柱解读', wealthLuck: '2026财运', luckyDirections: '吉利方位:', spiritual: '灵性命运解读', loveDestiny: '爱情命运', blessing: '给你的祝福', protectiveCharm: '护身符:', calendarLabel: '你的2026年命运日历', luckyDays: '吉日:', compatLabel: '合盘分析', compatScore: '契合度', compatWith: '与' },
  }
  const L = pdfLabels[language as string] ?? pdfLabels['en']!

  // ── Register custom fonts ──────────────────────────────────────────────────
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `OMENORA Destiny Report — ${firstName}`,
      Author: 'OMENORA',
    },
  })

  doc.registerFont('Inter',            resolveFontPath('Inter-Regular.ttf'))
  doc.registerFont('Inter-Medium',     resolveFontPath('Inter-Medium.ttf'))
  doc.registerFont('Inter-Light',      resolveFontPath('Inter-Light.ttf'))
  doc.registerFont('Cormorant',        resolveFontPath('Cormorant-Light.ttf'))
  doc.registerFont('Cormorant-Italic', resolveFontPath('Cormorant-LightItalic.ttf'))

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const W  = 595
  const H  = 842
  const ML = 60
  const CW = 475

  // Fill every new page with bone
  const fillPageBone = () => doc.rect(0, 0, W, H).fill(BONE)
  doc.on('pageAdded', fillPageBone)
  fillPageBone()

  const drawRule = (yPos: number, x1 = ML, x2 = ML + CW) =>
    doc.moveTo(x1, yPos).lineTo(x2, yPos).strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  const drawGoldLabel = (text: string, x: number, yPos: number, opts?: object) =>
    doc.font('Inter-Medium').fontSize(8).fillColor(GOLD).text(text, x, yPos, opts)

  // ── COVER ─────────────────────────────────────────────────────────────────
  let y = 52

  // Wordmark
  doc.font('Inter-Medium').fontSize(9).fillColor(INK_FAINT)
     .text('O M E N O R A', ML, y, { width: CW, align: 'center' })
  y += 14
  drawRule(y, ML + 160, ML + CW - 160)
  y += 20

  // Archetype name in Cormorant italic
  const archetypeName = report.archetypeName || ''
  doc.font('Cormorant-Italic').fontSize(32).fillColor(INK)
     .text(archetypeName, ML, y, { width: CW, align: 'center' })
  y += doc.heightOfString(archetypeName, { width: CW, font: 'Cormorant-Italic', fontSize: 32 } as any) + 10

  // Symbol image
  const symbolPngPath = resolveSymbolPath(report.archetypeSymbol || '◆')
  const symbolPdfSize = 52
  if (symbolPngPath) {
    doc.image(symbolPngPath, W / 2 - symbolPdfSize / 2, y, { width: symbolPdfSize, height: symbolPdfSize })
  }
  y += symbolPdfSize + 10

  // Element · Life Path
  doc.font('Inter').fontSize(11).fillColor(INK_FAINT)
     .text(`${report.element || ''}  ·  Life Path ${lifePathNumber || ''}`, ML, y, { width: CW, align: 'center' })
  y += 18

  // Power traits
  const traits = (report.powerTraits || []).join('  ·  ')
  doc.font('Inter').fontSize(10).fillColor(INK_MID)
     .text(traits, ML, y, { width: CW, align: 'center' })
  y += 28

  drawRule(y)
  y += 28

  // ── CORE SECTIONS ─────────────────────────────────────────────────────────
  const sectionOrder = ['identity', 'science', 'forecast', 'love', 'purpose', 'gift', 'affirmation']
  const sections = report.sections || {}

  sectionOrder.forEach((key) => {
    const section = sections[key]
    if (!section) return

    if (y > 720) {
      doc.addPage({ size: 'A4', margin: 0 })
      y = 52
    }

    drawGoldLabel(section.title?.toUpperCase() || '', ML, y)
    y += 14

    const isAffirmation = key === 'affirmation'

    if (isAffirmation) {
      const textHeight = doc.heightOfString(`"${section.content}"`, { width: 415 })
      // Light tinted box
      doc.rect(ML, y - 6, CW, textHeight + 20)
         .fillAndStroke('rgba(201,169,97,0.06)', GOLD)

      doc.font('Cormorant-Italic').fontSize(13).fillColor(INK_MID)
         .text(`"${section.content}"`, ML + 20, y, { width: CW - 40, align: 'center' })
      y += textHeight + 28
    } else {
      doc.font('Inter').fontSize(11).fillColor(INK_MID)
         .text(section.content || '', ML, y, { width: CW, align: 'left', lineGap: 3 })
      y += doc.heightOfString(section.content || '', { width: CW }) + 28
    }

    if (y < 760) drawRule(y - 14)
  })

  // ── TRADITION SECTION (Vedic / BaZi / Tarot) ──────────────────────────────
  if (region === 'india' && vedicData) {
    if (y > H - 250) { doc.addPage({ size: 'A4', margin: 0 }); y = 52 }
    drawRule(y); y += 14
    drawGoldLabel(L['vedic'] || 'VEDIC DESTINY READING', ML, y); y += 14
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(vedicData.vedicTitle || '', ML, y); y += 20
    doc.font('Inter-Medium').fontSize(9).fillColor(GOLD)
       .text(`Nakshatra: ${vedicData.nakshatraName || ''}  ·  Ruling Planet: ${vedicData.rulingPlanet || ''}`, ML, y)
    y += 16
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
    const vReadingH = doc.heightOfString(vedicData.reading || '', { width: CW })
    doc.text(vedicData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += vReadingH + 10
    drawGoldLabel(L['karmicMission'] || 'KARMIC MISSION', ML, y); y += 12
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(vedicData.karmicMission || '', ML, y, { width: CW })
    y += doc.heightOfString(vedicData.karmicMission || '', { width: CW }) + 10
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['practice'] || '2026 Practice:'} ${vedicData.remedy || ''}`, ML, y, { width: CW })
    y += 22

  } else if (region === 'china' && baziData) {
    if (y > H - 250) { doc.addPage({ size: 'A4', margin: 0 }); y = 52 }
    drawRule(y); y += 14
    drawGoldLabel(L['bazi'] || 'BAZI FOUR PILLARS READING', ML, y); y += 14
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(baziData.baziTitle || '', ML, y); y += 20
    doc.font('Inter-Medium').fontSize(9).fillColor(GOLD)
       .text(`Day Master: ${baziData.dayMaster || ''}  ·  Dominant Element: ${baziData.dominantElement || ''}`, ML, y)
    y += 16
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
    const bReadingH = doc.heightOfString(baziData.reading || '', { width: CW })
    doc.text(baziData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += bReadingH + 10
    drawGoldLabel(L['wealthLuck'] || '2026 WEALTH LUCK', ML, y); y += 12
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(baziData.wealthLuck2026 || '', ML, y, { width: CW })
    y += doc.heightOfString(baziData.wealthLuck2026 || '', { width: CW }) + 10
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['luckyDirections'] || 'Lucky directions:'} ${(baziData.luckyDirections || []).join(', ')}`, ML, y)
    y += 22

  } else if ((region === 'latam' || region === 'tarot') && tarotData) {
    if (y > H - 250) { doc.addPage({ size: 'A4', margin: 0 }); y = 52 }
    drawRule(y); y += 14
    drawGoldLabel(L['spiritual'] || 'SPIRITUAL DESTINY READING', ML, y); y += 14
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(tarotData.soulCard || '', ML, y); y += 14
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(tarotData.soulCardMeaning || '', ML, y, { width: CW, align: 'center' })
    y += doc.heightOfString(tarotData.soulCardMeaning || '', { width: CW }) + 14
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
    const tReadingH = doc.heightOfString(tarotData.reading || '', { width: CW })
    doc.text(tarotData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += tReadingH + 10
    drawGoldLabel(L['loveDestiny'] || 'LOVE DESTINY', ML, y); y += 12
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(tarotData.loveMessage || '', ML, y, { width: CW })
    y += doc.heightOfString(tarotData.loveMessage || '', { width: CW }) + 10
    drawGoldLabel(L['blessing'] || 'A BLESSING FOR YOU', ML, y); y += 12
    doc.font('Cormorant-Italic').fontSize(11).fillColor(INK_FAINT)
       .text(tarotData.blessing || '', ML, y, { width: CW })
    y += doc.heightOfString(tarotData.blessing || '', { width: CW }) + 10
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['protectiveCharm'] || 'Protective charm:'} ${tarotData.luckyCharm || ''}`, ML, y)
    y += 22
  }

  // ── BIRTH CHART ───────────────────────────────────────────────────────────
  if (birthChartData) {
    if (y > H - 250) { doc.addPage({ size: 'A4', margin: 0 }); y = 52 }
    drawRule(y); y += 14
    drawGoldLabel('YOUR NATAL CHART', ML, y, { width: CW, align: 'center' }); y += 14
    doc.font('Cormorant-Italic').fontSize(16).fillColor(INK)
       .text(birthChartData.chartTitle || 'Your Birth Chart', ML, y, { width: CW, align: 'center' })
    y += 20
    const placements = [
      `Rising: ${birthChartData.risingSign || ''}`,
      `Sun: ${birthChartData.sunSign || ''}`,
      `Moon: ${birthChartData.moonSign || ''}`,
      `Dominant Planet: ${birthChartData.dominantPlanet || ''}`,
      `Power House: ${birthChartData.powerHouse || ''}`,
    ].join('   ·   ')
    doc.font('Inter').fontSize(9).fillColor(GOLD)
       .text(placements, ML, y, { width: CW, align: 'center' })
    y += 16
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
    const bcReadingH = doc.heightOfString(birthChartData.reading || '', { width: CW })
    doc.text(birthChartData.reading || '', ML, y, { width: CW, lineGap: 3 })
    y += bcReadingH + 10
    drawGoldLabel('2026 PLANETARY FORECAST', ML, y); y += 12
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(birthChartData.forecast2026 || '', ML, y, { width: CW, lineGap: 3 })
    y += doc.heightOfString(birthChartData.forecast2026 || '', { width: CW }) + 22
  }

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  const currentMonthNumber = new Date().getMonth() + 1

  if (calendarData && bundlePurchased) {
    const allMonths: any[] = calendarData.months || []
    const months: any[] = (() => {
      const future = allMonths.filter((m: any) =>
        typeof m.number === 'number' ? m.number >= currentMonthNumber : true,
      )
      return future.length > 0 ? future : allMonths
    })()

    if (months.length > 0) {
      doc.addPage({ size: 'A4', margin: 0 })
      let cy = 52

      drawGoldLabel(L['calendarLabel'] || 'YOUR 2026 DESTINY CALENDAR', ML, cy, { width: CW, align: 'center' })
      cy += 18

      if (calendarData.overallTheme) {
        doc.font('Cormorant-Italic').fontSize(11).fillColor(INK_MID)
           .text(calendarData.overallTheme, ML, cy, { width: CW, align: 'center', lineGap: 2 })
        cy += doc.heightOfString(calendarData.overallTheme, { width: CW }) + 18
      }

      drawRule(cy); cy += 14

      for (const m of months) {
        if (cy > H - 120) {
          doc.addPage({ size: 'A4', margin: 0 })
          cy = 52
        }
        doc.font('Inter-Medium').fontSize(10).fillColor(INK)
           .text(`${m.month}  —  ${m.theme || ''}`, ML, cy)
        cy += 13
        doc.font('Inter').fontSize(9).fillColor(INK_MID)
           .text(`Love: ${m.love || ''}`, ML, cy, { width: CW, lineGap: 1 })
        cy += doc.heightOfString(m.love || '', { width: CW }) + 2
        doc.text(`Money: ${m.money || ''}`, ML, cy, { width: CW, lineGap: 1 })
        cy += doc.heightOfString(m.money || '', { width: CW }) + 2
        doc.text(`Career: ${m.career || ''}`, ML, cy, { width: CW, lineGap: 1 })
        cy += doc.heightOfString(m.career || '', { width: CW }) + 2
        if (m.warning) {
          doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
             .text(`Caution: ${m.warning}`, ML, cy, { width: CW })
          cy += doc.heightOfString(m.warning, { width: CW }) + 2
        }
        doc.font('Inter').fontSize(8).fillColor(GOLD)
           .text(`${L['luckyDays'] || 'Lucky days:'} ${(m.luckyDays || []).join(', ')}`, ML, cy)
        cy += 13
        drawRule(cy); cy += 10
      }
    }
  }

  // ── COMPATIBILITY ─────────────────────────────────────────────────────────
  if (compatibilityData && compatibilityData.compatibilityScore !== undefined) {
    doc.addPage({ size: 'A4', margin: 0 })
    let ky = 52

    drawGoldLabel(L['compatLabel'] || 'COMPATIBILITY READING', ML, ky, { width: CW, align: 'center' })
    ky += 16

    const compatNames = partnerName
      ? `${firstName} ${L['compatWith'] || 'with'} ${partnerName}`
      : firstName
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK_MID)
       .text(compatNames, ML, ky, { width: CW, align: 'center' })
    ky += 20

    doc.font('Cormorant-Italic').fontSize(40).fillColor(GOLD)
       .text(`${compatibilityData.compatibilityScore}%`, ML, ky, { width: CW, align: 'center' })
    ky += 48

    if (compatibilityData.compatibilityTitle) {
      doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
         .text(compatibilityData.compatibilityTitle, ML, ky, { width: CW, align: 'center' })
      ky += doc.heightOfString(compatibilityData.compatibilityTitle, { width: CW }) + 18
    }

    drawRule(ky); ky += 14

    const compatSectionOrder = ['bond', 'strength', 'challenge', 'forecast', 'advice']
    const compatSections = compatibilityData.sections || {}
    for (const key of compatSectionOrder) {
      const sec = compatSections[key]
      if (!sec) continue
      if (ky > H - 120) {
        doc.addPage({ size: 'A4', margin: 0 }); ky = 52
      }
      drawGoldLabel((sec.title || key).toUpperCase(), ML, ky); ky += 13
      doc.font('Inter').fontSize(11).fillColor(INK_MID)
         .text(sec.content || '', ML, ky, { width: CW, lineGap: 3 })
      ky += doc.heightOfString(sec.content || '', { width: CW }) + 14
      drawRule(ky - 6)
    }
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerY = Math.min((doc as any).y + 20, H - 20)
  doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
     .text('omenora.com — Your destiny, decoded', ML, footerY, { width: CW, align: 'center' })

  doc.end()

  await new Promise<void>((resolve) => doc.on('end', resolve))

  const buffer = Buffer.concat(chunks)

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="omenora-report-${firstName || 'destiny'}.pdf"`,
  )

  return buffer
})
