const REGION_MAP: Record<string, string> = {
  IN: 'india',
  CN: 'china', TW: 'china', HK: 'china', MO: 'china',
  KR: 'korea', JP: 'korea',
  MX: 'latam', BR: 'latam', AR: 'latam',
  CO: 'latam', CL: 'latam', PE: 'latam', VE: 'latam',
  GT: 'latam', EC: 'latam', BO: 'latam', PY: 'latam',
  UY: 'latam', CR: 'latam', CU: 'latam', DO: 'latam',
  HN: 'latam', NI: 'latam', PA: 'latam', SV: 'latam',
  PR: 'latam', PT: 'latam', ES: 'latam',
  SA: 'middleeast', AE: 'middleeast', EG: 'middleeast',
  TR: 'middleeast', IR: 'middleeast', KW: 'middleeast',
  QA: 'middleeast', BH: 'middleeast', OM: 'middleeast', JO: 'middleeast',
  LB: 'middleeast', IQ: 'middleeast', MA: 'middleeast', DZ: 'middleeast',
  TN: 'middleeast', LY: 'middleeast', YE: 'middleeast', SY: 'middleeast',
}

const LANGUAGE_MAP: Record<string, string> = {
  IN: 'hi',
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  KR: 'ko', JP: 'ko',
  MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  GT: 'es', EC: 'es', BO: 'es', PY: 'es', UY: 'es', CR: 'es',
  DO: 'es', HN: 'es', PA: 'es', SV: 'es', PR: 'es', ES: 'es', CU: 'es',
  BR: 'pt', PT: 'pt',
}

// ── Subnet-level cache (keyed on /24 for IPv4, /48 for IPv6) ─────────────────
// 24-hour TTL keeps us well below the 1,000/day free limit even at scale.

interface CacheEntry { country: string; expiresAt: number }
const GEO_CACHE = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

// Purge stale entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of GEO_CACHE) if (now > v.expiresAt) GEO_CACHE.delete(k)
}, 60 * 60_000).unref?.()

function subnetKey(ip: string): string {
  if (ip.includes(':')) {
    // IPv6 — use first 4 groups as /48 approximation
    return ip.split(':').slice(0, 4).join(':')
  }
  // IPv4 — use first 3 octets (/24)
  return ip.split('.').slice(0, 3).join('.')
}

async function lookupCountry(ip: string): Promise<string> {
  const cacheKey = subnetKey(ip)
  const cached   = GEO_CACHE.get(cacheKey)

  if (cached && Date.now() < cached.expiresAt) {
    return cached.country
  }

  // Try ipapi.co first (with optional API key for higher limits)
  const ipapiKey = process.env.IPAPI_KEY ? `?key=${process.env.IPAPI_KEY}` : ''
  try {
    const res  = await fetch(`https://ipapi.co/${ip}/json/${ipapiKey}`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json() as { country_code?: string; error?: boolean; reason?: string }

    if (!data.error && data.country_code) {
      GEO_CACHE.set(cacheKey, { country: data.country_code, expiresAt: Date.now() + CACHE_TTL_MS })
      return data.country_code
    }

    if (data.reason?.includes('RateLimited')) {
      throw new Error('ipapi.co rate limited')
    }
  } catch (primaryErr: any) {
    if (!primaryErr.message?.includes('rate limited')) {
      console.warn('[detect-region] ipapi.co failed, trying fallback:', primaryErr.message)
    }
  }

  // Fallback: ip-api.com (45 req/min free, no key needed)
  try {
    const res  = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json() as { countryCode?: string; status?: string }

    if (data.status === 'success' && data.countryCode) {
      GEO_CACHE.set(cacheKey, { country: data.countryCode, expiresAt: Date.now() + CACHE_TTL_MS })
      return data.countryCode
    }
  } catch (fallbackErr: any) {
    console.error('[detect-region] Both geo providers failed:', fallbackErr.message)
  }

  return 'US' // safe default
}

export default defineEventHandler(async (event) => {
  const forwarded = getHeader(event, 'x-forwarded-for') ?? ''
  const realIp    = getHeader(event, 'x-real-ip') ?? ''
  const ip        = forwarded ? (forwarded.split(',')[0] ?? '').trim() : realIp || '0.0.0.0'

  if (ip === '0.0.0.0' || ip === '127.0.0.1' || ip.startsWith('::1') || ip.startsWith('::ffff:127')) {
    return { region: 'western', country: 'US', language: 'en' }
  }

  const country  = await lookupCountry(ip)
  const region   = REGION_MAP[country]   || 'western'
  const language = LANGUAGE_MAP[country] || 'en'

  return { region, country, language }
})
