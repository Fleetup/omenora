type GeocodeResult = {
  lat: number
  lon: number
}

type NominatimEntry = {
  lat: string
  lon: string
}

const NOMINATIM_TIMEOUT_MS = 5000

export async function geocodeCity(city: string): Promise<GeocodeResult> {
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

    return { lat, lon }
  } catch (err) {
    console.error('[geocode] failed for city:', city, err)
    return { lat: 0, lon: 0 }
  } finally {
    clearTimeout(timeoutId)
  }
}
