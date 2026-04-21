type GeocodeResult = {
  lat: number
  lon: number
}

type NominatimEntry = {
  lat: string
  lon: string
}

const NOMINATIM_TIMEOUT_MS = 5_000

// ── In-memory LRU cache ──────────────────────────────────────────────────────
// Prevents duplicate Nominatim calls for the same city (common case: 'New York').
// TTL: 1 hour. Max: 500 entries (enough for all realistic city variance per deploy).
// Node processes are single-threaded so no lock is needed.

const CACHE_TTL_MS  = 60 * 60_000
const CACHE_MAX     = 500

interface CacheEntry { result: GeocodeResult; expiresAt: number }
const geocodeCache  = new Map<string, CacheEntry>()

function cacheKey(city: string): string {
  return city.toLowerCase().trim()
}

function cacheGet(city: string): GeocodeResult | null {
  const entry = geocodeCache.get(cacheKey(city))
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { geocodeCache.delete(cacheKey(city)); return null }
  return entry.result
}

function cacheSet(city: string, result: GeocodeResult): void {
  const key = cacheKey(city)
  if (geocodeCache.size >= CACHE_MAX) {
    const oldest = geocodeCache.keys().next().value
    if (oldest !== undefined) geocodeCache.delete(oldest)
  }
  geocodeCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS })
}

export async function geocodeCity(city: string): Promise<GeocodeResult> {
  const cached = cacheGet(city)
  if (cached) return cached
  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS)

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':       'OMENORA/1.0 (omenora.com)',
        'Accept-Language':  'en',
      },
    })

    const data = await response.json() as NominatimEntry[]

    if (!Array.isArray(data) || data.length === 0) {
      return { lat: 0, lon: 0 }
    }

    const entry = data[0]!
    const lat   = parseFloat(entry.lat)
    const lon   = parseFloat(entry.lon)

    if (!isFinite(lat) || !isFinite(lon)) {
      return { lat: 0, lon: 0 }
    }

    const result: GeocodeResult = { lat, lon }
    cacheSet(city, result)
    return result
  } catch (err) {
    console.error('[geocode] failed for city:', city, err)
    return { lat: 0, lon: 0 }
  } finally {
    clearTimeout(timeoutId)
  }
}
