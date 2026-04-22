import { Resend } from 'resend'

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

/**
 * Returns an <img> tag pointing to the hosted archetype symbol PNG on omenora.com.
 * Works in every email client including Outlook desktop.
 */
export function archetypeSymbolHtmlImg(symbol: string, size = 64): string {
  const id = SYMBOL_TO_ID[symbol] ?? 'phoenix'
  const url = `https://omenora.com/symbols/${id}@2x.png`
  return `<img src="${url}" width="${size}" height="${size}" alt="${id}" style="display:block;" />`
}

/** Escape HTML special characters in user-controlled strings. */
export function he(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface ReportEmailPayload {
  email: string
  firstName: string
  report: any
  archetype?: string
  lifePathNumber?: number
  element?: string
  region?: string
  vedicData?: any
  baziData?: any
  tarotData?: any
  calendarData?: any
  birthChartData?: any
  compatibilityData?: any
  partnerName?: string | null
  reportSessionId?: string
  language?: string
}

/**
 * Builds the full report email HTML and sends it directly via Resend.
 * Used by both the webhook (server → Resend, no $fetch) and the HTTP endpoint.
 * Returns the Resend email ID on success, throws on failure.
 */
export async function sendReportEmail(
  resendApiKey: string,
  payload: ReportEmailPayload,
): Promise<string> {
  const {
    email,
    firstName,
    report,
    archetype,
    lifePathNumber,
    element,
    region,
    vedicData,
    baziData,
    tarotData,
    calendarData,
    birthChartData,
    compatibilityData,
    partnerName,
    reportSessionId,
    language = 'en',
  } = payload

  let parsedReport = report
  if (typeof parsedReport === 'string') {
    parsedReport = JSON.parse(parsedReport)
  }

  if (
    typeof parsedReport !== 'object' ||
    typeof parsedReport.sections !== 'object' ||
    parsedReport.sections === null
  ) {
    throw new Error('Invalid report payload: sections missing')
  }

  const sanitizedEmail     = he(email)
  const sanitizedFirstName = he(sanitizeString(firstName || '', 50))
  const sections           = parsedReport.sections
  const powerTraits        = parsedReport.powerTraits || []
  const archetypeName      = he(sanitizeString(parsedReport.archetypeName || archetype || '', 60))
  const rawSymbol          = sanitizeString(parsedReport.archetypeSymbol || '◆', 10)
  const archetypeSymbolHtml = archetypeSymbolHtmlImg(rawSymbol, 64)
  const sanitizedElement   = he(sanitizeString(element || parsedReport.element || '', 20))
  const sanitizedLifePath  = he(String(lifePathNumber || ''))

  const sectionOrder = ['identity', 'science', 'forecast', 'love', 'purpose', 'gift', 'affirmation']

  const sectionsHtml = sectionOrder.map(key => {
    const section = sections[key]
    if (!section) return ''
    const isAffirmation = key === 'affirmation'
    if (isAffirmation) {
      return `
        <div style="margin-bottom: 32px; padding: 24px;
          background: rgba(140,110,255,0.08);
          border: 1px solid rgba(140,110,255,0.2);
          border-radius: 12px; text-align: center;">
          <p style="font-size: 11px; font-weight: 500;
            color: #8c6eff; text-transform: uppercase;
            letter-spacing: 0.1em; margin: 0 0 12px;">
            ${he(section.title)}
          </p>
          <p style="font-size: 18px; color: #c8b4ff;
            font-style: italic; line-height: 1.7; margin: 0;">
            &ldquo;${he(section.content)}&rdquo;
          </p>
        </div>
      `
    }
    return `
      <div style="margin-bottom: 32px;
        padding-bottom: 32px;
        border-bottom: 1px solid rgba(255,255,255,0.06);">
        <p style="font-size: 11px; font-weight: 500;
          color: #8c6eff; text-transform: uppercase;
          letter-spacing: 0.1em; margin: 0 0 10px;">
          ${he(section.title)}
        </p>
        <p style="font-size: 15px; color: #c0bfbf;
          line-height: 1.8; margin: 0;">
          ${he(section.content)}
        </p>
      </div>
    `
  }).join('')

  const traitsHtml = powerTraits.map((trait: string) => `
    <span style="display: inline-block;
      font-size: 12px; color: #c8b4ff;
      border: 1px solid rgba(140,110,255,0.25);
      border-radius: 20px; padding: 4px 14px;
      margin: 0 6px 6px 0;
      background: rgba(140,110,255,0.06);">
      ${he(trait)}
    </span>
  `).join('')

  let regionalHtml = ''

  if (region === 'india' && vedicData) {
    regionalHtml = `
    <div style="margin: 32px 0; padding: 24px;
      background: rgba(255,140,50,0.05);
      border: 1px solid rgba(255,140,50,0.15);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: rgba(255,160,80,0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em; margin: 0 0 4px;">
        🕉 Vedic Destiny Reading
      </p>
      <p style="font-size: 16px; font-weight: 500;
        color: white; margin: 0 0 16px;">
        ${vedicData.vedicTitle || ''}
      </p>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(255,140,50,0.08);
          border: 1px solid rgba(255,140,50,0.2); border-radius: 8px;">
          <p style="font-size: 9px; color: rgba(255,160,80,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Nakshatra</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(255,200,150,0.9); margin: 0;">${vedicData.nakshatraName || ''}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(255,140,50,0.08);
          border: 1px solid rgba(255,140,50,0.2); border-radius: 8px;">
          <p style="font-size: 9px; color: rgba(255,160,80,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Ruling Planet</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(255,200,150,0.9); margin: 0;">${vedicData.rulingPlanet || ''}</p>
        </div>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6);
        line-height: 1.8; margin: 0 0 16px;">${vedicData.reading || ''}</p>
      <div style="padding: 12px 16px; background: rgba(255,140,50,0.06);
        border-left: 2px solid rgba(255,160,80,0.4);
        border-radius: 0 8px 8px 0; margin-bottom: 12px;">
        <p style="font-size: 9px; color: rgba(255,160,80,0.5);
          text-transform: uppercase; margin: 0 0 4px;">Karmic Mission</p>
        <p style="font-size: 13px; color: rgba(255,200,150,0.8);
          font-style: italic; margin: 0;">${vedicData.karmicMission || ''}</p>
      </div>
      <p style="font-size: 12px; color: rgba(255,200,150,0.6); margin: 0;">
        2026 Practice: ${vedicData.remedy || ''}
      </p>
    </div>
    `
  } else if (region === 'china' && baziData) {
    regionalHtml = `
    <div style="margin: 32px 0; padding: 24px;
      background: rgba(200,50,50,0.05);
      border: 1px solid rgba(200,80,50,0.15);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: rgba(220,100,80,0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em; margin: 0 0 4px;">
        ☯ BaZi Four Pillars Reading
      </p>
      <p style="font-size: 16px; font-weight: 500;
        color: white; margin: 0 0 16px;">${baziData.baziTitle || ''}</p>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(200,80,50,0.08);
          border: 1px solid rgba(200,80,50,0.2); border-radius: 8px;">
          <p style="font-size: 9px; color: rgba(220,120,100,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Day Master</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(255,180,160,0.9); margin: 0;">${baziData.dayMaster || ''}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(200,80,50,0.08);
          border: 1px solid rgba(200,80,50,0.2); border-radius: 8px;">
          <p style="font-size: 9px; color: rgba(220,120,100,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Dominant Element</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(255,180,160,0.9); margin: 0;">${baziData.dominantElement || ''}</p>
        </div>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6);
        line-height: 1.8; margin: 0 0 16px;">${baziData.reading || ''}</p>
      <div style="padding: 12px 16px; background: rgba(200,80,50,0.06);
        border-left: 2px solid rgba(220,100,80,0.4);
        border-radius: 0 8px 8px 0; margin-bottom: 12px;">
        <p style="font-size: 9px; color: rgba(220,120,100,0.5);
          text-transform: uppercase; margin: 0 0 4px;">2026 Wealth Luck</p>
        <p style="font-size: 13px; color: rgba(255,180,160,0.8);
          font-style: italic; margin: 0;">${baziData.wealthLuck2026 || ''}</p>
      </div>
      <p style="font-size: 12px; color: rgba(255,180,160,0.6); margin: 0;">
        Lucky directions: ${(baziData.luckyDirections || []).join(' · ')}
      </p>
    </div>
    `
  } else if ((region === 'latam' || region === 'tarot') && tarotData) {
    regionalHtml = `
    <div style="margin: 32px 0; padding: 24px;
      background: rgba(160,60,200,0.05);
      border: 1px solid rgba(160,80,200,0.15);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: rgba(180,120,220,0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em; margin: 0 0 4px;">
        🔮 Spiritual Destiny Reading
      </p>
      <p style="font-size: 16px; font-weight: 500;
        color: white; margin: 0 0 12px;">${tarotData.soulCard || ''}</p>
      <div style="padding: 12px 16px; background: rgba(160,80,200,0.08);
        border: 1px solid rgba(160,80,200,0.2); border-radius: 8px;
        margin-bottom: 16px; text-align: center;">
        <p style="font-size: 13px; color: rgba(210,170,255,0.8);
          font-style: italic; margin: 0;">${tarotData.soulCardMeaning || ''}</p>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6);
        line-height: 1.8; margin: 0 0 16px;">${tarotData.reading || ''}</p>
      <div style="padding: 12px 16px; background: rgba(160,80,200,0.06);
        border-left: 2px solid rgba(180,120,220,0.4);
        border-radius: 0 8px 8px 0; margin-bottom: 16px;">
        <p style="font-size: 9px; color: rgba(180,120,220,0.5);
          text-transform: uppercase; margin: 0 0 4px;">Love Destiny</p>
        <p style="font-size: 13px; color: rgba(210,170,255,0.85);
          font-style: italic; margin: 0;">${tarotData.loveMessage || ''}</p>
      </div>
      <div style="padding: 14px 18px; background: rgba(160,80,200,0.04);
        border: 1px solid rgba(160,80,200,0.1); border-radius: 10px;
        margin-bottom: 12px; text-align: center;">
        <p style="font-size: 9px; color: rgba(180,120,220,0.4);
          text-transform: uppercase; margin: 0 0 6px;">A Blessing For You</p>
        <p style="font-size: 13px; color: rgba(210,170,255,0.7);
          font-style: italic; line-height: 1.6; margin: 0;">${tarotData.blessing || ''}</p>
      </div>
      <p style="font-size: 12px; color: rgba(210,170,255,0.6); margin: 0;">
        Your protective charm: ${tarotData.luckyCharm || ''}
      </p>
    </div>
    `
  }

  const birthChartHtml = birthChartData ? `
    <div style="margin: 32px 0; padding: 24px;
      background: rgba(80,120,255,0.05);
      border: 1px solid rgba(100,140,255,0.15);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: rgba(140,170,255,0.7);
        text-transform: uppercase;
        letter-spacing: 0.1em; margin: 0 0 4px;">
        ✦ Full Natal Birth Chart
      </p>
      <p style="font-size: 16px; font-weight: 500;
        color: white; margin: 0 0 16px;">${birthChartData.chartTitle || ''}</p>
      <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Rising</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${birthChartData.risingSign || ''}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Sun</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${birthChartData.sunSign || ''}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Moon</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${birthChartData.moonSign || ''}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(100,140,255,0.08);
          border: 1px solid rgba(100,140,255,0.2); border-radius: 8px; text-align: center;">
          <p style="font-size: 9px; color: rgba(160,190,255,0.5);
            text-transform: uppercase; margin: 0 0 2px;">Dominant</p>
          <p style="font-size: 13px; font-weight: 500;
            color: rgba(180,210,255,0.9); margin: 0;">${birthChartData.dominantPlanet || ''}</p>
        </div>
      </div>
      ${birthChartData.powerHouse ? `
      <p style="font-size: 11px; color: rgba(160,190,255,0.5);
        text-transform: uppercase; letter-spacing: 0.08em;
        margin: 0 0 6px;">Power House</p>
      <p style="font-size: 13px; font-weight: 500;
        color: rgba(180,210,255,0.8); margin: 0 0 16px;">
        ${birthChartData.powerHouse}
      </p>` : ''}
      <p style="font-size: 14px; color: rgba(255,255,255,0.6);
        line-height: 1.8; margin: 0 0 16px;">${birthChartData.reading || ''}</p>
      ${birthChartData.forecast2026 ? `
      <div style="padding: 12px 16px; background: rgba(100,140,255,0.06);
        border-left: 2px solid rgba(140,170,255,0.4);
        border-radius: 0 8px 8px 0;">
        <p style="font-size: 9px; color: rgba(160,190,255,0.5);
          text-transform: uppercase; margin: 0 0 4px;">2026 Planetary Forecast</p>
        <p style="font-size: 13px; color: rgba(180,210,255,0.8);
          font-style: italic; margin: 0;">${birthChartData.forecast2026}</p>
      </div>` : ''}
    </div>
  ` : ''

  const calendarHtml: string = (() => {
    if (!calendarData) return ''
    const _currentMonth = new Date().getMonth() + 1
    const _allMonths: any[] = calendarData.months || []
    const _futureMonths = _allMonths.filter((m: any) =>
      typeof m.number === 'number' ? m.number >= _currentMonth : true
    )
    const _emailMonths = _futureMonths.length > 0 ? _futureMonths : _allMonths
    const monthsHtml = _emailMonths.map((m: any) => {
      const warningHtml = m.warning
        ? `<p style="font-size: 11px; color: rgba(255,120,80,0.5); margin: 4px 0 0;">&#x26A0; ${he(m.warning)}</p>`
        : ''
      return `<div style="margin-bottom: 14px; padding: 12px 14px; background: rgba(255,255,255,0.02); border-left: 3px solid ${he(m.color || '#8c6eff')}; border-radius: 0 6px 6px 0;">` +
        `<p style="font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.7); margin: 0 0 4px;">${he(m.month)} &#x2014; ${he(m.theme)}</p>` +
        `<p style="font-size: 12px; color: rgba(255,255,255,0.4); margin: 0 0 2px;">&#x2665; ${he(m.love)}</p>` +
        `<p style="font-size: 12px; color: rgba(255,255,255,0.4); margin: 0 0 2px;">$ ${he(m.money)}</p>` +
        `<p style="font-size: 12px; color: rgba(255,255,255,0.4); margin: 0;">&#x26A1; ${he(m.career)}</p>` +
        warningHtml +
        `</div>`
    }).join('')
    return `<div style="margin: 40px 0; padding: 24px; background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.12); border-radius: 12px;">` +
      `<p style="font-size: 10px; font-weight: 500; color: #c9a84c; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 6px;">&#x1F4C5; Your 2026 Destiny Calendar</p>` +
      `<p style="font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 20px; line-height: 1.6;">${he(calendarData.overallTheme || '')}</p>` +
      monthsHtml +
      `</div>`
  })()

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your OMENORA Destiny Report</title>
</head>
<body style="margin: 0; padding: 0;
  background-color: #0a0a0f;
  font-family: system-ui, -apple-system, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px;">
    <div style="text-align: center; margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);">
      <p style="font-size: 13px; font-weight: 500;
        color: rgba(255,255,255,0.25);
        letter-spacing: 0.15em; margin: 0 0 24px;">OMENORA</p>
      <p style="font-size: 11px; color: #8c6eff;
        text-transform: uppercase; letter-spacing: 0.1em;
        margin: 0 0 12px;">Your Destiny Archetype</p>
      <div style="margin: 0 0 8px; line-height: 1;">${archetypeSymbolHtml}</div>
      <h1 style="font-size: 36px; font-weight: 500;
        color: rgba(230,220,255,0.95);
        margin: 0 0 8px; line-height: 1.2;">${archetypeName}</h1>
      <p style="font-size: 14px; color: #8c6eff; margin: 0 0 16px;">
        ${sanitizedElement || 'Earth'} &middot; Life Path ${sanitizedLifePath || '7'}
      </p>
      <div style="margin-top: 16px;">${traitsHtml}</div>
    </div>
    <p style="font-size: 16px; color: rgba(255,255,255,0.6);
      line-height: 1.7; margin: 0 0 32px;">
      ${sanitizedFirstName}, your complete destiny analysis is below.
      This report was generated specifically for you based on
      your behavioral profile and chronobiological patterns.
    </p>
    ${sectionsHtml}
    ${regionalHtml}
    ${birthChartHtml}
    ${calendarHtml}
    ${compatibilityData && compatibilityData.compatibilityScore !== undefined ? `
    <div style="margin: 40px 0; padding: 24px;
      background: rgba(140,110,255,0.04);
      border: 1px solid rgba(140,110,255,0.12);
      border-radius: 12px;">
      <p style="font-size: 10px; font-weight: 500;
        color: #8c6eff; text-transform: uppercase;
        letter-spacing: 0.12em; margin: 0 0 6px;">&#x1F49E; Compatibility Reading</p>
      ${partnerName ? `<p style="font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 12px;">${he(sanitizedFirstName)} &amp; ${he(partnerName)}</p>` : ''}
      <p style="font-size: 40px; font-weight: 600; color: #8c6eff; margin: 0 0 4px; line-height: 1;">${compatibilityData.compatibilityScore}%</p>
      ${compatibilityData.compatibilityTitle ? `<p style="font-size: 13px; color: rgba(200,180,255,0.7); font-style: italic; margin: 0 0 20px;">${he(compatibilityData.compatibilityTitle)}</p>` : ''}
      ${['bond','strength','challenge','forecast','advice'].map((key: string) => {
        const sec = (compatibilityData.sections || {})[key]
        if (!sec) return ''
        return `
          <div style="margin-bottom: 16px; padding-bottom: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.05);">
            <p style="font-size: 10px; color: #8c6eff; text-transform: uppercase;
              letter-spacing: 0.08em; margin: 0 0 6px;">${he(sec.title || key)}</p>
            <p style="font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0;">${he(sec.content || '')}</p>
          </div>`
      }).join('')}
    </div>` : ''}
    <div style="text-align: center; margin-top: 48px;
      padding: 32px 24px;
      background: rgba(140,110,255,0.06);
      border: 1px solid rgba(140,110,255,0.15);
      border-radius: 16px;">
      <p style="font-size: 14px; font-weight: 500; color: white; margin: 0 0 8px;">Share Your Destiny</p>
      <p style="font-size: 13px; color: rgba(255,255,255,0.35);
        margin: 0 0 20px; line-height: 1.5;">
        Download your destiny card to share on TikTok or Instagram Stories
      </p>
      <a href="${reportSessionId ? `https://omenora.com/report?session_id=${encodeURIComponent(reportSessionId)}` : 'https://omenora.com'}"
        style="display: inline-block;
          background: rgba(140,110,255,0.85);
          color: white; text-decoration: none;
          font-size: 14px; font-weight: 500;
          padding: 14px 32px; border-radius: 10px;">
        View Your Full Report
      </a>
    </div>
    <div style="text-align: center; margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.04);">
      <p style="font-size: 12px; color: rgba(255,255,255,0.15); margin: 0 0 8px;">
        omenora.com — AI Destiny Analysis
      </p>
      <p style="font-size: 11px; color: rgba(255,255,255,0.1); margin: 0 0 8px;">
        This report was generated for ${sanitizedEmail}
      </p>
      <p style="font-size: 10px; color: rgba(255,255,255,0.07); margin: 0;">
        OMENORA · 1309 Coffeen Ave STE 1200, Sheridan, WY 82801 ·
        <a href="mailto:unsubscribe@omenora.com?subject=unsubscribe&body=${encodeURIComponent(email)}" style="color: rgba(255,255,255,0.15); text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `

  const subjects: Record<string, string> = {
    en: `${firstName}, your destiny analysis is ready — OMENORA`,
    es: `${firstName}, tu análisis de destino está listo — OMENORA`,
    pt: `${firstName}, sua análise de destino está pronta — OMENORA`,
    hi: `${firstName}, आपका भाग्य विश्लेषण तैयार है — OMENORA`,
    ko: `${firstName}, 당신의 운명 분석이 준비되었습니다 — OMENORA`,
    zh: `${firstName}，您的命运分析已准备好 — OMENORA`,
  }
  const subject = subjects[language] ?? subjects['en'] ?? `${firstName}, your destiny analysis is ready — OMENORA`

  const plainText = [
    `OMENORA — Your Destiny Analysis`,
    ``,
    `${firstName}, your complete destiny analysis is below.`,
    `This report was generated specifically for you based on your behavioral profile and chronobiological patterns.`,
    ``,
    `Visit omenora.com to view your full report.`,
    ``,
    `---`,
    `OMENORA · omenora.com`,
    `To unsubscribe, email unsubscribe@omenora.com`,
  ].join('\n')

  const resend = new Resend(resendApiKey)
  const { data, error } = await resend.emails.send({
    from: 'OMENORA <reading@omenora.com>',
    replyTo: 'support@omenora.com',
    to: [email],
    subject,
    html: htmlContent,
    text: plainText,
  })

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }

  return data?.id ?? ''
}
