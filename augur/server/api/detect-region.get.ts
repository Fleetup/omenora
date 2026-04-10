export default defineEventHandler(async (event) => {
  const forwarded = getHeader(event, 'x-forwarded-for') ?? ''
  const realIp = getHeader(event, 'x-real-ip') ?? ''
  const ip = forwarded ? (forwarded.split(',')[0] ?? '').trim() : realIp || '0.0.0.0'

  if (ip === '0.0.0.0' || ip === '127.0.0.1' || ip.startsWith('::')) {
    return { region: 'western', country: 'US', ip, language: 'en' }
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await response.json()
    const country = data.country_code || 'US'

    const regionMap: Record<string, string> = {
      IN: 'india',
      CN: 'china', TW: 'china', HK: 'china',
      KR: 'korea', JP: 'korea',
      MX: 'latam', BR: 'latam', AR: 'latam',
      CO: 'latam', CL: 'latam', PE: 'latam', VE: 'latam',
      GT: 'latam', EC: 'latam', BO: 'latam', PY: 'latam',
      UY: 'latam', CR: 'latam', CU: 'latam', DO: 'latam',
      HN: 'latam', NI: 'latam', PA: 'latam', SV: 'latam',
      PR: 'latam', PT: 'latam', ES: 'latam',
      SA: 'middleeast', AE: 'middleeast', EG: 'middleeast',
      TR: 'middleeast', IR: 'middleeast',
    }

    const regionToLanguage: Record<string, string> = {
      IN: 'hi',
      CN: 'zh', TW: 'zh', HK: 'zh',
      KR: 'ko', JP: 'ko',
      MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
      GT: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', CR: 'es',
      DO: 'es', HN: 'es', PA: 'es', SV: 'es', PR: 'es', ES: 'es', CU: 'es',
      BR: 'pt', PT: 'pt',
    }

    const region = regionMap[country] || 'western'
    const language = regionToLanguage[country] || 'en'
    return { region, country, ip, language }
  } catch (error) {
    console.error('Geolocation error:', error)
    return { region: 'western', country: 'US', ip, language: 'en' }
  }
})
