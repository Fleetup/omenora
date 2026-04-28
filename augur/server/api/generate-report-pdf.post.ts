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

  const drawRule = (x1 = ML, x2 = ML + CW) => {
    const yPos = (doc as any).y
    doc.moveTo(x1, yPos).lineTo(x2, yPos).strokeColor(INK_GHOST).lineWidth(0.5).stroke()
  }

  const drawGoldLabel = (text: string, opts?: object) =>
    doc.font('Inter-Medium').fontSize(8).fillColor(GOLD).text(text, ML, (doc as any).y, { width: CW, ...opts })

  // Ensure at least `needed` points remain on the page before drawing a block.
  const ensureSpace = (needed: number) => {
    if ((doc as any).y + needed > H - 52) {
      doc.addPage({ size: 'A4', margin: 0 })
    }
  }

  // ── COVER (page 1) — fixed Y positions, full A4 distribution ─────────────

  // Strip leading "The " if present so we can draw "The" and name separately
  const rawArchetypeName = report.archetypeName || ''
  const archetypeName = rawArchetypeName.replace(/^The\s+/i, '') || rawArchetypeName

  // ── Wordmark ──
  doc.font('Inter-Medium').fontSize(10).fillColor(INK_FAINT)
     .text('O M E N O R A', ML, 48, { align: 'center', width: CW })

  doc.moveTo(ML + CW * 0.35, 64)
     .lineTo(ML + CW * 0.65, 64)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── Eyebrow ──
  doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
     .text('COMPLETE NATAL READING', ML, 78, { align: 'center', width: CW })

  // ── Rule below eyebrow ──
  doc.moveTo(ML, 98).lineTo(ML + CW, 98)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── "The" prefix ──
  doc.font('Cormorant-Italic').fontSize(20).fillColor(INK_FAINT)
     .text('The', ML, 114, { align: 'center', width: CW })

  // ── Archetype name ──
  const nameFontSize = archetypeName.length > 10 ? 44 : 52
  doc.font('Cormorant-Italic').fontSize(nameFontSize).fillColor(INK)
     .text(archetypeName, ML, 136, { align: 'center', width: CW, lineBreak: false })

  // ── Short center rule ──
  doc.moveTo(ML + CW / 2 - 40, 205)
     .lineTo(ML + CW / 2 + 40, 205)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── Symbol image 120×120 ──
  const symbolPngPath = resolveSymbolPath(report.archetypeSymbol || '◆')
  const symbolPdfSize = 120
  const symbolX = ML + (CW - symbolPdfSize) / 2
  if (symbolPngPath) {
    doc.image(symbolPngPath, symbolX, 220, { width: symbolPdfSize, height: symbolPdfSize })
  }

  // ── Element · Life Path ──
  doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
     .text(`${report.element || ''}  ·  Life Path ${lifePathNumber || ''}`, ML, 355, { align: 'center', width: CW })

  // ── Rule ──
  doc.moveTo(ML, 376).lineTo(ML + CW, 376)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── Power Traits — stacked [01][02][03] annotation ──
  const coverTraits: string[] = Array.isArray(report.powerTraits)
    ? (report.powerTraits as string[]).slice(0, 3)
    : []
  let traitY = 395
  const traitNumX  = ML + 60   // gold [01] label
  const traitTxtX  = ML + 96   // trait text starts here
  const traitTxtW  = CW - 100  // remaining width for text

  coverTraits.forEach((trait: string, i: number) => {
    // Gold index label — absolute position, no continuation
    doc.font('Inter-Medium').fontSize(8).fillColor(GOLD)
       .text(`[0${i + 1}]`, traitNumX, traitY, { width: 28, lineBreak: false })
    // Trait text — absolute position on same Y
    doc.font('Inter').fontSize(10).fillColor(INK_MID)
       .text(trait, traitTxtX, traitY, { width: traitTxtW, lineBreak: false })
    traitY += 26
  })

  // ── Rule before affirmation ──
  const afterTraitsY = traitY + 18
  doc.moveTo(ML, afterTraitsY).lineTo(ML + CW, afterTraitsY)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── Affirmation box ──
  const affirmContent  = (report.sections?.affirmation?.content as string) || ''
  const affirmText     = `"${affirmContent}"`
  const affirmBoxY     = afterTraitsY + 16

  doc.font('Cormorant-Italic').fontSize(13)
  const affirmTextH = doc.heightOfString(affirmText, { width: CW - 48 })
  const affirmBoxH  = affirmTextH + 56

  doc.rect(ML, affirmBoxY, CW, affirmBoxH)
     .strokeColor(GOLD).lineWidth(0.5).stroke()

  doc.font('Inter-Medium').fontSize(7).fillColor(GOLD)
     .text('YOUR POWER STATEMENT', ML, affirmBoxY + 12, { width: CW, align: 'center' })

  doc.font('Cormorant-Italic').fontSize(13).fillColor(INK)
     .text(affirmText, ML + 24, affirmBoxY + 28, { width: CW - 48, align: 'center' })

  // ── Bottom rule ──
  doc.moveTo(ML, 790).lineTo(ML + CW, 790)
     .strokeColor(INK_GHOST).lineWidth(0.5).stroke()

  // ── Footer ──
  doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
     .text('omenora.com — Your destiny, decoded', ML, 806, { align: 'center', width: CW })

  // Cover ends here — sections always start on a fresh page
  doc.addPage({ size: 'A4', margin: 0 })

  // ── CORE SECTIONS ─────────────────────────────────────────────────────────
  const sectionOrder = ['identity', 'science', 'forecast', 'love', 'purpose', 'gift', 'affirmation']
  const sections = report.sections || {}

  for (const key of sectionOrder) {
    const section = sections[key]
    if (!section) continue

    const isAffirmation = key === 'affirmation'

    if (isAffirmation) {
      // Affirmation box needs more space
      ensureSpace(180)

      const affirmText = `"${section.content || ''}"`
      const textH = doc.heightOfString(affirmText, { width: CW - 48 })
      const boxH  = textH + 72
      const boxY  = (doc as any).y + 8

      // Border only — no fill
      doc.rect(ML, boxY, CW, boxH)
         .strokeColor(GOLD)
         .lineWidth(0.5)
         .stroke()

      // Label inside box (no drawGoldLabel — box already contains the label)
      doc.font('Inter-Medium').fontSize(8).fillColor(GOLD)
         .text('YOUR POWER STATEMENT', ML, boxY + 16, { width: CW, align: 'center' })

      // Affirmation text
      doc.font('Cormorant-Italic').fontSize(13).fillColor(INK_MID)
         .text(affirmText, ML + 24, boxY + 36, { width: CW - 48, align: 'center' })

      doc.y = boxY + boxH + 16

    } else {
      ensureSpace(120)

      drawGoldLabel(section.title?.toUpperCase() || '')
      doc.moveDown(0.4)

      doc.font('Inter').fontSize(11).fillColor(INK_MID)
         .text(section.content || '', ML, doc.y, { width: CW, align: 'left', lineGap: 3 })
      doc.moveDown(1.5)

      drawRule()
      doc.moveDown(1)
    }
  }

  // ── TRADITION SECTION (Vedic / BaZi / Tarot) ──────────────────────────────
  if (region === 'india' && vedicData) {
    ensureSpace(250)
    drawRule(); doc.moveDown(0.6)
    drawGoldLabel(L['vedic'] || 'VEDIC DESTINY READING'); doc.moveDown(0.5)
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(vedicData.vedicTitle || '', ML, doc.y); doc.moveDown(0.6)
    doc.font('Inter-Medium').fontSize(9).fillColor(GOLD)
       .text(`Nakshatra: ${vedicData.nakshatraName || ''}  ·  Ruling Planet: ${vedicData.rulingPlanet || ''}`, ML, doc.y)
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
       .text(vedicData.reading || '', ML, doc.y, { width: CW, lineGap: 3 })
    doc.moveDown(1)
    drawGoldLabel(L['karmicMission'] || 'KARMIC MISSION'); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(vedicData.karmicMission || '', ML, doc.y, { width: CW })
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['practice'] || '2026 Practice:'} ${vedicData.remedy || ''}`, ML, doc.y, { width: CW })
    doc.moveDown(1)

  } else if (region === 'china' && baziData) {
    ensureSpace(250)
    drawRule(); doc.moveDown(0.6)
    drawGoldLabel(L['bazi'] || 'BAZI FOUR PILLARS READING'); doc.moveDown(0.5)
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(baziData.baziTitle || '', ML, doc.y); doc.moveDown(0.6)
    doc.font('Inter-Medium').fontSize(9).fillColor(GOLD)
       .text(`Day Master: ${baziData.dayMaster || ''}  ·  Dominant Element: ${baziData.dominantElement || ''}`, ML, doc.y)
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
       .text(baziData.reading || '', ML, doc.y, { width: CW, lineGap: 3 })
    doc.moveDown(1)
    drawGoldLabel(L['wealthLuck'] || '2026 WEALTH LUCK'); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(baziData.wealthLuck2026 || '', ML, doc.y, { width: CW })
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['luckyDirections'] || 'Lucky directions:'} ${(baziData.luckyDirections || []).join(', ')}`, ML, doc.y)
    doc.moveDown(1)

  } else if ((region === 'latam' || region === 'tarot') && tarotData) {
    ensureSpace(250)
    drawRule(); doc.moveDown(0.6)
    drawGoldLabel(L['spiritual'] || 'SPIRITUAL DESTINY READING'); doc.moveDown(0.5)
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK)
       .text(tarotData.soulCard || '', ML, doc.y); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(tarotData.soulCardMeaning || '', ML, doc.y, { width: CW, align: 'center' })
    doc.moveDown(0.6)
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
       .text(tarotData.reading || '', ML, doc.y, { width: CW, lineGap: 3 })
    doc.moveDown(1)
    drawGoldLabel(L['loveDestiny'] || 'LOVE DESTINY'); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(tarotData.loveMessage || '', ML, doc.y, { width: CW })
    doc.moveDown(0.6)
    drawGoldLabel(L['blessing'] || 'A BLESSING FOR YOU'); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(11).fillColor(INK_FAINT)
       .text(tarotData.blessing || '', ML, doc.y, { width: CW })
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(10).fillColor(INK_FAINT)
       .text(`${L['protectiveCharm'] || 'Protective charm:'} ${tarotData.luckyCharm || ''}`, ML, doc.y)
    doc.moveDown(1)
  }

  // ── BIRTH CHART ───────────────────────────────────────────────────────────
  if (birthChartData) {
    ensureSpace(250)
    drawRule(); doc.moveDown(0.6)
    drawGoldLabel('YOUR NATAL CHART', { width: CW, align: 'center' }); doc.moveDown(0.5)
    doc.font('Cormorant-Italic').fontSize(16).fillColor(INK)
       .text(birthChartData.chartTitle || 'Your Birth Chart', ML, doc.y, { width: CW, align: 'center' })
    doc.moveDown(0.5)
    const placements = [
      `Rising: ${birthChartData.risingSign || ''}`,
      `Sun: ${birthChartData.sunSign || ''}`,
      `Moon: ${birthChartData.moonSign || ''}`,
      `Dominant Planet: ${birthChartData.dominantPlanet || ''}`,
      `Power House: ${birthChartData.powerHouse || ''}`,
    ].join('   ·   ')
    doc.font('Inter').fontSize(9).fillColor(GOLD)
       .text(placements, ML, doc.y, { width: CW, align: 'center' })
    doc.moveDown(0.5)
    doc.font('Inter').fontSize(11).fillColor(INK_MID)
       .text(birthChartData.reading || '', ML, doc.y, { width: CW, lineGap: 3 })
    doc.moveDown(1)
    drawGoldLabel('2026 PLANETARY FORECAST'); doc.moveDown(0.4)
    doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
       .text(birthChartData.forecast2026 || '', ML, doc.y, { width: CW, lineGap: 3 })
    doc.moveDown(1)
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

      drawGoldLabel(L['calendarLabel'] || 'YOUR 2026 DESTINY CALENDAR', { width: CW, align: 'center' })
      doc.moveDown(0.6)

      if (calendarData.overallTheme) {
        doc.font('Cormorant-Italic').fontSize(11).fillColor(INK_MID)
           .text(calendarData.overallTheme, ML, doc.y, { width: CW, align: 'center', lineGap: 2 })
        doc.moveDown(1)
      }

      drawRule(); doc.moveDown(0.6)

      for (const m of months) {
        ensureSpace(120)
        doc.font('Inter-Medium').fontSize(10).fillColor(INK)
           .text(`${m.month}  —  ${m.theme || ''}`, ML, doc.y)
        doc.moveDown(0.3)
        doc.font('Inter').fontSize(9).fillColor(INK_MID)
           .text(`Love: ${m.love || ''}`, ML, doc.y, { width: CW, lineGap: 1 })
        doc.text(`Money: ${m.money || ''}`, ML, doc.y, { width: CW, lineGap: 1 })
        doc.text(`Career: ${m.career || ''}`, ML, doc.y, { width: CW, lineGap: 1 })
        if (m.warning) {
          doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
             .text(`Caution: ${m.warning}`, ML, doc.y, { width: CW })
        }
        doc.font('Inter').fontSize(8).fillColor(GOLD)
           .text(`${L['luckyDays'] || 'Lucky days:'} ${(m.luckyDays || []).join(', ')}`, ML, doc.y)
        doc.moveDown(0.5)
        drawRule(); doc.moveDown(0.4)
      }
    }
  }

  // ── COMPATIBILITY ─────────────────────────────────────────────────────────
  if (compatibilityData && compatibilityData.compatibilityScore !== undefined) {
    doc.addPage({ size: 'A4', margin: 0 })

    drawGoldLabel(L['compatLabel'] || 'COMPATIBILITY READING', { width: CW, align: 'center' })
    doc.moveDown(0.6)

    const compatNames = partnerName
      ? `${firstName} ${L['compatWith'] || 'with'} ${partnerName}`
      : firstName
    doc.font('Cormorant-Italic').fontSize(14).fillColor(INK_MID)
       .text(compatNames, ML, doc.y, { width: CW, align: 'center' })
    doc.moveDown(0.5)

    doc.font('Cormorant-Italic').fontSize(40).fillColor(GOLD)
       .text(`${compatibilityData.compatibilityScore}%`, ML, doc.y, { width: CW, align: 'center' })
    doc.moveDown(0.6)

    if (compatibilityData.compatibilityTitle) {
      doc.font('Cormorant-Italic').fontSize(12).fillColor(INK_MID)
         .text(compatibilityData.compatibilityTitle, ML, doc.y, { width: CW, align: 'center' })
      doc.moveDown(1)
    }

    drawRule(); doc.moveDown(0.6)

    const compatSectionOrder = ['bond', 'strength', 'challenge', 'forecast', 'advice']
    const compatSections = compatibilityData.sections || {}
    for (const key of compatSectionOrder) {
      const sec = compatSections[key]
      if (!sec) continue
      ensureSpace(120)
      drawGoldLabel((sec.title || key).toUpperCase()); doc.moveDown(0.4)
      doc.font('Inter').fontSize(11).fillColor(INK_MID)
         .text(sec.content || '', ML, doc.y, { width: CW, lineGap: 3 })
      doc.moveDown(1)
      drawRule(); doc.moveDown(0.4)
    }
  }

  // ── FOOTER — drawn once on the last page ──────────────────────────────────
  ensureSpace(40)
  doc.font('Inter').fontSize(8).fillColor(INK_FAINT)
     .text('omenora.com — Your destiny, decoded', ML, doc.y, { width: CW, align: 'center' })

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
